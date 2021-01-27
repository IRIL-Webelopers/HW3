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
