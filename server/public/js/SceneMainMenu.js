/*  Author: Patrick Dicks
*   Title: Defenders
*   License: MIT
*   SceneMainMenu.js
*/

class SceneMainMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'SceneMainMenu' });
    }

    preload() {
        // images
        this.load.image('sprBg0', 'assets/img/HomeLevel.png');
        this.load.image('sprBtnPlay', 'assets/img/sprBtnPlay.png');
        this.load.image('sprBtnPlayHover', 'assets/img/sprBtnPlayHover.png');
        this.load.image('sprBtnPlayDown', 'assets/img/sprBtnPlayDown.png');
        this.load.image('sprBtnRestart', 'assets/img/sprBtnRestart.png');
        this.load.image('sprBtnRestartHover', 'assets/img/sprBtnRestartHover.png');
        this.load.image('sprBtnRestartDown', 'assets/img/sprBtnRestartDown.png');

        // sfx
        this.load.audio('sndBtnOver', 'assets/sfx/sndBtnOver.wav');
        this.load.audio('sndBtnDown', 'assets/sfx/boom7_msdn.wav');
    }

    create() {
        //Background
        this.add.image(512, 288, 'sprBg0');

        // sfx
        this.sfx = {
            btnOver: this.sound.add('sndBtnOver'),
            btnDown: this.sound.add('sndBtnDown')
        };

        // play button
        this.btnPlay = this.add.sprite(
            this.game.config.width * 0.5,
            this.game.config.height * 0.5,
            'sprBtnPlay'
        );

        this.btnPlay.setInteractive();  // set play button

        // button texture on hover
        this.btnPlay.on('pointerover', function() {
            this.btnPlay.setTexture('sprBtnPlayHover');
            this.sfx.btnOver.play();
        }, this);

        // button texture not on hover
        this.btnPlay.on('pointerout', function() {
            this.setTexture('sprBtnPlay');
        });

        // button texture when pressed
        this.btnPlay.on('pointerdown', function() {
            this.btnPlay.setTexture('sprBtnPlayDown');
            this.sfx.btnDown.play();
        }, this);

        // button texture when released
        this.btnPlay.on('pointerup', function() {
            this.btnPlay.setTexture('sprBtnPlay');
            this.scene.start('SceneLevel1');
        }, this);

        // title text
        this.title = this.add.text(this.game.config.width * 0.5, 128, 'DEFENDERS', {
            fontFamily: 'defenders',
            fontSize: 48,
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'center'
        });
        this.title.setOrigin(0.5);
    }
}