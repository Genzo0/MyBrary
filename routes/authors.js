const { render } = require('ejs')
const express = require('express')
const router = express.Router()
const Authors = require('../models/authors')

// All authors route
router.get('/', async (req, res) => {
    let searchOptions = {}
    if(req.query.name != null && req.query.name !== ''){
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try {
        const authors = await Authors.find(searchOptions);
        res.render('authors/index', {
            authors,
            searchOptions: req.query
        })
    } catch {
        res.redirect('/')
    }
})

//new Author Route
router.get('/new', (req, res) => {
    res.render('authors/new', {
        author : new Authors()
    })
})

//Create author route
router.post('/', async (req, res) => {
    const author = new Authors({
        name : req.body.name
    })
    try{
        const newAuthor = await author.save()
        res.redirect('authors')
    } catch{
        res.render('authors/new', {
            author, 
            errorMessage : "Error while creating author"
        })
    }
    
})

module.exports = router