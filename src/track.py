"""Разделы «Как это работает» (8 шагов, два цикла) и «Ритм». Создаёт track.html."""
S={}
S[1]='''<svg class="il" viewBox="0 0 320 170" role="img" aria-label="Камера над залом снимает сцену"><polygon class="s m" points="76,16 244,16 300,138 20,138"/><polygon fill="var(--gold)" fill-opacity=".08" points="160,158 76,16 244,16"/><path class="s g" d="M160 158L76 16M160 158L244 16" stroke-dasharray="4 4"/><line class="s g scan" x1="52" y1="138" x2="268" y2="138"/><circle class="ft" cx="118" cy="62" r="7"/><circle class="ft" cx="198" cy="52" r="7"/><circle class="fp" cx="160" cy="98" r="7"/><circle class="ft" cx="236" cy="104" r="7"/><circle class="ft" cx="86" cy="108" r="7"/><rect class="fg" x="148" y="156" width="24" height="11" rx="3"/><text x="10" y="164">30 кадров в секунду</text></svg>'''
S[2]='''<svg class="il" viewBox="0 0 320 170" role="img" aria-label="Скелет из точек и датчики на теле актёра"><circle class="s" cx="100" cy="24" r="10"/><path class="s" d="M100 38V46M82 46H118M82 46L70 74L64 100M118 46L130 74L136 100M82 46L90 94M118 46L110 94M90 94H110M90 94L86 128L84 158M110 94L114 128L116 158"/><g class="ft"><circle class="pt" cx="82" cy="46" r="3.5"/><circle class="pt" cx="118" cy="46" r="3.5"/><circle class="pt" cx="70" cy="74" r="3.5"/><circle class="pt" cx="130" cy="74" r="3.5"/><circle class="pt" cx="90" cy="94" r="3.5"/><circle class="pt" cx="110" cy="94" r="3.5"/><circle class="pt" cx="86" cy="128" r="3.5"/><circle class="pt" cx="114" cy="128" r="3.5"/></g><g class="fg"><rect x="60" y="96" width="8" height="8"/><rect x="132" y="96" width="8" height="8"/><rect x="96" y="58" width="8" height="8"/><rect x="80" y="154" width="8" height="8"/><rect x="112" y="154" width="8" height="8"/></g><circle class="ft" cx="176" cy="40" r="3.5"/><text x="188" y="44">33 точки тела</text><rect class="fg" x="172" y="62" width="8" height="8"/><text x="188" y="70">датчики на костюме</text><text x="176" y="102">→ положение</text><text x="176" y="120">→ движение</text><text x="176" y="138">→ касание</text></svg>'''
S[3]='''<svg class="il" viewBox="0 0 320 170" role="img" aria-label="Актёр становится клеткой, из клеток получается сводка"><circle class="s" cx="40" cy="38" r="8"/><path class="s" d="M40 46V80M40 54L24 72M40 54L56 72M40 80L28 112M40 80L52 112"/><text x="22" y="132">актёр</text><path class="s g" d="M72 70H100M92 62L100 70L92 78"/><circle cx="148" cy="68" r="27" fill="var(--healthy)" fill-opacity=".12" stroke="var(--healthy)" stroke-width="2"/><circle class="ft" cx="150" cy="66" r="9" fill-opacity=".55"/><circle cx="214" cy="66" r="23" fill="var(--cancer)" fill-opacity=".12" stroke="var(--cancer)" stroke-width="2"/><circle class="fp" cx="216" cy="64" r="8" fill-opacity=".55"/><circle class="s g ring" cx="180" cy="66" r="6"/><text x="160" y="28" style="fill:var(--gold)">контакт</text><text x="124" y="112">здорова</text><text x="194" y="112">раковая</text><rect class="s m" x="112" y="126" width="196" height="32" rx="8"/><text x="124" y="146" style="fill:var(--paper)">сводка: 5 здор. · 2 рак. · v 0,8</text></svg>'''
S[4]='''<svg class="il" viewBox="0 0 320 170" role="img" aria-label="Сводка сцены сравнивается с ветками из базы"><rect class="s m" x="12" y="22" width="96" height="118" rx="8"/><text x="22" y="38">сводка, 1 мин</text><polyline class="s g" style="stroke-width:2.5" points="24,120 40,104 58,108 72,80 92,72"/><circle class="fg" cx="92" cy="72" r="4"/><text x="114" y="92" style="font-size:22px;fill:var(--gold)">≈</text><rect class="s m" x="140" y="20" width="172" height="34" rx="6"/><text x="150" y="34">Агрессивная · SEER</text><rect x="150" y="41" width="150" height="5" rx="2" fill="var(--mute)" fill-opacity=".25"/><rect x="150" y="41" width="62" height="5" rx="2" class="fm"/><text x="282" y="34">41%</text><rect class="s t" x="140" y="68" width="172" height="34" rx="6" style="stroke-width:2"/><text x="150" y="82" style="fill:var(--healthy)">Классическое · TCGA</text><rect x="150" y="89" width="150" height="5" rx="2" fill="var(--mute)" fill-opacity=".25"/><rect x="150" y="89" width="123" height="5" rx="2" class="ft match"/><text x="282" y="82" style="fill:var(--healthy)">82%</text><rect class="s m" x="140" y="116" width="172" height="34" rx="6"/><text x="150" y="130">Иммунитет · PhysiCell</text><rect x="150" y="137" width="150" height="5" rx="2" fill="var(--mute)" fill-opacity=".25"/><rect x="150" y="137" width="27" height="5" rx="2" class="fm"/><text x="282" y="130">18%</text></svg>'''
S[5]='''<svg class="il" viewBox="0 0 320 170" role="img" aria-label="Дерево сценариев"><g class="s m"><path d="M24 85C70 85 70 34 118 34M24 85H118M24 85C70 85 70 136 118 136M118 34C170 34 166 18 214 18M118 34C170 34 166 50 214 50M118 85C170 85 166 70 214 70M118 85C170 85 166 100 214 100M118 136C170 136 166 122 214 122M118 136C170 136 166 152 214 152"/></g><path class="s g draw" style="stroke-width:3" d="M24 85H118C170 85 166 100 214 100"/><circle class="fg" cx="24" cy="85" r="7"/><g class="fm"><circle cx="118" cy="34" r="5"/><circle cx="118" cy="136" r="5"/><circle cx="214" cy="18" r="4"/><circle cx="214" cy="50" r="4"/><circle cx="214" cy="70" r="4"/><circle cx="214" cy="122" r="4"/><circle cx="214" cy="152" r="4"/></g><circle class="fg" cx="118" cy="85" r="6"/><circle class="fg" cx="214" cy="100" r="6"/><text x="226" y="21">победа опухоли</text><text x="226" y="53">метастаз</text><text x="226" y="73">иммунитет</text><text x="226" y="103" style="fill:var(--gold)">ремиссия</text><text x="226" y="125">спящая</text><text x="226" y="155">выздоровление</text></svg>'''
S[6]='''<svg class="il" viewBox="0 0 320 170" role="img" aria-label="ИИ предлагает ветку, режиссёр оставляет её или выбирает другую"><rect class="s t" x="14" y="14" width="128" height="50" rx="10"/><g class="s t"><path d="M30 40L46 30M30 40L46 50M46 30L62 40M46 50L62 40"/></g><g class="ft"><circle cx="30" cy="40" r="3.5"/><circle cx="46" cy="30" r="3.5"/><circle cx="46" cy="50" r="3.5"/><circle cx="62" cy="40" r="3.5"/></g><text x="70" y="36" style="fill:var(--paper)">ИИ предлагает</text><text x="70" y="52">Иммунитет 71%</text><rect class="s g" x="178" y="14" width="128" height="50" rx="10"/><rect class="s g" x="192" y="32" width="30" height="20" rx="2"/><path class="s g" d="M192 32L198 24H222L216 32M204 32L210 24"/><text x="232" y="44" style="fill:var(--paper)">режиссёр</text><path class="s m" d="M78 64C78 92 140 86 154 98M242 64C242 92 180 86 166 98"/><circle class="fg" cx="160" cy="104" r="8"/><path class="s m" d="M160 112L64 146M160 112V146M160 112L256 146"/><circle class="fg pick" cx="64" cy="146" r="8"/><path class="s" style="stroke:var(--ink);stroke-width:2" d="M60 146L63 149L69 143"/><circle class="fm" cx="160" cy="146" r="6"/><circle class="fm" cx="256" cy="146" r="6"/><text x="30" y="166" style="fill:var(--gold)">оставить</text><text x="124" y="166">своя ветка</text><text x="214" y="166">молчит → ИИ</text></svg>'''
S[7]='''<svg class="il" viewBox="0 0 320 170" role="img" aria-label="Жар, холод, вибрация и цвет на костюме"><g transform="translate(116 4) scale(1.4)"><circle class="ledfill" cx="32" cy="11" r="9"/><path class="ledfill" d="M18 26 L46 26 L56 34 L52 68 L46 66 L45 52 L44 112 L35 112 L32 76 L29 112 L20 112 L19 52 L18 66 L12 68 L8 34 Z"/><rect x="20" y="27" width="24" height="5" rx="2" fill="var(--heat)"/><rect x="25" y="58" width="14" height="6" rx="2" fill="var(--cold)"/><circle class="s g vib" cx="9" cy="70" r="4"/><circle class="s g vib" cx="55" cy="70" r="4"/></g><path class="s m" d="M86 46L130 60M226 22L178 42M226 62L170 88M226 112L196 104"/><text x="6" y="44">цвет → состояние</text><text x="228" y="25" style="fill:var(--heat)">жар → мутация</text><text x="228" y="65" style="fill:var(--cold)">холод → гибель</text><text x="228" y="115">дрожь → контакт</text></svg>'''
S[8]='''<svg class="il" viewBox="0 0 320 170" role="img" aria-label="Актёр импровизирует и снова попадает в кадр"><circle cx="60" cy="90" r="44" fill="none" stroke="var(--healthy)" stroke-width="1.5" stroke-dasharray="3 4"/><circle class="s" cx="60" cy="46" r="9"/><path class="s" d="M60 55V95M60 65L42 84M60 65L78 84M60 95L48 130M60 95L72 130"/><rect class="s g" x="120" y="16" width="170" height="52" rx="12"/><path class="s g" d="M130 62L106 52"/><text x="136" y="38" style="font-size:12px;fill:var(--paper)">жарко, тесно...</text><text x="136" y="56" style="font-size:12px;fill:var(--paper)">отступить?</text><g class="s g" stroke-dasharray="4 4"><path d="M84 112C110 112 120 126 150 126M84 118C110 130 130 146 160 150M84 106C120 100 140 104 170 100"/></g><text x="180" y="128">свой выбор</text><text x="120" y="166" style="fill:var(--gold)">↻ камера снова видит актёра</text></svg>'''

# (заголовок, цикл, коротко, что происходит, зачем)
ST=[
("Умная камера","f","Видит всю сцену сразу.",
 "Камера над залом снимает сцену 30 кадров в секунду. В кадре все актёры и метки датчиков на костюмах.",
 "Модели нужно знать, где каждый актёр прямо сейчас. Без камеры спектакль шёл бы вслепую."),
("Трекинг","f","Человек превращается в точки.",
 "Модель позы находит на теле 33 точки и соединяет их в скелет. Датчики костюма уточняют положение, движение и касания.",
 "Для компьютера видео это пиксели, а точки это числа: по ним видно, где актёр, как быстро он идёт и кого коснулся."),
("Анализ","f","Актёр становится клеткой.",
 "4 раза в секунду модель считает состояние каждой клетки: здорова, раковая или гибнет, с кем в контакте. Из этого складывается сводка сцены: сколько здоровых и раковых клеток, как быстро движется опухоль.",
 "Здесь два цикла расходятся. Состояние клетки сразу идёт в условия на костюме (шаг 7), а сводка копится для сравнения с базой (шаг 4)."),
("Сравнение с базой","s","Модель ищет похожий случай.",
 "Раз в секунду сводка за последнюю минуту сцены сравнивается с ветками из базы: истории опухолей (TCGA, SEER), движение клеток под микроскопом (Cell Tracking Challenge), симуляции (PhysiCell). У каждой ветки свой процент совпадения.",
 "Сравнение идёт всё время, но сценарий от этого сам не меняется. Проценты только готовят решение к развилке, поэтому один случайный шаг актёра не переключает болезнь."),
("Дерево сценариев","s","Ветки и финалы.",
 "Ветки: агрессивная опухоль, классическое течение, спящая опухоль, иммунный ответ, метастаз. Каждая ведёт к одному из финалов: выздоровление, ремиссия, победа опухоли, затаившаяся болезнь.",
 "Рак развивается по-разному, поэтому нужен набор путей. В начале сцены данных мало, и стартовая ветка берётся по частоте случаев в базе."),
("Развилка: ИИ и режиссёр","s","ИИ предлагает, режиссёр решает.",
 "Плановая развилка бывает раз в 1,5–2 минуты. ИИ предлагает ветку с лучшим совпадением, режиссёр оставляет её или выбирает другую. Молчание режиссёра значит согласие: через несколько секунд остаётся ветка ИИ. Внеочередная развилка возникает, если после мутации или гибели клетки другая ветка обходит текущую на 15 п.п. и держит отрыв.",
 "Режиссёр отвечает за драматургию, ИИ за правдоподобие болезни. Актёры и зрители выбора не видят, поэтому финал каждый раз свой."),
("Условия на костюмах","f","Модель раздаёт ощущения.",
 "4 раза в секунду модель пересчитывает условия для каждого костюма. Ветка задаёт правила: насколько опасен контакт, силён ли иммунитет. Положение актёра задаёт дозу: жар, если клетке грозит мутация, холод, если она гибнет, дрожь при контакте, цвет по состоянию. Блок на поясе получает 20–50 пакетов в секунду и сглаживает переходы.",
 "Актёру не говорят, что играть. Ему создают предлагаемые обстоятельства, и роль рождается из ощущений."),
("Импровизация","f","Актёр отвечает телом.",
 "Актёр чувствует перемену и решает сам: отступить, замедлиться, потянуться к соседу. Камера снова видит его, и цикл начинается с шага 1.",
 "Живая реакция меняет картину на сцене, а значит и совпадения с базой. Так актёры влияют на то, что ИИ предложит на следующей развилке.")]
CY={'f':('fast','быстрый цикл · 4 раза в секунду'),'s':('slow','медленный цикл · развилка раз в 1,5–2 мин')}

# схема двух циклов: быстрый 1→2→3→7→8→1, медленный обход 3→4→5→6→7
P={1:(54,78),2:(152,78),3:(250,78),4:(430,78),5:(430,170),6:(430,262),7:(250,262),8:(152,262)}
LB={1:'камера',2:'трекинг',3:'анализ',4:'сравнение',5:'дерево',6:'развилка',7:'условия',8:'импровизация'}
nodes=''
for n,(x,y) in P.items():
    ty=26 if y<150 else 322
    if n==5: lab='<text class="nl" x="%d" y="%d" text-anchor="start">%s</text>'%(x+28,y+5,LB[n])
    else: lab='<text class="nl" x="%d" y="%d" text-anchor="middle">%s</text>'%(x,ty,LB[n])
    nodes+='<g class="lnode %s" data-n="%d"><circle cx="%d" cy="%d" r="19"/><text class="nn" x="%d" y="%d" text-anchor="middle">%d</text>%s</g>'%('sl' if n in (4,5,6) else 'fs',n,x,y,x,y+7,n,lab)
def arr(pts,k): return ''.join('<path class="ar %s" d="M-4.5 -5L4.5 0L-4.5 5Z" transform="translate(%d %d) rotate(%d)"/>'%(k,x,y,r) for x,y,r in pts)
ARF=arr([(103,78,0),(201,78,0),(250,170,90),(201,262,180),(103,262,180),(54,170,270)],'f')
ARS=arr([(340,78,0),(430,124,90),(430,216,90),(340,262,180)],'s')
LOOP='''<svg class="loop" viewBox="0 0 512 340" role="img" aria-label="Два цикла: быстрый — камера, трекинг, анализ, условия, импровизация; медленный — сравнение с базой, дерево, развилка">
<rect class="zone f" x="20" y="40" width="264" height="260" rx="26"/><rect class="zone s" x="300" y="40" width="192" height="260" rx="26"/>
<path class="lp f" d="M54 78H250V262H54Z"/>
<path class="lp s" d="M250 78H430V262H250"/>
'''+ARF+ARS+'''
<text class="zl f" x="152" y="166" text-anchor="middle">Быстрый цикл</text><text class="zs f" x="152" y="188" text-anchor="middle">4 раза в секунду</text>
<text class="zl s" x="352" y="152" text-anchor="middle">Медленный</text><text class="zl s" x="352" y="172" text-anchor="middle">цикл</text><text class="zs s" x="352" y="194" text-anchor="middle">раз в 2 мин</text>
'''+nodes+'''</svg>'''

out=[]
for i,(t,cy,sm,wh,zy) in enumerate(ST,1):
    k,lab=CY[cy]
    out.append('<article class="stp" id="s%d" data-n="%d"><div class="card"><div class="kk"><span class="k">Шаг %d</span><span class="cy %s">%s</span></div><h3>%s</h3><p class="sm">%s</p>%s<p><b>Что происходит.</b> %s</p><p><b>Зачем.</b> %s</p></div></article>'%(i,i,i,k,lab,t,sm,S[i],wh,zy))

# Ритм: пример 10-минутной сцены
X0,X1=150,930
def X(m): return X0+(X1-X0)*m/10.0
seg=[(0,3.33,'Классическое','var(--mute)'),(3.33,4.5,'Агрессивная','var(--cancer)'),(4.5,6.5,'Метастаз','#b8336a'),(6.5,10,'Иммунный ответ','var(--healthy)')]
forks=[(1.5,'ИИ оставил','ветку','k'),(3.33,'ИИ: новая ветка,','режиссёр за','a'),(4.5,'внеочередная,','2-й очаг','e'),(6.5,'режиссёр выбрал','свою ветку','d'),(8.33,'ИИ оставил','ветку','k')]
tl='<svg class="tl" viewBox="0 0 960 268" role="img" aria-label="Пример сцены на 10 минут: ветки, развилки, частоты">'
tl+='<defs><pattern id="hatch" width="3" height="10" patternUnits="userSpaceOnUse"><rect width="1" height="10" fill="var(--healthy)" opacity=".55"/></pattern><pattern id="dots" width="9" height="10" patternUnits="userSpaceOnUse"><circle cx="2" cy="5" r="1.4" fill="var(--gold)" opacity=".75"/></pattern></defs>'
for y,l1,l2 in [(46,'Ветка','сценарий'),(112,'Развилки','раз в 1,5–2 мин'),(178,'Сравнение','раз в секунду'),(214,'Условия','4 раза в секунду')]:
    tl+='<text class="rl" x="0" y="%d">%s</text><text class="rs" x="0" y="%d">%s</text>'%(y,l1,y+15,l2)
for a,b,n,c in seg:
    tl+='<rect x="%.1f" y="34" width="%.1f" height="28" rx="6" fill="%s" fill-opacity=".22" stroke="%s" stroke-opacity=".7"/><text class="sg" x="%.1f" y="53">%s</text>'%(X(a)+1,X(b)-X(a)-2,c,c,X(a)+10,n)
tl+='<line x1="%d" y1="112" x2="%d" y2="112" class="ax"/>'%(X0,X1)
for m,l1,l2,k in forks:
    x=X(m); tl+='<line x1="%.1f" y1="64" x2="%.1f" y2="104" class="fk %s"/><rect x="%.1f" y="105" width="14" height="14" rx="2" transform="rotate(45 %.1f 112)" class="fd %s"/><text class="fl" x="%.1f" y="140" text-anchor="middle">%s</text><text class="fl" x="%.1f" y="153" text-anchor="middle">%s</text>'%(x,x,k,x-7,x,k,x,l1,x,l2)
tl+='<text class="fl fin" x="%d" y="140" text-anchor="end">финал:</text><text class="fl fin" x="%d" y="153" text-anchor="end">выздоровление</text>'%(X1,X1)
tl+='<rect x="%d" y="170" width="%d" height="10" fill="url(#dots)"/><rect x="%d" y="206" width="%d" height="10" fill="url(#hatch)"/>'%(X0,X1-X0,X0,X1-X0)
for m in range(0,11,2):
    tl+='<line x1="%.1f" y1="232" x2="%.1f" y2="238" class="ax"/><text class="tk" x="%.1f" y="256" text-anchor="middle">%d мин</text>'%(X(m),X(m),X(m),m)
tl+='<line x1="%d" y1="232" x2="%d" y2="232" class="ax"/></svg>'%(X0,X1)

WHY=[("Тело не успевает","Термопластины выходят на режим за 5–10 секунд. Актёру нужно ещё 20–40 секунд, чтобы прожить ощущение и ответить на него."),
("Зритель должен прочитать","Каждая ветка это маленькая сцена с завязкой и развитием. Смена каждые 10 секунд превратится в мельтешение."),
("Данные шумят","Один шаг актёра почти ничего не говорит о болезни. Модель смотрит на окно в минуту и ждёт, пока другая ветка обойдёт текущую и удержит отрыв."),
("Режиссёру нужно время","На решение 5–10 секунд. Не успел, значит согласился с ИИ. Спектакль при этом не останавливается.")]
RT=[("Камера","30 кадров в секунду"),("Состояние клеток и условия на костюмах","4 раза в секунду"),("Пакеты на костюм","20–50 раз в секунду, переходы плавные"),
("Сравнение с базой","раз в секунду, по окну 60–80 секунд"),("Плановая развилка","раз в 1,5–2 минуты"),("Внеочередная развилка","после мутации или гибели, не раньше чем через минуту после прошлой смены"),
("Окно решения режиссёра","5–10 секунд"),("Сцена микромира","8–10 минут, 4–6 развилок")]

html='''<section class="part" id="how">
  <div class="wrap">
    <div class="sh rv"><span class="eyebrow">Листайте вниз</span><h2>Как это <em>работает</em></h2>
      <p class="shp">Восемь шагов из постера складываются в два цикла. Быстрый 4 раза в секунду превращает движение актёров в ощущения на костюмах. Медленный решает, по какой ветке идёт болезнь.</p></div>
    <div class="howg">
      <div class="loopfig" id="loopfig">'''+LOOP+'''</div>
      <div class="steps" id="steps">'''+"".join(out)+'''</div>
    </div>
  </div>
</section>
<section class="part" id="rhythm">
  <div class="wrap">
    <div class="sh rv"><span class="eyebrow">Ритм</span><h2>Условия часто, <em>сценарий редко</em></h2>
      <p class="shp">Условия на костюмах меняются 4 раза в секунду, сравнение с базой идёт каждую секунду, а ветка болезни меняется только на развилках, раз в 1,5–2 минуты.</p></div>
    <div class="why4 rv">'''+''.join('<div class="w"><span class="wn">%d</span><b>%s</b><p>%s</p></div>'%(i,a,b) for i,(a,b) in enumerate(WHY,1))+'''</div>
    <div class="rt rv"><h3>Частоты</h3><dl>'''+''.join('<div><dt>%s</dt><dd>%s</dd></div>'%(a,b) for a,b in RT)+'''</dl>
      <p class="note">В симуляции наверху страницы время сжато примерно в 5 раз: развилка каждые ~25 секунд демо. Окно решения режиссёра не сжимается.</p></div>
  </div>
</section>
'''
open('track.html','w').write(html)
