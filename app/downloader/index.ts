import * as fs from "fs";
import * as https from "https";
import * as http from "http";

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

export const downloadFurniture = (hofFurniUrl: string, furnidataUrl: string, useSourceRevision: boolean, useOutputRevision: boolean) => {
    const rootFolder = "downloaded/";
    if (!fs.existsSync(rootFolder)) {
        fs.mkdirSync(rootFolder);
    }

    console.log("Downloading furnidata");
    downloadFile(furnidataUrl, rootFolder + 'furnidata.xml').then(() => {
        console.log("Downloaded");
    }).catch(err => {
        console.log("Error downloading furnidata: " + err);
    });

};