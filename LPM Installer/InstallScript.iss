[Setup]
AppName=Inno_Setup_Project
AppVersion=1.0
DefaultDirName={pf}\Inno_Setup_Project
DefaultGroupName=Inno_Setup_Project
UninstallDisplayIcon={app}\Inno_Setup_Project.exe
Compression=lzma2
SolidCompression=yes
OutputDir=Output

[Files]
Source: "InstallScript.iss"; DestDir: "{app}"

[Icons]
Name: "{group}\Inno_Setup_Project"; Filename: "{app}\Inno_Setup_Project.exe"