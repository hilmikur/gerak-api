const   {handlePrediction, handlePredictHistories } = require('./handler');

const routes = [
  {
    method: 'POST',
    path: '/predict',
    handler: handlePrediction,
    options: {
      payload: {
        output: 'file',
        parse: true,
        multipart: true,
        allow: 'multipart/form-data',
        maxBytes: 100 * 1024 * 1024 // 100MB max file size
      }
    }
  },
  {
    method: 'GET',
    path: '/predict/histories',
    handler: handlePredictHistories
  }
];

module.exports = videoRoutes;
