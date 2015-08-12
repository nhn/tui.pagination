/**
 * @fileoverview Core of pagination component, create pagination view and attach events.
 * (from pug.Pagination)
 * @author NHN entertainment FE dev team(dl_javascript@nhnent.com)
 * @dependency jquery-1.8.3.min.js, code-snippet.js
 */

var View = require('./view.js');

/**
 * Pagination core class
 * @constructor ne.component.Pagination
 *
 */
var Pagination = ne.util.defineClass(/**@lends ne.component.Pagination.prototype */{
    /**
     * Initialize
     * @param {DataObject} options Option object
     * 		@param {Number} [options.itemCount=10] Total item count
     * 		@param {Number} [options.itemPerPage=10] Item count per page
     * 		@param {Number} [options.pagePerPageList=10] Display page link count
     * 		@param {Number} [options.page=1] page Display page after pagination draw.
     * 		@param {String} [options.moveUnit="pagelist"] Page move unit.
     * 			<ul>
     * 				<li>pagelist : Move page for unit</li>
     * 				<li>page : Move one page</li>
     * 			</ul>
     * 		@param {Boolean}[options.isCenterAlign=false] Whether current page keep center or not
     * 		@param {String} [options.insertTextNode=""] The coupler between page links
     * 		@param {String} [options.classPrefix=""] A prefix of class name
     * 		@param {String} [options.firstItemClassName="first-child"] The class name is granted first page link item
     * 		@param {String} [options.lastItemClassName="last-child"] The class name is granted first page link item
     * 		@param {String} [options.pageTemplate="<a href='#'>{=page}</a>"] The markup template to show page item such as 1, 2, 3, .. {=page} will be changed each page number.
     * 		@param {String} [options.currentPageTemplate="<strong>{=page}</strong>"] The markup template for current page {=page} will be changed current page number.
     * 		@param {jQueryObject} [options.$pre_endOn] The button element to move first page. If this option is not exist and the element that has class 'pre_end', component do not create this button.
     * 		@param {jQueryObject} [options.$preOn] The button element to move previouse page. If this option is not exist and the element that has class 'pre', component do not create this button.
     * 		@param {jQueryObject} [options.$nextOn] The button element to move next page. If this option is not exist and the element that has class 'next', component do not create this button.
     * 		@param {jQueryObject} [options.$lastOn] The button element to move last page. If this option is not exist and the element that has class 'last', component do not create this button.
     * 		@param {jQueryObject} [options.$pre_endOff] The element to show that pre_endOn button is not enable. If this option is not exist and the element that has class 'pre_endOff', component do not create this button.
     * 		@param {jQueryObject} [options.$preOff] The element to show that preOn button is not enable. If this option is not exist and the element that has class 'preOff', component do not create this button.
     * 		@param {jQueryObject} [options.$nextOff] The element to show that nextOn button is not enable. If this option is not exist and the element that has class 'nextOff', component do not create this button.
     * 		@param {jQueryObject} [options.$lastOff] The element to show that lastOn button is not enable. If this option is not exist and the element that has class 'lastOff', component do not create this button.
     * @param {jQueryObject} $element Pagination container
     */
    init: function(options, $element) {
        var defaultOption = {
            itemCount: 10,
            itemPerPage: 10,
            pagePerPageList: 10,
            page: 1,
            moveUnit: 'pagelist',
            isCenterAlign: false,
            insertTextNode: '',
            classPrefix: '',
            firstItemClassName: 'first-child',
            lastItemClassName: 'last-child',
            pageTemplate: '<a href="#">{=page}</a>',
            currentPageTemplate: '<strong>{=page}</strong>'
        };

        if (!options.itemCount) {
            alert('itemCount have to more than 1');
        }

        /**
         * Option object
         * @type {Object}
         * @private
         */
        this._options = ne.util.extend(defaultOption, options);

        /**
         * Event handler savor
         * @type {Object}
         * @private
         */
        this._events = {};

        /**
         * view instance
         * @type {PaginationView}
         * @private
         */
        this._view = new View(this._options, $element);
        this._view.attachEvent('click', ne.util.bind(this._onClickPageList, this));

        this.movePageTo(this.getOption('page'), false);
    },

    /**
     * Reset pagination
     * @param {*} itemCount Redraw page item count
     */
    reset: function(itemCount) {

        var isExist = ne.util.isExisty((itemCount !== null) && (itemCount !== undefined));

        if (!isExist) {
            itemCount = this.getOption('itemCount');
        }

        this.setOption('itemCount', itemCount);
        this.movePageTo(1, false);
    },

    /**
     * Get options
     * @param {String} optionKey Option key
     * @private
     * @returns {*}
     *
     */
    getOption: function(optionKey) {
        return this._options[optionKey];
    },

    /**
     * Move to specific page, redraw list.
     * Befor move fire beforeMove event, After move fire afterMove event.
     * @param {Number} targetPage Target page
     * @param {Boolean} isNotRunCustomEvent [isNotRunCustomEvent=true] Whether custom event fire or not
     */
    movePageTo: function(targetPage, isNotRunCustomEvent) {

        targetPage = this._convertToAvailPage(targetPage);
        this._currentPage = targetPage;

        if (!isNotRunCustomEvent) {
            /**
             * Fire 'beforeMove' event(CustomEvent)
             * @param {componentEvent} eventData
             * @param {String} eventData.eventType Custom event name
             * @param {Number} eventData.page Target page
             * @param {Function} eventData.stop Stop move specific page
             * @example
             * paganation.on("beforeMove", function(eventData) {
                var currentPage = eventData.page;
             });
             */

            if (!this.invoke('beforeMove', { page: targetPage })) {
                return;
            }
        }

        this._paginate(targetPage);

        if (isNotRunCustomEvent) {
            /**
             * Fire 'afterMove'
             * @param {componentEvent} eventData
             * @param {String} eventData.eventType Custom event name
             * @param {Number} eventData.page Moved page
             * @example
             * paganation.on("beforeMove", function(eventData) {
            var currentPage = eventData.page;
         });
             */
            this.fire('afterMove', { page: targetPage });
        }
    },

    /**
     * Change option value
     * @param {String} optionKey The target option key
     * @param {*} optionValue The target option value
     * @private
     */
    setOption: function(optionKey, optionValue) {
        this._options[optionKey] = optionValue;
    },

    /**
     * Get current page
     * @returns {Number} Current page
     */
    getCurrentPage: function() {
        return this._currentPage || this._options['page'];
    },

    /**
     * Get item  index from list
     * @param {Number} pageNumber Page number
     * @returns {number}
     */
    getIndexOfFirstItem: function(pageNumber) {
        return this.getOption('itemPerPage') * (pageNumber - 1) + 1;
    },

    /**
     * Get Last page number
     * @returns {number}
     * @private
     */
    _getLastPage: function() {
        return Math.ceil(this.getOption('itemCount') / this.getOption('itemPerPage'));
    },

    /**
     * Index of list in total lists
     * @param {Number} pageNumber Page number
     * @return {Number}
     * @private
     */
    _getPageIndex: function(pageNumber) {
        // IsCenterAlign == true case
        if (this.getOption('isCenterAlign')) {
            var left = Math.floor(this.getOption('pagePerPageList') / 2),
                pageIndex = pageNumber - left;
            pageIndex = Math.max(pageIndex, 1);
            pageIndex = Math.min(pageIndex, this._getLastPage() - this.getOption('pagePerPageList') + 1);
            return pageIndex;
        }
        return Math.ceil(pageNumber / this.getOption("pagePerPageList"));
    },

    /**
     * Get page number of prev, next pages
     * @param {String} relativeName Directions(pre_end, next_end, pre, next)
     * @return {Number}
     * @private
     *     */
    _getRelativePage: function(relativeName) {
        var page = null,
            isMovePage = this.getOption('moveUnit') === 'page',
            currentPageIndex = this._getPageIndex(this.getCurrentPage());
        if(this.getOption('isCenterAlign')) {
            if (relativeName === 'pre') {
                page = isMovePage ? this.getCurrentPage() - 1 : currentPageIndex - 1;
            } else {
                page = isMovePage ? this.getCurrentPage() + 1 : currentPageIndex + this.getOption('pagePerPageList');
            }
        } else {
            if (relativeName === 'pre') {
                page = isMovePage ? this.getCurrentPage() - 1 : (currentPageIndex - 1) * this.getOption('pagePerPageList');
            } else {
                page = isMovePage ? this.getCurrentPage() + 1 : currentPageIndex * this.getOption('pagePerPageList') + 1;
            }
        }
        return page;
    },

    /**
     * Get avail page number from over number
     * If total page is 23, but input number is 30 => return 23
     * @param {Number} page Page number
     * @returns {number}
     * @private
     */
    _convertToAvailPage: function(page) {
        var lastPageNumber = this._getLastPage();
        page = Math.max(page, 1);
        page = Math.min(page, lastPageNumber);
        return page;
    },

    /**
     * Create require view set, notify view to update.
     * @param {Number} page
     * @private
     */
    _paginate: function(page){

        // 뷰의 버튼 및 페이지를 모두 제거 및 복사
        this._view.empty();

        var viewSet = {};

        viewSet.lastPage = this._getLastPage();
        viewSet.currentPageIndex = this._getPageIndex(page);
        viewSet.lastPageListIndex = this._getPageIndex(viewSet.lastPage);
        viewSet.page = page;

        this._view.update(viewSet, page);
    },

    /**
     * Pagelist click event hadnler
     * @param {JQueryEvent} event
     * @private
     */
    _onClickPageList: function(event) {

        event.preventDefault();
        var page = null,
            targetElement = $(event.target),
            targetPage;

        if (this._view.isIn(targetElement, this.getOption('$pre_endOn'))) {
            page = 1;
        } else if (this._view.isIn(targetElement, this.getOption('$lastOn'))) {
            page = this._getLastPage();
        } else if (this._view.isIn(targetElement, this.getOption('$preOn'))) {
            page = this._getRelativePage('pre');
        } else if (this._view.isIn(targetElement, this.getOption('$nextOn'))) {
            page = this._getRelativePage('next');
        } else {

            targetPage = this._view.getPageElement(targetElement);

            if (targetPage && targetPage.length) {
                page = parseInt(targetPage.text(), 10);
            } else {
                return;
            }
        }

        /**
         Fire 'click' custom event when page button clicked
         @param {componentEvent} eventData
         @param {String} eventData.eventType Custom event name
         @param {Number} eventData.page Page to move
         @param {Function} eventData.stop Stop page move
         **/

        var isFired = this.invoke("click", {"page" : page});
        if (!isFired) {
            return;
        }

        this.movePageTo(page);
    }
});
// CustomEvent  Mixin
ne.util.CustomEvents.mixin(Pagination);

module.exports = Pagination;