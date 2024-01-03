# SGI 2023/2024 - TP3

## Group: T05G07

| Name                           | Number    | E-Mail                   |
| ------------------------------ | --------- | ------------------------ |
| André Ismael Ferraz Ávila      | 202006767 | up202006767@edu.fe.up.pt |
| Maria Sofia B. P. C. Gonçalves | 202006927 | up202006927@edu.fe.up.pt |

----
## Project information

- Initial Menu: composed by the game's name "Third Gear", an allusion to the Terceira Island and the famous program Top Gear. Besides the names of the developers and the Feup Logo, the player must pick a difficulty level, between easy, medium and hard. This level will change the speed with which the opponent moves its car, allowing for a more tricky (or not) play. Besides that, the player must type in their game name. Only after that, they can start the fun!

![Screenshot](/tp3/screenshots/initialMenu.png)

- Player Park: the player must choose their car. The choice varies between a formula-1 like car, a small tractor, and two more regular ones. The first green car presented - the one on the right hand-side - has two special feature: brake lights and pop-up front lights, besides more camera angles. All cars have an interesting detail: when braking or moving to the sides, they tilt a bit, mimicking the emotion of real-life cars.

![Screenshot](/tp3/screenshots/playerPark.png)

- Opponent Park: similar to the previously mentined park, but this time, the car chosen will be used by the computer to play against the player.

![Screenshot](/tp3/screenshots/opponentPark.png)

- Race: the race begins as soon as the player's car is next to the opponent's car. Throughout the race, the player must go through all the cones (checkpoints), otherwise the lap is not completed, and, therefore, is not valid. When the player's car goes to the grass, its speed is decreased to only 70% of what is was. The same thing happens to the player car when the two cars collide.

![Screenshot](/tp3/screenshots/race.png)

- Cars: all the cars (that are chosen by the player) are controlled by the keys WASP, can go into reverse, their wheels spin and the front ones tilt when the car is moving to the right or left, just like real-life cars.

- Animations: Animations are implemented using Three.js functionalities, apart from the autonomous car animation, they are declared in the XML file and are made by tracks (which are the nodes affected by the animation) and timestamps (contain the transformations that occur at a given time) that are then turned into keyframes that Three.js handles. 

- Powerups: many mistery boxes are scattered across the track. Some of them stops the opponent in time for a few seconds - allowing the player to catch up a bit - while others increase the maximum possible speed of the player for four seconds. Besides this improvements, a player can choose an obstacle and put it in any spot in the track. After being used, the powerup box's colors will fade a bit, indicating that is has been used, and can't have its power used again in the same lap. In the next lap, it will return with its original colors and with a power. 

![Screenshot](/tp3/screenshots/powerupAfter.png)

- Obstacles: 3 different obstacles can be picked: a clock, that makes the opponent's car faster during four seconds; a snail, that makes the player's car slower during six seconds; a champagne bottle, that switches the A and D keys during five seconds. These obstacles are chosen by the player through picking.

![Screenshot](/tp3/screenshots/obstacles.png)

- Obstacle Park: the different obstacles are inside fences. The camera changes position from the car to them when it's time to pick one.

- HUD: an important informative part, present in the initial and final menus, as well as in the race. In the initial menu, the HUD is composed by the title of the game, the FEUP logo, and the students' names. In he final menu, the HUD has more components: it indicates who won and who lost (and the player's inputed name) - based in who completed the 3 mandatory laps first -, the level of difficulty that was played, the player's and the opponents times. Besides that, the buttons are also part of the HUD in this menu: they allow the game to be replayed with the exact same settings (Replay button), or for the player to change them and play again (Menu button). During the race, 3 different components are visible: on the top center of the screen, a counter that keeps track of each lap's time; on the top right side, the lap counter, and on the bottom left, the car's speed.

- Collisions: Collision checking is implemented using some concepts learnt in class and some others, it takes performance into account using Axis Oriented Bounding Boxes, then when these collide, a more precise collider is used to check for intersections. The more precise colliders are only rectangle colliders as they were enough for our purpose and due to the nature of the game, we decided that 2D collisions would be enough for our use case. The rectangle colliders are intersected using the Separating Axis Theorem. Colliders are also divided into dynamic and static colliders, the firsts have their position updated every frame while the others do not change, therefore, to improve performance, we implemented a collider pruning tree for the static colliders combining them into bigger colliders that use Axis Aligned Bounding Boxes.

- Shaders: the mistery boxes spin around themselves and pulsate, same thing happens with any obstacle after being dropped in a spot in a track. Besides that, many outdoors are displayed around the track, showing at each minute the game actually happening. Besides that, the outdoor has depth.

- Final Menu: Besides the HUD components present in this scene, the two stars of the game have a special spot: the two cars chosen. Fireworks (affected by gravity) explode all around them, celebrating the winner's victory.

![Screenshot](/tp3/screenshots/finalMenu.png)

----
## Issues/Problems

- All features were implemented.
- No known bug as of the moment this file was written.
