# Step-by-step: Put ColeMadeThat on GitHub and go live

Do these steps in order. You only need a web browser.

---

## Part 1: Create a new repository (the “folder” for your site)

**Step 1.** Open [github.com](https://github.com) in your browser and **log in** with the account you just made.

**Step 2.** In the top-right, click the **+** (plus) and choose **New repository**.

**Step 3.** Fill in the page:

- **Repository name:** Type something like `colemadethat` or `cmtwebsite` (no spaces, lowercase is fine).
- **Description:** Optional. You can leave it blank or type “ColeMadeThat website”.
- **Public** should be selected (the dot on “Public”).
- **Do NOT** check “Add a README file”.
- Leave everything else as is.

**Step 4.** Click the green **Create repository** button.

You’ll see a new, empty repo with a page that says “Quick setup” and maybe “uploading an existing file”.

---

## Part 2: Upload your website files

**Step 5.** On that same repo page, click **“uploading an existing file”** (the link in the “…or push an existing repository from the command line” section).  
If you don’t see that, look for **“Add file”** (top left of the file list) → **“Upload files”** and use that instead.

**Step 6.** You need to drag and drop (or select) **all** of these from your computer:

- From your `cmtwebsite` folder:
  - `index.html`
  - `styles.css`
  - `script.js`
  - `logo.jpeg` (or `logo.jpg` if that’s what you have)
  - `hero-image-1.png`
  - Any other images or files the site uses (same folder as `index.html`)

**How to drag and drop:**

- Open File Explorer (Windows) and go to your `cmtwebsite` folder (e.g. `Documents\cmtwebsite`).
- Select **all** the files above (Ctrl+Click each, or Ctrl+A if that’s all that’s in the folder).
- **Drag** them into the GitHub browser window where it says “Drag files here” or “Choose your files”.

**Step 7.** Scroll down. In the **Commit changes** box:

- **First box (message):** Type something like `Add website files` or `Initial upload`.
- Leave the rest as is.

**Step 8.** Click the green **Commit changes** button.

You should now see your files listed in the repo (index.html, styles.css, script.js, images, etc.).

---

## Part 3: Turn on GitHub Pages (make the site live)

**Step 9.** In the same repo, click **Settings** (top menu of the repo, next to Code / Issues / etc.).

**Step 10.** In the left sidebar, under **“Code and automation”**, click **Pages**.

**Step 11.** Under **“Build and deployment”**:

- **Source:** choose **“Deploy from a branch”** (not “GitHub Actions”).
- **Branch:** open the dropdown and pick **main** (or **master** if that’s all you see).
- **Folder:** choose **/ (root)**.
- Click **Save**.

**Step 12.** Wait 1–2 minutes. Refresh the **Pages** settings page. Near the top you’ll see something like:

**“Your site is live at https://YOUR_USERNAME.github.io/REPO_NAME/”**

Example: if your username is `johndoe` and the repo is `colemadethat`, it will be:

**https://johndoe.github.io/colemadethat/**

**Step 13.** Click that link (or copy it into a new tab). You should see your ColeMadeThat site.

If you see it, the site is live. You can share that link. No monthly fee.

---

## Part 4 (optional): Use colemadethat.com instead of the github.io link

Only do this if you already have the domain and have set up DNS at Porkbun (as in DEPLOY.md).

**Step 14.** In your repo, click **Add file** → **Create new file**.

**Step 15.** In the **“Name your file”** box, type exactly: **CNAME** (all caps, no .txt or other extension).

**Step 16.** In the big text box, type exactly one line:

- **www.colemadethat.com**  
  or  
- **colemadethat.com**  

(Use whichever one you set in GitHub Settings → Pages → Custom domain.)

**Step 17.** Scroll down, click the green **Commit changes** button.

**Step 18.** In the repo, go to **Settings** → **Pages** again. Under **Custom domain**, type **www.colemadethat.com** (or **colemadethat.com**) and click **Save**. After DNS has propagated (see DEPLOY.md), GitHub will show the domain as verified and you can check **Enforce HTTPS**.

---

## Quick checklist

- [ ] Logged in at github.com  
- [ ] Created a new **public** repo (e.g. `colemadethat`)  
- [ ] Uploaded **index.html**, **styles.css**, **script.js**, and **all images** from `cmtwebsite`  
- [ ] Committed the upload  
- [ ] **Settings** → **Pages** → Source: **Deploy from a branch** → Branch: **main** → Folder: **/ (root)** → **Save**  
- [ ] Waited 1–2 minutes and opened the live link  
- [ ] (Optional) Added **CNAME** file and set Custom domain if using colemadethat.com  

If any step doesn’t match what you see (e.g. no “Pages” in Settings), tell me what you see and we can adjust.
