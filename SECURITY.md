# Security remediation

The Firebase web configuration previously contained a Firebase API key in Git history. That key must be treated as exposed.

## Required Firebase Console actions

1. Open Google Cloud Console for the Firebase project.
2. Go to **APIs & Services → Credentials**.
3. Create a replacement browser/API key and delete or disable the exposed key.
4. Apply application restrictions appropriate to each platform:
   - **Web**: HTTP referrers limited to the production domains and local development domains.
   - **Android**: Android apps restricted by package name and SHA-1/SHA-256 certificate fingerprints.
   - **iOS**: iOS apps restricted by bundle identifier.
5. Restrict the key to only the APIs required by this app, then monitor quota and usage.
6. Review Firebase Authentication, Firestore, and Realtime Database rules. API-key restrictions do not replace Firebase security rules.

## Local setup

Copy `.env.example` to `.env`, fill in the replacement Firebase values, and keep `.env` untracked. Do not put real keys in `.env.example`, source files, documentation, or issue comments.

## Git history

Removing a key from the latest commit does not remove it from existing Git objects, forks, clones, caches, or pull requests. The repository owner must rewrite history locally and force-push the rewritten branches after rotating the exposed key.

Recommended local procedure:

```bash
git clone --mirror https://github.com/Umme-Aimen-8663/QuickBites.git
cd QuickBites.git
git filter-repo --path src/firebase/config.js --replace-text <(printf '%s==>REDACTED\n' 'EXPOSED_VALUE')
git push --force --all origin
git push --force --tags origin
```

Replace `EXPOSED_VALUE` with the actual exposed value only in your local command. Because history rewriting can disrupt collaborators and forks, verify backups and coordinate before force-pushing.
