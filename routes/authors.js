const { render } = require('ejs')
const express = require('express')
const router = express.Router()
const Authors = require('../models/authors')
const Books = require('../models/book')

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
        res.redirect(`/authors/${newAuthor.id}`)
    } catch{
        res.render('authors/new', {
            author, 
            errorMessage : "Error while creating author"
        })
    }
    
})

router.get('/:id', async (req, res) => {
    try {
        const author = await Authors.findById(req.params.id)
        const books = await Books.find({author:author.id}).limit(6).exec()
        res.render('authors/show', {
            author,
            booksByAuthor : books
        })
    } catch (err) {
        console.log(err)
    }
})

router.get('/:id/edit', async (req, res) => {
    try {
        const author = await Authors.findById(req.params.id)
        res.render('authors/edit', {
            author
        })
    } catch {
        res.redirect('/authors')
    }
})

router.put('/:id', async (req, res) => {
    let author
    console.log(req.params.id)
    try{
        author = await Authors.findById(req.params.id)
        author.name = req.body.name
        await author.save()
        res.redirect(`/authors/${author.id}`)
    } catch {
        if(author == null){
            console.log(author)
            res.redirect('/')
        } else {
            res.render('authors/edit', {
                author, 
                errorMessage : "Error while updating author"
            })
        }
    }
})

router.delete('/:id' , async(req,res) => {
    let response
    try{
        response = await Authors.deleteOne({_id:req.params.id})
        console.log(response)
        res.redirect('/authors')
    } catch {
        if(response == null){
            console.log(response)
            res.redirect('/')
        } else {
            res.redirect(`/authors/${author.id}`)
        }
    }
})

module.exports = router