//= Requirements
const express = require('express')
const bcrypt = require('bcrypt')

//= Databases
const users = require('../models/users.js')

// local variables
const userRouter = express.Router()

userRouter.use(setUser)
function setUser(req, res, next) {
    next()
}


//= Middleware
//= Data formatting
userRouter.use(express.json())
//= Load Static Files
userRouter.use('/static', express.static('static'))

//= Authentication Layer
function authenticated(req, res, next) {
    console.log(req.body)
    if(!req.body.id){
        return res.status(403).send('Not authenticated')
    }
    currentUser = users.Users.find(user => user.id === req.body.id)
    if(!currentUser){
        return res.status(403).send('Not a user')
    }
    next()
}


//== LOGIN
//= Index
userRouter.get('/login', (req, res) => {
    res.render('./user/login.ejs')
})

userRouter.get('/:uid/dashboard', authenticated, (req, res) => {
    // res.render('./user/dashboard.ejs', {
    //     uid: req.params.uid
    // })
    console.log(req.users)
    res.send('Test')
})

userRouter.post('/login', async (req, res) => {
    console.log(req.body)
    const user = users.Users.find(user => user.name === req.body.name)
    if(user === null || user === undefined)
        return res.status(400).send('Cannot find user')
    try{
        if(await bcrypt.compare(req.body.password, user.password)){
            req.user = user
            console.log(req.user)
            res.send('Success')
        } else {
            res.send('Incorrect password')
        }
    } catch {
        res.status(500).send('Internal server error')
    }
})


// NEW USER Landing Page
userRouter.get('/register', (req, res) => {
    res.render('./user/register.ejs')
})

//=== USER MANAGEMENT
// USER INDEX
userRouter.get('/', (req, res) => {
    res.json(users.Users)
})

// UPDATE USER
userRouter.put('/', (req, res) => {
})

//= POST / CREATE USER
userRouter.post('/', async (req, res) => {
    if(users.Users.find(user => user.name === req.body.name))
        return res.status(400).send('User already exists')
    
    //= encrypt password
    try{
        req.body.password = await bcrypt.hash(req.body.password, 10)
    } catch {
        return res.status(500).send('Internal Server Error')
    }
    
    users.Users.push(new users.User(req.body))
    return res.status(201).send('User Created') // success
})


//= New
// userRouter.get('/new', (req, res) => {})

//= Delete
// userRouter.delete('/:id', (req, res) => {})

//= Update
// userRouter.put('/:id', (req, res) => {})

// = Create
// userRouter.post('/', (req, res) => {})

//= Edit
// userRouter.get('/:id/edit', (req, res) => {})

//= Show
// userRouter.get('/:id', (req, res) => {})

module.exports = userRouter