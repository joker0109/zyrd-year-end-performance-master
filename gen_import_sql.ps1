$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false
$wb = $excel.Workbooks.Open("D:\360Downloads\员工信息登记表.xlsx")
$ws = $wb.Sheets.Item(1)
$lastRow = $ws.UsedRange.Rows.Count

$deptMap = New-Object "System.Collections.Generic.Dictionary[string,string]"
$deptMap["董事长"] = "管理层"
$deptMap["总经理"] = "管理层"
$deptMap["副总经理"] = "管理层"
$deptMap["办公室主任"] = "综合办公室"
$deptMap["综合办公室"] = "综合办公室"
$deptMap["水暖室主任"] = "暖通水暖室"
$deptMap["暖通工程师"] = "暖通水暖室"
$deptMap["咨询总工"] = "咨询部"
$deptMap["农田建设工程室、经济室主任"] = "工程经济室"
$deptMap["农田水利工程师"] = "农田水利室"
$deptMap["建筑室主任"] = "建筑室"
$deptMap["建筑总工"] = "建筑室"
$deptMap["建筑工程师"] = "建筑室"
$deptMap["建筑施工图工程师"] = "建筑室"
$deptMap["建筑设计师"] = "建筑室"
$deptMap["建筑规划工程师"] = "建筑规划室"
$deptMap["规划室主任"] = "规划室"
$deptMap["规划工程师"] = "规划室"
$deptMap["项目管理组组长"] = "项目管理组"
$deptMap["结构总工"] = "结构室"
$deptMap["结构工程师"] = "结构室"
$deptMap["结构设计"] = "结构室"
$deptMap["财务会计"] = "财务部"
$deptMap["财务出纳"] = "财务部"
$deptMap["电气设计工程师"] = "电气室"
$deptMap["电气室主任"] = "电气室"
$deptMap["给水、排水工程师"] = "给排水室"
$deptMap["市场商务部助理"] = "市场部"
$deptMap["市场部助理"] = "市场部"
$deptMap["概算工程师"] = "概算室"

$sqlLines = New-Object System.Collections.Generic.List[string]
$sqlLines.Add("USE performance_evaluation;")
$sqlLines.Add("SET FOREIGN_KEY_CHECKS=0;")
$sqlLines.Add("TRUNCATE TABLE operation_logs;")
$sqlLines.Add("TRUNCATE TABLE scores;")
$sqlLines.Add("TRUNCATE TABLE vote_submissions;")
$sqlLines.Add("TRUNCATE TABLE votes;")
$sqlLines.Add("TRUNCATE TABLE system_admins;")
$sqlLines.Add("TRUNCATE TABLE employees;")
$sqlLines.Add("SET FOREIGN_KEY_CHECKS=1;")

$idx = 1
for ($row = 3; $row -le $lastRow; $row++) {
    $level = $ws.Cells($row, 1).Text.Trim()
    $name  = ($ws.Cells($row, 2).Text.Trim()) -replace '\s+', ''
    $pos   = $ws.Cells($row, 4).Text.Trim()
    $phone = $ws.Cells($row, 5).Text.Trim()
    if ($name -eq "") { continue }

    $empId = "E{0:D3}" -f $idx
    $dept  = if ($deptMap.ContainsKey($pos)) { $deptMap[$pos] } else { "其他部门" }
    $pwd   = "e10adc3949ba59abbe56e057f20f883e"
    $nameSql = $name -replace "'", "''"
    $posSql  = $pos  -replace "'", "''"
    $deptSql = $dept -replace "'", "''"

    $line = "INSERT INTO employees (employee_id,name,department,level,username,password,phone,position,status) VALUES ('$empId','$nameSql','$deptSql',$level,'$phone','$pwd','$phone','$posSql',1);"
    $sqlLines.Add($line)
    $idx++
}

$sqlLines.Add("INSERT INTO system_admins (employee_id,role,can_view_result,can_view_stats,can_view_vote_detail) VALUES ('E001','admin',0,0,0);")
$sqlLines.Add("SELECT CONCAT('导入完成，共 ', COUNT(*), ' 名员工') AS result FROM employees;")

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllLines("D:\work\import_employees.sql", $sqlLines, $utf8NoBom)
Write-Host "SQL文件生成完成，共 $($idx-1) 名员工"

$wb.Close($false)
$excel.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
