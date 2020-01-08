/* eslint-env es6 */

module.exports = {
  downloads: ({ name, version }) => {
    const dotName = name.replace('-', '.');
    const extensions = ['.css', '.js', '.min.css', '.min.js'];
    const result = {};

    extensions.forEach(ext => {
      const filename = name + ext;
      result[filename] = `https://uicdn.toast.com/${dotName}/v${version}/${filename}`;
    });

    return result;
  }
};
