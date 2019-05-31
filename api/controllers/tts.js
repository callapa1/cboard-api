const googleTTS = require('google-tts-api');


module.exports = {
    tts: ttsRequest
};

async function ttsRequest(req, res) {

    const { body: { query, language, speed = 0.8 } } = req;

    try {
        const url = await googleTTS(query, language, speed);
        return res.status(200).json(url);
    } catch (err) {
        return res.status(500).json({
            message: 'Error getting TTS from Google.',
            error: err
        });
    }
}