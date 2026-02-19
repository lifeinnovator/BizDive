
const XLSX = require('xlsx');
const path = require('path');

const filePath = String.raw`E:\OneDrive\Work\2026_kevin\기업자가진단 서비스\BizDive\BizDiz_DataSet\(BizDive) 단계 및 영역별 배점표.xlsx`;

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    // Log first 50 rows to inspect P-Stage structure
    console.log(JSON.stringify(data.slice(0, 50), null, 2));
} catch (error) {
    console.error("Error reading excel file:", error);
}
