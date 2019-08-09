import * as fs from "fs";
import * as https from "https";
import * as http from "http";

import { generateFurnidataFromXml, Furnidata } from "../furniture/Furnidata";
import PromiseQueue from "./PromiseQueue";
import { rejects } from "assert";

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
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve(dest);
                });
            } else {
                fs.unlink(dest, () => { });
                reject('wrong response: ' + response.statusCode);
            }


        }).on('error', err => {
            fs.unlink(dest, () => { });
            reject(err);
        });
    });
};

export const downloadFurniture = (destFolder: string, hofFurniUrl: string, furnidata: Furnidata, maxConcurrentDownloads: number) => {
    const queue = new PromiseQueue(maxConcurrentDownloads);

    if (!fs.existsSync(destFolder)) {
        fs.mkdirSync(destFolder);
    }

    for (let roomItemId in furnidata.roomitemtypes) {
        const furni = furnidata.roomitemtypes[roomItemId];
        let furniAssetName = furni.classname;
        if (furniAssetName.includes("*")) {
            furniAssetName = furniAssetName.split("*")[0];
        }
        const downloadUrl = hofFurniUrl + furni.revision + "/" + furniAssetName + ".swf";
        const outputUrl = destFolder + "/" + furniAssetName + ".swf";

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
        const outputUrl = destFolder + "/" + furniAssetName + ".swf";

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
};

export const convertFurnidata = (rootFolder: string, destFolder: string): Furnidata | null => {
    if (!fs.existsSync(rootFolder + "/furnidata.xml")) {
        return null;
    }
    if (!fs.existsSync(destFolder)) {
        fs.mkdirSync(destFolder);
    }
    const furnidataXml = fs.readFileSync(rootFolder + "/furnidata.xml", "utf-8");
    const furnidata = generateFurnidataFromXml(furnidataXml);
    

    if (furnidata != null) {
        fs.writeFileSync(destFolder + "/" + "furnidata.json", JSON.stringify(furnidata), 'utf-8');
        console.log("Furnidata converted");
        return furnidata;
    } else {
        console.log("Error converting furnidata");
        return null;
    }
};

export const downloadFurnidata = (rootFolder: string, furnidataUrl: string): Promise<void> => {
    if (!fs.existsSync(rootFolder)) {
        fs.mkdirSync(rootFolder);
    }

    console.log("Downloading furnidata");

    return downloadFile(furnidataUrl, rootFolder + "/furnidata.xml") as Promise<void>;
};