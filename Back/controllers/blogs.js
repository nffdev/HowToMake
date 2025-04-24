const { DiscordSnowflake } = require('@sapphire/snowflake');
const moment = require('moment');
const Blog = require('../models/Blog');

const getBlogs = async (req, res) => {
    let blogs = await Blog.find();

    blogs = blogs.map(b => {
        const blog = b.toJSON();

        delete blog._id;
        delete blog.__v;
        
        return blog;
    });

    return res.status(200).json(blogs);
}

const getBlog = async (req, res) => {
    const { id } = req.params;

    let blog = await Blog.findOne({ id });
    if (!blog) return res.status(400).json({ message: 'There is no blog with this id.' });

    blog = blog.toJSON();
    delete blog._id;
    delete blog.__v;

    return res.status(200).json(blog);
}

const createBlog = async (req, res) => {
    const { title, content } = req.body;

    if (!title) return res.status(400).json({ message: 'Title is required.' });
    if (!content) return res.status(400).json({ message: 'Content is required.' });

    if (typeof title !== 'string') return res.status(400).json({ message: 'Title must be a string.' });
    if (typeof content !== 'string') return res.status(400).json({ message: 'Content must be a string.' });

    if (title.length > 50) return res.status(400).json({ message: 'The title may not exceed 50 characters.' });

    let blog = new Blog({
        id: DiscordSnowflake.generate().toString(),
        title,
        content,
        createdAt: moment(new Date()).format('MMMM D, YYYY'),
        author: {
            id: req.user.id,
            username: req.user.username
        }
    });
    await blog.save();

    blog = blog.toJSON();
    delete blog._id;
    delete blog.__v;

    return res.status(200).json(blog);
}

const editBlog = async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) return res.status(400).json({ message: 'Content is required.' });
    if (typeof content !== 'string') return res.status(400).json({ message: 'Content must be a string.' });

    let blog = await Blog.findOne({ id });
    if (!blog) return res.status(400).json({ message: 'There is no blog with this id.' });

    blog.content = content;

    await blog.save();

    blog = blog.toJSON();
    delete blog._id;
    delete blog.__v;

    return res.status(200).json(blog);
}

const deleteBlog = async (req, res) => {
    const { id } = req.params;

    const existingBlog = await Blog.findOne({ id });
    if (!existingBlog) return res.status(400).json({ message: 'There is no blog with this id.' });

    await Blog.findOneAndDelete({ id });

    return res.status(204).send(null);
}

const getOwnerBlog = async (req, res) => {
    const ownerId = process.env.OWNER_ID;
    
    let blog = await Blog.findOne({ 'author.id': ownerId }).sort({ id: -1 });
    if (!blog) return res.status(404).json({ message: 'The owner has not published a blog yet.' });
    
    blog = blog.toJSON();
    delete blog._id;
    delete blog.__v;
    
    return res.status(200).json(blog);
}

module.exports = {
    getBlogs,
    getBlog,
    getOwnerBlog,
    createBlog,
    editBlog,
    deleteBlog
};