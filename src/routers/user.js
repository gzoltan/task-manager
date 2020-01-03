const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')

const router = new express.Router

router.get('/users/me', auth, async (req, res) => {
    console.log('asddddddddddddddd', req.user)
    res.send(req.user)
})

router.post('/users/login', async(req, res) => {
    
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    } catch (error) {
        res.status(400).send(error)
    }

})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send(req.user)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/users/logout', auth, async (req, res) => {
    console.log("TOKEN: ", req.token)
    try {
        req.user.tokens = req.user.tokens.filter(token => {
            console.log("TOKen: ", token)
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send()
    }
})


// Create user 
router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.send({user, token})
    } catch (error) {
        res.status(400).send(error)
    }
})

router.patch('/users/me', auth,  async(req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['email', 'name', 'age', 'password']
    const isValidUpdate = updates.every(update => allowedUpdates.includes(update))
    if (!isValidUpdate) return res.status(400).send('Invalid updates!')
    try {
        const user = req.user
        //const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
        updates.forEach(update => {
            user[update] = req.body[update]
        })
        await user.save()
        res.send(user)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/users/me', auth, async(req, res) => {
    try {
        req.user.remove()
        res.send(user)
    } catch (error) {
        res.status(400).send(error)
    }
})

module.exports = router