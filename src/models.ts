import z from "zod";

export const PathmapConfig = z
  .object({
    pathToPages: z.string(),
    pathToSave: z.string(),
    includes: z.array(z.string()).min(1),
    excludes: z.array(z.string()).min(1),
    schema: z.object({}),
  })
  .required();
