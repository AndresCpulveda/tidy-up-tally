## Goal

Add a branded HTML signature to every outgoing proposal email, with Carlos's contact details and three association/brand logos.

## Signature content

```
Carlos Egusquiza | Owner
Office Pride Commercial Cleaning Services
Fort Lauderdale - Hollywood
O: 954.998.3518 | C: 317.679.3294
OfficePride.com/0401
```
Followed by three logos in a row: Office Pride, Greater Hollywood Chamber of Commerce, IFMA South Florida.

## Approach

Email clients strip `<img src="cid:...">` only when attachments are inline-flagged, and they block local/private URLs. The most reliable cross-client option is **base64 data URIs** embedded directly in the HTML — works in Gmail, Outlook web, Apple Mail. Resend supports HTML with `<img src="data:image/png;base64,...">` inline.

So the plan:

### 1. Add the three logo assets to the project

Copy uploaded images into `src/assets/`:
- `src/assets/email-signature/office-pride-logo.png` (already exists as `src/assets/office-pride-logo.png` — reuse it)
- `src/assets/email-signature/hollywood-chamber-logo.png` (from `user-uploads://image-2.png`)
- `src/assets/email-signature/ifma-logo.png` (from `user-uploads://image-3.png`)

### 2. Create a signature builder utility

New file `src/utils/buildEmailSignature.ts`:
- Imports the three logo images (Vite turns them into URLs).
- Fetches each at runtime, converts to base64 data URI (one-time per session, memoized).
- Returns an HTML string with the contact block + a `<table>` row of the three logos (tables = best email client compatibility), each ~40-50px tall, with reasonable spacing.
- The "OfficePride.com/0401" line will be a real `<a href="https://www.officepride.com/0401">` link.

### 3. Wire signature into `EmailProposalDialog.tsx`

In `handleSend`, replace the current sign-off:
```
<p>Best regards,<br/><strong>${settings.companyName}</strong></p>
```
with:
```
${await buildEmailSignature()}
```
appended after `messageToHtml(message)` inside the existing wrapper div.

The "Best regards," line moves into the signature builder so the message body ends naturally and the signature handles the closing.

## Final email body structure

```
<div style="font-family: Arial, sans-serif; ...">
  {message body HTML}
  <p>Best regards,</p>
  {signature: name/title/company/location/phones/website}
  {logo row table}
</div>
```

## Out of scope

- Editing the signature from the UI (hardcoded for now — can be moved to Templates later if needed).
- Hosting logos on a CDN (data URIs keep things self-contained, no external dependencies).
- Changing the existing message editor / textarea behavior.
