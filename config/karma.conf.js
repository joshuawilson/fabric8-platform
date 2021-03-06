/**
 * @author: @AngularClass
 */

module.exports = function (config) {
  var testWebpackConfig = require('./webpack.test.js')({ env: 'test' });

  var configuration = {

    // base path that will be used to resolve all patterns (e.g. files, exclude)
    basePath: '',

    /*
     * Frameworks to use
     *
     * available frameworks: https://npmjs.org/browse/keyword/karma-adapter
     */
    frameworks: ['jasmine'],

    // list of files to exclude
    exclude: [],

    // Don't fail on empty testsuite
    failOnEmptyTestSuite: false,

    /*
     * list of files / patterns to load in the browser
     *
     * we are building the test environment in ./spec-bundle.js
     */
    files: [
      { pattern: './src/assets/images/*', watched: false, included: false, served: true },
      { pattern: './config/spec-bundle.js', watched: false }
    ],

    /*
     * Proxies allow karma to serve specific paths in proxy of another (e.g., a relative path)
     * Currently used to prevent PhantomJS from crashing when looking for image files
     * http://karma-runner.github.io/2.0/config/configuration-file.html
     */
    proxies: {
      '/assets/': '/base/src/assets/'
    },

    /*
     * preprocess matching files before serving them to the browser
     * available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
     */
    preprocessors: { './config/spec-bundle.js': ['coverage', 'webpack', 'sourcemap'] },

    // Webpack Config at ./webpack.test.js
    webpack: testWebpackConfig,

    coverageReporter: {
      type: 'in-memory',
      instrumenterOptions: {
        istanbul: { noCompact: true }
      }
    },

    remapCoverageReporter: {
      'text-summary': null,
      json: './coverage/coverage.json',
      html: './coverage/html'
    },

    // Webpack please don't spam the console when running in karma!
    webpackMiddleware: { stats: 'errors-only' },

    /*
     * test results reporter to use
     *
     * possible values: 'dots', 'progress'
     * available reporters: https://npmjs.org/browse/keyword/karma-reporter
     */
    reporters: [ 'mocha', 'coverage', 'remap-coverage' ],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    /*
     * level of logging
     * possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
     */
    logLevel: config.LOG_DEBUG,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    /*
     * start these browsers
     * available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
     *
     * See https://github.com/karma-runner/karma-chrome-launcher/issues/158#issuecomment-339265457
     */
        browsers: [
          'ChromeHeadlessNoSandbox'
        ],

        customLaunchers: {
          ChromeHeadlessNoSandbox: {
            base: 'ChromeHeadless',
            flags: ['--no-sandbox'],
            debug: false
          }
        },
/*
    browsers: ['PhantomJS_custom'],
    customLaunchers: {
      'PhantomJS_custom': {
        base: 'PhantomJS',
        options: {
          windowName: 'alm-window',
          settings: {
            webSecurityEnabled: false
          },
        },
        flags: ['--load-images=true'],
        debug: false
      }
    },
    phantomjsLauncher: {
      // Have phantomjs exit if a ResourceError is encountered
      // (useful if karma exits without killing phantom)
      exitOnResourceError: true
    },
*/
    /*
     * Continuous Integration mode
     * if true, Karma captures browsers, runs the tests and exits
     */
    singleRun: true
  };


  config.set(configuration);
};
