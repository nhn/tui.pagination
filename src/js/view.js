'use strict';

var snippet = require('tui-code-snippet');

var util = require('./util.js');

var extend = snippet.extend;
var forEach = snippet.forEach;
var isString = snippet.isString;
var bind = snippet.bind;
var isHTMLNode = snippet.isHTMLNode;

var defaultTemplate = {
    page: '<a href="#" class="tui-page-btn">{{page}}</a>',
    currentPage: '<strong class="tui-page-btn tui-is-selected">{{page}}</strong>',
    moveButton:
        '<a href="#" class="tui-page-btn tui-{{type}}">' +
            '<span class="tui-ico-{{type}}">{{type}}</span>' +
        '</a>',
    disabledMoveButton:
        '<span class="tui-page-btn tui-is-disabled tui-{{type}}">' +
            '<span class="tui-ico-{{type}}">{{type}}</span>' +
        '</span>',
    moreButton:
        '<a href="#" class="tui-page-btn tui-{{type}}-is-ellip">' +
            '<span class="tui-ico-ellip">...</span>' +
        '</a>'
};
var moveButtons = ['first', 'prev', 'next', 'last'];
var moreButtons = ['prev', 'next'];

var INVALID_CONTAINER_ELEMENT = 'The container element is invalid.';

/**
 * Pagination view class
 * @class View
 * @param {string|HTMLElement|jQueryObject} container - Container element or id selector
 * @param {object} options - Option object
 *     @param {number} [options.totalItems=10] Total item count
 *     @param {number} [options.itemsPerPage=10] Item count per page
 *     @param {number} [options.visiblePages=10] Display page link count
 *     @param {number} [options.page=1] Display page after pagination draw.
 *     @param {boolean}[options.centerAlign=false] Whether current page keep center or not
 *     @param {string} [options.firstItemClassName='first-child'] The class name of the first item
 *     @param {string} [options.lastItemClassName='last-child'] The class name of the last item
 *     @param {object} [options.template] A markup string set to make element
 *         @param {string|function} [options.template.page] HTML template
 *         @param {string|function} [options.template.currentPage] HTML template
 *         @param {string|function} [options.template.moveButton] HTML template
 *         @param {string|function} [options.template.disabledMoveButton] HTML template
 *         @param {string|function} [options.template.moreButton] HTML template
 * @param {function} handler - Event handler
 * @ignore
 */
var View = snippet.defineClass(/** @lends View.prototype */{
    init: function(container, options, handler) {
        /**
         * Root element
         * @type {HTMLElement}
         * @private
         */
        this._containerElement = null;

        /**
         * First item's class name
         * @type {string}
         * @private
         */
        this._firstItemClassName = options.firstItemClassName;

        /**
         * Last item's class name
         * @type {string}
         * @private
         */
        this._lastItemClassName = options.lastItemClassName;

        /**
         * Default template
         * @type {object.<string, string|function>}
         * @private
         */
        this._template = extend({}, defaultTemplate, options.template);

        /**
         * Map of buttons
         * @type {object.<string, HTMLElement>}
         * @private
         */
        this._buttons = {};

        /**
         * Enabled page elements list
         * @type {array}
         * @private
         */

        this._enabledPageElements = [];

        this._setRootElement(container);
        this._setMoveButtons();
        this._setDisabledMoveButtons();
        this._setMoreButtons();
        this._attachClickEvent(handler);
    },
    /* eslint-enable complexity */

    /**
     * Set root element
     * @param {string|HTMLElement|jQueryObject} container - Container element or id selector
     * @private
     */
    _setRootElement: function(container) {
        if (isString(container)) {
            container = document.getElementById(container);
        } else if (container.jquery) {
            container = container[0];
        }

        if (!isHTMLNode(container)) {
            throw new Error(INVALID_CONTAINER_ELEMENT);
        }

        this._containerElement = container;
    },

    /**
     * Assign move buttons to option
     * @private
     */
    _setMoveButtons: function() {
        var template = this._template.moveButton;

        forEach(moveButtons, function(type) {
            this._buttons[type] = util.changeTemplateToElement(template, {
                type: type
            });
        }, this);
    },

    /**
     * Assign disabled move buttons to option
     * @private
     */
    _setDisabledMoveButtons: function() {
        var template = this._template.disabledMoveButton;
        var key;

        forEach(moveButtons, function(type) {
            key = 'disabled' + util.capitalizeFirstLetter(type);
            this._buttons[key] = util.changeTemplateToElement(template, {
                type: type
            });
        }, this);
    },

    /**
     * Assign more buttons to option
     * @private
     */
    _setMoreButtons: function() {
        var template = this._template.moreButton;
        var key;

        forEach(moreButtons, function(type) {
            key = type + 'More';
            this._buttons[key] = util.changeTemplateToElement(template, {
                type: type
            });
        }, this);
    },
    /* eslint-enable camelcase */

    /**
     * Get container element
     * @returns {HTMLElement} Container element
     * @private
     */
    _getContainerElement: function() {
        return this._containerElement;
    },

    /**
     * Append first button on container element
     * @param {object} viewData - View data to render pagination
     * @private
     */
    _appendFirstButton: function(viewData) {
        var button;

        if (viewData.page > 1) {
            button = this._buttons.first;
        } else {
            button = this._buttons.disabledFirst;
        }

        this._getContainerElement().appendChild(button);
    },

    /**
     * Append previous button on container element
     * @param {object} viewData - View data to render pagination
     * @private
     */
    _appendPrevButton: function(viewData) {
        var button;

        if (viewData.currentPageIndex > 1) {
            button = this._buttons.prev;
        } else {
            button = this._buttons.disabledPrev;
        }

        this._getContainerElement().appendChild(button);
    },

    /**
     * Append next button on container element
     * @param {object} viewData - View data to render pagination
     * @private
     */
    _appendNextButton: function(viewData) {
        var button;

        if (viewData.currentPageIndex < viewData.lastPageListIndex) {
            button = this._buttons.next;
        } else {
            button = this._buttons.disabledNext;
        }

        this._getContainerElement().appendChild(button);
    },

    /**
     * Append last button on container element
     * @param {object} viewData - View data to render pagination
     * @private
     */
    _appendLastButton: function(viewData) {
        var button;

        if (viewData.page < viewData.lastPage) {
            button = this._buttons.last;
        } else {
            button = this._buttons.disabledLast;
        }

        this._getContainerElement().appendChild(button);
    },

    /**
     * Append previous more button on container element
     * @param {object} viewData - View data to render pagination
     * @private
     */
    _appendPrevMoreButton: function(viewData) {
        var button;

        if (viewData.prevMore) {
            button = this._buttons.prevMore;
            util.addClass(button, this._firstItemClassName);
            this._getContainerElement().appendChild(button);
        }
    },

    /**
     * Append next more button on container element
     * @param {object} viewData - View data to render pagination
     * @private
     */
    _appendNextMoreButton: function(viewData) {
        var button;

        if (viewData.nextMore) {
            button = this._buttons.nextMore;
            util.addClass(button, this._lastItemClassName);
            this._getContainerElement().appendChild(button);
        }
    },

    /**
     * Append page number elements on container element
     * @param {object} viewData - View data to render pagination
     * @private
     */
    _appendPages: function(viewData) {
        var template = this._template;
        var firstPage = viewData.leftPageNumber;
        var lastPage = viewData.rightPageNumber;
        var pageItem, i;

        for (i = firstPage; i <= lastPage; i += 1) {
            if (i === viewData.page) {
                pageItem = util.changeTemplateToElement(template.currentPage, {page: i});
            } else {
                pageItem = util.changeTemplateToElement(template.page, {page: i});
                this._enabledPageElements.push(pageItem);
            }

            if (i === firstPage && !viewData.prevMore) {
                util.addClass(pageItem, this._firstItemClassName);
            }
            if (i === lastPage && !viewData.nextMore) {
                util.addClass(pageItem, this._lastItemClassName);
            }
            this._getContainerElement().appendChild(pageItem);
        }
    },

    /**
     * Attach click event
     * @param {function} callback - Callback function
     * @private
     */
    _attachClickEvent: function(callback) {
        var rootElement = this._getContainerElement();

        util.addEventListener(rootElement, 'click', bind(function(event) {
            var target = util.getTargetElement(event);
            var page, buttonType;

            util.preventDefault(event);

            buttonType = this._getButtonType(target);

            if (!buttonType) {
                page = this._getPageNumber(target);
            }

            callback(buttonType, page);
        }, this));
    },

    /**
     * Get button type to move button elements
     * @param {HTMLElement} targetElement - Each move button element
     * @returns {?string} Button type
     * @private
     */
    _getButtonType: function(targetElement) {
        var buttonType;
        var buttons = this._buttons;

        forEach(buttons, function(button, type) {
            if (util.isContained(targetElement, button)) {
                buttonType = type;

                return false;
            }

            return true;
        }, this);

        return buttonType;
    },
    /* eslint-enable no-lonely-if */

    /**
     * Get number to page elements
     * @param {HTMLElement} targetElement - Each page element
     * @returns {?number} Page number
     * @private
     */
    _getPageNumber: function(targetElement) {
        var targetPage = this._findPageElement(targetElement);
        var page;

        if (targetPage) {
            page = parseInt(targetPage.innerText, 10);
        }

        return page;
    },

    /**
     * Find target element from page elements
     * @param {HTMLElement} targetElement - Each page element
     * @returns {HTMLElement} Found element
     * @ignore
     */
    _findPageElement: function(targetElement) {
        var i, length, pickedItem;

        for (i = 0, length = this._enabledPageElements.length; i < length; i += 1) {
            pickedItem = this._enabledPageElements[i];

            if (util.isContained(targetElement, pickedItem)) {
                return pickedItem;
            }
        }

        return null;
    },

    /**
     * Reset container element
     * @private
     */
    _empty: function() {
        this._enabledPageElements = [];

        forEach(this._buttons, function(buttonElement, type) {
            this._buttons[type] = buttonElement.cloneNode(true);
        }, this);

        this._getContainerElement().innerHTML = '';
    },

    /**
     * Update view
     * @param {object} viewData - View data to render pagination
     * @ignore
     */
    update: function(viewData) {
        this._empty();
        this._appendFirstButton(viewData);
        this._appendPrevButton(viewData);
        this._appendPrevMoreButton(viewData);
        this._appendPages(viewData);
        this._appendNextMoreButton(viewData);
        this._appendNextButton(viewData);
        this._appendLastButton(viewData);
    }
});

module.exports = View;
