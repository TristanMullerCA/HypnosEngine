// const fs = require('fs-extra'); // npm install fs-extra
// import { execSync } from 'child_process';

export async function buildGame() {
    console.log("Building Game Dist...");

    try {
        // Clear directory
        await Neutralino.filesystem.remove(NL_PATH + '/.tmp_build');
    } catch (error) {
        console.warn(error.message);
    }

    try {
        // Create directory
        await Neutralino.filesystem.createDirectory(NL_PATH + '/.tmp_build/resources/src/core');

        // Copy source files
        await Neutralino.resources.extractDirectory('/resources/src/core', NL_PATH + '/.tmp_build/resources/src/core');
        await Neutralino.resources.extractFile('/resources/src/main.js', './.tmp_build/resources/src/main.js');
        await Neutralino.resources.extractFile('/resources/editor.html', './.tmp_build/resources/index.html');
        await Neutralino.resources.extractFile('/resources/neutralino.js', './.tmp_build/resources/neutralino.js');

        // Copy assets
        await Neutralino.resources.extractDirectory('/resources/assets', NL_PATH + '/.tmp_build/resources/assets');

        // Copy neutralino binaries
        await Neutralino.resources.extractDirectory('/resources/bin', NL_PATH + '/.tmp_build/bin');

        await Neutralino.filesystem.writeFile(NL_PATH + '/.tmp_build/resources/config.json', JSON.stringify({
            editor: false
        }));

        // Copy neutralino config file
        await Neutralino.resources.extractFile('/resources/src/editor/gamebuildConfigFile.json', './.tmp_build/neutralino.config.json');

        // Build the projet
        await Neutralino.os.execCommand('neu build --embed-resources', {
            background: true,
            cwd: "./.tmp_build"
        });
    } catch (error) {
        console.warn(error.message);
    }

    // Clean up
    await new Promise(resolve => {
        setTimeout(async () => {
            try {
                await Neutralino.filesystem.remove(NL_PATH + '/build');
            } catch (error) {

            }

            await Neutralino.filesystem.createDirectory(NL_PATH + '/build');
            await Neutralino.filesystem.copy(NL_PATH + '/.tmp_build/dist/my_game', NL_PATH + '/build');
            await Neutralino.filesystem.copy(NL_PATH + '/assets/', NL_PATH + '/build/assets/');

            try {
                await Neutralino.filesystem.remove(NL_PATH + '/.tmp_build');
            } catch (error) {

            }

            resolve();
        }, 10000)
    });

    console.log("Game Executable Generated!");
}