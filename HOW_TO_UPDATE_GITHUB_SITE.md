# How to get your updates onto your GitHub website

You have two ways. Pick one.

---

## Option 1: Manual upload (no setup, good for quick fixes)

Whenever you change a file (e.g. in Cursor on your `cmtwebsite` folder):

1. Go to **github.com** → your account → open the **repo** that has your site (e.g. `colemadethat`).
2. Click the file you changed (e.g. `index.html` or `styles.css`).
3. Click the **pencil icon** (Edit) and paste in your new version, **or** click **Add file** → **Upload files** and drag the updated file from your `cmtwebsite` folder (this replaces the old file).
4. Scroll down, click **Commit changes**.

GitHub Pages will update your live site in 1–2 minutes. No software to install; just replace the file on GitHub with your local copy whenever you make changes.

---

## Option 2: Use Git so “push” updates the site (set up once, then easy)

After a one-time setup, you’ll run a few commands (or use GitHub Desktop) and your live site will update.

### One-time setup on your PC

**Step 1 — Install Git**

- Go to [git-scm.com/download/win](https://git-scm.com/download/win) and download **Git for Windows**.
- Run the installer. Default options are fine; click Next until it finishes.

**Step 2 — Connect your folder to GitHub**

- Open **Command Prompt** or **PowerShell** (search for it in the Windows start menu).
- Go to your website folder:
  ```bash
  cd OneDrive\Documents\cmtwebsite
  ```
  (If your folder is somewhere else, use that path.)

- Tell Git this folder is a repo and connect it to GitHub (replace `YOUR_USERNAME` and `REPO_NAME` with your real GitHub username and repo name, e.g. `colemadethat` and `colemadethat`):
  ```bash
  git init
  git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
  ```
- Pull down what’s already on GitHub (so you’re in sync):
  ```bash
  git fetch origin
  git checkout main
  git reset --hard origin/main
  ```
  (If your default branch is `master` instead of `main`, use `origin/master` and `git checkout master`.)

You only do this once.

---

### Every time you make updates

1. In Cursor (or any editor), edit your files in `cmtwebsite` as usual and save.
2. Open **Command Prompt** or **PowerShell** and go to the folder:
   ```bash
   cd OneDrive\Documents\cmtwebsite
   ```
3. Run these three commands:
   ```bash
   git add .
   git commit -m "Update site"
   git push origin main
   ```
   (Use `master` instead of `main` if that’s your branch name.)

4. Wait 1–2 minutes. Your live site (e.g. colemadethat.com or the github.io link) will show the updates.

So: **edit locally → `git add .` → `git commit -m "Update site"` → `git push origin main`** = site updated.

---

## Option 2b: Same idea, but with GitHub Desktop (no commands)

If you don’t want to use the command line:

1. Download **GitHub Desktop**: [desktop.github.com](https://desktop.github.com). Install it and sign in with your GitHub account.
2. **File** → **Add local repository** → choose your `cmtwebsite` folder. If it says “this directory does not appear to be a Git repository”, choose **create a repository** and set it there; then in GitHub Desktop use **Repository** → **Repository settings** → add the GitHub repo as **Primary remote repository** (`origin`).
3. When you’ve made changes to your site:
   - Open GitHub Desktop. It will show your changed files.
   - Write a short summary (e.g. “Update site”) in the bottom-left box.
   - Click **Commit to main**.
   - Click **Push origin**.

Your GitHub repo (and thus your GitHub Pages site) will update. Same result as Option 2, but with buttons instead of typing commands.

---

## Summary

| Method              | Setup        | To update site                                      |
|---------------------|-------------|-----------------------------------------------------|
| Manual upload       | None        | Replace the file(s) on GitHub in the browser        |
| Git (command line)  | Once (Git + `git init` / `remote` / first sync) | `git add .` → `git commit -m "Update site"` → `git push origin main` |
| GitHub Desktop      | Once (app + connect folder to repo) | Commit + Push in the app                            |

After any push (or after you replace files on GitHub), GitHub Pages will automatically rebuild; your updates will appear on your live site in about 1–2 minutes.
