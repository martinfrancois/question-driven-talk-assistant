import { defineConfig } from 'vitest/config'
import viteConfig from './vite.config';

export default defineConfig({
    ...viteConfig,
    test: {
        browser: {
            enabled: true,
            name: 'chromium',
            provider: 'playwright',
        },
    },
})