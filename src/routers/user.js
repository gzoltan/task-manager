const express = require('express')
const User = require('../models/user')

const router = new express.Router

router.get('/users', async (req, res) => {
    try {
        const users = await User.find()
        res.send(users)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) return res.send(user)
        res.send(user)
    } catch (error) {
        res.status(404).send(error)
    }
})

router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        res.send("User saved")
    } catch (error) {
        res.status(400).send(error)
    }
})

router.patch('/users/:id', async(req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['email', 'name', 'age', 'password']
    const isValidUpdate = updates.every(update => allowedUpdates.includes(update))
    if (!isValidUpdate) return res.status(400).send('Invalid updates!')
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
        if (!user) return res.status(404).send("User not found")
        res.send(user)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/users/:id', async(req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id)
        if (!user) return res.status(404).send('User not found!')
        res.send(user)
    } catch (error) {
        res.status(400).send(error)
    }
})

module.exports = router