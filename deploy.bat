@echo off
echo Deploying to Linode server...
echo.

REM SSH into server and run deployment commands
ssh root@172.233.140.74 "cd /root/Velvet_Key && pm2 delete all && git pull origin main && pm2 start server.js --name velvet-key-api && pm2 status && echo '' && echo 'Testing endpoints:' && curl http://localhost:4000/health && echo '' && curl http://localhost:4000/api/health"

echo.
echo Deployment complete!
echo.
echo Testing public endpoints...
curl http://172.233.140.74/health
echo.
curl http://172.233.140.74/api/health
