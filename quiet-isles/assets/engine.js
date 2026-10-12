/* 静屿 QUIET ISLES — 软 3D 引擎
   工具 / 几何 / 世界容器 / 渲染器 / 相机 / 变换 / 调色板 / 场景道具 / 小生物 / 通用件
   纯 Canvas2D：平面着色 + 画家算法，零外部依赖。
   经典脚本（非 ESM），供 file:// 直接打开。 */

/* ------------------------------- 工具 ------------------------------- */
var TAU=Math.PI*2;
function clamp(v,a,b){return v<a?a:(v>b?b:v);}
function lerp(a,b,t){return a+(b-a)*t;}
function rng(seed){var t=seed>>>0;return function(){t+=0x6D2B79F5;var r=t;r=Math.imul(r^r>>>15,r|1);r^=r+Math.imul(r^r>>>7,r|61);return((r^r>>>14)>>>0)/4294967296;};}
function C(h){var n=parseInt(h.slice(1),16);return[n>>16&255,n>>8&255,n&255];}
function mix(a,b,t){return[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];}
function scl(c,k){return[c[0]*k,c[1]*k,c[2]*k];}
function shadeVar(c,r,amt){var k=1+(r()*2-1)*amt;return[c[0]*k,c[1]*k,c[2]*k];}
function css(c,a){return a===undefined?'rgb('+(c[0]|0)+','+(c[1]|0)+','+(c[2]|0)+')':'rgba('+(c[0]|0)+','+(c[1]|0)+','+(c[2]|0)+','+a+')';}
function hex(c){return '#'+((1<<24)+(clamp(c[0]|0,0,255)<<16)+(clamp(c[1]|0,0,255)<<8)+clamp(c[2]|0,0,255)).toString(16).slice(1);}

/* ------------------------------- 几何 -------------------------------
   约定：图元底面在 y=0，x/z 居中；面顶点逆时针（从外侧看）        */
function Geo(){return {v:[],f:[]};}
function P(g,x,y,z){g.v.push(x,y,z);return g.v.length/3-1;}
function face(g,idx,col,ds,glow){g.f.push({i:idx,c:col,ds:ds?1:0,glow:glow||0});}
function quad(g,a,b,c,d,col,ds,glow){face(g,[a,b,c,d],col,ds,glow);}
function tri(g,a,b,c,col,ds,glow){face(g,[a,b,c],col,ds,glow);}

function boxGeo(w,h,d,col,o){
  o=o||{};var g=Geo(),x=w/2,z=d/2;
  var ct=o.top||col, cs=o.side||col;
  P(g,-x,0,-z);P(g,x,0,-z);P(g,x,0,z);P(g,-x,0,z);
  P(g,-x,h,-z);P(g,x,h,-z);P(g,x,h,z);P(g,-x,h,z);
  quad(g,4,7,6,5,ct,0);        // 顶
  quad(g,0,4,5,1,cs,0);        // -z
  quad(g,1,5,6,2,cs,0);        // +x
  quad(g,2,6,7,3,cs,0);        // +z
  quad(g,3,7,4,0,cs,0);        // -x
  if(!o.noBottom)quad(g,0,1,2,3,cs,0);
  return g;
}
function prismGeo(sides,rb,rt,h,col,o){
  o=o||{};var g=Geo(),off=o.rot||0,i;
  var cs=o.side||col, ct=o.top||col, cb=o.bot||col;
  for(i=0;i<sides;i++){var a=off+i/sides*TAU;P(g,Math.cos(a)*rb,0,Math.sin(a)*rb);}
  for(i=0;i<sides;i++){var b=off+i/sides*TAU;P(g,Math.cos(b)*rt,h,Math.sin(b)*rt);}
  for(i=0;i<sides;i++){var j=(i+1)%sides;quad(g,i,sides+i,sides+j,j,cs,0);}
  if(rt>1e-4){var t=[];for(i=0;i<sides;i++)t.push(sides+i);t.reverse();face(g,t,ct,0);}
  if(!o.noBottom){var bt=[];for(i=0;i<sides;i++)bt.push(i);face(g,bt,cb,0);}
  return g;
}
function sphereGeo(r,su,sv,col,o){
  o=o||{};var g=Geo(),rr=o.rand||Math.random;
  var sx=o.sx===undefined?1:o.sx, sy=o.sy===undefined?1:o.sy, sz=o.sz===undefined?1:o.sz;
  var jt=o.jitter||0, grid=[],v,u;
  for(v=0;v<=sv;v++){
    var row=[],phi=v/sv*Math.PI;
    for(u=0;u<su;u++){
      var th=u/su*TAU;
      var px=Math.sin(phi)*Math.cos(th)*r*sx;
      var py=(1-Math.cos(phi))*r*sy;
      var pz=Math.sin(phi)*Math.sin(th)*r*sz;
      if(jt&&v>0&&v<sv){var k=1+(rr()*2-1)*jt;px*=k;py*=k;pz*=k;}
      row.push(P(g,px,py,pz));
    }
    grid.push(row);
  }
  for(v=0;v<sv;v++){
    for(u=0;u<su;u++){
      var u2=(u+1)%su;
      var a=grid[v][u],b2=grid[v][u2],c2=grid[v+1][u2],d2=grid[v+1][u];
      var cc=scl(col,1-v/sv*0.3);
      if(v===0)tri(g,a,d2,c2,cc,0);
      else if(v===sv-1)tri(g,a,c2,b2,cc,0);
      else quad(g,a,d2,c2,b2,cc,0);
    }
  }
  return g;
}
function blobGeo(r,col,o){
  o=o||{};
  var g=sphereGeo(r,o.su||8,o.sv||6,col,{sx:o.sx,sz:o.sz,sy:o.sy,
    jitter:o.jitter===undefined?0.16:o.jitter,rand:o.rand});
  if(o.squashTop){var n=g.v.length/3;for(var i=0;i<n;i++){var y=g.v[i*3+1];if(y>r*(o.sy||1)*0.9)g.v[i*3+1]=y*o.squashTop;}}
  return g;
}
/* 岛屿底板：不规则轮廓 + 泥土侧面 + 顶面 */
function slabGeo(radius,thick,colTop,colSide,seed,o){
  o=o||{};var rr=rng(seed||7),N=o.n||20,g=Geo(),i,k;
  var pts=[];
  for(i=0;i<N;i++){
    var a=i/N*TAU, r=radius*(1+(rr()*2-1)*(o.wob||0.11));
    pts.push([Math.cos(a)*r,Math.sin(a)*r]);
  }
  var topY=thick, taper=o.taper===undefined?0.88:o.taper;
  var cen=P(g,0,topY,0);
  for(i=0;i<N;i++)P(g,pts[i][0],topY,pts[i][1]);
  for(i=0;i<N;i++){
    var j=(i+1)%N;
    tri(g,cen,j,i,colTop,0);
  }
  var deep=mix(colSide,C('#5C4A36'),0.28);
  for(k=0;k<3;k++){
    var y0=lerp(topY,0,k/3), y1=lerp(topY,0,(k+1)/3);
    var s0=lerp(1,taper,k/3), s1=lerp(1,taper,(k+1)/3);
    var cc=mix(colSide,deep,k/3);
    var r0=[],r1=[];
    for(i=0;i<N;i++){r0.push(P(g,pts[i][0]*s0,y0,pts[i][1]*s0));}
    for(i=0;i<N;i++){r1.push(P(g,pts[i][0]*s1,y1,pts[i][1]*s1));}
    for(i=0;i<N;i++){var j2=(i+1)%N;quad(g,r0[i],r0[j2],r1[j2],r1[i],cc,0);}
  }
  return {geo:g,pts:pts,topY:topY,radius:radius};
}
/* 由轮廓生成内缩的圆盘（地面/水面/沙地） */
function discGeo(pts,inset,y,col,rings,colIn){
  var N=pts.length,g=Geo(),i,k;
  var cen=P(g,0,y,0), idx=[];
  for(k=1;k<=rings;k++){
    var arr=[], w=inset+(1-inset)*(k/rings);
    for(i=0;i<N;i++)arr.push(P(g,pts[i][0]*w,y,pts[i][1]*w));
    idx.push(arr);
  }
  for(i=0;i<N;i++){var j=(i+1)%N;tri(g,cen,idx[0][i],idx[0][j],col,1);}
  for(k=0;k<rings-1;k++){
    var A=idx[k],B=idx[k+1];
    var cc=colIn?mix(col,colIn,(k+1)/rings):col;
    for(i=0;i<N;i++){var j2=(i+1)%N;quad(g,A[i],A[j2],B[j2],B[i],cc,1);}
  }
  return g;
}
/* 圆环状细带（水面泡沫/边线） */
function bandGeo(pts,i0,i1,y,col){
  var N=pts.length,g=Geo(),i;
  var A=[],B=[];
  for(i=0;i<N;i++)A.push(P(g,pts[i][0]*i0,y,pts[i][1]*i0));
  for(i=0;i<N;i++)B.push(P(g,pts[i][0]*i1,y,pts[i][1]*i1));
  for(i=0;i<N;i++){var j=(i+1)%N;quad(g,A[i],A[j],B[j],B[i],col,1);}
  return g;
}
function ringPoints(n,cx,cz,rx,rz,rot){
  var a=[],i;
  for(i=0;i<n;i++){var t=rot+i/n*TAU;a.push([cx+Math.cos(t)*rx,cz+Math.sin(t)*rz]);}
  return a;
}

/* ------------------------------- 世界容器 ------------------------------- */
function World(opt){
  opt=opt||{};
  this.parts=[];this.sprites=[];this.picks=[];
  this.bg=[C('#F8F5ED'),C('#D7EAE7')];
  this.sun=[0.40,0.82,0.42];
  this.amb=0.50;
  this.tint=[1,1,1];
  this.haze=C('#E6F1EE');
  this.hazeK=0.26;
  this.radius=7.5;
  this.spin=0;
}
World.prototype.put=function(geo,o){
  o=o||{};
  var p={g:geo,x:o.x||0,y:o.y||0,z:o.z||0,ry:o.ry||0,rx:o.rx||0,rz:o.rz||0,
    sx:1,sy:1,sz:1,anim:o.anim||null,alpha:o.alpha===undefined?1:o.alpha,
    glow:o.glow||0,id:o.id||null,tag:o.tag||null,data:o.data||null,skip:false,
    layer:o.layer===undefined?1:o.layer, sc:o.sc||1, _wx:0,_wy:0,_wz:0};
  if(o.sc&&o.sc!==1){p.sx=p.sy=p.sz=o.sc;}
  this.parts.push(p);
  return p;
};
World.prototype.sprite=function(o){
  o.p=o.p||[0,0,0];o.r=o.r||0.22;
  o.tint=o.tint||null;o.a=o.a===undefined?1:o.a;o.shape=o.shape||'glow';
  o.anim=o.anim||null;o.fixed=!!o.fixed;o.hide=false;
  this.sprites.push(o);return o;
};
World.prototype.pick=function(o){
  o.r=o.r||0.6;o.get=o.get||null;o.sr=0;o.sx=0;o.sy=0;o.on=o.on||null;
  this.picks.push(o);return o;
};
function findPart(w,id){for(var i=0;i<w.parts.length;i++)if(w.parts[i].id===id)return w.parts[i];return null;}
World.prototype.byId=function(id){return findPart(this,id);};

/* ------------------------------- 渲染器 ------------------------------- */
var REN={cv:null,ctx:null,W:1,H:1,dpr:1,pool:[],pn:0,order:[],nOrder:0,
  sun:[0,1,0],amb:0.5,tint:null,haze:null,hazeK:0.25,sunRaw:[0,1,0],hazeRaw:null,
  toCam:[0,0,1],scale:50,ox:0,oy:0,dist:64,night:0,L0:[],L1:[],L2:[]};
var SC=new Float32Array(30);
var _px=0,_py=0,_pz=0;
var gradCache={};
function glowSprite(col){
  var key=col[0]+'_'+col[1]+'_'+col[2];
  var c=gradCache[key];
  if(c)return c;
  c=document.createElement('canvas');c.width=c.height=64;
  var x=c.getContext('2d');
  var gr=x.createRadialGradient(32,32,0,32,32,32);
  gr.addColorStop(0,'rgba(255,255,255,0.95)');
  gr.addColorStop(0.25,'rgba('+(col[0]|0)+','+(col[1]|0)+','+(col[2]|0)+',0.72)');
  gr.addColorStop(0.6,'rgba('+(col[0]|0)+','+(col[1]|0)+','+(col[2]|0)+',0.22)');
  gr.addColorStop(1,'rgba('+(col[0]|0)+','+(col[1]|0)+','+(col[2]|0)+',0)');
  x.fillStyle=gr;x.fillRect(0,0,64,64);
  gradCache[key]=c;return c;
}
function softSprite(col){
  var key='s'+col[0]+'_'+col[1]+'_'+col[2];
  var c=gradCache[key];
  if(c)return c;
  c=document.createElement('canvas');c.width=c.height=64;
  var x=c.getContext('2d');
  var gr=x.createRadialGradient(32,32,0,32,32,32);
  gr.addColorStop(0,'rgba('+(col[0]|0)+','+(col[1]|0)+','+(col[2]|0)+',0.9)');
  gr.addColorStop(0.65,'rgba('+(col[0]|0)+','+(col[1]|0)+','+(col[2]|0)+',0.35)');
  gr.addColorStop(1,'rgba('+(col[0]|0)+','+(col[1]|0)+','+(col[2]|0)+',0)');
  x.fillStyle=gr;x.fillRect(0,0,64,64);
  gradCache[key]=c;return c;
}
function proj(x,y,z){
  var cam=REN.cam;
  var px=x-cam.tx,py=y-cam.ty,pz=z-cam.tz;
  var cy=Math.cos(cam.yaw),sy=Math.sin(cam.yaw);
  var x1=px*cy-pz*sy, z1=px*sy+pz*cy;
  var cp=Math.cos(cam.pitch),sp=Math.sin(cam.pitch);
  var y1=py*cp+z1*sp, z2=-py*sp+z1*cp;
  var k=REN.dist/(REN.dist+z2);
  _px=REN.W*0.5+REN.ox+x1*REN.scale*k;
  _py=REN.H*0.5+REN.oy-y1*REN.scale*k;
  _pz=z2;
}
function newFace(){
  var o;
  if(REN.pn<REN.pool.length){o=REN.pool[REN.pn];}
  else{o={x:new Float32Array(16),y:new Float32Array(16),n:0,z:0,c:'#000',a:1};REN.pool.push(o);}
  REN.pn++;o.n=0;o.a=1;o.grad=null;o.img=0;return o;
}
/* 顶点明暗缓存（伪 Gouraud 用） */
var SHV=new Float32Array(16);
function emitPart(w,part){
  var g=part.g, mat=part, sun=REN.sun, amb=REN.amb;
  var V=g.v, F=g.f, nf=F.length, f;
  var Rinv=1/Math.max(2,w.radius);
  for(var fi=0;fi<nf;fi++){
    f=F[fi];var ids=f.i,n=ids.length,i,k3;
    var minx=1e9,maxx=-1e9,miny=1e9,maxy=-1e9;
    var wyMin=1e9,wyMax=-1e9;
    for(i=0;i<n;i++){
      k3=ids[i]*3;
      var x=V[k3],y=V[k3+1],z=V[k3+2];
      if(mat.sx!==1)x*=mat.sx; if(mat.sy!==1)y*=mat.sy; if(mat.sz!==1)z*=mat.sz;
      if(mat.ry){var cr=Math.cos(mat.ry),sr=Math.sin(mat.ry);var nx2=x*cr-z*sr,nz2=x*sr+z*cr;x=nx2;z=nz2;}
      if(mat.rx){var cx2=Math.cos(mat.rx),sx2=Math.sin(mat.rx);var ny2=y*cx2-z*sx2,nz3=y*sx2+z*cx2;y=ny2;z=nz3;}
      if(mat.rz){var cz2=Math.cos(mat.rz),sz2=Math.sin(mat.rz);var nx3=x*cz2-y*sz2,ny3=x*sz2+y*cz2;x=nx3;y=ny3;}
      x+=mat.x;y+=mat.y;z+=mat.z;
      SC[i*3]=x;SC[i*3+1]=y;SC[i*3+2]=z;
      if(y<wyMin)wyMin=y; if(y>wyMax)wyMax=y;
    }
    var e1x=SC[3]-SC[0],e1y=SC[4]-SC[1],e1z=SC[5]-SC[2];
    var e2x=SC[6]-SC[0],e2y=SC[7]-SC[1],e2z=SC[8]-SC[2];
    var nx=e1y*e2z-e1z*e2y, ny=e1z*e2x-e1x*e2z, nz=e1x*e2y-e1y*e2x;
    var nl=Math.sqrt(nx*nx+ny*ny+nz*nz);
    if(nl<1e-9)continue;
    nx/=nl;ny/=nl;nz/=nl;
    var dotv=nx*REN.toCam[0]+ny*REN.toCam[1]+nz*REN.toCam[2];
    if(!f.ds&&dotv<=0.001)continue;
    var dl=nx*sun[0]+ny*sun[1]+nz*sun[2];
    var lit=f.ds?Math.abs(dl):Math.max(0,dl);
    var sh=amb+(1-amb)*lit;
    sh*=1+0.07*Math.max(0,ny);
    if(f.glow)sh=sh*0.40+0.78;
    var cc=f.c;
    var o=newFace();
    var zsum=0;
    for(i=0;i<n;i++){
      proj(SC[i*3],SC[i*3+1],SC[i*3+2]);
      o.x[i]=_px;o.y[i]=_py;zsum+=_pz;
      if(_px<minx)minx=_px; if(_px>maxx)maxx=_px;
      if(_py<miny)miny=_py; if(_py>maxy)maxy=_py;
    }
    if(maxx-minx<0.9&&maxy-miny<0.9){REN.pn--;continue;}
    o.n=n;o.z=zsum/n;
    var hz=REN.hazeK*clamp((o.z+6)/22,0,1);
    /* 冷暖分级：受光面偏暖（r↑），背光面偏冷（b↑） */
    var tlit=clamp((sh-amb)/(1-amb+1e-6),0,1);
    var r=cc[0]*sh,gg=cc[1]*sh,b=cc[2]*sh;
    r*=0.965+0.075*tlit; b*=1.035-0.055*tlit;
    var tt=null;
    if(REN.haze){r=lerp(r,REN.haze[0],hz);gg=lerp(gg,REN.haze[1],hz);b=lerp(b,REN.haze[2],hz);}
    if(REN.tint&&part.tint){tt=part.tint;r*=tt[0];gg*=tt[1];b*=tt[2];}
    /* 轻微提高彩度，避免发灰 */
    var lum=r*0.3+gg*0.59+b*0.11;
    r=lum+(r-lum)*1.14;gg=lum+(gg-lum)*1.14;b=lum+(b-lum)*1.14;
    o.c='rgb('+(clamp(r,0,255)|0)+','+(clamp(gg,0,255)|0)+','+(clamp(b,0,255)|0)+')';
    o.a=part.alpha;o.L=part.layer||1;
    /* —— 大面积：按顶点明暗生成渐变（伪 Gouraud） ——
       竖直面：上亮下暗（天空光 + 根部遮蔽）
       水平面：朝阳一侧亮（方向性光渐变）                */
    if(!f.glow&&!f.ng&&(maxx-minx)*(maxy-miny)>110&&n>=3){
      var yh=wyMax-wyMin, yc=(wyMax+wyMin)*0.5, i0=0,i1=0,lo=1e9,hi=-1e9;
      for(i=0;i<n;i++){
        var kk;
        if(yh>0.12)kk=1+((SC[i*3+1]-yc)/yh)*0.15;
        else kk=1+((SC[i*3]-mat.x)*sun[0]+(SC[i*3+2]-mat.z)*sun[2])*Rinv*0.10;
        var s2=clamp(sh*kk,0.12,1.45);
        SHV[i]=s2;
        if(s2<lo){lo=s2;i0=i;}
        if(s2>hi){hi=s2;i1=i;}
      }
      var gax=o.x[i1]-o.x[i0], gay=o.y[i1]-o.y[i0];
      if(hi-lo>0.012&&gax*gax+gay*gay>25){
        var st=[], L2=gax*gax+gay*gay;
        for(i=0;i<n;i++){
          var t2=clamp(((o.x[i]-o.x[i0])*gax+(o.y[i]-o.y[i0])*gay)/L2,0,1);
          var s3=SHV[i];
          var r2=cc[0]*s3, g2=cc[1]*s3, b2=cc[2]*s3;
          var tl2=clamp((s3-amb)/(1-amb+1e-6),0,1);
          r2*=0.965+0.075*tl2; b2*=1.035-0.055*tl2;
          if(REN.haze){r2=lerp(r2,REN.haze[0],hz);g2=lerp(g2,REN.haze[1],hz);b2=lerp(b2,REN.haze[2],hz);}
          if(tt){r2*=tt[0];g2*=tt[1];b2*=tt[2];}
          var lum2=r2*0.3+g2*0.59+b2*0.11;
          r2=lum2+(r2-lum2)*1.14;g2=lum2+(g2-lum2)*1.14;b2=lum2+(b2-lum2)*1.14;
          st.push([t2,'rgb('+(clamp(r2,0,255)|0)+','+(clamp(g2,0,255)|0)+','+(clamp(b2,0,255)|0)+')']);
        }
        st.sort(function(A,B2){return A[0]-B2[0];});
        o.grad={x0:o.x[i0],y0:o.y[i0],x1:o.x[i1],y1:o.y[i1],st:st};
        o.c=st[(st.length/2)|0][1];
      }
    }
    REN.order[REN.nOrder++]=REN.pn-1;
  }
}
function drawList(list,pool,ctx,strokeOn){
  for(var i=0;i<list.length;i++){
    var o=pool[list[i]];
    if(o.img){
      if(o.a<1)ctx.globalAlpha=o.a;
      ctx.drawImage(shadowImg(),o.x[0]-o.rx,o.y[0]-o.ry,o.rx*2,o.ry*2);
      if(o.a<1)ctx.globalAlpha=1;
      continue;
    }
    if(o.a<1)ctx.globalAlpha=o.a;
    ctx.beginPath();
    ctx.moveTo(o.x[0],o.y[0]);
    for(var k=1;k<o.n;k++)ctx.lineTo(o.x[k],o.y[k]);
    ctx.closePath();
    if(o.grad){
      var gr=ctx.createLinearGradient(o.grad.x0,o.grad.y0,o.grad.x1,o.grad.y1);
      var ss=o.grad.st;
      for(var j=0;j<ss.length;j++)gr.addColorStop(ss[j][0],ss[j][1]);
      ctx.fillStyle=gr;
    }else ctx.fillStyle=o.c;
    ctx.fill();
    if(strokeOn&&o.n>3&&o.a>0.97){ctx.strokeStyle=o.c;ctx.lineWidth=0.9;ctx.stroke();}
    if(o.a<1)ctx.globalAlpha=1;
  }
}
function sortOrder(){
  var o=REN.order,p=REN.pool;
  var arr=[];
  for(var i=0;i<REN.nOrder;i++)arr.push(o[i]);
  arr.sort(function(a,b){return p[b].z-p[a].z;});
  for(i=0;i<REN.nOrder;i++)o[i]=arr[i];
}
function renderWorld(w,cam,ctx,W,H,t){
  REN.cam=cam;REN.W=W;REN.H=H;REN.pn=0;REN.nOrder=0;
  REN.sun=w.sun;REN.amb=w.amb;REN.haze=w.haze;REN.hazeK=w.hazeK;REN.tint=w.tint;
  var cp=Math.cos(cam.pitch),sp=Math.sin(cam.pitch),cy=Math.cos(cam.yaw),sy=Math.sin(cam.yaw);
  REN.toCam[0]=-cp*sy;REN.toCam[1]=sp;REN.toCam[2]=-cp*cy;
  var i,p;
  for(i=0;i<w.parts.length;i++){
    p=w.parts[i];
    if(p.skip)continue;
    if(p.anim)p.anim(t,p,w);
    if(p.skip||p.alpha<0.02)continue;
    if(p.softShadow){emitShadow(p);continue;}
    if(p.alpha>0.92&&p.layer!==0)autoShadow(w,p);
    emitPart(w,p);
  }
  var pool=REN.pool,order=REN.order;
  var L0=REN.L0,L1=REN.L1,L2=REN.L2;
  L0.length=0;L1.length=0;L2.length=0;
  for(i=0;i<REN.nOrder;i++){
    var oo=pool[order[i]];
    (oo.L===0?L0:(oo.L===2?L2:L1)).push(order[i]);
  }
  L1.sort(function(a,b){return pool[b].z-pool[a].z;});
  L2.sort(function(a,b){return pool[b].z-pool[a].z;});
  ctx.lineJoin='round';
  drawList(L0,pool,ctx,false);
  drawList(L1,pool,ctx,true);
  drawList(L2,pool,ctx,true);
  /* 精灵（光点 / 粒子） */
  var sp2=w._spBuf||(w._spBuf=[]);
  var sn=0;
  for(i=0;i<w.sprites.length;i++){
    var s=w.sprites[i];
    if(s.hide)continue;
    if(s.anim)s.anim(t,s,w);
    if(s.hide)continue;
    proj(s.p[0],s.p[1],s.p[2]);
    var rr=s.r*REN.scale*REN.dist/(REN.dist+_pz);
    if(_px<-rr||_px>W+rr||_py<-rr||_py>H+rr)continue;
    var rec=sp2[sn];
    if(!rec){rec={};sp2[sn]=rec;}
    rec.x=_px;rec.y=_py;rec.r=rr;rec.z=_pz;rec.s=s;
    sn++;
  }
  var sb=sp2.slice(0,sn);
  sb.sort(function(a,b){return b.z-a.z;});
  ctx.globalCompositeOperation='lighter';
  for(i=0;i<sb.length;i++){
    var q=sb[i],ss=q.s;
    var col=ss.col;
    var img=(ss.shape==='soft')?softSprite(col):glowSprite(col);
    ctx.globalAlpha=clamp(ss.a,0,1);
    ctx.drawImage(img,q.x-q.r,q.y-q.r,q.r*2,q.r*2);
  }
  ctx.globalAlpha=1;
  ctx.globalCompositeOperation='source-over';
  /* 拾取体屏幕位置 */
  for(i=0;i<w.picks.length;i++){
    var pk=w.picks[i];
    if(pk.skip){pk.sr=0;continue;}
    var wp=pk.get?pk.get(t,pk,w):pk.p;
    proj(wp[0],wp[1],wp[2]);
    pk.sx=_px;pk.sy=_py;pk.sz=_pz;
    pk.sr=pk.r*REN.scale*REN.dist/(REN.dist+_pz);
  }
}

/* ------------------------------- 相机 ------------------------------- */
function Camera(opt){
  opt=opt||{};
  this.yaw=opt.yaw===undefined?0.7:opt.yaw;
  this.pitch=opt.pitch===undefined?0.58:opt.pitch;
  this.tx=opt.tx||0;this.ty=opt.ty===undefined?0.9:opt.ty;this.tz=opt.tz||0;
  this.zoom=1;this.d0=64;
  this.aYaw=this.yaw;this.aPitch=this.pitch;this.aZoom=1;
  this.ox=0;this.oy=0;
}
Camera.prototype.update=function(dt,idle){
  var k=1-Math.pow(0.001,dt);
  this.yaw=lerp(this.yaw,this.aYaw,clamp(k*2.6,0,1));
  this.pitch=lerp(this.pitch,this.aPitch,clamp(k*2.6,0,1));
  this.zoom=lerp(this.zoom,this.aZoom,clamp(k*2.0,0,1));
  REN.dist=this.d0;
  REN.scale=this.baseScale*this.zoom;
  REN.ox=this.ox;REN.oy=this.oy;
};
Camera.prototype.fit=function(W,H,radius){
  this.baseScale=fitScale(W,H,radius);
  REN.scale=this.baseScale*this.zoom;
};
function fitScale(W,H,radius){
  return Math.min(W*0.44,H*0.95)/Math.max(2,radius);
}

/* ------------------------------- 几何变换 / 合并 ------------------------------- */
function xf(g,T){
  T=T||{};
  var rx=T.rx||0,ry=T.ry||0,rz=T.rz||0;
  var cx=Math.cos(rx),sx=Math.sin(rx),cy=Math.cos(ry),sy=Math.sin(ry),cz=Math.cos(rz),sz=Math.sin(rz);
  var sxv=T.sx===undefined?1:T.sx, syv=T.sy===undefined?1:T.sy, szv=T.sz===undefined?1:T.sz;
  var dx=T.dx||0,dy=T.dy||0,dz=T.dz||0;
  var out=Geo(),i,k;
  for(i=0;i<g.v.length;i+=3){
    var x=g.v[i]*sxv,y=g.v[i+1]*syv,z=g.v[i+2]*szv;
    if(ry){var nx=x*cy-z*sy,nz=x*sy+z*cy;x=nx;z=nz;}
    if(rx){var ny=y*cx-z*sx,nz2=y*sx+z*cx;y=ny;z=nz2;}
    if(rz){var nx2=x*cz-y*sz,ny2=x*sz+y*cz;x=nx2;y=ny2;}
    out.v.push(x+dx,y+dy,z+dz);
  }
  for(var f=0;f<g.f.length;f++){
    var F=g.f[f],arr=[];
    for(k=0;k<F.i.length;k++)arr.push(F.i[k]);
    out.f.push({i:arr,c:F.c,ds:F.ds,glow:F.glow});
  }
  return out;
}
function merge(list){
  var out=Geo(),n,i,k;
  for(n=0;n<list.length;n++){
    var g=list[n];if(!g)continue;
    var base=out.v.length/3;
    for(i=0;i<g.v.length;i++)out.v.push(g.v[i]);
    for(i=0;i<g.f.length;i++){
      var F=g.f[i],arr=[];
      for(k=0;k<F.i.length;k++)arr.push(F.i[k]+base);
      out.f.push({i:arr,c:F.c,ds:F.ds,glow:F.glow});
    }
  }
  return out;
}
function recolor(g,col){for(var i=0;i<g.f.length;i++)g.f[i].c=col;return g;}
function glowGeo(g){for(var i=0;i<g.f.length;i++)g.f[i].glow=1;return g;}
function tintGeo(g,k){for(var i=0;i<g.f.length;i++){var c=g.f[i].c;g.f[i].c=[c[0]*k,c[1]*k,c[2]*k];}return g;}
function circlePts(n,rx,rz,rot){
  var a=[],i;rot=rot||0;
  for(i=0;i<n;i++){var t=rot+i/n*TAU;a.push([Math.cos(t)*rx,Math.sin(t)*rz]);}
  return a;
}

/* ------------------------------- 调色板 ------------------------------- */
var PAL={
  sand:C('#EFE1B4'), sand2:C('#E1CE97'), wet:C('#D8C79A'),
  soil:C('#C9A97C'), soil2:C('#A98757'), soil3:C('#8A6A45'),
  water:C('#8FD9E0'), waterDeep:C('#5EBFCB'), foam:C('#DCF6F7'),
  rockA:C('#9FB0C1'), rockB:C('#BAC8D6'), rockC:C('#8496A8'), rockD:C('#CFE0E8'),
  leafA:C('#7CC97F'), leafB:C('#57A863'), leafC:C('#9DDB92'), leafD:C('#3E8551'),
  wood:C('#C69A6B'), wood2:C('#A67C51'), wood3:C('#8A6540'),
  clay:C('#E2896B'), coral:C('#FF8FA6'), coral2:C('#F2A0B8'),
  purple:C('#9E93E8'), plum:C('#B37FC9'), bone:C('#F6F1E4'),
  snow:C('#F4F8FB'), snow2:C('#DDE9F2'), ice:C('#BFE0EE'),
  night:C('#2E4B63'), lamp:C('#FFD9A0'), fire:C('#FF9E4D')
};

/* ------------------------------- 场景道具 ------------------------------- */
/* 柔和接触阴影：径向渐变贴片，随相机俯仰压成椭圆 */
var _shadowImg=null;
function shadowImg(){
  if(_shadowImg)return _shadowImg;
  var c=document.createElement('canvas');c.width=c.height=64;
  var x=c.getContext('2d');
  var gr=x.createRadialGradient(32,32,0,32,32,32);
  gr.addColorStop(0,'rgba(22,50,48,0.58)');
  gr.addColorStop(0.35,'rgba(22,50,48,0.40)');
  gr.addColorStop(0.7,'rgba(22,50,48,0.13)');
  gr.addColorStop(1,'rgba(22,50,48,0)');
  x.fillStyle=gr;x.fillRect(0,0,64,64);
  _shadowImg=c;return c;
}
/* 零件的落地包围盒（只算一次，缓存到零件上）。
   阴影足迹只取底部 30% 的顶点——树冠再大，影子也该贴着树根 */
function partBB(p){
  if(!p._bbK){
    var V=p.g.v,minx=1e9,maxx=-1e9,miny=1e9,maxy=-1e9,minz=1e9,maxz=-1e9,i;
    for(i=0;i<V.length;i+=3){
      var x=V[i],y=V[i+1],z=V[i+2];
      if(x<minx)minx=x; if(x>maxx)maxx=x;
      if(y<miny)miny=y; if(y>maxy)maxy=y;
      if(z<minz)minz=z; if(z>maxz)maxz=z;
    }
    var yCut=miny+(maxy-miny)*0.3,bx=0,bz=0,bn=0,fr=0.07;
    for(i=0;i<V.length;i+=3){
      if(V[i*3+1]<=yCut){
        bx+=V[i*3];bz+=V[i*3+2];bn++;
        var d=Math.sqrt(V[i*3]*V[i*3]+V[i*3+2]*V[i*3+2]);
        if(d>fr)fr=d;
      }
    }
    p._bbX=bn?bx/bn:(minx+maxx)/2; p._bbZ=bn?bz/bn:(minz+maxz)/2;
    p._bbR=Math.max(fr,0.07);
    p._bbMinY=miny; p._bbK=1;
  }
}
function emitShadowAt(cx,cy,cz,r,a){
  proj(cx,cy+0.01,cz);
  var k=REN.dist/(REN.dist+_pz);
  var rx=r*REN.scale*k;
  if(rx<1.4)return;
  var ry=rx*clamp(Math.sin(REN.cam.pitch)*1.45,0.38,1);
  var o=newFace();
  o.n=0;o.img=1;o.x[0]=_px;o.y[0]=_py;o.rx=rx;o.ry=ry;
  o.z=_pz;o.a=clamp(a*2.2,0,1);o.L=1;
  REN.order[REN.nOrder++]=REN.pn-1;
}
function emitShadow(p){
  emitShadowAt(p.x,(p.y||0),p.z,p.shR*(p.sx||1)*0.98,p.alpha);
}
/* 自动接触阴影：所有落在地面的实体零件自动获得柔和投影；
   悬空越高，影子越淡、越朝背光方向偏移（飞鸟也能在地上留下斜影） */
function autoShadow(w,p){
  partBB(p);
  var r=p._bbR*((p.sx||1)+(p.sz||1))*0.5;
  if(r<0.09||r>2.6)return;
  var gy=p.y+p._bbMinY*(p.sy||1);
  if(gy>3.0||gy<-0.35)return;
  var lift=clamp(gy,0,3);
  var a=0.155*(1-lift*0.26);
  if(a<=0.012)return;
  var cx=p.x+p._bbX*(p.sx||1)-REN.sun[0]*lift*0.5;
  var cz=p.z+p._bbZ*(p.sz||1)-REN.sun[2]*lift*0.5;
  emitShadowAt(cx,gy,cz,r*1.12,a);
}
function shadow(w,x,z,r,alpha,n){
  var p=w.put(Geo(),{x:x,z:z,y:0,alpha:alpha===undefined?0.13:alpha});
  p.softShadow=true;p.shR=r;
  return p;
}
function ripples(w,x,z,y,rmax,col,dur,phase,count){
  for(var i=0;i<(count||3);i++){
    (function(i){
      var p=w.put(bandGeo(circlePts(18,1,1),0.87,1.0,0,col),{x:x,z:z,y:y,alpha:0.4});
      p.sc=1;
      p.anim=function(t){
        var u=((t/dur)+(phase||0)+i/(count||3))%1;
        var s=0.22+u*rmax;
        p.sx=s;p.sz=s;p.y=y;
        p.alpha=0.34*(1-u)*(1-u);
      };
    })(i);
  }
}
function pebbles(w,seed,x,z,rad,n,col,size){
  var rr=rng(seed),i;
  for(i=0;i<n;i++){
    var a=rr()*TAU,d=Math.sqrt(rr())*rad;
    var s=size*(0.6+rr()*0.8);
    w.put(blobGeo(s,col,{su:6,sv:4,jitter:0.28,rand:rr,sy:0.62,sx:1+rr()*0.4,sz:1+rr()*0.4}),
      {x:x+Math.cos(a)*d,z:z+Math.sin(a)*d,y:0.005,ry:rr()*TAU});
  }
}
function rock(w,x,z,s,col,seed,o){
  o=o||{};var rr=rng(seed||1);
  var g=blobGeo(s,col,{su:o.su||6,sv:o.sv||4,jitter:o.jit===undefined?0.3:o.jit,rand:rr,sy:o.sy||0.8,sx:1+(rr()-0.5)*0.5,sz:1+(rr()-0.5)*0.5});
  return w.put(g,{x:x,z:z,y:o.y||0,ry:rr()*TAU});
}
function grassTuft(w,x,z,col,seed,h){
  var rr=rng(seed||2),i,n=3+((seed||2)%3),list=[];
  h=h||0.36;
  for(i=0;i<n;i++){
    var a=rr()*TAU,d=rr()*0.09;
    list.push(xf(prismGeo(3,0.035,0.012,h*(0.6+rr()*0.6),col),
      {rz:(rr()-0.5)*0.7,ry:a,dx:Math.cos(a)*d,dz:Math.sin(a)*d}));
  }
  return w.put(merge(list),{x:x,z:z,y:0,ry:rr()*TAU});
}
function flower(w,x,z,stemH,petal,core,seed){
  var rr=rng(seed||5),list=[];
  list.push(prismGeo(4,0.028,0.022,stemH,PAL.leafB));
  var pc=5;
  for(var i=0;i<pc;i++){
    var a=i/pc*TAU;
    list.push(xf(sphereGeo(0.075,4,3,petal,{}),{dx:Math.cos(a)*0.085,dy:stemH,dz:Math.sin(a)*0.085}));
  }
  list.push(xf(sphereGeo(0.05,5,3,core,{}),{dy:stemH+0.02}));
  return w.put(merge(list),{x:x,z:z,y:0,ry:rr()*TAU});
}
function bush(w,x,z,s,col,col2,seed){
  var rr=rng(seed||9),list=[],i;
  for(i=0;i<4;i++){
    var a=rr()*TAU,d=rr()*s*0.5;
    list.push(xf(blobGeo(s*(0.55+rr()*0.35),i%2?col:col2,{su:6,sv:4,jitter:0.24,rand:rr,sy:0.85}),
      {dx:Math.cos(a)*d,dy:s*0.25+rr()*s*0.25,dz:Math.sin(a)*d}));
  }
  return w.put(merge(list),{x:x,z:z,y:0,ry:rr()*TAU});
}
function tree(w,x,z,o){
  o=o||{};var rr=rng(o.seed||3);
  var h=o.h||1.5, col=o.col||PAL.leafA, col2=o.col2||PAL.leafB, list=[],i;
  list.push(prismGeo(5,0.17,0.12,h,PAL.wood2));
  var nr=o.blobs||5, R=o.r||0.62;
  /* 树冠：主体一大团压在树干顶上，周围小团填缝，整体包住干顶不悬空 */
  list.push(xf(blobGeo(R*1.02,col,{su:8,sv:6,jitter:0.14,rand:rr,sy:0.85}),
    {dy:h*0.78}));
  for(i=1;i<nr;i++){
    var a=rr()*TAU,d=rr()*R*0.62;
    var br=R*(0.5+rr()*0.42);
    list.push(xf(blobGeo(br,(i%2)?col:col2,{su:8,sv:6,jitter:0.15,rand:rr,sy:0.82}),
      {dx:Math.cos(a)*d,dy:h*0.72+rr()*R*0.4,dz:Math.sin(a)*d}));
  }
  return w.put(merge(list),{x:x,z:z,y:o.y||0,ry:rr()*TAU});
}
function pine(w,x,z,o){
  o=o||{};var rr=rng(o.seed||11),h=o.h||1.9,list=[],i;
  list.push(prismGeo(5,0.16,0.12,h*0.8,PAL.wood3));
  var layers=4, col=o.col||C('#5E8F7A'), col2=o.col2||C('#77A991');
  for(i=0;i<layers;i++){
    var t=i/(layers-1);
    var r=(0.78-0.5*t)*(o.w||1), y=h*0.55+t*h*0.5, hh=h*0.42*(1-t*0.35);
    list.push(xf(prismGeo(7,r,r*0.05,hh,i%2?col:col2,{rot:rr()*0.5}),{dy:y}));
  }
  return w.put(merge(list),{x:x,z:z,y:o.y||0,ry:rr()*TAU});
}
function palm(w,x,z,o){
  o=o||{};var rr=rng(o.seed||17),h=o.h||2.3,list=[],i,lean=o.lean===undefined?0.28:(o.lean);
  var seg=5,cx=0,cz=0;
  for(i=0;i<seg;i++){
    var t=i/seg;
    var r=0.13-0.06*t;
    var segG=prismGeo(5,r,r*0.92,h/seg,PAL.wood);
    var dx=0,dz=0;
    if(i>0){dx=lean*h/seg*0.7*i*0.55;dz=o.leanZ?o.leanZ*h/seg*0.4*i*0.5:0;}
    list.push(xf(segG,{dx:cx,dy:h/seg*i,dz:cz}));
    cx+=dx*0.5;cz+=dz*0.5;
  }
  var topX=lean*h*0.5, topZ=(o.leanZ||0)*h*0.3;
  /* 树冠：一圈鼓胀的叶柄根 + 垂坠的长叶 */
  list.push(xf(sphereGeo(0.16,6,4,C('#8A6A45'),{sy:0.7}),{dx:topX,dy:h*0.97,dz:topZ}));
  var fr=o.fronds||7;
  for(i=0;i<fr;i++){
    var a=i/fr*TAU + (o.rot||0) + rr()*0.2;
    var len=(o.frondLen||1.05)*(0.85+rr()*0.4);
    list.push(xf(droopFrond(len,0.10,(o.col||C('#5FB65E')),{rr:rr,droop:o.droop}),
      {ry:a,dx:topX,dy:h*0.99,dz:topZ}));
  }
  list.push(xf(sphereGeo(0.13,5,3,C('#D9B36A'),{}),{dx:topX,dy:h*0.93,dz:topZ}));
  return w.put(merge(list),{x:x,z:z,y:o.y||0,ry:0});
}
/* 一根从叶柄根部长出、逐渐下垂的棕榈叶：3-4 段链接，先上扬后垂到水下 */
function droopFrond(len,w,col,rr){
  rr=rr||{};var R=rr.rr||Math.random;
  var segs=len>1.0?4:3, tl=len/segs;
  var drop=rr.droop===undefined?1:rr.droop;
  var angs=[0.55,1.05,1.6,2.15];
  var out=Geo(),px=0,py=0,i;
  for(i=0;i<segs;i++){
    var th=angs[i]*(0.92+R()*0.16)*drop;
    var r0=w*(1-i/segs*0.78), r1=w*(1-(i+1)/segs*0.78);
    var g=prismGeo(4,r0,r1,tl,i%2?col:mix(col,C('#4E9E50'),0.35));
    out=merge([out,xf(g,{rz:th,dx:px,dy:py})]);
    px+=-Math.sin(th)*tl;py+=Math.cos(th)*tl;
  }
  return out;
}
/* 小渔船：尖头平底，船舱/桨/缆绳可选 */
function boat(w,x,z,o){
  o=o||{};var L=o.len||1.25,Wd=o.w||0.46,hy=o.h||0.30;
  var col=o.col||C('#F2EFE6'), inner=o.inner||C('#C97C55'), keel=o.keel||mix(col,C('#8A6540'),0.4);
  var g=Geo();
  var y0=0.02,y1=hy;
  var a=P(g,-Wd*0.5,y0,-L*0.5),b=P(g,Wd*0.5,y0,-L*0.5),c=P(g,Wd*0.5,y0,L*0.40),d=P(g,-Wd*0.5,y0,L*0.40),e=P(g,0,y0,L*0.62);
  var a2=P(g,-Wd*0.44,y1,-L*0.47),b2=P(g,Wd*0.44,y1,-L*0.47),c2=P(g,Wd*0.46,y1,L*0.38),d2=P(g,-Wd*0.46,y1,L*0.38),e2=P(g,0,y1,L*0.58);
  quad(g,a,b,b2,a2,keel);
  quad(g,b,c,c2,b2,col);
  quad(g,c,e,e2,c2,col);
  quad(g,e,d,d2,e2,col);
  quad(g,d,a,a2,d2,col);
  face(g,[a2,b2,c2,e2,d2],inner,1);
  var list=[g];
  /* 船头横板 + 舱板 */
  list.push(xf(boxGeo(Wd*0.8,0.05,0.16,C('#B98A5C')),{dz:-L*0.34,dy:hy-0.02}));
  if(o.cabin!==false){
    list.push(xf(boxGeo(Wd*0.56,0.22,0.34,C('#E2896B'),{top:mix(C('#E2896B'),C('#FFFFFF'),0.18)}),{dz:L*0.05,dy:hy}));
  }
  if(o.oar){
    list.push(xf(prismGeo(4,0.028,0.02,0.78,C('#A67C51')),{rz:1.35,ry:0.5,dx:Wd*0.3,dy:hy-0.06,dz:-L*0.12}));
    list.push(xf(sphereGeo(0.055,5,3,C('#A67C51'),{sy:0.55}),{dx:Wd*0.62,dy:hy-0.34,dz:-L*0.26}));
  }
  var p=w.put(merge(list),{x:x,z:z,y:o.y===undefined?0:o.y,ry:o.ry||0});
  if(o.float){
    var yb=o.y===undefined?0:o.y;
    p.anim=function(t){p.y=yb+Math.sin(t*1.2+x*0.7)*0.028;p.ry=(o.ry||0)+Math.sin(t*0.5+z)*0.05;};
  }
  return p;
}
/* 木箱 / 货箱 */
function crate(w,x,z,o){
  o=o||{};var s=o.s||0.3,col=o.col||C('#C69A6B');
  var side=mix(col,C('#8A6540'),0.35), top=mix(col,C('#FFFFFF'),0.12);
  var list=[boxGeo(s,s,s,col,{side:side,top:top}),
    xf(boxGeo(s*1.05,s*0.11,s*0.13,side),{dy:s*0.44}),
    xf(boxGeo(s*0.13,s*0.11,s*1.05,side),{dy:s*0.44})];
  if(o.stacked)list.push(xf(boxGeo(s*0.72,s*0.72,s*0.72,mix(col,C('#FFFFFF'),0.08),{side:side,top:top}),{dy:s*0.86,ry:0.5}));
  return w.put(merge(list),{x:x,z:z,y:o.y||0,ry:o.ry||0});
}
/* 木桶：桶身 + 两道箍 */
function barrel(w,x,z,o){
  o=o||{};var r=o.r||0.17,h=o.h||0.34,col=o.col||C('#B98A5C');
  var ring=mix(col,C('#5A4634'),0.55);
  var g=merge([
    prismGeo(9,r*0.88,r,h,col,{top:mix(col,C('#6E523A'),0.35)}),
    xf(prismGeo(9,r*1.0,r*1.0,0.045,ring),{dy:h*0.22}),
    xf(prismGeo(9,r*0.96,r*0.96,0.045,ring),{dy:h*0.78})
  ]);
  return w.put(g,{x:x,z:z,y:o.y||0,ry:o.ry||0});
}
/* 浮标：随浪轻摇 */
function buoy(w,x,z,y,seed,col){
  var rr=rng(seed||7);
  var c1=col||C('#E2896B');
  var g=merge([
    xf(prismGeo(8,0.13,0.15,0.10,c1),{dy:0.02}),
    prismGeo(8,0.10,0.075,0.16,C('#F2EFE4')),
    xf(sphereGeo(0.05,5,3,C('#3E5A75')), {dy:0.28})
  ]);
  var p=w.put(g,{x:x,z:z,y:(y||0)-0.03});
  var ph=rr()*6;
  p.anim=function(t){p.y=(y||0)-0.03+Math.sin(t*1.4+ph)*0.035;p.ry=ph+t*0.25;p.rz=Math.sin(t*1.1+ph)*0.12;};
  return p;
}
/* 码头爬梯：两根立柱 + 横档，下半截没进水里 */
function pierLadder(w,x,z,o){
  o=o||{};var h=o.h||0.9,GY=o.y||0;
  var list=[
    xf(prismGeo(4,0.035,0.03,h,C('#8A6540')),{dx:-0.11}),
    xf(prismGeo(4,0.035,0.03,h,C('#8A6540')),{dx:0.11})
  ];
  for(var i=0;i<4;i++)list.push(xf(boxGeo(0.24,0.035,0.035,C('#A67C51')),{dy:0.12+i*0.22}));
  return w.put(merge(list),{x:x,z:z,y:GY,ry:o.ry||0});
}
/* 水下沙洲：透过浅水能看见的一片浅色沙 + 散石 */
function sandbar(w,x,z,r,y,col,seed){
  var rr=rng(seed||21),i;
  w.put(discGeo(circlePts(10,r,r*0.8,rr()*TAU),0.001,y,col||C('#E8D9A8'),1),{x:x,z:z,alpha:0.85,layer:0});
  for(i=0;i<5;i++){
    var a=rr()*TAU,d=Math.sqrt(rr())*r*0.8;
    w.put(blobGeo(0.10+rr()*0.16,C('#B7A98A'),{su:5,sv:3,jitter:0.3,rand:rr,sy:0.5}),
      {x:x+Math.cos(a)*d,z:z+Math.sin(a)*d,y:y-0.01});
  }
}
function lantern(w,x,z,o){
  o=o||{};
  var col=o.col||PAL.clay, list=[];
  list.push(prismGeo(4,0.045,0.035,o.h||1.15,PAL.wood3));
  list.push(xf(prismGeo(6,0.02,0.02,0.09,PAL.wood3),{dy:o.h||1.15}));
  list.push(xf(prismGeo(6,0.19,0.155,0.30,col),{dy:(o.h||1.15)+0.07}));
  list.push(xf(prismGeo(6,0.175,0.175,0.03,col),{dy:o.h||1.15}));
  list.push(xf(prismGeo(6,0.07,0.02,0.07,PAL.wood3),{dy:(o.h||1.15)+0.37}));
  var p=w.put(merge(list),{x:x,z:z,y:o.y||0,ry:o.ry||0});
  p.data={lit:false};
  if(o.id)p.id=o.id;
  return p;
}
function house(w,x,z,o){
  o=o||{};var list=[],i;
  var W=o.w||1.5,D=o.d||1.25,H=o.h||0.95;
  list.push(boxGeo(W,H,D,o.wall||C('#F2E7D2'),{side:o.wallSide||C('#E4D5BC'),top:o.wallTop||C('#E9DCC4')}));
  // 屋顶（双坡）
  var rh=o.roofH||0.5, rc=o.roof||C('#3E5A75'), rc2=o.roof2||C('#4E6E8C');
  var g=Geo(),x1=-W*0.62,z1=-D*0.62,x2=W*0.62,z2=D*0.62,yt=H, yp=H+rh;
  var a=P(g,x1,yt,z1),b=P(g,x2,yt,z1),c=P(g,x2,yt,z2),d=P(g,x1,yt,z2);
  var r1=P(g,x1,yp,0),r2=P(g,x2,yp,0);
  quad(g,r1,d,c,r2,rc,0);
  quad(g,r2,b,a,r1,rc2,0);
  tri(g,r2,c,b,rc,0);
  tri(g,r1,a,d,rc2,0);
  list.push(g);
  // 门
  list.push(xf(boxGeo(0.3,0.5,0.04,o.door||PAL.wood3),{dz:D/2+0.01,dy:0.02}));
  // 窗
  var winC=o.winOff||C('#F6D98F');
  list.push(xf(boxGeo(0.26,0.26,0.04,winC,{glow:1}),{dx:-W*0.32,dz:D/2+0.01,dy:H*0.45}));
  var winP=w.put(xf(boxGeo(0.26,0.26,0.03,winC),{dx:-W*0.32,dz:D/2+0.03,dy:H*0.45}),{x:x,z:z,y:0,glow:1,alpha:0});
  var h2=w.put(merge(list),{x:x,z:z,y:o.y||0,ry:o.ry||0,tag:'house'});
  h2.data={winPart:winP,base:o};
  return h2;
}
function woodDeck(w,o){
  o=o||{};var list=[],i,n=o.n||7;
  for(i=0;i<n;i++){
    list.push(xf(boxGeo(o.pw||0.34,o.ph||0.075,o.depth||1.5,PAL.wood,{side:PAL.wood2,top:PAL.wood}),
      {dx:(i-(n-1)/2)*(o.gap||0.38)}));
  }
  return w.put(merge(list),{x:o.x||0,z:o.z||0,y:o.y||0,ry:o.ry||0});
}
function signPost(w,x,z,o){
  o=o||{};var list=[];
  list.push(xf(prismGeo(4,0.05,0.04,0.85,PAL.wood3),{dx:-0.22}));
  list.push(xf(prismGeo(4,0.05,0.04,0.85,PAL.wood3),{dx:0.22}));
  list.push(xf(boxGeo(0.72,0.30,0.05,C('#F4EEE0'),{side:C('#DCCFB6')}),{dy:0.72}));
  list.push(xf(boxGeo(0.5,0.06,0.02,o.col||PAL.coral),{dy:0.85,dz:0.032}));
  list.push(xf(boxGeo(0.34,0.05,0.02,C('#B9C9C6')),{dy:0.74,dz:0.032}));
  return w.put(merge(list),{x:x,z:z,y:o.y||0,ry:o.ry||0});
}
function crystal(w,x,z,s,col,seed){
  var rr=rng(seed||13),list=[],i,n=3;
  for(i=0;i<n;i++){
    var a=rr()*TAU,d=rr()*s*0.5;
    list.push(xf(prismGeo(5,s*(0.18+rr()*0.14),0.008,s*(0.9+rr()*0.9),col,{rot:rr()}),
      {dx:Math.cos(a)*d,dz:Math.sin(a)*d,rz:(rr()-0.5)*0.5,ry:a}));
  }
  return w.put(merge(list),{x:x,z:z,y:0,ry:rr()*TAU});
}
function logPile(w,x,z,o){
  o=o||{};var list=[],i,l=o.len||0.9,r=0.085;
  for(i=0;i<3;i++)list.push(xf(prismGeo(6,r,r,l,PAL.wood,{rot:0}),{rz:Math.PI/2,dx:(i-1)*0.06,dz:0,dy:0.1+(i===1?r*1.7:0)}));
  for(i=0;i<2;i++)list.push(xf(prismGeo(6,r,r,l*0.9,PAL.wood2,{rot:0}),{rz:Math.PI/2,dx:0,dz:(i-0.5)*0.2,dy:2*r+0.12}));
  return w.put(merge(list),{x:x,z:z,y:o.y||0,ry:o.ry||0});
}
function lotusLeaf(w,x,z,r,col,y){
  var g=prismGeo(9,r,r*0.98,0.02,col,{top:col});
  var list=[g];
  for(var i=0;i<3;i++){
    var a=i/3*TAU+0.3;
    list.push(xf(prismGeo(3,0.025,0.02,0.05,col),{dx:Math.cos(a)*r*0.6,dz:Math.sin(a)*r*0.6,dy:0.02}));
  }
  var p=w.put(merge(list),{x:x,z:z,y:y===undefined?0:y});
  p._base=y||0;
  p.anim=function(t){p.y=(p._base||0)+Math.sin(t*1.1+p.x)*0.012;};
  return p;
}

/* ------------------------------- 小生物 ------------------------------- */
var EYE_W=C('#FFFFFF'), EYE_D=C('#26343E'), BLUSH=C('#F7A8A0');
function eyePair(list,y,z,r,spread){
  var er=r||0.062, sp=spread===undefined?0.11:spread;
  list.push(xf(sphereGeo(er,5,3,EYE_W,{}),{dx:-sp,dy:y-er,dz:z}));
  list.push(xf(sphereGeo(er,5,3,EYE_W,{}),{dx:sp,dy:y-er,dz:z}));
  list.push(xf(sphereGeo(er*0.52,5,3,EYE_D,{}),{dx:-sp,dy:y-er*0.75,dz:z+er*0.62}));
  list.push(xf(sphereGeo(er*0.52,5,3,EYE_D,{}),{dx:sp,dy:y-er*0.75,dz:z+er*0.62}));
}
function blushPair(list,y,z,spread,r){
  var rr=r||0.05,sp=spread||0.2;
  list.push(xf(sphereGeo(rr,5,3,BLUSH,{}),{dx:-sp,dy:y-rr,dz:z,sy:0.6}));
  list.push(xf(sphereGeo(rr,5,3,BLUSH,{}),{dx:sp,dy:y-rr,dz:z,sy:0.6}));
}
function mkOctopus(c,c2,o){
  o=o||{};var list=[],i,R=o.r||0.3;
  list.push(sphereGeo(R,8,6,c,{sy:o.sy||1.05,sx:1,sz:1}));
  var n=o.legs||8;
  for(i=0;i<n;i++){
    var a=i/n*TAU;
    var leg=prismGeo(4,0.052,0.022,R*(o.legLen||1.15),c2);
    list.push(xf(leg,{rz:0.95,ry:a,dx:Math.cos(a)*R*0.55,dz:Math.sin(a)*R*0.55,dy:0.02}));
  }
  eyePair(list,R*1.15,R*0.92,o.eye||0.062,0.115);
  blushPair(list,R*0.62,R*0.86,0.14,0.045);
  return merge(list);
}
function mkCrab(c,cShell,cClaw,o){
  o=o||{};var list=[],i,R=o.r||0.22;
  list.push(xf(sphereGeo(R,7,5,cShell,{sy:0.72,sx:1.15,sz:1}),{dy:R*0.62}));
  list.push(xf(sphereGeo(R*0.42,6,4,c,{}),{dy:R*0.42,dz:R*0.62}));
  eyePair(list,R*0.98,R*0.92,R*0.045,0.085);
  for(i=0;i<2;i++){
    var s=i?-1:1;
    list.push(xf(sphereGeo(R*0.30,6,4,cClaw,{sx:1.25}),{dx:s*R*1.05,dy:R*0.62,dz:R*0.42}));
    list.push(xf(prismGeo(4,0.03,0.022,R*0.7,cClaw),{rz:s*1.1,dx:s*R*1.1,dy:R*0.9}));
  }
  for(i=0;i<6;i++){
    var si=i<3?-1:1, k=i%3;
    var a=(k-1)*0.55*si;
    list.push(xf(prismGeo(4,0.028,0.018,R*0.85,c),{rz:si*0.75,ry:a*0.5,
      dx:si*R*0.5,dz:(k-1)*R*0.55}));
  }
  return merge(list);
}
function mkHermit(cShell,cShell2,cBody,o){
  o=o||{};var list=[],i;
  var base=mkCrab(cBody,cShell,cBody,{r:0.19});
  list.push(base);
  var sx=0,sy=0,sr=0.30;
  for(i=0;i<4;i++){
    var t=i/3;
    var r=sr*(1-t*0.62);
    var seg=sphereGeo(r,7,5,i%2?cShell:cShell2,{sx:1,sy:1,sz:1});
    list.push(xf(seg,{dx:-0.02-i*0.10,dy:0.34+i*0.20,dz:-0.06-i*0.05,sx:1,sz:0.95}));
  }
  return merge(list);
}
function mkFish(c,cFin,cBelly,o){
  o=o||{};var L=o.len||0.4,list=[];
  list.push(sphereGeo(L*0.5,7,5,c,{sx:1.55,sy:0.8,sz:0.72}));
  if(cBelly)list.push(xf(sphereGeo(L*0.30,6,4,cBelly,{sx:1.5,sy:0.5,sz:0.7}),{dy:-L*0.06}));
  var g=Geo();
  var a=P(g,0,0,0),b=P(g,0,L*0.3,0),c2=P(g,0,L*0.15,-L*0.34),d=P(g,0,L*0.15,L*0.34);
  quad(g,a,c2,b,d,cFin,1,0);
  list.push(xf(g,{dy:L*0.4,sx:1}));
  var f=Geo();
  var f1=P(f,-L*0.06,0,0),f2=P(f,L*0.06,0,0),f3=P(f,0,L*0.22,0);
  tri(f,f1,f2,f3,cFin,1,0);
  list.push(xf(f,{dy:L*0.78,dx:L*0.05}));
  eyePair(list,L*0.62,L*0.62,L*0.05,0.09);
  return merge(list);
}
function mkStar(c,o){
  o=o||{};var list=[],i,R=o.r||0.3;
  list.push(xf(prismGeo(5,R*0.5,R*0.42,R*0.22,c,{top:c}),{dy:0}));
  for(i=0;i<5;i++){
    var a=i/5*TAU + (o.rot||0);
    var arm=prismGeo(4,R*0.13,R*0.02,R*0.95,c);
    list.push(xf(arm,{rz:1.5,ry:a,dx:Math.cos(a)*R*0.5,dy:R*0.17,dz:Math.sin(a)*R*0.5}));
  }
  return merge(list);
}
function mkJelly(c,cGlow,o){
  o=o||{};var list=[],i,R=o.r||0.26;
  list.push(xf(sphereGeo(R,8,5,c,{sy:0.85}),{dy:R*0.6}));
  list.push(xf(sphereGeo(R*0.62,7,4,cGlow,{sy:0.6}),{dy:R*0.72,sx:1,sz:1}));
  for(i=0;i<5;i++){
    var a=i/5*TAU;
    list.push(xf(prismGeo(3,0.028,0.014,R*(1.1+(i%2)*0.5),cGlow),
      {dx:Math.cos(a)*R*0.5,dz:Math.sin(a)*R*0.5,dy:0.02,rz:(i%2?0.3:-0.3)}));
  }
  return merge(list);
}
function mkWing(mkBird,c,c2,cBeak,o){
  o=o||{};var list=[],L=o.len||0.3;
  list.push(sphereGeo(L*0.5,7,5,c,{sx:1.35,sy:0.92,sz:0.82}));
  list.push(xf(sphereGeo(L*0.34,6,4,c,{}),{dy:L*0.82,dz:L*0.36}));
  list.push(xf(prismGeo(3,L*0.09,0.006,L*0.30,cBeak),{rz:1.5,dy:L*0.86,dz:L*0.62}));
  for(var i=0;i<2;i++){
    var s=i?-1:1;
    list.push(xf(prismGeo(4,L*0.16,L*0.02,L*0.5,c2),{rz:s*1.25,dx:s*L*0.28,dy:L*0.72}));
  }
  var g=Geo();
  var a=P(g,0,0,0),b=P(g,0,L*0.36,0);
  tri(g,a,b,P(g,0,L*0.16,-L*0.22),c2,1,0);
  tri(g,a,P(g,0,L*0.16,L*0.22),b,c2,1,0);
  list.push(xf(g,{dy:L*0.42,dz:-L*0.5}));
  eyePair(list,L*0.86,L*0.62,L*0.042,0.07);
  return merge(list);
}
function mkButterfly(c,c2,o){
  o=o||{};var list=[],L=o.len||0.16,i;
  list.push(prismGeo(4,0.022,0.016,L*1.5,c));
  for(i=0;i<4;i++){
    var s=i<2?-1:1, up=i%2===0;
    var w=up?L*1.15:L*0.85, h=up?L*1.25:L*0.9;
    list.push(xf(boxGeo(w,h,0.012,i%2?c2:c,{top:i%2?c2:c}),
      {dx:s*(w*0.5+0.02),dy:L*0.8+(up?L*0.5:0),rz:s*(up?0.35:-0.25),ry:0}));
  }
  return merge(list);
}
function mkRabbit(c,c2,o){
  o=o||{};var list=[],L=o.len||0.3,i;
  list.push(sphereGeo(L*0.55,7,5,c,{sx:1.25,sy:0.92,sz:1.0}));
  list.push(xf(sphereGeo(L*0.38,7,5,c,{}),{dy:L*0.82,dz:L*0.42}));
  for(i=0;i<2;i++){
    var s=i?-1:1;
    list.push(xf(prismGeo(4,L*0.09,L*0.05,L*0.72,c2,{}),{dx:s*L*0.16,dy:L*1.0,dz:L*0.2,rz:s*0.16}));
  }
  list.push(xf(sphereGeo(L*0.2,6,4,c2,{}),{dy:L*0.28,dz:-L*0.56}));
  eyePair(list,L*0.92,L*0.72,L*0.05,0.10);
  blushPair(list,L*0.78,L*0.68,0.16,0.038);
  return merge(list);
}
function mkFrog(c,c2,o){
  o=o||{};var list=[],L=o.len||0.24,i;
  list.push(sphereGeo(L*0.62,7,5,c,{sx:1.2,sy:0.72,sz:1.05}));
  for(i=0;i<2;i++){
    var s=i?-1:1;
    list.push(xf(sphereGeo(L*0.20,6,4,c2,{}),{dx:s*L*0.34,dy:L*0.86}));
    list.push(xf(sphereGeo(L*0.085,5,3,EYE_D,{}),{dx:s*L*0.36,dy:L*0.94,dz:L*0.14}));
    list.push(xf(prismGeo(4,L*0.05,L*0.03,L*0.3,c),{rz:s*0.9,dx:s*L*0.6,dy:0.0}));
  }
  return merge(list);
}
function mkCat(c,c2,o){
  o=o||{};var list=[],L=o.len||0.34,i;
  list.push(sphereGeo(L*0.56,7,5,c,{sx:1.0,sy:0.85,sz:1.35}));
  list.push(xf(sphereGeo(L*0.40,7,5,c,{}),{dy:L*0.78,dz:L*0.72}));
  for(i=0;i<2;i++){
    var s=i?-1:1;
    list.push(xf(prismGeo(3,L*0.10,0.01,L*0.26,c2),{rz:s*0.22,dx:s*L*0.16,dy:L*1.06,dz:L*0.66}));
  }
  var tail=[];
  for(i=0;i<4;i++){
    tail.push(xf(prismGeo(4,L*0.055,L*0.04,L*0.28,c),{dz:-L*0.16*i,dy:L*0.30+i*L*0.10,rz:0.3+i*0.22}));
  }
  list.push(merge(tail));
  eyePair(list,L*0.88,L*1.02,L*0.055,0.11);
  blushPair(list,L*0.72,L*0.98,0.16,0.04);
  return merge(list);
}
function mkFirefly(c){
  return sphereGeo(0.05,5,3,c,{});
}

/* ------------------------------- 场景通用件 ------------------------------- */
function pool(w,cx,cz,r,GY,o){
  o=o||{};var n=o.n||18,i;
  w.put(discGeo(circlePts(n,r*1.20,r*1.10,0.2),0.001,GY+0.004,PAL.wet,2),{x:cx,z:cz,layer:0});
  var wcol=o.col||PAL.water, wdeep=o.deep||PAL.waterDeep;
  var wp=w.put(discGeo(circlePts(n,r,r*0.94,0.2),0.001,GY+(o.h===undefined?0.05:o.h),wcol,3,wdeep),
    {x:cx,z:cz,alpha:o.alpha===undefined?0.86:o.alpha,layer:0});
  w.put(bandGeo(circlePts(n,r,r*0.94,0.2),0.94,1.0,GY+(o.h===undefined?0.05:o.h)+0.008,PAL.foam),{x:cx,z:cz,alpha:0.42,layer:0});
  ripples(w,cx,cz,GY+(o.h===undefined?0.05:o.h)+0.012,r*0.88,PAL.foam,3.6,cx*0.31,2);
  // 环绕石头
  var rr=rng(o.seed||Math.round(cx*17+cz*31));
  var cnt=o.rocks===undefined?5:o.rocks;
  for(i=0;i<cnt;i++){
    var a=i/cnt*TAU+rr()*0.5;
    var dd=r*(1.12+rr()*0.16);
    rock(w,cx+Math.cos(a)*dd,cz+Math.sin(a)*dd*(0.94),0.20+rr()*0.16,rr()>0.5?PAL.rockB:PAL.rockA,Math.round(rr()*9999),
      {y:GY-0.08,sy:0.55,su:5,sv:3,jit:0.28});
  }
  return wp;
}
function seaGeo(rIn,rOut,y,seg,col,colOut,rings){
  var g=Geo(),i,k,idx=[];
  rings=rings||9;
  for(k=0;k<=rings;k++){
    var arr=[],rr=lerp(rIn,rOut,k/rings);
    for(i=0;i<seg;i++){var a=i/seg*TAU;arr.push(P(g,Math.cos(a)*rr,y,Math.sin(a)*rr));}
    idx.push(arr);
  }
  for(k=0;k<rings;k++){
    var A=idx[k],B=idx[k+1],cc=mix(col,colOut,(k+1)/rings);
    for(i=0;i<seg;i++){var j=(i+1)%seg;quad(g,A[i],A[j],B[j],B[i],cc,1);}
  }
  /* 海面用整圈色带过渡，逐面渐变会在细长四边形上产生放射状接缝 */
  for(i=0;i<g.f.length;i++)g.f[i].ng=1;
  return g;
}
/* 平面圆环（海面边缘消隐带用） */
function annGeo(r0,r1,y,seg,col){
  var g=Geo(),i,A=[],B=[];
  for(i=0;i<seg;i++){var a=i/seg*TAU;A.push(P(g,Math.cos(a)*r0,y,Math.sin(a)*r0));B.push(P(g,Math.cos(a)*r1,y,Math.sin(a)*r1));}
  for(i=0;i<seg;i++){var j=(i+1)%seg;quad(g,A[i],A[j],B[j],B[i],col,1);}
  for(i=0;i<g.f.length;i++)g.f[i].ng=1;
  return g;
}
function waterPlane(w,y,rIn,rOut,col,alpha,colOut){
  ripples(w,0,0,y+0.02,rIn*0.92,PAL.foam,5.2,0.2,3);
  ripples(w,0,0,y+0.02,rIn*1.14,PAL.foam,6.8,0.42,2);
  /* 水面波光：随波缓缓明灭的白色光斑 */
  var gi;
  for(gi=0;gi<7;gi++){
    (function(k){
      var ga=k*1.7+0.6, gd=rIn*0.45+(k%4)/4*(rOut-rIn)*0.5;
      var gs=w.sprite({p:[Math.cos(ga)*gd,y+0.03,Math.sin(ga)*gd],r:0.14+(k%3)*0.05,col:C('#EAF9FF'),a:0,shape:'soft'});
      var ph=k*1.7;
      gs.anim=function(t){gs.a=0.22*(0.5+0.5*Math.sin(t*1.9+ph));};
    })(gi);
  }
  /* 主体海面 */
  w.put(seaGeo(rIn,rOut*0.86,y,40,col,colOut||mix(col,C('#1F6E77'),0.4)),
    {alpha:alpha===undefined?0.55:alpha,layer:0});
  /* 外缘消隐：一圈圈溶进天空色，避免出现生硬的椭圆边界 */
  var co=colOut||mix(col,C('#1F6E77'),0.4),fj;
  for(fj=0;fj<5;fj++){
    var f0=rOut*(0.86+fj*0.062), f1=rOut*(0.86+(fj+1)*0.062);
    w.put(annGeo(f0,f1,y,40,mix(co,w.bg[1],0.25+(fj+1)*0.17)),
      {alpha:(alpha===undefined?0.55:alpha)*(1-(fj+0.8)/5.6),layer:0});
  }
  return null;
}
function mushroom(w,x,z,o){
  o=o||{};var list=[],r=o.r||0.2,h=o.h||0.28;
  list.push(prismGeo(5,r*0.35,r*0.28,h,o.stem||C('#F3EAD8')));
  list.push(xf(sphereGeo(r,7,5,o.cap||C('#E2585E'),{sy:0.62}),{dy:h}));
  if(o.dots){
    for(var i=0;i<5;i++){
      var a=i/5*TAU+0.4;
      list.push(xf(sphereGeo(r*0.15,4,2,C('#FFF6EA'),{}),{dx:Math.cos(a)*r*0.55,dy:h+r*0.42,dz:Math.sin(a)*r*0.55,sy:0.5}));
    }
  }
  return w.put(merge(list),{x:x,z:z,y:o.y||0,ry:o.ry||0});
}
function riceTuft(w,x,z,seed,h){
  var rr=rng(seed||4),list=[],i,n=5;
  h=h||0.42;
  for(i=0;i<n;i++){
    var a=rr()*TAU,d=rr()*0.1;
    var col=mix(C('#9BC46A'),C('#D9C46A'),rr());
    list.push(xf(prismGeo(3,0.05,0.012,h*(0.7+rr()*0.5),col),{rz:(rr()-0.5)*0.8,ry:a,dx:Math.cos(a)*d,dz:Math.sin(a)*d}));
  }
  return w.put(merge(list),{x:x,z:z,y:0,ry:rr()*TAU});
}
/* 小动物：加入世界并登记点击 */
function addPet(w,o){
  var p=w.put(o.geo,{x:o.x,y:o.y||0,z:o.z,ry:o.ry||0,sc:o.sc||1});
  var base=o.y||0, ph=o.ph||(o.x*1.7+o.z*0.9), amp=o.amp===undefined?0.035:o.amp, sp=o.sp||1.5;
  var hop={v:0};
  p.anim=function(t){
    p.y=base+Math.sin(t*sp+ph)*amp+(hop.v>0?Math.abs(Math.sin(t*13))*hop.v*0.15:0);
    p.ry=(o.ry||0)+Math.sin(t*sp*0.45+ph)*(o.sway===undefined?0.13:o.sway);
    if(hop.v>0)hop.v*=0.94;else hop.v=0;
  };
  w.pick({get:function(){return [p.x,p.y+(o.r||0.4)*0.55,p.z];},r:o.r||0.5,kind:'pet',
    pet:{name:o.name,en:o.en,desc:o.desc,col:o.col||[255,255,255]},hop:hop,part:p,id:o.id||null,
    where:o.where});
  return p;
}
/* 任务收集件 */
function addTrash(w,opt){
  var p=w.put(opt.geo,{x:opt.x,z:opt.z,y:opt.y,ry:opt.ry||0});
  var base=opt.y;
  p.anim=function(t){p.y=base+Math.sin(t*1.7+opt.x*2.3)*0.016;p.ry=(opt.ry||0)+t*(opt.spin||0.5);};
  w.pick({get:function(){return [p.x,p.y+0.15,p.z];},r:opt.r||0.32,kind:'task',part:p,
    on:function(){p.skip=true;}});
  return p;
}
/* 飘动的小光点 */
function mote(w,o){
  var a0=o.a===undefined?0.75:o.a, r0=o.r||0.13;
  var s=w.sprite({p:[o.x,o.y||1,o.z],r:r0,col:o.col||C('#FFF3C4'),a:a0,shape:o.shape||'glow'});
  s.baseA=a0;s.baseR=r0;
  var ph=Math.random()*10;
  s.anim=function(t){
    s.p[0]=o.x+Math.sin(t*0.35+ph)*0.55;
    s.p[1]=(o.y||1)+Math.sin(t*0.6+ph*1.3)*0.18;
    s.p[2]=o.z+Math.cos(t*0.29+ph)*0.55;
    s.a=s.baseA*(0.6+0.4*Math.sin(t*2.1+ph));
  };
  return s;
}
/* 灯笼（可点亮） */
function addLamp(w,x,z,opt){
  opt=opt||{};
  var L=lantern(w,x,z,opt);
  L.data={lit:false};
  var hh=opt.h||1.05;
  w.pick({get:function(){return [L.x,hh+0.34,L.z];},r:0.46,kind:'lamp',part:L,on:null});
  return L;
}
/* 萤火虫（可唤醒） */
function addFly(w,x,y,z,r){
  var s=mote(w,{x:x,y:y,z:z,r:r||0.24,col:C('#C9E39A'),a:0.16});
  s.baseA=0.16;
  w.pick({get:function(){return [s.p[0],s.p[1],s.p[2]];},r:0.44,kind:'fly',spr:s,
    on:function(){s.baseA=0.95;s.r=0.23;s.col=C('#FFF0A8');s.baseR=0.23;}});
  return s;
}

/* ==========================================================================
   扩展道具（供场景 7-9 使用）
   ========================================================================== */
/* 沙丘（低矮、横向拉长，像被风吹出来的脊） */
function sandMound(w,x,z,s,col,col2,seed){
  var rr=rng(seed||41);
  var g=merge([
    blobGeo(s,col,{su:10,sv:6,jitter:0.12,rand:rr,sy:0.30,sx:1.55,sz:1.60}),
    xf(blobGeo(s*0.62,col2||col,{su:9,sv:5,jitter:0.15,rand:rr,sy:0.26,sx:1.45,sz:1.5}),{dx:s*0.78,dy:0.008,dz:-s*0.26}),
    xf(blobGeo(s*0.46,col,{su:8,sv:5,jitter:0.15,rand:rr,sy:0.24,sx:1.4,sz:1.45}),{dx:-s*0.70,dy:0.006,dz:s*0.24})
  ]);
  return w.put(g,{x:x,z:z,y:0,ry:rr()*TAU});
}
/* 仙人掌 */
function cactus(w,x,z,o){
  o=o||{};var rr=rng(o.seed||51),h=o.h||1.4,list=[],i;
  var col=o.col||C('#5FA36A'), col2=o.col2||C('#78B87E');
  list.push(prismGeo(7,0.165,0.14,h,col));
  var arms=o.arms===undefined?2:o.arms;
  for(i=0;i<arms;i++){
    var s=i%2?-1:1, hy=h*(0.34+rr()*0.18), len=h*0.30;
    list.push(xf(prismGeo(6,0.085,0.078,len,col2),{rz:s*1.57,dx:s*(0.10+len*0.5),dy:hy}));
    var up=h*(0.30+rr()*0.18);
    list.push(xf(prismGeo(6,0.08,0.072,up,col2),{dx:s*(0.10+len),dy:hy}));
    list.push(xf(sphereGeo(0.062,5,3,C('#F2C15E'),{}),{dx:s*(0.10+len),dy:hy+up}));
  }
  list.push(xf(sphereGeo(0.075,5,3,C('#F2C15E'),{}),{dy:h}));
  return w.put(merge(list),{x:x,z:z,y:o.y||0,ry:rr()*TAU});
}
/* 陶罐 */
function clayPot(w,x,z,o){
  o=o||{};var r=o.r||0.20,h=o.h||0.34,col=o.col||C('#C97C55');
  var g=merge([
    prismGeo(10,r*0.62,r,h,col,{top:mix(col,C('#8A4E33'),0.2)}),
    xf(prismGeo(10,r,r*0.86,0.07,mix(col,C('#8A4E33'),0.35)),{dy:h})
  ]);
  return w.put(g,{x:x,z:z,y:o.y||0,ry:o.ry||0});
}
/* 竹竿（带叶） */
function bambooStalk(w,x,z,o){
  o=o||{};var rr=rng(o.seed||61),h=o.h||3.0,list=[],i;
  var seg=6, col=o.col||C('#9BC47A'), col2=o.col2||C('#7FAF63');
  for(i=0;i<seg;i++){
    var t=i/seg, r=(0.085-0.032*t)*(o.w||1);
    list.push(xf(prismGeo(6,r,r*0.9,h/seg,i%2?col:col2),{dy:h/seg*i,rz:(rr()-0.5)*0.10}));
    if(i>1&&i<seg-0){ /* 竹节 */
      list.push(xf(prismGeo(6,r*1.16,r*1.16,0.035,mix(col2,C('#5F8A4B'),0.3)),{dy:h/seg*i}));
    }
  }
  /* 叶簇 */
  var n=o.leaves===undefined?7:o.leaves, topY=h*(0.48+rr()*0.1);
  for(i=0;i<n;i++){
    var a=rr()*TAU, ly=topY+rr()*h*0.5;
    var lf=prismGeo(4,0.10,0.012,0.62,C('#6FAE5C'));
    list.push(xf(lf,{rz:-1.15-rr()*0.4,ry:a,dx:Math.cos(a)*0.10,dy:ly,dz:Math.sin(a)*0.10}));
  }
  return w.put(merge(list),{x:x,z:z,y:o.y||0,ry:rr()*TAU});
}
/* 石板 / 台阶 */
function stoneStep(w,x,z,o){
  o=o||{};var g=boxGeo(o.w||1.1,o.h||0.14,o.d||0.62,o.col||C('#B6B7A8'),{top:o.top||C('#C8C9BA')});
  var p=w.put(g,{x:x,z:z,y:o.y||0,ry:o.ry||0});
  p.sy=1;p.sx=1;p.sz=1;
  if(o.wob){p.sx=1+o.wob;p.sz=1-o.wob*0.5;}
  return p;
}
/* 远处楼群剪影 */
function skyline(w,x,z,o){
  o=o||{};var rr=rng(o.seed||71),n=o.n||5,list=[],i,cz=0;
  var col=o.col||C('#5A6B82');
  for(i=0;i<n;i++){
    var bw=0.62+rr()*0.7, bh=1.5+rr()*2.9, bd=0.62+rr()*0.6;
    list.push(xf(boxGeo(bw,bh,bd,col,{top:mix(col,C('#FFFFFF'),0.10)}),{dx:(rr()-0.5)*2.6,dz:cz}));
    list.push(xf(boxGeo(bw*0.22,bh*(0.10+rr()*0.22),bd*0.22,mix(col,C('#FFF3C4'),0.72),{}),
      {dx:(rr()-0.5)*2.6,dy:bh*0.45,dz:cz}));
    cz-=bd*(0.9+rr()*0.5);
  }
  return w.put(merge(list),{x:x,z:z,y:o.y||0,ry:o.ry||0});
}
/* 水洼 */
function puddle(w,x,z,r,y,col){
  var p=w.put(discGeo(circlePts(14,r,r*0.78,0.4),0.001,y||0,col||C('#4E6E86'),2,mix(col||C('#4E6E86'),C('#9FC6DC'),0.5)),
    {x:x,z:z,alpha:0.8,layer:0});
  ripples(w,x,z,(y||0)+0.012,r*0.9,col||C('#AFCEDD'),3.4,Math.random(),1);
  return p;
}
/* 盆栽 */
function pottedPlant(w,x,z,o){
  o=o||{};var rr=rng(o.seed||81),list=[],i;
  var pot=o.pot||C('#C97C55');
  list.push(prismGeo(10,0.13,0.165,0.26,pot,{top:mix(pot,C('#8A4E33'),0.25)}));
  var n=o.blobs||4, col=o.col||C('#6FB86B');
  for(i=0;i<n;i++){
    var a=rr()*TAU,d=rr()*0.13;
    list.push(xf(blobGeo(0.20+rr()*0.12,i%2?col:mix(col,C('#FFFFFF'),0.18),
      {su:6,sv:4,jitter:0.24,rand:rr,sy:0.9}),
      {dx:Math.cos(a)*d,dy:0.30+rr()*0.26,dz:Math.sin(a)*d}));
  }
  return w.put(merge(list),{x:x,z:z,y:o.y||0,ry:o.ry||0});
}
/* 雨棚 / 遮阳篷 */
function awning(w,x,z,o){
  o=o||{};var g=boxGeo(o.w||2.2,o.h||0.09,o.d||1.5,o.col||C('#7A8FA8'),{top:mix(o.col||C('#7A8FA8'),C('#FFFFFF'),0.22)});
  return w.put(g,{x:x,z:z,y:o.y||0,ry:o.ry||0,rx:o.rx||0});
}
/* 串灯：两点之间挂一串小灯泡。返回灯泡数组（元素含 part / lit） */
function stringLights(w,ax,az,bx,bz,y,sag,n,bulbCol,wireCol){
  var list=[],bulbs=[],i;
  var wire=wireCol||C('#3C4652');
  for(i=0;i<=n*3;i++){
    var t=i/(n*3);
    var px=lerp(ax,bx,t), pz=lerp(az,bz,t);
    var py=y-Math.sin(t*Math.PI)*(sag||0.3);
    if(i<n*3){
      var t2=(i+1)/(n*3);
      var qx=lerp(ax,bx,t2), qz=lerp(az,bz,t2);
      var qy=y-Math.sin(t2*Math.PI)*(sag||0.3);
      var mx2=(px+qx)/2,my2=(py+qy)/2,mz2=(pz+qz)/2;
      var L=Math.hypot(qx-px,qy-py,qz-pz);
      var g=boxGeo(0.03,0.03,Math.max(0.05,L),wire,{});
      list.push(xf(g,{dx:mx2,dy:my2,dz:mz2,ry:Math.atan2(qx-px,qz-pz)}));
    }
  }
  for(i=0;i<n;i++){
    var u=(i+0.5)/n;
    var px2=lerp(ax,bx,u), pz2=lerp(az,bz,u);
    var py2=y-Math.sin(u*Math.PI)*(sag||0.3);
    var bulb=sphereGeo(0.085,6,4,bulbCol||C('#FFF0C0'),{sy:1.15});
    var part=w.put(merge([
      xf(prismGeo(4,0.028,0.028,0.10,wire),{dy:-0.02}),
      xf(bulb,{dy:-0.14})
    ]),{x:px2,z:pz2,y:py2+0.05,alpha:0.55});
    bulbs.push(part);
  }
  w.put(merge(list),{x:0,z:0,y:0});
  return bulbs;
}
/* 雨：一片下落的细线（只作视觉，不参与点击） */
function rainField(w,o){
  o=o||{};var rr=rng(o.seed||91),n=o.n||42,rad=o.rad||5.4,top=o.top||4.2,i;
  var a0=o.alpha||0.34;
  for(i=0;i<n;i++){
    var a=rr()*TAU,d=Math.sqrt(rr())*rad;
    var x=Math.cos(a)*d, z=Math.sin(a)*d;
    var sp=2.6+rr()*1.6, ph=rr();
    var p=w.put(boxGeo(0.016,0.46,0.016,C('#DCEAF5'),{}),
      {x:x,z:z,y:ph*top,alpha:a0,ry:0,layer:2});
    (function(p2,sp,ph,top,base){
      p2.anim=function(t){
        var u=((t*sp*0.22+ph)%1);
        p2.y=top-u*top;
        p2.alpha=base*(0.45+0.55*Math.sin(u*Math.PI));
      };
    })(p,sp,ph,top,a0);
  }
}
/* 雪：缓缓飘落、左右轻摆的白色小粒 */
function snowField(w,o){
  o=o||{};var rr=rng(o.seed||95),n=o.n||50,rad=o.rad||5.6,top=o.top||4.4,i;
  var col=o.col||C('#FFFFFF');
  for(i=0;i<n;i++){
    var a=rr()*TAU,d=Math.sqrt(rr())*rad;
    var x0=Math.cos(a)*d,z0=Math.sin(a)*d;
    var sp=0.35+rr()*0.5, ph=rr(), sw=0.5+rr()*0.9;
    var p=w.put(sphereGeo(0.026+rr()*0.028,4,3,col,{}),{x:x0,z:z0,y:ph*top,alpha:0.95,layer:2});
    (function(p2,sp,ph,x0,z0,sw){
      p2.anim=function(t){
        var u=((t*sp*0.14+ph)%1);
        p2.y=top-u*top;
        p2.x=x0+Math.sin(u*9+ph*7)*sw*0.4;
      };
    })(p,sp,ph,x0,z0,sw);
  }
}

/* ==========================================================================
   扩展小生物（供场景 7-9 使用）
   ========================================================================== */
/* 通用四足小动物 */
function mkQuad4(c,c2,o){
  o=o||{};var list=[],L=o.len||0.34,i;
  list.push(sphereGeo(L*0.54,7,5,c,{sx:1.30,sy:0.86,sz:1.0}));
  list.push(xf(sphereGeo(L*0.35,7,5,c,{}),{dy:L*0.80,dz:L*0.46}));
  list.push(xf(sphereGeo(L*0.16,6,4,o.muzzle||c2,{}),{dy:L*0.66,dz:L*0.74}));
  for(i=0;i<2;i++){
    var s=i?-1:1, ek=o.ear||'round';
    if(ek==='big'){
      list.push(xf(prismGeo(4,L*0.14,L*0.035,L*0.66,o.muzzle||c2),{rz:s*0.30,dx:s*L*0.20,dy:L*1.00,dz:L*0.30}));
    }else if(ek==='point'){
      list.push(xf(prismGeo(4,L*0.13,L*0.02,L*0.46,o.muzzle||c2),{rz:s*0.26,dx:s*L*0.20,dy:L*1.00,dz:L*0.30}));
    }else{
      list.push(xf(sphereGeo(L*0.15,5,3,o.muzzle||c2,{sy:1.45}),{dx:s*L*0.20,dy:L*1.06,dz:L*0.28}));
    }
  }
  for(i=0;i<4;i++){
    var s2=(i%2)?-1:1, f=(i<2)?1:-1;
    list.push(xf(prismGeo(4,L*0.072,L*0.058,L*0.40,c2),{dx:s2*L*0.32,dz:f*L*0.34}));
  }
  if(o.tail!==false){
    var tl=o.tailLen||L*0.7;
    list.push(xf(prismGeo(4,L*0.055,L*0.02,tl,c2),
      {rz:(o.tailUp?1.35:0.5),ry:0.2,dx:-L*0.02,dy:L*0.52,dz:L*0.86}));
  }
  eyePair(list,L*0.90,L*0.70,L*0.052,0.10);
  if(o.blush)blushPair(list,L*0.72,L*0.66,0.15,0.038);
  return merge(list);
}
function mkFennec(c,c2,o){o=o||{};o.ear='big';o.blush=true;return mkQuad4(c,c2,o);}
function mkPanda(o){
  o=o||{};
  return mkQuad4(C('#F4F2EC'),C('#2F3338'),{len:o.len||0.42,ear:'round',muzzle:C('#F4F2EC'),blush:true,tail:false});
}
function mkWildcat(c,c2,o){o=o||{};o.ear='point';return mkQuad4(c,c2,o);}
function mkSquirrel(c,c2,o){
  o=o||{};var list=[],L=o.len||0.26,i;
  list.push(sphereGeo(L*0.52,7,5,c,{sx:1.1,sy:0.92,sz:1.0}));
  list.push(xf(sphereGeo(L*0.36,7,5,c,{}),{dy:L*0.82,dz:L*0.40}));
  for(i=0;i<2;i++){
    var s=i?-1:1;
    list.push(xf(prismGeo(4,L*0.11,L*0.03,L*0.30,c2),{rz:s*0.24,dx:s*L*0.19,dy:L*1.02,dz:L*0.28}));
  }
  /* 大尾巴 */
  for(i=0;i<4;i++){
    var t=i/3;
    list.push(xf(sphereGeo(L*(0.30-t*0.09),6,4,i%2?c2:c,{sy:1.05}),
      {dx:0,dy:L*(0.45+t*0.62),dz:-L*(0.72+t*0.18)}));
  }
  list.push(xf(sphereGeo(L*0.15,6,4,C('#F2E4C8'),{}),{dy:L*0.62,dz:L*0.72}));
  eyePair(list,L*0.90,L*0.72,L*0.052,0.10);
  return merge(list);
}
function mkLizard(c,c2,o){
  o=o||{};var list=[],L=o.len||0.28,i;
  for(i=0;i<4;i++){
    var t=i/3, r=L*(0.20-t*0.06);
    list.push(xf(sphereGeo(r,6,4,i%2?c:c2,{sx:1.25,sy:0.66}),{dy:r*0.7,dz:L*(0.24-t*0.62)}));
  }
  for(i=0;i<2;i++){
    var s=i?-1:1;
    list.push(xf(sphereGeo(L*0.055,5,3,EYE_D,{}),{dx:s*L*0.15,dy:L*0.40,dz:L*0.34}));
  }
  for(i=0;i<4;i++){
    var s2=(i%2)?-1:1, f=(i<2)?1:-1;
    list.push(xf(prismGeo(4,L*0.03,L*0.02,L*0.16,c2),{rz:s2*0.9,dx:s2*L*0.20,dy:L*0.16,dz:f*L*0.22}));
  }
  list.push(xf(prismGeo(4,L*0.05,L*0.015,L*0.46,c2),{rz:1.4,dx:0,dy:L*0.16,dz:-L*0.62}));
  return merge(list);
}
function mkSnail(c,c2,o){
  o=o||{};var list=[],L=o.len||0.20;
  list.push(xf(sphereGeo(L*0.5,6,4,c,{sx:1.9,sy:0.42}),{dy:0}));
  list.push(xf(sphereGeo(L*0.62,7,5,c2,{sy:0.85}),{dx:-L*0.12,dy:L*0.30}));
  list.push(xf(sphereGeo(L*0.30,6,4,mix(c2,C('#FFFFFF'),0.35),{sy:0.8}),{dx:-L*0.12,dy:L*0.34,dz:L*0.04}));
  for(var i=0;i<2;i++){
    list.push(xf(prismGeo(4,L*0.035,L*0.008,L*0.30,c),{rz:(i?1:0.7)*1.1,dx:L*(i?0.22:0.14),dy:L*0.34,dz:L*0.10}));
    list.push(xf(sphereGeo(L*0.035,5,3,EYE_D,{}),{dx:L*(i?0.30:0.22),dy:L*0.52,dz:L*0.14}));
  }
  return merge(list);
}
