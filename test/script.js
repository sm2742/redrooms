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