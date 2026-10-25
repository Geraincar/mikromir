/* ---------- модель ----------
   Спектакль живёт в двух ритмах.
   Быстрый цикл, 4 раза в секунду: камера видит актёров → модель считает состояние каждой клетки
     → раздаёт условия на костюмы (жар, холод, вибрация, цвет) по правилам текущего сценария.
   Медленный цикл, на развилках: модель всё время сравнивает динамику клеток с базой (совпадение),
     но сценарий меняется только на развилке. ИИ предлагает ветку с лучшим совпадением,
     режиссёр оставляет её или выбирает другую. Если режиссёр молчит, остаётся предложение ИИ.
   В демо время сжато примерно в 5 раз: 1 с демо ≈ 5 с спектакля. */
var N=7, AR=4/3, R=0.16, DYING=7, TS=1.7;
var HEALTHY=[79,227,193], CANCER=[240,62,128], DEAD=[112,116,132];
var T_MIN=20, T_MAX=40, T_SKIN=32;
var COND_DT=0.25;      /* условия на костюмах: 4 раза в секунду */
var MATCH_DT=1;        /* сравнение с базой: раз в секунду, по окну WIN */
var WIN=16;            /* окно сравнения, с (в спектакле ≈ 60–80 с) */
var FIRST_FORK=10;     /* первая развилка: когда накопились данные */
var FORK_EVERY=24;     /* плановая развилка (в спектакле ≈ раз в 2 мин) */
var MIN_HOLD=13;       /* сценарий держится минимум столько (в спектакле ≈ 1 мин) */
var DECIDE=11;         /* окно решения режиссёра */
var LEAD=0.15, LEAD_HOLD=4; /* внеочередная развилка: другая ветка лучше на 15 п.п. дольше 4 с */
var T_END=110;         /* длина сцены микромира (в спектакле ≈ 9–10 мин) */
var DEMO_X=5;
var FONT='"IBM Plex Mono",ui-monospace,monospace';
function clamp(v,lo,hi){return Math.max(lo,Math.min(hi,v));}
function mix(a,b,t){return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];}
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function rgbStr(c){return "rgb("+Math.round(c[0])+" "+Math.round(c[1])+" "+Math.round(c[2])+")";}
function rgba(c,a){return "rgba("+Math.round(c[0])+","+Math.round(c[1])+","+Math.round(c[2])+","+a+")";}
function isLive(c){return c.type==="healthy"||c.type==="cancer";}
function dist(a,b){return Math.hypot((a.x-b.x)*AR,a.y-b.y);}
function fmtT(t){t=Math.max(0,t);var m=Math.floor(t/60),s=Math.floor(t%60);return (m<10?"0":"")+m+":"+(s<10?"0":"")+s;}
function tempColor(t){var u=clamp((t-T_MIN)/(T_MAX-T_MIN),0,1);return "hsl("+Math.round(210-u*195)+" 85% 58%)";}
var $=function(id){return document.getElementById(id);};

/* Сценарии. sig: «подпись» ветки в данных — среднее и разброс признаков за окно WIN.
   Подписи посчитаны прогоном 400 симуляций на каждую ветку (src/calibrate.js). */
var SCN=[
 {id:"fast",name:"Агрессивная опухоль",short:"Агрессивная",time:"недели",a:0.95,prior:0.15,src:"SEER, TCGA",
  blurb:"Мутация в первые секунды, быстрый рост, здоровые клетки отступают.",
  sig:{mut:[1.61,1.05],kill:[0.64,0.85],dev:[0.15,0.38],share:[0.49,0.25],spread:[0.24,0.25],speed:[9.13,0.86]}},
 {id:"mid",name:"Классическое течение",short:"Классическое",time:"месяцы",a:0.6,prior:0.35,src:"TCGA",
  blurb:"Очаг растёт ровно, у здоровых клеток есть время сопротивляться.",
  sig:{mut:[1.06,0.88],kill:[0.56,0.78],dev:[0.07,0.26],share:[0.39,0.24],spread:[0.17,0.23],speed:[7.48,1.0]}},
 {id:"sleep",name:"Спящая опухоль",short:"Спящая",time:"годы",a:0.25,late:8,chase:0.35,prior:0.15,src:"SEER",
  blurb:"Долго тихо, потом одна клетка мутирует и затаивается.",
  sig:{mut:[0.37,0.55],kill:[0.12,0.35],dev:[0.0,0.15],share:[0.18,0.15],spread:[0.12,0.29],speed:[6.03,1.06]}},
 {id:"imm",name:"Иммунный ответ",short:"Иммунитет",time:"месяцы",a:0.6,imm:0.05,prior:0.2,src:"PhysiCell, IDR",
  blurb:"Опухоль растёт, но иммунитет находит её. Раковые клетки гибнут.",
  sig:{mut:[1.03,0.76],kill:[0.75,0.84],dev:[0.02,0.15],share:[0.18,0.15],spread:[0.05,0.15],speed:[7.37,1.53]}},
 {id:"met",name:"Метастаз",short:"Метастаз",time:"месяцы",a:0.75,second:12,prior:0.15,src:"PhysiCell, TCGA",
  blurb:"Первый очаг растёт, и вдруг мутирует клетка в другом углу сцены.",
  sig:{mut:[1.69,1.15],kill:[0.67,0.88],dev:[0.09,0.3],share:[0.49,0.25],spread:[0.38,0.36],speed:[8.27,0.9]}}
];
var FINALS={rec:"Выздоровление",rem:"Ремиссия",win:"Победа опухоли",hid:"Затаившаяся болезнь"};
var sim=null, rnd=null, running=false, sel=-1, inView=true, opened=false, endHandled=false;

function byId(id){for(var i=0;i<SCN.length;i++)if(SCN[i].id===id)return SCN[i];return null;}
function pickPrior(){var u=rnd(),acc=0;for(var i=0;i<SCN.length;i++){acc+=SCN[i].prior;if(u<acc)return SCN[i];}return SCN[1];}
function firstHitFor(sc,t0){return t0+4+10*(1-sc.a)+(sc.late||0);}

function newRun(seed,forceScn){
  rnd=mulberry32(seed);
  var sc=forceScn||pickPrior(), cells=[], guard=0;
  while(cells.length<N && guard++<500){
    var x=0.12+0.76*rnd(), y=0.15+0.7*rnd(), ok=true;
    for(var k=0;k<cells.length;k++){ if(Math.hypot((cells[k].x-x)*AR,cells[k].y-y)<=0.2){ok=false;break;} }
    if(ok) cells.push(mk(cells.length,x,y));
  }
  while(cells.length<N) cells.push(mk(cells.length,rnd(),rnd()));
  sim={seed:seed,scn:sc,a:sc.a,imm:sc.imm||0,by:"ai",t:0,mutated:false,ended:false,outcome:"",finale:"",
       firstHit:firstHitFor(sc,0),secondAt:null,cells:cells,log:[],logVer:0,ev:[],series:[],nextSample:0,
       match:{},feat:null,cspd:0,fork:null,nextFork:FIRST_FORK,lastChange:0,leadT:0,condT:0,matchT:0,ticks:0,forks:0,history:[{t:0,id:sc.id,by:"ai"}]};
  if(sc.second) sim.secondAt=sim.firstHit+sc.second;
  SCN.forEach(function(s){sim.match[s.id]=0.2;});
  for(var i=0;i<cells.length;i++) cells[i].cs=conditionsOf(cells[i]);
  endHandled=false;
  addLog("ai","Начало сцены. Данных пока мало, ИИ берёт стартовую ветку по частоте в базе: «"+sc.name+"».");
}
function mk(i,x,y){
  return {i:i,name:"A"+(i+1),type:"healthy",was:"healthy",cause:"",x:x,y:y,ang:rnd()*6.283,vx:0,vy:0,cn:0,hn:0,nbC:[],nbH:[],
          o2:1,dy:0,pulse:0,goal:null,phase:rnd()*6,rgb:HEALTHY.slice(),temp:T_SKIN,vib:0,cs:null,speed:0.06};
}
function addLog(kind,text){if(!sim)return;sim.log.unshift({t:sim.t,kind:kind,text:text});if(sim.log.length>60)sim.log.pop();sim.logVer++;}

/* ---------- сценарий: развилки ---------- */
function applyScenario(scn){
  var S=sim; S.scn=scn; S.a=scn.a; S.imm=scn.imm||0;
  if(!S.mutated) S.firstHit=Math.max(S.t+2,firstHitFor(scn,S.t-4)-2);
  S.secondAt=scn.second?(S.mutated?S.t+scn.second*0.6:S.firstHit+scn.second):null;
}
function bestMatch(){var b=SCN[0];SCN.forEach(function(s){if(sim.match[s.id]>sim.match[b.id])b=s;});return b;}
function openFork(early){
  var S=sim, p=bestMatch(), same=p===S.scn;
  S.fork={t0:S.t,until:S.t+(same?DECIDE*0.6:DECIDE),prop:p,score:S.match[p.id],early:early,same:same};
  S.forks++;
  if(same) addLog("fork",(early?"Внеочередная развилка. ":"Развилка. ")+"ИИ оставляет «"+p.name+"»: совпадение "+Math.round(S.match[p.id]*100)+"%.");
  else addLog("fork",(early?"Внеочередная развилка: динамика изменилась. ":"Развилка. ")+"ИИ предлагает «"+p.name+"», совпадение "+Math.round(S.match[p.id]*100)+"%.");
}
/* how: ai (режиссёр не вмешался), keep (режиссёр оставил предложение), dir (режиссёр выбрал другую ветку) */
function adopt(scn,how){
  var S=sim, prev=S.scn, f=S.fork;
  S.fork=null; S.lastChange=S.t; S.nextFork=S.t+FORK_EVERY; S.leadT=0;
  S.by=how==="dir"?"dir":(how==="keep"?"keep":"ai");
  if(scn!==prev){applyScenario(scn);S.history.push({t:S.t,id:scn.id,by:S.by});}
  if(how==="ai") addLog("ai",f&&f.same?"Сценарий прежний: «"+scn.name+"».":"Режиссёр не вмешался. Новый сценарий: «"+scn.name+"».");
  else if(how==="keep") addLog("dir","Режиссёр оставил ветку ИИ: «"+scn.name+"».");
  else addLog("dir","Режиссёр выбрал «"+scn.name+"»"+(f?" вместо «"+f.prop.name+"»":"")+". Актёры об этом не знают, они почувствуют новые условия.");
}
function directorPick(scn){
  var S=sim; if(!S||S.ended)return;
  if(S.fork) adopt(scn,scn===S.fork.prop?"keep":"dir");
  else if(scn!==S.scn) adopt(scn,"dir");
}

/* ---------- сравнение с базой ---------- */
function features(){
  var S=sim, t0=S.t-WIN, f={mut:0,kill:0,dev:0,share:0,spread:0,speed:S.cspd*100}, i, j, H=0, K=0, cc=[];
  for(i=0;i<S.ev.length;i++){var e=S.ev[i]; if(e.t>t0) f[e.k]++;}
  for(i=0;i<S.cells.length;i++){var c=S.cells[i]; if(c.type==="healthy")H++; else if(c.type==="cancer"){K++;cc.push(c);}}
  f.share=H+K?K/(H+K):0;
  for(i=0;i<cc.length;i++)for(j=i+1;j<cc.length;j++)f.spread=Math.max(f.spread,dist(cc[i],cc[j]));
  return f;
}
function similarity(s,f){
  var S=sim;
  if(!S.mutated){ var fh=s===S.scn?S.firstHit:firstHitFor(s,0); return 1/(1+Math.exp((S.t-fh)/2.5)); }
  var z=0,n=0; for(var k in s.sig){var d=(f[k]-s.sig[k][0])/s.sig[k][1]; z+=d*d; n++;}
  return Math.exp(-0.5*z/n);
}
function matchUpdate(){
  var S=sim, f=features(); S.feat=f;
  SCN.forEach(function(s){S.match[s.id]+=(similarity(s,f)-S.match[s.id])*0.35;});
  if(S.fork||S.ended) return;
  var b=bestMatch();
  if(b!==S.scn&&S.match[b.id]-S.match[S.scn.id]>=LEAD) S.leadT+=MATCH_DT; else S.leadT=0;
  if(S.t>=S.nextFork) openFork(false);
  else if(S.t-S.lastChange>=MIN_HOLD&&S.leadT>=LEAD_HOLD) openFork(true);
}

/* ---------- события клеток ---------- */
function mutate(c,how){
  c.type="cancer"; c.pulse=1; sim.mutated=true; sim.ev.push({t:sim.t,k:"mut"});
  addLog("mutation",c.name+": "+{spont:"спонтанная мутация, клетка стала раковой",contact:"контакт с раковой клеткой, мутация",meta:"метастаз, новый очаг в другой части сцены"}[how]);
}
function startDying(c,cause){
  c.was=c.type; c.type="dying"; c.cause=cause; c.dy=0;
  sim.ev.push({t:sim.t,k:cause==="devour"?"dev":"kill"});
  addLog(cause==="devour"?"devour":"hypoxia",c.name+({devour:": поглощена раковой клеткой",hypoxia:": раковая клетка гибнет от нехватки кислорода",immune:": иммунитет уничтожил раковую клетку"}[cause]));
}
function improvise(c){
  if(!isLive(c)||sim.ended)return;
  var t=nearest(c,"cancer")||nearest(c,"healthy"); if(!t)return;
  c.goal={i:t.i,until:sim.t+3.5};
  addLog("info",c.name+" импровизирует: шаг к "+t.name+". Камера это увидит.");
}

/* ---------- условия на костюмах ----------
   Каналы как на постере: жар → мутация здоровой в раковую; холод → клетка гибнет;
   вибрация → взаимодействие с другой клеткой; цвет → состояние (бирюзовый, малиновый, серый).
   Сценарий задаёт правила (риск мутации, сила иммунитета), положение актёра задаёт дозу. */
function conditionsOf(c){
  var S=sim, sc=S.scn, a=S.a, r={heat:0,cold:0,vib:0,why:[]}, risk, death, p;
  if(c.type==="healthy"){
    risk=0.0015*a+0.08*a*c.cn;
    r.heat=clamp(risk/0.075,0,1)*0.85;
    r.vib=clamp(0.5*c.cn+0.22*c.hn,0,1);
    r.rgb=HEALTHY; r.state=c.cn?"под угрозой":"здорова";
    if(c.cn) r.why.push({ch:"vib",t:"Касается раковой "+c.nbC.join(", ")+" → дрожь"});
    else if(c.hn) r.why.push({ch:"vib",t:"Рядом "+c.nbH.join(", ")+" → лёгкая дрожь"});
    if(c.cn) r.why.push({ch:"heat",t:r.heat>0.4?"Ветка «"+sc.short+"»: риск мутации высокий → жар":"Ветка «"+sc.short+"»: риск мутации низкий → чуть тепло"});
    r.why.push({ch:"led",t:"Здорова → бирюзовый"});
    r.hint=c.cn?"Жарко и тесно. Решайте сами: отступить или держаться.":(c.hn?"Рядом сосед. Держите дистанцию, дышите ровно.":"Вы здоровая клетка. Дышите ровно, двигайтесь спокойно.");
  }else if(c.type==="cancer"){
    death=(c.o2<0.5?(0.5-c.o2)*0.35:0)+0.004*(1.15-a)+0.02*(1.2-a)*c.hn+S.imm;
    r.cold=clamp((death-0.008)/0.07,0,1);
    r.heat=c.pulse;
    r.vib=clamp(0.35*(c.cn+c.hn),0,1);
    r.rgb=CANCER; r.state=r.cold>0.5?"раковая, слабеет":"раковая";
    if(c.pulse>0.2) r.why.push({ch:"heat",t:"Мутация только что случилась → пик жара"});
    if(S.imm) r.why.push({ch:"cold",t:"Ветка «Иммунитет»: клетку атакуют → холод"});
    if(1-c.o2>0.4) r.why.push({ch:"cold",t:"Тесно, не хватает кислорода → холод"});
    if(c.hn) r.why.push({ch:"vib",t:"Касается здоровой "+c.nbH.join(", ")+" → дрожь"});
    r.why.push({ch:"led",t:"Раковая → малиновый"});
    r.hint=r.cold>0.5?"Холодно, силы уходят. Замедляйтесь.":"Вы делитесь. Занимайте место, тянитесь к здоровым.";
  }else if(c.type==="dying"){
    p=clamp(c.dy/DYING,0,1);
    r.cold=0.65+0.35*p; r.vib=0.45*(1-p);
    r.rgb=mix(c.was==="cancer"?CANCER:HEALTHY,DEAD,p); r.state="гибнет";
    r.why.push({ch:"cold",t:"Клетка гибнет → холод"},{ch:"led",t:"Цвет гаснет до серого"});
    r.hint=c.cause==="devour"?"Вас поглощают. Оседайте, отдайте вес соседу.":"Силы уходят. Замедляйтесь и опускайтесь на пол.";
  }else{
    r.rgb=DEAD; r.state="погибла";
    r.why.push({ch:"led",t:"Погибла → серый, каналы выключены"});
    r.hint="Вы остановились. Замрите до конца сцены.";
  }
  r.temp=clamp(T_SKIN+8*r.heat-12*r.cold,T_MIN,T_MAX);
  return r;
}

function nearest(c,kind){
  var best=null,bd=9;
  for(var k=0;k<sim.cells.length;k++){var o=sim.cells[k]; if(o!==c&&o.type===kind){var d=dist(c,o); if(d<bd){bd=d;best=o;}}}
  return best;
}
function step(dt){
  var S=sim; if(S.ended) return;
  S.t+=dt;
  var cs=S.cells, i, j, c, a, b;
  for(i=0;i<cs.length;i++){cs[i].cn=0;cs[i].hn=0;cs[i].nbC=[];cs[i].nbH=[];}
  for(i=0;i<cs.length;i++)for(j=i+1;j<cs.length;j++){
    a=cs[i]; b=cs[j];
    if(isLive(a)&&isLive(b)&&dist(a,b)<R){
      if(b.type==="cancer"){a.cn++;a.nbC.push(b.name);}else{a.hn++;a.nbH.push(b.name);}
      if(a.type==="cancer"){b.cn++;b.nbC.push(a.name);}else{b.hn++;b.nbH.push(a.name);}
    }
  }
  if(!S.mutated&&S.t>=S.firstHit){
    var hs=cs.filter(function(x){return x.type==="healthy";});
    if(hs.length) mutate(hs[Math.floor(rnd()*hs.length)],"spont");
  }
  if(S.secondAt!==null&&S.mutated&&S.t>=S.secondAt){
    S.secondAt=null;
    var far=null,fd=-1;
    cs.forEach(function(x){if(x.type!=="healthy")return;var n=nearest(x,"cancer"),d=n?dist(x,n):1;if(d>fd){fd=d;far=x;}});
    if(far) mutate(far,"meta");
  }
  for(i=0;i<cs.length;i++){
    c=cs[i];
    if(c.type==="healthy"){
      c.o2=1-0.1*c.cn;
      var r=rnd(), dev=c.cn>=2?0.035*S.a:0, mu=0.0015*S.a+0.08*S.a*c.cn;
      if(r<dev*dt) startDying(c,"devour");
      else if(r<(dev+mu)*dt) mutate(c,c.cn?"contact":"spont");
    }else if(c.type==="cancer"){
      c.o2=clamp(1-0.32*c.cn,0.05,1);
      var hyp=(c.o2<0.5?(0.5-c.o2)*0.35:0)+0.004*(1.15-S.a)+0.02*(1.2-S.a)*c.hn, u=rnd()/dt;
      if(u<S.imm) startDying(c,"immune"); else if(u<S.imm+hyp) startDying(c,"hypoxia");
    }else if(c.type==="dying"){
      c.dy+=dt;
      if(c.dy>=DYING){c.type="dead";addLog("info",c.name+": остановилась");}
    }
  }
  move(dt);
  /* скорость раковых клеток: камера видит её напрямую */
  var sp=0,ns=0; for(i=0;i<cs.length;i++) if(cs[i].type==="cancer"){sp+=cs[i].speed;ns++;}
  if(ns) S.cspd+=(sp/ns-S.cspd)*Math.min(1,dt/4);
  /* быстрый цикл: условия пересчитываются 4 раза в секунду */
  S.condT+=dt;
  if(S.condT>=COND_DT){S.condT-=COND_DT;S.ticks++;for(i=0;i<cs.length;i++)cs[i].cs=conditionsOf(cs[i]);}
  /* костюм догоняет цель: цвет быстро, вибрация мгновенно, пластины с тепловой инерцией */
  for(i=0;i<cs.length;i++){
    c=cs[i]; var k=c.cs, m=Math.min(1,dt*3);
    c.rgb=[c.rgb[0]+(k.rgb[0]-c.rgb[0])*m,c.rgb[1]+(k.rgb[1]-c.rgb[1])*m,c.rgb[2]+(k.rgb[2]-c.rgb[2])*m];
    c.temp+=(k.temp-c.temp)*Math.min(1,dt*0.6);
    c.vib+=(k.vib-c.vib)*Math.min(1,dt*8);
    c.pulse=Math.max(0,c.pulse-dt/4);
  }
  /* медленный цикл: сравнение с базой раз в секунду, развилки */
  S.matchT+=dt;
  if(S.matchT>=MATCH_DT){S.matchT-=MATCH_DT;matchUpdate();}
  if(S.fork&&S.t>=S.fork.until) adopt(S.fork.prop,"ai");
  if(S.t>=S.nextSample){
    S.nextSample+=1;
    var hh=0,cc=0,dd=0;
    for(i=0;i<cs.length;i++){if(cs[i].type==="healthy")hh++;else if(cs[i].type==="cancer")cc++;else dd++;}
    S.series.push({t:S.t,h:hh,c:cc,d:dd});
  }
  var dying=cs.some(function(x){return x.type==="dying";});
  var H=0,K=0; for(i=0;i<cs.length;i++){if(cs[i].type==="healthy")H++;else if(cs[i].type==="cancer")K++;}
  var fin=null;
  if(S.mutated&&!dying){ if(H===0) fin="win"; else if(K===0) fin=S.imm?"rec":"rem"; }
  if(!fin&&S.t>=T_END) fin=K>0&&H>0?"hid":(K>0?"win":"rem");
  if(fin){ S.ended=true; S.fork=null; S.finale=fin; S.outcome=FINALS[fin]; addLog("end","Финал: "+S.outcome+"."); }
}
function move(dt){
  var cs=sim.cells, i, o, c, t, dx, dy, d, vx, vy, n, sp, ch=sim.scn.chase||1.6;
  for(i=0;i<cs.length;i++){
    c=cs[i]; if(c.type==="dead"){c.speed=0;continue;}
    c.ang+=(rnd()-0.5)*dt*4;
    vx=Math.cos(c.ang); vy=Math.sin(c.ang);
    if(c.goal&&sim.t<c.goal.until&&isLive(cs[c.goal.i])&&isLive(c)){
      t=cs[c.goal.i]; dx=(t.x-c.x)*AR; dy=t.y-c.y; d=Math.hypot(dx,dy)||1; vx+=3*dx/d; vy+=3*dy/d;
    }else{
      c.goal=null;
      if(c.type==="cancer"){
        t=nearest(c,"healthy");
        if(t){dx=(t.x-c.x)*AR;dy=t.y-c.y;d=Math.hypot(dx,dy)||1;vx+=ch*dx/d;vy+=ch*dy/d;}
      }else if(c.type==="healthy"){
        t=nearest(c,"cancer");
        if(t){dx=(c.x-t.x)*AR;dy=c.y-t.y;d=Math.hypot(dx,dy)||1;if(d<0.35){vx+=dx/d;vy+=dy/d;}}
      }
    }
    if(c.x<0.12)vx+=1.5; if(c.x>0.88)vx-=1.5; if(c.y<0.14)vy+=1.5; if(c.y>0.86)vy-=1.5;
    for(var j=0;j<cs.length;j++){
      o=cs[j]; if(o===c)continue;
      dx=(c.x-o.x)*AR; dy=c.y-o.y; d=Math.hypot(dx,dy);
      if(d>0&&d<(c.goal?0.06:0.1)){vx+=0.8*dx/d;vy+=0.8*dy/d;}
    }
    n=Math.hypot(vx,vy)||1; vx/=n; vy/=n;
    c.vx+=(vx-c.vx)*Math.min(1,dt*3); c.vy+=(vy-c.vy)*Math.min(1,dt*3);
    if(c.type==="healthy") sp=c.goal?0.09:0.06;
    else if(c.type==="cancer") sp=(0.05+0.06*sim.a)*(0.5+0.5*c.o2)*(c.goal?1.4:1);
    else sp=0.04*(1-clamp(c.dy/DYING,0,1));
    c.speed=sp;
    c.x=clamp(c.x+c.vx*sp*dt/AR,0.08,0.92);
    c.y=clamp(c.y+c.vy*sp*dt,0.1,0.9);
    c.phase+=sp*dt*60;
  }
}

