module.exports = async (req, res, next) => {
    if (req.user.id !== process.env.OWNER_ID) return res.status(403).json({ message: 'Not allowed.' });

    next();
}