'use strict';

var isFunction = require('tui-code-snippet').isFunction;

var util = {
    /**
     * Bind event to element
     * @param {HTMLElement} element - DOM element to attach the event handler on
     * @param {string} eventType - Event type
     * @param {Function} callback - Event handler function
     */
    addEventListener: function(element, eventType, callback) {
        if (element.addEventListener) {
            element.addEventListener(eventType, callback, false);
        } else {
            element.attachEvent('on' + eventType, callback);
        }
    },

    /**
     * Prevent default event
     * @param {Event} event - Event object
     */
    preventDefault: function(event) {
        if (event.preventDefault) {
            event.preventDefault();
        } else {
            event.returnValue = false;
        }
    },

    /**
     * Get target from event object
     * @param {Event} event - Event object
     * @returns {HTMLElement} Target element
     */
    getTargetElement: function(event) {
        return event.target || event.srcElement;
    },

    /**
     * Add classname
     * @param {HTMLElement} element - Target element
     * @param {string} className - Classname
     */
    addClass: function(element, className) {
        if (!element) {
            return;
        }

        if (element.className === '') {
            element.className = className;
        } else if (!util.hasClass(element, className)) {
            element.className += ' ' + className;
        }
    },

    /**
     * Check the element has specific class or not
     * @param {HTMLElement} element - A target element
     * @param {string} className - A name of class to find
     * @returns {boolean} Whether the element has the class
     */
    hasClass: function(element, className) {
        var elClassName = util.getClass(element);

        return elClassName.indexOf(className) > -1;
    },

    /**
     * Get class name
     * @param {HTMLElement} element - HTMLElement
     * @returns {string} Class name
     */
    getClass: function(element) {
        return element && element.getAttribute &&
            (element.getAttribute('class') || element.getAttribute('className') || '');
    },

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

        return (find === parent) ? true : parent.contains(find);
    },

    /**
     * Replace matched property with template
     * @param {string} template - String of template
     * @param {object} props - Properties
     * @returns {string} Replaced template string
     */
    replaceTemplate: function(template, props) {
        var newTemplate = template.replace(/\{\{(\w*)\}\}/g, function(value, prop) {
            return props.hasOwnProperty(prop) ? props[prop] : '';
        });

        return newTemplate;
    },

    /**
     * Change template string to element
     * @param {string|Function} template - Template option
     * @param {object} props - Template props
     * @returns {string} Replaced template
     */
    changeTemplateToElement: function(template, props) {
        var html;

        if (isFunction(template)) {
            html = template(props);
        } else {
            html = util.replaceTemplate(template, props);
        }

        return util.getElementFromTemplate(html);
    },

    /**
     * Get element from template string
     * @param {string} template - Template string
     * @returns {HTMLElement} Changed element
     */
    getElementFromTemplate: function(template) {
        var tempElement = document.createElement('div');

        tempElement.innerHTML = template;

        return tempElement.children[0];
    }
};

module.exports = util;
