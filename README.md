# RESET — Finance PWA

Mobile-first personal finance PWA with a black/white UI and small blue accent.

## Current rules
- Savings minimum: **$1,000**
- Mastercard stays locked
- Payday Wizard uses the actual paycheque amount
- Payday plan priority: Shakepay → Mastercard minimum → Wise weekly spending → Savings to $1,000 → remaining to RBC Visa
- Applying a payday plan actually routes the money to those destinations instead of leaving it sitting in Chequing
- Tip Wizard funds Shakepay first when needed, then RBC Visa
- Data is stored locally in the browser

## GitHub Pages upload

Upload the **contents of this folder** to the root of your GitHub Pages repository. Do not upload only the ZIP.

The root should look like:

    index.html
    app.js
    styles.css
    manifest.json
    sw.js
    README.md
    icons/
      icon-192.png
      icon-512.png
      apple-touch-icon.png

Then in GitHub:
1. Open your repository.
2. Click **Add file → Upload files**.
3. Upload `index.html`, `app.js`, `styles.css`, `manifest.json`, `sw.js`, and the `icons` folder/files.
4. Commit the changes.
5. Go to **Settings → Pages**.
6. Under **Build and deployment**, choose **Deploy from a branch**.
7. Choose your branch (usually `main`) and folder `/ (root)`.
8. Save.
9. Open the GitHub Pages URL in Safari.
10. Use **Share → Add to Home Screen**.

For your existing `999salem.github.io` site, if RESET is replacing the current root site, upload these files to the repository root. If you want RESET at a subfolder such as `/RESET/`, put all these files inside a `RESET` folder instead.

## PWA requirement

The service worker requires HTTPS (GitHub Pages provides this). Opening `index.html` directly from Files will not give the full PWA installation behavior.
