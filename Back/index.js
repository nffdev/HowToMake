const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

app.disable('x-powered-by');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '8mb' }));

app.use(cors({
    // origin: ['http://localhost:5173', 'http://192.168.1.80:5173'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
}));

app.listen(process.env.PORT, () => console.log(`Server listening on port ${process.env.PORT}`))

mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log('Connected to mongodb');
    })
    .catch(err => console.log(`Error to connect to mongodb: ${err}`));

const base_route = '/api';

const userRoutes = require('./routes/user');
const blogsRoutes = require('./routes/blogs');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');

app.use(base_route + '/user', authMiddleware, userRoutes);
app.use(base_route + '/blogs', blogsRoutes);
app.use(base_route + '/auth', authRoutes);

process
    .setMaxListeners(0)
    .on("uncaughtException", err => console.error(err))
    .on("unhandledRejection", err => console.error(err));