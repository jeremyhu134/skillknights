

//The configuration of your game that is a parameter of the Phaser.Game function
const config = {
    type: Phaser.AUTO,
    width : 1200,
    height: 650,
    backgroundColor: "#999999",
    audio: {
        disableWebAudio: false 
      },
    //allows modification of the games physics
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1200 },
            enableBody: true,
            debug: false
        }
    },
    //subclass scenes 
    scene:[MenuScene,MatchScene,ArenaScene],
    //phasers scale system to fit into the brower
    scale: {
        zoom: 1,
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

//creats a game game object with the configuration
const game = new Phaser.Game(config);

//create a block-scoped object that stores variables that can be accessed in any scene
let gameState = {
    initialized : false,

    playerStats :{
        attackReady: true,
        attackAnimation: false,
        health: 100,
        position: "",
        name: "Player 1",
        rating: 0,
        resetStats: function(){
            gameState.playerStats.health = 100;
            gameState.playerStats.attackReady = true;
            gameState.playerStats.attackAnimation = false;
        }
    },
    
    bulletCondition: function (scene, bullet, socket) {
        if(gameState.player.flipX == true){
            bullet.body.velocity.x = gameState.player.body.velocity.x + -900;
        }else{
            bullet.body.velocity.x = gameState.player.body.velocity.x + 900;
        }
        bullet.body.velocity.y = gameState.player.body.velocity.y;
        var timer = scene.time.addEvent({
            delay: 100,
            callback: ()=>{
                bullet.destroy();
                overlap.destroy();
            },
            callbackScope: this
        });
        var overlap = scene.physics.add.overlap(bullet, gameState.player2, (bullet,player)=>{
            bullet.destroy();
            var dmg = 0;
            if(gameState.player.body.velocity.x != 0 && gameState.player.body.velocity.y != 0){
                dmg = 20;
            }else if (gameState.player.body.velocity.x != 0){
                dmg = 15;
            }else{
                dmg = 10;
            }
            socket.emit("damageDealt",dmg);
            gameState.player2.health -= dmg;
            overlap.destroy();
            timer.destroy();
        }, null, this);
    },

    createPlayer: function(scene,x,y){
        gameState.player2 = scene.physics.add.sprite(x, y,'default_knight');
        
        
        gameState.player2.setScale(0.5);
        
        gameState.player2.body.setSize(80, 255);
        gameState.player2.body.setOffset(140,50);

        gameState.player2.setTint(0xff0000);
        
        gameState.player2.setOrigin(0,0);
        
        gameState.player2.setCollideWorldBounds(true);
        gameState.player2.body.setGravityY(-scene.physics.world.gravity.y);
       
        gameState.player2.health = 100;

        gameState.createPlayer2HealthBar(scene,1200,0,gameState.player2,100);
    },

    createPlayerHealthBar: function(scene, x,y,object,maxHP){
        var hbBG = scene.add.rectangle(x,y, 460,60,0x000000).setOrigin(0,0);
        var hb = scene.add.rectangle(x,y,450,50,0xFFFF00).setOrigin(0,0);
        var hbInstant = scene.add.rectangle(x,y,500,50,0x8B0000).setOrigin(0,0);
        var checkHealth = scene.time.addEvent({
            delay: 1,
            callback: ()=>{
                /*if(object.health > 0){
                    
                    
                } else {
                    hbBG.destroy();
                    hb.destroy();
                    checkHealth.destroy();
                }*/
                if(hb.width > hbInstant.width){
                    hb.width -= 3;
                }
                hbInstant.width = gameState.playerStats.health/maxHP*450;
            },  
            startAt: 0,
            timeScale: 1,
            repeat: -1
        });
    },

    createPlayer2HealthBar: function(scene, x,y,object,maxHP){
        var hbBG = scene.add.rectangle(x,y, -460,60,0x000000).setOrigin(0,0);
        var hb = scene.add.rectangle(x,y,-450,50,0xFFFF00).setOrigin(0,0);
        var hbInstant = scene.add.rectangle(x,y,500,50,0x8B0000).setOrigin(0,0);
        var checkHealth = scene.time.addEvent({
            delay: 1,
            callback: ()=>{
                /*if(object.health > 0){
                    
                    
                } else {
                    hbBG.destroy();
                    hb.destroy();
                    checkHealth.destroy();
                }*/
                if(hb.width < hbInstant.width){
                    hb.width += 3;
                }
                hbInstant.width = -(gameState.player2.health/maxHP*450);
            },  
            startAt: 0,
            timeScale: 1,
            repeat: -1
        });
    },
};