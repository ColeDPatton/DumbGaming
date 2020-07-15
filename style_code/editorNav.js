const navSlide = () => {
    const burger = document.querySelector(".burger");
    const navMenu = document.querySelector(".mobileNavigation");
    const mainContainer = document.querySelector(".main-container");
    const options = document.querySelector(".options");

    burger.addEventListener('click', () => {
        navMenu.classList.toggle('mobileNavigationOpen');
        mainContainer.classList.toggle('mainContainerMoveDown');
        burger.classList.toggle('burgerClicked');
    });
}

const loadEditorScreenJS = () => {
    navSlide();
}

loadEditorScreenJS();