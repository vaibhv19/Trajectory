@echo off
rem run.bat — Load root .env file variables and run Maven Spring Boot backend

set "ENV_FILE=..\.env"

if exist "%ENV_FILE%" (
    echo Loading environment variables from %ENV_FILE%...
    for /f "usebackq delims=; tokens=*" %%x in ("%ENV_FILE%") do (
        rem Filter out comments
        set "line=%%x"
        if not "%%x"=="" (
            if not "%%x:~0,1%"=="#" (
                setlocal enabledelayedexpansion
                for /f "tokens=1,2 delims==" %%a in ("!line!") do (
                    endlocal
                    set "%%a=%%b"
                )
            )
        )
    )
) else (
    echo No .env file found at root. Using default application.yml configurations.
)

echo Launching Spring Boot backend with local profile...
mvn spring-boot:run "-Dspring-boot.run.profiles=local"
