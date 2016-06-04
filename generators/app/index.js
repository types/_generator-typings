'use strict';
const yeoman = require('yeoman-generator');

module.exports = yeoman.Base.extend({
  constructor: function () {
    yeoman.Base.apply(this, arguments);
    this.option('beta');
  },
  initializing() {
    this.composeWith('typings:beta');
  }
});
