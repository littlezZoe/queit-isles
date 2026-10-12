/* 静屿 QUIET ISLES — 场景构建器与场景清单 */

/* =============================== 场景 1：潮汐之庭 =============================== */
function buildTidal(w){
  w.radius=6.9;w.bg=[C('#FCF8F0'),C('#CDE6E6')];w.amb=0.50;w.haze=C('#DCECEA');w.hazeK=0.20;
  w.sun=[0.44,0.80,0.41];
  var R=5.4,TH=0.85,GY=0;
  var slab=slabGeo(R,TH,PAL.sand,C('#DBC69B'),101,{wob:0.10,n:22,taper:0.86});
  w.put(slab.geo,{x:0,z:0,y:-TH,layer:0});
  w.put(bandGeo(slab.pts,0.985,1.0,GY+0.004,PAL.sand2),{layer:0});
  /* 海水 + 沙滩环 */
  waterPlane(w,-0.34,5.7,12.0,C('#9FE0D2'),0.66,C('#2E7FA6'));
  w.put(bandGeo(slab.pts,0.82,0.995,GY+0.006,C('#F4E6BC')),{layer:0});
  sandbar(w,4.6,3.6,1.3,-0.30,C('#EFDFAC'),130);
  sandbar(w,-4.8,-2.6,1.1,-0.30,C('#EAD8A0'),131);
  buoy(w,5.4,2.0,-0.30,140);

  pebbles(w,7,3.9,2.6,1.3,9,PAL.rockB,0.13);

  /* 三个潮池 */
  pool(w,0.1,-0.5,2.05,GY,{seed:31,rocks:6});
  pool(w,-1.95,1.65,1.15,GY,{seed:77,rocks:5});
  pool(w,2.25,1.7,1.35,GY,{seed:53,rocks:5});

  /* 池中珊瑚与水草 */
  var rr=rng(202);
  var i,a;
  for(i=0;i<9;i++){
    a=rr()*TAU;var d=rr()*1.4;
    var cc=[PAL.coral,PAL.plum,C('#F2B36B'),C('#8FD5C0'),PAL.coral2][i%5];
    crystal(w,0.1+Math.cos(a)*d,-0.5+Math.sin(a)*d,0.24+rr()*0.2,cc,30+i);
  }
  for(i=0;i<7;i++){
    a=rr()*TAU;var d2=rr()*1.0;
    grassTuft(w,2.25+Math.cos(a)*d2,1.7+Math.sin(a)*d2,C('#7FC7B4'),90+i,0.5);
  }
  /* 池中散布小圆石与水草 */
  pebbles(w,88,0.1,-0.5,1.5,7,PAL.rockD,0.09);

  /* 树与灌木 */
  tree(w,-3.1,-1.3,{h:1.45,r:0.72,seed:5,blobs:6});
  tree(w,-1.5,-2.5,{h:1.2,r:0.6,seed:9,blobs:5,col:PAL.leafC,col2:PAL.leafA});
  tree(w,1.05,-2.7,{h:1.35,r:0.66,seed:14,blobs:6,col:PAL.leafC,col2:PAL.leafB});
  tree(w,3.2,-1.9,{h:1.1,r:0.55,seed:21,blobs:5,col:PAL.leafA,col2:PAL.leafD});
  bush(w,-3.6,0.6,0.5,PAL.leafB,PAL.leafA,44);
  bush(w,3.6,0.35,0.45,PAL.leafA,PAL.leafC,46);
  bush(w,1.6,-1.0,0.4,PAL.leafB,PAL.leafD,48);
  for(i=0;i<10;i++){
    a=rr()*TAU;var d3=2.9+rr()*1.6;
    flower(w,Math.cos(a)*d3,Math.sin(a)*d3,0.24+rr()*0.12,rr()>0.5?C('#F6A8C0'):C('#F7D574'),C('#FFF3D0'),60+i);
  }
  for(i=0;i<12;i++){
    a=rr()*TAU;var d4=2.4+rr()*2.2;
    grassTuft(w,Math.cos(a)*d4,Math.sin(a)*d4,PAL.leafB,120+i,0.34);
  }
  rock(w,-3.9,-2.4,0.48,PAL.rockB,62,{y:GY-0.05,su:6,sv:4});
  rock(w,3.9,2.5,0.34,PAL.rockA,63,{y:GY-0.05});
  signPost(w,-2.25,-2.15,{y:GY,ry:0.5});

  /* 小生物 */
  addPet(w,{geo:mkOctopus(C('#F07FA8'),C('#E0648F')),x:0.15,y:GY+0.03,z:-0.45,r:0.55,
    name:'粉八爪',en:'Little Octopus',desc:'住在潮池最深的地方。伸出一只手碰碰它，它会高兴得变成粉红色。',col:[240,127,168],amp:0.05,sp:1.2});
  addPet(w,{geo:mkHermit(C('#E0A06A'),C('#F0BE8A'),C('#F5A96E'),{}),x:-1.95,y:GY+0.02,z:1.75,r:0.36,
    name:'寄居蟹',en:'Hermit Crab',desc:'背着一间租来的房子，走两步就要停下来歇一会。',col:[224,160,106],amp:0.03,sp:2.1,where:1});
  addPet(w,{geo:mkCrab(C('#F0845C'),C('#F5B27A'),C('#EF6B4E'),{r:0.2}),x:-3.0,y:GY,z:0.15,r:0.34,
    name:'沙蟹',en:'Shore Crab',desc:'横着走的哲学家。你一动它就装死，过一会又开始挖沙。',col:[240,132,92],amp:0.028,sp:2.6,where:1});
  addPet(w,{geo:mkFish(C('#6FA8E8'),C('#BFE0F5'),C('#DDEFFB'),{len:0.34}),x:0.6,y:GY+0.16,z:-1.0,r:0.3,
    name:'蓝鳍鱼',en:'Blue Fin',desc:'三只一组地绕圈，永远走同一条路线，从不迷路。',col:[111,168,232],amp:0.06,sp:2.4,sway:0.5,where:1});
  addPet(w,{geo:mkFish(C('#6FA8E8'),C('#BFE0F5'),C('#DDEFFB'),{len:0.28}),x:-0.35,y:GY+0.22,z:-0.15,r:0.26,
    name:'蓝鳍鱼',en:'Blue Fin',desc:'三只一组地绕圈，永远走同一条路线，从不迷路。',col:[111,168,232],amp:0.07,sp:2.9,sway:0.5,where:1});
  addPet(w,{geo:mkStar(C('#F2A05C'),{r:0.3}),x:1.5,y:GY+0.04,z:0.95,r:0.32,
    name:'海星',en:'Sea Star',desc:'慢到你会怀疑它是不是活的。其实它一天只走一米。',col:[242,160,92],amp:0.012,sp:0.8,sway:0.02});
  addPet(w,{geo:mkJelly(C('#BFE7F0'),C('#EAF9FF'),{r:0.24}),x:2.3,y:GY+0.75,z:1.5,r:0.34,
    name:'月光水母',en:'Moon Jelly',desc:'一收一放，像在水里呼吸。没有骨头，也没有心事。',col:[191,231,240],amp:0.12,sp:0.9,sway:0.06,where:1});
  addPet(w,{geo:mkStar(C('#F2A05C'),{r:0.22}),x:-2.6,y:GY+0.04,z:-1.1,r:0.26,
    name:'海星',en:'Sea Star',desc:'慢到你会怀疑它是不是活的。其实它一天只走一米。',col:[242,160,92],amp:0.012,sp:0.7,sway:0.02});

  /* 水面微光 */
  for(i=0;i<8;i++)mote(w,{x:-2+Math.random()*4,y:GY+0.35,z:-1.6+Math.random()*2.6,r:0.09,col:C('#DFFBFB'),a:0.5});
  mote(w,{x:2.2,y:GY+0.5,z:1.6,r:0.2,col:C('#CFEFFF'),a:0.45});

  /* 任务：清理海岸 */
  var spots=[[-1.2,0.3],[2.9,0.6],[3.5,-0.9],[-2.2,-0.6],[0.9,2.3],[-3.5,1.9],[1.75,-2.05],[-0.5,2.5]];
  var litCol=[C('#C9C6BC'),C('#B9C3C6'),C('#D6CFC0')];
  for(i=0;i<6;i++){
    var sp2=spots[i];
    var g=merge([
      prismGeo(5,0.11,0.085,0.13,litCol[i%3]),
      xf(prismGeo(5,0.07,0.05,0.05,litCol[(i+1)%3]),{dy:0.13,dx:0.03})
    ]);
    addTrash(w,{geo:g,x:sp2[0],z:sp2[1],y:GY+0.01,r:0.34,ry:rr()*TAU,spin:0.5});
  }
  w.task={label:'清理这片海岸',sub:'沙上漂着 6 片小碎片，点掉它',total:6,
    done:'海岸干净了。珊瑚悄悄长出了一点。'};
  return w;
}

/* =============================== 场景 2：暖屿 =============================== */
function buildIsle(w){
  w.radius=9.2;w.bg=[C('#FDF3E0'),C('#DCEBDD')];w.amb=0.50;w.haze=C('#EDF1E4');w.hazeK=0.16;
  w.sun=[0.55,0.74,0.38];
  var R=5.6,TH=0.95,GY=0;
  var slab=slabGeo(R,TH,C('#F0E2B4'),C('#CBAA79'),202,{wob:0.09,n:24,taper:0.84});
  w.put(slab.geo,{x:0,z:0,y:-TH,layer:0});
  /* 周围一圈海：近岸浅绿 → 远处深蓝 */
  waterPlane(w,-0.34,6.1,12.6,C('#8FD9CF'),0.72,C('#2E7FA6'));
  /* 沙滩环 + 湿沙线 */
  w.put(bandGeo(slab.pts,0.78,0.995,GY+0.004,C('#F4E6BC')),{layer:0});
  w.put(bandGeo(slab.pts,0.70,0.80,GY+0.006,C('#EBD8A2')),{layer:0});
  /* 水下沙洲与浅滩石 */
  sandbar(w,3.4,4.6,1.5,-0.30,C('#EFDFAC'),231);
  sandbar(w,-4.8,3.6,1.2,-0.30,C('#EAD8A0'),232);
  sandbar(w,-5.4,-2.6,1.0,-0.30,C('#EFDFAC'),233);
  buoy(w,4.9,2.6,-0.30,241);
  buoy(w,-3.6,5.6,-0.30,242,C('#4E9E8C'));
  buoy(w,6.4,-2.2,-0.30,243);
  /* 浅水里的石头与探出水面的草 */
  var rr=rng(233),i,k;
  for(i=0;i<9;i++){
    var a=rr()*TAU,d=6.3+rr()*1.6;
    rock(w,Math.cos(a)*d,Math.sin(a)*d,0.18+rr()*0.24,rr()>0.5?C('#9FB0C1'):C('#B7A98A'),244+i,{y:-0.28,sy:0.55,su:5,sv:3});
  }
  for(i=0;i<10;i++){
    a=rr()*TAU;d=5.9+rr()*1.1;
    grassTuft(w,Math.cos(a)*d,Math.sin(a)*d,C('#7FB98C'),254+i,0.34);
  }
  /* 浅水荷叶 */
  for(i=0;i<5;i++){
    a=rr()*TAU;d=6.4+rr()*1.4;
    lotusLeaf(w,Math.cos(a)*d,Math.sin(a)*d,0.26+rr()*0.12,C('#5FAE74'),-0.26);
  }
  /* 中央草地土丘 */
  var hill=merge([
    blobGeo(2.3,C('#8CC479'),{su:9,sv:6,jitter:0.13,rand:rng(5),sy:0.40}),
    xf(blobGeo(1.5,C('#9BD08A'),{su:8,sv:5,jitter:0.15,rand:rng(6),sy:0.36}),{dx:-1.5,dy:0.06,dz:1.1}),
    xf(blobGeo(1.3,C('#7FBA6F'),{su:8,sv:5,jitter:0.15,rand:rng(7),sy:0.38}),{dx:1.6,dy:0.04,dz:-1.0})
  ]);
  w.put(hill,{x:-0.5,z:-1.0,y:GY-0.16});

  /* 小溪：从草地蜿蜒入海（西岸） */
  var brook=[[-1.6,-0.6],[-2.0,0.3],[-2.3,1.3],[-2.5,2.3],[-2.9,3.2],[-3.4,4.1]];
  for(i=0;i<brook.length;i++){
    var sc=0.42+Math.sin(i/brook.length*Math.PI)*0.22;
    w.put(discGeo(circlePts(10,sc,sc*0.72,0.3),0.001,GY+0.028,PAL.water,2,PAL.waterDeep),
      {x:brook[i][0],z:brook[i][1],alpha:0.88,layer:0});
    if(i%2===0)ripples(w,brook[i][0],brook[i][1],GY+0.04,sc*0.95,PAL.foam,3.0,i*0.4,1);
  }
  w.put(discGeo(circlePts(10,0.8,0.6,0.3),0.001,-0.30,C('#7FD0C8'),1),{x:-3.8,z:4.9,alpha:0.8,layer:0});

  /* 木栈道：从岛上一直伸进海里，桩基越高越远 */
  var pd=[];
  for(k=0;k<15;k++){
    pd.push(xf(boxGeo(1.5,0.10,0.34,PAL.wood,{side:PAL.wood2}),{dz:k*0.42,dy:GY-Math.max(0,k-3)*0.07}));
  }
  for(k=0;k<6;k++){
    pd.push(xf(prismGeo(4,0.085,0.07,2.2,PAL.wood3),{dx:0.66,dz:1.2+k*1.25,dy:GY-1.2}));
    pd.push(xf(prismGeo(4,0.085,0.07,2.2,PAL.wood3),{dx:-0.66,dz:1.2+k*1.25,dy:GY-1.2}));
  }
  /* 栈道尽头：栏杆 + 系船柱 */
  pd.push(xf(boxGeo(1.5,0.08,0.10,PAL.wood2),{dz:14*0.42+0.16,dy:0.42}));
  pd.push(xf(prismGeo(4,0.06,0.05,0.5,PAL.wood3),{dx:0.62,dz:14*0.42-0.05,dy:0.10}));
  pd.push(xf(prismGeo(4,0.06,0.05,0.5,PAL.wood3),{dx:-0.62,dz:14*0.42-0.05,dy:0.10}));
  w.put(merge(pd),{x:1.7,z:2.3,ry:-0.18,y:0});
  w.put(discGeo(circlePts(14,1.05,0.8,0.75),0.001,GY+0.004,C('#D9CBA3'),2),{x:1.7,z:2.5,alpha:0.55});
  /* 栈道边的梯子、木箱、木桶、缆绳桩 */
  pierLadder(w,2.35,5.6,{y:GY-0.28,ry:1.35,h:1.0});
  crate(w,1.15,4.6,{s:0.32,ry:0.4});
  crate(w,0.75,4.95,{s:0.24,ry:-0.3,stacked:true});
  barrel(w,2.2,3.7,{ry:0.7});
  barrel(w,-0.3,6.3,{ry:-0.4});
  /* 码头灯笼柱 ×2 */
  lantern(w,2.32,4.2,{h:1.15,ry:0.3});
  lantern(w,1.05,6.9,{h:1.15,ry:-0.5});

  /* 小渔船：浮在栈道边，带桨 */
  boat(w,3.55,5.4,{len:1.35,w:0.5,ry:-0.5,oar:true,float:true,y:-0.24});
  /* 远处一只空船 */
  boat(w,-5.2,1.6,{len:1.1,w:0.42,ry:2.2,float:true,y:-0.26,col:C('#E8DCC4')});

  /* 房子（带烟囱） */
  w.put(discGeo(circlePts(14,1.5,1.25),0.001,GY+0.98,C('#D8C79C'),3,C('#C8B489')),{x:-0.3,z:-1.7,alpha:0.92});
  var h=house(w,-0.3,-1.7,{y:GY+1.02,w:1.9,d:1.6,h:1.05,roof:C('#3D5A76'),roof2:C('#4E6E8C'),
    wall:C('#F6EEDC'),wallSide:C('#E7DAC0'),wallTop:C('#EFE5CE'),ry:-0.35,winOff:C('#F6D98F')});
  /* 烟囱 */
  w.put(merge([
    prismGeo(4,0.15,0.13,0.7,C('#B08A63')),
    xf(boxGeo(0.4,0.08,0.4,C('#EDEAE2'),{side:C('#D8D4C8')}),{dy:0.7})
  ]),{x:-0.55,z:-2.0,y:GY+2.2});
  /* 红顶小亭（旧码头边的等候亭） */
  (function(){
    var gx=-3.4,gz=2.9,ry=0.4;
    var list=[
      xf(prismGeo(4,0.06,0.05,0.85,PAL.wood3),{dx:-0.42,dz:-0.32}),
      xf(prismGeo(4,0.06,0.05,0.85,PAL.wood3),{dx:0.42,dz:-0.32}),
      xf(prismGeo(4,0.06,0.05,0.85,PAL.wood3),{dx:-0.42,dz:0.32}),
      xf(prismGeo(4,0.06,0.05,0.85,PAL.wood3),{dx:0.42,dz:0.32}),
      xf(boxGeo(1.1,0.08,0.9,PAL.wood,{side:PAL.wood2}),{dy:0.85})
    ];
    /* 红色四坡小顶 */
    var rg=Geo(),Wd=0.72,Dp=0.58,yt=0.93,yp=1.38;
    var a=P(rg,-Wd,yt,-Dp),b=P(rg,Wd,yt,-Dp),c=P(rg,Wd,yt,Dp),d=P(rg,-Wd,yt,Dp);
    var r1=P(rg,0,yp,-0.18),r2=P(rg,0,yp,0.18);
    quad(rg,r1,d,c,r2,C('#C9564A'),0);
    quad(rg,r2,b,a,r1,C('#D96054'),0);
    tri(rg,r2,c,b,C('#C9564A'),0);
    tri(rg,r1,a,d,C('#D96054'),0);
    list.push(rg);
    /* 长椅 */
    list.push(xf(boxGeo(0.7,0.06,0.24,PAL.wood2),{dz:-0.28,dy:0.36}));
    w.put(merge(list),{x:gx,z:gz,y:GY,ry:ry});
    shadow(w,gx,gz,0.75);
  })();

  /* 棕榈（垂坠长叶版） */
  palm(w,-3.3,0.6,{h:2.6,seed:31,fronds:9,lean:0.30,frondLen:1.35,droop:1.08});
  palm(w,-4.2,-1.6,{h:2.1,seed:32,fronds:8,lean:-0.34,leanZ:0.2,frondLen:1.15,droop:1.05});
  palm(w,3.9,1.2,{h:2.8,seed:33,fronds:9,lean:-0.28,frondLen:1.4,droop:1.1});
  palm(w,4.6,-1.4,{h:1.9,seed:34,fronds:8,lean:0.25,frondLen:1.1,droop:1.0});
  palm(w,-1.9,3.6,{h:2.3,seed:35,fronds:8,lean:0.3,frondLen:1.2,droop:1.05});
  palm(w,2.9,-2.9,{h:1.7,seed:36,fronds:7,lean:-0.2,frondLen:0.95,droop:1.0});
  for(k=0;k<9;k++){
    var a2=k/9*TAU+0.4;
    flower(w,Math.cos(a2)*2.6-0.5,Math.sin(a2)*2.3-1.1,0.3,C('#F1869E'),C('#FFF0C8'),200+k);
  }
  for(k=0;k<14;k++){
    var a3=k/14*TAU+1.1,d2=3.4+rng(k*13)()*1.8;
    grassTuft(w,Math.cos(a3)*d2,Math.sin(a3)*d2,C('#8FC77C'),300+k,0.4);
  }
  pebbles(w,410,3.4,2.9,1.1,14,C('#E7D9AE'),0.14);
  rock(w,-4.6,2.4,0.55,C('#B7A98A'),411,{y:GY-0.05,su:6,sv:4});
  rock(w,4.9,0.6,0.45,C('#C4B79A'),412,{y:GY-0.05});

  /* 灯笼 ×6（任务） */
  var lp=[[-2.6,2.0],[-0.8,2.8],[1.2,1.3],[2.6,-0.8],[0.9,-2.3],[-2.2,-2.4]];
  var lcol=[C('#E2896B'),C('#E9A05F'),C('#D98BA8'),C('#8FBFB0'),C('#E2B36B'),C('#C9927F')];
  w.lamps=[];
  for(k=0;k<6;k++){
    w.lamps.push(addLamp(w,lp[k][0],lp[k][1],{y:GY+0.02,h:1.05,ry:k*0.7,col:lcol[k]}));
  }

  /* 小生物 */
  addPet(w,{geo:mkCrab(C('#EF8A5E'),C('#F6C089'),C('#E87454'),{r:0.22}),x:2.9,y:GY+0.02,z:3.4,r:0.36,
    name:'沙滩蟹',en:'Beach Crab',desc:'一直想爬上栈道，每次都被浪声吓得退回去。',col:[239,138,94],sp:2.4,where:1});
  addPet(w,{geo:mkWing(null,C('#F7F7F2'),C('#D8E4EC'),C('#F2B04E'),{len:0.3}),x:-1.4,y:GY+2.6,z:1.8,r:0.4,
    name:'海鸥',en:'Gull',desc:'绕着岛飞第八圈了。它说它只是在散步。',col:[247,247,242],amp:0.22,sp:0.8,sway:0.3});
  addPet(w,{geo:mkWing(null,C('#F7F7F2'),C('#D8E4EC'),C('#F2B04E'),{len:0.26}),x:2.4,y:GY+2.1,z:-2.6,r:0.36,
    name:'海鸥',en:'Gull',desc:'绕着岛飞第八圈了。它说它只是在散步。',col:[247,247,242],amp:0.26,sp:0.7,sway:0.3});
  addPet(w,{geo:mkButterfly(C('#F6C46B'),C('#EF9E5E'),{len:0.17}),x:2.6,y:GY+0.75,z:1.6,r:0.3,
    name:'斑蝶',en:'Butterfly',desc:'只落在最晒的那朵花上。它说阳光是甜的。',col:[246,196,107],amp:0.12,sp:1.8});
  addPet(w,{geo:mkCat(C('#E8B87E'),C('#F4D6AE'),{len:0.32}),x:1.7,y:GY+0.1,z:6.6,r:0.42,
    name:'栈道上的猫',en:'Pier Cat',desc:'在栈道尽头睡了整个下午。岛上的风都绕开它走。',col:[232,184,126],amp:0.02,sp:1.1,sway:0.5});

  for(k=0;k<6;k++)mote(w,{x:-3+Math.random()*6,y:GY+1.2+Math.random(),z:-2+Math.random()*5,r:0.1,col:C('#FFF6D8'),a:0.35});
  w.task={label:'点亮岛上的灯',sub:'天要暗了，点一盏是一盏',total:6,done:'整座小岛暖起来了。'};
  return w;
}

/* =============================== 场景 3：苔林微光 =============================== */
function buildGrove(w){
  w.radius=7.0;w.bg=[C('#EAF0DE'),C('#C6DCC8')];w.amb=0.44;w.haze=C('#CFE0CC');w.hazeK=0.24;
  w.sun=[0.52,0.66,0.30];
  var R=5.6,TH=0.82,GY=0;
  var slab=slabGeo(R,TH,C('#8FC078'),C('#9E7E56'),303,{wob:0.12,n:22,taper:0.86});
  w.put(slab.geo,{x:0,z:0,y:-TH,layer:0});
  w.put(bandGeo(slab.pts,0.94,1.0,GY+0.004,C('#A8CF8E')),{layer:0});
  pebbles(w,520,0.4,0.2,4.6,18,C('#7FA86E'),0.2);

  /* 溪流：一串水面盘 */
  var i,a;
  var brook=[[-4.2,2.4],[-3.0,1.5],[-1.9,1.2],[-0.7,1.6],[0.5,1.1],[1.6,0.5],[2.6,-0.4],[3.4,-1.6]];
  for(i=0;i<brook.length;i++){
    var sc=0.62+Math.sin(i/brook.length*Math.PI)*0.32;
    w.put(discGeo(circlePts(12,sc,sc*0.68,0.3),0.001,GY+0.03,PAL.water,2,PAL.waterDeep),
      {x:brook[i][0],z:brook[i][1],alpha:0.88,layer:0});
    if(i%2===0)ripples(w,brook[i][0],brook[i][1],GY+0.045,sc*0.95,PAL.foam,3.0,i*0.4,1);
  }
  /* 踏石 */
  for(i=0;i<5;i++){
    var bi=brook[Math.min(brook.length-1,1+i*1.3|0)];
    rock(w,brook[Math.min(brook.length-1,Math.round(1+i*1.4))][0]+0.55,brook[Math.min(brook.length-1,Math.round(1+i*1.4))][1]-0.15,
      0.4+rng(i*7)()*0.2,C('#93A98C'),600+i,{y:GY-0.02,su:6,sv:4,sy:0.55});
  }
  /* 大树 */
  tree(w,-2.4,-2.2,{h:2.3,r:1.05,seed:71,blobs:7,col:C('#5FA96A'),col2:C('#4E9260')});
  tree(w,1.9,-2.7,{h:2.0,r:0.95,seed:72,blobs:7,col:C('#6EBC74'),col2:C('#58A566')});
  tree(w,3.5,1.4,{h:1.75,r:0.85,seed:73,blobs:6,col:C('#79C67C'),col2:C('#5EAE6C')});
  tree(w,-3.6,-0.4,{h:1.5,r:0.7,seed:74,blobs:5,col:C('#6BBE76'),col2:C('#4E9A60')});
  tree(w,-1.0,3.4,{h:1.45,r:0.7,seed:75,blobs:5,col:C('#82CD84'),col2:C('#63B26D')});
  pine(w,-4.5,2.2,{h:1.9,seed:76,col:C('#4E8F72'),col2:C('#63A486')});
  pine(w,4.4,-2.4,{h:1.7,seed:77,col:C('#549776'),col2:C('#69AA8B')});

  /* 蘑菇与蕨类 */
  for(i=0;i<9;i++){
    a=rng(700+i*7)()*TAU;var d=1.4+rng(800+i)()*3.4;
    mushroom(w,Math.cos(a)*d,Math.sin(a)*d,{r:0.16+rng(900+i)()*0.16,h:0.24+rng(910+i)()*0.2,
      cap:[C('#D9565E'),C('#C96A4E'),C('#B4577F')][i%3],dots:i%2===0,y:GY});
  }
  for(i=0;i<22;i++){
    a=rng(1000+i)()*TAU;var d2=2.0+rng(1100+i)()*3.0;
    grassTuft(w,Math.cos(a)*d2,Math.sin(a)*d2,i%3?C('#6FB57A'):C('#87C48A'),1200+i,0.42+rng(1300+i)()*0.3);
  }
  bush(w,0.9,2.6,0.55,C('#5EA96A'),C('#75BC7C'),1301);
  bush(w,-2.9,1.2,0.5,C('#67B173'),C('#7FC786'),1302);
  /* 倒木 */
  w.put(merge([
    prismGeo(6,0.26,0.22,1.7,C('#9C7A55'),{rot:0}),
    xf(prismGeo(6,0.24,0.19,0.5,C('#8A6A4A')),{dy:1.2}),
    xf(prismGeo(6,0.13,0.10,0.35,C('#A98760')),{dy:0.55,dz:0.14})
  ]),{x:-1.1,z:0.35,ry:1.1,y:GY+0.26,rz:1.5708});
  for(i=0;i<4;i++)mushroom(w,-1.236-i*0.182,0.083-i*0.357,{r:0.11,h:0.13,cap:C('#E0A94E'),y:GY+0.5});

  /* —— 真实化补强：苔藓地被 / 河岸卵石 / 跨溪木桥 / 更密的林子 —— */
  var gi,ga,gd,bk;
  for(gi=0;gi<12;gi++){
    ga=rng(3000+gi)*TAU;gd=1.5+rng(3010+gi)*3.6;
    w.put(blobGeo(0.22+rng(3020+gi)*0.20,gi%2?C('#5E9A62'):C('#6FAE6B'),
      {su:6,sv:4,jitter:0.22,rand:rng(3030+gi),sy:0.15,sx:1.6,sz:1.3}),
      {x:Math.cos(ga)*gd,z:Math.sin(ga)*gd,y:GY,ry:rng(3040+gi)*TAU,alpha:0.92});
  }
  for(gi=0;gi<brook.length;gi++){
    var bp=brook[gi];
    rock(w,bp[0]+0.56,bp[1]-0.20,0.13+rng(3050+gi)*0.12,gi%2?C('#8FA08A'):C('#7E8F7C'),3050+gi,{y:GY-0.03,sy:0.5,su:5,sv:3});
    rock(w,bp[0]-0.52,bp[1]+0.24,0.12+rng(3060+gi)*0.12,gi%2?C('#7E8F7C'):C('#8FA08A'),3060+gi,{y:GY-0.03,sy:0.5,su:5,sv:3});
  }
  /* 跨溪木便桥（溪流中段，桥面垂直于水流） */
  var bdg=[];
  for(bk=0;bk<5;bk++)bdg.push(xf(boxGeo(0.24,0.055,1.05,PAL.wood,{side:PAL.wood2,top:PAL.wood}),{dx:(bk-2)*0.30,dy:0.13}));
  bdg.push(xf(boxGeo(0.05,0.09,1.15,PAL.wood2),{dx:-0.52,dy:0.36}));
  bdg.push(xf(boxGeo(0.05,0.09,1.15,PAL.wood2),{dx:0.52,dy:0.36}));
  for(bk=0;bk<4;bk++){
    bdg.push(xf(prismGeo(4,0.035,0.03,0.24,PAL.wood3),{dx:(bk-1.5)*0.30,dz:-0.48,dy:0.13}));
    bdg.push(xf(prismGeo(4,0.035,0.03,0.24,PAL.wood3),{dx:(bk-1.5)*0.30,dz:0.48,dy:0.13}));
  }
  w.put(merge(bdg),{x:-1.3,z:1.4,ry:0.42,y:GY});
  shadow(w,-1.3,1.4,0.72);
  tree(w,0.7,3.7,{h:1.6,r:0.75,seed:78,blobs:6,col:C('#6BBE76'),col2:C('#549E62')});
  tree(w,-4.9,0.9,{h:1.35,r:0.66,seed:79,blobs:5,col:C('#71C277'),col2:C('#57A766')});
  tree(w,4.8,3.3,{h:1.5,r:0.70,seed:80,blobs:6,col:C('#79C67C'),col2:C('#5EAE6C')});
  bush(w,3.9,-3.5,0.50,C('#67B173'),C('#7FC786'),1303);
  bush(w,-4.7,-3.4,0.45,C('#5EA96A'),C('#75BC7C'),1304);
  for(gi=0;gi<14;gi++){
    ga=rng(3100+gi)*TAU;gd=2.2+rng(3110+gi)*3.0;
    grassTuft(w,Math.cos(ga)*gd,Math.sin(ga)*gd,gi%3?C('#5FAE6C'):C('#7FC384'),3200+gi,0.50+rng(3120+gi)*0.30);
  }

  /* 萤火虫（任务 6 只） */
  var ff=[[-2.2,-1.0],[-0.4,-1.6],[1.4,-1.9],[2.7,0.3],[0.2,1.9],[-3.0,0.9]];
  w.flies=[];
  for(i=0;i<6;i++)w.flies.push(addFly(w,ff[i][0],GY+0.7,ff[i][1],0.26));
  for(i=0;i<7;i++)mote(w,{x:-3+Math.random()*6,y:GY+0.9+Math.random()*1.4,z:-2.6+Math.random()*5,r:0.09,col:C('#EFF7C0'),a:0.5});

  /* 小生物 */
  addPet(w,{geo:mkRabbit(C('#F0E4D2'),C('#DCC9AE'),{len:0.28}),x:1.1,y:GY+0.02,z:1.9,r:0.36,
    name:'苔兔',en:'Moss Rabbit',desc:'耳朵会跟着虫声转方向。它听得见你在心里数它。',col:[240,228,210],amp:0.045,sp:2.0,where:1});
  addPet(w,{geo:mkFrog(C('#7FC28A'),C('#A8DCB0'),{len:0.22}),x:-1.75,y:GY+0.08,z:1.25,r:0.3,
    name:'溪边蛙',en:'Brook Frog',desc:'蹲在石头上，一分钟只眨一次眼。',col:[127,194,138],amp:0.02,sp:1.6,sway:0.05});
  addPet(w,{geo:mkWing(null,C('#A9825E'),C('#8E6B4C'),C('#E8C566'),{len:0.26}),x:1.9,y:GY+2.45,z:-2.5,r:0.38,
    name:'林鸮',en:'Forest Owl',desc:'在树梢值班。它觉得整片林子都是它负责的。',col:[169,130,94],amp:0.02,sp:0.9,sway:0.06});
  addPet(w,{geo:mkButterfly(C('#E8D07A'),C('#B7C878'),{len:0.15}),x:-2.9,y:GY+0.85,z:-1.3,r:0.28,
    name:'斑蝶',en:'Butterfly',desc:'循着光走，走到蘑菇上就忘了要干什么。',col:[232,208,122],amp:0.1,sp:1.7});

  w.task={label:'唤醒林间的萤火虫',sub:'轻轻碰一下它们，光就会亮起来',total:6,
    done:'整片苔林开始一闪一闪地呼吸。'};
  return w;
}

/* =============================== 场景 4：雪见小屋 =============================== */
function stoneLamp(w,x,z,y){
  var list=[];
  list.push(prismGeo(5,0.22,0.18,0.14,PAL.rockA));
  list.push(prismGeo(5,0.09,0.075,0.42,PAL.rockB));
  list.push(xf(prismGeo(5,0.26,0.2,0.12,PAL.rockA),{dy:0.55}));
  list.push(xf(prismGeo(5,0.17,0.14,0.22,C('#FFE0A8')),{dy:0.67}));
  list.push(xf(prismGeo(5,0.05,0.03,0.13,PAL.rockA),{dy:1.0}));
  var p=w.put(merge(list),{x:x,z:z,y:y||0});
  w.sprite({p:[x,y+0.78,z],r:0.62,col:C('#FFD79A'),a:0.4});
  return p;
}
function buildSnow(w){
  w.radius=6.8;w.bg=[C('#F2F6FA'),C('#CBDCE6')];w.amb=0.56;w.haze=C('#E4EEF5');w.hazeK=0.22;
  w.sun=[0.34,0.72,0.60];
  var R=5.6,TH=0.85,GY=0;
  var slab=slabGeo(R,TH,C('#F2F7FC'),C('#BCA98C'),404,{wob:0.11,n:22,taper:0.86});
  w.put(slab.geo,{x:0,z:0,y:-TH,layer:0});
  w.put(bandGeo(slab.pts,0.93,1.0,GY+0.004,C('#DFEAF3')),{layer:0});
  /* 雪堆 */
  var rr=rng(404),i,a;
  for(i=0;i<16;i++){
    a=rr()*TAU;var d=2.6+rr()*2.6;
    w.put(blobGeo(0.28+rr()*0.34,C('#FFFFFF'),{su:6,sv:4,jitter:0.24,rand:rr,sy:0.42}),
      {x:Math.cos(a)*d,z:Math.sin(a)*d,y:GY,ry:rr()*TAU,alpha:0.95});
  }
  /* 结冰的池塘 */
  w.put(discGeo(circlePts(20,2.0,1.7,0.3),0.001,GY+0.02,C('#CBE4F0'),4,C('#9FC8DE')),
    {x:1.9,z:1.9,alpha:0.88,layer:0});
  w.put(bandGeo(circlePts(20,2.0,1.7,0.3),0.94,1.0,GY+0.03,C('#FFFFFF')),{x:1.9,z:1.9,alpha:0.85,layer:0});
  for(i=0;i<5;i++){
    a=rr()*TAU;var d2=rr()*1.3;
    w.put(discGeo(circlePts(7,0.3,0.22,rr()*3),0.001,GY+0.035,C('#EAF6FD'),1),
      {x:1.9+Math.cos(a)*d2,z:1.9+Math.sin(a)*d2,alpha:0.85});
  }
  /* 松林 */
  pine(w,-4.0,-1.5,{h:2.2,seed:501,col:C('#3F6E63'),col2:C('#548073')});
  pine(w,-3.0,2.2,{h:1.8,seed:502,col:C('#456F63'),col2:C('#5A8578')});
  pine(w,2.6,-3.1,{h:2.4,seed:503,col:C('#3A665C'),col2:C('#4E7A6E')});
  pine(w,4.5,0.4,{h:2.0,seed:504,col:C('#42706A'),col2:C('#568078')});
  pine(w,0.2,-3.8,{h:2.6,seed:505,col:C('#3D6A62'),col2:C('#517D72')});
  pine(w,-1.4,-2.9,{h:1.6,seed:506,col:C('#4A7568'),col2:C('#5E8A7C')});
  tree(w,4.2,2.9,{h:1.3,r:0.55,seed:507,col:C('#7E9AA8'),col2:C('#9AB4C0')});
  /* 小屋 */
  var cab=house(w,-1.0,-0.6,{y:GY,w:2.3,d:2.0,h:1.25,roof:C('#FFFFFF'),roof2:C('#E4EEF6'),
    wall:C('#C79A6D'),wallSide:C('#AE8257'),wallTop:C('#D9B486'),ry:0.3,winOff:C('#FFD79A')});
  /* 烟囱 */
  w.put(merge([
    prismGeo(4,0.17,0.14,0.85,C('#B08A63')),
    xf(boxGeo(0.44,0.09,0.44,C('#FFFFFF'),{side:C('#E3EDF4')}),{dy:0.85})
  ]),{x:-0.78,z:-0.86,y:GY+1.72});
  var smoke=[];
  for(i=0;i<4;i++){
    (function(i){
      var s=w.sprite({p:[-0.78,GY+2.6,-0.86],r:0.3,col:C('#FFFFFF'),a:0.35,shape:'soft'});
      s.anim=function(t){
        var u=((t*0.22)+i/4)%1;
        s.p[1]=GY+2.58+u*1.8;
        s.p[0]=-0.78+Math.sin(u*3.2+i)*0.16+u*0.12;
        s.a=0.34*(1-u)*(0.5+0.5*u)*(w._smokeK||1);
        s.r=0.24+u*0.62;
      };
      smoke.push(s);
    })(i);
  }
  w.smoke=smoke;
  /* 柴火堆 */
  logPile(w,1.0,0.55,{y:GY,ry:-0.4});
  logPile(w,1.35,0.9,{y:GY,ry:0.5});
  stoneLamp(w,-2.15,1.5,GY);
  pebbles(w,530,-2.0,2.6,0.9,9,C('#DDE8F0'),0.14);
  for(i=0;i<8;i++){
    a=rr()*TAU;var d3=3.0+rr()*2.0;
    w.put(blobGeo(0.16,C('#8FA6A0'),{su:5,sv:3,jitter:0.3,rand:rr,sy:0.6}),{x:Math.cos(a)*d3,z:Math.sin(a)*d3,y:GY});
  }
  /* —— 真实化补强：雪原起伏 / 屋檐冰凌 / 足迹 / 栅栏 / 落雪 —— */
  for(i=0;i<9;i++){
    a=rr()*TAU;var dd=4.4+rr()*1.3;
    w.put(merge([
      blobGeo(0.55+rr()*0.5,C('#FFFFFF'),{su:7,sv:5,jitter:0.18,rand:rr,sy:0.30,sx:1.6,sz:1.4}),
      xf(blobGeo(0.35+rr()*0.3,C('#F4F9FD'),{su:6,sv:4,jitter:0.20,rand:rr,sy:0.26,sx:1.5,sz:1.4}),{dx:(rr()-0.5)*1.2,dz:(rr()-0.5)*1.1})
    ]),{x:Math.cos(a)*dd,z:Math.sin(a)*dd,y:GY,ry:rr()*TAU,alpha:0.97});
  }
  /* 屋檐冰凌：贴着屋脊前缘一排 */
  for(i=0;i<5;i++){
    var it=0.15+rr()*0.70;
    w.put(prismGeo(5,0.028,0.004,0.13+rr()*0.12,C('#CFE8F5'),{side:C('#E8F4FB')}),
      {x:-2.5+it*2.2,z:-0.64+it*1.6,y:GY+1.30,rx:Math.PI});
  }
  /* 雪地足迹：小屋 → 冰池，左右脚交错 */
  for(i=0;i<6;i++){
    var fpx=-0.6+i*0.47, fpz=-0.1+i*0.38, fps=(i%2?1:-1)*0.09;
    w.put(blobGeo(0.085,C('#C9D8E4'),{su:5,sv:3,jitter:0.15,rand:rr,sy:0.22,sx:1.35}),{x:fpx+fps,z:fpz,y:GY+0.012,alpha:0.7});
    w.put(blobGeo(0.085,C('#C9D8E4'),{su:5,sv:3,jitter:0.15,rand:rr,sy:0.22,sx:1.35}),{x:fpx-fps,z:fpz+0.06,y:GY+0.012,alpha:0.7});
  }
  /* 木栅栏（小屋前侧一小段） */
  var fnc=[];
  for(i=0;i<5;i++)fnc.push(xf(prismGeo(4,0.04,0.032,0.55,PAL.wood2),{dx:-1.7+i*0.5,dz:0.92+Math.sin(i*1.3)*0.06}));
  fnc.push(xf(boxGeo(2.4,0.05,0.05,PAL.wood),{dx:-0.85,dy:0.40}));
  fnc.push(xf(boxGeo(2.4,0.05,0.05,PAL.wood),{dx:-0.85,dy:0.22}));
  w.put(merge(fnc),{x:-0.4,z:0,y:GY,ry:0.12});
  logPile(w,-2.35,-1.0,{y:GY,ry:1.25});
  pine(w,3.6,3.3,{h:1.7,seed:508,col:C('#42706A'),col2:C('#568078')});
  pine(w,-4.6,-2.8,{h:1.9,seed:509,col:C('#3D6A62'),col2:C('#517D72')});
  pine(w,-2.3,3.7,{h:1.5,seed:510,col:C('#4A7568'),col2:C('#5E8A7C')});
  snowField(w,{n:56,rad:5.8,top:4.8,seed:515});

  /* 任务：5 根柴火 */
  var fw=[[-2.6,0.2],[-3.3,-1.0],[0.3,2.2],[-1.9,2.9],[2.4,-1.6]];
  for(i=0;i<5;i++){
    var g=merge([prismGeo(5,0.075,0.065,0.62,C('#A9764C'),{rot:0})]);
    addTrash(w,{geo:g,x:fw[i][0],z:fw[i][1],y:GY+0.07,r:0.36,ry:rr()*TAU,spin:0.35});
  }
  /* 小生物 */
  addPet(w,{geo:mkRabbit(C('#FFFFFF'),C('#E9F2F8'),{len:0.29}),x:2.2,y:GY+0.02,z:0.1,r:0.36,
    name:'雪兔',en:'Snow Hare',desc:'冬天把外套换成纯白，只留一双黑眼睛露在外面。',col:[255,255,255],amp:0.05,sp:2.2,where:1});
  addPet(w,{geo:mkCat(C('#E0913F'),C('#F5D9B8'),{len:0.36}),x:1.1,y:GY+0.02,z:2.6,r:0.42,
    name:'红狐',en:'Red Fox',desc:'每天傍晚从林子那头过来，绕着屋子转一圈再走。',col:[224,145,63],amp:0.03,sp:1.3,sway:0.25,where:1});
  addPet(w,{geo:mkWing(null,C('#8FA8B8'),C('#6D8798'),C('#E8C265'),{len:0.24}),x:0.3,y:GY+2.45,z:-0.9,r:0.36,
    name:'小山雀',en:'Chickadee',desc:'蹲在烟囱边上取暖。它觉得烟是云的亲戚。',col:[143,168,184],amp:0.03,sp:1.6,sway:0.1});
  addPet(w,{geo:mkRabbit(C('#EAF0F5'),C('#D3DEE7'),{len:0.24}),x:-2.8,y:GY+0.02,z:-1.9,r:0.3,
    name:'雪兔',en:'Snow Hare',desc:'冬天把外套换成纯白，只留一双黑眼睛露在外面。',col:[255,255,255],amp:0.04,sp:2.6,where:1});
  for(i=0;i<5;i++)mote(w,{x:-3+Math.random()*6,y:GY+0.8+Math.random()*1.6,z:-2.5+Math.random()*5,r:0.07,col:C('#FFFFFF'),a:0.5});
  w.task={label:'往炉子里添柴',sub:'捡起 5 根柴火，屋子就会暖起来',total:5,
    done:'炉火旺了，烟囱冒起了长长的烟。'};
  return w;
}

/* =============================== 场景 5：星沉小池 =============================== */
function addPaperLamp(w,x,z,k,GY){
  var list=[];
  list.push(prismGeo(6,0.13,0.11,0.16,C('#F6E9CE')));
  list.push(xf(prismGeo(6,0.125,0.125,0.02,C('#F6E9CE')),{dy:0.16}));
  var p=w.put(merge(list),{x:x,z:z,y:GY+0.02});
  var s=w.sprite({p:[x,GY+0.12,z],r:0.3,col:C('#FFE2A8'),a:0.0});
  var st={lit:false,u:0,x0:x,z0:z,ph:k*0.9};
  p.anim=function(t){
    if(st.lit){
      st.u=Math.min(1,st.u+0.012);
      var ang=st.ph+t*0.11;
      var rad=0.5+st.u*1.5;
      p.x=lerp(st.x0,-0.55+Math.cos(ang)*rad,st.u);
      p.z=lerp(st.z0,0.15+Math.sin(ang)*rad*1.05,st.u);
      p.y=GY+0.045+Math.sin(t*1.5+st.ph)*0.012;
      p.ry=t*0.25;
    }else p.y=GY+0.02+Math.sin(t*1.5+st.ph)*0.008;
  };
  s.anim=function(t){
    if(!st.lit){s.a=0;return;}
    s.p[0]=p.x;s.p[1]=GY+0.13;s.p[2]=p.z;
    s.a=0.55*(0.7+0.3*Math.sin(t*2.4+st.ph));
  };
  w.pick({get:function(){return [p.x,p.y+0.2,p.z];},r:0.4,kind:'lamp2',part:p,lamp:st,glow:s,
    on:function(){st.lit=true;s.a=0.5;}});
  return p;
}
function buildPond(w){
  w.radius=6.8;w.night=true;w.bg=[C('#1B2C46'),C('#41627A')];w.amb=0.34;w.haze=C('#2C4763');w.hazeK=0.30;
  w.sun=[-0.40,0.74,0.52];
  var R=5.4,TH=0.8,GY=0,i,a,k2;
  var slab=slabGeo(R,TH,C('#7FA271'),C('#8E7250'),505,{wob:0.11,n:22,taper:0.86});
  w.put(slab.geo,{x:0,z:0,y:-TH,layer:0});
  w.put(bandGeo(slab.pts,0.93,1.0,GY+0.004,C('#8FB383')),{layer:0});
  /* 池塘 */
  w.put(discGeo(circlePts(22,2.35,2.0,0.2),0.001,GY+0.008,C('#5E7F63'),3,C('#4B6A55')),
    {x:-0.55,z:0.15,alpha:0.9,layer:0});
  w.put(discGeo(circlePts(22,2.15,1.82,0.2),0.001,GY+0.06,C('#2F6F8E'),4,C('#17415C')),
    {x:-0.55,z:0.15,alpha:0.92,layer:0});
  w.put(bandGeo(circlePts(22,2.15,1.82,0.2),0.94,1.0,GY+0.075,C('#CBEBF3')),{x:-0.55,z:0.15,alpha:0.5,layer:0});
  var pk=rng(909);
  for(k2=0;k2<14;k2++){
    var ka=k2/14*TAU+0.15, kd=2.30+pk()*0.16;
    rock(w,-0.55+Math.cos(ka)*kd,0.15+Math.sin(ka)*kd*0.86,0.26+pk()*0.22,
      pk()>0.5?C('#6E7F72'):C('#849383'),931+k2,{y:GY-0.06,su:5,sv:3,sy:0.6});
  }
  ripples(w,-0.55,0.15,GY+0.066,2.0,C('#CFEAF2'),4.4,0.15,3);
  /* 荷叶与荷花 */
  var lot=[[-1.6,0.9],[-0.2,-0.6],[0.55,0.75],[-1.95,0.35],[0.3,1.35],[-0.9,-1.35],[1.1,0.05]];
  for(i=0;i<lot.length;i++)lotusLeaf(w,lot[i][0],lot[i][1],0.34+((i%3)*0.09),C('#589A6E'),GY+0.055);
  for(i=0;i<2;i++){
    var lx=[-1.0,-2.1][i],lz=[1.1,-0.35][i];
    var lf=merge([
      prismGeo(5,0.03,0.026,0.3,C('#6FA97C')),
      xf(sphereGeo(0.13,6,4,C('#F6A6BE'),{sy:0.7}),{dy:0.3}),
      xf(prismGeo(6,0.07,0.01,0.13,C('#FBD3E0')),{dy:0.4})
    ]);
    w.put(lf,{x:lx,z:lz,y:GY+0.08});
  }
  /* 芦苇 */
  for(i=0;i<32;i++){
    a=rng(600+i)()*TAU;var d=2.2+rng(700+i)()*1.1;
    grassTuft(w,-0.55+Math.cos(a)*d,0.15+Math.sin(a)*d*0.86,i%3?C('#5C8560'):C('#6E9670'),900+i,0.5+rng(800+i)()*0.35);
  }
  /* 木台 + 石灯笼 + 樱花树 */
  woodDeckExt(w,0.0,2.62,0,0,GY);
  stoneLamp(w,2.35,2.35,GY);
  tree(w,2.9,-1.9,{h:1.5,r:0.85,seed:601,blobs:6,col:C('#E9A8C0'),col2:C('#F2C2D4')});
  tree(w,-3.6,-2.0,{h:1.3,r:0.7,seed:602,blobs:5,col:C('#6F9E78'),col2:C('#87B58C')});
  bush(w,-3.0,1.9,0.5,C('#5E8C68'),C('#74A37C'),603);
  pebbles(w,610,-3.2,-0.6,1.2,14,C('#7C9478'),0.16);
  /* 小生物 */
  addPet(w,{geo:mkFish(C('#F0F0EA'),C('#E2825E'),C('#F6D9CB'),{len:0.44}),x:-0.2,y:GY+0.14,z:0.4,r:0.4,
    name:'锦鲤',en:'Koi',desc:'水里最安静的一条。它记得每一个喂过它的人。',col:[240,240,234],amp:0.05,sp:1.9,sway:0.55,where:1});
  addPet(w,{geo:mkFish(C('#E8825E'),C('#F6C9A8'),C('#F7E0D0'),{len:0.36}),x:-1.3,y:GY+0.18,z:-0.2,r:0.34,
    name:'锦鲤',en:'Koi',desc:'水里最安静的一条。它记得每一个喂过它的人。',col:[232,130,94],amp:0.06,sp:2.3,sway:0.55,where:1});
  addPet(w,{geo:mkFrog(C('#6E9E76'),C('#9CC79F'),{len:0.22}),x:-1.6,y:GY+0.1,z:0.9,r:0.3,
    name:'荷叶上的蛙',en:'Lotus Frog',desc:'占了一片最大的叶子，谁也不让。',col:[110,158,118],amp:0.025,sp:1.4,sway:0.06});
  addPet(w,{geo:mkCat(C('#6C7280'),C('#98A0AC'),{len:0.34}),x:0.15,y:GY+0.09,z:3.05,r:0.44,
    name:'守月的猫',en:'Moon Cat',desc:'每天晚上坐在台上，等月亮掉进水里。',col:[108,114,128],amp:0.02,sp:0.9,sway:0.35});
  addPet(w,{geo:mkRabbit(C('#D9C7AE'),C('#C2AD90'),{len:0.24}),x:3.4,y:GY+0.02,z:0.6,r:0.3,
    name:'夜兔',en:'Night Rabbit',desc:'只在夜里出来，专挑月光最白的那条路走。',col:[217,199,174],amp:0.05,sp:2.0,where:1});
  for(i=0;i<10;i++)mote(w,{x:-4+Math.random()*8,y:GY+0.8+Math.random()*1.6,z:-3+Math.random()*7,r:0.09,col:C('#EAF7C0'),a:0.65});
  /* —— 真实化补强：月亮与星群 / 水面月影 / 池心深水 / 更密的芦苇 —— */
  w.sprite({p:[-3.6,4.8,-3.2],r:2.1,col:C('#9FC0E8'),a:0.26,shape:'soft'});
  w.sprite({p:[-3.6,4.8,-3.2],r:1.02,col:C('#EAF3FF'),a:0.95,shape:'soft'});
  for(i=0;i<18;i++){
    (function(k){
      var sa=rng(2000+k)*TAU, sd=6.5+rng(2100+k)*3.5;
      var st=w.sprite({p:[Math.cos(sa)*sd,3.6+rng(2200+k)*3.2,Math.sin(sa)*sd],
        r:0.05+rng(2300+k)*0.05,col:C('#EAF2FF'),a:0.5});
      var ph=rng(2500+k)*7;
      st.anim=function(t){st.a=0.28+0.42*Math.abs(Math.sin(t*0.7+ph));};
    })(i);
  }
  /* 池心深水 + 月亮的倒影 */
  w.put(discGeo(circlePts(18,1.3,1.12,0.2),0.001,GY+0.062,C('#24455C'),3),{x:-0.55,z:0.15,alpha:0.85,layer:0});
  var mir=w.sprite({p:[-1.15,GY+0.09,0.50],r:0.52,col:C('#CFE6F2'),a:0.30,shape:'soft'});
  mir.anim=function(t){mir.a=0.22+0.10*Math.sin(t*0.9);};
  for(i=0;i<3;i++)ripples(w,-0.55,0.15,GY+0.07,2.3,C('#A9CBE0'),6.2,0.5*i,2);
  /* 更多的荷叶与芦苇 */
  for(i=0;i<5;i++)lotusLeaf(w,-0.55+Math.cos(i*1.3)*1.6,0.15+Math.sin(i*1.3)*1.3,0.30+i*0.04,C('#4F8F63'),GY+0.055);
  for(i=0;i<10;i++){
    var ra=rng(2600+i)*TAU,rd=2.6+rng(2700+i)*0.7;
    grassTuft(w,-0.55+Math.cos(ra)*rd,0.15+Math.sin(ra)*rd*0.86,i%3?C('#4E7A54'):C('#5E8C63'),2600+i,0.55+rng(2800+i)*0.3);
  }
  stoneLamp(w,-2.15,1.30,GY);

  /* 任务：放 5 盏纸灯 */
  var pl=[[2.15,1.0],[2.6,1.55],[1.55,1.75],[2.9,0.5],[1.15,1.15]];
  w.papers=[];
  for(i=0;i<5;i++)w.papers.push(addPaperLamp(w,pl[i][0],pl[i][1],i,GY));
  w.task={label:'放走一盏盏纸灯',sub:'点一下岸边的纸灯，让它漂到水上去',total:5,
    done:'五盏灯在水面上一圈一圈地转，像几颗不肯沉的星星。'};
  return w;
}
function woodDeckExt(w,x,z,y0,len,GY){
  var list=[],i,n=6;
  for(i=0;i<n;i++){
    list.push(xf(boxGeo(1.5,0.08,0.3,PAL.wood,{side:PAL.wood2}),{dz:(i-(n-1)/2)*0.36}));
  }
  for(i=0;i<2;i++){
    list.push(xf(prismGeo(4,0.07,0.055,0.5,PAL.wood3),{dx:0.62,dz:(i?1:-1)*0.9,dy:-0.5}));
    list.push(xf(prismGeo(4,0.07,0.055,0.5,PAL.wood3),{dx:-0.62,dz:(i?1:-1)*0.9,dy:-0.5}));
  }
  return w.put(merge(list),{x:x,y:GY,z:z,ry:0.18});
}

/* =============================== 场景 6：云上梯田 =============================== */
function buildTerrace(w){
  w.radius=7.4;w.bg=[C('#FAF0E4'),C('#E6E5DA')];w.amb=0.54;w.haze=C('#EFE6DA');w.hazeK=0.20;
  w.sun=[-0.52,0.70,0.40];
  var TH=0.5,i,a;
  var base=slabGeo(5.6,TH,C('#C9B489'),C('#A98A63'),606,{wob:0.07,n:24,taper:0.82});
  w.put(base.geo,{x:0,z:0,y:-TH,layer:0});
  var levels=[
    {r:4.6,y:0.00,top:C('#B99C74'),side:C('#9C7E58'),wob:0.08,seed:611},
    {r:3.5,y:0.46,top:C('#BFA27A'),side:C('#9F8159'),wob:0.09,seed:612},
    {r:2.4,y:0.92,top:C('#C4A87F'),side:C('#A3855D'),wob:0.10,seed:613},
    {r:1.4,y:1.38,top:C('#C9AE85'),side:C('#A88A62'),wob:0.12,seed:614}
  ];
  for(i=0;i<levels.length;i++){
    var L=levels[i];
    var sl=slabGeo(L.r,0.5,L.top,L.side,L.seed,{wob:L.wob,n:20,taper:0.9});
    w.put(sl.geo,{x:0,z:0,y:L.y,layer:0});
    /* 水田 */
    var wat=w.put(discGeo(circlePts(18,L.r*0.9,L.r*0.87,0.25),0.001,L.y+0.515,C('#7ECDDC'),3,C('#4FA6B8')),
      {x:0,z:0,alpha:0.34,layer:0});
    w.put(bandGeo(circlePts(18,L.r*0.9,L.r*0.87,0.25),0.93,1.0,L.y+0.525,C('#CBE4DC')),{x:0,z:0,alpha:0.45,layer:0});
    w.levels=w.levels||[];w.levels.push(wat);
    ripples(w,0,0,L.y+0.53,L.r*0.78,C('#E4F8F8'),5.6,i*0.3,2);
    /* 田埂上的稻子 */
    for(var k=0;k<44;k++){
      var aa=k/30*TAU + i*0.3;
      riceTuft(w,Math.cos(aa)*L.r*0.955,Math.sin(aa)*L.r*0.88,700+i*40+k,0.46+((k*7)%5)*0.07);
    }
    /* 阶梯 */
    if(i<3){
      w.put(merge([
        xf(boxGeo(0.55,0.16,0.34,C('#B08F66'),{side:C('#93764F')}),{}),
        xf(boxGeo(0.55,0.16,0.34,C('#B08F66'),{side:C('#93764F')}),{dy:0.16,dz:-0.3})
      ]),{x:-L.r*0.62,y:L.y+0.5,z:L.r*0.5,ry:0.5});
    }
  }
  /* 水车：圆盘与辐条在同一几何里，整轮绕自身轴转 */
  var wg=[],i2;
  for(i2=0;i2<8;i2++){
    var th0=i2/8*TAU;
    wg.push(xf(xf(prismGeo(4,0.075,0.065,0.62,C('#C9A87C')),{rz:-1.5708}),{ry:th0}));
    wg.push(xf(xf(boxGeo(0.26,0.30,0.10,C('#B08F66'),{side:C('#9C7E58')}),{dy:-0.15}),
      {ry:th0,dx:Math.cos(th0)*0.56,dz:Math.sin(th0)*0.56}));
  }
  wg.push(xf(prismGeo(8,0.16,0.16,0.26,C('#8F7150')),{dy:-0.13}));
  var wheel=w.put(xf(merge(wg),{rz:1.5708}),{x:-3.55,y:1.12,z:-1.25});
  wheel.anim=function(t){wheel.rx=t*0.55;};
  w.put(xf(prismGeo(4,0.09,0.08,0.34,C('#8F7150')),{rz:-1.5708}),{x:-3.55,y:1.12,z:-1.25});
  w.sprite({p:[-3.0,0.95,-1.7],r:0.55,col:C('#EAF7F8'),a:0.35});
  /* 小屋 */
  house(w,0.5,0.5,{y:1.9,w:1.0,d:0.9,h:0.62,roof:C('#6B7F62'),roof2:C('#83987A'),
    wall:C('#EADFC6'),wallSide:C('#D6C8A9'),wallTop:C('#E3D8BE'),ry:-0.6,winOff:C('#FFE3A6')});
  /* 云 */
  var clouds=[];
  for(i=0;i<24;i++){
    (function(i){
      var aa3=i/18*TAU+0.2, d=(6.1+((i*13)%7)*0.24);
      var cg=glowGeo(blobGeo(0.66+((i*7)%5)*0.15,C('#FFFFFF'),{su:8,sv:5,jitter:0.13,rand:rng(800+i),sy:0.5,sx:1.25,sz:1.15}));
      var c=w.put(cg,{x:Math.cos(aa3)*d,z:Math.sin(aa3)*d,y:-0.62+((i*5)%4)*0.16,alpha:0.95});
      c.anim=function(t){c.ry=t*0.02+i;c.x=Math.cos(aa3+t*0.015)*d;c.z=Math.sin(aa3+t*0.015)*d;};
      clouds.push(c);
    })(i);
  }
  for(i=0;i<10;i++)mote(w,{x:-4+Math.random()*8,y:0.4+Math.random()*1.6,z:-4+Math.random()*8,r:0.1,col:C('#FFFDF2'),a:0.35});
  /* 任务：开水闸 */
  var gates=[[-3.2,3.3,0],[-2.5,2.45,1],[1.7,1.7,2],[1.0,0.98,3],[-1.2,-3.29,1]];
  for(i=0;i<gates.length;i++){
    (function(i){
      var gx=gates[i][0],gz=gates[i][1],lv=gates[i][2];
      var y=0.5+lv*0.46;
      var g=merge([
        prismGeo(4,0.1,0.09,0.34,C('#8F7150')),
        xf(boxGeo(0.44,0.1,0.3,C('#B99C74'),{side:C('#9C7E58')}),{dy:0.14})
      ]);
      var p=w.put(g,{x:gx,z:gz,y:y,ry:i*0.7});
      w.pick({get:function(){return [p.x,p.y+0.3,p.z];},r:0.46,kind:'gate',part:p,
        on:function(){
          p.ry+=(i+1)*0.5;p.y=y-0.10;
          var lvPart=w.levels?w.levels[lv]:null;
          if(lvPart)lvPart.alpha=Math.min(0.72,lvPart.alpha+0.34);
        }});
    })(i);
  }
  /* —— 真实化补强：稻草人 / 谷堆 / 水田波光 / 低空云带 —— */
  var sc2=[];
  sc2.push(prismGeo(4,0.055,0.04,0.80,PAL.wood3));
  sc2.push(xf(boxGeo(0.85,0.06,0.06,PAL.wood2),{dy:0.58}));
  sc2.push(xf(sphereGeo(0.10,6,4,C('#D9B36A'),{}),{dy:0.86}));
  sc2.push(xf(prismGeo(8,0.19,0.15,0.07,C('#B08A5A')),{dy:0.94}));
  sc2.push(xf(boxGeo(0.34,0.30,0.22,C('#C97C55'),{side:C('#A9664A')}),{dy:0.32}));
  w.put(merge(sc2),{x:-0.62,z:-0.66,y:1.88,ry:0.5});
  shadow(w,-0.62,-0.66,0.30);
  w.put(prismGeo(7,0.34,0.05,0.42,C('#D9C46A'),{side:C('#C4AE58')}),{x:1.65,z:-0.85,y:1.88,ry:0.8});
  w.put(prismGeo(7,0.27,0.04,0.34,C('#D9C46A'),{side:C('#C4AE58')}),{x:-1.85,z:0.95,y:1.42,ry:2.1});
  for(i=0;i<4;i++){
    (function(k){
      var sp3=w.sprite({p:[Math.cos(k*1.7)*levels[k].r*0.5,levels[k].y+0.53,Math.sin(k*1.7)*levels[k].r*0.5],r:0.30,col:C('#EAF9FF'),a:0});
      var ph3=k*1.3;
      sp3.anim=function(t){sp3.a=0.26*(0.5+0.5*Math.sin(t*1.4+ph3));};
    })(i);
  }
  for(i=0;i<10;i++){
    var ca2=i/10*TAU+0.6, cd2=7.6+((i*7)%5)*0.3;
    w.put(glowGeo(blobGeo(0.9+((i*3)%4)*0.2,C('#F2F0E8'),{su:8,sv:5,jitter:0.12,rand:rng(2900+i),sy:0.45,sx:1.3,sz:1.2})),
      {x:Math.cos(ca2)*cd2,z:Math.sin(ca2)*cd2,y:-1.15,alpha:0.9,layer:0});
  }

  /* 小生物 */
  addPet(w,{geo:mkWing(null,C('#F4F1E6'),C('#D6D2C2'),C('#E8A24E'),{len:0.28}),x:-1.6,y:2.7,z:1.4,r:0.38,
    name:'云雀',en:'Sky Lark',desc:'只在云散开的那几分钟唱歌。',col:[244,241,230],amp:0.2,sp:0.9,sway:0.28});
  addPet(w,{geo:mkButterfly(C('#F0D07A'),C('#EFAE62'),{len:0.16}),x:1.9,y:1.5,z:-1.3,r:0.3,
    name:'斑蝶',en:'Butterfly',desc:'顺着水汽往上飞，飞一层梯田歇一会。',col:[240,208,122],amp:0.12,sp:1.7});
  addPet(w,{geo:mkFrog(C('#7FA85E'),C('#A9C780'),{len:0.22}),x:0.9,y:0.02,z:2.6,r:0.3,
    name:'田蛙',en:'Paddy Frog',desc:'负责整片梯田的晚间广播。',col:[127,168,94],amp:0.02,sp:1.5,sway:0.05});
  addPet(w,{geo:mkRabbit(C('#D9C7A6'),C('#C4AF8B'),{len:0.26}),x:-1.2,y:0.02,z:-2.6,r:0.32,
    name:'田埂兔',en:'Ridge Rabbit',desc:'沿着田埂一路小跑，从不踩坏一棵稻子。',col:[217,199,166],amp:0.05,sp:2.1,where:1});
  w.task={label:'把水引进田里',sub:'打开 5 处水闸，让水往下流',total:5,
    done:'五层梯田都盛满了水，把晨光反射到天上去了。'};
  return w;
}

var SCENES=[
  {id:'tidal',no:'01',en:'TIDAL GARDEN',cn:'潮汐之庭',sub:'Your own little coastline',
   desc:'三汪浅浅的潮池，几丛珊瑚，一只总在打盹的八爪鱼。捡掉沙上的碎片，海就干净一点。',
   accent:'#4BA8B8',mood:'清晨 · 海风',
   amb:'tidal',cam:{yaw:0.72,pitch:0.56,tx:0,ty:0.55,tz:0},build:buildTidal},
  {id:'isle',no:'02',en:'SUNLIT ISLE',cn:'暖屿',sub:'An island small enough to hold',
   desc:'棕榈、栈道、一座总在冒炊烟的小屋。天快黑了，把岛上的灯笼一盏盏点亮。',
   accent:'#E2884F',mood:'黄昏 · 炊烟',
   amb:'isle',cam:{yaw:0.62,pitch:0.5,tx:0,ty:0.5,tz:0.8},build:buildIsle},
  {id:'grove',no:'03',en:'MOSSY GROVE',cn:'苔林微光',sub:'Where the light learns to breathe',
   desc:'溪水穿过苔石，蘑菇撑着小伞。林子里有几只还没醒的萤火虫，等你去叫醒它们。',
   accent:'#5FA96A',mood:'午后 · 溪声',
   amb:'grove',cam:{yaw:0.85,pitch:0.52,tx:0,ty:0.5,tz:0},build:buildGrove},
  {id:'snow',no:'04',en:'SNOWLIGHT CABIN',cn:'雪见小屋',sub:'A very quiet afternoon',
   desc:'松林静得听得见雪落。屋里炉火有点弱，去捡几根柴火添进去吧。',
   accent:'#7D9CB8',mood:'落雪 · 炉火',
   amb:'snow',cam:{yaw:0.66,pitch:0.54,tx:0,ty:0.7,tz:0},build:buildSnow},
  {id:'pond',no:'05',en:'STARFALL POND',cn:'星沉小池',sub:'Lanterns that refuse to sink',
   desc:'荷花开了，月亮掉进水里。点亮岸边的纸灯，让它一圈圈地漂出去。',
   accent:'#6E7FC4',mood:'月夜 · 蛙鸣',
   amb:'pond',cam:{yaw:0.8,pitch:0.5,tx:0,ty:0.6,tz:0},build:buildPond},
  {id:'terrace',no:'06',en:'CLOUD TERRACE',cn:'云上梯田',sub:'Water, one step at a time',
   desc:'五层梯田浮在云上，水车慢慢转。打开水闸，让水一层一层流下去。',
   accent:'#8FB46A',mood:'云上 · 晨光',
   amb:'terrace',cam:{yaw:0.7,pitch:0.5,tx:0,ty:0.95,tz:0},build:buildTerrace},
  {id:'oasis',no:'07',en:'OASIS DUSK',cn:'沙漠绿洲',sub:'A green thing in the middle of nowhere',
   desc:'沙丘一层压着一层，中间却藏着一汪水。四棵树快渴死了，把水囊里的水倒给它们。',
   accent:'#D9A05B',mood:'沙丘 · 驼铃',
   amb:'oasis',cam:{yaw:0.74,pitch:0.52,tx:0,ty:0.6,tz:0},build:buildOasis},
  {id:'bamboo',no:'08',en:'BAMBOO PATH',cn:'竹海小径',sub:'Every stalk keeps a different note',
   desc:'石阶被竹子围住，中间一条溪。五根竹筒的音都不一样，敲一敲，凑一段山里的调子。',
   accent:'#7BAE5E',mood:'竹叶 · 山调',
   amb:'bamboo',cam:{yaw:0.80,pitch:0.50,tx:0,ty:0.55,tz:0},build:buildBamboo},
  {id:'roof',no:'09',en:'RAINY ROOFTOP',cn:'雨夜天台',sub:'Lights strung up against the rain',
   desc:'城市在楼下亮着，雨落在天台的砖上。挂一串灯吧，雨里有灯就没那么冷了。',
   accent:'#DFA066',mood:'雨夜 · 灯火',
   amb:'roof',cam:{yaw:0.70,pitch:0.46,tx:0,ty:0.9,tz:0},build:buildRoof}
];

/* =============================== 场景 7：沙漠绿洲 =============================== */
function buildOasis(w){
  w.radius=7.4;w.bg=[C('#FCEAC6'),C('#EFC085')];w.amb=0.52;w.haze=C('#F5E0B8');w.hazeK=0.24;
  w.sun=[0.46,0.58,0.42];
  var R=6.9,TH=0.9,GY=0,i,k;
  var slab=slabGeo(R,TH,C('#EFD9A6'),C('#C9A876'),707,{wob:0.11,n:24,taper:0.86});
  w.put(slab.geo,{x:0,z:0,y:-TH,layer:0});
  w.put(bandGeo(slab.pts,0.94,1.0,GY+0.004,C('#F4E3BC')),{layer:0});
    sandMound(w,2.1,-5.3,0.94,C('#EBD49A'),C('#DFC084'),716);
  pebbles(w,710,0.3,0.5,4.6,24,C('#E2C994'),0.22);

  pebbles(w,710,0.3,0.5,4.6,24,C('#E2C994'),0.22);

  /* 沙丘：贴着岛缘一圈，低矮的脊 */
  sandMound(w,-4.9,2.7,1.05,C('#EFD8A2'),C('#E3C68C'),711);
  sandMound(w,5.3,-1.5,0.95,C('#EDD79E'),C('#E0C286'),712);
  sandMound(w,-1.5,-5.1,0.88,C('#F0DAA6'),C('#E5C990'),713);
  sandMound(w,3.9,4.1,0.82,C('#EBD49A'),C('#DFC084'),714);
  sandMound(w,-5.4,-2.6,0.72,C('#EED7A0'),C('#E2C58B'),715);

  /* 绿洲水池 */
  pool(w,0,-0.5,2.0,GY,{col:C('#6FC9DC'),deep:C('#3F9FB6'),seed:715,rocks:7,alpha:0.9});

  /* 棕榈（垂坠长叶版，同暖屿） */
  palm(w,-1.9,-1.6,{h:2.7,seed:720,fronds:9,lean:0.30,frondLen:1.30,droop:1.06});
  palm(w,2.1,-1.9,{h:2.4,seed:721,fronds:8,lean:-0.32,leanZ:0.15,frondLen:1.15,droop:1.04});
  palm(w,1.0,1.7,{h:2.1,seed:722,fronds:8,lean:0.22,frondLen:1.05,droop:1.05});
  palm(w,-3.9,-0.9,{h:2.3,seed:723,fronds:8,lean:-0.26,leanZ:-0.2,frondLen:1.10,droop:1.05});
  palm(w,3.6,0.7,{h:2.0,seed:724,fronds:7,lean:0.24,frondLen:1.0,droop:1.02});

  /* 水边芦苇 */
  for(k=0;k<18;k++){
    var a0=k/18*TAU+0.5;
    grassTuft(w,Math.cos(a0)*2.45,Math.sin(a0)*2.30-0.5,C('#BFCB84'),730+k,0.44);
  }
  /* 仙人掌 */
  cactus(w,-4.0,-1.9,{h:1.55,seed:740});
  cactus(w,4.2,2.1,{h:1.15,seed:741,arms:1});
  cactus(w,-3.3,3.5,{h:0.92,seed:742,arms:1});
  cactus(w,5.0,-3.0,{h:0.78,seed:743,arms:1});

  /* 陶罐 */
  clayPot(w,2.9,1.0,{r:0.22,h:0.38,ry:0.4});
  clayPot(w,-2.6,0.3,{r:0.18,h:0.30,ry:-0.6,col:C('#B96F4C')});

  /* 石圈 + 小花 */
  for(i=0;i<7;i++){
    var aa=i/7*TAU+0.3;
    rock(w,Math.cos(aa)*2.8,-0.5+Math.sin(aa)*2.65,0.22+rng(i*3)()*0.14,C('#D8C094'),750+i,{y:GY-0.06,sy:0.6,su:5,sv:3});
  }
  for(i=0;i<7;i++){
    var af=i/7*TAU+0.9;
    flower(w,Math.cos(af)*3.9,Math.sin(af)*3.6,0.26,C('#E8794F'),C('#FFE6A8'),760+i);
  }

  /* —— 真实化补强：沙纹等高线 / 营地帐篷与篝火 / 水面波光 —— */
  for(k=0;k<4;k++){
    w.put(bandGeo(circlePts(26,3.1+k*1.05,2.9+k*1.0,0.2),0.985,1.0,GY+0.006,C(k%2?'#E8D39E':'#E3CC92')),
      {x:0,z:0,alpha:0.28,layer:0});
  }
  var tx=-3.1,tz=3.8;
  var tg=Geo();
  var t1=P(tg,-0.6,0,-0.5),t2=P(tg,0.6,0,-0.5),t3=P(tg,0.6,0,0.55),t4=P(tg,-0.6,0,0.55);
  var r1=P(tg,0,0.82,-0.5),r2=P(tg,0,0.82,0.55);
  tri(tg,t2,t1,r1,C('#D98A5F'),1);
  quad(tg,t1,r1,r2,t4,C('#C97C55'),1);
  quad(tg,t2,r1,r2,t3,C('#D98A5F'),1);
  tri(tg,t3,r2,t4,C('#B9664A'),1);
  w.put(tg,{x:tx,z:tz,y:GY,ry:0.6});
  shadow(w,tx,tz,0.85);
  for(i=0;i<6;i++){
    var fa=i/6*TAU;
    rock(w,tx+1.5+Math.cos(fa)*0.24,tz-0.2+Math.sin(fa)*0.22,0.10+rng(3400+i)*0.06,C('#C9A876'),3400+i,{y:GY-0.02,sy:0.6,su:5,sv:3});
  }
  w.put(merge([
    xf(prismGeo(4,0.03,0.02,0.42,PAL.wood3),{rz:1.2,dx:0.05,dz:0.05,dy:0.06}),
    xf(prismGeo(4,0.03,0.02,0.42,PAL.wood2),{rz:-1.15,dx:-0.05,dz:-0.04,dy:0.06})
  ]),{x:tx+1.5,z:tz-0.2,y:GY});
  var fire=w.sprite({p:[tx+1.5,GY+0.22,tz-0.2],r:0.30,col:C('#FF9E4D'),a:0.7,shape:'soft'});
  fire.anim=function(t){fire.a=0.55+0.25*Math.sin(t*6.3)+0.1*Math.sin(t*11);fire.r=0.26+0.06*Math.sin(t*5.1);};
  w.sprite({p:[tx+1.5,GY+0.34,tz-0.2],r:0.5,col:C('#FFD9A0'),a:0.22,shape:'soft'});
  for(i=0;i<4;i++){
    (function(k){
      var spk=w.sprite({p:[Math.cos(k*1.9)*1.1,GY+0.06,Math.sin(k*1.9)*1.0-0.5],r:0.26,col:C('#BFF0F5'),a:0});
      var ph2=k*1.1;
      spk.anim=function(t){spk.a=0.22*(0.5+0.5*Math.sin(t*1.6+ph2));};
    })(i);
  }

  /* 任务：给四棵枯树浇水 */
  w.task={label:'给沙里的树浇水',sub:'点一下枯树，把水囊里的水倒给它',total:4,
    done:'四棵树都抽出了新叶，绿洲又往外挪了一点。'};
  var spots=[[-2.6,-2.7],[2.8,-2.6],[-3.8,1.0],[3.4,-0.3]];
  for(k=0;k<spots.length;k++){
    (function(k){
      var sx=spots[k][0],sz=spots[k][1];
      /* 树干 + 几根垂下来的光枝（枯树就该是「光秃秃+耷拉」的样子） */
      function trunk(){
        return [
          prismGeo(5,0.105,0.058,1.72,C('#A67C4E')),
          xf(prismGeo(4,0.044,0.024,0.80,C('#9E7449')),{rz:2.05,dx:0.10,dy:1.64}),
          xf(prismGeo(4,0.040,0.022,0.72,C('#9E7449')),{rz:-2.20,dx:-0.08,dy:1.56}),
          xf(prismGeo(4,0.034,0.020,0.60,C('#A67C4E')),{rz:1.15,dx:0.16,dy:1.70,dz:0.12}),
          xf(prismGeo(4,0.030,0.018,0.52,C('#A67C4E')),{rz:-1.05,dx:-0.14,dy:1.44,dz:-0.16}),
          xf(prismGeo(4,0.026,0.016,0.42,C('#A67C4E')),{rz:2.45,dx:0.02,dy:1.34,dz:0.20})
        ];
      }
      /* 枯：只有枝，没有冠 */
      var dry=merge(trunk().concat([
        xf(prismGeo(4,0.020,0.012,0.24,C('#8E6A44')),{rz:-2.35,dx:0.24,dy:1.36,dz:-0.14})
      ]));
      /* 浇过水：抽出新叶 */
      var lush=merge(trunk().concat([
        xf(blobGeo(0.60,C('#6FBF6E'),{su:7,sv:5,jitter:0.26,rand:rng(790+k),sy:0.82}),{dy:1.84}),
        xf(blobGeo(0.44,C('#8FD685'),{su:6,sv:4,jitter:0.26,rand:rng(800+k),sy:0.82}),{dx:0.34,dy:2.06,dz:-0.16}),
        xf(blobGeo(0.36,C('#A9E39B'),{su:6,sv:4,jitter:0.26,rand:rng(810+k),sy:0.82}),{dx:-0.30,dy:2.00,dz:0.24}),
        xf(blobGeo(0.28,C('#B9EBA8'),{su:5,sv:3,jitter:0.26,rand:rng(815+k),sy:0.82}),{dx:0.06,dy:2.40,dz:0.04})
      ]));
      var p=w.put(dry,{x:sx,z:sz,y:GY});
      shadow(w,sx,sz,0.50);
      w.pick({get:function(){return [sx,GY+1.0,sz];},r:0.62,kind:'task',part:p,
        on:function(){p.g=lush;
          var s=w.sprite({p:[sx,GY+0.7,sz],r:0.44,col:C('#CFEFE0'),a:0.0,shape:'soft'});
          var ph=Math.random()*6;
          s.anim=function(t){s.a=0.42*(1-((t*0.8+ph)%1));s.r=0.44+((t*0.8+ph)%1)*0.44;};
        }});
    })(k);
  }

  /* 小生物 */
  addPet(w,{geo:mkFennec(C('#EBCB9A'),C('#F7E3C4'),{len:0.30}),x:1.6,y:GY+0.02,z:2.5,r:0.40,
    name:'沙狐',en:'Fennec Fox',desc:'耳朵大得能听见沙子翻身。它说夜里的风是甜的。',col:[235,203,154],amp:0.03,sp:1.6});
  addPet(w,{geo:mkLizard(C('#D9B77C'),C('#C39F63'),{len:0.28}),x:-1.6,y:GY+0.02,z:2.2,r:0.34,
    name:'沙蜥',en:'Desert Lizard',desc:'趴在最烫的那块石头上，一动不动地晒了整个下午。',col:[217,183,124],amp:0.01,sp:2.2,sway:0.2});
  addPet(w,{geo:mkWildcat(C('#D8B98E'),C('#EFDCBE'),{len:0.30}),x:-3.0,y:GY+0.02,z:-1.4,r:0.38,
    name:'沙丘猫',en:'Sand Cat',desc:'脚掌上长着一层毛，走在沙上一点声音都没有。',col:[216,185,142],amp:0.04,sp:1.4});
  addPet(w,{geo:mkWing(null,C('#B08A5E'),C('#8E6E48'),C('#E8C566'),{len:0.34}),x:1.2,y:GY+3.4,z:-0.6,r:0.42,
    name:'沙鹰',en:'Desert Hawk',desc:'在最高的那圈热气上盘旋，从来不急着落下来。',col:[176,138,94],amp:0.30,sp:0.6,sway:0.34});

  for(k=0;k<8;k++)mote(w,{x:-3+Math.random()*6,y:GY+0.9+Math.random()*1.7,z:-3+Math.random()*6,r:0.10,col:C('#FFE9B0'),a:0.34});
  return w;
}

/* =============================== 场景 8：竹海小径 =============================== */
function buildBamboo(w){
  w.radius=7.2;w.bg=[C('#EAF3E2'),C('#C0D9C0')];w.amb=0.46;w.haze=C('#D3E5D2');w.hazeK=0.25;
  w.sun=[0.50,0.70,0.34];
  var R=6.4,TH=0.86,GY=0,i,k;
  var slab=slabGeo(R,TH,C('#88B872'),C('#8E7250'),808,{wob:0.10,n:24,taper:0.86});
  w.put(slab.geo,{x:0,z:0,y:-TH,layer:0});
  w.put(bandGeo(slab.pts,0.94,1.0,GY+0.004,C('#A3CC8A')),{layer:0});
  pebbles(w,810,0.0,-0.4,5.2,20,C('#7BA468'),0.2);

  /* 石阶小径 */
  var path=[[0.3,3.9],[0.0,3.1],[0.35,2.3],[0.05,1.5],[-0.2,0.7],[0.15,-0.1],[0.05,-0.9],[-0.3,-1.7],[0.1,-2.5],[0.0,-3.3]];
  for(i=0;i<path.length;i++){
    stoneStep(w,path[i][0],path[i][1],{w:1.2,h:0.12,d:0.68,col:C('#B4B6A4'),top:C('#C9CBB8'),
      ry:(rng(820+i)()-0.5)*0.3,y:GY+0.02});
  }
  /* 溪流 */
  var brook=[[-4.5,3.0],[-3.7,2.1],[-3.0,1.1],[-3.5,0.0],[-4.2,-1.1],[-3.9,-2.5],[-3.3,-3.5]];
  for(i=0;i<brook.length;i++){
    var sc=0.52+Math.sin(i/brook.length*Math.PI)*0.26;
    w.put(discGeo(circlePts(12,sc,sc*0.6,0.3),0.001,GY+0.03,PAL.water,2,PAL.waterDeep),
      {x:brook[i][0],z:brook[i][1],alpha:0.85,layer:0});
    if(i%2===0)ripples(w,brook[i][0],brook[i][1],GY+0.045,sc*0.9,PAL.foam,3.0,i*0.4,1);
  }
  /* 踏石 */
  for(i=0;i<5;i++){
    var bi=Math.min(brook.length-1,Math.round(1+i*1.2));
    rock(w,brook[bi][0]+0.6,brook[bi][1]-0.2,0.36+rng(i*7)()*0.18,C('#93A98C'),830+i,{y:GY-0.02,su:6,sv:4,sy:0.55});
  }

  /* 竹林（外圈更密、更高） */
  var rr=rng(840);
  for(k=0;k<52;k++){
    var a=k/46*TAU+rr()*0.30;
    var d=3.7+rr()*2.5;
    bambooStalk(w,Math.cos(a)*d+(rr()-0.5)*0.6,Math.sin(a)*d+(rr()-0.5)*0.6,
      {h:2.0+rr()*1.9,seed:850+k,leaves:5+Math.floor(rr()*5),w:0.82+rr()*0.5});
  }
  /* 内圈小竹 + 蕨类 */
  for(k=0;k<16;k++){
    var a2=k/10*TAU+1.3, d2=2.4+rr()*0.9;
    bambooStalk(w,Math.cos(a2)*d2,Math.sin(a2)*d2,{h:1.3+rr()*1.0,seed:890+k,leaves:4,w:0.62+rr()*0.3});
  }
  for(k=0;k<12;k++){
    var a3=k/12*TAU+0.4, d3=3.1+rr()*2.2;
    grassTuft(w,Math.cos(a3)*d3,Math.sin(a3)*d3,C('#71A85F'),910+k,0.44);
  }
  for(k=0;k<5;k++){
    rock(w,(rr()-0.5)*8.4,(rr()-0.5)*7.6,0.34+rr()*0.36,C('#7E9A78'),930+k,{y:GY-0.04,su:6,sv:4,jit:0.3});
  }

  /* —— 真实化补强：石灯笼 / 苔石 / 竹叶飘落 —— */
  stoneLamp(w,3.3,3.6,GY);
  stoneLamp(w,-2.9,-3.5,GY);
  for(k=0;k<6;k++){
    var ma=k/6*TAU+0.7, md=2.6+rr()*1.6;
    w.put(blobGeo(0.20+rr()*0.16,k%2?C('#6E8F66'):C('#7C9E74'),{su:6,sv:4,jitter:0.2,rand:rr,sy:0.3,sx:1.4}),
      {x:Math.cos(ma)*md,z:Math.sin(ma)*md,y:GY,alpha:0.95});
  }
  for(k=0;k<7;k++)mote(w,{x:-2.5+rr()*5,y:GY+0.4+rr()*1.2,z:-2.5+rr()*5,r:0.05,col:C('#D9C89A'),a:0.4});

  /* 任务：敲响五根竹筒 */
  var tubePos=[[2.5,2.4],[3.1,0.2],[2.6,-1.9],[1.0,-3.2],[-1.3,2.9]];
  var notes=[523.25,587.33,659.25,783.99,880];
  w.task={label:'敲一敲竹筒',sub:'五根竹筒，每一根的音都不一样',total:5,
    done:'五根竹筒凑成了一段山里的调子。风把它带下山去了。'};
  for(k=0;k<tubePos.length;k++){
    (function(k){
      var tx=tubePos[k][0], tz=tubePos[k][1];
      /* 一根立着的竹筒：直筒身 + 顶部凸起的竹节环 + 凹进去的深色筒口 */
      function tube(cBody,cRim,cMouth,cJoint){
        return [
          prismGeo(9,0.175,0.170,0.72,cBody),
          xf(prismGeo(9,0.190,0.190,0.055,cJoint),{dy:0.10}),
          xf(prismGeo(9,0.190,0.190,0.055,cJoint),{dy:0.38}),
          xf(prismGeo(9,0.196,0.196,0.065,cRim),{dy:0.66}),
          xf(prismGeo(9,0.140,0.138,0.030,cMouth),{dy:0.62}),
          xf(prismGeo(9,0.150,0.150,0.34,cMouth),{dy:0.28}),
          /* 靠在小竹棍 */
          xf(prismGeo(4,0.028,0.020,0.86,C('#C69A6B')),{rz:0.30,dx:0.30,dy:0.0}),
          xf(prismGeo(3,0.062,0.048,0.20,C('#8A6540')),{rz:0.30,dx:0.42,dy:0.74})
        ];
      }
      var dim=merge(tube(C('#B7C58C'),C('#A6B479'),C('#41502F'),C('#9DAC72')));
      var lit=merge(tube(C('#E2ECB0'),C('#F2F8CE'),C('#7A8A55'),C('#D2DF9C')));
      var p=w.put(dim,{x:tx,z:tz,y:GY});
      shadow(w,tx,tz,0.34);
      /* 还没敲的会有一点点光，敲完就灭 */
      var hint=w.sprite({p:[tx,GY+1.02,tz],r:0.20,col:C('#FFF6C8'),a:0.0});
      (function(h,tx,tz){
        var ph=Math.random()*6;
        h.anim=function(t){h.a=0.22+0.14*Math.sin(t*1.7+ph);h.p[1]=GY+1.02+0.05*Math.sin(t*1.1+ph);};
      })(hint,tx,tz);
      w.pick({get:function(){return [tx,GY+0.46,tz];},r:0.46,kind:'task',part:p,
        on:function(){
          p.g=lit;hint.hide=true;
          AU.marimba(notes[k],0.13,0);
          setTimeout(function(){if(AU.ok)AU.marimba(notes[k]*2,0.05,0.12);},110);
          var s=w.sprite({p:[tx,GY+0.78,tz],r:0.38,col:C('#F4FAC8'),a:0.0});
          var ph=Math.random()*6;
          s.anim=function(t){var u=(t*1.2+ph)%1;s.a=0.55*(1-u);s.r=0.38+u*0.55;s.p[1]=GY+0.78+u*0.5;};
        }});
    })(k);
  }

  /* 小生物 */
  addPet(w,{geo:mkPanda({len:0.44}),x:2.0,y:GY+0.04,z:3.0,r:0.48,
    name:'胖达',en:'Panda',desc:'抱着一根竹子啃了半小时。它说这根是今天最甜的一根。',col:[244,242,236],amp:0.02,sp:1.2});
  addPet(w,{geo:mkSquirrel(C('#D08A55'),C('#EFC79B'),{len:0.26}),x:-1.3,y:GY+0.02,z:1.9,r:0.34,
    name:'竹松鼠',en:'Squirrel',desc:'尾巴比身子还大，跳一下要晃三下才稳住。',col:[208,138,85],amp:0.08,sp:2.0});
  addPet(w,{geo:mkSnail(C('#E2D3B4'),C('#C08C5E'),{len:0.20}),x:0.9,y:GY+0.02,z:-2.4,r:0.28,
    name:'石阶蜗牛',en:'Snail',desc:'在第三级石阶上走了两天。它不着急，石阶也不催它。',col:[226,211,180],amp:0.008,sp:1.0,sway:0.1});
  addPet(w,{geo:mkWing(null,C('#8FA8B8'),C('#6D8798'),C('#E8C265'),{len:0.26}),x:0.4,y:GY+2.6,z:0.2,r:0.38,
    name:'竹雀',en:'Bamboo Finch',desc:'在竹竿之间跳来跳去，把每根竹筒都当成了鼓。',col:[143,168,184],amp:0.24,sp:0.9,sway:0.32});
  addPet(w,{geo:mkButterfly(C('#E8D07A'),C('#B7C878'),{len:0.15}),x:-2.4,y:GY+1.0,z:-1.0,r:0.28,
    name:'黄粉蝶',en:'Butterfly',desc:'只停在竹叶的背面，因为那里有它最喜欢的影子。',col:[232,208,122],amp:0.12,sp:1.8});

  for(k=0;k<8;k++)mote(w,{x:-3+Math.random()*6,y:GY+1.0+Math.random()*1.8,z:-3+Math.random()*6,r:0.10,col:C('#EFFAD0'),a:0.30});
  return w;
}

/* =============================== 场景 9：雨夜天台 =============================== */
function buildRoof(w){
  w.radius=8.2;w.bg=[C('#41527A'),C('#C98F6E')];w.amb=0.44;w.haze=C('#5B6C86');w.hazeK=0.28;
  w.sun=[-0.42,0.70,0.54];
  var GY=0,i,k;
  /* 天台地面：方形楼板（女儿墙是方的，楼板也必须方，否则四角会露出天空） */
  w.put(boxGeo(12.6,0.7,12.6,C('#9AA0A6'),{top:C('#9BA1A7'),side:C('#787F86')}),
    {x:0,z:0,y:-0.7,layer:0});
  /* 地砖缝：很淡，只是让地面有尺度感。长度收在楼板内，避免细线飘到天上 */
  for(i=-5;i<=5;i++){
    w.put(boxGeo(11.5,0.004,0.022,C('#959B9F'),{}),{x:0,z:i*1.02,y:GY+0.003,layer:0});
    w.put(boxGeo(0.022,0.004,11.5,C('#959B9F'),{}),{x:i*1.02,z:0,y:GY+0.003,layer:0});
  }
  /* 女儿墙 */
  w.put(merge([
    xf(boxGeo(12.2,0.85,0.34,C('#B4B8BC'),{top:C('#C8CCD0')}),{dz:-5.9}),
    xf(boxGeo(12.2,0.85,0.34,C('#B4B8BC'),{top:C('#C8CCD0')}),{dz:5.9}),
    xf(boxGeo(0.34,0.85,11.6,C('#ADB1B5'),{top:C('#C2C6CA')}),{dx:-5.9}),
    xf(boxGeo(0.34,0.85,11.6,C('#ADB1B5'),{top:C('#C2C6CA')}),{dx:5.9})
  ]),{x:0,z:0,y:GY});

  /* 楼梯间小屋 */
  w.put(merge([
    xf(boxGeo(2.5,1.9,2.0,C('#CFD3D7'),{top:C('#E0E4E8'),side:C('#BEC3C8')}),{dx:-3.4,dz:-3.2}),
    xf(boxGeo(2.75,0.16,2.25,C('#8E9499'),{top:C('#A0A6AB')}),{dx:-3.4,dy:1.9,dz:-3.2}),
    xf(boxGeo(0.7,1.05,0.10,C('#7C6A55'),{top:C('#8A7660')}),{dx:-3.4,dy:0.0,dz:-2.18}),
    xf(boxGeo(1.7,1.2,0.10,C('#F2C87A'),{top:C('#F6D794')}),{dx:-4.35,dy:0.45,dz:-4.26,rx:0})
  ]),{x:0,z:0,y:GY});

  /* 水箱 */
  w.put(merge([
    prismGeo(8,0.72,0.72,1.05,C('#9FA6AC'),{top:C('#B8BEC4')}),
    xf(prismGeo(8,0.16,0.10,0.22,C('#8E9499')),{dy:1.05})
  ]),{x:3.7,z:-3.4,y:GY,ry:0.3});

  /* 遮阳棚 + 小桌 */
  w.put(merge([
    prismGeo(4,0.055,0.05,1.5,C('#8E9499')),                       // 柱
    xf(prismGeo(4,0.055,0.05,1.5,C('#8E9499')),{dx:2.4}),
    xf(prismGeo(4,0.055,0.05,1.5,C('#8E9499')),{dx:2.4,dz:1.8}),
    xf(prismGeo(4,0.055,0.05,1.5,C('#8E9499')),{dz:1.8})
  ]),{x:2.4,z:1.4,y:GY});
  awning(w,3.6,2.3,{w:3.0,h:0.10,d:2.5,y:GY+1.52,col:C('#6E7F96')});
  w.put(merge([
    xf(prismGeo(4,0.045,0.045,0.62,C('#8A6540')),{dx:-0.38}),
    xf(prismGeo(4,0.045,0.045,0.62,C('#8A6540')),{dx:0.38}),
    xf(prismGeo(4,0.045,0.045,0.62,C('#8A6540')),{dz:-0.30}),
    xf(prismGeo(4,0.045,0.045,0.62,C('#8A6540')),{dz:0.30}),
    xf(boxGeo(1.0,0.07,0.78,C('#B98A5C'),{top:C('#CFA271')}),{dy:0.62}),
    xf(prismGeo(8,0.055,0.05,0.10,C('#F4F1EA')),{dx:0.22,dy:0.69,dz:0.10}),
    xf(sphereGeo(0.10,6,4,C('#6FAF6A'),{}),{dx:-0.24,dy:0.71,dz:-0.10})
  ]),{x:3.3,z:2.1,y:GY});

  /* 盆栽 */
  pottedPlant(w,4.9,3.9,{seed:920,col:C('#6FB86B')});
  pottedPlant(w,5.3,1.2,{seed:921,col:C('#7FC48A')});
  pottedPlant(w,-5.0,4.4,{seed:922,col:C('#63A86A')});
  pottedPlant(w,-4.6,-1.1,{seed:923,col:C('#8CCB7E')});
  pottedPlant(w,1.1,-4.9,{seed:924,col:C('#74B872')});

  /* 水洼 */
  puddle(w,-1.5,2.6,0.85,GY+0.012,C('#4E6E86'));
  puddle(w,0.9,3.9,0.62,GY+0.012,C('#54748C'));
  puddle(w,-3.0,-0.6,0.55,GY+0.012,C('#4A6A82'));
  puddle(w,2.2,-1.9,0.48,GY+0.012,C('#4E6E86'));

  /* 远处城市：环绕一圈的小小天际线（本引擎接近正交投影，远景要靠「小」而不是「远」）
     压低到楼板以下，读作「脚下的城市」，而不是围着天台的围墙 */
  var rr=rng(930), city=[], cw=[];
  for(i=0;i<60;i++){
    var ca=i/34*TAU+rr()*0.20;
    var cd=9.6+rr()*3.6;
    var bw=0.50+rr()*0.44, bh=0.70+rr()*0.95, bd=0.50+rr()*0.42;
    var col=mix(C('#435673'),C('#5A6E8C'),rr());
    city.push(xf(boxGeo(bw,bh,bd,col,{top:mix(col,C('#FFFFFF'),0.12)}),
      {dx:Math.cos(ca)*cd,dz:Math.sin(ca)*cd,ry:rr()}));
    var wn=1+Math.floor(rr()*2);
    for(var q=0;q<wn;q++){
      cw.push({x:Math.cos(ca)*cd+(rr()-0.5)*bw, z:Math.sin(ca)*cd+(rr()-0.5)*bd,
        y:GY-1.35+0.22+rr()*bh*0.70, c:rr()>0.42?C('#FFD9A0'):C('#BFE3F2'), r:0.05+rr()*0.045});
    }
  }
  w.put(merge(city),{x:0,z:0,y:GY-1.35});
  for(k=0;k<cw.length;k++){
    var lp=w.sprite({p:[cw[k].x,cw[k].y,cw[k].z],r:cw[k].r,col:cw[k].c,a:0.55+rr()*0.32});
    (function(p2){
      var ph=Math.random()*9, base=p2.a;
      p2.anim=function(t){p2.a=base*(0.74+0.26*Math.sin(t*0.7+ph));};
    })(lp);
  }

  /* —— 真实化补强：中景楼群 / 空调外机与天线 / 雨衣 / 霓虹与水洼倒影 —— */
  var mid=[];
  for(i=0;i<16;i++){
    var ma2=i/16*TAU+rr()*0.3, md=7.6+rr()*0.9;
    var mw=0.42+rr()*0.3, mh=0.5+rr()*0.6;
    mid.push(xf(boxGeo(mw,mh,mw*0.9,mix(C('#4A5D78'),C('#5E7190'),rr()),{top:mix(C('#4A5D78'),C('#FFFFFF'),0.10)}),
      {dx:Math.cos(ma2)*md,dz:Math.sin(ma2)*md,ry:rr()}));
  }
  w.put(merge(mid),{x:0,z:0,y:GY-1.05});
  w.put(merge([
    xf(boxGeo(0.62,0.42,0.42,C('#A8AEB4'),{side:C('#8E949A'),top:C('#BEC4CA')}),{dx:-3.0,dy:1.9,dz:-3.0}),
    xf(boxGeo(0.66,0.05,0.46,C('#787F86'),{}),{dx:-3.0,dy:2.34,dz:-3.0}),
    xf(prismGeo(3,0.025,0.006,1.3,C('#8E949A')),{dx:-3.8,dy:2.06,dz:-3.4})
  ]),{x:0,z:0,y:GY});
  var ant=w.sprite({p:[-3.8,GY+3.42,-3.4],r:0.09,col:C('#FF7B6B'),a:0.8});
  ant.anim=function(t){ant.a=0.5+0.5*Math.sin(t*2.2);};
  /* 雨棚下挂着的两件雨衣 */
  w.put(merge([
    xf(boxGeo(0.16,0.30,0.05,C('#E2B23C'),{side:C('#C99A2E')}),{dx:1.6,dy:1.10,dz:0.4}),
    xf(boxGeo(0.16,0.26,0.05,C('#6E8FA8'),{side:C('#5A7890')}),{dx:2.3,dy:1.14,dz:0.4})
  ]),{x:2.4,z:2.0,y:GY,ry:0.2});
  /* 楼梯间侧墙的霓虹 */
  var neon=w.sprite({p:[-4.35,GY-0.35,-4.30],r:0.5,col:C('#FFB86B'),a:0.6});
  neon.anim=function(t){neon.a=0.45+0.2*Math.sin(t*3.7);};
  /* 水洼里的倒影光 */
  w.sprite({p:[-1.5,GY+0.05,2.6],r:0.55,col:C('#FFD9A0'),a:0.13,shape:'soft'});
  w.sprite({p:[0.9,GY+0.05,3.9],r:0.40,col:C('#BFE3F2'),a:0.11,shape:'soft'});

  /* 雨 */
  rainField(w,{n:52,rad:5.6,top:4.6,seed:950,alpha:0.30});

  /* 任务：点亮串灯 */
  var bulbs=stringLights(w,-5.4,0.2,-5.4,-5.0,GY+3.0,0.42,6,C('#FFE3A8'));
  bulbs=bulbs.concat(stringLights(w,-5.4,-5.0,5.4,-5.0,GY+3.0,0.42,6,C('#FFE3A8')));
  w.task={label:'点亮天台的串灯',sub:'雨里挂上灯，天台就没那么冷了',total:12,
    done:'整串灯都亮了。雨落在灯泡上，像撒了一层碎金。'};
  for(k=0;k<bulbs.length;k++){
    (function(b){
      w.pick({get:function(){return [b.x,b.y-0.16,b.z];},r:0.32,kind:'task',part:b,
        on:function(){
          b.alpha=1;b.tint=[1.38,1.20,0.94];
          var s=w.sprite({p:[b.x,b.y-0.17,b.z],r:0.46,col:C('#FFD79A'),a:0.0});
          var ph=Math.random()*6;
          s.anim=function(t){s.a=0.50*(0.80+0.20*Math.sin(t*1.9+ph));s.r=0.46+0.05*Math.sin(t*1.5+ph);};
        }});
    })(bulbs[k]);
  }

  /* 小生物 */
  addPet(w,{geo:mkCat(C('#8B8F96'),C('#C3C7CD'),{len:0.34}),x:-2.9,y:GY+0.10,z:-2.1,r:0.42,
    name:'天台猫',en:'Rooftop Cat',desc:'雨天也待在雨棚底下。它说雨声是世界上最好睡的摇篮曲。',col:[139,143,150],amp:0.02,sp:1.1,sway:0.5});
  addPet(w,{geo:mkSnail(C('#CFC3A8'),C('#A8764E'),{len:0.20}),x:1.9,y:GY+0.02,z:0.4,r:0.28,
    name:'雨后蜗牛',en:'Snail',desc:'雨一停就出来散步。它的路线画在地砖上，是一条很慢很慢的线。',col:[207,195,168],amp:0.006,sp:1.0,sway:0.1});
  addPet(w,{geo:mkWing(null,C('#6E7684'),C('#525A66'),C('#E0B85E'),{len:0.24}),x:0.6,y:GY+2.1,z:2.4,r:0.34,
    name:'麻雀',en:'Sparrow',desc:'躲在雨棚边上抖羽毛，把水珠甩得老远。',col:[110,118,132],amp:0.10,sp:2.0,sway:0.4});
  addPet(w,{geo:mkButterfly(C('#C7CEDA'),C('#9AA4B4'),{len:0.16}),x:-1.2,y:GY+1.6,z:-0.4,r:0.28,
    name:'雨夜蛾',en:'Moth',desc:'明明是夜行客，却总往最亮的那盏灯上撞。',col:[199,206,218],amp:0.14,sp:1.5});
  addPet(w,{geo:mkWildcat(C('#5F6674'),C('#8A93A4'),{len:0.26}),x:4.3,y:GY+0.02,z:-1.6,r:0.34,
    name:'街角的猫',en:'Alley Cat',desc:'从对面那栋楼跳过来串门，只为了蹭一口暖。',col:[95,102,116],amp:0.05,sp:1.3});

  for(k=0;k<5;k++)mote(w,{x:-3+Math.random()*6,y:GY+1.2+Math.random()*1.6,z:-3+Math.random()*6,r:0.09,col:C('#FFE6B8'),a:0.28});
  return w;
}
