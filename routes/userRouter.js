//================================================================
//= Requirements
//================================================================
const express = require('express')
const session = require('express-session')
const bcrypt = require('bcrypt')
const methodOverride = require('method-override')
const Database = require('better-sqlite3')
const SqliteStore = require('better-sqlite3-session-store')(session)

// Global Variables
const sessionDB = new Database('./models/data/users.db')
const userDB = require('../models/userDB.js')
const pokemonDB = require('../models/pokemonDB.js')

const userRouter = express.Router()

//================================================================
//= Middleware
//================================================================

// session
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

// add delete and put methods
userRouter.use(methodOverride('_method'))
// static files
userRouter.use('/static', express.static('static'))
// body parsing
userRouter.use(express.json())
userRouter.use(express.urlencoded({ extended: false }));


//================================================================
//= Authentication Layer
//================================================================
function authenticated(req, res, next) {
    if(!req.session.user)
        return res.status(403).send('Need to Login')
    // loosely compare id in the browser
    if(req.session.user.ID != req.params.uid) 
        return res.status(403).send('Not correct user')
    next()
}

//================================================================
//= Routes
//================================================================
userRouter.get('/', (req, res)=>{
    if(req.session.user){
        res.redirect(`${req.session.user.ID}/dashboard`)
    } else {
        res.redirect(`/error/`)
    }
})

//==== LOGIN / LOGOUT / REGISTER ====//
userRouter.get('/login', (req, res) => {
    res.render('./user/login.ejs')
})

userRouter.get('/logout', (req, res) => {
    req.session.user = {}
    res.render('./user/logout.ejs')
})

userRouter.get('/register', (req, res) => {
    res.render('./user/register.ejs')
})


//================================================================
//= User Authenticated Paths
//================================================================
userRouter.get('/:uid/dashboard', authenticated, (req, res) => {
    res.render('./user/dashboard.ejs', {
        list: userDB.Users[req.params.uid - 1].POKEMON,
        user: userDB.Users[req.params.uid - 1],
        id: req.params.uid
    })
})

// edit user information
userRouter.get('/:uid/edit', authenticated, (req, res) => {
    res.render('./user/update.ejs', {
        user: userDB.Users[req.params.uid - 1],
        id: req.params.uid
    })
})

// select new user pokemon
userRouter.get('/:uid/new', authenticated, (req, res) => {
    console.log(req.session.user)
    // remove Pokemon from user list and send the rest to the page
    function possiblePokemon(userlist, pokemonlist){
        let t = []
        // select all IDs from user pokemon list
        userlist.forEach(user_pokemon => {
            pokemonlist.forEach((pokemon, index) => {
                if(user_pokemon.POKEID === parseInt(pokemon.id))
                    t.push(index)
            })
        })
        // sort IDs from highest to lowest and remove from possible pokemon list
        t.sort((first, second)=>{return first - second})
        t.forEach((index, count) => pokemonlist.splice(parseInt(index - count), 1))
        return pokemonlist
    }

    res.render('./user/item/new.ejs',{
        user: userDB.Users[req.params.uid - 1],
        list: possiblePokemon(userDB.Users[req.params.uid - 1].POKEMON, pokemonDB),
        id: req.params.uid
    })
})

// JSON object containing POKEMON information
userRouter.get('/:uid/all', authenticated, (req, res) => {
    res.json(userDB.Users[req.params.uid - 1].POKEMON)
})

// show individual user pokemon
userRouter.get('/:uid/:pokeid', authenticated, (req, res)=>{
    res.render('./user/item/show.ejs', {
        pokemon: userDB.Users[req.params.uid - 1].findPOKEMON(req.params.pokeid),
        user: userDB.Users[req.params.uid - 1],
        id: req.params.uid
    })
})


// edit individual user pokemon
userRouter.get('/:uid/:pokeid/edit', authenticated, (req, res) => {
    res.render('./user/item/edit.ejs', {
        pokemon: userDB.Users[req.params.uid - 1].findPOKEMON(req.params.pokeid),
        user: userDB.Users[req.params.uid - 1],
        id: req.params.uid
    })
})


//================================================================
//= POST Routes
//================================================================
//= Create User
userRouter.post('/', async (req, res) => {
    if(userDB.Users.find(user => user.NAME === req.body.name))
        return res.status(400).send('User alreadyExists exists')
    
    //= encrypt password
    try{
        req.body.password = await bcrypt.hash(req.body.password, 10)
    } catch {
        return res.status(500).send('Internal Server Error')
    }
    
    // create a new user and add it to the database
    const user = new userDB.User({
        NAME: req.body.name,
        PASSWORD: req.body.password,
        ID: userDB.nextID(userDB.Users)
    })

    userDB.AddUser(user)
    session.saveUninitialized = true
    req.session.user = {NAME: user.NAME, ID: user.ID}

    return res.status(201).redirect(`${user.ID}/dashboard`) // success
})

// Login to existing user
userRouter.post('/login', async (req, res) => {
    const user = userDB.Users.find(user => user.NAME === req.body.name)
    if(!user) return res.status(400).redirect(`/error/`)
    try{
        if(await bcrypt.compare(req.body.password, user.PASSWORD)){
            session.saveUninitialized = true
            req.session.user = {NAME: user.NAME, ID: user.ID}
            return res.redirect(`${user.ID}/dashboard/`)
        } else {
            return res.status(400).redirect(`/error/`)
        }
    } catch(err) {
        console.log(err)
        return res.status(500).redirect(`/error/`)
    }
})

// add Pokemon to user
userRouter.post('/:uid/:pokeid', authenticated, (req, res)=>{
    // find the pokemon to add from url id
    const uid = parseInt(req.params.uid) - 1
    const pokemon = pokemonDB.find(elem => parseInt(elem.id) == parseInt(req.params.pokeid))
    const pkSelected = new userDB.Pokemon(pokemon, userDB.nextID(userDB.Users[uid].POKEMON))
    const alreadyExists = userDB.Users[uid].POKEMON.find(elem => elem.POKEID === pkSelected.POKEID)
    if(alreadyExists) {
        return res.status(400).send('Pokemon already exists in user database')
    }
    // add to live list and DB
    let t
    if(userDB.Users[uid].POKEMON.length > 0){
        t = userDB.Users[uid].POKEMON[userDB.Users[uid].POKEMON.length - 1].ID
    }else {
        t = 0
    }
    userDB.Users[uid].addPokemon(pkSelected, t)
    res.status(200).redirect(`/usr/${req.params.uid}/dashboard`)
})


//================================================================
//= PUT Route
//================================================================
userRouter.put('/:uid/:pokeid', (req, res) => {
})


//================================================================
//= DELETE Routes
//================================================================
userRouter.delete('/:uid', authenticated, (req, res) =>{
    userDB.DeleteUser(req.params.uid, userDB.Users, userDB.UserDB)
    res.send('User deleted')
})

userRouter.delete('/:uid/:pokeid', authenticated, (req, res) =>{
    // remove pokemon from user
    if(!userDB.Users[req.params.uid - 1].deletePokemon(parseInt(req.params.pokeid))){
        res.status(400).send('Pokemon not deleted')
    }

    res.status(200).redirect(`/usr/${req.params.uid}/dashboard`)
})

module.exports = userRouter