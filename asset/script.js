let timeout;
const el = x => document.getElementById(x)

const elements = {
    loginBtn: el("loginBtn") || null,
    notificationSpan: el("notificationSpan"),
    logo: document.getElementsByClassName("logo"),
}

const notify = (msg, body, timeoutms) => {
    if (timeout) {
        clearTimeout(timeout)
        timeout = null
    }
    elements.notificationSpan.innerText = msg
    elements.notificationSpan.classList.remove("d-none")
    if (timeoutms) timeout = setTimeout(() => elements.notificationSpan.classList.add("d-none"), timeoutms);
    if (body) {
        body.style.maxHeight = "35vh"
        elements.notificationSpan.append(body)
    }
}

const init = () => {
    for (const x of elements.logo) x.onclick = () => window.location.href = "/"
}
init()