# Soil Science for Students — Notes Store

A responsive static storefront for selling digital study notes.

## Included
- Responsive homepage
- Product catalog
- Shopping cart
- Demo checkout form
- USD pricing
- FAQ/about sections
- No external libraries required

## Important before launch
This package intentionally does **not** process real card payments. A static GitHub Pages site cannot safely contain payment secrets or server-side payment logic. Connect an approved payment provider through its hosted checkout/API and use a server-side component for payment verification and secure delivery.

Also do not place paid PDFs directly in a public GitHub repository: GitHub Pages content is publicly accessible.

## Edit products
Open `script.js` and change the `products` array. Add your own descriptions and prices.

## Run locally
Open `index.html` in a browser, or use any simple local static server.

## GitHub Pages
Create a GitHub repository, upload `index.html`, `styles.css`, `script.js`, and `README.md`, then enable Pages from Settings → Pages. GitHub Pages can publish static files from a repository.
