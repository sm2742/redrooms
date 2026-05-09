const DOMElements = {
    myID: el("myID"),
}
const peer = new Peer();

peer.on("open", id => DOMElements.myID.innerText = id);
