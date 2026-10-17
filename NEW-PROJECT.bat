@echo off
rem Double-click to start a new video: creates projects\YYYY-MM-DD_<name> from projects\_TEMPLATE and opens it.
cd /d "%~dp0"
echo.
echo  ===== New video project =====
echo  Type a short English name for the topic, e.g.  ai-tools-review   watch-ad   excel-tutorial-5
echo.
set "SLUG="
set /p "SLUG= Name: "
if "%SLUG%"=="" (
  echo  No name given. Nothing created.
  pause
  exit /b 1
)
"%~dp0tools\.venv\Scripts\python.exe" "%~dp0tools\scripts\new_project.py" "%SLUG%" --open
echo.
echo  Next: put files in raw\ reference\ assets\, fill brief.md, then tell Claude:
echo  "projects\^<folder^> ready, brief.md dekhe kaj shuru koro"
echo.
pause
