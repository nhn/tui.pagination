module.exports = {
  extends: ['tui', 'plugin:prettier/recommended'],
  parserOptions: {
    ecmaVersion: 3
  },
  env: {
    browser: true,
    jest: true,
    commonjs: true
  },
  globals: {
    tui: true,
    loadFixtures: true
  }
};
