const elements = {
    loginBtn: document.getElementById("loginBtn"),
    logo: document.getElementsByClassName("logo"),
}

const init = () => {
    for (const x of elements.logo) x.onclick = () => window.location.href = "/"
}
init()