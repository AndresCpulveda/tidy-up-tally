## Goal

Ensure that when clients click "Reply" on a quote email, the response lands in your main inbox (`carlosegusquiza@officepride.com`) instead of the unmonitored sending mailbox (`carlos.egusquiza@officeprides.com`).

## Change

Update the `send-proposal-email` Edge Function to include a `reply_to` field in the Resend payload.

**File:** `supabase/functions/send-proposal-email/index.ts`

In the `emailPayload` object, add:
```ts
reply_to: ["carlosegusquiza@officepride.com"]
```

Final payload shape:
- `from`: `Carlos Egusquiza <carlos.egusquiza@officeprides.com>` (unchanged)
- `to`: recipient (unchanged)
- `reply_to`: `carlosegusquiza@officepride.com` (new)
- `cc`: `carlosegusquiza@officepride.com` (kept — gives you a copy of the outgoing email as a sent-confirmation)
- `subject`, `html`/`text`, `attachments`: unchanged

Then redeploy the `send-proposal-email` Edge Function so the change takes effect.

## What you'll see after this

- Clients still see emails coming from `carlos.egusquiza@officeprides.com` (good for branding & deliverability — this is your verified domain).
- The moment they click "Reply" in Gmail/Outlook/etc., the To: field auto-fills with `carlosegusquiza@officepride.com`.
- Replies arrive in your main inbox — full visibility, no missed responses.
- You also continue to receive a CC of every outgoing quote as a paper trail. (If you find this noisy later, we can remove the CC in one line.)

## Optional follow-up (not part of this change)

If you'd rather receive replies at a *different* address than the CC (e.g. CC goes to a shared archive, replies go to your personal inbox), let me know and I'll wire up two distinct addresses.
