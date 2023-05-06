import { PathmapConfigType } from "./models.js";
export declare function gen({ pathToPages, pathToSave, includes, excludes, schema, categories, }: Required<PathmapConfigType> & {
    categories?: {
        [key: string]: any;
    }[];
}): Promise<void>;
