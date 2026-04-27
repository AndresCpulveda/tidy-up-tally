## Goal

Allow editing the email body message from the Send Email dialog before sending — without permanently overwriting the default template.

## Approach

The email body currently has two parts that depend on dynamic data:
1. The opening paragraph (mentions visit + cleaning frequency).
2. The benefits intro + bullet list.
3. The closing paragraph (mentions monthly price).
4. The standard sign-off.

Most of this is generic boilerplate. To keep it simple and useful, we'll expose **one editable "Message" field** in the dialog containing the full email body (HTML stripped to plain text with paragraph breaks). The user can edit/tweak it for that specific send, leaving the default untouched for next time.

## Changes

### 1. `src/components/EmailProposalDialog.tsx`

- Extract the current email body into a `buildDefaultMessage()` helper that returns a plain-text version (with `\n\n` between paragraphs, `- ` for bullets). It uses `recipientName`, `timesPerWeek`, `subjectParts`, `totalBill`, `companyName`.
- Add a `message` state (string) and a `messageEdited` boolean flag.
- When the dialog opens, or when `recipientName` / attachment selection changes AND the user has NOT manually edited, regenerate the default message via `useEffect`.
- Add a **Textarea** field labeled "Email Message" below the attachments checkboxes:
  - Multi-line, ~10 rows, monospace-friendly, resizable.
  - `onChange` sets `message` and flips `messageEdited = true`.
  - Small "Reset to default" link/button that restores the generated default and clears `messageEdited`.
- On send, convert the plain-text `message` to HTML by:
  - Splitting on blank lines into `<p>` blocks.
  - Lines starting with `- ` inside a block become `<ul><li>` items.
  - Wrap in the existing `<div style="font-family: Arial…">` container and append the existing sign-off (`Best regards, ${settings.companyName}`).
- Reset `message` and `messageEdited` when the dialog closes or after a successful send.

### 2. No backend changes

The edge function already accepts `bodyHtml`, so nothing to update there.

## User experience

- Open Send Email dialog → message field is pre-filled with the standard template (personalized with recipient name, frequency, price).
- User can tweak any wording for this specific send.
- "Reset to default" restores the template if they change their mind.
- Next time the dialog opens, it starts fresh from the default again (no persistence).

## Out of scope

- Saving custom default messages in Settings/Templates (can be added later if you want a permanent edit).
- Rich-text editor (plain text with auto-formatted paragraphs/bullets keeps it light).