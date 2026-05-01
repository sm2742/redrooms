const el = x => document.getElementById(x)

const elements = {
    loginBtn: el("loginBtn") || null,
    logo: document.getElementsByClassName("logo"),
}

const notify = (msg, timeoutms) => {
    el("notificationSpan").innerText = msg
    el("notificationSpan").display = "inline"
    timeoutms && setTimeout(() => el("notificationSpan").display = "none", timeoutms);
}

const init = () => {
    for (const x of elements.logo) x.onclick = () => window.location.href = "/"
}
init()