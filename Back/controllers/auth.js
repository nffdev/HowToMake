const { DiscordSnowflake } = require('@sapphire/snowflake');
const bcrypt = require('bcrypt');
const crypto = require('node:crypto');
const User = require('../models/User');
const utils = require('../utils');

const register = async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    if (!username) return res.status(400).json({ message: 'Username is required.' });
    if (!email) return res.status(400).json({ message: 'Email is required.' });
    if (!password) return res.status(400).json({ message: 'Password is required.' });
    if (!confirmPassword) return res.status(400).json({ message: 'You must confirm your password.' });

    if (typeof username !== 'string') return res.status(400).json({ message: 'Username must be a string.' });
    if (typeof email !== 'string') return res.status(400).json({ message: 'Email must be a string.' });
    if (typeof password !== 'string') return res.status(400).json({ message: 'Password must be a string.' });
    if (typeof confirmPassword !== 'string') return res.status(400).json({ message: 'Confirm password must be a string.' });

    if (password !== confirmPassword) return res.status(400).json({ message: 'Passwords are not matching.' });

    const usernameRegex = /^[a-z0-9_.]+$/;

    if (username.length < 3 || username.length > 50) return res.status(400).json({ message: 'Username must be between 3 and 50 characters long.' });
    if (!usernameRegex.test(username)) return res.status(400).json({ message: 'Username must include only lower-case letters, numbers, _ or .' });
    if (utils.hasBadWords(username)) return res.status(400).json({ message: 'Username includes a blacklisted word.' });

    const existingUsername = await User.findOne({ username });
    if (existingUsername) return res.status(400).json({ message: 'Username already in use.' });

    const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ message: 'The provided email is invalid.' });

    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ message: 'Email already in use.' });

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) return res.status(400).json({ message: 'The password must contain at least 8 characters, including at least one uppercase letter, one lowercase letter, one number and one special character.' });

    const hashedPassword = bcrypt.hashSync(password, 10);
    const token = crypto.randomBytes(24).toString('hex');
    const id = DiscordSnowflake.generate().toString();

    const role = id === process.env.OWNER_ID ? 'owner' : 'user';
    
    const user = new User({ id, username, email, password: hashedPassword, token, role });
    await user.save();

    return res.json({ token });
}

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email) return res.status(400).json({ message: 'Email is required.' });
    if (!password) return res.status(400).json({ message: 'Password is required.' });

    if (typeof email !== 'string') return res.status(400).json({ message: 'Email must be a string.' });
    if (typeof password !== 'string') return res.status(400).json({ message: 'Password must be a string.' });

    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: 'Email or password is invalid.' });
    if (!bcrypt.compareSync(password, user.password)) return res.status(400).json({ message: 'Email or password is invalid.' });

    return res.json({ token: user.token });
}

module.exports = {
    login,
    register
};