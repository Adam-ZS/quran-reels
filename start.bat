@echo off
set PORT=4173
where py >nul 2>nul
if %errorlevel%==0 (
  py -m http.server %PORT% --bind 127.0.0.1
  goto :eof
)
where python >nul 2>nul
if %errorlevel%==0 (
  python -m http.server %PORT% --bind 127.0.0.1
  goto :eof
)
echo Python 3 is required to run the local static server.
pause
