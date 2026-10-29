import * as T from './three.module.js';
import {pathX,terrain,direction} from './journey.js';
import {createHero} from './hero.js?v=forest-friends-1';
import {ForestQuest,nutSpots} from './quest.js';
export function createAdventure(scene,hero){
 const quest=new ForestQuest(),group=new T.Group();scene.add(group);
 const mat=c=>new T.MeshStandardMaterial({color:c,roughness:.85});
 const shell=mat(0xb17544),cap=mat(0x77573e),leaf=mat(0x799a65),wood=mat(0xb59971),roof=mat(0x89a97e),cream=mat(0xffe6b3);
 function mesh(geo,m,x,y,z,parent=group){const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 const nuts=nutSpots.map(p=>{const g=new T.Group(),x=pathX(p.z)+p.side;g.position.set(x,terrain(x,p.z)+.5,p.z);mesh(new T.SphereGeometry(.17,12,10),shell,0,0,0,g).scale.set(1,1.2,1);mesh(new T.SphereGeometry(.18,12,8),cap,0,.12,0,g).scale.y=.48;mesh(new T.CylinderGeometry(.025,.035,.1,6),cap,0,.23,0,g);group.add(g);return {...p,g,y:g.position.y};});
 const friend=createHero({fur:0xc7d8c7,scarf:0xd69d97});friend.root.scale.setScalar(.7);group.add(friend.root);
 const friendZ=190,friendX=pathX(friendZ)+1.1;friend.root.position.set(friendX,terrain(friendX,friendZ),friendZ);friend.root.rotation.y=Math.PI;
 const stallZ=100,stall=new T.Group();stall.position.set(pathX(stallZ)-4.3,terrain(pathX(stallZ)-4.3,stallZ),stallZ);group.add(stall);
 mesh(new T.BoxGeometry(2.1,.85,1.3),wood,0,.43,0,stall);for(const x of [-.9,.9])mesh(new T.CylinderGeometry(.06,.06,2.6,8),wood,x,1.3,0,stall);mesh(new T.ConeGeometry(1.65,.6,4),roof,0,2.65,0,stall).rotation.y=Math.PI/4;
 mesh(new T.SphereGeometry(.29,16,12),leaf,-.45,1.03,0,stall).scale.set(1,.3,1);mesh(new T.SphereGeometry(.22,16,12),shell,.45,1.03,0,stall);
 const homeZ=429,home=new T.Group();home.position.set(pathX(homeZ)+4.5,terrain(pathX(homeZ)+4.5,homeZ),homeZ);home.rotation.y=-.35;group.add(home);
 mesh(new T.CylinderGeometry(2.2,2.5,3.1,24),cream,0,1.55,0,home);mesh(new T.ConeGeometry(3.1,2,24),roof,0,4.05,0,home);mesh(new T.BoxGeometry(.95,1.7,.15),wood,0,.85,-2.2,home);mesh(new T.SphereGeometry(.09,10,8),cream,.3,.83,-2.32,home);
 for(const x of [-1.35,1.35])mesh(new T.SphereGeometry(.4,20,12),mat(0x8eb9b3),x,1.9,-1.8,home).scale.z=.12;
 const puddles=[66,238].map(z=>{const x=pathX(z);const o=mesh(new T.CircleGeometry(1.6,48),new T.MeshStandardMaterial({color:0x86bfc0,transparent:true,opacity:.76,roughness:.15,metalness:.15}),x,terrain(x,z)+.078,z);o.rotation.x=-Math.PI/2;o.scale.y=.75;return {x,z};});
 // Reusable footprint and ripple pools keep the world bounded on long visits.
 const prints=Array.from({length:64},()=>{const o=mesh(new T.CircleGeometry(.08,10),new T.MeshBasicMaterial({color:0x6f6348,transparent:true,opacity:0,depthWrite:false}),0,0,0);o.rotation.x=-Math.PI/2;o.scale.y=1.45;return {o,age:20};});
 const ripples=Array.from({length:12},()=>{const o=mesh(new T.RingGeometry(.92,1,32),new T.MeshBasicMaterial({color:0xe5ffff,transparent:true,opacity:0,side:T.DoubleSide,depthWrite:false}),0,0,0);o.rotation.x=-Math.PI/2;return {o,age:5};});
 const droplets=Array.from({length:32},()=>{const o=mesh(new T.SphereGeometry(.035,6,4),new T.MeshBasicMaterial({color:0xd6f7f3,transparent:true,opacity:0}),0,0,0);return {o,age:5,vx:0,vz:0,base:0};});
 let dropIndex=0;
 let printIndex=0,rippleIndex=0,lastStep=-1,joy=0,friendDistance=0,friendStep=0,follow={x:friendX,z:friendZ},near='',lastZ=12;
 function reset(){quest.reset();for(const p of nuts)p.g.visible=true;friend.root.position.set(friendX,terrain(friendX,friendZ),friendZ);follow={x:friendX,z:friendZ};hero.equip(false,false);joy=0;near='';for(const p of prints)p.age=20;for(const p of ripples)p.age=5;for(const p of droplets)p.age=5;lastStep=-1;lastZ=12;friendDistance=0;}
 function update({x,z,speed,distance,time,dt,jump,reduced}){
  joy=Math.max(0,joy-dt);near=Math.abs(z-friendZ)<8&&!quest.friend?'friend':Math.abs(z-stallZ)<8?'shop':'';
  for(const p of nuts){if(quest.collected.has(p.id))continue;p.g.rotation.y=reduced?0:time*.8+p.id;p.g.position.y=p.y+(reduced?0:Math.sin(time*2+p.id)*.07);if(Math.hypot(x-p.g.position.x,z-p.z)<1.35&&jump<1.2&&quest.collect(p.id)){p.g.visible=false;joy=.55;}}
  const step=Math.floor(distance*2.1/Math.PI);if(speed>.6&&jump<.1&&step!==lastStep){lastStep=step;const wet=puddles.some(p=>Math.hypot(x-p.x,z-p.z)<1.55);const p=prints[printIndex++%prints.length];p.age=0;p.o.position.set(x+(step%2?.13:-.13),terrain(x,z)+.087,z);p.o.material.color.setHex(wet?0x416d68:0x958266);if(wet&&!reduced){const r=ripples[rippleIndex++%ripples.length];r.age=0;r.o.position.set(x,terrain(x,z)+.1,z);for(let i=0;i<4;i++){const d=droplets[dropIndex++%droplets.length],a=i*Math.PI/2+step;d.age=0;d.base=terrain(x,z)+.1;d.vx=Math.cos(a)*.7;d.vz=Math.sin(a)*.7;d.o.position.set(x,d.base,z);}}}
  for(const p of prints){p.age+=dt;p.o.visible=p.age<12;p.o.material.opacity=Math.max(0,.24*(1-p.age/12));}for(const r of ripples){r.age+=dt;r.o.visible=r.age<1;r.o.material.opacity=Math.max(0,.65*(1-r.age));r.o.scale.setScalar(.08+r.age*.85);}
  for(const d of droplets){d.age+=dt;d.o.visible=d.age<.5;if(d.o.visible){d.o.position.x+=d.vx*dt;d.o.position.z+=d.vz*dt;d.o.position.y=d.base+1.7*d.age-3.4*d.age*d.age;d.o.material.opacity=1-d.age*2;}}
  if(quest.friend){const targetZ=z-1.7,targetX=pathX(targetZ)+Math.max(-2,Math.min(2,x-pathX(z)))-.65;const gap=Math.hypot(targetX-follow.x,targetZ-follow.z);if(gap>20){follow={x:targetX,z:targetZ};}const oldX=follow.x,oldZ=follow.z,k=1-Math.exp(-dt*3.4);follow.x+=(targetX-follow.x)*k;follow.z+=(targetZ-follow.z)*k;const moved=Math.hypot(follow.x-oldX,follow.z-oldZ);friendDistance+=moved;friend.root.position.set(follow.x,terrain(follow.x,follow.z),follow.z);const yaw=moved>.001?Math.atan2(follow.x-oldX,follow.z-oldZ):direction(z);friend.root.rotation.y=T.MathUtils.damp(friend.root.rotation.y,yaw,7,dt);friend.pose(friendDistance,time,Math.min(8,moved/Math.max(.001,dt)),false,0,reduced,{idle:speed<.1?time%14:0,joy:joy>0});}
  else{friend.pose(0,time,0,false,0,reduced,{idle:2,joy:false});}
  const stopForFriend=lastZ<188&&z>=188&&!quest.friend,stopForShop=lastZ<98&&z>=98&&!(quest.hat&&quest.pouch);lastZ=z;return {near,stopForFriend,stopForShop,joy:joy>0};
 }
 function interact(){if(near==='friend'){if(quest.befriend()){joy=2;return '木の実、ありがとう！ なかまになったよ。'}return '木の実が3こ必要。草原に戻って拾ってこよう。';}return '';}
 function buy(item){if(!quest.buy(item))return false;hero.equip(quest.hat,quest.pouch);joy=1.5;return true;}
 return {quest,update,interact,buy,reset,get near(){return near;}};
}
