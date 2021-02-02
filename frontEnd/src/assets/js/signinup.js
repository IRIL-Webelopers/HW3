$(document).ready(function () {
    console.log("in jquery")

    $('.message .close')
        .on('click', function () {
            $(this)
                .closest('.message')
                .transition('fade')
                ;
        })
        ;

});



let signup = () => {
    let email = document.getElementById("signup-email-input-id").value
    let password = document.getElementById("signup-password-input-id").value
    let formBody = []
    formBody.push("email=" + encodeURIComponent(email))
    formBody.push("password=" + encodeURIComponent(password))
    formBody = formBody.join("&")
    fetch("http://localhost:3000/api/signup",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
            },
            body: formBody
        })
        .then(response => {
            if(!response.ok){
                // console.log("about to throw error")
                // console.log(response.body)
                // console.log(response.text())
                throw new Error(response.json()['message']);
            }
            return response.json()
        })
        .then(data => {
            console.log("data success")
            let toast = $('.message')
            toast.removeClass("negative")
            toast.addClass("positive")
            toast.removeClass("hidden")
            let toastHeader = $('#toast-header')
            let toastMessage = $('#toast-message')
            // console.log(toastHeader[0].innerHTML)
            toastHeader[0].innerText = "Congratulations"
            toastMessage[0].innerText = "Account Successfully Created"
            console.log(data)
        })
        .catch(error => {
            let toast = $('.message')
            toast.removeClass("positive")
            toast.addClass("negative")
            toast.removeClass("hidden")
            // toast.transition()
            console.log(error)
            let toastHeader = $('#toast-header')
            // console.log(toastHeader[0].innerHTML)
            toastHeader[0].innerText = "An Error Occured"
            let toastMessage = $('#toast-message')
            toastMessage[0].innerText = "Please Try Again"
        })
}

document.getElementById('signin-id').addEventListener('click', () => {
    document.getElementById('signin-box-id').classList.add('active')
    document.getElementById('signup-box-id').classList.remove('active')
    document.getElementById('signin-id').classList.add('active')
    document.getElementById('signup-id').classList.remove('active')
})

document.getElementById('signup-id').addEventListener('click', () => {
    document.getElementById('signup-box-id').classList.add('active')
    document.getElementById('signin-box-id').classList.remove('active')
    document.getElementById('signup-id').classList.add('active')
    document.getElementById('signin-id').classList.remove('active')
})

document.getElementById('return-home-id').addEventListener('click', () => {
    document.location = "../index.html"
})

/*
*   Email input validity checking
*/

let emailInputs = document.getElementsByName('email-input')
const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
for (let i = 0; i < emailInputs.length; i++) {
    emailInputs[i].addEventListener('keyup', () => {
        if (emailRegex.test(emailInputs[i].value)) {
            emailInputs[i].style.borderColor = 'green'
        } else {
            emailInputs[i].style.borderColor = 'red'
        }
        enableSignupButton()
        enableSigninButton()
    })
}

/*
*   Password input validity checking
*/

let passwordInputs = [
    document.getElementById('signin-password-input-id'),
    document.getElementById('signup-password-input-id')]
for (let i = 0; i < passwordInputs.length; i++) {
    passwordInputs[i].addEventListener('keyup', () => {
        if (passwordInputs[i].value.length >= 6) {
            passwordInputs[i].style.borderColor = 'green'
        } else {
            passwordInputs[i].style.borderColor = 'red'
        }
        enableSignupButton()
        enableSigninButton()
    })
}

let signupPasswordInput = document.getElementById('signup-password-input-id')
let repeatedPasswordInput = document.getElementById('repeated-password-input-id')
repeatedPasswordInput.addEventListener('keyup', () => {
    if (repeatedPasswordInput.value === signupPasswordInput.value) {
        repeatedPasswordInput.style.borderColor = signupPasswordInput.style.borderColor
    } else {
        repeatedPasswordInput.style.borderColor = 'red'
    }
    enableSignupButton()
})

document.getElementById('rules-acceptation-id').addEventListener('click', () => {
    enableSignupButton()
})

function enableSignupButton() {
    let repeatedPasswordInput = document.getElementById('repeated-password-input-id')
    let signupPasswordInput = document.getElementById('signup-password-input-id')
    let signupEmailInput = document.getElementById('signup-email-input-id')
    document.getElementById('signup-button-id').disabled =
        !(
            emailRegex.test(signupEmailInput.value) &&
            repeatedPasswordInput.value === signupPasswordInput.value &&
            signupPasswordInput.value.length >= 6 &&
            document.getElementById('rules-acceptation-id').checked
        )
}

function enableSigninButton() {
    let signinEmailInput = document.getElementById('signin-email-input-id')
    let signinPasswordInput = document.getElementById('signin-password-input-id')
    document.getElementById('signin-button-id').disabled =
        !(
            emailRegex.test(signinEmailInput.value) &&
            signinPasswordInput.value.length >= 6
        )
}

