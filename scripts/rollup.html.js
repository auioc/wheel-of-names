import fs from 'fs';
import { minify } from 'html-minifier-terser';

/** @type {import('html-minifier-terser').Options} */
const TERSER_OPTIONS = {
    collapseWhitespace: true,
    minifyJS: true,
    minifyCSS: true,
    removeComments: true,
};

const github = 'https://github.com/auioc/wheel-of-names';
const license = 'AGPL-3.0';
const year = new Date().getFullYear();

function footer(/** @type {import('./rollup.utils').Version} */ ver) {
    return `
<a target="_blank" href="${github}">GitHub</a>\
<span>&nbsp;&middot;&nbsp;</span>\
<a target="_blank" href="${github}${ver.dirty ? '' : `/tree/${ver.commit}`}">\
${ver.text}</a>\
<br />\
<span>(C)&nbsp;${year}&nbsp;AUIOC.ORG&nbsp;&middot;&nbsp;Licensed under&nbsp;</span>\
<a target="_blank" href="${github}/blob/main/LICENSE">${license}</a>
`.trim();
}

export default async function template(
    /** @type {string} */ src,
    /** @type {import('./rollup.utils').Version} */ ver,
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
    html = html.replace(/<!--\s*rollup:footer\s*-->/ms, footer(ver));

    if (!ver.dev) {
        return await minify(html, TERSER_OPTIONS);
    }
    return html;
}
