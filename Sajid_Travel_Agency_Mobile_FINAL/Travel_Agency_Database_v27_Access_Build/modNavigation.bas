Attribute VB_Name = "modNavigation"
Option Compare Database
Option Explicit
Public Sub OpenModuleForm(ByVal FormName As String)
    DoCmd.OpenForm FormName, acNormal
End Sub
Public Sub CloseCurrentForm()
    DoCmd.Close acForm, Screen.ActiveForm.Name
End Sub
Public Sub OpenReportPrint(ByVal ReportName As String)
    DoCmd.OpenReport ReportName, acViewPreview
End Sub
