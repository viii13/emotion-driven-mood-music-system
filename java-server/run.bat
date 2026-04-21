@echo off
echo Compiling Java Server...
if not exist bin mkdir bin
javac -d bin src\MusicPlayerServer.java
if %errorlevel% neq 0 (
    echo Compilation failed!
    pause
    exit /b %errorlevel%
)

echo Starting Server...
java -cp bin MusicPlayerServer
pause
