import * as fs from "fs";
import { generateOffsetFromXml } from "./FurniOffset";

export const generateOffset = (folderName: string, offsetFileName: string) => {
    const files = fs.readdirSync(folderName);

    let visualizationXml = "";
    let assetsXml = "";
    let logicXml = "";
    let indexXml = "";
    let allFiles: string[] = [];

    files.forEach(file => {
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
        if (offset == null) {
            throw new Error("Cannot generate offset");
        }
        fs.writeFileSync(folderName + "/" + offsetFileName, JSON.stringify(offset, null, 2), 'utf-8');
    } else {
        throw new Error("Not found xml files for " + folderName);
    }
};