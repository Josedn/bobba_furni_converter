import { parseXml, parseXmlArray } from "./utils";

export type RoomItemDescription = {
    id: number,
    classname: string,
    name: string,
    description: string,
    revision: number,
    canstandon: number,
    cansiton: number,
    canlayon: number,
    xdim: number,
    ydim: number,
};

export type WallItemDescription = {
    id: number,
    classname: string,
    name: string,
    description: string,
    revision: number,
};

export type Furnidata = {
    roomitemtypes: {
        [id: number]: RoomItemDescription
    },
    wallitemtypes: {
        [id: number]: WallItemDescription
    }
};

export type FurnidataType = 'wallitemtypes' | 'roomitemtypes';

export const generateFurnidataFromXml = (rawXml: string): Furnidata | null => {
    const parsed = parseXml(rawXml);
    if (parsed != null && parsed.furnidata != null) {
        const furnidata: Furnidata = {
            roomitemtypes: {},
            wallitemtypes: {}
        };
        const roomItems = parseXmlArray(parsed.furnidata.roomitemtypes.furnitype);
        const wallItems = parseXmlArray(parsed.furnidata.wallitemtypes.furnitype);


        roomItems.forEach(item => {
            const description: RoomItemDescription = {
                id: item.id,
                classname: item.classname,
                name: item.name,
                description: item.description,
                revision: item.revision,
                canstandon: item.canstandon,
                cansiton: item.cansiton,
                canlayon: item.canlayon,
                xdim: item.xdim,
                ydim: item.ydim,
            };

            furnidata.roomitemtypes[description.id] = description;
        });

        wallItems.forEach(item => {
            const description: WallItemDescription = {
                id: item.id,
                classname: item.classname,
                name: item.name,
                description: item.description,
                revision: item.revision,
            };

            furnidata.wallitemtypes[description.id] = description;
        });

        return furnidata;
    }
    return null;
};