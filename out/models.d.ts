import z from "zod";
export declare const PathmapConfig: z.ZodObject<{
    pathToPages: z.ZodString;
    pathToSave: z.ZodString;
    includes: z.ZodArray<z.ZodString, "many">;
    excludes: z.ZodArray<z.ZodString, "many">;
    schema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
}, "strip", z.ZodTypeAny, {
    includes: string[];
    schema: {};
    pathToPages: string;
    pathToSave: string;
    excludes: string[];
}, {
    includes: string[];
    schema: {};
    pathToPages: string;
    pathToSave: string;
    excludes: string[];
}>;
export type PathmapConfigType = z.infer<typeof PathmapConfig>;
