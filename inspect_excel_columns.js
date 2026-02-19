
const XLSX = require('xlsx');
const path = require('path');

const baseDir = String.raw`E:\OneDrive\Work\2026_kevin\기업자가진단 서비스\BizDive\BizDiz_DataSet`;

// Files to check
const files = [
    '(BizDive) 7D 공통질문 데이터.xlsx',
    '(BizDive) 7D 단계별(예비창업) 특화질문 데이터.xlsx'
];

files.forEach(file => {
    try {
        const filePath = path.join(baseDir, file);
        console.log(`\n--- Inspecting: ${file} ---`);
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Get headers (row 1) and data (row 2)
        const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        if (json.length > 1) {
            console.log("Headers:", json[0]);
            console.log("Row 1:", json[1]);
        } else {
            console.log("Empty or single row sheet.");
        }
    } catch (e) {
        console.error(`Error reading ${file}:`, e.message);
    }
});
