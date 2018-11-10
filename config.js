const fs = require('fs')
const path = require('path')

exports.dataPath = function () {
    const dataPath = 'data'
    fs.existsSync(dataPath) || fs.mkdirSync(dataPath);
    return path.join(dataPath)
}

exports.trainingsPath = function () {
    const trainings = `${exports.dataPath()}/trainings`
    fs.existsSync(trainings) || fs.mkdirSync(trainings);
    return path.join(trainings)
}

exports.appPath = function () {
    return path
}

