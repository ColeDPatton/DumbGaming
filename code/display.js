function loadHomeDisplay() {
    document.getElementById("canvasId").style.position = "absolute";
    TweenMax.to(".canvas", 1, { scale: 1, top: 0, right: '-1200', display: 'none' });
    TweenMax.to(".slideshow-container", 1, { position: 'relative', left: '0', x: 0, display: 'block' });

    currentSlide(1);
}

function loadGameDisplay() {
    document.getElementById("game-placeholder").style.position = "absolute";
    TweenMax.to("#game-placeholder", 1, { scale: 1, top: 0, left: '-900', display: 'none' });
    TweenMax.to(".canvas", 1, { position: 'relative', x: 0, right: 0, display: 'block' });
    TweenMax.from(".button-container", 1, { position: 'relative', top: 40 });

    var backButton = document.createElement("object");
    if (window.location.href === "http://localhost:4000/" || window.location.href === "http://www.dumbgaming.com/" || window.location.href === "https://www.dumbgaming.com/")
        backButton.innerHTML = '<button class="myButton gameButton" onclick="loadHomeDisplay()"/>Back';
    else
        backButton.innerHTML = '<button class="myButton gameButton" onclick="homeScreen()"/>Back';
}

function loadLevelEditorDisplay() {
    TweenMax.to(".canvas", 1, { position: 'relative', x: 0, right: 0, display: 'block' });

    document.getElementById("canvasId").ontouchstart = (e) => {
        e.preventDefault();
        click(e);
    }
    document.getElementById("canvasId").ontouchmove = (e) => {
        e.preventDefault();
        editBlock(e);
    }
    document.getElementById("canvasId").ontouchend = (e) => {
        e.preventDefault();
        placeBlock(e);
    }
    document.getElementById("sl").ontouchstart = (e) => {
        e.preventDefault();
    }
    if (screen.width > 400) {
        document.addEventListener("mousedown", click);
        document.addEventListener("mousemove", editBlock);
        document.addEventListener("mouseup", placeBlock);
    }
}

const closeMobileNav = () => {
    const burger = document.querySelector(".burger");
    const navMenu = document.querySelector(".mobileNavigation");
    const mainContainer = document.querySelector(".main-container");
    const options = document.querySelector(".options");

    navMenu.classList.remove('mobileNavigationOpen');
    mainContainer.classList.remove('mainContainerMoveDown');
    burger.classList.remove('burgerClicked');
    if (options) options.classList.add('optionsAdjust');
}

var slideIndex = 1;
showSlides(slideIndex);

function plusSlides(n) {
    showSlides(slideIndex += n);
}

function currentSlide(n) {
    showSlides(slideIndex = n);
}

function showSlides(n) {
    var i;
    var slides = document.getElementsByClassName("slides");
    var dots = document.getElementsByClassName("dot");
    if (n > slides.length) { slideIndex = 1 }
    if (n < 1) { slideIndex = slides.length }
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    if (slides[slideIndex - 1]) {
        slides[slideIndex - 1].style.display = "block";
        dots[slideIndex - 1].className += " active";
    }
}

var canvas = document.getElementById("canvasId");
var ctx = canvas.getContext("2d");

const buttonText = ["Bouncy", "Invisible", "Ghost", "Horizontal", "Vertical", "Circular", "Rotatal"];
const buttonTextOffset = [15, 14, 22, 3, 15, 12, 15];

function drawBlocks() {
    var canvas = document.getElementById("canvasId");
    var ctx = canvas.getContext("2d");
    for (var i in blocks) {
        oRec = blocks[i];
        if (gameMode === 0 && oRec.invisible === 1 && !gameStarted && window.location.pathname.includes('creative')) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
            ctx.fillRect(oRec.x, oRec.y, oRec.w, oRec.h);
        } else if (oRec.invisible === 0) {
            ctx.fillStyle = "#000000";
            if (oRec.goal === 1)
                ctx.fillStyle = "#22bb22";
            else if (oRec.deadly === 1)
                ctx.fillStyle = "#bb2222";
            else if (oRec.bouncy === 1)
                ctx.fillStyle = "#cccc00";
            ctx.fillRect(oRec.x, oRec.y, oRec.w, oRec.h);
        }
    }

    if (gameMode === 0 && highlightedBlock != null) {
        var resizeRadius = 10
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#000000';
        ctx.beginPath();
        ctx.arc(highlightedBlock.x, highlightedBlock.y, resizeRadius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(highlightedBlock.x + highlightedBlock.w, highlightedBlock.y, resizeRadius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(highlightedBlock.x, highlightedBlock.y + highlightedBlock.h, resizeRadius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(highlightedBlock.x + highlightedBlock.w, highlightedBlock.y + highlightedBlock.h, resizeRadius, 0, 2 * Math.PI);
        ctx.stroke();

        if (highlightedBlock.xMin != null && highlightedBlock.xSpeed != 0) {
            ctx.beginPath();
            ctx.arc(highlightedBlock.xMin, highlightedBlock.y + (highlightedBlock.h * .5), resizeRadius, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(highlightedBlock.xMax, highlightedBlock.y + (highlightedBlock.h * .5), resizeRadius, 0, 2 * Math.PI);
            ctx.stroke();
        }
        if (highlightedBlock.yMin != null && highlightedBlock.ySpeed != 0) {
            ctx.beginPath();
            ctx.arc(highlightedBlock.x + (highlightedBlock.w * .5), highlightedBlock.yMin, resizeRadius, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(highlightedBlock.x + (highlightedBlock.w * .5), highlightedBlock.yMax, resizeRadius, 0, 2 * Math.PI);
            ctx.stroke();
        }
        if (highlightedBlock.centerX != 0 && highlightedBlock.rotationalSpeed != 0) {
            ctx.beginPath();
            ctx.arc(highlightedBlock.centerX, highlightedBlock.centerY, resizeRadius, 0, 2 * Math.PI);
            ctx.stroke();
        }
    }
}

function clearBackground() {
    var canvas = document.getElementById("canvasId");
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#eeeeff";
    // ctx.fillStyle = "rgba(255, 255, 255, 0.5)";

    ctx.fillRect(0, 0, 800, 400);

    if (gameMode > 0) {
        ctx.font = "20px Georgia";
        ctx.fillStyle = "#000000";
        if (level != 110 && level != 100)
            ctx.fillText("Amount of times you've failed: " + deathCount, 10, 50);
        else if (level === 110) {
            ctx.fillText("Amount of times you've failed: 0", 10, 50);
            ctx.font = "60px Georgia";
            ctx.fillText("THE END.", 100, 300);
        } else {
            ctx.fillText("Amount of times you've failed: " + deathCount, 10, 50);
            ctx.font = "60px Georgia";
            ctx.fillText("FAILURE.", 100, 250);

            ctx.fillText("THE END.", 100, 300);
        }
    }
}

function drawPlayer() {
    ctx.fillStyle = "#993399";
    if (player != null)
        ctx.fillRect(player.xPos, player.yPos, player.width, player.height);
}

function drawTime() {
    ctx.font = "20px Georgia";
    ctx.fillStyle = "#000000";
    setInterval(function () {
        var delta = Date.now() - startTime;
        ctx.fillText(Math.floor(delta / 1000) + "s", 500, 50);
    })
}


//LEVEL EDITOR
//LEVEL EDITOR
//LEVEL EDITOR

function drawBlockFactory() {
    var toolbarWidth = 100;
    var toolbarThickness = 10;

    ctx.fillStyle = "#777799";
    ctx.fillRect(canvas.width - toolbarWidth, 0, toolbarWidth, canvas.height);
    ctx.fillStyle = "#eeeeff";
    ctx.fillRect(canvas.width - toolbarWidth + toolbarThickness, toolbarThickness, toolbarWidth - (2 * toolbarThickness), canvas.height - (2 * toolbarThickness));

    //default
    ctx.fillStyle = "#000000";
    ctx.fillRect(825, 100, 50, -50);

    //deadly
    ctx.fillStyle = "#bb2222";
    ctx.fillRect(825, 200, 50, -50);

    //goal
    ctx.fillStyle = "#22bb22";
    ctx.fillRect(825, 300, 50, -50);

    drawSpeedAdjustmentTriangles();
}

var distanceBetweenButtons = 25;
var x;
var toolbarThickness = 10;
var toolbarWidth = canvas.width;
var toolbarHeight = 100;
var buttonWidth = 100;

function drawBlockEditor() {
    toolbarWidth = canvas.width;
    ctx.fillStyle = "#777799";
    ctx.fillRect(0, canvas.height, toolbarWidth - 100, -toolbarHeight);
    ctx.fillStyle = "#eeeeff";
    ctx.fillRect(toolbarThickness, canvas.height - toolbarThickness, toolbarWidth - toolbarThickness - 100, -(toolbarHeight - (2 * toolbarThickness)));

    toggleBlockEditorButtons();
}

function toggleBlockEditorButtons() {
    ctx.font = "20px Georgia";
    if (highlightedBlock != null) {
        if (highlightedBlock.bouncy) {
            drawToggledButton(0);
        } else {
            drawUntoggledButton(0);
        }
        if (highlightedBlock.invisible) {
            drawToggledButton(1);
        } else {
            drawUntoggledButton(1);
        }
        if (highlightedBlock.ghost) {
            drawToggledButton(2);
        } else {
            drawUntoggledButton(2);
        }
        if (highlightedBlock.xSpeed) {
            drawToggledButton(3);
        } else {
            drawUntoggledButton(3);
        }
        if (highlightedBlock.ySpeed) {
            drawToggledButton(4);
        } else {
            drawUntoggledButton(4);
        }
        if (highlightedBlock.rotationalSpeed) {
            drawToggledButton(5);
        } else {
            drawUntoggledButton(5);
        }
    } else {
        for (var i = 0; i < 6; i++) {
            drawToggledButton(i);
        }
    }
}

function drawUntoggledButton(i) {
    x = distanceBetweenButtons + ((distanceBetweenButtons + buttonWidth) * i);
    ctx.fillStyle = "rgba(0, 0, 0, .4)";
    ctx.fillRect(x, canvas.height - 25, 100, -50);
    ctx.fillStyle = "rgba(0, 0, 0, .9)";
    ctx.fillText(buttonText[i], x + buttonTextOffset[i], 445);
    ctx.fillText("Effect", x + 23, 465);
}

function drawToggledButton(i) {
    x = distanceBetweenButtons + ((distanceBetweenButtons + buttonWidth) * i);
    ctx.fillStyle = "rgba(0, 0, 0, .2)";
    ctx.fillRect(x, canvas.height - 25, 100, -50);
    ctx.fillStyle = "rgba(0, 0, 0, .4)";
    ctx.fillText(buttonText[i], x + buttonTextOffset[i], 445);
    ctx.fillText("Effect", x + 23, 465);
}

var horizontalSpeedTriangleStartingX = 818;
var horizontalSpeedTriangleStartingY = 380;
var verticalSpeedTriangleStartingX = horizontalSpeedTriangleStartingX;
var verticalSpeedTriangleStartingY = horizontalSpeedTriangleStartingY + 50;
var rotatingSpeedTriangleStartingX = verticalSpeedTriangleStartingX;
var rotatingSpeedTriangleStartingY = verticalSpeedTriangleStartingY + 50;
var triangleWidth = 20;
var triangleHeight = 16;
var spaceBetweenTriangles = 45;

function drawSpeedAdjustmentTriangles() {
    if (highlightedBlock != null && highlightedBlock.xSpeed != 0) {
        drawTriangle(horizontalSpeedTriangleStartingX, horizontalSpeedTriangleStartingY, triangleHeight, triangleWidth);
        drawTriangle(horizontalSpeedTriangleStartingX + spaceBetweenTriangles, horizontalSpeedTriangleStartingY - triangleHeight, -triangleHeight, triangleWidth);

        ctx.fillStyle = "rgba(0, 0, 0)";
        ctx.fillText(Math.abs(highlightedBlock.xSpeed), 845, horizontalSpeedTriangleStartingY - 2);
        ctx.fillText("Horizontal", 805, horizontalSpeedTriangleStartingY - 22);
    }
    if (highlightedBlock != null && highlightedBlock.ySpeed != 0) {
        drawTriangle(verticalSpeedTriangleStartingX, verticalSpeedTriangleStartingY, triangleHeight, triangleWidth);
        drawTriangle(horizontalSpeedTriangleStartingX + spaceBetweenTriangles, verticalSpeedTriangleStartingY - triangleHeight, -triangleHeight, triangleWidth);

        ctx.fillStyle = "rgba(0, 0, 0)";
        ctx.fillText(Math.abs(highlightedBlock.ySpeed), 845, verticalSpeedTriangleStartingY - 2);
        ctx.fillText("Vertical", 815, verticalSpeedTriangleStartingY - 22);
    }
    if (highlightedBlock != null && highlightedBlock.rotationalSpeed != 0) {
        drawTriangle(rotatingSpeedTriangleStartingX, rotatingSpeedTriangleStartingY, triangleHeight, triangleWidth);
        drawTriangle(rotatingSpeedTriangleStartingX + spaceBetweenTriangles, rotatingSpeedTriangleStartingY - triangleHeight, -triangleHeight, triangleWidth);

        ctx.fillStyle = "rgba(0, 0, 0)";
        ctx.fillText(highlightedBlock.rotationalSpeed, 845, rotatingSpeedTriangleStartingY - 2);
        ctx.fillText("Rotation", 810, rotatingSpeedTriangleStartingY - 22);
    }
}

function drawTriangle(x, y, height, width) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + (width / 2), y - height);
    ctx.closePath();

    ctx.lineWidth = 3;
    ctx.strokeStyle = '#666666';
    ctx.stroke();
    ctx.fillStyle = "#FFCC00";
    ctx.fill();
}

function loadBlocksIntoTemplateCanvas(blockArray, templateId, rating) {
    if (blockArray.length < 1) {
        alert("there was an error loading the most recently saved level");
        return;
    }
    var public = (blockArray[0].public === 0)
    var tempBlocks = [];
    for (var i in blockArray) {
        tempBlocks.push(new Shape(blockArray[i].x, blockArray[i].y, blockArray[i].w, blockArray[i].h, blockArray[i].goal, blockArray[i].invisible, blockArray[i].ghost, blockArray[i].deadly, blockArray[i].bouncy, blockArray[i].xSpeed, blockArray[i].ySpeed, blockArray[i].centerX, blockArray[i].centerY, blockArray[i].rotationalSpeed, blockArray[i].distanceFromCenter, blockArray[i].angle, blockArray[i].xMin, blockArray[i].xMax, blockArray[i].yMin, blockArray[i].yMax));
    }
    drawBlocksOntoTemplate(tempBlocks, templateId, public, rating);
}

function drawBlocksOntoTemplate(blockArray, templateId, public, rating) {

    var template = document.getElementById(templateId);
    if (templateId.charAt(0) === 'c' && public)
        template.classList.add("setAsPublic");

    var templatectx = template.getContext("2d");
    templatectx.clearRect(0, 0, template.width, template.height);
    template.width = 800;
    template.height = 400;
    templatectx.fillStyle = "#eeeeff";
    templatectx.fillRect(0, 0, 800, 400);

    templatectx.fillStyle = "#000000";

    for (var i in blockArray) {
        oRec = blockArray[i];
        // if (oRec.invisible === 1 && !gameStarted) {
        //     templatectx.fillStyle = "rgba(0, 0, 0, 0.2)";
        //     templatectx.fillRect(oRec.x, oRec.y, oRec.w, oRec.h);
        // } else 
        if (oRec.invisible === 0) {
            templatectx.fillStyle = "#000000";
            if (oRec.goal === 1)
                templatectx.fillStyle = "#22bb22";
            else if (oRec.deadly === 1)
                templatectx.fillStyle = "#bb2222";
            else if (oRec.bouncy === 1)
                templatectx.fillStyle = "#cccc00";

            templatectx.fillRect(oRec.x, oRec.y, oRec.w, oRec.h);
        }
    }

    if (rating) {
        for (let i = 0; i < rating; i++) {
            const x = 110 * (i + 1) - 50;
            const y = 10;
            templatectx.beginPath();
            templatectx.moveTo(x, 0.0 + y);
            templatectx.lineTo(x + 17, 32 + y);
            templatectx.lineTo(x + 50, 33 + y);
            templatectx.lineTo(x + 28, 60 + y);
            templatectx.lineTo(x + 40, 95 + y);
            templatectx.lineTo(x, 75 + y);
            templatectx.lineTo(x - 40, 95 + y);
            templatectx.lineTo(x - 28, 60 + y);
            templatectx.lineTo(x - 50, 33 + y);
            templatectx.lineTo(x - 17, 32 + y);
            templatectx.lineTo(x, 0 + y);
            templatectx.closePath();
            templatectx.lineWidth = 10;
            templatectx.strokeStyle = 'black';
            templatectx.stroke();
            templatectx.fillStyle = "gold";
            templatectx.fill();
        }
    }
}

