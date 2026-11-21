import { join } from "node:path";

/**
 * Loads an exercise module for a test file.
 *
 * By default the learner's file in `exercises/` is loaded. When the
 * `SOLUTIONS` environment variable is set, the file with the same name in
 * the sibling `solutions/` folder is loaded instead, so one test file can
 * check both.
 *
 * @param testDir - Pass `import.meta.dir` from the test file.
 * @param name - Exercise file name without the `.ts` extension.
 */
export async function loadExercise<TModule>(
  testDir: string,
  name: string,
): Promise<TModule> {
  const folder = process.env.SOLUTIONS
    ? join(testDir, "..", "solutions")
    : testDir;
  const module: TModule = await import(join(folder, `${name}.ts`));
  return module;
}
