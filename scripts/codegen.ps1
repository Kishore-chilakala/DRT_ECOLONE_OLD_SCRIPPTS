# ============================================================
# Playwright Codegen Launcher for React App
# ============================================================
# Usage:
#   .\scripts\codegen.ps1                         # Records to stdout (inspector panel)
#   .\scripts\codegen.ps1 -Url http://localhost:3000
#   .\scripts\codegen.ps1 -Url http://localhost:3000 -Output tests/my-flow.spec.ts
#
# After recording:
#   - Copy the generated code from the Inspector panel (left side)
#   - Paste each click/action inside a measureRender() block in tests/e2e.spec.ts
# ============================================================

param(
    [string]$Url    = $env:BASE_URL ?? "http://localhost:3000",
    [string]$Output = ""
)

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Playwright Codegen - React App Recorder  " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Target URL  : $Url" -ForegroundColor Yellow
if ($Output -ne "") {
    Write-Host "Output file : $Output" -ForegroundColor Yellow
}
Write-Host ""
Write-Host "Instructions:" -ForegroundColor Green
Write-Host "  1. A Chrome browser will open at the target URL." -ForegroundColor White
Write-Host "  2. Perform your user flow (clicks, form fills, navigation)." -ForegroundColor White
Write-Host "  3. The Playwright Inspector (left panel) generates code in real time." -ForegroundColor White
Write-Host "  4. When done, close the browser or press Ctrl+C here." -ForegroundColor White
Write-Host "  5. Paste each generated action into a measureRender() block in:" -ForegroundColor White
Write-Host "     tests/e2e.spec.ts" -ForegroundColor Cyan
Write-Host ""

if ($Output -ne "") {
    npx playwright codegen --browser=chromium --output="$Output" "$Url"
} else {
    npx playwright codegen --browser=chromium "$Url"
}
