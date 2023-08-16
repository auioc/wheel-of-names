import typescript from '@rollup/plugin-typescript';

export default [
    {
        input: 'src/index.ts',
        output: [
            {
                file: 'public/index.js',
                format: 'iife',
                name: 'index',
                sourcemap: true,
            },
        ],
        context: 'window',
        plugins: [typescript()],
    },
    {
        input: 'src/wheel.ts',
        output: [
            {
                file: 'public/wheel.js',
                format: 'iife',
                name: 'wheel',
                sourcemap: true,
            },
        ],
        context: 'window',
        plugins: [typescript()],
    },
];
