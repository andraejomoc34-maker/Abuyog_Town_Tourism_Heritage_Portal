$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$environmentFile = Join-Path $projectRoot '.env'
$pythonExecutable = Join-Path $PSScriptRoot '.venv\Scripts\python.exe'
$serviceEntrypoint = Join-Path $PSScriptRoot 'app.py'

if (-not (Test-Path $environmentFile)) {
    throw "Laravel .env was not found at $environmentFile."
}

if (-not (Test-Path $pythonExecutable)) {
    throw "The face-service Python environment was not found. Create python-face-service\.venv with Python 3.11 and install python-face-service\requirements.txt first."
}

$pythonVersion = & $pythonExecutable --version
if ($pythonVersion -notmatch '^Python 3\.11\.') {
    throw "The face service requires Python 3.11 for its pinned TensorFlow version; found $pythonVersion."
}

$settings = @{}
foreach ($line in Get-Content $environmentFile) {
    if ($line -match '^\s*(FACE_SERVICE_TOKEN|FACE_SERVICE_MODEL|FACE_SERVICE_DISTANCE_METRIC|FACE_SERVICE_THRESHOLD)\s*=\s*(.*?)\s*$') {
        $name = $Matches[1]
        $value = $Matches[2]

        if ($value.Length -ge 2 -and (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'")))) {
            $value = $value.Substring(1, $value.Length - 2)
        }

        $settings[$name] = $value
    }
}

if ([string]::IsNullOrWhiteSpace($settings['FACE_SERVICE_TOKEN'])) {
    throw 'FACE_SERVICE_TOKEN must be set in the project .env before starting the face service.'
}

$healthUri = 'http://127.0.0.1:8001/health'
$client = [System.Net.Sockets.TcpClient]::new()
$isListening = $false
try {
    $connect = $client.BeginConnect('127.0.0.1', 8001, $null, $null)
    if ($connect.AsyncWaitHandle.WaitOne(1000, $false)) {
        $client.EndConnect($connect)
        $isListening = $true
    }
} catch [System.Net.Sockets.SocketException] {
    $isListening = $false
} finally {
    $client.Close()
}

if ($isListening) {
    $health = Invoke-RestMethod -Uri $healthUri -TimeoutSec 5
    if ($health.status -eq 'ok') {
        Write-Output 'The local face service is already running at http://127.0.0.1:8001.'
        exit 0
    }

    throw 'A process is listening on port 8001 but did not return a healthy face-service response.'
}

$env:FACE_SERVICE_TOKEN = $settings['FACE_SERVICE_TOKEN']
$env:FACE_SERVICE_MODEL = if ($settings.ContainsKey('FACE_SERVICE_MODEL')) { $settings['FACE_SERVICE_MODEL'] } else { 'Facenet' }
$env:FACE_SERVICE_DISTANCE_METRIC = if ($settings.ContainsKey('FACE_SERVICE_DISTANCE_METRIC')) { $settings['FACE_SERVICE_DISTANCE_METRIC'] } else { 'cosine' }
$env:FACE_SERVICE_THRESHOLD = if ($settings.ContainsKey('FACE_SERVICE_THRESHOLD')) { $settings['FACE_SERVICE_THRESHOLD'] } else { '0.40' }

Push-Location $PSScriptRoot
try {
    & $pythonExecutable $serviceEntrypoint
    if ($LASTEXITCODE -ne 0) {
        throw "The local face service exited with code $LASTEXITCODE."
    }
} finally {
    Pop-Location
}
