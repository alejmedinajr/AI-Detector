import PyPDF2
import docx
import os

def pdf_to_text(file):
    text = ""
    with open(file, "rb") as file:
        reader = PyPDF2.PdfReader(file)
        for page in reader.pages:
            text += page.extract_text()
    return text

def docx_to_text(file):
    text = ""
    doc = docx.Document(file)
    for paragraph in doc.paragraphs:
        text += paragraph.text
    return text

def convert_to_text(file):
    file_type = os.path.splitext(file)[1].lower()
    if file_type == ".pdf":
        return pdf_to_text(file)
    elif file_type == ".docx":
        return docx_to_text(file)
    else:
        return "Sorry, but the file uploaded is not a supported file type"
