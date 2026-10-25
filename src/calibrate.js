/* Калибровка подписей сценариев: node src/calibrate.js
   Гоняет симуляции с замороженным сценарием и печатает средние и разброс признаков за окно. */
var fs=require('fs'),vm=require('vm'),path=require('path');
var ctx={document:{getElementById:function(){return null;}},Math:Math,console:console};
vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(__dirname,'model.js'),'utf8'),ctx);
var mode=process.argv[2]||'sig', R=+(process.argv[3]||400);
function run(seed,scn,freeze){
  if(freeze){ctx.FIRST_FORK=1e9;ctx.FORK_EVERY=1e9;ctx.MIN_HOLD=1e9;}
  ctx.newRun(seed,scn); var S=ctx.sim, out=[], next=10;
  while(!S.ended){ ctx.step(0.05); S=ctx.sim; if(S.t>=next){ next+=1; if(S.mutated) out.push({f:ctx.features(),m:Object.assign({},S.match),cur:S.scn.id}); } }
  return {s:out,S:S};
}
if(mode==='sig'){
  ctx.SCN.forEach(function(sc){
    var acc={}; ['mut','kill','dev','share','spread','speed'].forEach(function(k){acc[k]=[];});
    for(var r=0;r<R;r++){ run(1000+r,sc,true).s.forEach(function(o){for(var k in acc)acc[k].push(o.f[k]);}); }
    var line=sc.id+': ';
    for(var k in acc){var a=acc[k],m=a.reduce((x,y)=>x+y,0)/a.length,sd=Math.sqrt(a.reduce((x,y)=>x+(y-m)*(y-m),0)/a.length);line+=k+':['+m.toFixed(2)+','+Math.max(0.15,sd).toFixed(2)+'] ';}
    console.log(line);
  });
}else if(mode==='acc'){
  ctx.SCN.forEach(function(sc){
    var hit=0,n=0; for(var r=0;r<R;r++){ run(5000+r,sc,true).s.forEach(function(o){ if(o.f&&ctx.sim){ var b=null,bv=-1; for(var k in o.m) if(o.m[k]>bv){bv=o.m[k];b=k;} n++; if(b===sc.id)hit++; } }); }
    console.log(sc.id,'top-1 совпадение верно в',(100*hit/n).toFixed(0)+'% замеров');
  });
}else{
  var fin={},forks=0,early=0,chg=0,len=0,ns=0;
  for(var r=0;r<R;r++){ ctx.newRun(9000+r); var S=ctx.sim; while(!S.ended){ctx.step(0.05);S=ctx.sim;} fin[S.outcome]=(fin[S.outcome]||0)+1; forks+=S.forks; chg+=S.history.length-1; len+=S.t; }
  console.log('финалы',fin,'развилок в среднем',(forks/R).toFixed(1),'смен сценария',(chg/R).toFixed(1),'длина сцены, с',(len/R).toFixed(0));
}
