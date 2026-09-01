$ErrorActionPreference = "Stop"

$root = (Get-Location).Path
$parent = Split-Path $root -Parent
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

$destinationRoot = Join-Path `
    $parent `
    "orane-booking-unused-moved-out-$timestamp"

$report = Join-Path `
    $root `
    "BOOKING-ACTIVE-DEPENDENCY-TRACE.txt"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "BOOKING DEPENDENCY TRACE + SAFE CLEANUP"
Write-Host "NO FILE WILL MOVE UNTIL PREVIEW IS CONFIRMED"
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

function Get-NormalizedPath {
    param(
        [string]$PathValue
    )

    return [System.IO.Path]::GetFullPath($PathValue)
}

function Resolve-ImportFile {
    param(
        [string]$Importer,
        [string]$ImportPath
    )

    if (
        !$ImportPath.StartsWith(".") -and
        !$ImportPath.StartsWith("@/")
    ) {
        return $null
    }

    if ($ImportPath.StartsWith("@/")) {

        $base =
            Join-Path `
            $root `
            ($ImportPath.Substring(2))

    }
    else {

        $base =
            Join-Path `
            (Split-Path $Importer -Parent) `
            $ImportPath
    }

    $candidates = @(
        $base,
        "$base.tsx",
        "$base.ts",
        "$base.jsx",
        "$base.js",
        (Join-Path $base "index.tsx"),
        (Join-Path $base "index.ts"),
        (Join-Path $base "index.jsx"),
        (Join-Path $base "index.js")
    )

    foreach ($candidate in $candidates) {

        if (Test-Path -LiteralPath $candidate) {

            return (
                Get-NormalizedPath $candidate
            )
        }
    }

    return $null
}

$entryFiles = @(
    "app\booking\page.tsx"
)

$activeFiles =
    [System.Collections.Generic.HashSet[string]]::new(
        [System.StringComparer]::OrdinalIgnoreCase
    )

$queue =
    [System.Collections.Generic.Queue[string]]::new()

foreach ($relative in $entryFiles) {

    $full =
        Join-Path $root $relative

    if (!(Test-Path -LiteralPath $full)) {

        throw "ENTRY FILE NOT FOUND: $relative"
    }

    $normalized =
        Get-NormalizedPath $full

    $activeFiles.Add($normalized) | Out-Null
    $queue.Enqueue($normalized)
}

Write-Host "[TRACE] Starting from:" -ForegroundColor Yellow

foreach ($relative in $entryFiles) {

    Write-Host "        $relative"
}

Write-Host ""

while ($queue.Count -gt 0) {

    $current =
        $queue.Dequeue()

    $content =
        Get-Content `
        -LiteralPath $current `
        -Raw

    $matches =
        [regex]::Matches(
            $content,
            '(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?["'']([^"'']+)["'']'
        )

    foreach ($match in $matches) {

        $importPath =
            $match.Groups[1].Value

        $resolved =
            Resolve-ImportFile `
            -Importer $current `
            -ImportPath $importPath

        if (
            $null -ne $resolved -and
            !$activeFiles.Contains($resolved)
        ) {

            $activeFiles.Add($resolved) |
                Out-Null

            $queue.Enqueue($resolved)
        }
    }
}

$bookingFiles = @(
    Get-ChildItem `
        -LiteralPath $root `
        -Recurse `
        -File `
        -Include *.tsx,*.ts,*.jsx,*.js |
    Where-Object {

        $_.FullName -notmatch "\\node_modules\\" -and
        $_.FullName -notmatch "\\\.next\\" -and
        $_.FullName -notmatch "\\\.git\\" -and

        (
            $_.FullName -match "\\components\\booking\\" -or
            $_.FullName -match "\\app\\booking\\" -or
            $_.Name -match "^Booking" -or
            $_.Name -match "^Step[0-9]" -or
            $_.Name -match "ProgressStepper" -or
            $_.Name -match "NavigationButtons"
        )
    }
)

$unusedFiles = @()

foreach ($file in $bookingFiles) {

    $normalized =
        Get-NormalizedPath `
        $file.FullName

    if (!$activeFiles.Contains($normalized)) {

        $unusedFiles += $file
    }
}

$activeRelative = @()

foreach ($filePath in $activeFiles) {

    if (
        $filePath.StartsWith(
            $root,
            [System.StringComparison]::OrdinalIgnoreCase
        )
    ) {

        $activeRelative +=
            $filePath.Substring(
                $root.Length
            ).TrimStart("\","/")
    }
}

$unusedRelative = @()

foreach ($file in $unusedFiles) {

    $unusedRelative +=
        $file.FullName.Substring(
            $root.Length
        ).TrimStart("\","/")
}

@(
    "============================================================"
    "BOOKING ACTIVE DEPENDENCY TRACE"
    "============================================================"
    ""
    "ACTIVE / REACHABLE FILES:"
    ""
    $activeRelative |
        Sort-Object
    ""
    "============================================================"
    "BOOKING FILES NOT REACHABLE FROM /booking:"
    "============================================================"
    ""
    $unusedRelative |
        Sort-Object
) |
    Set-Content `
    -LiteralPath $report `
    -Encoding UTF8

Write-Host "============================================================" -ForegroundColor Green
Write-Host "TRACE COMPLETE"
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""

Write-Host "ACTIVE / REACHABLE FILES: $($activeRelative.Count)" -ForegroundColor Green
Write-Host "UNUSED CANDIDATES: $($unusedFiles.Count)" -ForegroundColor Yellow
Write-Host ""

if ($unusedFiles.Count -eq 0) {

    Write-Host "No unused booking files found." -ForegroundColor Green
    Write-Host ""
    Write-Host "REPORT:" -ForegroundColor Cyan
    Write-Host $report
    exit
}

Write-Host "FILES THAT WOULD BE MOVED:" -ForegroundColor Yellow
Write-Host ""

$unusedRelative |
    Sort-Object |
    ForEach-Object {

        Write-Host $_
    }

Write-Host ""
Write-Host "REPORT OPENING IN NOTEPAD..." -ForegroundColor Cyan

notepad $report

Write-Host ""
$answer =
    Read-Host `
    "Type MOVE to move ONLY these unreachable files. Anything else cancels"

if ($answer -ne "MOVE") {

    Write-Host ""
    Write-Host "CANCELLED - NOTHING WAS MOVED." -ForegroundColor Yellow
    exit
}

New-Item `
    -ItemType Directory `
    -Path $destinationRoot `
    -Force |
    Out-Null

$movedFiles = @()

try {

    foreach ($file in $unusedFiles) {

        $relative =
            $file.FullName.Substring(
                $root.Length
            ).TrimStart("\","/")

        $destination =
            Join-Path `
            $destinationRoot `
            $relative

        $destinationFolder =
            Split-Path `
            $destination `
            -Parent

        New-Item `
            -ItemType Directory `
            -Path $destinationFolder `
            -Force |
            Out-Null

        Move-Item `
            -LiteralPath $file.FullName `
            -Destination $destination `
            -Force

        if (!(Test-Path -LiteralPath $destination)) {

            throw "MOVE FAILED: $relative"
        }

        $movedFiles += @{
            Source = $file.FullName
            Destination = $destination
        }

        Write-Host "[MOVED] $relative" -ForegroundColor Green
    }

    Write-Host ""
    Write-Host "RUNNING PRODUCTION BUILD..." -ForegroundColor Yellow
    Write-Host ""

    npm run build

    if ($LASTEXITCODE -ne 0) {

        throw "Production build failed."
    }

    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host "BOOKING CLEANUP SUCCESS"
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "FILES MOVED: $($movedFiles.Count)"
    Write-Host ""
    Write-Host "MOVED FILES LOCATION:" -ForegroundColor Cyan
    Write-Host $destinationRoot
    Write-Host ""
    Write-Host "PRODUCTION BUILD PASSED" -ForegroundColor Green
}
catch {

    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Red
    Write-Host "ERROR - AUTOMATIC ROLLBACK STARTING"
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "============================================================" -ForegroundColor Red
    Write-Host ""

    foreach ($item in $movedFiles) {

        $sourceFolder =
            Split-Path `
            $item.Source `
            -Parent

        New-Item `
            -ItemType Directory `
            -Path $sourceFolder `
            -Force |
            Out-Null

        if (
            Test-Path `
            -LiteralPath `
            $item.Destination
        ) {

            Move-Item `
                -LiteralPath `
                $item.Destination `
                -Destination `
                $item.Source `
                -Force

            Write-Host "[RESTORED] $($item.Source)" -ForegroundColor Green
        }
    }

    Write-Host ""
    Write-Host "ROLLBACK COMPLETE." -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Press ENTER to finish"
