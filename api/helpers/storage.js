const uuidv1 = require('uuid/v1');
const azure = require('azure-storage');
const mime = require('mime-types');
const blobService = azure.createBlobService(process.env.AZURE_STORAGE_CONNECTION_STRING);

const BLOB_CONTAINER_NAME = process.env.BLOB_CONTAINER_NAME || 'cblob';

module.exports = {
    uploadBlob,
    uploadBlobFromFile
};

async function uploadBlob(file, container = BLOB_CONTAINER_NAME) {
    let url = null;

    try {
        await createContainerIfNotExists(container);
        const uploadedFile = await createBlockBlobFromText(
            container,
            file
        );
        url = blobService.getUrl(uploadedFile.container, uploadedFile.name);
    } catch (e) {
        return new Error(e.message);
    }
    return url;
}


async function uploadBlobFromFile(name, fileLocation, container = BLOB_CONTAINER_NAME) {
    let url = null;

    try {
        await createContainerIfNotExists(container);
        const uploadedFile = await createBlockBlobFromFile(
            container,
            name,
            fileLocation
        );
        url = blobService.getUrl(uploadedFile.container, uploadedFile.name);
    } catch (e) {
        return new Error(e.message);
    }
    return url;
}

async function createContainerIfNotExists(shareName) {
    const result = await new Promise((resolve, reject) => {
        blobService.createContainerIfNotExists(shareName, function (error, result) {
            if (!error) {
                resolve(result);
            } else {
                reject(error);
            }
        });
    });
    return result;
}

async function createBlockBlobFromText(shareName, file) {
    const { originalname, buffer, mimetype } = file;

    const options = {};

    if (mimetype && mimetype.length) {
        options.contentSettings = {
            contentType: mimetype
        };
    }

    const ts = Math.round(new Date().getTime() / 1000);
    const uuidSuffix = uuidv1()
        .split('-')
        .pop();
    const filename = `${ts}_${uuidSuffix}_${originalname.toLowerCase().trim()}`;

    const result = await new Promise((resolve, reject) => {
        blobService.createBlockBlobFromText(
            shareName,
            filename,
            buffer,
            options,
            function (error, result) {
                if (!error) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );
    });

    return result;
}

async function createBlockBlobFromFile(shareName, name, fileLocation) {

    const options = {};

    const mimetype = mime.lookup(name)  ;
    const ext = mime.extension(mimetype) || 'mpga';

    if (mimetype && mimetype.length) {
        options.contentSettings = {
            contentType: mimetype
        };
    }

    const ts = Math.round(new Date().getTime() / 1000);
    const uuidSuffix = uuidv1()
        .split('-')
        .pop();
    const filename = `${ts}_${uuidSuffix}_${name.toLowerCase().trim()}.${ext}`;

    const result = await new Promise((resolve, reject) => {
        blobService.createBlockBlobFromLocalFile(
            shareName,
            filename,
            fileLocation,
            options,
            function (error, result) {
                if (!error) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );
    });

    return result;
}
