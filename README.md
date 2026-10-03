# RESET — Finance PWA

Black/white mobile-first personal finance app with a small blue accent.

## PWA features
- Installable on iPhone/iPad and Android
- Standalone app window
- App icon
- Offline cache after first successful load
- Local data persistence via localStorage
- No financial data is sent to a server

## Important
A PWA must be served from **HTTPS** (or localhost). Opening `index.html` directly from the iPhone Files app can show the page but will not give Safari the full PWA install/offline behavior.

## iPhone installation
1. Put this folder on an HTTPS static host such as GitHub Pages, Cloudflare Pages, Netlify, or another HTTPS web host.
2. Open the site's `index.html` URL in **Safari**.
3. Tap **Share**.
4. Tap **Add to Home Screen**.
5. Launch RESET from the new Home Screen icon.

## Local testing
From a computer, serve this folder with any local HTTP server and open it in a browser. The service worker requires HTTP(S), not `file://`.

## Included
- index.html
- styles.css
- app.js
- manifest.json
- sw.js
- icons/
