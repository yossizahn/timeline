#!/usr/bin/env python3
# Emit per-era border files for the timeline map overlay.
#  borders/<year>.json = {"y":500,"f":[{"d":"M..Z","l":"הֵבר","x":..,"y":..}, ...]}
#  borders/index.json  = sorted list of available slice years (for nearest-snap)
# Labels attach only where a vetted Hebrew name exists; others draw outline only.
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))   # tools/borders -> repo root
OUT = os.path.join(REPO, 'borders')
os.makedirs(OUT, exist_ok=True)

# ---- curated English NAME -> Hebrew. Variants/typos map to one Hebrew form. ----
HE = {
  # late antiquity
  'Roman Empire':'האימפריה הרומית','Western Roman Empire':'האימפריה הרומית המערבית',
  'Eastern Roman Empire':'האימפריה הביזנטית','Byzantine Empire':'האימפריה הביזנטית',
  'Rome (Diocletianus)':'האימפריה הרומית','Rome (Constantinus)':'האימפריה הרומית',
  'Rome (Galerius)':'האימפריה הרומית','Rome (Maximian)':'האימפריה הרומית',
  'Parthian Empire':'האימפריה הפרתית','Sasanian Empire':'האימפריה הסאסאנית','Persia':'פרס',
  'Himyarite Kingdom':'ממלכת חִמיָר','Nabatean Kingdom':'הממלכה הנבטית','Dacia':'דקיה',
  'Armenia':'ארמניה','Khazars':'ממלכת הכוזרים','Hunnic Empire':'אימפריית ההונים',
  'Visigothic Kingdom':'ממלכת הוויזיגותים','Visigoths':'ממלכת הוויזיגותים',
  'Ostrogoths':'ממלכת האוסטרוגותים','Vandals':'ממלכת הוונדלים',
  'Franks':'ממלכת הפרנקים','Frankish Kingdom':'ממלכת הפרנקים',
  'Carolingian Empire':'האימפריה הקרולינגית','West Francia':'פרנקיה המערבית',
  'East Francia':'פרנקיה המזרחית','Anglo-Saxons':'האנגלו-סקסים',
  'Lombard principalities':'נסיכויות לומברדיה',
  # islamic world
  'Umayyad Caliphate':"ח'ליפות בני אומיה",'Abbasid Caliphate':"ח'ליפות בני עבּאס",
  'Fatimid Caliphate':"ח'ליפות הפאטִמים",'Caliphate of Córdoba':"ח'ליפות קורדובה",
  'Emirate of Córdoba':'אמירות קורדובה','Aghlabid Emirate':"אמירות האע'לבּים",
  'Idrisid Caliphate':'שושלת האדריסים','Almoravid dynasty':'שושלת המוראבּיטון',
  'Almohad Caliphate':'שושלת המֻוואחידון','Hafsid Caliphate':'שושלת החַפְצים',
  'Zayyanid Caliphate':'שושלת הזַיַּאנים','Buwayhid Emirates':'שושלת הבּוּוייהים',
  'Seljuk Empire':"האימפריה הסלג'וקית",'Seljuk Caliphate':"האימפריה הסלג'וקית",
  'Ottoman Empire':"האימפריה העות'מאנית",'Mamluke Sultanate':'ממלכת הממלוכּים',
  "Ilkhanate":"אילח'אנות",'Timurid Empire':'האימפריה הטימורית',
  'Safavid Empire':'האימפריה הצפווית','Arabia':'ערב','Egypt':'מצרים',
  'Morocco':'מרוקו','Algeria':"אלג'יריה",'Libya':'לוב','Sudan':'סודאן',
  # christian europe, medieval -> modern
  'Holy Roman Empire':'האימפריה הרומית הקדושה','Germany':'גרמניה','German Empire':'גרמניה',
  'Prussia':'פרוסיה','Austrian Empire':'הקיסרות האוסטרית',
  'Austria Hungary':'האימפריה האוסטרו-הונגרית','Austro-Hungarian Empire':'האימפריה האוסטרו-הונגרית',
  'France':'צרפת','Kingdom of France':'ממלכת צרפת',
  'Castile':'קסטיליה','Castille':'קסטיליה','Spain':'ספרד','Portugal':'פורטוגל',
  'Italy':'איטליה','Naples':'נאפולי','Kingdom of the Two Sicilies':'ממלכת שתי הסיציליות',
  'England':'אנגליה','England and Ireland':'אנגליה',
  'United Kingdom':'הממלכה המאוחדת','United Kingdom of Great Britain and Ireland':'הממלכה המאוחדת',
  'Poland':'פולין','Poland-Lithuania':'האיחוד הפולני-ליטאי','Poland-Llituania':'האיחוד הפולני-ליטאי',
  'Polish–Lithuanian Commonwealth':'חבר העמים הפולני-ליטאי',
  'Hungary':'הונגריה','Kingdom of Hungary':'ממלכת הונגריה','Imperial Hungary':'הונגריה',
  'Russia':'רוסיה','Russian Empire':'האימפריה הרוסית',
  'Grand Duchy of Moscow':'נסיכות מוסקבה','Tsardom of Muscovy':'צארות מוסקבה',
  'Kievan Rus':'קייבּ רוס','Kyivan Rus':'קייבּ רוס','Ukraine':'אוקראינה','Novgorod':'נובגורוד',
  'Golden Horde':'אורדת הזהב','Khanate of the Golden Horde':'אורדת הזהב','Blue Horde':'האורדה הכחולה',
  'Crimean Khanate':"ח'אנות קרים",'USSR':'ברית המועצות',
  'Sweden':'שוודיה','Sweden–Norway':'שוודיה','Denmark-Norway':'דנמרק','Kalmar Union':'איחוד קלמאר',
  'Mali':'מאלי','Songhai':'סונגהאי','Empire of Ghana':'ממלכת גאנה',
}

clip = json.load(open(os.path.join(HERE, 'clipped.json')))

def ring_d(coords):
    return ''.join(('M' if i==0 else 'L')+f'{x:g},{y:g}' for i,(x,y) in enumerate(coords))+'Z'
def geom_d(g):
    t=g['type']
    if t=='Polygon': return ''.join(ring_d(r) for r in g['coordinates'])
    if t=='MultiPolygon': return ''.join(ring_d(r) for poly in g['coordinates'] for r in poly)
    if t=='GeometryCollection': return ''.join(geom_d(s) for s in g['geometries'])
    return ''

years=[]; total=0; labeled=set(); unlabeled=set()
for yr,feats in clip.items():
    out=[]
    for f in sorted(feats,key=lambda f:-f['area']):
        if f['area']<12: continue
        d=geom_d(f['g'])
        if not d: continue
        rec={'d':d}
        he=HE.get(f['n'])
        if he and f['area']>40:
            rec.update(l=he, x=f['lx'], y=f['ly'])
            labeled.add(f['n'])
        elif f['area'] > 40:
            unlabeled.add(f['n'])        # major polity we have no Hebrew name for
        out.append(rec)
    y=int(yr); years.append(y)
    p=os.path.join(OUT,f'{y}.json')
    json.dump({'y':y,'f':out}, open(p,'w'), ensure_ascii=False, separators=(',',':'))
    total+=os.path.getsize(p)
years.sort()
json.dump(years, open(os.path.join(OUT,'index.json'),'w'), separators=(',',':'))
print('slices:',len(years),' total borders/ size: %.0f KB'%(total/1024))
print('labeled polities:',len(labeled))
print('\nUNLABELED major polities (area>40, no Hebrew) — drawn as outline only:')
for n in sorted(unlabeled): print('  ',n)
