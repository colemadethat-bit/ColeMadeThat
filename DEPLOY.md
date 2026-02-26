# Launching ColeMadeThat to the web

## TL;DR — cheapest way to go live

- **Hosting:** FREE (GitHub Pages or Netlify).
- **Domain (optional):** ~$10–15/year if you want something like `colemadethat.com`. You can also use a free URL and skip the domain at first.

---

## Option A: GitHub Pages (free hosting)

GitHub **does** host static sites for free. You only pay if you buy a custom domain.

### 1. Put your site in a GitHub repo

1. Create a GitHub account at [github.com](https://github.com) if you don’t have one.
2. Create a **new repository** (e.g. name it `colemadethat` or `cmtwebsite`). Make it **public**.
3. Upload your site files into that repo:
   - `index.html`
   - `styles.css`
   - `script.js`
   - Your images: `logo.jpeg`, `hero-image-1.png`, etc. (same folder as `index.html`)

   You can drag-and-drop files in the GitHub web interface, or use Git from the command line if you prefer.

### 2. Turn on GitHub Pages

1. In the repo, go to **Settings** → **Pages** (left sidebar).
2. Under **Source**, choose **Deploy from a branch**.
3. Under **Branch**, pick `main` (or `master`) and folder **/ (root)**.
4. Click **Save**.

After a minute or two, your site will be at:

**`https://YOUR_USERNAME.github.io/REPO_NAME/`**

Example: `https://colemadethat.github.io/colemadethat/`

That URL is **free** and public. No monthly hosting fee.

### 3. (Optional) Use your own domain

If you buy a domain (e.g. `colemadethat.com` from Namecheap, Google Domains, Cloudflare, etc.):

1. In the repo, add a file named **`CNAME`** (no extension) with one line: your domain, e.g. `www.colemadethat.com`.
2. In your domain registrar’s DNS settings, add the records GitHub tells you (usually an A record or CNAME pointing to GitHub Pages). GitHub’s docs: [Configuring a custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site).

Then your site will be at `https://www.colemadethat.com` (or whatever you set). You only pay for the domain (~$10–15/year); GitHub still hosts for free.

---

## You bought colemadethat.com from Porkbun — what to do next

Do this **after** your site is already live on GitHub Pages (or Netlify) at the free URL.

### If you’re using GitHub Pages

**Step 1 — Tell GitHub your domain**

1. Open your repo on GitHub → **Settings** → **Pages**.
2. Under **Custom domain**, type: `www.colemadethat.com` (or `colemadethat.com` — see Step 2).
3. Click **Save**. GitHub may show a DNS checklist; that’s what Step 2 does.

**Step 2 — Point Porkbun at GitHub**

1. Log in at [porkbun.com](https://porkbun.com) → **Domain Management** → click **colemadethat.com**.
2. Open **DNS** / **Edit DNS** (or **Nameservers** if you use external DNS; otherwise use Porkbun’s DNS).

**Option A — Use www (easiest)**  
So the main URL is `https://www.colemadethat.com`:

| Type  | Host | Answer / Value              |
|-------|------|-----------------------------|
| CNAME | www  | **YOUR_USERNAME**.github.io |

Replace **YOUR_USERNAME** with your GitHub username (e.g. `colemadethat`).

In GitHub repo **Settings → Pages → Custom domain**, use: **www.colemadethat.com**.

**Option B — Use root domain (colemadethat.com without “www”)**

Add these **A** records (Host = `@` or leave blank for “root”):

| Type | Host | Answer / Value    |
|------|------|-------------------|
| A    | @    | 185.199.108.153   |
| A    | @    | 185.199.109.153   |
| A    | @    | 185.199.110.153   |
| A    | @    | 185.199.111.153   |

Then add a **CNAME** so `www` works too:

| Type  | Host | Answer / Value              |
|-------|------|-----------------------------|
| CNAME | www  | **YOUR_USERNAME**.github.io |

In GitHub **Settings → Pages → Custom domain**, use: **colemadethat.com**.  
(Optional: in Porkbun, add a **Redirect** so `www.colemadethat.com` → `colemadethat.com` or the other way around.)

**Step 3 — Add the CNAME file in your repo (for GitHub)**

1. In your GitHub repo, add a new file named **`CNAME`** (no extension).
2. Put exactly one line in it:
   - If you use www: `www.colemadethat.com`
   - If you use root: `colemadethat.com`
3. Commit and push. GitHub Pages will then serve your site on that domain.

**Step 4 — Wait and turn on HTTPS**

- DNS can take from a few minutes up to 24–48 hours.
- In **Settings → Pages**, once the domain is verified, check **Enforce HTTPS** so your site loads as `https://colemadethat.com` (or `https://www.colemadethat.com`).

---

### If you’re using Netlify instead

1. In Netlify: **Site settings** → **Domain management** → **Add custom domain** → **colemadethat.com**.
2. Netlify will show the DNS records to add. In Porkbun’s DNS for **colemadethat.com**, add what Netlify asks for (usually a CNAME for `www` and an A or ALIAS for the root, or use Netlify’s DNS).
3. After DNS propagates, Netlify will offer a free SSL certificate so the site works over HTTPS.

---

## Option B: Netlify (also free, no Git required)

If you’d rather not use GitHub:

1. Go to [netlify.com](https://www.netlify.com) and sign up (free).
2. Drag your **folder** (with `index.html`, `styles.css`, `script.js`, and images) onto the Netlify “Deploy” area.
3. Netlify gives you a free URL like `something-random.netlify.app`. You can change it to something like `colemadethat.netlify.app` in the site settings.
4. Optional: add a custom domain (e.g. `colemadethat.com`) in Netlify’s domain settings and point your domain’s DNS there.

No monthly cost; custom domain is the only optional cost.

---

## What you need in the folder when you deploy

- `index.html`
- `styles.css`
- `script.js`
- `logo.jpeg` (or `logo.jpg`)
- `hero-image-1.png`
- Any other images you use

Paths in your HTML/CSS (e.g. `src="hero-image-1.png"`) assume these files are in the **same folder** as `index.html`. Keep that structure when you upload.

---

## Summary

| What              | Cost                          |
|-------------------|-------------------------------|
| Hosting (GitHub or Netlify) | **Free**                      |
| Custom domain (e.g. colemadethat.com) | ~$10–15/year (optional) |
| Free URL (github.io or netlify.app)   | **Free**                      |

So: **yes, GitHub can host the site for you for free; you only pay for the domain if you want one.** Same idea with Netlify. Your site can be live and look legit without ongoing hosting fees.
