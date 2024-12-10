const tf = require('@tensorflow/tfjs-node');
const InputError = require('../../exceptions/InputError');
const fs = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);

async function predictText(model, videoPath) {
  try {
    const videoBuffer = await readFileAsync(videoPath);
    const videoTensor = tf.node
        .decodeVideo(videoBuffer);
    const normalizedTensor = resizedTensor.div(255.0);
    const expandedTensor = normalizedTensor.expandDims(0);

    const prediction = model.predict(expandedTensor);
    const text = await prediction.data();

    tf.dispose([videoTensor, normalizedTensor, expandedTensor, prediction]);

    return { text };
  } catch (error) {
    console.error('Error in predictText:', error);
    throw new InputError(`Terjadi kesalahan input: ${error.message}`);
  }
}

module.exports = predictText;
