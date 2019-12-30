let homeLink     = document.getElementById("home-nav-link"),
    projectsLink = document.getElementById("projects-nav-link"),
    aboutLink    = document.getElementById("about-nav-link");

let homeUnderline     = document.getElementById("home-underline"),
    projectsUnderline = document.getElementById("projects-underline"),
    aboutUnderline    = document.getElementById("about-underline");

let homeContainer = document.getElementById("home-container"),
    projectsContainer = document.getElementById("projects-container"),
    aboutContainer = document.getElementById("about-container");

let underlineOffset = "2px";
let lastUnderline = homeUnderline;

homeUnderline.style.left  = underlineOffset;
homeUnderline.style.right = underlineOffset;


function removeLastUnderline() {

    if (lastUnderline) {
        lastUnderline.style.left = "50%";
        lastUnderline.style.right = "50%";
    }

}

function changeUrl(newUrl) {

    if (history.replaceState) {
        history.replaceState({}, null, newUrl);
    }

}

homeLink.addEventListener("click", (event) => {

    changeUrl(window.location.href.split("?")[0]);

    homeContainer.style.left = "50%";
    homeContainer.style.transform = "translate(-50%, -50%)";
    homeContainer.style.opacity = "100%";
    
    projectsContainer.style.left = "100%";
    projectsContainer.style.transform = "translate(0, -50%)";
    projectsContainer.style.opacity = "0%";

    aboutContainer.style.left = "200%";
    aboutContainer.style.transform = "translate(0, -50%)";
    aboutContainer.style.opacity = "0%";

    removeLastUnderline();
    homeUnderline.style.left = underlineOffset;
    homeUnderline.style.right = underlineOffset;

    lastUnderline = homeUnderline;

});

document.getElementById("inline-projects-link").addEventListener("click", (event) => {
    projectsLink.click();
});

projectsLink.addEventListener("click", (event) => {

    // split by "?" to remove search params
    changeUrl(window.location.href.split("?")[0] + '?screen="projects"');

    homeContainer.style.left = "-100%";
    homeContainer.style.transform = "translate(-100%, -50%)";
    homeContainer.style.opacity = "0%";

    projectsContainer.style.left = "50%";
    projectsContainer.style.transform = "translate(-50%, -50%)";
    projectsContainer.style.opacity = "100%";

    aboutContainer.style.left = "100%";
    aboutContainer.style.transform = "translate(0, -50%)";
    aboutContainer.style.opacity = "0%";

    removeLastUnderline();
    projectsUnderline.style.left = underlineOffset;
    projectsUnderline.style.right = underlineOffset;

    lastUnderline = projectsUnderline;

});

aboutLink.addEventListener("click", (event) => {

    changeUrl(window.location.href.split("?")[0] + '?screen="about"');

    homeContainer.style.left = "-200%";
    homeContainer.style.transform = "translate(-100%, -50%)";
    homeContainer.style.opacity = "0%";

    projectsContainer.style.left = "-100%";
    projectsContainer.style.transform = "translate(-100%, -50%)";
    projectsContainer.style.opacity = "0%";
    
    aboutContainer.style.left = "50%";
    aboutContainer.style.transform = "translate(-50%, -50%)";
    aboutContainer.style.opacity = "100%";


    removeLastUnderline();
    aboutUnderline.style.left = underlineOffset;
    aboutUnderline.style.right = underlineOffset;

    lastUnderline = aboutUnderline;

});

// rudimentary url param parsing for when a user navigates back to main page
// from a script page
let paramSearch = new URLSearchParams(window.location.search);
if (paramSearch.has("screen")) {
    let param = paramSearch.get("screen");
    // for some reason param has a pair of quotes in the string,
    // so i've had to include these in the comparison strings
    if (param === '"projects"') {
        projectsLink.click();
    } else if (param === '"about"') {
        aboutLink.click();
    }
}

// have nav fade in if user lands on home page
if (!window.location.href.split("?")[1]) {
    document.getElementById("nav-container").className += " fade-in";
}
