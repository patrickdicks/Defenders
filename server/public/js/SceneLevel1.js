/*  Author: Patrick Dicks
*   Title: Defenders
*   License: MIT
*   SceneLevel1.js
*/

var energy;
var energyText;
var lvlText;
var subLvlText;
var towerCount;
var deadEnemyCount;
var map;

class SceneLevel1 extends Phaser.Scene {
    constructor() {
        super({ key: 'SceneLevel1' });
    }
  
    preload() {
        // images
        this.load.image('planet', 'assets/img/planetSmall.png');
        this.load.image('probe1', 'assets/img/probe1.png');
        this.load.image('tower1', 'assets/img/tower1.png');
        this.load.image('sprEnemy1', 'assets/img/sprEnemy1.png');       
        this.load.image('sprLaserEnemy0', 'assets/img/sprLaserEnemy0.png');
        this.load.image('sprLaserPlayer', 'assets/img/sprLaserPlayer.png');
        this.load.image('sprLaserTurret', 'assets/img/roundBullet.png');
        this.load.atlas('sprites', 'assets/img/spritesheet.png', 'assets/img/spritesheet.json');

        // spritesheets
        this.load.spritesheet('sprPlayer', 
            'assets/img/Ship2.png', 
            { frameWidth: 28, frameHeight: 21 }
        );
        this.load.spritesheet('sprEnemy0', 
            'assets/img/blueEnemySpr.png', 
            { frameWidth: 16, frameHeight: 16 }
        );
        this.load.spritesheet('sprEnemy2', 
            'assets/img/blueEnemy2Spr.png', 
            { frameWidth: 16, frameHeight: 16 }
        );
        this.load.spritesheet('sprExplosion', 
            'assets/img/sprExplosion.png', 
            { frameWidth: 32, frameHeight: 32 }
        );

        // sfx
        this.load.audio('sndExplode0', 'assets/sfx/boom9.wav');
        this.load.audio('sndExplode1', 'assets/sfx/explode1.wav');
        this.load.audio('sndLaser', 'assets/sfx/laser0.wav');
    }

    create() {
        // create map
        map = [[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
              [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,-1,-1],
              [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,-1,-1],
              [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,-1,-1],
              [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,-1,-1],
              [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,-1,-1],
              [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,-1,-1],
              [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
              [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]];

        //Background
        this.add.image(512, 288, 'sprBg0');
        this.add.image(512, 527,'planet');

        // animations
        this.anims.create({
            key: 'sprPlayer',
            frames: this.anims.generateFrameNumbers('sprPlayer'),
            frameRate: 20,
            repeat: -1
        });
        this.anims.create({
            key: 'sprEnemy0',
            frames: this.anims.generateFrameNumbers('sprEnemy0'),
            frameRate: 20,
            repeat: -1
        });
        this.anims.create({
            key: 'sprEnemy2',
            frames: this.anims.generateFrameNumbers('sprEnemy2'),
            frameRate: 20,
            repeat: -1
        });
        this.anims.create({
            key: 'sprExplosion',
            frames: this.anims.generateFrameNumbers('sprExplosion'),
            frameRate: 20,
            repeat: 0
        });

        // sfx
        this.sfx = {
            explosions: [
                this.sound.add('sndExplode0'),
                this.sound.add('sndExplode1')
            ],
            laser: this.sound.add('sndLaser')
        };

        this.drawLines();  // draw grid lines

        // level text
        lvlText = this.add.text(this.game.config.width - 64, 32, 'Level 1', {
            fontFamily: 'monospace',
            fontSize: 24,
            color: '#ffffff',
            align: 'center'
        });
        lvlText.setOrigin(0.5);

        // sub level text
        subLvlText = this.add.text(this.game.config.width - 64, 48, '\"Homeworld\"', {
            fontFamily: 'monospace',
            fontSize: 12,
            color: '#ffffff',
            align: 'center'
        });
        subLvlText.setOrigin(0.5);

        // energy text
        energy = 50;  // reset energy
        energyText = this.add.text(this.game.config.width - 64, 96, 'Energy: ' + energy, {
            fontFamily: 'monospace',
            fontSize: 16,
            color: '#ffffff',
            align: 'right'
        });
        energyText.setOrigin(0.5); 

        // create player instance
        this.player = new Player(
            this,
            this.game.config.width * 0.5,
            this.game.config.height - 96,
            'sprPlayer'
        );

        // player movement keys
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        // player fire w/ spacbar
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);

        // towers
        this.towers = this.add.group({
            classType: Tower,
            key: 'tower1',
            repeat: 13,
            setXY: { x: 32, y: this.game.config.height - 32, stepX: 64 }
        });
        towerCount = 14;  // set initial tower count

        this.turrets = this.add.group({ classType: Turret1});  // create turrets
        this.input.on('pointerdown', this.placeTurret);  // place turret on click

        // upgrade text
        this.upgradeText = this.add.text(this.game.config.width - 64, this.game.config.height - 32, 'Upgrade\nMenu', {
            fontFamily: 'monospace',
            fontSize: 12,
            color: '#ffffff',
            align: 'center'
        });
        this.upgradeText.setOrigin(0.5);

        // upgrade turret
        this.upgradeTurretButton = this.add.image(this.game.config.width - 64, 208, 'probe1');
        this.upgradeTurretButton.setInteractive().on('pointerdown', this.upgradeTurret);
        this.upgradeTurretButton.setScale(1);

        // upgrade turret text
        this.upgradeTurretText = this.add.text(this.game.config.width - 64, 240, 'Turret\nLevel 1', {
            fontFamily: 'monospace',
            fontSize: 10,
            color: '#ffffff',
            align: 'center'
        });
        this.upgradeTurretText.setOrigin(0.5);

        // upgrade towers
        /*this.upgradeTowersButton = this.add.image(this.game.config.width - 64, 320, 'tower1');
        this.upgradeTowersButton.setInteractive().on('pointerdown', this.upgradeTowers);
        this.upgradeTowersButton.setScale(1);*/
        
        // upgrade towers text
        /*this.upgradeTowersText = this.add.text(this.game.config.width - 64, 368, 'Towers\nLevel 1', {
            fontFamily: 'monospace',
            fontSize: 10,
            color: '#ffffff',
            align: 'center'
        });
        this.upgradeTowersText.setOrigin(0.5);*/

        // upgrade ship laser
        this.upgradeShipButton = this.add.image(this.game.config.width - 64, this.game.config.height - 176, 'sprPlayer');
        this.upgradeShipButton.setInteractive().on('pointerdown', this.upgradeShip);
        this.upgradeShipButton.setScale(1);

        // upgrade ship text
        this.upgradeShipText = this.add.text(this.game.config.width - 64, this.game.config.height - 128, 'Ship\nLevel 1', {
            fontFamily: 'monospace',
            fontSize: 10,
            color: '#ffffff',
            align: 'center'
        });
        this.upgradeShipText.setOrigin(0.5);

        // create enemy instance groups
        this.enemies = this.add.group();
        this.enemyLasers = this.add.group();
        this.playerLasers = this.add.group();
        this.lvl = 1;

        // spawn enemies timer event
        this.time.addEvent({
            delay: 1500,
            callback: function() {
                var enemy = null;
                var spdShip = null;

                var randomSize = Phaser.Math.Between(10, 20) * 0.1;
                var xLocation = Phaser.Math.Between(0, 800);
                var xSpdLocation = Phaser.Math.Between(0, 900);
                var xIncrease = 32;
                    
                //create wave of 5 enemies at random location
                for (var i = 0; i < 5; i++) {
                    enemy = new BasicShip(
                        this,
                        xLocation + xIncrease,
                        0   
                    );
                    
                    xIncrease += 30;
                    
                    enemy.setScale(randomSize);
                    this.enemies.add(enemy);   
                }
                    
                // randomize speeder ship
                var randSpeed = Phaser.Math.Between(1, 10);
                if (randSpeed > 8) {
                    spdShip = new SpeederShip(
                        this, 
                        xSpdLocation, 
                        0
                    );
                    
                    spdShip.setScale(randomSize);
                    this.enemies.add(spdShip); 
                }
            },
            callbackScope: this,
            loop: true
        });

        // player-enemy collision
        this.physics.add.overlap(this.player, this.enemies, function(player, enemy) {
            if (!player.getData('isDead') &&
                !enemy.getData('isDead')) {
                    player.explode(false);
                    player.onDestroy();
                    enemy.explode(true);
                    energy += 10;
                    energyText.setText('Energy: ' + energy);
            }
        });

        // playerLaser-enemy collision
        this.physics.add.overlap(this.playerLasers, this.enemies, function(playerLaser, enemy) {
            if (enemy) {
                if (enemy.onDestroy !== undefined) {
                    enemy.onDestroy();
                }
                enemy.explode(true);
                playerLaser.destroy();
                energy += 10;
                energyText.setText('Energy: ' + energy);
                deadEnemyCount += 1;
            }
        });

        // player-laser collision
        this.physics.add.overlap(this.player, this.enemyLasers, function(player, laser) {
            if (!player.getData('isDead') &&
                !laser.getData('isDead')) {
                    player.explode(false);
                    player.onDestroy();
                    laser.destroy();
                    energy += 10;
                    energyText.setText('Energy: ' + energy);
            }
        });

        // turret-enemy collision
        this.physics.add.overlap(this.turrets, this.enemies, function(turret, enemy) {
            if (enemy) {
                if (enemy.onDestroy !== undefined) {
                    enemy.onDestroy();
                }
                enemy.explode(true);
                turret.destroy();
                deadEnemyCount += 1;
            }
        });

        // enemyLaser-turret collision
        this.physics.add.overlap(this.enemyLasers, this.turrets, function(enemyLaser, turret) {
            if (turret) {
                if (turret.onDestroy !== undefined) {
                    turret.onDestroy();
                }
                turret.explode(true);
                enemyLaser.destroy();
            }
        });

        // enemy-tower collision
        this.physics.add.overlap(this.enemies, this.towers, function(enemy, tower) {
            if (enemy) {
                if (enemy.onDestroy !== undefined) {
                    enemy.onDestroy();
                }
                enemy.explode(true);
                tower.destroy();
                towerCount -= 1;
            }
        });

        // tower-enemyLaser collision
        this.physics.add.overlap(this.enemyLasers, this.towers, function(enemyLaser, tower) {
            if (tower) {
                if (tower.onDestroy !== undefined) {
                    tower.onDestroy();
                }
                tower.explode(true);
                enemyLaser.destroy();
            }
        });

        this.axis = 0;
        this.axisIncrease = 0;

        //turns turret into a homingturret
        this.turretType = 0;
        this.turretUpgrade = 0;

        deadEnemyCount = 0;
    }

    getEnemiesByType(type) {
        var arr = [];
        for (var i = 0; i < this.enemies.getChildren().length; i++) {
            var enemy = this.enemies.getChildren()[i];
            if (enemy.getData('type') == type) {
                arr.push(enemy);
            }
        }
        return arr;
    }

    drawLines() {
        // top/enemy row
        var graphics = this.add.graphics();
        graphics.lineStyle(1, 0x85180f, 0.8);
        graphics.moveTo(0, 64);
        graphics.lineTo(this.game.config.width - 128, 64);
        graphics.strokePath();

        // player row
        graphics = this.add.graphics();
        graphics.lineStyle(1, 0x004a05, 0.8);
        graphics.moveTo(0, this.game.config.height - 128);
        graphics.lineTo(this.game.config.width - 128, this.game.config.height - 128);
        graphics.strokePath();

        // bottom row
        graphics = this.add.graphics();
        graphics.lineStyle(1, 0x000987, 0.8);
        graphics.moveTo(0, this.game.config.height - 64);
        graphics.lineTo(this.game.config.width - 128, this.game.config.height - 64);
        for (var i = 0; i < (this.game.config.width / 64) - 1; i++) {
            graphics.moveTo(i * 64, this.game.config.height);
            graphics.lineTo(i * 64, this.game.config.height - 64);
        }
        graphics.strokePath();

        // horizotal lines
        graphics = this.add.graphics();
        graphics.lineStyle(1, 0x333333, 0.8);
        for (var i = 3; i < (this.game.config.height / 64) - 1; i++) {
            graphics.moveTo(0, this.game.config.height - (i * 64));
            graphics.lineTo(this.game.config.width - 128, this.game.config.height - (i * 64));
        }
        // vertical lines
        for (var i = 1; i < (this.game.config.width / 64) - 1; i++) {
            graphics.moveTo(i * 64, this.game.config.height - 128);
            graphics.lineTo(i * 64, 64);
        }
        graphics.strokePath();

        // side menu line
        graphics = this.add.graphics();
        graphics.lineStyle(1, 0x82007e, 0.8);
        graphics.moveTo(this.game.config.width - 128, this.game.config.height);
        graphics.lineTo(this.game.config.width - 128, 0);
        graphics.moveTo(this.game.config.width - 128, 64);
        graphics.lineTo(this.game.config.width, 64);
        graphics.moveTo(this.game.config.width - 128, 128);
        graphics.lineTo(this.game.config.width, 128);
        graphics.moveTo(this.game.config.width - 128, this.game.config.height - 256);
        graphics.lineTo(this.game.config.width, this.game.config.height - 256);
        graphics.moveTo(this.game.config.width - 128, this.game.config.height - 64);
        graphics.lineTo(this.game.config.width, this.game.config.height - 64);
        graphics.strokePath();
    }

    upgradeTurret = () => {
        if (energy >= 10) {
            energy -= 10;
            energyText.setText('Energy: ' + energy);
            this.turretUpgrade = 1; 
            this.upgradeTurretText.setText('Turret\nLevel 2');
        }
    }

    upgradeTowers = () => {
        if (energy >= 10) {
            energy -= 10;
            energyText.setText('Energy: ' + energy);
        }
    }

    upgradeShip = () => {
        if (energy >= 10) {
            energy -= 10;
            energyText.setText('Energy: ' + energy);            
            this.turretType = 1;
            this.upgradeShipText.setText('Ship\nLevel 2'); 
        }      
    }

    placeTurret = (pointer) => {
        var i = Math.floor(pointer.y / 64);
        var j = Math.floor(pointer.x / 64);
        if (this.canPlaceTurret(i, j)) {
            if (energy > 20) {              
                var turret = this.turrets.get();
                if (turret) {
                    turret.setActive(true);
                    turret.setVisible(true);
                    turret.place(i, j);                       
                    energy -= 20;
                    energyText.setText('Energy: ' + energy);                      
                }
            }
        }
    }

    canPlaceTurret(i, j) {
        return map[i][j] === 0;
    }

    update() {
        // while player is still alive
        if (!this.player.getData('isDead')) {
            this.player.update();
            if (this.keyA.isDown) {
                this.player.moveLeft();
            }
            else if (this.keyD.isDown) {
                this.player.moveRight();
            }
        
            if (this.keyW.isDown) {
                this.player.setData("isShooting", true);
            }
            else {
                this.player.setData("timerShootTick", this.player.getData("timerShootDelay") - 1);
                this.player.setData("isShooting", false);
            }
        }

        for (var i = 0; i < this.turrets.getChildren().length; i++) {
            var turret1 = this.turrets.getChildren()[i];
            turret1.setData('isShooting', true);                    
            turret1.update();
        }

        for (var i = 0; i < this.enemies.getChildren().length; i++) {
            var enemy = this.enemies.getChildren()[i];
            
            enemy.update();
            
            if (enemy.x < -enemy.displayWidth || 
                enemy.x > this.game.config.width + enemy.displayWidth ||
                enemy.y < -enemy.displayHeight * 4 ||
                enemy.y > this.game.config.height + enemy.displayHeight) {
                if (enemy) {
                    if (enemy.onDestroy !== undefined) {
                        enemy.onDestroy();
                    }
                    enemy.destroy();
                }
            }
        }

        for (var i = 0; i < this.enemyLasers.getChildren().length; i++) {
            var laser = this.enemyLasers.getChildren()[i];

            laser.update();

            if (laser.x < -laser.displayWidth ||
                laser.x > this.game.config.width + laser.displayWidth ||
                laser.y < -laser.displayHeight * 4 ||
                laser.y > this.game.config.height + laser.displayHeight) {
                if (laser) {
                    laser.destroy();
                }
            }
        }

        for (var i = 0; i < this.playerLasers.getChildren().length; i++) {
            var laser = this.playerLasers.getChildren()[i];

            laser.update();

            if (laser.x < -laser.displayWidth ||
                laser.x > this.game.config.width + laser.displayWidth ||
                laser.y < -laser.displayHeight * 4 ||
                laser.y > this.game.config.height + laser.displayHeight) {
                if (laser) {
                    laser.destroy();
                }
            }
        }

        // advance to next level
        if (deadEnemyCount >= 20) {      
            deadEnemyCount = 0;            
            this.scene.start('Level1Trans');
        }

        // lose if all towers destroyed
        if (towerCount <= 7) {            
            this.scene.start('SceneGameOver');
        }
    }
}