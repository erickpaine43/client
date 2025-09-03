# CI/CD Configuration for Cloudflare Deployment

This repository is configured for automated deployment to Cloudflare using GitHub Actions and the OpenNext Cloudflare adapter.

## Workflows

### 1. `deploy.yml` - Production Deployment

- **Trigger**: Push to `main` branch, PR to `main` branch, or manual dispatch
- **Function**: Builds and deploys to Cloudflare Workers
- **Commands**: `npm run build:open-next` then `npx wrangler deploy`
- **Workflow Steps**: Build Next.js → Build OpenNext → Verify worker → Deploy

### 2. `ci.yml` - Continuous Integration

- Runs linting and tests on every PR
- Ensures code quality before deployment

## Required Secrets

You need to set up the following secrets in your GitHub repository:

### Cloudflare Authentication

1. Go to **Repository Settings** → **Secrets and Variables** → **Actions**
2. Add the following secrets:

#### `CLOUDFLARE_API_TOKEN`

- Generate from: **Cloudflare Dashboard** → **Manage Account** → **My Profile** → **API Tokens**
- Use the **Edit Cloudflare Workers** template
- Scope to your specific account and resources

#### `CLOUDFLARE_ACCOUNT_ID`

- Find from: **Cloudflare Dashboard** → **Account** → **Workers & Pages**
- Copy your Account ID from the right sidebar

## Deployment Process

### Automatic Deployment

- **Push to main**: Automatically builds and deploys to production
- **Pull Request**: Tests deployment in preview environment
- **Manual**: Use GitHub Actions tab to trigger deployments

### Deployment Commands

```bash
# Build Next.js
npm run build

# Build Next.js
npm run build

# Build OpenNext worker
npm run build:open-next

# Test build without deployment
npm run build:dry

# Preview locally (Cloudflare runtime)
npm run preview

# Deploy to Cloudflare
npm run deploy
```

## Configuration Files

- `wrangler.jsonc` - Cloudflare Worker configuration
- `open-next.config.ts` - OpenNext build configuration
- `next.config.ts` - Next.js configuration with OpenNext development setup
- `public/_headers` - Static asset caching headers
- `.dev.vars` - Local development environment variables

## Troubleshooting

### Missing API Token

```
Error: Authentication required
```

✅ **Fix**: Check your `CLOUDFLARE_API_TOKEN` secret value

### Missing Account ID

```
Error: No account id found
```

✅ **Fix**: Check your `CLOUDFLARE_ACCOUNT_ID` secret value

### Build Errors

```
Error: Build failed
```

✅ **Fix**: Check the build logs in GitHub Actions and ensure all dependencies are properly configured

### Permission Issues

```
Error: Unauthorized
```

✅ **Fix**: Verify the API token has the correct permissions and is not expired
