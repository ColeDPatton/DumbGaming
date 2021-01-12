// var addLevelToCampaignButton = document.createElement("object");
// addLevelToCampaignButton.innerHTML = '<button id="addLevelToCampaign" onclick="addLevelToCampaign()" display="none"/>add level to campaign';

function levelEditor() {

    loadLevelEditorDisplay();

    for (k = 0; k < document.getElementsByClassName("selected-level").length; k++) {
        document.getElementsByClassName("selected-level").item(k).classList.remove("selected-level");
    }
    document.getElementById("privateLevelOptions").style.display = "block";
    document.getElementById("communityLevelOptions").style.display = "none";
    document.getElementById("levelOptions").style.display = "block";
    document.getElementById("private-level-name").innerHTML = null;

    canvas = document.getElementById("canvasId");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 900;
    canvas.height = 500;
    clearBackground();
    resetLevelEditor();
    drawBlockFactory();
    drawBlockEditor();
    drawPlayer();
    gameMode = 0;
}

function resetLevelEditor() {
    canvas = document.getElementById("canvasId");
    resetPlayer();
    blocks = [];
    blocks.push(new Shape(0, 400, 200, -100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0));
    drawBlocks();
}

function closeLevelEditor() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 800;
    canvas.height = 400;
}

function editLevel() {
    die();
    deathCount--;
    gameStarted = false;

    blocks.forEach(currentBlock => {
        currentBlock.x = currentBlock.startX;
        currentBlock.y = currentBlock.startY;
        currentBlock.angle = currentBlock.startAngle;
    });
}

function saveLevel() {
    var newLevel = true;
    var newName = document.getElementById("newLevelName").value;
    if (player.username === null) {
        alert("Sign up or log in to save your custom levels")
        return;
    }
    if (!newName) {
        const level = document.getElementsByClassName("selected-level")[0];
        if (level) {
            newName = level.id.slice(8, level.id.length);
            newLevel = false;
        } else {
            alert("Can't save the level without a name!")
            return;
        }
    }
    editLevel();
    socket.emit('saveLevel', { blocks: blocks, levelName: newName, newLevel: newLevel });
}
function levelSaved(success) {
    if (success) {
        alert("level saved");
    } else {
        alert("There was a problem saving the level. Please try again");
    }
}
function loadRecentLevel() {
    if (player.username === null) {
        alert("Sign up or log in to save your custom levels")
        return;
    }
    socket.emit('loadRecentLevel', { username: player.username });
}
function loadCustomLevel() {
    if (player.username === null) {
        alert("Sign up or log in to save your custom levels")
        return;
    }
    socket.emit('loadCustomLevel');
}
function loadBlocksFromArray(blockArray) {
    if (blockArray.length < 1) {
        alert("there was an error loading the most recently saved level");
        return;
    }
    blocks.length = 0;
    for (var i in blockArray) {
        blocks.push(new Shape(blockArray[i].x, blockArray[i].y, blockArray[i].w, blockArray[i].h, blockArray[i].goal, blockArray[i].invisible, blockArray[i].ghost, blockArray[i].deadly, blockArray[i].bouncy, blockArray[i].xSpeed, blockArray[i].ySpeed, blockArray[i].centerX, blockArray[i].centerY, blockArray[i].rotationalSpeed, blockArray[i].distanceFromCenter, blockArray[i].angle, blockArray[i].xMin, blockArray[i].xMax, blockArray[i].yMin, blockArray[i].yMax));
    }

    if (gameMode < 1) {
        editLevel();
    }
    clearBackground();
    drawBlocks();
}

function toggleBouncy() {
    if (highlightedBlock.bouncy === 0) {
        highlightedBlock.bouncy = 1;
    } else {
        highlightedBlock.bouncy = 0;
    }
}

function toggleInvisible() {
    if (highlightedBlock.invisible === 0) {
        highlightedBlock.invisible = 1;
    } else {
        highlightedBlock.invisible = 0;
    }
}

function toggleGhost() {
    if (highlightedBlock.ghost === 0) {
        highlightedBlock.ghost = 1;
    } else {
        highlightedBlock.ghost = 0;
    }
}
function toggleHorizontalSpeed() {
    if (highlightedBlock.xSpeed === 0) {
        highlightedBlock.xSpeed = 2;
        highlightedBlock.xMin = highlightedBlock.x - 100;
        highlightedBlock.xMax = highlightedBlock.x + highlightedBlock.w + 100;
    } else {
        highlightedBlock.xSpeed = 0;
        highlightedBlock.xMin = 0;
        highlightedBlock.xMax = 0;
    }
}
function toggleVerticalSpeed() {
    if (highlightedBlock.ySpeed === 0) {
        highlightedBlock.ySpeed = 2;
        highlightedBlock.yMin = highlightedBlock.y + highlightedBlock.h - 100;
        highlightedBlock.yMax = highlightedBlock.y + 100;
    } else {
        highlightedBlock.ySpeed = 0;
        highlightedBlock.yMin = 0;
        highlightedBlock.yMax = 0;
    }
}

function toggleRotationalSpeed() {
    if (highlightedBlock.rotationalSpeed === 0) {
        var startingXDistanceFromCenter = 100;
        highlightedBlock.centerX = highlightedBlock.x + (highlightedBlock.w / 2) + startingXDistanceFromCenter;
        highlightedBlock.centerY = highlightedBlock.y + (highlightedBlock.h / 2);
        highlightedBlock.rotationalSpeed = .05;
        highlightedBlock.distanceFromCenter = Math.sqrt((startingXDistanceFromCenter * startingXDistanceFromCenter) + ((highlightedBlock.centerY - highlightedBlock.y) * (highlightedBlock.centerY - highlightedBlock.y)));
        highlightedBlock.angle = Math.PI;
        highlightedBlock.startAngle = Math.PI;
    } else {
        highlightedBlock.rotationalSpeed = 0;
        highlightedBlock.distanceFromCenter = 0;
        highlightedBlock.angle = 0;
    }
}