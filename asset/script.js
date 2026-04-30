const element = {
    loginBtn: document.getElementById("loginBtn"),
    header: document.getElementById("header"),
    headerLogo: document.getElementById("headerLogo"),
}

const init = () => {
    element.headerLogo.onclick = () => window.location.href = "/"
}
init()