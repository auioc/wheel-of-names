import fs from 'fs';
import { minify } from 'html-minifier-terser';

/** @type {import('html-minifier-terser').Options} */
const TERSER_OPTIONS = {
    collapseWhitespace: true,
    minifyJS: true,
    minifyCSS: true,
    removeComments: true,
};

export default async function template(
    /** @type {string} */ src,
    /** @type {boolean} */ dev,
    /** @type {import('@rollup/plugin-html').RollupHtmlTemplateOptions}*/ opts
) {
    const { publicPath, files } = opts;
    const scripts = (files.js || [])
        .map(({ fileName }) => {
            return `<script src="${publicPath}${fileName}"></script>`;
        })
        .join('');

    const styles = (files.css || [])
        .map(({ fileName }) => {
            return `<link href="${publicPath}${fileName}" rel="stylesheet" />`;
        })
        .join('');

    let html = fs.readFileSync(src).toString();
    html = html.replace(/<!--\s*rollup:js\s*-->/ms, scripts);
    html = html.replace(/<!--\s*rollup:css\s*-->/ms, styles);

    if (!dev) {
        return await minify(html, TERSER_OPTIONS);
    }
    return html;
}
