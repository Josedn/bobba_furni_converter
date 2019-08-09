const { readFromBufferP, extractImages } = require('swf-extract');
const SWFReader = require('@gizeta/swf-reader');
const fs = require("fs");
const path = require("path");

function generateMap(swf) {
    const assetMap = {};
    for (let tag of swf.tags) {
        if (tag.header.code == 76) {
            for (let asset of tag.symbols) {
                assetMap[asset.id] = asset.name;
            }
        }
    }
    return assetMap;
}

function extractXmls(swf, assetMap, folderName, swfFileName) {
    for (let tag of swf.tags) {
        if (tag.header.code == 87) {
            const buffer = tag.data;
            const characterId = buffer.readUInt16LE();
            const fileName = assetMap[characterId].substr(swfFileName.length - 3) + ".xml";

            fs.writeFile(folderName + "/" + fileName, buffer.subarray(6), "binary", function (err) { });
        }
    }
}

export const extractFurni = (rootFolder, swfFileName) => {
    const rawData = fs.readFileSync(swfFileName);

    const swfObject = SWFReader.readSync(swfFileName);
    const assetMap = generateMap(swfObject);

    let basename = path.basename(swfFileName);
    basename = basename.substr(0, basename.length - 4);

    const folderName = rootFolder + "/" + basename;
    if (!fs.existsSync(rootFolder)) {
        fs.mkdirSync(rootFolder);
    }
    if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName);
    }

    extractXmls(swfObject, assetMap, folderName, swfFileName);

    return new Promise((resolve, reject) => {
        const swf = readFromBufferP(rawData);
        swf.then(swf => {
            // the result of calling `extractImages` resolves to an Array of Promises
            Promise.all(extractImages(swf.tags)).then(ts => {
                ts.forEach(image => {
                    const fileName = assetMap[image.characterId].substr(basename.length + 1) + ".png";
                    fs.writeFile(folderName + "/" + fileName, image.imgData, "binary", function (err) { });
                });
                resolve(folderName);
            }).catch(err => reject(err));
        }).catch(err => reject(err));
    });
};