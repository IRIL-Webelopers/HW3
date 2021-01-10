const express = require('express')
const Parse = require('parse/node')

const app = express()
const port = 3000

app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))

Parse.initialize('myAppId')
Parse.serverURL = 'http://localhost:1337/parse'

// let Person = Parse.Object.extend('Person')

// let person = new Person()
// person.set('name', 'kasra')
// person.set('age', 20)

// person.save()

var validateEmail = (email) => {
    let re = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/
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
            user.save()
            res.status(201)
            res.json({"message": "user has been created."})
            console.log("user created")
        }
    }
    // else if (!(req.body.username && req.body.password)){
    //     res.status(400)
    //     res.json({"message": "Request Length should be 2"})
    //     console.log("invalid parameter or number of parameters")
    // }
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
