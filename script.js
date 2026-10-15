/* MatrixLab v1 — no frameworks, packages, analytics, or external network calls. */
'use strict';
const $ = id => document.getElementById(id);
const EPS = 1e-9;
const elNumber = (id, fallback=0) => {const v=Number($(id).value);return Number.isFinite(v)?v:fallback;};
const fmt = (x,n=3) => Number.isFinite(x)?(Math.abs(x)<1e-8?'0':Number(x.toFixed(n)).toString()):'undefined';
const signed = (x) => x<0?`− ${fmt(-x)}`:`+ ${fmt(x)}`;
const vector = v => `[${v.map(x=>fmt(x)).join(', ')}]`;
const mat = a => `⎡ ${fmt(a[0][0])}    ${fmt(a[0][1])} ⎤\n⎣ ${fmt(a[1][0])}    ${fmt(a[1][1])} ⎦`;
const mul2 = (a,b) => [[a[0][0]*b[0][0]+a[0][1]*b[1][0],a[0][0]*b[0][1]+a[0][1]*b[1][1]],[a[1][0]*b[0][0]+a[1][1]*b[1][0],a[1][0]*b[0][1]+a[1][1]*b[1][1]]];
const transpose = a => [[a[0][0],a[1][0]],[a[0][1],a[1][1]]];
// v2.3: tab 01 accepts ANY 2×2 matrix. Afull() is A exactly as typed; A() is its symmetric part ½(A + Aᵀ),
// which is all a quadratic form xᵀAx can "see" (tab 02 uses it). For a symmetric A both are the same.
const Afull = () => [[elNumber('a11'),elNumber('a12')],[elNumber('a21'),elNumber('a22')]];
const A = () => {const a=elNumber('a11'),b=(elNumber('a12')+elNumber('a21'))/2,d=elNumber('a22');return [[a,b],[b,d]];};
const isSym = m => Math.abs(m[0][1]-m[1][0])<1e-12;
const unit = v => {const r=Math.hypot(v[0],v[1]);let u=[v[0]/r,v[1]/r];if(u[0]<-1e-12||(Math.abs(u[0])<1e-12&&u[1]<0))u=[-u[0],-u[1]];return u;};
// Eigenvalues/eigenvectors of a general (not necessarily symmetric) 2×2 matrix.
// Real case: λ = (trace ± √disc)/2. Complex case (disc < 0): A rotates every arrow, so no real eigenvector exists.
function eigGeneral(m){
 const a=m[0][0],b=m[0][1],c=m[1][0],d=m[1][1],trace=a+d,det=a*d-b*c,disc=trace*trace-4*det;
 if(disc<-1e-12){const re=trace/2,im=Math.sqrt(-disc)/2;return {sym:false,complex:true,re,im,lambda:[NaN,NaN],vecs:[],trace,det,disc};}
 const r=Math.sqrt(Math.max(0,disc)),l1=(trace+r)/2,l2=(trace-r)/2;
 const vecFor=l=>Math.abs(b)>1e-12?[b,l-a]:[l-d,c];          // from row 1: (a−λ)x + b·y = 0, or row 2: c·x + (d−λ)y = 0
 let vecs,defective=false,scalar=false;
 if(Math.abs(b)<1e-12&&Math.abs(c)<1e-12){scalar=Math.abs(a-d)<1e-12;vecs=a>=d?[[1,0],[0,1]]:[[0,1],[1,0]];}
 else if(r<1e-9){defective=true;vecs=[unit(vecFor(l1))];}
 else vecs=[unit(vecFor(l1)),unit(vecFor(l2))];
 return {sym:false,complex:false,lambda:[l1,l2],vecs,trace,det,disc,defective,scalar};
}
const getEigen = m => {const a=m[0][0],b=m[0][1],d=m[1][1],trace=a+d,det=a*d-b*b,delta=Math.hypot(a-d,2*b);const l1=(trace+delta)/2,l2=(trace-delta)/2;const theta=(Math.abs(a-d)<EPS&&Math.abs(b)<EPS)?0:Math.atan2(2*b,a-d)/2;const c=Math.cos(theta),s=Math.sin(theta);return {lambda:[l1,l2],vecs:[[c,s],[-s,c]],trace,det,theta,delta};};
const classify = e => {let l=e.lambda;if(l[1]>EPS)return 'Positive definite · bowl';if(l[0]<-EPS)return 'Negative definite · hill';if(l[1]<-EPS&&l[0]>EPS)return 'Indefinite · saddle';if(Math.abs(l[0])<EPS&&Math.abs(l[1])<EPS)return 'Zero matrix · flat';if(l[1]>=-EPS&&l[0]>EPS)return 'Positive semidefinite · trough';if(l[0]<=EPS&&l[1]<-EPS)return 'Negative semidefinite · inverted trough';return 'Degenerate quadratic form';};
const near = (x,y)=>Math.abs(x-y)<1e-5;
function renderMatrix(){
 const m=Afull(),symA=isSym(m),a=m[0][0],b=m[0][1],d=m[1][1],e=symA?Object.assign(getEigen(m),{sym:true}):eigGeneral(m),B=[[elNumber('b11'),elNumber('b12')],[elNumber('b21'),elNumber('b22')]];
 if(symA){$('matrix-class').textContent=classify(e);$('matrix-class').className=e.lambda[1]>EPS?'positive-status':'negative-status';}else{$('matrix-class').textContent='Not symmetric · '+(e.complex?'complex eigenvalues (a rotation)':e.defective?'only one eigen-direction':'real eigenvalues');$('matrix-class').className=e.complex||e.defective?'negative-status':'positive-status';}
 const u=[elNumber('u1'),elNumber('u2')],v=[elNumber('v1'),elNumber('v2')],s=elNumber('scale');$('scale-out').textContent=fmt(s,1);
 $('vector-results').textContent=`u + v = ${vector([u[0]+v[0],u[1]+v[1]])}\nu − v = ${vector([u[0]-v[0],u[1]-v[1]])}\n${fmt(s,1)}u  = ${vector([s*u[0],s*u[1]])}`;
 const AB=mul2(m,B);$('multiply-result').textContent=`A × M =\n${mat(AB)}`;
 // v2.1: every cell, written out (row of A × column of M)
 const cell=(i,j,n)=>`${n} = row ${i+1} of A (${fmt(m[i][0])}, ${fmt(m[i][1])}) × column ${j+1} of M (${fmt(B[0][j])}, ${fmt(B[1][j])}) = ${fmt(m[i][0])}×${fmt(B[0][j])} + ${fmt(m[i][1])}×${fmt(B[1][j])} = ${fmt(AB[i][j])}`;
 $('multiply-steps').textContent=`${cell(0,0,'Top left')}\n${cell(0,1,'Top right')}\n${cell(1,0,'Bottom left')}\n${cell(1,1,'Bottom right')}\nOrder matters: M × A =\n${mat(mul2(B,m))}`;
 if(!symA){renderGeneralCards(m,e);drawView(m,u,v,s,applyM(m,u),e);return;}   // v2.3: any matrix
 if(Math.abs(e.det)>EPS){const inv=[[d/e.det,-b/e.det],[-b/e.det,a/e.det]];const reconstruction=mul2(m,inv);$('inverse-result').textContent=`det(A) = ${fmt(e.det)}\nA⁻¹ =\n${mat(inv)}`;$('inverse-steps').textContent=`det(A) = (${fmt(a)} × ${fmt(d)}) − (${fmt(b)} × ${fmt(b)}) = ${fmt(e.det)}.\nRecipe: swap a and d, flip the signs of the off-diagonal b's, divide everything by det.\nA⁻¹ = (1/${fmt(e.det)}) × [[${fmt(d)}, ${fmt(-b)}], [${fmt(-b)}, ${fmt(a)}]].\nVerify A × A⁻¹ ≈\n${mat(reconstruction)}`;}else{$('inverse-result').textContent='det(A) = 0\nNo inverse exists.';$('inverse-steps').textContent='The transformation collapses at least one dimension. No matrix can undo it uniquely.';}
 const p=e.vecs[0],q=e.vecs[1],Q=[[p[0],q[0]],[p[1],q[1]]];
 $('eigen-result').textContent=`λ₁ = ${fmt(e.lambda[0])}\nv₁ = ${vector(p)}\nλ₂ = ${fmt(e.lambda[1])}\nv₂ = ${vector(q)}`;
 const dir=Math.abs(b)>EPS?`Direction from row 1: (${fmt(a)} − λ)x + ${fmt(b)}y = 0, so y = (λ − ${fmt(a)}) / ${fmt(b)} × x.\n  λ₁: v₁ ∝ (1, ${fmt((e.lambda[0]-a)/b)})    λ₂: v₂ ∝ (1, ${fmt((e.lambda[1]-a)/b)})`:'b = 0, so the eigenvectors are simply the x- and y-axes.';
 $('eigen-steps').textContent=`1. Subtract λ from the diagonal: A − λI = [[${fmt(a)} − λ, ${fmt(b)}], [${fmt(b)}, ${fmt(d)} − λ]].\n2. Set its determinant to 0: (${fmt(a)} − λ)(${fmt(d)} − λ) − ${fmt(b)}² = λ² − ${fmt(e.trace)}λ + ${fmt(e.det)} = 0.\n3. Quadratic formula: λ = (${fmt(e.trace)} ± √(${fmt((a-d)**2+4*b*b)})) / 2 = ${fmt(e.lambda[0])} and ${fmt(e.lambda[1])}.\n4. ${dir}\n5. The vectors above are the same directions, shortened to length 1 (unit eigenvectors).\nCheck: λ₁ + λ₂ = ${fmt(e.trace)} (diagonal sum), λ₁ × λ₂ = ${fmt(e.det)} (determinant).`;
 const D=[[e.lambda[0],0],[0,e.lambda[1]]],reconstructed=mul2(mul2(Q,D),transpose(Q));
 $('spectral-result').textContent=`A = Q Λ Qᵀ\nΛ = diag(${fmt(e.lambda[0])}, ${fmt(e.lambda[1])})\nQ =\n${mat(Q)}`;
 $('spectral-steps').textContent=`Spectral decomposition: A = λ₁ v₁v₁ᵀ + λ₂ v₂v₂ᵀ.\nQ contains the unit eigenvectors as columns. Because A is symmetric, QᵀQ = I.\nMultiply Q × Λ × Qᵀ:\n${mat(reconstructed)}\nThis reconstructs A (up to rounding).`;
 if(e.lambda[1]>EPS&&a>EPS){const l11=Math.sqrt(a),l21=b/l11,l22=Math.sqrt(Math.max(0,d-l21*l21)),L=[[l11,0],[l21,l22]],recon=mul2(L,transpose(L));$('cholesky-result').textContent=`A = L Lᵀ\nL =\n${mat(L)}`;$('cholesky-steps').textContent=`L₁₁ = √a = ${fmt(l11)}\nL₂₁ = b / L₁₁ = ${fmt(l21)}\nL₂₂ = √(d − L₂₁²) = ${fmt(l22)}\nVerify L × Lᵀ:\n${mat(recon)}`;}else{$('cholesky-result').textContent='Unavailable for this A.\nCholesky requires A to be positive definite.';$('cholesky-steps').textContent=a>EPS?`L₁₁ = √a = ${fmt(Math.sqrt(a))}\nL₂₁ = b / L₁₁ = ${fmt(b/Math.sqrt(a))}\nL₂₂ = √(d − L₂₁²) = √(${fmt(d-b*b/a)}): the square root of a ${d-b*b/a<0?'negative':'zero'} number, so the method stops.\nCholesky needs A positive definite (both eigenvalues > 0).`:`L₁₁ = √a = √(${fmt(a)}): needs a > 0, so the method stops at the first step.\nCholesky needs A positive definite (both eigenvalues > 0).`;}
 const Au=[a*u[0]+b*u[1],b*u[0]+d*u[1]];
 drawView(m,u,v,s,Au,e);   // v2.1: the graph shows the operation picked in the view tabs
}
/* =====================================================================
   v2.3 — ANY 2×2 MATRIX (tab 01). When A is not symmetric:
   inverse  : swap a and d, flip the signs of b and c, divide by det = ad − bc
   eigen    : λ² − (a + d)λ + (ad − bc) = 0; complex roots mean a rotation
   spectral : needs symmetry; instead we show diagonalization A = P D P⁻¹
   Cholesky : needs symmetry (and positive definite), so it is unavailable
   ===================================================================== */
function renderGeneralCards(m, e) {
  const a = m[0][0], b = m[0][1], c = m[1][0], d = m[1][1];
  // Inverse
  if (Math.abs(e.det) > EPS) {
    const inv = [[d / e.det, -b / e.det], [-c / e.det, a / e.det]];
    $('inverse-result').textContent = `det(A) = ${fmt(e.det)}\nA⁻¹ =\n${mat(inv)}`;
    $('inverse-steps').textContent = `det(A) = (${fmt(a)} × ${fmt(d)}) − (${fmt(b)} × ${fmt(c)}) = ${fmt(e.det)}.\nRecipe: swap a and d, flip the signs of the two off-diagonal entries, divide everything by det.\nA⁻¹ = (1/${fmt(e.det)}) × [[${fmt(d)}, ${fmt(-b)}], [${fmt(-c)}, ${fmt(a)}]].\nVerify A × A⁻¹ ≈\n${mat(mul2(m, inv))}`;
  } else { $('inverse-result').textContent = 'det(A) = 0\nNo inverse exists.'; $('inverse-steps').textContent = `det(A) = ${fmt(a)}×${fmt(d)} − ${fmt(b)}×${fmt(c)} = 0. A squashes the plane onto a line, so nothing can undo it.`; }
  // Eigenvalues and eigenvectors
  const poly = `(${fmt(a)} − λ)(${fmt(d)} − λ) − ${fmt(b)}×${fmt(c)} = λ² − ${fmt(e.trace)}λ + ${fmt(e.det)} = 0`;
  if (e.complex) {
    const ang = Math.atan2(e.im, e.re) * 180 / Math.PI, mod = Math.hypot(e.re, e.im);
    $('eigen-result').textContent = `λ = ${fmt(e.re)} ± ${fmt(e.im)}i  (complex)\nNo real eigenvectors:\nA turns every arrow.\nturn ≈ ${fmt(ang, 1)}°, stretch |λ| = ${fmt(mod)}`;
    $('eigen-steps').textContent = `1. Subtract λ from the diagonal and set the determinant to 0:\n   ${poly}\n2. Discriminant: trace² − 4·det = ${fmt(e.trace)}² − 4×${fmt(e.det)} = ${fmt(e.disc)} < 0.\n3. The square root of a negative number: λ = ${fmt(e.trace)}/2 ± i·√${fmt(-e.disc)}/2 = ${fmt(e.re)} ± ${fmt(e.im)}i.\nMeaning: A rotates every arrow by about ${fmt(ang, 1)}° and stretches it by ${fmt(mod)}, so no real arrow keeps its direction.\nThis can only happen when A is NOT symmetric: symmetric matrices always have real eigenvalues.`;
  } else {
    const row = Math.abs(b) > 1e-12 ? `Row 1: (${fmt(a)} − λ)x + ${fmt(b)}y = 0, so v ∝ (${fmt(b)}, λ − ${fmt(a)}).` : Math.abs(c) > 1e-12 ? `Row 2: ${fmt(c)}x + (${fmt(d)} − λ)y = 0, so v ∝ (λ − ${fmt(d)}, ${fmt(c)}).` : 'A is diagonal, so the eigenvectors are the x- and y-axes.';
    const angle = e.vecs.length === 2 ? Math.acos(Math.min(1, Math.abs(e.vecs[0][0] * e.vecs[1][0] + e.vecs[0][1] * e.vecs[1][1]))) * 180 / Math.PI : null;
    $('eigen-result').textContent = e.defective ? `λ = ${fmt(e.lambda[0])} (twice)\nv = ${vector(e.vecs[0])}\nonly ONE eigen-direction` : e.scalar ? `λ₁ = λ₂ = ${fmt(e.lambda[0])}\nEVERY arrow is an eigenvector\n(A just scales by ${fmt(e.lambda[0])})` : `λ₁ = ${fmt(e.lambda[0])}\nv₁ = ${vector(e.vecs[0])}\nλ₂ = ${fmt(e.lambda[1])}\nv₂ = ${vector(e.vecs[1])}`;
    $('eigen-steps').textContent = `1. Subtract λ from the diagonal and set the determinant to 0:\n   ${poly}\n2. Discriminant: trace² − 4·det = ${fmt(e.disc)} ≥ 0, so the eigenvalues are real.\n3. λ = (${fmt(e.trace)} ± √${fmt(Math.max(0, e.disc))}) / 2 = ${fmt(e.lambda[0])} and ${fmt(e.lambda[1])}.\n4. ${row}\n5. Shorten to length 1 (unit eigenvectors).` + (e.defective ? '\nThe two eigenvalues are equal but A is not a multiple of I: there is only one eigen-direction (a shear).' : angle !== null ? `\nA is not symmetric, so v₁ and v₂ are NOT perpendicular: the angle between them is ${fmt(angle, 1)}°.` : '') + `\nCheck: λ₁ + λ₂ = ${fmt(e.trace)} (diagonal sum), λ₁ × λ₂ = ${fmt(e.det)} (determinant).`;
  }
  // Spectral → diagonalization
  const S = [[a, (b + c) / 2], [(b + c) / 2, d]], eS = getEigen(S);
  const symPart = `\nThe symmetric part S = ½(A + Aᵀ) =\n${mat(S)}\nhas eigenvalues ${fmt(eS.lambda[0])} and ${fmt(eS.lambda[1])} and its own S = QΛQᵀ. Tab 02 draws S, because xᵀAx = xᵀSx.`;
  if (!e.complex && !e.defective && e.vecs.length === 2) {
    const P = [[e.vecs[0][0], e.vecs[1][0]], [e.vecs[0][1], e.vecs[1][1]]], dP = P[0][0] * P[1][1] - P[0][1] * P[1][0], Pi = [[P[1][1] / dP, -P[0][1] / dP], [-P[1][0] / dP, P[0][0] / dP]], D = [[e.lambda[0], 0], [0, e.lambda[1]]];
    $('spectral-result').textContent = `A is not symmetric, so A = QΛQᵀ\n(perpendicular Q) does not exist.\nInstead, diagonalize: A = P D P⁻¹\nD = diag(${fmt(e.lambda[0])}, ${fmt(e.lambda[1])})\nP =\n${mat(P)}`;
    $('spectral-steps').textContent = `P has the eigenvectors as columns (not perpendicular, so P⁻¹ ≠ Pᵀ).\nP⁻¹ =\n${mat(Pi)}\nMultiply P × D × P⁻¹:\n${mat(mul2(mul2(P, D), Pi))}\nThis reconstructs A. See it in graph view 6.` + symPart;
  } else {
    $('spectral-result').textContent = `A is not symmetric, so A = QΛQᵀ\ndoes not exist.\n` + (e.complex ? 'Complex eigenvalues: no real\ndiagonalization either (A rotates).' : e.scalar ? 'A = λI already is diagonal.' : 'Only one eigen-direction: A cannot\nbe diagonalized (Jordan form\nJ = [[λ, 1], [0, λ]]).');
    $('spectral-steps').textContent = (e.complex ? 'With complex eigenvalues, A = P D P⁻¹ only works with complex numbers in P and D.' : 'A shear has too few eigenvectors to fill P, so P⁻¹ does not exist.') + symPart;
  }
  // Cholesky
  $('cholesky-result').textContent = 'Unavailable for this A.\nCholesky needs A symmetric\n(A = Aᵀ) and positive definite.';
  $('cholesky-steps').textContent = `Here a₁₂ = ${fmt(b)} but a₂₁ = ${fmt(c)}, so A ≠ Aᵀ. L·Lᵀ is always symmetric, so it can never equal a non-symmetric A. Tick “Keep A symmetric” to try Cholesky again.`;
}
function canvasCtx(id){const canvas=$(id);const ctx=canvas.getContext('2d');const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);return {canvas,ctx,w,h};}
function drawGrid(ctx,w,h,cx,cy,step){ctx.save();ctx.strokeStyle='#22394a';ctx.lineWidth=1;for(let x=cx%step;x<w;x+=step){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}for(let y=cy%step;y<h;y+=step){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}ctx.strokeStyle='#688194';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,cy);ctx.lineTo(w,cy);ctx.moveTo(cx,0);ctx.lineTo(cx,h);ctx.stroke();ctx.restore();}
function drawArrow(ctx,x0,y0,x,y,color,label){let dx=x-x0,dy=y-y0,r=Math.hypot(dx,dy);ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x,y);ctx.stroke();if(r>3){let ux=dx/r,uy=dy/r;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-ux*14-uy*7,y-uy*14+ux*7);ctx.lineTo(x-ux*14+uy*7,y-uy*14-ux*7);ctx.closePath();ctx.fill();}ctx.font='bold 17px system-ui';ctx.fillText(label,Math.max(8,Math.min(x+10,700)),Math.max(20,Math.min(y-10,460)));ctx.restore();}
function drawVectors(m,u,Au,e){const {ctx,w,h}=canvasCtx('vectorCanvas');ctx.fillStyle='#0b1725';ctx.fillRect(0,0,w,h);const maxR=Math.max(3,Math.abs(u[0]),Math.abs(u[1]),Math.abs(Au[0]),Math.abs(Au[1]))+1;const step=Math.min(67,Math.max(26,Math.min((w-110)/(2*maxR),(h-90)/(2*maxR))));const cx=w/2,cy=h/2;drawGrid(ctx,w,h,cx,cy,step);ctx.save();ctx.setLineDash([9,8]);ctx.lineWidth=2;ctx.strokeStyle='rgba(181,163,255,.65)';for(const vec of e.vecs){ctx.beginPath();ctx.moveTo(cx-vec[0]*1000,cy+vec[1]*1000);ctx.lineTo(cx+vec[0]*1000,cy-vec[1]*1000);ctx.stroke();}ctx.restore();drawArrow(ctx,cx,cy,cx+u[0]*step,cy-u[1]*step,'#49d6bf','u');drawArrow(ctx,cx,cy,cx+Au[0]*step,cy-Au[1]*step,'#ffad68','Au');ctx.fillStyle='#91a9ba';ctx.font='14px system-ui';ctx.fillText('0',cx+8,cy+20);ctx.fillText('x',w-20,cy-10);ctx.fillText('y',cx+10,21);}
/* =====================================================================
   v2.1 — GRAPH VIEWS FOR TAB 01 (“See every operation”)
   ---------------------------------------------------------------------
   The graph can show seven things. Each view explains one card:
     1 vectors   u, v, u + v, u − v and s·u          (Theme 1: vector arithmetic)
     2 au        what the matrix A does to the arrow u
     3 am        the unit square under M, then under A  (A·M = “M first, then A”)
     4 inverse   the square under A, then A⁻¹ brings it back
     5 eigen     the unit circle becomes an ellipse; eigen-directions only stretch
     6 spectral  A = Q Λ Qᵀ shown as: turn (Qᵀ) → stretch (Λ) → turn back (Q)
     7 cholesky  A = L Lᵀ shown as: Lᵀ then L
   Views 3, 4, 6 and 7 have numbered steps you can click or play.
   Business analogy: like a dashboard with tabs, each tab is one chart
   built from the same underlying numbers.
   ===================================================================== */
let view = 'vectors';          // which picture is showing
let swapOrder = false;         // view 3: A·M (false) or M·A (true)
let stageNow = null;           // index of the step being shown (null = last step)
let anim = null;               // running animation {from, to, start}
const I2 = [[1, 0], [0, 1]];   // identity matrix: “do nothing”
const applyM = (M, p) => [M[0][0] * p[0] + M[0][1] * p[1], M[1][0] * p[0] + M[1][1] * p[1]];  // matrix × vector
const lerpM = (P, Q, t) => P.map((row, i) => row.map((x, j) => x + (Q[i][j] - x) * t));       // in-between matrix for animation
const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const SQUARE = [[0, 0], [1, 0], [1, 1], [0, 1]];
const CIRCLE = Array.from({ length: 97 }, (_, i) => [Math.cos(i / 96 * 2 * Math.PI), Math.sin(i / 96 * 2 * Math.PI)]);
const COL = { u: '#49d6bf', v: '#7aa2ff', sum: '#ffe066', diff: '#ff7eb6', scale: '#ffad68', au: '#ffad68', e1: '#ff8a8a', e2: '#7aa2ff', ghost: '#7f93a6' };

// The steps of each view, built from the CURRENT numbers on the page.
function viewStages(m, M, e) {
  const a = m[0][0], b = m[0][1], d = m[1][1];
  // v2.3: a non-symmetric A needs different pictures for views 5–7
  if (!e.sym && view === 'spectral') {
    if (e.complex || e.defective || e.vecs.length < 2) return { shape: 'square', fail: e.complex ? 'Complex eigenvalues: no real P D P⁻¹' : 'Too few eigenvectors: A cannot be diagonalized', stages: [{ M: I2, label: 'Start', cap: e.complex ? 'A is not symmetric and has complex eigenvalues: it rotates every arrow, so it cannot be split into stretches along real directions.' : 'A has only one eigen-direction (a shear), so there are not enough eigenvectors to build P.' }] };
    const P = [[e.vecs[0][0], e.vecs[1][0]], [e.vecs[0][1], e.vecs[1][1]]], dP = P[0][0] * P[1][1] - P[0][1] * P[1][0], Pi = [[P[1][1] / dP, -P[0][1] / dP], [-P[1][0] / dP, P[0][0] / dP]], D = [[e.lambda[0], 0], [0, e.lambda[1]]];
    return { shape: 'square', eig: true, stages: [
      { M: I2, label: 'Start', cap: 'The unit square and the two eigen-directions v₁, v₂. A is not symmetric, so they are not perpendicular.' },
      { M: Pi, label: '1 · P⁻¹: eigen-coordinates', cap: 'P⁻¹ re-draws the picture so v₁ lands on the x-axis and v₂ on the y-axis (a slant, not just a turn, because they are not perpendicular).' },
      { M: mul2(D, Pi), label: '2 · D: stretch', cap: `D stretches along the axes only: × ${fmt(e.lambda[0])} along x (v₁) and × ${fmt(e.lambda[1])} along y (v₂).` },
      { M: mul2(mul2(P, D), Pi), label: '3 · P: back = A', cap: 'P puts the eigen-directions back. The result is exactly A: A = P D P⁻¹, the diagonalization.' }] };
  }
  if (!e.sym && view === 'cholesky') return { shape: 'square', fail: 'No Cholesky factor: A is not symmetric', stages: [{ M: I2, label: 'Start', cap: `Cholesky needs A = Aᵀ. Here a₁₂ = ${fmt(m[0][1])} and a₂₁ = ${fmt(m[1][0])}, and L·Lᵀ is always symmetric, so no L exists.` }] };
  if (!e.sym && view === 'eigen') return { shape: 'circle', eig: !e.complex, stages: [
    { M: I2, label: 'Start', cap: 'The unit circle: every arrow of length 1.' },
    { M: m, label: 'Apply A', cap: e.complex ? `A turns every arrow by about ${fmt(Math.atan2(e.im, e.re) * 180 / Math.PI, 1)}° (complex eigenvalues ${fmt(e.re)} ± ${fmt(e.im)}i), so no arrow keeps its direction: there are no real eigenvectors to draw.` : e.defective ? `Only one direction keeps its line (λ = ${fmt(e.lambda[0])}): A is a shear.` : `Along the dashed lines arrows are only stretched: × ${fmt(e.lambda[0])} along v₁ and × ${fmt(e.lambda[1])} along v₂. A is not symmetric, so these two lines are not perpendicular.` }] };
  if (view === 'am') {
    const first = swapOrder ? m : M, both = swapOrder ? mul2(M, m) : mul2(m, M);
    const n1 = swapOrder ? 'A' : 'M', n2 = swapOrder ? 'M' : 'A', prod = swapOrder ? 'M·A' : 'A·M';
    return { shape: 'square', stages: [
      { M: I2, label: 'Start', cap: 'The unit square. Its two edges are the arrows (1, 0) and (0, 1).' },
      { M: first, label: 'Apply ' + n1, cap: `${n1} moves (1, 0) to ${vector(applyM(first, [1, 0]))} and (0, 1) to ${vector(applyM(first, [0, 1]))}: the columns of ${n1}.` },
      { M: both, label: 'Then apply ' + n2 + ' = ' + prod, cap: `Doing ${n1} and then ${n2} is one matrix: ${prod} = ${vector(both[0])}, ${vector(both[1])} (rows). The edges land at ${vector(applyM(both, [1, 0]))} and ${vector(applyM(both, [0, 1]))}, its columns. ` + (swapOrder ? 'Compare with A·M: a different shape, so order matters.' : 'Press “Swap order” to see M·A.') }] };
  }
  if (view === 'inverse') {
    if (Math.abs(e.det) < EPS) return { shape: 'square', stages: [
      { M: I2, label: 'Start', cap: 'The unit square.' },
      { M: m, label: 'Apply A', cap: 'det(A) = 0: the square is squashed flat onto a line. Information is lost, so no matrix can undo it. There is no inverse.' }] };
    return { shape: 'square', stages: [
      { M: I2, label: 'Start', cap: 'The unit square, area 1.' },
      { M: m, label: 'Apply A', cap: `A turns the square into a parallelogram. Its area is |det A| = ${fmt(Math.abs(e.det))}: the determinant is the area factor.` },
      { M: I2, label: 'Apply A⁻¹: back home', cap: 'A⁻¹ undoes A: every point returns to where it started. That is why A·A⁻¹ = I (the “do nothing” matrix).' }] };
  }
  if (view === 'spectral') {
    const p = e.vecs[0], q = e.vecs[1], Q = [[p[0], q[0]], [p[1], q[1]]], Qt = transpose(Q), L = [[e.lambda[0], 0], [0, e.lambda[1]]];
    const s1 = Qt, s2 = mul2(L, Qt), s3 = mul2(Q, s2);
    return { shape: 'square', eig: true, stages: [
      { M: I2, label: 'Start', cap: 'The unit square and the two eigen-directions (dashed arrows v₁ and v₂).' },
      { M: s1, label: '1 · Qᵀ: turn', cap: 'Qᵀ rotates the picture so v₁ lies on the x-axis and v₂ on the y-axis. Nothing is stretched yet.' },
      { M: s2, label: '2 · Λ: stretch', cap: `Λ stretches along the axes only: × ${fmt(e.lambda[0])} along x (v₁) and × ${fmt(e.lambda[1])} along y (v₂).` },
      { M: s3, label: '3 · Q: turn back = A', cap: 'Q rotates back. Turn, stretch, turn back gives exactly the same result as A. That is A = QΛQᵀ.' }] };
  }
  if (view === 'cholesky') {
    if (!(e.lambda[1] > EPS && a > EPS)) return { shape: 'square', fail: true, stages: [{ M: I2, label: 'Start', cap: 'Cholesky needs A to be positive definite (both eigenvalues > 0). This A is not, so L does not exist.' }] };
    const l11 = Math.sqrt(a), l21 = b / l11, l22 = Math.sqrt(Math.max(0, d - l21 * l21)), L = [[l11, 0], [l21, l22]], Lt = transpose(L);
    return { shape: 'square', stages: [
      { M: I2, label: 'Start', cap: 'The unit square.' },
      { M: Lt, label: '1 · Lᵀ', cap: `Lᵀ = ${vector(Lt[0])}, ${vector(Lt[1])} (rows): an upper triangle. It slants the square.` },
      { M: mul2(L, Lt), label: '2 · then L = A', cap: `L = ${vector(L[0])}, ${vector(L[1])} (rows): a lower triangle. Lᵀ then L lands exactly where A sends the square: A = L·Lᵀ.` }] };
  }
  if (view === 'eigen') return { shape: 'circle', eig: true, stages: [
    { M: I2, label: 'Start', cap: 'The unit circle: every arrow of length 1.' },
    { M: m, label: 'Apply A', cap: `A turns the circle into an ellipse. Along the dashed lines arrows are only stretched: × ${fmt(e.lambda[0])} along v₁ and × ${fmt(e.lambda[1])} along v₂. Every other arrow also turns.` }] };
  return null;   // views 1 and 2 have no steps
}

// Turn data coordinates into canvas pixels, with a zoom that fits every point.
function makeFrame(w, h, pts) {
  const maxR = Math.max(2.5, ...pts.map(p => Math.max(Math.abs(p[0]), Math.abs(p[1])))) + .6;
  const step = Math.min(67, Math.max(18, Math.min((w - 110) / (2 * maxR), (h - 90) / (2 * maxR))));
  const cx = w / 2, cy = h / 2;
  return { cx, cy, step, P: p => [cx + p[0] * step, cy - p[1] * step] };
}
function polyline(ctx, F, pts, stroke, fill, dash) {
  ctx.save(); if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); pts.forEach((p, i) => { const q = F.P(p); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); } ctx.strokeStyle = stroke; ctx.lineWidth = 2.2; ctx.stroke(); ctx.restore();
}
// Draw an arrow; side = 'left' puts its label on the left of the tip so two close labels don't overlap.
function arrowTo(ctx, F, from, to, color, label, side) {
  const a = F.P(from), b = F.P(to); drawArrow(ctx, a[0], a[1], b[0], b[1], color, '');
  ctx.save(); ctx.fillStyle = color; ctx.font = 'bold 16px system-ui';
  if (side === 'left') { ctx.textAlign = 'right'; ctx.fillText(label, b[0] - 10, b[1] + 18); }
  else { ctx.textAlign = 'left'; ctx.fillText(label, b[0] + 10, b[1] - 8); }
  ctx.restore();
}
function dashedLine(ctx, F, a, b, color) { ctx.save(); ctx.setLineDash([6, 6]); ctx.strokeStyle = color; ctx.lineWidth = 1.6; ctx.beginPath(); const p = F.P(a), q = F.P(b); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke(); ctx.restore(); }
function eigenLines(ctx, F, e) { ctx.save(); ctx.setLineDash([9, 8]); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(181,163,255,.65)'; for (const v of e.vecs) { const a = F.P([-v[0] * 40, -v[1] * 40]), b = F.P([v[0] * 40, v[1] * 40]); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); } ctx.restore(); }
function legendHTML(items) { return items.map(([c, t, dash]) => `<span><i style="display:inline-block;width:${dash ? 16 : 10}px;height:${dash ? 0 : 10}px;border-radius:${dash ? 0 : 50}%;${dash ? 'border-top:2px dashed ' + c : 'background:' + c};margin-right:6px;vertical-align:middle"></i>${t}</span>`).join(''); }

function drawView(m, u, v, s, Au, e) {
  const { ctx, w, h } = canvasCtx('vectorCanvas'); ctx.fillStyle = '#0b1725'; ctx.fillRect(0, 0, w, h);
  const M = [[elNumber('b11'), elNumber('b12')], [elNumber('b21'), elNumber('b22')]];
  const badge = { vectors: 'u, v', au: 'A × u', am: swapOrder ? 'M × A' : 'A × M', inverse: 'A⁻¹', eigen: 'A v = λ v', spectral: e.sym ? 'Q Λ Qᵀ' : 'P D P⁻¹', cholesky: 'L Lᵀ' }[view];
  $('view-badge').textContent = badge;
  const stepper = $('view-stepper'), legend = $('vector-legend'), cap = $('transform-caption');

  // ---------- View 1: vector arithmetic ----------
  if (view === 'vectors') {
    stepper.hidden = true;
    const sum = [u[0] + v[0], u[1] + v[1]], diff = [u[0] - v[0], u[1] - v[1]], su = [s * u[0], s * u[1]];
    const F = makeFrame(w, h, [u, v, sum, diff, su]); drawGrid(ctx, w, h, F.cx, F.cy, F.step);
    dashedLine(ctx, F, u, sum, COL.v); dashedLine(ctx, F, v, sum, COL.u);   // the parallelogram: walk u then v (or v then u)
    dashedLine(ctx, F, v, u, COL.diff);                                     // u − v is the arrow from the tip of v to the tip of u
    arrowTo(ctx, F, [0, 0], su, COL.scale, fmt(s, 1) + 'u');
    arrowTo(ctx, F, [0, 0], diff, COL.diff, 'u − v', 'left');
    arrowTo(ctx, F, [0, 0], sum, COL.sum, 'u + v');
    arrowTo(ctx, F, [0, 0], v, COL.v, 'v', 'left');
    arrowTo(ctx, F, [0, 0], u, COL.u, 'u');
    legend.innerHTML = legendHTML([[COL.u, 'u'], [COL.v, 'v'], [COL.sum, 'u + v'], [COL.diff, 'u − v'], [COL.scale, fmt(s, 1) + ' × u']]);
    cap.textContent = `u + v = ${vector(sum)}: walk along u, then along v (dashed sides of the parallelogram). u − v = ${vector(diff)}: the same as the dashed pink arrow from the tip of v to the tip of u. ${fmt(s, 1)}u = ${vector(su)}: same line as u, ${fmt(Math.abs(s), 1)} times as long${s < 0 ? ', flipped' : ''}. The matrix A is not used here.`;
    return;
  }
  // ---------- View 2: A × u ----------
  if (view === 'au') {
    stepper.hidden = true;
    const F = makeFrame(w, h, [u, Au]); drawGrid(ctx, w, h, F.cx, F.cy, F.step); eigenLines(ctx, F, e);
    arrowTo(ctx, F, [0, 0], u, COL.u, 'u'); arrowTo(ctx, F, [0, 0], Au, COL.au, 'Au');
    legend.innerHTML = legendHTML([[COL.u, 'u (input)'], [COL.au, 'A × u (output)'], ['rgba(181,163,255,.9)', 'eigen-directions', true]]);
    cap.textContent = `This view shows only what the matrix A does to the arrow u. Row 1: ${fmt(m[0][0])}×${fmt(u[0])} + ${fmt(m[0][1])}×${fmt(u[1])} = ${fmt(Au[0])}. Row 2: ${fmt(m[1][0])}×${fmt(u[0])} + ${fmt(m[1][1])}×${fmt(u[1])} = ${fmt(Au[1])}. So A × u = ${vector(Au)}. Change u or A on the left to see it move.`;
    return;
  }
  // ---------- Views 3–7: shapes with steps ----------
  const V = viewStages(m, M, e), st = V.stages;
  if (stageNow === null || stageNow >= st.length) stageNow = st.length - 1;
  stepper.hidden = false;
  stepper.innerHTML = st.map((x, i) => `<button type="button" data-stage="${i}" class="${i === stageNow ? 'on' : ''}">${x.label}</button>`).join('') +
    (st.length > 1 ? '<button type="button" data-play class="play">▶ Play</button>' : '') +
    (view === 'am' ? `<button type="button" data-swap class="swap">⇄ Swap order (${swapOrder ? 'show A·M' : 'show M·A'})</button>` : '');
  let cur = st[stageNow].M;
  if (anim) { const t = Math.min(1, (performance.now() - anim.start) / 750); cur = lerpM(st[anim.from].M, st[anim.to].M, ease(t)); }
  const base = V.shape === 'circle' ? CIRCLE : SQUARE;
  const all = []; st.forEach(x => base.forEach(p => all.push(applyM(x.M, p))));
  if (V.eig) st.forEach(x => e.vecs.forEach(vv => all.push(applyM(x.M, vv))));
  const F = makeFrame(w, h, all); drawGrid(ctx, w, h, F.cx, F.cy, F.step);
  if (view === 'eigen') eigenLines(ctx, F, e);
  polyline(ctx, F, base, COL.ghost, null, [5, 5]);                                    // where the shape started
  polyline(ctx, F, base.map(p => applyM(cur, p)), '#ffad68', 'rgba(255,173,104,.16)');   // where it is now
  if (V.shape === 'square') {
    const c1 = applyM(cur, [1, 0]), c2 = applyM(cur, [0, 1]);
    arrowTo(ctx, F, [0, 0], c1, COL.e1, vector(c1)); arrowTo(ctx, F, [0, 0], c2, COL.e2, vector(c2), 'left');
  }
  if (V.eig) { e.vecs.forEach((vv, i) => arrowTo(ctx, F, [0, 0], applyM(cur, vv), i ? '#c9b8ff' : '#49d6bf', i ? 'v₂' : 'v₁', i ? 'left' : undefined)); }
  if (V.fail) { ctx.fillStyle = '#ffcd97'; ctx.font = 'bold 18px system-ui'; ctx.fillText(typeof V.fail === 'string' ? V.fail : 'No Cholesky factor: A is not positive definite', 24, 34); }
  const items = [[COL.ghost, 'starting shape', true], ['#ffad68', 'shape after this step']];
  if (V.shape === 'square') items.push([COL.e1, 'where (1, 0) lands'], [COL.e2, 'where (0, 1) lands']);
  if (V.eig) items.push(['#49d6bf', 'v₁ (eigenvector)'], ['#c9b8ff', 'v₂ (eigenvector)']);
  legend.innerHTML = legendHTML(items);
  cap.textContent = `Step ${stageNow + 1} of ${st.length}: ${st[stageNow].cap}`;
  if (anim) requestAnimationFrame(() => { if (!anim) return; if (performance.now() - anim.start >= 750) { anim = null; if (playQueue.length) startAnim(stageNow, playQueue.shift()); } renderMatrix(); });
}
let playQueue = [];
function startAnim(from, to) { anim = { from, to, start: performance.now() }; stageNow = to; renderMatrix(); }
function wireViews() {
  document.querySelectorAll('#view-tabs [data-view]').forEach(b => b.addEventListener('click', () => {
    view = b.dataset.view; stageNow = null; anim = null; playQueue = [];
    document.querySelectorAll('#view-tabs [data-view]').forEach(x => x.classList.toggle('on', x === b)); renderMatrix();
  }));
  $('view-stepper').addEventListener('click', ev => {
    const t = ev.target.closest('button'); if (!t) return;
    if (t.hasAttribute('data-swap')) { swapOrder = !swapOrder; stageNow = null; anim = null; renderMatrix(); return; }
    if (t.hasAttribute('data-play')) { const n = $('view-stepper').querySelectorAll('[data-stage]').length; playQueue = []; for (let i = 2; i < n; i++) playQueue.push(i); stageNow = 0; startAnim(0, 1); return; }
    const k = Number(t.dataset.stage); if (k === stageNow && !anim) return; playQueue = []; startAnim(anim ? anim.to : stageNow, k);
  });
}

// v2.3: tab 01 example matrices [a11, a12, a21, a22]
const APRESETS={prof:[1,1,1,2],rotation:[0,-1,1,0],shear:[1,1,0,1],triangular:[2,1,0,3],reflection:[1,0,0,-1],projection:[1,0,0,0],scaling:[2,0,0,2],covariance:[4,1.2,1.2,1]};
const presets={prof:[1,1,2],circle:[1,0,1],stretched:[2,0,0.5],negative:[-1,0,-2],flipped:[-1,-1,-2],saddle:[1,2,1],plainsaddle:[1,0,-1],flat:[1,0,0],tiltedtrough:[1,1,1],ridge:[-1,0,0],plane:[0,0,0]};
let camera={angle:.8,elevation:.7,drag:false,lastX:0,lastY:0};
function setMatrix(a,b,d){$('a11').value=a;$('a12').value=b;$('a21').value=b;$('a22').value=d;$('a-sym').checked=true;[$('g-a'),$('g-b'),$('g-d')].forEach((el,i)=>{const v=[a,b,d][i];el.min=Math.min(-3,v);el.max=Math.max(3,v);el.value=v;});renderEverything();}
function renderGeometry(){const m=A(),e=getEigen(m),a=m[0][0],b=m[0][1],d=m[1][1];for(const [id,v] of [['g-a',a],['g-b',b],['g-d',d]]){$(id).min=Math.min(-3,v);$(id).max=Math.max(3,v);$(id).value=v;$(id+'-out').textContent=fmt(v,2);}const middle=b>=0?`+ ${fmt(2*b)}xy`:`− ${fmt(-2*b)}xy`;const tail=d>=0?`+ ${fmt(d)}y²`:`− ${fmt(-d)}y²`;$('quadratic-formula').textContent=`q(x,y) = ${fmt(a)}x² ${middle} ${tail} = [x y] A [x y]ᵀ`;$('geometry-status').innerHTML=`<span>det(A) = ${fmt(e.det)}</span><span>${classify(e)}</span>`+(isSym(Afull())?'':'<span>tab 01’s A is not symmetric: this is its symmetric part ½(A + Aᵀ)</span>');document.querySelectorAll('[data-preset]').forEach(btn=>{let vals=presets[btn.dataset.preset];btn.classList.toggle('active',vals.every((z,i)=>near(z,[a,b,d][i])));});const shape=classify(e);let msg='';if(e.lambda[1]>EPS)msg='All quadratic values are positive except at the origin. Positive-value contours form ellipses.';else if(e.lambda[0]<-EPS)msg='All quadratic values are negative except at the origin. Negative-value contours form ellipses around a hill.';else if(e.lambda[1]<-EPS&&e.lambda[0]>EPS)msg='The surface curves upward in one direction and downward in another: a saddle. Nonzero contours are hyperbolas.';else if(Math.abs(e.lambda[0])<EPS&&Math.abs(e.lambda[1])<EPS)msg='Every entry is zero, so q = 0 everywhere: a flat plane with no curvature and no contour lines.';else if(e.lambda[0]>EPS)msg='One eigenvalue is zero: the surface is a trough (a valley). Along the flat direction the height never changes, so the contours are parallel straight lines.';else msg='One eigenvalue is zero and the other is negative: a ridge (an upside-down trough). The contours are parallel straight lines.';
 $('geometry-explanation').innerHTML=`<div class="explainer-item"><h3>What shape?</h3><p>${msg}</p></div><div class="explainer-item"><h3>Eigenvalues = curvature</h3><p>λ₁ = ${fmt(e.lambda[0])} and λ₂ = ${fmt(e.lambda[1])}. Larger absolute values mean steeper curvature along the corresponding eigenvector axis.</p></div><div class="explainer-item"><h3>Eigenvectors = directions</h3><p>v₁ = ${vector(e.vecs[0])}, v₂ = ${vector(e.vecs[1])}. These perpendicular directions are the principal axes of the shape.</p></div>`;
 drawContours(m,e);drawSurface(m);
 geometryDerivation(m,e);   // v2.1
}
function quadratic(m,x,y){return m[0][0]*x*x+2*m[0][1]*x*y+m[1][1]*y*y;}
// Marching squares: convert implicit level curves into short line segments.
function contourPath(ctx,fn,level,toXY,xmin,xmax,ymin,ymax,delta,stroke,clipFn){ctx.save();ctx.strokeStyle=stroke;ctx.lineWidth=2.1;ctx.beginPath();for(let x=xmin;x<xmax;x+=delta){for(let y=ymin;y<ymax;y+=delta){const corners=[[x,y],[x+delta,y],[x+delta,y+delta],[x,y+delta]],values=corners.map(p=>fn(p[0],p[1])-level),edges=[[0,1],[1,2],[2,3],[3,0]],p=[];for(const [u,v] of edges){if((values[u]<0&&values[v]>=0)||(values[v]<0&&values[u]>=0)){const t=values[u]/(values[u]-values[v]);p.push([corners[u][0]+t*(corners[v][0]-corners[u][0]),corners[u][1]+t*(corners[v][1]-corners[u][1])]);}}for(let j=0;j+1<p.length;j+=2){const a=toXY(...p[j]),b=toXY(...p[j+1]);ctx.moveTo(...a);ctx.lineTo(...b);}}}ctx.stroke();ctx.restore();}
function drawContours(m,e){const {ctx,w,h}=canvasCtx('contourCanvas');ctx.fillStyle='#0b1725';ctx.fillRect(0,0,w,h);const scale=Math.min((w-90)/9,(h-75)/6.7),cx=w/2,cy=h/2;const xy=(x,y)=>[cx+x*scale,cy-y*scale];const xmin=-cx/scale,xmax=cx/scale,ymin=-(h-cy)/scale,ymax=cy/scale;
 for(let x=0;x<w;x+=7)for(let y=0;y<h;y+=7){let xx=(x+3-cx)/scale,yy=(cy-y-3)/scale,z=quadratic(m,xx,yy),alpha=Math.min(.30,Math.abs(z)/75);ctx.fillStyle=z>=0?`rgba(30,175,150,${alpha})`:`rgba(225,136,63,${alpha})`;ctx.fillRect(x,y,7,7);}
 drawGrid(ctx,w,h,cx,cy,scale);ctx.save();ctx.setLineDash([8,7]);ctx.strokeStyle='rgba(189,161,255,.75)';ctx.lineWidth=2;for(const v of e.vecs){ctx.beginPath();ctx.moveTo(cx-v[0]*900,cy+v[1]*900);ctx.lineTo(cx+v[0]*900,cy-v[1]*900);ctx.stroke();}ctx.restore();for(const lv of [-16,-9,-4,-1,0,1,4,9,16])contourPath(ctx,(x,y)=>quadratic(m,x,y),lv,xy,xmin,xmax,ymin,ymax,.085,lv>0?'rgba(86,226,195,.88)':lv<0?'rgba(255,170,96,.88)':'rgba(238,234,244,.82)');ctx.fillStyle='#93a9b8';ctx.font='15px system-ui';ctx.fillText('x',w-22,cy-12);ctx.fillText('y',cx+12,19);ctx.fillText('0',cx+8,cy+19);}
function drawSurface(m){const {ctx,w,h}=canvasCtx('surfaceCanvas');ctx.fillStyle='#0b1725';ctx.fillRect(0,0,w,h);const extent=2.65,n=31,zvals=[];for(let i=0;i<=n;i++)for(let j=0;j<=n;j++){const x=-extent+2*extent*i/n,y=-extent+2*extent*j/n;zvals.push(quadratic(m,x,y));}const maxAbs=Math.max(3,...zvals.map(Math.abs));const zscale=2.5/maxAbs;const angle=camera.angle,elev=camera.elevation;const proj=(x,y,z)=>{const h0=Math.cos(angle)*x-Math.sin(angle)*y;const depth=Math.sin(angle)*x+Math.cos(angle)*y;return [w/2+h0*92,h*.59-(depth*Math.sin(elev)-z*zscale*Math.cos(elev))*73,depth]};const faces=[];for(let i=0;i<n;i++)for(let j=0;j<n;j++){const x=-extent+2*extent*i/n,y=-extent+2*extent*j/n,step=2*extent/n,points=[[x,y],[x+step,y],[x+step,y+step],[x,y+step]],vertices=points.map(p=>proj(p[0],p[1],quadratic(m,p[0],p[1]))),z=points.reduce((t,p)=>t+quadratic(m,...p),0)/4,depth=vertices.reduce((t,p)=>t+p[2],0)/4;faces.push({vertices,z,depth});}faces.sort((a,b)=>b.depth-a.depth);for(const f of faces){ctx.beginPath();f.vertices.forEach((p,k)=>k?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();const light=Math.min(1,Math.abs(f.z)/maxAbs),shade=Math.floor(90+light*90);ctx.fillStyle=f.z>=0?`rgb(${Math.floor(14+light*25)},${shade+22},${Math.floor(122+light*30)})`:`rgb(${shade+28},${Math.floor(84+light*15)},${Math.floor(80+light*19)})`;ctx.fill();ctx.strokeStyle='rgba(5,22,35,.32)';ctx.lineWidth=.55;ctx.stroke();}ctx.fillStyle='#a9bdd0';ctx.font='15px system-ui';ctx.fillText('drag ↔ to rotate',20,29);ctx.fillText('height = q(x,y)',20,52);}
const firmIds=['a1','a2','gamma','cap1','cap2','b1','b2','w1','w2','fixed','t11','t12','t21','t22'];
const firmDefaults={a1:22,a2:20,gamma:.25,cap1:10,cap2:21,b1:.8,b2:.9,w1:2,w2:3,fixed:12,t11:1,t12:.65,t21:.45,t22:1.1};
function readFirm(){let p={};for(const id of firmIds){let v=elNumber('firm-'+id,firmDefaults[id]);if(['b1','b2','t11','t12','t21','t22'].includes(id))v=Math.max(.01,v);if(['w1','w2','fixed','cap1','cap2'].includes(id))v=Math.max(0,v);p[id]=v;}return p;}
function productionModel(p){const c1=p.w1*p.t11+p.w2*p.t21,c2=p.w1*p.t12+p.w2*p.t22,k1=p.a1-c1,k2=p.a2-c2;const B=[[p.b1,p.gamma],[p.gamma,p.b2]];const T=[[p.t11,p.t12],[p.t21,p.t22]];const value=(q)=>k1*q[0]+k2*q[1]-p.b1*q[0]**2-2*p.gamma*q[0]*q[1]-p.b2*q[1]**2-p.fixed;const constraints=[[-1,0,0],[0,-1,0],[p.t11,p.t12,p.cap1],[p.t21,p.t22,p.cap2]];const feasible=q=>constraints.every(([x,y,r])=>x*q[0]+y*q[1]<=r+1e-7);const vertices=[];for(let i=0;i<constraints.length;i++){for(let j=i+1;j<constraints.length;j++){let [a,b,r]=constraints[i],[c,d,s]=constraints[j],det=a*d-b*c;if(Math.abs(det)<EPS)continue;const q=[(r*d-b*s)/det,(a*s-r*c)/det];if(feasible(q)&&!vertices.some(z=>Math.hypot(z[0]-q[0],z[1]-q[1])<1e-6))vertices.push(q);}}const center=[vertices.reduce((s,v)=>s+v[0],0)/Math.max(vertices.length,1),vertices.reduce((s,v)=>s+v[1],0)/Math.max(vertices.length,1)];vertices.sort((v,w)=>Math.atan2(v[1]-center[1],v[0]-center[0])-Math.atan2(w[1]-center[1],w[0]-center[0]));let candidates=vertices.map(q=>({q,why:'vertex'}));for(let i=0;i<vertices.length;i++){const q0=vertices[i],q1=vertices[(i+1)%vertices.length],dx=q1[0]-q0[0],dy=q1[1]-q0[1],quadr=p.b1*dx*dx+2*p.gamma*dx*dy+p.b2*dy*dy,lin=k1*dx+k2*dy-2*(p.b1*q0[0]*dx+p.gamma*(q0[0]*dy+q0[1]*dx)+p.b2*q0[1]*dy);if(quadr>EPS){const t=Math.max(0,Math.min(1,lin/(2*quadr)));candidates.push({q:[q0[0]+dx*t,q0[1]+dy*t],why:'boundary'});}}
 const det=p.b1*p.b2-p.gamma*p.gamma;if(det>EPS){const u=[(p.b2*k1-p.gamma*k2)/(2*det),(-p.gamma*k1+p.b1*k2)/(2*det)];if(feasible(u))candidates.push({q:u,why:'interior'});}candidates.sort((x,y)=>value(y.q)-value(x.q));const best=candidates[0]??{q:[0,0],why:'origin'};const left1=p.cap1-p.t11*best.q[0]-p.t12*best.q[1],left2=p.cap2-p.t21*best.q[0]-p.t22*best.q[1];const bind=[left1<1e-5?'Input 1':null,left2<1e-5?'Input 2':null].filter(Boolean).join(' & ')||'Neither';return {p,c1,c2,k1,k2,B,T,value,vertices,best,bind,det,feasible};}
function renderBusinessStandard(){const p=readFirm(),res=productionModel(p),q=res.best.q;for(const id of ['a1','a2','gamma','cap1','cap2']){$('firm-'+id+'-out').textContent=fmt(p[id],2);}$('firm-q1').textContent=fmt(q[0],2);$('firm-q2').textContent=fmt(q[1],2);$('firm-profit').textContent=fmt(res.value(q),2);$('firm-binding').textContent=res.bind;
 let concave=res.det>EPS?'Strictly concave (unique unconstrained peak)':'Not strictly concave (capacity still bounds the search)';const substituteValidity=res.det>EPS?'The demand coefficient matrix is positive definite, consistent with standard substitute-demand behavior.':'Warning: β₁β₂ ≤ γ², so this parameter combination is outside the standard well-behaved substitute-demand model. Lower γ or increase the own-demand slopes.';
 $('firm-model').innerHTML=`<div class="model-item"><h3>1. Two substitute products: linear inverse demand</h3><div class="mathline">P₁ = ${fmt(p.a1)} − ${fmt(p.b1)}q₁ − ${fmt(p.gamma)}q₂\nP₂ = ${fmt(p.a2)} − ${fmt(p.gamma)}q₁ − ${fmt(p.b2)}q₂</div><p>γ &gt; 0 links the products: increasing the output of one reduces the inverse-demand price of the other. For ordinary substitute demand, require β₁β₂ &gt; γ²; here the determinant is ${fmt(res.det)}. ${substituteValidity}</p></div><div class="model-item"><h3>2. Linear technology and linear total cost</h3><div class="mathline">z = Tq, with T =\n${mat(res.T)}\nC = ${fmt(p.fixed)} + ${fmt(res.c1)}q₁ + ${fmt(res.c2)}q₂</div><p>Each product uses both shared input types. Input spending is wᵀTq. Joint capacities are Tq ≤ [${fmt(p.cap1)}, ${fmt(p.cap2)}].</p></div><div class="model-item"><h3>3. Write profit as a quadratic form</h3><div class="mathline">π(q) = kᵀq − qᵀBq − F\nk = [${fmt(res.k1)}, ${fmt(res.k2)}]ᵀ\nB =\n${mat(res.B)}</div><p>The quadratic term comes from revenue: π = P₁q₁ + P₂q₂ − C. Cross-term = −${fmt(2*p.gamma)}q₁q₂.</p></div><div class="model-item"><h3>4. Solve the firm's decision problem</h3><div class="mathline">Max π(q) over q ≥ 0, Tq ≤ capacity.\nq* = [${fmt(q[0])}, ${fmt(q[1])}]\nπ* = ${fmt(res.value(q))}</div><p>${concave}. We check feasible corners, optimal positions along edges, and any feasible interior stationary point. Binding resource: ${res.bind}. Try reducing capacity.</p></div>`;
 firmExplain(res);   // v2.1: glossary + explicit derivation (replaces the 4 short steps)
 drawProfit(res);
}
function drawProfit(res){const {ctx,w,h}=canvasCtx('profitCanvas');ctx.fillStyle='#0b1725';ctx.fillRect(0,0,w,h);const vertices=res.vertices;let maxX=Math.max(3,...vertices.map(v=>v[0])),maxY=Math.max(3,...vertices.map(v=>v[1]));const pad={l:68,r:28,t:26,b:52},sx=(w-pad.l-pad.r)/(maxX*1.16),sy=(h-pad.t-pad.b)/(maxY*1.16),toXY=(x,y)=>[pad.l+sx*x,h-pad.b-sy*y];const xmin=0,xmax=(w-pad.l-pad.r)/sx,ymin=0,ymax=(h-pad.t-pad.b)/sy;
 ctx.save();ctx.strokeStyle='#22384c';ctx.lineWidth=1;ctx.fillStyle='#8ea3b7';ctx.font='14px system-ui';for(let i=0;i<=5;i++){const x=xmax*i/5,px=pad.l+sx*x;ctx.beginPath();ctx.moveTo(px,pad.t);ctx.lineTo(px,h-pad.b);ctx.stroke();ctx.fillText(fmt(x,1),px-10,h-pad.b+23);const y=ymax*i/5,py=h-pad.b-sy*y;ctx.beginPath();ctx.moveTo(pad.l,py);ctx.lineTo(w-pad.r,py);ctx.stroke();ctx.fillText(fmt(y,1),18,py+5);}ctx.strokeStyle='#889eb5';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(pad.l,pad.t);ctx.lineTo(pad.l,h-pad.b);ctx.lineTo(w-pad.r,h-pad.b);ctx.stroke();ctx.fillText('q₁ units',w-pad.r-60,h-9);ctx.fillText('q₂ units',pad.l-34,17);ctx.restore();
 if(vertices.length<3)return;const path=()=>{ctx.beginPath();vertices.forEach((v,i)=>{const [x,y]=toXY(...v);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.closePath();};ctx.save();path();ctx.clip();let minV=Infinity,maxV=-Infinity;const sample=[];for(let x=0;x<=xmax;x+=xmax/35)for(let y=0;y<=ymax;y+=ymax/35){if(res.feasible([x,y])){const v=res.value([x,y]);if(Number.isFinite(v)){minV=Math.min(v,minV);maxV=Math.max(maxV,v);}}}if(!Number.isFinite(minV)){minV=-10;maxV=10;}for(let px=pad.l;px<w-pad.r;px+=7)for(let py=pad.t;py<h-pad.b;py+=7){const x=(px-pad.l)/sx,y=(h-pad.b-py)/sy,v=res.value([x,y]),strength=Number.isFinite(v)?Math.max(0,Math.min(1,(v-minV)/(maxV-minV+1e-6))):0;ctx.fillStyle=`rgba(${Math.floor(12+45*strength)},${Math.floor(67+105*strength)},${Math.floor(82+68*strength)},${.23+strength*.47})`;ctx.fillRect(px,py,8,8);}const peak=res.value(res.best.q);for(let j=1;j<=7;j++){let level=minV+(peak-minV)*j/8;contourPath(ctx,(x,y)=>res.value([x,y]),level,toXY,xmin,xmax,ymin,ymax,Math.max(xmax,ymax)/95,'rgba(167,232,215,.52)');}ctx.restore();path();ctx.strokeStyle='#60cab9';ctx.lineWidth=2.8;ctx.stroke();const [ox,oy]=toXY(...res.best.q);ctx.beginPath();ctx.arc(ox,oy,11,0,Math.PI*2);ctx.fillStyle='rgba(255,172,100,.25)';ctx.fill();ctx.beginPath();ctx.arc(ox,oy,5,0,Math.PI*2);ctx.fillStyle='#ffac64';ctx.fill();ctx.fillStyle='#ffcd97';ctx.font='bold 17px system-ui';ctx.fillText(`Optimal (${fmt(res.best.q[0],1)}, ${fmt(res.best.q[1],1)})`,Math.max(10,Math.min(ox+14,w-205)),Math.max(28,oy-13));}
/* =====================================================================
   v2.1 — “WHAT WE HAVE · HOW IT IS DERIVED” PANELS (tabs 02 and 03)
   Every number is read live from the sliders, so the explanation always
   matches what is on screen.
   ===================================================================== */
const card = (title, body, math) => `<div class="dv-card"><h3>${title}</h3><p>${body}</p>${math ? `<pre class="dv-math">${math}</pre>` : ''}</div>`;
const sym = rows => `<table class="dv-table"><tbody>${rows.map(([s, m, v]) => `<tr><td class="dv-sym">${s}</td><td>${m}</td><td class="dv-val">${v}</td></tr>`).join('')}</tbody></table>`;

function geometryDerivation(m, e) {
  // v2.2: one reference table with every value used in Theme 3, plus plain-words and catalog cards
  const a = m[0][0], b = m[0][1], d = m[1][1], [l1, l2] = e.lambda, Z = x => Math.abs(x) < EPS;
  const sgn = x => x < 0 ? `− ${fmt(-x)}` : `+ ${fmt(x)}`;
  const deg = x => `${fmt(x * 180 / Math.PI, 1)}°`;
  const kind = l2 > EPS ? 'pd' : l1 < -EPS ? 'nd' : (l1 > EPS && l2 < -EPS) ? 'ind' : (Z(l1) && Z(l2)) ? 'zero' : l1 > EPS ? 'psd' : 'nsd';
  const sameDir = Z(b) && Z(a - d);
  let rule;
  if (e.det > EPS && a > EPS) rule = `det > 0 and a > 0  →  positive definite: a bowl, contours are ellipses`;
  else if (e.det > EPS && a < -EPS) rule = `det > 0 and a < 0  →  negative definite: a hill, contours are ellipses`;
  else if (e.det < -EPS) rule = `det < 0  →  indefinite: a saddle, contours are hyperbolas`;
  else if (kind === 'zero') rule = `every entry is 0  →  q = 0 everywhere: a flat plane`;
  else if (kind === 'psd') rule = `det = 0 and a + d > 0  →  positive semidefinite: a trough, contours are parallel lines`;
  else rule = `det = 0 and a + d < 0  →  negative semidefinite: a ridge, contours are parallel lines`;
  // half-axes / crossing distances
  let axesTxt, axesVal, ratioVal;
  if (kind === 'pd' || kind === 'nd') {
    const k = kind === 'pd' ? 1 : -1, h1 = 1 / Math.sqrt(Math.abs(l1)), h2 = 1 / Math.sqrt(Math.abs(l2)), big = Math.max(Math.abs(l1), Math.abs(l2)), small = Math.min(Math.abs(l1), Math.abs(l2));
    axesTxt = `half-axes of the ellipse q = ${k}: 1/√|λ| (bigger |λ| = steeper = shorter axis)`;
    axesVal = `${fmt(h1)} along v₁, ${fmt(h2)} along v₂`;
    ratioVal = `${fmt(Math.sqrt(big / small))} (1 = circle)`;
  } else if (kind === 'ind') {
    axesTxt = 'where the hyperbolas cross the eigenvector lines: q = 1 crosses v₁, q = −1 crosses v₂';
    axesVal = `${fmt(1 / Math.sqrt(l1))} along v₁, ${fmt(1 / Math.sqrt(-l2))} along v₂`;
    ratioVal = 'not an ellipse (hyperbolas)';
  } else if (kind === 'zero') { axesTxt = 'no contour lines: the surface is flat'; axesVal = '—'; ratioVal = '—'; }
  else {
    const ln = kind === 'psd' ? l1 : l2;
    axesTxt = `distance of the lines q = ${kind === 'psd' ? 1 : -1} from the flat line: 1/√|λ|`;
    axesVal = `${fmt(1 / Math.sqrt(Math.abs(ln)))} on each side`;
    ratioVal = 'infinite (one direction is flat)';
  }
  // completing the square: the reason the det test works
  let square;
  const co = c => Z(c - 1) ? '' : Z(c + 1) ? '−' : `${fmt(c)}·`;            // leading coefficient
  const inner = (u, r, v) => Z(r) ? u : `${u} ${r < 0 ? '−' : '+'} ${Z(Math.abs(r) - 1) ? '' : fmt(Math.abs(r))}${v}`;
  const tail2 = (c, v) => Z(c) ? '' : ` ${c < 0 ? '−' : '+'} ${Z(Math.abs(c) - 1) ? '' : fmt(Math.abs(c)) + '·'}${v}²`;
  const sq = (c, u, r, v, c2) => { const core = Z(r) ? `${u}²` : `(${inner(u, r, v)})²`; return `${co(c)}${core}${tail2(c2, v)}`; };
  if (!Z(a)) square = sq(a, 'x', b / a, 'y', e.det / a);
  else if (!Z(d)) square = sq(d, 'y', b / d, 'x', e.det / d);
  else square = Z(b) ? '0' : `${fmt(2 * b)}xy (no squares to complete)`;
  const tilt = sameDir ? 'none: every direction is an eigenvector' : Z(b) ? '0° (b = 0, so no tilt)' : `${deg(e.theta)} from the x-axis`;
  const shapeTxt = classify(e);
  const head = t => `<tr class="dv-head"><td colspan="3">${t}</td></tr>`;
  const row = ([s, mm, v]) => `<tr><td class="dv-sym">${s}</td><td>${mm}</td><td class="dv-val">${v}</td></tr>`;
  const table = `<table class="dv-table"><tbody>` +
    head('The matrix (what you control)') + [
      ['A', 'the symmetric matrix set by the sliders', `[[${fmt(a)}, ${fmt(b)}], [${fmt(b)}, ${fmt(d)}]]`],
      ['a', 'top-left entry: how steep the landscape is along x (q(1, 0) = a)', fmt(a)],
      ['b', 'top-right = bottom-left: the cross effect between x and y; it tilts the shape', fmt(b)],
      ['d', 'bottom-right entry: how steep the landscape is along y (q(0, 1) = d)', fmt(d)]].map(row).join('') +
    head('The landscape') + [
      ['(x, y)', 'any point on the map: two choices, e.g. two quantities', 'the grid'],
      ['q(x, y)', 'the height at that point: ax² + 2bxy + dy²', `${fmt(a)}x² ${sgn(2 * b)}xy ${sgn(d)}y²`],
      ['2b', 'coefficient of the cross term xy (the two b’s add up)', fmt(2 * b)],
      ['k', 'a chosen height; the level set is all points with q(x, y) = k', 'drawn: ±1, ±4, ±9, ±16'],
      ['q(1, 1), q(1, −1)', 'two sample heights (diagonal directions)', `${fmt(quadratic(m, 1, 1))}, ${fmt(quadratic(m, 1, -1))}`]].map(row).join('') +
    head('The shape numbers') + [
      ['det(A)', 'ad − b² = λ₁ × λ₂. Its sign decides bowl/hill vs saddle', fmt(e.det)],
      ['trace', 'a + d = λ₁ + λ₂. Its sign says up (bowl) or down (hill)', fmt(e.trace)],
      ['λ₁', 'larger eigenvalue: curvature (steepness) along v₁', fmt(l1)],
      ['λ₂', 'smaller eigenvalue: curvature along v₂', fmt(l2)],
      ['signs of λ', '(+,+) bowl · (−,−) hill · (+,−) saddle · a 0 = flat direction', `(${l1 > EPS ? '+' : l1 < -EPS ? '−' : '0'}, ${l2 > EPS ? '+' : l2 < -EPS ? '−' : '0'})`],
      ['shape', 'the verdict', shapeTxt]].map(row).join('') +
    head('The geometry') + [
      ['v₁', 'eigenvector for λ₁: one principal axis of the shape (a dashed purple line)', vector(e.vecs[0])],
      ['v₂', 'eigenvector for λ₂: the other principal axis, perpendicular to v₁', vector(e.vecs[1])],
      ['θ (tilt)', 'angle of v₁: how much the shape is turned', tilt],
      ['1/√|λ|', axesTxt, axesVal],
      ['axis ratio', 'long axis ÷ short axis = √(|λ|big ÷ |λ|small): how stretched', ratioVal],
      ['(s, t)', 'distances measured along v₁ and v₂; there the cross term vanishes', `q = ${fmt(l1)}s² ${sgn(l2)}t²`],
      ['A = QΛQᵀ', 'spectral decomposition: Q has v₁, v₂ as columns, Λ = diag(λ₁, λ₂)', `Λ = diag(${fmt(l1)}, ${fmt(l2)})`],
      ['completed square', 'q rewritten as a sum of squares: the signs of its two coefficients give the shape', square]].map(row).join('') +
    `</tbody></table>`;

  // plain-words explanation of what is driving this shape
  const why = [];
  if (kind === 'pd') why.push(`<b>Both eigenvalues are positive</b>, so the landscape curves <b>up</b> in every direction: a bowl with one lowest point at (0, 0). Every height except the center is positive.`);
  if (kind === 'nd') why.push(`<b>Both eigenvalues are negative</b>, so the landscape curves <b>down</b> in every direction: a hill with one highest point at (0, 0). This is what a profit function with a single best plan looks like.`);
  if (kind === 'ind') why.push(`<b>One eigenvalue is positive and one is negative</b>: the landscape goes up along v₁ and down along v₂, a saddle. There is no lowest or highest point, and the level sets are hyperbolas.`);
  if (kind === 'psd' || kind === 'nsd') why.push(`<b>One eigenvalue is exactly 0</b>: along that eigenvector the height never changes, so the landscape is a ${kind === 'psd' ? 'trough (valley)' : 'ridge'} and the contours are parallel lines. There is a whole line of ${kind === 'psd' ? 'lowest' : 'highest'} points, not one.`);
  if (kind === 'zero') why.push('<b>All entries are 0</b>, so q is 0 everywhere: no curvature at all.');
  if (kind === 'pd' || kind === 'nd' || kind === 'ind') {
    if (sameDir) why.push(`Both eigenvalues are equal (${fmt(l1)}), so every direction is equally steep: the level sets are <b>circles</b>.`);
    else why.push(`<b>How steep:</b> |λ₁| = ${fmt(Math.abs(l1))} along v₁ and |λ₂| = ${fmt(Math.abs(l2))} along v₂. Bigger |λ| = steeper = the contour lines are closer together in that direction.`);
  }
  if (Z(b)) why.push(`<b>Why no tilt:</b> b = 0, so x and y do not interact. The axes of the shape line up with x and y, and the eigenvalues are simply a = ${fmt(a)} and d = ${fmt(d)}.`);
  else why.push(`<b>Why it is tilted:</b> b = ${fmt(b)} links x and y (the cross term ${fmt(2 * b)}xy). That turns the shape so its axes follow the eigenvectors, ${Z(a - d) ? 'at exactly 45°, because a = d' : `about ${deg(Math.abs(e.theta) > Math.PI / 2 ? e.theta - Math.sign(e.theta) * Math.PI : e.theta)} from the x-axis`}.`);
  if ((kind === 'pd' || kind === 'nd') && !sameDir) {
    const r = Math.min(Math.abs(l1), Math.abs(l2)) / Math.max(Math.abs(l1), Math.abs(l2));
    why.push(`<b>How stretched:</b> the ellipses are ${fmt(Math.sqrt(1 / r), 2)}× longer than they are wide (axis ratio). ${r < 0.08 ? 'One eigenvalue is close to 0: the shape is <b>almost flat</b> in one direction and close to breaking.' : ''}`);
  }
  if (a * d > EPS) why.push(`<b>Breaking point:</b> keeping a = ${fmt(a)} and d = ${fmt(d)}, the shape changes type when b² reaches ad, i.e. at b = ±√(ad) = ±${fmt(Math.sqrt(a * d))}. Right now det = ${fmt(e.det)}${e.det > EPS ? `, so b has room to grow by ${fmt(Math.sqrt(a * d) - Math.abs(b))}` : e.det < -EPS ? ', so b is past that point' : ', exactly at the point'}.`);
  if (a * d < -EPS) why.push('<b>a and d have opposite signs</b>, so det is negative whatever b is: it is a saddle for every b.');
  if (kind !== 'zero') why.push(`<b>Why the det test works:</b> completing the square gives q = ${square}. The two coefficients are a and det/a, so their signs decide the shape.`);

  const cat = [['pd', 'Positive definite', '(+, +)', 'det > 0, a > 0', 'ellipses', 'bowl, one lowest point', 'cost or risk with one minimum'],
    ['nd', 'Negative definite', '(−, −)', 'det > 0, a < 0', 'ellipses', 'hill, one highest point', 'profit with one best plan'],
    ['ind', 'Indefinite', '(+, −)', 'det < 0', 'hyperbolas', 'saddle', 'no best plan'],
    ['psd', 'Positive semidefinite', '(+, 0)', 'det = 0, a + d > 0', 'parallel lines', 'trough (valley)', 'many equally low plans'],
    ['nsd', 'Negative semidefinite', '(−, 0)', 'det = 0, a + d < 0', 'parallel lines', 'ridge (inverted trough)', 'many equally good plans'],
    ['zero', 'Zero matrix', '(0, 0)', 'a = b = d = 0', 'none', 'flat plane', 'no curvature']];
  const catalog = `<table class="dv-table dv-cat"><thead><tr><td>Type</td><td>λ signs</td><td>Quick test</td><td>Contours</td><td>3D shape</td><td>In business</td></tr></thead><tbody>` +
    cat.map(c => `<tr class="${c[0] === kind ? 'dv-on' : ''}"><td><b>${c[1]}</b>${c[0] === kind ? ' ← now' : ''}</td><td class="dv-sym">${c[2]}</td><td>${c[3]}</td><td>${c[4]}</td><td>${c[5]}</td><td>${c[6]}</td></tr>`).join('') + `</tbody></table>`;

  $('geometry-derivation').innerHTML = '<div class="dv-grid">' +
    `<div class="dv-card"><h3>1 · What we have: every value, live</h3><p>All the symbols used when presenting Theme 3, with their current values. Move a slider or click a preset and the whole table updates.</p>${table}</div>` +
    card('2 · How the formula comes from A',
      'Multiply A by the point, then take the dot product with the point again. The two b-terms add up, which is why the cross term has a 2.',
      `A·(x, y) = (${fmt(a)}x ${sgn(b)}y,  ${fmt(b)}x ${sgn(d)}y)\n(x, y)·A·(x, y) = ax² + bxy + bxy + dy²\n               = ax² + 2bxy + dy²\nWith your numbers:  q = ${fmt(a)}x² ${sgn(2 * b)}xy ${sgn(d)}y²\nExample: q(1, 1) = ${fmt(quadratic(m, 1, 1))}    q(1, −1) = ${fmt(quadratic(m, 1, -1))}`) +
    card('3 · What the lines on the map are',
      'Each line is a <b>level set</b>: all points with the same height. The map draws q = 1, 4, 9 and 16 in teal, q = −1, −4, −9 and −16 in orange, and q = 0 in white. The dashed purple lines are the eigenvectors of A. Because 1, 4, 9, 16 are squares, each ring is the first one scaled by 1, 2, 3, 4.',
      `level set at height k:   ${fmt(a)}x² ${sgn(2 * b)}xy ${sgn(d)}y² = k\nlevel k = level 1 scaled by √k`) +
    card('4 · The shape test',
      'Two quick numbers decide the shape: the determinant and the top-left entry. The eigenvalues say the same thing.',
      `det = ad − b² = ${fmt(a)}×${fmt(d)} − ${fmt(b)}² = ${fmt(e.det)}\n${rule.replace('  →  ', '\n  →  ')}\neigenvalues λ = ${fmt(l1)} and ${fmt(l2)}\ncompleted square: q = ${square}`) +
    `<div class="dv-card dv-wide"><h3>5 · Why it looks like this, in plain words</h3><ul class="dv-why">${why.map(w => `<li>${w}</li>`).join('')}</ul></div>` +
    `<div class="dv-card dv-wide"><h3>6 · Every shape a 2×2 quadratic form can make</h3><p>Only the <b>signs of the two eigenvalues</b> matter, so there are exactly six types. The presets above give at least one example of each; the current one is highlighted.</p>${catalog}</div>` +
    '</div>';
}

function firmExplain(res) {
  const p = res.p, q = res.best.q;
  // Unconstrained top of the hill: set both slopes to zero, k − 2Bq = 0  →  q = ½B⁻¹k
  let top = null;
  if (res.det > EPS) top = [(p.b2 * res.k1 - p.gamma * res.k2) / (2 * res.det), (-p.gamma * res.k1 + p.b1 * res.k2) / (2 * res.det)];
  const eB = getEigen(res.B);
  // v2.3: exact shadow prices from the KKT condition k − 2B·q* = Σ μᵢ·(row i of the limits in use)
  const base = res.value(q), grad = [res.k1 - 2 * (p.b1 * q[0] + p.gamma * q[1]), res.k2 - 2 * (p.gamma * q[0] + p.b2 * q[1])];
  const mu = kktMu(grad, p, q) || [0, 0];
  // v2.3: profit as an exact quadratic form, x = (q₁, q₂, 1): π = xᵀMx
  const M3 = [[-p.b1, -p.gamma, res.k1 / 2], [-p.gamma, -p.b2, res.k2 / 2], [res.k1 / 2, res.k2 / 2, -p.fixed]];
  const xMx = z => { const x = [z[0], z[1], 1]; let t = 0; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) t += x[i] * M3[i][j] * x[j]; return t; };
  const piTop = top ? res.value(top) : null;
  const P = [p.a1 - p.b1 * q[0] - p.gamma * q[1], p.a2 - p.gamma * q[0] - p.b2 * q[1]];
  const used = [p.t11 * q[0] + p.t12 * q[1], p.t21 * q[0] + p.t22 * q[1]];
  $('firm-glossary').innerHTML = sym([
    ['q₁, q₂', 'units of product 1 and 2 to make: <b>the decision</b>', `best: ${fmt(q[0], 2)}, ${fmt(q[1], 2)}`],
    ['α₁, α₂', 'demand intercepts: the price if nothing were sold (the most anyone pays)', `${fmt(p.a1)}, ${fmt(p.a2)}`],
    ['β₁, β₂', 'own-price slopes: how much a product\'s price falls per extra unit of itself', `${fmt(p.b1)}, ${fmt(p.b2)}`],
    ['γ', 'substitution: how much one product\'s price falls per extra unit of the <i>other</i>', fmt(p.gamma)],
    ['B', 'the demand matrix [[β₁, γ], [γ, β₂]]: prices are P = α − B·q', `[[${fmt(p.b1)}, ${fmt(p.gamma)}], [${fmt(p.gamma)}, ${fmt(p.b2)}]]`],
    ['T', 'technology matrix: column j = units of input 1 and input 2 needed per unit of product j', `[[${fmt(p.t11)}, ${fmt(p.t12)}], [${fmt(p.t21)}, ${fmt(p.t22)}]]`],
    ['w₁, w₂', 'cost of <b>using</b> one unit of each input (energy, wear, hourly wages); the amount on hand is s', `${fmt(p.w1)}, ${fmt(p.w2)}`],
    ['c₁, c₂', 'cost per unit of each product, c = Tᵀw (its recipe × input prices)', `${fmt(res.c1)}, ${fmt(res.c2)}`],
    ['F', 'fixed cost, paid whatever is produced. It makes total cost <b>affine</b> (a straight line that starts at F); set F = 0 for a strictly linear cost', fmt(p.fixed)],
    ['s₁, s₂', 'inputs the firm <b>has on hand</b> this period (e.g. machine hours, labor hours): the limits T·q ≤ s', `${fmt(p.cap1)}, ${fmt(p.cap2)}`],
    ['k', 'margin at zero output, k = α − c', `${fmt(res.k1)}, ${fmt(res.k2)}`],
    ['M', '3×3 matrix that writes the whole profit as one quadratic form, π = xᵀMx with x = (q₁, q₂, 1)', 'see step 3'],
    ['μ₁, μ₂', 'shadow prices: extra profit from one more unit of each input (0 if it is not used up)', `${fmt(mu[0], 3)}, ${fmt(mu[1], 3)}`]]);
  const steps = [
    ['1. Demand: prices fall as output rises', `P₁ = ${fmt(p.a1)} − ${fmt(p.b1)}q₁ − ${fmt(p.gamma)}q₂\nP₂ = ${fmt(p.a2)} − ${fmt(p.gamma)}q₁ − ${fmt(p.b2)}q₂\nIn matrix form: P = α − B·q`,
      `γ &gt; 0 means substitutes: selling more of one product lowers the other's price. At the best plan the prices are ${fmt(P[0], 2)} and ${fmt(P[1], 2)}.`],
    ['2. Cost: linear in output, plus a fixed cost', `c₁ = w₁·T₁₁ + w₂·T₂₁ = ${fmt(p.w1)}×${fmt(p.t11)} + ${fmt(p.w2)}×${fmt(p.t21)} = ${fmt(res.c1)}\nc₂ = w₁·T₁₂ + w₂·T₂₂ = ${fmt(p.w1)}×${fmt(p.t12)} + ${fmt(p.w2)}×${fmt(p.t22)} = ${fmt(res.c2)}\nC(q) = ${fmt(p.fixed)} + ${fmt(res.c1)}q₁ + ${fmt(res.c2)}q₂    ∂²C/∂q₁∂q₂ = 0`,
      `Each unit always costs the same, so the cross-derivative is 0: producing one product never changes the other's marginal cost. ${p.fixed > 0 ? 'Strictly, C is <b>affine</b> (it starts at F = ' + fmt(p.fixed) + ', not 0); the part that grows with output is linear.' : 'With F = 0, C is strictly linear.'} The inputs are capacity the firm has on hand (s); w is the cost of using one unit. The products therefore interact through <b>demand</b> (γ) and through the <b>shared input limits</b>.`],
    ['3. Profit = revenue − cost: a quadratic function, written exactly as a quadratic form', `π = P₁q₁ + P₂q₂ − C\n  = (${fmt(p.a1)} − ${fmt(res.c1)})q₁ + (${fmt(p.a2)} − ${fmt(res.c2)})q₂ − ${fmt(p.b1)}q₁² − ${fmt(2 * p.gamma)}q₁q₂ − ${fmt(p.b2)}q₂² − ${fmt(p.fixed)}\n  = kᵀq − qᵀBq − F      (linear part + quadratic form + constant)\n\nExact form 1, add a 1 to the vector, x = (q₁, q₂, 1):   π = xᵀMx,  M =\n${mat3(M3)}\ncheck at the best plan: xᵀMx = ${fmt(xMx(q), 3)} = π* ✓` + (top ? `\n\nExact form 2, measure from the top of the hill q_top = (${fmt(top[0], 3)}, ${fmt(top[1], 3)}):\nπ = ${fmt(piTop, 3)} − (q − q_top)ᵀ B (q − q_top)` : ''),
      'Price × quantity with prices that depend on quantity creates the squared terms and the cross term 2γq₁q₂. On its own, kᵀq − qᵀBq − F is a quadratic <i>function</i>: only −qᵀBq is a quadratic form (every term of degree 2). Adding the constant 1 to the vector, or measuring from the top of the hill, turns the whole profit into an exact quadratic form.'],
    ['4. Is there a single best plan? Check B', `det B = β₁β₂ − γ² = ${fmt(p.b1)}×${fmt(p.b2)} − ${fmt(p.gamma)}² = ${fmt(res.det)}\neigenvalues of B: ${fmt(eB.lambda[0])} and ${fmt(eB.lambda[1])}`,
      res.det > EPS && p.b1 > 0 ? 'Both positive: B is positive definite, so −qᵀBq is a hill and profit has one top.' : '<b>Warning:</b> B is not positive definite (γ² ≥ β₁β₂). Profit is a saddle and has no single top; lower γ.'],
    ['5. The top of the hill (ignoring the limits)', top ? `Set both slopes to zero: k − 2B·q = 0  →  q = ½B⁻¹k = (${fmt(top[0], 2)}, ${fmt(top[1], 2)})\ninputs it would need: T·q = (${fmt(p.t11 * top[0] + p.t12 * top[1], 2)}, ${fmt(p.t21 * top[0] + p.t22 * top[1], 2)}) vs limits (${fmt(p.cap1)}, ${fmt(p.cap2)})` : 'No top exists when B is not positive definite.',
      top ? (res.feasible(top) ? 'It fits inside both limits, so it is the best plan.' : 'It needs more input than available, so the best plan sits on the edge of the shaded region.') : ''],
    ['6. Best plan you can actually make', `q* = (${fmt(q[0], 3)}, ${fmt(q[1], 3)})    profit = ${fmt(base, 3)}\ninputs used: (${fmt(used[0], 2)}, ${fmt(used[1], 2)}) of (${fmt(p.cap1)}, ${fmt(p.cap2)})\nmarginal profit k − 2B·q* = (${fmt(grad[0], 3)}, ${fmt(grad[1], 3)})\nshadow prices (exact KKT): μ₁ = ${fmt(mu[0], 3)}, μ₂ = ${fmt(mu[1], 3)}`,
      res.bind === 'Neither' ? 'No input is used up, so both shadow prices are 0 and production does not link the two products right now. Lower an input to make them compete for it.' : `${res.bind} ${res.bind.includes('&') ? 'are' : 'is'} used up: the two products <b>compete for ${res.bind.includes('&') ? 'them' : 'it'}</b>, which is how they interact through production. At the best plan the marginal profit equals μ times the input each product uses; one more unit of the input adds about μ to profit.`]];
  $('firm-model').innerHTML = steps.map(([t, mth, txt]) => `<div class="model-item"><h3>${t}</h3><div class="mathline">${mth}</div><p>${txt}</p></div>`).join('');
}

/* =====================================================================
   v2.3 — TAB 03: EXACT SHADOW PRICES, EXACT QUADRATIC FORM, AND
   “BUILD YOUR OWN FUNCTIONS”
   ---------------------------------------------------------------------
   kktMu      exact shadow prices from the KKT condition
              ∇π(q*) = Σ μᵢ·(row i of the active limits)
   compileFx  a small, safe formula reader (no eval): numbers, q1, q2,
              + − * / ^, ( ), sqrt exp ln log abs min max pow, pi, e
   customModel / maximizeFx   profit = P₁q₁ + P₂q₂ − C on the region
              q ≥ 0, T·q ≤ s, maximized by a grid search plus a
              pattern search that can slide along the edges
   Business analogy: the standard model is a template spreadsheet;
   custom mode lets you type your own formulas into the same sheet.
   ===================================================================== */
let firmMode = 'standard';
function renderBusiness() { if (firmMode === 'custom') return renderCustom(); renderBusinessStandard(); }

// Exact shadow prices. Active limits are the inputs that are used up and any q_j = 0.
function kktMu(grad, p, q) {
  const tol = 1e-6 * Math.max(1, p.cap1, p.cap2), rows = [];
  if (p.cap1 - p.t11 * q[0] - p.t12 * q[1] < tol) rows.push({ a: [p.t11, p.t12], k: 0 });
  if (p.cap2 - p.t21 * q[0] - p.t22 * q[1] < tol) rows.push({ a: [p.t21, p.t22], k: 1 });
  if (q[0] < 1e-7) rows.push({ a: [-1, 0], k: -1 });
  if (q[1] < 1e-7) rows.push({ a: [0, -1], k: -1 });
  const mu = [0, 0]; if (!rows.length) return mu;
  let lam;
  if (rows.length === 1) { const a = rows[0].a; lam = [(grad[0] * a[0] + grad[1] * a[1]) / (a[0] * a[0] + a[1] * a[1])]; }
  else { const r = rows, M = [[r[0].a[0], r[1].a[0]], [r[0].a[1], r[1].a[1]]], dt = M[0][0] * M[1][1] - M[0][1] * M[1][0]; if (Math.abs(dt) < 1e-12) return null; lam = [(grad[0] * M[1][1] - M[0][1] * grad[1]) / dt, (M[0][0] * grad[1] - M[1][0] * grad[0]) / dt]; }
  lam.forEach((l, i) => { if (rows[i].k >= 0) mu[rows[i].k] = Math.max(0, l); });
  return mu;
}
const mat3 = M => { const w = M.flat().map(x => fmt(x)).reduce((m, t) => Math.max(m, t.length), 0), c = x => fmt(x).padStart(w); return `⎡ ${M[0].map(c).join('  ')} ⎤\n⎢ ${M[1].map(c).join('  ')} ⎥\n⎣ ${M[2].map(c).join('  ')} ⎦`; };

// ---------- the formula reader ----------
const FX_FUN = { sqrt: Math.sqrt, exp: Math.exp, ln: Math.log, log: Math.log, abs: Math.abs, min: Math.min, max: Math.max, pow: Math.pow, sin: Math.sin, cos: Math.cos };
function compileFx(src) {
  const str = String(src).replace(/[−–]/g, '-').replace(/[×·]/g, '*').replace(/q₁/g, 'q1').replace(/q₂/g, 'q2').replace(/\s+/g, '');
  if (!str) throw new Error('empty formula');
  const raw = []; let i = 0;
  while (i < str.length) {
    const ch = str[i];
    if (/[0-9.]/.test(ch)) { let j = i; while (j < str.length && /[0-9.]/.test(str[j])) j++; const v = Number(str.slice(i, j)); if (!Number.isFinite(v)) throw new Error(`“${str.slice(i, j)}” is not a number`); raw.push({ t: 'n', v }); i = j; continue; }
    if (/[a-zA-Z_]/.test(ch)) { let j = i; while (j < str.length && /[a-zA-Z_0-9]/.test(str[j])) j++; raw.push({ t: 'id', v: str.slice(i, j).toLowerCase() }); i = j; continue; }
    if ('+-*/^(),'.includes(ch)) { raw.push({ t: ch }); i++; continue; }
    throw new Error(`I don't understand “${ch}”`);
  }
  const toks = [];   // allow 0.8q1, 2(q1+q2), (q1)(q2)
  for (const tk of raw) { const pr = toks[toks.length - 1]; if (pr && (pr.t === 'n' || pr.t === ')' || (pr.t === 'id' && !FX_FUN[pr.v])) && (tk.t === 'n' || tk.t === 'id' || tk.t === '(')) toks.push({ t: '*' }); toks.push(tk); }
  let k = 0; const peek = () => toks[k], take = t => { if (!toks[k] || toks[k].t !== t) throw new Error(`expected “${t}”`); return toks[k++]; };
  function expr() { let f = term(); while (peek() && (peek().t === '+' || peek().t === '-')) { const op = toks[k++].t, g = term(), f0 = f; f = op === '+' ? (x, y) => f0(x, y) + g(x, y) : (x, y) => f0(x, y) - g(x, y); } return f; }
  function term() { let f = unary(); while (peek() && (peek().t === '*' || peek().t === '/')) { const op = toks[k++].t, g = unary(), f0 = f; f = op === '*' ? (x, y) => f0(x, y) * g(x, y) : (x, y) => f0(x, y) / g(x, y); } return f; }
  function unary() { if (peek() && peek().t === '-') { k++; const g = unary(); return (x, y) => -g(x, y); } if (peek() && peek().t === '+') { k++; return unary(); } return power(); }
  function power() { const b = primary(); if (peek() && peek().t === '^') { k++; const e = unary(); return (x, y) => Math.pow(b(x, y), e(x, y)); } return b; }
  function primary() {
    const tk = toks[k++]; if (!tk) throw new Error('the formula ends too early');
    if (tk.t === 'n') return () => tk.v;
    if (tk.t === '(') { const f = expr(); take(')'); return f; }
    if (tk.t === 'id') {
      if (tk.v === 'q1') return x => x; if (tk.v === 'q2') return (x, y) => y;
      if (tk.v === 'pi') return () => Math.PI; if (tk.v === 'e') return () => Math.E;
      if (FX_FUN[tk.v]) { take('('); const args = [expr()]; while (peek() && peek().t === ',') { k++; args.push(expr()); } take(')'); const fn = FX_FUN[tk.v]; return (x, y) => fn(...args.map(a => a(x, y))); }
      throw new Error(`unknown name “${tk.v}” (use q1 and q2)`);
    }
    throw new Error(`unexpected “${tk.t}”`);
  }
  const f = expr(); if (k < toks.length) throw new Error(`unexpected “${toks[k].t === 'n' ? toks[k].v : toks[k].t === 'id' ? toks[k].v : toks[k].t}”`);
  return f;
}
const prettyFx = src => String(src).replace(/q1/g, 'q₁').replace(/q2/g, 'q₂').replace(/\*/g, '·');

// ---------- the allowed region: q ≥ 0 and T·q ≤ s ----------
function firmRegion(p) {
  const constraints = [[-1, 0, 0], [0, -1, 0], [p.t11, p.t12, p.cap1], [p.t21, p.t22, p.cap2]];
  const feasible = q => constraints.every(([x, y, r]) => x * q[0] + y * q[1] <= r + 1e-7);
  const vertices = [];
  for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) { const [a, b, r] = constraints[i], [c, d, s2] = constraints[j], dt = a * d - b * c; if (Math.abs(dt) < EPS) continue; const q = [(r * d - b * s2) / dt, (a * s2 - r * c) / dt]; if (feasible(q) && !vertices.some(z => Math.hypot(z[0] - q[0], z[1] - q[1]) < 1e-6)) vertices.push(q); }
  const cx = vertices.reduce((t, v) => t + v[0], 0) / Math.max(1, vertices.length), cy = vertices.reduce((t, v) => t + v[1], 0) / Math.max(1, vertices.length);
  vertices.sort((v, w) => Math.atan2(v[1] - cy, v[0] - cx) - Math.atan2(w[1] - cy, w[0] - cx));
  return { constraints, feasible, vertices };
}
// Grid search, then a pattern search that projects back onto a limit it crosses (so it can slide along edges).
function maximizeFx(value, R) {
  const X = Math.max(1e-6, ...R.vertices.map(v => v[0])), Y = Math.max(1e-6, ...R.vertices.map(v => v[1]));
  let best = null, bv = -Infinity;
  const tryq = q => { if (!R.feasible(q)) return false; const v = value(q); if (Number.isFinite(v) && v > bv + 1e-12) { bv = v; best = q; return true; } return false; };
  const N = 90; for (let i = 0; i <= N; i++) for (let j = 0; j <= N; j++) tryq([X * i / N, Y * j / N]);
  R.vertices.forEach((v, i) => { const w = R.vertices[(i + 1) % R.vertices.length]; for (let t = 0; t <= 60; t++) tryq([v[0] + (w[0] - v[0]) * t / 60, v[1] + (w[1] - v[1]) * t / 60]); });
  if (!best) return null;
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]].map(d => { const r = Math.hypot(d[0], d[1]); return [d[0] / r, d[1] / r]; });
  R.constraints.forEach(([a, b]) => { const r = Math.hypot(a, b); dirs.push([b / r, -a / r], [-b / r, a / r]); });
  const project = q => { let z = q; for (let pass = 0; pass < 3; pass++) for (const [a, b, r] of R.constraints) { const g = a * z[0] + b * z[1] - r; if (g > 0) { const n2 = a * a + b * b; z = [z[0] - g * a / n2, z[1] - g * b / n2]; } } return z; };
  let step = Math.max(X, Y) / N;
  for (let it = 0; it < 3000 && step > 1e-10 * Math.max(1, X, Y); it++) {
    let moved = false;
    for (const d of dirs) { if (tryq(project([best[0] + d[0] * step, best[1] + d[1] * step]))) { moved = true; break; } }
    if (!moved) step /= 2;
  }
  return { q: best, v: bv };
}
function customModel(p, f) {
  const value = q => { const v = f.P1(q[0], q[1]) * q[0] + f.P2(q[0], q[1]) * q[1] - f.C(q[0], q[1]); return Number.isFinite(v) ? v : -Infinity; };
  const R = firmRegion(p), sol = maximizeFx(value, R), q = sol ? sol.q : [0, 0];
  const left1 = p.cap1 - p.t11 * q[0] - p.t12 * q[1], left2 = p.cap2 - p.t21 * q[0] - p.t22 * q[1], tol = 1e-4 * Math.max(1, p.cap1, p.cap2);
  const bind = [left1 < tol ? 'Input 1' : null, left2 < tol ? 'Input 2' : null].filter(Boolean).join(' & ') || 'Neither';
  return { p, f, custom: true, value, feasible: R.feasible, vertices: R.vertices, best: { q }, bind, T: [[p.t11, p.t12], [p.t21, p.t22]], ok: !!sol };
}
// numeric derivatives (central differences; one-sided at the edge q = 0)
function dFx(fn, q, i) { const h = 1e-5 * (1 + Math.abs(q[i])), a = q.slice(), b = q.slice(); a[i] += h; if (q[i] - h >= 0) { b[i] -= h; return (fn(a) - fn(b)) / (2 * h); } return (fn(a) - fn(q)) / h; }
function hessFx(fn, q) {
  const h = 1e-3 * (1 + Math.max(Math.abs(q[0]), Math.abs(q[1]))), c = [Math.max(q[0], h), Math.max(q[1], h)], at = (x, y) => fn([c[0] + x * h, c[1] + y * h]);
  const hxx = (at(1, 0) - 2 * at(0, 0) + at(-1, 0)) / (h * h), hyy = (at(0, 1) - 2 * at(0, 0) + at(0, -1)) / (h * h), hxy = (at(1, 1) - at(1, -1) - at(-1, 1) + at(-1, -1)) / (4 * h * h);
  return [[hxx, hxy], [hxy, hyy]];
}
const FX_DEFAULT = { p1: '22 - 0.8*q1 - 0.25*q2', p2: '20 - 0.25*q1 - 0.9*q2', c: '12 + 3.35*q1 + 4.6*q2' };
const FX_PRESETS = {
  complements: { p1: '22 - 0.8*q1 + 0.25*q2', p2: '20 + 0.25*q1 - 0.9*q2', c: '12 + 3.35*q1 + 4.6*q2' },
  scope: { p1: '22 - 0.8*q1 - 0.25*q2', p2: '20 - 0.25*q1 - 0.9*q2', c: '12 + 3.35*q1 + 4.6*q2 - 0.15*q1*q2' },
  rising: { p1: '22 - 0.8*q1 - 0.25*q2', p2: '20 - 0.25*q1 - 0.9*q2', c: '12 + 3.35*q1 + 4.6*q2 + 0.2*q1^2 + 0.1*q2^2' },
  curved: { p1: '26 - 3*sqrt(q1) - 0.25*q2', p2: '20 - 0.25*q1 - 0.9*q2', c: '12 + 3.35*q1 + 4.6*q2' }
};
function slidersAsFormulas() {
  const p = readFirm(), c1 = p.w1 * p.t11 + p.w2 * p.t21, c2 = p.w1 * p.t12 + p.w2 * p.t22;
  return { p1: `${fmt(p.a1)} - ${fmt(p.b1)}*q1 - ${fmt(p.gamma)}*q2`, p2: `${fmt(p.a2)} - ${fmt(p.gamma)}*q1 - ${fmt(p.b2)}*q2`, c: `${fmt(p.fixed)} + ${fmt(c1)}*q1 + ${fmt(c2)}*q2` };
}
function readFx() {
  const f = {}, bad = [];
  for (const [key, id, name] of [['P1', 'fx-p1', 'P₁'], ['P2', 'fx-p2', 'P₂'], ['C', 'fx-c', 'C']]) { try { f[key] = compileFx($(id).value); $(id).classList.remove('fx-bad'); } catch (err) { bad.push(`${name}: ${err.message}`); $(id).classList.add('fx-bad'); } }
  return { f, bad };
}
function setFirmMode(mode) {
  firmMode = mode;
  document.querySelectorAll('[data-fmode]').forEach(b => b.classList.toggle('on', b.dataset.fmode === mode));
  $('custom-panel').hidden = mode !== 'custom';
  ['firm-a1', 'firm-a2', 'firm-gamma', 'firm-b1', 'firm-b2', 'firm-w1', 'firm-w2', 'firm-fixed'].forEach(id => { const el = $(id).closest('.range-row') || $(id).closest('label'); if (el) el.classList.toggle('fx-hide', mode === 'custom'); });
  renderBusiness();
}
function renderCustom() {
  const p = readFirm(); for (const id of ['cap1', 'cap2']) $('firm-' + id + '-out').textContent = fmt(p[id], 2);
  const { f, bad } = readFx();
  if (bad.length) { $('fx-status').innerHTML = `<span class="negative-status">Fix the formula · ${bad.join(' · ')}</span>`; return; }
  const res = customModel(p, f), q = res.best.q;
  if (!res.ok) { $('fx-status').innerHTML = '<span class="negative-status">Profit cannot be computed anywhere in the allowed region (check for √ or ln of negative numbers).</span>'; return; }
  $('fx-status').innerHTML = '<span class="positive-status">✓ Formulas read</span><span>profit = P₁·q₁ + P₂·q₂ − C, maximized over q ≥ 0 and T·q ≤ s</span>';
  $('firm-q1').textContent = fmt(q[0], 2); $('firm-q2').textContent = fmt(q[1], 2); $('firm-profit').textContent = fmt(res.value(q), 2); $('firm-binding').textContent = res.bind;
  customExplain(res); drawProfit(res);
}
function customExplain(res) {
  const p = res.p, f = res.f, q = res.best.q, val = res.value, pv = val(q);
  const P = [f.P1(q[0], q[1]), f.P2(q[0], q[1])], Cf = z => f.C(z[0], z[1]);
  const dP12 = dFx(z => f.P1(z[0], z[1]), q, 1), dP21 = dFx(z => f.P2(z[0], z[1]), q, 0), dP11 = dFx(z => f.P1(z[0], z[1]), q, 0), dP22 = dFx(z => f.P2(z[0], z[1]), q, 1);
  const MC = [dFx(Cf, q, 0), dFx(Cf, q, 1)], Ch = hessFx(Cf, q), cross = Ch[0][1];
  const grad = [dFx(val, q, 0), dFx(val, q, 1)], H = hessFx(val, q), eH = getEigen(H);
  // is profit exactly a quadratic function? compare with its 2nd-order Taylor polynomial at q*
  const X = Math.max(1, ...res.vertices.map(v => v[0])), Y = Math.max(1, ...res.vertices.map(v => v[1]));
  const tests = [[.3 * X, .2 * Y], [.7 * X, .1 * Y], [.1 * X, .6 * Y], [.5 * X, .5 * Y], [.9 * X, .9 * Y], [0.05 * X, 0.05 * Y]];
  const taylor = z => { const d = [z[0] - q[0], z[1] - q[1]]; return pv + grad[0] * d[0] + grad[1] * d[1] + .5 * (H[0][0] * d[0] * d[0] + 2 * H[0][1] * d[0] * d[1] + H[1][1] * d[1] * d[1]); };
  const isQuad = tests.every(z => { const v = val(z); return Number.isFinite(v) && Math.abs(v - taylor(z)) <= 1e-4 * (1 + Math.abs(v)); });
  const Bq = [[-H[0][0] / 2, -H[0][1] / 2], [-H[1][0] / 2, -H[1][1] / 2]];
  const kq = [grad[0] - (H[0][0] * q[0] + H[0][1] * q[1]), grad[1] - (H[1][0] * q[0] + H[1][1] * q[1])];
  const c0 = pv - (grad[0] * q[0] + grad[1] * q[1]) + .5 * (H[0][0] * q[0] * q[0] + 2 * H[0][1] * q[0] * q[1] + H[1][1] * q[1] * q[1]);
  const M3 = [[-Bq[0][0], -Bq[0][1], kq[0] / 2], [-Bq[1][0], -Bq[1][1], kq[1] / 2], [kq[0] / 2, kq[1] / 2, c0]];
  const mu = kktMu(grad, p, q) || [NaN, NaN], used = [p.t11 * q[0] + p.t12 * q[1], p.t21 * q[0] + p.t22 * q[1]];
  const rel = x => x < -1e-6 ? 'substitutes (selling more of one lowers the other’s price)' : x > 1e-6 ? 'complements (selling more of one raises the other’s price)' : 'independent';
  $('firm-glossary').innerHTML = sym([
    ['q₁, q₂', 'units of product 1 and 2: <b>the decision</b>', `best: ${fmt(q[0], 2)}, ${fmt(q[1], 2)}`],
    ['P₁(q₁, q₂)', 'your price function for product 1', prettyFx($('fx-p1').value)],
    ['P₂(q₁, q₂)', 'your price function for product 2', prettyFx($('fx-p2').value)],
    ['C(q₁, q₂)', 'your total-cost function', prettyFx($('fx-c').value)],
    ['π(q)', 'profit = P₁q₁ + P₂q₂ − C', `best: ${fmt(pv, 2)}`],
    ['T, s', 'technology and inputs on hand: the limits T·q ≤ s (sliders and Advanced)', `T = [[${fmt(p.t11)}, ${fmt(p.t12)}], [${fmt(p.t21)}, ${fmt(p.t22)}]], s = (${fmt(p.cap1)}, ${fmt(p.cap2)})`],
    ['∇π', 'marginal profit of each product at the best plan', `(${fmt(grad[0], 3)}, ${fmt(grad[1], 3)})`],
    ['H', 'Hessian of profit (second derivatives): its curvature', `[[${fmt(H[0][0], 3)}, ${fmt(H[0][1], 3)}], [${fmt(H[1][0], 3)}, ${fmt(H[1][1], 3)}]]`],
    ['μ₁, μ₂', 'shadow prices of the two inputs', `${fmt(mu[0], 3)}, ${fmt(mu[1], 3)}`]]);
  const steps = [
    ['1. Your demand functions', `P₁ = ${prettyFx($('fx-p1').value)}\nP₂ = ${prettyFx($('fx-p2').value)}\nprices at the best plan: P₁ = ${fmt(P[0], 3)}, P₂ = ${fmt(P[1], 3)}\nown slopes: ∂P₁/∂q₁ = ${fmt(dP11, 3)}, ∂P₂/∂q₂ = ${fmt(dP22, 3)}\ncross effects: ∂P₁/∂q₂ = ${fmt(dP12, 3)}, ∂P₂/∂q₁ = ${fmt(dP21, 3)}`,
      `The products are <b>${rel((dP12 + dP21) / 2)}</b>.` + (Math.abs(dP12 - dP21) > 1e-4 ? ' The two cross effects are not equal, so the matrix of price slopes is not symmetric; only its symmetric part shapes profit.' : '')],
    ['2. Your cost function', `C = ${prettyFx($('fx-c').value)}\nmarginal costs at the best plan: MC₁ = ${fmt(MC[0], 3)}, MC₂ = ${fmt(MC[1], 3)}\ncost interaction ∂²C/∂q₁∂q₂ = ${fmt(cross, 4)}`,
      Math.abs(cross) < 1e-6 ? 'Zero: making more of one product does not change the other’s marginal cost (true for any cost that is linear in output). The products can only interact through demand and the shared inputs.' : cross < 0 ? '<b>Negative: economies of scope.</b> Making more of one product makes the other cheaper at the margin, so the products also interact through cost.' : '<b>Positive: diseconomies of scope.</b> Making more of one product raises the other’s marginal cost.'],
    ['3. Profit = P₁q₁ + P₂q₂ − C: is it a quadratic form?', isQuad ? `π = kᵀq − qᵀBq − F (a quadratic function)\nk = (${fmt(kq[0], 3)}, ${fmt(kq[1], 3)})   B = [[${fmt(Bq[0][0], 3)}, ${fmt(Bq[0][1], 3)}], [${fmt(Bq[1][0], 3)}, ${fmt(Bq[1][1], 3)}]]   F = ${fmt(-c0, 3)}\nExact quadratic form with x = (q₁, q₂, 1):  π = xᵀMx,  M =\n${mat3(M3)}` : `Not a polynomial of degree 2, so not a quadratic form.\nNear the best plan it is one (2nd-order Taylor):\nπ(q* + d) ≈ ${fmt(pv, 2)} + (${fmt(grad[0], 3)}, ${fmt(grad[1], 3)})·d + ½ dᵀHd`,
      isQuad ? 'Your profit has only constant, linear and degree-2 terms. Its curved part −qᵀBq is a quadratic form, and with the extra “1” the whole profit is one: π = xᵀMx.' : 'Your formulas create other powers (like √q or q³). Close to the best plan, every smooth profit still looks like a quadratic form: that is why the Hessian decides whether a plan is a top.'],
    ['4. Curvature: is the best plan a top?', `H = [[${fmt(H[0][0], 3)}, ${fmt(H[0][1], 3)}], [${fmt(H[1][0], 3)}, ${fmt(H[1][1], 3)}]]\ndet H = ${fmt(eH.det, 4)}   eigenvalues: ${fmt(eH.lambda[0], 3)} and ${fmt(eH.lambda[1], 3)}`,
      eH.lambda[0] < -EPS ? 'Both eigenvalues negative: H is negative definite, so profit is a <b>hill</b> here and the plan is a true (local) top.' : eH.lambda[1] > EPS ? 'Both eigenvalues positive: profit curves up (a bowl), so the best plan is pushed to a corner of the region.' : '<b>Mixed or zero signs:</b> profit is a saddle or flat here, so only the limits keep the plan in place.'],
    ['5. Best plan you can actually make', `q* = (${fmt(q[0], 3)}, ${fmt(q[1], 3)})    profit = ${fmt(pv, 3)}\ninputs used: (${fmt(used[0], 2)}, ${fmt(used[1], 2)}) of (${fmt(p.cap1)}, ${fmt(p.cap2)})\nshadow prices (exact KKT): μ₁ = ${fmt(mu[0], 3)}, μ₂ = ${fmt(mu[1], 3)}`,
      res.bind === 'Neither' ? 'No input is used up, so the shadow prices are 0.' : `${res.bind} ${res.bind.includes('&') ? 'are' : 'is'} used up: the products compete for ${res.bind.includes('&') ? 'them' : 'it'}. One more unit would add about μ to profit.`]];
  $('firm-model').innerHTML = steps.map(([t, mth, txt]) => `<div class="model-item"><h3>${t}</h3><div class="mathline">${mth}</div><p>${txt}</p></div>`).join('');
}

function renderEverything(){renderMatrix();renderGeometry();renderBusiness();}
function switchScreen(name){if(!['matrix','geometry','business','connections'].includes(name))name='matrix';document.querySelectorAll('.screen').forEach(e=>e.classList.toggle('active',e.id==='screen-'+name));document.querySelectorAll('[data-screen]').forEach(e=>{let active=e.dataset.screen===name;e.classList.toggle('active',active);if(active)e.setAttribute('aria-current','page');else e.removeAttribute('aria-current');});$('crumb').textContent={matrix:'Matrix Fundamentals',geometry:'Geometry Explorer',business:'Business Simulator',connections:'Connect the Ideas'}[name];if(location.hash!=='#'+name)history.replaceState(null,'','#'+name);$('sidebar').classList.remove('open');window.scrollTo({top:0,behavior:'instant'});if(name==='matrix')renderMatrix();if(name==='geometry')renderGeometry();if(name==='business')renderBusiness();}
function init(){wireViews();document.querySelectorAll('[data-screen]').forEach(btn=>btn.addEventListener('click',()=>switchScreen(btn.dataset.screen)));document.querySelectorAll('[data-jump]').forEach(btn=>btn.addEventListener('click',()=>switchScreen(btn.dataset.jump)));$('menuToggle').addEventListener('click',()=>$('sidebar').classList.toggle('open'));
 for(const id of ['a11','a12','a21','a22','u1','u2','v1','v2','scale','b11','b12','b21','b22'])$(id).addEventListener('input',()=>{if($('a-sym').checked){if(id==='a12')$('a21').value=$('a12').value;if(id==='a21')$('a12').value=$('a21').value;}if(['a11','a12','a21','a22'].includes(id)){const S=A();[S[0][0],S[0][1],S[1][1]].forEach((x,i)=>$(['g-a','g-b','g-d'][i]).value=Math.max(-3,Math.min(3,x)));document.querySelectorAll('[data-apreset]').forEach(x=>x.classList.remove('active'));}renderMatrix();});
 $('a-sym').addEventListener('change',()=>{if($('a-sym').checked)$('a21').value=$('a12').value;renderEverything();});
 document.querySelectorAll('[data-apreset]').forEach(btn=>btn.addEventListener('click',()=>{const [a,b,c,d]=APRESETS[btn.dataset.apreset];$('a-sym').checked=Math.abs(b-c)<1e-12;$('a11').value=a;$('a12').value=b;$('a21').value=c;$('a22').value=d;const S=A();[S[0][0],S[0][1],S[1][1]].forEach((x,i)=>$(['g-a','g-b','g-d'][i]).value=Math.max(-3,Math.min(3,x)));stageNow=null;renderEverything();document.querySelectorAll('[data-apreset]').forEach(x=>x.classList.toggle('active',x===btn));}));
 for(const [g,aid] of [['g-a','a11'],['g-b','a12'],['g-d','a22']])$(g).addEventListener('input',()=>{$(aid).value=$(g).value;if(aid==='a12'){$('a21').value=$(g).value;$('a-sym').checked=true;}renderEverything();});
 document.querySelectorAll('[data-preset]').forEach(btn=>btn.addEventListener('click',()=>setMatrix(...presets[btn.dataset.preset])));
 $('resetMatrix').addEventListener('click',()=>{swapOrder=false;stageNow=null;$('a-sym').checked=true;document.querySelectorAll('[data-apreset]').forEach(x=>x.classList.toggle('active',x.dataset.apreset==='prof'));setMatrix(1,1,2);for(const [id,value]of Object.entries({u1:1,u2:1,v1:-1,v2:2,scale:2,b11:2,b12:0,b21:1,b22:2}))$(id).value=value;renderEverything();});$('resetGeometry').addEventListener('click',()=>setMatrix(1,1,2));
 for(const id of firmIds)$('firm-'+id).addEventListener('input',renderBusiness);$('resetBusiness').addEventListener('click',()=>{for(const [id,value]of Object.entries(firmDefaults))$('firm-'+id).value=value;if(firmMode==='custom'){$('fx-p1').value=FX_DEFAULT.p1;$('fx-p2').value=FX_DEFAULT.p2;$('fx-c').value=FX_DEFAULT.c;}renderBusiness();});
 document.querySelectorAll('[data-fmode]').forEach(b=>b.addEventListener('click',()=>setFirmMode(b.dataset.fmode)));
 for(const id of ['fx-p1','fx-p2','fx-c'])$(id).addEventListener('input',()=>{if(firmMode==='custom')renderCustom();});
 document.querySelectorAll('[data-fxpreset]').forEach(b=>b.addEventListener('click',()=>{const pr=b.dataset.fxpreset==='sliders'?slidersAsFormulas():FX_PRESETS[b.dataset.fxpreset];$('fx-p1').value=pr.p1;$('fx-p2').value=pr.p2;$('fx-c').value=pr.c;renderCustom();}));
 const surface=$('surfaceCanvas');surface.addEventListener('pointerdown',event=>{camera.drag=true;camera.lastX=event.clientX;camera.lastY=event.clientY;surface.setPointerCapture(event.pointerId);});surface.addEventListener('pointermove',event=>{if(!camera.drag)return;camera.angle+=(event.clientX-camera.lastX)*.009;camera.elevation=Math.max(.15,Math.min(1.35,camera.elevation+(event.clientY-camera.lastY)*.006));camera.lastX=event.clientX;camera.lastY=event.clientY;drawSurface(A());});for(const type of ['pointerup','pointercancel'])surface.addEventListener(type,()=>camera.drag=false);
 window.addEventListener('hashchange',()=>switchScreen(location.hash.slice(1)));renderEverything();switchScreen(location.hash.slice(1)||'matrix');}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
