@echo off
setlocal

echo Suche nach NodeEEBench-Ordner mit node-Unterverzeichnis auf Laufwerk C...

:: PowerShell sucht gezielt nach dem Verzeichnisnamen
for /f "usebackq delims=" %%D in (`powershell -nologo -command ^
    "Get-ChildItem -Path C:\ -Recurse -Directory -Filter node
-ErrorAction SilentlyContinue | Where-Object { $_.Parent.Name -like
'NodeEEBench*' } | Select-Object -First 1 -ExpandProperty FullName"`)
do (
    set "NODE_DIR=%%D"
    goto :found
)

:: Wenn kein Ergebnis gefunden wurde
echo Fehler: Kein passender NodeEEBench-Ordner mit
node-Unterverzeichnis gefunden.
pause
exit /b 1

:found
echo Gefundener Node-Pfad: %NODE_DIR%
set "PATH=%PATH%;%NODE_DIR%"
echo Starte Node.js-Server...
node ServerEEBench.js
pause