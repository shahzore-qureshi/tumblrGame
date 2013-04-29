// CRAFTY - Components
/**
 * Mario
 * NetworkPlayer
 * Obstacle
 * EnemyGoomba
 * EnemyBullet
 * LifeCounter
 * ScoreCounter
 * Castle
 */
								
Crafty.load(['assets/MarioSprite.png'], function()
{
	Crafty.sprite(32, 'assets/MarioSprite.png', { PlayerSprite: [0, 0] }, 0 , 0);
});

Crafty.load(['assets/GoombaSprite.png'], function()
{
	Crafty.sprite(32, 'assets/GoombaSprite.png', { GoombaSprite: [0, 0] }, 0 , 0);
});

Crafty.audio.add("ambiance", "assets/mario.ogg");
Crafty.audio.add("castle", "assets/castle.ogg");
Crafty.audio.add("jump", "assets/jump.ogg");

/** MARIO
 * Represents the player at the local machine
 */
Crafty.c("Mario",
{
	init: function()
	{
		this.requires("2D, DOM, Multiway, Collision, PlayerSprite, SpriteAnimation, Persist") //Persist allows Mario to stay alive between scenes.
			.multiway(10, {UP_ARROW: -90, RIGHT_ARROW: 0, LEFT_ARROW: -180})
			.collision(
				new Crafty.polygon(
					[0, 0], [30, 0], 
					[30, 30], [0, 30]
					)
				)
			.attr({x: 50, y: 300, w: 30, h: 30, numOfLives: 5, score: 0})
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
		this.bind('NewDirection', function(data) //Handles sprite animations.
		{
		    if (data.y < 0) 
		    {
				if (data.x < 0)
				{
			    	this.animate('JumpLeft', animation_speed, 1);
			    }
				else
				{
			    	this.animate('JumpRight', animation_speed, 1);
			    }
		    } 
		    else 
		    {
				if (data.x == 0)
					this.stop();
				else if (data.x > 0)
					this.animate('RunRight', animation_speed, -1);
				else if (data.x < 0)
					this.animate('RunLeft', animation_speed, -1);
		    }
		});
		
		this.bind("KeyDown", function(data) //Handles jumping sound.
		{
			if (data.keyIdentifier === "Up")
				Crafty.audio.play("jump", 1);
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

	stopOnEnemyHit: function()
	{
		this.onHit("Enemy", this.deathEnemy);
		return this;
	},
	
	deathEnemy: function(target)
	{
		this.numOfLives--;
		Crafty("LifeCounter").text("Lives: " + this.numOfLives);
		
		if (this.numOfLives === 0)
		{
			Crafty.scene("Dead"); //Keep this death function separate from the one below. For some reason, Crafty confuses itself.
		}
		else
		{
			this.x = 35;
			this.y = 300;
			Crafty("LifeCounter").x = this.x - 35;
			Crafty("ScoreCounter").x = this.x + 20;
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
			if (data.coordY < this.y)
			{
			    if (data.coordX < this.x)
					this.animate('JumpLeft', animation_speed, 1);
			    else
					this.animate('JumpRight', animation_speed, 1);
			} 
			else 
			{
			    if (data.coordX == this.x)
					this.stop();
			    else if (data.coordX < this.x)
					this.animate('RunLeft', animation_speed, 1);
			    else if (data.coordX > this.x)
					this.animate('RunRight', animation_speed, 1);
			}
			
			this.x = data.coordX;
			this.y = data.coordY;
		});
	}
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

Crafty.c("Ground",
{
	init: function()
	{
		this.requires("2D, DOM, Image, Obstacle")
			.image("assets/ground.png", "repeat");
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
		this.requires("2D, DOM, Collision, GoombaSprite, SpriteAnimation")
			.collision([0, 30], [15, 0], [30, 30])
			.animate('WalkLeft', 0, 0, 7)
			.animate('WalkRight', 0, 1, 7);
		
		var animation_speed = 4;
		this.bind('EnterFrame', function()
		{
			this.x += this.dX;
			if (this.dX == 1)
				this.animate('WalkRight', animation_speed, 1);
			else if (this.dX == -1)
				this.animate('WalkLeft', animation_speed, 1);
			
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
				Crafty("Mario").score += 20;
				Crafty("ScoreCounter").text("Score: " + Crafty("Mario").score);
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
				Crafty("Mario").score += 20;
				Crafty("ScoreCounter").text("Score: " + Crafty("Mario").score);
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
			.text("Lives: 5")
			.textColor("#000000");
		
		this.css(
				{
					"font": "14px Arial"
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
			.text("Score: 0")
			.textColor("#000000");
		
		this.css(
				{
					"font": "14px Arial",
				});
	}
	
});

/** SCORECOUNTER
 * Text display that shows the game score
 */
Crafty.c("DisplayScore",
{
	init: function()
	{
		this.requires("2D, DOM, Text")
			.text("Score: 0")
			.textColor("#000000");
			
		this.css(
				{
					"font": "36px Arial"
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

