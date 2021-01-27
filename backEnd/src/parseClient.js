const express = require('express')
const Parse = require('parse/node')
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express()
const port = 3000

app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))
app.use(cors())
app.use(cookieParser())

Parse.initialize('myAppId')
Parse.serverURL = 'http://localhost:1337/parse'
Parse.User.enableUnsafeCurrentUser()


var validateEmail = (email) => {
    let re = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)])$/
    return !!re.exec(email)
}

app.post('/api/signup', async (req, res) => {
    if (!(Object.keys(req.body).length === 2 && req.body.email && req.body.password)) {
        res.status(400)
        res.json({ "message": "Request Length should be 2 with `email` and `password` parameters" })
        console.log("Invalid number of params")
    } else if (!validateEmail(req.body.email)) {
        res.status(400)
        res.json({ "message": "filed `email` is not valid" })
        console.log("invalid email")
    } else if (req.body.password.length <= 5) {
        res.status(400)
        res.json({ "message": "filed `password`.length should be gt 5" })
        console.log("password length error")
    } else {
        let User = Parse.Object.extend("User")
        let query = new Parse.Query(User)
        query.equalTo('email', req.body.email)
        let result = await query.find()
        console.log(result)
        if (result.length) {
            res.status(409)
            res.json({ "message": "email already exist." })
            console.log("email exists error")
        } else {
            let user = new Parse.User()
            user.set("username", req.body.email)
            user.set("email", req.body.email)
            user.set("password", req.body.password)
            console.log(user.get('email'))
            try {
                await user.signUp()
                res.status(201)
                res.json({ "message": "user has been created." })
                console.log("user created")
            } catch (error) {
                res.status(500)
                res.json({ "message": "Sorry, something got F'ed up realy bad!" })
                console.log("something got F'ed up")
                console.log("Error: " + err.code + " " + err.message);
            }
        }
    }
})

app.get("/api/signin", (req, res) => {
    res.status(405)
    res.json({ "message": "Only `Post` Method is Valid" })
    console.log("user used Invalid method to login")
})

app.post("/api/signin", async (req, res) => {
    if (!(Object.keys(req.body).length === 2 && req.body.email && req.body.password)) {
        res.status(400)
        res.json({ "message": "Request Length should be 2 with `email` and `password` parameters" })
        console.log("Invalid number of params")
    } else if (!validateEmail(req.body.email)) {
        res.status(400)
        res.json({ "message": "filed `email` is not valid" })
        console.log("invalid email")
    } else {
        let user = await Parse.User.logIn(req.body.email, req.body.password).then((usr) => {
            res.setHeader("Set-Cookie", `token=${usr.get("sessionToken")}; HttpOnly`)
            res.status(200)
            res.json({ "token": usr.get("sessionToken") })
            console.log(`SUCCESSFUL login with user: ${usr.get("email")}`)
        }).catch((err) => {
            res.status(401)
            res.json({ "message": "invalid username or password!" })
            console.log(`UNSUCCESSFUL login with user: ${req.body.email}`)
            console.log("Error: " + err.code + " " + err.message);
        })
    }
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

app.put('/api/admin/post/crud/:id', async (req, res) => {
    if (!req.cookies.token) {
        res.status(401)
        res.json({ "message": "You should login first" })
        console.log("No session token in post read")
    } else {
        await Parse.User.become(req.cookies.token).then(async (usr) => {
            let Post = Parse.Object.extend("Post")
            let postQuery = new Parse.Query(Post)
            postQuery.equalTo("objectId", req.params.id)
            await postQuery.first().then(async (result) => {
                if(result){
                    if (!(Object.keys(req.body).length === 2)) {
                        res.status(400)
                        res.json({ "message": "Request Length should be 2" })
                        console.log(`Update Post Error: Request Length should be 2 but it's: ${Object.keys(req.body).length}`)
                    } else if (!req.body.title || !req.body.content) {
                        res.status(400)
                        res.json({ "message": "filed `title` or `content` is not valid" })
                        console.log("Update Post Post Error: filed `title` or `content` is not valid")
                    } else {
                        result.set('title', req.body.title)
                        result.set('content', req.body.content)
                        await result.save()
                        res.sendStatus(204)
                        console.log("post update successful")
                    }
                }else{
                    res.status(400)
                    res.json({ "message": "url id is not valid" })
                    console.log("Invalid url id for post update")
                }
            }).catch((err) => {
                res.status(401)
                res.json({ "message": "permission denied." })
                console.log("permission denied for post update")
                console.log("Error: " + err.code + "[*]" + err.message)
            })
        }).catch(error => {
            res.status(401)
            res.json({ "message": "You should login first" })
            console.log("Invalid session token")
            console.log("Error: " + error.code + "[*]" + error.message);
        })
    }
})

app.delete('/api/admin/post/crud/:id', async (req, res) => {
    if (!req.cookies.token) {
        res.status(401)
        res.json({ "message": "You should login first" })
        console.log("No session token in post read")
    } else {
        await Parse.User.become(req.cookies.token).then(async (usr) => {
            let Post = Parse.Object.extend("Post")
            let postQuery = new Parse.Query(Post)
            postQuery.equalTo("objectId", req.params.id)
            await postQuery.first().then(async (result) => {
                await result.destroy().then(() => {
                    res.sendStatus(204)
                    console.log("post delete successful")
                }).catch((err) => {
                    res.status(401)
                    res.json({ "message": "permission denied." })
                    console.log("permission denied for deleting another user post")
                    console.log("Error: " + err.code + "[*]" + err.message)
                })
            }).catch((err) => {
                res.status(400)
                res.json({ "message": "url id is not valid" })
                console.log("Invalid url id for post delete")
                console.log("Error: " + err.code + "[*]" + err.message)
            })
        }).catch(error => {
            res.status(401)
            res.json({ "message": "You should login first" })
            console.log("Invalid session token")
            console.log("Error: " + error.code + "[*]" + error.message);
        })
    }
})


app.get('/api/admin/post/crud/:id', async (req, res) => {
    if (!req.cookies.token) {
        res.status(401)
        res.json({ "message": "You should login first" })
        console.log("No session token in post read")
    } else {
        let user = await Parse.User.become(req.cookies.token).then(async () => {
            let Post = Parse.Object.extend("Post")
            let postQuery = new Parse.Query(Post)
            postQuery.equalTo("objectId", req.params.id)
            await postQuery.first().then(async (result) => {
                res.status(200)
                res.json({
                    "post": {
                        "id": result.id,
                        "title": result.get('title'),
                        "content": result.get('content'),
                        "created_by": result.get('created_by').id,
                        "created_at": result.createdAt
                    }
                })
                console.log("post read successful")
            }).catch((err) => {
                res.status(400)
                res.json({ "message": "url id is not valid" })
                console.log("Invalid url id for post read")
                console.log("Error: " + err.code + "[*]" + err.message)
            })
        }).catch((error) => {
            res.status(401)
            res.json({ "message": "You should login first" })
            console.log("Invalid session token")
            console.log("Error: " + error.code + "[*]" + error.message);
        })
    }
})

app.get('/api/admin/post/crud', async (req, res) => {
    if (!req.cookies.token) {
        res.status(401)
        res.json({ "message": "You should login first" })
        console.log("No session token in post read")
    } else {
        let user = await Parse.User.become(req.cookies.token).then(async (usr) => {
            let Post = Parse.Object.extend("Post")
            let postQuery = new Parse.Query(Post)
            postQuery.equalTo('created_by', usr)
            let posts = await postQuery.find()
            let result = []
            for (let i = 0; i < posts.length; i++) {
                result.push({
                    "id": posts[i].id,
                    "title": posts[i].get('title'),
                    "content": posts[i].get('content'),
                    "created_by": posts[i].get('created_by').id,
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
            res.json({ "message": "You should login first" })
            console.log("Invalid session token")
            console.log("Error: " + error.code + "[*]" + error.message);
        })
    }
})

app.get('/api/admin/user/crud/', async (req, res) => {
    if (!req.cookies.token) {
        res.status(401)
        res.json({ "message": "You should login first" })
        console.log("No session token in user info read")
    } else {
        let user = await Parse.User.become(req.cookies.token).then((usr) => {
            res.status(200)
            res.json({
                "user": {
                    "id": usr.id,
                    "email": usr.get('email'),
                    "created_at": usr.get("createdAt"),
                }
            })
        }).catch((error) => {
            res.status(401)
            res.json({ "message": "permission denied." })
            console.log("Invalid user token in user info read")
            console.log("Error: " + error.code + "[*]" + error.message);
        })
    }
})


app.post('/api/admin/post/crud', async (req, res) => {
    if (!req.cookies.token) {
        res.status(401)
        res.json({ "message": "You should login first" })
        console.log("No session token in post create")
    } else {
        await Parse.User.become(req.cookies.token).then(async user => {
            if (!(Object.keys(req.body).length === 2)) {
                res.status(400)
                res.json({ "message": "Request Length should be 2" })
                console.log(`Create Post Error: Request Length should be 2 but it's: ${Object.keys(req.body).length}`)
            } else if (!req.body.title || !req.body.content) {
                res.status(400)
                res.json({ "message": "filed `title` or `content` is not valid" })
                console.log("Create Post Error: filed `title` or `content` is not valid")
            } else {
                let Post = Parse.Object.extend('Post')
                let post = new Post()
                post.set('title', req.body.title)
                post.set('content', req.body.content)
                post.set('created_by', user)
                let acl = new Parse.ACL(user)
                acl.setPublicReadAccess(true)
                acl.setPublicWriteAccess(false)
                post.setACL(acl)
                console.log(`Post with title: ${req.body.title}, content: ${req.body.content} created.`)
                await post.save()
                res.status(201)
                res.json({ "id": post.id })
            }
        }).catch((error) => {
            res.status(401)
            res.json({ "message": "You should login first" })
            console.log("Invalid session token")
            console.log("Error: " + error.code + "[*]" + error.message);
        })
    }
})


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
            "created_by": posts[i].get('created_by').id,
            "created_at": posts[i].createdAt
        }
        postsArray.push(post)
    }
    res.status(200)
    //todo handle exception
    res.json({ "posts": postsArray })
})
