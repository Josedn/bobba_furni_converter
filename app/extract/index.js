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

function extractXmls(swf, assetMap, folderName, basename) {
    for (let tag of swf.tags) {
        if (tag.header.code == 87) {
            const buffer = tag.data;
            const characterId = buffer.readUInt16LE();
            const fileName = assetMap[characterId].substr(basename.length + 1) + ".xml";

            fs.writeFile(folderName + "/" + fileName, buffer.subarray(6), "binary", function (err) { });
        }
    }
}

export const extractFurni = (rootFolder, swfFilePath) => {
    const rawData = fs.readFileSync(swfFilePath);

    const swfObject = SWFReader.readSync(swfFilePath);
    const assetMap = generateMap(swfObject);

    const basename = path.basename(swfFilePath).split(".")[0];

    console.log(basename);

    const folderName = rootFolder + "/" + basename;
    if (!fs.existsSync(rootFolder)) {
        fs.mkdirSync(rootFolder);
    }
    if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName);
    }

    extractXmls(swfObject, assetMap, folderName, basename);

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