const el = x => document.getElementById(x)

const elements = {
    loginBtn: el("loginBtn") || null,
    logo: document.getElementsByClassName("logo"),
}

const notify = (msg, timeoutms) => {
    el("notificationSpan").innerText = msg
    timeout && setTimeout(() => el("notificationSpan").innerText = "", timeoutms);
}

const init = () => {
    for (const x of elements.logo) x.onclick = () => window.location.href = "/"
}
init()