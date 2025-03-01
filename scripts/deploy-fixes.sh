#!/bin/bash

# Script to deploy fixes for dashboard loading issues

echo "Deploying fixes for dashboard loading issues..."

# 1. Commit changes
git add lib/supabase/api.ts app/dashboard/page.tsx lib/supabase/types.ts
git commit -m "Fix: Dashboard loading issues after user signup"

# 2. Push to main branch
git push origin main

# 3. Verify deployment
echo "Changes pushed to main branch. Vercel should automatically deploy the changes."
echo "Please wait a few minutes and then verify that the dashboard loads correctly after signup."

echo "Done!"
