/** @type {import("prettier").Config} */
const config = {
    useTabs: false,
    singleQuote: true,
    trailingComma: 'none',
    semi: false,
    printWidth: 80,
    tabWidth: 4,
    plugins: ['prettier-plugin-svelte'],
    overrides: [{ files: '*.svelte', options: { parser: 'svelte' } }]
}

export default config
