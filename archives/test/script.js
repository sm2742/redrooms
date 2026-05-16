"use strict"

class Crypt {
    static baseStr = "CDE\\yzABFGvwx~!@#$%^&*()_+-67890 `:;HIJKL=|mnopqPQRSTUVWX}{[]\"ghijklYZ12345MNOdefabcrstu'?><,./"
    constructor(pass) {
        if (typeof pass !== "string") { throw new Error("Passkey must be string") }
        if (pass.length <= 2 || pass.length >= 95) { throw new Error("Passkey must be 3 to 94 chars long") }
        this.pass = pass
        const regex = new RegExp(`[${this.pass}]`, 'g');
        this.str1 = Crypt.baseStr.replace(regex, '') + this.pass
        this.str2 = ""
        for (let i = 0; i < this.str1.length; i++) this.str2 += this.str1[(i + this.pass.length) % this.str1.length]
    }
    encryptText(txt) {
        if (typeof txt !== "string") { throw new Error("Unsupported Data Type") }
        let x = ""
        for (let i = 0; i < txt.length; i++) x += this.str2[this.str1.indexOf(txt[i])]
        return x
    }
    decryptText(txt) {
        if (typeof txt !== "string") { throw new Error("Unsupported Data Type") }
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
const MyCrypt = new Crypt("password")
console.log(MyCrypt.str1);
console.log(MyCrypt.str2);

el("fin").addEventListener("change", (e) => {
    const enc = el("enc").checked
    MyCrypt.encryptFile(e.target.files[0], enc, (x) => {
        console.log(x.slice(0, 20), x.length)
        MyCrypt.decryptFile(x, enc, (y) => {
            console.log(y);
        })
    })
})
el("tin").addEventListener("change", (e) => {
    const enc = MyCrypt.encryptText(e.target.value)
    console.log(enc);
    console.log(MyCrypt.decryptText(enc));
})