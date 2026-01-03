import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

const production = !process.env.ROLLUP_WATCH;

export default {
  input: "src/ha-bms-card.ts",
  output: {
    file: "dist/ha-bms-card.js",
    format: "es",
    sourcemap: !production,
  },
  plugins: [
    // Resolve node_modules
    resolve({
      browser: true,
    }),
    // Convert CommonJS modules to ES6
    commonjs(),
    // Compile TypeScript
    typescript({
      tsconfig: "./tsconfig.json",
      sourceMap: !production,
      inlineSources: !production,
    }),
    // Minify in production
    production &&
      terser({
        format: {
          comments: false,
        },
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      }),
  ].filter(Boolean),
  // Suppress "this" warnings from Lit
  onwarn(warning, warn) {
    if (warning.code === "THIS_IS_UNDEFINED") return;
    warn(warning);
  },
};
