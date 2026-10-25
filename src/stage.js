/* ---------- холсты ---------- */
function mkCanvas(id,boxId){
  var cv=$(id), box=boxId?$(boxId):cv;
  var o={cv:cv,ctx:cv.getContext("2d"),w:0,h:0};
  function fit(){
    var r=box.getBoundingClientRect(), dpr=Math.min(2,window.devicePixelRatio||1);
    o.w=r.width; o.h=r.height;
    cv.width=Math.max(1,Math.round(r.width*dpr)); cv.height=Math.max(1,Math.round(r.height*dpr));
    o.ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  o.fit=fit; fit();
  if(window.ResizeObserver){new ResizeObserver(fit).observe(box);} else window.addEventListener("resize",fit);
  return o;
}
var SC=mkCanvas("stage","view"), CC=mkCanvas("cam","camBox");

function proj(x,y){
  var w=SC.w,h=SC.h,hy=h*0.43;
  var s=0.5+0.62*y;
  return {x:w/2+(x-0.5)*w*(0.62+0.3*y), y:hy+(h*0.9-hy)*(0.1+0.9*y), s:s, H:Math.min(h*0.3,w*0.5)*s};
}
var motes=[];
for(var mi=0;mi<46;mi++) motes.push({x:Math.random(),y:Math.random(),v:0.01+Math.random()*0.03,r:0.6+Math.random()*1.4});
var sparks=[];
var hov=-1;

function drawStage(now){
  var ctx=SC.ctx,w=SC.w,h=SC.h; if(!w)return;
  var tm=now/1000, cs=sim.cells, i, j, c, g, hy=h*0.43;
  var live=0,canc=0; for(i=0;i<cs.length;i++){if(cs[i].type==="cancer")canc++; if(isLive(cs[i]))live++;}
  var glow=mix(HEALTHY,CANCER,live?canc/live:0);
  /* задняя стена */
  g=ctx.createLinearGradient(0,0,0,hy); g.addColorStop(0,"#08070a"); g.addColorStop(1,"#15111a");
  ctx.fillStyle=g; ctx.fillRect(0,0,w,hy);
  g=ctx.createRadialGradient(w/2,hy,0,w/2,hy,w*0.55);
  g.addColorStop(0,rgba(glow,0.34)); g.addColorStop(1,rgba(glow,0));
  ctx.fillStyle=g; ctx.fillRect(0,0,w,hy+2);
  /* пол */
  g=ctx.createLinearGradient(0,hy,0,h); g.addColorStop(0,"#17131a"); g.addColorStop(1,"#0b090c");
  ctx.fillStyle=g; ctx.fillRect(0,hy,w,h-hy);
  ctx.strokeStyle="rgba(241,231,216,0.05)"; ctx.lineWidth=1; ctx.beginPath();
  for(i=-14;i<=14;i++){ctx.moveTo(w/2+i*w*0.034,hy);ctx.lineTo(w/2+i*w*0.11,h);}
  for(i=1;i<14;i++){var yy=hy+(h-hy)*Math.pow(i/14,1.7);ctx.moveTo(0,yy);ctx.lineTo(w,yy);}
  ctx.stroke();
  g=ctx.createRadialGradient(w/2,hy+(h-hy)*0.55,10,w/2,hy+(h-hy)*0.55,w*0.5);
  g.addColorStop(0,rgba(glow,0.17)); g.addColorStop(1,rgba(glow,0));
  ctx.save(); ctx.translate(0,hy+(h-hy)*0.55); ctx.scale(1,0.38); ctx.translate(0,-(hy+(h-hy)*0.55));
  ctx.fillStyle=g; ctx.fillRect(0,0,w,h*2.4); ctx.restore();
  /* порядок: дальние сначала */
  var order=cs.slice().sort(function(a,b){return a.y-b.y;});
  var P=[]; for(i=0;i<cs.length;i++) P[i]=proj(cs[i].x,cs[i].y);
  /* лучи */
  ctx.globalCompositeOperation="lighter";
  for(i=0;i<cs.length;i++){
    c=cs[i]; if(c.type==="dead")continue;
    var p=P[i], wid=p.H*(i===sel?0.55:0.4);
    g=ctx.createLinearGradient(0,0,0,p.y);
    g.addColorStop(0,rgba(c.rgb,0)); g.addColorStop(1,rgba(c.rgb,i===sel?0.2:0.11));
    ctx.fillStyle=g; ctx.beginPath(); ctx.moveTo(p.x+(w/2-p.x)*0.08-6,0); ctx.lineTo(p.x+(w/2-p.x)*0.08+6,0); ctx.lineTo(p.x+wid,p.y+4); ctx.lineTo(p.x-wid,p.y+4); ctx.closePath(); ctx.fill();
  }
  ctx.globalCompositeOperation="source-over";
  /* пылинки */
  ctx.fillStyle="rgba(241,231,216,0.35)";
  for(i=0;i<motes.length;i++){var m=motes[i]; m.y+=m.v*0.016*(running?1:0.2); if(m.y>1)m.y=0;
    ctx.globalAlpha=0.25+0.3*Math.sin(tm+i); ctx.beginPath(); ctx.arc(m.x*w+Math.sin(tm*0.4+i)*8,m.y*h*0.9,m.r,0,6.283); ctx.fill();}
  ctx.globalAlpha=1;
  /* актёры */
  for(var oi=0;oi<order.length;oi++){ c=order[oi]; figure(ctx,c,P[c.i],tm); }
  /* искры холода */
  for(i=sparks.length-1;i>=0;i--){var sp=sparks[i]; sp.l-=0.016; sp.x+=sp.vx; sp.y+=sp.vy; if(sp.l<=0){sparks.splice(i,1);continue;}
    ctx.fillStyle="rgba(190,230,255,"+(sp.l*0.9)+")"; ctx.beginPath(); ctx.arc(sp.x,sp.y,1.4,0,6.283); ctx.fill();}
  /* виньетка */
  g=ctx.createRadialGradient(w/2,h*0.55,h*0.3,w/2,h*0.55,w*0.75);
  g.addColorStop(0,"rgba(0,0,0,0)"); g.addColorStop(1,"rgba(0,0,0,0.55)");
  ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
}

function figure(ctx,c,p,tm){
  var H=p.H, i=c.i, isSel=i===sel;
  var tilt=c.type==="dying"?clamp(c.dy/DYING,0,1)*1.5:(c.type==="dead"?1.5:0);
  tilt*=(i%2?1:-1);
  var mv=(c.type==="healthy"||c.type==="cancer")?1:(c.type==="dying"?0.25:0);
  var sw=Math.sin(c.phase)*mv, bob=Math.abs(Math.sin(c.phase))*0.015*mv;
  /* тень */
  ctx.fillStyle="rgba(0,0,0,0.5)"; ctx.beginPath(); ctx.ellipse(p.x,p.y+2,H*0.22,H*0.05,0,0,6.283); ctx.fill();
  if(isSel||i===hov){
    ctx.strokeStyle=isSel?"rgba(217,179,106,0.95)":"rgba(241,231,216,0.45)"; ctx.lineWidth=1.5; ctx.setLineDash([5,5]); ctx.lineDashOffset=-tm*10;
    ctx.beginPath(); ctx.ellipse(p.x,p.y+2,H*0.34,H*0.085,0,0,6.283); ctx.stroke(); ctx.setLineDash([]);
  }
  var heat=clamp((c.temp-T_SKIN)/8,0,1);
  if(heat>0.05){
    var hg=ctx.createRadialGradient(p.x,p.y-H*0.55,0,p.x,p.y-H*0.55,H*0.55);
    hg.addColorStop(0,"rgba(255,138,61,"+(0.38*heat)+")"); hg.addColorStop(1,"rgba(255,138,61,0)");
    ctx.fillStyle=hg; ctx.beginPath(); ctx.arc(p.x,p.y-H*0.55,H*0.55,0,6.283); ctx.fill();
  }
  if(c.vib>0.08&&c.type!=="dead"){
    ctx.lineWidth=1.2;
    for(var w=0;w<2;w++){
      var ph=((tm*1.6+w*0.5)%1);
      ctx.strokeStyle="rgba(241,231,216,"+(0.55*c.vib*(1-ph))+")";
      ctx.beginPath(); ctx.ellipse(p.x,p.y-H*0.6,H*(0.2+0.22*ph),H*(0.32+0.2*ph),0,0,6.283); ctx.stroke();
    }
  }
  ctx.save(); ctx.translate(p.x+(c.vib>0.4?(Math.random()-0.5)*H*0.018*c.vib:0),p.y-bob*H); ctx.rotate(tilt);
  function X(v){return v*H;} function Y(v){return -v*H;}
  var g, col=rgbStr(c.rgb), light=rgbStr(mix(c.rgb,[255,255,255],0.3));
  ctx.shadowColor=rgba(c.rgb,0.8); ctx.shadowBlur=c.type==="dead"?4:H*0.14;
  ctx.lineCap="round"; ctx.lineJoin="round"; ctx.strokeStyle=col; ctx.fillStyle=col;
  /* ноги */
  ctx.lineWidth=H*0.075; ctx.beginPath();
  ctx.moveTo(X(-0.05),Y(0.48)); ctx.lineTo(X(-0.07+0.07*sw),Y(0.24)); ctx.lineTo(X(-0.07+0.1*sw),Y(0.02));
  ctx.moveTo(X(0.05),Y(0.48)); ctx.lineTo(X(0.07-0.07*sw),Y(0.24)); ctx.lineTo(X(0.07-0.1*sw),Y(0.02));
  ctx.stroke();
  /* руки */
  ctx.lineWidth=H*0.055; ctx.beginPath();
  ctx.moveTo(X(-0.12),Y(0.77)); ctx.lineTo(X(-0.17-0.04*sw),Y(0.6)); ctx.lineTo(X(-0.17+0.07*sw),Y(0.45));
  ctx.moveTo(X(0.12),Y(0.77)); ctx.lineTo(X(0.17+0.04*sw),Y(0.6)); ctx.lineTo(X(0.17-0.07*sw),Y(0.45));
  ctx.stroke();
  /* торс */
  g=ctx.createLinearGradient(0,Y(0.8),0,Y(0.46)); g.addColorStop(0,light); g.addColorStop(1,col);
  ctx.fillStyle=g; ctx.beginPath();
  ctx.moveTo(X(-0.14),Y(0.78)); ctx.lineTo(X(0.14),Y(0.78)); ctx.lineTo(X(0.095),Y(0.46)); ctx.lineTo(X(-0.095),Y(0.46)); ctx.closePath(); ctx.fill();
  ctx.shadowBlur=0;
  /* голова */
  ctx.fillStyle=light; ctx.beginPath(); ctx.arc(0,Y(0.89),H*0.065,0,6.283); ctx.fill();
  /* шов и экран температуры */
  ctx.strokeStyle="rgba(255,255,255,0.35)"; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(0,Y(0.78)); ctx.lineTo(0,Y(0.47)); ctx.stroke();
  ctx.fillStyle=tempColor(c.temp); ctx.strokeStyle="rgba(255,255,255,0.7)"; ctx.lineWidth=1;
  ctx.beginPath(); ctx.roundRect?ctx.roundRect(X(-0.05),Y(0.72),X(0.1),H*0.1,H*0.02):ctx.rect(X(-0.05),Y(0.72),X(0.1),H*0.1); ctx.fill(); ctx.stroke();
  ctx.restore();
  if(c.temp<27&&c.type!=="dead"&&Math.random()<0.3*clamp((28-c.temp)/6,0,1)) sparks.push({x:p.x+(Math.random()-0.5)*H*0.3,y:p.y-H*(0.3+Math.random()*0.6),vx:(Math.random()-0.5)*0.4,vy:0.5+Math.random()*0.6,l:1});
  /* подпись */
  if(c.type!=="dead"||isSel){
    ctx.font=(isSel?"600 13px ":"400 11px ")+FONT; ctx.textAlign="center";
    ctx.fillStyle=isSel?"#d9b36a":"rgba(241,231,216,0.7)";
    ctx.fillText(c.name,p.x,p.y-H*(tilt?0.25:1.0)-4);
  }
}

function drawFigureCam(ctx,c,w,h){
  var cx=c.x*w, fy=h*(0.45+0.48*c.y), hh=h*(0.2+0.26*c.y);
  var k=c.type==="dead"?0.5:(c.type==="dying"?1-0.5*clamp(c.dy/DYING,0,1):1);
  var mv=(c.type==="healthy"||c.type==="cancer")?1:(c.type==="dying"?0.2:0);
  var sw=Math.sin(c.phase)*mv;
  function P(dx,df){return [cx+dx*hh,fy-df*hh*k];}
  var head=P(0,0.92),neck=P(0,0.82),sL=P(-0.13,0.78),sR=P(0.13,0.78);
  var eL=P(-0.16-0.02*sw,0.62),eR=P(0.16+0.02*sw,0.62),wL=P(-0.14+0.07*sw,0.46),wR=P(0.14-0.07*sw,0.46);
  var hL=P(-0.07,0.5),hR=P(0.07,0.5),kL=P(-0.08+0.05*sw,0.27),kR=P(0.08-0.05*sw,0.27),aL=P(-0.08+0.09*sw,0),aR=P(0.08-0.09*sw,0);
  var pts=[head,neck,sL,sR,eL,eR,wL,wR,hL,hR,kL,kR,aL,aR], dim=c.type==="dead"?0.45:1;
  ctx.fillStyle=rgba(c.rgb,0.4*dim); ctx.beginPath(); ctx.moveTo(sL[0],sL[1]); ctx.lineTo(sR[0],sR[1]); ctx.lineTo(hR[0],hR[1]); ctx.lineTo(hL[0],hL[1]); ctx.closePath(); ctx.fill();
  var bones=[[neck,sL],[neck,sR],[sL,eL],[eL,wL],[sR,eR],[eR,wR],[sL,hL],[sR,hR],[hL,hR],[hL,kL],[kL,aL],[hR,kR],[kR,aR],[head,neck]];
  ctx.strokeStyle="rgba(169,188,255,"+(0.9*dim)+")"; ctx.lineWidth=1.6; ctx.beginPath();
  for(var i=0;i<bones.length;i++){ctx.moveTo(bones[i][0][0],bones[i][0][1]);ctx.lineTo(bones[i][1][0],bones[i][1][1]);}
  ctx.stroke(); ctx.beginPath(); ctx.arc(head[0],head[1],hh*0.065,0,6.283); ctx.stroke();
  ctx.fillStyle="rgba(220,230,255,"+dim+")";
  for(i=2;i<pts.length;i++){ctx.beginPath();ctx.arc(pts[i][0],pts[i][1],1.9,0,6.283);ctx.fill();}
  var minx=1e9,maxx=-1e9,miny=1e9,maxy=-1e9;
  for(i=0;i<pts.length;i++){minx=Math.min(minx,pts[i][0]);maxx=Math.max(maxx,pts[i][0]);miny=Math.min(miny,pts[i][1]);maxy=Math.max(maxy,pts[i][1]);}
  miny-=hh*0.08; ctx.setLineDash([3,3]); ctx.strokeStyle=(c.i===sel)?"rgba(217,179,106,0.95)":"rgba(125,255,178,0.5)"; ctx.lineWidth=1;
  ctx.strokeRect(minx-5,miny,maxx-minx+10,maxy-miny+4); ctx.setLineDash([]);
  ctx.fillStyle="rgba(125,255,178,0.9)"; ctx.font="9px "+FONT; ctx.textAlign="left"; ctx.fillText(c.name,minx-5,miny-3);
}
function drawCam(){
  var ctx=CC.ctx,w=CC.w,h=CC.h; if(!w)return;
  ctx.fillStyle="#07080c"; ctx.fillRect(0,0,w,h);
  var g=ctx.createLinearGradient(0,h*0.45,0,h); g.addColorStop(0,"#0e1016"); g.addColorStop(1,"#171a24");
  ctx.fillStyle=g; ctx.fillRect(0,h*0.45,w,h*0.55);
  var order=sim.cells.slice().sort(function(a,b){return a.y-b.y;});
  for(var i=0;i<order.length;i++) drawFigureCam(ctx,order[i],w,h);
  ctx.fillStyle="rgba(255,255,255,0.7)"; ctx.font="9px "+FONT; ctx.textAlign="left"; ctx.fillText("КАМЕРА · 30 к/с",8,13);
  ctx.fillStyle="#ff4d4d"; ctx.beginPath(); ctx.arc(w-12,10,3,0,6.283); ctx.fill();
}
