
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

// Step 2. Create an optimizer, we will use this later. You can play
// with some of these values to see how the model performs.
const numIterations = 1000;
const learningRate = 0.3;
const optimizer = tf.train.sgd(learningRate);

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

/*
 * This will iteratively train our model.
 *
 * xs - training data x values
 * ys — training data y values
 */
async function train(xs, ys, numIterations) {
    for (let iter = 0; iter < numIterations; iter++) {
        // optimizer.minimize is where the training happens.

        // The function it takes must return a numerical estimate (i.e. loss)
        // of how well we are doing using the current state of
        // the variables we created at the start.

        // This optimizer does the 'backward' step of our training process
        // updating variables defined previously in order to minimize the
        // loss.
        optimizer.minimize(() => {
            // Feed the examples into the model
            const pred = predict(xs);
            process.stdout.write('\033[0G')
            process.stdout.write(`Loss:${loss(pred, ys).dataSync()}`);
            return loss(pred, ys);
        });
        // Use tf.nextFrame to not block the browser.
        await tf.nextFrame();
    }
}

console.log({
    a: a.dataSync()[0],
    b: b.dataSync()[0],
    c: c.dataSync()[0],
    d: d.dataSync()[0],
  })
// Train the model!
train(trainingData.xs, trainingData.ys, numIterations);

console.log({
    a: a.dataSync()[0],
    b: b.dataSync()[0],
    c: c.dataSync()[0],
    d: d.dataSync()[0],
  })

const yvals = trainingData.ys.dataSync();
const xvals = trainingData.xs.dataSync();
const predVals = predict(trainingData.xs).dataSync();

const values = Array.from(yvals).map((y, i) => {
    return {'x': xvals[i], 'y': yvals[i], pred: predVals[i]};
});

console.log(values);
