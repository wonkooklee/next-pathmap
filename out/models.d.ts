import z from "zod";
export declare const PathmapConfig: z.ZodObject<{
    pathToPages: z.ZodString;
    pathToSave: z.ZodString;
    includes: z.ZodArray<z.ZodString, "many">;
    excludes: z.ZodArray<z.ZodString, "many">;
    schema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
}, "strip", z.ZodTypeAny, {
    pathToPages?: string;
    pathToSave?: string;
    includes?: string[];
    excludes?: string[];
    schema?: {};
}, {
    pathToPages?: string;
    pathToSave?: string;
    includes?: string[];
    excludes?: string[];
    schema?: {};
}>;
