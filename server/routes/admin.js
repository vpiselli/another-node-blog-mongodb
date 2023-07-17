const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;

/**
 * Check logged user Middleware
 */
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Unaithorized' });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unaithorized' });
    }
}

/**
 * POST / Admin Register
 */
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const user = await User.create({ username, password: hashedPassword });
            res.status(201).json({ message: 'User created', user });
        } catch (error) {
            if (error.code === 11000) {
                res.status(409).json({ message: 'User already in use' });
            }
            res.status(500).json({ message: 'Internal server Error' });
        }
    } catch (error) {
        console.log(error);
    }
});

/**
 * GET / Admin Login Page
 */
router.get('/admin', (req, res) => {
    try {
        const locals = {
            title: "Admin",
            description: 'Admin pages for Simple Blog created with NodeJs, Express & MongoDB.'
        }

        res.render('admin/index', { locals, layout: adminLayout })
    } catch (error) {
        console.log(error);
    }
});

/**
 * POST / Admin Check Login
 */
router.post('/admin', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, jwtSecret);
        res.cookie('token', token, { httpOnly: true });

        res.redirect('/dashboard');

    } catch (error) {
        console.log(error);
    }
});

/**
 * GET / Admin Dashboard
 */
router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "Dashboard",
            description: 'Admin pages for Simple Blog created with NodeJs, Express & MongoDB.'
        }

        const data = await Post.find().sort({ createdAt: -1 });
        res.render('admin/dashboard', { locals, data, layout: adminLayout });
    } catch (error) {
        console.log(error)
    }
});

/**
 * GET / Admin - Create New Post
 */
router.get('/add-post', authMiddleware, (req, res) => {
    try {
        const locals = {
            title: "Create new post",
            description: 'Admin pages for Simple Blog created with NodeJs, Express & MongoDB.'
        }

        res.render('admin/add-post', { locals, layout: adminLayout });
    } catch (error) {
        console.log(error);
    }
});

/**
 * POST / Admin - Create New Post
 */
router.post('/add-post', authMiddleware, async (req, res) => {
    try {
        const { title, body } = req.body;

        const newPost = new Post({
            title: title,
            body: body
        });

        await Post.create(newPost);

        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
});

/**
 * GET / Admin - Edit Post
 */
router.get('/edit-post/:id', async (req, res) => {
    try {
        const slug = req.params.id;
        const data = await Post.findById({ _id: slug });
        const locals = {
            title: data.title,
            description: "Simple Blog create with NodeJs, Express & MongoDB."
        }
        res.render('admin/edit-post', { locals, data, layout: adminLayout })
    } catch (error) {
        console.log(error);
    }
});

/**
 * POST / Admin - Edit Post
 */
router.put('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
        const { title, body } = req.body;
        const id = req.params.id;
        await Post.findByIdAndUpdate(id, {
            title,
            body,
            updatedAt: Date.now()
        });

        res.redirect(`/edit-post/${id}`);
    } catch (error) {
        console.log(error);
    }
});

/**
 * DELETE / Admin - Delete Post
 */
router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
    try {
        const id = req.params.id;
        await Post.findOneAndDelete({ _id: id });

        res.redirect(`/dashboard`);
    } catch (error) {
        console.log(error);
    }
});

/**
 * GET / Admin - Logout
 */
router.get('/logout', authMiddleware, async (req, res) => {
    res.clearCookie('token');
    // res.json({ message: "Logout successful." });
    res.redirect("/");
});

module.exports = router;