
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
    Audio.findOne({
        locale: language,
        text: query
    }, async function (err, audio) {
        if (err) {
            return res.status(500).json({
                message: 'Error checking TTS audio from DB.',
                error: err.message
            });
        }
        if (!audio) {
            try {
                const key = await googleTTSKey();
                const url = await googleTTSApi(query, key, language, speed);

                const filepath = await downloader.download(url, '.');
                const audioUrl = await storage.uploadBlobFromFile('google-tts', filepath, 'audio');

                const newAudio = new Audio({
                    locale: language,
                    name: query,
                    text: query,
                    url: audioUrl,
                    author: 'cboard'
                });
                newAudio.save(function (err, audio) {
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
        } else {
            return res.status(200).json(audio.url);

        }
    });
}