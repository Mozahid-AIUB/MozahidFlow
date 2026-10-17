<#
.SYNOPSIS
  One-shot setup for MozahidFlow on Windows 10/11. Safe to re-run: steps that are already done are skipped.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\setup.ps1
  powershell -ExecutionPolicy Bypass -File .\setup.ps1 -WithLargeModel   # also fetch Whisper large-v3 (~3 GB)
  powershell -ExecutionPolicy Bypass -File .\setup.ps1 -SkipModels       # no Whisper download now
#>
param([switch]$SkipModels, [switch]$WithLargeModel)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$Root = $PSScriptRoot

# Upstream pins: the versions this setup was reviewed and tested with.
$RemotionSkillsRepo = 'https://github.com/remotion-dev/skills.git'
$RemotionSkillsSha  = '1441a11e95db35443bd76bb318386c0d3ca00053'
$RemotionSkills     = 'remotion-best-practices','remotion-create','remotion-markup','remotion-studio','remotion-render',
                      'remotion-captions','remotion-docs','remotion-multimedia','remotion-upgrade'
$HyperFramesRepo    = 'https://github.com/heygen-com/hyperframes.git'
$HyperFramesSha     = 'cbf3f0d5474ff94aa3243f4c2e2c3e5dc6264b2d'
$HyperFramesSkills  = 'hyperframes','hyperframes-core','hyperframes-cli','hyperframes-animation','hyperframes-keyframes',
                      'hyperframes-creative','hyperframes-audio','hyperframes-registry','hyperframes-studio','media-use',
                      'motion-graphics','general-video','product-launch-video','faceless-explainer'
$DeepFilterUrl      ='https://github.com/Rikorose/DeepFilterNet/releases/download/v0.5.6/deep-filter-0.5.6-x86_64-pc-windows-msvc.exe'
$DeepFilterSha256   = '75e11fa16445f560cb6b021521ddb89e89270d13b83089705d98776f58fd7915'

function Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Refresh-Path { $env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User') }
function Invoke-Native {
  param([string]$Exe, [string[]]$Arguments)
  & $Exe @Arguments
  if ($LASTEXITCODE -ne 0) { throw "$Exe $($Arguments -join ' ') failed with exit code $LASTEXITCODE" }
}
function Ensure-Tool($wingetId, $command) {
  if (Get-Command $command -ErrorAction SilentlyContinue) { Write-Host "  $command found"; return }
  Write-Host "  installing $wingetId"
  winget install --id $wingetId -e --silent --accept-package-agreements --accept-source-agreements
  Refresh-Path
  if (-not (Get-Command $command -ErrorAction SilentlyContinue)) { throw "$command still not on PATH; open a new terminal and re-run" }
}
# Copy skill folders from <repo>/skills at one pinned commit into .claude\skills (skipped if the first one exists).
function Install-PinnedSkills($repo, $sha, [string[]]$names) {
  $dest = Join-Path $Root '.claude\skills'
  if (Test-Path (Join-Path $dest $names[0])) { Write-Host '  already installed'; return }
  $tmp = Join-Path $env:TEMP ("skills-" + [guid]::NewGuid().ToString('N').Substring(0,8))
  try {
    Invoke-Native git @('init','-q',$tmp)
    Invoke-Native git @('-C',$tmp,'remote','add','origin',$repo)
    Invoke-Native git @('-C',$tmp,'fetch','-q','--depth','1','origin',$sha)
    Invoke-Native git @('-C',$tmp,'checkout','-q','FETCH_HEAD')
    New-Item -ItemType Directory -Force $dest | Out-Null
    foreach ($s in $names) { Copy-Item -Recurse -Force (Join-Path $tmp "skills\$s") $dest }
  } finally { Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue }
}
function Npm-Install($dir) {
  Push-Location $dir
  try { if (Test-Path package-lock.json) { Invoke-Native npm @('ci','--no-fund','--no-audit') } else { Invoke-Native npm @('install','--no-fund','--no-audit') } }
  finally { Pop-Location }
}

Refresh-Path

Step 'System tools (winget): Git, Node.js LTS, FFmpeg, uv'
Ensure-Tool 'Git.Git' 'git'
Ensure-Tool 'OpenJS.NodeJS.LTS' 'node'
Ensure-Tool 'Gyan.FFmpeg' 'ffmpeg'
Ensure-Tool 'astral-sh.uv' 'uv'

Step 'Python 3.12 environment (tools\.venv)'
$env:UV_LINK_MODE = 'copy'
$py = Join-Path $Root 'tools\.venv\Scripts\python.exe'
Invoke-Native uv @('python','install','3.12')
if (-not (Test-Path $py)) { Invoke-Native uv @('venv', (Join-Path $Root 'tools\.venv'), '--python', '3.12') }
Invoke-Native uv @('pip','install','--python',$py,'-r',(Join-Path $Root 'tools\requirements.txt'))
Invoke-Native uv @('pip','install','--python',$py,'-e',(Join-Path $Root '.claude\skills\color-grading'))

Step 'DeepFilterNet voice denoiser (tools\bin\deep-filter.exe)'
$df = Join-Path $Root 'tools\bin\deep-filter.exe'
if (-not (Test-Path $df)) {
  New-Item -ItemType Directory -Force (Split-Path $df) | Out-Null
  Invoke-WebRequest -Uri $DeepFilterUrl -OutFile $df -UseBasicParsing
}
if ((Get-FileHash $df -Algorithm SHA256).Hash.ToLower() -ne $DeepFilterSha256) {
  Remove-Item $df
  throw 'deep-filter.exe checksum mismatch; download removed'
}

Step "Remotion agent skills (remotion-dev/skills @ $($RemotionSkillsSha.Substring(0,7)))"
Install-PinnedSkills $RemotionSkillsRepo $RemotionSkillsSha $RemotionSkills

Step "HyperFrames agent skills (heygen-com/hyperframes @ $($HyperFramesSha.Substring(0,7)))"
Install-PinnedSkills $HyperFramesRepo $HyperFramesSha $HyperFramesSkills

Step 'Remotion studio (studio\)'
Npm-Install (Join-Path $Root 'studio')

Step 'Playwright + Chromium for the motion-broll skill (tools\motion\)'
Npm-Install (Join-Path $Root 'tools\motion')
Push-Location (Join-Path $Root 'tools\motion'); try { Invoke-Native npx @('playwright','install','chromium') } finally { Pop-Location }

Step 'HyperFrames CLI (hyperframes\)'
Npm-Install (Join-Path $Root 'hyperframes')
# Keep HyperFrames local-only: no telemetry, update checks, auto-installs or global skill installs.
$hfEnv = Join-Path $Root 'hyperframes\.env'
if (-not (Test-Path $hfEnv)) {
  @('HYPERFRAMES_NO_TELEMETRY=1','DO_NOT_TRACK=1','HYPERFRAMES_SKIP_SKILLS=1','HYPERFRAMES_NO_UPDATE_CHECK=1','HYPERFRAMES_NO_AUTO_INSTALL=1') |
    Set-Content -Encoding ascii $hfEnv
}
Invoke-Native (Join-Path $Root 'hyperframes\hf.cmd') @('telemetry','disable')

if (-not $SkipModels) {
  Step 'Whisper speech-to-text models (cached under %USERPROFILE%\.cache\huggingface)'
  $env:HF_HUB_DISABLE_SYMLINKS_WARNING = '1'
  $models = @('large-v3-turbo'); if ($WithLargeModel) { $models += 'large-v3' }
  foreach ($m in $models) { Invoke-Native $py @('-c', "from faster_whisper.utils import download_model as d; print(d('$m'))") }
}

Step 'Checks'
Invoke-Native ffmpeg @('-hide_banner','-version') | Select-Object -First 1
Invoke-Native $py @('-c','import faster_whisper, av, librosa, pysubs2; print("python ok: faster-whisper", faster_whisper.__version__, "| av", av.__version__)')
Invoke-Native $df @('--version')

Write-Host "`nSetup complete. Open this folder in VS Code, start Claude Code, and give it a raw video plus a prompt." -ForegroundColor Green
Write-Host 'First run: tell Claude your channel name, @handle, logo and colours so it can fill studio\src\brand.ts.'
