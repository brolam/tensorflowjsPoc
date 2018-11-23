const config = require("./config")
const api = require("./api.js")
const bodyParser = require('body-parser');

exports.setUp = (app, express, socketIo) => {
    app.all('/*', function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Authorization");
        res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PUT, HEAD");
        res.header('Access-Control-Allow-Credentials', 'true');
        next()
    });
    app.use(bodyParser.json({limit: '2000mb'})); // support json encoded bodies
    app.use(bodyParser.urlencoded({ extended: true, limit: '2000mb' })); // support encoded bodies
    api.socketIo = socketIo;
    app.post('/api/doSequentialTrain', api.doSequentialTrain);
    app.get('/api/getSequentialTrainFile/:train/:file', api.getSequentialTrain);
    app.get('/api/getPolynomialTrainExamples', api.getPolynomialTrainExamples);
    app.post('/api/doPolynomialTrain', api.doPolynomialTrain);
    app.get('/api/getCnnHandWrittenTrainExamples/:amount', api.getCnnHandWrittenTrainExamples);
    app.post('/api/doCnnHandWrittenTrain', api.doCnnHandWrittenTrain);
    app.post('/api/getCnnHandWrittenTrainLabel/', api.getCnnHandWrittenTrainLabel);
}