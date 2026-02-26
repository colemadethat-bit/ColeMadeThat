# Fix your Git setup — do these in order

You hit three things: (1) wrong folder, (2) fake URL, (3) Git needs your name/email.

---

## Step 1: Remove the repo from your home folder (important)

You ran `git init` in your **home folder** (`C:/Users/coleb/`). That would track your whole user folder. Remove it:

In Git Bash (from any folder), run:

```bash
cd ~
rm -rf .git
```

Now your home folder is no longer a Git repo.

---

## Step 2: Tell Git who you are (one-time)

In Git Bash, run (use your real name and the email from your GitHub account):

```bash
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

Example: `git config --global user.email "colemadethat@gmail.com"`

---

## Step 3: Use your website folder and the real GitHub URL

**3a.** Go to your website folder. In Git Bash:

```bash
cd ~/OneDrive/Documents/cmtwebsite
```

(If that path doesn’t work, try `cd /c/Users/coleb/OneDrive/Documents/cmtwebsite`.)

**3b.** Replace **YOUR_USERNAME** and **REPO_NAME** with your real GitHub username and repo name.

- Find them on github.com: open your repo, look at the URL.  
  Example: `https://github.com/coleb123/colemadethat` → username is `coleb123`, repo is `colemadethat`.

**3c.** Run these one at a time (with YOUR real username and repo name):

```bash
git init
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
```

Example if your username is `coleb` and repo is `colemadethat`:

```bash
git remote add origin https://github.com/coleb/colemadethat.git
```

If it says "remote origin already exists", run:

```bash
git remote set-url origin https://github.com/YOUR_USERNAME/REPO_NAME.git
```

---

## Step 4: Sync with GitHub (choose A or B)

**Option A — Your GitHub repo already has your site and you want to keep it, then update from this folder**

```bash
git fetch origin
git checkout -b main origin/main
git pull origin main --allow-unrelated-histories
```

If it asks for a merge message, save and close the editor. Then add your local changes and push:

```bash
git add .
git commit -m "Sync local updates"
git push -u origin main
```

**Option B — This folder is the real version; overwrite what’s on GitHub**

```bash
git add .
git commit -m "Update site"
git branch -M main
git push -u origin main --force
```

`--force` replaces the history on GitHub with this folder. Only do this if you’re sure your local `cmtwebsite` has everything you want.

---

## Step 5: From now on, to update the site

Whenever you change files in `cmtwebsite`:

```bash
cd ~/OneDrive/Documents/cmtwebsite
git add .
git commit -m "Update site"
git push origin main
```

(If you use `master` instead of `main`, use `git push origin master`.)

---

## Quick reference

| Mistake | Fix |
|--------|-----|
| Ran commands in `~` (home) | Remove `~/.git` with `rm -rf .git` from `~`, then run everything from `~/OneDrive/Documents/cmtwebsite` |
| Used literal YOUR_USERNAME/REPO_NAME | Use your real GitHub username and repo name in the URL |
| `Author identity unknown` | Run `git config --global user.name "..."` and `user.email "..."` |
| `^[[200~` in the terminal | Ignore it; it’s from pasting. Type or paste the command without that. |
