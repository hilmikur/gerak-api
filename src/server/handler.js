const crypto = require('crypto');
const { uploadVideo, getAllVideos, getVideoById } = require('../service/feature/videototext');
const { Firestore } = require('@google-cloud/firestore');

async function handlePrediction(request, h) {
  const { video } = request.payload;
  const { model } = request.server.app;

  // Generate unique ID menggunakan crypto
  const id = crypto.randomBytes(16).toString('hex');
  
  const { duration } = await uploadVideo(video);
  const { text } = await predictText(model, video);
  const createdAt = new Date().toISOString();

  const data = {
    "id": id,
    "duration": duration,
    "text": text,
    "createdAt": createdAt
  }

  await storeData(id, data);

  const response = h.response({
    status: 'success',
    message: 'Video is processed successfully',
    data: data
  })
  response.code(201);
  return response;
}

const handlePredictHistories = async (request, h) => {
  const db = new Firestore();
  const predictionCollection = db.collection('predictions');
  const predictionSnapshot = await predictionCollection.get();

  const data = [];
  predictionSnapshot.forEach((doc) => {
    const history = {
      id: doc.id,
      history: doc.data()
    };
    data.push(history);
  });

  const response = h.response({
    status: 'success',
    data: data
  });
  response.code(200);
  return response;
}

const handleGetVideoById = async (request, h) => {
  const { id } = request.params;
  const video = await getVideoById(id);

  const response = h.response({
    status: 'success',
    data: video
  });
  response.code(200);
  return response;
}

module.exports = { handlePrediction, handlePredictHistories, handleGetVideoById };
