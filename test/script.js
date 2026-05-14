import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAuth } from 'https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js'
import { getFirestore, collection, addDoc, getDocs } from 'https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js'

const firebaseConfig = {
    apiKey: "AIzaSyDS7hzEKNArZOLbbiL2QcM2vxDVeSIo3mk",
    authDomain: "webstatic-c507c.firebaseapp.com",
    projectId: "webstatic-c507c",
    storageBucket: "webstatic-c507c.firebasestorage.app",
    messagingSenderId: "874107128529",
    appId: "1:874107128529:web:b08a75a87b311ebbdd93f0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

el("save").addEventListener("click", async e =>{
    try {
        let x = el("input").value
        const docRef = await addDoc(collection(db, "test"), {
            input: x
        })
        console.log(docRef);
        loadData()
    } catch (error) {
        console.log(error);
    }
})

async function loadData() {
    const x = el("data")
    x.innerText = ""
    const querySnapshot = await getDocs(collection(db, "test"));
    querySnapshot.forEach((doc) => {
        x.innerText += doc.data().text
    });
}

loadData();