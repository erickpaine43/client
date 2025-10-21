# GitHub Repository Secrets Setup for CI/CD

This document outlines the required GitHub repository secrets needed for the CI/CD pipeline.

## Required Secrets

### Vercel Deployment Secrets

1. **VERCEL_TOKEN**
   - Get from: [Vercel Account Settings > Tokens](https://vercel.com/account/tokens)
   - Create a new token with appropriate permissions

2. **VERCEL_ORG_ID**
   - Get from: `vercel whoami` (run in terminal after installing Vercel CLI and logging in)
   - Or find in Vercel dashboard URL: `https://vercel.com/teams/[ORG_ID]/~/projects`

3. **VERCEL_PROJECT_ID**
   - Get from: Vercel project settings or run `vercel project ls` after linking project
   - Or find in project dashboard URL: `https://vercel.com/[ORG_NAME]/[PROJECT_NAME]/[PROJECT_ID]`

### Convex Deployment Secrets

4. **CONVEX_DEPLOY_KEY**
   - Get from: Convex dashboard > Project Settings > Deploy Keys
   - Create a new deploy key with production access

## Setup Instructions

### Step 1: Get Vercel Credentials

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Get your org ID
vercel whoami

# Link your project (run in project root)
vercel link

# Get project details
vercel project ls
```

### Step 2: Get Convex Deploy Key

1. Go to [Convex Dashboard](https://www.convex.dev/)
2. Select your project
3. Go to Settings > Deploy Keys
4. Create a new deploy key
5. Copy the generated key

### Step 3: Add Secrets to GitHub

Go to your GitHub repository > Settings > Secrets and variables > Actions

Add the following secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `VERCEL_TOKEN` | Your Vercel token | Required for Vercel CLI authentication |
| `VERCEL_ORG_ID` | Your Vercel org ID | Required for Vercel project identification |
| `VERCEL_PROJECT_ID` | Your Vercel project ID | Required for Vercel project identification |
| `CONVEX_DEPLOY_KEY` | Your Convex deploy key | Required for Convex backend deployment |

### Step 4: Verify Setup

After adding secrets, you can test the setup by:

1. Pushing a commit to the `main` branch (triggers CI and staging deployment)
2. Manually triggering production deployment via GitHub Actions

## Environment Variables

The following environment variables should be configured in Vercel for each environment:

### Staging Environment
- Set in Vercel dashboard: Project Settings > Environment Variables
- Same variables as development but with staging-specific values

### Production Environment
- Set in Vercel dashboard: Project Settings > Environment Variables
- Production-specific values for all sensitive configuration

## Troubleshooting

### Common Issues

1. **"Invalid token" error**
   - Check that VERCEL_TOKEN is correctly set and not expired
   - Regenerate token if necessary

2. **"Project not found" error**
   - Verify VERCEL_ORG_ID and VERCEL_PROJECT_ID are correct
   - Ensure the Vercel project exists and is accessible

3. **Convex deployment fails**
   - Check CONVEX_DEPLOY_KEY is valid and has proper permissions
   - Ensure Convex project is set up correctly

### Testing Secrets

You can test if secrets are properly configured by running:
```bash
# Test Vercel connection
vercel --token $VERCEL_TOKEN whoami

# Test Convex connection
npx convex deploy --dry-run
