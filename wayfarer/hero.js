import * as T from './three.module.js';

// Original peach-coloured woodland critter. Every surface is smooth geometry.
export function createHero(){
 const root=new T.Group(),body=new T.Group();root.add(body);
 const mat=(color,roughness=.82)=>new T.MeshStandardMaterial({color,roughness,metalness:0});
 const fur=mat(0xf1c69c),cream=mat(0xfff3da),inner=mat(0xc4d7bf),pink=mat(0xefaaa1),ink=mat(0x443c37),teal=mat(0x63998c),ochre=mat(0xc79557),glint=mat(0xffffff,.4);
 const geo=new T.SphereGeometry(1,32,24);
 function puff(parent,material,x,y,z,sx,sy=sx,sz=sx){const m=new T.Mesh(geo,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function curve(parent,points,material,radius=.012){const g=new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),24,radius,8,false),m=new T.Mesh(g,material);m.castShadow=true;parent.add(m);return m;}
 puff(body,fur,0,.46,0,.28,.31,.235);
 puff(body,cream,0,.45,.17,.205,.235,.095);
 const head=new T.Group();head.position.set(0,1.015,.015);body.add(head);
 puff(head,fur,0,0,0,.56,.49,.465);
 puff(head,cream,0,-.105,.295,.39,.29,.205);
 const ears=[];for(const s of [-1,1]){const ear=new T.Group();ear.position.set(s*.415,.355,-.025);head.add(ear);puff(ear,fur,0,.025,0,.155,.175,.105);puff(ear,inner,0,.035,.078,.095,.105,.035);ears.push(ear);}
 // A small crown tuft, almond-shaped ears and cream tail tip distinguish this original animal.
 puff(head,fur,-.055,.465,-.015,.065,.095,.07);puff(head,fur,.055,.455,.005,.05,.075,.06);
 const eyes=[];for(const s of [-1,1]){const eye=puff(head,ink,s*.162,-.035,.477,.041,.052,.022);eyes.push(eye);puff(head,glint,s*.162-.009,-.018,.497,.012,.015,.007);puff(head,pink,s*.292,-.145,.441,.075,.038,.019);}
 puff(head,ink,0,-.145,.505,.027,.021,.018);
 curve(head,[[-.072,-.193,.493],[-.036,-.211,.508],[0,-.186,.516],[.036,-.211,.508],[.072,-.193,.493]],ink,.009);
 const paws=[],feet=[];for(const s of [-1,1]){const arm=new T.Group();arm.position.set(s*.245,.61,.005);body.add(arm);puff(arm,fur,s*.018,-.09,.018,.095,.155,.105);puff(arm,cream,s*.018,-.19,.035,.078,.066,.085);paws.push(arm);const foot=new T.Group();foot.position.set(s*.13,.215,0);body.add(foot);puff(foot,cream,0,-.092,.052,.105,.112,.155);feet.push(foot);}
 // Rounded scarf, tiny acorn-shaped pack, soft tail: readable from behind.
 const scarf=new T.Mesh(new T.TorusGeometry(.205,.045,12,48),teal);scarf.rotation.x=Math.PI/2;scarf.position.set(0,.713,0);scarf.castShadow=true;body.add(scarf);
 const ribbon=new T.Group();ribbon.position.set(.16,.7,-.09);body.add(ribbon);puff(ribbon,teal,0,-.12,-.055,.055,.18,.032);
 const bag=new T.Group();bag.position.set(0,.47,-.244);body.add(bag);puff(bag,ochre,0,0,0,.151,.18,.075);puff(bag,teal,0,.125,-.005,.156,.06,.08);puff(bag,cream,0,.025,-.076,.024,.027,.012);
 const tail=new T.Group();tail.position.set(0,.28,-.175);body.add(tail);puff(tail,fur,0,.025,-.1,.115,.12,.18);puff(tail,cream,0,.03,-.235,.092,.095,.10);
 function pose(distance,time,speed,jumping,turn=0,reduced=false){
  const run=Math.min(speed/5,1),phase=distance*2.1,bounce=Math.abs(Math.sin(phase));
  body.position.y=reduced?0:bounce*.047*run+Math.sin(time*2)*.009*(1-run);
  body.rotation.set(.035*run,0,reduced?0:Math.sin(phase)*.045*run-turn*.25);
  head.rotation.set(reduced?0:Math.sin(phase-.3)*.022*run,-turn*.22,reduced?0:Math.sin(phase-.45)*.026*run);
  const squash=reduced?0:Math.cos(phase*2)*.015*run;head.scale.set(1+squash*.35,1-squash,1+squash*.2);
  const blinkPhase=time%4.8,blink=Math.max(0,1-Math.abs(blinkPhase-.09)/.085);for(const eye of eyes)eye.scale.y=.052*(1-blink*.88);
  for(let i=0;i<2;i++){const a=phase+i*Math.PI;feet[i].rotation.x=jumping?-.35:Math.sin(a)*.68*run;feet[i].position.y=.215+(reduced?0:Math.max(0,Math.sin(a))*.025*run);paws[i].rotation.x=jumping?-.85:-Math.sin(a)*.45*run-.08;paws[i].rotation.z=(i===0?1:-1)*(.12+(jumping?.18:0));ears[i].rotation.z=(i===0?1:-1)*.11+(reduced?0:Math.sin(phase-.7+i*.25)*.11*run);ears[i].rotation.x=reduced?0:Math.sin(phase-.5)*.07*run;}
  tail.rotation.set(reduced?0:Math.sin(phase-.8)*.16*run,reduced?0:Math.sin(phase*.5)*.2*run,0);
  ribbon.rotation.x=.2+run*.45+(reduced?0:Math.sin(time*8)*.13*run);
  bag.rotation.z=reduced?0:Math.sin(phase-.4)*.06*run;
 }
 return {root,pose};
}
