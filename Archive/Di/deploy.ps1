# deploy.ps1
# === Auto-push Digital MAR updates to GitHub ===

cd "C:\Users\Troyj\OneDrive - TJM Technologies\Projects\Digital MAR"

# Stage all changes
git add .

# Commit with timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git commit -m "Auto-update Digital MAR ($timestamp)" --allow-empty

# Push to GitHub
git push -u origin main

Write-Host "✅ Digital MAR successfully pushed to GitHub!" -ForegroundColor Green
