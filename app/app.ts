import * as path from "path";
import * as fs from "fs";
import { extractFurni } from './extract';
import { generateOffsetFromXml } from "./FurniOffset";

var myArgs = process.argv.slice(2);
if (myArgs.length === 0) {
    console.log("No file specified.");
} else {
    const fileName = path.basename(myArgs[0]);

    extractFurni(fileName).then(folderName => {
        const files = fs.readdirSync(folderName);

        let visualizationXml = "";
        let assetsXml = "";
        let logicXml = "";
        let indexXml = "";
        let allFiles: string[] = [];

        files.forEach(function (file) {
            allFiles.push(file);
            if (file.includes("visualization.xml")) {
                visualizationXml = file;
            } else if (file.includes("logic.xml")) {
                logicXml = file;
            } else if (file.includes("assets.xml")) {
                assetsXml = file;
            } else if (file.includes("index.xml")) {
                indexXml = file;
            }
        });

        if (visualizationXml !== "" && assetsXml !== "" && logicXml !== "" && indexXml !== "") {
            const visualizationFile = fs.readFileSync(folderName + "/" + visualizationXml, 'utf-8');
            const assetsFile = fs.readFileSync(folderName + "/" + assetsXml, 'utf-8');
            const logicFile = fs.readFileSync(folderName + "/" + logicXml, 'utf-8');
            const indexFile = fs.readFileSync(folderName + "/" + indexXml, 'utf-8');

            const offset = generateOffsetFromXml(assetsFile, logicFile, visualizationFile, indexFile);
            fs.writeFileSync(folderName + "/" + "furni.json", JSON.stringify(offset, null, 2), 'utf-8');
            console.log(folderName);
        } else {
            console.log("Not found xml files for " + folderName);
        }
        
    });
}