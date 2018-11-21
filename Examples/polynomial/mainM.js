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
// Step 1. Set up variables, these are the things we want the model
// to learn in order to do prediction accurately. We will initialize
// them with random values.
const a = tf.variable(tf.scalar(Math.random()));
const b = tf.variable(tf.scalar(Math.random()));
const c = tf.variable(tf.scalar(Math.random()));
const d = tf.variable(tf.scalar(Math.random()));
const tfVariablesBefore = {
    a: a.dataSync()[0],
    b: b.dataSync()[0],
    c: c.dataSync()[0],
    d: d.dataSync()[0],
}
const x = trainingData.xs.dataSync();
const y = trainingData.ys.dataSync();
//Inputs Tensors
const xs = tf.tensor2d(x, [x.length, 1]);
const ys = tf.tensor2d(y, [y.length, 1]);
/*
 * This function represents our 'model'. Given an input 'x' it will try and
 * predict the appropriate output 'y'.
 *
 * It is also sometimes referred to as the 'forward' step of our training
 * process. Though we will use the same function for predictions later.
 *
 * @return number predicted y value
 */
function predict(x) {
    // y = a * x ^ 3 + b * x ^ 2 + c * x + d
    return tf.tidy(() => {
        return a.mul(x.pow(tf.scalar(3, 'int32')))
            .add(b.mul(x.square()))
            .add(c.mul(x))
            .add(d);
    });
}
/*
 * This will tell us how good the 'prediction' is given what we actually
 * expected.
 *
 * prediction is a tensor with our predicted y values.
 * labels is a tensor with the y values the model should have predicted.
 */
function loss(prediction, labels) {
    // Having a good error function is key for training a machine learning model
    const error = prediction.sub(labels).square().mean();
    return error;
}
// Step 2. Create an optimizer, we will use this later. You can play
// with some of these values to see how the model performs.
const numIterations = 1000;
const learningRate = 0.5;
const optimizer = tf.train.sgd(learningRate);

optimizer.minimize(() => {
    console.log('minimize');
    // Feed the examples into the model
    const pred = predict(xs);
    return loss(pred, ys);
}, false, [a,b,c,d]);
// Train a simple model:
const model = tf.sequential();
model.add(tf.layers.dense({units: 1, inputShape: [1]}));
model.compile({ loss: [loss], optimizer: optimizer });
// Train the model!
//train(trainingData.xs, trainingData.ys, numIterations);
model.fit(xs, ys, {
    epochs: numIterations,
    callbacks: {
        onEpochEnd: async (epoch, log) => {
            process.stdout.write('\033[0G');
            process.stdout.write(`Epoch: ${epoch} log: ${log.loss} a:${ a.dataSync()[0]} b:${b.dataSync()[0]} c:${c.dataSync()[0]} d:${d.dataSync()[0]} \n`);
        },
        onTrainEnd: async () => {
            model.save(`file://model-2`)
            .then(() =>{
                console.log('Model saved with sucesso!');
                console.log({
                    aBefore:tfVariablesBefore.a,
                    aAfter : a.dataSync()[0],
                    bBefore:tfVariablesBefore.b,
                    bAfter: b.dataSync()[0],
                    cBefore:tfVariablesBefore.c,
                    cAfter: c.dataSync()[0],
                    dBefore:tfVariablesBefore.d,
                    dAfter: d.dataSync()[0],
                  });
            })
            .catch((reason) => {
                console.log(reason);
            });
        }
    }
});
