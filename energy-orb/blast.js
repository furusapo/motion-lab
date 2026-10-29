// Wall-clock launch timing: dropped animation frames must never stretch the shot.
export const BLAST_LIFETIME=.44;
export function blastAt(age){const t=Math.max(0,age),p=Math.min(1,t/.24);return {progress:p,travel:1-Math.pow(1-p,1.65),alpha:Math.max(0,1-t/.30),trailAlpha:Math.max(0,1-t/.25),shock:Math.min(1,t/.34),shockAlpha:Math.max(0,1-t/.34),flash:Math.max(0,1-t/.065),alive:t<BLAST_LIFETIME};}
