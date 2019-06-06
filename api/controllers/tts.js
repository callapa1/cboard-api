
const googleTTSKey = require('google-tts-api/lib/key.js');
const googleTTSApi = require('google-tts-api/lib/api.js');

const storage = require('../helpers/storage');
const downloader = require('../helpers/downloader');
const Audio = require('../models/Audio');

module.exports = {
    tts: ttsRequest
};

async function ttsRequest(req, res) {

    const { body: { query, language, speed = 0.8 } } = req;

    try {
        const key = await googleTTSKey();
        const url = await googleTTSApi(query, key, language, speed);

        const audioStream = await downloader.getRemoteFileStream(url);
        console.log(audioStream.data);
        const audioUrl = await storage.uploadBlobFromStream('google-tts', audioStream.data, 'audio');

        const audio = new Audio({
            locale: language,
            name: query,
            text: query,
            url: audioUrl,
            author: 'cboard'
        });
        audio.save(function (err, audio) {
            if (err) {
                return res.status(409).json({
                    message: 'Error saving audio in DB',
                    error: err.message
                });
            }
        });
        return res.status(200).json(audioUrl);
    } catch (err) {
        return res.status(500).json({
            message: 'Error getting TTS from Google.',
            error: err.message
        });
    }
}