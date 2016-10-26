"use strict";

window.addEventListener("load", init, false);

var map,
    ctxMap,
    mapW,
    mapH,
    pl,
    player,
    ctxPlayer,
    playerW,
    playerH,
    enemy,
    enemies = [],
    ctxEnemy,
    enemyW,
    enemyH,
    start,
    stop,
    domPoint,
    hangar,
    life,
    domLvlCounter,
    globalRender,
    startLoop = 0,
    point = 0,
    diffLlvl = 1,
    meteor;

function init() {

    window.requestAnimFrame = function () {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
            window.setTimeout(callback, 1000 / 30);
        };
    }();

    map = document.getElementById("map");
    ctxMap = map.getContext("2d");
    mapW = map.width = 600;
    mapH = map.height = 400;

    pl = document.getElementById("player");
    ctxPlayer = pl.getContext("2d");
    playerW = pl.width = 600;
    playerH = pl.height = 400;

    enemy = document.getElementById("enemy");
    ctxEnemy = enemy.getContext("2d");
    enemyW = enemy.width = 600;
    enemyH = enemy.height = 400;

    //UI
    start = document.getElementById("start");
    stop = document.getElementById("stop");
    domLvlCounter = document.querySelector(".lvlcounter");
    domPoint = document.querySelector(".pcounter");

    hangar = document.querySelector(".ships");
    life = document.querySelector(".ship");

    player = new Player();

    //animloop();

    //Предварительная отрисовка карты и корабля до старта игры
    drowMap();
    drowShip();

    spawnEnemy(20);
    diffUp();

    //Events
    document.addEventListener("mousemove", player.update, false);

    start.addEventListener("click", function () {
        if (startLoop == 0) {
            globalRender = requestAnimationFrame(animloop);
        }
        startLoop = 1;
    });

    stop.addEventListener("click", function () {
        if (startLoop == 1) {
            cancelAnimationFrame(globalRender);
        }
        startLoop = 0;
    });
}

function animloop() {

    globalRender = requestAnimationFrame(animloop);

    clearMap();
    clearPlayer();

    updateMeteor();
    drowAll();
    collision();
}

function drowAll() {
    drowMap();
    drowShip();

    clearEnemy();

    drowEnemy();
}

function Player() {
    this.posX = 0;
    this.posY = 360;
    this.size = 30;
    this.color = "green";

    this.drow = function () {
        ctxPlayer.fillStyle = this.color;
        ctxPlayer.fillRect(this.posX, this.posY, this.size, this.size);
        ctxPlayer.fill();
    };

    this.update = function (e) {
        var margin = (window.innerWidth - playerW) / 2;
        player.posX = Math.round(e.pageX - margin - player.size / 2);
        if (player.posX < 0) {
            player.posX = 0;
        }
        if (player.posX > playerW - player.size) {
            player.posX = playerW - player.size;
        }
    };
}

function drowShip() {
    player.drow();
}

function drowEnemy() {
    for (var i = 0; i < enemies.length; i++) {
        enemies[i].drow();
        //console.log(enemies[i]);
    }
}

function updateMeteor() {
    for (var i = 0; i < enemies.length; i++) {
        enemies[i].update();
    }
}

function spawnEnemy(count) {
    for (var i = 0; i < count; i++) {
        enemies[i] = new Meteor();
    }
}

function Meteor() {
    this.posX = Math.floor(Math.random() * enemyW);
    this.posY = -Math.floor(Math.random() * enemyH);
    this.size = 10;
    this.color = "red";

    this.drow = function () {
        ctxPlayer.fillStyle = this.color;
        ctxPlayer.fillRect(this.posX, this.posY, this.size, this.size);
        ctxPlayer.fill();
    };

    this.update = function () {
        this.posY += 3;
        if (this.posY > enemyH) {
            this.posX = Math.floor(Math.random() * enemyW);
            this.posY = -Math.floor(Math.random() * enemyH);
            point++;
            pointCounter();
        }
    };
}

//Обработка столкновения корабля и метеорита
function collision() {

    for (var i = 0; i < enemies.length; i++) {
        if (player.posY < enemies[i].posY + enemies[i].size && player.posX + player.size > enemies[i].posX && player.posX < enemies[i].posX + enemies[i].size) {
            enemies[i].posX = -Math.floor(Math.random() * enemyW);
            shipHit();
        }
    }
}

//Счетчик очков
function pointCounter() {
    domPoint.innerHTML = point;
}

//Счетчик жизней на панели UI
function shipHit() {
    //hangar.removeChild(life);
    console.log("-1 life");
}

//Повышение уровня сложности
function diffUp() {
    setInterval(function () {
        diffLlvl++;
        domLvlCounter.innerHTML = diffLlvl;
        //console.log(diffLlvl);
    }, 3000);
}

function clearPlayer() {
    ctxPlayer.clearRect(0, 0, playerW, playerH);
}
function clearMap() {
    ctxMap.clearRect(0, 0, mapW, mapH);
}
function clearEnemy() {
    ctxEnemy.clearRect(0, 0, enemyW, enemyH);
}

function drowMap() {
    ctxMap.fillStyle = "#ccc";
    ctxMap.fillRect(0, 0, mapW, mapH);
    ctxMap.fill();
}

console.log("All fine, dude!");