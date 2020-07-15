var level100blocks = [];
var canvas = document.getElementById("canvasId");

class Shape {
    constructor(x, y, w, h, goal, invisible, ghost, deadly, bouncy, xSpeed, ySpeed, centerX, centerY, rotationalSpeed, distanceFromCenter, angle, xMin, xMax, yMin, yMax, startX, startY, startAngle) {
        if (canvas.width <= 400) {
            this.x = x / 2;
            this.w = w / 2;
        } else {
            this.x = x;
            this.w = w;
        }

        this.angle = angle ? angle : 0;
        this.y = y;
        this.h = h;
        this.goal = goal ? goal : 0;
        this.invisible = invisible ? invisible : 0;
        this.ghost = ghost ? ghost : 0;
        this.deadly = deadly ? deadly : 0;
        this.bouncy = bouncy ? bouncy : 0;
        this.xSpeed = xSpeed ? xSpeed : 0;
        this.ySpeed = ySpeed ? ySpeed : 0;
        this.centerX = centerX ? centerX : 0;
        this.centerY = centerY ? centerY : 0;
        this.rotationalSpeed = rotationalSpeed ? rotationalSpeed : 0;
        this.distanceFromCenter = distanceFromCenter ? distanceFromCenter : 0;
        this.xMin = xMin ? xMin : 0;
        this.xMax = xMax ? xMax : 0;
        this.yMin = yMin ? yMin : 0;
        this.yMax = yMax ? yMax : 0;
        this.startX = JSON.parse(JSON.stringify(x));
        this.startY = JSON.parse(JSON.stringify(y));
        this.startAngle = startAngle ? startAngle : 0;
    }
}

function moveBlocks() {
    for (var i in blocks) {
        currentBlock = blocks[i];
        if (currentBlock.rotationalSpeed == 0) {
            if (currentBlock.ySpeed != null) {
                currentBlock.y += currentBlock.ySpeed;
                collisionCheckY(i);
                if (currentBlock.ySpeed != 0 && (currentBlock.y > currentBlock.yMax ||
                    currentBlock.y + currentBlock.h < currentBlock.yMin))
                    currentBlock.ySpeed *= -1;
            }
            if (currentBlock.xSpeed != 0) {
                currentBlock.x += currentBlock.xSpeed;
                collisionCheckX(i);
                if (currentBlock.x + currentBlock.w > currentBlock.xMax ||
                    currentBlock.x < currentBlock.xMin)
                    currentBlock.xSpeed *= -1;
            }
        } else if (currentBlock.rotationalSpeed != 0) {
            if (currentBlock.ySpeed != null) {
                currentBlock.centerY += currentBlock.ySpeed;
                currentBlock.y += currentBlock.ySpeed;
                collisionCheckY(i);
                if (currentBlock.ySpeed != 0 && (currentBlock.centerY > currentBlock.yMax ||
                    currentBlock.centerY + currentBlock.h < currentBlock.yMin))
                    currentBlock.ySpeed *= -1;
            }
            if (currentBlock.xSpeed != 0) {
                currentBlock.centerX += currentBlock.xSpeed;
                currentBlock.x += currentBlock.xSpeed;
                collisionCheckX(i);
                if (currentBlock.centerX + currentBlock.w > currentBlock.xMax ||
                    currentBlock.centerX < currentBlock.xMin)
                    currentBlock.xSpeed *= -1;
            }

            currentBlock.angle += currentBlock.rotationalSpeed;
            
            currentBlock.x = currentBlock.centerX - currentBlock.w / 2 + (currentBlock.distanceFromCenter * Math.cos(currentBlock.angle));
            collisionCheckX(i);
            currentBlock.y = currentBlock.centerY - currentBlock.h / 2 + (currentBlock.distanceFromCenter * Math.sin(currentBlock.angle));
            collisionCheckY(i);
        }
    }
}

function flashBlocks() {
    if (count >= 30 && level === 8) {
        if (showing == 0) {
            blocks.push(new Shape(150, 300, 20, -20, 0, 0, 0, 1));
            blocks.push(new Shape(200, 300, 20, -50, 0, 0, 0, 1));
            blocks.push(new Shape(250, 300, 20, -20, 0, 0, 0, 1));
            blocks.push(new Shape(300, 300, 20, -50, 0, 0, 0, 1));
            blocks.push(new Shape(350, 300, 20, -20, 0, 0, 0, 1));
            blocks.push(new Shape(400, 300, 20, -50, 0, 0, 0, 1));
            blocks.push(new Shape(450, 300, 20, -20, 0, 0, 0, 1));
            blocks.push(new Shape(500, 300, 20, -50, 0, 0, 0, 1));
            blocks.push(new Shape(600, 270, 40, -20, 0, 0, 0, 0));
            blocks.push(new Shape(650, 220, 40, -20, 0, 0, 0, 0));
            blocks.push(new Shape(650, 120, 40, -20, 0, 0, 0, 0));
            blocks.push(new Shape(600, 70, 40, -20, 0, 0, 0, 0));
            showing = 1;
        } else {
            blocks.pop();
            blocks.pop();
            blocks.pop();
            blocks.pop();
            blocks.pop();
            blocks.pop();
            blocks.pop();
            blocks.pop();
            blocks.pop();
            blocks.pop();
            blocks.pop();
            blocks.pop();
            showing = 0;
        }
        count = 0;
    } else if (count >= 20 && level === 9) {
        if (showing == 0) {
            blocks.push(new Shape(560, 200, 40, -20, 0, 0, 0, 0));
            showing = 1;
        } else if (showing == 1) {
            blocks.pop();
            blocks.push(new Shape(560, 200, 40, -20, 0, 0, 0, 1));
            showing = 2;
        } else if (showing == 2) {
            blocks.pop();
            blocks.push(new Shape(560, 200, 40, -20, 0, 0, 0, 0));
            showing = 1;
        }
        count = 0;
    }
}

function loadAllLevels() {
    //LEVEL 100
    level100blocks.push(new Shape(0, 400, 800, -100, 0, 0, 0, 0));
}
function addArrow(x, y, width, height, num_blocks) {
    var blockheight = height / ((num_blocks + 1) / 2);
    var blockwidth = width / num_blocks;
    var i;
    for (i = 0; i < num_blocks / 2; i++) {
        blocks.push(new Shape(x + (i * blockwidth), y - (i * blockheight), blockwidth, -blockheight, 0, 0, 0, 1));
    }
    for (var j = i; j < num_blocks; j++) {
        blocks.push(new Shape(x + (j * blockwidth), y - ((num_blocks - j - 1) * blockheight), blockwidth, -blockheight, 0, 0, 0, 1));
    }
}
