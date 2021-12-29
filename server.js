//= Requirements
const express = require('express')
const methodOverride = require('method-override')
require('dotenv').config()

//= Global Variables
const PORT = process.env.PORT || 3000

//= Routes
const pokeRouter = require('./routes/pokeRouter.js')
const userRouter = require('./routes/userRouter.js')

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
    res.render('index.ejs')
})

app.use('/poke/', pokeRouter)
app.use('/usr/', userRouter)


// Error Handling function

app.get('/error', (req, res) => {
    console.log(res)
    res.render('error.ejs', {message:res.message})
})


app.listen(PORT, () => console.log(`Listening on port ${PORT}`) )