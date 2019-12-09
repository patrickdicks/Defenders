/*  Author: Patrick Dicks
*   Title: Defenders
*   License: MIT
*   game.js
*/

var config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'DEFENDERS',
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    width: 1024,
    height: 576,
    physics: {
        default: 'arcade',
    },
    scene: [
        SceneMainMenu,
        SceneLevel1,
        Level1Trans,
        SceneLevel2,
        Level2Trans,
        SceneLevel3,
        SceneVictory,
        SceneGameOver
    ],
    pixelArt: false,
    roundPixels: true
};

var game = new Phaser.Game(config);