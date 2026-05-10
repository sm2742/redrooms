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
}

const onCall = call => {
    DOMElements.callPeer.innerText = call.peer
}

peer.on("open", id => {
    DOMElements.myID.innerText = id
    DOMElements.myID.classList.add("pointer")
    DOMElements.myID.addEventListener("click", () => navigator.clipboard.writeText(id))
    DOMElements.connectBtn.disabled = false
    DOMElements.callBtn.disabled = false
});
peer.on("connection", onConnection);
peer.on("call", onCall);

DOMElements.connectBtn.addEventListener("click", () => {
    const remoteID = DOMElements.remoteID.value
    if (!remoteID) return;
    let conn = peer.connect(remoteID);
    onConnection(conn)
})

DOMElements.callBtn.addEventListener("click", () => {
    const remoteID = DOMElements.remoteID.value
    if (!remoteID) return;
    let call = peer.call(remoteID, new MediaStream());
    onCall(call)
})

// conn.on("open", () => {
// });
// conn.send("Hello, peer! 👋");

// // Receive data
// conn.on("data", (data) => {
//   console.log("Received:", data);
// });

// Call a peer, providing our mediaStream

//   call.answer(new);

// call.on("stream", function (stream) {
//   // `stream` is the MediaStream of the remote peer.
//   // Here you'd add it to an HTML video/canvas element.
// });