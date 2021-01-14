function getIndex() {
    console.log("clicked")
    const header = new Headers({
        'Content-Type': 'application/x-www-form-urlencoded'
    })
    fetch('http://localhost:3000/api/post', {method: "get", mode: "no-cors", headers: header})
        .then(res => {
            if (res.status !== 200) {
                console.log('Looks like there was a problem. Status Code: ' + res.status)
            }
            return res.text()
        })
        .then(body => {
            let ans = document.getElementById("result")
            ans.innerText = body
        })
}
