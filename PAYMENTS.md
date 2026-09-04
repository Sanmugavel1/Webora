# Payment gateway (Razorpay)

The Starter (₹5,999) and Growth (₹9,999) pricing cards on `/pricing` take a real
payment via Razorpay Checkout. The E-Commerce card stays as a "Custom Quote"
enquiry button since it has no fixed price.

## How it works

1. Client clicks **PAY & GET STARTED** → `POST /api/checkout/create-order`
   (`src/app/api/checkout/create-order/route.ts`) creates a Razorpay order
   server-side, using the amount from `src/lib/data/pricing.ts` — never a
   client-supplied amount.
2. Razorpay's Checkout modal opens (script loaded from
   `checkout.razorpay.com`, no npm package needed client-side).
3. On success, the client posts the payment response to
   `POST /api/checkout/verify` (`src/app/api/checkout/verify/route.ts`),
   which recomputes the HMAC-SHA256 signature server-side with the secret
   key. This is the only step that actually proves the payment succeeded —
   never trust the client-side "success" callback alone.
4. Verified → redirect to `/pricing/success`.

All payments, refunds, and settlement info live in your Razorpay Dashboard —
this integration doesn't store or email anything itself.

## Setup — getting your live API keys

1. Log in at **https://dashboard.razorpay.com**.
2. Make sure your account is **activated** (KYC/business docs approved) —
   until then Razorpay only issues **test** keys, and live payments won't
   work at all.
3. Top-right corner: switch the mode toggle from **Test Mode** to **Live Mode**.
4. Left sidebar → **Settings** → **API Keys**.
5. Click **Generate Live Key**.
6. Razorpay shows the **Key Id** and **Key Secret** exactly once. Download/copy
   both immediately — the Key Secret cannot be viewed again after you close
   that dialog (only regenerated, which invalidates the old one).

## Setting the keys on this project — do this yourself, not by pasting into chat

The Key Secret can authorize charges/refunds on your account, so treat it
like a password: **don't paste it into a chat session** (this one included —
it gets saved in the conversation transcript). Put it directly into a local
file instead:

```bash
cd ~/Documents/webora-project
cp .env.local.example .env.local
nano .env.local   # or open it in any editor
```

Fill in:

```
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=<paste the secret here>
```

Save the file. `.env.local` is already in `.gitignore`, so it will never be
committed or pushed to GitHub.

- **Local dev**: restart `npm run dev` after saving so it picks up the new env vars.
- **Vercel (production)**: also add both variables in the Vercel dashboard
  → Project → Settings → Environment Variables (Production scope), then
  redeploy. `.env.local` is not read in production — Vercel only sees
  variables you set there.

## Testing before going live

Until KYC is done (or if you just want to test the flow first), use Razorpay's
**test** keys instead (Settings → API Keys, while still in Test Mode — no KYC
required). Use Razorpay's [published test card/UPI numbers](https://razorpay.com/docs/payments/payments/test-card-upi-details/)
to simulate a full payment with no real money moving. Swap in the `rzp_live_...`
keys later — no code changes needed, just the `.env.local` values (and the
Vercel env vars).

The ₹1 internal smoke-test page (`/pricing/test`) that used to live here has
been removed now that the live gateway integration is confirmed working.
