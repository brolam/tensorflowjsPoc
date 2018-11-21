const config = require("../config");
const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');

function generateData(numPoints, coeff, sigma = 0.04) {
    return tf.tidy(() => {
        const [a, b, c, d] = [
            tf.scalar(coeff.a), tf.scalar(coeff.b), tf.scalar(coeff.c),
            tf.scalar(coeff.d)
        ];

        const xs = tf.randomUniform([numPoints], -1, 1);

        // Generate polynomial data
        const three = tf.scalar(3, 'int32');
        const ys = a.mul(xs.pow(three))
            .add(b.mul(xs.square()))
            .add(c.mul(xs))
            .add(d)
            // Add random noise to the generated data
            // to make the problem a bit more interesting
            .add(tf.randomNormal([numPoints], 0, sigma));

        // Normalize the y values to the range 0 to 1.
        const ymin = ys.min();
        const ymax = ys.max();
        const yrange = ymax.sub(ymin);
        const ysNormalized = ys.sub(ymin).div(yrange);
        return {
            xs,
            ys: ysNormalized
        };
    })
}

exports.getExamplesTrain = function () {
    const trueCoefficients = { a: -.8, b: -.2, c: .9, d: .5 };
    const trainingData = generateData(100, trueCoefficients);
    const yvals = trainingData.ys.dataSync();
    const xvals = trainingData.xs.dataSync();
    const values = Array.from(yvals).map((y, i) => {
        return { x: parseFloat(xvals[i]).toFixed(2),  yReal: parseFloat(yvals[i]).toFixed(2), yPredic: 0.0 };
    });
    return values;
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


