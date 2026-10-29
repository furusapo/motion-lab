export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export function classifyPose(points){
 if(!points||points.length<17)return {valid:false};
 const ids=[0,11,12,15,16];if(ids.some(i=>!points[i]||!Number.isFinite(points[i].x)||!Number.isFinite(points[i].y)||(points[i].visibility??0)<.55||(points[i].presence??1)<.5||points[i].x<-.05||points[i].x>1.05||points[i].y<-.05||points[i].y>1.05))return {valid:false};
 const [nose,l,r,lw,rw]=ids.map(i=>points[i]),span=Math.hypot(l.x-r.x,l.y-r.y);if(span<.055)return {valid:false};
 const shoulderY=(l.y+r.y)/2,margin=Math.max(.025,span*.13),raised=lw.y<nose.y-margin&&rw.y<nose.y-margin,lowered=lw.y>shoulderY-.025&&rw.y>shoulderY-.025;
 return {valid:true,raised,lowered,anchor:{x:(lw.x+rw.x)/2,y:Math.min(lw.y,rw.y)-span*.15},hands:[{x:lw.x,y:lw.y},{x:rw.x,y:rw.y}]};
}
export class EnergyGesture {
 constructor(){this.reset()}
 reset(){this.charge=0;this.armed=false;this.phase='waiting';this.up=0;this.down=0;this.missing=0;this.cooldown=0;this.anchor={x:.5,y:.29}}
 update(sample,delta){const dt=clamp(delta,0,.1);let fire=false;if(this.cooldown>0){this.cooldown=Math.max(0,this.cooldown-dt);this.phase=this.cooldown>0?'firing':'waiting';return this.result(false)}
 if(!sample?.valid){this.missing+=dt;this.up=this.down=0;if(this.missing>.8){this.armed=false;this.charge=Math.max(0,this.charge-dt*.24);if(this.charge===0)this.phase='waiting'}return this.result(false)}
 this.missing=0;if(sample.anchor&&(sample.raised||this.charge===0))this.anchor={...sample.anchor};
 if(sample.raised){this.up+=dt;this.down=0;if(this.up>=.2){this.armed=true;this.charge=clamp(this.charge+dt*.12);this.phase=this.charge>=.98?'ready':'charging'}}
 else if(sample.lowered){this.up=0;this.down+=dt;if(this.down>=.075&&this.charge>=.12&&this.armed){fire=true;this.phase='firing';this.cooldown=.7;this.down=0;}}
 else{this.up=this.down=0;}
 return this.result(fire);
 }
 result(fire){return {fire,phase:this.phase,charge:this.charge,anchor:{...this.anchor},trackingLost:this.missing>.35}}
 finishShot(){this.charge=0;}
}
