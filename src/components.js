var numOfLives = 5;
var score = 0; //To increase score, kill enemies and finish the level.
								
Crafty.load(['assets/spriteMap.png'], function()
{
	Crafty.sprite(32, 'assets/spriteMap.png', { PlayerSprite: [0, 0] }, 0 , 0);
});

Crafty.c("Obstacle",
{
	init: function()
	{
		this.requires("2D, DOM");
	}
});

Crafty.c("Enemy",
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
		
		this.onHit("Mario", function()
		{
			score = score + 20;
			Crafty("ScoreCounter").text("Score: " + score);
			this.destroy();
		});
	}
});

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
		this.onHit("Pitfall", this.death);
		return this;
	},
	
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
	
	stopOnEnemyHit: function()
	{
		this.onHit("Enemy", this.deathEnemy);
		return this;
	},
	
	deathEnemy: function()
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
	}
});

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
			if (data.coordX > this.x && data.coordY < this.y) 
			{
				this.x = data.coordX;
				this.y = data.coordY;
				this.animate('JumpRight', animation_speed, 1);
			}
			else if (data.coordX < this.x && data.coordY < this.y) 
			{
				this.x = data.coordX;
				this.y = data.coordY;
				this.animate('JumpLeft', animation_speed, 1);
			}
			else if (data.coordX > this.x)
			{
				this.x = data.coordX;
				this.y = data.coordY;
				this.animate('RunRight', animation_speed, 1);
			}
			else if (data.coordX < this.x) 
			{
				this.x = data.coordX;
				this.y = data.coordY;
				this.animate('RunLeft', animation_speed, 1);
			} 
			else if (data.coordY < this.y) 
			{
				this.x = data.coordX;
				this.y = data.coordY;
				this.animate('JumpRight', animation_speed, 1);
			} 
			else 
			{
				this.x = data.coordX;
				this.y = data.coordY;
				this.stop();
			}	
		});
	}
});

