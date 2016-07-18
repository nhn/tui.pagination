'use strict';

var istanbul = require('browserify-istanbul');

module.exports = function(config) {
    var webdriverConfig = {
        hostname: 'fe.nhnent.com',
        port: 4444,
        remoteHost: true
    };

    config.set({
        basePath: '',

        captureTimeout: 100000,
        browserDisconnectTimeout: 60000,
        browserNoActivityTimeout: 60000,

        frameworks: [
            'browserify',
            'jasmine'
        ],

        files: [
            {pattern: 'lib/jquery/jquery.js', watched: false},
            {pattern: 'lib/tui-code-snippet/code-snippet.js', watched: false},
            {pattern: 'node_modules/jasmine-jquery/lib/jasmine-jquery.js', watched: false},

            {pattern: 'test/fixtures/*.html', included: false},

            'src/**/*.js',
            'test/**/*.spec.js'
        ],

        exclude: [],

        preprocessors: {
            'src/**/*.js': ['browserify'],
            'test/**/*.js': ['browserify']
        },

        reporters: [
            'dots',
            'coverage',
            'junit'
        ],

        browserify: {
            debug: true,
            transform:[istanbul({
                ignore: ['test/**/*'],
                defaultIgnore: true
            })]
        },

        coverageReporter: {
            dir: 'report/coverage/',
            reporters: [
                {
                    type: 'html',
                    subdir: function(browser) {
                        return 'report-html/' + browser;
                    }
                },
                {
                    type: 'cobertura',
                    subdir: function(browser) {
                        return 'report-cobertura/' + browser;
                    },
                    file: 'cobertura.txt'
                }
            ]
        },

        junitReporter: {
            outputDir: 'report/junit',
            suite: ''
        },

        port: 9876,

        colors: true,

        logLevel: config.LOG_INFO,

        autoWatch: true,

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
