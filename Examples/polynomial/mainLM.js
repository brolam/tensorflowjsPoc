const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');
const data = require('./data');
/**
 * We want to learn the coefficients that give correct solutions to the
 * following cubic equation:
 *      y = a * x^3 + b * x^2 + c * x + d
 * In other words we want to learn values for:
 *      a
 *      b
 *      c
 *      d
 * Such that this function produces 'desired outputs' for y when provided
 * with x. We will provide some examples of 'xs' and 'ys' to allow this model
 * to learn what we mean by desired outputs and then use it to produce new
 * values of y that fit the curve implied by our example.
 */
const trueCoefficients = { a: -.8, b: -.2, c: .9, d: .5 };
const trainingData = data.generateData(100, trueCoefficients);
const x = trainingData.xs.dataSync();
const y = trainingData.ys.dataSync();
//Trainings params 
const epochs = 1000;
const learningRate = 0.5;
const numNodes = 40;
//Inputs Tensors
const xs = tf.tensor2d(x, [x.length, 1]);
const ys = tf.tensor2d(y, [y.length, 1]);
const model = tf.sequential({
    name: 'nn',
    layers: [
      // Neural network with one hidden layer
      tf.layers.dense({units: numNodes, activation: 'relu', inputShape: [1]}),
      tf.layers.dense({units: 1})
    ]
  });
model.compile({loss: 'meanSquaredError', optimizer: 'adam'});
// Step 2. Create an optimizer, we will use this later. You can play
// with some of these values to see how the model performs.
model.fit(xs, ys, {
    epochs: epochs,
    callbacks: {
        onEpochEnd: async (epoch, log) => {
            process.stdout.write('\033[0G');
            process.stdout.write(`Epoch: ${epoch} log: ${log.loss} \n`);
        },
        onTrainEnd: async () => {
            model.save(`file://model-2`)
            .then(() =>{
                console.log('Model saved with sucesso!');
            })
            .catch((reason) => {
                console.log(reason);
            });
        }
    }
});