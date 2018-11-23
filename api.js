const training = require("./trainings")

exports.doSequentialTrain = (req, res) => {
  const trainStatus = training.sequentialTrain.doTrain(req.body, this.socketIo)
  res.send(JSON.stringify(trainStatus));
}

exports.getSequentialTrain = (req, res) => {
  const traingFile = training.sequentialTrain.getTrainFile(req.params.train, req.params.file)
  res.sendFile(traingFile, { root: '.' });
}

exports.getPolynomialTrainExamples = (req, res) => {
  const examples = training.polynomialTrain.getExamplesTrain();
  res.send(JSON.stringify(examples));
}

exports.doPolynomialTrain = (req, res) => {
  const trainStatus = training.polynomialTrain.doTrain(req.body, this.socketIo)
  res.send(JSON.stringify(trainStatus));
}

exports.getCnnHandWrittenTrainExamples = async function(req, res) {
  const examples = await training.cnnHandWrittenTrain.getExamplesTrain(req.params.amount);
  res.send(JSON.stringify(examples));
}

exports.getCnnHandWrittenTrainLabel = async function(req, res) {
  const label = await training.cnnHandWrittenTrain.getLabelTrain(req.body);
  res.send(JSON.stringify(label));
}

exports.doCnnHandWrittenTrain = (req, res) => {
  console.log(req.body);
  const trainStatus = training.cnnHandWrittenTrain.doTrain(req.body, this.socketIo)
  res.send(JSON.stringify(trainStatus));
}

