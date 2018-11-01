const config = require("./config")
const api = require("./api.js")

exports.setUp = (app, express) => {
    app.all('/*', function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.header("Access-Control-Allow-Methods","POST, GET, OPTIONS, DELETE, PUT, HEAD");
        next()
    });
    
    app.get('/api/doSequentialTrain', api.doSequentialTrain);
    app.get('/api/getSequentialTrainFile/:train/:file', api.getSequentialTrain)
}