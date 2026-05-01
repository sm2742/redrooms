const el = x => document.getElementById(x)

el("warningSpan").innerText = "Checking for media devices..."

if (navigator.mediaDevices) {
    el("warningSpan").innerText = "getUserMedia supported."
    el("recordBtn").disabled = false
    el("recordBtn").classList.add("pointer")
    setTimeout(()=>{
        el("warningSpan").innerText = ""
    }, 800)

    const constraints = { audio: true };
    let chunks = [];

    navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
            const mediaRecorder = new MediaRecorder(stream);

            record.onclick = () => {
                mediaRecorder.start();
                console.log(mediaRecorder.state);
                console.log("recorder started");
                record.style.background = "red";
                record.style.color = "black";
            };

            stop.onclick = () => {
                mediaRecorder.stop();
                console.log(mediaRecorder.state);
                console.log("recorder stopped");
                record.style.background = "";
                record.style.color = "";
            };

            mediaRecorder.onstop = (e) => {
                console.log("data available after MediaRecorder.stop() called.");

                const clipName = prompt("Enter a name for your sound clip");

                const clipContainer = document.createElement("article");
                const clipLabel = document.createElement("p");
                const audio = document.createElement("audio");
                const deleteButton = document.createElement("button");
                const mainContainer = document.querySelector("body");

                clipContainer.classList.add("clip");
                audio.setAttribute("controls", "");
                deleteButton.textContent = "Delete";
                clipLabel.textContent = clipName;

                clipContainer.appendChild(audio);
                clipContainer.appendChild(clipLabel);
                clipContainer.appendChild(deleteButton);
                mainContainer.appendChild(clipContainer);

                audio.controls = true;
                const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
                chunks = [];
                const audioURL = URL.createObjectURL(blob);
                audio.src = audioURL;
                console.log("recorder stopped");

                deleteButton.onclick = (e) => {
                    const evtTgt = e.target;
                    evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
                };
            };

            mediaRecorder.ondataavailable = (e) => {
                chunks.push(e.data);
            };
        })
        .catch((err) => {
            console.error(`The following error occurred: ${err}`);
        });
} else {
    el("warningSpan").innerText = "getUserMedia not supported."
    el("inputDiv").style.display = "none"
}