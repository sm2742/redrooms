let chunks = [];
const DOMElements = {
    audioCheck: el("audioCheck"),
    videoCheck: el("videoCheck"),
    screenCheck: el("screenCheck"),
    faceCamCheck: el("faceCamCheck"),
    deviceList: el("deviceList"),
    player: el("player"),
    recordBtn: el("recordBtn"),
    snapshot: el("snapshot"),
}

const listDevices = list => list.forEach(item => {
    let x = document.createElement("div")
    x.classList.add("mu-2")
    x.innerText = `${item.kind} || ${item.label}`
    DOMElements.deviceList.appendChild(x)
})

const startRecording = () => {
    if (!DOMElements.audioCheck.checked && !DOMElements.videoCheck.checked) return notify("No media selected", null, 2000)

    DOMElements.screenCheck.checked ? navigator.mediaDevices.getDisplayMedia({ audio: DOMElements.audioCheck.checked, video: DOMElements.videoCheck.checked }).then(recordStream).catch(err => notify(`The following error occurred: ${err}`, null, 3000))
        : navigator.mediaDevices.getUserMedia({ audio: DOMElements.audioCheck.checked, video: { facingMode: DOMElements.faceCamCheck.checked ? "user" : "environment" } }).then(recordStream).catch(err => notify(`The following error occurred: ${err}`, null, 3000));
}

const recordStream = stream => {
    let mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();
    DOMElements.player.srcObject = stream
    DOMElements.recordBtn.innerText = "Stop Recording"
    DOMElements.recordBtn.onclick = () => mediaRecorder.stop()
    DOMElements.snapshot.disabled = false
    DOMElements.snapshot.classList.add("pointer")

    mediaRecorder.onstop = e => {
        stream.getTracks().forEach(track => track.stop());
        const blob = new Blob(chunks);
        notify(`Media Size: ${blob.size} Bytes`, null, 5000)
        chunks = []
        DOMElements.recordBtn.innerText = "Start Recording"
        DOMElements.recordBtn.onclick = startRecording
        DOMElements.snapshot.disabled = true
        DOMElements.snapshot.classList.remove("pointer")
    };

    mediaRecorder.ondataavailable = e => chunks.push(e.data)
}

const snapshot = () => {
    const canvas = document.createElement("canvas")
    canvas.style.maxHeight = "30vh"
    canvas.getContext('2d').drawImage(DOMElements.player, 0, 0, DOMElements.player.videoWidth, DOMElements.player.videoHeight);

    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `Snapshot-${Date.UTC()}.png`;
    link.href = dataURL;

    const btn = document.createElement("button")
    btn.innerText = "Save"
    btn.classList.add("btn", "pointer", "prim-bg")
    btn.onclick = () => link.click();

    const div = document.createElement("div")
    div.classList.add("flex", "flex-column")
    div.append(canvas, btn)
    notify("Snapshot Captured", div, 5000)
}

notify("Checking for media devices...")
if (navigator.mediaDevices) {
    notify("Media recording supported.", null, 2000)
    DOMElements.recordBtn.disabled = false
    DOMElements.recordBtn.classList.add("pointer")
    DOMElements.recordBtn.onclick = startRecording
    DOMElements.snapshot.onclick = snapshot
    navigator.mediaDevices.enumerateDevices().then(listDevices)
} else {
    notify("Media recording not supported.")
}