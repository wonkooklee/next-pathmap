import { mkdir, mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach } from "vitest";

const projects: string[] = [];

afterEach(async () => {
  await Promise.all(
    projects.splice(0).map((dir) => rm(dir, { recursive: true, force: true }))
  );
});

export async function createProject(
  files: Record<string, string>
): Promise<string> {
  // Windows may hand out an 8.3 short path (RUNNER~1) that vite-node cannot
  // import once Node.js 20+ encodes the "~" in its file URL.
  const root = await realpath(await mkdtemp(join(tmpdir(), "next-pathmap-")));
  projects.push(root);

  await Promise.all(
    Object.entries(files).map(async ([file, content]) => {
      const path = join(root, file);
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, content);
    })
  );
  return root;
}

export function thrownBy(fn: () => unknown): unknown {
  try {
    fn();
  } catch (error) {
    return error;
  }
  throw new Error("Expected the function to throw");
}

export const page = "export default function Page() {}\n";
