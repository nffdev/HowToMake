const { Schema, model } = require('mongoose');

const blogSchema = new Schema({
    id: String,
    title: String,
    content: String,
    createdAt: String,
    author: {
        id: String,
        username: String
    }
});

module.exports = model('blog', blogSchema);