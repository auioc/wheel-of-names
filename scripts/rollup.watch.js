import fs from 'fs';
import path from 'path';
import process from 'process';

/**
 *
 * @param {string} src
 * @returns {import('rollup').Plugin}
 */
export default function (src) {
    return {
        name: 'watch',
        buildStart() {
            const file = path.join(process.cwd(), src);
            const stats = fs.statSync(file);
            if (!stats.isFile()) {
                throw new Error('Supports file only');
            }
            this.addWatchFile(file);
        },
    };
}
