@echo off
setlocal
set "PROJECT=%~dp0"
set "APK=%PROJECT%app\build\outputs\apk\debug\app-debug.apk"
if not exist "%APK%" (
  echo APK not found yet.
  echo In Android Studio choose Build ^> Build Bundle(s) / APK(s) ^> Build APK(s).
  echo After the build completes, run this file again.
  pause
  exit /b 1
)
copy /Y "%APK%" "%USERPROFILE%\Desktop\Sajid_Travel_Agency_v33_debug.apk" >nul
if errorlevel 1 (
  echo Could not copy APK to Desktop. It is available here:
  echo %APK%
  pause
  exit /b 1
)
echo APK copied to Desktop as Sajid_Travel_Agency_v33_debug.apk
pause
endlocal
