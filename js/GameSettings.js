/// <reference path="enum/MovementTypeEnum.js" />



var Astroids = Astroids || {};
Astroids.GameSettings = new function ()
{
	this.PlayerSettings = new function ()
	{
	    this.StartingX = 300;
	    this.StartingY = 500;
	    this.PlayerDrag = 1000;
	    this.PlayerMaxVelocity = 200;
	    this.movementType = MovementTypeEnum.AcelerationEngine;
        
		this.MovementSettings = new function ()
		{

			this.LinearExplicit = new function ()
			{
				this.BaseLinearVelocity = 2;
				this.BaseRadialVelocity = 3;
			}
			this.AcelerationEngine = new function ()
			{
			    this.LinearAcel = 300;
			    this.RadialAcel = 200;
			}
		}
		this.BulletSettings =new  function ()
		{ 
		    this.BulletsInterval = 100;
		};
	};
	this.WorldSettings =new function ()
	{

	};

};