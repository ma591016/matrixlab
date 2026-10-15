/* =====================================================================
   cases-engine.js — Business Case Lab (tab 06): math, pictures, practice.
   ---------------------------------------------------------------------
   Reads window.MATRIXLAB_CASES (cases.js). Every case is the same course
   model with different numbers:

       demand   p = α − B·q              (Theme 2; B is symmetric)
       cost     c = linear per unit      (Theme 2: linear total cost)
       profit   π(q) = gᵀq − qᵀBq,   g = α + r − c   (a quadratic form: Theme 3)
       limit    t₁q₁ + t₂q₂ ≤ K,  q ≥ 0  (shared resource)

   The engine:
     1. calibrates B and α from one real point (q₀, p₀) and elasticities,
     2. finds the best plan EXACTLY with the KKT method (and shadow prices),
     3. draws a contour map and a rotatable 3D profit surface (like tab 2),
     4. runs a “predict first” challenge, and
     5. explains every step through a Theme 1 / 2 / 3 lens with live numbers.

   Business analogy: cases.js is the case file; this is the model a
   consultant builds from it, plus the whiteboard they explain it on.

   Sections:  1 helpers & navigation · 2 matrix math · 3 exact solver ·
              4 the case model · 5 page · 6 KPIs & theme lens ·
              7 contour map · 8 3D surface · 9 start-up
   ===================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------
     1. HELPERS & NAVIGATION
     ------------------------------------------------------------------ */
  var DATA = window.MATRIXLAB_CASES;
  var S = { view: "overview", caseId: null, P: {}, mode3d: false, challenge: false, guess: null, lens: 1, yaw: -0.75, pitch: 0.55, scen: 0, last: null };

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function findCase(id) { return DATA.cases.filter(function (c) { return c.id === id; })[0]; }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  // Format a number with a display spec {scale, dec, pre, suf, sign}.
  function fmt(x, s) {
    s = s || {};
    var v = x * (s.scale || 1), d = s.dec == null ? 2 : s.dec;
    var str = Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
    var sign = v < 0 ? "−" : (s.sign && v > 0 ? "+" : "");
    return sign + (s.pre || "") + str + (s.suf || "");
  }
  function f3(x) { return (x < 0 ? "−" : "") + Math.abs(x).toFixed(3); }
  function tag(kind) { return '<span class="cl-tag cl-' + kind + '">' + kind.toUpperCase() + "</span>"; }

  function showLab() {
    $all(".screen").forEach(function (s) { s.classList.remove("active"); });
    var scr = $("#screen-cases"); if (scr) scr.classList.add("active");
    $all(".nav-item").forEach(function (b) { b.classList.remove("active"); b.removeAttribute("aria-current"); });
    var btn = $('.nav-item[data-screen="cases"]'); if (btn) { btn.classList.add("active"); btn.setAttribute("aria-current", "page"); }
    var crumb = $("#crumb"); if (crumb) crumb.textContent = "Business Case Lab";
    var sb = $("#sidebar"); if (sb) sb.classList.remove("open", "is-open");
    toTop(); render();
  }
  function hideLab() {
    var scr = $("#screen-cases"); if (scr) scr.classList.remove("active");
    var btn = $('.nav-item[data-screen="cases"]'); if (btn) { btn.classList.remove("active"); btn.removeAttribute("aria-current"); }
  }
  function toTop() { window.scrollTo(0, 0); var m = $(".main"); if (m && m.scrollTo) m.scrollTo(0, 0); }

  // Capture phase: runs before the original script.js sees the click.
  document.addEventListener("click", function (ev) {
    var t = ev.target.closest ? ev.target.closest("[data-screen], [data-jump]") : null;
    if (!t) return;
    var dest = t.getAttribute("data-screen") || t.getAttribute("data-jump");
    if (dest === "cases") { ev.preventDefault(); ev.stopImmediatePropagation(); showLab(); }
    else hideLab();
  }, true);

  /* ------------------------------------------------------------------
     2. MATRIX MATH (2×2, written out so each step is visible)
     ------------------------------------------------------------------ */
  function inv2(M) {                          // [[a,b],[c,d]]⁻¹ = 1/(ad − bc)·[[d,−b],[−c,a]]   (Theme 1)
    var det = M[0][0] * M[1][1] - M[0][1] * M[1][0];
    return [[M[1][1] / det, -M[0][1] / det], [-M[1][0] / det, M[0][0] / det]];
  }
  function mul2(A, B) {                       // row × column   (Theme 1)
    return [[A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]],
            [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]]];
  }
  function mv(M, v) { return [M[0][0] * v[0] + M[0][1] * v[1], M[1][0] * v[0] + M[1][1] * v[1]]; }
  function dot(u, v) { return u[0] * v[0] + u[1] * v[1]; }
  function add(u, v) { return [u[0] + v[0], u[1] + v[1]]; }
  function sub(u, v) { return [u[0] - v[0], u[1] - v[1]]; }
  function eigSym2(M) {                       // λ = tr/2 ± √(tr²/4 − det); vector ∝ (b, λ − a)   (Theme 1)
    var a = M[0][0], b = M[0][1], d = M[1][1], tr = a + d, det = a * d - b * b;
    var disc = Math.sqrt(Math.max(0, tr * tr / 4 - det)), l = [tr / 2 + disc, tr / 2 - disc];
    function vec(lam) {
      var v = Math.abs(b) > 1e-14 ? [b, lam - a] : (Math.abs(lam - a) < 1e-14 ? [1, 0] : [0, 1]);
      var n = Math.hypot(v[0], v[1]); return [v[0] / n, v[1] / n];
    }
    return { values: l, vectors: [vec(l[0]), vec(l[1])], det: det, trace: tr };
  }
  function solveLin(K, r) {                   // Gaussian elimination with pivoting
    var n = r.length, A = K.map(function (row, i) { return row.slice().concat([r[i]]); }), i, j, c;
    for (c = 0; c < n; c++) {
      var p = c; for (i = c + 1; i < n; i++) if (Math.abs(A[i][c]) > Math.abs(A[p][c])) p = i;
      if (Math.abs(A[p][c]) < 1e-12) return null;
      var tmp = A[c]; A[c] = A[p]; A[p] = tmp;
      for (i = c + 1; i < n; i++) { var f = A[i][c] / A[c][c]; for (j = c; j <= n; j++) A[i][j] -= f * A[c][j]; }
    }
    var x = new Array(n);
    for (i = n - 1; i >= 0; i--) { var s = A[i][n]; for (j = i + 1; j < n; j++) s -= A[i][j] * x[j]; x[i] = s / A[i][i]; }
    return x;
  }

  /* ------------------------------------------------------------------
     3. EXACT SOLVER: maximize gᵀq − qᵀBq subject to G·q ≤ h
     ------------------------------------------------------------------
     KKT conditions: g − 2Bq = Gᵀμ, μ ≥ 0, μᵢ = 0 for slack constraints.
     In two variables at most two constraints are active, so we try every
     active set (none, one, two), keep the feasible candidates with μ ≥ 0,
     and pick the best. With B positive definite that is the global optimum.
  */
  function solveQP2(B, g, G, h) {
    var m = h.length, best = null, sets = [[]];
    for (var i = 0; i < m; i++) { sets.push([i]); for (var j = i + 1; j < m; j++) sets.push([i, j]); }
    sets.forEach(function (A) {
      var k = A.length, n = 2 + k, K = [], r = [g[0], g[1]];
      for (var a = 0; a < n; a++) K.push(new Array(n).fill(0));
      K[0][0] = 2 * B[0][0]; K[0][1] = 2 * B[0][1]; K[1][0] = 2 * B[1][0]; K[1][1] = 2 * B[1][1];
      A.forEach(function (ci, t) { K[0][2 + t] = G[ci][0]; K[1][2 + t] = G[ci][1]; K[2 + t][0] = G[ci][0]; K[2 + t][1] = G[ci][1]; r[2 + t] = h[ci]; });
      var x = solveLin(K, r); if (!x) return;
      var q = [x[0], x[1]];
      for (var c = 0; c < m; c++) if (G[c][0] * q[0] + G[c][1] * q[1] > h[c] + 1e-7 * (1 + Math.abs(h[c]))) return;
      var mu = new Array(m).fill(0);
      for (var t = 0; t < k; t++) { if (x[2 + t] < -1e-9) return; mu[A[t]] = x[2 + t]; }
      var val = dot(g, q) - dot(q, mv(B, q));
      if (!best || val > best.value + 1e-9) best = { q: q, mu: mu, value: val };
    });
    return best;
  }

  /* ------------------------------------------------------------------
     4. THE CASE MODEL
     ------------------------------------------------------------------ */
  function defaults(c) {
    var m = c.model;
    return { e1: m.e1, e2: m.e2, eta: m.eta, t1: m.t[0], t2: m.t[1], K: m.K, w: m.w || 0,
             r1: (m.r0 || [0, 0])[0], r2: (m.r0 || [0, 0])[1], shift1: 0, shift2: 0, shock1: 0, shock2: 0 };
  }

  function compute(c, P) {
    var m = c.model, q0 = m.q0, p0 = m.p0, o = { c: c, P: P };
    // (a) Elasticities → slopes of direct demand q = a − D·p   (own dᵢᵢ = εᵢqᵢ/pᵢ, cross d₁₂ = η·q₁/p₂, symmetric)
    var d11 = P.e1 * q0[0] / p0[0], d22 = P.e2 * q0[1] / p0[1], d12 = P.eta * q0[0] / p0[1];
    o.D = [[d11, -d12], [-d12, d22]];
    o.detD = d11 * d22 - d12 * d12;
    // (b) Inverse demand p = α − B·q with B = D⁻¹   (Theme 1: inverse)
    o.B = inv2(o.D); o.eig = eigSym2(o.B);
    o.pd = o.detD > 0 && d11 > 0;                                      // B positive definite ⇔ D positive definite
    // (c) The demand line passes through today's point: α = p₀ + B·q₀
    o.alpha0 = add(p0, mv(o.B, q0));
    o.t = [P.t1, P.t2]; o.r = [P.r1, P.r2];
    var r0 = m.r0 || [0, 0], shock = [P.shock1, P.shock2];
    // (d) Unit costs (linear cost, Theme 2)
    if (m.mode === "implied") {
      // Assume today is profit-maximizing: α + r₀ − c − 2Bq₀ = 0  ⇒  c = p₀ + r₀ − B·q₀
      o.c0 = add(sub(p0, mv(o.B, q0)), r0);
      o.costNote = "backed out from today's data (c = p₀ + r₀ − B·q₀)";
    } else {
      // Given: c = c_base + w × resource use per unit
      o.c0 = [m.cBase[0] + P.w * P.t1, m.cBase[1] + P.w * P.t2];
      o.costNote = "c = c_base + w·t (cost of the shared resource each unit uses)";
    }
    o.cost = add(o.c0, shock);
    // (e) Scenario: demand shifts scale the choke prices α
    o.alpha = [o.alpha0[0] * (1 + P.shift1 / 100), o.alpha0[1] * (1 + P.shift2 / 100)];
    o.g = sub(add(o.alpha, o.r), o.cost);                               // margin at zero output
    o.use0 = dot(o.t, q0);
    o.profitAt = function (q) { return dot(o.g, q) - dot(q, mv(o.B, q)); };
    o.feasible = function (q) { return q[0] >= -1e-9 && q[1] >= -1e-9 && dot(o.t, q) <= P.K + 1e-9; };
    o.todayFeasible = o.feasible(q0);
    o.todayProfit = o.profitAt(q0);
    if (!o.pd) { o.ok = false; return o; }
    // (f) Exact optimum with the shared constraint and q ≥ 0
    var sol = solveQP2(o.B, o.g, [o.t, [-1, 0], [0, -1]], [P.K, 0, 0]);
    if (!sol) { o.ok = false; return o; }
    o.ok = true; o.q = sol.q; o.mu = sol.mu[0]; o.binds = o.mu > 1e-9;
    o.p = sub(o.alpha, mv(o.B, o.q));
    o.profit = sol.value;
    o.useOpt = dot(o.t, o.q);
    o.qu = mv(inv2(o.B), [o.g[0] / 2, o.g[1] / 2]);                     // unconstrained top ½B⁻¹g: centre of the ellipses
    o.profitU = o.profitAt(o.qu);
    o.perRes = [(o.p[0] + o.r[0] - o.cost[0]) / o.t[0], (o.p[1] + o.r[1] - o.cost[1]) / o.t[1]];
    o.mp = sub(o.g, mv(o.B, [2 * o.q[0], 2 * o.q[1]]));                 // marginal profit g − 2Bq at the optimum
    return o;
  }

  /* ------------------------------------------------------------------
     5. PAGE
     ------------------------------------------------------------------ */
  function render() {
    var root = $("#cases-root"); if (!root || !DATA) return;
    if (S.view === "case") { renderCase(root); return; }
    var cards = DATA.cases.map(function (c) {
      return '<button type="button" class="panel cl-card" data-case="' + c.id + '">' +
        '<span class="cl-industry">' + c.industry + "</span>" +
        "<h3>" + c.company + "</h3><p>" + c.title + "</p>" +
        '<span class="cl-go">' + c.display.names[0] + " vs " + c.display.names[1] + " · " + c.display.resource.name + " →</span></button>";
    }).join("");
    root.innerHTML =
      '<div class="panel cl-intro"><h3>One model, five industries</h3>' +
      "<p>Every case is the course model from Theme 2 with real company numbers: two products that compete for the same customers " +
      "(<b>p = α − Bq</b>), a linear cost, one shared resource (<b>t₁q₁ + t₂q₂ ≤ K</b>), and profit as a quadratic form (<b>π = gᵀq − qᵀBq</b>). " +
      "Change the assumptions, predict the best plan, then see the geometry: contour ellipses tilted along the eigenvectors of B, a 3D profit hill, and the shadow price of the bottleneck.</p>" +
      '<p class="cl-legend">' + tag("fact") + " public data with a source · " + tag("assumption") + " a choice you can change · " + tag("model") + " computed from both. These are teaching models, not forecasts or advice.</p></div>" +
      '<div class="cl-grid">' + cards + "</div>";
    $all("[data-case]", root).forEach(function (b) { b.addEventListener("click", function () { openCase(b.getAttribute("data-case")); }); });
  }

  function openCase(id) {
    var c = findCase(id); if (!c) return;
    S.view = "case"; S.caseId = id; S.P = defaults(c); S.guess = null; S.challenge = false; S.scen = 0;
    render(); toTop();
  }

  function renderCase(root) {
    var c = findCase(S.caseId), d = c.display;
    var facts = c.facts.map(function (f) {
      return "<tr><td>" + tag("fact") + "</td><td><b>" + f.label + "</b><br>" + f.value + '<br><small class="muted">' + f.note + "</small></td><td>" +
        (f.url ? '<a href="' + f.url + '" target="_blank" rel="noopener">' + f.source + " ↗</a>" : f.source) + "</td></tr>";
    }).join("");
    var notes = (d.assumptionNotes || []).map(function (n) { return "<li>" + tag("assumption") + " " + n + "</li>"; }).join("");
    var sliders = c.sliders.map(function (s) {
      return '<label class="cl-slider"><span>' + s.label + ' <output data-out="' + s.key + '"></output></span>' +
        '<input type="range" data-key="' + s.key + '" min="' + s.min + '" max="' + s.max + '" step="' + s.step + '" value="' + S.P[s.key] + '">' +
        (s.tip ? '<small class="muted">' + s.tip + "</small>" : "") + "</label>";
    }).join("");
    var scen = c.scenarios.map(function (s, i) {
      return '<button type="button" class="cl-scen' + (i === S.scen ? " on" : "") + '" data-scen="' + i + '"><b>' + s.label + "</b><small>" + s.note + "</small></button>";
    }).join("");
    var lessons = (window.MatrixLabGuide ? c.lessons || [] : []).map(function (l) {
      return '<button type="button" class="pill-btn" data-lesson="' + l.module + "|" + l.concept + '">' + l.label + " →</button>";
    }).join("");

    root.innerHTML =
      '<div class="cl-top"><button type="button" class="text-btn" data-back>← All cases</button>' +
      '<div class="cl-tabs" role="tablist">' + DATA.cases.map(function (x) {
        return '<button type="button" class="' + (x.id === c.id ? "on" : "") + '" data-switch="' + x.id + '">' + x.company + "</button>";
      }).join("") + "</div></div>" +
      '<div class="cl-head"><span class="section-tag">' + c.industry.toUpperCase() + " · " + c.company.toUpperCase() + "</span><h2>" + c.title + '</h2><p class="lead">' + c.question + "</p></div>" +
      '<details class="panel cl-data" open><summary><b>The real data and the assumptions</b></summary>' +
        '<div class="cl-table-wrap"><table class="cl-table"><tbody>' + facts + "</tbody></table></div>" +
        '<ul class="cl-notes">' + notes + "</ul></details>" +
      '<div class="cl-lab">' +
        '<section class="panel cl-controls"><h3>Scenarios</h3><div class="cl-scens">' + scen + "</div>" +
          "<h3>Your assumptions</h3>" + sliders +
          '<button type="button" class="text-btn" data-reset>↺ Reset assumptions</button></section>' +
        '<section class="panel cl-visual">' +
          '<div class="cl-vtop"><div class="cl-seg" role="tablist"><button type="button" data-v="2d" class="' + (S.mode3d ? "" : "on") + '">Contour map</button><button type="button" data-v="3d" class="' + (S.mode3d ? "on" : "") + '">3D profit hill</button></div>' +
          '<button type="button" class="cl-chal' + (S.challenge ? " on" : "") + '" data-chal>' + (S.challenge ? "Reveal the answer" : "🎯 Predict first") + "</button></div>" +
          '<canvas id="cl-canvas" class="cl-canvas" aria-label="Profit map for this case"></canvas>' +
          '<div id="cl-hint" class="cl-hint"></div><div id="cl-legend" class="cl-legendrow"></div><div id="cl-warn"></div>' +
        "</section>" +
      "</div>" +
      '<div id="cl-kpis" class="cl-kpis"></div>' +
      '<section class="panel cl-lens"><div class="cl-lens-top"><h3>See it through the three themes</h3><div class="cl-seg">' +
        [1, 2, 3].map(function (n) { return '<button type="button" data-lens="' + n + '" class="' + (S.lens === n ? "on" : "") + '">Theme ' + n + "</button>"; }).join("") +
        '</div></div><div id="cl-lens-body"></div>' +
        (lessons ? '<div class="cl-lessons"><span class="muted small">Review in the Study Guide:</span> ' + lessons + "</div>" : "") + "</section>" +
      '<section class="panel"><h3>What the default scenarios show</h3><ul class="cl-list">' + c.takeaways.map(function (t) { return "<li>" + t + "</li>"; }).join("") + "</ul>" +
        '<h3>What this model cannot tell you</h3><ul class="cl-list">' + c.limits.map(function (t) { return "<li>" + t + "</li>"; }).join("") + "</ul></section>";

    // ----- wiring -----
    $("[data-back]", root).addEventListener("click", function () { S.view = "overview"; render(); toTop(); });
    $all("[data-switch]", root).forEach(function (b) { b.addEventListener("click", function () { openCase(b.getAttribute("data-switch")); }); });
    $all("input[data-key]", root).forEach(function (inp) {
      inp.addEventListener("input", function () { S.P[inp.getAttribute("data-key")] = Number(inp.value); S.scen = -1; markScen(); update(); });
    });
    $all("[data-scen]", root).forEach(function (b) {
      b.addEventListener("click", function () {
        var s = c.scenarios[Number(b.getAttribute("data-scen"))];
        S.P = defaults(c); Object.keys(s.set).forEach(function (k) { S.P[k] = s.set[k]; });
        S.scen = Number(b.getAttribute("data-scen")); S.guess = null;
        syncSliders(); markScen(); update();
      });
    });
    $("[data-reset]", root).addEventListener("click", function () { S.P = defaults(c); S.scen = 0; S.guess = null; syncSliders(); markScen(); update(); });
    $all("[data-v]", root).forEach(function (b) {
      b.addEventListener("click", function () {
        S.mode3d = b.getAttribute("data-v") === "3d";
        $all("[data-v]", root).forEach(function (x) { x.classList.toggle("on", x === b); }); update();
      });
    });
    $("[data-chal]", root).addEventListener("click", function () {
      S.challenge = !S.challenge; if (S.challenge) { S.guess = null; S.mode3d = false; $all("[data-v]", root).forEach(function (x) { x.classList.toggle("on", x.getAttribute("data-v") === "2d"); }); }
      var b = $("[data-chal]", root); b.classList.toggle("on", S.challenge); b.textContent = S.challenge ? "Reveal the answer" : "🎯 Predict first";
      update();
    });
    $all("[data-lens]", root).forEach(function (b) {
      b.addEventListener("click", function () { S.lens = Number(b.getAttribute("data-lens")); $all("[data-lens]", root).forEach(function (x) { x.classList.toggle("on", x === b); }); update(); });
    });
    $all("[data-lesson]", root).forEach(function (b) {
      b.addEventListener("click", function () { var p = b.getAttribute("data-lesson").split("|"); if (window.MatrixLabGuide) window.MatrixLabGuide.open(p[0], p[1]); });
    });
    wireCanvas();
    update();
  }

  function syncSliders() { $all("input[data-key]").forEach(function (inp) { inp.value = S.P[inp.getAttribute("data-key")]; }); }
  function markScen() { $all("[data-scen]").forEach(function (b) { b.classList.toggle("on", Number(b.getAttribute("data-scen")) === S.scen); }); }

  function update() {
    var c = findCase(S.caseId); if (!c) return;
    c.sliders.forEach(function (s) { var o = $('[data-out="' + s.key + '"]'); if (o) o.textContent = fmt(S.P[s.key], s.fmt); });
    var o = compute(c, S.P); S.last = o;
    renderKPIs(o); renderLens(o); renderWarn(o);
    if (S.mode3d) drawSurface(o); else drawContour(o);
  }

  /* ------------------------------------------------------------------
     6. KPIs AND THE THEME LENS
     ------------------------------------------------------------------ */
  function kpi(label, value, sub, kind) {
    return '<div class="panel cl-kpi">' + tag(kind || "model") + "<span>" + label + "</span><strong>" + value + "</strong><small>" + (sub || "") + "</small></div>";
  }
  // Big number with its unit in small type, e.g. "$0.91" + " per extra M tokens of compute"
  function big(x, s) { var t = clone(s || {}), u = t.suf || ""; t.suf = ""; return fmt(x, t) + (u ? '<em>' + u + "</em>" : ""); }

  function renderWarn(o) {
    var w = $("#cl-warn"), d = o.c.display, html = "";
    if (!o.pd) {
      html = '<div class="cl-alert"><b>B is not positive definite</b>: its eigenvalues are ' + f3(o.eig.values[0]) + " and " + f3(o.eig.values[1]) +
        ". One is negative or zero, so profit is a <b>saddle</b>, not a hill, and there is no single best plan. This happens when substitution is stronger than the own-price effects (det D = " + f3(o.detD) + " ≤ 0). The 3D view shows the saddle.</div>";
    } else if (o.use0 > o.P.K + 1e-9) {
      html = '<div class="cl-note">At today\'s prices, demand needs ' + fmt(o.use0, { dec: 0 }) + " " + d.resource.unit + " of " + d.resource.name +
        ", but only " + fmt(o.P.K, { dec: 0 }) + " are available: <b>demand exceeds supply</b>. The model rations with price.</div>";
    }
    w.innerHTML = html;
  }

  function renderKPIs(o) {
    var el = $("#cl-kpis"), d = o.c.display, n = d.names, q0 = o.c.model.q0, p0 = o.c.model.p0;
    if (!o.ok) { el.innerHTML = kpi("Best plan", "None", "profit has no maximum when B is not positive definite"); return; }
    var hide = S.challenge, pn = d.pnames || [n[0] + " price", n[1] + " price"];
    function chg(x, s) { var t = clone(s); t.sign = true; t.suf = (t.suf || ""); return fmt(x, t) + " vs today"; }
    el.innerHTML =
      kpi(n[0], hide ? "?" : big(o.q[0], d.q[0]), hide ? "make your guess on the map" : chg(o.q[0] - q0[0], d.q[0])) +
      kpi(n[1], hide ? "?" : big(o.q[1], d.q[1]), hide ? "" : chg(o.q[1] - q0[1], d.q[1])) +
      kpi(pn[0], hide ? "?" : big(o.p[0], d.p[0]), hide ? "" : chg(o.p[0] - p0[0], d.p[0])) +
      kpi(pn[1], hide ? "?" : big(o.p[1], d.p[1]), hide ? "" : chg(o.p[1] - p0[1], d.p[1])) +
      kpi("Best profit", hide ? "?" : big(o.profit, d.profit), o.todayFeasible ? "keeping today's plan: " + fmt(o.todayProfit, d.profit) : "today's plan doesn't fit the " + d.resource.name + " limit") +
      kpi("Shadow price of " + d.resource.name, hide ? "?" : (o.binds ? big(o.mu, d.mu) : "$0"), hide ? "" : (o.binds ? "the limit binds: " + fmt(o.useOpt, { dec: 0 }) + " of " + fmt(o.P.K, { dec: 0 }) + " " + d.resource.unit + " used" : "not binding: " + fmt(o.useOpt, { dec: 0 }) + " of " + fmt(o.P.K, { dec: 0 }) + " used"));
  }

  function renderLens(o) {
    var el = $("#cl-lens-body"), d = o.c.display, n = d.names, P = o.P;
    function m2(M, f) { f = f || f3; return "[[" + f(M[0][0]) + ", " + f(M[0][1]) + "], [" + f(M[1][0]) + ", " + f(M[1][1]) + "]]"; }
    function v2(v, f) { f = f || f3; return "(" + f(v[0]) + ", " + f(v[1]) + ")"; }
    function g4(x) { return Math.abs(x) >= 1000 || (Math.abs(x) < 0.01 && x !== 0) ? x.toExponential(3).replace("e", "×10^") : f3(x); }
    var ev = o.eig, html = "";
    if (S.lens === 1) {
      var I = mul2(o.D, o.B);
      html =
        lensStep("Demand slopes as a matrix", "Elasticities become the matrix D in q = a − D·p: the diagonal is how each product's sales react to its own price, the off-diagonal is substitution.", "D = " + m2(o.D, g4)) +
        lensStep("Invert it to get B", "The firm chooses quantities, so we need prices as a function of quantities: p = α − B·q with B = D⁻¹. Check: D·B should be the identity.", "B = D⁻¹ = " + m2(o.B, g4) + "\nD·B = " + m2(I, function (x) { return (Math.abs(x) < 5e-10 ? 0 : x).toFixed(3); })) +
        lensStep("Eigenvalues and eigenvectors of B", "B is symmetric, so it has two real eigenvalues and perpendicular eigenvectors. They give the directions in which prices react most and least to output.",
          "λ₁ = " + g4(ev.values[0]) + ",  u₁ = " + v2(ev.vectors[0]) + "\nλ₂ = " + g4(ev.values[1]) + ",  u₂ = " + v2(ev.vectors[1]) + "\ncheck: λ₁ + λ₂ = trace = " + g4(ev.trace) + ",  λ₁λ₂ = det = " + g4(ev.det));
    } else if (S.lens === 2) {
      html =
        lensStep("Demand and cost", "Inverse demand passes through today's point; scenario shifts move the choke prices α. Unit costs are " + o.costNote + ".",
          "α = " + v2(o.alpha, g4) + "   r (extra revenue) = " + v2(o.r, g4) + "\nc = " + v2(o.cost, g4) + "   g = α + r − c = " + v2(o.g, g4)) +
        lensStep("Profit is a quadratic form", "Revenue is price × quantity with prices falling in quantity, so profit has squared and cross terms.", "π(q) = gᵀq − qᵀBq     (fixed costs left out)");
      if (o.ok) {
        html += lensStep("Best plan with the " + d.resource.name + " limit", (o.binds ? "The limit binds. KKT: g − 2Bq = μ·t, so the marginal profit per unit of resource is the same for both products and equals the shadow price μ." :
            "The limit does not bind, so the best plan is the top of the hill: q* = ½B⁻¹g."),
          "q* = " + v2(o.q, g4) + "    p* = α − Bq* = " + v2(o.p, g4) +
          "\nresource used t·q* = " + fmt(o.useOpt, { dec: 1 }) + " of K = " + fmt(P.K, { dec: 1 }) +
          (o.binds ? "\nmarginal profit per unit of resource: " + g4(o.mp[0] / o.t[0]) + " and " + g4(o.mp[1] / o.t[1]) + "  = μ = " + g4(o.mu) : "")) +
          lensStep("Margin per unit of " + d.resource.name, "When the resource is scarce, compare products by what they earn per unit of it, not per unit sold.",
            n[0] + ": " + fmt(o.perRes[0], d.perResource) + "\n" + n[1] + ": " + fmt(o.perRes[1], d.perResource));
      }
    } else {
      html =
        lensStep("Is profit a hill?", "The curvature of π is −qᵀBq. Profit has a single top exactly when B is positive definite: both eigenvalues > 0 (for 2×2: det B > 0 and B₁₁ > 0).",
          "det B = " + g4(ev.det) + ",  B₁₁ = " + g4(o.B[0][0]) + "  →  " + (o.pd ? "positive definite ✓ (profit is a hill)" : "NOT positive definite ✗ (profit is a saddle)")) +
        lensStep("Level sets are tilted ellipses", "Iso-profit curves satisfy (q − q_top)ᵀB(q − q_top) = constant. Their axes point along the eigenvectors of B (dashed lines on the map). The longer axis lies along u₂, the eigenvector with the <b>smaller</b> eigenvalue, because that is the direction where profit falls slowest.",
          "axis ratio √(λ₁/λ₂) = " + (o.pd ? Math.sqrt(ev.values[0] / ev.values[1]).toFixed(2) : "—") + "   (1 = circles; bigger = more stretched)") +
        lensStep("The constraint on the map", "The shaded region is everything the " + d.resource.name + " allows. If the hill's top is outside it, the best plan is where the boundary line just touches the highest ellipse.",
          "boundary: " + g4(o.t[0]) + "·q₁ + " + g4(o.t[1]) + "·q₂ = " + g4(P.K));
    }
    el.innerHTML = html;
  }
  function lensStep(title, body, math) {
    return '<div class="cl-step"><h4>' + title + "</h4><p>" + body + '</p><pre class="cl-math">' + math + "</pre></div>";
  }

  /* ------------------------------------------------------------------
     7. CONTOUR MAP (top-down view, like tab 2's level sets)
     ------------------------------------------------------------------ */
  var COL = { teal: "#14b8a6", orange: "#f97316", violet: "#8b5cf6", grey: "#94a3b8", pink: "#ec4899" };

  function canvasSetup() {
    var cv = $("#cl-canvas"); if (!cv) return null;
    var dpr = window.devicePixelRatio || 1, w = cv.clientWidth || 640, h = Math.round(Math.min(w * 0.72, 560));
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); cv.style.height = h + "px";
    var ctx = cv.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
    return { cv: cv, ctx: ctx, w: w, h: h, ink: getComputedStyle(cv).color || "#888" };
  }

  function viewRange(o) {
    var q0 = o.c.model.q0, xs = [q0[0]], ys = [q0[1]];
    if (o.ok) { xs.push(o.q[0], o.qu[0]); ys.push(o.q[1], o.qu[1]); }
    xs.push(o.P.K / o.t[0]); ys.push(o.P.K / o.t[1]);
    var X = Math.max.apply(null, xs.map(function (x) { return isFinite(x) ? x : 0; })) * 1.15;
    var Y = Math.max.apply(null, ys.map(function (x) { return isFinite(x) ? x : 0; })) * 1.15;
    X = Math.min(X, q0[0] * 3); Y = Math.min(Y, q0[1] * 3);
    return [niceMax(X), niceMax(Y)];
  }
  function niceMax(v) { var p = Math.pow(10, Math.floor(Math.log10(v))), m = v / p; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p; }
  function tick(v) { return Math.abs(v) >= 1000 ? (v / 1000).toLocaleString("en-US", { maximumFractionDigits: 1 }) + "k" : v.toLocaleString("en-US", { maximumFractionDigits: 1 }); }

  var MAP = null;   // remembers the last 2D mapping for clicks

  function drawContour(o) {
    var C = canvasSetup(); if (!C) return;
    var ctx = C.ctx, d = o.c.display, R = viewRange(o);
    var box = { l: 56, r: C.w - 12, t: 12, b: C.h - 46 };
    function X(x) { return box.l + x / R[0] * (box.r - box.l); }
    function Y(y) { return box.b - y / R[1] * (box.b - box.t); }
    MAP = { box: box, R: R, X: X, Y: Y };

    // Heat shading: brighter = more profit (computed cell by cell)
    var cell = 6, zs = [], zmax = -Infinity, zmin = Infinity, i, j;
    for (i = box.l; i < box.r; i += cell) for (j = box.t; j < box.b; j += cell) {
      var q = [(i + cell / 2 - box.l) / (box.r - box.l) * R[0], (box.b - j - cell / 2) / (box.b - box.t) * R[1]];
      var z = o.profitAt(q); zs.push([i, j, z, o.feasible(q)]); if (z > zmax) zmax = z; if (z < zmin) zmin = z;
    }
    zs.forEach(function (s) {
      var a = Math.max(0, (s[2] - Math.max(zmin, 0)) / (zmax - Math.max(zmin, 0) || 1));
      ctx.fillStyle = s[3] ? "rgba(20,184,166," + (0.06 + 0.42 * a * a).toFixed(3) + ")" : "rgba(148,163,184," + (0.04 + 0.12 * a).toFixed(3) + ")";
      ctx.fillRect(s[0], s[1], cell + 0.5, cell + 0.5);
    });

    // Grid and axis labels
    ctx.strokeStyle = C.ink; ctx.fillStyle = C.ink; ctx.font = "12px system-ui, sans-serif";
    for (i = 0; i <= 5; i++) {
      var xv = R[0] * i / 5, yv = R[1] * i / 5;
      ctx.globalAlpha = 0.1; ctx.beginPath(); ctx.moveTo(X(xv), box.t); ctx.lineTo(X(xv), box.b); ctx.moveTo(box.l, Y(yv)); ctx.lineTo(box.r, Y(yv)); ctx.stroke();
      ctx.globalAlpha = 0.75; ctx.textAlign = "center"; ctx.fillText(tick(xv), X(xv), box.b + 16); ctx.textAlign = "right"; ctx.fillText(tick(yv), box.l - 6, Y(yv) + 4);
    }
    ctx.globalAlpha = 0.9; ctx.textAlign = "center"; ctx.fillText(d.axis[0], (box.l + box.r) / 2, box.b + 36);
    ctx.save(); ctx.translate(13, (box.t + box.b) / 2); ctx.rotate(-Math.PI / 2); ctx.fillText(d.axis[1], 0, 0); ctx.restore(); ctx.globalAlpha = 1;

    ctx.save(); ctx.beginPath(); ctx.rect(box.l, box.t, box.r - box.l, box.b - box.t); ctx.clip();
    // Constraint line t₁q₁ + t₂q₂ = K
    ctx.strokeStyle = COL.teal; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(o.P.K / o.t[0]), Y(0)); ctx.lineTo(X(0), Y(o.P.K / o.t[1])); ctx.stroke();

    if (o.pd) {
      // Iso-profit ellipses: q = q_top + √k·(cosθ·u₁/√λ₁ + sinθ·u₂/√λ₂)   (Themes 1 & 3)
      var qc = o.ok ? o.qu : o.c.model.q0, l = o.eig.values, u = o.eig.vectors;
      // Spread the levels so they fill the map: kMax = the largest (q − q_top)ᵀB(q − q_top) over the corners
      var kMax = 0;
      [[0, 0], [R[0], 0], [0, R[1]], [R[0], R[1]]].forEach(function (cq) { var dv = sub(cq, qc); kMax = Math.max(kMax, dot(dv, mv(o.B, dv))); });
      [0.03, 0.09, 0.18, 0.3, 0.46, 0.66].forEach(function (f, k) {
        var kk = kMax * f * f;
        ctx.strokeStyle = C.ink; ctx.globalAlpha = 0.55 - k * 0.06; ctx.lineWidth = 1.2; ctx.beginPath();
        for (var s = 0; s <= 140; s++) {
          var th = s / 140 * 2 * Math.PI, a1 = Math.cos(th) * Math.sqrt(kk / l[0]), a2 = Math.sin(th) * Math.sqrt(kk / l[1]);
          var x = qc[0] + a1 * u[0][0] + a2 * u[1][0], y = qc[1] + a1 * u[0][1] + a2 * u[1][1];
          if (s) ctx.lineTo(X(x), Y(y)); else ctx.moveTo(X(x), Y(y));
        }
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
      // Principal axes = eigenvectors of B
      ctx.setLineDash([6, 6]); ctx.strokeStyle = COL.violet; ctx.lineWidth = 1.3;
      u.forEach(function (v) { var big = 4 * Math.max(R[0], R[1]); ctx.beginPath(); ctx.moveTo(X(qc[0] - big * v[0]), Y(qc[1] - big * v[1])); ctx.lineTo(X(qc[0] + big * v[0]), Y(qc[1] + big * v[1])); ctx.stroke(); });
      ctx.setLineDash([]);
    }
    ctx.restore();

    // Points: today, guess, best
    var q0 = o.c.model.q0;
    ring(ctx, X(q0[0]), Y(q0[1]), 7, COL.grey); label(ctx, "today", X(q0[0]) - 10, Y(q0[1]) + 18, C.ink, "right");
    if (S.guess) { cross(ctx, X(S.guess[0]), Y(S.guess[1]), COL.pink); label(ctx, "your guess", X(S.guess[0]) + 10, Y(S.guess[1]) + 16, COL.pink, "left"); }
    if (o.ok && !S.challenge) {
      if (o.binds) {
        ring(ctx, X(o.qu[0]), Y(o.qu[1]), 4, COL.violet);
        var gap = Math.hypot(X(o.qu[0]) - X(o.q[0]), Y(o.qu[1]) - Y(o.q[1]));
        if (gap > 70) label(ctx, "top of the hill (not allowed)", X(o.qu[0]) + 8, Y(o.qu[1]) - 8, COL.violet, "left");
      }
      dotFill(ctx, X(o.q[0]), Y(o.q[1]), 6, COL.orange); label(ctx, "best plan", X(o.q[0]) + 10, Y(o.q[1]) - 8, COL.orange, "left");
    }
    legend2d(o); hint(o);
  }

  function ring(ctx, x, y, r, col) { ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.stroke(); }
  function dotFill(ctx, x, y, r, col) { ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); ctx.fillStyle = col; ctx.fill(); }
  function cross(ctx, x, y, col) { ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 7, y - 7); ctx.lineTo(x + 7, y + 7); ctx.moveTo(x + 7, y - 7); ctx.lineTo(x - 7, y + 7); ctx.stroke(); }
  function label(ctx, t, x, y, col, align) { ctx.font = "600 12px system-ui, sans-serif"; ctx.fillStyle = col; ctx.textAlign = align || "left"; ctx.fillText(t, x, y); }

  function legend2d(o) {
    $("#cl-legend").innerHTML =
      '<span><i style="background:' + COL.teal + '"></i>allowed by the ' + o.c.display.resource.name + " limit</span>" +
      '<span><i style="background:' + COL.grey + '"></i>today</span>' +
      (S.challenge ? '<span><i style="background:' + COL.pink + '"></i>your guess</span>' : '<span><i style="background:' + COL.orange + '"></i>best plan</span>') +
      '<span><i class="dash"></i>eigenvectors of B (ellipse axes)</span>' +
      (o.ok && o.binds && !S.challenge ? '<span><i style="background:transparent;border:2px solid ' + COL.violet + '"></i>top of the hill (outside the limit)</span>' : "");
  }

  function hint(o) {
    var h = $("#cl-hint"), d = o.c.display;
    if (!S.challenge) { h.innerHTML = S.mode3d ? "Drag to rotate the profit hill." : ""; return; }
    if (!S.guess) { h.innerHTML = "<b>Challenge:</b> click on the map where you think profit is highest, inside the shaded region. Then press “Reveal the answer”."; return; }
    var g = S.guess, ok = o.feasible(g), pg = o.profitAt(g);
    if (!o.ok) { h.innerHTML = "There is no best plan for this matrix. Look at the 3D view."; return; }
    var pct = pg / o.profit * 100;
    h.innerHTML = "<b>Your guess:</b> " + fmt(g[0], d.q[0]) + " and " + fmt(g[1], d.q[1]) + " → " +
      (ok ? "profit " + fmt(pg, d.profit) + ", <b>" + pct.toFixed(1) + "%</b> of the best possible. " + (pct > 99 ? "Excellent!" : pct > 95 ? "Very close." : "Look at which ellipse you landed on.")
          : "<b>not allowed</b>: it needs more " + d.resource.name + " than available (or a negative quantity).");
  }

  /* ------------------------------------------------------------------
     8. 3D PROFIT SURFACE (drag to rotate)
     ------------------------------------------------------------------ */
  function drawSurface(o) {
    var C = canvasSetup(); if (!C) return;
    MAP = null;
    var ctx = C.ctx, R = viewRange(o), N = 30, i, j;
    var z = [], zmin = Infinity, zmax = -Infinity;
    for (i = 0; i <= N; i++) { z.push([]); for (j = 0; j <= N; j++) { var v = o.profitAt([R[0] * i / N, R[1] * j / N]); z[i].push(v); if (v < zmin) zmin = v; if (v > zmax) zmax = v; } }
    var floor = o.pd ? Math.max(zmin, zmax - (zmax - zmin) * 0.9) : zmin;
    var cy = Math.cos(S.yaw), sy = Math.sin(S.yaw), cp = Math.cos(S.pitch), sp = Math.sin(S.pitch);
    var scale = Math.min(C.w, C.h) * 0.36, ox = C.w / 2, oy = C.h * 0.62;
    // Project a point (x, y in [−1, 1]; height h in [0, 1]) to the screen
    function proj(x, y, hgt) {
      var x1 = x * cy - y * sy, y1 = x * sy + y * cy, H = hgt * 1.1;
      return { sx: ox + scale * x1, sy: oy - scale * (H * cp + y1 * sp), depth: y1 * cp - H * sp };
    }
    function P3(qx, qy, val) { return proj(qx / R[0] * 2 - 1, qy / R[1] * 2 - 1, Math.max(0, (val - floor) / (zmax - floor || 1))); }
    var quads = [];
    for (i = 0; i < N; i++) for (j = 0; j < N; j++) {
      var pts = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]].map(function (ij) { return P3(R[0] * ij[0] / N, R[1] * ij[1] / N, z[ij[0]][ij[1]]); });
      var mid = [R[0] * (i + 0.5) / N, R[1] * (j + 0.5) / N], hv = (z[i][j] + z[i + 1][j + 1]) / 2;
      quads.push({ pts: pts, depth: (pts[0].depth + pts[2].depth) / 2, h: Math.max(0, (hv - floor) / (zmax - floor || 1)), ok: o.feasible(mid) });
    }
    quads.sort(function (a, b) { return b.depth - a.depth; });
    quads.forEach(function (q) {
      ctx.beginPath(); ctx.moveTo(q.pts[0].sx, q.pts[0].sy); for (var k = 1; k < 4; k++) ctx.lineTo(q.pts[k].sx, q.pts[k].sy); ctx.closePath();
      ctx.fillStyle = q.ok ? "rgba(" + Math.round(20 + 200 * q.h) + "," + Math.round(120 + 64 * q.h) + "," + Math.round(166 - 120 * q.h) + ",0.88)" : "rgba(120,130,150," + (0.35 + 0.3 * q.h).toFixed(2) + ")";
      ctx.fill(); ctx.strokeStyle = "rgba(0,0,0,0.18)"; ctx.lineWidth = 0.6; ctx.stroke();
    });
    // Constraint boundary drawn on the surface
    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2; ctx.beginPath();
    for (i = 0; i <= 60; i++) {
      var qx = (o.P.K / o.t[0]) * i / 60, qy = (o.P.K - o.t[0] * qx) / o.t[1];
      if (qx > R[0] || qy > R[1] || qy < 0) continue;
      var pp = P3(qx, qy, o.profitAt([qx, qy])); if (i) ctx.lineTo(pp.sx, pp.sy); else ctx.moveTo(pp.sx, pp.sy);
    }
    ctx.stroke();
    var q0 = o.c.model.q0, t0 = P3(q0[0], q0[1], o.profitAt(q0)); ring(ctx, t0.sx, t0.sy, 6, COL.grey);
    if (o.ok && !S.challenge) { var b = P3(o.q[0], o.q[1], o.profit); dotFill(ctx, b.sx, b.sy, 6, COL.orange); label(ctx, "best plan", b.sx + 9, b.sy - 6, COL.orange); }
    // Axis labels at two edges
    var d = o.c.display, e1 = P3(R[0] * 1.08, 0, floor), e2 = P3(0, R[1] * 1.08, floor);
    label(ctx, d.names[0] + " →", e1.sx, e1.sy + 14, C.ink, "center"); label(ctx, d.names[1] + " →", e2.sx, e2.sy + 14, C.ink, "center");
    $("#cl-legend").innerHTML = '<span><i style="background:#c8b85a"></i>higher profit</span><span><i style="background:#14786e"></i>lower profit</span><span><i style="background:#7a8296"></i>not allowed by the limit</span><span><i style="background:#ffffff;border:1px solid #888"></i>limit boundary</span>' +
      (o.pd ? "" : "<span><b>saddle:</b> no top</span>");
    hint(o);
  }

  function wireCanvas() {
    var cv = $("#cl-canvas"); if (!cv) return;
    var drag = null;
    cv.addEventListener("pointerdown", function (e) {
      if (S.mode3d) { drag = { x: e.clientX, y: e.clientY, yaw: S.yaw, pitch: S.pitch }; cv.setPointerCapture(e.pointerId); return; }
      if (!S.challenge || !MAP) return;
      var r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, b = MAP.box;
      if (x < b.l || x > b.r || y < b.t || y > b.b) return;
      S.guess = [(x - b.l) / (b.r - b.l) * MAP.R[0], (b.b - y) / (b.b - b.t) * MAP.R[1]];
      update();
    });
    cv.addEventListener("pointermove", function (e) {
      if (!drag) return;
      S.yaw = drag.yaw + (e.clientX - drag.x) * 0.01;
      S.pitch = Math.max(0.12, Math.min(1.35, drag.pitch + (e.clientY - drag.y) * 0.006));
      if (S.last) drawSurface(S.last);
    });
    cv.addEventListener("pointerup", function () { drag = null; });
    cv.addEventListener("pointercancel", function () { drag = null; });
  }

  /* ------------------------------------------------------------------
     9. START-UP
     ------------------------------------------------------------------ */
  function start() {
    var root = $("#cases-root");
    if (!DATA) { if (root) root.innerHTML = '<div class="panel">The case file (cases.js) did not load. Check that it is next to index.html.</div>'; return; }
    render();
    window.addEventListener("resize", function () { if ($("#screen-cases.active") && S.view === "case") update(); });
  }
  // Exposed for checking numbers in the browser console, e.g. MatrixLabCases.run("microsoft", {t1: 8})
  window.MatrixLabCases = {
    solveQP2: solveQP2,
    run: function (id, set) { var c = findCase(id), P = defaults(c); Object.keys(set || {}).forEach(function (k) { P[k] = set[k]; }); return compute(c, P); },
    open: function (id) { showLab(); openCase(id); }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
