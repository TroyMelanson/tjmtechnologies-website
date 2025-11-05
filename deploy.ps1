# deploy.ps1
Write-Host "🚀 Deploying TJM Technologies to GitHub + Azure..."
git add .
git commit -m "Auto-deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git push origin main
Write-Host "✅ Deployment triggered!"
