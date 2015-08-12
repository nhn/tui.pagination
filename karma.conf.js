var istanbul = require('browserify-istanbul');
var hbsfy = require('hbsfy');

module.exports = function(config) {
    var webdriverConfig = {
        hostname: 'fe.nhnent.com',
        port: 4444,
        remoteHost: true
    };

    config.set({
        basePath: './',

        frameworks: [
            'browserify',
            'jasmine'
        ],

        files: [
            'lib/json2/json2.js',
            'lib/jquery/jquery.js',
            'lib/ne-code-snippet/code-snippet.js',
            'src/**/uploader.js',
            'src/**/*.js',
            'test/**/*.spec.js'
        ],

        exclude: [
        ],

        preprocessors: {
            'index.js': ['browserify'],
            'src/**/*.js': ['browserify'],
            'test/**/*.js': ['browserify']
        },

        reporters: [
            'mocha',
            'coverage',
            'junit'
        ],

        browserify: {
            debug: true,
            bundleDelay: 1000,
            transform:[hbsfy, istanbul({
                ignore: [
                    'index.js'
                ]
            })]
        },

        coverageReporter: {
            dir: 'report/',
            reporters: [{
                type: 'cobertura',
                subdir: 'cobertura',
                file: 'cobertura.xml'
            }]
        },

        junitReporter: {
            outputDir: 'report/junit',
            suite: ''
        },


        port: 9876,

        colors: true,

        logLevel: config.LOG_INFO,

        autoWatch: false,

        browsers: [
            'IE7',
            'IE8',
            'IE9',
            'IE10',
            'IE11',
            'Chrome-WebDriver',
            'Firefox-WebDriver'
        ],

        customLaunchers: {
            'IE7': {
                base: 'WebDriver', 
                config: webdriverConfig,
                browserName: 'internet explorer',
                version: 7
            },
            'IE8': {
                base: 'WebDriver', 
                config: webdriverConfig,
                browserName: 'internet explorer',
                version: 8
            },
            'IE9': {
                base: 'WebDriver', 
                config: webdriverConfig,
                browserName: 'internet explorer',
                version: 9
            },
            'IE10': {
                base: 'WebDriver', 
                config: webdriverConfig,
                browserName: 'internet explorer',
                version: 10
            },
            'IE11': {
                base: 'WebDriver', 
                config: webdriverConfig,
                browserName: 'internet explorer',
                version: 11
            },
            'Chrome-WebDriver': {
                base: 'WebDriver', 
                config: webdriverConfig, 
                browserName: 'chrome' 
            },
            'Firefox-WebDriver': {
                base: 'WebDriver', 
                config: webdriverConfig, 
                browserName: 'firefox' 
            }
        },

        singleRun: true
    });
};
