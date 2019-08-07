const { readFromBufferP, extractImages } = require('swf-extract');
const SWFReader = require('@gizeta/swf-reader');
const fs = require("fs");
const path = require("path");

var myArgs = process.argv.slice(2);
if (myArgs.length === 0) {
    console.log("No file specified.");
    return;
}
const FILE_NAME = path.basename(myArgs[0]);

// `rawData` could come from file, network, etc.
// as long as it end up being a Buffer.
const rawData = fs.readFileSync(FILE_NAME);

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

function extractXmls(swf, assetMap, folderName) {
    for (let tag of swf.tags) {
        if (tag.header.code == 87) {
            const buffer = tag.data;
            const characterId = buffer.readUInt16LE();
            const fileName = assetMap[characterId].substr(FILE_NAME.length - 3) + ".xml";

            fs.writeFile(folderName + "/" + fileName, buffer.subarray(6), "binary", function (err) { });
        }
    }
}

(async () => {
    const swfObject = SWFReader.readSync(FILE_NAME);
    const assetMap = generateMap(swfObject);

    const folderName = FILE_NAME.substr(0, FILE_NAME.length - 4);

    if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName);
    }

    extractXmls(swfObject, assetMap, folderName);

    const swf = await readFromBufferP(rawData);
    // the result of calling `extractImages` resolves to an Array of Promises
    const ts = await Promise.all(extractImages(swf.tags));
    ts.forEach(image => {
        const fileName = assetMap[image.characterId].substr(FILE_NAME.length - 3) + ".png";
        fs.writeFile(folderName + "/" + fileName, image.imgData, "binary", function (err) { });
    });
})();