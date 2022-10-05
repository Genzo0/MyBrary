const { render } = require('ejs')
const express = require('express')
const path  = require('path')
const fs = require('fs')
const router = express.Router()
const Book = require('../models/book')
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
const Authors = require('../models/authors')
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
    renderNewPage(res, new Book())
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

async function renderNewPage(res, book, hasError=false){
    try {
        const authors = await Authors.find()
        const params  = {
            authors,
            book
        }
        if (hasError){
            params.errorMessage = "Error Creating Book"
        }
        res.render('books/new', params)
    } catch (e){
        res.redirect('books')
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