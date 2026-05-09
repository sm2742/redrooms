const el = x => document.getElementById(x)

const elements = {
    loginBtn: el("loginBtn") || null,
    notificationSpan: el("notificationSpan"),
    logo: document.getElementsByClassName("logo"),
}

const notify = (msgBody, timeoutms) => {
    elements.notificationSpan.innerHTML = msgBody
    elements.notificationSpan.style.display = "inline"
    timeoutms && setTimeout(() => elements.notificationSpan.style.display = "none", timeoutms);
}

const init = () => {
    for (const x of elements.logo) x.onclick = () => window.location.href = "/"
}
init()