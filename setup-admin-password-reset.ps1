$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ADMIN PASSWORD RESET SETUP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupDir = ".\admin-reset-backups\$stamp"

$schema = ".\prisma\schema.prisma"

if (-not (Test-Path $schema)) {
    throw "Prisma schema not found."
}

New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

Copy-Item $schema "$backupDir\schema.prisma.backup" -Force

Write-Host ""
Write-Host "Backup created: $backupDir" -ForegroundColor Green

$originalSchema = Get-Content $schema -Raw

try {

    Write-Host ""
    Write-Host "Checking existing schema..." -ForegroundColor Cyan

    if ($originalSchema -match "model Admin") {
        Write-Host "Admin model already exists. Skipping model creation." -ForegroundColor Yellow
    }
    else {

        $adminModel = @'

model Admin {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  resetTokens PasswordResetToken[]
}

model PasswordResetToken {
  id        String   @id @default(cuid())
  token     String   @unique
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime @default(now())

  adminId String
  admin   Admin @relation(fields: [adminId], references: [id], onDelete: Cascade)

  @@index([adminId])
  @@index([expiresAt])
}

'@

        Add-Content -Path $schema -Value $adminModel

        Write-Host "Admin and PasswordResetToken models added." -ForegroundColor Green
    }

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "GENERATING PRISMA CLIENT" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan

    npx prisma generate

    if ($LASTEXITCODE -ne 0) {
        throw "Prisma generate failed."
    }

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "CREATING DATABASE MIGRATION" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan

    npx prisma migrate dev --name add_admin_password_reset

    if ($LASTEXITCODE -ne 0) {
        throw "Prisma migration failed."
    }

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "TYPESCRIPT CHECK" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan

    npx tsc --noEmit --pretty false

    if ($LASTEXITCODE -ne 0) {
        throw "TypeScript check failed."
    }

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "PRODUCTION BUILD" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan

    npm run build

    if ($LASTEXITCODE -ne 0) {
        throw "Production build failed."
    }

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "ADMIN PASSWORD RESET DATABASE SETUP PASSED" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Backup: $backupDir" -ForegroundColor Cyan
    Write-Host ""
}
catch {

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "FAILED - RESTORING SCHEMA BACKUP" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red

    Write-Host $_.Exception.Message -ForegroundColor Yellow

    Copy-Item "$backupDir\schema.prisma.backup" $schema -Force

    Write-Host ""
    Write-Host "Original schema restored." -ForegroundColor Yellow

    exit 1
}