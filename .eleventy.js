module.exports = eleventyConfig => {
  // Eleventy configuration
  return {
    dir: {
      input: 'src',
      output: 'dist'
    },

    // Files read by Eleventy, add as needed
    templateFormats: ['css', 'njk'],
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk'
    // pathPrefix: '/news/' // Note: We can change or remove this as needed
  };
};
