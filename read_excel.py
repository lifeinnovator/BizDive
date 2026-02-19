
import pandas as pd
import sys

file_path = r"E:\OneDrive\Work\2026_kevin\기업자가진단 서비스\BizDive\BizDiz_DataSet\(BizDive) 단계 및 영역별 배점표.xlsx"

try:
    df = pd.read_excel(file_path)
    print(df.to_string())
except Exception as e:
    print(f"Error reading excel file: {e}")
