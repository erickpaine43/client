#!/bin/bash
# based on https://medium.com/evenbit/configuring-firebase-app-hosting-with-google-secrets-manager-2b83c09f3ad9
source ./.env.development # Can be configured in other env

#!/bin/bash
command -v firebase >/dev/null 2>&1 || {
  echo "Firebase CLI not found!" >&2
  exit 1
}

# STRIPE
echo $NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY | firebase apphosting:secrets:set --force --data-file - stripe-publishable-key && firebase apphosting:secrets:grantaccess --backend dashboard-penguinmails stripe-publishable-key
echo $STRIPE_SECRET_KEY | firebase apphosting:secrets:set --force --data-file - stripe-secret-key && firebase apphosting:secrets:grantaccess --backend dashboard-penguinmails stripe-secret-key
echo $STRIPE_WEBHOOK_SIGNING_SECRET | firebase apphosting:secrets:set --force --data-file - stripe-webhook-signing-secret && firebase apphosting:secrets:grantaccess --backend dashboard-penguinmails stripe-webhook-signing-secret

# NILEDB
echo $NILEDB_USER | firebase apphosting:secrets:set --force --data-file - niledb-user && firebase apphosting:secrets:grantaccess --backend dashboard-penguinmails niledb-user
echo $NILEDB_PASSWORD | firebase apphosting:secrets:set --force --data-file - niledb-password && firebase apphosting:secrets:grantaccess --backend dashboard-penguinmails niledb-password
echo $NILEDB_API_URL | firebase apphosting:secrets:set --force --data-file - niledb-api-url && firebase apphosting:secrets:grantaccess --backend dashboard-penguinmails niledb-api-url
echo $NILEDB_POSTGRES_URL | firebase apphosting:secrets:set --force --data-file - niledb-postgres-url && firebase apphosting:secrets:grantaccess --backend dashboard-penguinmails niledb-postgres-url

# CONVEX
echo $CONVEX_DEPLOY_KEY | firebase apphosting:secrets:set --force --data-file - convex-deploy-key && firebase apphosting:secrets:grantaccess --backend dashboard-penguinmails convex-deploy-key

# UPSTASH REDIS
echo $UPSTASH_REDIS_REST_URL | firebase apphosting:secrets:set --force --data-file - upstash-redis-rest-url && firebase apphosting:secrets:grantaccess --backend dashboard-penguinmails upstash-redis-rest-url
echo $UPSTASH_REDIS_REST_TOKEN | firebase apphosting:secrets:set --force --data-file - upstash-redis-rest-token && firebase apphosting:secrets:grantaccess --backend dashboard-penguinmails upstash-redis-rest-token

echo "setup secrets done"
echo "you can now deploy your app with firebase deploy"
echo "or deploy your app with firebase deploy --only hosting"
