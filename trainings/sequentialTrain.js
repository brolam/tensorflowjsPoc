const config = require("../config")
const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node'); // Use '@tensorflow/tfjs-node-gpu' if running with GPU.

exports.doTrain = function(trainProps, socketIo){
    // Train a simple model:
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 1, inputShape: [1] }));
    // Prep for training
    model.compile({ loss: 'meanSquaredError', optimizer: 'sgd' });
    var x = [];
    var y = [];
    trainProps.data.forEach((item) => {
        x.push(item.x);
        y.push(item.yReal);
    })
    //const x = [1, 2, 3, 4, 5, 7, 08, 09, 10];
    //const y = [1, 3, 5, 7, 8, 9, 10, 15, 15];
    const xs = tf.tensor2d(x, [x.length, 1]);
    const ys = tf.tensor2d(y, [y.length, 1]);
    let epochLog = { epochs: 0, currentEpoch: 0, loss: 0, running: true };
    let countEmits = 0;

    model.fit(xs, ys, {
        epochs: trainProps.epochs,
        callbacks: {
            onEpochEnd: async (epoch, log) => {
                //console.log(`Epoch ${epoch}: loss = ${log.loss}`);
                if (countEmits == 100) {
                    epochLog = { epochs: trainProps.epochs, currentEpoch: epoch, loss: log.loss, running: true };
                    socketIo.emit('sequentialTrain', epochLog);
                    countEmits = 0;
                }
                countEmits++;
            },
            onTrainEnd: async () => {
                const setStopTrainig = () =>{
                    epochLog.running = false;
                    socketIo.emit('sequentialTrain', epochLog);
                };
                model.save(`file://${config.trainingsPath()}/model-1`)
                .then(() =>{
                    setStopTrainig();
                })
                .catch((reason) => {
                    console.log(reason);
                    setStopTrainig();
                });
            }
        }
    });
    return epochLog;
}

exports.getTrainFile = function (train, file) {
    return `${config.trainingsPath()}/${train}/${file}`
}
