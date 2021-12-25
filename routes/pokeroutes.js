const express = require('express')

// pokemon database
const pokemon = require('../models/pokemon.js')

const pokerouter = express.Router()

pokerouter.use('/static/', express.static('static'))

//= Index
pokerouter.get('/', (req, res) => {
    res.render('poke/all.ejs')
})

//= New
// No new route because the database is not mutable
// pokerouter.get('/new', (req, res) => {})

//= Delete
// No delete route because the database is not mutable
// pokerouter.delete('/:id', (req, res) => {})

//= Update
// No update because the database is not mutable
// pokerouter.put('/:id', (req, res) => {})

//= Create
// No create because the database is not mutable
// pokerouter.post('/', (req, res) => {})

//= Edit
// No edit because the database is not mutable
// pokerouter.get('/:id/edit', (req, res) => {})

//= Show
pokerouter.get('/:id', (req, res) => {
    res.render('poke/show.ejs', {
        id: req.params.id
    })
})

module.exports = pokerouter