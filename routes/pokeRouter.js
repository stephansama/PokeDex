const express = require('express')

// pokemon database
const pokemon = require('../models/pokemonDB.js')

const pokerouter = express.Router()

pokerouter.use('/static/', express.static('static'))

//= Index
pokerouter.get('/all', (req, res) => {
    res.render('poke/all.ejs', { 
        data: pokemon
    })
})

//= Show
pokerouter.get('/:id', (req, res) => {
    res.render('poke/show.ejs', {
        data: pokemon,
        id: req.params.id
    })
})

module.exports = pokerouter