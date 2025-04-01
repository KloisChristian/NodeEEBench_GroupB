@echo off
setlocal enabledelayedexpansion

:: Nach einem Verzeichnis suchen, das mit "NodeEEBench" beginnt
for /d /r C:\temp %%D in (NodeEEBench*) do (
    if exist "%%D\node" (
        set "NODE_DIR=%%D\node"
        goto :found
    )
)

:: Falls nicht gefunden, Fehlermeldung ausgeben und beenden
echo Fehler: Kein passender NodeEEBench-Ordner mit node-Verzeichnis gefunden.
pause
exit /b 1

:found
echo Gefundener Node-Pfad: %NODE_DIR%

:: Node.js zum PATH hinzufügen
set "PATH=%PATH%;%NODE_DIR%"

:: Node-Server starten
echo Starte Node.js-Server...
=======
REM adjust path for nodejs
path=%path%;C:/temp/NodeEEBench/node 


node ServerEEBench.js

:: Konsole offen halten
pause
