import firebase_admin
from firebase_admin import credentials, db
import config

cred = credentials.Certificate('firebase_adminsdk.json') # Fetch the service account key JSON file contents
firebase_admin.initialize_app(cred, {'databaseURL': config.firebase_url}) # Initialize the app with a service account, granting admin privileges

class User:
	def __init__(self, first_name, last_name, password, email, university, user_type):
		self.first_name = first_name
		self.last_name = last_name
		self.password = password
		self.email = email
		self.university = university
		self.user_type = user_type
	
	def to_JSON(self):
		return {"First Name":self.first_name, "Last Name":self.last_name, "Password":self.password, "Email":self.email, "University":self.university, "User Type":self.user_type}
	
def insert(users): 
	"""This helper function inserts multiple users in a batch.

       Parameters:
       users -- List of User objects to be inserted into database

	   Return:
	   True upon successful inserting of the user.

    """
	for user in users:
		if not get_user_reference(user.email): 
			ref = db.reference(f'/Users/{user.user_type}')
			ref.push(user.to_JSON())
		else: print(f"Could not insert {user.email} because it already exists.")
	return True

def update(user, updates):
	"""This helper function updates specified information of a specific user if the specified email exists.

       Parameters:
       user -- User object
	   updates -- List of tuples representing the key and the change to be made at the key

	   Return:
	   True upon successful updating of the user, otherwise custom fail message if user was not found.
    """
	user_ref = get_user_reference(user.email)

	if not user_ref: return f'Sorry, {user.email} was not found.'
	else: user_ref = db.reference(user_ref)

	for key,change in updates:	
		if key == 'User Type': print("Sorry, but you are not allowed to change the user type...")	
		else: user_ref.update({key: change})
	
	return True

def remove(users):
	"""This helper function iterates through a collection of users and removes them if the specified email exists.

       Parameters:
       users -- List of user objects
    """
	for user in users:
		user_ref = get_user_reference(user.email)
		if not user_ref: print(f'Sorry, {user.email} was not found.')
		else: user_ref = db.reference(user_ref)

		user_ref.delete()
		print(f'Successfully removed: {user.email}.')

def get_user_reference(email):
	"""This helper function uses a user's email to get the user's reference in the database. This works since users have unique emails.

       Parameters:
       email -- String representation of a user's email

       Return:
       Database reference point as a String if the specified user exists, otherwise returns None.
    """
	ref = db.reference('/Users')
	ref_items = ref.get()
	for item in ref_items:
		users = db.reference(f'/Users/{item}').get()
		if not users == -1: 
			for unique_id, user in users.items():
				if user['Email'] == email: return f'/Users/{item}/{unique_id}'
		
	return None

def reset_users():
	""" This helper function is useful for resetting the users portion of the database if it gets too messy while testing. """
	ref = db.reference("/") # reference point is the main realtime database (by default)
	ref.set({ # setting the user object with three child objects intialized at -1 (no values/children)
		'Users':
		{
			'Admin': -1,
			'Faculty': -1,
			'Student': -1
		}
	})

### SIMPLE TESTING
	
#users = [User("Alejandro", "Medina", "apassword", "alejandro@email", "Southwestern", "Student"),
#		 User("Caleb", "Highsmith", "apassword", "caleb@email", "Southwestern", "Student"),
#		 User("Travis", "Rafferty", "apassword", "travis@email", "Southwestern", "Student"),
#		 User("Noah", "Zamarripa", "apassword", "noah@email", "Southwestern", "Student")]

#insert(users)
#update(users[0], [('Password', 'CHANGEDPASSWORD'), ('User Type','Admin')])
#remove([users[0]])
