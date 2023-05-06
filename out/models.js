import z from "zod";
export var PathmapConfig = z
    .object({
    pathToPages: z.string(),
    pathToSave: z.string(),
    includes: z.array(z.string()),
    excludes: z.array(z.string()),
    schema: z.object({}),
})
    .required();
