# MatrixLab — From Mathematics to Business Decisions

An interactive, beginner-friendly website that connects linear algebra, geometric interpretation, and business optimization. It is designed around **three presentations from a graduate mathematics course** and works in the browser without installing a framework or downloading dependencies.

## What is included?

### Presentation 1 — Matrix fundamentals

- Add, subtract and scale 2D vectors.
- Multiply a `2 × 2` matrix by another `2 × 2` matrix.
- Calculate the inverse (including a singular-matrix warning).
- Calculate eigenvalues and normalized eigenvectors of a symmetric matrix.
- Find the spectral decomposition `A = Q Λ Qᵀ` and verify it.
- Find the Cholesky decomposition `A = L Lᵀ` when `A` is positive definite, and verify it.
- Explore the professor's **exact matrix** by default: `A = [[1,1],[1,2]]`.

### Presentation 3 — Quadratic forms and geometry

- Use the *same* matrix `A` to calculate `q(x,y) = a x² + 2bxy + d y²`.
- Show 2D level sets (contours), a rotatable 3D surface, and eigenvector principal axes.
- Compare positive-definite, negative-definite, indefinite, and semidefinite matrices.
- Explore presets and change coefficients interactively.

### Presentation 2 — Two-product firm

- Two substitute products with linear inverse demands `P₁ = α₁ − β₁q₁ − γq₂`, `P₂ = α₂ − γq₁ − β₂q₂`.
- Linear input technology `z = Tq`, input prices `w`, and **linear total cost** `C(q) = F + wᵀTq`.
- Shared production constraints `Tq ≤ capacity` link production choices.
- Quadratic profit objective `π(q) = (α − c)ᵀq − qᵀBq − F`.
- Optimize profit on the feasible region; display the output mix and constraint status.
- Interactive contours demonstrate how demand and capacity affect the optimum.

**Mathematical clarification:** With strictly linear total cost, producing more of good 1 does **not** alter the marginal cost of good 2, because the cross-partial derivative of total cost is zero. The model links the products through shared *inputs and capacity* (and through substitute demand), while retaining the professor's linear-total-cost assumption. Direct cross-marginal-cost effects require nonlinear or piecewise cost.

## Files

- `index.html` — all website content and screen layout.
- `style.css` — colors, typography, layout, and responsive design.
- `script.js` — all mathematical calculations, optimization, and canvas drawings.
- `.nojekyll` — optional GitHub Pages configuration.

No API keys, user accounts, backend server, tracking, or external packages are needed. All calculations run locally in the browser.

## Try it on your computer (Mac)

1. Download and unzip the `matrixlab.zip` archive.
2. Open the **matrixlab** folder.
3. Double-click `index.html` to open it in your web browser.
4. Make sure you can click **Matrix Fundamentals**, **Geometry Explorer**, **Business Simulator**, and **Connect the Ideas**.
5. Test the professor's matrix: eigenvalues approximately `2.618` and `0.382`, inverse `[[2,-1],[-1,1]]`, and Cholesky factor `[[1,0],[1,1]]`.

## Publish it on GitHub Pages: easiest method (no terminal required)

1. Sign in at https://github.com/.
2. Open https://github.com/new to create a repository.
3. Name it **matrixlab**. Choose **Public** (GitHub Pages supports public repositories with the standard free workflow). You can leave repository initialization unchecked, then click **Create repository**.
4. In your new empty repository, choose **uploading an existing file**. Alternatively, use **Add file → Upload files**.
5. Drag these files **from the extracted matrixlab folder** into GitHub: `index.html`, `style.css`, `script.js`, `README.md`. You can also include `.nojekyll` if it is visible (on a Mac press `Command + Shift + .` to display hidden files in Finder). Do **not** upload only the ZIP; GitHub Pages cannot serve your website from a ZIP file.
6. Type a commit message such as `Initial MatrixLab website` and click **Commit changes**.
7. Open your repository's **Settings → Pages**.
8. Under **Build and deployment**, choose **Deploy from a branch** as the source.
9. Select **main** and **/(root)**. Click **Save**.
10. Wait a few minutes, refresh the Pages settings, and open the displayed site URL. Typically: `https://YOUR-USERNAME.github.io/matrixlab/`.
11. Share the link with your professor or classmates. When you update files, upload and commit the new versions to `main` to publish changes.

**Important:** The website is created locally by this project; it will not be live on your GitHub until you complete the publishing steps above.

## Publish using Terminal (optional)

If you prefer Terminal, create an empty `matrixlab` repository on GitHub first. Then, inside the extracted folder:

```bash
cd ~/Downloads/matrixlab
git init -b main
git add .
git commit -m "Initial MatrixLab website"
git remote add origin https://github.com/YOUR-USERNAME/matrixlab.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username. GitHub may ask you to authenticate; a password entered directly for HTTPS Git operations is not supported. Use an authenticated GitHub credential helper or `gh auth login` if you have the GitHub CLI installed. After the push, turn on GitHub Pages as described above.

## Suggested presentation walkthroughs

- **Presentation 1 (3–5 minutes):** start from `[[1,1],[1,2]]`, show vector movement, inverse, eigenvalues/eigenvectors, spectral decomposition, and Cholesky, opening the step-by-step panels.
- **Presentation 3 (3–5 minutes):** keep the professor's matrix, explain `q(x,y)=xᵀAx`, rotate the surface, show elliptical level sets, then change to the Saddle and Hill presets.
- **Presentation 2 (3–5 minutes):** explain linear inverse demands and technology, reveal the quadratic profit formula, reduce input capacity, and observe the new production optimum.

## Reference text

Jörg Liesen and Volker Mehrmann, *Linear Algebra*, Second Edition (Springer, 2025), especially sections 4.1, 8.2, 14.2, and 18.3. The economics model here is a teaching example created for the assignment, not a quotation from that book.

## Limitations and planned improvements

This initial version is an educational prototype. The matrix editor deliberately restricts A to **symmetric** 2×2 matrices, since that is sufficient for the assigned A and makes the spectral and geometric interpretations clear. The economic model assumes two products and two nonnegative shared inputs, with a constrained numerical optimum. There is no data-upload feature yet.
