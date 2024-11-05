import { defineConfig, type Options } from "tsup";

export default defineConfig((options: Options) => ({
	entry: ["./src/**/*"],
	format: ["esm", "cjs"],
	clean: true,
	bundle: false,
	tsconfig: "./tsconfig.json",
	platform: 'node',
	...options,
}));