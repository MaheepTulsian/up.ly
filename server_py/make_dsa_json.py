import pandas as pd
import json
import os
import glob

# Folder containing all CSV files
folder_path = "C:\\Users\\HP\\OneDrive\\Desktop\\Uply\\up.ly\\sever_py\\dsa_clone\\LeetCode-Questions-CompanyWise"  # Update this with your actual folder path

# Read subtopics JSON file
subtopics_file = "subtopic.json"  # Update with the correct file path
with open(subtopics_file, "r", encoding="utf-8") as f:
    subtopics_data = json.load(f)

# Dictionary to store company-wise questions
company_questions = {}

# Set to track already added questions within the same company
company_question_set = {}

# Read all CSV files in the folder
csv_files = glob.glob(os.path.join(folder_path, "*.csv"))

for csv_file in csv_files:
    # Extract company name from filename (Format: companyname_time.csv)
    file_name = os.path.basename(csv_file)
    company_name = file_name.split("_")[0]  # Extracts "Google" from "Google_20250325.csv"
    print(f"presently working with {company_name} company \n")

    if company_name not in company_questions:
        company_questions[company_name] = []
        company_question_set[company_name] = set()

    # Read CSV file
    df = pd.read_csv(csv_file)

    for _, row in df.iterrows():
        question_id = row["ID"]
        
        # Check if question already exists within the same company
        if question_id in company_question_set[company_name]:
            continue  # Skip duplicate questions for the same company

        # Add question to the company's set
        company_question_set[company_name].add(question_id)

        # Create question entry
        question_entry = {
            "question_no": question_id,
            "question_name": row["Title"],
            "difficulty": row["Difficulty"],
            "subtopics": subtopics_data.get(str(question_id), []),  # Get subtopics or empty list
            "question_link": row["Leetcode Question Link"]
        }

        # Add to the company's question list
        company_questions[company_name].append(question_entry)

# Save the final JSON output
output_file = "dsa.json"
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(company_questions, f, indent=4)

print(f"JSON file saved as {output_file}")
