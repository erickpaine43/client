# 🔐 GitHub Repository Secrets Setup

## Required Secrets for Cloudflare Deployment

### Step 1: Go to Repository Settings

1. Go to your GitHub repository
2. Click **Settings** tab
3. Click **Secrets and Variables** in the left sidebar
4. Click **Actions** section

### Step 2: Add Required Secrets

#### 🔑 CLOUDFLARE_API_TOKEN

```
Name: CLOUDFLARE_API_TOKEN
Value: [Your Cloudflare API Token]
```

**How to get your API Token:**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to **Manage Account** → **My Profile** → **API Tokens**
3. Click **Create Token**
4. Select **Edit Cloudflare Workers** template
5. **Important**: Configure token permissions:
   - Account: **Use specific account** (select your account)
   - Zone: **Include all zones** or specific zones
   - Resources: **Account**, **Zone**, **Workers Scripts**
6. Click **Create Token**
7. **Copy and save** - you can only see it once!

#### 🆔 CLOUDFLARE_ACCOUNT_ID

```
Name: CLOUDFLARE_ACCOUNT_ID
Value: [Your Cloudflare Account ID]
```

**How to find your Account ID:**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Scroll to the bottom of any page
3. Account ID is listed at the bottom
4. Or: Go to **Manage Account** → **Account API Tokens** (visible on that page)

### Step 3: Verify Configuration

Once secrets are added, your GitHub Actions deployment will work automatically on:

- ✅ Push to `main` branch
- ✅ Pull requests to `main` branch
- ✅ Manual workflow dispatch

### Step 4: Test Deployment

After adding secrets:

1. Push a small change to the `main` branch (e.g., comment in README)
2. Go to **Actions** tab in your repository
3. Check the latest workflow run
4. It should deploy successfully to Cloudflare

### 🔍 Troubleshooting

#### Secret Not Found Error

```
Error: Input required and not supplied: apiToken
```

**Fix**: Check that the secret name is exactly `CLOUDFLARE_API_TOKEN`

#### Authentication Error

```
Error: Authentication failed
```

**Fix**: Verify your API token is valid and has the correct permissions

#### Wrong Account Error

```
Error: Account ID mismatch
```

**Fix**: Ensure `CLOUDFLARE_ACCOUNT_ID` matches the one associated with your API token

### 📋 Secrets Summary

```bash
Required:
✓ CLOUDFLARE_API_TOKEN  # Your API token from Cloudflare
✓ CLOUDFLARE_ACCOUNT_ID  # Your account ID from Cloudflare

Optional:
- GITHUB_TOKEN          # Automatically provided by GitHub Actions
- Custom secrets for your application
```

### 🚀 About GitHub Secrets

- 🔒 **Encrypted**: Secrets are encrypted and cannot be viewed after creation
- 🔄 **Actions Only**: Only available during GitHub Actions runs
- 🛡️ **Secure**: Cannot be accidentally committed to your repository
- 👀 **Hidden**: Values are masked in Action logs
