let theme = null

window.addEventListener('DOMContentLoaded', function() {
    theme = getCookie('theme')
    if (theme === 'dark') {
        document.body.classList.add('dark-mode')
        $('.ui.checkbox').checkbox('check')
        document.getElementById('desktop-mode-logo-id').src = "./images/red_logo_200x200.png"
        document.getElementById('mobile-mode-logo-id').src = "./images/red_logo_200x200.png"
    }
})

function getIndex() {
    const header = new Headers({
        'Content-Type': 'application/x-www-form-urlencoded'
    })
    fetch('http://localhost:3000/api/post', {method: "get", headers: header})
        .then(response => response.json())
        .then(data => {
            setCards(data.posts, 'index-grid')
    })
        .catch((error) => {
            console.error('Error:', error);
        });
}

function setCards(posts, elementsId) {
    let cards = ''
    for (let i = 0; i < posts.length; i++) {
        cards += '<div class="column">' +
            '<div class="ui raised card index-card">' +
            '<div class="content">' +
            `<div class="header">${posts[i].title}</div>` +
            `<div class="meta"><span class="category">${posts[i].created_at}</span></div>` +
            `<div class="description"><p>${posts[i].content}</p></div>` +
            '</div>' +
            `<div class="extra content"><div class="left floated author">${posts[i].created_by}</div></div>` +
            '</div>' +
            '</div>'
    }
    document.getElementById(elementsId).innerHTML = cards
}

getIndex()

document.getElementById('sidebar-button-mobile-mode').addEventListener('click', () => {
    $('.ui.sidebar.inverted.vertical.menu').sidebar('setting', 'transition', 'overlay').sidebar('toggle');
})

document.getElementById('dark-mode-button-mobile-mode').addEventListener('click', () => {
    themeHandle()
})

document.getElementById('dark-mode-button-desktop-mode').addEventListener('click', () => {
    themeHandle()
})

function themeHandle() {
    document.body.classList.toggle('dark-mode')
    if (theme === 'dark') {
        setCookie('theme', 'light')
        theme = 'light'
        $('.ui.checkbox').checkbox('uncheck')
        document.getElementById('desktop-mode-logo-id').src = "./images/blue_logo_200x200.png"
        document.getElementById('mobile-mode-logo-id').src = "./images/blue_logo_200x200.png"
    } else {
        setCookie('theme', 'dark')
        theme = 'dark'
        $('.ui.checkbox').checkbox('check')
        document.getElementById('desktop-mode-logo-id').src = "./images/red_logo_200x200.png"
        document.getElementById('mobile-mode-logo-id').src = "./images/red_logo_200x200.png"
    }
}

function getCookie(name) {
    const cookies = document.cookie.split(';'),
        cookie = cookies.find(function (str) {
            return str.indexOf(name + '=') === 0;
        });
    if (cookie) {
        return cookie.split('=')[1];
    }
    return null;
}

function setCookie(name, value) {
    document.cookie = name + '=' + value;
}
