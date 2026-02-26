const fs = require('fs');
const esbuild = require('esbuild');
const { globSync } = require('glob');

// 1. Find all your files
const allFiles = globSync('resources/src/core/**/*.js');

// 2. Create a temporary 'entry' file that imports everything
// This mimics what you were doing with Grunt concat
const entryContent = allFiles.map(file => `import "./${file.replace(/\\/g, '/')}";`).join('\n');
fs.writeFileSync('hypnos-engine.js', entryContent);

// 3. Bundle that one temporary file into one output
esbuild.build({
    entryPoints: ['hypnos-engine.js'],
    bundle: true,
    minify: true,
    outfile: 'hypnos-engine.min.js',
    format: 'iife',       // Self-executing function for the browser
    globalName: 'Hypnos',  // Access via window.Hypnos
    banner: {
        js: `/*! Hypnos Engine | ${new Date().toISOString().split('T')[0]} */`
    }
}).then(() => {
    // Clean up the temp file
    fs.unlinkSync('hypnos-engine.js');
    console.log("Build complete: dist/hypnos-engine.min.js");
}).catch(() => process.exit(1));