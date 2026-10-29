// Browser-independent rules: spending and rewards have one source of truth.
export class ForestQuest {
 constructor(){this.reset()}
 reset(){this.nuts=0;this.collected=new Set();this.friend=false;this.hat=false;this.pouch=false;this.home=false;}
 collect(id){if(this.collected.has(id))return false;this.collected.add(id);this.nuts++;return true;}
 buy(item){const cost={hat:3,pouch:2}[item];if(!cost||this[item]||this.nuts<cost)return false;this.nuts-=cost;this[item]=true;return true;}
 befriend(){if(this.friend||this.nuts<3)return false;this.nuts-=3;this.friend=true;return true;}
 snack(){if(!this.friend||this.nuts<1)return false;this.nuts--;return true;}
 arrive(){this.home=this.friend;return this.home;}
 get goal(){return this.home?'仲間といっしょに、おかえり！':this.friend?'仲間と一緒に、道の先のおうちへ':this.nuts>=3?'森の小さな子に、木の実を3こ渡そう':'木の実を3こ拾って、森の仲間を探そう';}
}
export const nutSpots=Array.from({length:48},(_,i)=>({id:i,z:24+i*8.1,side:i%4===0?1.65:i%4===2?-1.65:0}));
