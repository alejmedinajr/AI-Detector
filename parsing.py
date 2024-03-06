import PyPDF2 as pdf # used to read pdf file types
import docx # used to read docx file types
import os # used for functions related to file reading (helps automate determing which file type is being used)
import difflib # used for the sequence object (one way of comparing text)
import re # used for regular expressions (helpful for cleaning text)
from fuzzywuzzy import fuzz # used for fuzzywuzzy way of comparing text (has four methods for doing this)
from sklearn.feature_extraction.text import TfidfVectorizer # used for converting text into a vector
from sklearn.metrics.pairwise import cosine_similarity # used for comparing text using cosine comparison

def pdf_to_text(file):
    """This helper function parses a pdf in order to use the text for other methods.

       Parameters:
       file -- Name of a pdf file that will be parsed

       Return:
       String containing the text content of a designated pdf file
    """
    text = ''
    with open(file, "rb"): 
        reader = pdf.PdfReader(file) # using the pdf reader function, further documentation can be found: https://pypi.org/project/PyPDF2/ 
        for page in reader.pages: # if the file has multiple pages, each page needs to be parsed
            text += page.extract_text() # the final text result is just the accumulation of each page
    return text

def docx_to_text(file):
    """This helper function parses a docx in order to use the text for other methods.

       Parameters:
       file -- Name of a pdf file that will be parsed

       Return:
       String containing the text content of a designated pdf file
    """
    text = ""
    doc = docx.Document(file) # using the docx reader function, further documentation can be found: https://pypi.org/project/docx/
    for paragraph in doc.paragraphs: # each paragraph needs to be considered (this should also go through each page as well)
        text += paragraph.text # the final text result is the accumulation of each paragraph text
    return text

def convert_to_text(file):
    """This helper function automates the process of deciding which file the user updated.
       This is important because not all file types can be parsed the same way. 
       At the moment, there are only ways to read docx and pdf file types. 

       Parameters:
       file -- Name of a file that will be parsed if it is an acceptable file type

       Return:
       String containing the text content of a designated file if successful; otherwise an error message
    """
    file_type = os.path.splitext(file)[1].lower() # a way to get the file type using: https://www.geeksforgeeks.org/how-to-get-file-extension-in-python/
    if file_type == ".pdf": return pdf_to_text(file) # pdf file case, calls pdf helper function
    elif file_type == ".docx": return docx_to_text(file) # docx file case, calls docx helper function
    else: return "Sorry, but the file uploaded is not a supported file type" # return error message for unsupported file type

def preprocess_text(text):
    """This helper function uses the regular expression library to preprocess the text
       by converting all text to lowercase and removing all punction. The goal of this is
       to make sure our text comparison methods are accurate by taking the differences caused
       by these two features of a string. 

       This preprocessing is basic, and can be improved with other considerations that can be found using
       the official documentation used as inspiration: https://docs.python.org/3/library/re.html 

       Parameters:
       text -- String containing text that needs to be prepocessed

       Return:
       String containing the text content of in lowercase and without punctuation.
    """
    text = text.lower() # ensure matches for case sensitivity are not missed
    text = re.sub(r'[^\w\s]', '', text) # remove all punctuation to make sure this also does not account for differences
    return text

def sequence_comparison(t1, t2):
    """This function compares two strings of text using the difflib Sequence Matcher.
       The Sequence Matcher object can be used as one of the various ways to compare the similarity of 
       two strings. This way compares two texts by treating them as sequences and finding the longest contiguous matching subsequence
       using the gestalt pattern matching. 
       
       The official documentation for this can be found: https://docs.python.org/3/library/difflib.html 

       Parameters:
       t1 -- String containing text that will be compared
       t2 -- String containing text that will be compared

       Return:
       Maximum percentage of similarity between the two text strings using gestalt pattern matching.
    """
    matcher = difflib.SequenceMatcher(None, t1.splitlines(), t2.splitlines()) # using built in sequence matcher with both text lines
    comparisons = [matcher.ratio(), matcher.quick_ratio(), matcher.real_quick_ratio()] # using available comparison methods for a sequence matcher
    return max(comparisons) * 100 # return the percentage of the maximum ratio of matching lines

def fuzz_comparison(t1, t2):
    """This function compares two strings of text using various fuzzywuzzy sequence comparison functions.
       All functions in this package rely on using the Levenshtein distance between two sequences.
       This is the minimum number of single-character edits required to change the first sequence into other.
       
       The official documentation for this can be found: https://pypi.org/project/fuzzywuzzy/

       Parameters:
       t1 -- String containing text that will be compared
       t2 -- String containing text that will be compared

       Return:
       Maximum percentage of similarity between the two text strings using Levenshtein distance.
    """
    comparison_vals = [fuzz.ratio(t1,t2), fuzz.partial_ratio(t1,t2), fuzz.token_sort_ratio(t1,t2), fuzz.token_set_ratio(t1,t2)] # storing all possible sequence comparisons of this package
    return max(comparison_vals) # returning the maximum percentage of the sequences matching. 

def cosine_comparison(t1, t2):
    """The text comparison begins by vectorizing the two texts, using the TF-IDF (Term Frequency-Inverse Document Frequency) vectorizer. 
       This converts the texts into numerical representations in the form of vectors, where each dimension represents the importance of a particular word in the context of the entire text. 
       The vectorization step is important for subsequent analysis using cosine similarity. The cosine similarity measures the cosine of the angle between two vectors.
       This provides a similarity metric, indicating the degree of similarity between the two texts. 

       The source used for this can be found: https://medium.com/web-mining-is688-spring-2021/cosine-similarity-and-tfidf-c2a7079e13fa

       Parameters:
       t1 -- String containing text that will be compared
       t2 -- String containing text that will be compared

       Return:
       Maximum percentage of similarity between the two text strings using cosine comparison.
    """
    matrix = TfidfVectorizer().fit_transform([t1, t2]) # using built in functions to fit and transform the text so it can be effectively used for a cosine comparison
    return cosine_similarity(matrix[0], matrix[1])[0][0] * 100 # return cosine similarity ratio multiplied by 100 to give a percentage

# Quick Testing
text1 = convert_to_text('uploads/Baylor University Personal Statement.pdf')
text2 = convert_to_text('uploads/UT Austin Personal Statement.pdf')
preprocess_text(text1)
preprocess_text(text2)
print("=====Sequence Matching=====")
print(round(sequence_comparison(text1, text2)))

print("=====Fuzz Comparison Matching=====")
print(round(fuzz_comparison(text1, text2)))

print("=====Cosine Comparison Matching=====")
print(round(cosine_comparison(text1, text2)))