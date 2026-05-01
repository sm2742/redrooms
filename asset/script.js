const elements = {
    loginBtn: document.getElementById("loginBtn"),
    logo: document.getElementsByClassName("logo"),
}

const init = () => {
    elements.logo.forEach(x => x.onclick = () => window.location.href = "/");
}
init()