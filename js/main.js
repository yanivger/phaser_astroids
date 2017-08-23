/// <reference path="lib/phaser.js" />

var Astroids = Astroids || {};
Astroids.game = new Phaser.Game("100%", "100%", Phaser.CANVAS, '');
Astroids.game.state.add("GameState", Astroids.GameState);

Astroids.game.state.start("GameState", true, true);