const config = require("./config")
const api = require("./api.js")
const bodyParser = require('body-parser');

exports.setUp = (app, express, socketIo) => {
    app.all('/*', function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Authorization");
        res.header("Access-Control-Allow-Methods","POST, GET, OPTIONS, DELETE, PUT, HEAD");
        res.header('Access-Control-Allow-Credentials', 'true');
        next()
    });
    app.use(bodyParser.json()); // support json encoded bodies
    app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
    api.socketIo = socketIo
    app.post('/api/doSequentialTrain', api.doSequentialTrain);
    app.get('/api/getSequentialTrainFile/:train/:file', api.getSequentialTrain)
}