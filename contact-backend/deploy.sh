#!/usr/bin/env bash
# One-shot deploy for the CoronaryAtlas contact backend.
# Creates an IAM role (SES send only), a Node.js 20 Lambda from index.mjs,
# and a public Function URL. Re-runnable: updates code if the function exists.
#
# Prerequisites: awscli v2 configured (`aws configure`) with your account,
# and the sender/recipient identity verified in SES (see README step 1).
#
# Usage:
#   AWS_REGION=us-east-1 ./deploy.sh
# Optional overrides:
#   FUNC_NAME, ROLE_NAME, TURNSTILE_SECRET, ALLOW_ORIGIN, FROM_EMAIL, TO_EMAIL

set -euo pipefail

REGION="${AWS_REGION:-us-east-1}"
FUNC_NAME="${FUNC_NAME:-coronaryatlas-contact}"
ROLE_NAME="${ROLE_NAME:-coronaryatlas-contact-role}"
FROM_EMAIL="${FROM_EMAIL:-admin@myakme.com}"
TO_EMAIL="${TO_EMAIL:-admin@myakme.com}"
ALLOW_ORIGIN="${ALLOW_ORIGIN:-https://coronaryatlas.com}"
# Cloudflare TEST secret by default — set the real one for production.
TURNSTILE_SECRET="${TURNSTILE_SECRET:-1x0000000000000000000000000000000AA}"

ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"
echo "Account ${ACCOUNT_ID}, region ${REGION}"

# --- IAM role ---
if ! aws iam get-role --role-name "$ROLE_NAME" >/dev/null 2>&1; then
  echo "Creating IAM role ${ROLE_NAME}…"
  aws iam create-role --role-name "$ROLE_NAME" \
    --assume-role-policy-document '{
      "Version":"2012-10-17",
      "Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:AssumeRole"}]
    }' >/dev/null
  aws iam attach-role-policy --role-name "$ROLE_NAME" \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
  # SES send permission (scoped to the FROM address)
  aws iam put-role-policy --role-name "$ROLE_NAME" --policy-name ses-send \
    --policy-document "$(sed "s|admin@myakme.com|${FROM_EMAIL}|g" iam-policy.json)"
  echo "Waiting 10s for role propagation…"; sleep 10
else
  echo "IAM role ${ROLE_NAME} exists — reusing."
fi

# --- package ---
rm -f function.zip
zip -q function.zip index.mjs
ENV_VARS="Variables={TO_EMAIL=${TO_EMAIL},FROM_EMAIL=${FROM_EMAIL},TURNSTILE_SECRET=${TURNSTILE_SECRET},ALLOW_ORIGIN=${ALLOW_ORIGIN}}"

# --- create or update the function ---
if aws lambda get-function --function-name "$FUNC_NAME" --region "$REGION" >/dev/null 2>&1; then
  echo "Updating existing Lambda ${FUNC_NAME}…"
  aws lambda update-function-code --function-name "$FUNC_NAME" --region "$REGION" \
    --zip-file fileb://function.zip >/dev/null
  aws lambda wait function-updated --function-name "$FUNC_NAME" --region "$REGION"
  aws lambda update-function-configuration --function-name "$FUNC_NAME" --region "$REGION" \
    --environment "$ENV_VARS" >/dev/null
else
  echo "Creating Lambda ${FUNC_NAME}…"
  aws lambda create-function --function-name "$FUNC_NAME" --region "$REGION" \
    --runtime nodejs20.x --handler index.handler --role "$ROLE_ARN" \
    --timeout 15 --memory-size 128 \
    --zip-file fileb://function.zip --environment "$ENV_VARS" >/dev/null
  aws lambda wait function-active --function-name "$FUNC_NAME" --region "$REGION"
fi

# --- public Function URL + CORS ---
if ! aws lambda get-function-url-config --function-name "$FUNC_NAME" --region "$REGION" >/dev/null 2>&1; then
  aws lambda create-function-url-config --function-name "$FUNC_NAME" --region "$REGION" \
    --auth-type NONE \
    --cors "AllowOrigins=${ALLOW_ORIGIN},AllowMethods=POST,AllowHeaders=content-type" >/dev/null
  # allow public invoke of the URL
  aws lambda add-permission --function-name "$FUNC_NAME" --region "$REGION" \
    --statement-id FunctionURLAllowPublicAccess --action lambda:InvokeFunctionUrl \
    --principal "*" --function-url-auth-type NONE >/dev/null 2>&1 || true
fi

URL="$(aws lambda get-function-url-config --function-name "$FUNC_NAME" --region "$REGION" --query FunctionUrl --output text)"
echo
echo "=================================================================="
echo "Deployed. Function URL:"
echo "  ${URL}"
echo
echo "Set this in the site build environment, then rebuild + redeploy:"
echo "  NEXT_PUBLIC_CONTACT_ENDPOINT=${URL}"
echo "=================================================================="
