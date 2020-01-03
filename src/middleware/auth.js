const User = require('../models/user')
const jwt = require('jsonwebtoken')

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        
        const decoded = jwt.verify(token, 'mysecret')
        console.log(decoded)
        const user = await User.findOne({_id: decoded._id, 'tokens.token': token})
        console.log('aaaaaaaaaaaaaa', user)
        if (!user) {
            throw new Error('Hopp')
        }
        req.token = token
        req.user = user
        next()
        console.log(user)
    } catch (error) {
        res.status(401).send({error: 'Please Authenticate!'})
    }
}

module.exports = auth