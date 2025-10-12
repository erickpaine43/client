#!/bin/bash
# based on https://medium.com/evenbit/configuring-firebase-app-hosting-with-google-secrets-manager-2b83c09f3ad9

ENV_FILE="${1:-.env.development}" # Default to .env.development if no arg is provided. Then you can run it like `./update-firebase-secrets.sh .env.production`.

if [ ! -f "$ENV_FILE" ]; then
    echo "Error: Environment file '$ENV_FILE' not found." >&2
    exit 1
fi

source "$ENV_FILE"

command -v firebase >/dev/null 2>&1 || {
  echo "Firebase CLI not found!" >&2
  exit 1
}

BACKEND_ID="dashboard-penguinmails"

update_secret() {
  local secret_value="$1"
  local secret_name="$2"

  if [ -z "$secret_value" ]; then
    echo "Warning: Secret '$secret_name' is not set. Skipping."
    return
  fi

  echo "Updating secret: $secret_name"
  echo "$secret_value" | firebase apphosting:secrets:set --force --data-file - "$secret_name" && \
  firebase apphosting:secrets:grantaccess --backend "$BACKEND_ID" "$secret_name"
}

# APP
update_secret "$NEXT_PUBLIC_APP_URL" "next-public-app-url"

# STRIPE
# update_secret "$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" "stripe-publishable-key"
# update_secret "$STRIPE_SECRET_KEY" "stripe-secret-key"
# update_secret "$STRIPE_WEBHOOK_SIGNING_SECRET" "stripe-webhook-signing-secret"

# NILEDB
update_secret "$NILEDB_USER" "niledb-user"
update_secret "$NILEDB_PASSWORD" "niledb-password"
update_secret "$NILEDB_API_URL" "niledb-api-url"
update_secret "$NILEDB_POSTGRES_URL" "niledb-postgres-url"

# CONVEX
update_secret "$CONVEX_DEPLOY_KEY" "convex-deploy-key"

# UPSTASH REDIS
update_secret "$UPSTASH_REDIS_REST_URL" "upstash-redis-rest-url"
update_secret "$UPSTASH_REDIS_REST_TOKEN" "upstash-redis-rest-token"

echo "setup secrets done"
echo "you can now deploy your app with firebase deploy"
echo "or deploy your app with firebase deploy --only hosting"
