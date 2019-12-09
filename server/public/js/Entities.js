/*  Author: Patrick Dicks
*   Title: Defenders
*   License: MIT
*   Entities.js
*/

class Entity extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, key, type) {
        super(scene, x, y, key);
        this.scene = scene;
        this.scene.add.existing(this);
        this.scene.physics.world.enableBody(this, 0);
        this.setData('type', type);
        this.setData('isDead', false);
    }

    explode(canDestroy) {
        if (!this.getData('isDead')) {
            this.setTexture('sprExplosion');
            this.play('sprExplosion');
            this.scene.sfx.explosions[Phaser.Math.Between(0, this.scene.sfx.explosions.length - 1)].play();
            if (this.shootTimer !== undefined) {
                if (this.shootTimer) {
                    this.shootTimer.remove(false);
                }
            }
            this.setAngle(0);
            this.body.setVelocity(0, 0);
            this.on('animationcomplete', function() {
                if (canDestroy) {
                    this.destroy();
                }
                else {
                    this.setVisible(false);
                }
            }, this);
            this.setData('isDead', true);
        }
    }
}

class Player extends Entity {
    constructor(scene, x, y, key) {
        super(scene, x, y, key, 'Player');
        this.setData('speed', 200);
        this.setData('isShooting', false);
        this.setData('timerShootDelay', 10);
        this.setData('timerShootTick', this.getData('timerShootDelay') - 1);
    }

    // player movement
    moveLeft() {
        this.body.velocity.x = -this.getData('speed');
    }
    moveRight() {
        this.body.velocity.x = this.getData('speed');
    }

    onDestroy() {
        this.scene.time.addEvent({
            delay: 1000,
            callback: function() {
                this.scene.scene.start('SceneGameOver');
            },
            callbackScope: this,
            loop: false
        });
    }

    update() {
        this.body.setVelocity(0, 0);
        this.x = Phaser.Math.Clamp(this.x, 0, this.scene.game.config.width);

        if (this.getData('isShooting')) {
            if (this.getData('timerShootTick') < this.getData('timerShootDelay')) {
                this.setData('timerShootTick', this.getData('timerShootTick') + 1);
            }
            else {
                var laser = new PlayerLaser(this.scene, this.x, this.y);
                this.scene.playerLasers.add(laser);
                this.scene.sfx.laser.play();
                this.setData('timerShootTick', 0);
            }
        }
    }
}

class PlayerLaser extends Entity {
    constructor(scene, x, y) {
        super(scene, x, y, 'sprLaserPlayer');
        this.body.velocity.y = -200;
    }
}

class HomingLaser extends Entity {
    constructor(scene, x, y) {
        super(scene, x, y, 'sprLaserTurret');
        this.body.velocity.y = -200;
        
        this.states = {
            MOVE_DOWN: 'MOVE_DOWN',
            CHASE: 'CHASE'
        };
        this.state = this.states.MOVE_DOWN;        
    }
    
    update() {
        if (!this.getData('isDead') && this.scene.player) {
            if (this.scene.enemies.getChildren().length > 1) {            
                var target = this.scene.enemies.getChildren()[0];
                var closest = 10000;

                for (var i = 0; i < this.scene.enemies.getChildren().length; i++) {    
                    if (Phaser.Math.Distance.Between(this.x, this.y, this.scene.enemies.getChildren()[i].x, this.scene.enemies.getChildren()[i].y) < closest) {
                        target = this.scene.enemies.getChildren()[i];
                        closest = Phaser.Math.Distance.Between(this.x, this.y, this.scene.enemies.getChildren()[i].x, this.scene.enemies.getChildren()[i].y);
                    }
                }
            }

            if (this.scene.enemies.getChildren().length > 1) {
                var randomNum = Phaser.Math.Between(0, (this.scene.enemies.getChildren().length)-1);
                var enemy = target;
                this.state = this.states.CHASE;
            
                if (this.state == this.states.CHASE) {
                    var dx = enemy.x - this.x;
                    var dy = enemy.y - this.y;

                    var angle = Math.atan2(dy, dx);

                    var speed = 200;
                    this.body.setVelocity(
                        Math.cos(angle) * speed,
                        Math.sin(angle) * speed
                    );

                    if (this.x < enemy.x) {
                        this.angle -= 5;
                    }
                    else {
                        this.angle += 5;
                    } 
                }
                if (enemy.getData('isDead')) {
                    this.destroy();
                }           
            }
        }  
    }
}

class EnemyLaser extends Entity {
    constructor(scene, x, y) {
        super(scene, x, y, 'sprLaserEnemy0');
        this.body.velocity.y = 200;
    }
}

class BasicShip extends Entity {
    constructor(scene, x, y) {
        super(scene, x, y, 'sprEnemy2', 'BasicShip');
        this.play('sprEnemy2');
        this.body.velocity.y = 100;
    }
}

class SpeederShip extends Entity {
    constructor(scene, x, y) {
        super(scene, x, y, 'sprEnemy1', 'SpeederShip');
        this.play('sprEnemy1');
        this.body.velocity.y = 200;
    }
}

class GunnerShip extends Entity {
    constructor(scene, x, y) {
        super(scene, x, y, 'sprEnemy0', 'GunnerShip');
        this.play('sprEnemy0');
        this.body.velocity.y = 75;

        this.shootTimer = this.scene.time.addEvent({
            delay: 1000,
            callback: function() {
                var laser = new EnemyLaser(
                    this.scene,
                    this.x,
                    this.y
                );
                laser.setScale(this.scaleX);
                this.scene.enemyLasers.add(laser);
            },
            callbackScope: this,
            loop: true
        });
    }

    onDestroy() {
        if (this.shootTimer !== undefined) {
            if (this.shootTimer) {
                this.shootTimer.remove(false);
            }
        }
    }
}

class Turret1 extends Entity {
    constructor(scene, x, y) {
        super(scene, x, y, 'probe1', 'Turret');
        this.setData('isShooting', false);
        this.setData('timerShootDelay', 30);
        this.setData('timerShootTick', this.getData('timerShootDelay') - 1);
    }

    place(i, j) {
        this.y = i * 64 + 64/2;
        this.x = j * 64 + 64/2;
        map[i][j] = 1;
    }

    onDestroy() {
        this.setData('isShooting', false);
    }    
    
    update() {
        this.body.setVelocity(0, 0);
        this.x = Phaser.Math.Clamp(this.x, 0, this.scene.game.config.width);

        if (this.getData('isShooting')) {
            if (this.getData('timerShootTick') < this.getData('timerShootDelay')) {
                this.setData('timerShootTick', this.getData('timerShootTick') + 1);
            }
            else {
                if (this.scene.turretUpgrade == 0) {
                    var rotateleft = -50;
                    var rotateright = 50;
                    var laser = new PlayerLaser(this.scene, this.x, this.y);
                    this.scene.playerLasers.add(laser);
                    
                    if (this.scene.axis ==0) {
                        this.scene.axisIncrease += 10;
                        
                        if (this.scene.axisIncrease == 30) {
                            this.scene.axis = 1;
                        }
                    }
                    else {
                        this.scene.axisIncrease -= 10;
                        
                        if (this.scene.axisIncrease == -30) {
                            this.scene.axis = 0;
                        }
                    } 
    
                    laser.body.velocity.x = this.scene.axisIncrease;
                    this.scene.sfx.laser.play();
                    this.setData('timerShootTick', 0);
                }
                if (this.scene.turretUpgrade == 1) {
                    var laser = new PlayerLaser(this.scene, this.x, this.y);
                    var laser2 = new PlayerLaser(this.scene, this.x, this.y);  
                    var laser3 = new PlayerLaser(this.scene, this.x, this.y);                      
                    this.scene.playerLasers.add(laser);  
                    this.scene.playerLasers.add(laser2);   
                    this.scene.playerLasers.add(laser3);                      
                    laser.body.velocity.x = -30;
                    laser2.body.velocity.x = 0;    
                    laser3.body.velocity.x = 30;                     
                    
                    this.scene.sfx.laser.play();
                    this.setData('timerShootTick', 0);                        
                }
            }
        }
    }
}

class Turret2 extends Entity {
    constructor(scene, x, y) {
        super(scene, x, y, 'probe2', 'Turret');
        this.setData('isShooting', false);
        this.setData('timerShootDelay', 10);
        this.setData('timerShootTick', this.getData('timerShootDelay') - 1);
    }

    place(i, j) {
        this.y = i * 64 + 64/2;
        this.x = j * 64 + 64/2;
        map[i][j] = 1;
    }

    onDestroy() {
        this.setData('isShooting', false);
    }    
    
    update() {
        this.body.setVelocity(0, 0);
        this.x = Phaser.Math.Clamp(this.x, 0, this.scene.game.config.width);

        if (this.getData('isShooting')) {
            if (this.getData('timerShootTick') < this.getData('timerShootDelay')) {
                this.setData('timerShootTick', this.getData('timerShootTick') + 1);
            }
            else {
                if (this.scene.turretUpgrade == 0) {
                    var rotateleft = -30;
                    var rotateright = 30;
                    var laser = new PlayerLaser(this.scene, this.x, this.y);
                    this.scene.playerLasers.add(laser);
                    
                    if (this.scene.axis ==0) {
                        this.scene.axisIncrease += 10;
                        
                        if (this.scene.axisIncrease == 30) {
                            this.scene.axis = 1;
                        }
                    }
                    else {
                        this.scene.axisIncrease -= 10;
                        
                        if (this.scene.axisIncrease == -30) {
                            this.scene.axis = 0;
                        }
                    } 
    
                    laser.body.velocity.x = this.scene.axisIncrease;
                    this.scene.sfx.laser.play();
                    this.setData('timerShootTick', 0);
                }
                if (this.scene.turretUpgrade == 1) {
                    var laser = new PlayerLaser(this.scene, this.x, this.y);
                    var laser2 = new PlayerLaser(this.scene, this.x, this.y);  
                    var laser3 = new PlayerLaser(this.scene, this.x, this.y);                      
                    this.scene.playerLasers.add(laser);  
                    this.scene.playerLasers.add(laser2);   
                    this.scene.playerLasers.add(laser3);                      
                    laser.body.velocity.x = -30;
                    laser2.body.velocity.x = 0;    
                    laser3.body.velocity.x = 30;                   
                    
                    this.scene.sfx.laser.play();
                    this.setData('timerShootTick', 0);                        
                }
            }
        }
    }
}

class Turret3 extends Entity {
    constructor(scene, x, y) {
        super(scene, x, y, 'probe3', 'Turret');
        this.setData('isShooting', false);
        this.setData('timerShootDelay', 10);
        this.setData('timerShootTick', this.getData('timerShootDelay') - 1);
    }

    place(i, j) {
        this.y = i * 64 + 64/2;
        this.x = j * 64 + 64/2;
        map[i][j] = 1;
    }

    onDestroy() {
        this.setData('isShooting', false);
    }    
    
    update() {
        this.body.setVelocity(0, 0);
        this.x = Phaser.Math.Clamp(this.x, 0, this.scene.game.config.width);

        if (this.getData('isShooting')) {
            if (this.getData('timerShootTick') < this.getData('timerShootDelay')) {
                this.setData('timerShootTick', this.getData('timerShootTick') + 1);
            }
            else {
                if (this.scene.turretUpgrade == 0) {
                    var rotateleft = -30;
                    var rotateright = 30;
                    var laser = new PlayerLaser(this.scene, this.x, this.y);
                    this.scene.playerLasers.add(laser);
                    
                    if (this.scene.axis ==0) {
                        this.scene.axisIncrease += 10;
                        
                        if (this.scene.axisIncrease == 30) {
                            this.scene.axis = 1;
                        }
                    }
                    else {
                        this.scene.axisIncrease -= 10;
                        
                        if (this.scene.axisIncrease == -30) {
                            this.scene.axis = 0;
                        }
                    } 
    
                    laser.body.velocity.x = this.scene.axisIncrease;
                    this.scene.sfx.laser.play();
                    this.setData('timerShootTick', 0);
                }
                if (this.scene.turretUpgrade == 1) {
                    var laser = new PlayerLaser(this.scene, this.x, this.y);
                    var laser2 = new PlayerLaser(this.scene, this.x, this.y);  
                    var laser3 = new PlayerLaser(this.scene, this.x, this.y);                      
                    this.scene.playerLasers.add(laser);  
                    this.scene.playerLasers.add(laser2);   
                    this.scene.playerLasers.add(laser3);                      
                    laser.body.velocity.x = -30;
                    laser2.body.velocity.x = 0;    
                    laser3.body.velocity.x = 30;                     
                    
                    this.scene.sfx.laser.play();
                    this.setData('timerShootTick', 0);                        
                }
            }
        }
    }
}

class Tower extends Entity {
    constructor(scene, x, y, key) {
        super(scene, x, y, key, 'Tower');
    }
}

class ChaserShip extends Entity {
    constructor(scene, x, y) {
        super(scene, x, y, 'sprEnemy1', 'ChaserShip');
        this.body.velocity.y = Phaser.Math.Between(50, 100);

        this.states = {
            MOVE_DOWN: 'MOVE_DOWN',
            CHASE: 'CHASE'
        };
        this.state = this.states.MOVE_DOWN; 
    }

    update() {
        if (!this.getData('isDead') && this.scene.player) { 
            var target = this.scene.player;
            var closest = 10000;
        
            if (this.scene.towers.getChildren().length > 1) {
                for (var i = 0; i < this.scene.towers.getChildren().length; i++) {    
                    if (Phaser.Math.Distance.Between(this.x, this.y, this.scene.towers.getChildren()[i].x, this.scene.towers.getChildren()[i].y) < closest) {
                        target = this.scene.towers.getChildren()[i];
                        closest = Phaser.Math.Distance.Between(this.x, this.y, this.scene.towers.getChildren()[i].x, this.scene.towers.getChildren()[i].y);
                    }
                }
            }
        
            if (Phaser.Math.Distance.Between(
                this.x,
                this.y,
                target.x,
                target.y
            ) < 1000) {
                this.state = this.states.CHASE;
            }

            if (this.state == this.states.CHASE) {
                var dx = target.x - this.x;
                var dy = target.y - this.y;

                var angle = Math.atan2(dy, dx);
                var speed = 0;                
                if (this.scene.lvl == 1) {
                    speed = 150;
                }
                if (this.scene.lvl == 2) {
                    speed = 200;
                }
                if (this.scene.lvl == 3) {
                    speed = 300;
                }
                this.body.setVelocity(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed
                );

                if (this.x < target.x) {
                    this.angle -= 5;
                }
                else {
                    this.angle += 5;
                } 
            }
        }
    }
}