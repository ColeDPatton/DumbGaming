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
    // closeMobileNav();
    document.body.scrollTop = 500;
    document.documentElement.scrollTop = 500;
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
    setMessage("click anywhere to get started");
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

var currentMessageIndex = 0;
var messageTimer = 0;
var currentMessage = "";
var turnLevelOneGoalInvisible = true;
var currentLevel = 1;
var update = setInterval(function () {
    if (gameStarted) {
        if (gameMode === 1) {
            if (level === 1) {
                if (turnLevelOneGoalInvisible && blocks.length === 8) {
                    blocks[7].invisible = 1;
                    turnLevelOneGoalInvisible = false;
                } else if (!turnLevelOneGoalInvisible && instructed === 6) {
                    blocks[7].invisible = 0;
                }
            }

            getMessages();

            if (desiredMessage !== "") {
                if (currentMessage !== desiredMessage) {
                    if (currentMessage.slice(0, 12) === desiredMessage.slice(0, 12)) {
                        setMessage(desiredMessage);
                        setDesiredMessage("");
                        messageTimer = 1000;
                        currentMessageIndex = 1000;
                    } else if (desiredMessage.slice(0, 3) === "Amo" && currentMessage.length > 1) {
                        setDesiredMessage(currentMessage);
                    } else {
                        currentMessage = desiredMessage;
                        messageTimer = 0;
                        currentMessageIndex = 0;
                        currentLevel = level;
                    }
                }

                messageTimer++
                currentMessageIndex++;

                if (currentMessageIndex <= desiredMessage.length) {
                    setMessage(desiredMessage.slice(0, currentMessageIndex));
                } else if ((message.slice(0, 3) !== "Amo") && messageTimer > (2 * Math.max(desiredMessage.length, 10))) {
                    messageTimer = 0;
                    currentMessage = "";
                    currentMessageIndex = 0;
                    setDesiredMessage("");
                    setMessage("");
                    if (currentLevel === level)
                        instructed++;

                }
            } else if (message === "") {
                setDesiredMessage("Amount of times you've failed: " + deathCount);
            }
        }

        if ((wantToJump || holdingJump) && player.yVel === 0) {
            jump();
        } else if (wantToJump && wantToJumpTimer > 0) {
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
                deathMessages[0] = 1;
            } else if (deathCount === 19) {
                deathMessages[1] = 1;
            } else if (deathCount === 49) {
                deathMessages[2] = 1;
            } else if (deathCount === 100) {
                deathMessages[3] = 1;
            }
            if (level === 4 && instructed === 0) {
                instructed = 1;
            } else if (level === 7 && player.xPos > 200 && player.xPos < 325 && instructed === 2) {
                blocks.push(new Shape(200, 350, 125, -10, 0, 1, 0, 0));
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
                            instructed = 1;
                        } if (level === 9 && instructed === 0 &&
                            player.xPos > 90 && player.xPos < 200 && (player.yPos + player.height) < oRec.y) {
                            instructed = 1;
                        }

                        if (deathCount === 4) {
                            deathMessages[0] = 1;
                        } else if (deathCount === 19) {
                            deathMessages[1] = 1;
                        } else if (deathCount === 49) {
                            deathMessages[2] = 1;
                        } else if (deathCount === 100) {
                            deathMessages[3] = 1;
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
    setDesiredMessage("Amount of times you've failed: " + deathCount);
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
                            instructed = 1;
                        } else if (level === 7 && player.xPos >= 50 && instructed === 0) {
                            instructed = 1;
                        } else if (level === 8 && player.xPos >= 50 && instructed === 0) {
                            instructed = 1;
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

var deathMessages = new Array(10);
deathMessages.fill(0);
var sent = 0;
function getMessages() {
    if (level === 1 && instructed >= 0 && instructed < 6) {
        if (instructed === 0) {
            setDesiredMessage("click anywhere to get started");
        } else if (instructed === 1) {
            setDesiredMessage("I'm here to help.");
        } else if (instructed === 2) {
            setDesiredMessage("I'll only instruct you once.");
        } else if (instructed === 3) {
            setDesiredMessage("Use the left and right arrow keys to move.");
        } else if (instructed === 4) {
            setDesiredMessage("And use the space bar to jump.");
        } else if (instructed === 5) {
            setDesiredMessage("Now get to the green square.");
        }
    } else if (level === 3 && instructed > 0 && instructed < 4) {
        if (instructed === 1) {
            setDesiredMessage("...");
        } else if (instructed === 2) {
            setDesiredMessage("There's an invisible ledge you can jump on after the third block.");
        } else if (instructed === 3) {
            setDesiredMessage("Don't tell anyone I told you that.");
        }
    } else if (level === 4 && instructed > 0 && instructed < 4) {
        if (instructed === 1) {
            setDesiredMessage("Hey.");
        } else if (instructed === 2) {
            setDesiredMessage("Don't try to jump on that block.");
        } else if (instructed === 3) {
            setDesiredMessage("There's two fake blocks on this map.");
        }
    } else if (level === 5 && instructed > 0 && instructed < 5) {
        if (instructed === 1) {
            setDesiredMessage("Wow. Good job.");
        } else if (instructed === 2) {
            setDesiredMessage("\"Let's go touch the red block.\"");
        } else if (instructed === 3) {
            setDesiredMessage("\"That's always a good idea.\"");
        } else if (instructed === 4) {
            setDesiredMessage("Red blocks kill you.");
        }
    } else if (level === 7 && instructed > 0 && instructed < 6) {
        if (instructed === 1) {
            setDesiredMessage("You could make the jump.");
        } else if (instructed === 3) {
            setDesiredMessage("*sigh*");
        } else if (instructed === 4) {
            setDesiredMessage("Everyone else made the jump.");
        } else if (instructed === 5) {
            setDesiredMessage("Go ahead, try again.");
        }
    } else if (level === 8 && instructed > 0 && instructed < 3) {
        if (instructed === 1) {
            setDesiredMessage("There's nothing behind you.");
        } else if (instructed === 2) {
            setDesiredMessage("Except your long history of failures.");
        }
    } else if (level === 9 && instructed > 0 && instructed < 4) {
        if (instructed === 1) {
            setDesiredMessage("Oh woooow.");
        } else if (instructed === 2) {
            setDesiredMessage("Those yellow ones are bouncy.");
        } else if (instructed === 3) {
            setDesiredMessage("I totally would have warned you if I knew that.");
        }
    } else if (deathMessages[0]) {
        if (deathMessages[0] === 1) {
            if (!sent) {
                setDesiredMessage("That was your fifth failure.");
                sent = 1;
            }
            if (desiredMessage === "") {
                deathMessages[0]++;
                instructed--;
                sent = 0;
            }
        } else if (deathMessages[0] === 2) {
            if (!sent) {
                setDesiredMessage("Maybe it's time to consider giving up.");
                sent = 1;
            }
            if (desiredMessage === "") {
                deathMessages[0] = 0;
                instructed--;
                sent = 0;
            }
        }
    } else if (deathMessages[1]) {
        if (deathMessages[1] === 1) {
            if (!sent) {
                setDesiredMessage("20 Deaths?!");
                sent = 1;
            }
            if (desiredMessage === "") {
                deathMessages[1]++;
                instructed--;
                sent = 0;
            }
        } else if (deathMessages[1] === 2) {
            if (!sent) {
                setDesiredMessage("Do you enjoy being a disappointment?");
                sent = 1;
            }
            if (desiredMessage === "") {
                deathMessages[1] = 0;
                instructed--;
                sent = 0;
            }
        }
    } else if (deathMessages[2]) {
        if (deathMessages[2] === 1) {
            if (!sent) {
                setDesiredMessage("THE BIG FIVE-O!!");
                sent = 1;
            }
            if (desiredMessage === "") {
                deathMessages[2]++;
                instructed--;
                sent = 0;
            }
        } else if (deathMessages[2] === 2) {
            if (!sent) {
                setDesiredMessage("This would be quite the accomplishment!...");
                sent = 1;
            }
            if (desiredMessage === "") {
                deathMessages[2] = 3;
                instructed--;
                sent = 0;
            }
        } else if (deathMessages[2] === 3) {
            if (!sent) {
                setDesiredMessage("If that number wasn't measuring your failures.");
                sent = 1;
            }
            if (desiredMessage === "") {
                deathMessages[2] = 0;
                instructed--;
                sent = 0;
            }
        }
    } else if (deathMessages[3]) {
        if (deathMessages[3] === 1) {
            if (!sent) {
                setDesiredMessage("To fail 100 times and keep going...");
                sent = 1;
            }
            if (desiredMessage === "") {
                deathMessages[3]++;
                instructed--;
                sent = 0;
            }
        } else if (deathMessages[3] === 2) {
            if (!sent) {
                setDesiredMessage("I'll be honest. I'm actually kind of proud of you!");
                sent = 1;
            }
            if (desiredMessage === "") {
                deathMessages[3]++;
                instructed--;
                sent = 0;
            }
        } else if (deathMessages[3] === 3) {
            if (!sent) {
                setDesiredMessage("You might not be talented. Or Skilled. Or good a this...");
                sent = 1;
            }
            if (desiredMessage === "") {
                deathMessages[3] = 0;
                instructed--;
                sent = 0;
            }
        }
    }
}