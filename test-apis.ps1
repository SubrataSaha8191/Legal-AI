# Test script for API endpoints
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Testing LegalAI API Endpoints" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Chatbot API (gemini)
Write-Host "Test 1: Testing Chatbot API (/api/gemini)..." -ForegroundColor Yellow
try {
    $chatbotBody = @{
        message = "What is contract law?"
    } | ConvertTo-Json

    $chatbotResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/gemini" `
        -Method POST `
        -ContentType "application/json" `
        -Body $chatbotBody `
        -TimeoutSec 30

    Write-Host "Success: Chatbot API works!" -ForegroundColor Green
    Write-Host "Response preview:" -ForegroundColor Gray
    $preview = $chatbotResponse.response.Substring(0, [Math]::Min(200, $chatbotResponse.response.Length))
    Write-Host $preview -ForegroundColor White
    Write-Host "..." -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "Failed: Chatbot API error!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 2: Learn Content API (content type)
Write-Host "Test 2: Testing Learn Content API - Content (/api/learn-content)..." -ForegroundColor Yellow
try {
    $contentBody = @{
        topic = "Contract Law"
        type = "content"
    } | ConvertTo-Json

    $contentResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/learn-content" `
        -Method POST `
        -ContentType "application/json" `
        -Body $contentBody `
        -TimeoutSec 60

    Write-Host "Success: Learn Content API (content) works!" -ForegroundColor Green
    Write-Host "Title: $($contentResponse.title)" -ForegroundColor White
    Write-Host "Sections count: $($contentResponse.sections.Count)" -ForegroundColor White
    Write-Host "Introduction preview:" -ForegroundColor Gray
    $introPreview = $contentResponse.introduction.Substring(0, [Math]::Min(150, $contentResponse.introduction.Length))
    Write-Host $introPreview -ForegroundColor White
    Write-Host "..." -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "Failed: Learn Content API (content) error!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 3: Learn Content API (questions type)
Write-Host "Test 3: Testing Learn Content API - Questions (/api/learn-content)..." -ForegroundColor Yellow
try {
    $questionsBody = @{
        topic = "Contract Law"
        type = "questions"
    } | ConvertTo-Json

    $questionsResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/learn-content" `
        -Method POST `
        -ContentType "application/json" `
        -Body $questionsBody `
        -TimeoutSec 60

    Write-Host "Success: Learn Content API (questions) works!" -ForegroundColor Green
    Write-Host "Questions count: $($questionsResponse.questions.Count)" -ForegroundColor White
    Write-Host "First question preview:" -ForegroundColor Gray
    Write-Host "Q: $($questionsResponse.questions[0].question)" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "Failed: Learn Content API (questions) error!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
}

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Testing Complete!" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
