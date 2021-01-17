window.onload = function() {
    getIndex()
};

function getIndex() {
    console.log("clicked")
    const header = new Headers({
        'Content-Type': 'application/x-www-form-urlencoded'
    })
    fetch('http://localhost:3000/api/post', {method: "get", headers: header})
        .then(response => response.json())
        .then(data => {
            console.log(data.status);
            console.log('Success:', data);
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

document.querySelector('#signup').addEventListener('click', function () {
    $('#sidebar').sidebar('toggle');
})
