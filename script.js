"use strict"
import { Peer } from "https://esm.sh";
const el = x => document.getElementById(x)
const ELEMENTS = {
    loginBtn: el("loginBtn") || null,
    notificationSpan: el("notificationSpan"),
    logo: document.getElementsByClassName("logo"),
}

class Notify {
    constructor(notificationSpan) {
        this.timeout = null;
        this.notificationSpan = notificationSpan
    }
    notify(msg, body, timeoutms) {
        if (this.timeout) {
            clearTimeout(this.timeout)
            this.timeout = null
        }
        this.notificationSpan.innerText = msg
        this.notificationSpan.classList.remove("d-none")
        if (timeoutms) this.timeout = setTimeout(() => this.notificationSpan.classList.add("d-none"), timeoutms);
        if (body) {
            body.style.maxHeight = "35vh"
            this.notificationSpan.append(body)
        }
    }
}
const nf = new Notify(ELEMENTS.notificationSpan)

class Crypt {
    static baseStr = "CDE\\yzABFGvwx~!@#$%^&*()_+-67890 `:;HIJKL=|mnopqPQRSTUVWX}{[]\"ghijklYZ12345MNOdefabcrstu'?><,./"
    constructor(pass = "default") {
        this.updatePass(pass)
    }
    updatePass(pass) {
        if (!pass || typeof pass !== "string") { throw new Error("Passkey must be string") }
        if (pass.length <= 2 || pass.length >= 95) { throw new Error("Passkey must be 3 to 94 chars long") }
        this.pass = pass
        const regex = new RegExp(`[${this.pass}]`, 'g');
        this.str1 = Crypt.baseStr.replace(regex, '') + this.pass
        this.str2 = ""
        for (let i = 0; i < this.str1.length; i++) this.str2 += this.str1[(i + this.pass.length) % this.str1.length]
    }
    encryptText(txt) {
        if (!txt || typeof txt !== "string") { throw new Error("Unsupported Data Type") }
        let x = ""
        for (let i = 0; i < txt.length; i++) x += this.str2[this.str1.indexOf(txt[i])]
        return x
    }
    decryptText(txt) {
        if (!txt || typeof txt !== "string") { throw new Error("Unsupported Data Type") }
        let x = ""
        for (let i = 0; i < txt.length; i++) x += this.str1[this.str2.indexOf(txt[i])]
        return x
    }
    // file -> blob
    async compressFile(file) {
        const readableStream = file.stream()
        const compressedStream = readableStream.pipeThrough(new CompressionStream("gzip"))
        const compressedBlob = await new Response(compressedStream).blob();
        return compressedBlob
    }
    // DataURL -> blob
    async decompressFile(url) {
        const res = await fetch(url);
        const resBlob = await res.blob()
        const readableStream = resBlob.stream()
        const decompressedStream = readableStream.pipeThrough(new DecompressionStream("gzip"))
        const decompressedBlob = await new Response(decompressedStream).blob();
        return decompressedBlob
    }
    async encryptFile(file, compression, cb) {
        const reader = new FileReader();
        reader.onload = e => cb(this.encryptText(e.target.result))
        if (compression) {
            const compressed = await this.compressFile(file)
            reader.readAsDataURL(compressed);
        } else {
            reader.readAsDataURL(file);
        }
    }
    async decryptFile(text, compression, cb) {
        const fileText = this.decryptText(text)
        if (compression) {
            const decompressed = await this.decompressFile(fileText)
            cb(URL.createObjectURL(decompressed))
        } else {
            cb(fileText)
        }
    }
}
const cr = new Crypt()

class Peering {
    get callpeer() { return this.call?.peer }
    get connpeer() { return this.conn?.peer }
    set onPeerOpen(cb) { this._onPeerOpen = cb }
    set onPeerDisc(cb) { this._onPeerDisc = cb }
    set onErr(cb) { this._onErr = cb }
    set onPeerClose(cb) { this._onPeerClose = cb }
    set onPeerConn(cb) { this._onPeerConn = cb }
    set onPeerCall(cb) { this._onPeerCall = cb }
    set onConnOpen(cb) { this._onConnOpen = cb }
    set onConnData(cb) { this._onConnData = cb }
    set onConnClose(cb) { this._onConnClose = cb }
    set onConnStateChange(cb) { this._onConnStateChange = cb }
    set onCallStream(cb) { this._onCallStream = cb }
    set onCallClose(cb) { this._onCallClose = cb }
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
    init(id, options = null) {
        this.myid && this.reset()
        this.peer = new Peer(id, options)
        this.peer.on("open", id => {
            this.myid = id
            this._onPeerOpen && this._onPeerOpen(id)
        });
        this.peer.on("disconnected", id => { this._onPeerDisc && this._onPeerDisc(id) });
        this.peer.on("error", err => { this._onErr && this._onErr(err) });
        this.peer.on("close", () => {
            this.reset()
            this._onPeerClose && this._onPeerClose()
        });
        this.peer.on("connection", conn => {
            this._handleconn(conn)
            this._onPeerConn && this._onPeerConn(conn.peer)
        });
        this.peer.on("call", call => {
            this._handlecall(call)
            this._onPeerCall && this._onPeerCall(call.peer)
        });
        // peer.listAllPeers(callback)
        // peer.destroy()
        // peer.reconnect()
        // peer.disconnect()
    }
    _handleconn(conn) {
        conn.on("data", data => { this._onConnData && this.onConnData(data) });
        conn.on("open", () => {
            this.conn = conn
            this._onConnOpen && this._onConnOpen()
        });
        conn.on("close", () => {
            this.conn = null
            this._onConnClose && this._onConnClose()
        });
        conn.on("error", err => { this._onErr && this._onErr(err) });
        conn.on("iceStateChanged", state => { this._onConnStateChange && this._onConnStateChange(state) });
        // conn.close()
    }
    _handlecall(call) {
        call.on("stream", stream => { this._onCallStream && this._onCallStream(stream) })
        call.on("open", () => {
            console.log("test call open");
        });
        call.on("close", () => {
            this.call = null
            this._onCallClose && this._onCallClose()
        })
        call.on("error", err => { this._onErr && this._onErr(err) })
        this.call = call
        // call.close()
    }
}
const pr = new Peering()

const init = () => {
    for (const x of ELEMENTS.logo) x.onclick = () => window.location.href = "/"
    pr.onPeerConn = (id) => console.log(id);
    pr.init()
}
init()