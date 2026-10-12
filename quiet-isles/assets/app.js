/* 静屿 QUIET ISLES — 应用层
   状态 / 缩略图 / 页面路由 / 场景播放 / 生命图鉴
   依赖：engine.js（引擎）、audio.js（音景）、scenes.js（场景与 SCENES） */

var APP={worlds:{},cams:{},curId:null,cur:null,curIdx:0,t:0,last:0,mode:'idle',
  moved:0,hover:-1,ready:false,state:null,nightMode:false};
var SAVEK='quiet-isles-v1';

function $(n){return document.getElementById(n);}
function el(tag,cls,html){var d=document.createElement(tag);if(cls)d.className=cls;if(html!==undefined)d.innerHTML=html;return d;}

/* ------------------------------ 存档 ------------------------------ */
function loadState(){
  try{var s=localStorage.getItem(SAVEK);APP.state=s?JSON.parse(s):null;}catch(e){APP.state=null;}
  if(!APP.state)APP.state={seen:{},tasks:{},muted:false,lit:{}};
  if(!APP.state.seen)APP.state.seen={};
  if(!APP.state.tasks)APP.state.tasks={};
  if(!APP.state.lit)APP.state.lit={};
}
function saveState(){try{localStorage.setItem(SAVEK,JSON.stringify(APP.state));}catch(e){}}
function sceneIndex(id){for(var i=0;i<SCENES.length;i++)if(SCENES[i].id===id)return i;return 0;}

/* ------------------------------ 世界 ------------------------------ */
function buildWorld(i){
  if(APP.worlds[i])return APP.worlds[i];
  var w=new World();
  SCENES[i].build(w);
  w.sid=SCENES[i].id;
  if(w.task&&w.task.count===undefined)w.task.count=0;
  APP.worlds[i]=w;
  var cam=new Camera(SCENES[i].cam);
  cam.d0=52;
  APP.cams[i]=cam;
  return w;
}
function applyLight(w,forceNight){
  if(!w._base){
    w._base={sun:w.sun.slice(),amb:w.amb,bg:[w.bg[0].slice(),w.bg[1].slice()],haze:w.haze.slice()};
    w._baseNight=!!w.night;
  }
  var b=w._base, night=(forceNight===undefined)?APP.nightMode:forceNight;
  if(night){
    w.sun=[-0.44,0.72,0.52];
    w.amb=b.amb*0.60;
    w.bg=[mix(b.bg[0],C('#15263E'),b.night?0.35:0.84),mix(b.bg[1],C('#33536F'),b.night?0.3:0.66)];
    w.haze=mix(b.haze,C('#2C4864'),b.night?0.3:0.7);
    w.hazeK=b.night?0.30:0.24;
    w.night=true;
  }else{
    w.sun=b.night?[0.46,0.80,0.40]:b.sun.slice();
    w.amb=b.night?0.52:b.amb;
    w.bg=[b.bg[0].slice(),b.bg[1].slice()];
    w.haze=b.haze.slice();
    w.hazeK=b.night?0.20:0.24;
    w.night=false;
  }
}

/* ------------------------------ 天空 / 缩略图 ------------------------------ */
function drawSky(ctx,w,W,H){
  var g=ctx.createLinearGradient(0,0,0,H);
  var top=w.bg[0],bot=w.bg[1];
  g.addColorStop(0,hex(top));
  g.addColorStop(0.50,hex(mix(top,bot,0.40)));
  g.addColorStop(0.78,hex(mix(bot,C('#FFFFFF'),w.night?0.03:0.16)));
  g.addColorStop(1,hex(bot));
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  if(w.night){
    var rr=rng(99),i;
    for(i=0;i<70;i++){
      var x=rr()*W,y=rr()*H*0.62,r=rr()*1.3+0.4;
      ctx.globalAlpha=0.22+rr()*0.6;
      ctx.fillStyle='#FFFFFF';
      ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();
    }
    ctx.globalAlpha=1;
    ctx.globalCompositeOperation='lighter';
    ctx.drawImage(glowSprite(C('#FFF6D8')),W*0.2-100,H*0.15-100,200,200);
    ctx.globalCompositeOperation='source-over';
  }else{
    var sx=w.sun[0]>0?W*0.15:W*0.85;
    ctx.globalCompositeOperation='lighter';
    ctx.globalAlpha=0.18;
    ctx.drawImage(glowSprite(C('#FFF4DC')),sx-300,H*0.06-300,600,600);
    ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  }
}
/* 把某个场景画进一张画布（用于卡片缩略图 / 首页大图） */
function renderThumbTo(cv,i,dyaw,night){
  if(!cv)return;
  var s=SCENES[i], w;
  try{w=buildWorld(i);}catch(e){if(window.console)console.warn('build '+s.id+': '+e.message);return;}
  var wasNight=w.night;
  if(night!==undefined&&night!==wasNight)applyLight(w,night); else if(night!==undefined)applyLight(w,night);
  var rect=cv.getBoundingClientRect();
  var dpr2=Math.min(window.devicePixelRatio||1,2);
  var W=Math.max(120,Math.round((rect.width||320)*dpr2)),H=Math.max(100,Math.round((rect.height||220)*dpr2));
  if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;}
  var ctx=cv.getContext('2d');
  var cam=new Camera(s.cam);
  cam.yaw=s.cam.yaw+(dyaw||0);
  cam.pitch=s.cam.pitch;
  cam.baseScale=fitScale(W,H,w.radius);
  cam.oy=H*0.05;cam.zoom=1;cam.aYaw=cam.yaw;cam.aZoom=1;
  cam.update(1,true);
  cam.scale=cam.baseScale;
  ctx.setTransform(1,0,0,1,0,0);
  ctx.clearRect(0,0,W,H);
  drawSky(ctx,w,W,H);
  renderWorld(w,cam,ctx,W,H,APP.t);
  if(night!==undefined)applyLight(w,APP.nightMode);
}

/* ------------------------------ 进度统计 ------------------------------ */
function petStats(){
  var total=0,got=0;
  for(var k=0;k<SCENES.length;k++){
    var s=SCENES[k],w=APP.worlds[k],seen={};
    if(!w)continue;
    for(var j=0;j<w.picks.length;j++){
      var pk=w.picks[j];
      if(pk.kind!=='pet')continue;
      if(seen[pk.pet.en])continue;seen[pk.pet.en]=1;
      total++;
      if(APP.state.seen[s.id+':'+pk.pet.en])got++;
    }
  }
  return {got:got,total:total};
}
function taskStats(){
  var n=0;
  for(var i=0;i<SCENES.length;i++)if(APP.state.tasks[SCENES[i].id])n++;
  return {got:n,total:SCENES.length};
}
/* 填充页面上所有 data-stat 占位 */
function refreshStats(){
  var p=petStats(),t=taskStats();
  var nodes=document.querySelectorAll('[data-stat]');
  for(var i=0;i<nodes.length;i++){
    var k=nodes[i].getAttribute('data-stat');
    if(k==='pets')nodes[i].textContent=p.got+' / '+p.total;
    else if(k==='tasks')nodes[i].textContent=t.got+' / '+t.total;
    else if(k==='petsGot')nodes[i].textContent=p.got;
    else if(k==='petsMax')nodes[i].textContent=p.total;
    else if(k==='tasksGot')nodes[i].textContent=t.got;
    else if(k==='tasksMax')nodes[i].textContent=t.total;
  }
}
function ensureAllWorlds(){for(var i=0;i<SCENES.length;i++){try{buildWorld(i);}catch(e){if(window.console)console.warn('world '+i+': '+e.message);}}}

/* ------------------------------ 导航高亮 ------------------------------ */
function markNav(){
  var here=(location.pathname.split('/').pop()||'index.html')||'index.html';
  var as=document.querySelectorAll('[data-nav]');
  for(var i=0;i<as.length;i++){
    var v=as[i].getAttribute('data-nav');
    var on=(v===here)||(v==='scenes.html'&&here.indexOf('scene-')===0);
    as[i].classList.toggle('on',on);
  }
}

/* 淡出启动遮罩 */
function hideBoot(){
  var b=$('boot');if(!b||b._gone)return;b._gone=1;
  b.style.opacity='0';
  setTimeout(function(){b.classList.add('hidden');},700);
}

/* ------------------------------ 提示 ------------------------------ */
var _tt;
function toast(node,msg){
  var t=node||$('toast');
  if(!t)return;
  t.textContent=msg;t.classList.add('show');
  clearTimeout(_tt);_tt=setTimeout(function(){t.classList.remove('show');},4200);
}

/* ==========================================================================
   页面：场景播放
   ========================================================================== */
var cv,ctx,W=1,H=1;
function initPlayer(){
  var sid=document.body.getAttribute('data-scene')||SCENES[0].id;
  var idx=sceneIndex(sid);
  APP.curIdx=idx;APP.curId=SCENES[idx].id;APP.cur=buildWorld(idx);APP.mode='stage';

  var els={};
  els.petcard=$('petcard');els.pc_k=$('pc-k');els.pc_n=$('pc-n');els.pc_e=$('pc-e');els.pc_d=$('pc-d');els.pc_b=$('pc-b');
  els.taskbar=$('taskbar');els.tk_t=$('tk-t');els.tk_s=$('tk-s');els.tk_b=$('tk-b');
  els.hint=$('hint');els.journal=$('journal');els.jgrid=$('jgrid');els.j_sc=$('j-sc');
  els.icoDay=$('icoDay');els.icoSound=$('icoSound');els.btnOrbit=$('btnOrbit');els.toast=$('toast');
  els.cv=cv=$('cv');ctx=cv.getContext('2d');

  /* 场景信息（含前后页链接） */
  var s=SCENES[idx];
  document.title=s.cn+' · '+s.en+' — 静屿 QUIET ISLES';
  if($('sl-k'))$('sl-k').textContent=s.no+' / '+s.en;
  if($('sl-n'))$('sl-n').textContent=s.cn;
  if($('sl-s'))$('sl-s').textContent=s.sub;
  if($('scene-desc'))$('scene-desc').innerHTML='<b>'+s.no+' '+s.cn+' · '+(s.mood||'')+'</b><br>'+s.desc;
  var prev=SCENES[(idx-1+SCENES.length)%SCENES.length], next=SCENES[(idx+1)%SCENES.length];
  if($('btnPrev')){var bp=$('btnPrev');bp.href='scene-'+prev.id+'.html';bp.title='上一个：'+prev.cn;}
  if($('btnNext')){var bn=$('btnNext');bn.href='scene-'+next.id+'.html';bn.title='下一个：'+next.cn;}
  if($('btnPrevT'))$('btnPrevT').textContent='← '+prev.cn;
  if($('btnNextT'))$('btnNextT').textContent=next.cn+' →';

  var cam=APP.cams[idx];
  cam.autoOrbit=false;
  if(els.btnOrbit)els.btnOrbit.classList.remove('on');

  APP.nightMode=(APP.cur._baseNight===undefined?(APP.cur._baseNight=!!APP.cur.night):APP.cur._baseNight);
  applyLight(APP.cur);
  if(els.icoDay)els.icoDay.textContent=APP.nightMode?'☀️':'🌙';

  resizeStage();
  cam.aYaw=cam.yaw=s.cam.yaw;cam.aPitch=cam.pitch=s.cam.pitch;cam.aZoom=1;cam.zoom=1;
  updateTaskBar();
  if(els.hint){els.hint.style.opacity='1';setTimeout(function(){els.hint.style.opacity='0';},7000);}

  /* 音景 */
  if(!AU.ok){AU.init();AU.vol(0.9,1.5);}else AU.vol(0.9,1.0);
  AU.playScene(s.amb);
  if(els.icoSound)els.icoSound.textContent=APP.state.muted?'🔇':'🔈';
  AU.muted=!!APP.state.muted;
  AU.vol(AU.muted?0:0.9,0.6);
  APP.state.last=SCENES[idx].id;
  saveState();

  /* 交互 */
  bindInput();

  /* 工具条 */
  if($('btnSound'))$('btnSound').addEventListener('click',function(){
    if(!AU.ok)AU.init();
    APP.state.muted=!APP.state.muted;AU.muted=APP.state.muted;saveState();
    els.icoSound.textContent=AU.muted?'🔇':'🔈';
    AU.vol(AU.muted?0:0.9,0.5);
    if(!AU.muted)AU.playScene(SCENES[APP.curIdx].amb);
  });
  if($('btnDay'))$('btnDay').addEventListener('click',function(){
    APP.nightMode=!APP.nightMode;
    applyLight(APP.cur);
    els.icoDay.textContent=APP.nightMode?'☀️':'🌙';
    AU.blip(APP.nightMode?520:660,0.05);
  });
  if($('btnOrbit'))$('btnOrbit').addEventListener('click',function(){
    var c=APP.cams[APP.curIdx];c.autoOrbit=!c.autoOrbit;
    this.classList.toggle('on',c.autoOrbit);
  });
  if($('btnReset'))$('btnReset').addEventListener('click',resetView);
  if($('btnBook'))$('btnBook').addEventListener('click',openJournal);
  if($('btnBookClose'))$('btnBookClose').addEventListener('click',function(){els.journal.classList.remove('show');});

  window.addEventListener('keydown',function(e){
    if(e.key==='ArrowRight')location.href='scene-'+next.id+'.html';
    else if(e.key==='ArrowLeft')location.href='scene-'+prev.id+'.html';
    else if(e.key==='r'||e.key==='R')resetView();
  });
  window.addEventListener('resize',function(){resizeStage();});

  els.toast.offsetHeight;
  function loop(ts){
    var dt=Math.min(0.05,(ts-APP.last)/1000||0.016);APP.last=ts;
    APP.t+=dt;
    if(APP.mode==='stage'&&APP.cur){
      var c=APP.cams[APP.curIdx];
      if(c.autoOrbit)c.aYaw+=dt*0.11;
      c.baseScale=fitScale(W,H,APP.cur.radius);
      c.update(dt);
      drawSky(ctx,APP.cur,W,H);
      renderWorld(APP.cur,c,ctx,W,H,APP.t);
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
function resizeStage(){
  if(!cv)return;
  var dpr=Math.min(window.devicePixelRatio||1,2);
  W=cv.clientWidth||window.innerWidth;H=cv.clientHeight||window.innerHeight;
  cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  var cam=APP.cams[APP.curIdx];
  if(cam&&APP.cur)cam.baseScale=fitScale(W,H,APP.cur.radius);
}
function hitTest(mx,my){
  var w=APP.cur;if(!w)return null;
  var best=null,bs=1e9,i;
  for(i=0;i<w.picks.length;i++){
    var p=w.picks[i];
    if(p.done)continue;
    if(p.part&&p.part.skip)continue;
    if(p.sr<=3)continue;
    var dx=mx-p.sx,dy=my-p.sy,d=Math.sqrt(dx*dx+dy*dy);
    if(d>p.sr*1.2)continue;
    var sc=d/Math.max(7,p.sr);
    if(sc<bs){bs=sc;best=p;}
  }
  return best;
}
function petKey(p){return APP.curId+':'+p.en;}
function onPick(p){
  var w=APP.cur;if(!p||!w)return;
  if(p.kind==='pet'){
    AU.tap();if(p.hop)p.hop.v=1;
    var key=petKey(p.pet),isNew=!APP.state.seen[key];
    if(isNew){APP.state.seen[key]=1;saveState();AU.chime();}
    showPet(p.pet,isNew);
    return;
  }
  if(p.kind==='task'){
    p.done=true;if(p.on)p.on();
    AU.pop();puff(p.get()[0],p.get()[1],p.get()[2]);
    tick(w);
    return;
  }
  if(p.kind==='lamp'){
    var L=p.part;
    if(L.data.lit)return;
    L.data.lit=true;p.done=true;
    L.tint=[1.22,1.10,0.88];
    var gl=w.sprite({p:[L.x,L.y+0.5,L.z],r:0.72,col:C('#FFD79A'),a:0.0});
    var ph=Math.random()*6;
    gl.anim=function(t){gl.a=0.5*(0.82+0.18*Math.sin(t*2.1+ph));gl.r=0.72+0.05*Math.sin(t*1.7+ph);};
    AU.chime();tick(w);
    return;
  }
  if(p.kind==='lamp2'){
    if(p.lamp.lit)return;
    p.done=true;if(p.on)p.on();
    AU.chime();tick(w);
    return;
  }
  if(p.kind==='fly'){
    if(p.done)return;
    p.done=true;if(p.on)p.on();
    AU.blip(880,0.08);AU.blip(1320,0.06);
    tick(w);
    return;
  }
  if(p.kind==='gate'){
    if(p.done)return;
    p.done=true;if(p.on)p.on();
    AU.note(260,0.5,'sine',0.07,0,90);
    AU.blip(660,0.06,0.3);
    tick(w);
    return;
  }
}
function puff(x,y,z){
  var w=APP.cur;
  for(var i=0;i<5;i++){
    var s=w.sprite({p:[x,y,z],r:0.16,col:C('#FFFFFF'),a:0.7,shape:'soft'});
    var a=Math.random()*TAU,rr=0.6+Math.random()*0.6,ph=Math.random()*3;
    (function(s,a,rr,ph){
      var y0=y,z0=z,x0=x;
      s.anim=function(t){
        var u=(t*1.1+ph)%1;
        s.p[0]=x0+Math.cos(a)*u*rr;
        s.p[1]=y0+u*0.6;
        s.p[2]=z0+Math.sin(a)*u*rr;
        s.a=0.66*(1-u);
        s.r=0.12+u*0.3;
      };
    })(s,a,rr,ph);
    w.sprites.push(s);
  }
}
function tick(w){
  var t=w.task;if(!t)return;
  t.count++;
  updateTaskBar();
  if(t.count>=t.total)taskDone(w);
}
function updateTaskBar(){
  var w=APP.cur,els={};
  if(!w||!w.task)return;
  var t=w.task;
  var tk_t=$('tk-t'),tk_s=$('tk-s'),tk_b=$('tk-b'),bar=$('taskbar');
  if(tk_t)tk_t.textContent=t.label;
  if(tk_s)tk_s.textContent=(t.count>=t.total)?t.done:t.sub;
  if(tk_b)tk_b.style.width=Math.round(t.count/t.total*100)+'%';
  if(bar)bar.classList.toggle('done',t.count>=t.total);
}
function taskDone(w){
  APP.state.tasks[w.sid]=1;saveState();
  toast($('toast'),'完成 —— '+w.task.done);
  AU.win();
  refreshStats();
  var i,k;
  if(w.sid==='snow'){
    w._smokeK=1.9;
    var cab=null;
    for(i=0;i<w.parts.length;i++)if(w.parts[i].tag==='house')cab=w.parts[i];
    if(cab&&cab.data&&cab.data.winPart)cab.data.winPart.alpha=0.75;
    for(i=0;i<w.sprites.length;i++){if(w.sprites[i].col&&w.sprites[i].col[0]===255&&w.sprites[i].shape==='soft')w.sprites[i].runtime=1;}
  }else if(w.sid==='tidal'){
    var rr=rng(7);
    for(k=0;k<7;k++){
      var a=rr()*TAU,d=rr()*1.3;
      var c2=[PAL.coral,PAL.plum,C('#F2B36B'),C('#8FD5C0')][k%4];
      var p=w.put(crystalGeo(0.24+rr()*0.22,c2,k),{x:0.1+Math.cos(a)*d,z:-0.5+Math.sin(a)*d,y:0.02});
      p.sy=0;p.anim=(function(p2,k2){return function(t){var u=Math.min(1,t*0.5+k2*0.12);p2.sy=u;p2.sx=u;p2.sz=u;};})(p,k);
    }
  }else if(w.sid==='grove'){
    for(k=0;k<8;k++){addFly(w,-3+Math.random()*6,0.7+Math.random()*1.1,-2.4+Math.random()*4.6,0.2);w.sprites[w.sprites.length-1].baseA=0.85;}
  }else if(w.sid==='pond'){
    for(k=0;k<6;k++)mote(w,{x:-3+Math.random()*6,y:0.8+Math.random()*1.6,z:-2+Math.random()*5,r:0.12,col:C('#FFF0B8'),a:0.8});
  }else if(w.sid==='terrace'){
    for(k=0;k<w.levels.length;k++)w.levels[k].alpha=0.72;
  }else if(w.sid==='isle'){
    for(k=0;k<w.lamps.length;k++)w.lamps[k].tint=[1.16,1.06,0.9];
  }else if(w.sid==='oasis'){
    /* 绿洲往外扩：多几丛花与光点 */
    for(k=0;k<12;k++){
      var ao=k/12*TAU+0.7;
      flower(w,Math.cos(ao)*4.4,Math.sin(ao)*4.1,0.28,C('#E8794F'),C('#FFE6A8'),960+k);
    }
    for(k=0;k<10;k++)mote(w,{x:-3.4+Math.random()*6.8,y:0.8+Math.random()*1.8,z:-3.4+Math.random()*6.8,r:0.12,col:C('#FFE9B0'),a:0.5});
  }else if(w.sid==='bamboo'){
    for(k=0;k<10;k++)mote(w,{x:-3+Math.random()*6,y:0.9+Math.random()*2.0,z:-3+Math.random()*6,r:0.12,col:C('#EFFAD0'),a:0.5});
    for(k=0;k<3;k++)addPet(w,{geo:mkButterfly(C('#E8D07A'),C('#B7C878'),{len:0.15}),
      x:-2.4+Math.random()*5,y:0.9+Math.random()*1.2,z:-2.4+Math.random()*5,r:0.26,
      name:'黄粉蝶',en:'Butterfly',desc:'只停在竹叶的背面，因为那里有它最喜欢的影子。',col:[232,208,122],amp:0.12,sp:1.8});
  }else if(w.sid==='roof'){
    for(k=0;k<8;k++){
      var px=-4+Math.random()*8, pz=-2+Math.random()*7;
      var s=w.sprite({p:[px,0.1,pz],r:0.42,col:C('#FFE0B0'),a:0.0,shape:'soft'});
      (function(s2){var ph=Math.random()*6;s2.anim=function(t){s2.a=0.34*(0.7+0.3*Math.sin(t*1.3+ph));};})(s);
    }
  }
}
function crystalGeo(s,col,seed){
  var rr=rng(seed||3),list=[],i;
  for(i=0;i<3;i++){
    var a=rr()*TAU,d=rr()*s*0.6;
    list.push(xf(prismGeo(5,s*(0.2+rr()*0.16),0.01,s*(1.0+rr()),col,{rot:rr()}),
      {dx:Math.cos(a)*d,dz:Math.sin(a)*d,rz:(rr()-0.5)*0.5,ry:a}));
  }
  return merge(list);
}
function showPet(pet,isNew){
  var pc=$('petcard');if(!pc)return;
  $('pc-k').textContent='MEET THE LOCALS';
  $('pc-n').textContent=pet.name;
  $('pc-e').textContent=pet.en;
  $('pc-d').textContent=pet.desc;
  var b=$('pc-b');b.className='b'+(isNew?'':' no');
  b.innerHTML=isNew?'<span>✓</span><span>刚记进生命图鉴</span>':'<span>✓</span><span>已经在图鉴里了</span>';
  pc.classList.add('show');
  refreshStats();
  clearTimeout(APP._pt);
  APP._pt=setTimeout(function(){pc.classList.remove('show');},6400);
}
/* ------------------------------ 图鉴（覆盖层 / 独立页共用） ------------------------------ */
function journalEntries(){
  var out=[];
  for(var k=0;k<SCENES.length;k++){
    var s=SCENES[k],w=APP.worlds[k];
    if(!w)continue;
    var seen={};
    for(var j=0;j<w.picks.length;j++){
      var pk=w.picks[j];
      if(pk.kind!=='pet')continue;
      if(seen[pk.pet.en])continue;seen[pk.pet.en]=1;
      out.push({scene:s,pet:pk.pet,has:!!APP.state.seen[s.id+':'+pk.pet.en]});
    }
  }
  return out;
}
function fillJournal(box,scEl){
  if(!box)return;
  ensureAllWorlds();
  var list=journalEntries(),got=0,i;
  box.innerHTML='';
  for(i=0;i<list.length;i++){
    var e=list[i];if(e.has)got++;
    var d=el('div','jitem'+(e.has?'':' lock'));
    d.innerHTML='<div class="jk">'+e.scene.no+' · '+e.scene.en+'</div>'+
      '<div class="jn">'+(e.has?e.pet.name:'？？？')+'<small>'+(e.has?e.pet.en:'Undiscovered')+'</small></div>'+
      '<div class="jd">'+(e.has?e.pet.desc:'去「'+e.scene.cn+'」里找到它，轻轻点一下就能记录下来。')+'</div>'+
      '<div class="sw"><i style="background:'+css(e.pet.col)+'"></i><i style="background:'+css(mix(e.pet.col,[255,255,255],0.45))+'"></i><i style="background:'+css(mix(e.pet.col,[30,60,60],0.35))+'"></i></div>';
    box.appendChild(d);
  }
  if(scEl)scEl.textContent='已记录 '+got+' / '+list.length;
  return {got:got,total:list.length};
}
function openJournal(){
  fillJournal($('jgrid'),$('j-sc'));
  var j=$('journal');if(j)j.classList.add('show');
}
/* ------------------------------ 输入 ------------------------------ */
function bindInput(){
  if(!cv)return;
  var ptrs={},n=0,pinch0=0,zoom0=1;
  var elbow=$('petcard');
  cv.addEventListener('pointerdown',function(e){
    try{cv.setPointerCapture(e.pointerId);}catch(err){}
    ptrs[e.pointerId]={x:e.clientX,y:e.clientY};
    n=Object.keys(ptrs).length;
    if(n===1){APP.moved=0;cv.classList.add('drag');}
    if(n===2){
      var ids=Object.keys(ptrs),a1=ptrs[ids[0]],b1=ptrs[ids[1]];
      pinch0=Math.hypot(a1.x-b1.x,a1.y-b1.y);zoom0=APP.cams[APP.curIdx].aZoom;
    }
    if(elbow)elbow.classList.remove('show');
  });
  cv.addEventListener('pointermove',function(e){
    var p=ptrs[e.pointerId];if(!p)return;
    var cam=APP.cams[APP.curIdx];if(!cam)return;
    var dx=e.clientX-p.x,dy=e.clientY-p.y;
    p.x=e.clientX;p.y=e.clientY;
    var ids=Object.keys(ptrs);
    if(ids.length>=2){
      var a1=ptrs[ids[0]],b1=ptrs[ids[1]];
      var d=Math.hypot(a1.x-b1.x,a1.y-b1.y);
      if(pinch0>0)cam.aZoom=clamp(zoom0*(d/pinch0),0.42,3.4);
      APP.moved+=99;
      return;
    }
    APP.moved+=Math.abs(dx)+Math.abs(dy);
    if(APP.moved>5){
      cam.aYaw-=dx*0.0075;
      cam.aPitch=clamp(cam.aPitch+dy*0.005,0.10,1.30);
      cam.autoOrbit=false;
      var ob=$('btnOrbit');if(ob)ob.classList.remove('on');
    }
  });
  function up(e){
    if(ptrs[e.pointerId]){
      delete ptrs[e.pointerId];n=Object.keys(ptrs).length;
      if(n===0){
        cv.classList.remove('drag');
        if(APP.moved<6){
          var r=cv.getBoundingClientRect();
          var p=hitTest(e.clientX-r.left,e.clientY-r.top);
          if(p)onPick(p);
        }
      }
    }
  }
  cv.addEventListener('pointerup',up);
  cv.addEventListener('pointercancel',up);
  cv.addEventListener('wheel',function(e){
    e.preventDefault();
    var cam=APP.cams[APP.curIdx];if(!cam)return;
    cam.aZoom=clamp(cam.aZoom*Math.exp(-e.deltaY*0.0011),0.42,3.4);
  },{passive:false});
  cv.addEventListener('dblclick',function(){resetView();});
}
function resetView(){
  var s=SCENES[APP.curIdx],cam=APP.cams[APP.curIdx];
  if(!s||!cam)return;
  cam.aYaw=s.cam.yaw;cam.aPitch=s.cam.pitch;cam.aZoom=1;
}

/* ==========================================================================
   页面：场景总览
   ========================================================================== */
function initScenes(){
  ensureAllWorlds();
  var g=$('grid');if(!g)return;
  g.innerHTML='';
  var i;
  for(i=0;i<SCENES.length;i++){
    (function(i){
      var s=SCENES[i];
      var card=el('a','card'+(APP.state.tasks[s.id]?' done-on':''));
      card.href='scene-'+s.id+'.html';
      card.style.setProperty('--accent',s.accent||'#F2604F');
      card.innerHTML='<div class="thumb"><canvas></canvas><span class="no">'+s.no+'</span>'+
        '<span class="done">已完成</span><span class="mood">'+(s.mood||'')+'</span></div>'+
        '<div class="body"><div class="en">'+s.en+'</div>'+
        '<div class="cn">'+s.cn+'</div>'+
        '<div class="desc">'+s.desc+'</div>'+
        '<div class="go"><span>进去看看</span><span>→</span></div></div>';
      card.addEventListener('mouseenter',function(){APP.hover=i;});
      card.addEventListener('mouseleave',function(){APP.hover=-1;renderThumbTo(card.querySelector('canvas'),i,0);});
      g.appendChild(card);
      var cvs=card.querySelector('canvas');
      /* 先铺一层天空，避免闪白 */
      (function(cvs,s){
        var rect=cvs.getBoundingClientRect();
        var W2=Math.max(120,Math.round(rect.width||320)),H2=Math.max(100,Math.round(rect.height||220));
        cvs.width=W2;cvs.height=H2;
      })(cvs,s);
      s._cv=cvs;
    })(i);
  }
  refreshStats();
  markNav();
  var n=0;
  (function step(){
    if(n>=SCENES.length){APP.ready=true;refreshStats();return;}
    var cvs=SCENES[n]._cv;
    try{renderThumbTo(cvs,n,0);}catch(e){if(window.console)console.warn('thumb '+n+': '+e.message);}
    n++;setTimeout(step,60);
  })();
  /* 悬停时轻微转动 */
  (function loopThumbs(ts){
    var dt=Math.min(0.05,(ts-APP.last)/1000||0.016);APP.last=ts;APP.t+=dt;
    if(APP.hover>=0&&APP.ready&&SCENES[APP.hover]._cv)
      renderThumbTo(SCENES[APP.hover]._cv,APP.hover,Math.sin(APP.t*0.30)*0.42);
    requestAnimationFrame(loopThumbs);
  })(0);
}

/* ==========================================================================
   页面：图鉴
   ========================================================================== */
function initJournal(){
  ensureAllWorlds();
  var res=fillJournal($('jgrid'),$('j-stat'));
  refreshStats();
  markNav();
  /* 场景筛选 */
  var bar=$('jfilter');
  if(bar){
    var all=el('button','chip on','全部');
    all.type='button';
    all.addEventListener('click',function(){filterAll();});
    bar.appendChild(all);
    var i;
    for(i=0;i<SCENES.length;i++){
      (function(s){
        var b=el('button','chip',s.no+' '+s.cn);b.type='button';
        b.addEventListener('click',function(){
          setOn(b);
          var jt=document.querySelectorAll('#jgrid .jitem');
          for(var k=0;k<jt.length;k++){
            var jk=jt[k].querySelector('.jk');
            jt[k].style.display=(jk&&jk.textContent.indexOf(s.en)>=0)?'':'none';
          }
        });
        bar.appendChild(b);
      })(SCENES[i]);
    }
    function setOn(node){
      var cs=bar.querySelectorAll('.chip');
      for(var k=0;k<cs.length;k++)cs[k].classList.remove('on');
      node.classList.add('on');
    }
    function filterAll(){
      setOn(all);
      var jt=document.querySelectorAll('#jgrid .jitem');
      for(var k=0;k<jt.length;k++)jt[k].style.display='';
    }
    all._on=true;
  }
  /* 未记录的提示 */
  if($('j-empty')&&res&&res.got===0)$('j-empty').classList.add('show');
}

/* ==========================================================================
   页面：首页
   ========================================================================== */
function initLanding(){
  markNav();
  /* 继续上次（如果玩过） */
  var bc=$('btnContinue');
  if(bc&&APP.state.last){
    var li=sceneIndex(APP.state.last);
    if(SCENES[li]&&SCENES[li].id===APP.state.last){
      bc.href='scene-'+APP.state.last+'.html';
      bc.textContent='继续逛 '+SCENES[li].cn+' →';
    }
  }
  /* 场景墙 */
  var wall=$('wall');
  if(wall){
    for(var i=0;i<SCENES.length;i++){
      (function(i){
        var s=SCENES[i];
        var a=el('a','tile'+(APP.state.tasks[s.id]?' done':''));
        a.href='scene-'+s.id+'.html';
        a.style.setProperty('--accent',s.accent||'#F2604F');
        a.innerHTML='<div class="tframe"><canvas></canvas></div>'+
          '<div class="tmeta"><span class="tno">'+s.no+'</span>'+
          '<span class="tcn">'+s.cn+'</span><span class="ten">'+s.en+'</span></div>';
        wall.appendChild(a);
        s._wcv=a.querySelector('canvas');
      })(i);
    }
  }
  /* 逐张渲染场景墙 */
  var n=0;
  (function step(){
    if(n>=SCENES.length){APP.ready=true;refreshStats();return;}
    try{renderThumbTo(SCENES[n]._wcv,n,0);}catch(e){if(window.console)console.warn('wall '+n+': '+e.message);}
    n++;setTimeout(step,60);
  })();
  /* 大图轮播 */
  var hero=$('heroCanvas');
  if(hero){
    var hi=0,hold=0,SW=6.4,fade=0;
    (function heroLoop(ts){
      var dt=Math.min(0.05,(ts-APP.last)/1000||0.016);APP.last=ts;APP.t+=dt;
      hold+=dt;
      if(hold>SW){hold=0;hi=(hi+1)%SCENES.length;fade=1;}
      if(fade>0)fade=Math.max(0,fade-dt*1.6);
      var yaw=APP.t*0.045;
      renderThumbTo(hero,hi,yaw);
      if(fade>0){
        var c=hero.getContext('2d');
        c.globalAlpha=fade*0.85;
        c.fillStyle='#F7F4EC';
        c.fillRect(0,0,hero.width,hero.height);
        c.globalAlpha=1;
      }
      var cap=$('heroCap');
      if(cap)cap.textContent=SCENES[hi].no+' · '+SCENES[hi].cn+' / '+SCENES[hi].en;
      requestAnimationFrame(heroLoop);
    })(0);
  }
  refreshStats();
}

/* ==========================================================================
   页面：关于（无重活，只补统计）
   ========================================================================== */
function initAbout(){
  markNav();
  ensureAllWorlds();
  refreshStats();
}

/* ==========================================================================
   路由
   ========================================================================== */
function boot(){
  loadState();
  var page=document.body.getAttribute('data-page')||'landing';
  if(page==='player')initPlayer();
  else if(page==='scenes')initScenes();
  else if(page==='journal')initJournal();
  else if(page==='about')initAbout();
  else initLanding();
  markNav();
  setTimeout(hideBoot,page==='player'?420:220);
}
if(window)window.__QI={REN:REN,APP:APP,SCENES:SCENES,renderWorld:renderWorld,emitPart:emitPart,
  proj:proj,hitTest:hitTest,onPick:onPick,renderThumbTo:renderThumbTo,fillJournal:fillJournal,
  petStats:petStats,taskStats:taskStats,AU:AU};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
else boot();
