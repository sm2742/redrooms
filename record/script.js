let mediaRecorder, chunks = [];
// todo: pause/resume/switchcam/snapshot/savelocal/savedb
const listDevices = list => {
    list.forEach(item => {
        let x = document.createElement("div")
        x.classList.add("flex mu-2 pointer")
        x.innerText = `${item.kind} || ${item.label}`
        x.style.borderRadius = "8px"
        x.style.padding = "8px 12px"
        el("deviceList").appendChild(x)
    })
}

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
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();
    el("player").srcObject = stream
    el("recordBtn").innerText = "Stop Recording"
    el("recordBtn").onclick = stopRecording

    mediaRecorder.onstop = (e) => {
        stream.getTracks().forEach(track => track.stop());
        const blob = new Blob(chunks);
        chunks = []
        notify(`Media Size: ${blob.size} Bytes`, 5000)
    };

    mediaRecorder.ondataavailable = e => chunks.push(e.data)
}

const stopRecording = () => {
    mediaRecorder.stop()
    el("recordBtn").innerText = "Start Recording"
    el("recordBtn").onclick = startRecording
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