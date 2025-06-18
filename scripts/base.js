const hamburger = document.querySelector("#menu");
const navigation = document.querySelector("nav");
const navLinks = document.querySelector("nav a");

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle("open");
    navigation.classList.toggle("open");
})

window.addEventListener("scroll", () => {
    const mainMenu = document.querySelector("#main-menu");
    if (window.scrollY > 30) {
        mainMenu.classList.add("scrolled");
    } else {
        mainMenu.classList.remove("scrolled");
    }
    hamburger.classList.remove("open");
    navigation.classList.remove("open");
})