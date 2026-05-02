const startRecording = () => {
    if (!el("audioCheck").checked && !el("videoCheck").checked) return notify("No media selected", 2000)
    const constraints = { audio: el("audioCheck").checked, video: el("videoCheck").checked };
    let chunks = [];
    let getMedia = navigator.mediaDevices.getUserMedia
    if (el("screenCheck").checked) getMedia = navigator.mediaDevices.getDisplayMedia

    getMedia(constraints).then((stream) => {
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();
            el("player").srcObject = stream
            el("recordBtn").innerText = "Stop Recording"
            el("recordBtn").onclick = stopRecording(mediaRecorder)

            // stop.onclick = () => {
            //     mediaRecorder.stop();
            //     console.log(mediaRecorder.state);
            //     console.log("recorder stopped");
            //     record.style.background = "";
            //     record.style.color = "";
            // };

            // mediaRecorder.onstop = (e) => {
            //     console.log("data available after MediaRecorder.stop() called.");

            //     const clipName = prompt("Enter a name for your sound clip");

            //     const clipContainer = document.createElement("article");
            //     const clipLabel = document.createElement("p");
            //     const audio = document.createElement("audio");
            //     const deleteButton = document.createElement("button");
            //     const mainContainer = document.querySelector("body");

            //     clipContainer.classList.add("clip");
            //     audio.setAttribute("controls", "");
            //     deleteButton.textContent = "Delete";
            //     clipLabel.textContent = clipName;

            //     clipContainer.appendChild(audio);
            //     clipContainer.appendChild(clipLabel);
            //     clipContainer.appendChild(deleteButton);
            //     mainContainer.appendChild(clipContainer);

            //     audio.controls = true;
            //     const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
            //     chunks = [];
            //     const audioURL = URL.createObjectURL(blob);
            //     audio.src = audioURL;
            //     console.log("recorder stopped");

            //     deleteButton.onclick = (e) => {
            //         const evtTgt = e.target;
            //         evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
            //     };
            // };

            mediaRecorder.ondataavailable = e => chunks.push(e.data)
        }).catch(err => notify(`The following error occurred: ${err}`, 3000));
}

const stopRecording = mediaRecorder => {
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
} else {
    notify("getUserMedia not supported.")
}