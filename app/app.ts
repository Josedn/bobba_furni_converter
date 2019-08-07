import * as path from "path";
import { extractFurni } from './extract';
import { generateOffset } from "./furniture";

var myArgs = process.argv.slice(2);
if (myArgs.length === 0) {
    console.log("No file specified.");
} else {
    const fileName = path.basename(myArgs[0]);

    extractFurni(fileName).then(folderName => {
        try {
            generateOffset(folderName, "furni.json");
            console.log(folderName);
        } catch (err) {
            console.log(err);
        }
    });
}