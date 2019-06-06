const  axios = require('axios');
const mime = require('mime-types');
const { parse } = require('url');
const { extname, basename } = require('path');
const httpAdapter = require('axios/lib/adapters/http');
const { createWriteStream } = require('fs');

module.exports = {
    download,
    getRemoteFileStream
};

async function getRemoteFileStream(url, options = {}) {
    if (!url) throw new Error('parameter url is missing!')

    const { method = 'GET' } = options;
    const response = await axios({ url, method, responseType: 'stream', adapter: httpAdapter });

    return response;
}

async function  download(url, filepath) {
    if (!url) throw new Error('parameter url is missing!');
    if (!filepath) throw new Error('parameter filepath is missing!');

    const filestream = await getRemoteFileStream(url);

    // if path is dir name save to dir with text as name, else save normally to path
    const pathIsDir = extname(filepath) === '';

    if (pathIsDir) {
        const mimetype = filestream.headers ? filestream.headers['content-type'] : '';
        const ext = mime.extension(mimetype) || 'mpga';
        const filename = basename(parse(url).pathname) || 'sound';

        filepath = `${filepath}/${filename}.${ext}`;
    }

    // pipe the result stream into a file on disc
    filestream.data.pipe(createWriteStream(filepath));

    return new Promise((resolve) => {
        filestream.data.on('end', () => {
            resolve(true);
        });

        filestream.data.on('error', (err) => {
            throw err;
        });
    });
}
