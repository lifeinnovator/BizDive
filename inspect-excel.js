
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const DATA_DIR = 'E:\\OneDrive\\Work\\2026_kevin\\기업자가진단 서비스\\BizDive\\BizDiz_DataSet';

const filesToInspect = [
    '(BizDive) 7D 공통질문 데이터.xlsx',
    '(BizDive) 7D 단계별(예비창업) 특화질문 데이터.xlsx',
    '(BizDive) 7D 영역별(IT_SaaS) 특화질문 데이터.xlsx',
    '(BizDive) 7D 단계별(예비창업) ESG_지속가능 질문 데이터.xlsx'
];

filesToInspect.forEach(filename => {
    const filePath = path.join(DATA_DIR, filename);
    if (fs.existsSync(filePath)) {
        console.log(`\n--- Inspecting ${filename} ---`);
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Get headers (first row)
        const headers = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0];
        console.log('Headers:', headers);

        // Get first data row
        const data = XLSX.utils.sheet_to_json(sheet);
        if (data.length > 0) {
            console.log('First Row Data:', data[0]);
        }
    } else {
        console.log(`\nFile not found: ${filename}`);
    }
});
