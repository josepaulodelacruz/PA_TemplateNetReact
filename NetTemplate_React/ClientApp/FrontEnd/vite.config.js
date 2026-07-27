import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import jsconfigPath from 'vite-jsconfig-paths';
import mdx from '@mdx-js/rollup';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // Must run before the React plugin so .mdx is already JSX by the time it sees it.
    // remark-gfm enables tables; remark-frontmatter keeps the --- block out of the output.
    { enforce: 'pre', ...mdx({ remarkPlugins: [remarkFrontmatter, remarkGfm] }) },
    react(),
    jsconfigPath(),
  ],
  base: '/ECastV2'
})
