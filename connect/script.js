const DOMElements = {
    myID: el("myID"),
    remoteID: el("remoteID"),
    connectBtn: el("connectBtn"),
    callBtn: el("callBtn"),
    chatPeer: el("chatPeer"),
    callPeer: el("callPeer"),
}
const peer = new Peer(window.prompt("Enter your peer ID\nLeave empty to get a random ID"));

const onConnection = conn => {
    DOMElements.chatPeer.innerText = conn.peer
    conn.on("data", data => console.log("Received:", data));
    conn.on("close", () => notify(`Chat connection closed`, null, 2000));
    conn.on("error", err => console.log(err));
    conn.on("iceStateChanged", state => console.log(state));

    conn.send("Hello, peer! 👋");
}

const onCall = call => {
    call.on("stream", stream => {
        DOMElements.callPeer.innerText = call.peer
    });
    call.on("close", () => notify(`Call closed`, null, 2000));
    call.on("error", err => console.log(err));
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
peer.on("error", err => console.log(err.type, err));

peer.on("connection", conn => notify(`${conn.peer} wants to chat.`, null, 2000) && onConnection(conn));
peer.on("call", call => {
    if(window.confirm(`${call.peer} is calling`)){
        call.answer(new MediaStream())
        onCall(call)
    }
});

DOMElements.connectBtn.addEventListener("click", () => {
    const remoteID = DOMElements.remoteID.value
    if (!remoteID) return;
    let conn = peer.connect(remoteID);
    conn.on("open", () => onConnection(conn));
})

DOMElements.callBtn.addEventListener("click", () => {
    const remoteID = DOMElements.remoteID.value
    if (!remoteID) return;
    let call = peer.call(remoteID, new MediaStream());
    onCall(call)
})