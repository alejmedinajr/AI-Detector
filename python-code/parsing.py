import PyPDF2 as pdf# used to read pdf file types
#from pdfquery import PDFQuery
import pdfplumber
import docx # used to read docx file types
import os # used for functions related to file reading (helps automate determing which file type is being used)
import difflib # used for the sequence object (one way of comparing text)
import re # used for regular expressions (helpful for cleaning text)
import csv
from fuzzywuzzy import fuzz # used for fuzzywuzzy way of comparing text (has four methods for doing this)
from sklearn.feature_extraction.text import TfidfVectorizer # used for converting text into a vector
from sklearn.metrics.pairwise import cosine_similarity # used for comparing text using cosine comparison
from itertools import combinations

from nltk.corpus import wordnet
#from gensim.models import KeyedVectors
#from gensim.similarities import WmdSimilarity
import spacy

def process_directory(directory, file_list):
    """This helper function recursively processes an entire directory to get all files in it (and other subdirectories).
       The logic for this function is based on: https://www.geeksforgeeks.org/how-to-iterate-over-files-in-directory-using-python/

       Parameters:
       directory -- Name of the main directory that will be processed
       file_list -- List containing the names of individual files (passed in recursive calls)

       Return:
       List containing all file names within a specified directory and its subdirectories
    """
    for item in os.listdir(directory): # for each item in the current directory, we need to check if it is a subdirectory of file
        path = os.path.join(directory, item) # we also need to record the path since the parsing is not happening here
        if os.path.isdir(path): process_directory(path, file_list) # if the current item is a directory, then we need to make a recursive call to process the subdirectory
        else: file_list.append(path) # otherwise the current item is a file, in which case append its path to the list of files

    return file_list # return the list of files after all recursive calls have been made (the entire directory has been searched at this point)
    
def pdf_to_text(file):
    """This helper function parses a pdf in order to use the text for other methods.

       Parameters:
       file -- Name of a pdf file that will be parsed

       Return:
       String containing the text content of a designated pdf file
    """

    text = ''

    try:
        with open(file, "rb"):
            reader = pdf.PdfReader(file) # using the pdf reader function, further documentation can be found: https://pypi.org/project/PyPDF2/ 
            for page in reader.pages: # if the file has multiple pages, each page needs to be parsed
                text += page.extract_text() # the final text result is just the accumulation of each page
    except: # the pdf was not able to be read, instead try reading it as a regular text file (happens sometimes depending on how the file is saved/modified/created)
        with open(file, "r") as file:
            text = file.read().replace("\n", "") # get rid of new lines
            text = text.replace("  ", "") # replace empty multiple spaces as well
            # print(type(file)) # print the file type (debugging)

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
    print(file_type)
    print(file)
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
    pattern = r'[^\w\s]'
    text = re.sub(pattern, ' ', text) # remove all punctuation to make sure this also does not account for differences

    common_cs_words = { # set containing words that are common in a programming assignment (should be removed)
    'for', 'while', 'do', 'if', 'else', 'elif', 'switch', 'case', 'break', 'continue',
    'return', 'class', 'def', 'function', 'method', 'import', 'from', 'as', 'try', 'except',
    'finally', 'raise', 'assert', 'with', 'print', 'class', 'public', 'private', 'protected',
    'int', 'float', 'bool', 'str', 'list', 'tuple', 'dict', 'set', 'range', 'len', 'open',
    'read', 'write', 'append', 'True', 'False', 'None', 'self', 'in'
    }

    for word in common_cs_words: text = re.sub(r'\b{}\b'.format(word), '', text) # removing the each word in the text using regular expression package

    return text # return the preprocessed text

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
    t1,t2 = preprocess_text(t1), preprocess_text(t2)
    matcher = difflib.SequenceMatcher(None, t1.splitlines(), t2.splitlines()) # using built in sequence matcher with both text lines
    comparisons = [matcher.ratio(), matcher.quick_ratio(), matcher.real_quick_ratio()] # using available comparison methods for a sequence matcher
    return max(comparisons) * 100, [ratio*100 for ratio in comparisons] # return the percentage of the maximum ratio of matching lines

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
    t1,t2 = preprocess_text(t1), preprocess_text(t2)
    comparisons = [fuzz.ratio(t1,t2), fuzz.partial_ratio(t1,t2), fuzz.token_sort_ratio(t1,t2), fuzz.token_set_ratio(t1,t2)] # storing all possible sequence comparisons of this package
    return max(comparisons), comparisons # returning the maximum percentage of the sequences matching. 

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
    t1,t2 = preprocess_text(t1), preprocess_text(t2)
    matrix = TfidfVectorizer().fit_transform([t1, t2]) # using built in functions to fit and transform the text so it can be effectively used for a cosine comparison
    return cosine_similarity(matrix[0], matrix[1])[0][0] * 100 # return cosine similarity ratio multiplied by 100 to give a percentage

def wu_palmer_comparison(t1, t2):
    t1,t2 = preprocess_text(t1), preprocess_text(t2)
    similarity_scores = []
    for w1 in t1:
        synsets1 = wordnet.synsets(w1)
        for w2 in t2:
            synsets2 = wordnet.synsets(w2)
            similarity = max((synset1.wup_similarity(synset2) or 0) for synset1 in synsets1 for synset2 in synsets2)
            similarity_scores.append(similarity)

    return sum(similarity_scores) / len(similarity_scores)

def path_comparison(t1, t2):
    t1,t2 = preprocess_text(t1), preprocess_text(t2)
    similarity_scores = []
    for w1 in t1:
        synsets1 = wordnet.synsets(w1)
        for w2 in t2:
            synsets2 = wordnet.synsets(w2)
            similarity = max((synset1.path_similarity(synset2) or 0) for synset1 in synsets1 for synset2 in synsets2)
            similarity_scores.append(similarity)

    return sum(similarity_scores) / len(similarity_scores)

def word_movers_comparison(t1, t2):
    word_vectors = KeyedVectors.load_word2vec_format('glove.6B.200d.txt', binary=False)
    
    def preprocess(text):
        # Tokenize and preprocess the text
        words = [word.lower() for word in text.split() if word.isalnum()]
        return [word for word in words if word in word_vectors.vocab]
    
    t1 = preprocess(t1)
    t2 = preprocess(t2)
    
    if not t1 or not t2: return 0.0
    
    t1,t2 = preprocess_text(t1),preprocess_text(t2)
    wmd_similarity = WmdSimilarity(corpus=[t1,t2], w2v_keyed_vectors=word_vectors)
    return wmd_similarity[t1][1]

def syntactic_comparison(t1, t2):
    nlp = spacy.load('en_core_web_sm')
    t1,t2 = nlp(t1),nlp(t2)
    return t1.similarity(t2)*100

def create_dataset(preprocessed_text):
    """This helper function takes preprocessed text and creates a dataset in the form of a list by
       comparing a single instance to every other text in the collection. This is an iterative process
       that builds the dataset by finding the comparisons of each headtohead matchup of submissions.

       Parameters:
       text -- List containing preprocessed text from files

       Return:
       List acting as the dataset for the collection of text (contains desired features for the ML model).
    """
    dataset = []
    for name1,text1 in preprocessed_text: # each item is a tuple containing the name of the file and the text content
        for name2,text2 in preprocessed_text: # each item above will be compared to the other items
            if not name1 == name2: # need to make sure a file is not compared to itself
                name = f'{name1} x {name2}' # the name is the matchup being made
                fuzzy = fuzz_comparison(text1,text2)[1] # the fuzzy comparison results
                sequence = sequence_comparison(text1, text2)[1] # the sequence comparison results (currently not working)
                cosine = cosine_comparison(text1,text2) # cosine comparison result
                length = len(text1) # length of the text 
                if "Human" in name1: label = "HUMAN" # if the file name contains human, it is a human result
                elif "AI" in name1: label = "AI" # if the file name contains AI, it is an AI result
                else: label = "NA" # otherwise this will be data that is unlabeled
                
                #dataset.append([name, fuzz, sequence, cosine, length, label])
                #dataset.append([name, fuzzy[0], fuzzy[1], fuzzy[2], fuzzy[3], sequence[0], sequence[1], sequence[2], cosine, length, label])
                dataset.append([name, fuzzy[0], fuzzy[1], fuzzy[2], fuzzy[3], cosine, length, label]) # append datapoint to dataset
    return dataset # return the dataset

def write_to_csv(name, dataset):
    """This helper function takes a name for csv output and a dataset, and writes the data to the csv file.

       Parameters:
       name -- Desired name of the csv file that is to be made
       dataset -- List containing datapoints (tuples) that will be written to csv
       
    """
    with open(name, 'w', newline='') as f:
            writer = csv.writer(f) 
            #writer.writerow(["Filename", "Fuzz Ratio", "Fuzz Partial Ratio", "Fuzz Token Sort Ratio", "Fuzz Token Set Ratio", "Sequence Matcher Ratio", "Sequence Matcher Quick Ratio", "Sequence Matcher Real Quick Ratio", "Length","Label"])
            #writer.writerow(["Filename", "Fuzz Ratio", "Fuzz Partial Ratio", "Fuzz Token Sort Ratio", "Fuzz Token Set Ratio", "Sequence Matcher Ratio", "Sequence Matcher Quick Ratio", "Sequence Matcher Real Quick Ratio", "Cosine Comparison", "Length","Label"])
            writer.writerow(["Filename", "Fuzz Ratio", "Fuzz Partial Ratio", "Fuzz Token Sort Ratio", "Fuzz Token Set Ratio", "Cosine Comparison", "Length","Label"])
            
            for row in dataset: writer.writerow(row)    

# Quick Testing
#files = process_directory("LeetCode", [])
#file_text = [(os.path.basename(file) , convert_to_text(file)) for file in files]
#preprocessed_text = [(name,preprocess_text(text)) for name,text in file_text]
#dataset = create_dataset(preprocessed_text)
#write_to_csv('test.csv', dataset)