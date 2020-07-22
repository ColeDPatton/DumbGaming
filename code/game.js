var canvas = document.getElementById("canvasId");
var ctx = canvas.getContext("2d");
var gameStarted = false;

var deathCount = 0;
var level;
var blocks = [];
var startTime = Date.now();
var endTime = 0;
var gameMode;

var gravity = 1.0;
var instructed = 0;

class Player {
    constructor() {
        this.xPos = 10,
            this.yPos = 300,
            this.xVel = 0,
            this.yVel = 0,
            this.height = -30,
            this.width = 15,
            this.movingLeft = false,
            this.movingRight = false,
            this.jumpPower = -12,
            this.username = null;
    }
    set setUsername(username) {
        if (this.username === null) this.username = username;
    }
}
function resetPlayer() {
    deathCount = 0;
    player.xPos = 10;
    player.yPos = 300;
    player.xVel = 0;
    player.yVel = 0;
    player.height = -30;
    player.width = 15;
    player.movingLeft = false;
    player.movingRight = false;
    player.jumpPower = -12;
}

var player = new Player();

function startGame(mode) {
    closeMobileNav();
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    canvas = document.getElementById("canvasId");
    ctx = canvas.getContext("2d");
    if (player.username === null && mode === 1) {
        // document.getElementById("newGame").blur();
        socket.emit('notLoggedInCampaign', { username: player.username });
    } else if (player.username === null && mode === 2) {
        alert("Log in to start a hardcore game and have a chance at making it on the leaderboard!!!");
        return;
    } else if (player.username != null && mode === 2) {
        // document.getElementById("newHardcoreGame").blur();
        socket.emit('startHardcoreGame');
    } else if (mode === 1) {
        // document.getElementById("newGame").blur();
        socket.emit('startNewCampaign', { username: player.username });
    }
    gameMode = mode;
    if (mode != 0) {
        level = 1;
        loadAllLevels();
        startTime = Date.now();
    }

    if (mode != 0) {
        closeLevelEditor();
        loadGameDisplay();
    }

    resetPlayer();
    highlightedBlock = null;
    gameStarted = true;
}
function loadTheGame() {
    socket.emit('loadCampaignProgress');
    gameMode = 1;
    loadAllLevels();

    closeLevelEditor();
    loadGameDisplay();

    resetPlayer();
    highlightedBlock = null;
    gameStarted = true;
}
function continueGame(progress) {
    level = progress;
}

function homeScreen() {
    location.href = "/user";
    gameStarted = false;
    gameMode = null;
    loadHomeDisplay();
}

function logIn(username) {
    player.setUsername = username;
}

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}
async function loadLevel() {
    instructed = 0;
    showing = 0;
    count = 0;
    player.xPos = 20;
    player.yPos = level === 11 ? 50 : 300;
    player.yPos = 300;
    stopMovingLeft();
    clearBackground();
    drawPlayer();
    loadNextLevel()

    if (level === 7) {
        if (gameMode === 2) {
            await sleep(1000);
            blocks.push(new Shape(200, 350, 125, -10, 0, 1, 0, 0));
        }
    } else if (level === 11) {
        await sleep(300);
        player.yPos = 50;
    } else if (level === 100) {
        blocks = level100blocks.slice(0);
    } else {
        // blocks = levelEditorBlocks;
    }
    drawBlocks();
}

function loadNextLevel() {
    socket.emit('loadNextLevel', { mode: gameMode, loggedIn: player.username === null ? false : true, level: level, username: player.username });
    if (level === 110 && gameMode === 2 && player.username != null) {
        checkPersonalBest();
    }
}

function getTopTen() {
    socket.emit('getTopTen', { time: endTime, playerUsername: player.username });
}

function checkPersonalBest() {
    socket.emit('getPersonalBest', { playerUsername: player.username });
}

function compareTimes(oldBest) {
    if (oldBest == null || endTime < oldBest) {
        socket.emit('setBest', { playerUsername: player.username, time: endTime });
    }
}

function loadMainMenu() {
    clearBackground();
}

var showing = 0;
var count = 0;

function speedAdjustment() {
    if (player.movingRight && !player.movingLeft)
        return 5;
    else if (player.movingLeft && !player.movingRight)
        return -5;
    return 0;
}

var update = setInterval(function () {
    if (gameStarted) {
        if ((wantToJump || holdingJump) && player.yVel === 0) {
            jump();
        } else if (wantToJump && wantToJumpTimer > 0){
            wantToJumpTimer--;
        } else {
            wantToJump = false;
        }
        count++;
        flashBlocks();
        var index = collisionDetectionY();
        if (!collisionDetectionX()) {
            player.xPos += player.xVel;
        }

        moveBlocks();

        if (index >= -1) {
            player.yVel = 0;
            gravity = 1;
            if (index >= 0) {
                player.yPos = blocks[index].y + blocks[index].h;
            }
        } else if (index < -1) {
            player.yVel += gravity;
            gravity *= 1.03;
            player.yPos = player.yPos + player.yVel;
        }

        if (goalCheck()) {
            if (gameMode > 0) {
                endTime = Date.now() - startTime;
                level === 12 ? level = 110 : level++;
                loadLevel();
            } else {
                alert("WINNER!");
                die();
            }
        }
        clearBackground();
        drawPlayer();
        drawBlocks();
        deathCheck();
        if (gameMode === 2) {
            if (level != 110) {
                ctx.font = "20px Georgia";
                ctx.fillStyle = "#000000";
                var delta = Date.now() - startTime;
                ctx.fillText(Math.floor(delta / 1000) + "s", 700, 50);
            } else {
                ctx.fillText(Math.floor(endTime / 1000) + "s", 650, 50);
            }
        } else if (gameMode === 0 && canvas.width === 900) {
            drawBlockFactory();
        }
    }
}, 50);

function deathCheck() {
    //off map
    if (player.xPos <= -25 || player.xPos >= 800 + 10 ||
        player.yPos <= -100 || player.yPos >= 400) {
        if (gameMode === 1) {
            if (deathCount === 4) {
                alert("That was your fifth failure.");
                alert("Maybe it's time to consider giving up.");
            }
            if (level === 4 && instructed === 0) {
                alert("Hey.");
                alert("Don't try to jump on that block.");
                alert("There's two fake blocks on this map.");
                instructed = 1;
            } else if (level === 7 && player.xPos > 200 && player.xPos < 325 && instructed === 1) {
                alert("*sigh*");
                alert("Everyone else made the jump.");
                alert("Go ahead, try again.");
                blocks.push(new Shape(200, 350, 125, -10, 0, 1, 0, 0));
                instructed = 2;
            } else if (level === 7 && player.xPos > 395 && player.xPos < 485 && instructed === 2) {
                alert("Life sucks doesn't it.");
                alert("Click 'q' to quit.");
                blocks.splice(5, 1);
                instructed = 3;
            }
        }
        die();
        return true;
    }
    //hit deadly block
    for (var i in blocks) {
        oRec = blocks[i];
        if (oRec.deadly === 1) {
            if (player.yPos > (oRec.y + oRec.h) &&
                (player.yPos + player.height) < oRec.y) {
                if ((player.xPos + player.width) > oRec.x &&
                    player.xPos < (oRec.x + oRec.w)) {
                    if (gameMode === 1) {
                        if (level === 5 && instructed === 0) {
                            alert("Wow. Good job.");
                            alert("Let's go touch the red block.");
                            alert("That's always a good idea.");
                            alert("Red blocks kill you.");
                            instructed = 1;
                        } if (level === 7 && instructed === 0 &&
                            player.xPos > 90 && player.xPos < 200 && (player.yPos + player.height) < oRec.y) {
                            alert("Oh woooow.");
                            alert("Those yellow ones are bouncy.")
                            alert("I totally would have warned you if I knew that.");
                            instructed = 1;
                        }

                        if (deathCount === 4) {
                            alert("That was your fifth failure.");
                            alert("Maybe it's time to consider giving up.");
                        } else if (deathCount === 19) {
                            alert("20 Deaths?!");
                            alert("Do you enjoy being a disappointment?");
                        } else if (deathCount === 49) {
                            alert("THE BIG FIVE-O!!");
                            alert("This would be quite the accomplishment!...");
                            alert("If that number wasn't measuring your failures.");
                        } else if (deathCount === 74) {
                            alert("*sigh*");
                        }
                    }
                    die();
                    return true;
                }
            }
        }
    }
    return false;
}

function die() {
    deathCount++;
    player.xPos = 20;
    player.yPos = 300;
    if (level === 11)
        player.yPos = 50;
    player.movingLeft = false;
    player.movingRight = false;
    player.xVel = 0;
    player.yVel = 0;
    holdingJump = false;
}

function goalCheck() {
    if (level === 100)
        return false;
    for (var i in blocks) {
        oRec = blocks[i];
        if (oRec.goal === 1 && oRec.ghost === 0) {
            if (player.yPos > (oRec.y + oRec.h) &&
                (player.yPos + player.height) < oRec.y) {
                if ((player.xPos + player.width) > oRec.x &&
                    player.xPos < (oRec.x + oRec.w)) {
                    return true;
                }
            }
        }
    }
    return false;
}

function collisionCheckX(index) {
    oRec = blocks[index];
    if (oRec.goal === 0 && oRec.deadly === 0 && oRec.ghost === 0) {
        if (player.yPos > (oRec.y + oRec.h) && (player.yPos + player.height) < oRec.y) {
            if ((player.xPos + player.width) > oRec.x && player.xPos < (oRec.x + oRec.w)) {
                if (player.xPos + player.width < (oRec.x + oRec.w)) {
                    player.xPos = oRec.x - player.width;
                } else if (player.xPos > (oRec.x)) {
                    player.xPos = oRec.x + oRec.w;
                }
                return true;
            }
        }
    }
    return false;
}

function collisionCheckY(index) {
    oRec = blocks[index];
    if (oRec.goal === 0 && oRec.deadly === 0 && oRec.ghost === 0) {
        if ((player.xPos + player.width) > oRec.x && player.xPos < (oRec.x + oRec.w)) {
            if (player.yPos > (oRec.y + oRec.h) && (player.yPos + player.height) < oRec.y) {
                if (player.yPos + player.height < (oRec.y + oRec.h)) {
                    player.yPos = oRec.y + oRec.h;
                } else if (player.yPos > (oRec.y)) {
                    player.yPos = oRec.y - player.height;
                }
                return true;
            }
        }
    }
    return false;
}

function collisionDetectionX() {
    var nextX = player.xPos + player.xVel;

    for (var i in blocks) {
        oRec = blocks[i];
        if (oRec.goal === 0 && oRec.ghost === 0 && oRec.deadly === 0) {
            if (player.yPos > (oRec.y + oRec.h) && (player.yPos + player.height) < oRec.y) {
                if ((nextX + player.width) > oRec.x && nextX < (oRec.x + oRec.w)) {
                    if (nextX + player.width < (oRec.x + oRec.w)) {
                        player.xPos = oRec.x - player.width;
                    } else if (player.xPos > (oRec.x)) {
                        player.xPos = oRec.x + oRec.w;
                    }
                    return true;
                }
            }
        }
    }
    return false;
}

function collisionDetectionY() {
    var nextY = player.yPos + player.yVel + gravity;
    for (var i in blocks) {
        oRec = blocks[i];
        if (oRec.goal === 0 && oRec.ghost === 0 && oRec.deadly === 0) {
            if (nextY > oRec.y + oRec.h && nextY + player.height < oRec.y) {
                if ((player.xPos + player.width) > oRec.x && player.xPos < (oRec.x + oRec.w)) {
                    if (gameMode === 1) {
                        if (level === 3 && player.xPos >= 50 && instructed === 0) {
                            alert("...");
                            alert("There's an invisible ledge you can jump on after the third block.");
                            alert("Don't tell anyone I told you that.");
                            instructed = 1;
                            player.movingLeft = false;
                            player.movingRight = false;
                            player.xVel = 0;
                        } else if (level === 7 && player.xPos >= 50 && instructed === 0) {
                            alert("You could make the jump.");
                            instructed = 1;
                            player.movingLeft = false;
                            player.movingRight = false;
                            player.xVel = 0;
                        } else if (level === 8 && player.xPos >= 50 && instructed === 0) {
                            alert("There's nothing behind you.");
                            alert("Except your long history of failures.");
                            instructed = 1;
                            player.movingLeft = false;
                            player.movingRight = false;
                            player.xVel = 0;
                        } else if (level === 8 && instructed === 0 &&
                            player.xPos >= 620 && player.xPos <= 660 &&
                            player.yPos >= 175 && player.yPos <= 185) {
                            alert("Alright, here's the deal...");
                            alert("Don't go down those steps.");
                            alert("Go to the square block directly above where you started and jump.");
                            alert("Or you can just go down those steps.");
                            instructed = 1;
                            player.movingLeft = false;
                            player.movingRight = false;
                            player.xVel = 0;
                        }
                    }
                    player.jumpPower = oRec.bouncy ? -25 : -12;
                    if (player.yPos < oRec.y) {
                        player.yPos = oRec.y + oRec.h;
                        if (oRec.rotationalSpeed != null && oRec.rotationalSpeed != 0 && oRec.xSpeed != null) {
                            player.yVel = oRec.distanceFromCenter * oRec.rotationalSpeed * Math.cos(oRec.angle);
                            player.xVel = speedAdjustment() - (oRec.distanceFromCenter * oRec.rotationalSpeed * Math.sin(oRec.angle) - oRec.xSpeed);
                            return i;
                        } else if (oRec.rotationalSpeed != null && oRec.rotationalSpeed != 0) {
                            player.yVel = oRec.distanceFromCenter * oRec.rotationalSpeed * Math.cos(oRec.angle);
                            player.xVel = speedAdjustment() - (oRec.distanceFromCenter * oRec.rotationalSpeed * Math.sin(oRec.angle));
                            return i;
                        } else if (oRec.xSpeed != null) {
                            player.xVel = speedAdjustment() + oRec.xSpeed;
                        }
                        if (oRec.ySpeed != null && oRec.ySpeed != 0) {
                            return i;
                        }
                        return -1;
                    } else if (player.yPos > oRec.y + oRec.h) {
                        player.yPos = oRec.y - player.height;
                        return -1;
                    }
                }
            }
        }
    }
    return -2;
}