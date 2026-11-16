# 🚀 Deployment Guide: Deploy to Render (Backend) & Vercel (Frontend)

This guide walks you through deploying the **RECOMP 90** full-stack application for **100% free** 24/7 cloud hosting.

---

## 📌 Architecture Overview

```
                 ┌────────────────────────────────┐
                 │  Vercel (Frontend React App)   │
                 │  https://recomp-90.vercel.app  │
                 └───────────────┬────────────────┘
                                 │ API Requests
                                 ▼
                 ┌────────────────────────────────┐
                 │    Render (Node.js Backend)    │
                 │ https://recomp-api.onrender.com│
                 └──────┬──────────────────┬──────┘
                        │                  │
                        ▼                  ▼
        ┌─────────────────────────┐  ┌─────────────────────────┐
        │  MongoDB Atlas (Cloud)  │  │  ImageKit (Cloud CDN)   │
        │      Database DB        │  │     Photos Storage      │
        └─────────────────────────┘  └─────────────────────────┘
```

---

## Step 1: Push Code to GitHub

1. Open a terminal in this folder (`c:\Users\Abhishek  Yadav\OneDrive\Desktop\recreate`).
2. We have already initialized Git and created the first commit for you.
3. Go to [github.com/new](https://github.com/new) and create a new repository:
   - **Repository name**: `recomp-90`
   - **Visibility**: `Private` (recommended)
   - Do **NOT** initialize with README or .gitignore (we already have them)
4. Run these commands in your PowerShell:

```powershell
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/recomp-90.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Backend on Render (Free Web Service)

1. Go to **[dashboard.render.com](https://dashboard.render.com/)**.
2. Click **New +** (top right) ➔ Select **Web Service**.
3. Choose **Build and deploy from a Git repository** ➔ Select your `recomp-90` repository.
4. Fill in the configuration details:

| Setting | Value |
| :--- | :--- |
| **Name** | `recomp90-api` (or any unique name) |
| **Region** | `Singapore` or `Frankfurt` (closest to India) |
| **Branch** | `main` |
| **Root Directory** | `server` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Instance Type** | `Free` |

5. Scroll down to **Environment Variables** and add the following keys:

| Key | Value | Notes |
| :--- | :--- | :--- |
| `PORT` | `5000` | Render port |
| `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | `recomp_secret_master_key_90days_2026_abhilx_yadav` | Token secret |
| `MASTER_PASSWORD` | `Abhilx@Yadavji` | App password |
| `IMAGEKIT_PUBLIC_KEY` | `public_K/7xwi0np9rHUv1YZybjWBGG/ak=` | ImageKit Public Key |
| `IMAGEKIT_PRIVATE_KEY` | `private_pm5aKvk7KnZ+fCtL6o3rPdavPS8=` | ImageKit Private Key |
| `IMAGEKIT_URL_ENDPOINT` | `https://ik.imagekit.io/mzt83qr5o` | ImageKit URL Endpoint |

6. Click **Deploy Web Service**.
7. Wait 2 minutes until Render status says **Live** (Green dot).
8. Copy your backend live URL:
   - Example: `https://recomp90-api.onrender.com`

---

## Step 3: Deploy Frontend on Vercel (Free)

1. Go to **[vercel.com/new](https://vercel.com/new)**.
2. Select your GitHub repository (`recomp-90`) and click **Import**.
3. In the configuration screen:
   - **Framework Preset**: `Vite` (automatically detected)
   - **Root Directory**: Click **Edit** ➔ Type or select `client` ➔ Click **Continue**
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist` (default)
4. Open the **Environment Variables** dropdown and add:

| Key | Value |
| :--- | :--- |
| `VITE_API_URL` | `https://recomp90-api.onrender.com` *(Paste your Render backend URL from Step 2)* |

5. Click **Deploy**.
6. Within 1 minute, Vercel will complete the build and show:
   🎉 **Congratulations! Your project has been deployed.**
7. Open your Vercel URL (e.g., `https://recomp-90.vercel.app`) on your phone or PC.
8. Enter master password `Abhilx@Yadavji` to unlock your Personal Fitness OS!

---

## 🔒 Security & Cloud Verification Checklist

- [x] Passwords and API keys excluded from Git (`.gitignore`).
- [x] Custom dark gym toast notifications replace all browser `alert()` popups.
- [x] Custom confirmation dialog replaces browser `window.confirm()`.
- [x] ImageKit cloud photo uploads configured for persistent storage across deployments.
- [x] SPAs rewrite rules added (`vercel.json`) to prevent 404 on page reload.

