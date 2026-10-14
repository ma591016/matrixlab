/* =====================================================================
   content.js — ALL Study Guide text lives here.
   ---------------------------------------------------------------------
   Plain-language idea: this file is the "textbook" and guide.js is the
   "printing press". To add a lesson you only edit THIS file; you never
   touch the math or drawing code. Like a financial model where inputs
   sit on one tab and formulas on another.

   How a lesson (a "concept") is shaped:
     id, title, status ('ready' or 'planned'), minutes, summary
     intuition  {simple, rigorous}   -> Layer 1
     widget     name of an interactive drawing in guide.js (optional)
     example    {intro, steps[]}     -> Layer 2 (worked by hand)
     formula    {simple, rigorous, conditions[]} -> Layer 3
     lab        buttons that open the real MatrixLab screens -> Layer 4
     business   cards                -> Layer 5
     mistakes, quiz, references      -> extras at the bottom
   Any text field can be a plain string (same for both depths) or an
   object {simple: "...", rigorous: "..."} for the depth toggle.
   All explanations are written in our own words; references only POINT
   to sources (chapter / lecture), they never copy them.
   ===================================================================== */

window.MATRIXLAB_CONTENT = {
  version: "1.1",

  modules: [
    /* ------------------------------------------------------------ */
    {
      id: "p1",
      presentation: 1,
      title: "Matrix Fundamentals",
      tagline: "Operations and decompositions of A = [[1,1],[1,2]]",
      concepts: [
        { id: "vectors", title: "Vectors, addition & scaling", status: "planned" },
        { id: "multiply", title: "Matrix multiplication", status: "planned" },
        { id: "inverse", title: "The inverse of A", status: "planned" },

        /* ======================= READY LESSON ======================= */
        {
          id: "eigen",
          title: "Eigenvalues & eigenvectors",
          status: "ready",
          minutes: 15,
          summary: "Find the two directions A never turns, and the stretch factor for each.",

          /* ---------- Layer 1: intuition ---------- */
          intuition: {
            simple:
              "<p>Think of A as a machine: you feed it an arrow, it hands back a new arrow. Almost every arrow comes out <b>pointing somewhere new</b>; the machine turns it.</p>" +
              "<p>But a few special arrows come out on the <b>same line</b> they went in on. The machine only stretches them, shrinks them, or flips them. Those special arrows are <b>eigenvectors</b>, and the stretch factor is the <b>eigenvalue</b> (written λ, “lambda”).</p>" +
              "<p>For the professor's matrix there are exactly two such directions: one gets stretched about <b>2.618×</b>, the other shrunk to about <b>0.382×</b> its length.</p>" +
              "<p class='g-analogy'><b>Business analogy:</b> imagine A turns this year's product mix into next year's. Most mixes change their proportions. An eigenvector is a <i>balanced</i> mix whose proportions stay the same while the whole thing grows (λ &gt; 1) or shrinks (λ &lt; 1).</p>",
            rigorous:
              "<p>Let A be an n×n matrix. A <b>nonzero</b> vector v is an eigenvector of A with eigenvalue λ if <span class='g-m'>Av = λv</span>.</p>" +
              "<p>Rewriting, <span class='g-m'>(A − λI)v = 0</span> has a nonzero solution exactly when A − λI is singular, i.e. when <span class='g-m'>det(A − λI) = 0</span>. This polynomial equation in λ is the <b>characteristic equation</b>; its roots are the eigenvalues, and each eigenvalue's eigenvectors are the nonzero vectors of the null space of A − λI.</p>" +
              "<p>For a <b>real symmetric</b> A (our case), the spectral theorem guarantees real eigenvalues and orthogonal eigenvectors for distinct eigenvalues, so A has an orthonormal eigenbasis.</p>"
          },

          /* ---------- interactive widget (drawn by guide.js) ---------- */
          widget: "eigen-arrow-test",
          widgetIntro: {
            simple: "Turn the dial to point the teal arrow in any direction. The orange arrow is what A does to it. Hunt for the directions where the two arrows line up.",
            rigorous: "The test vector u(θ) = (cos θ, sin θ) sweeps the unit circle; Au is shown in orange. u is an eigenvector exactly when Au ∥ u. “Morph” animates (1−t)I + tA, showing the unit circle mapped to an ellipse whose semi-axes are λ₁u₁ and λ₂u₂."
          },

          /* ---------- Layer 2: worked example ---------- */
          example: {
            intro: "Professor's matrix A = [[1, 1], [1, 2]]. Every number below can be checked with a calculator.",
            steps: [
              {
                title: "Test an ordinary arrow first",
                body: {
                  simple: "Feed in u = (1, 0), an arrow pointing right. A·u = (1·1 + 1·0, 1·1 + 2·0) = (1, 1). The output points diagonally, so the arrow was <b>turned</b>. Not an eigenvector.",
                  rigorous: "Au = (1, 1) is not a scalar multiple of (1, 0), so e₁ is not an eigenvector. This is the typical case."
                },
                math: "A·(1, 0) = (1, 1)  ✗ turned"
              },
              {
                title: "Write the eigen-equation",
                body: {
                  simple: "We want arrows v where A·v = λ·v. Move everything to one side: (A − λI)·v = 0. “A − λI” just means: <b>subtract λ from the diagonal entries only</b>.",
                  rigorous: "Av = λv ⇔ (A − λI)v = 0. A nonzero solution exists iff A − λI is not invertible."
                },
                math: "A − λI = [[1 − λ, 1], [1, 2 − λ]]"
              },
              {
                title: "Set the determinant to zero",
                body: {
                  simple: "A matrix can send a nonzero arrow to zero only if it squashes the plane flat, and “squashes flat” means its determinant is 0. For a 2×2 matrix, the determinant is (top-left × bottom-right) − (top-right × bottom-left).",
                  rigorous: "det(A − λI) = (1 − λ)(2 − λ) − 1 = λ² − 3λ + 1. In general, for 2×2 matrices the characteristic polynomial is λ² − tr(A)·λ + det(A)."
                },
                math: "(1 − λ)(2 − λ) − 1·1 = λ² − 3λ + 1 = 0"
              },
              {
                title: "Solve the quadratic",
                body: {
                  simple: "Use the quadratic formula. Two answers come out: the two stretch factors.",
                  rigorous: "λ = (3 ± √(9 − 4))/2 = (3 ± √5)/2. Check: λ₁ + λ₂ = 3 = tr(A) and λ₁λ₂ = 1 = det(A)."
                },
                math: "λ₁ = (3 + √5)/2 ≈ 2.618     λ₂ = (3 − √5)/2 ≈ 0.382"
              },
              {
                title: "Find the arrow for λ₁ ≈ 2.618",
                body: {
                  simple: "Plug λ₁ into the first row of (A − λI)v = 0: (1 − 2.618)·x + y = 0, so y = 1.618·x. Pick x = 1: v₁ = (1, 1.618). Check: A·v₁ = (2.618, 4.236), which is exactly 2.618 × (1, 1.618). ✓",
                  rigorous: "Row 1 gives (1 − λ)x + y = 0 ⇒ y = (λ − 1)x. For λ₁: v₁ ∝ (1, λ₁ − 1) = (1, 1.618). Verify Av₁ = (2.618, 4.236) = λ₁v₁."
                },
                math: "v₁ = (1, 1.618)   A·v₁ = 2.618·v₁  ✓"
              },
              {
                title: "Find the arrow for λ₂ ≈ 0.382",
                body: {
                  simple: "Same trick: y = (0.382 − 1)·x = −0.618·x. Pick x = 1: v₂ = (1, −0.618). Check: A·v₂ = (0.382, −0.236) = 0.382 × (1, −0.618). ✓ This arrow gets <b>shrunk</b>.",
                  rigorous: "v₂ ∝ (1, λ₂ − 1) = (1, −0.618). Verify Av₂ = (0.382, −0.236) = λ₂v₂."
                },
                math: "v₂ = (1, −0.618)   A·v₂ = 0.382·v₂  ✓"
              },
              {
                title: "Notice they are perpendicular",
                body: {
                  simple: "Dot product: 1·1 + 1.618·(−0.618) = 1 − 1 = 0. A zero dot product means a 90° angle. That always happens for symmetric matrices. Dividing each arrow by its length gives the “unit” versions used in the spectral decomposition.",
                  rigorous: "v₁·v₂ = 0, as the spectral theorem predicts. Normalizing: u₁ = (0.526, 0.851), u₂ = (0.851, −0.526). These are the columns of Q in A = QΛQᵀ."
                },
                math: "v₁·v₂ = 0     u₁ ≈ (0.526, 0.851)   u₂ ≈ (0.851, −0.526)"
              }
            ],
            funFact: "Fun fact: 1.618 is the golden ratio φ. For this matrix, λ₁ = φ² and λ₂ = 1/φ², which is why their product is exactly 1."
          },

          /* ---------- Layer 3: general rule + conditions ---------- */
          formula: {
            simple:
              "<div class='g-math-block'>A·v = λ·v   (v ≠ 0)</div>" +
              "<p><b>A</b> = the matrix (the machine) · <b>v</b> = an eigenvector (a special arrow) · <b>λ</b> = its eigenvalue (the stretch factor).</p>" +
              "<p>Recipe: (1) solve det(A − λI) = 0 for λ; (2) for each λ, solve (A − λI)v = 0 for v.</p>",
            rigorous:
              "<div class='g-math-block'>Av = λv, v ≠ 0  ⇔  det(A − λI) = 0, v ∈ Null(A − λI)∖{0}</div>" +
              "<p>For 2×2 A: λ² − tr(A)λ + det(A) = 0, so λ₁ + λ₂ = tr(A) and λ₁λ₂ = det(A). For symmetric A = Aᵀ: λ ∈ ℝ and eigenvectors of distinct eigenvalues are orthogonal.</p>",
            conditions: [
              "Only <b>square</b> matrices have eigenvalues.",
              "The zero vector never counts as an eigenvector.",
              "Any nonzero multiple of an eigenvector is also an eigenvector (same λ). The answer is a <b>line</b>, not a single arrow.",
              "λ = 0 means A squashes that direction to zero, so A has <b>no inverse</b>.",
              "λ &lt; 0 means the arrow is <b>flipped</b>, but it stays on its line.",
              "Non-symmetric matrices can have no real eigenvectors at all (a 90° rotation turns every arrow)."
            ]
          },

          /* ---------- Layer 4: open the real lab ---------- */
          lab: [
            {
              label: "Ordinary arrow: watch it turn",
              note: "Loads A and u = (1, 0) in Matrix Fundamentals.",
              screen: "matrix",
              set: { a11: 1, a12: 1, a22: 2, u1: 1, u2: 0 }
            },
            {
              label: "Eigenvector v₁: stretched 2.618×",
              note: "u = (1, 1.618). A·u lands on the same line, 2.618 times longer.",
              screen: "matrix",
              set: { a11: 1, a12: 1, a22: 2, u1: 1, u2: 1.618 }
            },
            {
              label: "Eigenvector v₂: shrunk to 0.382×",
              note: "u = (1, −0.618). A·u lands on the same line, much shorter.",
              screen: "matrix",
              set: { a11: 1, a12: 1, a22: 2, u1: 1, u2: -0.618 }
            },
            {
              label: "Same eigenvectors as ellipse axes",
              note: "Opens Geometry Explorer with the professor's A. The dashed eigen-axes are the ellipse's tilt.",
              screen: "geometry",
              preset: "prof"
            }
          ],

          /* ---------- Layer 5: why it matters ---------- */
          business: [
            {
              title: "Risk directions in a portfolio",
              body: "A covariance matrix is symmetric. Its eigenvectors are the main independent “directions” assets move together; its eigenvalues are how much variance sits in each. This is principal component analysis (PCA)."
            },
            {
              title: "Yield curves in fixed income",
              body: "Running PCA on daily changes in interest rates typically finds three dominant eigenvectors that analysts read as level, slope, and curvature of the curve. Traders hedge those directions instead of dozens of individual rates."
            },
            {
              title: "Presentation 3 connection",
              body: "In q(x) = xᵀAx, the eigenvectors are the tilt of the contour ellipses. The bigger eigenvalue is the <b>steeper</b> direction, so its ellipse axis is the <b>shorter</b> one (semi-axis = 1/√λ on the level set q = 1)."
            },
            {
              title: "Presentation 2 connection",
              body: "The firm's profit is concave (a hill with one top) exactly when both eigenvalues of the demand matrix B are positive. Eigenvalues tell you whether “the best production plan” even exists."
            }
          ],

          mistakes: [
            { wrong: "Subtracting λ from every entry of A.", right: "Subtract λ only on the diagonal: A − λI." },
            { wrong: "Thinking (1, 1.618) is “the” eigenvector.", right: "Any nonzero multiple works, e.g. (2, 3.236). Normalize only when building Q." },
            { wrong: "“Eigenvectors keep the same direction.”", right: "They stay on the same line; a negative λ flips them to the opposite direction." },
            { wrong: "“Bigger eigenvalue = longer contour-ellipse axis.”", right: "Bigger λ = steeper = shorter axis on the level set." },
            { wrong: "Forgetting to verify.", right: "Always check A·v = λ·v, and tr(A) = λ₁ + λ₂, det(A) = λ₁λ₂." }
          ],

          quiz: [
            {
              q: "A·(1, 0) = (1, 1). Is (1, 0) an eigenvector of A?",
              options: ["Yes, with λ = 1", "No, the output is not on the same line", "Yes, with λ = √2"],
              answer: 1,
              explain: "(1, 1) is not a multiple of (1, 0); the arrow was turned."
            },
            {
              q: "v = (1, 1.618) is an eigenvector with λ ≈ 2.618. What about 5v = (5, 8.09)?",
              options: ["Also an eigenvector, λ ≈ 2.618", "Also an eigenvector, λ ≈ 13.09", "Not an eigenvector"],
              answer: 0,
              explain: "A(5v) = 5Av = 5λv = λ(5v). Same line, same stretch factor."
            },
            {
              q: "Without solving anything, what do the two eigenvalues of A add up to?",
              options: ["1 (the determinant)", "3 (the trace)", "4 (sum of all entries)"],
              answer: 1,
              explain: "λ₁ + λ₂ = trace = 1 + 2 = 3. Their product equals det(A) = 1."
            },
            {
              q: "A matrix has an eigenvalue of 0. What does that tell you?",
              options: ["It has no inverse", "It is positive definite", "Nothing special"],
              answer: 0,
              explain: "Some nonzero arrow gets sent to zero, so the transformation cannot be undone."
            }
          ],

          references: [
            { kind: "Course text", source: "Liesen & Mehrmann, Linear Algebra (2nd ed.)", where: "§8.2 eigenvalues & eigenvectors; §14.2 diagonalization", why: "Your primary reference; rigorous definitions." },
            { kind: "Course text", source: "Sydsæter, Hammond et al., Essential Mathematics for Economic Analysis", where: "Ch. 13, eigenvalue sections", why: "Same ideas in economists' notation." },
            { kind: "MIT", source: "Gilbert Strang, 18.06 Linear Algebra (OpenCourseWare)", where: "Lecture 21: Eigenvalues and eigenvectors", why: "Classic lecture; includes the trace check.", url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/resources/lecture-21-eigenvalues-and-eigenvectors/" },
            { kind: "Georgia Tech", source: "Margalit & Rabinoff, Interactive Linear Algebra", where: "§5.1 Eigenvalues and Eigenvectors (then §5.2)", why: "Drag-the-vector demos, very close to our arrow test.", url: "https://textbooks.math.gatech.edu/ila/eigenvectors.html" },
            { kind: "Free textbook", source: "Jim Hefferon, Linear Algebra (free, MAA award winner)", where: "Chapter Five (Similarity), eigenvalues & eigenvectors section", why: "Many worked exercises with full solutions.", url: "https://hefferon.net/linearalgebra/" },
            { kind: "Video", source: "3Blue1Brown, Essence of Linear Algebra", where: "Chapter 14: Eigenvectors and eigenvalues", why: "Best geometric intuition before formulas.", url: "https://www.3blue1brown.com/lessons/eigenvalues" }
          ]
        },
        /* ===================== END READY LESSON ===================== */

        { id: "spectral", title: "Spectral decomposition A = QΛQᵀ", status: "planned" },
        { id: "cholesky", title: "Cholesky decomposition A = LLᵀ", status: "planned" }
      ]
    },

    /* ------------------------------------------------------------ */
    {
      id: "p3",
      presentation: 3,
      title: "Quadratic Forms & Level Sets",
      tagline: "How a matrix becomes a landscape",
      concepts: [
        { id: "qform", title: "What is a quadratic form?", status: "planned" },
        { id: "levels", title: "Level sets and contours", status: "planned" },
        { id: "gallery", title: "Shape gallery: every case side by side", status: "planned" },
        { id: "definiteness", title: "Definiteness from eigenvalues", status: "planned" }
      ]
    },

    /* ------------------------------------------------------------ */
    {
      id: "p2",
      presentation: 2,
      title: "The Two-Product Firm",
      tagline: "From linear demand to a quadratic profit objective",
      concepts: [
        { id: "demand", title: "Linear demand for substitutes", status: "planned" },
        { id: "technology", title: "Linear technology & shared inputs", status: "planned" },
        { id: "profit", title: "Why profit becomes a quadratic form", status: "planned" },
        { id: "optimum", title: "Constraints, the optimum & shadow prices", status: "planned" }
      ]
    }
  ]
};
