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
    const { title, content, imageUrl, blocks } = req.body;

    if (!title) return res.status(400).json({ message: 'Title is required.' });
    
    if (!content && (!blocks || blocks.length === 0)) {
        return res.status(400).json({ message: 'Content or blocks are required.' });
    }

    if (typeof title !== 'string') return res.status(400).json({ message: 'Title must be a string.' });
    if (content && typeof content !== 'string') return res.status(400).json({ message: 'Content must be a string.' });
    if (imageUrl && typeof imageUrl !== 'string') return res.status(400).json({ message: 'Image URL must be a string.' });
    
    if (blocks) {
        if (!Array.isArray(blocks)) {
            return res.status(400).json({ message: 'Blocks must be an array.' });
        }
        
        for (const block of blocks) {
            if (!block.type || !['text', 'image'].includes(block.type)) {
                return res.status(400).json({ message: 'Each block must have a valid type (text or image).' });
            }
            if (!block.content) {
                return res.status(400).json({ message: 'Each block must have content.' });
            }
            if (block.position !== undefined && typeof block.position !== 'number') {
                return res.status(400).json({ message: 'Block position must be a number.' });
            }
        }
    }

    if (title.length > 50) return res.status(400).json({ message: 'The title may not exceed 50 characters.' });

    let blog = new Blog({
        id: DiscordSnowflake.generate().toString(),
        title,
        content: content || '',
        imageUrl: imageUrl || '',
        blocks: blocks || [],
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

const User = require('../models/User');

const getOwnerBlogs = async (req, res) => {
    const owners = await User.find({ role: 'owner' }, 'id');
    const ownerIds = owners.map(owner => owner.id);
    
    if (ownerIds.length === 0) {
        return res.status(404).json({ message: 'No owners found in the system.' });
    }
    
    let blogs = await Blog.find({ 'author.id': { $in: ownerIds } }).sort({ id: -1 });
    
    if (!blogs || blogs.length === 0) {
        return res.status(404).json({ message: 'The owners have not published any blogs yet.' });
    }
    
    blogs = blogs.map(b => {
        const blog = b.toJSON();
        delete blog._id;
        delete blog.__v;
        return blog;
    });
    
    return res.status(200).json(blogs);
}

module.exports = {
    getBlogs,
    getBlog,
    getOwnerBlogs,
    createBlog,
    editBlog,
    deleteBlog
};