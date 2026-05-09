const DOMElements = {
    myID: el("myID"),
}

const id = window.prompt("Enter your peer ID", "Leave empty to get a random ID")
const peer = new Peer(id);

peer.on("open", id => {
    DOMElements.myID.innerText = id
    DOMElements.myID.classList.add("pointer")
    DOMElements.myID.addEventListener("click", () => navigator.clipboard.writeText(id))
});

// const conn = peer.connect("remote-peer-id");

// conn.on("open", () => {
//   conn.send("Hello, peer! 👋");
// });

// // Receive data
// peer.on("connection", (conn) => {
//   conn.on("data", (data) => {
//     console.log("Received:", data);
//   });
// });

// Call a peer, providing our mediaStream
// var call = peer.call("dest-peer-id", mediaStream);

// peer.on("call", function (call) {
//   // Answer the call, providing our mediaStream
//   call.answer(mediaStream);
// });

// call.on("stream", function (stream) {
//   // `stream` is the MediaStream of the remote peer.
//   // Here you'd add it to an HTML video/canvas element.
// });