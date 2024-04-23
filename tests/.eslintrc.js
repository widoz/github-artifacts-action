const path = require('path');

module.exports = {
  extends: path.resolve(__dirname, '../.eslintrc.json'),
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
};
