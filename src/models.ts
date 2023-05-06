import z from "zod";

export const PathmapConfig = z
  .object({
    pathToPages: z.string(),
    pathToSave: z.string(),
    includes: z.array(z.string()),
    excludes: z.array(z.string()),
    schema: z.object({}),
  })
  .required();

export type PathmapConfigType = z.infer<typeof PathmapConfig>;
