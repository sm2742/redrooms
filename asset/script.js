const el = x => document.getElementById(x)

const elements = {
    loginBtn: el("loginBtn") || null,
    notificationSpan: el("notificationSpan"),
    logo: document.getElementsByClassName("logo"),
}

const notify = (msg, body, timeoutms) => {
    elements.notificationSpan.innerText = msg
    body && elements.notificationSpan.append(body)
    elements.notificationSpan.classList.remove("d-none")
    timeoutms && setTimeout(() => elements.notificationSpan.classList.add("d-none"), timeoutms);
}

const init = () => {
    for (const x of elements.logo) x.onclick = () => window.location.href = "/"
}
init()