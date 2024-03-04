import firebase_admin
import config
from firebase_admin import credentials
from firebase_admin import db

# Fetch the service account key JSON file contents
cred = credentials.Certificate('firebase_adminsdk.json')

# Initialize the app with a service account, granting admin privileges
firebase_admin.initialize_app(cred, {
    'databaseURL': config.firebase_url
})

ref = db.reference("/")
# As an admin, the app has access to read and write all data, regradless of Security Rules
#ref = db.reference('restricted_access/secret_document')
#print(ref.get())

ref = db.reference("/")
ref.set({
	"Faculty":
	{
		"Computer Science": -1
	}
})

ref = db.reference("/Faculty/Computer Science")
import json
with open("cs_faculty.json", "r") as f:
	file_contents = json.load(f)

for key, value in file_contents.items():
	ref.push().set(value)
	
ref = db.reference("/Faculty/Computer Science/")
cs_fac = ref.get()
print(cs_fac)
for key, value in cs_fac.items():
	print(value["Email"])