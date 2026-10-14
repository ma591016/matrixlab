/* =====================================================================
   guide.js — the Study Guide "printing press".
   ---------------------------------------------------------------------
   It reads window.MATRIXLAB_CONTENT (from content.js) and turns it into
   pages inside <section id="screen-guide">. It does NOT change any of
   the original math in script.js; it sits next to it.

   Business analogy: script.js is the factory floor (the calculators);
   guide.js is the training room next door. When a lesson says “go try
   it”, guide.js walks you to the factory floor and sets up the machine
   for you (fills in the inputs), but never rebuilds the machine.

   Sections of this file:
     1. Small helpers
     2. Navigation (showing / hiding the Study Guide screen)
     3. Depth toggle (Simple ↔ Rigorous), remembered per browser
     4. Rendering: overview page and lesson page
     5. Lab jumps (open another screen with inputs pre-filled)
     6. Quiz
     7. Widgets (the interactive “arrow test” canvas)
     8. Start-up
   ===================================================================== */

(function () {                         // wrap everything so our names never clash with script.js
  "use strict";                        // stricter JavaScript: catches typos as errors

  /* ------------------------------------------------------------------
     1. SMALL HELPERS
     ------------------------------------------------------------------ */
  var CONTENT = window.MATRIXLAB_CONTENT;           // the lesson data from content.js
  var state = { depth: "simple", view: "overview", moduleId: null, conceptId: null };

  function $(sel, root) { return (root || document).querySelector(sel); }        // find one element
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); } // find many

  // A text field can be "same for both depths" (a string) or {simple, rigorous}.
  // pick() returns the right version for the current depth.
  function pick(field) {
    if (field == null) return "";
    if (typeof field === "string") return field;
    return field[state.depth] || field.simple || "";
  }

  // Safely read/write the depth preference. Storage can be blocked (private
  // windows), so every access is wrapped in try/catch and has a default.
  function loadDepth() {
    try { var d = localStorage.getItem("matrixlab-depth"); if (d === "simple" || d === "rigorous") state.depth = d; } catch (e) { /* ignore */ }
  }
  function saveDepth() {
    try { localStorage.setItem("matrixlab-depth", state.depth); } catch (e) { /* ignore */ }
  }

  // "PRESENTATION 01" for numbered modules, "ALL PRESENTATIONS" for the capstone (presentation: null).
  function presLabel(m) { return m.presentation ? "PRESENTATION 0" + m.presentation : "ALL PRESENTATIONS"; }

  function findModule(id) { return CONTENT.modules.filter(function (m) { return m.id === id; })[0]; }
  function findConcept(mod, id) { return mod.concepts.filter(function (c) { return c.id === id; })[0]; }

  /* ------------------------------------------------------------------
     2. NAVIGATION
     ------------------------------------------------------------------
     script.js already handles screens 01–04. We handle screen 05 ourselves.
     We listen in the "capture" phase on the whole document, which runs
     BEFORE script.js sees the click, so we can:
       • fully handle clicks on the Study Guide button, and
       • quietly hide the guide when any other screen is chosen.
  */
  function showGuide() {
    $all(".screen").forEach(function (s) { s.classList.remove("active"); });         // hide every screen
    var guide = $("#screen-guide");
    if (guide) guide.classList.add("active");                                        // show ours
    $all(".nav-item").forEach(function (b) { b.classList.remove("active"); b.removeAttribute("aria-current"); });
    var btn = $('.nav-item[data-screen="guide"]');
    if (btn) { btn.classList.add("active"); btn.setAttribute("aria-current", "page"); }
    var crumb = $("#crumb");
    if (crumb) crumb.textContent = "Study Guide";                                     // breadcrumb in the top bar
    var sidebar = $("#sidebar");
    if (sidebar) sidebar.classList.remove("open", "is-open");                         // close the mobile menu if open
    scrollTopNow();
  }

  function hideGuide() {
    var guide = $("#screen-guide");
    if (guide) guide.classList.remove("active");
    var btn = $('.nav-item[data-screen="guide"]');
    if (btn) { btn.classList.remove("active"); btn.removeAttribute("aria-current"); }
  }

  function scrollTopNow() {
    var main = $(".main");
    if (main && main.scrollTo) main.scrollTo(0, 0);   // in case the main area is the scrolling box
    window.scrollTo(0, 0);                            // in case the whole page scrolls
  }

  document.addEventListener("click", function (ev) {
    var target = ev.target.closest ? ev.target.closest("[data-screen], [data-jump]") : null;
    if (!target) return;                                                             // not a navigation click
    var dest = target.getAttribute("data-screen") || target.getAttribute("data-jump");
    if (dest === "guide") {                                                          // our button
      ev.preventDefault();
      ev.stopImmediatePropagation();                                                 // script.js never sees it
      showGuide();
    } else {
      hideGuide();                                                                   // another screen: let script.js do its job
    }
  }, true);                                                                          // true = capture phase (runs first)

  /* ------------------------------------------------------------------
     3. DEPTH TOGGLE
     ------------------------------------------------------------------ */
  function depthToggleHTML() {
    return (
      '<div class="g-depth" role="group" aria-label="Explanation depth">' +
        '<button type="button" data-depth="simple" class="' + (state.depth === "simple" ? "on" : "") + '" aria-pressed="' + (state.depth === "simple") + '">Explain it simply</button>' +
        '<button type="button" data-depth="rigorous" class="' + (state.depth === "rigorous" ? "on" : "") + '" aria-pressed="' + (state.depth === "rigorous") + '">Explain it rigorously</button>' +
      "</div>"
    );
  }

  /* ------------------------------------------------------------------
     4. RENDERING
     ------------------------------------------------------------------ */
  function render() {
    var root = $("#guide-root");
    if (!root || !CONTENT) return;
    stopWidgets();                                                    // stop any animation from the previous page
    root.innerHTML = state.view === "concept" ? conceptHTML() : overviewHTML();
    wirePage(root);                                                   // attach click handlers to the new buttons
    mountWidgets(root);                                               // start the canvas drawings, if any
  }

  // ----- Overview: three module cards, each listing its lessons -----
  function overviewHTML() {
    var cards = CONTENT.modules.map(function (m) {
      var ready = m.concepts.filter(function (c) { return c.status === "ready"; }).length;
      var items = m.concepts.map(function (c) {
        if (c.status === "ready") {
          return '<li><button type="button" class="g-concept ready" data-open="' + m.id + "|" + c.id + '">' +
                   "<span>" + c.title + "</span><small>" + (c.minutes ? c.minutes + " min" : "") + " →</small></button></li>";
        }
        return '<li><span class="g-concept planned"><span>' + c.title + "</span><small>Coming soon</small></span></li>";
      }).join("");
      return (
        '<article class="panel g-module">' +
          '<span class="section-tag">' + presLabel(m) + "</span>" +
          "<h2>" + m.title + "</h2>" +
          '<p class="muted small">' + m.tagline + "</p>" +
          '<div class="g-progress"><span style="width:' + Math.round(100 * ready / m.concepts.length) + '%"></span></div>' +
          '<p class="muted small">' + ready + " of " + m.concepts.length + " lessons ready</p>" +
          '<ul class="g-concepts">' + items + "</ul>" +
        "</article>"
      );
    }).join("");

    return (
      '<div class="g-toolbar"><div class="g-how muted small">Every lesson follows the same five layers: ' +
      "<b>1 Intuition → 2 Worked example → 3 Formula & conditions → 4 See it in the lab → 5 Why it matters</b>, " +
      "then common mistakes, a quick check, and where to read more.</div>" + depthToggleHTML() + "</div>" +
      '<div class="g-module-grid">' + cards + "</div>"
    );
  }

  // ----- One lesson page -----
  function conceptHTML() {
    var mod = findModule(state.moduleId);
    var c = mod && findConcept(mod, state.conceptId);
    if (!c) { state.view = "overview"; return overviewHTML(); }

    var html = "";
    // Top bar: back button + depth toggle
    html += '<div class="g-toolbar"><button type="button" class="text-btn" data-back>← All lessons</button>' + depthToggleHTML() + "</div>";
    html += '<div class="g-title"><span class="section-tag">' + presLabel(mod) + " · " + mod.title.toUpperCase() + "</span>" +
            "<h2>" + c.title + "</h2><p class=\"muted\">" + c.summary + "</p></div>";

    // Layer 1: Intuition
    html += layer(1, "Intuition", "The idea before any formula", pick(c.intuition));

    // Interactive widget sits right after the intuition
    if (c.widget) {
      html += '<div class="panel g-widget"><div class="g-widget-head"><span class="section-tag">TRY IT</span>' +
              '<p class="small">' + pick(c.widgetIntro) + "</p></div>" +
              '<div data-widget="' + c.widget + '"></div></div>';
    }

    // Layer 2: Worked example, one numbered step at a time
    if (c.example) {
      var steps = c.example.steps.map(function (s, i) {
        return '<li class="g-step"><div class="g-step-num">' + (i + 1) + "</div><div>" +
                 "<h4>" + s.title + "</h4><p>" + pick(s.body) + "</p>" +
                 (s.math ? '<div class="g-math-block">' + s.math + "</div>" : "") +
               "</div></li>";
      }).join("");
      html += layer(2, "Worked example", "By hand, every number checkable",
        "<p>" + c.example.intro + "</p><ol class=\"g-steps\">" + steps + "</ol>" +
        (c.example.funFact ? '<p class="g-analogy">' + c.example.funFact + "</p>" : ""));
    }

    // Layer 3: Formula & conditions
    if (c.formula) {
      var conds = (c.formula.conditions || []).map(function (t) { return "<li>" + t + "</li>"; }).join("");
      html += layer(3, "Formula & conditions", "The general rule and when it applies",
        pick(c.formula) + (conds ? '<h4>Conditions & limits</h4><ul class="g-conds">' + conds + "</ul>" : ""));
    }

    // Layer 4: Lab jumps
    if (c.lab && c.lab.length) {
      var buttons = c.lab.map(function (l, i) {
        return '<button type="button" class="g-lab" data-lab="' + i + '"><b>' + l.label + "</b><small>" + l.note + "</small></button>";
      }).join("");
      html += layer(4, "See it in the lab", "Opens the real MatrixLab screen with the inputs filled in", '<div class="g-lab-grid">' + buttons + "</div>");
    }

    // Layer 5: Why it matters
    if (c.business && c.business.length) {
      var cards = c.business.map(function (b) {
        return '<div class="g-card"><h4>' + b.title + "</h4><p>" + b.body + "</p></div>";
      }).join("");
      html += layer(5, "Why it matters", "Business, finance and the other presentations", '<div class="g-card-grid">' + cards + "</div>");
    }

    // Common mistakes
    if (c.mistakes && c.mistakes.length) {
      var rows = c.mistakes.map(function (m) {
        return '<div class="g-mistake"><p class="g-wrong">✗ ' + m.wrong + '</p><p class="g-right">✓ ' + m.right + "</p></div>";
      }).join("");
      html += extra("Common mistakes", rows);
    }

    // Quick check (quiz)
    if (c.quiz && c.quiz.length) {
      var qs = c.quiz.map(function (q, qi) {
        var opts = q.options.map(function (o, oi) {
          return '<button type="button" class="g-opt" data-q="' + qi + '" data-o="' + oi + '">' + o + "</button>";
        }).join("");
        return '<div class="g-q" data-qi="' + qi + '"><p><b>' + (qi + 1) + ".</b> " + q.q + '</p><div class="g-opts">' + opts +
               '</div><p class="g-feedback" aria-live="polite"></p></div>';
      }).join("");
      html += extra("Quick check", '<p class="muted small">Pick an answer; you get instant feedback. Nothing is recorded.</p>' + qs);
    }

    // References
    if (c.references && c.references.length) {
      var refs = c.references.map(function (r) {
        var name = r.url ? '<a href="' + r.url + '" target="_blank" rel="noopener">' + r.source + " ↗</a>" : r.source;
        return '<li><span class="g-kind">' + r.kind + "</span><div>" + name + '<p class="small muted">' + r.where + " · " + r.why + "</p></div></li>";
      }).join("");
      html += extra("Go deeper: where to read more", '<ul class="g-refs">' + refs + "</ul>" +
        '<p class="small muted">All explanations on this page are written in our own words. These sources are pointers for further study.</p>');
    }

    return html;
  }

  function layer(n, title, sub, body) {
    return '<section class="panel g-layer"><div class="g-layer-head"><span class="g-layer-num">' + n + "</span><div><h3>" + title +
           '</h3><p class="small muted">' + sub + '</p></div></div><div class="g-body">' + body + "</div></section>";
  }
  function extra(title, body) {
    return '<section class="panel g-layer g-extra"><h3>' + title + '</h3><div class="g-body">' + body + "</div></section>";
  }

  // Attach handlers to everything we just drew.
  function wirePage(root) {
    $all("[data-depth]", root).forEach(function (b) {
      b.addEventListener("click", function () { state.depth = b.getAttribute("data-depth"); saveDepth(); render(); });
    });
    $all("[data-open]", root).forEach(function (b) {
      b.addEventListener("click", function () {
        var parts = b.getAttribute("data-open").split("|");
        state.view = "concept"; state.moduleId = parts[0]; state.conceptId = parts[1];
        render(); scrollTopNow();
      });
    });
    $all("[data-back]", root).forEach(function (b) {
      b.addEventListener("click", function () { state.view = "overview"; render(); scrollTopNow(); });
    });
    $all("[data-lab]", root).forEach(function (b) {
      b.addEventListener("click", function () {
        var c = findConcept(findModule(state.moduleId), state.conceptId);
        runLab(c.lab[Number(b.getAttribute("data-lab"))]);
      });
    });
    $all(".g-opt", root).forEach(function (b) { b.addEventListener("click", function () { answerQuiz(b); }); });
  }

  /* ------------------------------------------------------------------
     5. LAB JUMPS
     ------------------------------------------------------------------
     We "press" the real navigation button (so script.js switches screens
     exactly as if you clicked it), then type values into its inputs and
     fire the same events a keyboard would. script.js recalculates.
  */
  function runLab(lab) {
    if (!lab) return;
    var nav = $('.nav-item[data-screen="' + lab.screen + '"]');
    if (nav) nav.click();                                         // switch screens through script.js
    setTimeout(function () {                                      // tiny wait so the screen is visible first
      if (lab.set) {
        Object.keys(lab.set).forEach(function (id) {
          var input = document.getElementById(id);
          if (!input) return;
          input.value = lab.set[id];                              // fill the box
          input.dispatchEvent(new Event("input", { bubbles: true }));  // tell script.js “the user typed”
          input.dispatchEvent(new Event("change", { bubbles: true }));
        });
      }
      if (lab.preset) {
        var p = $('[data-preset="' + lab.preset + '"]');
        if (p) p.click();                                         // e.g. "Professor's A" preset button
      }
      scrollTopNow();
    }, 60);
  }

  /* ------------------------------------------------------------------
     6. QUIZ
     ------------------------------------------------------------------ */
  function answerQuiz(btn) {
    var c = findConcept(findModule(state.moduleId), state.conceptId);
    var qi = Number(btn.getAttribute("data-q"));
    var oi = Number(btn.getAttribute("data-o"));
    var q = c.quiz[qi];
    var box = btn.closest(".g-q");
    $all(".g-opt", box).forEach(function (o) { o.classList.remove("right", "wrong"); });
    var ok = oi === q.answer;
    btn.classList.add(ok ? "right" : "wrong");
    if (!ok) $all(".g-opt", box)[q.answer].classList.add("right");   // reveal the correct one
    $(".g-feedback", box).innerHTML = (ok ? "<b>Correct.</b> " : "<b>Not quite.</b> ") + q.explain;
  }

  /* ------------------------------------------------------------------
     7. WIDGETS
     ------------------------------------------------------------------
     A registry: content.js names a widget, and this object knows how to
     build it. New interactive drawings get added here later.
  */
  var running = [];                       // cleanup functions for active widgets
  function stopWidgets() { running.forEach(function (stop) { stop(); }); running = []; }

  function mountWidgets(root) {
    $all("[data-widget]", root).forEach(function (el) {
      var make = WIDGETS[el.getAttribute("data-widget")];
      if (make) { var stop = make(el); if (stop) running.push(stop); }
    });
  }

  var WIDGETS = {
    /* ---------------------------------------------------------------
       "Arrow test": the eigenvector hunt.
       u(θ) = (cos θ, sin θ) is a unit arrow at angle θ.
       A·u is computed with the 2×2 rule: (a·x + b·y, b·x + d·y).
       If A·u lies on the same line as u, we found an eigen-direction.
       --------------------------------------------------------------- */
    "eigen-arrow-test": function (host) {
      var A = { a: 1, b: 1, d: 2 };                       // the professor's matrix (symmetric: b appears twice)
      // Eigen-data for symmetric 2×2: closed-form formulas.
      var tr = A.a + A.d, det = A.a * A.d - A.b * A.b;
      var disc = Math.sqrt(tr * tr / 4 - det);
      var l1 = tr / 2 + disc, l2 = tr / 2 - disc;          // 2.618 and 0.382
      var th1 = Math.atan2(l1 - A.a, A.b);                 // angle of (b, λ−a), i.e. direction of v₁
      var th2 = Math.atan2(l2 - A.a, A.b);                 // direction of v₂

      host.innerHTML =
        '<div class="g-arrow">' +
          '<canvas class="g-canvas" width="640" height="420" aria-label="Arrow u and transformed arrow A times u"></canvas>' +
          '<div class="g-arrow-side">' +
            '<label class="g-range">Arrow direction θ <output>0°</output><input type="range" min="0" max="360" step="0.5" value="0"></label>' +
            '<div class="g-readout"></div>' +
            '<div class="g-btns">' +
              '<button type="button" class="pill-btn" data-snap="1">Snap to v₁</button>' +
              '<button type="button" class="pill-btn" data-snap="2">Snap to v₂</button>' +
              '<button type="button" class="pill-btn" data-morph>▶ Morph circle → ellipse</button>' +
            "</div>" +
            '<p class="small muted">Teal = u (input). Orange = A·u (output). Dashed lines = the two eigen-directions.</p>' +
          "</div>" +
        "</div>";

      var canvas = $("canvas", host), ctx = canvas.getContext ? canvas.getContext("2d") : null;
      var range = $("input", host), out = $("output", host), readout = $(".g-readout", host);
      var morphT = 1, animId = null;                       // morphT: 0 = identity, 1 = full A

      // Read colors from the page so the drawing matches light or dark themes.
      function colors() {
        var cs = getComputedStyle(host);
        return { ink: cs.color || "#888", teal: "#14b8a6", orange: "#f97316", violet: "#8b5cf6" };
      }

      function draw() {
        if (!ctx) return;
        // Match the canvas pixel size to its on-screen size (sharp on retina screens).
        var dpr = window.devicePixelRatio || 1;
        var w = canvas.clientWidth || 640, h = Math.round(w * 0.62);
        if (canvas.width !== Math.round(w * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); canvas.style.height = h + "px"; }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        var c = colors(), cx = w / 2, cy = h / 2, unit = Math.min(w, h) / 7.2;   // pixels per 1 unit
        function P(x, y) { return [cx + x * unit, cy - y * unit]; }               // math coords → screen coords

        // Grid and axes
        ctx.globalAlpha = 0.12; ctx.strokeStyle = c.ink; ctx.lineWidth = 1;
        for (var g = -6; g <= 6; g++) {
          var a1 = P(g, -4), a2 = P(g, 4), b1 = P(-6, g), b2 = P(6, g);
          ctx.beginPath(); ctx.moveTo(a1[0], a1[1]); ctx.lineTo(a2[0], a2[1]); ctx.moveTo(b1[0], b1[1]); ctx.lineTo(b2[0], b2[1]); ctx.stroke();
        }
        ctx.globalAlpha = 0.35;
        var x1 = P(-6, 0), x2 = P(6, 0), y1 = P(0, -4), y2 = P(0, 4);
        ctx.beginPath(); ctx.moveTo(x1[0], x1[1]); ctx.lineTo(x2[0], x2[1]); ctx.moveTo(y1[0], y1[1]); ctx.lineTo(y2[0], y2[1]); ctx.stroke();
        ctx.globalAlpha = 1;

        // Eigen-direction lines (dashed)
        ctx.setLineDash([6, 6]); ctx.strokeStyle = c.violet; ctx.lineWidth = 1.5;
        [th1, th2].forEach(function (t) {
          var p = P(-6 * Math.cos(t), -6 * Math.sin(t)), q = P(6 * Math.cos(t), 6 * Math.sin(t));
          ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
        });
        ctx.setLineDash([]);

        // The matrix being applied: M = (1−t)I + tA  (t animates during "morph")
        var t = morphT, M = { a: (1 - t) + t * A.a, b: t * A.b, d: (1 - t) + t * A.d };

        // Unit circle (faint) and its image under M (an ellipse)
        ctx.globalAlpha = 0.35; ctx.strokeStyle = c.ink; ctx.lineWidth = 1;
        ctx.beginPath();
        for (var k = 0; k <= 120; k++) { var s = k / 120 * 2 * Math.PI, pt = P(Math.cos(s), Math.sin(s)); k ? ctx.lineTo(pt[0], pt[1]) : ctx.moveTo(pt[0], pt[1]); }
        ctx.stroke(); ctx.globalAlpha = 0.8; ctx.strokeStyle = c.orange; ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (k = 0; k <= 120; k++) {
          s = k / 120 * 2 * Math.PI;
          var ex = M.a * Math.cos(s) + M.b * Math.sin(s), ey = M.b * Math.cos(s) + M.d * Math.sin(s);
          pt = P(ex, ey); k ? ctx.lineTo(pt[0], pt[1]) : ctx.moveTo(pt[0], pt[1]);
        }
        ctx.stroke(); ctx.globalAlpha = 1;

        // Test arrow u and its image M·u
        var th = Number(range.value) * Math.PI / 180;
        var ux = Math.cos(th), uy = Math.sin(th);
        var vx = M.a * ux + M.b * uy, vy = M.b * ux + M.d * uy;
        arrow(ctx, P(0, 0), P(vx, vy), c.orange, 3.5);
        arrow(ctx, P(0, 0), P(ux, uy), c.teal, 3.5);

        // Labels
        ctx.font = "600 13px system-ui, sans-serif"; ctx.fillStyle = c.teal;
        var lu = P(ux * 1.18, uy * 1.18); ctx.fillText("u", lu[0] - 4, lu[1] + 4);
        ctx.fillStyle = c.orange;
        var lv = P(vx * 1.08 + 0.12, vy * 1.08 + 0.12); ctx.fillText(t < 1 ? "M·u" : "A·u", lv[0], lv[1]);

        // Readout: angle between u and A·u (using the full A, not the morph)
        var ax = A.a * ux + A.b * uy, ay = A.b * ux + A.d * uy;
        var cross = ux * ay - uy * ax, dot = ux * ax + uy * ay;
        var turn = Math.abs(Math.atan2(cross, dot)) * 180 / Math.PI;           // how much A turned u
        var turnLine = Math.min(turn, 180 - turn);                              // distance from "same line"
        var stretch = Math.sqrt(ax * ax + ay * ay);
        var found = turnLine < 1.5;
        var lam = dot >= 0 ? stretch : -stretch;
        readout.innerHTML =
          "<div><span>u</span><b>(" + ux.toFixed(3) + ", " + uy.toFixed(3) + ")</b></div>" +
          "<div><span>A·u</span><b>(" + ax.toFixed(3) + ", " + ay.toFixed(3) + ")</b></div>" +
          "<div><span>Turned by</span><b>" + turn.toFixed(1) + "°</b></div>" +
          "<div><span>Length × </span><b>" + stretch.toFixed(3) + "</b></div>" +
          '<p class="g-verdict ' + (found ? "yes" : "") + '">' +
            (found ? "★ Eigen-direction found! A only stretches this arrow: λ ≈ " + lam.toFixed(3)
                   : "Not an eigenvector: A turned the arrow off its line.") + "</p>";
        out.textContent = Number(range.value).toFixed(1) + "°";
      }

      function arrow(ctx, from, to, color, width) {
        var dx = to[0] - from[0], dy = to[1] - from[1], len = Math.hypot(dx, dy);
        if (len < 1) return;
        var ang = Math.atan2(dy, dx), head = Math.min(12, len * 0.4);
        ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(from[0], from[1]); ctx.lineTo(to[0] - head * 0.6 * Math.cos(ang), to[1] - head * 0.6 * Math.sin(ang)); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(to[0], to[1]);
        ctx.lineTo(to[0] - head * Math.cos(ang - 0.45), to[1] - head * Math.sin(ang - 0.45));
        ctx.lineTo(to[0] - head * Math.cos(ang + 0.45), to[1] - head * Math.sin(ang + 0.45));
        ctx.closePath(); ctx.fill();
      }

      // Controls
      range.addEventListener("input", draw);
      $all("[data-snap]", host).forEach(function (b) {
        b.addEventListener("click", function () {
          var t = b.getAttribute("data-snap") === "1" ? th1 : th2;
          var deg = (t * 180 / Math.PI + 360) % 360;
          range.value = deg.toFixed(1); draw();
        });
      });
      $("[data-morph]", host).addEventListener("click", function () {
        if (animId) cancelAnimationFrame(animId);
        var start = null;
        function step(ts) {
          if (!start) start = ts;
          morphT = Math.min(1, (ts - start) / 2200);         // 2.2 seconds from I to A
          draw();
          if (morphT < 1) animId = requestAnimationFrame(step); else animId = null;
        }
        morphT = 0; animId = requestAnimationFrame(step);
      });
      window.addEventListener("resize", draw);
      draw();

      // Cleanup when the page changes
      return function () { if (animId) cancelAnimationFrame(animId); window.removeEventListener("resize", draw); };
    }
  };

  /* ------------------------------------------------------------------
     8. START-UP
     ------------------------------------------------------------------ */
  function start() {
    if (!CONTENT) {                                         // content.js missing or broken
      var root = $("#guide-root");
      if (root) root.innerHTML = '<div class="panel">The lesson file (content.js) did not load. Check that it is in the same folder as index.html.</div>';
      return;
    }
    loadDepth();
    render();
    // Re-draw the widget when the guide becomes visible (canvas size was 0 while hidden).
    var guide = $("#screen-guide");
    if (guide && window.MutationObserver) {
      new MutationObserver(function () { if (guide.classList.contains("active")) render(); })
        .observe(guide, { attributes: true, attributeFilter: ["class"] });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
