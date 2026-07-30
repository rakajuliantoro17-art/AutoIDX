/**
==========================================================
AURA Trade OS
Next.js Configuration
Version : 0.1.0 Alpha
==========================================================
*/

const nextConfig = {

    /**
     * Enable React Strict Mode
     */
    reactStrictMode: true,



    /**
     * Remove X-Powered-By Header
     */
    poweredByHeader: false,



    /**
     * Enable Compression
     */
    compress: true,



    /**
     * Production Source Maps
     */
    productionBrowserSourceMaps: false,



    /**
     * ESLint
     */
    eslint: {

        ignoreDuringBuilds: false,

    },



    /**
     * TypeScript
     */
    typescript: {

        ignoreBuildErrors: false,

    },



    /**
     * Images
     */
    images: {

        unoptimized: false,

        remotePatterns: [],

    },



    /**
     * Experimental Features
     */
    experimental: {

        optimizePackageImports: [],

    },

};



module.exports = nextConfig;
