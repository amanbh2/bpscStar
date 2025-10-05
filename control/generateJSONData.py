import pandas as pd
import json
import os
from datetime import datetime

# ✅ Set your Excel file path here
EXCEL_PATH = "../data/BPSC_Star_Database.xlsx"  # <-- change this path as needed
OUTPUT_JSON = "../data/questions.json"

def log(message, level="INFO"):
    """Simple logger with timestamps"""
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] [{level}] {message}")

def excel_to_json(excel_path, output_path):
    try:
        # Check if Excel file exists
        if not os.path.exists(excel_path):
            raise FileNotFoundError(f"Excel file not found: {excel_path}")

        # Read Excel (handle multiple sheets if needed)
        df = pd.read_excel(excel_path, sheet_name=None)
        if isinstance(df, dict):
            # Merge all sheets into one DataFrame
            df = pd.concat(df.values(), ignore_index=True)
        log(f"Loaded {len(df)} rows from Excel")

        if df.empty:
            raise ValueError("Excel file is empty.")

        # Ensure required columns
        expected_cols = ["Exam", "Paper", "Question", "Topic", "Subtopic", "Tags"]
        missing_cols = [col for col in expected_cols if col not in df.columns]
        if missing_cols:
            raise ValueError(f"Missing columns: {', '.join(missing_cols)}")

        # Drop completely empty rows
        df = df.dropna(how="all")

        # Deduplicate questions if needed
        df = df.drop_duplicates(subset=["Question"], keep="first")

        # Build JSON data
        data = []
        skipped = 0
        for i, row in df.iterrows():
            try:
                question = str(row["Question"]).strip()
                if not question:
                    skipped += 1
                    continue

                tags = []
                if pd.notna(row["Tags"]):
                    tags = [t.strip() for t in str(row["Tags"]).split(";") if t.strip()]

                obj = {
                    "id": len(data) + 1,  # sequential ID even if skipped rows
                    "exam": str(row["Exam"]).strip(),
                    "paper": str(row["Paper"]).strip(),
                    "question": question,
                    "topic": str(row["Topic"]).strip(),
                    "subtopic": str(row["Subtopic"]).strip(),
                    "tags": tags
                }
                data.append(obj)
            except Exception as e:
                log(f"Skipping row {i+1}: {e}", level="WARN")
                skipped += 1

        # Ensure output directory exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        # Write to JSON
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)

        # Summary
        log(f"✅ Successfully converted {len(data)} questions → {output_path}")
        if skipped > 0:
            log(f"⚠️ Skipped {skipped} invalid or empty rows", level="WARN")

    except FileNotFoundError as fnf:
        log(str(fnf), level="ERROR")
    except ValueError as ve:
        log(str(ve), level="ERROR")
    except Exception as e:
        log(f"Unexpected error: {e}", level="ERROR")


if __name__ == "__main__":
    excel_to_json(EXCEL_PATH, OUTPUT_JSON)
