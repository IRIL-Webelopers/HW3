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
            toast.transition()
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
            toast.transition()
            console.log(error)
            let toastHeader = $('#toast-header')
            // console.log(toastHeader[0].innerHTML)
            toastHeader[0].innerText = "An Error Occured"
            let toastMessage = $('#toast-message')
            toastMessage[0].innerText = "Please Try Again"
        })
}

