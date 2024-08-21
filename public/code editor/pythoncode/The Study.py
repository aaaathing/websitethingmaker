#Heading with all team members included

#Time program (use time.sleep() to pause the program)
import time
#Random allows for random list items using random.choice(list_name) or random numbers using random.randint(start_num,end_num)
import random
#clear screen function
from thingmaker_custom_stuff import clear

#Color codes (feel free to add more from your notebook)
class text:
	End="\033[0m"
	Underlined="\033[4m"
	Italic="\033[3m"
	Bold="\033[1m"
	Red="\033[31m"
	Blue="\033[34m"
	Magenta="\033[35m"
	Cyan="\033[36m"

#Use this area to initialize any variables/lists that you will be using throughout the program. I have set up an empty inventory list.
inventory=[]

#Use this area to type functions:
#Start of adventure set to automatically end:
def start():
  global butler
  global name 
  print("Pick a name")
  name=input()
  print(f"hello {name}")
  time.sleep(3)
  clear()
  print("Pick a name for you butler")
  butler=input()
  time.sleep(3)
  clear()
  print("Read in loud and proud southern accent")
  time.sleep(5)
  clear()
  print(f"It was an ordinary day, and you are at the library picking out a book that quenches your interest you suddenly found your mouth watering over a book. It's called The Study. You sit down on the community couch and start reading. Go on y or n") 
  answer=input().lower()
  if answer == "y":
    bob()
  else:
    end()



def bob():
  print("YOU GOT SO CAUGHT UP IN THE BOOK YOU TELEPORTED TO A MYSTERIOUS PLACE YOU'VE NEVER SEEN BEFORE!!! Go on y or n")
  awnser2=input().lower()
  if awnser2 == "y":
    joe()
  else:
    end()



def joe():
  global butler
  global name 
  print("You smack on the floor with a thud.")
  time.sleep(5)
  clear()
  print(f"Suddenly you look upon a butler standing in front of you he quietly introduces himself saying Hello My name is {butler} and i am your butler for today, let me show you around.") 
  time.sleep(15)
  clear()
  print("He walks around the corner, and there is a door")
  print(f"Its locked said {butler}")
  print(f"{name} Can you find the key? y or n")
  awnser3=input().lower()
  if awnser3 == "y":
    mei()
  else:
    end()




def mei():
  global butler
  global name 
  print("You can either look on the table or under the doormat t for table or d for door mat")
  awnser4=input().lower()
  if awnser4 == "t":
    dog()
  elif awnser4 == "d":
    cat()
  else:
    end()

def dog():
  global butler
  global name 
  print("On the table there was a key you brought to the butler")
  print(f"Thanks for finding my key lets go {name}")
  print("You follow the butler as he walk into the new room")
  time.sleep(5)
  clear()
  print("You come upon an unfamiliar face, she looks very old and crumpled, the old lady asks “who are you?” she sounded like the rats that crawl under your bed at night.")
  print(f"You say, My name is {name} i don’t know where i am, or how i got here but i'm trying to escape this place")
  print("The old lady says nobody has been here for over 1 hundred years you say Wow that's crazy")
  print("All of a sudden the old lady starts going crazy and she starts to say YOU NEED TO HURRY SOMETHING BAD WILL HAPPEN IF YOU DON'T ESCAPE ASAP! go on y or n")
  awnser5=input().lower()
  if awnser5 == "y":
   apple()
  else:
    end()

def cat():
  global butler
  global name 
  print("Under the doormat there is no key but 5 big red spiders you die.")
  end()



def apple():
  global butler
  global name 
  print(f"You start running to find something that will help open behind the tv, {butler} the butler says you can go to the kitchen across the hall to look in the kitchen type k or for the tv is t") 
  awnser6=input().lower()
  if awnser6 == "k":
    k()
  elif awnser6 == "t":
    t()
  else:
    end()

  
    


def t():
  global butler
  global name 
  print(" you try the tv the a door but its locked try something else womp womp y or n")
  awnser7=input().lower()
  if awnser7 == "y":
    apple()
  else:
    end()


def k():
  global butler
  global name 
  print("You are on your way to the kitchen and you spot a wrench on the floor. Do you grab it? y/n")
  awnser8=input().lower()
  if awnser8 == "y":
    wench()
  elif awnser8 == "n":
    nwench()
  else:
    end()




def wench():
  global butler
  global name 
  print("Good! That will help you in the long run then you go to the kitchen and come upon a pantry and see a pan on the other side of the room You can go to the pantry or grab the pan")
  awnser9=input().lower()
  if awnser9 == "pantry":
    pantry()
  elif awnser9 == "pan":
    pan()
  else:
    end()
  

def nwench():
  global butler
  global name 
  print("you walk pass the wench then you go to the kitchen and come upon a pantry and see a pan on the other side of the room You can go to the pantry or grab the pan")
  awnser10=input().lower()
  if awnser10 == "pantry":
    pantry()
  elif awnser10 == "pan":
    pan()
  else:
    end()


def pan():
  global butler
  global name 
  print("Good! You can try to use that on the tv go on y/n")
  awnser11=input().lower()
  if awnser11 == "y":
   taco()
  else:
    end()


def pantry():
  global butler
  global name 
  print("AHHHHH you scream and a poisonous snake bites you you die")
  end()
 
def taco(): 
  global butler
  global name 
  print("you run back into the study and the old lady is still screaming you can use the pan on the tv or the wrench")
  awnser12=input().lower()
  if awnser12 == "wrench":
    hit()
  elif awnser12 == "pan":
    bobby()
  else:
    end()



def hit():
  global butler
  global name 
  print("You hit the tv with the wrench a few times doesn't work try the the pan next")
  nwench()







def bobby():
  global butler
  global name 
  print("you hit the tv with the pan a couple times and it slides open you climb into the room and theres a portal go on y or n")
  awnser14=input().lower()
  if awnser14 == "y":
   beef()
  else:
    end()


def beef(): 
  global butler
  global name 
  print("The old lady screams “RUN! THERE COMING!” You scaredly walk into it ")
  time.sleep(5)
  clear()
  print("You Smack On The Floor Loudly")
  print(" you slowly wake up “That hurt” you muffled You thought everything that just happened was a dream so you turn your book in to the librarian and continue your productive day")
  time.sleep(10)
  clear()
  print(" THE END")
  end()
  
  
  




#This is the end function that allows players to start again.


def end():
	again=input("Would you like to play again? (y/n) ").lower()
	if again == "n":
		clear()
		print("Thank you for playing!")
		time.sleep(3)
		exit()
	else:
		clear()
		start()

#Main program starts here by sending the user to the start function.
start()