module.exports = function (config) {
    config.set({
      basePath: '',
      frameworks: ['jasmine', '@angular-devkit/build-angular'],
      plugins: [
        require('karma-jasmine'),
        require('karma-chrome-launcher'),
        require('karma-jasmine-html-reporter'),
        require('karma-coverage'),
        require('@angular-devkit/build-angular/plugins/karma')
      ],
      coverageReporter: {
        dir: require('path').join(__dirname, './coverage'),
        reporters: [
          { type: 'html' },
          { type: 'text-summary' }
        ],
        check: {
          global: {
            statements: 80,
            branches: 80,
            functions: 80,
            lines: 80
          }
        }
      },
      reporters: ['progress', 'kjhtml'],
      browsers: ['Chrome'],
      restartOnFileChange: true
    });
  };