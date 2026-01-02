# GitHub Pages Deployment for RowState

## Automatic Deployment Setup

This repository is configured to automatically deploy to GitHub Pages whenever you push to the `main` branch.

## Setup Instructions

### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (in the left sidebar)
3. Under **Source**, select **GitHub Actions**
4. Save the settings

### 2. Push Your Code

```bash
git add .
git commit -m "Add GitHub Pages deployment"
git push origin main
```

The GitHub Action will automatically:
- Build your app
- Deploy to GitHub Pages
- Make it available at: `https://[your-username].github.io/RowState/`

### 3. Access Your Deployed App

After the deployment completes (check the **Actions** tab), your app will be live at:

```
https://[your-username].github.io/RowState/
```

Replace `[your-username]` with your GitHub username.

## Important Notes

### Browser Compatibility for Bluetooth

⚠️ **Web Bluetooth API limitations:**
- ✅ **Works:** Chrome/Edge on desktop and Android
- ❌ **Doesn't work:** Firefox, Safari, iOS browsers

Your rowing monitor and heart rate monitor will only connect on supported browsers.

### Manual Deployment

You can also trigger deployment manually:
1. Go to **Actions** tab in GitHub
2. Select **Deploy to GitHub Pages** workflow
3. Click **Run workflow**

### Local Testing

To test the production build locally:

```bash
npm run build
npm run preview
```

## Troubleshooting

### If the base path is wrong:

Edit `vite.config.ts` and change the `base` value to match your repository name:

```typescript
base: '/YourRepoName/',
```

### If deployment fails:

1. Check the **Actions** tab for error logs
2. Ensure GitHub Pages is enabled in repository settings
3. Verify the workflow has proper permissions
