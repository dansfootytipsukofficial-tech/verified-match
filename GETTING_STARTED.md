# Getting Started - Push Your Project Files to GitHub

This guide will help you push your local Verified Match dating website files to this GitHub repository.

## Prerequisites

- Git installed on your computer ([Download here](https://git-scm.com/download))
- Your project files (HTML, CSS, JS, etc.) in a folder called `verified-match`
- This GitHub repository already created

## Step 1: Open Terminal/Command Prompt

On macOS/Linux:
- Open Terminal (Cmd + Space, type "Terminal")

On Windows:
- Open Command Prompt or PowerShell

## Step 2: Navigate to Your Project Directory

```bash
cd /path/to/verified-match
```

Replace `/path/to/verified-match` with the actual path to your project folder.

## Step 3: Initialize Git and Add Remote

If this is a new Git project, initialize it:

```bash
git init
```

Add the GitHub repository as your remote:

```bash
git remote add origin https://github.com/dansfootytipsukofficial-tech/verified-match.git
```

## Step 4: Add Your Files

Add all your project files to Git:

```bash
git add .
```

Or add specific files:

```bash
git add index.html
git add css/style.css
git add js/app.js
```

## Step 5: Create Your First Commit

```bash
git commit -m "Add project files: HTML, CSS, JavaScript, and Supabase integration"
```

## Step 6: Push to GitHub

```bash
git branch -M main
git push -u origin main
```

Enter your GitHub username and password (or personal access token if you have 2FA enabled).

## Step 7: Verify Upload

Visit your repository on GitHub:
https://github.com/dansfootytipsukofficial-tech/verified-match

You should see your files appear in the repository!

## Step 8: Access Your Live Site

Once uploaded, your site will be available at:

```
https://dansfootytipsukofficial-tech.github.io/verified-match/
```

It may take a few minutes for GitHub Pages to build and deploy.

## Important Files to Include

### Must Have
- `index.html` - Main entry point
- `css/style.css` - Styling
- `js/app.js` - Main JavaScript logic
- `config.js` - Supabase configuration

### Recommended Structure

```
verified-match/
├── index.html
├── config.js
├── css/
│   ├── style.css
│   └── responsive.css
├── js/
│   ├── app.js
│   ├── auth.js
│   ├── database.js
│   └── ui.js
└── images/
    └── logo.png
```

## Supabase Configuration

Make sure your `config.js` file includes your Supabase keys:

```javascript
const SUPABASE_URL = 'your_supabase_url';
const SUPABASE_KEY = 'your_supabase_anon_key';
```

⚠️ **SECURITY WARNING**: Never commit sensitive keys directly. Use environment variables instead.

## Troubleshooting

### Authentication Error
If you get an authentication error:
1. Use a Personal Access Token instead of password
2. Generate one at: https://github.com/settings/tokens
3. Select `repo` scope and copy the token
4. Use the token as your password when pushing

### Branch Name Error
If you get an error about branch names, run:

```bash
git branch -M main
```

### Files Not Showing
If files don't appear after push:
1. Check push was successful: `git log -1`
2. Refresh GitHub page (Cmd+Shift+R for hard refresh)
3. Wait 2-3 minutes for GitHub Pages to build

## Next Steps

After uploading your files:

1. **Test the live site**: Visit your GitHub Pages URL
2. **Make improvements**: Edit files locally, then:
   ```bash
   git add .
   git commit -m "Feature: your description"
   git push
   ```
3. **Add features**: Database connection, advanced matching, premium features
4. **Improve UI**: Make it "the best in the world" as planned!

## Continuous Updates

Everytime you make changes locally:

```bash
git add .
git commit -m "Your meaningful commit message"
git push
```

Your GitHub Pages site updates automatically!

## Support

- GitHub Help: https://docs.github.com
- Git Documentation: https://git-scm.com/doc
- GitHub Pages: https://pages.github.com

---

**Ready to push? Run the commands in Steps 1-6 and your project will be live!**
