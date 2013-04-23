// CRAFTY - Components
/**
 * Obstacle
 * EnemyGoomba
 * EnemyBullet
 * LifeCounter
 * ScoreCounter
 * Castle
 * Mario
 * NetworkPlayer
 */

var numOfLives = 5;
var score = 0; //To increase score, kill enemies and finish the level.
								
Crafty.load(['assets/spriteMap.png'], function()
{
	Crafty.sprite(32, 'assets/spriteMap.png', { PlayerSprite: [0, 0] }, 0 , 0);
});

/** OBSTACLE
 * Represents a generic square obstacle of some size
 */
Crafty.c("Obstacle",
{
	init: function()
	{
		this.requires("2D, DOM");
	}
});

/** ENEMYGOOMBA
 * Represents an enemy that behaves like a Goomba
 * onHit - MARIO
 */
Crafty.c("EnemyGoomba",
{
	init: function()
	{
		this.requires("2D, DOM, Color, Collision")
			.color('rgb(55, 243, 140)')
			.collision(
				new Crafty.polygon(
					[0, 0], [30, 0], 
					[30, 30], [0, 30]
					)
				);
				//Die only when stomped on.
		
		this.bind('EnterFrame', function()
		{
			this.x += this.dX;
			
			if (this.x === this.leftBoundary)
			{
				this.dX = 1;
			}
			else if (this.x === this.rightBoundary)
			{
				this.dX = -1;
			}
			
		});
		
		this.onHit("Mario", function(target)
		{			
			if (target[0].normal.y > 0) //If Mario jumps on top of the bullet, it is dead.
			{
				score = score + 20;
				Crafty("ScoreCounter").text("Score: " + score);
				this.destroy();
			}
			else
			{
				target[0].obj.deathEnemy();
			}
		});
	}
});

/** ENEMYBULLET
 * Represents an enemy Bullet Bill that flies straight through the air
 * onHit - MARIO
 */
Crafty.c("EnemyBullet",
{
	init: function()
	{
		this.requires("2D, DOM, Image, Collision")
			.image("assets/Bullet.png")
			.collision(
				new Crafty.polygon(
					[0, 0], [40, 0], 
					[40, 35], [0, 35]
					)
				);
				//Die only when stomped on.
		
		this.bind('EnterFrame', function()
		{
			this.x += this.dX;
		});
		
		this.onHit("Mario", function(target)
		{						
			if (target[0].normal.y > 0) //If Mario jumps on top of the bullet, it is dead.
			{
				score = score + 20;
				Crafty("ScoreCounter").text("Score: " + score);
				this.destroy();
			}
			else
			{
				target[0].obj.deathEnemy();
			}
		});
	}
});

/** LIFECOUNTER
 * Test display that show how many 'lives' are left in the game
 */
Crafty.c("LifeCounter",
{
	init: function()
	{
		this.requires("2D, DOM, Text")
			.text("Lives: " + numOfLives)
			.textColor("#000000")
			.textFont(
				{
					font: "assets/MyriadPro.OTF",
					weight: "bold"
				});
	}
	
});

/** SCORECOUNTER
 * Text display that shows the game score
 */
Crafty.c("ScoreCounter",
{
	init: function()
	{
		this.requires("2D, DOM, Text")
			.text("Score: " + score)
			.textColor("#000000")
			.textFont(
				{
					font: "assets/MyriadPro.OTF",
					weight: "bold"
				});
	}
	
});

// Crafty.c("LifeCounterBg",
// {
// 	init: function()
// 	{
// 		this.requires("2D, DOM, Color")
// 			.text("Lives: " + numOfLives)
// 			.css({"color" : "#000000"});
// 	}
// 	
// });

/** CASTLE
 * Castle entity, which represents an end goal in the game
 * onHit - MARIO
 */
Crafty.c("Castle",
{
	init: function()
	{
		this.requires("2D, DOM, Image, Collision")
			.image("assets/Castle.png")
			.collision(
				new Crafty.polygon(
					[0, 0], [32, 0],
					[32, 32], [0, 32]
					)
				);
		
		this.onHit("Mario", function()
		{
			Crafty.scene("Victory");
		});
	}
});

/** MARIO
 * Represents the player at the local machine
 */
Crafty.c("Mario",
{
	init: function()
	{
		this.requires("2D, DOM, Multiway, Collision, PlayerSprite, SpriteAnimation")
			.multiway(10, {UP_ARROW: -90, RIGHT_ARROW: 0, LEFT_ARROW: -180})
			.collision(
				new Crafty.polygon(
					[0, 0], [30, 0], 
					[30, 30], [0, 30]
					)
				)
			.attr({x: 50, y: 300, w: 30, h: 30})
			.stopOnHit()
			.stopOnPitfallDeath()
			.stopOnEnemyHit()
			.animate('IdleRight', 0, 0, 15)
			.animate('RunRight', 0, 1, 20)
			.animate('JumpRight', 0, 2, 10)
			.animate('IdleLeft', 0, 3, 15)
			.animate('RunLeft', 0, 4, 20)
			.animate('JumpLeft', 0, 5, 10);
		
		var animation_speed = 4;
		this.bind('NewDirection', function(data)
		{
			if (data.x > 0 && data.y < 0) 
			{
				this.animate('JumpRight', animation_speed, 1);
			}
			else if (data.x < 0 && data.y < 0) 
			{
				this.animate('JumpLeft', animation_speed, 1);
			}
		
			else if (data.x > 0)
			{
				this.animate('RunRight', animation_speed, -1);
			}
			else if (data.x < 0) 
			{
				this.animate('RunLeft', animation_speed, -1);
			} 
			else if (data.y < 0) 
			{
				this.animate('JumpRight', animation_speed, 1);
			} 
			else 
			{
				this.stop();
			}	
		});
	},

	stopOnHit: function()
	{
		this.onHit("Obstacle", this.stopMovement);
		return this;
	},

	stopMovement: function(target)
	{
		this._speed = 0;
		if (this._movement)
		{
			this.x -= this._movement.x;
			this.y -= this._movement.y;
		}
	},
	
	stopOnPitfallDeath: function()
	{
		this.onHit("Pitfall", this.deathEnemy);
		return this;
	},
	/*
	death: function()
	{
		numOfLives--;
		Crafty("LifeCounter").text("Lives: " + numOfLives);
		
		if (numOfLives === 0)
		{
			this.destroy();
			numOfLives = 5; //Re-initialize for next time.
			score = 0;
			Crafty.scene("Dead"); //Keep this death function separate from the one below. For some reason, Crafty confuses itself.
		}
		else
		{
			this.x = 35;
			this.y = 325;
			Crafty("LifeCounter").x = this.x;
			Crafty("ScoreCounter").x = this.x;
		}
	},
	*/
	stopOnEnemyHit: function()
	{
		this.onHit("Enemy", this.deathEnemy);
		return this;
	},
	
	deathEnemy: function(target)
	{
		//console.log(target);
		numOfLives--;
		Crafty("LifeCounter").text("Lives: " + numOfLives);
		
		if (numOfLives === 0)
		{
			this.destroy();
			numOfLives = 5; //Re-initialize for next time.
			score = 0;
			Crafty.scene("Dead"); //Keep this death function separate from the one below. For some reason, Crafty confuses itself.
		}
		else
		{
			this.x = 35;
			this.y = 325;
			Crafty("LifeCounter").x = this.x;
			Crafty("ScoreCounter").x = this.x;
		}
	}
});

/** NETWORKPLAYER
 * Represents a player at some other location interacting over a network
 */
Crafty.c("NetworkPlayer",
{
	init: function()
	{
		this.requires("2D, DOM, PlayerSprite, SpriteAnimation")
			.animate('IdleRight', 0, 0, 15)
			.animate('RunRight', 0, 1, 20)
			.animate('JumpRight', 0, 2, 10)
			.animate('IdleLeft', 0, 3, 15)
			.animate('RunLeft', 0, 4, 20)
			.animate('JumpLeft', 0, 5, 10);
		
		var animation_speed = 4;
		this.bind('networkMove', function(data)
		{
			if (data.coordY < this.y) {
			    if (data.coordX < this.x)
				this.animate('JumpLeft', animation_speed, 1);
			    else
				this.animate('JumpRight', animation_speed, 1);
			} else {
			    if (data.coord == this.x)
				this.stop();
			    else if (data.coord < this.x)
				this.animate('RunLeft', animation_speed, 1);
			    else if (data.coord > this.x)
				this.animate('RunRight', animation_speed, 1);
			}
			this.x = data.coordX;
			this.y = data.coordY;
		});
	}
});

