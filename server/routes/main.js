const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

/**
 * GET / Home
 */
router.get('', async (req, res) => {
    try {
        const locals = {
            title: "Node blog",
            description: "Simple Blog create with NodeJs, Express & MongoDB."
        }

        let perPage = 5;
        let page = req.query.page || 1;

        const data = await Post.aggregate([{
            $sort: {createdAt: -1 }
        }])
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec();

        const count = await Post.count();
        const nextPage = parseInt(page) + 1;
        const hasNextPage = nextPage <= Math.ceil(count / perPage);

        // const data = await Post.find();
        res.render('index', {
            locals,
            data,
            current: page,
            nextPage: hasNextPage ? nextPage : null,
            currentRoute: req.path
        });
    } catch (error) {
        console.log(error)
    }
});

/**
 * GET / Post id
 */
router.get('/post/:id', async (req, res) => {
    try {
        const slug = req.params.id;
        const data = await Post.findById({ _id: slug });
        const locals = {
            title: data.title,
            description: "Simple Blog create with NodeJs, Express & MongoDB."
        }
        res.render('post', { data, locals, currentRoute: req.path })
    } catch (error) {
        console.log(error);
    }
});

/**
 * POST / Post searchTerm
 */
router.post('/search', async (req, res) => {
    try {
        let searchTerm = req.body
                            .searchTerm
                            .replace(/[^a-zA-Z0-9]/g, "");

        const data = await Post.find({
            $or: [
                { title: { $regex: new RegExp(searchTerm, 'i') } },
                { body: { $regex: new RegExp(searchTerm, 'i') } }
            ]
         });
        const locals = {
            title: 'Search result',
            description: "Simple Blog create with NodeJs, Express & MongoDB."
        }
        res.render('search', { locals, data, currentRoute: req.path })
    } catch (error) {
        console.log(error);
    }
});

router.get('/about', (req, res) => {
    res.render('about', {
        currentRoute: req.path
    });
});

router.get('/contact', (req, res) => {
    res.render('contact', {
        currentRoute: req.path
    });
});

module.exports = router;

// function insertPostData()  {
//     Post.insertMany([
//         {
//             title: "Building a Blog",
//             body: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Officiis dolor ullam non reprehenderit consequatur pariatur quisquam voluptate doloremque nostrum explicabo autem quaerat nisi omnis fugit beatae, esse ipsam, assumenda tenetur."
//         },
//         {
//             title: "Building a Blog",
//             body: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Officiis dolor ullam non reprehenderit consequatur pariatur quisquam voluptate doloremque nostrum explicabo autem quaerat nisi omnis fugit beatae, esse ipsam, assumenda tenetur."
//         },
//         {
//             title: "Building a Blog",
//             body: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Officiis dolor ullam non reprehenderit consequatur pariatur quisquam voluptate doloremque nostrum explicabo autem quaerat nisi omnis fugit beatae, esse ipsam, assumenda tenetur."
//         },
//         {
//             title: "Building a Blog",
//             body: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Officiis dolor ullam non reprehenderit consequatur pariatur quisquam voluptate doloremque nostrum explicabo autem quaerat nisi omnis fugit beatae, esse ipsam, assumenda tenetur."
//         },
//         {
//             title: "Building a Blog",
//             body: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Officiis dolor ullam non reprehenderit consequatur pariatur quisquam voluptate doloremque nostrum explicabo autem quaerat nisi omnis fugit beatae, esse ipsam, assumenda tenetur."
//         },
//         {
//             title: "Building a Blog",
//             body: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Officiis dolor ullam non reprehenderit consequatur pariatur quisquam voluptate doloremque nostrum explicabo autem quaerat nisi omnis fugit beatae, esse ipsam, assumenda tenetur."
//         },
//         {
//             title: "Building a Blog",
//             body: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Officiis dolor ullam non reprehenderit consequatur pariatur quisquam voluptate doloremque nostrum explicabo autem quaerat nisi omnis fugit beatae, esse ipsam, assumenda tenetur."
//         },
//         {
//             title: "Building a Blog",
//             body: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Officiis dolor ullam non reprehenderit consequatur pariatur quisquam voluptate doloremque nostrum explicabo autem quaerat nisi omnis fugit beatae, esse ipsam, assumenda tenetur."
//         },
//     ])
// }
// // insertPostData();