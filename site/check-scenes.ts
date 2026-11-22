// Validates animation scenes without building the whole site.
//
//   bun site/check-scenes.ts                    check every scene
//   bun site/check-scenes.ts day05-crud-update  check only these ids
//
// For scenes with inputs, the default inputs are checked, plus any extra
// cases listed in the scene file's `testInputs` export.

import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { defaultInputs, validateScene } from "./src/client/player/snapshots.ts";
import type { InputValues, Scene } from "./src/client/player/types.ts";

const dir = join(import.meta.dir, "src/client/player/scenes");
const wanted = process.argv.slice(2);
const files = (await readdir(dir))
  .filter((name) => name.endsWith(".ts") && name !== "registry.generated.ts")
  .filter(
    (name) => wanted.length === 0 || wanted.includes(name.replace(/\.ts$/, "")),
  );

if (wanted.length > 0 && files.length !== wanted.length) {
  const found = new Set(files.map((name) => name.replace(/\.ts$/, "")));
  console.error(
    `找不到這些場景檔：${wanted.filter((id) => !found.has(id)).join("、")}`,
  );
  process.exit(1);
}

let failed = 0;
for (const file of files) {
  const module: { default?: Scene; testInputs?: InputValues[] } = await import(
    join(dir, file)
  );
  const scene = module.default;
  const id = file.replace(/\.ts$/, "");
  if (!scene) {
    console.log(`FAIL  ${id}：沒有 export default`);
    failed += 1;
    continue;
  }
  const problems =
    scene.id === id ? [] : [`id 是「${scene.id}」，要和檔名「${id}」相同`];
  const cases = [defaultInputs(scene), ...(module.testInputs ?? [])];
  for (const input of cases) {
    try {
      problems.push(...validateScene(scene, input));
    } catch (error) {
      problems.push(`輸入 ${JSON.stringify(input)} 執行失敗：${String(error)}`);
    }
  }
  if (problems.length === 0) {
    console.log(`ok    ${id}`);
  } else {
    failed += 1;
    console.log(`FAIL  ${id}\n      ${problems.join("\n      ")}`);
  }
}
console.log(`\n${files.length} 個場景，${failed} 個有問題`);
process.exit(failed === 0 ? 0 : 1);
