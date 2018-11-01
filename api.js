const training = require("./trainings")

exports.doSequentialTrain = (req, res) => {
  training.sequentialTrain.doTrain()
  res.send({ express: 'sequential train was started' });
}

exports.getSequentialTrain = (req, res) => {
  const traingFile =  training.sequentialTrain.getTrainFile(req.params.train, req.params.file)
  res.sendFile(traingFile, { root: '.' });
}