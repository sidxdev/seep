const ADMIN_KEY = process.env.ADMIN_KEY;

const checkForAdminKey = (req, res, next) => {
    let adminKey = req.headers['x-admin-key']
    if (ADMIN_KEY === undefined
        || adminKey === undefined
        || adminKey !== ADMIN_KEY)
        return res.sendStatus(403)
    next()
}

module.exports = { checkForAdminKey }