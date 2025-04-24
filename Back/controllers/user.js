const User = require('../models/User');
const Blog = require('../models/Blog');

const getMe = async (req, res) => {
    return res.status(200).json(req.user);
}

const getAllUsers = async (req, res) => {
    try {
        let users = await User.find();
        
        users = users.map(u => {
            const user = u.toJSON();
            delete user._id;
            delete user.__v;
            delete user.password;
            delete user.token;
            return user;
        });
        
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
}

const updateUserRole = async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;
    
    if (!role) return res.status(400).json({ message: 'Role is required.' });
    if (!['user', 'admin', 'owner'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role. Must be one of: user, admin, owner' });
    }
    
    try {
        const user = await User.findOne({ id: userId });
        if (!user) return res.status(404).json({ message: 'User not found.' });
        
        if (userId === process.env.OWNER_ID && role !== 'owner') {
            return res.status(403).json({ message: 'Cannot change the role of the owner.' });
        }
        
        user.role = role;
        await user.save();
        
        const updatedUser = user.toJSON();
        delete updatedUser._id;
        delete updatedUser.__v;
        delete updatedUser.password;
        delete updatedUser.token;
        
        return res.status(200).json(updatedUser);
    } catch (error) {
        return res.status(500).json({ message: 'Error updating user', error: error.message });
    }
}

const deleteUser = async (req, res) => {
    const { userId } = req.params;
    
    try {
        const user = await User.findOne({ id: userId });
        if (!user) return res.status(404).json({ message: 'User not found.' });
        
        if (userId === process.env.OWNER_ID) {
            return res.status(403).json({ message: 'Cannot delete the owner account.' });
        }
        
        await Blog.deleteMany({ 'author.id': userId });
        
        await User.findOneAndDelete({ id: userId });
        
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};

module.exports = {
    getMe,
    getAllUsers,
    updateUserRole,
    deleteUser
};