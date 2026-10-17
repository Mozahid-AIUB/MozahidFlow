@echo off
rem HyperFrames CLI wrapper (Windows: PowerShell / cmd).
rem Always runs the project-local CLI in D:\Video\hyperframes\node_modules (pinned in package.json)
rem and keeps it local-only: no telemetry, no update checks / silent self-updates,
rem and no global skill installs into %USERPROFILE%\.claude\skills (skills live in D:\Video\.claude\skills).
rem Usage:  D:\Video\hyperframes\hf.cmd <command> [args]   e.g.  hf.cmd init my-ad --non-interactive --resolution portrait
setlocal
set "HYPERFRAMES_NO_TELEMETRY=1"
set "DO_NOT_TRACK=1"
set "HYPERFRAMES_SKIP_SKILLS=1"
set "HYPERFRAMES_NO_UPDATE_CHECK=1"
set "HYPERFRAMES_NO_AUTO_INSTALL=1"
node "%~dp0node_modules\hyperframes\bin\hyperframes.mjs" %*
exit /b %ERRORLEVEL%
