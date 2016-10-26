

var can = document.getElementById("canvas");
var c = can.getContext('2d');

player.width = 46;
player.height = 46;

var ship_image;

loadResources();

function loadResources() {
    ship_image = new Image();
    ship_image.src = "images/hunter1.png";
}

function mainLoop() {
    var c = can.getContext('2d');

    updateGame();
    updateBackground();
    updateEnemies();
    updatePlayer();

    updatePlayerBullets();
    updateEnemyBullets();

    checkCollisions();

    drawBackground(c);
    drawEnemies(c);
    drawPlayer(c);
    drawEnemyBullets(c);
    drawPlayerBullets(c);
    drawOverlay(c);
}


// =========== player ============

function firePlayerBullet() {
    //create a new bullet
    playerBullets.push({
        x: player.x,
        y: player.y - 5,
        width:10,
        height:10,
    });
}

function drawPlayer(c) {
    if(player.state == "dead") return;

    if(player.state == "hit") {
        c.fillStyle = "yellow";
        c.fillRect(player.x,player.y, player.width, player.height);
        return;
    }
    c.drawImage(ship_image,
        25,1, 23,23, //src coords
        player.x, player.y, player.width, player.height //dst coords
    );
}

function drawPlayerBullets(c) {
    c.fillStyle = "blue";
    for(i in playerBullets) {
        var bullet = playerBullets[i];
        c.fillRect(bullet.x, bullet.y, bullet.width,bullet.height);
    }
}


// =========== background ============

function drawBackground(c) {
    c.fillStyle = "black";
    c.fillRect(0,0,can.width,can.height);
}



// =========== enemies ===============

function drawEnemies(c) {
    for(var i in enemies) {
        var enemy = enemies[i];
        if(enemy.state == "alive") {
            c.fillStyle = "green";
            c.fillRect(enemy.x,enemy.y,enemy.width,enemy.height);
        }
        if(enemy.state == "hit") {
            c.fillStyle = "purple";
            c.fillRect(enemy.x,enemy.y,enemy.width,enemy.height);
        }
        //this probably won't ever be called.
        if(enemy.state == "dead") {
            c.fillStyle = "black";
            c.fillRect(enemy.x,enemy.y,enemy.width,enemy.height);
        }
    }
}

function createEnemyBullet(enemy) {
    return {
        x:enemy.x,
        y:enemy.y+enemy.height,
        width:4,
        height:12,
        counter:0,
    }
}

function drawEnemyBullets(c) {
    for(var i in enemyBullets) {
        var bullet = enemyBullets[i];
        c.fillStyle = "yellow";
        c.fillRect(bullet.x, bullet.y , bullet.width, bullet.height);
    }
}





// =========== overlay ===============

function drawOverlay(c) {
    if(game.state == "over") {
        c.fillStyle = "white";
        c.font = "Bold 40pt Arial";
        c.fillText("GAME OVER",140,200);
        c.font = "14pt Arial";
        c.fillText("press space to play again", 190,250);
    }
    if(game.state == "won") {
        c.fillStyle = "white";
        c.font = "Bold 40pt Arial";
        c.fillText("SWARM DEFEATED",50,200);
        c.font = "14pt Arial";
        c.fillText("press space to play again", 190,250);
    }
}

doSetup();
setInterval(mainLoop,1000/30);














var game = {
    state: "start",
};

var overlay = {
    counter: -1,
    title: "foo",
    subtitle: "bar",
};

var player = {
    x:100,
    y:350,
    width: 20,
    height: 50,
    counter: 0,
};
var keyboard = { };

var playerBullets = [];
var enemies = [];
var enemyBullets = [];

// =========== game   ============
function updateGame() {
    if(game.state == "playing" && enemies.length == 0) {
        game.state = "won";
        overlay.title = "SWARM DEAD";
        overlay.subtitle = "press space to play again";
        overlay.counter = 0;
    }
    if(game.state == "over" && keyboard[32]) {
        game.state = "start";
        player.state = "alive";
        overlay.counter = -1;
    }
    if(game.state == "won" && keyboard[32]) {
        game.state = "start";
        player.state = "alive";
        overlay.counter = -1;
    }

    if(overlay.counter >= 0) {
        overlay.counter++;
    }

}
function updatePlayer() {
    if(player.state == "dead") return;

    //left arrow
    if(keyboard[37])  {
        player.x -= 10;
        if(player.x < 0) player.x = 0;
    }
    //right arrow
    if(keyboard[39]) {
        player.x += 10;
        var right = canvas.width - player.width;
        if(player.x > right) player.x = right;
    }

    //space bar
    if(keyboard[32]) {
        if(!keyboard.fired) {
            firePlayerBullet();
            keyboard.fired = true;
        }
    } else {
        keyboard.fired = false;
    }

    if(player.state == "hit") {
        player.counter++;
        if(player.counter >= 40) {
            player.counter = 0;
            player.state = "dead";
            game.state = "over";
            overlay.title = "GAME OVER";
            overlay.subtitle = "press space to play again";
            overlay.counter = 0;
        }
    }
}


function updatePlayerBullets() {
    //move each bullet
    for(i in playerBullets) {
        var bullet = playerBullets[i];
        bullet.y -= 8;
        bullet.counter++;
    }
    //remove the ones that are off the screen
    playerBullets = playerBullets.filter(function(bullet){
        return bullet.y > 0;
    });
}

function updateBackground() {
}

// ============== Enemy =============
function updateEnemies() {

    //create 10 new enemies the first time through
    if(game.state == "start") {
        enemies = [];
        enemyBullets = [];
        for(var i=0; i<10; i++) {
            enemies.push({
                x: 50+ i*50,
                y: 10,
                width: 40,
                height: 40,
                state: "alive", // the starting state of enemies
                counter: 0, // a counter to use when calculating effects in each state
                phase: Math.floor(Math.random()*50), //make the enemies not be identical
                shrink: 20,
            });
        }
        game.state = "playing";
    }


    //for each enemy
    for(var i=0; i<10; i++) {
        var enemy = enemies[i];
        if(!enemy) continue;

        //float back and forth when alive
        if(enemy && enemy.state == "alive") {
            enemy.counter++;
            enemy.x += Math.sin(enemy.counter*Math.PI*2/100)*2;
            //fire a bullet every 50 ticks
            //use 'phase' so they don't all fire at the same time
            if((enemy.counter + enemy.phase) % 200 == 0) {
                enemyBullets.push(createEnemyBullet(enemy));
            }
        }

        //enter the destruction state when hit
        if(enemy && enemy.state == "hit") {
            enemy.counter++;

            //finally be dead so it will get cleaned up
            if(enemy.counter >= 20) {
                enemy.state = "dead";
                enemy.counter = 0;
            }
        }
    }

    //remove the dead ones
    enemies = enemies.filter(function(e) {
        if(e && e.state != "dead") return true;
        return false;
    });
}


function updateEnemyBullets() {
    for(var i in enemyBullets) {
        var bullet = enemyBullets[i];
        bullet.y += 2;
        bullet.counter++;
    }
}

// =========== check for collisions ===

function checkCollisions() {
    for(var i in playerBullets) {
        var bullet = playerBullets[i];
        for(var j in enemies) {
            var enemy = enemies[j];
            if(collided(bullet,enemy)) {
                bullet.state = "hit";
                enemy.state = "hit";
                enemy.counter = 0;
            }
        }
    }

    if(player.state == "hit" || player.state == "dead") return;
    for(var i in enemyBullets) {
        var bullet = enemyBullets[i];
        if(collided(bullet,player)) {
            bullet.state = "hit";
            player.state = "hit";
            player.counter = 0;
        }
    }
}

function collided(a, b) {

    //check for horz collision
    if(b.x + b.width >= a.x && b.x < a.x + a.width) {
        //check for vert collision
        if(b.y + b.height >= a.y && b.y < a.y + a.height) {
            return true;
        }
    }

    //check a inside b
    if(b.x <= a.x && b.x + b.width >= a.x+a.width) {
        if(b.y <= a.y && b.y + b.height >= a.y + a.height) {
            return true;
        }
    }

    //check b inside a
    if(a.x <= b.x && a.x + a.width >= b.x+b.width) {
        if(a.y <= b.y && a.y + a.height >= b.y+b.height) {
            return true;
        }
    }

    return false;
}
















function doSetup() {
    attachEvent(document, "keydown", function(e) {
        keyboard[e.keyCode] = true;
    });
    attachEvent(document, "keyup", function(e) {
        keyboard[e.keyCode] = false;
    });
}

function attachEvent(node,name,func) {
    if(node.addEventListener) {
        node.addEventListener(name,func,false);
    } else if(node.attachEvent) {
        node.attachEvent(name,func);
    }
};









//====================================
//====================================
//====================================
//====================================
//====================================
//====================================
//====================================//====================================
//====================================
//====================================
//====================================

$(document).ready(function(){
    //Canvas stuff
    var canvas = $("#canvas")[0];
    var ctx = canvas.getContext("2d");
    var w = $("#canvas").width();
    var h = $("#canvas").height();

    //Lets save the cell width in a variable for easy control
    var cw = 10;
    var d;
    var food;
    var score;

    //Lets create the snake now
    var snake_array; //an array of cells to make up the snake

    function init()
    {
        d = "right"; //default direction
        create_snake();
        create_food(); //Now we can see the food particle
        //finally lets display the score
        score = 0;

        //Lets move the snake now using a timer which will trigger the paint function
        //every 60ms
        if(typeof game_loop != "undefined") clearInterval(game_loop);
        game_loop = setInterval(paint, 60);
    }
    init();

    function create_snake()
    {
        var length = 5; //Length of the snake
        snake_array = []; //Empty array to start with
        for(var i = length-1; i>=0; i--)
        {
            //This will create a horizontal snake starting from the top left
            snake_array.push({x: i, y:0});
        }
    }

    //Lets create the food now
    function create_food()
    {
        food = {
            x: Math.round(Math.random()*(w-cw)/cw),
            y: Math.round(Math.random()*(h-cw)/cw),
        };
        //This will create a cell with x/y between 0-44
        //Because there are 45(450/10) positions accross the rows and columns
    }

    //Lets paint the snake now
    function paint()
    {
        //To avoid the snake trail we need to paint the BG on every frame
        //Lets paint the canvas now
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = "black";
        ctx.strokeRect(0, 0, w, h);

        //The movement code for the snake to come here.
        //The logic is simple
        //Pop out the tail cell and place it infront of the head cell
        var nx = snake_array[0].x;
        var ny = snake_array[0].y;
        //These were the position of the head cell.
        //We will increment it to get the new head position
        //Lets add proper direction based movement now
        if(d == "right") nx++;
        else if(d == "left") nx--;
        else if(d == "up") ny--;
        else if(d == "down") ny++;

        //Lets add the game over clauses now
        //This will restart the game if the snake hits the wall
        //Lets add the code for body collision
        //Now if the head of the snake bumps into its body, the game will restart
        if(nx == -1 || nx == w/cw || ny == -1 || ny == h/cw || check_collision(nx, ny, snake_array))
        {
            //restart game
            init();
            //Lets organize the code a bit now.
            return;
        }

        //Lets write the code to make the snake eat the food
        //The logic is simple
        //If the new head position matches with that of the food,
        //Create a new head instead of moving the tail
        if(nx == food.x && ny == food.y)
        {
            var tail = {x: nx, y: ny};
            score++;
            //Create new food
            create_food();
        }
        else
        {
            var tail = snake_array.pop(); //pops out the last cell
            tail.x = nx; tail.y = ny;
        }
        //The snake can now eat the food.

        snake_array.unshift(tail); //puts back the tail as the first cell

        for(var i = 0; i < snake_array.length; i++)
        {
            var c = snake_array[i];
            //Lets paint 10px wide cells
            paint_cell(c.x, c.y);
        }

        //Lets paint the food
        paint_cell(food.x, food.y);
        //Lets paint the score
        var score_text = "Score: " + score;
        ctx.fillText(score_text, 5, h-5);
    }

    //Lets first create a generic function to paint cells
    function paint_cell(x, y)
    {
        ctx.fillStyle = "blue";
        ctx.fillRect(x*cw, y*cw, cw, cw);
        ctx.strokeStyle = "white";
        ctx.strokeRect(x*cw, y*cw, cw, cw);
    }

    function check_collision(x, y, array)
    {
        //This function will check if the provided x/y coordinates exist
        //in an array of cells or not
        for(var i = 0; i < array.length; i++)
        {
            if(array[i].x == x && array[i].y == y)
                return true;
        }
        return false;
    }

    //Lets add the keyboard controls now
    $(document).keydown(function(e){
        var key = e.which;
        //We will add another clause to prevent reverse gear
        if(key == "37" && d != "right") d = "left";
        else if(key == "38" && d != "down") d = "up";
        else if(key == "39" && d != "left") d = "right";
        else if(key == "40" && d != "up") d = "down";
        //The snake is now keyboard controllable
    })







})










































































window.addEventListener("load", init(), false);

// window.requestAnimFrame = (function(){
//     return  window.requestAnimationFrame   ||
//         window.webkitRequestAnimationFrame ||
//         window.mozRequestAnimationFrame    ||
//         window.oRequestAnimationFrame      ||
//         window.msRequestAnimationFrame     ||
//         function( callback ){
//             window.setTimeout(callback, 1000 / 30);
//         };
// })();
//
// function animloop(){
//     requestAnimFrame(animloop);
//
//     //drowShip();
//
//     // render();
// };
//
// animloop();


// var theCanvas = document.getElementById("canvasOne");
// var context = theCanvas.getContext("2d");
// var player;
// var ctxPlayer;
// var map = document.querySelector('map');
// var ctxMap = map.getContext('2d');
// var mapW = map.width = 600;
// var mapH = map.height = 400;




function init() {
    var player = document.getElementById('player');
    var ctxPlayer = player.getContext('2d');
    var playerW = player.width = 600;
    var playerH = player.height = 400;


}
var   ship = {
    size: 30,
    color: 'green',
    posY: 320,
    posX: playerW / 2 - this.size / 2
};


ctxPlayer.clearRect(0, 0, playerW, playerH);
ctxPlayer.fillStyle = ship.color;
ctxPlayer.fillRect(ship.posX, ship.posY, ship.size, ship.size);
ctxPlayer.fill();
//
// player.addEventListener("mousemove", function(e) {
//     var margin = (window.innerWidth - playerW) / 2;
//     ship.posX = Math.round((e.pageX - margin) - (ship.size / 2));
// });



//window.addEventListener("load", eventWindowLoaded, false);








//
//
// function drowShip() {
//     ctxPlayer.clearRect(0, 0, playerW, playerH);
//     ctxPlayer.fillStyle = ship.color;
//     ctxPlayer.fillRect(ship.posX, ship.posY, ship.size, ship.size);
//     ctxPlayer.fill();
//
// }



// function asteroFall() {
//
//     setTimeout(function() {
//         requestAnimationFrame(asteroFall);
//     }, 1000 / 20);
//
//
//     createAstero();
//     updateAstero();
//     killAstero();
//     drawAstero();
//
//     drowShip();
//
// }
//asteroFall();

//Создание астероида
// function createAstero () {
//     // добавляем частицу, если их меньше 100
//     if(particles.length < 10) {
//
//         particles.push({
//             x: Math.random() * w, // между 0 и шириной холста
//             y: 0,
//             speed: 5,//2+Math.random()*3 // между 2 и 5
//             radius: 4,//5+Math.random()*5 // между 5 и 10
//             color: "red",
//         });
//
//     }
//
// }




//
// function updateAstero () {
//     for(var i in particles) {
//         var part = particles[i];
//         part.y += part.speed;
//     }
// }
//
//
// function killAstero () {
//     for(var i in particles) {
//         var part = particles[i];
//         if(part.y > canvas.height) {
//             part.y = 0;
//             particles = [];
//         }
//     }
//
// }
//
// //
// function drawAstero () {
//     for(var i in particles) {
//         var part = particles[i];
//         ctx.beginPath();
//         ctx.arc(part.x,part.y, part.radius, 0, Math.PI*2);
//         ctx.closePath();
//         ctx.fillStyle = part.color;
//         ctx.fill();
//     }
//
// }


