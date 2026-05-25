# One Take Wonder Marketing Site

This repository contains the live One Take Wonder Marketing website.

## Quick Start For Palloma
Open Codex in this folder and speak naturally.

You can say things like:
- "Update the homepage headline"
- "Add a new service section"
- "Change the contact email"
- "Update the site"

In this project, **"update the site" means make the change, commit it, and push it to GitHub** so the live site updates.

## What Codex Should Handle Automatically
- Make the requested content/design changes
- Verify files still work
- Commit changes with a clear message
- Push to `main`
- Explain what changed in simple, non-technical language

## Site Files
- `index.html` - homepage content and structure
- `styles.css` - custom styling and responsive layout
- `Logo/Logo.png` - agency logo
- `MarketingBanner.jpg` - hero banner image
- `CNAME` - custom domain for GitHub Pages

## GitHub Pages Setup (One-Time)
1. In GitHub, open **Settings > Pages**.
2. Under **Build and deployment**, set:
   - **Source:** Deploy from a branch
   - **Branch:** `main` and `/ (root)`
3. Under **Custom domain**, set `onetakewondermarketing.com`.
4. Save and enable **Enforce HTTPS** after DNS verification completes.

## DNS For Custom Domain
For `onetakewondermarketing.com` (host `@`), use 4 `A` records:
- `185.199.108.153`
- `185.199.109.153`
- `185.199.110.153`
- `185.199.111.153`

For `www`, use:
- `CNAME` -> `josiahearl2.github.io`
