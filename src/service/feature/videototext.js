const crypto = require('crypto');
const { Storage } = require('@google-cloud/storage');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const Boom = require('@hapi/boom');

const storage = new Storage();

const bucketName = 'gestura-buckate';
const MAX_DURATION = 10; // maximum duration in seconds

const getVideoDuration = (filePath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) reject(err);
      resolve(metadata.format.duration);
    });
  });
};

const uploadVideo = async (file) => {
  try {
    // Check video duration
    const duration = await getVideoDuration(file.path);
    if (duration > MAX_DURATION) {
      fs.unlinkSync(file.path);
      throw Boom.badRequest(`Video duration must be ${MAX_DURATION} seconds or less`);
    }

    const id = crypto.randomUUID();
    const destination = `uploads/${id}-${file.filename}`;
    
    await storage.bucket(bucketName).upload(file.path, {
      destination,
      metadata: {
        contentType: file.mime
      }
    });

    // Clean up temporary file
    fs.unlinkSync(file.path);

    return {
      id,
      url: `https://storage.googleapis.com/${bucketName}/${destination}`,
      duration
    };
  } catch (error) {
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    throw error;
  }
};

const getAllVideos = async () => {
  const [files] = await storage.bucket(bucketName).getFiles({
    prefix: 'uploads/'
  });
  
  return files.map(file => ({
    id: file.name.split('-')[0].replace('uploads/', ''),
    url: `https://storage.googleapis.com/${bucketName}/${file.name}`,
    uploadedAt: file.metadata.timeCreated
  }));
};

const getVideoById = async (id) => {
  const [files] = await storage.bucket(bucketName).getFiles({
    prefix: `uploads/${id}`
  });

  if (files.length === 0) {
    throw Boom.notFound('Video not found');
  }

  const file = files[0];
  return {
    id: file.name.split('-')[0].replace('uploads/', ''),
    url: `https://storage.googleapis.com/${bucketName}/${file.name}`,
    uploadedAt: file.metadata.timeCreated
  };
};

module.exports = { uploadVideo, getAllVideos, getVideoById };
