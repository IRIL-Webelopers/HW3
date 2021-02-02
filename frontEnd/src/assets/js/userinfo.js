function getUserInfo() {
    fetch('http://localhost:3000/api/admin/user/crud', { 
        method: "get",
        // credentials: "same-origin",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            // "Set-Cookie": "token="+getCookie("token")
        },
        })
        .then(response => response.json())
        .then((user) => {
            console.log(user)
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

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

getUserInfo()