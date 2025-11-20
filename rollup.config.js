import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import html from '@rollup/plugin-html';
import postcss from 'rollup-plugin-postcss';
import license from 'rollup-plugin-license';
import moment from 'moment';
import { template as htmlTemplate } from './scripts/rollup.html.js';
import { version, cssComment } from './scripts/rollup.utils.js';

const dev = process.env.NODE_ENV !== 'production';

const outputDir = dev ? './public' : './build';

const ver = version();
const time = moment();
const outputSuffix = dev ? '' : `.${ver.commit.slice(0, 8)}.min`;

const licenseHeader = (type) =>
    `
${type} of Wheel of Names
https://github.com/auioc/wheel-of-names
Generated at ${time.format()}
Version: v1.0.0 - ${ver.text}
Copyright (C) 2022-${time.year()} AUIOC.ORG
Copyright (C) 2018-2022 PCC-Studio
Licensed under GNU Affero General Public License v3.0
(https://github.com/auioc/wheel-of-names/blob/main/LICENSE)
`.trim();

const plugins = () => {
    const plugins = [
        typescript({ compilerOptions: { outDir: outputDir, sourceMap: dev } }),
    ];
    plugins.push(
        postcss({
            extract: true,
            minimize: !dev,
            sourceMap: dev,
            plugins: [
                {
                    postcssPlugin: 'license',
                    OnceExit(root) {
                        root.prepend(cssComment(licenseHeader('Style')));
                    },
                },
            ],
        })
    );
    plugins.push(
        license({
            banner: {
                commentStyle: 'ignored',
                content: licenseHeader('Script bundle'),
            },
        })
    );
    if (!dev) {
        plugins.push(
            terser({
                compress: { pure_funcs: ['console.debug'] },
                format: { comments: 'some' },
            })
        );
    }
    return plugins;
};

export default [
    {
        input: 'src/index.ts',
        output: [
            {
                file: `${outputDir}/index${outputSuffix}.js`,
                format: 'iife',
                name: 'index',
                sourcemap: dev,
            },
        ],
        context: 'window',
        plugins: [
            ...plugins(),
            html({
                fileName: 'index.html',
                template: (opts) => htmlTemplate('src/index.html', dev, opts),
            }),
        ],
    },
    {
        input: 'src/wheel.ts',
        output: [
            {
                file: `${outputDir}/wheel${outputSuffix}.js`,
                format: 'iife',
                name: 'wheel',
                sourcemap: dev,
            },
        ],
        context: 'window',
        plugins: [
            ...plugins(),
            html({
                fileName: 'wheel.html',
                template: (opts) => htmlTemplate('src/wheel.html', dev, opts),
            }),
        ],
    },
];
