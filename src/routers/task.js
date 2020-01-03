const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')

const router = new express.Router

router.get('/tasks', auth, async (req, res) => {
    try {
        await req.user.populate('tasks').execPopulate()
        res.send(req.user.tasks)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
        if (!task) return res.status(404).send('Task not found')

        await task.populate('owner').execPopulate()
        res.send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save()
        res.send("Task saved")
    } catch (error) {
        res.status(400).send(error)
    }
})

router.patch('/tasks/:id',auth, async(req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidUpdate = updates.every(update => allowedUpdates.includes(update))
    if (!isValidUpdate) return res.status(400).send('Invalid updates')
    try {
        //const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id })
        if (!task) return res.status(404).send('Task not found!')
        updates.forEach(update => {
            task[update] = req.body[update]
        })
        await task.save()
        res.send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/tasks/:id', auth, async(req, res) => {
    try {
        const task = await Task.findOneAndDelete({id: req.params.id, owner: req.user._id})
        if (!task) return res.status(404).send('Task not found')
        res.send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

module.exports = router