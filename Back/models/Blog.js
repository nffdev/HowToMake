const { Schema, model } = require('mongoose');

const contentBlockSchema = new Schema({
    type: { type: String, enum: ['text', 'image'], required: true },
    content: String, 
    position: { type: Number, default: 0 } 
}, { _id: false });

const blogSchema = new Schema({
    id: String,
    title: String,
    content: String, 
    imageUrl: String, 
    blocks: [contentBlockSchema], 
    createdAt: String,
    author: {
        id: String,
        username: String
    }
});

module.exports = model('blog', blogSchema);