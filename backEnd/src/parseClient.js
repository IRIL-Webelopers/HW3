const express = require('express')
const Parse = require('parse/node')
const cookieParser = require("cookie-parser");

const app = express()
const port = 3000

app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))
app.use(cookieParser())

Parse.initialize('myAppId')
Parse.serverURL = 'http://localhost:1337/parse'
Parse.User.enableUnsafeCurrentUser()

// let Person = Parse.Object.extend('Person')

// let person = new Person()
// person.set('name', 'kasra')
// person.set('age', 20)

// person.save()

var validateEmail = (email) => {
    let re = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)])$/
    return !!re.exec(email)
}

app.post('/api/signup', async (req, res) => {
    if(!(Object.keys(req.body).length === 2 && req.body.email && req.body.password)){
        res.status(400)
        res.json({"message": "Request Length should be 2 with `email` and `password` parameters"})
        console.log("Invalid number of params")
    }
    else if(!validateEmail(req.body.email)){
        res.status(400)
        res.json({"message": "filed `email` is not valid"})
        console.log("invalid email")
    }
    else if (req.body.password.length <= 5){
        res.status(400)
        res.json({"message": "filed `password`.length should be gt 5"})
        console.log("password length error")
    }
    else{
        let User = Parse.Object.extend("User")
        let query = new Parse.Query(User)
        query.equalTo('email', req.body.email)
        let result = await query.find()
        console.log(result)
        if (result.length){
            res.status(409)
            res.json({"message": "email already exist."})
            console.log("email exists error")
        }
        else{
            let user = new Parse.User()
            user.set("username", req.body.email)
            user.set("email", req.body.email)
            user.set("password", req.body.password)
            console.log(user.get('email'))
            try{
                await user.signUp()
                res.status(201)
                res.json({"message": "user has been created."})
                console.log("user created")
            }
            catch(error){
                res.status(500)
                res.json({"message": "Sorry, something got F'ed up realy bad!"})
                console.log("something got F'ed up")
                console.log("Error: " + err.code + " " + err.message);
            }
        }
    }
    // else if (!(req.body.username && req.body.password)){
    //     res.status(400)
    //     res.json({"message": "Request Length should be 2"})
    //     console.log("invalid parameter or number of parameters")
    // }
})

app.get("/api/signin", (req, res) => {
    res.status(405)
    res.json({"message": "Only `Post` Method is Valid"})
    console.log("user used Invalid method to login")
})

app.post("/api/signin", async (req, res) => {
    if(!(Object.keys(req.body).length === 2 && req.body.email && req.body.password)){
        res.status(400)
        res.json({"message": "Request Length should be 2 with `email` and `password` parameters"})
        console.log("Invalid number of params")
    }
    else if(!validateEmail(req.body.email)){
        res.status(400)
        res.json({"message": "filed `email` is not valid"})
        console.log("invalid email")
    }
    else{
        let user = await Parse.User.logIn(req.body.email, req.body.password).then((usr) =>{
            res.setHeader("Set-Cookie", `token=${usr.get("sessionToken")}; HttpOnly`)
            res.status(200)
            res.json({"token": usr.get("sessionToken")})
            console.log(`SUCCESSFUL login with user: ${usr.get("email")}`)
        }).catch((err) =>{
            res.status(401)
            res.json({"message": "invalid username or password!"})
            console.log(`UNSUCCESSFUL login with user: ${req.body.email}`)
            console.log("Error: " + err.code + " " + err.message);
        })
    }
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

app.put('/api/admin/post/crud', async (req, res) => {
    try {
        //todo kasra -> get user id
        let userid = 'ER11UgrFgp'

        if(!(Object.keys(req.body).length === 2 && req.body.title && req.body.content)){
            res.status(400)
            res.json({"message": "Request Length should be 2"})
            console.log("Invalid number of params for post update")
        }
        else if(req.query.id === undefined ){
            res.status(400)
            res.json({"message": "url id is not valid"})
            console.log("url id is not valid for post update")
        }
        // else if(){} check title validation ??!!! how?
        else{
            let Post = Parse.Object.extend("Post")
            let postQuery = new Parse.Query(Post)
            postQuery.equalTo("objectId", req.query.id)
            let result = await postQuery.first()
            if(result === undefined){
                res.status(400)
                res.json({"message": "url id is not valid"})
                console.log("url id is not valid for post update")
            }else if(result.get("createdBy").id !== userid){
                res.status(401)
                res.json({"message": "permission denied."})
                console.log("permission denied for post update")
            }else{
                result.set('title', req.body.title)
                result.set('content', req.body.content)
                await result.save()
                res.status(204)
                console.log("post update successful")
            }
        }
    } catch (err) {console.log(err.message)}
})

app.delete('/admin/post/crud/:id', async (req, res) => {
    //check if 204 is sent
    try {
        //todo kasra -> get user id
        if(!req.cookies.token){
            res.status(401)
            res.json({"message": "You should login first"})
            console.log("No session token in post read")
        }
        else{
            let user = await Parse.User.become(req.cookies.token).then(async (usr) => {
                if(usr.get("username") === "admin@gmail.com"){
                    let Post = Parse.Object.extend("Post")
                    let postQuery = new Parse.Query(Post)
                    postQuery.equalTo("objectId", req.params.id)
                    let result = await postQuery.first()
                    if(result === undefined){
                        res.status(400)
                        res.json({"message": "url id is not valid"})
                        console.log("Invalid url id for post delete")
                    } else if(result.get('createdBy').id !== userid){
                        res.status(401)
                        res.json({"message": "permission denied."})
                        console.log("permission denied for post delete")
                    } else{
                        await result.destroy()
                        res.status(204)
                        console.log("post delete successful")
                    }
                }
                else{
                    res.status(401)
                    res.json({"message": "You should login as admin"})
                    console.log("Non-admin attempt for post deletion")
                }
            }).catch(error => {
                res.status(401)
                res.json({"message": "permission denied."})
                console.log("Invalid user token in user info read")
                console.log("Error: " + error.code + "[*]" + error.message);
            })
        }
    }
    catch (err) {console.log(err.message)}
})


app.get('/api/admin/post/crud/:id', async (req, res) => {
    if(!req.cookies.token){
        res.status(401)
        res.json({"message": "You should login first"})
        console.log("No session token in post read")
    }
    else{
        let user = await Parse.User.become(req.cookies.token).then(async (usr) => {
            if(usr.get("username") === "admin@gmail.com"){
                let Post = Parse.Object.extend("Post")
                let postQuery = new Parse.Query(Post)
                postQuery.equalTo("objectId", req.params.id)
                let result = await postQuery.first()
                if(result === undefined) {
                    res.status(400)
                    res.json({"message": "url id is not valid"})
                    console.log("Invalid url id for post read")
                }else{
                    res.status(200)
                    res.json({
                            "post": {
                            "id": result.id,
                            "title": result.get('title'),
                            "content": result.get('content'),
                            "created_by": result.get('createdBy').id,
                            "created_at": result.createdAt
                            }
                    })
                    console.log("post read successful")
                }
            }
            else{
                res.status(401)
                res.json({"message": "You should login as admin"})
                console.log("Non-admin attempt for getting specific post")
            }
        })
    }
})

app.get('/api/admin/post/crud', async (req, res) => {
    if(!req.cookies.token){
        res.status(401)
        res.json({"message": "You should login first"})
        console.log("No session token in post read")
    }
    else{
        let user = await Parse.User.become(req.cookies.token).then(async (usr) => {
            let Post = Parse.Object.extend("Post")
            let postQuery = new Parse.Query(Post)
            postQuery.equalTo('createdBy', userid)
            let posts = await postQuery.find()
            let result = []
            for(let i = 0; i < posts.length; i++){
                result.push({
                    "id": posts[i].id,
                    "title": posts[i].get('title'),
                    "content": posts[i].get('content'),
                    "created_by": posts[i].get('createdBy').id,
                    "created_at": posts[i].get("createdAt"),
                })
            }
            res.status(200)
            res.json({
                "posts": result
            })
            console.log("post read successful")
        }).catch(error => {
            res.status(401)
            res.json({"message": "permission denied."})
            console.log("Invalid user token in user info read")
            console.log("Error: " + error.code + "[*]" + error.message);
        })
    }
})

app.get('/api/admin/user/crud/', async (req, res) => {
    //get email is not working properly
    if(!req.cookies.token){
        res.status(401)
        res.json({"message": "You should login first"})
        console.log("No session token in user info read")
    }
    else{
        let user = await Parse.User.become(req.cookies.token).then((usr) => {
            res.status(200)
            res.json({
                "user": {
                    "id": usr.id,
                    "email": usr.get('email'),
                    "created_at": usr.get("createdAt"),
                    "username": usr.get('username')
                    }
            })
        }).catch((error) => {
            res.status(401)
            res.json({"message": "permission denied."})
            console.log("Invalid user token in user info read")
            console.log("Error: " + error.code + "[*]" + error.message);
        })
    }
    // try{
    // //todo kasra -> get user id
    // let userid = 'ER11UgrFgp'

    // if(req.params.id === undefined) {
    //     res.status(400)
    //     res.json({"message": "url id is not valid"})
    //     console.log("Invalid url for user read")
    // } else if(req.query.id !== userid) {
    //     res.status(401)
    //     res.json({"message": "permission denied."})
    //     console.log("permission denied for user read")
    // } else {
    //     let User = Parse.Object.extend("User")
    //     let userQuery = new Parse.Query(User)
    //     userQuery.equalTo("objectId", req.query.id)
    //     let result = await userQuery.first()
    //     if(result === undefined) {
    //         es.status(400)
    //         res.json({"message": "url id is not valid"})
    //         console.log("Invalid url id for user read")
    //     } else {
    //         res.status(200)
    //     res.json({
    //         "user": {
    //             "id": result.id,
    //             "email": result.get('email'),
    //             "created_at": result.createdAt,
    //             "username": result.get('username')
    //           }
    //     })
    //     console.log("user read successful")
    //     }
    // }
    // }catch(err) {console.log(err.message)}
})

/* AmirHossein */

app.post('/api/admin/post/crud', async (req, res) => {
    if(!req.cookies.token){
        res.status(401)
        res.json({"message": "You should login first"})
        console.log("No session token in post create")
    }
    else{
        let user = await Parse.User.become(req.cookies.token).then(async usr => {
            if(usr.get("username") === "admin@gmail.com"){
                if (checkRequestLength(req, res, 2)) {
                    res.status(400)
                    res.json({"message": "Request Length should be 2"})
                    console.log(`Create Post Error: Request Length should be 2 but it's: ${Object.keys(req.body).length}`)
                } else if (checkPostValidation(req.body.title, req.body.content)) {
                    res.status(400)
                    res.json({"message": "filed `title` is not valid"})
                    console.log("Create Post Error: filed `title` is not valid")
                } else {
                    let Post = Parse.Object.extend('Post')
                    let post = new Post()
                    post.set('title', req.body.title)
                    post.set('content', req.body.content)
                    let acl = new Parse.ACL(usr)
                    acl.setPublicReadAccess(true)
                    acl.setPublicWriteAccess(false)
                    post.setACL(acl)
                    console.log(`Post with title: ${req.body.title}, content: ${req.body.content} created.`)
                    await post.save()
                    res.status(201)
                    res.json({"id": post.id, "creatorName": usr.get("username")})
                }
            }
            else{
                res.status(401)
                res.json({"message": "You should login as admin"})
                console.log("Non-admin attempt for post creation")
            }
        }).catch((error) => {
            res.status(401)
            res.json({"message": "You should login first"})
            console.log("Invalid session token")
            console.log("Error: " + error.code + "[*]" + error.message);
        })
    }
})

function checkRequestLength(req, res, length) {
    return !(Object.keys(req.body).length === length);

}

function checkPostValidation(title, content) {
    return !title || !content;

}

app.get('/api/post/', async (req, res) => {
    let Post = Parse.Object.extend('Post')
    let query = new Parse.Query(Post)
    let posts = await query.find()
    let postsArray = []
    for (let i = 0; i < posts.length; i++) {
        let post = {
            "id": posts[i].id,
            "title": posts[i].get('title'),
            "content": posts[i].get('content'),
            /* todo "created_by": posts[i].get('creator') */
            "created_at": posts[i].createdAt
        }
        postsArray.push(post)
    }
    res.json({"posts": postsArray})
})
