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
		this.requires("2D, DOM, Color, Collision")
			.color('rgb(0,67,150)')
			.collision(
				new Crafty.polygon([this.x, this.y - (this.h / 2)], [this.x + (this.w / 2), this.y], [this.x + this.w, this.y - (this.h / 2)]));
				//Die only when stomped on.
		
		this.bind('EnterFrame', function()
		{
			this.x += this.dX;
		
			if (this.x === this.leftBoundary)
			{
				this.dX = 2;
			}
			else if (this.x === this.rightBoundary)
			{
				this.dX = -2;
			}
		});
		
		this.onHit("Mario", function()
		{
			this.destroy();
		});
		
		
		
	}
});

Crafty.c("Mario",
{
	init: function()
	{
		this.requires("2D, DOM, Multiway, Collision, PlayerSprite, SpriteAnimation")
			.multiway(10, {UP_ARROW: -90, RIGHT_ARROW: 0, LEFT_ARROW: -180})
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
		Crafty.scene("Dead"); //Keep this death function separate from the one below. For some reason, Crafty confuses itself.
	},
	
	stopOnEnemyHit: function()
	{
		this.onHit("Enemy", this.deathEnemy);
		return this;
	},
	
	deathEnemy: function()
	{
		Crafty.scene("Dead");
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

