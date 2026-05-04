# Deploy: GitHub Pages + Vercel + Stripe

Your **marketing site** can stay on **GitHub Pages** (and your **Porkbun** domain).  
**Stripe Checkout** runs from a small **Vercel** API in this repo (`/api`).

## 1) Install dependencies (once, on your computer)

```bash
npm install
```

## 2) Stripe

1. Create a [Stripe](https://stripe.com) account → complete business details.
2. Dashboard → **Developers → API keys**.
3. Copy **Secret key** (starts with `sk_test_` in test mode).

## 3) Vercel

1. Sign up at [vercel.com](https://vercel.com) (Hobby/free tier is fine to start).
2. **New Project** → Import this GitHub repo.
3. **Environment variables** (Project → Settings → Environment Variables):

| Name | Example |
|------|---------|
| `STRIPE_SECRET_KEY` | `sk_test_...` then `sk_live_...` when live |
| `COLEMADE_SITE_URL` | Your public site URL **with no trailing slash**, e.g. `https://yourname.github.io/colemade-lab-site` or `https://www.yourdomain.com` |
| `ALLOWED_ORIGIN` | Same origin as the site that opens checkout (e.g. `https://yourname.github.io`) — use `*` only for quick tests |

4. Deploy. Note your Vercel URL, e.g. `https://your-project.vercel.app`.

### Where things are in the Vercel dashboard

- **Project home** — lists **Deployments** (each git push builds here). Open a deployment to see **Build Logs** and runtime **Functions** logs.
- **Settings → Environment Variables** — add or edit `STRIPE_*`, `COLEMADE_SITE_URL`, `ALLOWED_ORIGIN`, webhook secrets, etc. **Redeploy** after changes so production picks them up (or use “Redeploy” on the latest deployment).
- **Settings → Git** — confirms the connected GitHub repo and branch.
- **Logs** (in the top nav or under the project) — live and recent function output; useful when debugging checkout or webhooks.

## 4) Connect the storefront

Edit **`js/site-config.js`**:

```js
window.COLEMADE_STRIPE_CHECKOUT_URL = "https://YOUR-PROJECT.vercel.app/api/create-checkout-session";
```

Use your real Vercel hostname. Commit and push so **cart.html** loads this URL.

## 5) Test checkout

1. Stripe **Test mode** on.
2. Add a paid item to cart → Pay with Stripe test card `4242 4242 4242 4242`, any future expiry, any CVC.
3. You should land on `cart.html` with `session_id` in the URL.

## 6) Webhooks (only after a real payment)

Browsers and carts **do not** hit this URL — only Stripe does, after Checkout succeeds. Subscribe to **`checkout.session.completed`**; the handler also checks **`payment_status === paid`** so unpaid / abandoned checkouts are ignored.

1. Deploy so `api/stripe-webhook.mjs` is live (Edge function — same path: `/api/stripe-webhook`).
2. Stripe Dashboard → **Developers → Webhooks** → **Add endpoint**:  
   `https://YOUR-PROJECT.vercel.app/api/stripe-webhook`
3. Select event: **`checkout.session.completed`**.
4. Reveal the endpoint **Signing secret** (`whsec_…`) and add it in Vercel:

| Name | Purpose |
|------|---------|
| `STRIPE_WEBHOOK_SECRET` | Signing secret from the webhook endpoint (required) |

5. Optional — email yourself via [Resend](https://resend.com):

| Name | Purpose |
|------|---------|
| `ORDER_NOTIFY_EMAIL` | Your inbox |
| `RESEND_API_KEY` | Resend API key |
| `RESEND_FROM` | Verified sender, e.g. `You <orders@yourdomain.com>` (or Resend’s test sender) |

6. Redeploy after changing env vars. In Stripe → Webhooks → your endpoint, use **Send test webhook** or complete a test checkout; Vercel → Project → **Logs** should show the function run.

**Fallback:** In Stripe you can also turn on **email notifications to your account** for successful payments if you skip Resend.

## 6b) What you receive automatically

- **Webhook email (Resend):** After each paid checkout, the email includes **full line-item specs** decoded from the cart (sizes, qty, deal, **artwork file names** the customer selected on the site — not the binary files).
- **File uploads:** After payment, Stripe sends the customer back to `cart.html?session_id=…`. They see an **upload form**; files go to `POST /api/submit-order-files`, which checks the session is paid and **emails you the attachments** (same Resend env vars). Limits: 15 files, ~12 MB each (tune in `api/submit-order-files.js` if needed).

Run `npm install` after pulling (adds `busboy` for multipart uploads).

## 7) Go live

1. Switch Stripe to **Live mode** keys in Vercel env.
2. Redeploy Vercel.
3. Update `site-config.js` if your production domain changed.

## Keeping prices in sync

Server totals are built in **`api/_lib/pricing.js`** from the same rules as **`js/pricing.js`**.  
When you change client pricing, update **both** files.
