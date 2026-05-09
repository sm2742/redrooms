let chunks = [];

const listDevices = list => list.forEach(item => {
    let x = document.createElement("div")
    x.classList.add("mu-2")
    x.innerText = `${item.kind} || ${item.label}`
    el("deviceList").appendChild(x)
})

const startRecording = () => {
    if (!el("audioCheck").checked && !el("videoCheck").checked) return notify("No media selected", 2000)
    const constraints = { audio: el("audioCheck").checked, video: el("videoCheck").checked };
    el("screenCheck").checked ? navigator.mediaDevices.getDisplayMedia(constraints).then(recordStream).catch(err => notify(`The following error occurred: ${err}`, 3000))
        : navigator.mediaDevices.getUserMedia(constraints).then(recordStream).catch(err => notify(`The following error occurred: ${err}`, 3000));
}

const recordStream = stream => {
    let mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();
    el("player").srcObject = stream
    el("recordBtn").innerText = "Stop Recording"
    el("recordBtn").onclick = () => {
        mediaRecorder.stop()
        el("recordBtn").innerText = "Start Recording"
        el("recordBtn").onclick = startRecording
    }

    mediaRecorder.onstop = (e) => {
        stream.getTracks().forEach(track => track.stop());
        const blob = new Blob(chunks);
        notify(`Media Size: ${blob.size} Bytes`, 5000)
        chunks = []
    };

    mediaRecorder.ondataavailable = e => chunks.push(e.data)
}

notify("Checking for media devices...")
if (navigator.mediaDevices) {
    notify("Media recording supported.", 2000)
    el("recordBtn").disabled = false
    el("recordBtn").classList.add("pointer")
    el("recordBtn").onclick = startRecording
    navigator.mediaDevices.enumerateDevices().then(listDevices)
} else {
    notify("Media recording not supported.")
}