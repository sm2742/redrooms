const DOMElements = {
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
}
const peer = new Peer(window.prompt("Enter your peer ID\nLeave empty to get a random ID"));

const addMessage = (from, data) => {
    const dataJSON = JSON.parse(data)
    console.log(dataJSON.file);
    if (dataJSON.text) {
        const _x = document.createElement("span")
        _x.classList.add("btn", "sec-bg", "mu-2")
        _x.innerText = from + ": " + dataJSON.text
        DOMElements.messages.append(_x)
    }
    if (dataJSON.file) {
        // const a = document.createElement("a")
        const _x = document.createElement("span")
        _x.classList.add("btn", "sec-bg", "mu-2")
        _x.innerText = from + ": " + dataJSON.file.name
        DOMElements.messages.append(_x)
    }
}

const sendMessage = conn => {
    const text = DOMElements.textInput.value
    const file = DOMElements.fileInput.files[0]
    console.log(file);
    const data = JSON.stringify({text:text, file:file})
    conn.send(data)
    addMessage("Me", data)
    DOMElements.textInput.value = ""
    DOMElements.fileInput.value = ""
}

const startChat = conn => {
    DOMElements.sendBtn.addEventListener("click", e => sendMessage(conn))
    DOMElements.textInput.addEventListener("keyup", e => !e.ctrlKey && !e.shiftKey && e.code == "Enter" && sendMessage(conn))
    DOMElements.sendBtn.disabled = false
    conn.on("data", data => addMessage(conn.peer, data));
}

const onConnection = conn => {
    conn.on("open", () => {
        DOMElements.chatPeer.innerText = conn.peer
        startChat(conn)
    });
    conn.on("close", () => notify(`Chat connection closed`, null, 2000));
    conn.on("error", err => notify(err.message, null, 2000));
    conn.on("iceStateChanged", state => notify(state, null, 2000));
}

const onCall = call => {
    call.on("stream", stream => {
        DOMElements.callPeer.innerText = call.peer
        DOMElements.othPlayer.srcObject = stream
    });
    call.on("close", () => notify(`Call closed`, null, 2000));
    call.on("error", err => notify(err.message, null, 2000));
}

peer.on("open", id => {
    DOMElements.myID.innerText = id
    DOMElements.myID.classList.add("pointer")
    DOMElements.myID.addEventListener("click", () => navigator.clipboard.writeText(id))
    DOMElements.connectBtn.disabled = false
    DOMElements.callBtn.disabled = false
});
peer.on("disconnected", id => notify(`Peer disconnected`, null, 2000));
peer.on("close", () => notify(`Peer connection closed`, null, 2000));
peer.on("error", err => notify(`${err.type}\n${err.message}`, null, 2000));

peer.on("connection", conn => {
    notify(`${conn.peer} wants to chat.`, null, 2000)
    onConnection(conn)
});
peer.on("call", async (call) => {
    if (window.confirm(`${call.peer} is calling`)) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: { facingMode: "user" } })
            call.answer(stream)
            DOMElements.myPlayer.srcObject = stream
            onCall(call)
        } catch (err) {
            notify(`The following error occurred: ${err}`, null, 3000)
        }
    } else {
        call.close()
    }
});

DOMElements.connectBtn.addEventListener("click", () => {
    const remoteID = DOMElements.remoteID.value
    if (!remoteID) return;
    let conn = peer.connect(remoteID);
    onConnection(conn)
})

DOMElements.callBtn.addEventListener("click", async () => {
    try {
        const remoteID = DOMElements.remoteID.value
        if (!remoteID) return;
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: { facingMode: "user" } })
        let call = peer.call(remoteID, stream);
        DOMElements.myPlayer.srcObject = stream
        onCall(call)
    } catch (err) {
        notify(`The following error occurred: ${err}`, null, 3000)
    }
})

!navigator.mediaDevices && notify(`Media streaming not supported`, null, 3000)

// conn.close()
// call.close()
// peer.listAllPeers(callback)
// peer.destroy()
// peer.reconnect()
// peer.disconnect()