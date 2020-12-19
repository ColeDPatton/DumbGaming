document.addEventListener("keydown", move);
document.addEventListener("keyup", stop);
document.addEventListener('touchstart', mobileMove, { passive: false });
document.addEventListener('touchend', mobileStop, { passive: false });
document.addEventListener('touchmove', mobileDrag, { passive: false });

var x;
var y;
var highlightedBlock;
var isPlacing = false;
var shiftBlock = false;
var startX;
var startY;
var originalX, originalW;
var originalY, originalH;
var centerY, centerX;
var resizingTop = false, resizingBottom = false, resizingRight = false, resizingLeft = false;
var movingTopBound = false, movingBottomBound = false, movingLeftBound = false, movingRightBound = false, movingRotationCenter = false;
var clickedButton;
var holdingJump = false;
var wantToJump = false;
var wantToJumpTimer = 0;

var lastEvent = null;
function move(event) {
    if (gameStarted) {
        if (level === 1 && instructed === 1) {
            instructed++;
        }
        if (event.keyCode === 37 || event.keyCode === 65) {
            moveLeft();
        } else if (event.keyCode === 39 || event.keyCode === 68) {
            moveRight();
        } else if (event.keyCode === 81 && level != 110) {
            die();
        }
        if (event.keyCode === 32 || event.keyCode === 38 || event.keyCode === 87) {
            event.preventDefault();
            holdingJump = true;
            if (player.yVel === 0)
                jump();
            else {
                wantToJump = true;
                wantToJumpTimer = 1;
            }
        }
    }
}

var totalTouches = 0;
function mobileMove(event) {
    if (gameStarted) {
        var gameDiv = document.getElementById("gameDiv");
        if (!gameDiv)
            gameDiv = document.getElementsByClassName("gameDiv").item(0);
        for (var i = 0; i < event.touches.length; i++) {
            var clickedX = (event.touches[i].clientX - canvas.getBoundingClientRect().left) * (canvas.width / gameDiv.clientWidth);
            var clickedY = (event.touches[i].clientY - canvas.getBoundingClientRect().top) * (canvas.height / gameDiv.clientHeight);
            if (clickedY >= -10 && clickedY <= 510) {
                event.preventDefault();
                if (level === 1 && instructed === 0 && gameMode === 1) {
                    setDesiredMessage("I'm here to help.");
                    alert("I'll only instruct you once.");
                    alert("Touch the bottom left or bottom right to move.");
                    alert("Tap anywhere else to jump.");
                    alert("Now get to the green square.");
                    instructed = 1;
                } else if (clickedX <= 200 && clickedY >= 250) {
                    moveLeft();
                } else if (clickedX >= 600 && clickedY >= 250) {
                    moveRight();
                } else {
                    holdingJump = true;
                    if (player.yVel === 0)
                        jump();
                    else {
                        wantToJump = true;
                        wantToJumpTimer = 1;
                    }
                }
            }
        }
    }
}

function mobileDrag(event) {
    var gameDiv = document.getElementById("gameDiv");
    if (!gameDiv)
        gameDiv = document.getElementsByClassName("gameDiv").item(0);
    if (gameStarted) {
        for (var i = 0; i < event.touches.length; i++) {
            var clickedX = (event.touches[i].clientX - canvas.getBoundingClientRect().left) * (canvas.width / gameDiv.clientWidth);
            var clickedY = (event.touches[i].clientY - canvas.getBoundingClientRect().top) * (canvas.height / gameDiv.clientHeight);

            if (clickedX >= 285 && clickedX <= 315 && clickedY >= 225 && player.movingLeft) {
                stopMovingLeft();
            } else if (clickedX >= 485 && clickedX <= 515 && clickedY >= 225 && player.movingRight) {
                stopMovingRight();
            }
        }
    }
}

function moveLeft() {
    if (!player.movingLeft)
        player.xVel += -5;
    player.movingLeft = true;
}

function moveRight() {
    if (!player.movingRight)
        player.xVel += 5;
    player.movingRight = true;
}

function stopMovingLeft() {
    if (player.movingLeft)
        player.xVel += 5;
    player.movingLeft = false;
}

function stopMovingRight() {
    if (player.movingRight)
        player.xVel += -5;
    player.movingRight = false;
}

function jump() {
    player.yVel = player.jumpPower;
}

function stop(event) {
    if ((event.keyCode === 37 || event.keyCode === 65) && player.movingLeft) {
        stopMovingLeft();
    } else if ((event.keyCode === 39 || event.keyCode === 68) && player.movingRight) {
        stopMovingRight();
    } else if (event.keyCode === 32 || event.keyCode === 38 || event.keyCode === 87) {
        holdingJump = false;
    }
}
function mobileStop(event) {
    if (gameStarted) {
        if (event.touches.length === 0) {
            stopMovingLeft();
            stopMovingRight();
            holdingJump = false;
        } else {
            for (var i = 0; i < event.changedTouches.length; i++) {
                var clickedX = (event.changedTouches[i].clientX - canvas.getBoundingClientRect().left) * (canvas.width / gameDiv.clientWidth);
                var clickedY = (event.changedTouches[i].clientY - canvas.getBoundingClientRect().top) * (canvas.height / gameDiv.clientHeight);

                if (clickedX >= 500 && clickedY >= 250 && !player.movingRight) {
                    holdingJump = false;
                } else if (clickedX <= 300 && clickedY >= 250 && !player.movingLeft) {
                    holdingJump = false;
                } else if (clickedY <= 250 || (clickedX >= 200 && clickedX <= 600)) {
                    holdingJump = false;
                }
                if (clickedX <= 300 && clickedY >= 225 && player.movingLeft) {
                    stopMovingLeft();
                } else if (clickedX >= 500 && clickedY >= 225 && player.movingRight) {
                    stopMovingRight();
                }
            }
        }
    }
}
const rect = canvas.getBoundingClientRect();

function click(event) {
    var mobile = false
    if (screen.width <= 600) {
        mobile = true;
    }
    if (gameMode === 0) {
        var gameDiv = document.getElementById("gameDiv");
        var clickedX;
        var clickedY;
        if (mobile) {
            var clickedX = (event.touches[0].clientX - canvas.getBoundingClientRect().left) * (canvas.width / gameDiv.clientWidth);
            var clickedY = (event.touches[0].clientY - canvas.getBoundingClientRect().top) * (canvas.width / gameDiv.clientWidth);
        } else {
            var clickedX = (event.clientX - canvas.getBoundingClientRect().left) * (canvas.width / gameDiv.clientWidth);
            var clickedY = (event.clientY - canvas.getBoundingClientRect().top) * (canvas.width / gameDiv.clientWidth);
        }
        if (resizingBlock(clickedX, clickedY)) {
            startX = clickedX;
            startY = clickedY;
            originalX = highlightedBlock.x;
            originalY = highlightedBlock.y;
            originalW = highlightedBlock.w;
            originalH = highlightedBlock.h;
        } else if (movingBounds(clickedX, clickedY)) {
            startX = clickedX;
            startY = clickedY;
            if (movingLeftBound) {
                originalX = highlightedBlock.xMin;
            } else if (movingRightBound) {
                originalX = highlightedBlock.xMax;
            } else if (movingTopBound) {
                originalY = highlightedBlock.yMin;
            } else if (movingBottomBound) {
                originalY = highlightedBlock.yMax;
            } else if (movingRotationCenter) {
                originalY = highlightedBlock.centerY;
                originalX = highlightedBlock.centerX;
            }
        } else if (clickingBlock(clickedX, clickedY)) {
            startX = clickedX;
            startY = clickedY;
            originalX = highlightedBlock.x;
            originalY = highlightedBlock.y;
            originalxMin = highlightedBlock.xMin;
            originalxMax = highlightedBlock.xMax;
            originalyMax = highlightedBlock.yMax;
            originalyMin = highlightedBlock.yMin;
            centerX = highlightedBlock.centerX;
            centerY = highlightedBlock.centerY;
            shiftBlock = true;

        } else if (clickingButton(clickedX, clickedY)) {
            switch (clickedButton) {
                case 0:
                    toggleBouncy();
                    break;
                case 1:
                    toggleInvisible();
                    break;
                case 2:
                    toggleGhost();
                    break;
                case 3:
                    toggleHorizontalSpeed();
                    break;
                case 4:
                    toggleVerticalSpeed();
                    break;
                case 5:
                    toggleRotationalSpeed();
                    break;
                default:
                    break;
            }
        } else if (changeSpeed(clickedX, clickedY)) {

        } else if (clickedX > 825 && clickedX < 875) {
            if (clickedY > 50 && clickedY < 100) {
                x = clickedX;
                y = clickedY;
                isPlacing = true;
                highlightedBlock = new Shape(x, y, 25, -25, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
                blocks.push(highlightedBlock);
            } else if (clickedY > 150 && clickedY < 200) {
                x = clickedX;
                y = clickedY;
                isPlacing = true;
                highlightedBlock = new Shape(x, y, 25, -25, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0);
                blocks.push(highlightedBlock);
            } else if (clickedY > 250 && clickedY < 300) {
                x = clickedX;
                y = clickedY;
                isPlacing = true;
                highlightedBlock = new Shape(x, y, 25, -25, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
                blocks.push(highlightedBlock);
            }
        } else if (clickedY < 400) {
            highlightedBlock = null;
        }
        clearBackground();
        drawBlockFactory();
        drawBlockEditor();
        drawBlocks();
        drawPlayer();
    }
    lastEvent = event;
}

function editBlock(event) {
    var mobile = false
    if (screen.width <= 600) {
        mobile = true;
    }
    if (gameMode === 0) {
        var gameDiv = document.getElementById("gameDiv");
        var clickedX;
        var clickedY;
        if (mobile) {
            var clickedX = (event.touches[0].clientX - canvas.getBoundingClientRect().left) * (canvas.width / gameDiv.clientWidth);
            var clickedY = (event.touches[0].clientY - canvas.getBoundingClientRect().top) * (canvas.width / gameDiv.clientWidth);
        } else {
            var clickedX = (event.clientX - canvas.getBoundingClientRect().left) * (canvas.width / gameDiv.clientWidth);
            var clickedY = (event.clientY - canvas.getBoundingClientRect().top) * (canvas.width / gameDiv.clientWidth);
        }
        if (isPlacing) {
            x = clickedX - 12.5;
            y = clickedY + 12.5;
            highlightedBlock.x = x;
            highlightedBlock.y = y;
        } else if (shiftBlock) {
            var xDifference = clickedX - startX;
            var yDifference = clickedY - startY;
            highlightedBlock.x = originalX + xDifference;
            highlightedBlock.y = originalY + yDifference;
            highlightedBlock.startX = originalX + xDifference;
            highlightedBlock.startY = originalY + yDifference;
            highlightedBlock.xMin = originalxMin + xDifference;
            highlightedBlock.xMax = originalxMax + xDifference;
            highlightedBlock.yMin = originalyMin + yDifference;
            highlightedBlock.yMax = originalyMax + yDifference;
            highlightedBlock.centerX = centerX + xDifference;
            highlightedBlock.centerY = centerY + yDifference;
        }
        if (resizingTop) {
            var yDifference = clickedY - startY;
            highlightedBlock.h = (yDifference + 4 > -originalH) ? -4 : originalH + yDifference;
        } else if (resizingBottom) {
            var yDifference = clickedY - startY;
            if (yDifference - 4 < originalH) {
                highlightedBlock.y = originalY + originalH + 4;
                highlightedBlock.h = -4;
            } else {
                highlightedBlock.y = originalY + yDifference;
                highlightedBlock.h = originalH - yDifference;
            }
        }

        if (resizingRight) {
            var xDifference = clickedX - startX;
            highlightedBlock.w = (xDifference - 4 < -originalW) ? 4 : originalW + xDifference;
        } else if (resizingLeft) {
            var xDifference = clickedX - startX;
            if (xDifference + 4 > originalW) {
                highlightedBlock.x = originalX + originalW - 4;
                highlightedBlock.w = 4;
            } else {
                highlightedBlock.x = originalX + xDifference;
                highlightedBlock.w = originalW - xDifference;
            }
        }

        if (movingLeftBound) {
            var xDifference = clickedX - startX;
            highlightedBlock.xMin = originalX + xDifference;
        } else if (movingRightBound) {
            var xDifference = clickedX - startX;
            highlightedBlock.xMax = originalX + xDifference;
        } else if (movingTopBound) {
            var yDifference = clickedY - startY;
            highlightedBlock.yMin = originalY + yDifference;
        } else if (movingBottomBound) {
            var yDifference = clickedY - startY;
            highlightedBlock.yMax = originalY + yDifference;
        } else if (movingRotationCenter) {
            var yDifference = clickedY - startY;
            highlightedBlock.centerY = originalY + yDifference;
            var xDifference = clickedX - startX;
            highlightedBlock.centerX = originalX + xDifference;
            var xDistance = (highlightedBlock.centerX - highlightedBlock.x - (highlightedBlock.w / 2));
            var yDistance = (highlightedBlock.centerY - highlightedBlock.y - (highlightedBlock.h / 2));
            highlightedBlock.distanceFromCenter = Math.sqrt((xDistance * xDistance) + (yDistance * yDistance));
            var angle = Math.PI + Math.atan2(yDistance, xDistance);
            highlightedBlock.angle = angle;
            highlightedBlock.startAngle = angle;
        }

        clearBackground();
        drawBlockFactory();
        drawBlockEditor();
        drawBlocks();
        drawPlayer();
    }
    lastEvent = event;
}

function placeBlock(event) {
    var mobile = false
    if (screen.width <= 600) {
        mobile = true;
    }
    var gameDiv = document.getElementById("gameDiv");
    var clickedX;
    var clickedY;
    if (mobile) {
        clickedX = (lastEvent.touches[0].clientX - canvas.getBoundingClientRect().left) * (canvas.width / gameDiv.clientWidth);
        clickedY = (lastEvent.touches[0].clientY - canvas.getBoundingClientRect().top) * (canvas.width / gameDiv.clientWidth);
    } else {
        var clickedX = (lastEvent.clientX - canvas.getBoundingClientRect().left) * (canvas.width / gameDiv.clientWidth);
        var clickedY = (lastEvent.clientY - canvas.getBoundingClientRect().top) * (canvas.width / gameDiv.clientWidth);
    }
    if (isPlacing) {
        var x = clickedX - 12.5;
        var y = clickedY + 12.5;
        highlightedBlock.x = x;
        highlightedBlock.y = y;
        highlightedBlock.x = x;
        highlightedBlock.y = y;
        highlightedBlock.startX = x;
        highlightedBlock.startY = y;
        isPlacing = false;
        if (highlightedBlock.x > 810) {
            deleteBlock();
        }
        drawBlocks();
        drawPlayer();
    } else if (shiftBlock) {
        if (highlightedBlock.x > 810) {
            deleteBlock();
        }
        shiftBlock = false;
    }
    resizingTop = false;
    resizingBottom = false;
    resizingLeft = false;
    resizingRight = false;
    movingBottomBound = false;
    movingTopBound = false;
    movingRightBound = false;
    movingLeftBound = false;
    movingRotationCenter = false;
}

function clickingBlock(x, y) {
    for (var i in blocks) {
        oRec = blocks[i];
        if (y > (oRec.y + oRec.h) && y < oRec.y) {
            if (x > oRec.x && x < (oRec.x + oRec.w)) {
                highlightedBlock = oRec;
                return true;
            }
        }
    }
}

function resizingBlock(x, y) {
    var resizeRadius = 10;
    for (var i in blocks) {
        oRec = blocks[i];
        if (Math.sqrt((x - oRec.x) * (x - oRec.x) + (y - oRec.y) * (y - oRec.y)) < resizeRadius) {
            highlightedBlock = oRec;
            resizingBottom = true;
            resizingLeft = true;
            return true;
        } else if (Math.sqrt((x - oRec.x - oRec.w) * (x - oRec.x - oRec.w) + (y - oRec.y) * (y - oRec.y)) < resizeRadius) {
            highlightedBlock = oRec;
            resizingBottom = true;
            resizingRight = true;
            return true;
        } else if (Math.sqrt((x - oRec.x) * (x - oRec.x) + (y - oRec.y - oRec.h) * (y - oRec.y - oRec.h)) < resizeRadius) {
            highlightedBlock = oRec;
            resizingTop = true;
            resizingLeft = true;
            return true;
        } else if (Math.sqrt((x - oRec.x - oRec.w) * (x - oRec.x - oRec.w) + (y - oRec.y - oRec.h) * (y - oRec.y - oRec.h)) < resizeRadius) {
            highlightedBlock = oRec;
            resizingTop = true;
            resizingRight = true;
            return true;
        }
    }
    return false;
}

function movingBounds(x, y) {
    var moveBoundsRadius = 10;
    for (var i in blocks) {
        oRec = blocks[i];
        if (oRec.xSpeed != 0) {
            if (Math.sqrt((x - oRec.xMin) * (x - oRec.xMin) + (y - oRec.y - (oRec.h / 2)) * (y - oRec.y - (oRec.h / 2))) < moveBoundsRadius) {
                highlightedBlock = oRec;
                movingLeftBound = true;
                return true;
            } else if (Math.sqrt((x - oRec.xMax) * (x - oRec.xMax) + (y - oRec.y - (oRec.h / 2)) * (y - oRec.y - (oRec.h / 2))) < moveBoundsRadius) {
                highlightedBlock = oRec;
                movingRightBound = true;
                return true;
            }
        }
        if (oRec.ySpeed != 0) {
            if (Math.sqrt((x - oRec.x - (oRec.w / 2)) * (x - oRec.x - (oRec.w / 2)) + (y - oRec.yMin) * (y - oRec.yMin)) < moveBoundsRadius) {
                highlightedBlock = oRec;
                movingTopBound = true;
                return true;
            } else if (Math.sqrt((x - oRec.x - (oRec.w / 2)) * (x - oRec.x - (oRec.w / 2)) + (y - oRec.yMax) * (y - oRec.yMax)) < moveBoundsRadius) {
                highlightedBlock = oRec;
                movingBottomBound = true;
                return true;
            }
        }
        if (oRec.rotationalSpeed != 0) {
            if (Math.sqrt((x - oRec.centerX) * (x - oRec.centerX) + (y - oRec.centerY) * (y - oRec.centerY)) < moveBoundsRadius) {
                highlightedBlock = oRec;
                movingRotationCenter = true;
                return true;
            }
        }
    }
    return false;
}

function clickingButton(x, y) {
    if (highlightedBlock != null) {
        for (var i = 0; i < 6; i++) {
            var buttonX = distanceBetweenButtons + ((distanceBetweenButtons + buttonWidth) * i);
            if (y > canvas.height - 25 - 50 && y < canvas.height - 25) {
                if (x > buttonX && x < buttonX + buttonWidth) {
                    clickedButton = i;
                    return true;
                }
            }
        }
    }
}

function deleteBlock() {
    var tempBlocks = [];
    while (blocks.length > 0) {
        var checkBlock = blocks.pop();
        if (checkBlock.x < 810) {
            tempBlocks.push(checkBlock);
        } else {
            highlightedBlock = null;
        }
    }
    while (tempBlocks.length > 0) {
        blocks.push(tempBlocks.pop());
    }
}

function changeSpeed(x, y) {
    var middleX = horizontalSpeedTriangleStartingX + (triangleWidth / 2);
    var middleY = horizontalSpeedTriangleStartingY - (triangleHeight / 2);
    if (highlightedBlock != null && highlightedBlock.xSpeed != 0) {
        if (Math.sqrt((x - middleX) * (x - middleX) +
            (y - middleY) * (y - middleY)) < 15) {
            highlightedBlock.xSpeed = increaseSpeed(highlightedBlock.xSpeed, 1);
            return true;
        } else if (Math.sqrt((x - (middleX + spaceBetweenTriangles)) * (x - (middleX + spaceBetweenTriangles)) +
            (y - middleY) * (y - middleY)) < 15) {
            highlightedBlock.xSpeed = decreaseSpeed(highlightedBlock.xSpeed, 1);
            return true;
        }
    }
    if (highlightedBlock != null && highlightedBlock.ySpeed != 0) {
        middleY = verticalSpeedTriangleStartingY - (triangleHeight / 2);
        if (Math.sqrt((x - middleX) * (x - middleX) +
            (y - middleY) * (y - middleY)) < 15) {
            highlightedBlock.ySpeed = increaseSpeed(highlightedBlock.ySpeed, 1);
            return true;
        } else if (Math.sqrt((x - (middleX + spaceBetweenTriangles)) * (x - (middleX + spaceBetweenTriangles)) +
            (y - middleY) * (y - middleY)) < 15) {
            highlightedBlock.ySpeed = decreaseSpeed(highlightedBlock.ySpeed, 1);
            return true;
        }
    }
    if (highlightedBlock != null && highlightedBlock.rotationalSpeed != 0) {
        middleY = rotatingSpeedTriangleStartingY - (triangleHeight / 2);
        if (Math.sqrt((x - middleX) * (x - middleX) +
            (y - middleY) * (y - middleY)) < 15) {
            highlightedBlock.rotationalSpeed = increaseSpeed(highlightedBlock.rotationalSpeed, .01);
            return true;
        } else if (Math.sqrt((x - (middleX + spaceBetweenTriangles)) * (x - (middleX + spaceBetweenTriangles)) +
            (y - middleY) * (y - middleY)) < 15) {
            highlightedBlock.rotationalSpeed = decreaseSpeed(highlightedBlock.rotationalSpeed, .01);
            return true;
        }
    }
    return false;
}

function increaseSpeed(speed, increment) {
    if (increment >= 1) {
        var incrementedSpeed = speed > 0 ? speed + increment : speed - increment;
        return incrementedSpeed === 0 ? increment : incrementedSpeed;
    } else {
        var incrementedSpeed = speed + increment;
        var x = incrementedSpeed === 0 ? increment : incrementedSpeed;
        return parseFloat(x.toFixed(2));
    }
}

function decreaseSpeed(speed, increment) {
    if (increment >= 1) {
        var incrementedSpeed = speed > 0 ? speed - increment : speed + increment;
        var direction = speed > 0 ? increment : -increment;
        return incrementedSpeed === 0 ? direction : incrementedSpeed;
    } else {
        var incrementedSpeed = speed - increment;
        var x = incrementedSpeed === 0 ? - increment : incrementedSpeed;
        return parseFloat(x.toFixed(2));
    }
}