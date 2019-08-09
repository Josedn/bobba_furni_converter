import * as parser from 'fast-xml-parser';

export const parseXml = (xmlData: string): any => {
    const options = {
        attributeNamePrefix: "",
        textNodeName: "#text",
        ignoreAttributes: false,
        ignoreNameSpace: true,
        allowBooleanAttributes: true,
        parseNodeValue: true,
        parseAttributeValue: true,
        trimValues: true,
        cdataTagName: "__cdata", //default is 'false'
        cdataPositionChar: "\\c",
        localeRange: "", //To support non english character in tag/attribute values.
        parseTrueNumberOnly: false,
    };

    if (parser.validate(xmlData) === true) { //optional (it'll return an object in case it's not valid)
        const jsonObj = parser.parse(xmlData, options);
        return jsonObj;
    }

    return null;
};

export const parseXmlArray = (data: any): any[] => {
    if (data == null) {
        return [];
    }
    if (data instanceof Array) {
        return data;
    }
    return [data];
};