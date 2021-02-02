function getUserInfo() {
    const header = new Headers({
        'Content-Type': 'application/x-www-form-urlencoded'
    })
    fetch('http://localhost:3000/api/admin/user/crud', { method: "get", headers: header })
        .then(response => response.json())
        .then(data => {
            setUserInfo(user)
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

function setUserInfo(user) {
    id = document.getElementById("id")
    id.innerText = user.id
    email = document.getElementById("email")
    email.innerText = user.email
    date = document.getElementById("date")
    date.innerText = user.created_at
}

getUserInfo()