import * as path from "path";
import * as fs from "fs";
import { extractFurni } from './extract';
import { generateOffset } from "./furniture";
import { downloadFurnidata, convertFurnidata, downloadFurniture } from "./downloader";

type Config = {
    downloadFurnidata: boolean,
    downloadFurniture: boolean,
    convertFurnidata: boolean,
    convertFurniture: boolean,
    hofFurniUrl: string,
    furnidataUrl: string,
    useSourceRevisionFolder: boolean,
    maxConcurrentDownloads: number,
};

let config: Config = {
    downloadFurnidata: true,
    downloadFurniture: true,
    convertFurnidata: true,
    convertFurniture: true,
    hofFurniUrl: "http://images.habbo.com/dcr/hof_furni/",
    furnidataUrl: "https://www.habbo.com/gamedata/furnidata_xml/a1373473ff17e356167c3f840145e224e61b00f0",
    useSourceRevisionFolder: true,
    maxConcurrentDownloads: 10,
};

const CONFIG_FILE_URI = 'config.json';
const DOWNLOADED_FOLDER = 'to_convert';
const CONVERTED_FOLDER = 'converted';

const continueWithFurnidata = (config: Config) => {
    if (config.convertFurnidata) {
        const furnidata = convertFurnidata(DOWNLOADED_FOLDER, CONVERTED_FOLDER);

        if (furnidata != null) {
            if (config.downloadFurniture) {
                downloadFurniture(DOWNLOADED_FOLDER, config.hofFurniUrl, furnidata, config.maxConcurrentDownloads);
            }
        } else {
            console.log("Error converting furnidata");
        }
    }

    if (config.convertFurniture && fs.existsSync(DOWNLOADED_FOLDER)) {
        const files = fs.readdirSync(DOWNLOADED_FOLDER);
        files.forEach(fileName => {
            if (fileName.endsWith(".swf")) {
                extractFurni(CONVERTED_FOLDER, fileName).then(folderName => {
                    try {
                        generateOffset(folderName, "furni.json");
                        console.log(fileName + " converted");
                    } catch (err) {
                        console.log(fileName + " error");
                    }
                });
            }
        });
    }
};

if (fs.existsSync(CONFIG_FILE_URI)) {
    const configFile = fs.readFileSync(CONFIG_FILE_URI, 'utf-8');
    config = Object.assign(config, JSON.parse(configFile));


    if (config.downloadFurnidata) {
        downloadFurnidata(DOWNLOADED_FOLDER, config.furnidataUrl).then(() => {
            continueWithFurnidata(config);
        }).catch(err => {
            console.log("Error downloading furnidata: " + err);
        });
    } else {
        continueWithFurnidata(config);
    }

} else {
    fs.writeFileSync(CONFIG_FILE_URI, JSON.stringify(config, null, 2), 'utf-8');
    console.log("Wrote config.json file. Please restart the script.");
}
