'use strict';

var template = require('tui-code-snippet/domUtil/template');
var sendHostname = require('tui-code-snippet/request/sendHostname');
var isFunction = require('tui-code-snippet/type/isFunction');

var util = {
  /**
   * Capitalize first letter
   * @param {string} str - String to change
   * @returns {string} Changed string
   */
  capitalizeFirstLetter: function(str) {
    return str.substring(0, 1).toUpperCase() + str.substring(1, str.length);
  },

  /**
   * Check the element is contained
   * @param {HTMLElement} find - Target element
   * @param {HTMLElement} parent - Wrapper element
   * @returns {boolean} Whether contained or not
   */
  isContained: function(find, parent) {
    if (!parent) {
      return false;
    }

    return find === parent ? true : parent.contains(find);
  },

  /**
   * Create an new element by template literals.
   * @param {string|function} tmpl - template
   * @param {Object} context - context
   * @returns {HTMLElement}
   */
  createElementByTemplate: function(tmpl, context) {
    var parent = document.createElement('div');
    var html = isFunction(tmpl) ? tmpl(context) : template(tmpl, context);
    parent.innerHTML = html;

    return parent.firstChild;
  },

  /**
   * Create a new function that, when called, has its this keyword set to the provided value.
   * @param {function} fn A original function before binding
   * @param {*} obj context of function in arguments[0]
   * @returns {function} A new bound function with context that is in arguments[1]
   */
  bind: function(fn, obj) {
    var slice = Array.prototype.slice;
    var args;

    if (fn.bind) {
      return fn.bind.apply(fn, slice.call(arguments, 1));
    }

    args = slice.call(arguments, 2);

    return function() {
      return fn.apply(obj, args.length ? args.concat(slice.call(arguments)) : arguments);
    };
  },

  /**
   * Send hostname for GA
   * @ignore
   */
  sendHostName: function() {
    sendHostname('pagination', 'UA-129987462-1');
  }
};

module.exports = util;
