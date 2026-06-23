import type { PlopTypes } from "@turbo/gen"

import { registerModuleGenerator } from "./module-generator.mjs"

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  registerModuleGenerator(plop)
}
