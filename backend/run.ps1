# run.ps1 — Helper script to load .env and run Spring Boot backend

$envFile = Join-Path (Get-Item .).Parent.FullName ".env"

if (Test-Path $envFile) {
    Write-Host "Loading environment variables from $envFile..." -ForegroundColor Green
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#")) {
            $key, $value = $line -split '=', 2
            if ($key -and $value) {
                $k = $key.Trim()
                $v = $value.Trim()
                [System.Environment]::SetEnvironmentVariable($k, $v, "Process")
                Write-Host "Set: $k"
            }
        }
    }
} else {
    Write-Host "No .env file found at root. Using default application.yml configurations." -ForegroundColor Yellow
}

Write-Host "Launching Spring Boot backend..." -ForegroundColor Green
mvn spring-boot:run
