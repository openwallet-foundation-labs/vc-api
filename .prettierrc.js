// Documentation for this file: https://prettier.io/docs/en/configuration.html
module.exports = {
  ...require('./common/temp/node_modules/@energyweb/prettier-config'),
  // We use a larger print width because Prettier's word-wrapping seems to be tuned
  // for plain JavaScript without type annotations
  printWidth: 110,

  // Use .gitattributes to manage newlines
  endOfLine: 'auto',

  // For ES5, trailing commas cannot be used in function parameters; it is counterintuitive
  // to use them for arrays only
  trailingComma: 'none'
};
