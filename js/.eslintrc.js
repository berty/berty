module.exports = {
  root: true,
  extends: [
    "@berty-tech/eslint-config",
  ],
}
  // https://eslint.org/docs/user-guide/configuring#specifying-parser-options
  // "parserOptions": {
  //   // set to 3, 5 (default), 6, 7, 8, 9, 10 or 11 to specify the version of
  //   // ECMAScript syntax you want to use
  //   "ecmaVersion": 11,
  //   // set to "script" (default) or "module" if your code is in ECMAScript module
  //   "sourceType": "module",
  //   // an object indicating which additional language features youÕd like to use
  //   "ecmaFeatures": {
  //     // allow return statements in the global scope
  //     "globalReturn": false,
  //     // enable global strict mode (if ecmaVersion is 5 or greater)
  //     "impliedStrict": true,
  //     // enable JSX
  //     "jsx": true,
  //   },
  //   // add global variable from
  //   "env": {
  //     "browser": false,
  //     "node": true,
  //     "commonjs": false,
  //     "shared-node-browser": true,
  //     "es6": true,
  //     "worker": true,
  //     "mocha": false,
  //     "jasmine": false,
  //     "phantomjs": false,
  //     "protractor": false,
  //     "qunit": false,
  //     "jquery": false,
  //     "prototypejs": false,
  //     "shelljs": false,
  //     "meteor": false,
  //     "mongo": false,
  //     "applescript": false,
  //     "nashorn": false,
  //     "serviceworker": true,
  //     "atomtest": false,
  //     "embertest": false,
  //     "webextensions": false,
  //     "greasemonkey": false,
  //     "jest": false,
  //   },
  // },
  // "parser": "babel-eslint",
  // "extends": [
  //   'standard',
  //   'prettier',
  //   'prettier/standard',
  //   'prettier/react',
  //   'plugin:react/recommended',
  // ],
  // "plugins": [
  //   "prettier",
  //   "standard",
  //   "react",
  // ],
  // 'settings': {
  //   'react': {
  //     'version': 'detect',
  //   },
  // },
  // "rules": {
  //   'camelcase': 0,
  //   'semi': 2,
  //   'eqeqeq': 2,
  //   'indent': [2, 2],
  //   'no-unused-vars': 2,
  //   'comma-dangle': [2, 'always-multiline'],
  //   "no-multi-spaces": 2,
  //   'padded-block': 0,
  //   'no-console': 0,
  //   "react/prop-types": "off",
  //   "react/display-name": "warn",
  //   "react/no-unused-prop-types": "off",
  //   "react/jsx-indent": "off",
  // },
  // "overrides": [
  //   {
  //     "files": [
  //       "**/*test.js",
  //       "**/*test.jsx",
  //       "**/*test.ts",
  //       "**/*test.tsx",
  //     ],
  //     "env": {
  //       "jest": true // now **/*.test.js files' env has both es6 *and* jest
  //     },
  //   },
  //   {
  //     "files": ['*.ts', '*.tsx'],
  //     "parser": "@typescript-eslint/parser",
  //     "plugins": [
  //       "@typescript-eslint/eslint-plugin",
  //       "prettier",
  //       "standard",
  //     ],
  //     "rules": {
  //       "no-dupe-class-members": 0,
  //       "import/export": 0,
  //       "no-unused-vars": 0,
  //       "@typescript-eslint/no-unused-vars": 2,
  //     }
  //   },
  //   {
  //     "files": ['*.d.ts'],
  //     "rules": {
  //       "no-useless-constructor": 0,
  //     }
  //   },
  //   {
  //     "files": ['*_pb*.js', '*_pb*.d.ts'],
  //     "rules": {
  //       "no-new-func": 0,
  //       "no-unused-vars": 0,
  //       "no-redeclare": 0,
  //       "no-undef-init": 0,
  //       "no-use-before-define": 0,
  //       "@typescript-eslint/no-unused-vars": 0,
  //     },
  //     "globals": {
  //       "proto": 'readonly',
  //       "COMPILED": 'readonly',
  //     },
  //   }
  // ],
