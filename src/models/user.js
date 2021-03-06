const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('../models/task')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('The Email is invalid')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if(value < 0) {
                throw new Error('The age must be a positive numbver')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value) {
            if(value.toLowerCase().includes('password')) {
                throw new Error('The password should not contain the word "password"')
            }
        }
    }, 
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function() {
    const user = this 
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens 

    return userObject
}

userSchema.methods.generateAuthToken = async function() {
    const user = this 
    const token = jwt.sign({_id: user._id.toString()}, 'mysecret')
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token

}

userSchema.statics.findByCredentials = async(email, password) => {
    
    const user = await User.findOne({email})

    if(!user) throw new Error('Unable to login')
    
    const isAuthorized = await bcrypt.compare(password, user.password)

    if(!isAuthorized) throw new Error('Unable to login')
    
    return user
}

userSchema.pre('save', async function(next) {
    const user = this 
    if (user.isModified('password')) {
        console.log('asd')
        user.password = await bcrypt.hash(user.password, 8)
        console.log(user.password)
    }
    next()
})

userSchema.pre('remove', async function(next) {
    const user = this
    await Task.deleteMany({owner: user._id})
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User