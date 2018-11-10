const training = require("./trainings")

exports.doSequentialTrain = (req, res) => {
  const trainStatus = training.sequentialTrain.doTrain(req.body, this.socketIo)
  res.send(JSON.stringify(trainStatus));
}

exports.getSequentialTrain = (req, res) => {
  const traingFile = training.sequentialTrain.getTrainFile(req.params.train, req.params.file)
  res.sendFile(traingFile, { root: '.' });
}