let peer, conn, call;
const DOMElements = {
    myID: el("myID"),
    remoteID: el("remoteID"),
    connectBtn: el("connectBtn"),
    callBtn: el("callBtn"),
    chatPeer: el("chatPeer"),
    callPeer: el("callPeer"),
}

peer = new Peer(window.prompt("Enter your peer ID\nLeave empty to get a random ID"));

peer.on("open", id => {
    DOMElements.myID.innerText = id
    DOMElements.myID.classList.add("pointer")
    DOMElements.myID.addEventListener("click", () => navigator.clipboard.writeText(id))
    DOMElements.connectBtn.disabled = false
    DOMElements.callBtn.disabled = false
});

DOMElements.connectBtn.addEventListener("click", () => {
    const remoteID = DOMElements.remoteID.value
    if (!remoteID) return;
    conn = peer.connect(remoteID);
})

DOMElements.callBtn.addEventListener("click", () => {
    const remoteID = DOMElements.remoteID.value
    if (!remoteID) return;
    call = peer.call(remoteID, new MediaStream());
})

    // conn.on("open", () => {
    // });
// conn.send("Hello, peer! 👋");

// // Receive data
// peer.on("connection", (conn) => {
//   conn.on("data", (data) => {
//     console.log("Received:", data);
//   });
// });

// Call a peer, providing our mediaStream

// peer.on("call", function (call) {
//   // Answer the call, providing our mediaStream
//   call.answer(mediaStream);
// });

// call.on("stream", function (stream) {
//   // `stream` is the MediaStream of the remote peer.
//   // Here you'd add it to an HTML video/canvas element.
// });