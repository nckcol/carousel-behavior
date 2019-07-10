import babel from 'rollup-plugin-babel';
import {sizeSnapshot} from 'rollup-plugin-size-snapshot';

export default {
  input: './src/index.js',
  output: {
    file: './esm/index.mjs',
    format: 'esm',
  },
  external: ['react', 'react-dom'],
  plugins: [
    babel({
      exclude: '**/node_modules/**',
      runtimeHelpers: true,
    }),
    sizeSnapshot(),
  ],
};
