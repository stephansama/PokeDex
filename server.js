//= Requirements
const express = require('express')
const methodOverride = require('method-override')
require('dotenv').config()

//= Global Variables
const PORT = process.env.PORT || 3000

//= Routes
const pokerouter = require('./routes/pokeroutes.js')
const userRouter = require('./routes/user_routes.js')

const userDB = require('./models/userDB.js')

userDB.LoadUsers()

//= Databases
const app = express()

//= Load Middleware
app.use('/static', express.static('static'))
app.use(methodOverride('_method'))
app.use(express.urlencoded({ extended: false }));

//= Index
app.get('/', (req, res) => {
    // console.log(new users.User({name: 't', password: 't', id: 0}))
    res.render('index.ejs')
})

app.use('/poke/', pokerouter)
app.use('/usr/', userRouter)

//= New
//= Delete
//= Update
//= Create
//= Edit
//= Show

app.listen(PORT, () => console.log(`Listening on port ${PORT}`) )