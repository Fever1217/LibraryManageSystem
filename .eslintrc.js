module.exports = {
    root: true,
    env: {
        node: true,
        jquery : true
    },
    'extends': [
        'plugin:vue/essential',
        'eslint:recommended'
    ],
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-undef': 'off',
        'vue/no-unused-vars': 'off',
        'vue/require-v-for-key': 'off',
        'no-unused-vars': 'off',
        'vue/no-unused-components': 'off',
        'no-irregular-whitespace': 'off',
        'no-useless-escape': 'off',
		'no-tabs': 0,
		'no-mixed-spaces-and-tabs': 0,
		'indent': ["off", "tab"],
		'no-trailing-spaces': 0
    },
    parserOptions: {
        parser: 'babel-eslint'
    }
};
