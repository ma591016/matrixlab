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
const A = () => {const a=elNumber('a11'),b=elNumber('a12'),d=elNumber('a22');return [[a,b],[b,d]];};
const getEigen = m => {const a=m[0][0],b=m[0][1],d=m[1][1],trace=a+d,det=a*d-b*b,delta=Math.hypot(a-d,2*b);const l1=(trace+delta)/2,l2=(trace-delta)/2;const theta=(Math.abs(a-d)<EPS&&Math.abs(b)<EPS)?0:Math.atan2(2*b,a-d)/2;const c=Math.cos(theta),s=Math.sin(theta);return {lambda:[l1,l2],vecs:[[c,s],[-s,c]],trace,det,theta,delta};};
const classify = e => {let l=e.lambda;if(l[1]>EPS)return 'Positive definite · bowl';if(l[0]<-EPS)return 'Negative definite · hill';if(l[1]<-EPS&&l[0]>EPS)return 'Indefinite · saddle';if(Math.abs(l[0])<EPS&&Math.abs(l[1])<EPS)return 'Zero matrix · flat';if(l[1]>=-EPS&&l[0]>EPS)return 'Positive semidefinite · trough';if(l[0]<=EPS&&l[1]<-EPS)return 'Negative semidefinite · inverted trough';return 'Degenerate quadratic form';};
const near = (x,y)=>Math.abs(x-y)<1e-5;
function renderMatrix(){
 const m=A(),a=m[0][0],b=m[0][1],d=m[1][1],e=getEigen(m),B=[[elNumber('b11'),elNumber('b12')],[elNumber('b21'),elNumber('b22')]];
 $('a21-mirror').textContent=fmt(b); $('matrix-class').textContent=classify(e);$('matrix-class').className=e.lambda[1]>EPS?'positive-status':'negative-status';
 const u=[elNumber('u1'),elNumber('u2')],v=[elNumber('v1'),elNumber('v2')],s=elNumber('scale');$('scale-out').textContent=fmt(s,1);
 $('vector-results').textContent=`u + v = ${vector([u[0]+v[0],u[1]+v[1]])}\nu − v = ${vector([u[0]-v[0],u[1]-v[1]])}\n${fmt(s,1)}u  = ${vector([s*u[0],s*u[1]])}`;
 const AB=mul2(m,B);$('multiply-result').textContent=`A × M =\n${mat(AB)}`;
 // v2.1: every cell, written out (row of A × column of M)
 const cell=(i,j,n)=>`${n} = row ${i+1} of A (${fmt(m[i][0])}, ${fmt(m[i][1])}) × column ${j+1} of M (${fmt(B[0][j])}, ${fmt(B[1][j])}) = ${fmt(m[i][0])}×${fmt(B[0][j])} + ${fmt(m[i][1])}×${fmt(B[1][j])} = ${fmt(AB[i][j])}`;
 $('multiply-steps').textContent=`${cell(0,0,'Top left')}\n${cell(0,1,'Top right')}\n${cell(1,0,'Bottom left')}\n${cell(1,1,'Bottom right')}\nOrder matters: M × A =\n${mat(mul2(B,m))}`;
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
  const badge = { vectors: 'u, v', au: 'A × u', am: swapOrder ? 'M × A' : 'A × M', inverse: 'A⁻¹', eigen: 'A v = λ v', spectral: 'Q Λ Qᵀ', cholesky: 'L Lᵀ' }[view];
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
  if (V.fail) { ctx.fillStyle = '#ffcd97'; ctx.font = 'bold 18px system-ui'; ctx.fillText('No Cholesky factor: A is not positive definite', 24, 34); }
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

const presets={prof:[1,1,2],circle:[1,0,1],saddle:[1,2,1],negative:[-1,0,-2],flat:[1,0,0]};
let camera={angle:.8,elevation:.7,drag:false,lastX:0,lastY:0};
function setMatrix(a,b,d){$('a11').value=a;$('a12').value=b;$('a22').value=d;[$('g-a'),$('g-b'),$('g-d')].forEach((el,i)=>{const v=[a,b,d][i];el.min=Math.min(-3,v);el.max=Math.max(3,v);el.value=v;});renderEverything();}
function renderGeometry(){const m=A(),e=getEigen(m),a=m[0][0],b=m[0][1],d=m[1][1];for(const [id,v] of [['g-a',a],['g-b',b],['g-d',d]]){$(id).min=Math.min(-3,v);$(id).max=Math.max(3,v);$(id).value=v;$(id+'-out').textContent=fmt(v,2);}const middle=b>=0?`+ ${fmt(2*b)}xy`:`− ${fmt(-2*b)}xy`;const tail=d>=0?`+ ${fmt(d)}y²`:`− ${fmt(-d)}y²`;$('quadratic-formula').textContent=`q(x,y) = ${fmt(a)}x² ${middle} ${tail} = [x y] A [x y]ᵀ`;$('geometry-status').innerHTML=`<span>det(A) = ${fmt(e.det)}</span><span>${classify(e)}</span>`;document.querySelectorAll('[data-preset]').forEach(btn=>{let vals=presets[btn.dataset.preset];btn.classList.toggle('active',vals.every((z,i)=>near(z,[a,b,d][i])));});const shape=classify(e);let msg='';if(e.lambda[1]>EPS)msg='All quadratic values are positive except at the origin. Positive-value contours form ellipses.';else if(e.lambda[0]<-EPS)msg='All quadratic values are negative except at the origin. Negative-value contours form ellipses around a hill.';else if(e.lambda[1]<-EPS&&e.lambda[0]>EPS)msg='The surface curves upward in one direction and downward in another: a saddle. Nonzero contours are hyperbolas.';else msg='At least one eigenvalue is zero. The surface has a flat direction and the contours are degenerate.';
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
const firmDefaults={a1:22,a2:20,gamma:.25,cap1:20,cap2:21,b1:.8,b2:.9,w1:2,w2:3,fixed:12,t11:1,t12:.65,t21:.45,t22:1.1};
function readFirm(){let p={};for(const id of firmIds){let v=elNumber('firm-'+id,firmDefaults[id]);if(['b1','b2','t11','t12','t21','t22'].includes(id))v=Math.max(.01,v);if(['w1','w2','fixed','cap1','cap2'].includes(id))v=Math.max(0,v);p[id]=v;}return p;}
function productionModel(p){const c1=p.w1*p.t11+p.w2*p.t21,c2=p.w1*p.t12+p.w2*p.t22,k1=p.a1-c1,k2=p.a2-c2;const B=[[p.b1,p.gamma],[p.gamma,p.b2]];const T=[[p.t11,p.t12],[p.t21,p.t22]];const value=(q)=>k1*q[0]+k2*q[1]-p.b1*q[0]**2-2*p.gamma*q[0]*q[1]-p.b2*q[1]**2-p.fixed;const constraints=[[-1,0,0],[0,-1,0],[p.t11,p.t12,p.cap1],[p.t21,p.t22,p.cap2]];const feasible=q=>constraints.every(([x,y,r])=>x*q[0]+y*q[1]<=r+1e-7);const vertices=[];for(let i=0;i<constraints.length;i++){for(let j=i+1;j<constraints.length;j++){let [a,b,r]=constraints[i],[c,d,s]=constraints[j],det=a*d-b*c;if(Math.abs(det)<EPS)continue;const q=[(r*d-b*s)/det,(a*s-r*c)/det];if(feasible(q)&&!vertices.some(z=>Math.hypot(z[0]-q[0],z[1]-q[1])<1e-6))vertices.push(q);}}const center=[vertices.reduce((s,v)=>s+v[0],0)/Math.max(vertices.length,1),vertices.reduce((s,v)=>s+v[1],0)/Math.max(vertices.length,1)];vertices.sort((v,w)=>Math.atan2(v[1]-center[1],v[0]-center[0])-Math.atan2(w[1]-center[1],w[0]-center[0]));let candidates=vertices.map(q=>({q,why:'vertex'}));for(let i=0;i<vertices.length;i++){const q0=vertices[i],q1=vertices[(i+1)%vertices.length],dx=q1[0]-q0[0],dy=q1[1]-q0[1],quadr=p.b1*dx*dx+2*p.gamma*dx*dy+p.b2*dy*dy,lin=k1*dx+k2*dy-2*(p.b1*q0[0]*dx+p.gamma*(q0[0]*dy+q0[1]*dx)+p.b2*q0[1]*dy);if(quadr>EPS){const t=Math.max(0,Math.min(1,lin/(2*quadr)));candidates.push({q:[q0[0]+dx*t,q0[1]+dy*t],why:'boundary'});}}
 const det=p.b1*p.b2-p.gamma*p.gamma;if(det>EPS){const u=[(p.b2*k1-p.gamma*k2)/(2*det),(-p.gamma*k1+p.b1*k2)/(2*det)];if(feasible(u))candidates.push({q:u,why:'interior'});}candidates.sort((x,y)=>value(y.q)-value(x.q));const best=candidates[0]??{q:[0,0],why:'origin'};const left1=p.cap1-p.t11*best.q[0]-p.t12*best.q[1],left2=p.cap2-p.t21*best.q[0]-p.t22*best.q[1];const bind=[left1<1e-5?'Input 1':null,left2<1e-5?'Input 2':null].filter(Boolean).join(' & ')||'Neither';return {p,c1,c2,k1,k2,B,T,value,vertices,best,bind,det,feasible};}
function renderBusiness(){const p=readFirm(),res=productionModel(p),q=res.best.q;for(const id of ['a1','a2','gamma','cap1','cap2']){$('firm-'+id+'-out').textContent=fmt(p[id],2);}$('firm-q1').textContent=fmt(q[0],2);$('firm-q2').textContent=fmt(q[1],2);$('firm-profit').textContent=fmt(res.value(q),2);$('firm-binding').textContent=res.bind;
 let concave=res.det>EPS?'Strictly concave (unique unconstrained peak)':'Not strictly concave (capacity still bounds the search)';const substituteValidity=res.det>EPS?'The demand coefficient matrix is positive definite, consistent with standard substitute-demand behavior.':'Warning: β₁β₂ ≤ γ², so this parameter combination is outside the standard well-behaved substitute-demand model. Lower γ or increase the own-demand slopes.';
 $('firm-model').innerHTML=`<div class="model-item"><h3>1. Two substitute products: linear inverse demand</h3><div class="mathline">P₁ = ${fmt(p.a1)} − ${fmt(p.b1)}q₁ − ${fmt(p.gamma)}q₂\nP₂ = ${fmt(p.a2)} − ${fmt(p.gamma)}q₁ − ${fmt(p.b2)}q₂</div><p>γ &gt; 0 links the products: increasing the output of one reduces the inverse-demand price of the other. For ordinary substitute demand, require β₁β₂ &gt; γ²; here the determinant is ${fmt(res.det)}. ${substituteValidity}</p></div><div class="model-item"><h3>2. Linear technology and linear total cost</h3><div class="mathline">z = Tq, with T =\n${mat(res.T)}\nC = ${fmt(p.fixed)} + ${fmt(res.c1)}q₁ + ${fmt(res.c2)}q₂</div><p>Each product uses both shared input types. Input spending is wᵀTq. Joint capacities are Tq ≤ [${fmt(p.cap1)}, ${fmt(p.cap2)}].</p></div><div class="model-item"><h3>3. Write profit as a quadratic form</h3><div class="mathline">π(q) = kᵀq − qᵀBq − F\nk = [${fmt(res.k1)}, ${fmt(res.k2)}]ᵀ\nB =\n${mat(res.B)}</div><p>The quadratic term comes from revenue: π = P₁q₁ + P₂q₂ − C. Cross-term = −${fmt(2*p.gamma)}q₁q₂.</p></div><div class="model-item"><h3>4. Solve the firm's decision problem</h3><div class="mathline">Max π(q) over q ≥ 0, Tq ≤ capacity.\nq* = [${fmt(q[0])}, ${fmt(q[1])}]\nπ* = ${fmt(res.value(q))}</div><p>${concave}. We check feasible corners, optimal positions along edges, and any feasible interior stationary point. Binding resource: ${res.bind}. Try reducing capacity.</p></div>`;
 firmExplain(res);   // v2.1: glossary + explicit derivation (replaces the 4 short steps)
 drawProfit(res);
}
function drawProfit(res){const {ctx,w,h}=canvasCtx('profitCanvas');ctx.fillStyle='#0b1725';ctx.fillRect(0,0,w,h);const vertices=res.vertices;let maxX=Math.max(3,...vertices.map(v=>v[0])),maxY=Math.max(3,...vertices.map(v=>v[1]));const pad={l:68,r:28,t:26,b:52},sx=(w-pad.l-pad.r)/(maxX*1.16),sy=(h-pad.t-pad.b)/(maxY*1.16),toXY=(x,y)=>[pad.l+sx*x,h-pad.b-sy*y];const xmin=0,xmax=(w-pad.l-pad.r)/sx,ymin=0,ymax=(h-pad.t-pad.b)/sy;
 ctx.save();ctx.strokeStyle='#22384c';ctx.lineWidth=1;ctx.fillStyle='#8ea3b7';ctx.font='14px system-ui';for(let i=0;i<=5;i++){const x=xmax*i/5,px=pad.l+sx*x;ctx.beginPath();ctx.moveTo(px,pad.t);ctx.lineTo(px,h-pad.b);ctx.stroke();ctx.fillText(fmt(x,1),px-10,h-pad.b+23);const y=ymax*i/5,py=h-pad.b-sy*y;ctx.beginPath();ctx.moveTo(pad.l,py);ctx.lineTo(w-pad.r,py);ctx.stroke();ctx.fillText(fmt(y,1),18,py+5);}ctx.strokeStyle='#889eb5';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(pad.l,pad.t);ctx.lineTo(pad.l,h-pad.b);ctx.lineTo(w-pad.r,h-pad.b);ctx.stroke();ctx.fillText('q₁ units',w-pad.r-60,h-9);ctx.fillText('q₂ units',pad.l-34,17);ctx.restore();
 if(vertices.length<3)return;const path=()=>{ctx.beginPath();vertices.forEach((v,i)=>{const [x,y]=toXY(...v);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.closePath();};ctx.save();path();ctx.clip();let minV=Infinity,maxV=-Infinity;const sample=[];for(let x=0;x<=xmax;x+=xmax/35)for(let y=0;y<=ymax;y+=ymax/35){if(res.feasible([x,y])){const v=res.value([x,y]);minV=Math.min(v,minV);maxV=Math.max(v);}}if(!Number.isFinite(minV)){minV=-10;maxV=10;}for(let px=pad.l;px<w-pad.r;px+=7)for(let py=pad.t;py<h-pad.b;py+=7){const x=(px-pad.l)/sx,y=(h-pad.b-py)/sy,v=res.value([x,y]),strength=Math.max(0,Math.min(1,(v-minV)/(maxV-minV+1e-6)));ctx.fillStyle=`rgba(${Math.floor(12+45*strength)},${Math.floor(67+105*strength)},${Math.floor(82+68*strength)},${.23+strength*.47})`;ctx.fillRect(px,py,8,8);}const peak=res.value(res.best.q);for(let j=1;j<=7;j++){let level=minV+(peak-minV)*j/8;contourPath(ctx,(x,y)=>res.value([x,y]),level,toXY,xmin,xmax,ymin,ymax,Math.max(xmax,ymax)/95,'rgba(167,232,215,.52)');}ctx.restore();path();ctx.strokeStyle='#60cab9';ctx.lineWidth=2.8;ctx.stroke();const [ox,oy]=toXY(...res.best.q);ctx.beginPath();ctx.arc(ox,oy,11,0,Math.PI*2);ctx.fillStyle='rgba(255,172,100,.25)';ctx.fill();ctx.beginPath();ctx.arc(ox,oy,5,0,Math.PI*2);ctx.fillStyle='#ffac64';ctx.fill();ctx.fillStyle='#ffcd97';ctx.font='bold 17px system-ui';ctx.fillText(`Optimal (${fmt(res.best.q[0],1)}, ${fmt(res.best.q[1],1)})`,Math.max(10,Math.min(ox+14,w-205)),Math.max(28,oy-13));}
/* =====================================================================
   v2.1 — “WHAT WE HAVE · HOW IT IS DERIVED” PANELS (tabs 02 and 03)
   Every number is read live from the sliders, so the explanation always
   matches what is on screen.
   ===================================================================== */
const card = (title, body, math) => `<div class="dv-card"><h3>${title}</h3><p>${body}</p>${math ? `<pre class="dv-math">${math}</pre>` : ''}</div>`;
const sym = rows => `<table class="dv-table"><tbody>${rows.map(([s, m, v]) => `<tr><td class="dv-sym">${s}</td><td>${m}</td><td class="dv-val">${v}</td></tr>`).join('')}</tbody></table>`;

function geometryDerivation(m, e) {
  const a = m[0][0], b = m[0][1], d = m[1][1];
  const sgn = x => x < 0 ? `− ${fmt(-x)}` : `+ ${fmt(x)}`;
  let rule;
  if (e.det > EPS && a > EPS) rule = `det > 0 and a > 0  →  positive definite: a bowl, contours are ellipses`;
  else if (e.det > EPS && a < -EPS) rule = `det > 0 and a < 0  →  negative definite: a hill, contours are ellipses`;
  else if (e.det < -EPS) rule = `det < 0  →  indefinite: a saddle, contours are hyperbolas`;
  else rule = `det = 0  →  semidefinite: a valley or ridge with a flat direction`;
  const axes = e.lambda[1] > EPS ? `On the level q = 1 the ellipse's half-axes are 1/√λ: ${fmt(1 / Math.sqrt(e.lambda[0]))} along v₁ and ${fmt(1 / Math.sqrt(e.lambda[1]))} along v₂ (bigger λ = steeper = shorter axis).` : 'With a zero or negative eigenvalue the contours are not closed ellipses.';
  $('geometry-derivation').innerHTML = '<div class="dv-grid">' +
    card('1 · What we have',
      sym([['A', 'the symmetric matrix you control with the sliders', `[[${fmt(a)}, ${fmt(b)}], [${fmt(b)}, ${fmt(d)}]]`],
           ['a', 'top-left: how steep the landscape is along x', fmt(a)],
           ['b', 'top-right = bottom-left: the cross effect between x and y', fmt(b)],
           ['d', 'bottom-right: how steep it is along y', fmt(d)],
           ['(x, y)', 'any point on the map (two choices, e.g. two quantities)', 'the grid'],
           ['q(x, y)', 'the height of the landscape at that point', 'the colour / surface']])) +
    card('2 · How the formula comes from A',
      'Multiply A by the point, then take the dot product with the point again. The two b-terms add up, which is why the cross term has a 2.',
      `A·(x, y) = (${fmt(a)}x ${sgn(b)}y,  ${fmt(b)}x ${sgn(d)}y)\n(x, y)·A·(x, y) = ax² + bxy + bxy + dy²\n               = ax² + 2bxy + dy²\nWith your numbers:  q = ${fmt(a)}x² ${sgn(2 * b)}xy ${sgn(d)}y²\nExample: q(1, 1) = ${fmt(quadratic(m, 1, 1))}    q(1, −1) = ${fmt(quadratic(m, 1, -1))}`) +
    card('3 · What the lines on the map are',
      'Each line is a <b>level set</b>: all points with the same height. The map draws q = 1, 4, 9 and 16 in teal, q = −1, −4, −9 and −16 in orange, and q = 0 in white. The dashed purple lines are the eigenvectors of A.',
      `level set at height k:   ${fmt(a)}x² ${sgn(2 * b)}xy ${sgn(d)}y² = k`) +
    card('4 · The shape test',
      'Two quick numbers decide the shape: the determinant and the top-left entry. The eigenvalues say the same thing. ' + axes,
      `det = ad − b² = ${fmt(a)}×${fmt(d)} − ${fmt(b)}² = ${fmt(e.det)}\n${rule.replace('  →  ', '\n  →  ')}\neigenvalues λ = ${fmt(e.lambda[0])} and ${fmt(e.lambda[1])}`) +
    '</div>';
}

function firmExplain(res) {
  const p = res.p, q = res.best.q;
  // Unconstrained top of the hill: set both slopes to zero, k − 2Bq = 0  →  q = ½B⁻¹k
  let top = null;
  if (res.det > EPS) top = [(p.b2 * res.k1 - p.gamma * res.k2) / (2 * res.det), (-p.gamma * res.k1 + p.b1 * res.k2) / (2 * res.det)];
  const eB = getEigen(res.B);
  // Shadow prices: re-solve with one more unit of each input and measure the profit gain
  const base = res.value(q), h = .01;
  const mu = ['cap1', 'cap2'].map(c => { const p2 = Object.assign({}, p); p2[c] += h; const r2 = productionModel(p2); return (r2.value(r2.best.q) - base) / h; });
  const P = [p.a1 - p.b1 * q[0] - p.gamma * q[1], p.a2 - p.gamma * q[0] - p.b2 * q[1]];
  const used = [p.t11 * q[0] + p.t12 * q[1], p.t21 * q[0] + p.t22 * q[1]];
  $('firm-glossary').innerHTML = sym([
    ['q₁, q₂', 'units of product 1 and 2 to make: <b>the decision</b>', `best: ${fmt(q[0], 2)}, ${fmt(q[1], 2)}`],
    ['α₁, α₂', 'demand intercepts: the price if nothing were sold (the most anyone pays)', `${fmt(p.a1)}, ${fmt(p.a2)}`],
    ['β₁, β₂', 'own-price slopes: how much a product\'s price falls per extra unit of itself', `${fmt(p.b1)}, ${fmt(p.b2)}`],
    ['γ', 'substitution: how much one product\'s price falls per extra unit of the <i>other</i>', fmt(p.gamma)],
    ['B', 'the demand matrix [[β₁, γ], [γ, β₂]]: prices are P = α − B·q', `[[${fmt(p.b1)}, ${fmt(p.gamma)}], [${fmt(p.gamma)}, ${fmt(p.b2)}]]`],
    ['T', 'technology matrix: column j = units of input 1 and input 2 needed per unit of product j', `[[${fmt(p.t11)}, ${fmt(p.t12)}], [${fmt(p.t21)}, ${fmt(p.t22)}]]`],
    ['w₁, w₂', 'price of one unit of each input', `${fmt(p.w1)}, ${fmt(p.w2)}`],
    ['c₁, c₂', 'cost per unit of each product, c = Tᵀw (its recipe × input prices)', `${fmt(res.c1)}, ${fmt(res.c2)}`],
    ['F', 'fixed cost, paid whatever is produced', fmt(p.fixed)],
    ['s₁, s₂', 'input availability: the limits T·q ≤ s', `${fmt(p.cap1)}, ${fmt(p.cap2)}`],
    ['k', 'margin at zero output, k = α − c', `${fmt(res.k1)}, ${fmt(res.k2)}`]]);
  const steps = [
    ['1. Demand: prices fall as output rises', `P₁ = ${fmt(p.a1)} − ${fmt(p.b1)}q₁ − ${fmt(p.gamma)}q₂\nP₂ = ${fmt(p.a2)} − ${fmt(p.gamma)}q₁ − ${fmt(p.b2)}q₂\nIn matrix form: P = α − B·q`,
      `γ &gt; 0 means substitutes: selling more of one product lowers the other's price. At the best plan the prices are ${fmt(P[0], 2)} and ${fmt(P[1], 2)}.`],
    ['2. Cost: linear, built from the shared inputs', `c₁ = w₁·T₁₁ + w₂·T₂₁ = ${fmt(p.w1)}×${fmt(p.t11)} + ${fmt(p.w2)}×${fmt(p.t21)} = ${fmt(res.c1)}\nc₂ = w₁·T₁₂ + w₂·T₂₂ = ${fmt(p.w1)}×${fmt(p.t12)} + ${fmt(p.w2)}×${fmt(p.t22)} = ${fmt(res.c2)}\nC(q) = ${fmt(p.fixed)} + ${fmt(res.c1)}q₁ + ${fmt(res.c2)}q₂`,
      'Each unit always costs the same (constant marginal cost). The products interact through the <b>shared input limits</b>, not through cost.'],
    ['3. Profit = revenue − cost, which becomes a quadratic form', `π = P₁q₁ + P₂q₂ − C\n  = (${fmt(p.a1)} − ${fmt(res.c1)})q₁ + (${fmt(p.a2)} − ${fmt(res.c2)})q₂ − ${fmt(p.b1)}q₁² − ${fmt(2 * p.gamma)}q₁q₂ − ${fmt(p.b2)}q₂² − ${fmt(p.fixed)}\n  = kᵀq − qᵀBq − F`,
      'Price × quantity with prices that depend on quantity creates the squared terms and the cross term 2γq₁q₂ (γ from each product).'],
    ['4. Is there a single best plan? Check B', `det B = β₁β₂ − γ² = ${fmt(p.b1)}×${fmt(p.b2)} − ${fmt(p.gamma)}² = ${fmt(res.det)}\neigenvalues of B: ${fmt(eB.lambda[0])} and ${fmt(eB.lambda[1])}`,
      res.det > EPS && p.b1 > 0 ? 'Both positive: B is positive definite, so −qᵀBq is a hill and profit has one top.' : '<b>Warning:</b> B is not positive definite (γ² ≥ β₁β₂). Profit is a saddle and has no single top; lower γ.'],
    ['5. The top of the hill (ignoring the limits)', top ? `Set both slopes to zero: k − 2B·q = 0  →  q = ½B⁻¹k = (${fmt(top[0], 2)}, ${fmt(top[1], 2)})\ninputs it would need: T·q = (${fmt(p.t11 * top[0] + p.t12 * top[1], 2)}, ${fmt(p.t21 * top[0] + p.t22 * top[1], 2)}) vs limits (${fmt(p.cap1)}, ${fmt(p.cap2)})` : 'No top exists when B is not positive definite.',
      top ? (res.feasible(top) ? 'It fits inside both limits, so it is the best plan.' : 'It needs more input than available, so the best plan sits on the edge of the shaded region.') : ''],
    ['6. Best plan you can actually make', `q* = (${fmt(q[0], 2)}, ${fmt(q[1], 2)})    profit = ${fmt(base, 2)}\ninputs used: (${fmt(used[0], 2)}, ${fmt(used[1], 2)}) of (${fmt(p.cap1)}, ${fmt(p.cap2)})\nshadow price of input 1 ≈ ${fmt(mu[0], 2)}    input 2 ≈ ${fmt(mu[1], 2)}`,
      'The shadow price is how much more profit one extra unit of that input would bring. It is 0 for an input that is not used up.']];
  $('firm-model').innerHTML = steps.map(([t, mth, txt]) => `<div class="model-item"><h3>${t}</h3><div class="mathline">${mth}</div><p>${txt}</p></div>`).join('');
}

function renderEverything(){renderMatrix();renderGeometry();renderBusiness();}
function switchScreen(name){if(!['matrix','geometry','business','connections'].includes(name))name='matrix';document.querySelectorAll('.screen').forEach(e=>e.classList.toggle('active',e.id==='screen-'+name));document.querySelectorAll('[data-screen]').forEach(e=>{let active=e.dataset.screen===name;e.classList.toggle('active',active);if(active)e.setAttribute('aria-current','page');else e.removeAttribute('aria-current');});$('crumb').textContent={matrix:'Matrix Fundamentals',geometry:'Geometry Explorer',business:'Business Simulator',connections:'Connect the Ideas'}[name];if(location.hash!=='#'+name)history.replaceState(null,'','#'+name);$('sidebar').classList.remove('open');window.scrollTo({top:0,behavior:'instant'});if(name==='matrix')renderMatrix();if(name==='geometry')renderGeometry();if(name==='business')renderBusiness();}
function init(){wireViews();document.querySelectorAll('[data-screen]').forEach(btn=>btn.addEventListener('click',()=>switchScreen(btn.dataset.screen)));document.querySelectorAll('[data-jump]').forEach(btn=>btn.addEventListener('click',()=>switchScreen(btn.dataset.jump)));$('menuToggle').addEventListener('click',()=>$('sidebar').classList.toggle('open'));
 for(const id of ['a11','a12','a22','u1','u2','v1','v2','scale','b11','b12','b21','b22'])$(id).addEventListener('input',()=>{if(['a11','a12','a22'].includes(id)){let ids=['a11','a12','a22'];let vals=ids.map(x=>elNumber(x));['g-a','g-b','g-d'].forEach((g,i)=>$(g).value=Math.max(-3,Math.min(3,vals[i])));}renderMatrix();});
 for(const [g,aid] of [['g-a','a11'],['g-b','a12'],['g-d','a22']])$(g).addEventListener('input',()=>{$(aid).value=$(g).value;renderEverything();});
 document.querySelectorAll('[data-preset]').forEach(btn=>btn.addEventListener('click',()=>setMatrix(...presets[btn.dataset.preset])));
 $('resetMatrix').addEventListener('click',()=>{swapOrder=false;stageNow=null;setMatrix(1,1,2);for(const [id,value]of Object.entries({u1:1,u2:1,v1:-1,v2:2,scale:2,b11:2,b12:0,b21:1,b22:2}))$(id).value=value;renderEverything();});$('resetGeometry').addEventListener('click',()=>setMatrix(1,1,2));
 for(const id of firmIds)$('firm-'+id).addEventListener('input',renderBusiness);$('resetBusiness').addEventListener('click',()=>{for(const [id,value]of Object.entries(firmDefaults))$('firm-'+id).value=value;renderBusiness();});
 const surface=$('surfaceCanvas');surface.addEventListener('pointerdown',event=>{camera.drag=true;camera.lastX=event.clientX;camera.lastY=event.clientY;surface.setPointerCapture(event.pointerId);});surface.addEventListener('pointermove',event=>{if(!camera.drag)return;camera.angle+=(event.clientX-camera.lastX)*.009;camera.elevation=Math.max(.15,Math.min(1.35,camera.elevation+(event.clientY-camera.lastY)*.006));camera.lastX=event.clientX;camera.lastY=event.clientY;drawSurface(A());});for(const type of ['pointerup','pointercancel'])surface.addEventListener(type,()=>camera.drag=false);
 window.addEventListener('hashchange',()=>switchScreen(location.hash.slice(1)));renderEverything();switchScreen(location.hash.slice(1)||'matrix');}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
