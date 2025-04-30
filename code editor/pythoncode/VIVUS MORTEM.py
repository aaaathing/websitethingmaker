import math
import random

from thingmaker_custom_stuff import stepprint

print("")
'''
LIST GUIDE:

Each item in the main list is called a game position. The game determines what part of the story you are at by shifting you current
position in the array by the amount next to the word you typed. In the example [```Story```, [], 'run', 2, 'hide', 1] typing run would shift
the position in the array that is printed down 2.

The second item in the game position list is where game events happen. A loop iterates over every two items, the first of the two being the
type of event and the second being the value accosiated with the event.

The value of the battle event is another list that has 7 items. These are what each item designates in the battle function:
1: the name of the enemy. 2: the hp of the enemy. 3: the name of the weapon the enemy has. 4: boolean for whether the enemy is in melee range
5: the power of the enemy. 6: boolean for whether the player is in melee range. 7: bolean for whether the player goes first. 8: how far the game
position will switch if you win the battle.

Each desision in the game will alter the game events that will happen, paths you will take, and battles you will win. The way battles begin
can be key in determining who wins the fight.
'''
#the encrypted name of the king (you have to play the game to find out what it is)
Kname = 'ZL5WFwYn*yudWQTnqwlX5ksip2vEFZw==*ur62Pkw4pgln7oxVK0sGwg==*cMokZx111L19OHnYZnbWdw=='
game = [
    [
        '''Your eyelids peel open arduously revealing the tent you are in. A layer of dry dirt and blood had
formed over them while you slept. Standing above you is an old man dressed in weeds and flowers, singing
a chant. A single dim ray of light enters the tent from a sunrise that has just begun. The cuts and
lacerations all over your body make it hard to move, and you feel that you have several broken bones.
The old man finishes his incantations. Children reach up from below you, pouring a purple liquid into
your wounds. This village elder must be using you to teach the young natives healing magic. You wonder
if you should try to [talk] to them to see if they understand your language, but natives rarely do so
you should probably [leave] before they practice using knives on you.''',
        [], 'talk', 1, 'leave', 2
    ],
    [
        '''You open your mouth to speak, right as one of the children begins to pour a vile tasting green
potion into your mouth. Your anger at being so rudely interrupted is vanquished and replaced with
suprise. A similar suprise to the elders reaction to you being awake. As soon as the potion had entered
your mouth the wounds that had been dressed in the purple liquid had closed. You feel great! Before you
can thank him, he shouts "Awaky! Awaky! AWAKY!" and the kids run out of the tent screaming. "Its okay,
I won't hurt you." You tell the man, but he doesn't seem to understand even with your gentle tone. He
pulls a flimsy handmade knife from his pocket made from copper. Shouting a weak battle cry from his
old frail lungs he jumps toward you. You feint his attack but you are knocked from the bed you are
on. From the ground you can [search] for a weapon to defend youself or you can try to [reason] with 
him.''',
        ['hp', 99], 'search', 2, 'reason', 3
    ],
    [
        '''You begin to sit up, right before a child could pour a green potion into your mouth. Everyone in
the room screams, including you. You howl as you try to step from the table and you collapse to the
floor, your wounds being far greater than you imagined. The child holding the potion had dropped it as
they ran away and the pot had shattered. Your basic knowledge of healing potions suggests that drinking
the potion could activate the healing properties of the purple liquid. With no other option, you sip as
much of the potion from ground as you can. Despite only getting a little, it heals half of your wounds.
The old man draws a flimsy copper knife from his pocket, and yells a battle cry. From the ground you
can [search] for a weapon to defend youself or you can try to [reason] with him.''',
        ['hp', 49], 'search', 1, 'reason', 2
    ],
    [
        '''As the old man charges, you rip a tent stake from the dirt. Its flimsy and wooden, but not much
worse than your opponents blade.''',
        [
            'wp', ['wooden stake', 5], 'battle',
            [
                'The Native Urshak', 20, 'copper knife', False, 6, True, False,
                2
            ]
        ]
    ],
    [
        '''As the old man charges, you try to reason with him. "I never tried to hurt you!" You plead with
your hands outstretched. He pauses, looking at you with a face of pure disgust. "Apeach. LAGAR!" You
try to stand up but he pounces on you with his knife.''',
        [
            'battle',
            [
                'The Native Urshak', 20, 'copper knife', False, 6, True, False,
                1
            ]
        ]
    ],
    [
        '''After defeating the old man, you take his copper knife. You hear shouting and yelling from outside
of the tent. The children that had run out of the tent were still yelling frantically, and it would
likely attract some attention. You don't know who could be waiting for you on the other side, but there
are several of the green potions in the tent and if you were fast enough you might be able to tend to
your injuries. You could try to [escape], or you could try to [heal].''',
        ['wp', ['copper knife', 6]], 'escape', 1, 'heal', 2
    ],
    [
        '''You peer out of the tent, you see one another native approaching the tent. He is weilding a large
wooden spear that looks like it is used for hunting. You draw back so that he doesn't see you. He knows
you're in the tent, but you might be able to get the first [attack] on him. You could also try to [run]
to avoid him altogether.''',
        [], 'attack', 2, 'run', 4
    ],
    [
        '''You grab a bottle of the purple liquid the children had applied to your wounds and dump it onto
you. Then you down another green potion. In seconds, your wounds are completely healed. You race out
of the tent as quickly as you can, knife in hand. You are in the middle of a small collection of tents,
it is barely morning and light is just beggining to touch the earth. Suddenly a native gets the jump on
you from behind.''',
        [
            'hp', 100, 'battle',
            [
                'The Native Ornog', 38, 'wooden spear', False, 9, False, False,
                2
            ]
        ]
    ],
    [
        '''Right before he enters the tent, you leap from within. He tries to stab you with his spear but
misses. You shove him to the ground, dealing 8 damage and giving you the upper hand.''',
        [
            'battle',
            ['The Native Ornog', 30, 'wooden spear', True, 9, False, True, 1]
        ]
    ],
    [
        '''After defeating the native, you take his hunting spear. You sprint away from the camp before
anyone else can find you, feeling guilty that you had fought them. They healed you, and immediately
tried to kill you. It didn't make sense. Perhaps they were going to anyways. You are in a hilly forest.
It is winter and the leaves are missing, so it shouldn't be too hard to navigate. In the hopes that you
can find a town or settlement you enter. As you roam, you try to recollect why you has sustained those
injuries. Only a sense of dread occompanies these thoughts, and your mind seems adamant to keep it a
secret. Before long, you aproach a road that cuts through the center of the forest. Almost immediatly,
raw and extensive horror befalls you. Lining the road are randomly sprawled bodies, all of them
pointing in the same direction. You cannot exactly tell how they died, very little skin was left on
their skeletons, but you can tell that they were all running from something. A terror so great it
maintains even in death is plastered onto the face of one of them. Their arm is outstrechted, clutching
the ground as a means to escape whatever pursued them. A little farther down the road is a decrepit
carraige, a single wheel still intact. It looks as if it was torn apart by something. Aghast, your urge
to [flee] from whatever chased them down this road is almost a means of carrying their last moment with
you, sharing the fear even if the danger no longer remains. But the overwhelming sense of purpose you
have aquired from this had filled you with rage. Perhaps there is a way to fight this evil. You have
nothing, but you could [search] the carraige.''',
        ['wp', ['wooden spear', 9]], 'flee', 5, 'search', 6
    ],
    [
        '''You burst from within the tent, the native throws his spear but you jump out of the way. You rush
into the forest, it is winter and there are no leaves on the trees. You look back terrified, the native
has grabbed a spiked club and is charging at you with unmatched fury. As you try to escape him you
tumble over a branch and begin to roll down a steep hill. You crash into a frozen creek at the bottom.
The layer of ice is thin and the water is extreemly cold. You pull yourself out, freezing. The native
has stopped at the creek, they are filled with rage but a certain look of fear has come over his face.
You wander away from him, confused and freezing. As you wander, you notice that many of the trees are
withered and twisted into strange shapes. Only now do you notice the strange fog that has begun to close
in around you. Visibiliy is low and you wander if you should [climb] a tree to see farther, but a
foreboding sense has overcome you that perhaps putting yourself at risk of falling from a tree is not
one you can afford. It would be much safer to [continue] walking through the fog.''',
        [], 'climb', 1, 'continue', 3
    ],
    [
        '''You find a tree that looks sturdy. As you climb its branches, you are careful to avoid using ones
that are black and withered. Something is eating the forest, you don't want to find out what it is. As
you breach the fog you begin to feel a breeze. The breeze grows stronger as you climb the tree. Once you
have reached the top it has become a howling wind, you are freezing from the inside. To your dismay you
gaze upon only more trees, stabbing through the fog like dead shrubs. You look up, and see a swirling
vortex of clouds. In the center is an eye, where the clouds end abruptly, and it is not far from where
you are. You begin to hear a rumbling, it is deep and guttural and sounds like it was coming from every
direction. The wind is picking up, becoming violent, and threatening to throw you from the tree.
You clutch the branches as tight as you can. The eye of the vortex is nearing. The tree is bending under
the force of the wind which almost seems to scream. Suddenly everything is quiet. The wind is still. The
tree creaking from the stress is the only remaining sound. Everything is dark, sort of dreamy. You look
down and see a cloaked figure, holding out a hand to you while the other grips a scythe. You stare,
petrified. The longer you stare, the closer he seems to you. You can look at nothing but it's hand. It
is like nothing you have seen before, comprised of pure wonder. You gaze into the center of it's palm
and observe the summation of entire lives. You see happiness, regret, redemption, and love. The Reaper
shuts its hand with a snap, it is now inches from your face. Reality sinks in, you are floating in the
air over it's claw. You scream in rage and twirl in the air trying to attack the enitity. You grab onto
a tree and pull yourself away right before he swings his scythe. From under it's hood you see a wide
smile stretch accross the void of it's face.''',
        [
            'battle',
            ['The Grim Reaper', 450, 'scythe', True, 21, True, True, 1]
        ]
    ],
    [
        '''How is this possible, you can't have beaten my game so easily! No. Now you lose. The whole entire
game. Not even this run, it's unbelivable that you would try to break the rules like this! I am very
upset, well lets get this over with.''',
        ['battle', ['Luke Powers']]
    ],
    [
        '''You continue to wander through the fog. You notice that many of the branches on the trees are
withering away. Something is eating the forest, you don't want to find out what it is. You begin to
hear a rumbling, it is deep and guttural and sounds like it was coming from every direction. Wind
starts to swirl around you, freezing you to your core. Something is coming, fear grips your heart. The
wind is becoming stronger, pulling you toward something. You stare into the fog and catch a glimpse of
a dark figure. You turn to run but the wind pounds against you forcing you back. You begin to slide
towards the figure and you catch a breif glimpse of a huge scythe. You scream and bolt away as fast as
you can, but the wind mirrors your scream and slams into you like a brick wall. You fly through the air
landing on the ground beneath a cloaked figure. From under it's hood you see a wide smile stretch
accross the void of it's face.''',
        [
            'battle',
            ['The Grim Reaper', 450, 'scythe', False, 21, True, False, -1]
        ]
    ],
    [
        '''You begin to run away from the road. Before long you come to a frozen lake. Creeks stretch from it
like veins. In the center of the lake is a large hole in the ice. You begin to feel like you had run in
the wrong direction. You turn around, and face a rotting skeleton hanging from a tree. You scream and
stumble backwards, crashing into one of the frozen creeks leading into the lake. The layer of ice is 
thin and the water is extreemly cold. You pull yourself out, freezing. The skeleton is gone. You wander 
deeper into the forest, confused and freezing. As you wander, you notice that many of the trees are
withered and twisted into strange shapes. Only now do you notice the strange fog that has begun to close
in around you. Visibiliy is low and you wander if you should [climb] a tree to see farther, but a
foreboding sense has overcome you that perhaps putting yourself at risk of falling from a tree is not
one you can afford. It would be much safer to [continue] walking through the fog.''',
        [], 'climb', -3, 'continue', -1
    ],
    [
        '''You pull the door of the dilapidated carraige off of it's hinges getting inside. In the front all
you find is two loaves of bread and some water. You are thirsty so you drink the water. The bread will
restore 10 health when consumed. You continue down the road. Before long you see a clearing in the
distance. You approach a village that's in shambles. Things are strewn about all over the place. Every
door is boarded shut. As you enter the midst of the village a similar horror to the one furthur down the
road unravels. Dead bodies are everywhere, even on the roof of some buildings. Every one of them was
brutally torn apart and mangled. You remember your own wounds from when you had woken up, they were
oddly similar. If what had destroyed this village had attacked you, how had you survived? You try to
recall what had happened but a deep and unsettling terror relentlessly pulled these memories as far from
your conciousness as it could. You couldn't complain, you didn't want to remember what had happened
anyways. You searched the village, looking for any sign of life. You wonder if you should try to [break]
into one of the boarded up homes for supplies. Or if you should [avoid] any potential danger.''',
        ['bread', 2], 'break', 1, 'avoid', 3
    ],
    [
        '''You look into the window of a small house. Everything is strewn about, but there looks to be some
useful suppies inside. You pull a board of wood that is nailed to the door off. You doubt there is
anything alive left in the town but still you proceed with caution. You kick the door open. Brandishing
your weapon you enter the house ready to fight at any moment. The door leads into a kitchen that reeks of
rotting food. You put your ear to a door that is shut at the back of the kitchen. Breathing! You leap
away from the door as a man barrels through weilding a steel axe.''',
        ['battle', ['Liam', 25, 'steel axe', False, 11, False, False, 1]]
    ],
    [
        '''Despite having broken into the house of an innocent man and killing him, the only focus that
remained was progress. You take his axe, a heavy and reliable weapon. Upon searching his body further
you find 4 throwing knives. When used in battle they will deal 15 damage each. You rummage through the
kitchen. You find three rations of bread and two bandages which will heal 25 health when used. Having
aquired these resources you leave the home. You decide it is not a good idea to chance an encouter
like this again now that you know there are survivors of the disaster. As you continue walking through
the village you hear someone shout to you from behind.
  "Stop! Name yourself!" A woman shouts to you from behind. You turn around. A group of four armoured
warriors are all pointing their weapons at you. You try to respond but you cannot seem to find the
words. "What is your name! Tell us now!" Another warrior shouts at you. You force your mouth open,
  "I do not want trouble." You tell them. "I was on the brink of death, and as soon as I was saved I was
attacked. I have fought hard for my life, and all that I seek is to understand what is happening."
  "So you don't know?" The woman asks. "You don't know what is happening! Destruction, everything in the
world has been torn apart. If you tell us your name we will leave you in peace, but you must tell us." Again
you fail to recall even the simplest piece of information as your name. How was it that this was possible,
you knew that you knew who you were!
  "I am sorry. I seems that my memories are as every bit as dead as this world."
  "Then come with us. Your memories are the only hope this world has. The king awaits you."
You travel with the four warriors in dead silence for two hours. Everywhere you go has faced mass
destruction. You wonder who the king could be and why he awaited you but you still cannot bring yourself to
ask. Finally you approach a castle that stands out from the rest of the landscape. Not a scratch has
befallen it nor a drop of blood touched it. You and your companions enter. They lead you through a maze deep
within the confines of the castle. They take you to a door that has been constructed of solid steel. A door built with unmatched integrity. They knock and
within a few moments the door opens. You enter an elaborate room that is furnished with gold and gems. A man
sits on a massive throne, pondering. The woman gets his attention, "We found him in the village of Ero."
  "You will be rewarded." The king says. "Now leave, we need to talk." The four warriors leave and shut the
large door behind you. "No name I presume? After all this time I have known you I never have enjoyed the
luxury of knowing it. No amount of gold or riches would compare to such a prize. I have sent my men for you
because you are special. You may have noticed your ever growing determination to stop whatever abomination
it is that has ravaged the land yet you don't even know what it is. No living soul does, aside from one. My
entire life I have known of the coming destruction of the world. I shared a similar determination to yours.
I took control of the land, I used every bit of magic known to mankind to protect my castle, and I sent my
strongest warriors all in search of you. The destruction the world has faced is all due to an error.
Everything has it's place, but it fits nowhere into our universe. I could never stop this being, I am a
part of this universe. My only role is to make your existence meaningful. While it always pains me to tell
you this, you are also an error. The only way to resolve an error in the universe is with another error.
You are the only one that can face the being. Only to you does it take tangible form. Despite this, it is
still far too powerful to be stopped without the correct components. I can remember a few of my past lives,
you must as well. You share this ability, but in order to prove you have what it takes you only need to
remember one thing. What is my name?"''',
        [
            "wp", ["runic sword", 18], 'bread', 3, 'bandage', 2,
            "healing potion", 3, 'salus', 1, 'throwing knife', 4, "memory", 2
        ]
    ],
    [
        '''As you continue walking through the village you hear someone shout.
  "Stop! Name yourself!" A woman shouts to you from behind. You turn around. A group of four armoured
warriors are all pointing their weapons at you. You try to respond but you cannot seem to find the
words. "What is your name! Tell us now!" Another warrior shouts at you. You force your mouth open,
  "I do not want trouble." You tell them. "I was on the brink of death, and as soon as I was saved I was
attacked. I have fought hard for my life, and all that I seekis to understand what is happening."
  "So you don't know?" The woman asks. "You don't know what is happening! Destruction, everything in the
world has been torn apart. If you tell us your name we will leave you in peace, but you must tell us." Again
you fail to recall even the simplest piece of information as your name. How was it that this was possible,
you knew that you knew who you were!
  "I am sorry. I seems that my memories are as every bit as dead as this world."
  "Then come with us. Your memories are the only hope this world has. The king awaits you."
You travel with the four warriors in dead silence for two hours. Everywhere you go has faced mass
destruction. You wonder who the king could be and why he awaited you but you still cannot bring yourself to
ask. Finally you approach a castle that stands out from the rest of the landscape. Not a scratch has
befallen it nor a drop of blood touched it. You and your companions enter. They lead you through a maze deep
within the confines of the castle. They take you to a door that has been constructed of solid steel. How
anyone had aquired this much steel was beyond you, and it was build with unmatched integrity. They knock and
within a few moments the door opens. You enter an elaborate room that is furnished with gold and gems. A man
sits on a massive throne, pondering. The woman gets his attention, "We found him in the village of Ero."
  "You will be rewarded." The king says. "Now leave, we need to talk." The four warriors leave and shut the
large door behind you. "No name I presume? After all this time I have known you I never have enjoyed the
luxury of knowing it. No amount of gold or riches would compare to such a prize. I have sent my men for you
because you are special. You may have noticed your ever growing determination to stop whatever abomination
it is that has ravaged the land yet you don't even know what it is. No living soul does, aside from one. My
entire life I have known of the coming destruction of the world. I shared a similar determination to yours.
I took control of the land, I used every bit of magic known to mankind to protect my castle, and I sent my
strongest warriors all in search of you. The destruction the world has faced is all due to an error.
Everything has it's place, but it fits nowhere into our universe. I could never stop this being, I am a
part of this universe. My only role is to make your existence meaningful. While it always pains me to tell
you this, you are also an error. The only way to resolve an error in the universe is with another error.
You are the only one that can face the being. Only to you does it take tangible form. Despite this, it is
still far too powerful to be stopped without the correct components. I can remember a few of my past lives,
you must as well. You share this ability, but in order to prove you have what it takes you only need to
remember one thing. What is my name?""''', [
            "wp", ["runic sword", 18], "healing potion", 3, "salus", 1,
            "memory", 1
        ]
    ],
    [
        "Ezmik" +
        ''' steps away from you. "It is time, the universe needs you. Don't let it down. I cannot live
another life waiting for this moment. I beg that you end it. In order for you to face the being at all,
you must touch cursed water. There is a lake very close to the village of Ero where you came from. I 
don't exactly know what connection there is to that location but the lake is where the being originated.
At first it emerged from the center of the lake from a giant hole that presumably leads to hell. As soon
as it did all water in a several mile radius froze. This water is cursed, as soon as you touch it the 
being will hunt you. I will arrange another crew to escort you to the village. From there it is up to 
you. I know that your determination is as strong, and likely stronger than mine to stop this being. You 
must give this everything you have."
  You are escorted back to the village of Ero by a large team. How had one creature destroyed so much of the
world? Somehow you weren't afraid. You knew the fight would be like nothing this world had ever seen.
It was oddly comforting knowing that even if you failed, some version of you in the future would be
sure to succeed if what ''' + "Ezmik" + ''' said was true. It was all just one big loop, rigged
in your favor. You are left by your team. It is up to you now. You wander back into the forest from 
where you had come. The native tribe must be using similar magic to the king, you think to yourself. 
The old man had likely attacked you because he saw what you were, an error. It was beggining make 
sense. It is not long before you reach the frozen lake. A huge hole in the ice is at the center of the 
lake. You walk to one of the many creeks branching off of the lake. You step through the thin layer of 
ice and it breaks easily. Despite what you had been told, nothing feels different. You continue walking 
on the other side of the creek, awaiting your foe. A dense layer of fog begins to settle around you, 
chilling your soul. You notice that many of the branches on the trees are withering away. You begin to 
hear a rumbling, it is deep and guttural and sounds like it was coming from every direction. Wind starts 
to swirl around you. It is coming. The wind is becoming stronger, pulling you toward something. You stare
into the fog and catch a glimpse of a dark figure. You feel like running, despite everything. 
Nevertheless, you hold your ground and brace yourself. The cloaked figure is holding a gigantic 
scythe. Suddenly it disapears, but you have already fought it a million times You know it's tricks. 
The scythe barely misses your head as you dive out of it's way. You leap back up and turn around, 
facing the Grim Reaper. You see a wide smile stretch across the void of it's face, but deep within you 
sense its fear.'''
    ],
    [
  '''At last, peace. But the satisfaction of your victory abruptly ceases. You are still staring at the
painting. The painting of the king. Your mind races with questioning. It was real, it surely happened.
You did not imagine it, yet the only remanant of the world you had just left was your quickly fading 
memory. An error, in the universe. That's what the king had called you. What was his name again? You 
look for the plaque of the painting that showed his name, but it was gone. If only, if... Your mind 
becomes calm. You stand up. Your back is oddly sore. You are suprised to see that it is no longer 
daylight out, and everyone has left the museum. How had it gotten so late? Before exiting the room, 
you ponder at the painting that was in front of you. Why had the museum put up a blank painting? 
Fortunately, this only intrigues you momentarily and you leave without a second thought.''',
    ['win']
    ],
    [
'''The first parking space you find is a mile from the museum. It had just opened a new exhibit that 
claimed to showcase artifacts found in a church buried by volcanic ash 700 years ago. It had attracted 
the attention of countless people and it was sure to be packed. You never cared for museums but this 
sounded especially intresting to you. Once you arrive you see that it is packed with visitors. Perhaps 
the second day of opening would have been a wiser time to come, but you simply couldn't wait to see. 
You enter, squeezing by everyone around you. There are small metal plaques protruding from the ground 
that give information about each item. You read each one with scrutiny, paying attention to every 
detail. It was amazing that an entire building could remain undiscovered for so long. You make your way 
around the long hall that makes up the exhibit. They were even able to recover human remains! After an 
hour, you finally reach the end of the hall. A massive perfectly preserved painting sits in the center 
of the wall, and a small red couch faces it. You find it odd that no other guests are looking at the 
painting. You take a seat, taking in the entire painting. The painting depicts a magnificient king, yet 
he seems oddly troubled. You look at the plaque. There are only three words written on it: "The king '''
+ "Ezmik" + '''."
You look deep into the kings eyes and see, longing, fear, and regret. Why was a king as powerful as him 
so deeply disturbed? Suddenly, you hear a loud ripping sound. You feel everything being torn apart. The 
building, everyone in it, all shredded into nothing. You are nowhere. You feel a force of incredible 
strength begin to pull you apart. Your skin and bones start to rip. Darkness takes hold of your mind.'''
    ],
]
#the number of restarts
plays = 0
#the current place the user is in the story
cur = 0
#the health of the player
hp = 1
#the maximum health the player can have
maxHp = 100
#the inventory of the player
inventory = []
#the weapon of the player
wp = 'fists'
#the power the player has with their weapon
power = 3
#keeps track of whether the player has been killed by the king
Klld = False


def battle(name, Ohp, Owp, Ofar, Opower, hp, wp, far, power, first, inventory):
    '''
  Turn based battle system that lets you fight the inputted npc.
  The options that you have are determined by what state the game is in. The npc has similar options and
  their desision is determined by chance.
  args: name, hp, weapon, far, power
  returns: (win, hp)
  '''
    print("\nBATTLING:", name)
    Oholding = True
    holding = True
    Ofar = Ofar
    far = far
    Ohp = Ohp
    maxHp = hp[1]
    hp = hp[0]
    Ododging = 0
    dodging = 0
    Obuffer = False
    buffer = False
    knives = 2
    print("Your Health:", hp)
    print("Your Weapon:", wp, "(power:", str(power) + ")")
    inv = ""
    for i in range(int(len(inventory) / 2)):
        inv += inventory[i * 2] + " (" + str(inventory[i * 2 + 1]) + "). "
    if len(inv):
        print("Your Inventory:", inv)
    print("-------------------------------------------------")
    if not first:
        if Ofar:
            if Owp == 'wooden spear' and random.random(
            ) > 0.5 or Owp == 'copper knife' or Owp == 'steel axe' and random.random(
            ) > 0.9:
                if random.random() > 0.35:
                    dmg = math.ceil(Opower + random.random() * Opower * .5)
                    hp -= dmg
                    print(name, "throws their", Owp, "dealing", dmg,
                          "damage to you.")
                else:
                    print(name, "throws and misses with their", Owp,
                          "dealing no damage to you.")
                Oholding = False
            else:
                if Owp == 'scythe':
                    print(
                        "The Reaper vanishes and reapears behind you in an instant."
                    )
                    Ofar = False
                else:
                    print(name, "gets within melee range.")
                    Ofar = False
        else:
            if random.random() > 0.35:
                dmg = math.ceil(Opower / 2 + random.random() * Opower)
                hp -= dmg
                print(name, "attacks you with a", Owp, "dealing", dmg,
                      "damage to you.")
            else:
                print(name, "misses with their", Owp,
                      "dealing no damage to you.")
    attackState = 0
    while True:
        if buffer:
            buffer = False
        elif dodging > 0:
            dodging = 0
            print("You are no longer dodging", name + "'s attacks.")
        if far and holding and wp != 'fists':
            print(
                "You can [throw] your", wp, "at", name +
                ", you could get [closer] to acheive melee range, or you could [dodge] for the next two rounds."
            )
            attackState = ["throw", "closer", "dodge"]
        if far and wp == 'fists':
            print(
                "You can try to get [closer] to acheive melee range, [dodge] your enemy for the next two rounds, or you can [flee]."
            )
            attackState = ["closer", "flee", "dodge"]
        if not holding and wp != 'fists' and wp != 'runic sword' and name != 'spirit':
            print(
                "You can [retreive] your", wp +
                ", [dodge] your enemy for the next two rounds, or [flee].")
            attackState = ["retreive", "flee", "dodge"]
        elif not holding and wp != 'fists' and wp != 'runic sword':
            print(
                "You can [retreive] your",
                wp + ", or try to [dodge] your enemy for the next two rounds.")
            attackState = ["retreive", "dodge"]
        if not holding and wp == 'runic sword' and name != 'spirit':
            print(
                "You can [conjure] your sword, [retreive] your weapon, [dodge] your enemy for the next two rounds, or [flee]."
            )
            attackState = ["conjure", "retreive", "flee", "dodge"]
        elif not holding and wp == 'runic sword':
            print(
                "You can [conjure] your sword, [retreive] your weapon, or try to [dodge] your enemy for the next two rounds."
            )
            attackState = ["conjure", "retreive", "dodge"]
        if not far and holding:
            print(
                "You can [attack], move farther [away], try to [kick] your opponent down, or [dodge] for the next two rounds."
            )
            attackState = ["attack", "away", "kick", "dodge"]
        while True:
            typed = input("\n")
            print("")
            if typed.lower() == "stats":
                print("Your Health:", hp)
                print("Your Weapon:", wp, "(power:", str(power) + ")")
                inv = ""
                for i in range(int(len(inventory) / 2)):
                    inv += inventory[i * 2].title() + " (" + str(
                        inventory[i * 2 + 1]) + "). "
                if len(inv):
                    print("Your Inventory:", inv)
                continue
            try:
                #gets index of typed input in options
                item = inventory.index(typed.title())
                if inventory[item] == 'Bread':
                    hp = min(hp + 10, maxHp)
                    print(
                        "You consume a loave of bread and restore 10 health.")
                    inventory[item + 1] -= 1
                if inventory[item] == 'Bandage':
                    hp = min(hp + 25, maxHp)
                    print("You consume a bandage and restore 25 health.")
                    inventory[item + 1] -= 1
                if inventory[item] == 'Healing Potion':
                    hp = min(hp + 60, maxHp)
                    print(
                        "You consume a healing potion and restore 60 health.")
                    inventory[item + 1] -= 1
                if inventory[item] == 'Salus':
                    hp = min(hp + 200, maxHp)
                    print(
                        "You crush the brittle Salus gem in the palm of your hand. The shards melt through your skin and heal your body completely as it flows through your blood."
                    )
                    inventory[item + 1] -= 1
                if inventory[item] == 'Throwing Knife':
                    print("You hit", name,
                          "with a throwing knife and deal 15 damage.")
                    inventory[item + 1] -= 1
                if inventory[item + 1] == 0:
                    inventory.pop(item)
                    inventory.pop(item)
                continue
            except Exception:
                pass
            #trys to find index of input in attackState list, if it is not found the user is prompted again
            try:
                #gets index of typed input in options
                chosen = attackState.index(typed.lower())
                break
            except Exception:
                #tells user to type an option
                print(
                    typed, "is not an option. Options are " +
                    str(attackState)[1:-1] + ".")
                #gets user input with a line break
        action = attackState[chosen]
        if action == "attack":
            if random.random() > 0.25 + Ododging:
                dmg = math.ceil(power / 2 + random.random() * power)
                Ohp -= dmg
                print("You attack", name, "with your", wp, "dealing", dmg,
                      "damage to them.")
            else:
                print("You attack and miss with your", wp,
                      "dealing no damage to them.")
        if action == "flee":
            if name == "The Native Urshak":
                print(
                    '''You try to flee the old man, but you are cornered in the tent. Before he kills you, you think to yourself how ironic it is that a warrior as strong as you could lose to such a weak foe. How ironic that this old man had just tried to heal you, and how strange his reaction to your awakening was. Perhaps the man did have all the best intentions in the world, but your will to survive was too strong to be human.'''
                )
                return (False, 0, inventory)
            if name == "The Native Ornog":
                print(
                    '''You flee from the Native Ornog, dodging their attacks. You rush into the forest, it is winter and there are no leaves on the trees. You look back terrified, the native is charging at you with unmatched fury. As you try to escape him you tumble over a branch and begin to roll down a steep hill. You crash into a frozen creek at the bottom. The layer of ice is thin and the water is extreemly cold. The native throws their spear at you, stabbing your leg. You cry out in pain, it takes all of your willpower to pull yourself out of the creek. The native has stopped, they are filled with rage but a certain look of fear has come over their face. In one sweep you yank the spear from your leg dealing 25 damage.'''
                )
                hp -= 25
                if hp <= 0:
                    #The bad bad ending.
                    print(
                        '''Your injuries are too much to handle and you crumple to the ground, dead. A death more pathetic than any you could ever have imagined.'''
                    )
                    return (False, 0, inventory)
                else:
                    print(
                        '''You are lucky to survive such a grievous wound. You limp through the forest, in search of help. A dense fog has begun to settle around you making it difficult to see more than ten feet in front of you. You notice that many of the branches on the trees are withering away. Something is eating the forest, you don't want to find out what it is. You begin to hear a rumbling, it is deep and guttural and sounds like it was coming from every direction. Wind starts to swirl around you, freezing you to your core. Something is coming, fear grips your heart. The wind is becoming stronger, pulling you toward something. You stare into the fog and catch a glimpse of a dark figure. You turn to escape but the wind pounds against you forcing you back. You begin to slide towards the figure and you catch a breif glimpse of a huge scythe. You scream and try to run away despite your wounds, but the wind mirrors your scream and slams into you like a brick wall. You fly through the air landing on the ground beneath a cloaked figure. From under it's hood you see a wide smile stretch accross the void of it's face.'''
                    )
                    battle('The Grim Reaper', 450, 'scythe', True, 21,
                           [hp, maxHp], 'fists', False, power, False,
                           inventory)
                    return (False, 0, inventory)
            if name == "The Grim Reaper":
                print(
                    '''You turn to run from the cloaked entity, but a strong wind resists your efforts. You are dragged toward the Grim Reaper with unparalleled force. Clawing at the ground you try to drag yourself away from it's clutches. You look back and see it's large smile, the only part of it's face with any tangibility. You calm your mind, determined to escape, and stand up. The wind begins to die as you step forward with  determination. You begin to run at full speed away from the Reaper. You focus on nothing but moving your muscles. As you sprint you begin to feel a nagging
sensation to look back, to ensure your safety. You turn around and see an enormous entangled mass of human skeletons forming the shape of a huge spider. You scream and try to run but again are met with a gust of wind so powerful that you are flung hundreds of feet back. It was
merely a trick, a mind game. The Reaper steps over your mangled body and raises it's scythe far above your head. Everything disolves as your soul is stripped from your body. Your last moments are of pure and raw terror. What nightmare could compare to anything like this? How could
a being of this strength exist, how could the universe allow for such heresy? It was a violation of every law of nature, an error. It may be that it couldn't be stopped. Or perhaps, it could only be combatted by another error in the universe.'''
                )
                return (False, 0, inventory)
            if name == "Liam":
                print(
                    '''You run from the axe weilding man. He chucks his axe at you, narrowly missing. It smashes into the wall next to you throwing splinters at you. You dash out of the door.'''
                )
                return ('flee', hp, inventory)
        if action == "conjure":
            print(
                "Your sword materializes into your grasp, but 1 power is drained from it."
            )
            power -= 1
            holding = True
        if action == "retreive":
            far = False
            if random.random() > 0.5 + dodging:
                dmg = math.ceil(Opower / 2 + random.random() * Opower)
                hp -= dmg
                print("You try to retrieve your weapon but", name,
                      "attacks before you can grab it dealing", dmg, "damage.")
            else:
                print("You grab your weapon, dodging", name + "'s attacks.")
                holding = True
        if action == "closer":
            far = False
            print("You get within melee range of", name)
        if action == "away":
            far = True
            Ofar = True
            print("You move out of the melee range of", name)
        if action == "kick":
            if name != 'The Grim Reaper' and name != 'Spirit':
                if random.random() > 0.5 + Ododging and Ohp < hp:
                    Ofar = True
                    print("You kick", name,
                          "to the ground and you deal 4 damage to them.")
                else:
                    print("You are unable to kick", name,
                          "to the ground but you do deal 4 damage to them.")
                Ohp -= 4
            else:
                if random.random() > 0.5 + Ododging:
                    print(
                        "You kick your enemies ghostly body, spraying ectoplasmic fluid everywhere.",
                        name, "takes 12 damage and flies backwards.")
                    Ohp -= 12
                    far = True
                    Ofar = True
                else:
                    print(name, "flies backwards, dodging your kick.")
                    far = True
                    Ofar = True
        if action == "throw":
            holding = False
            if random.random() > 0.3 + Ododging:
                dmg = math.ceil(power + random.random() * power * 2.5)
                Ohp -= dmg
                print("You throw your", wp, "dealing", dmg, "damage to",
                      name + ".")
            else:
                print("You throw and miss with your", wp, "dealing no damage.")
        if action == "dodge":
            dodging = 0.35
            buffer = True
            print(
                "You try to dodge your enemies attacks for the next two rounds."
            )
        #checks if your attack killed the enemy and returns with a win if successful
        if Ohp < 0:
            if Owp != 'scythe':
                print(name, "dies.\n")
            else:
                print(
                    '''The Reaper lets out a sonic shriek that echos across the earth. Every part of it spasms and seems to be
flickering in and out of reality. It's mouth opens and faces the sky, thousands of spirits spewing from it's gaping
maw. The ground shakes as it's power is expelled in a huge blast of light. The Grim Reaper is no more.'''
                )
            print("-------------------------------------------------")
            return (True, hp, inventory)
        if Obuffer:
            Obuffer = False
        elif Ododging > 0:
            Ododging = 0
            if wp == 'scythe':
                print("The Reaper reapears.")
            else:
                print(name, "is no longer dodging your attacks.")
        if name == 'Liam' and knives > 0 and random.random() < 0.15:
            hp -= 15
            knives -= 1
            print("Liam hits you with a throwing knife dealing 15 damage.")
        if random.random() < 0.125 and Ododging == 0 and Owp != 'scythe':
            print(name, "tries to dodge your attacks for the next two rounds")
            Ododging = 0.35
            Obuffer = True
            continue
        elif random.random() < 0.15 and Owp == 'scythe':
            if random.random(
            ) > 0.5 and Opower > power - 10 and Ohp > 50 and wp != 'fists' and holding:
                dmg = math.ceil(5 + random.random() * 15)
                Ohp -= dmg
                holding = False
                print(
                    "The Grim Reaper focuses a necromactic charge into the handle of your blade, causing you to drop it while dealing",
                    dmg, "damage to itself.")
            elif Ododging == 0:
                print(
                    "The Reaper vanishes for the next two rounds, but you may be able to hit it if you are lucky."
                )
                Ododging = 0.45
                Obuffer = True
        if Ofar and Owp == 'scythe' and random.random() > 0.65:
            if random.random() > 0.5:
                print(
                    "The Reaper opens it's claw, unleashing a screeching spirit onto you."
                )
                (win, newHp, newInv) = battle('Spirit', 30, 'claw', False, 10, [hp, maxHp], wp, False, power, True, inventory)
                if win:
                    hp = max(newHp, 1)
                    inv = newInv
                else:
                    print(
                        "The spirit defeats you and presents your body to the Reaper, perhaps it will receive a reward in hell."
                    )
                    hp = 0
            else:
                print(
                    "The Grim Reaper fills you with despair and fear. You kneel to the ground against your will and it approaches."
                )
                Ofar = False
                far = True
        elif Ofar and Owp == 'scythe' and far:
            print(
                "The Grim Reaper conjures a powerful wind that catapults you toward it."
            )
            Ofar = False
            far = False
        if Ofar and Oholding and hp > 0:
            if Owp == 'wooden spear' and random.random(
            ) > 0.5 or Owp == 'copper knife' or Owp == 'steel axe' and random.random(
            ) > 0.5:
                if random.random() > 0.3 + dodging:
                    dmg = math.ceil(Opower + random.random() * Opower * 2.5)
                    hp -= dmg
                    print(name, "throws their", Owp, "dealing", dmg,
                          "damage to you.")
                else:
                    print(name, "throws and misses with their", Owp,
                          "dealing no damage to you.")
                Oholding = False
            else:
                if name != 'The Grim Reaper':
                    print(name, "gets within melee range.")
                    Ofar = False
                else:
                    if random.random() > 0.3 + dodging:
                        dmg = math.ceil(Opower +
                                        random.random() * Opower * 2.5)
                        hp -= dmg
                        print(
                            "The Reaper launches it's scythe into you with otherworldly force and deals",
                            dmg, "damage.")
                        Oholding = False
                    else:
                        if random.random() > 0.5:
                            print(
                                "The Reaper vanishes and reapears behind you in an instant."
                            )
                            Ofar = False
                        else:
                            print(
                                "The Reaper opens it's claw, unleashing a screeching spirit onto you."
                            )
                            (win, newHp,
                             newInv) = battle('Spirit', 30, 'claw', False, 10,
                                              [hp, maxHp], wp, False, power,
                                              True, inventory)
                            if win:
                                hp = max(newHp, 1)
                                inv = newInv
                            else:
                                print(
                                    "The spirit defeats you and presents your body to the Reaper, perhaps it will receive a reward in hell."
                                )
                                hp = 0
        elif Oholding and hp > 0:
            if random.random() > 0.3 or hp - 10 > Ohp:
                if random.random() > 0.3 + dodging:
                    dmg = math.ceil(Opower / 2 + random.random() * Opower)
                    hp -= dmg
                    print(name, "attacks you with a", Owp, "dealing", dmg,
                          "damage to you.")
                else:
                    print(name, "misses with their", Owp,
                          "dealing no damage to you.")
            else:
                if name != 'The Grim Reaper' and name != 'Spirit':
                    if random.random() > 0.5 + dodging and hp < Ohp:
                        far = True
                        print(
                            name,
                            "kicks you to the ground and deals 4 damage to you."
                        )
                    else:
                        print(
                            name,
                            "is unable to kick you to the ground but they do deal 4 damage to you."
                        )
                    hp -= 4
                else:
                    if name == 'The Grim Reaper':
                        if far:
                            print(
                                "The Reaper opens it's claw, unleashing a screeching spirit onto you."
                            )
                            (win, newHp,
                             newInv) = battle('Spirit', 30, 'claw', False, 10,
                                              [hp, maxHp], wp, False, power,
                                              True, inventory)
                            if win:
                                hp = max(newHp, 1)
                                inv = newInv
                            else:
                                print(
                                    "The spirit defeats you and presents your body to the Reaper, perhaps it will receive a reward in hell."
                                )
                                hp = 0
                        else:
                            print(
                                "The Grim Reaper reaches it's hand toward you. You feel your feet lift from the ground."
                            )
                            far = True
                    if name == 'Spirit':
                        print(
                            "The spirit envelops your head, whispering to you on all sides. A sonic ringing forms in your skull, dealing 4 damage."
                        )
                        hp -= 4
        elif hp > 0:
            Ofar = False
            if random.random() > 0.5 + Ododging and holding:
                dmg = math.ceil(power / 2 + random.random() * power)
                Ohp -= dmg
                print(
                    name,
                    "tries to retrieve their weapon but you attack before they can grab it dealing",
                    dmg, "damage to them.")
            else:
                print(name, "retrieves their weapon, dodging your attacks.")
                Oholding = True
        if hp < 1:
            if name == "The Native Urshak":
                print(
                    '''Right before the old man kills you, you think to yourself how ironic it is that a warrior as strong as you could lose to such a weak foe. How ironic that this old man had just tried to heal you, and how strange his reaction to your awakening was. Perhaps the man did have all the best intentions in the world, but your will to survive was too strong to be human.'''
                )
                return (False, 0, inventory)
            if name == "The Native Ornog":
                print(
                    "The spear weilding native pins you to the ground, you try to reminisce on your life but the native has already impaled your skull."
                )
                return (False, 0, inventory)
            if name == "The Grim Reaper":
                print(
                    '''The Reaper lifts it's scythe far above your head. Everything disolves as your soul is stripped from your body. Your last moments are of pure and raw terror. What nightmare could compare to anything like this? How could a being of this strength exist, how could the universe allow for such heresy? It was a violation of every law of nature, an error. It may be that it couldn't be stopped. Or perhaps, it could only be combatted by another error in the universe.'''
                )
                return (False, 0, inventory)
            if name == "Liam":
                print(
                    '''The axe weilding man knocks you to the ground. You were so close, so close to meaning. Why had you been defeated by such a minor obstacle. The smallest fluctuation of matter in the universe had shoved you to the ground. In seconds, the matter that composed you head would be split down the middle. You knew that it was just another meaningless event, one that didn't change the outcome of anything. You had a purpose, this man didn't. Your annoyance at being defeated by such an unworthy foe was a considerable force. The axe didn't even reach your head before you awoke again.'''
                )
                return (False, 0, inventory)


print('''INSTRUCTIONS...

Words in brackets like [word] must be typed into the console to choose the action 
they describe. 
In this example: "The path to the [left] is crawling with tigers, but the path to
the [right] has free ice cream." You would have to type "left" into the console to
go the prefered direction. At any time you can view your inventory and health by
typing "STATS" into the input box. This will be important for many desisions
throughout the game. Restarting the entire program is not the same as making a
new game. Don't restart unless something goes wrong.

Using items can happen in battle or out of battle. Just type the name of the item
to use it. A description of what the item does will be displayed in your inventory.

When in battle you will have different attacks depending on the weapon you have.
Your power is used for a random range of damage. Below is a short guide to how power
works:
Normal attack = power/2 + random number from 0 to power.
Throw attack = power + random number from 0 to power*2.5
All kicks attacks will deal 4 damage whether you are successful or not. If you are
successful your enemy will no longer be within melee range. Both you and your enemy
can be in melee range or out of melee range. When you are out of melee range you can
only throw your weapon. Throwing your weapon will give your enemy two chances to attack
you and you might not even retreive the weapon or hit the enemy in the first place.
Moving away from your enemy puts both of you out of melee range.
Dodging will allow you to reduce the chance of being attacked for two rounds. It is
especially good when retrieving your weapon.
Fleeing is a last ditch scenario that happens when you have no weapon and are far away.
It probably won't work most of the time but you can try.
All functions are mirrored for your enemy with some story specific exceptions.'''
      )
gameEnd = False
while True:
    if gameEnd:
        break
    lose = False
    if plays < 3 and not Klld:
        cur = 0
        hp = 1
        wp = 'fists'
        power = 3
        inventory = []
        print("=================================================")
        print(
            "Welcome to VIVUS MORTEM, a choose your own adventure game that isn't quite what it seems.\n"
        )
        stepprint(game[cur][0])
    if plays == 3 or Klld:
        Klld = False
        cur = len(game) - 1
        hp = 1
        wp = 'fists'
        power = 3
        inventory = []
        print("=================================================")
        print("Reality awaits.\n")
        stepprint(game[cur][0])
        cur = 0
        print("\n" + game[cur][0])
    if plays > 3:
        cur = 0
        hp = 1
        wp = 'fists'
        power = 3
        inventory = []
        print("=================================================")
        print("Welcome to VIVUS MORTEM. Your purpose is clear.\n")
        stepprint(game[cur][0])
    plays += 1
    #this will allow the user to play through the game until a win or lose state is acheived.
    while True:
        #gets user input with a line break
        typed = input("\n")
        print("")
        if typed.lower() == "stats":
            print("Your Health:", hp)
            print("Your Weapon:", wp, "(power:", str(power) + ")")
            inv = ""
            for i in range(int(len(inventory) / 2)):
                inv += inventory[i * 2] + " (" + str(
                    inventory[i * 2 + 1]) + "). "
            if len(inv):
                print("Your Inventory:", inv)
            continue
        try:
            #gets index of typed input in options
            item = inventory.index(typed.title())
            if inventory[item] == 'Bread':
                hp = min(hp + 10, maxHp)
                print("You consume a loave of bread and restore 10 health.")
                inventory[item + 1] -= 1
            if inventory[item] == 'Bandage':
                hp = min(hp + 25, maxHp)
                print("You consume a bandage and restore 25 health.")
                inventory[item + 1] -= 1
            if inventory[item] == 'Potion':
                hp = min(hp + 60, maxHp)
                print("You consume a healing potion and restore 60 health.")
                inventory[item + 1] -= 1
            if inventory[item] == 'Salus':
                hp = min(hp + 200, maxHp)
                print(
                    "You crush the brittle Salus in the palm of your hand. The shards melt through your skin and heal your body completely as it flows through your blood."
                )
                inventory[item + 1] -= 1
            if inventory[item + 1] == 0:
                inventory.pop(item - 1)
                inventory.pop(item - 1)
            continue
        except Exception:
            pass
        #initializes the temporary options list that will store the options you have availiable.
        options = []
        for i in range(round((len(game[cur]) - 1) / 2)):
            options.append(game[cur][i * 2 + 2])
        #asks for input until valid input is found
        while True:
            #trys to find index of input in options list, if it is not found the user is prompted again
            try:
                #gets index of typed input in options
                chosen = options.index(typed.lower())
                break
            except Exception:
                #tells user to type an option
                print(
                    typed, "is not an option. Options are " +
                    str(options)[1:-1] + ".")
                #gets user input with a line break
                typed = input("\n")
                print("")
        #updates gamestate by amount followed by typed string in the array
        cur += game[cur][chosen * 2 + 3]
        while True:
            win = False
            #prints current gamestate
            stepprint(game[cur][0])
            #gets the length of event array
            evLEN = len(game[cur][1])
            #detects events in gamestate and activates them
            if evLEN:
                for i in range(int(evLEN / 2)):
                    if game[cur][1][i * 2] == 'win':
                        gameEnd = True
                        break
                    if game[cur][1][i * 2] == 'memory':
                        typed = input("\n")
                        print("")
                        if "Ezmik" == typed:
                            print(
                                '''"YES! The few lifetimes I remember do not compare to the number of memories that echo through my skull of
you being here, right now, and forgetting. You were chosen. Chosen to save an infinite number of worlds! The
end of my suffering is near, I can feel it! Everything falls into your hands. You must end this nightmare. 
If you couldn't remember your past lives, you would never stand a chance. You have built instinctual 
reactions to each attack through countless battles, you know every weakness it has. I have aquired 
everything that I could. Uncomparable to any other object, the Salus gem will heal you in an instant when 
used!"''',
                                "Ezmik",
                                '''hands you a dull gem that feels soft. "I also present the finest healing potions in the world!"
You take three, the most you can fit on your person. Each potion will restore 60 health when used. Giddy,
the king approaches you. He holds a golden glass of wine to you. "Drink! It will make you stronger than
any other human alive!" You sip the glass and feel your body rigidify. Every part of you seems to tighten as
your skin hardens. "Finally, the most powerful weapon in the continent. It was forged a thousand years ago when 
the bonds between earth and magic were as strong as the earth is bonded to the sun. It is the only remanent 
of that time." The king lowers his hand to his waist, and a sword materializes in his grasp. It is engraved 
with runes that glow with power. He hands it to you. "It will return to your hand instantly at the whim of 
a thought. However, it will lose power each time you conjure it so do this sparingly. This may become 
essential in your fight."'''
                            )
                            maxHp = 150
                            hp = 150
                            cur += game[cur][1][i * 2 + 1]
                            stepprint(game[cur][0])
                            (win, newHp,
                             newInv) = battle('The Grim Reaper', 450, 'scythe',
                                              False, 21, [hp, maxHp], wp,
                                              False, power, True, inventory)
                            if win:
                                gameEnd = True
                                cur += 1
                                stepprint(game[cur][0])
                                break
                            else:
                                print("\nYOU LOSE.")
                                lose = True
                                break
                        else:
                            print(
                                '''"Truly it pains me. I only remember one lifetime where you actually had a chance. I was the one who made 
the mistake. I didn't provide you with what you needed to harness your power. I have worked my entire life 
to prepare for this! A lifetime of work WASTED! Why don't you remember, remember what came before? You are 
simply not meant to succeed. There is nothing more I can do. I will sit in my castle that I have built from 
the ground up and watch all my loyal soldiers defend it to the death all just to protect one man. A man who 
couldn't save the world because of YOU! After all of these lifetimes I have learned that nothing you do in 
life truly change the outcome of the universe. The universe must decide that for itself. Perhaps I will 
remember this life. Perhaps I can make all the same desisions. Eventually the universe will correct itself." The king steps away from you, conflicted with rage. He lowers his hand to his waist, and a sword materializes in his grasp. It is engraved with runes that glow with power. "You wasted my entire life, so I won't feel any remorse killing you. But trust me, I'm doing you a favor." Before you can try to run the king impales you from behind. All fades to black.'''
                            )
                            Klld = True
                            print("\nYOU LOSE.")
                            lose = True
                            break
                    if game[cur][1][i * 2] == 'hp':
                        hp = min(hp + game[cur][1][i * 2 + 1], maxHp)
                    if game[cur][1][i * 2] == 'bread':
                        found = False
                        number = 0
                        for j in inventory:
                            if j == 'Bread':
                                found = True
                                break
                            number += 1
                        if found:
                            inventory[number + 1] += game[cur][1][i * 2 + 1]
                        else:
                            inventory.append('Bread')
                            inventory.append(game[cur][1][i * 2 + 1])
                    if game[cur][1][i * 2] == 'wp':
                        if (power < game[cur][1][i * 2 + 1][1]):
                            wp = game[cur][1][i * 2 + 1][0]
                            power = game[cur][1][i * 2 + 1][1]
                        else:
                            print(
                                "\nUnfortunately, the weapon isn't much of an upgrade so you discard it."
                            )
                    if game[cur][1][i * 2] == 'bandage':
                        found = False
                        number = 0
                        for j in inventory:
                            if j == 'Bandage':
                                found = True
                                break
                            number += 1
                        if found:
                            inventory[number + 1] += game[cur][1][i * 2 + 1]
                        else:
                            inventory.append('Bandage')
                            inventory.append(game[cur][1][i * 2 + 1])
                    if game[cur][1][i * 2] == 'healing potion':
                        found = False
                        number = 0
                        for j in inventory:
                            if j == 'Healing Potion':
                                found = True
                                break
                            number += 1
                        if found:
                            inventory[number + 1] += game[cur][1][i * 2 + 1]
                        else:
                            inventory.append('Healing Potion')
                            inventory.append(game[cur][1][i * 2 + 1])
                    if game[cur][1][i * 2] == 'throwing knife':
                        found = False
                        number = 0
                        for j in inventory:
                            if j == 'Throwing Knife':
                                found = True
                                break
                            number += 1
                        if found:
                            inventory[number + 1] += game[cur][1][i * 2 + 1]
                        else:
                            inventory.append('Throwing Knife')
                            inventory.append(game[cur][1][i * 2 + 1])
                    if game[cur][1][i * 2] == 'salus':
                        inventory.append('Salus')
                        inventory.append(1)
                    if game[cur][1][i * 2] == 'battle':
                        info = game[cur][1][i * 2 + 1]
                        (win, newHp,
                         newInv) = battle(info[0], info[1], info[2], info[3],
                                          info[4], [hp, maxHp], wp, info[5],
                                          power, info[6], inventory)
                        hp = newHp
                        inventory = newInv
                        if win == 'flee':
                            cur += 1
                            win = True
                        if win:
                            cur += info[7]
                            win = True
                        else:
                            print("\nYOU LOSE.")
                            lose = True
            if not win or gameEnd:
                break
        if lose or gameEnd:
            break
    if gameEnd:
        break
print("=================================================")
print('''\n Thanks for playing! I hope you enjoyed this trippy adventure.''')