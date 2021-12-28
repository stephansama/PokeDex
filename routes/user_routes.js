//= Requirements
const express = require('express')
const session = require('express-session')
const bcrypt = require('bcrypt')

const Database = require('better-sqlite3')
const SqliteStore = require('better-sqlite3-session-store')(session)

const sessionDB = new Database('./models/data/users.db')


//= Databases
const users = require('../models/userDB.js')

// local variables
const userRouter = express.Router()

//= Middleware

userRouter.use(session({
    store: new SqliteStore({
        client: sessionDB, 
        expired: {
          clear: true,
          intervalMs: 900000 //ms = 15min
        }}),
    resave: false,
    secret: 'secret',
    saveUninitialized: false,
    cookie: {maxAge: 1000*60*60*24},
}))

//= Load Static Files
userRouter.use('/static', express.static('static'))
//= Data formatting
userRouter.use(express.json())

//= Authentication Layer
function authenticated(req, res, next) {
    // console.log(req.session)
    console.log(req.session.user)
    if(!req.session.user)
        return res.render('./user/login.ejs', {message: 'Unauthenticated'})
    // loosely compare id in the browser
    if(req.session.user.ID != req.params.uid) 
        return res.send('Not correct user')
    next()
}


//== LOGIN
//= Index
userRouter.get('/login', (req, res) => {
    res.render('./user/login.ejs')
})

userRouter.get('/logout', (req, res) => {
    req.session.user = {}
    res.send('Logout')
})

userRouter.get('/:uid/dashboard', authenticated, (req, res) => {
    res.send('Dashboard')
})

userRouter.get('/:uid/:pokeid', authenticated, (req, res)=>{
    res.send('Pokemon ' + req.params.pokeid)
})

userRouter.post('/login', async (req, res) => {
    const user = users.Users.find(user => user.NAME === req.body.name)
    if(user === null || user === undefined)
        return res.status(400).send('Cannot find user')
    try{
        if(await bcrypt.compare(req.body.password, user.PASSWORD)){
            req.session.user = {NAME: user.NAME, ID: user.ID}
            session.saveUninitialized = true
            res.send('Success')
        } else {
            res.send('Incorrect password')
        }
    } catch(err) {
        console.log(err)
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
    if(users.Users.find(user => user.NAME === req.body.name))
        return res.status(400).send('User already exists')
    
    //= encrypt password
    try{
        req.body.password = await bcrypt.hash(req.body.password, 10)
    } catch {
        return res.status(500).send('Internal Server Error')
    }
    
    // create a new user and add it to the database
    users.Users.push(new users.User({
        NAME: req.body.name,
        PASSWORD: req.body.password
    }, old=false))

    users.AddUser(users.Users[users.Users.length - 1], users.UserDB)

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