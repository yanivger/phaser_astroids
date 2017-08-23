/// <reference path="../lib/phaser.js" />
/// <reference path="../GameSettings.js" />
/// <reference path="../enum/MovementTypeEnum.js" />



var Astroids = Astroids || {};
Astroids.GameState = function ()
{
	"use strict";
	Phaser.State.call(this);
};
Astroids.GameState.prototype = Object.create(Phaser.State.prototype);
Astroids.GameState.prototype.constructor = Astroids.GameState;



// state stages:  http://www.html5gamedevs.com/topic/1372-phaser-function-order-reserved-names-and-special-uses/
Astroids.GameState.prototype.preload = function ()
{
	"use strict";

	this.load.image('space', 'assets/deep-space.jpg');
	this.load.image('bullet', 'assets/bullets.png');
	this.load.image('ship', 'assets/ship.png');
	this.load.image('baddie', 'assets/space-baddie.png');
}
Astroids.GameState.prototype.create = function ()
{
	"use strict";
	debugger;
	var game = Astroids.game;
	//game.world.setBounds(0, 0, 100000, 100000);
	game.renderer.clearBeforeRender = false;
	game.renderer.roundPixels = true;

	//  We need arcade physics
	game.physics.startSystem(Phaser.Physics.ARCADE);

	//  A spacey background
	//game.add.tileSprite(0, 0, 100000, 100000, 'space');
	game.add.tileSprite(0, 0, Astroids.game.width, Astroids.game.height, 'space');

	this.createWeapon()

	this.createPlayer();

	this.createEnemies();
	

	Astroids.cursors = game.input.keyboard.createCursorKeys();
	game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);
	Astroids.bulletTime = 0;

};
Astroids.GameState.prototype.createEnemies = function ()
{
	
	var game = Astroids.game;
	var enemies = game.add.group();
	enemies.enableBody = true;
	game.physics.enable(enemies, Phaser.Physics.ARCADE);
	for (var i = 0; i < 20; i++)
	{
		var enemie = enemies.create(game.world.randomX, game.world.randomY, 'baddie');
		game.physics.enable(enemie, Phaser.Physics.ARCADE);
		enemie.body.collideWorldBounds = true;
		enemie.body.bounce.setTo(0.8, 0.8);
		enemie.body.velocity.setTo( Math.random() * 40-20, Math.random() * 40-20);
	}
	Astroids.enemies = enemies;
	
}
Astroids.GameState.prototype.createPlayer = function ()
{
	var game = Astroids.game;
	var player = game.add.sprite(Astroids.GameSettings.PlayerSettings.StartingX, Astroids.GameSettings.PlayerSettings.StartingY, 'ship');
	player.enableBody = true;
	player.anchor.set(0.5, 0.5);
	player.angle = -90;
	Astroids.game.physics.enable(player, Phaser.Physics.ARCADE);
	player.body.drag.set(Astroids.GameSettings.PlayerSettings.PlayerDrag);
	player.body.maxVelocity.set(Astroids.GameSettings.PlayerSettings.PlayerMaxVelocity);
	game.camera.follow(player);
	player.body.bounce.setTo(0.8, 0.8);
	Astroids.player = player;
}
Astroids.GameState.prototype.createWeapon = function ()
{
	switch (Astroids.GameSettings.PlayerSettings.BulletSettings.bulletMode)
	{
		case MovementTypeEnum.SimpleGroup:
			this.createWeapon_SimpleGroup();
			break;
		case MovementTypeEnum.WeaponClass:
			this.createWeapon_WeaponClass();
			break;
	}
}
Astroids.GameState.prototype.createWeapon_SimpleGroup = function ()
{
	var weapon = Astroids.game.add.group();

	weapon.enableBody = true;
	weapon.physicsBodyType = Phaser.Physics.ARCADE;
	weapon.createMultiple(40, 'bullet');
	weapon.setAll('anchor.x', 0.5);
	weapon.setAll('anchor.y', 0.5);
	Astroids.weapon = weapon;
}
Astroids.GameState.prototype.createWeapon_WeaponClass = function ()
{
	var weapon = Astroids.game.add.weapon()

	//  The bullet will be automatically killed when it leaves the world bounds
	weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;

	//  Because our bullet is drawn facing up, we need to offset its rotation:
	weapon.bulletAngleOffset = 90;

	//  The speed at which the bullet is fired
	weapon.bulletSpeed = 400;

	//  Speed-up the rate of fire, allowing them to shoot 1 bullet every 60ms
	weapon.fireRate = 60;

	//  Add a variance to the bullet angle by +- this value
	weapon.bulletAngleVariance = 10;
	Astroids.weapon = weapon;
}
Astroids.GameState.prototype.onCollideWeaponWithEnemy=function(weapon,enemy)
{
    debugger;
   
    enemy.destroy();
    if (!Astroids.enemies.getFirstExists())
    {
        Astroids.game.state.start("GameState", true, true);
    }
}
Astroids.GameState.prototype.onCollide = function (player, enemy)
{
    Astroids.game.state.start("GameState", true, true);
}
Astroids.GameState.prototype.update = function ()
{
	"use strict";
	
	//Astroids.game.physics.arcade.overlap(Astroids.player, Astroids.enemies);
	Astroids.game.physics.arcade.collide(Astroids.player, Astroids.enemies, this.onCollide);
	
	Astroids.game.physics.arcade.collide(Astroids.weapon, Astroids.enemies,this.onCollideWeaponWithEnemy);
	this.updatePlayerMovement();
	this.handleBounds();
};
Astroids.GameState.prototype.updatePlayerMovement = function ()
{
	if (Astroids.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
	{
		this.fireBullet();
	}

	switch (Astroids.GameSettings.PlayerSettings.movementType)
	{
		case MovementTypeEnum.AcelerationEngine:
			this.updatePlayerMovementAcelerationEngine();
			break;
		case MovementTypeEnum.LinearExplicit:
			this.updatePlayerMovementLinearExplicit();
			break;
		case MovementTypeEnum.StrafSidesEngine:
			this.updatePlayerMovementStrafSidesEngine();
			break;

	}
}
Astroids.GameState.prototype.updatePlayerMovementStrafSidesEngine = function ()
{
	if (Astroids.cursors.left.isDown)
	{
		Astroids.player.body.velocity.x = -200;
	}
	else if (Astroids.cursors.right.isDown)
	{
		Astroids.player.body.velocity.x = 200;
	}
	else
	{
		Astroids.player.body.angularVelocity = 0;
	}
}
Astroids.GameState.prototype.updatePlayerMovementLinearExplicit = function ()
{

	if (Astroids.cursors.up.isDown)
	{

		Astroids.playerSpeed = Astroids.GameSettings.PlayerSettings.MovementSettings.LinearExplicit.BaseLinearVelocity;
	}
	else if (Astroids.cursors.down.isDown)
	{
		Astroids.playerSpeed = -Astroids.GameSettings.PlayerSettings.MovementSettings.LinearExplicit.BaseLinearVelocity;
	}
	else
	{
		Astroids.playerSpeed = 0;
	}
	if (Astroids.cursors.left.isDown)
	{

		Astroids.player.angle -= Astroids.GameSettings.PlayerSettings.MovementSettings.LinearExplicit.BaseRadialVelocity;
	}
	else if (Astroids.cursors.right.isDown)
	{

		Astroids.player.angle += Astroids.GameSettings.PlayerSettings.MovementSettings.LinearExplicit.BaseRadialVelocity;
	}
	if (Astroids.playerSpeed !== 0)
	{

		var angleRad = Math.PI * Astroids.player.angle / 180;
		var deltaX = Math.cos(angleRad);
		var deltaY = Math.sin(angleRad);
		Astroids.player.x += Math.cos(angleRad) * Astroids.playerSpeed;
		Astroids.player.y += Math.sin(angleRad) * Astroids.playerSpeed;
	}
};
Astroids.GameState.prototype.updatePlayerMovementAcelerationEngine = function ()
{
	if (Astroids.cursors.up.isDown)
	{
		Astroids.game.physics.arcade.accelerationFromRotation(Astroids.player.rotation,
             Astroids.GameSettings.PlayerSettings.MovementSettings.AcelerationEngine.LinearAcel
             , Astroids.player.body.acceleration);
	}

	else
	{
		Astroids.player.body.acceleration.set(0);
	}
	if (Astroids.cursors.left.isDown)
	{
		Astroids.player.body.angularVelocity = -Astroids.GameSettings.PlayerSettings.MovementSettings.AcelerationEngine.RadialAcel;
	}
	else if (Astroids.cursors.right.isDown)
	{
		Astroids.player.body.angularVelocity = Astroids.GameSettings.PlayerSettings.MovementSettings.AcelerationEngine.RadialAcel;
	}
	else
	{
		Astroids.player.body.angularVelocity = 0;
	}
}
Astroids.GameState.prototype.handleBounds = function ()
{
	if (Astroids.player.x < 0) Astroids.player.x = Astroids.game.width;
	if (Astroids.player.x > Astroids.game.width) Astroids.player.x = 0;
	if (Astroids.player.y < 0) Astroids.player.y = Astroids.game.height;
	if (Astroids.player.y > Astroids.game.height) Astroids.player.y = 0;

};
Astroids.GameState.prototype.fireBullet = function ()
{
	if (Astroids.game.time.now > Astroids.bulletTime)
	{
		var bullet = Astroids.weapon.getFirstExists(false);

		if (bullet)
		{
			bullet.reset(Astroids.player.body.x + 16, Astroids.player.body.y + 16);
			bullet.lifespan = 2000;
			bullet.rotation = Astroids.player.rotation;
			Astroids.game.physics.arcade.velocityFromRotation(Astroids.player.rotation, 400, bullet.body.velocity);
			Astroids.bulletTime = Astroids.game.time.now + Astroids.GameSettings.PlayerSettings.BulletSettings.BulletsInterval;
		}
	}
};