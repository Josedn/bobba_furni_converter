import * as fs from "fs";
import * as https from "https";
import * as http from "http";

import { generateFurnidataFromXml } from "../furniture/Furnidata";
import PromiseQueue from "./PromiseQueue";

const downloadFile = (url: string, dest: string) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        const parsedUrl = new URL(url);

        let client: typeof http | typeof https = http;
        if (parsedUrl.protocol === 'https:') {
            client = https;
        }

        client.get({
            headers: {
                'Host': parsedUrl.host,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36',
                'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
            },
            host: parsedUrl.host,
            path: parsedUrl.pathname,
        }, response => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();  // close() is async, call cb after close completes.
                resolve(dest);
            });

        }).on('error', err => {
            fs.unlink(dest, () => { });
            reject(err);
        });
    });
};

export const downloadFurniture = (hofFurniUrl: string, furnidataUrl: string, useSourceRevision: boolean) => {
    const rootFolder = "downloaded/";
    if (!fs.existsSync(rootFolder)) {
        fs.mkdirSync(rootFolder);
    }

    console.log("Downloading furnidata");
    //downloadFile(furnidataUrl, rootFolder + "furnidata.xml").then(() => {
    const furnidataXml = fs.readFileSync(rootFolder + "furnidata.xml", "utf-8");
    const furnidata = generateFurnidataFromXml(furnidataXml);

    const queue = new PromiseQueue(10);

    if (furnidata != null) {
        fs.writeFileSync(rootFolder + "furnidata.json", JSON.stringify(furnidata), 'utf-8');
        console.log("Furnidata converted");

        for (let roomItemId in furnidata.roomitemtypes) {
            const furni = furnidata.roomitemtypes[roomItemId];
            let furniAssetName = furni.classname;
            if (furniAssetName.includes("*")) {
                furniAssetName = furniAssetName.split("*")[0];
            }
            const downloadUrl = hofFurniUrl + furni.revision + "/" + furniAssetName + ".swf";
            const outputUrl = rootFolder + furniAssetName + ".swf";

            if (!fs.existsSync(outputUrl)) {

                queue.push(() => downloadFile(downloadUrl, outputUrl).then(() => {
                    console.log(furniAssetName + " ok");
                }).catch(err => {
                    console.log(furniAssetName + " error");
                }));

            } else {
                console.log(furniAssetName + " already downloaded");
            }
        }

        for (let wallItemId in furnidata.wallitemtypes) {
            const furni = furnidata.wallitemtypes[wallItemId];
            let furniAssetName = furni.classname;
            if (furniAssetName.includes("*")) {
                furniAssetName = furniAssetName.split("*")[0];
            }
            const downloadUrl = hofFurniUrl + furni.revision + "/" + furniAssetName + ".swf";
            const outputUrl = rootFolder + furniAssetName + ".swf";

            if (!fs.existsSync(outputUrl)) {

                queue.push(() => downloadFile(downloadUrl, outputUrl).then(() => {
                    console.log(furniAssetName + " ok");
                }).catch(err => {
                    console.log(furniAssetName + " error");
                }));

            } else {
                console.log(furniAssetName + " already downloaded");
            }
        }
    } else {
        console.log("Error converting furnidata");
    }

    /*}).catch(err => {
        console.log("Error downloading furnidata: " + err);
    });*/

};