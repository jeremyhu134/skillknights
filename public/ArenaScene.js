const socket = io();


class MatchScene extends Phaser.Scene {
    constructor() {
		super({ key: 'MatchScene' });
	}
    preload(){
        
    }
    create(){
        var scene = this;
        this.add.sprite(0,0,'menu-background').setOrigin(0,0); //Image by freepik

        this.anims.create({
            key: 'match-searching-animate',
            frames: this.anims.generateFrameNumbers('match-searching', { start: 0, end: 3 }),
            frameRate: 2,
            repeat: -1
        });

        var searching = this.add.sprite(300,95,"match-searching").setOrigin(0,0);
        searching.anims.play("match-searching-animate",true);

        this.add.sprite(80,80,'avatar1').setOrigin(0,0); 
        var enemy_avatar = this.add.sprite(1020,80,'avatar0').setOrigin(0,0); 
        enemy_avatar.flipX = true;

        socket.emit("searchForMatch");

        socket.on("matchFound",()=>{
            searching.destroy();
            scene.add.sprite(400,95,"match-found").setOrigin(0,0);
        });

        socket.on("startMatch",(pos)=>{
            gameState.playerStats.position = pos;
            scene.scene.start("ArenaScene");
        })
    }
    update(){

    }
}

class ArenaScene extends Phaser.Scene {
    constructor() {
		super({ key: 'ArenaScene' });
	}
    preload(){
        
    }
    create(){
        var scene = this;
       
        gameState.input = this.input;
        gameState.mouse = this.input.mousePointer;
        gameState.cursors = this.input.keyboard.createCursorKeys();
        gameState.keys = this.input.keyboard.addKeys('W,S,A,D,R,SPACE,SHIFT,ONE,TWO,THREE,FOUR,FIVE,SIX,SEVEN,EIGHT,ESC,RIGHT,LEFT');
        
        this.physics.world.setBounds(0, -200, 1200, 850);
        
        gameState.platforms = this.physics.add.staticGroup();
        
        this.add.sprite(0,0,'battlefield-background').setOrigin(0,0); //Image by freepik
        
        this.add.sprite(0,60,"nametag-background").setOrigin(0,0).setAlpha(0.7);

        var enemytag = this.add.sprite(800,60,"nametag-background").setOrigin(0,0).setAlpha(0.7);
        enemytag.flipX = true;
        
        gameState.ground = this.physics.add.staticSprite(0,630,'platform2').setOrigin(0,0).refreshBody();//ground
        
        gameState.platforms.create(150,425,'platform1').setOrigin(0,0).refreshBody();
        gameState.platforms.create(500,250,'platform1').setOrigin(0,0).refreshBody();
        gameState.platforms.create(850,425,'platform1').setOrigin(0,0).refreshBody();
        
        
        
        
        gameState.player = this.physics.add.sprite(-100, -100,'default_knight').setDepth(1);
        if(gameState.playerStats.position == "player1"){
            gameState.player.x = 180;
            gameState.player.y = 200;
        }else{
            gameState.player.x = 850;
            gameState.player.y = 200;
        }

        gameState.createPlayerHealthBar(scene,0,0,gameState.player,100);
        
        
        gameState.player.setScale(0.5);
        
        gameState.player.body.setSize(80, 255);
        gameState.player.body.setOffset(140,50);
        
        
        gameState.player.setOrigin(0,0);
        
        gameState.player.setCollideWorldBounds(true);
        
        // Detect if the device is mobile
        if (this.sys.game.device.os.android || this.sys.game.device.os.iOS || this.sys.game.device.os.windowsPhone) {
            gameState.upButton = this.add.sprite(150,420,"arena-mobilebutton").setOrigin(0,0).setScale(1.5).setInteractive();
            gameState.upButton.setAlpha(0.5);
            gameState.upButton.on('pointerover', function () {
                gameState.movingDown = false;
                gameState.movingUp = true;
            });
            gameState.upButton.on('pointerout', function () {
                gameState.movingUp = false;
            });

            gameState.downButton = this.add.sprite(150,530,"arena-mobilebutton").setOrigin(0,0).setScale(1.5).setInteractive();
            gameState.downButton.setAlpha(0.5);
            gameState.downButton.flipY = true;
            gameState.downButton.on('pointerover', function () {
                gameState.movingUp = false;
                gameState.movingDown = true;
            });
            gameState.downButton.on('pointerout', function () {
                gameState.movingDown = false;
            });

            gameState.rightButton = this.add.sprite(220,550,"arena-mobilebutton").setOrigin(0,0).setScale(1.5).setInteractive();
            gameState.rightButton.setAlpha(0.5);
            gameState.rightButton.flipY = true;
            gameState.rightButton.angle -= 90;
            gameState.rightButton.on('pointerover', function () {
                gameState.movingLeft = false;
                gameState.movingRight = true;
            });
            gameState.rightButton.on('pointerout', function () {
                gameState.movingRight = false;
            });

            gameState.leftButton = this.add.sprite(150,480,"arena-mobilebutton").setOrigin(0,0).setScale(1.5).setInteractive();
            gameState.leftButton.setAlpha(0.5);
            gameState.leftButton.flipY = true;
            gameState.leftButton.angle += 90;
            gameState.leftButton.on('pointerover', function () {
                gameState.movingRight = false;
                gameState.movingLeft = true;
            });
            gameState.leftButton.on('pointerout', function () {
                gameState.movingLeft = false;
            });
        } 

        



        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('default_knight', { start: 0, end: 0 }),
            frameRate: 1
        });
        
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('default_knight', { start: 1, end: 6 }),
            frameRate: 10,
            repeat: -1
        });
        
        this.anims.create({
            key: 'jump',
            frames: this.anims.generateFrameNumbers('default_knight', { start: 8, end: 8 }),
            frameRate: 6,
        });
        
        this.anims.create({
            key: 'attack',
            frames: this.anims.generateFrameNumbers('default_knight', { start: 9, end: 11 }),
            frameRate: 15,
        });
        
        function checkPlatformOverlap(player, platform) {
            // Check if the player is above the platform and falling down
            if (player.body.velocity.y > 0 && (player.y+player.getBounds().height-8) < platform.y && !gameState.keys.S.isDown) {
                scene.physics.world.collide(player, platform);
            }
        }
        this.physics.add.collider(gameState.player,gameState.ground);
        gameState.platformCollider = this.physics.add.overlap(gameState.player, gameState.platforms, checkPlatformOverlap, null, this);
        
        
        
        this.input.on('pointerdown', (pointer)=>{
            if(gameState.playerStats.attackReady == true){
                
                gameState.playerStats.attackAnimation = true;
                gameState.playerStats.attackReady = false;
                gameState.player.anims.play('attack',true);
                socket.emit("updateAnim","attack");
                
                
                var bullet = scene.physics.add.sprite(gameState.player.x+100,gameState.player.y+70, "40x40");
                gameState.bulletCondition(scene, bullet, socket);
                
                
                
                scene.time.addEvent({
                    delay: 500,
                    callback: ()=>{
                        gameState.playerStats.attackReady = true;
                    },
                    callbackScope: this
                });
                scene.time.addEvent({
                    delay: 100,
                    callback: ()=>{
                        gameState.playerStats.attackAnimation = false;
                    },
                    callbackScope: this
                });
                
            }
        }, this);
        

        gameState.createPlayer(scene,800,200);
        if(gameState.initialized == false){
            socket.on("updateMovement",(x,y)=>{
                gameState.player2.x = Number(x);
                gameState.player2.y = Number(y);
            });
    
            socket.on("updateAnim",(anim,flip)=>{
                if(anim=="flip"){
                    gameState.player2.flipX = (flip=="true");
                }else{
                    gameState.player2.anims.play(`${anim}`,true);
                }
            });
    
            socket.on("takeDamage",(dmg)=>{
                gameState.playerStats.health -= Number(dmg);
                console.log(dmg);
            });
    
    
            socket.on("endMatch",()=>{
                gameState.playerStats.resetStats();
                scene.scene.start("MenuScene");
            });
            gameState.initialized = true;

            socket.on("death",()=>{
                gameState.player2.health = 100;
                gameState.player2.visible = false;
                gameState.player2.lives --;
                gameState.spriteDeath(scene, socket,gameState.player2);
            });

            socket.on("matchLost",()=>{
                scene.time.addEvent({
                    delay: 3000,
                    callback: ()=>{
                        gameState.playerStats.resetStats();
                        scene.scene.start("MenuScene");
                    },
                    callbackScope: scene
                });
            });

            gameState.initialized = true;
        }
    }
    update(){
        socket.emit("updateMovement",gameState.player.x,gameState.player.y);
        if(gameState.keys.D.isDown || gameState.movingRight){
            gameState.player.setVelocityX(500);
            gameState.player.flipX = false;
            socket.emit("updateAnim","flip","false");
            gameState.player.body.setOffset(140,50);
            
        }else if (gameState.keys.A.isDown || gameState.movingLeft){
            gameState.player.setVelocityX(-500);
            gameState.player.flipX = true;
            socket.emit("updateAnim","flip","true");
            gameState.player.body.setOffset(190,50);
            
        }else{
            gameState.player.setVelocityX(0);
        }
        
        if(gameState.keys.W.isDown && gameState.player.body.touching.down && gameState.player.body.velocity.y == 0 || gameState.movingUp && gameState.player.body.touching.down && gameState.player.body.velocity.y == 0){
            gameState.player.body.velocity.y = -800;
        }
        if(gameState.keys.S.isDown || gameState.movingDown){
            gameState.player.body.velocity.y += 50;
        }
        
        if(gameState.playerStats.health <= 0){
            gameState.playerStats.respawn();
            gameState.spriteDeath(this, socket, gameState.player,"you");
            gameState.playerStats.lives --;
            socket.emit("death");
        }
        
        if(gameState.playerStats.attackAnimation == false){
            if(!gameState.player.body.touching.down){
            gameState.player.anims.play('jump',true);
            socket.emit("updateAnim","jump");
            }else{
                if(gameState.player.body.velocity.x != 0){
                    gameState.player.anims.play('walk',true);
                    socket.emit("updateAnim","walk");
                }else{
                    gameState.player.anims.play('idle',true);
                    socket.emit("updateAnim","idle");
                }
            }
        }
    }
}
