const navSlide = () => {
    const burger = document.querySelector(".burger");
    const navMenu = document.querySelector(".mobileNavigation");
    const mainContainer = document.querySelector(".main-container");
    const footer = document.querySelector("footer");

    burger.addEventListener('click', () => {
        navMenu.classList.toggle('mobileNavigationOpen');
        mainContainer.classList.toggle('mainContainerMoveDown');
        burger.classList.toggle('burgerClicked');
        footer.classList.toggle('footerAdjust');
    });
}

navSlide();