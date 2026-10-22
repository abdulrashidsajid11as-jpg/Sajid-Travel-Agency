Attribute VB_Name = "modBackup"
Option Compare Database
Option Explicit
Public Sub BackupCurrentDatabase()
    Dim target As String
    target = CurrentProject.Path & "\Backup\Agency_" & Format(Now(), "yyyymmdd_hhnnss") & ".accdb"
    If Dir(CurrentProject.Path & "\Backup", vbDirectory) = "" Then MkDir CurrentProject.Path & "\Backup"
    Application.FileCopy CurrentDb.Name, target
    MsgBox "Backup created: " & target, vbInformation
End Sub
