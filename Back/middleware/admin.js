module.exports = async (req, res, next) => {
    if (req.user.id === process.env.OWNER_ID || req.user.role === 'admin' || req.user.role === 'owner') {
        return next();
    }
    
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
}