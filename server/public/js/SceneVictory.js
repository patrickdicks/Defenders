/*  Author: Patrick Dicks
*   Title: Defenders
*   License: MIT
*   SceneVictory.js
*/

class SceneVictory extends Phaser.Scene {
    constructor() {
        super({ key: 'SceneVictory' });
    }
    
    create() {
        // title text
        this.add.image(512, 288, 'bgL3');        
        this.title = this.add.text(this.game.config.width * 0.5, 128, 'VICTORY!', {
            fontFamily: 'monospace',
            fontSize: 48,
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'center'
        });
        this.title.setOrigin(0.5);

        /*energyText = this.add.text(this.game.config.width * 0.9, this.game.config.height * 0.05, 'Energy: ' + energy, {
            fontFamily: 'monospace',
            fontSize: 24,
            //fontStyle: 'bold',
            color: '#ffffff',
            align: 'right'
        });
        energyText.setOrigin(0.5);*/

        // sfx
        this.sfx = {
            btnOver: this.sound.add('sndBtnOver'),
            btnDown: this.sound.add('sndBtnDown')
        };

        // restart button
        this.btnRestart = this.add.sprite(
            this.game.config.width * 0.5,
            this.game.config.height * 0.5,
            'sprBtnRestart'
        );

        this.btnRestart.setInteractive(); // set restart button

        // button texture on hover
        this.btnRestart.on('pointerover', function() {
            this.btnRestart.setTexture('sprBtnRestartHover');
            this.sfx.btnOver.play();
        }, this);

        // button texture not on hover
        this.btnRestart.on('pointerout', function() {
            this.setTexture('sprBtnRestart');
        });

        // button texture when pressed
        this.btnRestart.on('pointerdown', function() {
            this.btnRestart.setTexture('sprBtnRestartDown');
            this.sfx.btnDown.play();
        }, this);

        // button texture when released
        this.btnRestart.on('pointerup', function() {
            this.btnRestart.setTexture('sprBtnRestart');
            this.scene.start('SceneLevel1');
        }, this);
    }
}