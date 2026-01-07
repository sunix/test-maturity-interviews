# Excel Questionnaire Workflow Guide

## Overview

The Excel Questionnaire feature allows you to export interviews as Excel files, fill them offline, and import them back into the application. This is perfect for:

- **Offline completion**: Work without internet access
- **Email distribution**: Send questionnaires to team members
- **Bulk entry**: Fill many questions efficiently in Excel
- **Data collection**: Gather responses from multiple people
- **Review and edit**: Review questions before submitting

## 📤 Exporting a Questionnaire

### Step 1: Start an Interview

1. Open the application in your browser
2. Go to the **Setup** tab
3. Fill in:
   - Application Name (e.g., "MyApp")
   - Interview Name (e.g., "Team Alpha - Q1 2024")
   - Interviewees (optional)
4. Click **"Start Interview"**

### Step 2: Export to Excel

1. You'll be in the **Interview** tab
2. Optionally answer some questions (export will include existing answers)
3. Click **"📝 Export Questionnaire to Excel"**
4. Excel file downloads automatically

### What You Get

The Excel file contains two sheets:

#### Instructions Sheet
```
Interview Questionnaire - Instructions

How to use this questionnaire:
1. Fill in the "Answer" column with "yes" or "no"
2. Optionally fill "Answered By" with: developer, qa, devops, or manager
3. Add comments in the "Comment" column
4. For attachments: Add notes in "Attachment Notes" column
5. Save the file when complete
6. Import back using "Import Questionnaire" button

Interview Information:
Application Name: MyApp
Interview Name: Team Alpha - Q1 2024
Interview Date: 2024-01-07 10:30:00
Interviewees: John Doe, Jane Smith
...
```

#### Questionnaire Sheet

| Question ID | Question Text | Answer | Answered By | Comment | Attachment Notes |
|------------|---------------|--------|-------------|---------|------------------|
| GO-1 | Une stratégie de test est-elle formalisée... | | developer | | |
| MS-3 | Utilisez-vous des templates standardisés... | | developer | | |
| AC-1 | Les tests unitaires sont-ils automatisés ? | | developer | | |

**Note:** The "Answered By" column is pre-filled with the first selected profile if available.

## ✏️ Filling the Questionnaire

### Step 3: Open and Fill the Excel File

1. **Open the downloaded Excel file**
2. **Read the Instructions sheet** for guidance
3. **Go to the Questionnaire sheet**
4. **Fill in the editable columns:**

#### Example Filled Row:

| Question ID | Question Text | Answer | Answered By | Comment | Attachment Notes |
|------------|---------------|--------|-------------|---------|------------------|
| GO-1 | Une stratégie de test est-elle formalisée... | **Yes** | **manager** | **Strategy document reviewed on 2024-01-15** | **strategy-v2.pdf** |
| MS-3 | Utilisez-vous des templates standardisés... | **No** | **qa** | **Templates need to be created** | |
| AC-1 | Les tests unitaires sont-ils automatisés ? | **Yes** | **developer** | **Using Jest, 85% coverage** | **coverage-report.html** |

### Important Notes:

- **Answer values**: Type "Yes" or "No" (case-insensitive: YES, yes, NO, no all work), or leave blank
  - **Tip:** Set up Excel dropdown: Select Answer column cells → Data → Data Validation → List → Enter: Yes,No
- **Answered By values**: Type one of: developer, qa, devops, manager (or leave blank)
  - **Tip:** Set up Excel dropdown: Select Answered By column cells → Data → Data Validation → List → Enter: developer,qa,devops,manager
  - Pre-filled with first selected profile when available
- **Comments**: Any text you want
- **Attachment Notes**: File names or references (actual files uploaded in web app)
- **DO NOT MODIFY**: Question ID, Question Text columns

### Step 4: Save the File

1. Review your answers
2. Save the Excel file
3. Keep the file name or rename it as you prefer

## 📥 Importing Filled Questionnaire

### Step 5: Import Back to Application

1. Return to the **Interview** tab in the web application
2. Click **"📥 Import Filled Questionnaire"**
3. Select your filled Excel file
4. Wait for the import to complete

### Import Results

You'll see a summary message like:

```
Import completed:
- 23 new answer(s) imported
- 5 existing answer(s) updated
- 2 row(s) skipped

Note: Attachment notes were imported as comments.
Please add actual file attachments in the web application if needed.
```

### What Happens During Import:

✅ **Validates** all data (answers, profiles, question IDs)
✅ **Imports** new answers
✅ **Updates** existing answers
✅ **Adds** comments and "Answered By" information
✅ **Converts** attachment notes to comments
✅ **Updates** UI with new answers
✅ **Triggers** auto-save
✅ **Shows** detailed error messages for any issues

## 📎 Handling Attachments

### The Challenge

Excel cannot easily embed binary files (images, PDFs, etc.), so we handle attachments specially:

### The Solution

1. **During Export**: 
   - Existing attachment filenames are listed in "Attachment Notes" column
   - Example: "screenshot1.png, report.pdf"

2. **During Filling**:
   - Add notes about files you want to attach
   - Examples:
     - "See test-report.pdf in shared folder"
     - "screenshot-error-message.png"
     - "architecture-diagram.jpg, test-results.xlsx"

3. **After Import**:
   - Attachment notes appear in comments
   - Add actual files using the web app's "📎 Attach Files" button

### Recommended Workflow for Attachments

```
1. Export questionnaire → Fill in Excel
2. Add attachment references in "Attachment Notes" column
3. Import filled questionnaire
4. In web app: Click comment section → Click "📎 Attach Files"
5. Upload the actual files referenced in your notes
```

## 🚨 Error Handling

### Common Errors and Solutions

#### Invalid Answer Value
```
Error: Row 5: Invalid answer "maybe" for question GO-1. Must be "yes" or "no".
```
**Solution**: Change "maybe" to either "yes" or "no"

#### Invalid Profile
```
Error: Row 12: Invalid "Answered By" value "tester" for question MS-3. 
Must be one of: developer, qa, devops, manager.
```
**Solution**: Change "tester" to "qa" or another valid profile

#### Unknown Question ID
```
Error: Row 25: Question ID "XX-99" not found in the current question set.
```
**Solution**: Check the question ID is correct and exists in your question catalog

#### Missing Questionnaire Sheet
```
Error: Invalid questionnaire file: Missing "Questionnaire" sheet
```
**Solution**: Don't rename or delete the "Questionnaire" sheet

### Validation Rules

The import validates:
- ✓ Answer must be "yes" or "no" (case-insensitive)
- ✓ Answered By must be: developer, qa, devops, manager (or blank)
- ✓ Question ID must exist in current question set
- ✓ Excel file must have "Questionnaire" sheet
- ✓ Required columns must be present

## 💡 Use Cases

### Use Case 1: Offline Interview
**Scenario**: Conducting interview in location without internet

1. Before leaving: Export questionnaire
2. During interview: Fill Excel on laptop
3. After returning: Import filled questionnaire
4. Add attachments from interview

### Use Case 2: Email Distribution
**Scenario**: Collecting feedback from distributed team

1. Export questionnaire
2. Email Excel file to team members
3. Team members fill and email back
4. Import each filled file (or merge them first)
5. Review and consolidate results

### Use Case 3: Bulk Data Entry
**Scenario**: Entering many responses quickly

1. Export questionnaire
2. Fill all answers rapidly in Excel (faster than clicking)
3. Import completed questionnaire
4. Add any missing details in web app

### Use Case 4: Review Before Submission
**Scenario**: Want to review all questions before committing

1. Start interview in web app
2. Export to Excel
3. Review all questions in spreadsheet
4. Fill answers thoughtfully
5. Import when satisfied

## 🎯 Best Practices

### Do's ✅

- ✅ Read the Instructions sheet first
- ✅ Fill answers consistently (all lowercase or all uppercase)
- ✅ Add meaningful comments for context
- ✅ Save Excel file with descriptive name
- ✅ Keep original column headers unchanged
- ✅ Test import with a few rows first
- ✅ Add actual file attachments in web app after import

### Don'ts ❌

- ❌ Don't modify Question ID column
- ❌ Don't change column headers
- ❌ Don't delete the Instructions or Questionnaire sheets
- ❌ Don't use invalid answer values (only yes/no)
- ❌ Don't expect actual files to be imported (only notes)
- ❌ Don't modify Theme, Profiles, Weight, or Category columns

## 🔄 Round-Trip Testing

Test the complete workflow:

1. **Start interview** with test data
2. **Answer** 3-5 questions
3. **Add comments** to some
4. **Add attachments** to one question
5. **Export** to Excel
6. **Verify** existing data appears in Excel
7. **Modify** some answers
8. **Add** new answers
9. **Save** Excel file
10. **Import** back
11. **Verify** all changes appear correctly
12. **Export again** and compare with previous export

## 📞 Support

If you encounter issues:

1. Check the error messages (they're usually specific)
2. Verify your Excel file has correct structure
3. Ensure you haven't modified protected columns
4. Try with a simpler test case first
5. Check the browser console for technical errors

## 🎓 Example Workflow

### Complete Example

```
1. Setup Tab:
   - Application Name: "CustomerPortal"
   - Interview Name: "Backend Team - Sprint 42"
   - Interviewees: "Alice, Bob, Charlie"
   - Click "Start Interview"

2. Interview Tab:
   - Answer 2-3 questions
   - Click "Export Questionnaire to Excel"
   - File downloads: questionnaire-CustomerPortal-Backend_Team_Sprint_42-2024-01-07.xlsx

3. In Excel:
   - Open file
   - Read Instructions
   - Fill 10 questions:
     * GO-1: yes, manager, "Strategy reviewed monthly"
     * MS-3: no, qa, "Need to create templates"
     * AC-1: yes, developer, "Jest + 80% coverage", "coverage.html"
     * ... (7 more)
   - Save as: CustomerPortal-Interview-Filled.xlsx

4. Back in Web App:
   - Click "Import Filled Questionnaire"
   - Select CustomerPortal-Interview-Filled.xlsx
   - See: "Import completed: 10 new answers, 0 updated"
   - Verify questions show imported answers
   - Click on AC-1 → Expand comment section → Attach coverage.html file

5. Complete:
   - Review all answers
   - Add any missing attachments
   - Auto-save handles persistence
   - View Results tab to see maturity scores
```

## 🚀 Next Steps

After successful import:

1. **Review imported data** in the Interview tab
2. **Add actual file attachments** where needed
3. **Complete remaining questions** (if any)
4. **Add final comments** for clarity
5. **View Results** to see maturity assessment
6. **Export assessment** (JSON or Excel) for records
7. **Share with stakeholders** as needed

---

**Happy Assessing! 📊✨**
