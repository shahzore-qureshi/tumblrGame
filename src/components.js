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

Crafty.c("Mario",
{
	init: function()
	{
		this.requires("2D, DOM, Multiway, Collision, PlayerSprite, SpriteAnimation")
			.multiway(10, {UP_ARROW: -90, RIGHT_ARROW: 0, LEFT_ARROW: -180})
			.attr({x: 50, y: 350, w: 30, h: 30})
			.stopOnHit()
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
	}
});

