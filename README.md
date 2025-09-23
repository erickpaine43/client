This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

## Deploy on Cloudflare (Recommended)

This project is configured for deployment on Cloudflare using the OpenNext adapter for optimal performance.

### Prerequisites

1. Create a Cloudflare API Token with "Edit Cloudflare Workers" permissions
2. Get your Cloudflare Account ID from your dashboard
3. Add these as repository secrets:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`

### Deployment

The application includes CI/CD setup that automatically deploys to Cloudflare:

- **Push to main**: Deploys to production
- **Pull Requests**: Deploys preview versions
- **Manual deployment**: Via GitHub Actions

For more deployment details, see [`.github/workflows/README.md`](./.github/workflows/README.md)

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Preview Cloudflare deployment locally
npm run preview

# Build for production
npm run build
```

### Deployment Scripts

```bash
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

# Upload new version (for gradual rollout)
npm run upload
```

### Cloudflare Setup

For complete Cloudflare configuration instructions:

- 📖 **Cloudflare Setup Guide**: [`CLOUDFLARE-SETUP.md`](./CLOUDFLARE-SETUP.md)
- 🔐 **GitHub Secrets Setup**: [`.github/SETUP-SECRETS.md`](./.github/SETUP-SECRETS.md)
- 📋 **Workflow Documentation**: [`.github/workflows/README.md`](./.github/workflows/README.md)

## Current Deployment

✅ **Status**: Deployed and running
🔗 **URL**: https://penguin-mails.mailspenguin.workers.dev

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

<!-- CONTRIBUTORS START -->
<h2>Contributors</h2>
<table border='1' cellspacing='0' cellpadding='5'>
  <thead>
    <tr><th>Avatar</th><th>Username</th><th>Insights</th></tr>
  </thead>
  <tbody>
    <tr><td><img src="https://avatars.githubusercontent.com/u/36519478?v=4?s=50" alt="Avatar" width="50" height="50"></td><td><a href="https://github.com/Israel-Laguan">Israel-Laguan</a></td><td><a href="https://github.com/penguinmails/client/graphs/contributors">📈</a></td></tr>
    <tr><td><img src="https://avatars.githubusercontent.com/u/112190828?v=4?s=50" alt="Avatar" width="50" height="50"></td><td><a href="https://github.com/Mhmd0Mhmod">Mhmd0Mhmod</a></td><td><a href="https://github.com/penguinmails/client/graphs/contributors">📈</a></td></tr>
  </tbody>
</table>
<!-- CONTRIBUTORS END -->
