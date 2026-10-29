export const START=12,END=432;
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t)};
export const pathX=z=>Math.sin(z*.026)*10+Math.sin(z*.011)*8;
export const terrain=(x,z)=>{const d=x-pathX(z);return Math.sin(z*.024)*1.3+Math.sin(z*.053)*.5+(Math.sin(x*.065+z*.012)*2+Math.cos(z*.036-x*.02)*1.5)*smooth(5,34,Math.abs(d));};
export const direction=z=>Math.atan2((pathX(z+.25)-pathX(z-.25))/.5,1);
export function biome(z){return z<145?0:z<290?1:2}
export function seeded(seed=824){return ()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296}}
export function cameraGoal(z,side,jump=0,orbit=0,zoom=1){const yaw=direction(z)+orbit;return {x:pathX(z)+side-Math.sin(yaw)*7.3*zoom,y:terrain(pathX(z)+side,z)+3.7+jump*.35,z:z-Math.cos(yaw)*7.3*zoom};}
