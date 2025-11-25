#!/bin/bash

# ===========================================
# Vercel Environment Variables Setup Script
# ===========================================
# This script automates adding environment variables to Vercel
# 
# Prerequisites:
#   1. Install Vercel CLI: npm i -g vercel
#   2. Login: vercel login
#   3. Link project: vercel link
#
# Usage:
#   chmod +x vercel-env-setup.sh
#   ./vercel-env-setup.sh
#
# ===========================================

set -e  # Exit on error

echo "🚀 Vercel Environment Variables Setup"
echo "===================================="
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm i -g vercel
fi

# Check if logged in
echo "📋 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel:"
    vercel login
fi

echo ""
echo "✅ Vercel CLI ready"
echo ""

# Function to add environment variable
add_env() {
    local key=$1
    local value=$2
    local envs=$3  # "production preview" or just "production"
    
    if [ -z "$value" ] || [ "$value" == "SKIP" ] || [[ "$value" == *"your-"* ]] || [[ "$value" == *"xxxxx"* ]]; then
        echo "⏭️  Skipping $key (placeholder value)"
        return
    fi
    
    echo "➕ Adding $key to $envs..."
    echo "$value" | vercel env add "$key" $envs 2>/dev/null || echo "⚠️  $key may already exist or failed to add"
}

echo "🔴 CRITICAL VARIABLES"
echo "--------------------"
echo ""

# Ask for DATABASE_URL
echo "📊 Database Configuration"
read -p "Enter your DATABASE_URL (PostgreSQL connection string): " DATABASE_URL
if [ ! -z "$DATABASE_URL" ]; then
    add_env "DATABASE_URL" "$DATABASE_URL" "production preview"
else
    echo "⚠️  Warning: DATABASE_URL is required! The app won't work without it."
    read -p "Continue anyway? (y/N): " continue
    if [ "$continue" != "y" ]; then
        exit 1
    fi
fi

echo ""

# Add pre-generated secrets
echo "🔐 Adding Authentication Secrets (pre-generated)..."
add_env "JWT_SECRET" "3R2hsLN6302/VtGessDItlQCZN9lxHwHLctkO3hnomY=" "production preview"
add_env "SESSION_SECRET" "H9JzN1JUXQgQRPt6I17uU8pkYE+NZUdrrNiGfCyyBZU=" "production preview"

echo ""

# Add NODE_ENV
echo "🌍 Setting Environment Mode..."
add_env "NODE_ENV" "production" "production"

echo ""
echo "🟡 RECOMMENDED VARIABLES"
echo "------------------------"
echo ""

# Redis
read -p "Do you have a Redis URL? (y/N): " has_redis
if [ "$has_redis" == "y" ]; then
    read -p "Enter REDIS_URL: " REDIS_URL
    add_env "REDIS_URL" "$REDIS_URL" "production preview"
else
    echo "ℹ️  Skipping Redis (app will work without it but with reduced performance)"
fi

echo ""

# App URL
read -p "Enter your Vercel app URL (e.g., https://rabit-hr.vercel.app): " APP_URL
if [ ! -z "$APP_URL" ]; then
    add_env "VITE_APP_URL" "$APP_URL" "production preview"
    add_env "APP_URL" "$APP_URL" "production preview"
fi

echo ""

# Google Analytics
read -p "Do you have Google Analytics? (y/N): " has_ga
if [ "$has_ga" == "y" ]; then
    read -p "Enter GA_MEASUREMENT_ID (G-XXXXXXXXXX): " GA_ID
    add_env "VITE_GA_MEASUREMENT_ID" "$GA_ID" "production preview"
fi

echo ""

# Sentry
read -p "Do you want to add Sentry error tracking? (y/N): " has_sentry
if [ "$has_sentry" == "y" ]; then
    read -p "Enter SENTRY_DSN: " SENTRY_DSN
    add_env "SENTRY_DSN" "$SENTRY_DSN" "production preview"
    add_env "VITE_SENTRY_DSN" "$SENTRY_DSN" "production preview"
fi

echo ""
echo "⚪ OPTIONAL VARIABLES"
echo "---------------------"
echo ""

# Ask for optional services
read -p "Do you want to configure optional services? (Email, SMS, Payments, AI) (y/N): " config_optional

if [ "$config_optional" == "y" ]; then
    
    # Email
    echo ""
    read -p "Configure Email (SMTP)? (y/N): " has_email
    if [ "$has_email" == "y" ]; then
        read -p "SMTP_HOST (e.g., smtp.gmail.com): " SMTP_HOST
        read -p "SMTP_PORT (587): " SMTP_PORT
        SMTP_PORT=${SMTP_PORT:-587}
        read -p "SMTP_USER: " SMTP_USER
        read -p "SMTP_PASSWORD: " SMTP_PASSWORD
        read -p "SMTP_FROM (e.g., Rabit <noreply@rabit.sa>): " SMTP_FROM
        
        add_env "SMTP_HOST" "$SMTP_HOST" "production preview"
        add_env "SMTP_PORT" "$SMTP_PORT" "production preview"
        add_env "SMTP_USER" "$SMTP_USER" "production preview"
        add_env "SMTP_PASSWORD" "$SMTP_PASSWORD" "production preview"
        add_env "SMTP_FROM" "$SMTP_FROM" "production preview"
        add_env "EMAIL_FROM" "$SMTP_FROM" "production preview"
    fi
    
    # Cloudinary
    echo ""
    read -p "Configure Cloudinary (File Storage)? (y/N): " has_cloudinary
    if [ "$has_cloudinary" == "y" ]; then
        read -p "CLOUDINARY_URL (full URL): " CLOUDINARY_URL
        add_env "CLOUDINARY_URL" "$CLOUDINARY_URL" "production preview"
    fi
    
    # Payment Gateways
    echo ""
    read -p "Configure Moyasar Payment Gateway? (y/N): " has_moyasar
    if [ "$has_moyasar" == "y" ]; then
        read -p "MOYASAR_API_KEY: " MOYASAR_API_KEY
        read -p "MOYASAR_SECRET_KEY: " MOYASAR_SECRET_KEY
        add_env "MOYASAR_API_KEY" "$MOYASAR_API_KEY" "production preview"
        add_env "MOYASAR_SECRET_KEY" "$MOYASAR_SECRET_KEY" "production preview"
    fi
    
    # OpenAI
    echo ""
    read -p "Configure OpenAI? (y/N): " has_openai
    if [ "$has_openai" == "y" ]; then
        read -p "OPENAI_API_KEY: " OPENAI_API_KEY
        add_env "OPENAI_API_KEY" "$OPENAI_API_KEY" "production preview"
        add_env "OPENAI_MODEL" "gpt-4o-mini" "production preview"
    fi
    
    # Google Maps
    echo ""
    read -p "Configure Google Maps? (y/N): " has_maps
    if [ "$has_maps" == "y" ]; then
        read -p "GOOGLE_MAPS_API_KEY: " GOOGLE_MAPS_API_KEY
        add_env "GOOGLE_MAPS_API_KEY" "$GOOGLE_MAPS_API_KEY" "production preview"
    fi
    
fi

# Default optional values
echo ""
echo "➕ Adding default optional settings..."
add_env "VITE_APP_TITLE" "رابِط | Rabit - نظام إدارة الموارد البشرية" "production preview"
add_env "VITE_APP_LOGO" "/LOGO.svg" "production preview"
add_env "SESSION_MAX_AGE" "604800000" "production preview"
add_env "LOG_LEVEL" "info" "production"
add_env "RATE_LIMIT_WINDOW_MS" "900000" "production preview"
add_env "RATE_LIMIT_MAX_REQUESTS" "100" "production preview"

echo ""
echo "✅ Environment Variables Setup Complete!"
echo ""
echo "📋 Summary:"
echo "  - Critical variables: Added (DATABASE_URL, JWT_SECRET, SESSION_SECRET, NODE_ENV)"
echo "  - Optional variables: Added based on your selections"
echo ""
echo "🚀 Next Steps:"
echo "  1. Verify variables: vercel env ls"
echo "  2. Trigger deployment: git push origin main"
echo "     OR: Go to Vercel dashboard → Deployments → Redeploy"
echo "  3. Wait 2-3 minutes for deployment"
echo "  4. Test your app at: $APP_URL"
echo ""
echo "📖 For more details, see:"
echo "  - VERCEL_ENV_SETUP_GUIDE.md"
echo "  - .env.vercel.production (template with all values)"
echo ""
echo "🔍 Troubleshooting:"
echo "  - View logs: vercel logs --follow"
echo "  - Check deployment: vercel ls"
echo "  - Pull env vars: vercel env pull .env.production.local"
echo ""
echo "✨ Done! Your Rabit HR app is ready for deployment!"
