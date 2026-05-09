let chunks = [];
const DOMElements = {
    audioCheck: el("audioCheck"),
    videoCheck: el("videoCheck"),
    screenCheck: el("screenCheck"),
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
    if (!DOMElements.audioCheck.checked && !DOMElements.videoCheck.checked) return notify("No media selected", 2000)
    // can add more parameters
    const constraints = { audio: DOMElements.audioCheck.checked, video: DOMElements.videoCheck.checked };
    DOMElements.screenCheck.checked ? navigator.mediaDevices.getDisplayMedia(constraints).then(recordStream).catch(err => notify(`The following error occurred: ${err}`, 3000))
        : navigator.mediaDevices.getUserMedia(constraints).then(recordStream).catch(err => notify(`The following error occurred: ${err}`, 3000));
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
        notify(`Media Size: ${blob.size} Bytes`, 5000)
        chunks = []
        DOMElements.recordBtn.innerText = "Start Recording"
        DOMElements.recordBtn.onclick = startRecording
        DOMElements.snapshot.disabled = true
        DOMElements.snapshot.classList.remove("pointer")
    };

    mediaRecorder.ondataavailable = e => chunks.push(e.data)
}

const snapshot = () => {
    let canvas = document.createElement("canvas")
    canvas.height = DOMElements.player.height
    canvas.width = DOMElements.player.width
    canvas.getContext('2d').drawImage(DOMElements.player, 0, 0);
    notify(canvas)
}

notify("Checking for media devices...")
if (navigator.mediaDevices) {
    notify("Media recording supported.", 2000)
    DOMElements.recordBtn.disabled = false
    DOMElements.recordBtn.classList.add("pointer")
    DOMElements.recordBtn.onclick = startRecording
    DOMElements.snapshot.onclick = snapshot
    navigator.mediaDevices.enumerateDevices().then(listDevices)
} else {
    notify("Media recording not supported.")
}