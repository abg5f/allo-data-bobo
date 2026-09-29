// Bande-son 100 % synthétisée pour le showreel (40 s, 120 BPM). Écrit promo/showreel.wav.
// Aucun sample externe : oscillateurs, bruit et enveloppes. Les bruitages suivent le timing de showreel.html.
const fs=require('fs'),path=require('path');
const SR=44100,DUR=40,N=SR*DUR,BEAT=.5;
const L=new Float32Array(N),R=new Float32Array(N);
let seed=1;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647*2-1};
const mtof=m=>440*Math.pow(2,(m-69)/12);
function add(t0,dur,fn,gain=1,pan=0){
  const s0=Math.round(t0*SR),n=Math.round(dur*SR),gl=gain*Math.min(1,1-pan),gr=gain*Math.min(1,1+pan);
  for(let i=0;i<n;i++){const k=s0+i;if(k<0)continue;if(k>=N)break;const v=fn(i/SR,i);L[k]+=v*gl;R[k]+=v*gr}
}
const lp=a=>{let y=0;return x=>(y+=a*(x-y))};
const hp=a=>{let y=0,px=0;return x=>{y=a*(y+x-px);px=x;return y}};
const saw=(f,t)=>2*((f*t)%1)-1, sq=(f,t)=>((f*t)%1)<.5?1:-1, tri=(f,t)=>1-4*Math.abs(((f*t)%1)-.5), sin=(f,t)=>Math.sin(2*Math.PI*f*t);

/* ---------- instruments ---------- */
const kick=(t0,g=1)=>add(t0,.45,t=>Math.sin(2*Math.PI*(48*t+130/28*(1-Math.exp(-28*t))))*Math.exp(-t*7)+(t<.004?rnd()*.4:0),.95*g);
const clap=(t0,g=1)=>{const f=hp(.7);add(t0,.25,t=>{const e=Math.exp(-t*22)*(t<.03?(Math.floor(t*300)%2?.6:1):1);return f(rnd())*e},.45*g)};
const hat=(t0,open=false,g=1)=>{const f=hp(.92);add(t0,open?.25:.05,t=>f(rnd())*Math.exp(-t*(open?14:70)),.22*g,.25)};
const bass=(t0,m,d=.23,g=1)=>{const f=lp(.12);add(t0,d,t=>f(saw(mtof(m),t)*.7+sq(mtof(m-12),t)*.4)*Math.min(1,t*200)*Math.exp(-t*3),.5*g)};
const stab=(t0,ms,g=1)=>{const f=lp(.18);add(t0,.28,t=>f(ms.reduce((a,m)=>a+saw(mtof(m)*1.003,t)+saw(mtof(m)*.997,t),0)/ms.length)*Math.exp(-t*9),.28*g,.1)};
const pad=(t0,d,ms,g=1)=>{const f=lp(.05);add(t0,d,t=>f(ms.reduce((a,m)=>a+saw(mtof(m)*1.004,t)+saw(mtof(m)*.996,t),0)/ms.length)*Math.min(1,t/.4)*Math.min(1,(d-t)/.4),.2*g,-.1)};
const pluck=(t0,m,g=1,pan=0)=>add(t0,.22,t=>(sq(mtof(m),t)*.5+tri(mtof(m)*2,t)*.5)*Math.exp(-t*16),.13*g,pan);
const bell=(t0,m,g=1,pan=0)=>add(t0,.8,t=>(sin(mtof(m),t)+.5*sin(mtof(m)*2.76,t)*Math.exp(-t*6))*Math.exp(-t*4),.16*g,pan);
/* ---------- sfx ---------- */
const whoosh=(t0,d=.5,g=1,up=true)=>{let y=0;add(t0,d,t=>{const k=t/d;const a=up?.02+k*.35:.37-k*.35;y+=a*(rnd()-y);return y*Math.sin(Math.PI*k)},.9*g)};
const riser=(t0,d,g=1)=>{let y=0;add(t0,d,t=>{const k=t/d;y+=(.01+k*.3)*(rnd()-y);return (y*.7+saw(200+k*900,t)*.12)*k*k},.8*g)};
const impact=(t0,g=1)=>{kick(t0,1.2*g);let y=0;add(t0,1.4,t=>{y+=.08*(rnd()-y);return y*Math.exp(-t*3)+sin(40,t)*Math.exp(-t*2.5)*.8},.9*g)};
const crash=(t0,g=1)=>{const f=hp(.85);add(t0,1.8,t=>f(rnd())*Math.exp(-t*2.2),.35*g)};
const zap=(t0,g=1)=>add(t0,.14,t=>sq(1800*Math.exp(-t*18)+180,t)*Math.exp(-t*20),.12*g,.2);
const popS=(t0,f0=900,g=1,pan=0)=>add(t0,.12,t=>sin(f0*Math.exp(-t*12)+200,t)*Math.exp(-t*30),.5*g,pan);
const boing=(t0,g=1)=>add(t0,.6,t=>sin(180+120*Math.exp(-t*4)*(1+.3*Math.sin(t*60)),t)*Math.exp(-t*5),.55*g);
const tick=(t0,g=1)=>add(t0,.03,t=>rnd()*Math.exp(-t*200),.4*g,-.3);
const sting=(t0,base=72,g=1)=>[0,4,7,12,16].forEach((iv,i)=>bell(t0+i*.045,base+iv,.9*g,(i%2?.3:-.3)));
const click=(t0)=>{add(t0,.02,t=>rnd()*Math.exp(-t*300),.5);popS(t0+.01,1400,.5)};

/* ---------- music ---------- */
const PROG=[[48,[60,64,67]],[43,[59,62,67]],[45,[57,60,64]],[41,[57,60,65]]]; // C G Am F, 1 bar = 2 s
function bar(t0,i,sec){
  const [root,ch]=PROG[i%4];
  for(let b=0;b<4;b++){const t=t0+b*BEAT;
    if(sec==='half'){if(b%2===0)kick(t);hat(t+BEAT/2)}
    if(sec==='full'||sec==='outro'){kick(t);if(b%2)clap(t);hat(t+BEAT/2,b===3);hat(t+BEAT/4,false,.6);hat(t+BEAT*.75,false,.6)}
    if(sec!=='intro'){bass(t,root+12,.2);bass(t+BEAT/2,root+(b===3?19:12),.2)}
    if(sec==='full'||sec==='outro')stab(t+BEAT/2,ch,b%2?1:.7);
  }
  if(sec==='full'){const arp=[...ch,ch[0]+12,ch[1]+12,ch[2]+12];for(let s=0;s<16;s++)pluck(t0+s*BEAT/4,arp[(s*3)%arp.length]+12,s%4===0?1:.7,(s%2?.35:-.35))}
  if(sec!=='full')pad(t0,2,ch.map(m=>m-12),sec==='intro'?.9:.6);
}
// sections (bars of 2 s)
for(let i=0;i<2;i++)bar(i*2,i,'intro');          // 0-4
for(let i=2;i<6;i++)bar(i*2,i,'half');           // 4-12
for(let i=6;i<15;i++)bar(i*2,i,'full');          // 12-30
for(let i=15;i<17;i++)bar(i*2,i,'full');         // 30-34
bar(34,17,'half');                               // 34-36
for(let i=18;i<19;i++)bar(i*2,i,'outro');        // 36-38
pad(38,2,[48,55,60,64],1.2);                     // final chord

/* ---------- sfx timeline (synced to showreel.html) ---------- */
riser(0,.5,.5);impact(.5,1);crash(.5,.8);
['A','L','L','Ô'].forEach((_,i)=>popS(1.0+i*.06,700+i*80,.7,-.3));
['D','A','T','A'].forEach((_,i)=>popS(1.25+i*.06,800+i*80,.7,0));
['B','O','B','O'].forEach((_,i)=>popS(1.5+i*.06,900+i*80,.7,.3));
for(let i=0;i<10;i++)add(1.45+i*.2,.08,t=>sin(1400,t)*(Math.floor(t*40)%2?1:0)*Math.exp(-t*10),.1,-.4); // phone ring
for(let i=0;i<48;i++)tick(2.3+i*1/48,.3);          // typing
whoosh(3.7,.6,1);impact(4.0,.5);
boing(4.35,1);kick(4.35,.8);
popS(4.35+.25,500,.8);popS(4.6+.1,450,.8);
for(let i=0;i<6;i++)popS(5.0+i*.25,700+i*60,.6,(i%2?.4:-.4));
whoosh(6.75,.4,.6);
whoosh(7.6,.7,1,false);impact(8,.4);
[9.0,9.5,10.0,10.5].forEach((t,i)=>{popS(t,600+i*120,.8);bell(t,79+i*2,.5)});
for(let i=0;i<16;i++)tick(8.3+i*.25,.25);
whoosh(11.8,.4,1);impact(12,.6);crash(12,.5);
for(let k=0;k<9;k++){const t0=12+k*2;
  whoosh(t0,.35,.5);
  if(k===0)for(let i=0;i<3;i++)zap(t0+.5+i*.08);
  if(k===1||k===5)for(let i=0;i<8;i++)tick(t0+.5+i*.07,.5);
  if(k===2){popS(t0+.6,300,.8);popS(t0+.9,1100,.8)}
  if(k===3){add(t0+.5,.3,t=>rnd()*Math.exp(-t*8),.15);impact(t0+.95,.35)}
  if(k===4)for(let i=0;i<14;i++)tick(t0+.45+i*i*.004,.7);
  if(k===6){boing(t0+.9,.5);popS(t0+1.05,800,.8)}
  if(k===7)impact(t0+.95,.35);
  if(k===8){whoosh(t0+.6,.5,.4);popS(t0+1.25,1000,.8)}
  sting(t0+1.2,k===8?76:72+(k%3)*2,1);
}
whoosh(29.75,.5,1);
for(let i=0;i<6;i++)add(30+i*.18,.1,t=>sin(120,t)*Math.exp(-t*30),.35);  // footsteps
impact(31.2,1);crash(31.2,1);sting(31.2,72,1.2);sting(31.35,79,1);
for(let i=0;i<20;i++)popS(31.2+i*.05,600+((i*137)%900),.25,((i%5)-2)/3);
impact(31.4,.7);
whoosh(32.9,.4,.8);popS(33.2,700,.6);popS(33.3,800,.6);
whoosh(34.8,.5,.9);impact(35,.5);
[35.0,35.4,35.8,36.2].forEach((t,i)=>{popS(t,700+i*100,.8);bell(t,72+[0,4,7,12][i],.7)});
whoosh(36.7,.4,.8);
impact(37.0,.9);crash(37.0,.9);sting(37.0,84,1);
click(38.55);bell(38.6,88,.8);
// fade tail
for(let k=0;k<N;k++){const t=k/SR;const f=t>38.8?Math.max(0,1-(t-38.8)/1.2):1;L[k]*=f;R[k]*=f}

/* ---------- master + write ---------- */
let peak=0;for(let k=0;k<N;k++){L[k]=Math.tanh(L[k]*.6);R[k]=Math.tanh(R[k]*.6);peak=Math.max(peak,Math.abs(L[k]),Math.abs(R[k]))}
const norm=.89/peak,buf=Buffer.alloc(44+N*4);
buf.write('RIFF',0);buf.writeUInt32LE(36+N*4,4);buf.write('WAVE',8);buf.write('fmt ',12);buf.writeUInt32LE(16,16);buf.writeUInt16LE(1,20);buf.writeUInt16LE(2,22);
buf.writeUInt32LE(SR,24);buf.writeUInt32LE(SR*4,28);buf.writeUInt16LE(4,32);buf.writeUInt16LE(16,34);buf.write('data',36);buf.writeUInt32LE(N*4,40);
for(let k=0;k<N;k++){buf.writeInt16LE(Math.round(L[k]*norm*32767),44+k*4);buf.writeInt16LE(Math.round(R[k]*norm*32767),46+k*4)}
fs.writeFileSync(path.join(__dirname,'showreel.wav'),buf);
console.log('showreel.wav written, peak',peak.toFixed(2));
