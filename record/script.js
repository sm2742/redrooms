let mediaRecorder, chunks;
// todo: pause/resume/snapshot/savelocal/savedb
const startRecording = () => {
    if (!el("audioCheck").checked && !el("videoCheck").checked) return notify("No media selected", 2000)
    const constraints = { audio: el("audioCheck").checked, video: el("videoCheck").checked };
    if (el("screenCheck").checked) {
        navigator.mediaDevices.getDisplayMedia(constraints).then(recordStream).catch(err => notify(`The following error occurred: ${err}`, 3000));
    } else {
        navigator.mediaDevices.getUserMedia(constraints).then(recordStream).catch(err => notify(`The following error occurred: ${err}`, 3000));
    }
}

const recordStream = stream => {
    chunks = []
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();
    el("player").srcObject = stream
    el("recordBtn").innerText = "Stop Recording"
    el("recordBtn").onclick = stopRecording

    mediaRecorder.onstop = (e) => {
        const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
        notify(`Media Size: ${blob.size} Bytes`, 3000)
    };

    mediaRecorder.ondataavailable = e => chunks.push(e.data)
}

const stopRecording = () => {
    mediaRecorder.stop()
    el("player").srcObject = null
    el("recordBtn").innerText = "Start Recording"
    el("recordBtn").onclick = startRecording
}

notify("Checking for media devices...")
if (navigator.mediaDevices) {
    notify("Media recording supported.", 2000)
    el("recordBtn").disabled = false
    el("recordBtn").classList.add("pointer")
    el("recordBtn").onclick = startRecording
} else {
    notify("Media recording not supported.")
}