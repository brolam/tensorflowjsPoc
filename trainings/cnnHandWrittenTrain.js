const config = require("../config");
const tf = require('@tensorflow/tfjs');
const cnnHandWrittenData = require('./cnnHandWrittenData');
require('@tensorflow/tfjs-node');

exports.getExamplesTrain = async function(amont) {
    await cnnHandWrittenData.loadData();
    const { images, labels } = cnnHandWrittenData.getTrainData();
    return { images: images.slice(0, amont), labels: labels.slice(0, amont) };
}

/*
 * This will iteratively train our model.
 *
 * xs - training data x values
 * ys — training data y values
 */
exports.doTrain = function (trainProps, socketIo) {
    //Train Data:
    var x = [];
    var y = [];
    trainProps.data.forEach((item) => {
        x.push(item.x);
        y.push(item.yReal);
    })
    //Inputs Tensors
    const xs = tf.tensor2d(x, [x.length, 1]);
    const ys = tf.tensor2d(y, [y.length, 1]);
    let epochLog = { epochs: 0, currentEpoch: 0, loss: 0, running: true };
    let countEmits = 0;
    const model = tf.sequential({
        name: 'nn',
        layers: [
            // Neural network with one hidden layer
            tf.layers.dense({ units: trainProps.numNodes, activation: 'relu', inputShape: [1] }),
            tf.layers.dense({ units: 1 })
        ]
    });
    model.compile({ loss: 'meanSquaredError', optimizer: 'adam' });
    model.fit(xs, ys, {
        epochs: trainProps.epochs,
        callbacks: {
            onEpochEnd: async (epoch, log) => {
                process.stdout.write('\033[0G');
                //process.stdout.write(`Epoch: ${epoch} log: ${log.loss} \n`);
                //console.log(`Epoch ${epoch}: loss = ${log.loss}`);
                if (countEmits == 100) {
                    epochLog = { epochs: trainProps.epochs, currentEpoch: epoch, loss: log.loss, running: true };
                    socketIo.emit('sequentialTrain', epochLog);
                    countEmits = 0;
                }
                countEmits++;
            },
            onTrainEnd: async () => {
                const setStopTrainig = () => {
                    epochLog.running = false;
                    socketIo.emit('sequentialTrain', epochLog);
                };
                model.save(`file://${config.trainingsPath()}/model-2`)
                    .then(() => {
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


