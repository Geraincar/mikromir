/* ---------- интерфейс ---------- */
var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
function esc(s){return String(s).replace(/[&<>"]/g,function(ch){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[ch];});}
function realSec(simSec){return Math.max(0,Math.ceil(simSec/TS));}

/* пульт: сценарии */
var scnEl=$("scns"), scnRows={};
SCN.forEach(function(sc){
  var li=document.createElement("li"), b=document.createElement("button");
  b.type="button"; b.className="scn"; b.dataset.id=sc.id;
  b.innerHTML='<span class="nm"><b>'+esc(sc.name)+'</b><em>'+esc(sc.time)+' в жизни · '+esc(sc.src)+'</em></span>'+
    '<span class="mt"><i class="mb"><i></i></i><b>0%</b></span><span class="tag"></span>';
  b.addEventListener("click",function(){directorPick(sc);updateUI();});
  li.appendChild(b); scnEl.appendChild(li);
  scnRows[sc.id]={el:b,bar:b.querySelector(".mb i"),pc:b.querySelector(".mt b"),tag:b.querySelector(".tag")};
});

/* пульт: условия */
var condEl=$("conds"), condRows=[];
for(var ci=0;ci<N;ci++){
  var li=document.createElement("li"), b=document.createElement("button");
  b.type="button"; b.className="cd"; b.dataset.i=ci; b.setAttribute("aria-pressed","false");
  b.innerHTML='<span class="who"><i class="dot"></i><b>A'+(ci+1)+'</b><b class="tv"></b></span><em class="st"></em>'+
    '<i class="tb"><i class="tm"></i></i><span class="vb"><i></i><i></i><i></i><i></i><i></i></span>';
  b.addEventListener("click",function(){var i=+this.dataset.i;select(sel===i?-1:i);});
  li.appendChild(b); condEl.appendChild(li);
  condRows.push({el:b,dot:b.querySelector(".dot"),st:b.querySelector(".st"),tm:b.querySelector(".tm"),tv:b.querySelector(".tv"),vb:[].slice.call(b.querySelectorAll(".vb i"))});
}

function select(i){
  sel=i; $("drawer").classList.toggle("on",i>=0);
  if(i>=0) $("hint").classList.add("off");
  condRows.forEach(function(r,k){r.el.setAttribute("aria-pressed",k===i?"true":"false");});
  lastWhy=""; updateUI();
}
$("dClose").addEventListener("click",function(){select(-1);});
document.addEventListener("keydown",function(e){if(e.key==="Escape")select(-1);});
$("dImp").addEventListener("click",function(){var c=sim.cells[sel]; if(c){improvise(c);updateUI();}});
$("forkKeep").addEventListener("click",function(){if(sim.fork){adopt(sim.fork.prop,"keep");updateUI();}});

function hit(e){
  var r=SC.cv.getBoundingClientRect(), mx=e.clientX-r.left, my=e.clientY-r.top, best=-1, bd=1e9;
  for(var i=0;i<sim.cells.length;i++){
    var c=sim.cells[i], p=proj(c.x,c.y), dead=c.type==="dead"||c.type==="dying";
    var cy=p.y-p.H*(dead?0.12:0.48), rad=p.H*(dead?0.42:0.34), d=Math.hypot(mx-p.x,my-cy);
    if(d<rad&&d<bd){bd=d;best=i;}
  }
  return best;
}
SC.cv.addEventListener("pointermove",function(e){hov=hit(e);SC.cv.style.cursor=hov>=0?"pointer":"default";});
SC.cv.addEventListener("pointerleave",function(){hov=-1;});
SC.cv.addEventListener("pointerdown",function(e){var i=hit(e);select(i>=0?(i===sel?-1:i):-1);});

/* ---------- обновление ---------- */
var lastLogVer=-1, lastTick=-1, lastWhy="", BYTXT={ai:"выбрал ИИ",keep:"ИИ предложил, режиссёр оставил",dir:"выбрал режиссёр"};
var CHN={heat:"жар",cold:"холод",vib:"вибрация",led:"цвет"};
function colorName(c){return c.type==="healthy"?"бирюзовый":(c.type==="cancer"?"малиновый":(c.type==="dying"?"гаснет":"серый"));}
function updateUI(){
  var S=sim, cs=S.cells, i, c, k, F=S.fork;
  $("clock").textContent=fmtT(S.t)+" / "+fmtT(T_END);
  /* сценарий */
  $("nowName").textContent=S.scn.name;
  $("nowBy").textContent=S.history.length===1&&S.by==="ai"&&!S.forks?"стартовая ветка ИИ":BYTXT[S.by];
  var fill, txt;
  if(F){fill=1; txt=(F.early?"Внеочередная развилка":"Развилка")+": решает режиссёр";}
  else if(S.ended){fill=0; txt="Сцена окончена";}
  else{
    fill=clamp((S.t-S.lastChange)/(S.nextFork-S.lastChange),0,1);
    txt="Следующая развилка через "+realSec(S.nextFork-S.t)+" с";
    if(S.leadT>0&&S.t-S.lastChange>=MIN_HOLD){var bm=bestMatch(); txt="«"+bm.short+"» обходит текущую ветку: возможна внеочередная развилка";}
  }
  $("fbFill").style.transform="scaleX("+fill.toFixed(3)+")";
  $("fbFill").parentNode.classList.toggle("hot",!!F||(S.leadT>0&&S.t-S.lastChange>=MIN_HOLD));
  $("fbText").textContent=txt;
  SCN.forEach(function(sc){
    var r=scnRows[sc.id], m=S.match[sc.id], cur=sc===S.scn, prop=F&&F.prop===sc&&!F.same;
    r.bar.style.transform="scaleX("+m.toFixed(3)+")"; r.pc.textContent=Math.round(m*100)+"%";
    r.el.classList.toggle("is-cur",cur); r.el.classList.toggle("prop",!!prop);
    r.tag.textContent=cur?(F&&F.same?"ИИ оставляет":"идёт"):(prop?"ИИ предлагает":"");
    r.el.setAttribute("aria-label",sc.name+", совпадение "+Math.round(m*100)+"%"+(cur?", идёт сейчас":"")+(prop?", предложение ИИ":""));
  });
  /* развилка на сцене */
  var fk=$("fork");
  if(F&&!S.ended){
    var left=F.until-S.t, tot=F.until-F.t0;
    $("forkEy").textContent=F.early?"Внеочередная развилка":"Развилка";
    $("forkLeft").textContent=realSec(left)+" с";
    $("forkMsg").innerHTML=F.same?'ИИ оставляет <b>«'+esc(F.prop.name)+'»</b>: совпадение '+Math.round(S.match[F.prop.id]*100)+'%.'
      :'ИИ предлагает <b>«'+esc(F.prop.name)+'»</b>, совпадение '+Math.round(S.match[F.prop.id]*100)+'%. Сейчас идёт «'+esc(S.scn.short)+'», '+Math.round(S.match[S.scn.id]*100)+'%.';
    $("forkKeep").textContent=F.same?"Оставить":"Принять ветку ИИ";
    $("forkOr").textContent=innerWidth<=900?"или выберите другую ветку ниже":"или выберите другую в пульте справа";
    $("forkBar").style.transform="scaleX("+clamp(left/tot,0,1).toFixed(3)+")";
    fk.classList.add("on");
  }else fk.classList.remove("on");
  /* условия */
  var tick=S.ticks!==lastTick; lastTick=S.ticks;
  if(tick){var td=$("tickDot"); td.classList.remove("blink"); void td.offsetWidth; td.classList.add("blink");}
  for(i=0;i<cs.length;i++){
    c=cs[i]; k=c.cs; var r=condRows[i];
    r.dot.style.background=rgbStr(c.rgb); r.st.textContent=k.state;
    r.tm.style.left=(clamp((c.temp-T_MIN)/(T_MAX-T_MIN),0,1)*100).toFixed(1)+"%";
    r.tv.textContent=c.temp.toFixed(1)+"°";
    r.tv.className="tv"+(c.temp>T_SKIN+1?" hot":(c.temp<T_SKIN-1?" cold":""));
    var lv=Math.round(c.vib*5); for(var q=0;q<5;q++) r.vb[q].classList.toggle("on",q<lv);
    r.el.classList.toggle("dead",c.type==="dead");
  }
  if(sel>=0){
    c=cs[sel]; k=c.cs;
    $("dName").textContent=c.name; $("dState").textContent=k.state;
    $("dT").textContent=c.temp.toFixed(1)+" °C"; $("dT").className=c.temp>T_SKIN+1?"hot":(c.temp<T_SKIN-1?"cold":"");
    $("dV").textContent=Math.round(c.vib*100)+"%";
    $("dC").style.background=rgbStr(c.rgb); $("dCn").textContent=colorName(c);
    var wh=k.why.map(function(w){return '<li class="'+w.ch+'"><i>'+CHN[w.ch]+'</i>'+esc(w.t)+'</li>';}).join("");
    if(wh!==lastWhy){lastWhy=wh;$("dWhy").innerHTML=wh;}
    $("dHint").textContent=k.hint; $("dImp").disabled=!isLive(c)||S.ended;
  }
  if(lastLogVer!==S.logVer){
    lastLogVer=S.logVer;
    $("log").innerHTML=S.log.slice(0,3).map(function(l){return '<li class="'+l.kind+'"><time>'+fmtT(l.t)+'</time><span>'+esc(l.text)+'</span></li>';}).join("");
  }
}

/* ---------- занавес ---------- */
var cur=$("cur"), curTimer=null;
function openCurtain(){
  cur.classList.remove("gone"); void cur.offsetWidth;
  cur.classList.add("open"); document.body.classList.remove("lock");
  setTimeout(function(){running=true;},600);
  setTimeout(function(){if(cur.classList.contains("open"))cur.classList.add("gone");},3200);
}
function closeCurtain(title,sub){
  running=false; cur.classList.remove("gone","open");
  $("curEy").textContent="Финал"; $("curTitle").textContent=title; $("curSub").textContent=sub;
}
function introSkip(){ if(opened)return; opened=true; clearTimeout(curTimer); openCurtain(); }
document.body.classList.add("lock");
cur.addEventListener("pointerdown",introSkip);
window.addEventListener("wheel",introSkip,{passive:true});
window.addEventListener("keydown",introSkip);
curTimer=setTimeout(introSkip,2200);
function pathText(){
  var seen=[]; sim.history.forEach(function(h){var n=byId(h.id).short; if(seen[seen.length-1]!==n)seen.push(n);});
  return "Путь болезни: "+seen.join(" → ")+". Развилок: "+sim.forks+".";
}
function afterEnd(){
  endHandled=true;
  setTimeout(function(){
    if(inView){
      closeCurtain(sim.outcome,pathText()+" Следующий спектакль начнётся заново.");
      setTimeout(function(){newRun(1000+Math.floor(Math.random()*9000));select(-1);updateUI();openCurtain();},4800);
    }else{ newRun(1000+Math.floor(Math.random()*9000)); select(-1); updateUI(); running=true; }
  },2600);
}

/* ---------- меню, шаги, отметки на костюме ---------- */
var navB=[].slice.call(document.querySelectorAll("#gnav button"));
navB.forEach(function(b){b.addEventListener("click",function(){introSkip();$(b.dataset.t).scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"});});});
function navUpdate(){
  var cur2=navB[0], vh=innerHeight;
  navB.forEach(function(b){if($(b.dataset.t).getBoundingClientRect().top<vh*0.45)cur2=b;});
  navB.forEach(function(b){b.classList.toggle("on",b===cur2);});
}
var steps=[].slice.call(document.querySelectorAll(".stp")), lnodes=[].slice.call(document.querySelectorAll(".lnode")), loopfig=$("loopfig"), lastStep=-1;
function trackUpdate(){
  var mid=innerHeight*0.5, best=0, bd=1e9;
  steps.forEach(function(s,i){var r=s.getBoundingClientRect(), d=Math.abs(r.top+r.height/2-mid); if(d<bd){bd=d;best=i;}});
  if(best===lastStep)return; lastStep=best;
  steps.forEach(function(s,i){s.classList.toggle("active",i===best);});
  var n=best+1;
  lnodes.forEach(function(g){g.classList.toggle("on",+g.dataset.n===n);});
  loopfig.dataset.cy=(n>=4&&n<=6)?"s":"f";
}
var nt=false; function onScr(){if(!nt){nt=true;requestAnimationFrame(function(){nt=false;navUpdate();trackUpdate();});}}
window.addEventListener("scroll",onScr,{passive:true}); window.addEventListener("resize",function(){lastStep=-1;onScr();}); navUpdate(); trackUpdate();

var photo=$("photo"), lgItems=[].slice.call(document.querySelectorAll("#lg li")), hsEls=[].slice.call(photo.querySelectorAll(".hs")), hotK="t", hotManual=false, hotVis=false;
function setHot(k){
  hotK=k;
  lgItems.forEach(function(li){li.classList.toggle("on",li.dataset.k===k);});
  hsEls.forEach(function(h){h.classList.toggle("on",h.dataset.k===k);});
  photo.classList.add("focus");
}
lgItems.forEach(function(li){
  li.addEventListener("mouseenter",function(){hotManual=true;setHot(li.dataset.k);});
  li.addEventListener("click",function(){hotManual=true;setHot(li.dataset.k);});
});
setHot("t");
var HK=["t","v","l","c"];
setInterval(function(){if(!hotManual&&hotVis)setHot(HK[(HK.indexOf(hotK)+1)%HK.length]);},3000);

/* ---------- главный цикл ---------- */
newRun(1000+Math.floor(Math.random()*9000));
var last=performance.now(), lastUI=0;
function frame(now){
  var dt=Math.min(0.1,(now-last)/1000); last=now;
  if(running&&inView){
    var left=dt*TS;
    while(left>0){var s=Math.min(0.05,left);step(s);left-=s;}
    if(sim.ended&&!endHandled)afterEnd();
  }
  if(inView){drawStage(now);drawCam();}
  if(now-lastUI>200){lastUI=now;updateUI();}
  requestAnimationFrame(frame);
}
updateUI();
requestAnimationFrame(frame);

if("IntersectionObserver" in window){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.remove("will");io.unobserve(e.target);}});},{threshold:0.12});
  [].forEach.call(document.querySelectorAll(".rv"),function(el){ if(el.getBoundingClientRect().top>innerHeight*0.9){el.classList.add("will");io.observe(el);} });
  new IntersectionObserver(function(es){inView=es[0].isIntersecting;}).observe($("view"));
  new IntersectionObserver(function(es){hotVis=es[0].isIntersecting;}).observe(photo);
}
