'use strict';

const mongoose = require('mongoose');
const constants = require('../constants');
const Schema = mongoose.Schema;

const AUDIO_SCHEMA_DEFINITION = {
    locale: {
        type: String,
        required: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    text: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: String,
        required: true,
        trim: true
    },
    url: {
        type: String,
        trim: true
    },
    ttsEngine: {
        type: String,
        default: constants.DEFAULT_TTS,
        trim: true
    },
    dateCreated: {
        type: Date,
        default: Date.now
    },
};

const audioSchema = new Schema(AUDIO_SCHEMA_DEFINITION);

const Audio = mongoose.model('Audio', audioSchema);

module.exports = Audio;
