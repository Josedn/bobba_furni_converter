import * as path from "path";
import * as fs from "fs";
import { extractFurni } from './extract';
import { generateOffset } from "./furniture";
import { downloadFurniture } from "./downloader";
import { generateFurnidataFromXml } from "./furniture/Furnidata";

var myArgs = process.argv.slice(2);
if (myArgs.length === 0) {
    console.log("No file specified.");
} else {
    const fileName = path.basename(myArgs[0]);

    /*extractFurni(fileName).then(folderName => {
        try {
            generateOffset(folderName, "furni.json");
            console.log(folderName);
        } catch (err) {
            console.log(err);
        }
    });*/

    //downloadFurniture("http://images.habbo.com/dcr/hof_furni/", "https://www.habbo.com/gamedata/furnidata_xml/2ef37510624cb935bea0570606e6029b74b757d2", true, false);

    try {
        const furnidataXml = fs.readFileSync("downloaded/furnidata.xml", 'utf-8');
        const furnidata = generateFurnidataFromXml(furnidataXml);
        if (furnidata != null) {
            console.log(furnidata);
        }
    }
    catch (err) {
        console.log(err);
    }
}