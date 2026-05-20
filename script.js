import * from "/modules.js"

const el = x => document.getElementById(x)
const ELEMENTS = {
    notificationSpan: el("notificationSpan"),
    logo: document.getElementsByClassName("logo"),
    email: el("email"),
    password: el("password"),
    loginBtn: el("loginBtn"),
    audioCheck: el("audioCheck"),
    videoCheck: el("videoCheck"),
    screenCheck: el("screenCheck"),
    faceCamCheck: el("faceCamCheck"),
    autoSaveDBCheck: el("autoSaveDBCheck"),
    deviceList: el("deviceList"),
    player: el("player"),
    recordBtn: el("recordBtn"),
    snapshot: el("snapshot"),
    myID: el("myID"),
    remoteID: el("remoteID"),
    connectBtn: el("connectBtn"),
    callBtn: el("callBtn"),
    chatPeer: el("chatPeer"),
    callPeer: el("callPeer"),
    myPlayer: el("myPlayer"),
    othPlayer: el("othPlayer"),
    messages: el("messages"),
    textInput: el("textInput"),
    fileInput: el("fileInput"),
    sendBtn: el("sendBtn"),
    files: el("files"),
}
const nf = new Notify(ELEMENTS.notificationSpan, "/notify.mp3")
const cr = new Crypt()
const pr = new Peering()
const tk = new Talk()
const db = new FirestoreDB({
    apiKey: "AIzaSyDS7hzEKNArZOLbbiL2QcM2vxDVeSIo3mk",
    authDomain: "webstatic-c507c.firebaseapp.com",
    projectId: "webstatic-c507c",
    storageBucket: "webstatic-c507c.firebasestorage.app",
    messagingSenderId: "874107128529",
    appId: "1:874107128529:web:b08a75a87b311ebbdd93f0"
})
pr.onPeerOpen = id => { 
    ELEMENTS.myID.innerText = id
    ELEMENTS.callBtn.disabled = false
    ELEMENTS.connectBtn.disabled = false
 }
pr.onErr = err => { nf.notify(err.message || err, null, 3000) }
pr.onConnData = (id, data) => {console.log(id, "=>", data)}
pr.onCallStream = (id, stream) => {
    ELEMENTS.othPlayer.srcObject = stream
    ELEMENTS.callPeer.innerText = id
}
pr.onInCall = id => {
    if (window.confirm(`${id} is calling`)) {
        pr.answerCall(new MediaStream())
    }
}
pr.onConnOpen = id => {
    ELEMENTS.chatPeer.innerText = id
    ELEMENTS.sendBtn.disabled = false
}
ELEMENTS.connectBtn.addEventListener("click", e => {
    pr.connectChat(ELEMENTS.remoteID.value)
})
ELEMENTS.fileInput.addEventListener("change", e => {
    const fl = ELEMENTS.fileInput.files[0]
    const cp = ELEMENTS.autoSaveDBCheck.checked
    cr.encryptFile(fl, cp, txt=>{
        cr.decryptFile(txt, cp, url=>{
            const a = document.createElement("a")
            a.href = url
            a.download = fl.name
            a.click()
        })
    })
})
ELEMENTS.callBtn.addEventListener("click", e => {
    pr.makeCall(ELEMENTS.remoteID.value, new MediaStream())
})
db.onAuthChanged(async user => {
    if (user) {
        ELEMENTS.loginBtn.innerText = "Logout"
        ELEMENTS.email.classList.add("d-none")
        ELEMENTS.password.classList.add("d-none")
        // const files = await db.readDocuments("files")
        // console.log(files);
    } else {
        ELEMENTS.loginBtn.innerText = "Login"
        ELEMENTS.email.classList.remove("d-none")
        ELEMENTS.password.classList.remove("d-none")
    }
})
ELEMENTS.loginBtn.addEventListener("click", async e => {
    if (db.auth.currentUser) {
        await db.logoutUser()
        nf.notify(`logged out`, null, 3000)
    } else {
        const me = await db.loginUser(ELEMENTS.email.value, ELEMENTS.password.value)
        nf.notify(`logged in as ${me.email}`, null, 3000)
    }
})
tk.onRecResult = x => {tk.speak(x.transcript)}

const init = () => {
    for (const x of ELEMENTS.logo) x.onclick = () => window.location.href = "/"
    pr.init(window.prompt("Enter your peer ID\nLeave empty to get a random ID"))
    cr.updatePass(window.prompt("Enter your encryption key", "default") || "default")
}
init()