'use strict';

var snippet = require('tui-code-snippet');

var View = require('./view.js');

var defaultOption = {
    totalItems: 10,
    itemsPerPage: 10,
    visiblePages: 10,
    page: 1,
    centerAlign: false,
    firstItemClassName: 'tui-first-child',
    lastItemClassName: 'tui-last-child'
};

/**
 * Pagination class
 * @class Pagination
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
 * @example
 * var Pagination = tui.Pagination; // or require('tui-pagination')
 *
 * var container = document.getElementById('pagination');
 * var options = { // below default value of options
 *      totalItems: 10,
 *      itemsPerPage: 10,
 *      visiblePages: 10,
 *      page: 1,
 *      centerAlign: false,
 *      firstItemClassName: 'tui-first-child',
 *      lastItemClassName: 'tui-last-child',
 *      template: {
 *          page: '<a href="#" class="tui-page-btn">{{page}}</a>',
 *          currentPage: '<strong class="tui-page-btn tui-is-selected">{{page}}</strong>',
 *          moveButton:
 *              '<a href="#" class="tui-page-btn tui-{{type}}">' +
 *                  '<span class="tui-ico-{{type}}">{{type}}</span>' +
 *              '</a>',
 *          disabledMoveButton:
 *              '<span class="tui-page-btn tui-is-disabled tui-{{type}}">' +
 *                  '<span class="tui-ico-{{type}}">{{type}}</span>' +
 *              '</span>',
 *          moreButton:
 *              '<a href="#" class="tui-page-btn tui-{{type}}-is-ellip">' +
 *                  '<span class="tui-ico-ellip">...</span>' +
 *              '</a>'
 *      }
 * };
 * var pagination = new Pagination(container, options);
 */
var Pagination = snippet.defineClass(/** @lends Pagination.prototype */{
    init: function(container, options) {
        /**
         * Option object
         * @type {object}
         * @private
         */
        this._options = snippet.extend({}, defaultOption, options);

        /**
         * Current page number
         * @type {number}
         * @private
         */
        this._currentPage = 0;

        /**
         * View instance
         * @type {View}
         * @private
         */
        this._view = new View(container, this._options, snippet.bind(this._onClickHandler, this));

        this._paginate();
    },

    /**
     * Set current page
     * @param {number} page - Current page
     * @private
     */
    _setCurrentPage: function(page) {
        this._currentPage = page || this._options.page;
    },

    /**
     * Get last page number
     * @returns {number} Last page number
     * @private
     */
    _getLastPage: function() {
        var lastPage = Math.ceil(this._options.totalItems / this._options.itemsPerPage);

        return (!lastPage) ? 1 : lastPage;
    },

    /**
     * Index of list in total lists
     * @param {number} pageNumber - Page number
     * @returns {number} Page index or number
     * @private
     */
    _getPageIndex: function(pageNumber) {
        var left, pageIndex;

        if (this._options.centerAlign) {
            left = Math.floor(this._options.visiblePages / 2);
            pageIndex = pageNumber - left;
            pageIndex = Math.max(pageIndex, 1);
            pageIndex = Math.min(pageIndex, this._getLastPage() - this._options.visiblePages + 1);

            return pageIndex;
        }

        return Math.ceil(pageNumber / this._options.visiblePages);
    },

    /**
     * Get relative page
     * @param {string} moveType - Move type ('prev' or 'next')
     * @returns {number} Relative page number
     * @private
     */
    _getRelativePage: function(moveType) {
        var isPrevMove = (moveType === 'prev');
        var currentPage = this.getCurrentPage();

        return isPrevMove ? currentPage - 1 : currentPage + 1;
    },

    /**
     * Get more page index
     * @param {string} moveType - Move type ('prev' or 'next')
     * @returns {number} Page index
     * @private
     */
    _getMorePageIndex: function(moveType) {
        var currentPageIndex = this._getPageIndex(this.getCurrentPage());
        var pageCount = this._options.visiblePages;
        var isPrevMove = (moveType === 'prev');
        var pageIndex;

        if (this._options.centerAlign) {
            pageIndex = isPrevMove ? currentPageIndex - 1 : currentPageIndex + pageCount;
        } else {
            pageIndex = isPrevMove ? (currentPageIndex - 1) * pageCount : (currentPageIndex * pageCount) + 1;
        }

        return pageIndex;
    },
    /* eslint-enable complexity */

    /**
     * Get available page number from over number
     * If total page is 23, but input number is 30 => return 23
     * @param {number} page - Page number
     * @returns {number} Replaced pgae number
     * @private
     */
    _convertToValidPage: function(page) {
        var lastPageNumber = this._getLastPage();
        page = Math.max(page, 1);
        page = Math.min(page, lastPageNumber);

        return page;
    },

    /**
     * Create require view set, notify view to update
     * @param {number} page - Page number
     * @private
     */
    _paginate: function(page) {
        var viewData = this._makeViewData(page || this._options.page);
        this._setCurrentPage(page);
        this._view.update(viewData);
    },

    /**
     * Create and get view data
     * @param {number} page - Page number
     * @returns {object} view data
     * @private
     */
    _makeViewData: function(page) {
        var viewData = {};
        var lastPage = this._getLastPage();
        var currentPageIndex = this._getPageIndex(page);
        var lastPageListIndex = this._getPageIndex(lastPage);
        var edges = this._getEdge(page);

        viewData.leftPageNumber = edges.left;
        viewData.rightPageNumber = edges.right;

        viewData.prevMore = (currentPageIndex > 1);
        viewData.nextMore = (currentPageIndex < lastPageListIndex);

        viewData.page = page;
        viewData.currentPageIndex = page;
        viewData.lastPage = lastPage;
        viewData.lastPageListIndex = lastPage;

        return viewData;
    },

    /**
     * Get each edge page
     * @param {object} page - Page number
     * @returns {{left: number, right: number}} Edge page numbers
     * @private
     */
    _getEdge: function(page) {
        var leftPageNumber, rightPageNumber, left;
        var lastPage = this._getLastPage();
        var visiblePages = this._options.visiblePages;
        var currentPageIndex = this._getPageIndex(page);

        if (this._options.centerAlign) {
            left = Math.floor(visiblePages / 2);
            leftPageNumber = Math.max(page - left, 1);
            rightPageNumber = leftPageNumber + visiblePages - 1;

            if (rightPageNumber > lastPage) {
                leftPageNumber = Math.max(lastPage - visiblePages + 1, 1);
                rightPageNumber = lastPage;
            }
        } else {
            leftPageNumber = ((currentPageIndex - 1) * visiblePages) + 1;
            rightPageNumber = (currentPageIndex) * visiblePages;
            rightPageNumber = Math.min(rightPageNumber, lastPage);
        }

        return {
            left: leftPageNumber,
            right: rightPageNumber
        };
    },

    /**
     * Pagelist click event hadnler
     * @param {?string} buttonType - Button type
     * @param {?number} page - Page number
     * @private
     */
    /* eslint-disable complexity */
    _onClickHandler: function(buttonType, page) {
        switch (buttonType) {
            case 'first':
                page = 1;
                break;
            case 'prev':
                page = this._getRelativePage('prev');
                break;
            case 'next':
                page = this._getRelativePage('next');
                break;
            case 'prevMore':
                page = this._getMorePageIndex('prev');
                break;
            case 'nextMore':
                page = this._getMorePageIndex('next');
                break;
            case 'last':
                page = this._getLastPage();
                break;
            default:
                if (!page) {
                    return;
                }
        }

        this.movePageTo(page);
    },
    /* eslint-enable complexity */

    /**
     * Reset pagination
     * @param {*} totalItems - Redraw page item count
     * @example
     * pagination.reset();
     * pagination.reset(100);
     */
    reset: function(totalItems) {
        if (snippet.isUndefined(totalItems)) {
            totalItems = this._options.totalItems;
        }

        this._options.totalItems = totalItems;
        this._paginate(1);
    },

    /**
     * Move to specific page, redraw list.
     * Before move fire beforeMove event, After move fire afterMove event.
     * @param {Number} targetPage - Target page
     * @example
     * pagination.movePageTo(10);
     */
    movePageTo: function(targetPage) {
        targetPage = this._convertToValidPage(targetPage);

        /**
         * @event Pagination#beforeMove
         * @param {object} eventData - Custom event object
         *   @param {Number} page - Moved page
         * @example
         * paganation.on('beforeMove', function(eventData) {
         *     var currentPage = eventData.page;
         *
         *     if (currentPage === 10) {
         *         return false;
         *         // return true;
         *     }
         * });
         */
        if (!this.invoke('beforeMove', {page: targetPage})) {
            return;
        }

        this._paginate(targetPage);

        /**
         * @event Pagination#afterMove
         * @param {object} eventData - Custom event object
         *   @param {number} page - Moved page
         * @example
         * paganation.on('afterMove', function(eventData) {
         *      var currentPage = eventData.page;
         *      console.log(currentPage);
         * });
         */
        this.fire('afterMove', {page: targetPage});
    },

    /**
     * Set total count of items
     * @param {number} itemCount - Total item count
     */
    setTotalItems: function(itemCount) {
        this._options.totalItems = itemCount;
    },

    /**
     * Set count of items per page
     * @param {number} itemCount - Item count
     */
    setItemsPerPage: function(itemCount) {
        this._options.itemsPerPage = itemCount;
    },

    /**
     * Get current page
     * @returns {number} Current page
     */
    getCurrentPage: function() {
        return this._currentPage || this._options.page;
    }
});

snippet.CustomEvents.mixin(Pagination);

module.exports = Pagination;
