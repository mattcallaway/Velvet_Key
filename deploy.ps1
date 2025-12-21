# Deploy to Linode Server
# This script will SSH into the server, pull latest code, and restart

$server = "root@172.233.140.74"
$password = "4B9`$fnF8!.T3gBG"

Write-Host "🚀 Deploying to Linode server..." -ForegroundColor Cyan

# Commands to run on the server
$commands = @"
cd /root/Velvet_Key && \
pm2 delete all && \
git pull origin main && \
pm2 start server.js --name velvet-key-api && \
pm2 logs --lines 10
"@

# Use plink (PuTTY) or ssh
Write-Host "Connecting to server..." -ForegroundColor Yellow
echo y | plink -ssh -pw "$password" $server $commands

Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
Write-Host "Testing endpoints..." -ForegroundColor Yellow

Start-Sleep -Seconds 2

# Test endpoints
Write-Host "`nTesting /health:" -ForegroundColor Cyan
curl http://172.233.140.74/health

Write-Host "`n`nTesting /api/health:" -ForegroundColor Cyan
curl http://172.233.140.74/api/health

Write-Host "`n`nTesting /api/health/db:" -ForegroundColor Cyan
curl http://172.233.140.74/api/health/db
