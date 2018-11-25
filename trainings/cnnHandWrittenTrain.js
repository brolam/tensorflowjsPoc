const config = require("../config");
const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');
const cnnHandWrittenData = require('./cnnHandWrittenData');

const IMAGE_HEIGHT = 28;
const IMAGE_WIDTH = 28;
const IMAGE_FLAT_SIZE = IMAGE_HEIGHT * IMAGE_WIDTH;
const LABEL_FLAT_SIZE = 10;

exports.getExamplesTrain = async function (amount) {
    await cnnHandWrittenData.loadData();
    const { images, labels } = cnnHandWrittenData.getTrainData();
    return { images: images.slice(0, amount), labels: labels.slice(0, amount) };
}

exports.getLabelTrain = async function (image) {
    const modelLoaded = await tf.loadModel(`file://${config.trainingsPath()}/model-3/model.json`);
    const imagesShape = [1, IMAGE_HEIGHT, IMAGE_WIDTH, 1];
    const imagesXs = new Float32Array(tf.util.sizeFromShape(imagesShape));
    imagesXs.set(image, 0);
    const input = tf.tensor4d(imagesXs, imagesShape);
    const predic = modelLoaded.predict(input);
    return { label: predic.argMax(1).dataSync(), probability: predic.dataSync() };
}

/*
 * This will iteratively train our model.
 *
 * xs - training data x values
 * ys — training data y values
 */
exports.doTrain = function (trainProps, socketIo) {
    let epochLog = { epochs: 0, currentEpoch: 0, loss: 0, running: true };
    let countEmits = 0;
    const validationSplit = 0.15;
    const batchSize = 128;
    const { images, labels } = cnnHandWrittenData.getTrainData();
    const amount = trainProps.data.amountImages;
    const { model, xs, ys } = buildModelForTraining(images.slice(0, amount), labels.slice(0, amount));
    model.fit(xs, ys, {
        epochs: trainProps.epochs,
        validationSplit,
        batchSize,
        callbacks: {
            onEpochEnd: async (epoch, log) => {
                process.stdout.write('\033[0G');
                //process.stdout.write(`Epoch: ${epoch} log: ${log.loss} \n`);
                //console.log(`Epoch ${epoch}: loss = ${log.loss}`);
                if (countEmits == 1) {
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
                model.save(`file://${config.trainingsPath()}/model-3`)
                    .then(() => {
                        console.log('Training saved with success!');
                        setStopTrainig();
                        /*
                        for (index = 0; index < images.length; index++) {
                            const imagesShape = [1, IMAGE_HEIGHT, IMAGE_WIDTH, 1];
                            const imagesXs = new Float32Array(tf.util.sizeFromShape(imagesShape));
                            imagesXs.set(images[index], 0);
                            const input = tf.tensor4d(imagesXs, imagesShape);
                            const predic = model.predict(input);
                            console.log(labels[index][0], predic.dataSync());
                        }
                        */
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

function buildModelForTraining(images, labels) {
    const size = images.length;
    const imagesShape = [size, IMAGE_HEIGHT, IMAGE_WIDTH, 1];
    const imagesXs = new Float32Array(tf.util.sizeFromShape(imagesShape));
    const labelsYs = new Int32Array(tf.util.sizeFromShape([size, 1]));
    let imageOffset = 0;
    let labelOffset = 0;
    for (let i = 0; i < size; i++) {
        imagesXs.set(images[i], imageOffset);
        labelsYs.set(labels[i], labelOffset);
        imageOffset += IMAGE_FLAT_SIZE;
        labelOffset += 1;
    }
    const xs = tf.tensor4d(imagesXs, imagesShape);
    const ys = tf.oneHot(tf.tensor1d(labelsYs, 'int32'), LABEL_FLAT_SIZE).toFloat();
    console.log(xs.dataSync());
    console.log(ys.dataSync());
    const model = tf.sequential();
    model.add(tf.layers.conv2d({
        inputShape: [IMAGE_HEIGHT, IMAGE_WIDTH, 1],
        filters: 32,
        kernelSize: 3,
        activation: 'relu',
    }));
    model.add(tf.layers.conv2d({
        filters: 32,
        kernelSize: 3,
        activation: 'relu',
    }));
    model.add(tf.layers.maxPooling2d({ poolSize: [2, 2] }));
    model.add(tf.layers.conv2d({
        filters: 64,
        kernelSize: 3,
        activation: 'relu',
    }));
    model.add(tf.layers.conv2d({
        filters: 64,
        kernelSize: 3,
        activation: 'relu',
    }));
    model.add(tf.layers.maxPooling2d({ poolSize: [2, 2] }));
    model.add(tf.layers.flatten());
    model.add(tf.layers.dropout({ rate: 0.25 }));
    model.add(tf.layers.dense({ units: 512, activation: 'relu' }));
    model.add(tf.layers.dropout({ rate: 0.5 }));
    model.add(tf.layers.dense({ units: 10, activation: 'softmax' }));

    const optimizer = 'rmsprop';
    model.compile({
        optimizer: optimizer,
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy'],
    });
    return { model, xs, ys };
}