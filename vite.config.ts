/**
 * @file vite配置文件
 * @Time 2024
 * @description https://vitejs.dev/config/
 */

import { defineConfig } from 'vite'
import path from 'path'
import autoprefixer from 'autoprefixer';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  base: '/',
  assetsInclude: ['**/*.md', '**/*.riv'],
  plugins: [
    svgr()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@public': path.resolve(__dirname, 'public')
    }
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]___[hash:base64:5]',
    },
    postcss: {
      plugins: [
        autoprefixer({}),
        {
          postcssPlugin: 'internal:charset-removal',
          AtRule: {
            charset: (atRule) => {
              if (atRule.name === 'charset') {
                atRule.remove();
              }
            }
          }
        }
      ]
    }
  },
  build: {
    sourcemap: false,
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 2000,
    minify: 'terser',
  },
})
