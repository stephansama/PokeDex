const express = require('express')

const pokerouter = express.Router()

//= Index
pokerouter.get('/', (req, res) => {res.render('index.ejs')})

//= New
pokerouter.get('/new', (req, res) => {})

//= Delete
pokerouter.delete('/:id', (req, res) => {})

//= Update
pokerouter.put('/:id', (req, res) => {})

//= Create
pokerouter.post('/', (req, res) => {})

//= Edit
pokerouter.get('/:id/edit', (req, res) => {})

//= Show
pokerouter.get('/:id', (req, res) => {})

module.exports = pokerouter