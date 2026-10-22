@echo off
setlocal
set "PROJECT=%~dp0"
set "STUDIO="
if exist "%ProgramFiles%\Android\Android Studio\bin\studio64.exe" set "STUDIO=%ProgramFiles%\Android\Android Studio\bin\studio64.exe"
if not defined STUDIO if exist "%ProgramFiles%\Android\Android Studio\bin\studio.exe" set "STUDIO=%ProgramFiles%\Android\Android Studio\bin\studio.exe"
if not defined STUDIO if exist "%LOCALAPPDATA%\Programs\Android Studio\bin\studio64.exe" set "STUDIO=%LOCALAPPDATA%\Programs\Android Studio\bin\studio64.exe"
if not defined STUDIO if exist "%LOCALAPPDATA%\Programs\Android Studio\bin\studio.exe" set "STUDIO=%LOCALAPPDATA%\Programs\Android Studio\bin\studio.exe"
if defined STUDIO (
  start "" "%STUDIO%" "%PROJECT%"
  echo Android Studio is opening the Sajid Travel Agency project.
) else (
  echo Android Studio was not found in the usual installation folders.
  echo Install Android Studio, then open this project folder from File ^> Open.
  start https://developer.android.com/studio
)
endlocal
