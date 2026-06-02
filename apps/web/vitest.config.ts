import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    include: ["app/**/*.test.ts", "features/**/*.test.ts", "lib/**/*.test.ts"],
  },
})
