---
title: "Importing Steam Guard into a Standard 2FA App"
locale: en
description: "Transfer a Steam authenticator with steamguard-cli and import it into 2FAS. Transfer, revocation, QR codes and the Base64 secret-key pitfall."
publishedDate: 2026-09-28
tags:
  - Tools
  - CLI
draft: true
---

The Steam Guard authenticators for my four Steam accounts were on one iPhone. I wanted them in [2FAS](https://2fas.com/) alongside my other two-factor authentication codes.

I used [steamguard-cli](https://github.com/dyc3/steamguard-cli) to transfer each authenticator to my Mac, then imported its secret into 2FAS.

## iPhone Backups

I decrypted two encrypted iPhone backups. Neither contained a `Steamguard-<steamid>` file. The keychain export contained more than 30,000 records but no Steam authenticator secret. The app retained login tokens, not the authenticator key.

These observations concern the current Steam iOS app I tested. Old backup-extraction instructions did not work for it.

## Preparation

Install the CLI:

```bash
brew install steamguard-cli
steamguard --version
```

Have the account password and the current Steam app ready. Transfer requires access to the account's SMS number. Revocation requires its recovery code, formatted as `R` followed by five digits.

The CLI stores one `<account>.maFile` per account and a `manifest.json`:

- macOS: `~/Library/Application Support/steamguard-cli/maFiles/`
- Linux: `~/.config/steamguard-cli/maFiles/`
- Windows: `%APPDATA%\steamguard-cli\maFiles\`

## Login

Run setup separately for each account:

```bash
steamguard setup
```

Enter its username and password. Approve the login in the Steam app and press Enter, or enter the app's current five-character code. Email-authenticated accounts instead receive a login code by email.

Use each code once. After a failed attempt, wait for a new code. For multiple accounts, switch the Steam app to the matching account before approving.

## Transfer or Revoke

For an existing mobile authenticator, setup offers:

```text
[T] Transfer authenticator to steamguard-cli (2 day trade ban)
[R] Revoke authenticator with revocation code (15 day trade ban)
[A] Abort setup
```

| Choice | Requirement | Trading restriction |
|---|---|---|
| Transfer | SMS sent to the account's registered number | 2 days |
| Revoke | Recovery code, such as `R12345` | 15 days |

These restrictions affect trading and the market, not normal login or games.

With Transfer, enter `t`, then the SMS code. Save the new recovery code in a password manager. The old authenticator in the phone app stops working.

With Revoke, enter `r` and the recovery code. The CLI removes the old authenticator and starts enrollment for a new one.

## Finalizing New Enrollment

An account without an authenticator, including one just revoked, proceeds through new enrollment. Record the recovery code before continuing. Enter the new confirmation code sent by email.

This is not the earlier login email. Enrollment is complete only after:

```text
Authenticator has been finalized.
```

Check the result:

```bash
steamguard -u <account> status
```

It must report `Is 2FA set up? true`.

## Verify Codes on the Computer

```bash
steamguard list
steamguard -u <account> code
```

The second command prints a five-character code, such as `ABCDE`. Test it by logging into Steam before importing the secret elsewhere.

## Import into 2FAS

The `shared_secret` in a maFile is **Base64**. Authenticator apps expect **Base32**. Pasting Base64 into 2FAS can produce plausible-looking but incorrect Steam codes.

Use the CLI's QR command instead:

```bash
steamguard -u <account> qr
```

The QR contains an `otpauth://totp/Steam:<account>?secret=<BASE32>&issuer=Steam` URI. Its secret is already Base32.

A generic authenticator may interpret this as ordinary six-digit TOTP. In 2FAS, change the entry's type to **STEAM** so it generates five-character alphanumeric codes. If the scanned entry cannot be changed, delete that entry and add it manually.

Other supported formats:

```bash
steamguard -u <account> qr --format bitwarden
steamguard -u <account> qr --format keepassxc
steamguard -u <account> qr --ascii
```

Bitwarden uses `steam://<BASE32>`. KeePassXC's URI includes `digits=5`, `period=30` and `encoder=steam`. The ASCII option helps when the terminal font cannot display the QR blocks.

For manual entry, extract `secret` from the maFile's `uri` field or convert the Base64 value locally:

```bash
printf '<shared_secret>' | base64 -d | base32
```

Keep the trailing `=` when copying the Base64 input. Do not paste a real secret into shell history.

In 2FAS:

1. Select **Enter secret key manually**
2. Set the service name to Steam or an account-specific label
3. Enter the Base32 secret
4. Open **Other settings** and choose **STEAM**
5. Add the service

See [2FAS's Steam Guard instructions](https://2fas.com/support/2fas-auth-mobile-app/how-to-add-a-steam-guard-token/). The steamguard-cli README warns that Google Authenticator and Authy do not generate the required Steam codes.

Compare the CLI and authenticator codes at the same time. They must match exactly.

## Backup and Cleanup

Keep each recovery code in a password manager and maintain an encrypted backup of the maFiles directory. If both the computer and authenticator copy are lost, restoring access through revocation imposes another trading restriction. Losing the recovery code as well requires Steam support.

Encrypt the local files with:

```bash
steamguard encrypt
```

Subsequent commands require its password. The CLI also accepts `--passkey` and `STEAMGUARD_CLI_PASSKEY`, but avoid exposing passwords through history or logs.

A QR image or secret grants full access to the authenticator. Do not save screenshots to a photo library or paste secrets into chats or AI tools.

After checking backups, remove temporary plaintext secret exports, decrypted phone backups, keychain exports and any logs or history containing passwords. Verify each path before deletion.

## Failure Cases

### No Transfer SMS

The SMS goes to the number registered to the Steam account, not necessarily the phone approving the login. Check the number for each account. An account with no registered number needs one added or must use revocation.

### No Code or Approval Prompt

Without an active authenticator in the Steam app, it may show neither a code nor a login-approval request. I first added an authenticator in the phone app, then used its new code to log into the CLI and transfer it.

### Incorrect 2FAS Codes

Check that the secret is Base32 and the entry type is STEAM. Ordinary TOTP displays six digits instead of Steam's five-character code.

### Incomplete Enrollment

A login email code cannot finalize enrollment. Use the separate confirmation email, then check `status`.

If the CLI has a partially enrolled local account, rerunning setup may report that it already exists. Remove only that account's local maFile and its corresponding `manifest.json` entry before retrying. Preserve unrelated entries.

Do not use `steamguard remove` for local cleanup. It removes the authenticator from the Steam account itself.
