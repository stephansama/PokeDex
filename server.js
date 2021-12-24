//= Requirements
const express = require('express')
const methodOverride = require('method-override')
require('dotenv').config()

//= Variables
const PORT = process.env.PORT || 3000
const pokerouter = require('./routes/pokeroutes.js')
const app = express()

//= Load Middleware
app.use('/static', express.static('static'))
app.use(methodOverride('_method'))
app.use(express.urlencoded({ extended: false }));

app.use('/poke', pokerouter)

//= Index
app.get('/', (req, res) => {
    res.redirect('/poke')
})

//= New
//= Delete
//= Update
//= Create
//= Edit
//= Show

app.listen(PORT, () => console.log(`Listening on port ${PORT}`) )