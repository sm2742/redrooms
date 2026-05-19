"use strict"
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js'
import { getFirestore, collection, addDoc, getDoc, getDocs, doc, updateDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js'

const el = x => document.getElementById(x)
const ELEMENTS = {
    loginBtn: el("loginBtn") || null,
    notificationSpan: el("notificationSpan"),
    logo: document.getElementsByClassName("logo"),
}

class Notify {
    constructor(notificationSpan, audioFile) {
        this.sound = new Audio(audioFile)
        this.timeout = null;
        this.notificationSpan = notificationSpan
    }
    notify(msg, body, timeoutms) {
        this.sound.pause()
        if (this.timeout) {
            clearTimeout(this.timeout)
            this.timeout = null
        }
        this.notificationSpan.innerText = msg
        this.sound.play()
        this.notificationSpan.classList.remove("d-none")
        if (timeoutms) this.timeout = setTimeout(() => this.notificationSpan.classList.add("d-none"), timeoutms);
        if (body) {
            body.style.maxHeight = "35vh"
            this.notificationSpan.append(body)
        }
    }
}
const nf = new Notify(ELEMENTS.notificationSpan, "/notify.mp3")

class Crypt {
    static baseStr = "CDE\\yzABFGvwx~!@#$%^&*()_+-67890 `:;HIJKL=|mnopqPQRSTUVWX}{[]\"ghijklYZ12345MNOdefabcrstu'?><,./"
    constructor(pass = "default") {
        this.updatePass(pass)
    }
    updatePass(pass) {
        if (!pass || typeof pass !== "string") { throw new Error("Enter a valid passkey") }
        if (pass.length <= 2 || pass.length >= 91) { throw new Error("Passkey must be 3 to 90 chars long") }
        this.pass = pass
        const regex = new RegExp(`[${this.pass}]`, 'g');
        this.str = Crypt.baseStr.replace(regex, '') + this.pass
    }
    encryptText(txt) {
        if (!txt || typeof txt !== "string") { throw new Error("Unsupported Data Type") }
        const pl = this.pass.length
        const sl = this.str.length
        let x = ""
        for (let i = 0; i < txt.length; i++) x += this.str[(this.str.indexOf(txt[i]) + pl) % sl]
        return x
    }
    decryptText(txt) {
        if (!txt || typeof txt !== "string") { throw new Error("Unsupported Data Type") }
        const pl = this.pass.length
        const sl = this.str.length
        let x = ""
        for (let i = 0; i < txt.length; i++) x += this.str[(this.str.indexOf(txt[i]) - pl) % sl]
        return x
    }
    async compressFile(fileOrBlob) {
        try {
            const readableStream = fileOrBlob.stream()
            const compressedStream = readableStream.pipeThrough(new CompressionStream("gzip"))
            const compressedBlob = await new Response(compressedStream).blob();
            return compressedBlob
        } catch (e) { throw e }
    }
    async decompressFile(url) {
        try {
            const res = await fetch(url);
            const resBlob = await res.blob()
            const readableStream = resBlob.stream()
            const decompressedStream = readableStream.pipeThrough(new DecompressionStream("gzip"))
            const decompressedBlob = await new Response(decompressedStream).blob();
            return decompressedBlob
        } catch (e) { throw e }
    }
    async encryptFile(file, compression, cb) {
        try {
            const reader = new FileReader();
            reader.onload = e => cb(this.encryptText(e.target.result))
            if (compression) {
                const compressed = await this.compressFile(file)
                reader.readAsDataURL(compressed);
            } else {
                reader.readAsDataURL(file);
            }
        } catch (e) { throw e }
    }
    async decryptFile(text, compression, cb) {
        try {
            const fileText = this.decryptText(text)
            if (compression) {
                const decompressed = await this.decompressFile(fileText)
                cb(URL.createObjectURL(decompressed))   // object url
            } else {
                cb(fileText)    // file url
            }
        } catch (e) { throw e }
    }
}
const cr = new Crypt()

class Peering {
    get callpeer() { return this.call?.peer }
    get connpeer() { return this.conn?.peer }
    reset() {
        this.peer?.destroy()
        this.myid = null
        this.conn = null
        this.call = null
    }
    connectChat = id => {
        if (this.myid) {
            const conn = this.peer?.connect(id)
            this._handleconn(conn)
        }
    }
    makeCall = (id, stream) => {
        if (this.myid) {
            const call = this.peer?.call(id, stream)
            this._handlecall(call)
        }
    }
    answerCall = stream => {
        if (this.myid && this.call) {
            this.call.answer(stream)
        }
    }
    send = data => {
        if (this.myid && this.conn) {
            this.conn.send(data)
        }
    }
    init(id = null, options = null) {
        this.myid && this.reset()
        try {
            this.peer = new Peer(id, options)
        } catch (e) { throw e }
        this.peer.on("open", id => {
            this.myid = id
            this.onPeerOpen && this.onPeerOpen(id)
        });
        this.peer.on("disconnected", id => { this.onPeerDisc && this.onPeerDisc(id) });
        this.peer.on("error", err => { this.onErr && this.onErr(err) });
        this.peer.on("close", () => {
            this.reset()
            this.onPeerClose && this.onPeerClose()
        });
        this.peer.on("connection", conn => {
            this._handleconn(conn)
            this.onInConn && this.onInConn(conn.peer)
        });
        this.peer.on("call", call => {
            this._handlecall(call)
            this.onInCall && this.onInCall(call.peer)
        });
        // peer.listAllPeers(callback)
        // peer.destroy()
        // peer.reconnect()
        // peer.disconnect()
    }
    _handleconn(conn) {
        conn.on("data", data => { this.onConnData && this.onConnData(data) });
        conn.on("open", () => {
            this.conn = conn
            this.onConnOpen && this.onConnOpen()
        });
        conn.on("close", () => {
            this.conn = null
            this.onConnClose && this.onConnClose()
        });
        conn.on("error", err => { this.onErr && this.onErr(err) });
        conn.on("iceStateChanged", state => { this.onConnStateChange && this.onConnStateChange(state) });
        // conn.close()
    }
    _handlecall(call) {
        call.on("stream", stream => { this.onCallStream && this.onCallStream(stream) })
        call.on("open", () => {
            console.log("test call open");
        });
        call.on("close", () => {
            this.call = null
            this.onCallClose && this.onCallClose()
        })
        call.on("error", err => { this.onErr && this.onErr(err) })
        this.call = call
        // call.close()
    }
}
const pr = new Peering()

class FirestoreDB {
    constructor(config) {
        const app = initializeApp(config);
        this.auth = getAuth(app);
        this.db = getFirestore(app);
    }
    loginUser = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
            return userCredential.user
        } catch (e) { throw e }
    }
    logoutUser = async () => {
        try {
            await signOut(this.auth);
        } catch (e) { throw e }
    }
    createDocument = async (collectionName, data) => {
        try {
            const docRef = await addDoc(collection(this.db, collectionName), data);
            return docRef.id;
        } catch (e) { throw e }
    }
    readDocument = async (collectionName, documentId) => {
        try {
            const docSnap = await getDoc(doc(this.db, collectionName, documentId));
            if (docSnap.exists()) {
                return docSnap.data();
            }
            throw new Error("Doc not found")
        } catch (e) { throw e }
    }
    readDocuments = async (collectionName) => {
        try {
            const querySnapshot = await getDocs(collection(this.db, collectionName));
            const docsList = [];
            querySnapshot.forEach((doc) => {
                docsList.push({ id: doc.id, ...doc.data() });
            });
            return docsList;
        } catch (e) { throw e }
    }
    updateDocument = async (collectionName, documentId, updatedData) => {
        try {
            const docRef = doc(this.db, collectionName, documentId);
            await updateDoc(docRef, updatedData);
        } catch (e) { throw e }
    }
    deleteDocument = async (collectionName, documentId) => {
        try {
            await deleteDoc(doc(this.db, collectionName, documentId));
        } catch (e) { throw e }
    }
}
const db = new FirestoreDB({
    apiKey: "AIzaSyDS7hzEKNArZOLbbiL2QcM2vxDVeSIo3mk",
    authDomain: "webstatic-c507c.firebaseapp.com",
    projectId: "webstatic-c507c",
    storageBucket: "webstatic-c507c.firebasestorage.app",
    messagingSenderId: "874107128529",
    appId: "1:874107128529:web:b08a75a87b311ebbdd93f0"
})

class Talk {
    constructor() {
        this.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.synth = window.speechSynthesis
        if (!this.SpeechRecognition || !this.synth) { throw new Error("Voice assistance not available") }
        const recognition = new SpeechRecognition();
        recognition.onresult = e => { this.onRecResult && this.onRecResult(e.results[0][0]) }
        recognition.onnomatch = e => { this.onRecNoMatch && this.onRecNoMatch(e) }
        recognition.onerror = e => { this.onErr && this.onErr(e.error) }
        recognition.onspeechend = () => { recognition.stop() }
        this.recognition = recognition
        this.synth.onvoiceschanged = this.loadVoices
        this.loadVoices()
    }
    async localLang(lang = "en-US", cb) {
        const stat = await this.SpeechRecognition.available({ langs: [lang], processLocally: true })
        if (stat === "unavailable") { cb(`${lang} is not available to download`) }
        else if (result === "available") { this.recognition.start() }
        else {
            const dlStat = await this.SpeechRecognition.install({ langs: [lang], processLocally: true })
            if (dlStat) { cb(`${lang} language pack downloaded. Start recognition again.`) }
            else { cb(`${lang} language pack failed to download. Try again later.`) }
        }
    }
    loadVoices() { this.voices = this.synth?.getVoices() }
    speak(txt) {
        const utter = new SpeechSynthesisUtterance(txt);
        if (this.voice) {
            for (const voice of this.voices) {
                if (voice.name === this.voice) {
                    utter.voice = voice;
                }
            }
        }
        if (this.pitch) {utter.pitch = this.pitch }
        if (this.rate) {utter.rate = this.rate }
        if (this.onPause) { utter.onpause}
        if (this.onEnd) { utter.onend}
        this.synth.speak(utter)
    }
}
const tk = new Talk()

const init = () => {
    for (const x of ELEMENTS.logo) x.onclick = () => window.location.href = "/"
    setInterval(nf.notify("hello", null, 2000), 2000)
}
init()