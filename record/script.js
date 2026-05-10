let chunks = [];
const DOMElements = {
    audioCheck: el("audioCheck"),
    videoCheck: el("videoCheck"),
    screenCheck: el("screenCheck"),
    faceCamCheck: el("faceCamCheck"),
    autoSaveCheck: el("autoSaveCheck"),
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
        chunks = []
        const btn = generateDlBtn(`Recording-${Date.now()}.mp4`, URL.createObjectURL(blob))
        notify(`Media Size: ${blob.size} Bytes`, btn, 5000)
        DOMElements.recordBtn.innerText = "Start Recording"
        DOMElements.recordBtn.onclick = startRecording
        DOMElements.snapshot.disabled = true
        DOMElements.snapshot.classList.remove("pointer")
    };

    mediaRecorder.ondataavailable = e => chunks.push(e.data)
}

const generateDlBtn = (filename, dataURL) => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataURL;
    const btn = document.createElement("button")
    btn.innerText = "Save"
    btn.classList.add("btn", "pointer", "prim-bg")
    btn.onclick = () => link.click();
    document.addEventListener("keyup", e => e.ctrlKey && !e.shiftKey && e.code == "KeyS" && btn.click())
    DOMElements.autoSaveCheck.checked && btn.click()
    return btn
}

const snapshot = () => {
    const canvas = document.createElement("canvas")
    canvas.height = DOMElements.player.videoHeight
    canvas.width = DOMElements.player.videoWidth
    canvas.style.maxHeight = "20vh"
    canvas.getContext('2d').drawImage(DOMElements.player, 0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL('image/png');
    const btn = generateDlBtn(`Snapshot-${Date.now()}.png`, dataURL)
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
    document.addEventListener("keyup", e => e.ctrlKey && e.shiftKey && e.code == "KeyS" && DOMElements.recordBtn.click())
    document.addEventListener("keyup", e => !e.ctrlKey && !e.shiftKey && e.code == "KeyS" && DOMElements.snapshot.click())
} else {
    notify("Media recording not supported.")
}
DOMElements.autoSaveCheck.checked = localStorage.getItem("as") === "true" ? true : false
DOMElements.autoSaveCheck.addEventListener("change", e=> localStorage.setItem("as", e.target.checked))