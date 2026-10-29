import {blastAt,BLAST_LIFETIME} from './blast.js?v=fast-1';
import {EnergyGesture,classifyPose,clamp} from './gesture.js?v=fast-1';
const $=s=>document.querySelector(s),canvas=$('#effects'),ctx=canvas.getContext('2d'),video=$('#camera'),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let W=innerWidth,H=innerHeight,dpr=Math.min(devicePixelRatio,1.5),mode='welcome',stream=null,tracker=null,generation=0,sample={valid:false},lastResult=-Infinity,lastInfer=0,modelPromise=null,cameraFacing='user',held=false,engine=new EnergyGesture(),snapshot=engine.result(false),last=performance.now(),time=0,shots=[],orb={x:W*.68,y:H*.32},audio=null,gain=null,hum=null,sound=false,activeToken=0;const rand=(a,b)=>a+Math.random()*(b-a);
const particles=Array.from({length:innerWidth<650?1000:1800},()=>({a:rand(0,Math.PI*2),r:rand(100,Math.max(W,H)*.72),s:Math.random(),k:rand(.7,1.7),phase:rand(0,6.283),z:rand(.35,2.5)}));
function resize(){W=innerWidth;H=innerHeight;dpr=Math.min(devicePixelRatio,1.5);canvas.width=W*dpr;canvas.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}resize();addEventListener('resize',resize);
function audioInit(){if(audio)return;audio=new (window.AudioContext||window.webkitAudioContext)();gain=audio.createGain();gain.gain.value=0;gain.connect(audio.destination);hum=audio.createOscillator();hum.type='sine';hum.frequency.value=95;hum.connect(gain);hum.start()}
$('#sound').onclick=()=>{sound=!sound;try{if(sound){audioInit();audio.resume()}else if(gain)gain.gain.setTargetAtTime(0,audio.currentTime,.1)}catch{sound=false}$('#sound').textContent=sound?'音 ON':'音 OFF';$('#sound').setAttribute('aria-pressed',sound)};
function shotSound(power){if(!audio||!sound)return;const t=audio.currentTime;
 const buffer=audio.createBuffer(1,Math.ceil(audio.sampleRate*.25),audio.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);
 const noise=audio.createBufferSource(),filter=audio.createBiquadFilter(),ng=audio.createGain();noise.buffer=buffer;filter.type='bandpass';filter.frequency.setValueAtTime(2800,t);filter.frequency.exponentialRampToValueAtTime(180,t+.22);filter.Q.value=.65;ng.gain.setValueAtTime(.10+power*.05,t);ng.gain.exponentialRampToValueAtTime(.0001,t+.24);noise.connect(filter);filter.connect(ng);ng.connect(audio.destination);noise.start(t);noise.stop(t+.25);
 const o=audio.createOscillator(),g=audio.createGain();o.type='triangle';o.frequency.setValueAtTime(190,t);o.frequency.exponentialRampToValueAtTime(42,t+.15);g.gain.setValueAtTime(.065,t);g.gain.exponentialRampToValueAtTime(.0001,t+.18);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.2);}

function view(){if(mode!=='camera'||!video.videoWidth)return {x:0,y:0,w:W,h:H};const s=Math.min(W/video.videoWidth,H/video.videoHeight),w=video.videoWidth*s,h=video.videoHeight*s;return {x:(W-w)/2,y:(H-h)/2,w,h}}
function mapPoint(p){const v=view();return {x:v.x+(1-p.x)*v.w,y:v.y+p.y*v.h}}
function clearEnergy(){engine.reset();sample={valid:false};snapshot=engine.result(false);shots=[];held=false;$('#demo-hold').classList.remove('held');lastResult=-Infinity;if(typeof demoLast!=='undefined')demoLast=performance.now();}
function releaseMedia(){stream?.getTracks().forEach(t=>t.stop());stream=null;video.pause();video.srcObject=null;tracker?.close();tracker=null;}
function setMode(next){mode=next;document.body.classList.toggle('camera',next==='camera');$('#welcome').hidden=next!=='welcome';$('#busy').hidden=next!=='loading';$('#error').hidden=next!=='error';$('#prompt').hidden=!['camera','demo'].includes(next);$('#hud').hidden=!['camera','demo'].includes(next);$('#stop').hidden=!['camera','demo','loading'].includes(next);$('#flip').disabled=next!=='camera';$('#demo-hold').hidden=next!=='demo';$('#notice').hidden=next!=='demo';$('#mode-label').textContent=next==='camera'?'カメラ使用中 · 映像は端末内だけで処理':next==='demo'?'デモ操作 · カメラ不使用':next==='loading'?'準備中 · カメラの状態はブラウザの表示をご確認ください':'演出プレビュー · カメラ不使用';$('#hint').textContent=next==='demo'?'ボタンを長押し（SPACEでも可）→ 離すと発射':'両手を上げてためる → 両手を肩の高さまで下ろして放つ';$('#status').textContent='';}
function stop(){generation++;activeToken=0;releaseMedia();clearEnergy();setMode('welcome');if(gain)gain.gain.setTargetAtTime(0,audio.currentTime,.1)}
function showError(err){stop();setMode('error');const name=err?.name;$('#error-title').textContent=name==='NotAllowedError'?'カメラの使用が許可されていません':name==='NotFoundError'?'カメラが見つかりません':'開始できませんでした';$('#error-text').textContent=name==='NotAllowedError'?'ブラウザのサイト設定でカメラを許可して、もう一度試してください。カメラなしのデモでも遊べます。':name==='NotFoundError'?'カメラを接続するか、カメラ付きのスマホで開いてください。':name==='NotReadableError'?'ほかのアプリがカメラを使用している可能性があります。閉じてから再度お試しください。':'カメラまたは認識データを準備できませんでした。通信とブラウザを確認して再度お試しください。カメラなしのデモも使えます。';console.warn('Camera experience unavailable',err?.message||err)}
function waitForVideo(token){return new Promise((resolve,reject)=>{let timer;const done=()=>{clearTimeout(timer);video.removeEventListener('loadeddata',done);if(token!==generation)reject(Error('Cancelled'));else resolve()};if(video.readyState>=2&&video.videoWidth)return resolve();video.addEventListener('loadeddata',done);timer=setTimeout(()=>{video.removeEventListener('loadeddata',done);reject(Error('Video readiness timeout'))},15000)})}
async function startCamera(){stop();const token=++generation;activeToken=token;setMode('loading');$('#busy-text').textContent='カメラの使用を許可してください。';let ownedStream=null,ownedTracker=null;
 try{if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia)throw Error('Camera requires HTTPS and a supported browser');ownedStream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:cameraFacing},width:{ideal:960},height:{ideal:720},frameRate:{ideal:30,max:30}}});if(token!==generation){ownedStream.getTracks().forEach(t=>t.stop());return}stream=ownedStream;video.srcObject=stream;await video.play();await waitForVideo(token);if(token!==generation)return;$('#busy-text').textContent='手の動きを読み取る準備中です。初回は少し時間がかかります。';
  modelPromise??=import('./tracker.js');const {createTracker}=await modelPromise;ownedTracker=await createTracker((points,timestamp)=>{if(token!==generation||mode!=='camera')return;sample=classifyPose(points);lastResult=timestamp},err=>{if(token===generation)showError(err)});if(token!==generation){ownedTracker?.close();return}tracker=ownedTracker;clearEnergy();lastInfer=0;setMode('camera');
 }catch(err){if(token!==generation){ownedStream?.getTracks().forEach(t=>t.stop());ownedTracker?.close();return}showError(err)}
}
let demoLast=performance.now();function triggerShot(state){const radius=Math.min(W,H)*(.035+state.charge*.14);shots.push({x:orb.x,y:orb.y,r:radius,power:state.charge,born:performance.now()});shotSound(state.charge);engine.finishShot();}
function advanceDemo(now){let remaining=Math.max(0,(now-demoLast)/1000);demoLast=now;const s={valid:true,raised:held,lowered:!held,anchor:{x:.5,y:.3}};while(remaining>.00001){snapshot=engine.update(s,Math.min(remaining,.05));remaining-=.05;if(snapshot.fire)triggerShot(snapshot)}}
function startDemo(){stop();setMode('demo');demoLast=performance.now();orb={x:W*.5,y:H*.3};ui();}
$('#start').onclick=startCamera;$('#retry').onclick=startCamera;$('#demo').onclick=startDemo;$('#error-demo').onclick=startDemo;$('#stop').onclick=stop;$('#cancel').onclick=stop;$('#reset').onclick=clearEnergy;$('#flip').onclick=()=>{if(mode==='camera'){cameraFacing=cameraFacing==='user'?'environment':'user';startCamera()}};
function setHeld(value){if(mode!=='demo')return;advanceDemo(performance.now());held=value;$('#demo-hold').classList.toggle('held',value)}const hold=$('#demo-hold');hold.addEventListener('pointerdown',e=>{e.preventDefault();hold.setPointerCapture(e.pointerId);setHeld(true)});for(const event of ['pointerup','pointercancel','lostpointercapture'])hold.addEventListener(event,()=>setHeld(false));addEventListener('keydown',e=>{if(mode==='demo'&&e.code==='Space'){e.preventDefault();setHeld(true)}});addEventListener('keyup',e=>{if(e.code==='Space')setHeld(false)});addEventListener('blur',()=>setHeld(false));document.addEventListener('visibilitychange',()=>{if(document.hidden){if(mode==='camera'||mode==='loading')stop();else setHeld(false);if(gain)gain.gain.setTargetAtTime(0,audio.currentTime,.1)}});addEventListener('pagehide',stop);
function glow(x,y,r,alpha=1,color='blue'){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=alpha;const g=ctx.createRadialGradient(x-r*.19,y-r*.21,0,x,y,r*1.75);g.addColorStop(0,'#ffffff');g.addColorStop(.15,color==='gold'?'#fff4ba':'#e4faff');g.addColorStop(.35,'#90dfffcc');g.addColorStop(.55,'#299aff88');g.addColorStop(.8,'#1580e933');g.addColorStop(1,'#0b5fc500');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r*1.75,0,Math.PI*2);ctx.fill();ctx.restore();}
// Match GRPS Particle Logo Reveal: fine filled points, restrained sparse halos,
// randomized positions and eased assembly, without bright sprite beads or orbit outlines.
const orbDust=Array.from({length:innerWidth<650?2600:4600},(_,i)=>{
 const z=rand(-1,1),a=rand(0,Math.PI*2),rad=Math.sqrt(1-z*z),depth=Math.cbrt(Math.random());
 return {x:Math.cos(a)*rad*depth,y:z*depth,z:Math.sin(a)*rad*depth,size:rand(.7,1.7),phase:rand(0,6.283),halo:i%13===0};
});
function finePoint(x,y,size,alpha,halo=false){
 ctx.globalAlpha=alpha;ctx.beginPath();ctx.arc(x,y,size,0,6.283);ctx.fill();
 if(halo){ctx.globalAlpha=alpha*.11;ctx.beginPath();ctx.arc(x,y,size*3.3,0,6.283);ctx.fill();}
}
function drawOrb(x,y,r,power,alpha=1){
 ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle='#8ccfff';
 const angle=reduced?0:time*.13,c=Math.cos(angle),s=Math.sin(angle);
 for(const p of orbDust){
  const xx=p.x*c+p.z*s,depth=-p.x*s+p.z*c,perspective=1/(1-depth*.12);
  const drift=reduced?0:Math.sin(time*1.7+p.phase)*.012;
  const px=x+(xx+drift)*r*perspective,py=y+(p.y+drift*.6)*r*perspective;
  const brightness=.38+(depth+1)*.24;
  finePoint(px,py,p.size*.76*(.85+depth*.15),alpha*brightness,p.halo);
 }
 ctx.restore();
}
function gather(x,y,r,power){
 ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle='#68b5ff';
 for(const p of particles){
  const u=(time*(.12+power*.09)+p.s)%1,k=1-Math.pow(1-u,3);
  const orbital=(1-k)*Math.sin(time*1.7+p.phase)*65*p.z;
  const distance=r*.65+(1-k)*p.r;
  const px=x+Math.cos(p.a)*distance+Math.cos(p.phase+time*1.8)*orbital;
  const py=y+Math.sin(p.a)*distance*.83+Math.sin(p.phase+time*1.8)*orbital*.5;
  const fade=Math.min(1,u*8,(1-u)*8);
  finePoint(px,py,p.k*(.76+(1-k)*.39),(.4+power*.45)*fade,Math.floor(p.phase*100)%13===0);
 }
 ctx.restore();
}

function ui(){const active=mode==='camera'||mode==='demo';if(!active)return;const p=snapshot.charge;$('#percent').textContent=Math.round(p*100)+'%';$('#fill').style.width=p*100+'%';let step='01 / 集める',title=mode==='demo'?'長押しして、光を集めよう。':'両手を、頭より上に。',guide=mode==='demo'?'下のボタンを押し続けて、離すと発射。':'少し離れて、頭・肩・両手を画面に入れてください。';if(snapshot.phase==='charging'){step='02 / ためる';title='光が、集まってきた。';guide=mode==='demo'?'押し続けると大きくなります。':'両手を上げたまま、もう少し。'}if(snapshot.phase==='ready'){step='03 / 放つ';title=mode==='demo'?'ボタンを離して、放とう。':'両手を下ろして、放とう。';guide=mode==='demo'?'準備完了！':'両手を肩の高さまで下ろしてください。'}if(snapshot.phase==='firing'){step='RELEASE';title='解き放て。';guide='もう一度、光を集められます。'}if(mode==='camera'&&snapshot.trackingLost){guide='頭・肩・両手が映るように、少し離れてください。';$('#status').textContent='両手を見失っています · 発射はしません'}else if(mode==='camera')$('#status').textContent=sample.valid?'姿勢を認識中':'頭・肩・両手を探しています';else $('#status').textContent='デモモード · カメラは使用していません';$('#step').textContent=step;$('#instruction').textContent=title;$('#guidance').textContent=guide;}
function render(now){requestAnimationFrame(render);const dt=Math.min((now-last)/1000,.08);last=now;if(document.hidden)return;time+=dt;ctx.clearRect(0,0,W,H);if(mode!=='camera'){const bg=ctx.createRadialGradient(W*.6,H*.3,5,W*.5,H*.4,Math.max(W,H)*.8);bg.addColorStop(0,'#102f51');bg.addColorStop(.45,'#07172c');bg.addColorStop(1,'#030a15');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);ctx.fillStyle='#c3e9ff';for(let i=0;i<70;i++){ctx.globalAlpha=.15+(i%5)*.06;ctx.beginPath();ctx.arc((i*137.51)%W,(i*83.73)%H,i%4===0?1.1:.6,0,7);ctx.fill()}ctx.globalAlpha=1;}
 if(mode==='camera'&&tracker&&now-lastInfer>66){lastInfer=now;const token=generation;tracker.process(video,now).catch(err=>{if(token===generation)showError(err)})}
 const active=mode==='camera'||mode==='demo';if(active){const s=mode==='demo'?{valid:true,raised:held,lowered:!held,anchor:{x:.5,y:.3}}:now-lastResult<450?sample:{valid:false};if(mode==='demo')advanceDemo(now);else snapshot=engine.update(s,dt);const target=mode==='demo'?{x:W*.5,y:H*.3}:mapPoint(snapshot.anchor);const radius=Math.min(W,H)*(.035+snapshot.charge*.14);target.y=clamp(target.y,24,H*.62);target.x=clamp(target.x,radius+8,W-radius-8);orb.x+=(target.x-orb.x)*(1-Math.exp(-dt*12));orb.y+=(target.y-orb.y)*(1-Math.exp(-dt*12));if(mode==='camera'&&snapshot.fire)triggerShot(snapshot);
 if(snapshot.charge>.005&&snapshot.phase!=='firing'){if(!reduced)gather(orb.x,orb.y,radius,snapshot.charge);drawOrb(orb.x,orb.y,radius,snapshot.charge);}
 if(mode==='camera'&&sample.valid&&sample.raised&&now-lastResult<450){for(const h of sample.hands||[]){const p=mapPoint(h);glow(p.x,p.y,8,.45)}}ui();
 }else if(mode==='welcome'){const cx=W>650?W*.69:W*.78,cy=W>650?H*.38:H*.26,r=Math.min(W,H)*.12;gather(cx,cy,r,.23);drawOrb(cx,cy,r,.3,.6)}
 for(const shot of shots){const age=(now-shot.born)/1000,b=blastAt(age);if(!b.alive)continue;
 const endY=-shot.r*2-H*.25,x=shot.x+(W*.5-shot.x)*b.progress,y=shot.y+(endY-shot.y)*b.travel,r=shot.r*(1-.35*b.progress);
 ctx.save();ctx.globalCompositeOperation='lighter';
 if(b.trailAlpha>0){const tail=ctx.createLinearGradient(shot.x,shot.y,x,y);tail.addColorStop(0,'#239cff00');tail.addColorStop(.35,`rgba(72,187,255,${b.trailAlpha*.45})`);tail.addColorStop(1,`rgba(225,252,255,${b.trailAlpha*.85})`);ctx.fillStyle=tail;ctx.beginPath();ctx.moveTo(shot.x-shot.r*.75,shot.y+shot.r*.2);ctx.quadraticCurveTo(x-shot.r*.4,y+shot.r*1.1,x-r*.23,y);ctx.lineTo(x+r*.23,y);ctx.quadraticCurveTo(x+shot.r*.4,y+shot.r*1.1,shot.x+shot.r*.75,shot.y+shot.r*.2);ctx.closePath();ctx.fill();
 ctx.strokeStyle=`rgba(233,251,255,${b.trailAlpha*.8})`;ctx.lineWidth=Math.max(2,shot.r*.08);ctx.beginPath();ctx.moveTo(shot.x,shot.y);ctx.lineTo(x,y);ctx.stroke();}
 if(b.alpha>0)drawOrb(x,y,r,1,b.alpha);
 ctx.strokeStyle=`rgba(160,223,255,${b.shockAlpha*.72})`;ctx.lineWidth=Math.max(1,4*b.shockAlpha);ctx.beginPath();ctx.ellipse(shot.x,shot.y,shot.r+b.shock*Math.max(W,H)*.95,(shot.r+b.shock*Math.max(W,H)*.95)*.55,0,0,7);ctx.stroke();
 if(!reduced){for(let i=0;i<18;i++){const angle=i*2.399,from=shot.r+b.shock*Math.max(W,H)*.7,to=from+45*b.shockAlpha;ctx.strokeStyle=`rgba(194,239,255,${b.shockAlpha*.55})`;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(shot.x+Math.cos(angle)*from,shot.y+Math.sin(angle)*from);ctx.lineTo(shot.x+Math.cos(angle)*to,shot.y+Math.sin(angle)*to);ctx.stroke()}if(b.flash>0){ctx.fillStyle=`rgba(191,235,255,${b.flash*.13})`;ctx.fillRect(0,0,W,H)}}ctx.restore();}shots=shots.filter(s=>(now-s.born)/1000<BLAST_LIFETIME);

 if(gain){gain.gain.setTargetAtTime(sound&&active&&snapshot.phase!=='firing'?snapshot.charge*.05:0,audio.currentTime,.12);hum.frequency.setTargetAtTime(90+snapshot.charge*170,audio.currentTime,.1)}
}
setMode('welcome');requestAnimationFrame(render);
