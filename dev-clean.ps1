# Clean Next.js cache and restart dev server
Write-Host "Cleaning Next.js cache..." -ForegroundColor Yellow

# Remove .next directory
if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force
    Write-Host "✓ Cleared .next cache" -ForegroundColor Green
}

# Remove node_modules/.cache if it exists
if (Test-Path "node_modules/.cache") {
    Remove-Item -Path "node_modules/.cache" -Recurse -Force
    Write-Host "✓ Cleared node_modules cache" -ForegroundColor Green
}

Write-Host "`nStarting dev server..." -ForegroundColor Yellow
pnpm dev
