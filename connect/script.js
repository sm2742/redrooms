const DOMElements = {
    myID: el("myID"),
}
const peer = new Peer();

peer.on("open", id => {
    DOMElements.myID.innerText = `${id}`
    DOMElements.myID.classList.add("pointer")
    DOMElements.myID.addEventListener("click", () => navigator.clipboard.writeText(id))
});
