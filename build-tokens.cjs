const { readFileSync } = require('fs');
const StyleDictionary = require('style-dictionary');
const {
  registerTransforms,
  permutateThemes,
} = require('@tokens-studio/sd-transforms');

// sd-transforms, 2nd parameter for options can be added
// See docs: https://github.com/tokens-studio/sd-transforms
registerTransforms(StyleDictionary);

StyleDictionary.registerFileHeader({
  name: 'myCustomHeader',
  fileHeader: function () {
    return [`Do not edit directly, this file was auto-generated`];
  },
});

const $themes = JSON.parse(readFileSync('tokens/$themes.json', 'utf-8'));
const themes = permutateThemes($themes, { seperator: '_' });
const configs = Object.entries(themes).map(([name, tokensets]) => ({
  source: tokensets.map((tokenset) => `tokens/${tokenset}.json`),
  platforms: {
    css: {
      buildPath: 'build/css/',
      transformGroup: 'tokens-studio',
      files: [
        {
          destination: `${name}.css`,
          format: 'css/variables',
          options: {
            fileHeader: 'myCustomHeader',
          },
        },
      ],
    },
  },
}));

configs.forEach((cfg) => {
  const sd = StyleDictionary.extend(cfg);
  sd.cleanAllPlatforms(); // optionally, cleanup files first..
  sd.buildAllPlatforms();
});
