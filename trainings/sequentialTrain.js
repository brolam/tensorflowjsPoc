const config = require("../config")
const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node'); // Use '@tensorflow/tfjs-node-gpu' if running with GPU.

exports.doTrain = () => {
    // Train a simple model:
    const model = tf.sequential();
    model.add(tf.layers.dense({units: 1, inputShape: [1]}));
    // Prep for training
    model.compile({loss: 'meanSquaredError', optimizer: 'sgd'});
    const x = [1, 2, 3, 4, 5, 7, 08, 09, 10];
    const y = [1, 3, 5, 7, 8, 9, 10, 15, 15];
    const xs = tf.tensor2d(x, [x.length, 1]);
    const ys = tf.tensor2d(y, [y.length, 1]);

    //var epochLog = {}
  
    model.fit(xs, ys, {
        epochs: 1000,
        callbacks: {
            onEpochEnd: async(epoch, log) => {
                //console.log(`Epoch ${epoch}: loss = ${log.loss}`);
                //epochLog =  {'epoch': epoch, 'loss': log.loss, 'dateTime': Date() }
            },
            onTrainEnd: async() => {
              await model.save(`file://${config.trainingsPath()}/model-1`);
            }
        }
    });
}

exports.getTrainFile = function(train, file){
    return `${config.trainingsPath()}/${train}/${file}`
}
