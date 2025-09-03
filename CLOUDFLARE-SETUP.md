# 🚀 Cloudflare Configuration Guide for Penguin Mails

This guide walks through setting up your Next.js application deployed with OpenNext on Cloudflare Workers.

## Prerequisites

- ✅ **Cloudflare Account** - [Sign up here](https://dash.cloudflare.com/sign-up)
- ✅ **API Token** from Cloudflare Dashboard
- ✅ **Application deployed** to Cloudflare Workers

## 1. Cloudflare Dashboard Setup

### Step 1: Access Workers & Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select **Workers & Pages** from the sidebar
3. Find your **penguin-mails** worker

### Step 2: Configure Environment Variables

Add your environment variables in the Workers Dashboard:

#### Required Variables:

```
CLOUDFLARE_API_TOKEN - Your Cloudflare API token
CLOUDFLARE_ACCOUNT_ID - Your Cloudflare account ID
```

#### Application Variables:

```
# Your existing Next.js environment variables
NEXTJS_ENV=production
NILEDB_USER=your_db_user
NILEDB_PASSWORD=your_db_password
NILEDB_POSTGRES_URL=your_connection_string
```

### Step 3: Configure Worker Bindings

Your worker has pre-configured bindings:

#### Current Bindings:

- ✅ **WORKER_SELF_REFERENCE** (penguin-mails) - For internal routing
- ✅ **ASSETS** - For static file serving
- Optional: **R2 Bucket** for caching (if configured)

## 2. Domain Configuration

### Option A: Default Cloudflare Workers Domain

Your app is automatically available at:

```
https://penguin-mails.mailspenguin.workers.dev
```

### Option B: Custom Domain

1. **Add Custom Domain:**
   - Go to **Workers & Pages** → **penguin-mails** → **Custom Domains**
   - Click **Add Custom Domain**
   - Enter your domain (e.g., `penguin-mails.com`)

2. **Configure DNS:**
   - Point your domain's A/CNAME record to Cloudflare
   - Set up SSL certificate (Cloudflare provides this automatically)

3. **Update Application URLs:**
   - Modify `APP_URL` environment variable to your custom domain
   - Update any hardcoded URLs to use your custom domain

## 3. Performance Optimization

### Static Asset Caching

Your application includes optimized caching headers:

```
Cache-Control: public,max-age=31536000,immutable
```

Applied to all `_next/static` assets (1 year cache).

### Worker Optimization

- **Cold Start**: ~27ms (excellent performance)
- **Global CDN**: Served from 300+ Cloudflare data centers
- **Edge Computing**: Runs at the edge for minimal latency

## 4. Environment Management

### Production Environment

✅ **Current Configuration:**

- Worker deployed to all edge locations
- Environment variables set for production use
- Static assets optimized and cached

### Preview Environment (Pull Requests)

Your GitHub Actions will create preview deployments for PRs:

- Separate worker instances
- Test changes before merging to main
- Automatic PR comments with preview URLs

## 5. Monitoring & Analytics

### Cloudflare Analytics

1. Go to **Workers & Pages** → **penguin-mails**
2. Click **Analytics** tab
3. Monitor requests, errors, and performance

### Real User Monitoring (RUM)

Enable basic RUM data collection:

1. Go to **Assets** → **Real User Monitoring**
2. Enable RUM collection
3. Monitor user experience metrics

### Worker Logs

View real-time logs:

1. Go to **Workers & Pages** → **penguin-mails**
2. Click **Logs** tab
3. Enable Real-time Logging

## 6. Troubleshooting

### Common Issues

#### Worker Not Loading

**Symptom**: Worker returns 500 errors
**Solution**:

1. Check environment variables are set correctly
2. Verify database connections
3. Check Cloudflare logs for detailed error messages

#### Static Assets Not Loading

**Symptom**: CSS/JS files return 404
**Solution**:

1. Verify ASSETS binding is configured correctly
2. Check if `.open-next` directory was built properly
3. Ensure cache headers are applied

#### API Routes Failing

**Symptom**: API endpoints return 500 errors
**Solution**:

1. Verify OpenNext build included API routes
2. Check environment variables for API connections
3. Review Cloudflare function logs

### Error Logs Location

- **Build Errors**: GitHub Actions → Workflows → Latest run → Build logs
- **Runtime Errors**: Cloudflare Dashboard → Workers → Logs
- **Function Errors**: Cloudflare Dashboard → Real-time logs

## 7. Security Configuration

### Environment Variables Security

✅ **API Tokens**: Encrypted in GitHub Secrets and Cloudflare Workers
✅ **Database Credentials**: Stored as encrypted values
✅ **No Secrets in Code**: All secrets are environment variables

### DDoS Protection

Enabled by default through Cloudflare's network.

### Rate Limiting

Configure if needed via Cloudflare WAF rules:

1. Go to **Security** → **WAF**
2. Create rate limiting rules
3. Define thresholds for your API

## 8. Scaling & Performance

### Current Performance Metrics

- **Response Time**: ~27ms cold start
- **Global Reach**: 300+ data centers
- **Concurrent Requests**: Unlimited (serverless scaling)
- **Asset Caching**: 1-year cache for static files

### Scaling Considerations

- Worker automatically scales with request volume
- No server management required
- Pay-per-use billing

## 9. Backup & Recovery

### Worker Versions

For manual rollbacks:

1. Go to **Workers & Pages** → **penguin-mails** → **Deployments**
2. View version history
3. Roll back to previous versions if needed

### Code Repository

- Production code stored in GitHub
- Automatic deployments provide rollbacks
- Git history for code recovery

# 🚀 Deployed Successfully!

Your application is now running on:
🔗 **https://penguin-mails.mailspenguin.workers.dev**

For custom domain setup, follow the domain configuration steps above.
