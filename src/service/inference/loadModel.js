const tf = require('@tensorflow/tfjs-node');

async function loadModel() {
    return tf.loadModel('https://storage.googleapis.com/gestura-bucket1/videos-in-prod/model.json');    
}

module.exports = loadModel;
