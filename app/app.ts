import * as path from "path";
import { extractFurni } from './extract';

var myArgs = process.argv.slice(2);
if (myArgs.length === 0) {
    console.log("No file specified.");
} else {
    const fileName = path.basename(myArgs[0]);

    console.log(fileName);

    extractFurni(fileName).then(() => {
        console.log("ok");
    });
}