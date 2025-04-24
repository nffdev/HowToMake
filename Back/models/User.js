const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    id: String,
    username: String,
    email: String,
    password: String,
    token: String,
    role: {
        type: String,
        enum: ['user', 'admin', 'owner'],
        default: 'user'
    }
});

module.exports = model('user', userSchema);