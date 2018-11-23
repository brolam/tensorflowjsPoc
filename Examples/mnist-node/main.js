/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');
//require('@tensorflow/tfjs-node-gpu');
const argparse = require('argparse');

const data = require('./data');
const model = require('./model');

async function run(epochs, batchSize, modelSavePath) {
  await data.loadData();
  const amountImages = 100;
  const { images, labels, imagesRoot, labelsRoot } = data.getTrainData();
  const trainImages = images.slice(0, amountImages);
  const trainLabels = labels.slice(0, amountImages);
  model.summary();
  console.log(`Amount Images: ${trainImages.size}`);

  let epochBeginTime;
  let millisPerStep;
  const validationSplit = 0.15;
  const numTrainExamplesPerEpoch =
    trainImages.shape[0] * (1 - validationSplit);
  const numTrainBatchesPerEpoch =
    Math.ceil(numTrainExamplesPerEpoch / batchSize);
  await model.fit(trainImages, trainLabels, {
    epochs,
    batchSize,
    validationSplit,
    callbacks: {
      onEpochEnd: async (epoch, log) => {
        process.stdout.write('\033[0G');
        await model.save(`file://data/${modelSavePath}`);
      },
      onTrainEnd: async () => {
        const images = imagesRoot.slice(0, amountImages);
        const labels = labelsRoot.slice(0, amountImages);
        for (index = 0; index < images.length; index++) {
          const imagesShape = [1, 28, 28, 1];
          const imagesXs = new Float32Array(tf.util.sizeFromShape(imagesShape));
          imagesXs.set(images[index], 0);
          const input = tf.tensor4d(imagesXs, imagesShape);
          const predic = model.predict(input);
          console.log(labels[index], predic.argMax(1).dataSync());
        }
      }
    }
  });

  const { images: testImages, labels: testLabels } = data.getTestData();
  const evalOutput = model.evaluate(testImages, testLabels);

  console.log(
    `\nEvaluation result:\n` +
    `  Loss = ${evalOutput[0].dataSync()[0].toFixed(3)}; ` +
    `Accuracy = ${evalOutput[1].dataSync()[0].toFixed(3)}`);

  if (modelSavePath != null) {
    await model.save(`file://data/${modelSavePath}`);
    console.log(`Saved model to path: ${modelSavePath}`);
  }
}

async function testSaved(modelSavePath) {
  await data.loadData();
  const amountImages = 100;
  const { imagesRoot, labelsRoot } = data.getTrainData();
  const modelLoaded = await tf.loadModel(`file://data/${modelSavePath}/model.json`);
  modelLoaded.summary();
  const images = imagesRoot.slice(0, amountImages);
  const labels = labelsRoot.slice(0, amountImages);
  for (index = 0; index < images.length; index++) {
    const imagesShape = [1, 28, 28, 1];
    const imagesXs = new Float32Array(tf.util.sizeFromShape(imagesShape));
    imagesXs.set(images[index], 0);
    const input = tf.tensor4d(imagesXs, imagesShape);
    const predic = modelLoaded.predict(input);
    console.log(labels[index], predic.argMax(1).dataSync());
  }
}

const parser = new argparse.ArgumentParser({
  description: 'TensorFlow.js-Node MNIST Example.',
  addHelp: true
});
parser.addArgument('--epochs', {
  type: 'int',
  defaultValue: 20,
  help: 'Number of epochs to train the model for.'
});
parser.addArgument('--batch_size', {
  type: 'int',
  defaultValue: 128,
  help: 'Batch size to be used during model training.'
})
parser.addArgument('--model_save_path', {
  type: 'string',
  help: 'Path to which the model will be saved after training.'
});

parser.addArgument('--load', {
  type: 'string',
  help: 'Path to which the model will be saved after training.'
});
const args = parser.parseArgs();
if (args.load === 'y')
  testSaved(args.model_save_path);
else
  run(args.epochs, args.batch_size, args.model_save_path);