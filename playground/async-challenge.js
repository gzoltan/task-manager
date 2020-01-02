const Task = require('../src/models/task')

const deleteTaskAndCount = async(id) => {
    const task = await Task.findByIdAndDelete(id)
    const incompletes = await Task.countDocuments({completed: false})
    return incompletes
}

const done = deleteTaskAndCount('5deead219a50c71c50d7c6e0')

console.log(done)