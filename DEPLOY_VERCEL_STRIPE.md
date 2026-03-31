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

## 6) Webhooks (notify you of paid orders)

1. Stripe Dashboard → **Developers → Webhooks** → Add endpoint:  
   `https://YOUR-PROJECT.vercel.app/api/stripe-webhook`
2. Event: `checkout.session.completed`.
3. Production should **verify** the webhook signature (see Stripe docs). The stub in `api/stripe-webhook.js` logs only — extend it to email you (e.g. Resend, SendGrid) or save orders.

## 7) Go live

1. Switch Stripe to **Live mode** keys in Vercel env.
2. Redeploy Vercel.
3. Update `site-config.js` if your production domain changed.

## Keeping prices in sync

Server totals are built in **`api/_lib/pricing.js`** from the same rules as **`js/pricing.js`**.  
When you change client pricing, update **both** files.
