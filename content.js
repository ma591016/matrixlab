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
        /* ======================= VECTORS ======================= */
        {
          id: "vectors",
          title: "Vectors, addition & scaling",
          status: "ready",
          minutes: 8,
          summary: "Arrows you can add, subtract and stretch: the building blocks of everything else.",
          intuition: {
            simple:
              "<p>A <b>vector</b> is a list of numbers, like (1, 1). You can picture it as an <b>arrow</b> from the origin to that point, or as a <b>bundle</b>: “1 unit of product 1 and 1 unit of product 2.”</p>" +
              "<p><b>Adding</b> two vectors means walking along the first arrow, then the second (tip to tail). <b>Subtracting</b> u − v gives the arrow that goes from the tip of v to the tip of u. <b>Scaling</b> by a number c stretches the arrow c times (and flips it if c is negative).</p>" +
              "<p class='g-analogy'><b>Business analogy:</b> if u is this week's sales of two products and v is next week's, u + v is total sales, u − v is the change, and 2u is “if sales doubled.”</p>",
            rigorous:
              "<p>A vector in ℝ² is an ordered pair u = (u₁, u₂). Addition and scalar multiplication act component by component: u + v = (u₁ + v₁, u₂ + v₂), cu = (cu₁, cu₂).</p>" +
              "<p>These two operations satisfy the vector-space axioms (commutativity, associativity, distributivity, a zero vector, additive inverses). Every later idea, from linear maps to eigenvectors, is defined in terms of them.</p>"
          },
          example: {
            intro: "Use the site's default vectors u = (1, 1) and v = (−1, 2).",
            steps: [
              { title: "Add", body: "Add matching coordinates: first with first, second with second.", math: "u + v = (1 + (−1), 1 + 2) = (0, 3)" },
              { title: "Subtract", body: "Same idea, with minus signs. Order matters: u − v is the opposite arrow of v − u.", math: "u − v = (1 − (−1), 1 − 2) = (2, −1)" },
              { title: "Scale", body: "Multiply every coordinate by the scalar. The arrow keeps its line and becomes twice as long.", math: "2u = (2·1, 2·1) = (2, 2)" },
              { title: "Length (optional)", body: { simple: "Length comes from Pythagoras: √(x² + y²). Scaling by 2 doubles the length.", rigorous: "‖u‖ = √(u·u). Scaling satisfies ‖cu‖ = |c|·‖u‖." }, math: "‖u‖ = √2 ≈ 1.414     ‖2u‖ = √8 ≈ 2.828" },
              { title: "Dot product (needed later)", body: "Multiply matching coordinates and add. A dot product of 0 means the arrows are perpendicular, which we use for eigenvectors.", math: "u·v = 1·(−1) + 1·2 = 1" }
            ]
          },
          formula: {
            simple: "<div class='g-math-block'>u + v = (u₁ + v₁, u₂ + v₂)     c·u = (c·u₁, c·u₂)</div><p><b>u, v</b> = vectors (arrows / bundles) · <b>c</b> = a plain number called a scalar.</p>",
            rigorous: "<div class='g-math-block'>u + v = (u₁ + v₁, u₂ + v₂),  cu = (cu₁, cu₂),  u·v = u₁v₁ + u₂v₂</div><p>Linear combinations au + bv are the central object: a matrix-vector product Ax is exactly a linear combination of the columns of A.</p>",
            conditions: [
              "You can only add vectors of the <b>same size</b>.",
              "Subtraction is not commutative: u − v = −(v − u).",
              "Scaling by 0 gives the zero vector; scaling by −1 flips the arrow."
            ]
          },
          lab: [
            { label: "Default vectors", note: "u = (1, 1), v = (−1, 2), scale 2. Check the three results against the worked example.", screen: "matrix", set: { u1: 1, u2: 1, v1: -1, v2: 2, scale: 2 } },
            { label: "Flip with a negative scalar", note: "Scale u by −1.5 and watch the arrow reverse.", screen: "matrix", set: { u1: 1, u2: 1, v1: -1, v2: 2, scale: -1.5 } }
          ],
          business: [
            { title: "Production plans", body: "In Theme 2, q = (q₁, q₂) is a vector of output quantities. Adding plans, comparing plans, and scaling plans are vector operations." },
            { title: "Portfolios", body: "A portfolio is a vector of weights. Combining two strategies 50/50 is ½u + ½v, a linear combination." }
          ],
          mistakes: [
            { wrong: "Adding a 2-number vector to a 3-number vector.", right: "Sizes must match." },
            { wrong: "u − v = v − u.", right: "They point in opposite directions." },
            { wrong: "Scaling changes the direction.", right: "Scaling keeps the same line; only a negative scalar reverses the arrow." }
          ],
          quiz: [
            { q: "u = (1, 1), v = (−1, 2). What is v − u?", options: ["(2, −1)", "(−2, 1)", "(0, 3)"], answer: 1, explain: "(−1 − 1, 2 − 1) = (−2, 1), the opposite of u − v." },
            { q: "What does multiplying a vector by −2 do?", options: ["Rotates it 90°", "Doubles the length and reverses direction", "Halves it"], answer: 1, explain: "|−2| = 2 doubles the length; the minus sign flips it along its line." },
            { q: "Two vectors have dot product 0. What does that mean?", options: ["They are equal", "One is zero or they are perpendicular", "They point the same way"], answer: 1, explain: "A zero dot product means a 90° angle (for nonzero vectors)." }
          ],
          references: [
            { kind: "Course text", source: "Liesen & Mehrmann, Linear Algebra (2nd ed.)", where: "§4.1 matrix operations (vectors as n×1 matrices)", why: "Formal definitions." },
            { kind: "Course text", source: "Sydsæter, Hammond et al., Essential Mathematics for Economic Analysis", where: "Ch. 12, vectors and matrix algebra", why: "Economists' notation and examples." },
            { kind: "Georgia Tech", source: "Margalit & Rabinoff, Interactive Linear Algebra", where: "§2.1 Vectors", why: "Interactive pictures of adding and scaling.", url: "https://textbooks.math.gatech.edu/ila/vectors.html" },
            { kind: "Video", source: "3Blue1Brown, Essence of Linear Algebra", where: "Chapter 1: Vectors, what even are they?", why: "Arrow vs list-of-numbers viewpoint.", url: "https://www.3blue1brown.com/lessons/vectors" }
          ]
        },

        /* ======================= MATRIX MULTIPLICATION ======================= */
        {
          id: "multiply",
          title: "Matrix multiplication",
          status: "ready",
          minutes: 10,
          summary: "Row-times-column arithmetic, and why it means “do one transformation, then another.”",
          intuition: {
            simple:
              "<p>Multiplying a matrix by a vector: each <b>row</b> of the matrix makes one number of the answer, by multiplying matching entries with the vector and adding. For A·(1, 1): row 1 gives 1·1 + 1·1 = 2, row 2 gives 1·1 + 2·1 = 3. So A·(1, 1) = (2, 3).</p>" +
              "<p>Multiplying two matrices is the same thing repeated: every <b>row of the first × column of the second</b> fills one cell. The meaning: A·M is the machine that first applies M, then applies A.</p>" +
              "<p class='g-analogy'><b>Business analogy:</b> a matrix that turns products into input needs, followed by a matrix that turns inputs into costs, multiplies into one matrix that turns products straight into costs.</p>",
            rigorous:
              "<p>For A (m×n) and M (n×p), (AM)ᵢⱼ = Σₖ aᵢₖ mₖⱼ. As linear maps, AM is the composition x ↦ A(Mx). The column view: the j-th column of AM is A times the j-th column of M.</p>" +
              "<p>Multiplication is associative and distributes over addition, but is <b>not commutative</b> in general: AM ≠ MA.</p>"
          },
          example: {
            intro: "A = [[1, 1], [1, 2]] and a second matrix M = [[2, 0], [1, 2]] (card 01 on the website). We call it M so it isn't confused with the firm's demand matrix B in Theme 2.",
            steps: [
              { title: "Top-left cell of A·M", body: "Row 1 of A = (1, 1). Column 1 of M = (2, 1). Multiply matching entries and add.", math: "1·2 + 1·1 = 3" },
              { title: "Top-right cell", body: "Row 1 of A with column 2 of M = (0, 2).", math: "1·0 + 1·2 = 2" },
              { title: "Bottom row", body: "Row 2 of A = (1, 2) with each column of M.", math: "1·2 + 2·1 = 4      1·0 + 2·2 = 4" },
              { title: "Result", body: "Put the four numbers in their positions.", math: "A·M = [[3, 2], [4, 4]]" },
              { title: "Swap the order", body: { simple: "Now compute M·A. Different answer, so <b>order matters</b>.", rigorous: "MA = [[2, 2], [3, 5]] ≠ AM. Note det(AM) = det(MA) = det(A)det(M) = 1·4 = 4 even though the products differ." }, math: "M·A = [[2, 2], [3, 5]]  ≠  A·M" }
            ],
            funFact: "Fun fact: powers of the professor's A produce Fibonacci numbers. A⁵ = [[34, 55], [55, 89]]."
          },
          formula: {
            simple: "<div class='g-math-block'>(A·M)[row i, column j] = row i of A  ·  column j of M</div><p><b>A, M</b> = matrices · the “·” between a row and a column is the dot product (multiply matching entries, add).</p>",
            rigorous: "<div class='g-math-block'>(AM)ᵢⱼ = Σₖ aᵢₖ mₖⱼ,   (AM)x = A(Mx)</div><p>Identity: AI = IA = A. Transpose: (AM)ᵀ = MᵀAᵀ (order reverses). Determinant: det(AM) = det(A)·det(M).</p>",
            conditions: [
              "Columns of the first must equal rows of the second (2×2 times 2×2 is fine).",
              "AM and MA are usually different.",
              "The result of A·M means: apply M first, then A."
            ]
          },
          lab: [
            { label: "Reproduce the worked example", note: "A = [[1,1],[1,2]] and second matrix [[2,0],[1,2]]. Open “Show the calculation.”", screen: "matrix", set: { a11: 1, a12: 1, a22: 2, b11: 2, b12: 0, b21: 1, b22: 2 } },
            { label: "Multiply by the identity", note: "Set the second matrix to I = [[1,0],[0,1]]. The product should equal A.", screen: "matrix", set: { a11: 1, a12: 1, a22: 2, b11: 1, b12: 0, b21: 0, b22: 1 } },
            { label: "Multiply by the inverse", note: "Set the second matrix to A⁻¹ = [[2,−1],[−1,1]]. The product should be I.", screen: "matrix", set: { a11: 1, a12: 1, a22: 2, b11: 2, b12: -1, b21: -1, b22: 1 } }
          ],
          business: [
            { title: "Products → inputs → cost", body: "In Theme 2, input use is z = Tq and input cost is wᵀz, so cost per unit of output is wᵀT, one matrix product. This is how a linear cost function is built." },
            { title: "Chained reports", body: "Converting regional sales into product lines, then product lines into margins, is two matrix multiplications that collapse into one." }
          ],
          mistakes: [
            { wrong: "Multiplying entry by entry: [[1·2, 1·0], [1·1, 2·2]].", right: "Use row × column, not position × position." },
            { wrong: "Assuming A·M = M·A.", right: "Check both; usually they differ." },
            { wrong: "Reading A·M as “A first.”", right: "A·M·x means M acts on x first, then A." }
          ],
          quiz: [
            { q: "What is A·(1, 1) for A = [[1, 1], [1, 2]]?", options: ["(2, 3)", "(1, 2)", "(2, 2)"], answer: 0, explain: "Row 1: 1 + 1 = 2. Row 2: 1 + 2 = 3." },
            { q: "If A·M = [[3, 2], [4, 4]], is M·A necessarily the same?", options: ["Yes, always", "No; here M·A = [[2, 2], [3, 5]]", "Only for 2×2 matrices"], answer: 1, explain: "Matrix multiplication is not commutative." },
            { q: "What is A·I?", options: ["I", "A", "The zero matrix"], answer: 1, explain: "The identity matrix changes nothing." }
          ],
          references: [
            { kind: "Course text", source: "Liesen & Mehrmann, Linear Algebra (2nd ed.)", where: "§4.1 matrix operations", why: "Definition and rules." },
            { kind: "MIT", source: "Gilbert Strang, 18.06 Linear Algebra", where: "Lecture 3: Multiplication and inverse matrices", why: "Four ways to see a matrix product.", url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/resources/lecture-3-multiplication-and-inverse-matrices/" },
            { kind: "Georgia Tech", source: "Margalit & Rabinoff, Interactive Linear Algebra", where: "§3.4 Matrix Multiplication", why: "Multiplication as composition of transformations.", url: "https://textbooks.math.gatech.edu/ila/matrix-multiplication.html" },
            { kind: "Video", source: "3Blue1Brown, Essence of Linear Algebra", where: "Chapter 4: Matrix multiplication as composition", why: "Why order matters, visually.", url: "https://www.3blue1brown.com/lessons/matrix-multiplication" }
          ]
        },

        /* ======================= INVERSE ======================= */
        {
          id: "inverse",
          title: "The inverse of A",
          status: "ready",
          minutes: 10,
          summary: "The “undo” matrix, how to compute it for 2×2, and when it does not exist.",
          intuition: {
            simple:
              "<p>If A is a machine that moves arrows, its <b>inverse</b> A⁻¹ is the machine that moves them back. Apply A, then A⁻¹, and every arrow returns home: A⁻¹·A = I.</p>" +
              "<p>An inverse exists only if A doesn't <b>squash</b> the plane onto a line. The determinant measures that: det(A) is how much A scales areas. If det(A) = 0, area collapses to nothing and you can't undo it.</p>" +
              "<p class='g-analogy'><b>Business analogy:</b> if you know how much of two inputs each product needs, the inverse answers the reverse question: “given these inputs, how much of each product can I make using them exactly?”</p>",
            rigorous:
              "<p>A square A is invertible if there is a matrix A⁻¹ with AA⁻¹ = A⁻¹A = I. Equivalent conditions: det(A) ≠ 0; columns linearly independent; Ax = 0 only for x = 0; 0 is not an eigenvalue.</p>" +
              "<p>For 2×2, A = [[a, b], [c, d]] gives A⁻¹ = (1/det A)·[[d, −b], [−c, a]] with det A = ad − bc.</p>"
          },
          example: {
            intro: "A = [[1, 1], [1, 2]].",
            steps: [
              { title: "Determinant", body: "Top-left × bottom-right, minus top-right × bottom-left. It isn't zero, so the inverse exists.", math: "det(A) = 1·2 − 1·1 = 1" },
              { title: "Swap and negate", body: "Swap the two diagonal entries; change the sign of the two off-diagonal entries.", math: "[[2, −1], [−1, 1]]" },
              { title: "Divide by the determinant", body: "Divide every entry by det(A) = 1, so nothing changes here.", math: "A⁻¹ = [[2, −1], [−1, 1]]" },
              { title: "Verify", body: "Multiply: A·A⁻¹ must equal I.", math: "[[1·2 + 1·(−1), 1·(−1) + 1·1], [1·2 + 2·(−1), 1·(−1) + 2·1]] = [[1, 0], [0, 1]] ✓" },
              { title: "Use it to solve equations", body: { simple: "Solve A·x = (3, 5): multiply both sides by A⁻¹. Then check by plugging back in.", rigorous: "x = A⁻¹b. In practice software solves Ax = b directly (elimination) rather than forming A⁻¹, but the inverse explains why there is exactly one solution." }, math: "x = A⁻¹·(3, 5) = (2·3 − 5, −3 + 5) = (1, 2)     check: A·(1, 2) = (3, 5) ✓" }
            ],
            funFact: "The eigenvalues of A⁻¹ are 1/2.618 = 0.382 and 1/0.382 = 2.618: the same pair, swapped. The inverse undoes each stretch."
          },
          formula: {
            simple: "<div class='g-math-block'>[[a, b], [c, d]]⁻¹ = 1/(ad − bc) · [[d, −b], [−c, a]]</div><p><b>a, b, c, d</b> = the four entries · <b>ad − bc</b> = the determinant (must not be 0).</p>",
            rigorous: "<div class='g-math-block'>A⁻¹ = adj(A)/det(A),  (AM)⁻¹ = M⁻¹A⁻¹,  (Aᵀ)⁻¹ = (A⁻¹)ᵀ</div><p>For symmetric A with eigen-decomposition QΛQᵀ: A⁻¹ = QΛ⁻¹Qᵀ, so A⁻¹ has the same eigenvectors and eigenvalues 1/λᵢ.</p>",
            conditions: [
              "Only square matrices can have an inverse.",
              "det(A) = 0 means <b>no inverse</b> (example: [[1, 2], [2, 4]], whose second row is twice the first).",
              "The 2×2 shortcut works only for 2×2 matrices."
            ]
          },
          lab: [
            { label: "Professor's A", note: "Check the inverse card shows [[2, −1], [−1, 1]].", screen: "matrix", set: { a11: 1, a12: 1, a22: 2 } },
            { label: "A matrix with no inverse", note: "A = [[1, 2], [2, 4]]: det = 0. Watch how the site reports it.", screen: "matrix", set: { a11: 1, a12: 2, a22: 4 } }
          ],
          business: [
            { title: "Solving simultaneous equations", body: "Two first-order conditions in two unknowns, like the firm's optimal outputs in Theme 2, are a 2×2 system. The optimum q* = ½B⁻¹(α − c) uses B's inverse." },
            { title: "Input-output analysis", body: "Leontief's economy-wide model computes how much each industry must produce to meet final demand using (I − A)⁻¹." }
          ],
          mistakes: [
            { wrong: "Inverting every entry: [[1, 1], [1, 1/2]].", right: "Use the swap-negate-divide formula." },
            { wrong: "Forgetting to divide by det(A).", right: "Here det = 1 hides the step; for other matrices it matters." },
            { wrong: "Trying to invert when det(A) = 0.", right: "Check the determinant first." }
          ],
          quiz: [
            { q: "det([[1, 2], [2, 4]]) = ?", options: ["0", "8", "−2"], answer: 0, explain: "1·4 − 2·2 = 0, so this matrix has no inverse." },
            { q: "Which is A⁻¹ for A = [[1, 1], [1, 2]]?", options: ["[[1, 1], [1, 0.5]]", "[[2, −1], [−1, 1]]", "[[−1, 1], [1, −2]]"], answer: 1, explain: "Swap diagonal, negate off-diagonal, divide by det = 1." },
            { q: "If A has an eigenvalue 0, does A⁻¹ exist?", options: ["Yes", "No"], answer: 1, explain: "Some nonzero arrow is sent to 0 and cannot be recovered." }
          ],
          references: [
            { kind: "Course text", source: "Sydsæter, Hammond et al., Essential Mathematics for Economic Analysis", where: "Ch. 13, determinants and inverses", why: "Economic applications of inverses." },
            { kind: "MIT", source: "Gilbert Strang, 18.06 Linear Algebra", where: "Lecture 3: Multiplication and inverse matrices", why: "Gauss-Jordan view of the inverse.", url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/resources/lecture-3-multiplication-and-inverse-matrices/" },
            { kind: "Georgia Tech", source: "Margalit & Rabinoff, Interactive Linear Algebra", where: "§3.5 Matrix Inverses", why: "Inverse as the undo transformation.", url: "https://textbooks.math.gatech.edu/ila/matrix-inverses.html" },
            { kind: "Video", source: "3Blue1Brown, Essence of Linear Algebra", where: "Chapter 7: Inverse matrices, column space, and null space", why: "When squashing makes undo impossible.", url: "https://www.3blue1brown.com/lessons/inverse-matrices" }
          ]
        },

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
              title: "Theme 3 connection",
              body: "In q(x) = xᵀAx, the eigenvectors are the tilt of the contour ellipses. The bigger eigenvalue is the <b>steeper</b> direction, so its ellipse axis is the <b>shorter</b> one (semi-axis = 1/√λ on the level set q = 1)."
            },
            {
              title: "Theme 2 connection",
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

        /* ======================= SPECTRAL DECOMPOSITION ======================= */
        {
          id: "spectral",
          title: "Spectral decomposition A = QΛQᵀ",
          status: "ready",
          minutes: 12,
          summary: "Rebuild A from its eigenvectors and eigenvalues: rotate, stretch, rotate back.",
          intuition: {
            simple:
              "<p>The eigen lesson found two perpendicular special directions and their stretch factors. The <b>spectral decomposition</b> says that's <i>all</i> A does: it is nothing more than “stretch 2.618× along u₁ and 0.382× along u₂.”</p>" +
              "<p>Written as three steps, A = Q·Λ·Qᵀ reads right to left: <b>Qᵀ</b> turns the picture so the eigen-directions line up with the x and y axes; <b>Λ</b> (a diagonal matrix) stretches each axis by its eigenvalue; <b>Q</b> turns the picture back.</p>" +
              "<p class='g-analogy'><b>Business analogy:</b> a messy correlated risk picture becomes simple if you measure it along the right “factors.” Change coordinates, scale each factor separately, change back.</p>",
            rigorous:
              "<p><b>Spectral theorem:</b> every real symmetric matrix A can be written A = QΛQᵀ, where Q is orthogonal (QᵀQ = I; its columns are orthonormal eigenvectors) and Λ = diag(λ₁, …, λₙ) holds the real eigenvalues.</p>" +
              "<p>Equivalently, A = Σ λᵢ uᵢuᵢᵀ, a weighted sum of rank-one projection matrices uᵢuᵢᵀ onto each eigen-direction.</p>"
          },
          example: {
            intro: "Use the unit eigenvectors from the eigen lesson: u₁ = (0.526, 0.851) for λ₁ = 2.618 and u₂ = (0.851, −0.526) for λ₂ = 0.382.",
            steps: [
              { title: "Build Q and Λ", body: "Put the unit eigenvectors in the columns of Q, in the same order as the eigenvalues on the diagonal of Λ.", math: "Q = [[0.526, 0.851], [0.851, −0.526]]     Λ = [[2.618, 0], [0, 0.382]]" },
              { title: "Check Q is a pure rotation/reflection", body: { simple: "Each column has length 1, and the columns are perpendicular. So Qᵀ undoes Q: QᵀQ = I.", rigorous: "QᵀQ = I, so Q⁻¹ = Qᵀ. Here det Q = −1 (a reflection); flipping the sign of u₂ would make it a rotation. Either is valid." }, math: "0.526² + 0.851² = 1     0.526·0.851 + 0.851·(−0.526) = 0" },
              { title: "First piece: λ₁·u₁u₁ᵀ", body: "u₁u₁ᵀ is a 2×2 matrix (column times row). Multiply it by 2.618.", math: "u₁u₁ᵀ = [[0.276, 0.447], [0.447, 0.724]]  →  ×2.618 = [[0.724, 1.171], [1.171, 1.894]]" },
              { title: "Second piece: λ₂·u₂u₂ᵀ", body: "Same for the second direction, times 0.382.", math: "u₂u₂ᵀ = [[0.724, −0.447], [−0.447, 0.276]]  →  ×0.382 = [[0.276, −0.171], [−0.171, 0.106]]" },
              { title: "Add the pieces: A is back", body: "The two pieces sum to the professor's matrix (up to rounding).", math: "[[0.724 + 0.276, 1.171 − 0.171], [1.171 − 0.171, 1.894 + 0.106]] = [[1, 1], [1, 2]] ✓" },
              { title: "Why bother? Powers become easy", body: { simple: "To compute A⁵ you only raise the eigenvalues to the 5th power: A⁵ = Q·Λ⁵·Qᵀ.", rigorous: "Aᵏ = QΛᵏQᵀ, A⁻¹ = QΛ⁻¹Qᵀ, A^{1/2} = QΛ^{1/2}Qᵀ. Any function of A acts on its eigenvalues." }, math: "A⁵ = Q·diag(2.618⁵, 0.382⁵)·Qᵀ = [[34, 55], [55, 89]]" }
            ]
          },
          formula: {
            simple: "<div class='g-math-block'>A = Q·Λ·Qᵀ = λ₁·u₁u₁ᵀ + λ₂·u₂u₂ᵀ</div><p><b>Q</b> = unit eigenvectors as columns · <b>Λ</b> (capital lambda) = eigenvalues on the diagonal · <b>Qᵀ</b> = Q flipped over its diagonal (its inverse).</p>",
            rigorous: "<div class='g-math-block'>A = Aᵀ ∈ ℝⁿˣⁿ  ⇒  A = QΛQᵀ,  QᵀQ = I,  Λ = diag(λ₁,…,λₙ)</div><p>Quadratic forms diagonalize too: with y = Qᵀx, xᵀAx = Σ λᵢyᵢ². This is the bridge to Theme 3 (principal axes).</p>",
            conditions: [
              "This orthogonal version requires a <b>symmetric</b> matrix (A = Aᵀ). The professor's A qualifies.",
              "Non-symmetric matrices may be diagonalized as A = PDP⁻¹ (P not orthogonal), or not at all (a shear).",
              "Eigenvectors must be <b>unit length</b> and in the same order as the eigenvalues in Λ.",
              "Spectral works for any symmetric matrix, including indefinite ones; Cholesky does not."
            ]
          },
          lab: [
            { label: "See the pieces and verification", note: "Open the spectral card's “Show the pieces & verification.”", screen: "matrix", set: { a11: 1, a12: 1, a22: 2 } },
            { label: "Try an indefinite matrix", note: "A = [[1, 2], [2, 1]] (λ = 3 and −1). Spectral still works.", screen: "matrix", set: { a11: 1, a12: 2, a22: 1 } }
          ],
          business: [
            { title: "Principal component analysis", body: "Applying the spectral decomposition to a covariance matrix gives PCA: uncorrelated factors (eigenvectors) and how much variance each carries (eigenvalues)." },
            { title: "Theme 3 connection", body: "Rotating into eigen-coordinates turns q = x² + 2xy + 2y² into 2.618s² + 0.382t², with no cross term. That's why the level sets are tilted ellipses." }
          ],
          mistakes: [
            { wrong: "Using unnormalized eigenvectors like (1, 1.618) in Q.", right: "Divide by the length so each column has length 1." },
            { wrong: "Mismatching order: λ₁ with u₂.", right: "Column i of Q must go with diagonal entry i of Λ." },
            { wrong: "Writing QΛQ⁻¹ and forgetting Q⁻¹ = Qᵀ.", right: "For orthogonal Q they are the same; Qᵀ is easier." }
          ],
          quiz: [
            { q: "Why is Qᵀ = Q⁻¹ here?", options: ["Because A is invertible", "Because Q's columns are perpendicular unit vectors", "It's never true"], answer: 1, explain: "Orthonormal columns make QᵀQ = I." },
            { q: "What is A⁻¹ in spectral form?", options: ["QΛ⁻¹Qᵀ", "Q⁻¹ΛQ", "−QΛQᵀ"], answer: 0, explain: "Invert each eigenvalue; keep the eigenvectors." },
            { q: "Can the indefinite matrix [[1, 2], [2, 1]] have a spectral decomposition?", options: ["Yes, it's symmetric", "No, an eigenvalue is negative"], answer: 0, explain: "Only symmetry is required; negative eigenvalues are fine." }
          ],
          references: [
            { kind: "Course text", source: "Liesen & Mehrmann, Linear Algebra (2nd ed.)", where: "§14.2 diagonalization; Ch. 18 symmetric matrices", why: "Spectral theorem with proof." },
            { kind: "MIT", source: "Gilbert Strang, 18.06 Linear Algebra", where: "Lecture 22: Diagonalization and powers of A; Lecture 25: Symmetric matrices", why: "Why symmetric matrices give QΛQᵀ.", url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/resources/lecture-25-symmetric-matrices-and-positive-definiteness/" },
            { kind: "Georgia Tech", source: "Margalit & Rabinoff, Interactive Linear Algebra", where: "§5.4 Diagonalization", why: "Diagonalization as a change of coordinates.", url: "https://textbooks.math.gatech.edu/ila/diagonalization.html" },
            { kind: "Video", source: "3Blue1Brown, Essence of Linear Algebra", where: "Chapter 14, “Working in an eigenbasis”", why: "Why diagonal matrices are easy.", url: "https://www.3blue1brown.com/lessons/eigenvalues" }
          ]
        },

        /* ======================= CHOLESKY ======================= */
        {
          id: "cholesky",
          title: "Cholesky decomposition A = LLᵀ",
          status: "ready",
          minutes: 12,
          summary: "A “square root” of a positive-definite matrix using a triangular factor.",
          intuition: {
            simple:
              "<p>Every positive number has a square root: 4 = 2·2. Cholesky does the same for certain matrices: it finds a <b>lower triangular</b> L (zeros above the diagonal) with A = L·Lᵀ.</p>" +
              "<p>It only works for <b>positive-definite</b> matrices, the matrix version of “positive number.” If you try it on a matrix that isn't, the recipe asks you to take the square root of a negative number and stops.</p>" +
              "<p class='g-analogy'><b>Business analogy:</b> banks use Cholesky to simulate assets that move together. Start with independent random shocks, multiply by L, and the shocks come out with exactly the correlation you wanted.</p>",
            rigorous:
              "<p>If A is symmetric positive definite, there is a unique lower-triangular L with positive diagonal such that A = LLᵀ. It is computed column by column: lⱼⱼ = √(aⱼⱼ − Σₖ<ⱼ lⱼₖ²), lᵢⱼ = (aᵢⱼ − Σₖ<ⱼ lᵢₖlⱼₖ)/lⱼⱼ for i &gt; j.</p>" +
              "<p>Existence of a Cholesky factor is itself a test of positive definiteness, and it gives xᵀAx = ‖Lᵀx‖², a sum of squares.</p>"
          },
          example: {
            intro: "A = [[1, 1], [1, 2]]. We want L = [[l₁₁, 0], [l₂₁, l₂₂]] with L·Lᵀ = A.",
            steps: [
              { title: "Write out L·Lᵀ", body: "Multiply the unknown L by its transpose and match each entry with A.", math: "L·Lᵀ = [[l₁₁², l₁₁l₂₁], [l₁₁l₂₁, l₂₁² + l₂₂²]] = [[1, 1], [1, 2]]" },
              { title: "Top-left", body: "l₁₁² = 1, so l₁₁ = 1 (take the positive root).", math: "l₁₁ = √1 = 1" },
              { title: "Off-diagonal", body: "l₁₁·l₂₁ = 1 and l₁₁ = 1, so l₂₁ = 1.", math: "l₂₁ = 1/1 = 1" },
              { title: "Bottom-right", body: "l₂₁² + l₂₂² = 2, so l₂₂² = 2 − 1 = 1. This is where it would fail if the number were negative.", math: "l₂₂ = √(2 − 1) = 1" },
              { title: "Result and check", body: "Multiply back to confirm.", math: "L = [[1, 0], [1, 1]]     L·Lᵀ = [[1, 1], [1, 2]] ✓" },
              { title: "Bonus: a sum of squares", body: { simple: "Cholesky rewrites the quadratic form as squares, which proves it can never be negative.", rigorous: "xᵀAx = ‖Lᵀx‖² with Lᵀx = (x + y, y). Positive for every (x, y) ≠ 0, so A is positive definite." }, math: "x² + 2xy + 2y² = (x + y)² + y²" },
              { title: "Watch it fail", body: "Try [[1, 2], [2, 1]] (eigenvalues 3 and −1, not positive definite). Same steps: l₁₁ = 1, l₂₁ = 2, then l₂₂² = 1 − 4.", math: "l₂₂ = √(1 − 4) = √(−3)  ✗  no real Cholesky factor" }
            ]
          },
          formula: {
            simple: "<div class='g-math-block'>A = L·Lᵀ,   L = [[√a, 0], [b/√a, √(d − b²/a)]]   for A = [[a, b], [b, d]]</div><p><b>L</b> = lower triangular factor · <b>Lᵀ</b> = its transpose (upper triangular) · a, b, d = entries of A.</p>",
            rigorous: "<div class='g-math-block'>A = Aᵀ ≻ 0  ⇔  A = LLᵀ with L lower triangular, lᵢᵢ &gt; 0 (unique)</div><p>Cost ≈ n³/3 operations, about half of LU. Solving Ax = b becomes two triangular solves: Ly = b, then Lᵀx = y.</p>",
            conditions: [
              "A must be <b>symmetric</b>.",
              "A must be <b>positive definite</b> (all eigenvalues &gt; 0). Otherwise a square root of a negative number (or a division by zero) appears.",
              "Cholesky is not the same as spectral: L is triangular, not made of eigenvectors.",
              "A matrix square root is not unique; Cholesky picks the triangular one."
            ]
          },
          lab: [
            { label: "Professor's A", note: "The Cholesky card should show L = [[1, 0], [1, 1]].", screen: "matrix", set: { a11: 1, a12: 1, a22: 2 } },
            { label: "Make Cholesky fail", note: "A = [[1, 2], [2, 1]] is indefinite. Check what the card says.", screen: "matrix", set: { a11: 1, a12: 2, a22: 1 } },
            { label: "The sum-of-squares picture", note: "Geometry Explorer with the professor's A: every contour is positive.", screen: "geometry", preset: "prof" }
          ],
          business: [
            { title: "Monte Carlo with correlated assets", body: "If z holds independent standard shocks and Σ = LLᵀ is a target covariance matrix, then x = Lz has covariance Σ. That is how correlated price paths are simulated for risk models." },
            { title: "A positive-definiteness test", body: "Software checks whether a covariance or Hessian matrix is positive definite by simply attempting Cholesky. In Theme 2, that checks whether the profit function has a unique maximum." }
          ],
          mistakes: [
            { wrong: "Running Cholesky on any symmetric matrix.", right: "It must be positive definite." },
            { wrong: "Thinking L is made of eigenvectors.", right: "That's spectral (Q). Cholesky's L is triangular." },
            { wrong: "Taking a negative root for l₁₁.", right: "The convention is a positive diagonal, which makes L unique." }
          ],
          quiz: [
            { q: "What is l₂₂ for A = [[1, 1], [1, 2]]?", options: ["√2", "1", "0"], answer: 1, explain: "l₂₂² = 2 − l₂₁² = 2 − 1 = 1." },
            { q: "Why does Cholesky fail on [[1, 2], [2, 1]]?", options: ["It isn't symmetric", "It isn't positive definite", "Its determinant is positive"], answer: 1, explain: "Eigenvalues are 3 and −1; the recipe needs √(−3)." },
            { q: "x² + 2xy + 2y² equals which sum of squares?", options: ["(x + y)² + y²", "(x + 2y)²", "x² + (x + y)²"], answer: 0, explain: "(x + y)² + y² = x² + 2xy + y² + y²." }
          ],
          references: [
            { kind: "Course text", source: "Liesen & Mehrmann, Linear Algebra (2nd ed.)", where: "§18.3 positive definiteness and Cholesky", why: "Existence and uniqueness proof." },
            { kind: "MIT", source: "Gilbert Strang, 18.06 Linear Algebra", where: "Lecture 25: Symmetric matrices and positive definiteness", why: "Pivots, eigenvalues and determinants as PD tests.", url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/resources/lecture-25-symmetric-matrices-and-positive-definiteness/" },
            { kind: "MIT", source: "Gilbert Strang, 18.06 Linear Algebra", where: "Lecture 4: Factorization into A = LU", why: "Cholesky is the symmetric version of LU.", url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/resources/lecture-4-factorization-into-a-lu/" }
          ]
        }
      ]
    },

    /* ------------------------------------------------------------ */
    {
      id: "p3",
      presentation: 3,
      title: "Quadratic Forms & Level Sets",
      tagline: "How a matrix becomes a landscape",
      concepts: [
        /* ======================= QUADRATIC FORM ======================= */
        {
          id: "qform",
          title: "What is a quadratic form?",
          status: "ready",
          minutes: 10,
          summary: "A height formula built from a symmetric matrix: q(x, y) = ax² + 2bxy + dy².",
          intuition: {
            simple:
              "<p>A <b>quadratic form</b> gives every point (x, y) a height, using only squared terms and one cross term: q(x, y) = ax² + 2bxy + dy². No plain x, no plain y, no constant.</p>" +
              "<p>Its three numbers fit into a symmetric matrix [[a, b], [b, d]]. The cross-term coefficient 2b is <b>split in half</b>: b goes top-right and b goes bottom-left.</p>" +
              "<p>For the professor's A = [[1, 1], [1, 2]]: q(x, y) = x² + 2xy + 2y².</p>" +
              "<p class='g-analogy'><b>Business analogy:</b> the risk (variance) of a two-asset portfolio is a quadratic form in the weights. The cross term is where correlation lives.</p>",
            rigorous:
              "<p>A quadratic form on ℝⁿ is q(x) = xᵀAx with A symmetric. For n = 2, xᵀAx = a x² + 2b xy + d y².</p>" +
              "<p>Any non-symmetric matrix M gives the same form as its symmetric part (M + Mᵀ)/2, so we lose nothing by insisting on symmetry, and symmetry gives us the spectral theorem. Quadratic forms are homogeneous of degree 2: q(tx) = t²q(x).</p>"
          },
          example: {
            intro: "q(x, y) = [x  y]·[[1, 1], [1, 2]]·[x  y]ᵀ.",
            steps: [
              { title: "Multiply the matrix by the vector", body: "First compute A·(x, y).", math: "A·(x, y) = (x + y, x + 2y)" },
              { title: "Dot with (x, y) again", body: "Multiply matching entries and add, then simplify.", math: "x(x + y) + y(x + 2y) = x² + xy + xy + 2y² = x² + 2xy + 2y²" },
              { title: "Evaluate some heights", body: "Plug in points. Every result is positive, which hints at a bowl shape.", math: "q(1, 0) = 1   q(0, 1) = 2   q(1, 1) = 5   q(1, −1) = 1" },
              { title: "Scaling a point", body: { simple: "Double the point and the height quadruples. That's the “squared” behavior.", rigorous: "Homogeneity: q(2x) = 4q(x). Level sets are therefore scaled copies of each other." }, math: "q(2, 2) = 20 = 4 × q(1, 1)" },
              { title: "Going backwards: form → matrix", body: "Given q = 3x² + 8xy − y², the diagonal takes the squared coefficients and the off-diagonals take <b>half</b> the cross coefficient.", math: "3x² + 8xy − y²  →  [[3, 4], [4, −1]]" }
            ]
          },
          formula: {
            simple: "<div class='g-math-block'>q(x, y) = ax² + 2bxy + dy² = [x y]·[[a, b], [b, d]]·[x y]ᵀ</div><p><b>a</b> = curvature along x · <b>d</b> = curvature along y · <b>b</b> = cross effect, how x and y interact.</p>",
            rigorous: "<div class='g-math-block'>q(x) = xᵀAx,  A = Aᵀ,  ∇q = 2Ax,  Hessian = 2A</div><p>In eigen-coordinates y = Qᵀx: q = λ₁y₁² + λ₂y₂². The eigenvalues decide the shape (next lessons).</p>",
            conditions: [
              "The cross coefficient is <b>2b</b>; the matrix entry is b.",
              "A quadratic form has no linear or constant terms. With them (like the profit function) it's a general quadratic function, whose curvature still comes from the quadratic-form part.",
              "q(0, 0) = 0 always."
            ]
          },
          lab: [
            { label: "Professor's A as a landscape", note: "Geometry Explorer: q = x² + 2xy + 2y². Drag the 3D surface.", screen: "geometry", preset: "prof" },
            { label: "Turn off the cross effect", note: "Set b = 0: q = x² + 2y². The ellipses stop being tilted.", screen: "geometry", set: { "g-a": 1, "g-b": 0, "g-d": 2 } }
          ],
          business: [
            { title: "Portfolio variance", body: "Var(w₁R₁ + w₂R₂) = σ₁²w₁² + 2σ₁₂w₁w₂ + σ₂²w₂² = wᵀΣw. A quadratic form with the covariance matrix Σ." },
            { title: "Theme 2 connection", body: "Profit contains −qᵀBq. Its cross term 2γq₁q₂ comes from substitute products pushing each other's prices down." }
          ],
          mistakes: [
            { wrong: "Putting the full cross coefficient off-diagonal: 2xy → [[1, 2], [2, 2]].", right: "Use half: [[1, 1], [1, 2]]." },
            { wrong: "Treating x² + 2xy + 2y² + 3x as a quadratic form.", right: "The 3x term makes it a general quadratic function." }
          ],
          quiz: [
            { q: "Which matrix gives q = 2x² + 6xy + 5y²?", options: ["[[2, 6], [6, 5]]", "[[2, 3], [3, 5]]", "[[2, 3], [0, 5]]"], answer: 1, explain: "Half of 6 goes in each off-diagonal spot." },
            { q: "For the professor's form, what is q(1, −1)?", options: ["1", "5", "−1"], answer: 0, explain: "1 − 2 + 2 = 1." },
            { q: "If q(x, y) = 7, what is q(3x, 3y)?", options: ["21", "63", "49"], answer: 1, explain: "Height scales by 3² = 9; 9 × 7 = 63." }
          ],
          references: [
            { kind: "Course text", source: "Liesen & Mehrmann, Linear Algebra (2nd ed.)", where: "§11.2 bilinear forms; §18.3 quadratic forms", why: "Formal definition." },
            { kind: "Course text", source: "Sydsæter, Hammond et al., Essential Mathematics for Economic Analysis", where: "Ch. 13, quadratic forms", why: "Economics-oriented treatment and exercises." },
            { kind: "MIT", source: "Gilbert Strang, 18.06 Linear Algebra", where: "Lecture 27: Positive definite matrices and minima", why: "xᵀAx as a surface; tests for a bowl.", url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/resources/lecture-27-positive-definite-matrices-and-minima/" }
          ]
        },

        /* ======================= LEVEL SETS ======================= */
        {
          id: "levels",
          title: "Level sets and contours",
          status: "ready",
          minutes: 12,
          summary: "All points with the same height. For the professor's A: tilted ellipses whose axes are the eigenvectors.",
          intuition: {
            simple:
              "<p>A <b>level set</b> is every point with the same height, like the contour lines on a hiking map. For q(x, y) = k you collect all (x, y) where the formula gives exactly k.</p>" +
              "<p>For the professor's A, every positive level is an <b>ellipse</b>, tilted along the eigenvector directions. The bigger eigenvalue (2.618) is the <b>steep</b> direction: height grows fast, so you reach level k after a <b>short</b> walk. The small eigenvalue (0.382) is the gentle direction, so that axis is <b>long</b>.</p>" +
              "<p class='g-analogy'><b>Business analogy:</b> in Theme 2, the iso-profit curves (all output mixes earning the same profit) are exactly this kind of contour.</p>",
            rigorous:
              "<p>The level set of q at k is L_k = {x : xᵀAx = k}. In eigen-coordinates y = Qᵀx, it becomes λ₁y₁² + λ₂y₂² = k. For λ₁, λ₂ &gt; 0 and k &gt; 0 this is an ellipse with semi-axes √(k/λ₁) along u₁ and √(k/λ₂) along u₂ (the principal axes theorem).</p>" +
              "<p>Since q(tx) = t²q(x), L_k = √k · L₁: contours are scaled copies, and equally spaced heights give contours that get closer together as you go up.</p>"
          },
          example: {
            intro: "Level sets of q = x² + 2xy + 2y² for the professor's A.",
            steps: [
              { title: "Points on the level q = 1", body: "Find a few points with height exactly 1.", math: "q(1, 0) = 1   q(−1, 0) = 1   q(1, −1) = 1   q(0, ±0.707) = 1" },
              { title: "Rotate into eigen-coordinates", body: { simple: "Measure position along u₁ (call it s) and along u₂ (call it t) instead of along x and y. The cross term disappears.", rigorous: "With (s, t) = Qᵀ(x, y): q = 2.618s² + 0.382t², an axis-aligned ellipse in (s, t)." }, math: "q = 2.618·s² + 0.382·t²" },
              { title: "Read off the semi-axes for q = 1", body: "Set t = 0 and solve for s, then set s = 0 and solve for t.", math: "s = 1/√2.618 ≈ 0.618 (along u₁)     t = 1/√0.382 ≈ 1.618 (along u₂)" },
              { title: "Other levels", body: "Level k is the q = 1 ellipse scaled by √k.", math: "q = 4: semi-axes 1.236 and 3.236     q = 9: semi-axes 1.854 and 4.854" },
              { title: "Same answer from Cholesky", body: "q = (x + y)² + y². In the coordinates (x + y, y), level sets are circles; in (x, y) they're the same tilted ellipses.", math: "(x + y)² + y² = k" }
            ],
            funFact: "The semi-axes for q = 1 are 0.618 and 1.618 = 1/φ and φ: the golden ratio again."
          },
          formula: {
            simple: "<div class='g-math-block'>Level set at height k:   λ₁s² + λ₂t² = k   →   semi-axes √(k/λ₁) and √(k/λ₂)</div><p><b>k</b> = the chosen height · <b>s, t</b> = coordinates along the two eigenvectors · <b>λ₁, λ₂</b> = eigenvalues.</p>",
            rigorous: "<div class='g-math-block'>L_k = {x : xᵀAx = k} = Q·{y : Σ λᵢyᵢ² = k}</div><p>Semi-axis lengths √(k/λᵢ) along uᵢ. The ratio of axes, √(λ₁/λ₂), measures how stretched (ill-conditioned) the bowl is.</p>",
            conditions: [
              "Ellipses only when both eigenvalues have the same sign as k. Other cases are in the Shape Gallery.",
              "Larger eigenvalue ⇒ steeper ⇒ <b>shorter</b> axis.",
              "Level k = 0 for a positive-definite form is just the single point (0, 0)."
            ]
          },
          lab: [
            { label: "Tilted ellipses", note: "Professor's A in Geometry Explorer. Find the short axis along the 2.618 direction.", screen: "geometry", preset: "prof" },
            { label: "Equal eigenvalues → circles", note: "The Circle preset (identity matrix): every direction equally steep.", screen: "geometry", preset: "circle" },
            { label: "Very stretched bowl", note: "a = 1, b = 0, d = 3: eigenvalues 1 and 3, axes in ratio √3.", screen: "geometry", set: { "g-a": 1, "g-b": 0, "g-d": 3 } }
          ],
          business: [
            { title: "Iso-profit curves", body: "In the firm simulator, the profit contours around the optimum are ellipses because π = constant − (q − q*)ᵀB(q − q*) when B is positive definite." },
            { title: "Iso-risk curves", body: "All portfolios with the same variance lie on an ellipse wᵀΣw = k. Its long axis is the low-risk direction of combination." }
          ],
          mistakes: [
            { wrong: "Assuming the biggest eigenvalue gives the longest axis.", right: "It gives the shortest axis on the level set." },
            { wrong: "Expecting the ellipse to line up with the x and y axes.", right: "With b ≠ 0 it's tilted along the eigenvectors." },
            { wrong: "Thinking equally spaced contours mean equal height steps.", right: "For a bowl, equal height steps squeeze contours closer as height rises." }
          ],
          quiz: [
            { q: "On the level q = 1 of the professor's form, which axis is longer?", options: ["Along u₁ (λ = 2.618)", "Along u₂ (λ = 0.382)", "They're equal"], answer: 1, explain: "1/√0.382 ≈ 1.618 > 1/√2.618 ≈ 0.618." },
            { q: "How do the semi-axes change from q = 1 to q = 4?", options: ["×4", "×2", "Unchanged"], answer: 1, explain: "They scale by √4 = 2." },
            { q: "When are the level sets circles?", options: ["When λ₁ = λ₂ > 0", "When b > 0", "When det = 0"], answer: 0, explain: "Equal curvature in every direction." }
          ],
          references: [
            { kind: "Course text", source: "Liesen & Mehrmann, Linear Algebra (2nd ed.)", where: "§18.3 principal axes", why: "Principal axis transformation." },
            { kind: "Course text", source: "Sydsæter, Hammond et al., Essential Mathematics for Economic Analysis", where: "Ch. 14, level curves of functions of two variables", why: "Level curves in economics (isoquants, indifference curves)." },
            { kind: "MIT", source: "Gilbert Strang, 18.06 Linear Algebra", where: "Lecture 27: Positive definite matrices and minima", why: "Ellipses from xᵀAx = 1 and their axes.", url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/resources/lecture-27-positive-definite-matrices-and-minima/" }
          ]
        },

        /* ======================= SHAPE GALLERY ======================= */
        {
          id: "gallery",
          title: "Shape gallery: every case side by side",
          status: "ready",
          minutes: 10,
          summary: "Six matrices, six landscapes: bowl, circle, tilted bowl, hill, saddle and valley.",
          intuition: {
            simple:
              "<p>Every 2×2 quadratic form looks like one of a handful of shapes. Which one depends only on the <b>signs of its two eigenvalues</b>:</p>" +
              "<p>both positive → a <b>bowl</b> (ellipse contours) · both negative → a <b>hill</b> · one positive and one negative → a <b>saddle</b> (like a horse saddle or a Pringle) · one zero → a <b>valley</b> or ridge, flat in one direction.</p>" +
              "<p>Click through each example in the lab and compare the 2D contours with the 3D surface.</p>",
            rigorous:
              "<p>By Sylvester's law of inertia, the numbers of positive, negative and zero eigenvalues (the inertia) are invariant under change of basis. For n = 2 this gives the complete classification: positive/negative definite (elliptic), indefinite (hyperbolic), semidefinite (parabolic cylinder / degenerate).</p>"
          },
          example: {
            intro: "Each step is one shape. Eigenvalues are shown so you can check the rule.",
            steps: [
              { title: "Circle bowl: I = [[1, 0], [0, 1]]", body: "q = x² + y². Equal curvature everywhere, circular contours.", math: "λ = 1, 1   → positive definite, circles" },
              { title: "Tilted bowl: professor's A = [[1, 1], [1, 2]]", body: "q = x² + 2xy + 2y². Ellipses tilted along the eigenvectors.", math: "λ = 2.618, 0.382   → positive definite, tilted ellipses" },
              { title: "Hill: −A = [[−1, −1], [−1, −2]]", body: "The bowl turned upside down. Contours are the same ellipses, at negative heights. A profit function with a maximum looks like this.", math: "λ = −0.382, −2.618   → negative definite, maximum at the origin" },
              { title: "Saddle: [[1, 0], [0, −1]]", body: "q = x² − y². Up along x, down along y. Contours are hyperbolas, and the level 0 is two crossing lines y = ±x.", math: "λ = 1, −1   → indefinite, no max and no min" },
              { title: "Tilted saddle: [[1, 2], [2, 1]]", body: "Positive diagonal, but the cross term is too strong: det = 1 − 4 = −3 &lt; 0.", math: "λ = 3, −1   → indefinite" },
              { title: "Valley: [[1, 1], [1, 1]]", body: "q = (x + y)². Zero all along the line y = −x, so contours are parallel lines. Many points tie for the minimum.", math: "λ = 2, 0   → positive semidefinite, flat direction" }
            ]
          },
          formula: {
            simple: "<div class='g-math-block'>signs of (λ₁, λ₂):  (+,+) bowl · (−,−) hill · (+,−) saddle · (+,0) or (−,0) valley/ridge</div>",
            rigorous: "<div class='g-math-block'>inertia(A) = (#λ&gt;0, #λ&lt;0, #λ=0) determines the shape up to rotation and scaling</div>",
            conditions: [
              "Shape depends only on the eigenvalue <b>signs</b>. Their sizes control how stretched it is; the eigenvectors control the tilt.",
              "A positive diagonal (a, d &gt; 0) is <b>not</b> enough for a bowl; [[1, 2], [2, 1]] is a saddle."
            ]
          },
          lab: [
            { label: "Circle", note: "Identity matrix.", screen: "geometry", preset: "circle" },
            { label: "Professor's tilted bowl", note: "A = [[1, 1], [1, 2]].", screen: "geometry", preset: "prof" },
            { label: "Hill", note: "Negative definite.", screen: "geometry", preset: "negative" },
            { label: "Saddle", note: "Indefinite: hyperbola contours.", screen: "geometry", preset: "saddle" },
            { label: "Tilted saddle", note: "a = 1, b = 2, d = 1.", screen: "geometry", set: { "g-a": 1, "g-b": 2, "g-d": 1 } },
            { label: "Valley (flat direction)", note: "Positive semidefinite.", screen: "geometry", preset: "flat" }
          ],
          business: [
            { title: "Why shape decides optimization", body: "A hill has one top: a unique best decision. A saddle has none: whatever you choose, moving in some direction improves things. A valley/ridge has a tie: many equally good decisions." },
            { title: "Theme 2 connection", body: "Profit's quadratic part is −qᵀBq. If B is a bowl, −B is a hill and the firm has a unique best output mix. If substitution γ gets too strong, B becomes a saddle and the model breaks." }
          ],
          mistakes: [
            { wrong: "“Positive diagonal entries ⇒ bowl.”", right: "Check the determinant too; [[1, 2], [2, 1]] is a saddle." },
            { wrong: "Calling the valley case a bowl.", right: "With a zero eigenvalue there is a whole line of minimum points, not one." }
          ],
          quiz: [
            { q: "Eigenvalues 4 and −2. Which shape?", options: ["Bowl", "Hill", "Saddle"], answer: 2, explain: "Opposite signs ⇒ indefinite ⇒ saddle." },
            { q: "Which matrix gives a valley with a flat direction?", options: ["[[2, 0], [0, 2]]", "[[1, 1], [1, 1]]", "[[1, 0], [0, −1]]"], answer: 1, explain: "Eigenvalues 2 and 0." },
            { q: "A profit function needs which shape for a unique maximum?", options: ["Hill", "Bowl", "Saddle"], answer: 0, explain: "Negative definite: one top." }
          ],
          references: [
            { kind: "Course text", source: "Liesen & Mehrmann, Linear Algebra (2nd ed.)", where: "§18.3 quadratic forms and definiteness", why: "Classification by eigenvalue signs." },
            { kind: "MIT", source: "Gilbert Strang, 18.06 Linear Algebra", where: "Lecture 27: Positive definite matrices and minima", why: "Bowls vs saddles drawn by hand.", url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/resources/lecture-27-positive-definite-matrices-and-minima/" }
          ]
        },

        /* ======================= DEFINITENESS ======================= */
        {
          id: "definiteness",
          title: "Definiteness: the tests that decide the shape",
          status: "ready",
          minutes: 12,
          summary: "Classify any 2×2 symmetric matrix in seconds with the determinant and one corner entry.",
          intuition: {
            simple:
              "<p><b>Positive definite</b> means q(x, y) &gt; 0 for every point except the origin: a bowl. <b>Negative definite</b>: always &lt; 0, a hill. <b>Indefinite</b>: some points positive, some negative, a saddle. <b>Semidefinite</b>: never crosses zero but touches it along a line.</p>" +
              "<p>You don't need to compute eigenvalues every time. For 2×2 matrices, two quick numbers tell you everything: the <b>determinant</b> (product of the eigenvalues) and the <b>top-left entry a</b>.</p>",
            rigorous:
              "<p>For A = [[a, b], [b, d]]: det A = λ₁λ₂ and tr A = λ₁ + λ₂. If det A &gt; 0 the eigenvalues share a sign, given by the sign of a (equivalently of the trace). If det A &lt; 0 the signs differ. If det A = 0 at least one eigenvalue is zero.</p>" +
              "<p>In general, A ≻ 0 iff all leading principal minors are positive (Sylvester's criterion), iff all eigenvalues are positive, iff a Cholesky factor exists. For optimization: a critical point is a strict local maximum when the Hessian is negative definite.</p>"
          },
          example: {
            intro: "Apply the 2×2 test to four matrices.",
            steps: [
              { title: "Professor's A = [[1, 1], [1, 2]]", body: "a = 1 &gt; 0 and det = 1 &gt; 0.", math: "positive definite ✓ (eigenvalues 2.618, 0.382 confirm)" },
              { title: "[[1, 2], [2, 1]]", body: "det = 1 − 4 = −3 &lt; 0.", math: "indefinite (eigenvalues 3, −1)" },
              { title: "−A = [[−1, −1], [−1, −2]]", body: "a = −1 &lt; 0 and det = 2 − 1 = 1 &gt; 0.", math: "negative definite" },
              { title: "[[1, 1], [1, 1]]", body: "det = 0, a &gt; 0.", math: "positive semidefinite (eigenvalues 2, 0)" },
              { title: "Apply it to the firm's demand matrix", body: { simple: "The firm's B = [[β₁, γ], [γ, β₂]] = [[0.8, 0.25], [0.25, 0.9]]. β₁ &gt; 0, and det = 0.72 − 0.0625 = 0.6575 &gt; 0, so B is positive definite and profit has one peak.", rigorous: "B ≻ 0 ⇔ β₁ &gt; 0 and β₁β₂ &gt; γ². The profit Hessian is −2B ≺ 0, so π is strictly concave." }, math: "det B = 0.8·0.9 − 0.25² = 0.6575 > 0  ✓" },
              { title: "Where it breaks", body: "B stays positive definite only while γ² &lt; β₁β₂ = 0.72, i.e. γ &lt; 0.849. Beyond that, the substitution effect is stronger than the own-price effects, B turns into a saddle, and “maximize profit” has no interior answer.", math: "γ_max = √(0.8 × 0.9) ≈ 0.849" }
            ]
          },
          formula: {
            simple: "<div class='g-math-block'>det &gt; 0 and a &gt; 0 → positive definite\ndet &gt; 0 and a &lt; 0 → negative definite\ndet &lt; 0 → indefinite\ndet = 0 → semidefinite</div><p><b>det</b> = ad − b² · <b>a</b> = top-left entry.</p>",
            rigorous: "<div class='g-math-block'>A ≻ 0 ⇔ λᵢ &gt; 0 ∀i ⇔ leading minors &gt; 0 ⇔ ∃ Cholesky L ⇔ xᵀAx &gt; 0 ∀x ≠ 0</div><p>Second-order condition: ∇f(x*) = 0 and ∇²f(x*) ≺ 0 ⇒ strict local max; for a quadratic f, global.</p>",
            conditions: [
              "The quick test is for <b>symmetric 2×2</b> matrices.",
              "For semidefinite (det = 0), use the trace or a/d to tell positive from negative.",
              "Leading-minor tests detect definiteness; semidefiniteness needs <i>all</i> principal minors."
            ]
          },
          lab: [
            { label: "Positive definite", note: "Professor's A: the status strip should say positive definite.", screen: "geometry", preset: "prof" },
            { label: "Indefinite", note: "a = 1, b = 2, d = 1.", screen: "geometry", set: { "g-a": 1, "g-b": 2, "g-d": 1 } },
            { label: "Firm's B as a landscape", note: "a = 0.75, b = 0.25, d = 1 (sliders move in 0.25 steps, so this is close to B).", screen: "geometry", set: { "g-a": 0.75, "g-b": 0.25, "g-d": 1 } },
            { label: "Stress test: γ = 0.95", note: "Business Simulator with substitution above 0.849. B is no longer positive definite, so treat the solver's answer with suspicion.", screen: "business", set: { "firm-a1": 22, "firm-a2": 20, "firm-gamma": 0.95, "firm-cap1": 20, "firm-cap2": 21, "firm-b1": 0.8, "firm-b2": 0.9 } }
          ],
          business: [
            { title: "Second-order conditions", body: "Setting derivatives to zero finds candidates. Definiteness of the Hessian tells you whether a candidate is a maximum, a minimum, or a saddle." },
            { title: "Valid covariance matrices", body: "A covariance matrix must be positive semidefinite. Risk systems check this before running optimizations; a matrix assembled from inconsistent estimates can fail the test." }
          ],
          mistakes: [
            { wrong: "Checking only the diagonal.", right: "Check det too." },
            { wrong: "Forgetting that profit needs a <i>negative</i> definite Hessian.", right: "Profit = linear − qᵀBq, so we need B positive definite, i.e. −2B negative definite." }
          ],
          quiz: [
            { q: "[[2, 3], [3, 4]]: a = 2, det = 8 − 9 = −1. Classification?", options: ["Positive definite", "Indefinite", "Negative definite"], answer: 1, explain: "Negative determinant ⇒ opposite-sign eigenvalues." },
            { q: "With β₁ = 0.8 and β₂ = 0.9, which γ keeps B positive definite?", options: ["γ = 0.5", "γ = 0.9", "γ = 1.2"], answer: 0, explain: "Need γ² < 0.72: 0.25 < 0.72 ✓, 0.81 ✗, 1.44 ✗." },
            { q: "Profit's Hessian is −2B. For a unique max we need…", options: ["B negative definite", "B positive definite", "det B = 0"], answer: 1, explain: "Then −2B is negative definite: a hill." }
          ],
          references: [
            { kind: "Course text", source: "Sydsæter, Hammond et al., Essential Mathematics for Economic Analysis", where: "Ch. 13 (quadratic forms, definiteness) and Ch. 17 (second-order conditions)", why: "Exactly the economics use of these tests." },
            { kind: "Course text", source: "Liesen & Mehrmann, Linear Algebra (2nd ed.)", where: "§18.3 positive definiteness", why: "Equivalence of the tests." },
            { kind: "MIT", source: "Gilbert Strang, 18.06 Linear Algebra", where: "Lecture 25 and Lecture 27", why: "Four equivalent tests for positive definiteness.", url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/resources/lecture-27-positive-definite-matrices-and-minima/" }
          ]
        }
      ]
    },

    /* ------------------------------------------------------------ */
    {
      id: "p2",
      presentation: 2,
      title: "The Two-Product Firm",
      tagline: "From linear demand to a quadratic profit objective",
      concepts: [
        /* ======================= DEMAND ======================= */
        {
          id: "demand",
          title: "Linear demand for substitutes",
          status: "ready",
          minutes: 12,
          summary: "Two prices that fall as either product's output rises, written as P = α − Bq.",
          intuition: {
            simple:
              "<p>Our firm sells two products that are <b>substitutes</b>: customers see them as alternatives (two phone models, two soft drinks). Two things happen when the firm sells more:</p>" +
              "<p>• selling more of product 1 pushes <b>its own</b> price down (the own effect, β₁);<br>• selling more of product 2 <b>also</b> pushes product 1's price down a bit, because some customers switch (the cross effect, γ).</p>" +
              "<p>Both price equations are straight-line (linear) formulas, and they stack into one matrix equation.</p>" +
              "<p class='g-analogy'><b>Business analogy:</b> launch a cheaper second model and the first model has to be discounted to keep selling. That's γ &gt; 0.</p>",
            rigorous:
              "<p>Linear inverse demand: p₁ = α₁ − β₁q₁ − γq₂, p₂ = α₂ − γq₁ − β₂q₂, i.e. <span class='g-m'>P(q) = α − Bq</span>, B = [[β₁, γ], [γ, β₂]].</p>" +
              "<p>Sign of γ: γ &gt; 0 substitutes, γ &lt; 0 complements, γ = 0 independent goods. A symmetric cross effect arises naturally when demand comes from a representative consumer with quadratic utility (as in Singh & Vives, 1984); here it is a modeling assumption.</p>"
          },
          example: {
            intro: "MatrixLab's illustrative values (assumptions, not data from the professor): α = (22, 20), β₁ = 0.8, β₂ = 0.9, γ = 0.25. Try the plan q = (10, 8).",
            steps: [
              { title: "Price of product 1", body: "Start at the intercept 22, subtract the own effect and the cross effect.", math: "p₁ = 22 − 0.8·10 − 0.25·8 = 22 − 8 − 2 = 12" },
              { title: "Price of product 2", body: "Same pattern for product 2.", math: "p₂ = 20 − 0.25·10 − 0.9·8 = 20 − 2.5 − 7.2 = 10.3" },
              { title: "Matrix form", body: "Both equations at once: P = α − B·q.", math: "P = (22, 20) − [[0.8, 0.25], [0.25, 0.9]]·(10, 8) = (22, 20) − (10, 9.7) = (12, 10.3)" },
              { title: "Feel the substitution", body: "Raise q₂ from 8 to 12. Product 1's price falls even though q₁ didn't change.", math: "p₁ = 22 − 8 − 0.25·12 = 11   (down from 12)" },
              { title: "Meaning of α", body: { simple: "α is the price when nothing is sold, the top of the demand line (the most anyone would pay).", rigorous: "α = P(0), the choke prices. The firm will only produce while αᵢ exceeds marginal cost cᵢ." }, math: "P(0, 0) = (22, 20)" }
            ]
          },
          formula: {
            simple: "<div class='g-math-block'>p₁ = α₁ − β₁q₁ − γq₂\np₂ = α₂ − γq₁ − β₂q₂     ⇔     P = α − B·q</div><p><b>q</b> = quantities · <b>p</b> = prices · <b>α</b> = intercepts · <b>β</b> = own-price slopes · <b>γ</b> = substitution strength.</p>",
            rigorous: "<div class='g-math-block'>P(q) = α − Bq,   B = [[β₁, γ], [γ, β₂]],   ∂pᵢ/∂qⱼ = −Bᵢⱼ</div><p>Own effects dominating cross effects (β₁β₂ &gt; γ²) makes B positive definite; that is the standard regularity condition and the one profit maximization needs.</p>",
            conditions: [
              "Linear demand is a local approximation; real demand curves bend.",
              "Prices must stay non-negative, so the model is only meaningful for moderate q.",
              "γ is the same in both equations here: a symmetry assumption.",
              "Keep γ² &lt; β₁β₂ (own effects stronger than cross effects)."
            ]
          },
          lab: [
            { label: "Plenty of input (s₁ = 20)", note: "Business Simulator with input 1 at 20, so no limit binds.", screen: "business", set: { "firm-a1": 22, "firm-a2": 20, "firm-gamma": 0.25, "firm-cap1": 20, "firm-cap2": 21, "firm-b1": 0.8, "firm-b2": 0.9 } },
            { label: "Independent products (γ = 0)", note: "No cross effect. Each product is optimized on its own.", screen: "business", set: { "firm-a1": 22, "firm-a2": 20, "firm-gamma": 0, "firm-cap1": 20, "firm-cap2": 21, "firm-b1": 0.8, "firm-b2": 0.9 } },
            { label: "Strong substitutes (γ = 0.7)", note: "The unconstrained formula gives a negative q₂, so the best plan is a corner: make about 11.7 of product 1 and none of product 2. Product 2 would only cannibalize product 1.", screen: "business", set: { "firm-a1": 22, "firm-a2": 20, "firm-gamma": 0.7, "firm-cap1": 20, "firm-cap2": 21, "firm-b1": 0.8, "firm-b2": 0.9 } }
          ],
          business: [
            { title: "Cannibalization", body: "A multi-product firm internalizes that selling more of one product lowers the other's price. That's why its optimal outputs are lower than two separate managers would choose." },
            { title: "Complements", body: "With γ &lt; 0 (printer and ink), selling more of one raises the other's price. The same matrix model handles it." }
          ],
          mistakes: [
            { wrong: "“γ &gt; 0 means complements.”", right: "In inverse demand P = α − Bq, γ &gt; 0 means substitutes." },
            { wrong: "Presenting α, β, γ as the professor's numbers.", right: "They are MatrixLab's teaching assumptions." },
            { wrong: "Confusing demand (q as a function of p) with inverse demand (p as a function of q).", right: "We use inverse demand because the firm chooses quantities." }
          ],
          quiz: [
            { q: "At q = (10, 8), what is p₁ with the default values?", options: ["12", "14", "10.3"], answer: 0, explain: "22 − 8 − 2 = 12." },
            { q: "If γ increases, what happens to p₁ when q₂ goes up?", options: ["It falls more", "It falls less", "It rises"], answer: 0, explain: "γ is the size of the cross effect." },
            { q: "Which condition keeps own effects stronger than cross effects?", options: ["γ² < β₁β₂", "γ > β₁", "α₁ > α₂"], answer: 0, explain: "This is det B > 0 (with β₁ > 0)." }
          ],
          references: [
            { kind: "Course text", source: "Sydsæter, Hammond et al., Essential Mathematics for Economic Analysis", where: "Ch. 17 §17.4 linear models with quadratic objectives", why: "The closest textbook match to this model." },
            { kind: "Journal", source: "N. Singh & X. Vives, “Price and quantity competition in a differentiated duopoly,” RAND Journal of Economics (1984)", where: "Linear demand derived from quadratic utility", why: "Classic source for symmetric linear demand with substitutes/complements." }
          ]
        },

        /* ======================= TECHNOLOGY & COST ======================= */
        {
          id: "technology",
          title: "Linear technology, shared inputs & cost",
          status: "ready",
          minutes: 12,
          summary: "How a matrix T links outputs to inputs, why cost stays linear, and where the products compete.",
          intuition: {
            simple:
              "<p>Each product uses two shared inputs (think machine hours and labor hours). A <b>technology matrix</b> T says how much of each input one unit of each product needs. Making more of either product eats into the <b>same</b> limited inputs.</p>" +
              "<p>Since every unit costs the same inputs, total cost is a straight line: fixed cost + (cost per unit) × units. That's the <b>linear total cost</b> your professor asked for.</p>" +
              "<p>So where do the products interact? Not in marginal cost (that stays constant) but in <b>capacity</b>: hours used on product 1 can't be used on product 2.</p>",
            rigorous:
              "<p>Input requirements z = Tq, with Tᵢⱼ = units of input i per unit of product j. Input prices w give C(q) = F + wᵀTq = F + cᵀq with c = Tᵀw. Then ∂²C/∂q₁∂q₂ = 0: marginal costs are constant and independent.</p>" +
              "<p>Interdependence enters through the feasible set {q ≥ 0 : Tq ≤ s}. A capacity constraint couples the products only when it binds.</p>"
          },
          example: {
            intro: "Illustrative values: T = [[1, 0.65], [0.45, 1.1]], w = (2, 3), F = 12, capacities s = (20, 21). Plan q = (10, 8).",
            steps: [
              { title: "Read T", body: "Column 1 is product 1's recipe: 1 unit of input 1 and 0.45 of input 2. Column 2 is product 2's recipe: 0.65 and 1.1.", math: "T = [[1, 0.65], [0.45, 1.1]]" },
              { title: "Inputs used: z = T·q", body: "Row by row.", math: "z₁ = 1·10 + 0.65·8 = 15.2     z₂ = 0.45·10 + 1.1·8 = 13.3" },
              { title: "Is the plan feasible?", body: "Compare with capacity s = (20, 21).", math: "15.2 ≤ 20 ✓     13.3 ≤ 21 ✓" },
              { title: "Unit costs: c = Tᵀ·w", body: "Each product's cost per unit = its input recipe × input prices.", math: "c₁ = 1·2 + 0.45·3 = 3.35     c₂ = 0.65·2 + 1.1·3 = 4.60" },
              { title: "Total cost", body: "Fixed cost plus unit costs × quantities. Check: the same as paying for the inputs directly.", math: "C = 12 + 3.35·10 + 4.6·8 = 82.3     = 12 + 2·15.2 + 3·13.3 ✓" },
              { title: "Marginal cost doesn't interact", body: { simple: "Making one more unit of product 1 always costs 3.35, however much product 2 you make.", rigorous: "∂C/∂q₁ = c₁ = 3.35 for all q; the cross-partial is 0. That's why we model interaction through capacity, not cost." }, math: "MC₁ = 3.35,  MC₂ = 4.60  (constant)" }
            ]
          },
          formula: {
            simple: "<div class='g-math-block'>z = T·q     C(q) = F + c₁q₁ + c₂q₂     c = Tᵀ·w     constraint: T·q ≤ s</div><p><b>T</b> = recipe matrix · <b>z</b> = inputs used · <b>w</b> = input prices · <b>c</b> = cost per unit of output · <b>s</b> = input availability · <b>F</b> = fixed cost.</p>",
            rigorous: "<div class='g-math-block'>C(q) = F + wᵀTq = F + cᵀq,   ∇²C = 0,   feasible set {q ≥ 0 : Tq ≤ s}</div>",
            conditions: [
              "Linear technology means constant returns to scale: double the output, double the inputs.",
              "A truly linear cost function cannot make product 1 change product 2's marginal cost. If the professor means that, the cost must become nonlinear (for example, a qᵀKq term) or piecewise. Worth confirming with him.",
              "Capacity matters only when a constraint binds at the optimum."
            ]
          },
          lab: [
            { label: "Default capacities", note: "Look at the shaded feasible region and which constraint (if any) binds.", screen: "business", set: { "firm-a1": 22, "firm-a2": 20, "firm-gamma": 0.25, "firm-cap1": 20, "firm-cap2": 21, "firm-b1": 0.8, "firm-b2": 0.9 } },
            { label: "Tight input 1", note: "Cut input 1 to 10. The region shrinks and the optimum moves to its edge.", screen: "business", set: { "firm-a1": 22, "firm-a2": 20, "firm-gamma": 0.25, "firm-cap1": 10, "firm-cap2": 21, "firm-b1": 0.8, "firm-b2": 0.9 } }
          ],
          business: [
            { title: "Shared resources", body: "A bakery's oven hours, a factory's machine time, a consulting firm's partner hours: shared capacity is the common way products compete inside a firm." },
            { title: "Standard costing", body: "Unit cost = recipe × input prices is exactly how cost accounting builds a standard cost per product." }
          ],
          mistakes: [
            { wrong: "c = T·w.", right: "c = Tᵀ·w (each product's column of T times w)." },
            { wrong: "“Linear cost makes products interact.”", right: "They interact through capacity Tq ≤ s." }
          ],
          quiz: [
            { q: "How much of input 2 does q = (10, 8) use?", options: ["13.3", "15.2", "18"], answer: 0, explain: "0.45·10 + 1.1·8 = 13.3." },
            { q: "What is the cross-partial ∂²C/∂q₁∂q₂ for a linear cost?", options: ["0", "c₁c₂", "Depends on T"], answer: 0, explain: "Linear functions have zero second derivatives." },
            { q: "Where do the two products compete in this model?", options: ["Through marginal cost", "Through shared input capacity (and demand)", "They don't"], answer: 1, explain: "Capacity on the supply side, γ on the demand side." }
          ],
          references: [
            { kind: "Course text", source: "Liesen & Mehrmann, Linear Algebra (2nd ed.)", where: "§1.3 production planning", why: "A linear production-planning model (not the quadratic-profit one)." },
            { kind: "Course text", source: "Sydsæter, Hammond et al., Essential Mathematics for Economic Analysis", where: "Ch. 12 (matrix models) and Ch. 18 (constrained optimization)", why: "Input-requirement matrices and constraints." }
          ]
        },

        /* ======================= PROFIT AS A QUADRATIC FORM ======================= */
        {
          id: "profit",
          title: "Why profit becomes a quadratic form",
          status: "ready",
          minutes: 12,
          summary: "Price × quantity with linear prices creates squared and cross terms: π = (α − c)ᵀq − qᵀBq − F.",
          intuition: {
            simple:
              "<p>Revenue is price × quantity. But price itself <b>depends on quantity</b> (selling more lowers it). So revenue = (something with q) × q, and that creates <b>q² terms</b>.</p>" +
              "<p>Product 1's price also depends on q₂, so revenue gets a <b>q₁·q₂ cross term</b>. Squared terms plus a cross term = a quadratic form, the topic of Theme 3.</p>" +
              "<p>Cost is linear, so it adds no squared terms. All the curvature of profit comes from demand.</p>",
            rigorous:
              "<p>π(q) = P(q)ᵀq − C(q) = (α − Bq)ᵀq − F − cᵀq = (α − c)ᵀq − qᵀBq − F, using symmetry of B (qᵀBᵀq = qᵀBq).</p>" +
              "<p>So π is a linear term plus the quadratic form −qᵀBq. Gradient ∇π = (α − c) − 2Bq; Hessian ∇²π = −2B. Concavity of profit is equivalent to positive definiteness of B.</p>"
          },
          example: {
            intro: "Defaults (assumptions): α = (22, 20), B = [[0.8, 0.25], [0.25, 0.9]], c = (3.35, 4.6), F = 12. Plan q = (10, 8).",
            steps: [
              { title: "Expand revenue by hand", body: "Multiply each price formula by its quantity and add.", math: "R = (α₁ − β₁q₁ − γq₂)q₁ + (α₂ − γq₁ − β₂q₂)q₂\n  = α₁q₁ + α₂q₂ − β₁q₁² − 2γq₁q₂ − β₂q₂²" },
              { title: "Spot the quadratic form", body: "The negative part is exactly qᵀBq; the cross term 2γq₁q₂ comes half from each product.", math: "β₁q₁² + 2γq₁q₂ + β₂q₂² = qᵀBq" },
              { title: "Subtract cost", body: "Linear cost only changes the linear part: α becomes α − c.", math: "π = (α − c)ᵀq − qᵀBq − F,   α − c = (18.65, 15.4)" },
              { title: "Compute profit the long way", body: "Revenue minus cost at q = (10, 8), using the prices from the demand lesson.", math: "R = 12·10 + 10.3·8 = 202.4     C = 82.3     π = 120.1" },
              { title: "Compute with the formula", body: "Same answer, which checks the algebra.", math: "(α − c)ᵀq = 186.5 + 123.2 = 309.7\nqᵀBq = 80 + 40 + 57.6 = 177.6\nπ = 309.7 − 177.6 − 12 = 120.1 ✓" },
              { title: "Curvature", body: { simple: "The quadratic part −qᵀBq is a <b>hill</b> because B is a bowl (positive definite). So profit has exactly one top.", rigorous: "∇²π = −2B with eigenvalues −2·(1.105, 0.595) &lt; 0: strictly concave." }, math: "eigenvalues of B ≈ 1.105 and 0.595  (both > 0)" }
            ]
          },
          formula: {
            simple: "<div class='g-math-block'>π(q) = (α − c)ᵀq − qᵀBq − F</div><p><b>(α − c)</b> = margin at zero output · <b>qᵀBq</b> = how fast prices fall as you sell more (the quadratic form) · <b>F</b> = fixed cost.</p>",
            rigorous: "<div class='g-math-block'>π(q) = (α − c)ᵀq − qᵀBq − F,  ∇π = (α − c) − 2Bq,  ∇²π = −2B</div>",
            conditions: [
              "Requires B symmetric to combine the cross terms into one 2γq₁q₂.",
              "The quadratic part comes from demand, not cost.",
              "Profit is a quadratic <i>function</i> (it has linear and constant terms); its curvature is governed by the quadratic form −qᵀBq."
            ]
          },
          lab: [
            { label: "Read the model steps", note: "Business Simulator: the “From demand to quadratic profit” panel shows the same build-up.", screen: "business", set: { "firm-a1": 22, "firm-a2": 20, "firm-gamma": 0.25, "firm-cap1": 20, "firm-cap2": 21, "firm-b1": 0.8, "firm-b2": 0.9 } },
            { label: "B's shape in Geometry Explorer", note: "Approximate B with a = 0.75, b = 0.25, d = 1: a bowl, so −B is a hill.", screen: "geometry", set: { "g-a": 0.75, "g-b": 0.25, "g-d": 1 } }
          ],
          business: [
            { title: "Why marginal revenue falls", body: "∂R/∂q₁ = α₁ − 2β₁q₁ − 2γq₂: each extra unit earns less, and more so the more of product 2 you sell." },
            { title: "Same structure elsewhere", body: "Mean-variance portfolio choice maximizes μᵀw − (λ/2)wᵀΣw: a linear gain minus a quadratic form, the same math as this firm." }
          ],
          mistakes: [
            { wrong: "Writing the cross term as γq₁q₂.", right: "It's 2γq₁q₂: γq₁q₂ from each product's revenue." },
            { wrong: "Thinking the cost function creates the curvature.", right: "Linear cost adds no curvature; demand does." }
          ],
          quiz: [
            { q: "Where does the q₁q₂ term in profit come from?", options: ["The cost function", "Each price depending on the other product's quantity", "Fixed cost"], answer: 1, explain: "Substitution γ in demand." },
            { q: "What is the Hessian of π?", options: ["−2B", "B", "α − c"], answer: 0, explain: "Second derivatives of −qᵀBq." },
            { q: "π at q = (10, 8) with the defaults is…", options: ["120.1", "202.4", "309.7"], answer: 0, explain: "202.4 revenue − 82.3 cost." }
          ],
          references: [
            { kind: "Course text", source: "Sydsæter, Hammond et al., Essential Mathematics for Economic Analysis", where: "Ch. 17 §17.4 linear models with quadratic objectives", why: "Quadratic objectives in economics." },
            { kind: "Course text", source: "Liesen & Mehrmann, Linear Algebra (2nd ed.)", where: "§18.3 quadratic forms", why: "The math behind −qᵀBq." }
          ]
        },

        /* ======================= OPTIMUM ======================= */
        {
          id: "optimum",
          title: "The optimum, constraints & shadow prices",
          status: "ready",
          minutes: 15,
          summary: "Solve for the best output mix, check capacity, and price a scarce input.",
          intuition: {
            simple:
              "<p>Profit is a hill. The top is where it stops going up in every direction: the <b>slope is zero</b>. Setting both slopes to zero gives two equations in two unknowns, solved with the inverse of B.</p>" +
              "<p>Then check capacity. If the top of the hill needs more inputs than you have, the best you can do is climb as high as possible <b>along the fence</b> (the capacity line).</p>" +
              "<p>The <b>shadow price</b> answers: “if I had one more hour of the scarce input, how much more profit could I make?” It's what the input is really worth to the firm.</p>",
            rigorous:
              "<p>Unconstrained: ∇π = (α − c) − 2Bq = 0 ⇒ q* = ½B⁻¹(α − c). With B ≻ 0 this is the unique global maximizer.</p>" +
              "<p>Constrained (q ≥ 0, Tq ≤ s): the KKT conditions are (α − c) − 2Bq = Tᵀμ, μ ≥ 0, μ ⊙ (s − Tq) = 0. Each multiplier μᵢ is the marginal profit of one more unit of capacity sᵢ. Because π is concave and the constraints linear, KKT points are global optima.</p>"
          },
          example: {
            intro: "Start with plenty of input: α − c = (18.65, 15.4), B = [[0.8, 0.25], [0.25, 0.9]], T = [[1, 0.65], [0.45, 1.1]], s = (20, 21). (The site's default is s₁ = 10, the scarce case below.) Results are rounded.",
            steps: [
              { title: "First-order conditions", body: "Set both slopes to zero.", math: "18.65 − 1.6q₁ − 0.5q₂ = 0\n15.4 − 0.5q₁ − 1.8q₂ = 0" },
              { title: "Solve with B⁻¹", body: { simple: "det B = 0.6575, so B⁻¹ = (1/0.6575)·[[0.9, −0.25], [−0.25, 0.8]]. Then q* = ½·B⁻¹(α − c).", rigorous: "q* = ½B⁻¹(α − c); equivalently solve the 2×2 system 2Bq = α − c." }, math: "q* ≈ (9.84, 5.82)" },
              { title: "Check capacity", body: "Inputs needed at q*: both below capacity, so neither constraint binds. The unconstrained top is the answer.", math: "T·q* ≈ (13.62, 10.83) ≤ (20, 21) ✓     π* ≈ 124.56" },
              { title: "Now make input 1 scarce: s₁ = 10", body: "q* would need 13.62 units of input 1. Not allowed, so the optimum moves onto the line q₁ + 0.65q₂ = 10.", math: "13.62 > 10  ✗  → constraint binds" },
              { title: "Best point on the fence", body: { simple: "Climb along the capacity line until profit stops rising there. At that point the profit slope points straight out through the fence.", rigorous: "Solve (α − c) − 2Bq = μ·t₁ with t₁ = (1, 0.65), t₁·q = 10." }, math: "q ≈ (6.91, 4.75)     π ≈ 115.12     input 2 used ≈ 8.34 ≤ 21" },
              { title: "Shadow price", body: "The multiplier μ₁ says one more unit of input 1 adds about this much profit. If input 1 can be rented for less than that, it's worth buying.", math: "μ₁ = 5.216 per unit of input 1 (exact KKT)     (μ₂ = 0: input 2 is not scarce)" }
            ]
          },
          formula: {
            simple: "<div class='g-math-block'>q* = ½·B⁻¹·(α − c)     then check T·q* ≤ s</div><p><b>q*</b> = best output mix · <b>B⁻¹</b> = inverse of the demand matrix · <b>α − c</b> = margins at zero output. If a constraint is violated, the optimum lies on that constraint's line.</p>",
            rigorous: "<div class='g-math-block'>max (α − c)ᵀq − qᵀBq − F  s.t. Tq ≤ s, q ≥ 0\nKKT: (α − c) − 2Bq − Tᵀμ + ν = 0, μ, ν ≥ 0, complementary slackness</div><p>For n = 2 the exact solution can be found by checking: the interior point, each single binding constraint, and each vertex. Lagrange multipliers are the shadow prices.</p>",
            conditions: [
              "q* = ½B⁻¹(α − c) is a maximum only if B is positive definite (γ² &lt; β₁β₂).",
              "Also check q* ≥ 0; a negative quantity means that product should not be made.",
              "Shadow prices are marginal: valid for small capacity changes.",
              "MatrixLab v1.0's solver is numerical, so its KPIs may differ from these exact values in the last decimals."
            ]
          },
          lab: [
            { label: "Plenty of input: nothing binds (s₁ = 20)", note: "Expect about q* = (9.84, 5.82) and profit ≈ 124.6.", screen: "business", set: { "firm-a1": 22, "firm-a2": 20, "firm-gamma": 0.25, "firm-cap1": 20, "firm-cap2": 21, "firm-b1": 0.8, "firm-b2": 0.9, "firm-w1": 2, "firm-w2": 3, "firm-fixed": 12, "firm-t11": 1, "firm-t12": 0.65, "firm-t21": 0.45, "firm-t22": 1.1 } },
            { label: "Scarce input 1 (s₁ = 10)", note: "Expect about q = (6.91, 4.75), profit ≈ 115.1, input 1 binding.", screen: "business", set: { "firm-a1": 22, "firm-a2": 20, "firm-gamma": 0.25, "firm-cap1": 10, "firm-cap2": 21, "firm-b1": 0.8, "firm-b2": 0.9, "firm-w1": 2, "firm-w2": 3, "firm-fixed": 12, "firm-t11": 1, "firm-t12": 0.65, "firm-t21": 0.45, "firm-t22": 1.1 } },
            { label: "Shadow price by experiment", note: "s₁ = 11: profit rises from about 115.1 to 119.6 (+4.5). A bit less than μ₁ ≈ 5.2, because the shadow price shrinks as the input gets less scarce.", screen: "business", set: { "firm-a1": 22, "firm-a2": 20, "firm-gamma": 0.25, "firm-cap1": 11, "firm-cap2": 21, "firm-b1": 0.8, "firm-b2": 0.9, "firm-w1": 2, "firm-w2": 3, "firm-fixed": 12, "firm-t11": 1, "firm-t12": 0.65, "firm-t21": 0.45, "firm-t22": 1.1 } }
          ],
          business: [
            { title: "Capacity investment", body: "A shadow price of about 5.2 per unit says how much the firm should be willing to pay for one more unit of input 1. That's a capex or overtime decision." },
            { title: "Product-mix planning (FP&A)", body: "Given demand assumptions and capacity, this is the logic behind a production plan: unconstrained optimum first, then the binding constraint, then the value of relaxing it." }
          ],
          mistakes: [
            { wrong: "Forgetting the ½ in q* = ½B⁻¹(α − c).", right: "The derivative of qᵀBq is 2Bq." },
            { wrong: "Reporting q* without checking capacity.", right: "Always check Tq* ≤ s and q* ≥ 0." },
            { wrong: "Thinking every input has a positive shadow price.", right: "Slack inputs have μ = 0." }
          ],
          quiz: [
            { q: "With capacities s = (20, 21), does any input constraint bind?", options: ["Yes, input 1", "Yes, input 2", "No"], answer: 2, explain: "Tq* ≈ (13.6, 10.8) is below (20, 21)." },
            { q: "If s₁ drops to 10, what happens?", options: ["Nothing", "The optimum moves onto the input-1 capacity line", "The firm stops producing"], answer: 1, explain: "13.6 > 10, so input 1 binds." },
            { q: "μ₁ ≈ 5.22 means…", options: ["Input 1 costs 5.22", "One more unit of input 1 adds about 5.22 profit", "Profit falls by 5.22"], answer: 1, explain: "Shadow price = marginal value of capacity." }
          ],
          references: [
            { kind: "Course text", source: "Sydsæter, Hammond et al., Essential Mathematics for Economic Analysis", where: "Ch. 18 constrained optimization; Ch. 19–20 programming", why: "Lagrange multipliers and their interpretation." },
            { kind: "Stanford", source: "Boyd & Vandenberghe, Convex Optimization (free PDF)", where: "Ch. 5 Duality, KKT optimality conditions", why: "Why multipliers are shadow prices for concave problems.", url: "https://web.stanford.edu/~boyd/cvxbook/" },
            { kind: "MIT", source: "Gilbert Strang, 18.06 Linear Algebra", where: "Lecture 27: Positive definite matrices and minima", why: "Why positive definiteness guarantees a unique optimum.", url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/resources/lecture-27-positive-definite-matrices-and-minima/" }
          ]
        }
      ]
    },

    /* ------------------------------------------------------------ */
    {
      id: "all",
      presentation: null,
      title: "Bring It Together",
      tagline: "One matrix idea, three themes",
      concepts: [
        {
          id: "story",
          title: "The one-matrix story",
          status: "ready",
          minutes: 8,
          summary: "How Themes 1, 2 and 3 are the same idea seen three ways, and how to say it in class.",
          intuition: {
            simple:
              "<p><b>Theme 1</b> asks: what does a symmetric matrix do? It stretches two perpendicular directions (eigenvectors) by two factors (eigenvalues), and it can be rebuilt from them (spectral) or from a triangular square root (Cholesky).</p>" +
              "<p><b>Theme 3</b> turns the matrix into a landscape, q = xᵀAx. The eigenvectors become the ellipse axes; the eigenvalue signs decide bowl, hill or saddle.</p>" +
              "<p><b>Theme 2</b> shows a firm's profit is exactly such a landscape: π = (α − c)ᵀq − qᵀBq − F. B being positive definite (a Theme 1 / 3 fact) is what makes “the best production plan” exist.</p>",
            rigorous:
              "<p>The common object is a symmetric matrix and its quadratic form. Spectral decomposition diagonalizes the form (principal axes), definiteness classifies it, Cholesky certifies positive definiteness, and the inverse solves the first-order conditions q* = ½B⁻¹(α − c). Constraints add KKT multipliers with shadow-price interpretations.</p>"
          },
          example: {
            intro: "A three-sentence spine you can say in any of the three presentations.",
            steps: [
              { title: "Sentence 1 (Theme 1)", body: "“A symmetric matrix is completely described by its eigenvectors and eigenvalues: for A = [[1, 1], [1, 2]], it stretches by 2.618 and 0.382 along two perpendicular directions.”", math: "A = QΛQᵀ = LLᵀ" },
              { title: "Sentence 2 (Theme 3)", body: "“As a quadratic form, those eigenvalues set the curvature and the eigenvectors set the tilt of the level sets; both positive means a bowl with elliptical contours.”", math: "q = 2.618s² + 0.382t²" },
              { title: "Sentence 3 (Theme 2)", body: "“A firm with linear demand and linear cost has profit equal to a linear term minus a quadratic form, so its best plan exists exactly when the demand matrix is positive definite.”", math: "π = (α − c)ᵀq − qᵀBq − F,   q* = ½B⁻¹(α − c)" }
            ]
          },
          formula: {
            simple: "<div class='g-math-block'>matrix (P1)  →  landscape q = xᵀAx (P3)  →  profit π = linear − qᵀBq (P2)</div>",
            rigorous: "<div class='g-math-block'>A = Aᵀ:  eigen-decomposition ⇒ principal axes ⇒ definiteness ⇒ existence/uniqueness of the optimum</div>",
            conditions: [
              "Keep the professor's exact matrix for Themes 1 and 3.",
              "Say clearly that the firm's numbers are teaching assumptions.",
              "Be ready to explain the linear-cost point: interaction through capacity, not marginal cost."
            ]
          },
          lab: [
            { label: "1 · Matrix", note: "Professor's A in Matrix Fundamentals.", screen: "matrix", set: { a11: 1, a12: 1, a22: 2 } },
            { label: "2 · Landscape", note: "Same A in Geometry Explorer.", screen: "geometry", preset: "prof" },
            { label: "3 · Firm", note: "Business Simulator with plenty of input (s₁ = 20).", screen: "business", set: { "firm-a1": 22, "firm-a2": 20, "firm-gamma": 0.25, "firm-cap1": 20, "firm-cap2": 21, "firm-b1": 0.8, "firm-b2": 0.9 } }
          ],
          business: [
            { title: "If you're assigned Theme 1", body: "End with one slide: “why this matters” → the same A as a bowl, and B in a firm's profit." },
            { title: "If you're assigned Theme 2", body: "Spend 30 seconds on definiteness: it's the reason your optimum exists." },
            { title: "If you're assigned Theme 3", body: "Open with the professor's A from Theme 1 so the class sees continuity." }
          ],
          quiz: [
            { q: "What guarantees the firm's profit has a unique maximum?", options: ["B positive definite", "α > c only", "T invertible"], answer: 0, explain: "Then −qᵀBq is a hill." },
            { q: "In q = xᵀAx, what do the eigenvectors of A give?", options: ["The heights", "The principal axes of the level sets", "The intercepts"], answer: 1, explain: "They set the ellipse tilt." }
          ],
          references: [
            { kind: "MIT", source: "Gilbert Strang, 18.06 Linear Algebra", where: "Lecture 27: Positive definite matrices and minima", why: "The single lecture that ties all three together.", url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/resources/lecture-27-positive-definite-matrices-and-minima/" },
            { kind: "Course text", source: "Sydsæter, Hammond et al., Essential Mathematics for Economic Analysis", where: "Ch. 13 and Ch. 17", why: "Quadratic forms meet economic optimization." }
          ]
        }
      ]
    }
  ]
};
