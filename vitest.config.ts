import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import {VitePWA} from "vite-plugin-pwa";

export default defineConfig({
    // TODO how to reduce duplication?
    plugins: [react(), VitePWA({
        registerType: 'prompt',
        injectRegister: false,

        pwaAssets: {
            disabled: false,
            config: true,
        },

        manifest: {
            name: 'Question-Driven Talk Assistant',
            short_name: 'TalkAssistant',
            description: 'Web app to use in conference talks focused on answering questions from the audience.',
            theme_color: '#ffffff',
        },

        workbox: {
            globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
            cleanupOutdatedCaches: true,
            clientsClaim: true,
        },

        devOptions: {
            enabled: false,
            navigateFallback: 'index.html',
            suppressWarnings: true,
            type: 'module',
        },
    })],
    test: {
        browser: {
            enabled: true,
            name: 'chromium',
            provider: 'playwright',
        },
    },
})