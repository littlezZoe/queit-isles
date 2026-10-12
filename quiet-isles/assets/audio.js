/* 静屿 QUIET ISLES — 程序化音景（Web Audio 实时合成，无音频文件） */

/* ==========================================================================
   音景：全部由浏览器实时合成，不加载任何音频文件
   ========================================================================== */
var AU={ctx:null,master:null,nbuf:null,muted:false,layers:[],timers:[],ok:false};
AU.init=function(){
  if(this.ctx)return true;
  var AC=window.AudioContext||window.webkitAudioContext;
  if(!AC)return false;
  this.ctx=new AC();
  this.master=this.ctx.createGain();
  this.master.gain.value=0.0001;
  var comp=this.ctx.createDynamicsCompressor();
  comp.threshold.value=-20;comp.knee.value=24;comp.ratio.value=3.4;
  this.master.connect(comp);comp.connect(this.ctx.destination);
  var len=Math.floor(this.ctx.sampleRate*2),b=this.ctx.createBuffer(1,len,this.ctx.sampleRate),d=b.getChannelData(0);
  for(var i=0;i<len;i++)d[i]=Math.random()*2-1;
  this.nbuf=b;this.ok=true;
  return true;
};
AU.vol=function(v,t){
  if(!this.ctx)return;
  var g=this.master.gain,n=this.ctx.currentTime;
  g.cancelScheduledValues(n);g.setValueAtTime(Math.max(0.0001,g.value),n);
  g.linearRampToValueAtTime(Math.max(0.0001,v),n+(t===undefined?1.0:t));
};
AU.noise=function(){var s=this.ctx.createBufferSource();s.buffer=this.nbuf;s.loop=true;return s;};
AU.bq=function(t,f,q){var b=this.ctx.createBiquadFilter();b.type=t;b.frequency.value=f;if(q!==undefined)b.Q.value=q;return b;};
AU.g=function(v){var g=this.ctx.createGain();g.gain.value=(v===undefined?1:v);return g;};
AU.osc=function(f,t){var o=this.ctx.createOscillator();o.type=t||'sine';o.frequency.value=f;return o;};
AU.reg=function(nodes,srcs){this.layers.push({n:nodes,s:srcs||[]});};
AU.clear=function(){
  for(var i=0;i<this.layers.length;i++){
    var L=this.layers[i],k;
    for(k=0;k<L.s.length;k++){try{L.s[k].stop();}catch(e){}}
    for(k=0;k<L.n.length;k++){try{L.n[k].disconnect();}catch(e){}}
  }
  this.layers=[];
  for(var j=0;j<this.timers.length;j++)clearTimeout(this.timers[j]);
  this.timers=[];
};
AU.every=function(ms,fn){
  var self=this;
  (function tick(){
    var id=setTimeout(function(){
      if(self.ctx)fn();
      tick();
    },ms*(0.6+Math.random()*0.8));
    self.timers.push(id);
  })();
};
/* --- 基础音色 --- */
AU.note=function(f,dur,type,vol,delay,slide){
  if(!this.ok)return;
  var c=this.ctx,t0=c.currentTime+(delay||0);
  var o=this.osc(f,type||'sine'),g=this.g();
  g.gain.setValueAtTime(0.0001,t0);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0005,vol||0.1),t0+0.012);
  g.gain.exponentialRampToValueAtTime(0.0001,t0+(dur||0.4));
  if(slide){o.frequency.setValueAtTime(f,t0);o.frequency.exponentialRampToValueAtTime(slide,t0+(dur||0.4));}
  o.connect(g);g.connect(this.master);o.start(t0);o.stop(t0+(dur||0.4)+0.05);
};
AU.marimba=function(f,vol,delay){
  if(!this.ok)return;
  var c=this.ctx,t0=c.currentTime+(delay||0);
  var o=this.osc(f,'sine'),o2=this.osc(f*3.01,'sine'),g=this.g(),g2=this.g();
  g2.gain.value=0.22;
  g.gain.setValueAtTime(0.0001,t0);
  g.gain.exponentialRampToValueAtTime(vol||0.16,t0+0.006);
  g.gain.exponentialRampToValueAtTime(0.0001,t0+1.1);
  o.connect(g);o2.connect(g2);g2.connect(g);g.connect(this.master);
  o.start(t0);o2.start(t0);o.stop(t0+1.2);o2.stop(t0+1.2);
};
AU.blip=function(f,vol,dur){this.note(f,dur||0.16,'triangle',vol||0.09,0,f*1.6);};
/* --- 环境层 --- */
AU.waves=function(level){
  var c=this.ctx,n=this.noise(),lp=this.bq('lowpass',620,0.8),g=this.g(0.0001);
  n.connect(lp);lp.connect(g);g.connect(this.master);
  var lfo=this.osc(0.075,'sine'),lg=this.g(0.0001);
  lfo.connect(lg);lg.connect(g.gain);lg.gain.value=(level||0.075)*0.6;
  g.gain.value=(level||0.075)*0.55;
  var lf2=this.osc(0.05,'sine'),lg2=this.g(280);
  lf2.connect(lg2);lg2.connect(lp.frequency);
  n.start();lfo.start();lf2.start();
  this.reg([n,lp,g,lfo,lg,lf2,lg2],[n,lfo,lf2]);
};
AU.wind=function(level,f0){
  var n=this.noise(),lp=this.bq('lowpass',f0||360,0.6),hp=this.bq('highpass',110,0.4),g=this.g(0.0001);
  n.connect(hp);hp.connect(lp);lp.connect(g);g.connect(this.master);
  var lfo=this.osc(0.043,'sine'),lg=this.g(150);
  lfo.connect(lg);lg.connect(lp.frequency);
  var l2=this.osc(0.021,'sine'),l2g=this.g((level||0.05)*0.55);
  l2.connect(l2g);l2g.connect(g.gain);
  g.gain.value=(level||0.05)*0.5;
  n.start();lfo.start();l2.start();
  this.reg([n,lp,hp,g,lfo,lg,l2,l2g],[n,lfo,l2]);
};
AU.brook=function(level){
  var n=this.noise(),bp=this.bq('bandpass',1500,0.9),bp2=this.bq('bandpass',3400,1.4),g=this.g(level||0.05);
  n.connect(bp);bp.connect(g);n.connect(bp2);bp2.connect(g);g.connect(this.master);
  var l=this.osc(0.9,'sine'),lg=this.g(260);
  l.connect(lg);lg.connect(bp.frequency);
  n.start();l.start();
  this.reg([n,bp,bp2,g,l,lg],[n,l]);
  var self=this;
  this.every(900,function(){
    if(!self.ok)return;
    self.note(500+Math.random()*900,0.09,'sine',0.035,0,1400+Math.random()*900);
  });
};
AU.fire=function(){
  var n=this.noise(),lp=this.bq('lowpass',760,0.7),g=this.g(0.03);
  n.connect(lp);lp.connect(g);g.connect(this.master);n.start();
  this.reg([n,lp,g],[n]);
  var self=this;
  this.every(420,function(){
    if(!self.ok)return;
    self.note(90+Math.random()*90,0.16,'triangle',0.05,0,50);
    if(Math.random()<0.3)self.note(1400+Math.random()*1200,0.05,'square',0.012);
  });
};
AU.crickets=function(level){
  var n=this.noise(),bp=this.bq('bandpass',3900,7),g=this.g(0.0001);
  n.connect(bp);bp.connect(g);g.connect(this.master);
  var lfo=this.osc(13.5,'square'),lg=this.g((level||0.035)*0.9);
  lfo.connect(lg);lg.connect(g.gain);
  var l2=this.osc(0.09,'sine'),l2g=this.g(500);
  l2.connect(l2g);l2g.connect(bp.frequency);
  g.gain.value=(level||0.035)*0.5;
  n.start();lfo.start();l2.start();
  this.reg([n,bp,g,lfo,lg,l2,l2g],[n,lfo,l2]);
};
AU.pad=function(freqs,vol){
  var c=this.ctx,filt=this.bq('lowpass',900,0.5),g=this.g(0.0001);
  filt.connect(g);g.connect(this.master);
  g.gain.setValueAtTime(0.0001,c.currentTime);
  g.gain.linearRampToValueAtTime(vol||0.022,c.currentTime+6);
  var srcs=[],nodes=[g,filt];
  for(var i=0;i<freqs.length;i++){
    var o=this.osc(freqs[i],i%2?'sine':'triangle');
    var og=this.g(0.5/(i+1));
    var det=this.osc(freqs[i]*1.004,'sine'),dg=this.g(0.3/(i+1));
    o.connect(og);og.connect(filt);det.connect(dg);dg.connect(filt);
    o.start();det.start();srcs.push(o,det);nodes.push(o,og,det,dg);
    var lfo=this.osc(0.03+i*0.017,'sine'),lg=this.g(0.5);
    lfo.connect(lg);lg.connect(og.gain);lfo.start();srcs.push(lfo);nodes.push(lfo,lg);
  }
  this.reg(nodes,srcs);
};
AU.birds=function(rate,vol){
  var self=this;
  this.every(rate||5200,function(){
    if(!self.ok)return;
    var n=2+Math.floor(Math.random()*3),base=1500+Math.random()*1500;
    for(var i=0;i<n;i++){
      (function(i){
        setTimeout(function(){
          if(!self.ok)return;
          var f=base*(1+(Math.random()-0.5)*0.35);
          self.note(f,0.12,'sine',(vol||0.05)*(0.7+Math.random()*0.5),0,f*1.7);
        },i*110);
      })(i);
    }
  });
};
AU.frogs=function(){
  var self=this;
  this.every(2600,function(){
    if(!self.ok)return;
    var f=150+Math.random()*90;
    var c=self.ctx,t0=c.currentTime;
    var o=self.osc(f,'sawtooth'),lp=self.bq('lowpass',600,3),g=self.g(0.0001);
    o.connect(lp);lp.connect(g);g.connect(self.master);
    var n2=3+Math.floor(Math.random()*3);
    for(var i=0;i<n2;i++){
      var tt=t0+i*0.09;
      g.gain.setValueAtTime(0.0001,tt);
      g.gain.linearRampToValueAtTime(0.05,tt+0.012);
      g.gain.exponentialRampToValueAtTime(0.0001,tt+0.075);
    }
    o.start(t0);o.stop(t0+n2*0.09+0.2);
    setTimeout(function(){try{o.disconnect();lp.disconnect();g.disconnect();}catch(e){}},2600);
  });
};
AU.bell=function(){
  var self=this;
  this.every(9000,function(){
    if(!self.ok)return;
    var f=[523.25,659.25,783.99,987.77][Math.floor(Math.random()*4)];
    self.note(f,2.4,'sine',0.05);
    self.note(f*2.01,1.6,'sine',0.022,0.02);
    self.note(f*3.02,0.9,'sine',0.01,0.04);
  });
};
AU.gulls=function(){
  var self=this;
  this.every(7000,function(){
    if(!self.ok)return;
    var f=900+Math.random()*400;
    self.note(f,0.28,'sawtooth',0.028,0,f*0.62);
    setTimeout(function(){if(self.ok)self.note(f*0.94,0.2,'sawtooth',0.022,0,f*0.6);},380);
  });
};
AU.rain=function(level){
  var n=this.noise(),hp=this.bq('highpass',780,0.5),lp=this.bq('lowpass',5400,0.7),g=this.g(0.0001);
  n.connect(hp);hp.connect(lp);lp.connect(g);g.connect(this.master);
  g.gain.value=(level||0.05)*0.55;
  var l=this.osc(0.083,'sine'),lg=this.g((level||0.05)*0.22);
  l.connect(lg);lg.connect(g.gain);l.start();
  var l2=this.osc(0.037,'sine'),l2g=this.g(700);
  l2.connect(l2g);l2g.connect(lp.frequency);l2.start();
  this.reg([n,hp,lp,g,l,lg,l2,l2g],[n,l,l2]);
  var self=this;
  /* 雨滴颗粒 */
  this.every(190,function(){
    if(!self.ok)return;
    self.note(2100+Math.random()*2800,0.05,'sine',0.006,0,900);
  });
  /* 远处闷雷 */
  this.every(17000,function(){
    if(!self.ok)return;
    self.note(96,1.6,'sine',0.05,0,42);
    self.note(64,2.2,'triangle',0.035,0.1,38);
  });
};
/* --- 场景音景 --- */
AU.playScene=function(id){
  if(!this.ok)return;
  this.clear();
  if(id==='tidal'){
    this.pad([146.83,220,261.63],0.020);
    this.waves(0.085);this.wind(0.022,300);this.gulls();
    var self=this;
    this.every(2600,function(){if(self.ok)self.note(320+Math.random()*280,0.14,'sine',0.03,0,760);});
  }else if(id==='isle'){
    this.pad([196,246.94,293.66],0.020);
    this.waves(0.07);this.wind(0.05,420);this.birds(6200,0.04);
    var self2=this,pent=[523.25,587.33,659.25,783.99,880];
    this.every(4200,function(){
      if(!self2.ok)return;
      var k=Math.floor(Math.random()*5);
      self2.marimba(pent[k],0.075,0);
      self2.marimba(pent[(k+2)%5],0.055,0.32);
      if(Math.random()<0.5)self2.marimba(pent[(k+4)%5],0.04,0.68);
    });
  }else if(id==='grove'){
    this.pad([164.81,196,246.94],0.018);
    this.brook(0.05);this.wind(0.03,520);this.crickets(0.03);this.birds(8000,0.035);
  }else if(id==='snow'){
    this.pad([130.81,196,261.63],0.022);
    this.wind(0.075,300);this.fire();this.bell();
  }else if(id==='pond'){
    this.pad([110,164.81,220],0.024);
    this.wind(0.02,260);this.frogs();this.crickets(0.018);
    var self3=this;
    this.every(3400,function(){if(self3.ok)self3.note(880+Math.random()*400,0.3,'sine',0.028,0,300);});
    this.bell();
  }else if(id==='terrace'){
    this.pad([174.61,261.63,329.63],0.020);
    this.wind(0.045,480);this.brook(0.028);this.birds(4200,0.05);
    var self4=this,p2=[392,440,523.25,587.33,659.25,783.99];
    this.every(5600,function(){
      if(!self4.ok)return;
      var k=Math.floor(Math.random()*5);
      self4.marimba(p2[k],0.07,0);self4.marimba(p2[k+1],0.05,0.36);
    });
  }else if(id==='oasis'){
    /* 沙漠黄昏：暖风、稀疏虫鸣、偶来的驼铃 */
    this.pad([146.83,174.61,220],0.020);
    this.wind(0.065,300);this.crickets(0.012);
    var self5=this;
    this.every(9000,function(){
      if(!self5.ok)return;
      var f=740+Math.random()*300;
      self5.note(f,0.5,'sine',0.026,0,f*0.86);
      self5.note(f*1.5,0.35,'sine',0.014,0.16,f*1.2);
    });
    this.every(21000,function(){
      if(!self5.ok)return;
      var i;for(i=0;i<3;i++)self5.marimba([1174.66,1567.98,1318.51][i],0.032,i*0.18);
    });
  }else if(id==='bamboo'){
    /* 竹海：叶响、细溪、竹筒互碰的空心脆声 */
    this.pad([164.81,220,277.18],0.018);
    this.wind(0.05,700);this.brook(0.03);this.crickets(0.016);this.birds(9000,0.03);
    var self6=this,bb=[587.33,698.46,880,1046.5,1174.66];
    this.every(4800,function(){
      if(!self6.ok)return;
      var k=Math.floor(Math.random()*bb.length);
      self6.note(bb[k],0.22,'triangle',0.045,0,bb[k]*0.72);
      if(Math.random()<0.45)self6.note(bb[(k+2)%bb.length],0.18,'triangle',0.03,0.24,bb[k]*0.8);
    });
  }else if(id==='roof'){
    /* 雨夜天台：雨、远处车流的低频、偶尔的雷 */
    this.pad([110,146.83,196],0.022);
    this.rain(0.075);this.wind(0.03,240);
    var self7=this;
    this.every(6200,function(){
      if(!self7.ok)return;
      var k=Math.floor(Math.random()*4);
      self7.note([523.25,659.25,783.99,987.77][k],1.0,'sine',0.028,0,0);
    });
    this.every(11000,function(){
      if(!self7.ok)return;
      self7.note(196,0.9,'triangle',0.018,0,150);
    });
  }
};
AU.tap=function(){
  if(!this.ok)return;
  var pent=[523.25,587.33,659.25,783.99,880,1046.5];
  this.marimba(pent[Math.floor(Math.random()*pent.length)],0.12,0);
};
AU.pop=function(){
  if(!this.ok)return;
  this.note(880,0.1,'sine',0.07,0,1500);
  this.marimba(1046.5,0.09,0.06);
};
AU.chime=function(){
  if(!this.ok)return;
  this.note(659.25,1.1,'sine',0.07);
  this.note(987.77,1.3,'sine',0.05,0.1);
};
AU.win=function(){
  if(!this.ok)return;
  var s=[523.25,659.25,783.99,1046.5,1318.5];
  for(var i=0;i<s.length;i++)this.marimba(s[i],0.1,i*0.16);
};
