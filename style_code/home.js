const navSlide = () => {
    const burger = document.querySelector(".burger");
    const navMenu = document.querySelector(".mobileNavigation");
    const mainContainer = document.querySelector(".main-container");
    const topSection = document.querySelector(".topSection");
    const options = document.querySelector(".options");

    burger.addEventListener('click', () => {
        navMenu.classList.toggle('mobileNavigationOpen');
        mainContainer.classList.toggle('mainContainerMoveDown');
        topSection.classList.toggle('mainContainerMoveDown');
        burger.classList.toggle('burgerClicked');
        options.classList.toggle('optionsAdjust');
    });
}

const newGame = () => {
    const newGameButton = document.querySelector("#playGame");
    const newGameBackButton = document.querySelector("#playGameBack");
    const playGameCard = document.querySelector(".playGameCard");
    const newGameCard = document.querySelector(".newGameCard");

    newGameButton.addEventListener('click', () => {
        playGameCard.classList.toggle('playGameCardOn');
        newGameCard.classList.toggle('newGameCardOn');
    });
    newGameBackButton.addEventListener('click', () => {
        playGameCard.classList.toggle('playGameCardOn');
        newGameCard.classList.toggle('newGameCardOn');
    });
}

const statsToggle = () => {
    const statsToggle = document.querySelector(".stats-toggle");
    const playerStats = document.querySelector(".playerStats");

    if (statsToggle) {
        statsToggle.addEventListener('click', () => {
            playerStats.classList.toggle('showStats');
        });
    }
}

const loadHomescreenJS = () => {
    navSlide();
    newGame();
    statsToggle();
}

loadHomescreenJS();