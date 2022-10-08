const { render } = require('ejs')
const express = require('express')
const path  = require('path')
const fs = require('fs')
const router = express.Router()
const Book = require('../models/book')
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
const Authors = require('../models/authors')
const { findById } = require('../models/book')
// const upload = multer ({
//     dest: uploadPath,
//     fileFilter: (req, file, callback) => {
//         callback(null, imageMimeTypes.includes(file.mimetype))
//     }
// })

// All book route
router.get('/', async (req, res) => {
    let query = Book.find();
    if(req.query.title != null && req.query.title != ''){
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if(req.query.publishedBefore){
        query = query.lte('publishDate', req.query.publishedBefore)
    }
    if(req.query.publishedAfter){
        query = query.gte('publishDate', req.query.publishedAfter)
    }
    try{
        const books = await query.exec()
        res.render('books/index', {
            books,
            searchOptions: req.query
        })
    } catch (e){
        console.log(e)
    }
})




//new book Route
router.get('/new', async (req, res) => {
    renderNewPage(res, new Book(), 'new')
})

//Create book route
router.post('/', async (req, res) => {
    const book = new Book ({
        title : req.body.title,
        author : req.body.author,
        publishDate : new Date(req.body.publishDate),
        pageCount : req.body.pageCount,
        description : req.body.description
    })
    saveCover(book, req.body.cover)

    try {
        const newBook = await book.save()
        res.redirect('books')
    } catch {
        renderNewPage(res, book, true)
    }
})

// edit book
router.get('/:id/edit', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
        renderEditPage(res, book)
    } catch (e){
        console.log(e)
        res.redirect('/books')
    }
})

// show book route

router.get('/:id', async (req,res) => {
    try{
        const book = await Book.findById(req.params.id)
                           .populate('author')
                           .exec()
        res.render('books/show', {
            book
        })
    } catch (e){
        console.log(e)
    }

})

//update book
router.put('/:id', async (req, res) => {
    let book
    try {
        book = await Book.findById(req.params.id)
        book.title = req.body.title
        book.author = req.body.author
        book.publishDate = new Date(req.body.publishDate)
        book.pageCount = req.body.pageCount
        book.description = req.body.description
        if(req.body.cover){
            saveCover(book, req.body.cover)
        }
        await book.save()
        res.redirect(`/books/${book._id}`)
    } catch (e) {
        console.log(e)
        if(book){
            renderEditPage(res, book, true)
        } else {
            res.redirect('/')
        }
    }
})

//delete book 
router.delete('/:id', async (req, res) => {
    let response
    const book = await Book.findById(req.params.id)
    try {
        response = await Book.deleteOne({_id : req.params.id})
        res.redirect('/books')
    } catch (e){
        console.log(e)
        if(response) {
            res.render('books/show', {
                book,
                errorMessage : "Could not remove book"
            })
        } else {
            res.redirect('/')
        }
    }
})

async function renderNewPage(res, book, hasError=false){
    renderFormPage(res, book, 'new', hasError)
}

async function renderEditPage(res, book, hasError=false){
    renderFormPage(res, book, 'edit', hasError)
}

async function renderFormPage(res, book, form, hasError=false){
    try {
        const authors = await Authors.find()
        const params  = {
            authors,
            book
        }
        if (hasError){
            if(form === 'edit'){
                params.errorMessage = "Error Editing Book"
            } 
            if(form === 'new'){
                params.errorMessage = "Error Creating Book"
            }
        }
        res.render(`books/${form}`, params)
    } catch (e){
        console.log(e)
        res.redirect('/books')
    }
}

function saveCover(book, coverEncoded) {
    if(coverEncoded == null) return 
    const cover = JSON.parse(coverEncoded)
    if(cover && imageMimeTypes.includes(cover.type)){
        book.coverImage = new Buffer.from(cover.data, 'base64')
        book.coverImageType = cover.type
    }
}

module.exports = router