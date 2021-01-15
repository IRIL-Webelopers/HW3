async function getIndex() {
    console.log("clicked")
    const header = new Headers({
        'Content-Type': 'application/x-www-form-urlencoded'
    })
    await fetch('http://localhost:3000/api/post', {method: "get", mode: "no-cors", headers: header})
        .then(response => response.json())
        .then(data => {
            console.log(data.status);
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}
