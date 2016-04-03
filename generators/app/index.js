'use strict';
const yeoman = require('yeoman-generator');

module.exports = yeoman.Base.extend({
  constructor: function() {
    yeoman.Base.apply(this, arguments);
    this.option('beta');
  },
  initializing() {
    if (this.options.beta) {
      this.composeWith('typings:beta');
    } else {
      this.composeWith('typings:current');
    }
  }
});
