(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
tui.util.defineNamespace('tui.component.Pagination', require('./src/js/pagination.js'));

},{"./src/js/pagination.js":2}],2:[function(require,module,exports){
/**
 * @fileoverview Core of pagination component, create pagination view and attach events.
 * (from pug.Pagination)
 * @author NHN entertainment FE dev team(dl_javascript@nhnent.com)
 * @dependency jquery-1.8.3.min.js, code-snippet.js
 */

var View = require('./view.js');

/**
 * Pagination core class
 * @constructor Pagination
 *
 */
var Pagination = tui.util.defineClass(/**@lends Pagination.prototype */{
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


        if (options.itemCount === 0) {
            /**
             * Option object
             * @type {Object}
             * @private
             */
            this._options = defaultOption;
        } else {
            this._options = tui.util.extend(defaultOption, options);
        }

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
        this._view.attachEvent('click', tui.util.bind(this._onClickPageList, this));

        this.movePageTo(this.getOption('page'), false);
    },

    /**
     * Reset pagination
     * @api
     * @param {*} itemCount Redraw page item count
     * @example
     *  pagination.reset();
     */
    reset: function(itemCount) {

        var isExist = tui.util.isExisty((itemCount !== null) && (itemCount !== undefined));

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
     */
    getOption: function(optionKey) {
        return this._options[optionKey];
    },

    /**
     * Move to specific page, redraw list.
     * Befor move fire beforeMove event, After move fire afterMove event.
     * @api
     * @param {Number} targetPage Target page
     * @param {Boolean} isNotRunCustomEvent [isNotRunCustomEvent=true] Whether custom event fire or not
     * @example
     *  pagination.reset();
     */
    movePageTo: function(targetPage, isNotRunCustomEvent) {

        targetPage = this._convertToAvailPage(targetPage);
        this._currentPage = targetPage;

        if (!isNotRunCustomEvent) {
            /**
             * Fire 'beforeMove' event(CustomEvent)
             * @api
             * @event Pagination#beforeMove
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
             * @api
             * @event Pagination#afterMove
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
tui.util.CustomEvents.mixin(Pagination);

module.exports = Pagination;

},{"./view.js":3}],3:[function(require,module,exports){
/**
 * @fileoverview Pagination view manage all of draw elements
 * (from pug.Pagination)
 * @author NHN entertainment FE dev team Jein Yi(jein.yi@nhnent.com)
 * @dependency pagination.js
 */
/**
 * @constructor View
 * @param {Object} options Option object
 * @param {Object} $element Container element
 *
 */
var View = tui.util.defineClass(/** @lends View.prototype */{
    init: function(options, $element) {
        /**
         * Pagination root element
         * @type {jQueryObject}
         * @private
         */
        this._element = $element;

        /**
         * Pagination options
         * @type {Object}
         * @private
         */
        this._options = options;

        /**
         * Selectors
         * @type {Object}
         * @private
         */
        this._elementSelector = {};

        /**
         * Page item list
         * @type {Array}
         * @private
         */
        this._pageItemList = [];

        tui.util.extend(options, {
            $pre_endOn: options['$pre_endOn'] || $('a.' + this._wrapPrefix('pre_end'), this._element),
            $preOn: options['$preOn'] || $('a.' + this._wrapPrefix('pre'), this._element),
            $nextOn: options['$nextOn'] || $('a.' + this._wrapPrefix('next'), this._element),
            $lastOn: options['$lastOn'] || $('a.' + this._wrapPrefix('next_end'), this._element),
            $pre_endOff: options['$pre_endOff'] || $('span.' + this._wrapPrefix('pre_end'), this._element),
            $preOff: options['$preOff'] || $('span.' + this._wrapPrefix('pre'), this._element),
            $nextOff: options['$nextOff'] || $('span.' + this._wrapPrefix('next'), this._element),
            $lastOff: options['$lastOff'] || $('span.' + this._wrapPrefix('next_end'), this._element)
        });
        this._element.addClass(this._wrapPrefix('loaded'));
    },

    /**
     * Update view
     * @param {Object} viewSet Values of each pagination view components
     */
    update: function(viewSet) {
        this._addTextNode();
        this._setPageResult(viewSet.lastPage);

        var options = this._options,
            edges = this._getEdge(viewSet),
            leftPageNumber = edges.left,
            rightPageNumber = edges.right;

        viewSet.leftPageNumber = leftPageNumber;
        viewSet.rightPageNumber = rightPageNumber;

        if (options.moveUnit === 'page') {
            viewSet.currentPageIndex = viewSet.page;
            viewSet.lastPageListIndex = viewSet.lastPage;
        }

        this._setFirst(viewSet);
        this._setPrev(viewSet);
        this._setPageNumbers(viewSet);
        this._setNext(viewSet);
        this._setLast(viewSet);
    },

    /**
     * Check include
     * @param {JQueryObject} $find Target element
     * @param {JQueryObject} $parent Wrapper element
     * @returns {boolean}
     */
    isIn: function($find, $parent) {
        if (!$parent) {
            return false;
        }
        return ($find[0] === $parent[0]) ? true : $.contains($parent, $find);
    },

    /**
     * Get base(root) element
     * @returns {JQueryObject}
     */
    getBaseElement: function() {
        return this.getElement();
    },

    /**
     * Reset base element
     */
    empty: function(){

        var options = this._options,
            $pre_endOn = options.$pre_endOn,
            $preOn = options.$preOn,
            $nextOn = options.$nextOn,
            $lastOn = options.$lastOn,
            $pre_endOff = options.$pre_endOff,
            $preOff = options.$preOff,
            $nextOff = options.$nextOff,
            $lastOff = options.$lastOff;

        options.$pre_endOn = this._clone($pre_endOn);
        options.$preOn = this._clone($preOn);
        options.$lastOn = this._clone($lastOn);
        options.$nextOn = this._clone($nextOn);
        options.$pre_endOff = this._clone($pre_endOff);
        options.$preOff = this._clone($preOff);
        options.$lastOff = this._clone($lastOff);
        options.$nextOff = this._clone($nextOff);

        this._pageItemList = [];

        this._element.empty();
    },

    /**
     * Find target element from page elements
     * @param {jQueryObject|HTMLElement} el Target element
     * @return {jQueryObject}
     */
    getPageElement: function(el) {

        var i,
            length,
            pickedItem;

        for (i = 0, length = this._pageItemList.length; i < length; i++) {
            pickedItem = this._pageItemList[i];
            if (this.isIn(el, pickedItem)) {
                return pickedItem;
            }
        }
        return null;
    },

    /**
     * Attach Events
     * @param {String} eventType Event name to attach
     * @param {Function} callback Callback function
     */
    attachEvent: function(eventType, callback) {

        var targetElement = this._element,
            isSavedElement = tui.util.isString(targetElement) && this._elementSelector[targetElement];

        if (isSavedElement) {
            targetElement = this._getElement(targetElement, true);
        }

        if (targetElement && eventType && callback) {
            $(targetElement).bind(eventType, null, callback);
        }
    },

    /**
     * Get root element
     * @returns {jQueryObject}
     */
    getElement: function() {
        return this._element;
    },

    /**
     * Return className added prefix
     * @param {String} className Class name to be wrapping
     * @returns {*}
     * @private
     */
    _wrapPrefix: function(className) {
        var classPrefix = this._options['classPrefix'];
        return classPrefix ? classPrefix + className.replace(/_/g, '-') : className;
    },

    /**
     * Put insertTextNode between page items
     * @private
     */
    _addTextNode: function() {
        var textNode = this._options['insertTextNode'];
        this._element.append(document.createTextNode(textNode));
    },

    /**
     * Clone element
     * @returns {*}
     * @private
     */
    _clone: function($link) {

        if ($link && $link.length && $link.get(0).cloneNode) {
            return $($link.get(0).cloneNode(true));
        }
        return $link;

    },

    /**
     * Wrapping class by page result
     * @param {Number} lastNum Last page number
     * @private
     */
    _setPageResult: function(lastNum) {

        if (lastNum === 0) {
            this._element.addClass(this._wrapPrefix('no-result'));
        } else if (lastNum === 1) {
            this._element.addClass(this._wrapPrefix('only-one')).removeClass(this._wrapPrefix('no-result'));
        } else {
            this._element.removeClass(this._wrapPrefix('only-one')).removeClass(this._wrapPrefix('no-result'));
        }

    },

    /**
     * Get each edge page
     * @param {object} viewSet Pagination view elements set
     * @returns {{left: *, right: *}}
     * @private
     */
    _getEdge: function(viewSet) {

        var options = this._options,
            leftPageNumber,
            rightPageNumber,
            left;

        if (options.isCenterAlign) {

            left = Math.floor(options.pagePerPageList / 2);
            leftPageNumber = viewSet.page - left;
            leftPageNumber = Math.max(leftPageNumber, 1);
            rightPageNumber = leftPageNumber + options.pagePerPageList - 1;

            if (rightPageNumber > viewSet.lastPage) {
                leftPageNumber = viewSet.lastPage - options.pagePerPageList + 1;
                leftPageNumber = Math.max(leftPageNumber, 1);
                rightPageNumber = viewSet.lastPage;
            }

        } else {

            leftPageNumber = (viewSet.currentPageIndex - 1) * options.pagePerPageList + 1;
            rightPageNumber = (viewSet.currentPageIndex) * options.pagePerPageList;
            rightPageNumber = Math.min(rightPageNumber, viewSet.lastPage);

        }

        return {
            left: leftPageNumber,
            right: rightPageNumber
        };
    },

    /**
     * Decide to show first page link by whether first page or not
     * @param {object} viewSet Pagination view elements set
     * @private
     */
    _setFirst: function(viewSet) {
        var options = this._options;
        if (viewSet.page > 1) {
            if (options.$pre_endOn) {
                this._element.append(options.$pre_endOn);
                this._addTextNode();
            }
        } else {
            if (options.$pre_endOff) {
                this._element.append(options.$pre_endOff);
                this._addTextNode();
            }
        }

    },

    /**
     * Decide to show previous page link by whether first page or not
     * @param {object} viewSet Pagination view elements set
     * @private
     */
    _setPrev: function(viewSet) {
        var options = this._options;

        if (viewSet.currentPageIndex > 1) {
            if (options.$preOn) {
                this._element.append(options.$preOn);
                this._addTextNode();
            }
        } else {
            if (options.$preOff) {
                this._element.append(options.$preOff);
                this._addTextNode();
            }
        }
    },
    /**
     * Decide to show next page link by whether first page or not
     * @param {object} viewSet Pagination view elements set
     * @private
     */
    _setNext: function(viewSet) {
        var options = this._options;

        if (viewSet.currentPageIndex < viewSet.lastPageListIndex) {
            if (options.$nextOn) {
                this._element.append(options.$nextOn);
                this._addTextNode();
            }
        } else {
            if (options.$nextOff) {
                this._element.append(options.$nextOff);
                this._addTextNode();
            }
        }

    },
    /**
     * Decide to show last page link by whether first page or not
     * @param {object} viewSet Pagination view elements set
     * @private
     */
    _setLast: function(viewSet) {

        var options = this._options;

        if (viewSet.page < viewSet.lastPage) {
            if (options.$lastOn) {
                this._element.append(options.$lastOn);
                this._addTextNode();
            }
        } else {
            if (options.$lastOff) {
                this._element.append(options.$lastOff);
                this._addTextNode();
            }
        }

    },
    /**
     * Set page number that will be drawn
     * @param {object} viewSet Pagination view elements set
     * @private
     */
    _setPageNumbers: function(viewSet) {
        var $pageItem,
            firstPage = viewSet.leftPageNumber,
            lastPage = viewSet.rightPageNumber,
            options = this._options,
            i;

        for (i = firstPage; i <= lastPage; i++) {
            if (i === viewSet.page) {
                $pageItem = $(options.currentPageTemplate.replace('{=page}', i.toString()));
            } else {
                $pageItem = $(options.pageTemplate.replace('{=page}', i.toString()));
                this._pageItemList.push($pageItem);
            }

            if (i === firstPage) {
                $pageItem.addClass(this._wrapPrefix(options['firstItemClassName']));
            }
            if (i === lastPage) {
                $pageItem.addClass(this._wrapPrefix(options['lastItemClassName']));
            }
            this._element.append($pageItem);
            this._addTextNode();
        }
    }
});

module.exports = View;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9qcy9wYWdpbmF0aW9uLmpzIiwic3JjL2pzL3ZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDalZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidHVpLnV0aWwuZGVmaW5lTmFtZXNwYWNlKCd0dWkuY29tcG9uZW50LlBhZ2luYXRpb24nLCByZXF1aXJlKCcuL3NyYy9qcy9wYWdpbmF0aW9uLmpzJykpO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IENvcmUgb2YgcGFnaW5hdGlvbiBjb21wb25lbnQsIGNyZWF0ZSBwYWdpbmF0aW9uIHZpZXcgYW5kIGF0dGFjaCBldmVudHMuXG4gKiAoZnJvbSBwdWcuUGFnaW5hdGlvbilcbiAqIEBhdXRob3IgTkhOIGVudGVydGFpbm1lbnQgRkUgZGV2IHRlYW0oZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tKVxuICogQGRlcGVuZGVuY3kganF1ZXJ5LTEuOC4zLm1pbi5qcywgY29kZS1zbmlwcGV0LmpzXG4gKi9cblxudmFyIFZpZXcgPSByZXF1aXJlKCcuL3ZpZXcuanMnKTtcblxuLyoqXG4gKiBQYWdpbmF0aW9uIGNvcmUgY2xhc3NcbiAqIEBjb25zdHJ1Y3RvciBQYWdpbmF0aW9uXG4gKlxuICovXG52YXIgUGFnaW5hdGlvbiA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKkBsZW5kcyBQYWdpbmF0aW9uLnByb3RvdHlwZSAqL3tcbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplXG4gICAgICogQHBhcmFtIHtEYXRhT2JqZWN0fSBvcHRpb25zIE9wdGlvbiBvYmplY3RcbiAgICAgKiBcdFx0QHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLml0ZW1Db3VudD0xMF0gVG90YWwgaXRlbSBjb3VudFxuICAgICAqIFx0XHRAcGFyYW0ge051bWJlcn0gW29wdGlvbnMuaXRlbVBlclBhZ2U9MTBdIEl0ZW0gY291bnQgcGVyIHBhZ2VcbiAgICAgKiBcdFx0QHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLnBhZ2VQZXJQYWdlTGlzdD0xMF0gRGlzcGxheSBwYWdlIGxpbmsgY291bnRcbiAgICAgKiBcdFx0QHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLnBhZ2U9MV0gcGFnZSBEaXNwbGF5IHBhZ2UgYWZ0ZXIgcGFnaW5hdGlvbiBkcmF3LlxuICAgICAqIFx0XHRAcGFyYW0ge1N0cmluZ30gW29wdGlvbnMubW92ZVVuaXQ9XCJwYWdlbGlzdFwiXSBQYWdlIG1vdmUgdW5pdC5cbiAgICAgKiBcdFx0XHQ8dWw+XG4gICAgICogXHRcdFx0XHQ8bGk+cGFnZWxpc3QgOiBNb3ZlIHBhZ2UgZm9yIHVuaXQ8L2xpPlxuICAgICAqIFx0XHRcdFx0PGxpPnBhZ2UgOiBNb3ZlIG9uZSBwYWdlPC9saT5cbiAgICAgKiBcdFx0XHQ8L3VsPlxuICAgICAqIFx0XHRAcGFyYW0ge0Jvb2xlYW59W29wdGlvbnMuaXNDZW50ZXJBbGlnbj1mYWxzZV0gV2hldGhlciBjdXJyZW50IHBhZ2Uga2VlcCBjZW50ZXIgb3Igbm90XG4gICAgICogXHRcdEBwYXJhbSB7U3RyaW5nfSBbb3B0aW9ucy5pbnNlcnRUZXh0Tm9kZT1cIlwiXSBUaGUgY291cGxlciBiZXR3ZWVuIHBhZ2UgbGlua3NcbiAgICAgKiBcdFx0QHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLmNsYXNzUHJlZml4PVwiXCJdIEEgcHJlZml4IG9mIGNsYXNzIG5hbWVcbiAgICAgKiBcdFx0QHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLmZpcnN0SXRlbUNsYXNzTmFtZT1cImZpcnN0LWNoaWxkXCJdIFRoZSBjbGFzcyBuYW1lIGlzIGdyYW50ZWQgZmlyc3QgcGFnZSBsaW5rIGl0ZW1cbiAgICAgKiBcdFx0QHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLmxhc3RJdGVtQ2xhc3NOYW1lPVwibGFzdC1jaGlsZFwiXSBUaGUgY2xhc3MgbmFtZSBpcyBncmFudGVkIGZpcnN0IHBhZ2UgbGluayBpdGVtXG4gICAgICogXHRcdEBwYXJhbSB7U3RyaW5nfSBbb3B0aW9ucy5wYWdlVGVtcGxhdGU9XCI8YSBocmVmPScjJz57PXBhZ2V9PC9hPlwiXSBUaGUgbWFya3VwIHRlbXBsYXRlIHRvIHNob3cgcGFnZSBpdGVtIHN1Y2ggYXMgMSwgMiwgMywgLi4gez1wYWdlfSB3aWxsIGJlIGNoYW5nZWQgZWFjaCBwYWdlIG51bWJlci5cbiAgICAgKiBcdFx0QHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLmN1cnJlbnRQYWdlVGVtcGxhdGU9XCI8c3Ryb25nPns9cGFnZX08L3N0cm9uZz5cIl0gVGhlIG1hcmt1cCB0ZW1wbGF0ZSBmb3IgY3VycmVudCBwYWdlIHs9cGFnZX0gd2lsbCBiZSBjaGFuZ2VkIGN1cnJlbnQgcGFnZSBudW1iZXIuXG4gICAgICogXHRcdEBwYXJhbSB7alF1ZXJ5T2JqZWN0fSBbb3B0aW9ucy4kcHJlX2VuZE9uXSBUaGUgYnV0dG9uIGVsZW1lbnQgdG8gbW92ZSBmaXJzdCBwYWdlLiBJZiB0aGlzIG9wdGlvbiBpcyBub3QgZXhpc3QgYW5kIHRoZSBlbGVtZW50IHRoYXQgaGFzIGNsYXNzICdwcmVfZW5kJywgY29tcG9uZW50IGRvIG5vdCBjcmVhdGUgdGhpcyBidXR0b24uXG4gICAgICogXHRcdEBwYXJhbSB7alF1ZXJ5T2JqZWN0fSBbb3B0aW9ucy4kcHJlT25dIFRoZSBidXR0b24gZWxlbWVudCB0byBtb3ZlIHByZXZpb3VzZSBwYWdlLiBJZiB0aGlzIG9wdGlvbiBpcyBub3QgZXhpc3QgYW5kIHRoZSBlbGVtZW50IHRoYXQgaGFzIGNsYXNzICdwcmUnLCBjb21wb25lbnQgZG8gbm90IGNyZWF0ZSB0aGlzIGJ1dHRvbi5cbiAgICAgKiBcdFx0QHBhcmFtIHtqUXVlcnlPYmplY3R9IFtvcHRpb25zLiRuZXh0T25dIFRoZSBidXR0b24gZWxlbWVudCB0byBtb3ZlIG5leHQgcGFnZS4gSWYgdGhpcyBvcHRpb24gaXMgbm90IGV4aXN0IGFuZCB0aGUgZWxlbWVudCB0aGF0IGhhcyBjbGFzcyAnbmV4dCcsIGNvbXBvbmVudCBkbyBub3QgY3JlYXRlIHRoaXMgYnV0dG9uLlxuICAgICAqIFx0XHRAcGFyYW0ge2pRdWVyeU9iamVjdH0gW29wdGlvbnMuJGxhc3RPbl0gVGhlIGJ1dHRvbiBlbGVtZW50IHRvIG1vdmUgbGFzdCBwYWdlLiBJZiB0aGlzIG9wdGlvbiBpcyBub3QgZXhpc3QgYW5kIHRoZSBlbGVtZW50IHRoYXQgaGFzIGNsYXNzICdsYXN0JywgY29tcG9uZW50IGRvIG5vdCBjcmVhdGUgdGhpcyBidXR0b24uXG4gICAgICogXHRcdEBwYXJhbSB7alF1ZXJ5T2JqZWN0fSBbb3B0aW9ucy4kcHJlX2VuZE9mZl0gVGhlIGVsZW1lbnQgdG8gc2hvdyB0aGF0IHByZV9lbmRPbiBidXR0b24gaXMgbm90IGVuYWJsZS4gSWYgdGhpcyBvcHRpb24gaXMgbm90IGV4aXN0IGFuZCB0aGUgZWxlbWVudCB0aGF0IGhhcyBjbGFzcyAncHJlX2VuZE9mZicsIGNvbXBvbmVudCBkbyBub3QgY3JlYXRlIHRoaXMgYnV0dG9uLlxuICAgICAqIFx0XHRAcGFyYW0ge2pRdWVyeU9iamVjdH0gW29wdGlvbnMuJHByZU9mZl0gVGhlIGVsZW1lbnQgdG8gc2hvdyB0aGF0IHByZU9uIGJ1dHRvbiBpcyBub3QgZW5hYmxlLiBJZiB0aGlzIG9wdGlvbiBpcyBub3QgZXhpc3QgYW5kIHRoZSBlbGVtZW50IHRoYXQgaGFzIGNsYXNzICdwcmVPZmYnLCBjb21wb25lbnQgZG8gbm90IGNyZWF0ZSB0aGlzIGJ1dHRvbi5cbiAgICAgKiBcdFx0QHBhcmFtIHtqUXVlcnlPYmplY3R9IFtvcHRpb25zLiRuZXh0T2ZmXSBUaGUgZWxlbWVudCB0byBzaG93IHRoYXQgbmV4dE9uIGJ1dHRvbiBpcyBub3QgZW5hYmxlLiBJZiB0aGlzIG9wdGlvbiBpcyBub3QgZXhpc3QgYW5kIHRoZSBlbGVtZW50IHRoYXQgaGFzIGNsYXNzICduZXh0T2ZmJywgY29tcG9uZW50IGRvIG5vdCBjcmVhdGUgdGhpcyBidXR0b24uXG4gICAgICogXHRcdEBwYXJhbSB7alF1ZXJ5T2JqZWN0fSBbb3B0aW9ucy4kbGFzdE9mZl0gVGhlIGVsZW1lbnQgdG8gc2hvdyB0aGF0IGxhc3RPbiBidXR0b24gaXMgbm90IGVuYWJsZS4gSWYgdGhpcyBvcHRpb24gaXMgbm90IGV4aXN0IGFuZCB0aGUgZWxlbWVudCB0aGF0IGhhcyBjbGFzcyAnbGFzdE9mZicsIGNvbXBvbmVudCBkbyBub3QgY3JlYXRlIHRoaXMgYnV0dG9uLlxuICAgICAqIEBwYXJhbSB7alF1ZXJ5T2JqZWN0fSAkZWxlbWVudCBQYWdpbmF0aW9uIGNvbnRhaW5lclxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbnMsICRlbGVtZW50KSB7XG4gICAgICAgIHZhciBkZWZhdWx0T3B0aW9uID0ge1xuICAgICAgICAgICAgaXRlbUNvdW50OiAxMCxcbiAgICAgICAgICAgIGl0ZW1QZXJQYWdlOiAxMCxcbiAgICAgICAgICAgIHBhZ2VQZXJQYWdlTGlzdDogMTAsXG4gICAgICAgICAgICBwYWdlOiAxLFxuICAgICAgICAgICAgbW92ZVVuaXQ6ICdwYWdlbGlzdCcsXG4gICAgICAgICAgICBpc0NlbnRlckFsaWduOiBmYWxzZSxcbiAgICAgICAgICAgIGluc2VydFRleHROb2RlOiAnJyxcbiAgICAgICAgICAgIGNsYXNzUHJlZml4OiAnJyxcbiAgICAgICAgICAgIGZpcnN0SXRlbUNsYXNzTmFtZTogJ2ZpcnN0LWNoaWxkJyxcbiAgICAgICAgICAgIGxhc3RJdGVtQ2xhc3NOYW1lOiAnbGFzdC1jaGlsZCcsXG4gICAgICAgICAgICBwYWdlVGVtcGxhdGU6ICc8YSBocmVmPVwiI1wiPns9cGFnZX08L2E+JyxcbiAgICAgICAgICAgIGN1cnJlbnRQYWdlVGVtcGxhdGU6ICc8c3Ryb25nPns9cGFnZX08L3N0cm9uZz4nXG4gICAgICAgIH07XG5cblxuICAgICAgICBpZiAob3B0aW9ucy5pdGVtQ291bnQgPT09IDApIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogT3B0aW9uIG9iamVjdFxuICAgICAgICAgICAgICogQHR5cGUge09iamVjdH1cbiAgICAgICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMuX29wdGlvbnMgPSBkZWZhdWx0T3B0aW9uO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fb3B0aW9ucyA9IHR1aS51dGlsLmV4dGVuZChkZWZhdWx0T3B0aW9uLCBvcHRpb25zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBFdmVudCBoYW5kbGVyIHNhdm9yXG4gICAgICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogdmlldyBpbnN0YW5jZVxuICAgICAgICAgKiBAdHlwZSB7UGFnaW5hdGlvblZpZXd9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl92aWV3ID0gbmV3IFZpZXcodGhpcy5fb3B0aW9ucywgJGVsZW1lbnQpO1xuICAgICAgICB0aGlzLl92aWV3LmF0dGFjaEV2ZW50KCdjbGljaycsIHR1aS51dGlsLmJpbmQodGhpcy5fb25DbGlja1BhZ2VMaXN0LCB0aGlzKSk7XG5cbiAgICAgICAgdGhpcy5tb3ZlUGFnZVRvKHRoaXMuZ2V0T3B0aW9uKCdwYWdlJyksIGZhbHNlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVzZXQgcGFnaW5hdGlvblxuICAgICAqIEBhcGlcbiAgICAgKiBAcGFyYW0geyp9IGl0ZW1Db3VudCBSZWRyYXcgcGFnZSBpdGVtIGNvdW50XG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAgcGFnaW5hdGlvbi5yZXNldCgpO1xuICAgICAqL1xuICAgIHJlc2V0OiBmdW5jdGlvbihpdGVtQ291bnQpIHtcblxuICAgICAgICB2YXIgaXNFeGlzdCA9IHR1aS51dGlsLmlzRXhpc3R5KChpdGVtQ291bnQgIT09IG51bGwpICYmIChpdGVtQ291bnQgIT09IHVuZGVmaW5lZCkpO1xuXG4gICAgICAgIGlmICghaXNFeGlzdCkge1xuICAgICAgICAgICAgaXRlbUNvdW50ID0gdGhpcy5nZXRPcHRpb24oJ2l0ZW1Db3VudCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRPcHRpb24oJ2l0ZW1Db3VudCcsIGl0ZW1Db3VudCk7XG4gICAgICAgIHRoaXMubW92ZVBhZ2VUbygxLCBmYWxzZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBvcHRpb25zXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbktleSBPcHRpb24ga2V5XG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgKi9cbiAgICBnZXRPcHRpb246IGZ1bmN0aW9uKG9wdGlvbktleSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fb3B0aW9uc1tvcHRpb25LZXldO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBNb3ZlIHRvIHNwZWNpZmljIHBhZ2UsIHJlZHJhdyBsaXN0LlxuICAgICAqIEJlZm9yIG1vdmUgZmlyZSBiZWZvcmVNb3ZlIGV2ZW50LCBBZnRlciBtb3ZlIGZpcmUgYWZ0ZXJNb3ZlIGV2ZW50LlxuICAgICAqIEBhcGlcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gdGFyZ2V0UGFnZSBUYXJnZXQgcGFnZVxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNOb3RSdW5DdXN0b21FdmVudCBbaXNOb3RSdW5DdXN0b21FdmVudD10cnVlXSBXaGV0aGVyIGN1c3RvbSBldmVudCBmaXJlIG9yIG5vdFxuICAgICAqIEBleGFtcGxlXG4gICAgICogIHBhZ2luYXRpb24ucmVzZXQoKTtcbiAgICAgKi9cbiAgICBtb3ZlUGFnZVRvOiBmdW5jdGlvbih0YXJnZXRQYWdlLCBpc05vdFJ1bkN1c3RvbUV2ZW50KSB7XG5cbiAgICAgICAgdGFyZ2V0UGFnZSA9IHRoaXMuX2NvbnZlcnRUb0F2YWlsUGFnZSh0YXJnZXRQYWdlKTtcbiAgICAgICAgdGhpcy5fY3VycmVudFBhZ2UgPSB0YXJnZXRQYWdlO1xuXG4gICAgICAgIGlmICghaXNOb3RSdW5DdXN0b21FdmVudCkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBGaXJlICdiZWZvcmVNb3ZlJyBldmVudChDdXN0b21FdmVudClcbiAgICAgICAgICAgICAqIEBhcGlcbiAgICAgICAgICAgICAqIEBldmVudCBQYWdpbmF0aW9uI2JlZm9yZU1vdmVcbiAgICAgICAgICAgICAqIEBwYXJhbSB7Y29tcG9uZW50RXZlbnR9IGV2ZW50RGF0YVxuICAgICAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50RGF0YS5ldmVudFR5cGUgQ3VzdG9tIGV2ZW50IG5hbWVcbiAgICAgICAgICAgICAqIEBwYXJhbSB7TnVtYmVyfSBldmVudERhdGEucGFnZSBUYXJnZXQgcGFnZVxuICAgICAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZXZlbnREYXRhLnN0b3AgU3RvcCBtb3ZlIHNwZWNpZmljIHBhZ2VcbiAgICAgICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAgICAgKiBwYWdhbmF0aW9uLm9uKFwiYmVmb3JlTW92ZVwiLCBmdW5jdGlvbihldmVudERhdGEpIHtcbiAgICAgICAgICAgICAgICB2YXIgY3VycmVudFBhZ2UgPSBldmVudERhdGEucGFnZTtcbiAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAqL1xuXG4gICAgICAgICAgICBpZiAoIXRoaXMuaW52b2tlKCdiZWZvcmVNb3ZlJywgeyBwYWdlOiB0YXJnZXRQYWdlIH0pKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fcGFnaW5hdGUodGFyZ2V0UGFnZSk7XG5cbiAgICAgICAgaWYgKGlzTm90UnVuQ3VzdG9tRXZlbnQpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogRmlyZSAnYWZ0ZXJNb3ZlJ1xuICAgICAgICAgICAgICogQGFwaVxuICAgICAgICAgICAgICogQGV2ZW50IFBhZ2luYXRpb24jYWZ0ZXJNb3ZlXG4gICAgICAgICAgICAgKiBAcGFyYW0ge2NvbXBvbmVudEV2ZW50fSBldmVudERhdGFcbiAgICAgICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudERhdGEuZXZlbnRUeXBlIEN1c3RvbSBldmVudCBuYW1lXG4gICAgICAgICAgICAgKiBAcGFyYW0ge051bWJlcn0gZXZlbnREYXRhLnBhZ2UgTW92ZWQgcGFnZVxuICAgICAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICAgICAqIHBhZ2FuYXRpb24ub24oXCJiZWZvcmVNb3ZlXCIsIGZ1bmN0aW9uKGV2ZW50RGF0YSkge1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRQYWdlID0gZXZlbnREYXRhLnBhZ2U7XG4gICAgICAgICB9KTtcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5maXJlKCdhZnRlck1vdmUnLCB7IHBhZ2U6IHRhcmdldFBhZ2UgfSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hhbmdlIG9wdGlvbiB2YWx1ZVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBvcHRpb25LZXkgVGhlIHRhcmdldCBvcHRpb24ga2V5XG4gICAgICogQHBhcmFtIHsqfSBvcHRpb25WYWx1ZSBUaGUgdGFyZ2V0IG9wdGlvbiB2YWx1ZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgc2V0T3B0aW9uOiBmdW5jdGlvbihvcHRpb25LZXksIG9wdGlvblZhbHVlKSB7XG4gICAgICAgIHRoaXMuX29wdGlvbnNbb3B0aW9uS2V5XSA9IG9wdGlvblZhbHVlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgY3VycmVudCBwYWdlXG4gICAgICogQHJldHVybnMge051bWJlcn0gQ3VycmVudCBwYWdlXG4gICAgICovXG4gICAgZ2V0Q3VycmVudFBhZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY3VycmVudFBhZ2UgfHwgdGhpcy5fb3B0aW9uc1sncGFnZSddO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgaXRlbSAgaW5kZXggZnJvbSBsaXN0XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHBhZ2VOdW1iZXIgUGFnZSBudW1iZXJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgICAqL1xuICAgIGdldEluZGV4T2ZGaXJzdEl0ZW06IGZ1bmN0aW9uKHBhZ2VOdW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0T3B0aW9uKCdpdGVtUGVyUGFnZScpICogKHBhZ2VOdW1iZXIgLSAxKSArIDE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBMYXN0IHBhZ2UgbnVtYmVyXG4gICAgICogQHJldHVybnMge251bWJlcn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRMYXN0UGFnZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBNYXRoLmNlaWwodGhpcy5nZXRPcHRpb24oJ2l0ZW1Db3VudCcpIC8gdGhpcy5nZXRPcHRpb24oJ2l0ZW1QZXJQYWdlJykpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbmRleCBvZiBsaXN0IGluIHRvdGFsIGxpc3RzXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHBhZ2VOdW1iZXIgUGFnZSBudW1iZXJcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0UGFnZUluZGV4OiBmdW5jdGlvbihwYWdlTnVtYmVyKSB7XG4gICAgICAgIC8vIElzQ2VudGVyQWxpZ24gPT0gdHJ1ZSBjYXNlXG4gICAgICAgIGlmICh0aGlzLmdldE9wdGlvbignaXNDZW50ZXJBbGlnbicpKSB7XG4gICAgICAgICAgICB2YXIgbGVmdCA9IE1hdGguZmxvb3IodGhpcy5nZXRPcHRpb24oJ3BhZ2VQZXJQYWdlTGlzdCcpIC8gMiksXG4gICAgICAgICAgICAgICAgcGFnZUluZGV4ID0gcGFnZU51bWJlciAtIGxlZnQ7XG4gICAgICAgICAgICBwYWdlSW5kZXggPSBNYXRoLm1heChwYWdlSW5kZXgsIDEpO1xuICAgICAgICAgICAgcGFnZUluZGV4ID0gTWF0aC5taW4ocGFnZUluZGV4LCB0aGlzLl9nZXRMYXN0UGFnZSgpIC0gdGhpcy5nZXRPcHRpb24oJ3BhZ2VQZXJQYWdlTGlzdCcpICsgMSk7XG4gICAgICAgICAgICByZXR1cm4gcGFnZUluZGV4O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBNYXRoLmNlaWwocGFnZU51bWJlciAvIHRoaXMuZ2V0T3B0aW9uKFwicGFnZVBlclBhZ2VMaXN0XCIpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHBhZ2UgbnVtYmVyIG9mIHByZXYsIG5leHQgcGFnZXNcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcmVsYXRpdmVOYW1lIERpcmVjdGlvbnMocHJlX2VuZCwgbmV4dF9lbmQsIHByZSwgbmV4dClcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAgICogQHByaXZhdGVcbiAgICAgKiAgICAgKi9cbiAgICBfZ2V0UmVsYXRpdmVQYWdlOiBmdW5jdGlvbihyZWxhdGl2ZU5hbWUpIHtcbiAgICAgICAgdmFyIHBhZ2UgPSBudWxsLFxuICAgICAgICAgICAgaXNNb3ZlUGFnZSA9IHRoaXMuZ2V0T3B0aW9uKCdtb3ZlVW5pdCcpID09PSAncGFnZScsXG4gICAgICAgICAgICBjdXJyZW50UGFnZUluZGV4ID0gdGhpcy5fZ2V0UGFnZUluZGV4KHRoaXMuZ2V0Q3VycmVudFBhZ2UoKSk7XG4gICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdpc0NlbnRlckFsaWduJykpIHtcbiAgICAgICAgICAgIGlmIChyZWxhdGl2ZU5hbWUgPT09ICdwcmUnKSB7XG4gICAgICAgICAgICAgICAgcGFnZSA9IGlzTW92ZVBhZ2UgPyB0aGlzLmdldEN1cnJlbnRQYWdlKCkgLSAxIDogY3VycmVudFBhZ2VJbmRleCAtIDE7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBhZ2UgPSBpc01vdmVQYWdlID8gdGhpcy5nZXRDdXJyZW50UGFnZSgpICsgMSA6IGN1cnJlbnRQYWdlSW5kZXggKyB0aGlzLmdldE9wdGlvbigncGFnZVBlclBhZ2VMaXN0Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAocmVsYXRpdmVOYW1lID09PSAncHJlJykge1xuICAgICAgICAgICAgICAgIHBhZ2UgPSBpc01vdmVQYWdlID8gdGhpcy5nZXRDdXJyZW50UGFnZSgpIC0gMSA6IChjdXJyZW50UGFnZUluZGV4IC0gMSkgKiB0aGlzLmdldE9wdGlvbigncGFnZVBlclBhZ2VMaXN0Jyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBhZ2UgPSBpc01vdmVQYWdlID8gdGhpcy5nZXRDdXJyZW50UGFnZSgpICsgMSA6IGN1cnJlbnRQYWdlSW5kZXggKiB0aGlzLmdldE9wdGlvbigncGFnZVBlclBhZ2VMaXN0JykgKyAxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYWdlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgYXZhaWwgcGFnZSBudW1iZXIgZnJvbSBvdmVyIG51bWJlclxuICAgICAqIElmIHRvdGFsIHBhZ2UgaXMgMjMsIGJ1dCBpbnB1dCBudW1iZXIgaXMgMzAgPT4gcmV0dXJuIDIzXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHBhZ2UgUGFnZSBudW1iZXJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NvbnZlcnRUb0F2YWlsUGFnZTogZnVuY3Rpb24ocGFnZSkge1xuICAgICAgICB2YXIgbGFzdFBhZ2VOdW1iZXIgPSB0aGlzLl9nZXRMYXN0UGFnZSgpO1xuICAgICAgICBwYWdlID0gTWF0aC5tYXgocGFnZSwgMSk7XG4gICAgICAgIHBhZ2UgPSBNYXRoLm1pbihwYWdlLCBsYXN0UGFnZU51bWJlcik7XG4gICAgICAgIHJldHVybiBwYWdlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgcmVxdWlyZSB2aWV3IHNldCwgbm90aWZ5IHZpZXcgdG8gdXBkYXRlLlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBwYWdlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcGFnaW5hdGU6IGZ1bmN0aW9uKHBhZ2Upe1xuXG4gICAgICAgIC8vIOu3sOydmCDrsoTtirwg67CPIO2OmOydtOyngOulvCDrqqjrkZAg7KCc6rGwIOuwjyDrs7XsgqxcbiAgICAgICAgdGhpcy5fdmlldy5lbXB0eSgpO1xuXG4gICAgICAgIHZhciB2aWV3U2V0ID0ge307XG5cbiAgICAgICAgdmlld1NldC5sYXN0UGFnZSA9IHRoaXMuX2dldExhc3RQYWdlKCk7XG4gICAgICAgIHZpZXdTZXQuY3VycmVudFBhZ2VJbmRleCA9IHRoaXMuX2dldFBhZ2VJbmRleChwYWdlKTtcbiAgICAgICAgdmlld1NldC5sYXN0UGFnZUxpc3RJbmRleCA9IHRoaXMuX2dldFBhZ2VJbmRleCh2aWV3U2V0Lmxhc3RQYWdlKTtcbiAgICAgICAgdmlld1NldC5wYWdlID0gcGFnZTtcblxuICAgICAgICB0aGlzLl92aWV3LnVwZGF0ZSh2aWV3U2V0LCBwYWdlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUGFnZWxpc3QgY2xpY2sgZXZlbnQgaGFkbmxlclxuICAgICAqIEBwYXJhbSB7SlF1ZXJ5RXZlbnR9IGV2ZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25DbGlja1BhZ2VMaXN0OiBmdW5jdGlvbihldmVudCkge1xuXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHZhciBwYWdlID0gbnVsbCxcbiAgICAgICAgICAgIHRhcmdldEVsZW1lbnQgPSAkKGV2ZW50LnRhcmdldCksXG4gICAgICAgICAgICB0YXJnZXRQYWdlO1xuXG4gICAgICAgIGlmICh0aGlzLl92aWV3LmlzSW4odGFyZ2V0RWxlbWVudCwgdGhpcy5nZXRPcHRpb24oJyRwcmVfZW5kT24nKSkpIHtcbiAgICAgICAgICAgIHBhZ2UgPSAxO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX3ZpZXcuaXNJbih0YXJnZXRFbGVtZW50LCB0aGlzLmdldE9wdGlvbignJGxhc3RPbicpKSkge1xuICAgICAgICAgICAgcGFnZSA9IHRoaXMuX2dldExhc3RQYWdlKCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fdmlldy5pc0luKHRhcmdldEVsZW1lbnQsIHRoaXMuZ2V0T3B0aW9uKCckcHJlT24nKSkpIHtcbiAgICAgICAgICAgIHBhZ2UgPSB0aGlzLl9nZXRSZWxhdGl2ZVBhZ2UoJ3ByZScpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX3ZpZXcuaXNJbih0YXJnZXRFbGVtZW50LCB0aGlzLmdldE9wdGlvbignJG5leHRPbicpKSkge1xuICAgICAgICAgICAgcGFnZSA9IHRoaXMuX2dldFJlbGF0aXZlUGFnZSgnbmV4dCcpO1xuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICB0YXJnZXRQYWdlID0gdGhpcy5fdmlldy5nZXRQYWdlRWxlbWVudCh0YXJnZXRFbGVtZW50KTtcblxuICAgICAgICAgICAgaWYgKHRhcmdldFBhZ2UgJiYgdGFyZ2V0UGFnZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBwYWdlID0gcGFyc2VJbnQodGFyZ2V0UGFnZS50ZXh0KCksIDEwKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICBGaXJlICdjbGljaycgY3VzdG9tIGV2ZW50IHdoZW4gcGFnZSBidXR0b24gY2xpY2tlZFxuICAgICAgICAgQHBhcmFtIHtjb21wb25lbnRFdmVudH0gZXZlbnREYXRhXG4gICAgICAgICBAcGFyYW0ge1N0cmluZ30gZXZlbnREYXRhLmV2ZW50VHlwZSBDdXN0b20gZXZlbnQgbmFtZVxuICAgICAgICAgQHBhcmFtIHtOdW1iZXJ9IGV2ZW50RGF0YS5wYWdlIFBhZ2UgdG8gbW92ZVxuICAgICAgICAgQHBhcmFtIHtGdW5jdGlvbn0gZXZlbnREYXRhLnN0b3AgU3RvcCBwYWdlIG1vdmVcbiAgICAgICAgICoqL1xuXG4gICAgICAgIHZhciBpc0ZpcmVkID0gdGhpcy5pbnZva2UoXCJjbGlja1wiLCB7XCJwYWdlXCIgOiBwYWdlfSk7XG4gICAgICAgIGlmICghaXNGaXJlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5tb3ZlUGFnZVRvKHBhZ2UpO1xuICAgIH1cbn0pO1xuLy8gQ3VzdG9tRXZlbnQgIE1peGluXG50dWkudXRpbC5DdXN0b21FdmVudHMubWl4aW4oUGFnaW5hdGlvbik7XG5cbm1vZHVsZS5leHBvcnRzID0gUGFnaW5hdGlvbjtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBQYWdpbmF0aW9uIHZpZXcgbWFuYWdlIGFsbCBvZiBkcmF3IGVsZW1lbnRzXG4gKiAoZnJvbSBwdWcuUGFnaW5hdGlvbilcbiAqIEBhdXRob3IgTkhOIGVudGVydGFpbm1lbnQgRkUgZGV2IHRlYW0gSmVpbiBZaShqZWluLnlpQG5obmVudC5jb20pXG4gKiBAZGVwZW5kZW5jeSBwYWdpbmF0aW9uLmpzXG4gKi9cbi8qKlxuICogQGNvbnN0cnVjdG9yIFZpZXdcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIE9wdGlvbiBvYmplY3RcbiAqIEBwYXJhbSB7T2JqZWN0fSAkZWxlbWVudCBDb250YWluZXIgZWxlbWVudFxuICpcbiAqL1xudmFyIFZpZXcgPSB0dWkudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIFZpZXcucHJvdG90eXBlICove1xuICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbnMsICRlbGVtZW50KSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQYWdpbmF0aW9uIHJvb3QgZWxlbWVudFxuICAgICAgICAgKiBAdHlwZSB7alF1ZXJ5T2JqZWN0fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fZWxlbWVudCA9ICRlbGVtZW50O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQYWdpbmF0aW9uIG9wdGlvbnNcbiAgICAgICAgICogQHR5cGUge09iamVjdH1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX29wdGlvbnMgPSBvcHRpb25zO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZWxlY3RvcnNcbiAgICAgICAgICogQHR5cGUge09iamVjdH1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2VsZW1lbnRTZWxlY3RvciA9IHt9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQYWdlIGl0ZW0gbGlzdFxuICAgICAgICAgKiBAdHlwZSB7QXJyYXl9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9wYWdlSXRlbUxpc3QgPSBbXTtcblxuICAgICAgICB0dWkudXRpbC5leHRlbmQob3B0aW9ucywge1xuICAgICAgICAgICAgJHByZV9lbmRPbjogb3B0aW9uc1snJHByZV9lbmRPbiddIHx8ICQoJ2EuJyArIHRoaXMuX3dyYXBQcmVmaXgoJ3ByZV9lbmQnKSwgdGhpcy5fZWxlbWVudCksXG4gICAgICAgICAgICAkcHJlT246IG9wdGlvbnNbJyRwcmVPbiddIHx8ICQoJ2EuJyArIHRoaXMuX3dyYXBQcmVmaXgoJ3ByZScpLCB0aGlzLl9lbGVtZW50KSxcbiAgICAgICAgICAgICRuZXh0T246IG9wdGlvbnNbJyRuZXh0T24nXSB8fCAkKCdhLicgKyB0aGlzLl93cmFwUHJlZml4KCduZXh0JyksIHRoaXMuX2VsZW1lbnQpLFxuICAgICAgICAgICAgJGxhc3RPbjogb3B0aW9uc1snJGxhc3RPbiddIHx8ICQoJ2EuJyArIHRoaXMuX3dyYXBQcmVmaXgoJ25leHRfZW5kJyksIHRoaXMuX2VsZW1lbnQpLFxuICAgICAgICAgICAgJHByZV9lbmRPZmY6IG9wdGlvbnNbJyRwcmVfZW5kT2ZmJ10gfHwgJCgnc3Bhbi4nICsgdGhpcy5fd3JhcFByZWZpeCgncHJlX2VuZCcpLCB0aGlzLl9lbGVtZW50KSxcbiAgICAgICAgICAgICRwcmVPZmY6IG9wdGlvbnNbJyRwcmVPZmYnXSB8fCAkKCdzcGFuLicgKyB0aGlzLl93cmFwUHJlZml4KCdwcmUnKSwgdGhpcy5fZWxlbWVudCksXG4gICAgICAgICAgICAkbmV4dE9mZjogb3B0aW9uc1snJG5leHRPZmYnXSB8fCAkKCdzcGFuLicgKyB0aGlzLl93cmFwUHJlZml4KCduZXh0JyksIHRoaXMuX2VsZW1lbnQpLFxuICAgICAgICAgICAgJGxhc3RPZmY6IG9wdGlvbnNbJyRsYXN0T2ZmJ10gfHwgJCgnc3Bhbi4nICsgdGhpcy5fd3JhcFByZWZpeCgnbmV4dF9lbmQnKSwgdGhpcy5fZWxlbWVudClcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuYWRkQ2xhc3ModGhpcy5fd3JhcFByZWZpeCgnbG9hZGVkJykpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgdmlld1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSB2aWV3U2V0IFZhbHVlcyBvZiBlYWNoIHBhZ2luYXRpb24gdmlldyBjb21wb25lbnRzXG4gICAgICovXG4gICAgdXBkYXRlOiBmdW5jdGlvbih2aWV3U2V0KSB7XG4gICAgICAgIHRoaXMuX2FkZFRleHROb2RlKCk7XG4gICAgICAgIHRoaXMuX3NldFBhZ2VSZXN1bHQodmlld1NldC5sYXN0UGFnZSk7XG5cbiAgICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLl9vcHRpb25zLFxuICAgICAgICAgICAgZWRnZXMgPSB0aGlzLl9nZXRFZGdlKHZpZXdTZXQpLFxuICAgICAgICAgICAgbGVmdFBhZ2VOdW1iZXIgPSBlZGdlcy5sZWZ0LFxuICAgICAgICAgICAgcmlnaHRQYWdlTnVtYmVyID0gZWRnZXMucmlnaHQ7XG5cbiAgICAgICAgdmlld1NldC5sZWZ0UGFnZU51bWJlciA9IGxlZnRQYWdlTnVtYmVyO1xuICAgICAgICB2aWV3U2V0LnJpZ2h0UGFnZU51bWJlciA9IHJpZ2h0UGFnZU51bWJlcjtcblxuICAgICAgICBpZiAob3B0aW9ucy5tb3ZlVW5pdCA9PT0gJ3BhZ2UnKSB7XG4gICAgICAgICAgICB2aWV3U2V0LmN1cnJlbnRQYWdlSW5kZXggPSB2aWV3U2V0LnBhZ2U7XG4gICAgICAgICAgICB2aWV3U2V0Lmxhc3RQYWdlTGlzdEluZGV4ID0gdmlld1NldC5sYXN0UGFnZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3NldEZpcnN0KHZpZXdTZXQpO1xuICAgICAgICB0aGlzLl9zZXRQcmV2KHZpZXdTZXQpO1xuICAgICAgICB0aGlzLl9zZXRQYWdlTnVtYmVycyh2aWV3U2V0KTtcbiAgICAgICAgdGhpcy5fc2V0TmV4dCh2aWV3U2V0KTtcbiAgICAgICAgdGhpcy5fc2V0TGFzdCh2aWV3U2V0KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaW5jbHVkZVxuICAgICAqIEBwYXJhbSB7SlF1ZXJ5T2JqZWN0fSAkZmluZCBUYXJnZXQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7SlF1ZXJ5T2JqZWN0fSAkcGFyZW50IFdyYXBwZXIgZWxlbWVudFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIGlzSW46IGZ1bmN0aW9uKCRmaW5kLCAkcGFyZW50KSB7XG4gICAgICAgIGlmICghJHBhcmVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAoJGZpbmRbMF0gPT09ICRwYXJlbnRbMF0pID8gdHJ1ZSA6ICQuY29udGFpbnMoJHBhcmVudCwgJGZpbmQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgYmFzZShyb290KSBlbGVtZW50XG4gICAgICogQHJldHVybnMge0pRdWVyeU9iamVjdH1cbiAgICAgKi9cbiAgICBnZXRCYXNlRWxlbWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldEVsZW1lbnQoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVzZXQgYmFzZSBlbGVtZW50XG4gICAgICovXG4gICAgZW1wdHk6IGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLl9vcHRpb25zLFxuICAgICAgICAgICAgJHByZV9lbmRPbiA9IG9wdGlvbnMuJHByZV9lbmRPbixcbiAgICAgICAgICAgICRwcmVPbiA9IG9wdGlvbnMuJHByZU9uLFxuICAgICAgICAgICAgJG5leHRPbiA9IG9wdGlvbnMuJG5leHRPbixcbiAgICAgICAgICAgICRsYXN0T24gPSBvcHRpb25zLiRsYXN0T24sXG4gICAgICAgICAgICAkcHJlX2VuZE9mZiA9IG9wdGlvbnMuJHByZV9lbmRPZmYsXG4gICAgICAgICAgICAkcHJlT2ZmID0gb3B0aW9ucy4kcHJlT2ZmLFxuICAgICAgICAgICAgJG5leHRPZmYgPSBvcHRpb25zLiRuZXh0T2ZmLFxuICAgICAgICAgICAgJGxhc3RPZmYgPSBvcHRpb25zLiRsYXN0T2ZmO1xuXG4gICAgICAgIG9wdGlvbnMuJHByZV9lbmRPbiA9IHRoaXMuX2Nsb25lKCRwcmVfZW5kT24pO1xuICAgICAgICBvcHRpb25zLiRwcmVPbiA9IHRoaXMuX2Nsb25lKCRwcmVPbik7XG4gICAgICAgIG9wdGlvbnMuJGxhc3RPbiA9IHRoaXMuX2Nsb25lKCRsYXN0T24pO1xuICAgICAgICBvcHRpb25zLiRuZXh0T24gPSB0aGlzLl9jbG9uZSgkbmV4dE9uKTtcbiAgICAgICAgb3B0aW9ucy4kcHJlX2VuZE9mZiA9IHRoaXMuX2Nsb25lKCRwcmVfZW5kT2ZmKTtcbiAgICAgICAgb3B0aW9ucy4kcHJlT2ZmID0gdGhpcy5fY2xvbmUoJHByZU9mZik7XG4gICAgICAgIG9wdGlvbnMuJGxhc3RPZmYgPSB0aGlzLl9jbG9uZSgkbGFzdE9mZik7XG4gICAgICAgIG9wdGlvbnMuJG5leHRPZmYgPSB0aGlzLl9jbG9uZSgkbmV4dE9mZik7XG5cbiAgICAgICAgdGhpcy5fcGFnZUl0ZW1MaXN0ID0gW107XG5cbiAgICAgICAgdGhpcy5fZWxlbWVudC5lbXB0eSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGaW5kIHRhcmdldCBlbGVtZW50IGZyb20gcGFnZSBlbGVtZW50c1xuICAgICAqIEBwYXJhbSB7alF1ZXJ5T2JqZWN0fEhUTUxFbGVtZW50fSBlbCBUYXJnZXQgZWxlbWVudFxuICAgICAqIEByZXR1cm4ge2pRdWVyeU9iamVjdH1cbiAgICAgKi9cbiAgICBnZXRQYWdlRWxlbWVudDogZnVuY3Rpb24oZWwpIHtcblxuICAgICAgICB2YXIgaSxcbiAgICAgICAgICAgIGxlbmd0aCxcbiAgICAgICAgICAgIHBpY2tlZEl0ZW07XG5cbiAgICAgICAgZm9yIChpID0gMCwgbGVuZ3RoID0gdGhpcy5fcGFnZUl0ZW1MaXN0Lmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBwaWNrZWRJdGVtID0gdGhpcy5fcGFnZUl0ZW1MaXN0W2ldO1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNJbihlbCwgcGlja2VkSXRlbSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGlja2VkSXRlbTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIEV2ZW50c1xuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFR5cGUgRXZlbnQgbmFtZSB0byBhdHRhY2hcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBDYWxsYmFjayBmdW5jdGlvblxuICAgICAqL1xuICAgIGF0dGFjaEV2ZW50OiBmdW5jdGlvbihldmVudFR5cGUsIGNhbGxiYWNrKSB7XG5cbiAgICAgICAgdmFyIHRhcmdldEVsZW1lbnQgPSB0aGlzLl9lbGVtZW50LFxuICAgICAgICAgICAgaXNTYXZlZEVsZW1lbnQgPSB0dWkudXRpbC5pc1N0cmluZyh0YXJnZXRFbGVtZW50KSAmJiB0aGlzLl9lbGVtZW50U2VsZWN0b3JbdGFyZ2V0RWxlbWVudF07XG5cbiAgICAgICAgaWYgKGlzU2F2ZWRFbGVtZW50KSB7XG4gICAgICAgICAgICB0YXJnZXRFbGVtZW50ID0gdGhpcy5fZ2V0RWxlbWVudCh0YXJnZXRFbGVtZW50LCB0cnVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0YXJnZXRFbGVtZW50ICYmIGV2ZW50VHlwZSAmJiBjYWxsYmFjaykge1xuICAgICAgICAgICAgJCh0YXJnZXRFbGVtZW50KS5iaW5kKGV2ZW50VHlwZSwgbnVsbCwgY2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCByb290IGVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyB7alF1ZXJ5T2JqZWN0fVxuICAgICAqL1xuICAgIGdldEVsZW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZWxlbWVudDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIGNsYXNzTmFtZSBhZGRlZCBwcmVmaXhcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gY2xhc3NOYW1lIENsYXNzIG5hbWUgdG8gYmUgd3JhcHBpbmdcbiAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF93cmFwUHJlZml4OiBmdW5jdGlvbihjbGFzc05hbWUpIHtcbiAgICAgICAgdmFyIGNsYXNzUHJlZml4ID0gdGhpcy5fb3B0aW9uc1snY2xhc3NQcmVmaXgnXTtcbiAgICAgICAgcmV0dXJuIGNsYXNzUHJlZml4ID8gY2xhc3NQcmVmaXggKyBjbGFzc05hbWUucmVwbGFjZSgvXy9nLCAnLScpIDogY2xhc3NOYW1lO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBQdXQgaW5zZXJ0VGV4dE5vZGUgYmV0d2VlbiBwYWdlIGl0ZW1zXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYWRkVGV4dE5vZGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdGV4dE5vZGUgPSB0aGlzLl9vcHRpb25zWydpbnNlcnRUZXh0Tm9kZSddO1xuICAgICAgICB0aGlzLl9lbGVtZW50LmFwcGVuZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0ZXh0Tm9kZSkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDbG9uZSBlbGVtZW50XG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY2xvbmU6IGZ1bmN0aW9uKCRsaW5rKSB7XG5cbiAgICAgICAgaWYgKCRsaW5rICYmICRsaW5rLmxlbmd0aCAmJiAkbGluay5nZXQoMCkuY2xvbmVOb2RlKSB7XG4gICAgICAgICAgICByZXR1cm4gJCgkbGluay5nZXQoMCkuY2xvbmVOb2RlKHRydWUpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gJGxpbms7XG5cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogV3JhcHBpbmcgY2xhc3MgYnkgcGFnZSByZXN1bHRcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gbGFzdE51bSBMYXN0IHBhZ2UgbnVtYmVyXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0UGFnZVJlc3VsdDogZnVuY3Rpb24obGFzdE51bSkge1xuXG4gICAgICAgIGlmIChsYXN0TnVtID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLl9lbGVtZW50LmFkZENsYXNzKHRoaXMuX3dyYXBQcmVmaXgoJ25vLXJlc3VsdCcpKTtcbiAgICAgICAgfSBlbHNlIGlmIChsYXN0TnVtID09PSAxKSB7XG4gICAgICAgICAgICB0aGlzLl9lbGVtZW50LmFkZENsYXNzKHRoaXMuX3dyYXBQcmVmaXgoJ29ubHktb25lJykpLnJlbW92ZUNsYXNzKHRoaXMuX3dyYXBQcmVmaXgoJ25vLXJlc3VsdCcpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2VsZW1lbnQucmVtb3ZlQ2xhc3ModGhpcy5fd3JhcFByZWZpeCgnb25seS1vbmUnKSkucmVtb3ZlQ2xhc3ModGhpcy5fd3JhcFByZWZpeCgnbm8tcmVzdWx0JykpO1xuICAgICAgICB9XG5cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGVhY2ggZWRnZSBwYWdlXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHZpZXdTZXQgUGFnaW5hdGlvbiB2aWV3IGVsZW1lbnRzIHNldFxuICAgICAqIEByZXR1cm5zIHt7bGVmdDogKiwgcmlnaHQ6ICp9fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldEVkZ2U6IGZ1bmN0aW9uKHZpZXdTZXQpIHtcblxuICAgICAgICB2YXIgb3B0aW9ucyA9IHRoaXMuX29wdGlvbnMsXG4gICAgICAgICAgICBsZWZ0UGFnZU51bWJlcixcbiAgICAgICAgICAgIHJpZ2h0UGFnZU51bWJlcixcbiAgICAgICAgICAgIGxlZnQ7XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuaXNDZW50ZXJBbGlnbikge1xuXG4gICAgICAgICAgICBsZWZ0ID0gTWF0aC5mbG9vcihvcHRpb25zLnBhZ2VQZXJQYWdlTGlzdCAvIDIpO1xuICAgICAgICAgICAgbGVmdFBhZ2VOdW1iZXIgPSB2aWV3U2V0LnBhZ2UgLSBsZWZ0O1xuICAgICAgICAgICAgbGVmdFBhZ2VOdW1iZXIgPSBNYXRoLm1heChsZWZ0UGFnZU51bWJlciwgMSk7XG4gICAgICAgICAgICByaWdodFBhZ2VOdW1iZXIgPSBsZWZ0UGFnZU51bWJlciArIG9wdGlvbnMucGFnZVBlclBhZ2VMaXN0IC0gMTtcblxuICAgICAgICAgICAgaWYgKHJpZ2h0UGFnZU51bWJlciA+IHZpZXdTZXQubGFzdFBhZ2UpIHtcbiAgICAgICAgICAgICAgICBsZWZ0UGFnZU51bWJlciA9IHZpZXdTZXQubGFzdFBhZ2UgLSBvcHRpb25zLnBhZ2VQZXJQYWdlTGlzdCArIDE7XG4gICAgICAgICAgICAgICAgbGVmdFBhZ2VOdW1iZXIgPSBNYXRoLm1heChsZWZ0UGFnZU51bWJlciwgMSk7XG4gICAgICAgICAgICAgICAgcmlnaHRQYWdlTnVtYmVyID0gdmlld1NldC5sYXN0UGFnZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBsZWZ0UGFnZU51bWJlciA9ICh2aWV3U2V0LmN1cnJlbnRQYWdlSW5kZXggLSAxKSAqIG9wdGlvbnMucGFnZVBlclBhZ2VMaXN0ICsgMTtcbiAgICAgICAgICAgIHJpZ2h0UGFnZU51bWJlciA9ICh2aWV3U2V0LmN1cnJlbnRQYWdlSW5kZXgpICogb3B0aW9ucy5wYWdlUGVyUGFnZUxpc3Q7XG4gICAgICAgICAgICByaWdodFBhZ2VOdW1iZXIgPSBNYXRoLm1pbihyaWdodFBhZ2VOdW1iZXIsIHZpZXdTZXQubGFzdFBhZ2UpO1xuXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbGVmdDogbGVmdFBhZ2VOdW1iZXIsXG4gICAgICAgICAgICByaWdodDogcmlnaHRQYWdlTnVtYmVyXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIERlY2lkZSB0byBzaG93IGZpcnN0IHBhZ2UgbGluayBieSB3aGV0aGVyIGZpcnN0IHBhZ2Ugb3Igbm90XG4gICAgICogQHBhcmFtIHtvYmplY3R9IHZpZXdTZXQgUGFnaW5hdGlvbiB2aWV3IGVsZW1lbnRzIHNldFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldEZpcnN0OiBmdW5jdGlvbih2aWV3U2V0KSB7XG4gICAgICAgIHZhciBvcHRpb25zID0gdGhpcy5fb3B0aW9ucztcbiAgICAgICAgaWYgKHZpZXdTZXQucGFnZSA+IDEpIHtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLiRwcmVfZW5kT24pIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9lbGVtZW50LmFwcGVuZChvcHRpb25zLiRwcmVfZW5kT24pO1xuICAgICAgICAgICAgICAgIHRoaXMuX2FkZFRleHROb2RlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy4kcHJlX2VuZE9mZikge1xuICAgICAgICAgICAgICAgIHRoaXMuX2VsZW1lbnQuYXBwZW5kKG9wdGlvbnMuJHByZV9lbmRPZmYpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2FkZFRleHROb2RlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBEZWNpZGUgdG8gc2hvdyBwcmV2aW91cyBwYWdlIGxpbmsgYnkgd2hldGhlciBmaXJzdCBwYWdlIG9yIG5vdFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB2aWV3U2V0IFBhZ2luYXRpb24gdmlldyBlbGVtZW50cyBzZXRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRQcmV2OiBmdW5jdGlvbih2aWV3U2V0KSB7XG4gICAgICAgIHZhciBvcHRpb25zID0gdGhpcy5fb3B0aW9ucztcblxuICAgICAgICBpZiAodmlld1NldC5jdXJyZW50UGFnZUluZGV4ID4gMSkge1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMuJHByZU9uKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZWxlbWVudC5hcHBlbmQob3B0aW9ucy4kcHJlT24pO1xuICAgICAgICAgICAgICAgIHRoaXMuX2FkZFRleHROb2RlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy4kcHJlT2ZmKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZWxlbWVudC5hcHBlbmQob3B0aW9ucy4kcHJlT2ZmKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRUZXh0Tm9kZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBEZWNpZGUgdG8gc2hvdyBuZXh0IHBhZ2UgbGluayBieSB3aGV0aGVyIGZpcnN0IHBhZ2Ugb3Igbm90XG4gICAgICogQHBhcmFtIHtvYmplY3R9IHZpZXdTZXQgUGFnaW5hdGlvbiB2aWV3IGVsZW1lbnRzIHNldFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldE5leHQ6IGZ1bmN0aW9uKHZpZXdTZXQpIHtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLl9vcHRpb25zO1xuXG4gICAgICAgIGlmICh2aWV3U2V0LmN1cnJlbnRQYWdlSW5kZXggPCB2aWV3U2V0Lmxhc3RQYWdlTGlzdEluZGV4KSB7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy4kbmV4dE9uKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZWxlbWVudC5hcHBlbmQob3B0aW9ucy4kbmV4dE9uKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRUZXh0Tm9kZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMuJG5leHRPZmYpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9lbGVtZW50LmFwcGVuZChvcHRpb25zLiRuZXh0T2ZmKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRUZXh0Tm9kZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9LFxuICAgIC8qKlxuICAgICAqIERlY2lkZSB0byBzaG93IGxhc3QgcGFnZSBsaW5rIGJ5IHdoZXRoZXIgZmlyc3QgcGFnZSBvciBub3RcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdmlld1NldCBQYWdpbmF0aW9uIHZpZXcgZWxlbWVudHMgc2V0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0TGFzdDogZnVuY3Rpb24odmlld1NldCkge1xuXG4gICAgICAgIHZhciBvcHRpb25zID0gdGhpcy5fb3B0aW9ucztcblxuICAgICAgICBpZiAodmlld1NldC5wYWdlIDwgdmlld1NldC5sYXN0UGFnZSkge1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMuJGxhc3RPbikge1xuICAgICAgICAgICAgICAgIHRoaXMuX2VsZW1lbnQuYXBwZW5kKG9wdGlvbnMuJGxhc3RPbik7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkVGV4dE5vZGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLiRsYXN0T2ZmKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZWxlbWVudC5hcHBlbmQob3B0aW9ucy4kbGFzdE9mZik7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkVGV4dE5vZGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBTZXQgcGFnZSBudW1iZXIgdGhhdCB3aWxsIGJlIGRyYXduXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHZpZXdTZXQgUGFnaW5hdGlvbiB2aWV3IGVsZW1lbnRzIHNldFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldFBhZ2VOdW1iZXJzOiBmdW5jdGlvbih2aWV3U2V0KSB7XG4gICAgICAgIHZhciAkcGFnZUl0ZW0sXG4gICAgICAgICAgICBmaXJzdFBhZ2UgPSB2aWV3U2V0LmxlZnRQYWdlTnVtYmVyLFxuICAgICAgICAgICAgbGFzdFBhZ2UgPSB2aWV3U2V0LnJpZ2h0UGFnZU51bWJlcixcbiAgICAgICAgICAgIG9wdGlvbnMgPSB0aGlzLl9vcHRpb25zLFxuICAgICAgICAgICAgaTtcblxuICAgICAgICBmb3IgKGkgPSBmaXJzdFBhZ2U7IGkgPD0gbGFzdFBhZ2U7IGkrKykge1xuICAgICAgICAgICAgaWYgKGkgPT09IHZpZXdTZXQucGFnZSkge1xuICAgICAgICAgICAgICAgICRwYWdlSXRlbSA9ICQob3B0aW9ucy5jdXJyZW50UGFnZVRlbXBsYXRlLnJlcGxhY2UoJ3s9cGFnZX0nLCBpLnRvU3RyaW5nKCkpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJHBhZ2VJdGVtID0gJChvcHRpb25zLnBhZ2VUZW1wbGF0ZS5yZXBsYWNlKCd7PXBhZ2V9JywgaS50b1N0cmluZygpKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fcGFnZUl0ZW1MaXN0LnB1c2goJHBhZ2VJdGVtKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGkgPT09IGZpcnN0UGFnZSkge1xuICAgICAgICAgICAgICAgICRwYWdlSXRlbS5hZGRDbGFzcyh0aGlzLl93cmFwUHJlZml4KG9wdGlvbnNbJ2ZpcnN0SXRlbUNsYXNzTmFtZSddKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaSA9PT0gbGFzdFBhZ2UpIHtcbiAgICAgICAgICAgICAgICAkcGFnZUl0ZW0uYWRkQ2xhc3ModGhpcy5fd3JhcFByZWZpeChvcHRpb25zWydsYXN0SXRlbUNsYXNzTmFtZSddKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9lbGVtZW50LmFwcGVuZCgkcGFnZUl0ZW0pO1xuICAgICAgICAgICAgdGhpcy5fYWRkVGV4dE5vZGUoKTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXc7XG4iXX0=
