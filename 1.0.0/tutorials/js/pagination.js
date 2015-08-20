(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
ne.util.defineNamespace('ne.component.Pagination', require('./src/js/pagination.js'));

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


        if (options.itemCount === 0) {
            /**
             * Option object
             * @type {Object}
             * @private
             */
            this._options = defaultOption;
        } else {
            this._options = ne.util.extend(defaultOption, options);
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
},{"./view.js":3}],3:[function(require,module,exports){
/**
 * @fileoverview Pagination view manage all of draw elements
 * (from pug.Pagination)
 * @author NHN entertainment FE dev team Jein Yi(jein.yi@nhnent.com)
 * @dependency pagination.js
 */
/**
 * @constructor ne.component.Pagination.PaginationView
 * @param {Object} options Option object
 * @param {Object} $element Container element
 *
 */
var View = ne.util.defineClass(/** @lends ne.component.Pagination.PaginationView.prototype */{
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

        ne.util.extend(options, {
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
            isSavedElement = ne.util.isString(targetElement) && this._elementSelector[targetElement];

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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9qcy9wYWdpbmF0aW9uLmpzIiwic3JjL2pzL3ZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJuZS51dGlsLmRlZmluZU5hbWVzcGFjZSgnbmUuY29tcG9uZW50LlBhZ2luYXRpb24nLCByZXF1aXJlKCcuL3NyYy9qcy9wYWdpbmF0aW9uLmpzJykpO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IENvcmUgb2YgcGFnaW5hdGlvbiBjb21wb25lbnQsIGNyZWF0ZSBwYWdpbmF0aW9uIHZpZXcgYW5kIGF0dGFjaCBldmVudHMuXG4gKiAoZnJvbSBwdWcuUGFnaW5hdGlvbilcbiAqIEBhdXRob3IgTkhOIGVudGVydGFpbm1lbnQgRkUgZGV2IHRlYW0oZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tKVxuICogQGRlcGVuZGVuY3kganF1ZXJ5LTEuOC4zLm1pbi5qcywgY29kZS1zbmlwcGV0LmpzXG4gKi9cblxudmFyIFZpZXcgPSByZXF1aXJlKCcuL3ZpZXcuanMnKTtcblxuLyoqXG4gKiBQYWdpbmF0aW9uIGNvcmUgY2xhc3NcbiAqIEBjb25zdHJ1Y3RvciBuZS5jb21wb25lbnQuUGFnaW5hdGlvblxuICpcbiAqL1xudmFyIFBhZ2luYXRpb24gPSBuZS51dGlsLmRlZmluZUNsYXNzKC8qKkBsZW5kcyBuZS5jb21wb25lbnQuUGFnaW5hdGlvbi5wcm90b3R5cGUgKi97XG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZVxuICAgICAqIEBwYXJhbSB7RGF0YU9iamVjdH0gb3B0aW9ucyBPcHRpb24gb2JqZWN0XG4gICAgICogXHRcdEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5pdGVtQ291bnQ9MTBdIFRvdGFsIGl0ZW0gY291bnRcbiAgICAgKiBcdFx0QHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLml0ZW1QZXJQYWdlPTEwXSBJdGVtIGNvdW50IHBlciBwYWdlXG4gICAgICogXHRcdEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5wYWdlUGVyUGFnZUxpc3Q9MTBdIERpc3BsYXkgcGFnZSBsaW5rIGNvdW50XG4gICAgICogXHRcdEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5wYWdlPTFdIHBhZ2UgRGlzcGxheSBwYWdlIGFmdGVyIHBhZ2luYXRpb24gZHJhdy5cbiAgICAgKiBcdFx0QHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLm1vdmVVbml0PVwicGFnZWxpc3RcIl0gUGFnZSBtb3ZlIHVuaXQuXG4gICAgICogXHRcdFx0PHVsPlxuICAgICAqIFx0XHRcdFx0PGxpPnBhZ2VsaXN0IDogTW92ZSBwYWdlIGZvciB1bml0PC9saT5cbiAgICAgKiBcdFx0XHRcdDxsaT5wYWdlIDogTW92ZSBvbmUgcGFnZTwvbGk+XG4gICAgICogXHRcdFx0PC91bD5cbiAgICAgKiBcdFx0QHBhcmFtIHtCb29sZWFufVtvcHRpb25zLmlzQ2VudGVyQWxpZ249ZmFsc2VdIFdoZXRoZXIgY3VycmVudCBwYWdlIGtlZXAgY2VudGVyIG9yIG5vdFxuICAgICAqIFx0XHRAcGFyYW0ge1N0cmluZ30gW29wdGlvbnMuaW5zZXJ0VGV4dE5vZGU9XCJcIl0gVGhlIGNvdXBsZXIgYmV0d2VlbiBwYWdlIGxpbmtzXG4gICAgICogXHRcdEBwYXJhbSB7U3RyaW5nfSBbb3B0aW9ucy5jbGFzc1ByZWZpeD1cIlwiXSBBIHByZWZpeCBvZiBjbGFzcyBuYW1lXG4gICAgICogXHRcdEBwYXJhbSB7U3RyaW5nfSBbb3B0aW9ucy5maXJzdEl0ZW1DbGFzc05hbWU9XCJmaXJzdC1jaGlsZFwiXSBUaGUgY2xhc3MgbmFtZSBpcyBncmFudGVkIGZpcnN0IHBhZ2UgbGluayBpdGVtXG4gICAgICogXHRcdEBwYXJhbSB7U3RyaW5nfSBbb3B0aW9ucy5sYXN0SXRlbUNsYXNzTmFtZT1cImxhc3QtY2hpbGRcIl0gVGhlIGNsYXNzIG5hbWUgaXMgZ3JhbnRlZCBmaXJzdCBwYWdlIGxpbmsgaXRlbVxuICAgICAqIFx0XHRAcGFyYW0ge1N0cmluZ30gW29wdGlvbnMucGFnZVRlbXBsYXRlPVwiPGEgaHJlZj0nIyc+ez1wYWdlfTwvYT5cIl0gVGhlIG1hcmt1cCB0ZW1wbGF0ZSB0byBzaG93IHBhZ2UgaXRlbSBzdWNoIGFzIDEsIDIsIDMsIC4uIHs9cGFnZX0gd2lsbCBiZSBjaGFuZ2VkIGVhY2ggcGFnZSBudW1iZXIuXG4gICAgICogXHRcdEBwYXJhbSB7U3RyaW5nfSBbb3B0aW9ucy5jdXJyZW50UGFnZVRlbXBsYXRlPVwiPHN0cm9uZz57PXBhZ2V9PC9zdHJvbmc+XCJdIFRoZSBtYXJrdXAgdGVtcGxhdGUgZm9yIGN1cnJlbnQgcGFnZSB7PXBhZ2V9IHdpbGwgYmUgY2hhbmdlZCBjdXJyZW50IHBhZ2UgbnVtYmVyLlxuICAgICAqIFx0XHRAcGFyYW0ge2pRdWVyeU9iamVjdH0gW29wdGlvbnMuJHByZV9lbmRPbl0gVGhlIGJ1dHRvbiBlbGVtZW50IHRvIG1vdmUgZmlyc3QgcGFnZS4gSWYgdGhpcyBvcHRpb24gaXMgbm90IGV4aXN0IGFuZCB0aGUgZWxlbWVudCB0aGF0IGhhcyBjbGFzcyAncHJlX2VuZCcsIGNvbXBvbmVudCBkbyBub3QgY3JlYXRlIHRoaXMgYnV0dG9uLlxuICAgICAqIFx0XHRAcGFyYW0ge2pRdWVyeU9iamVjdH0gW29wdGlvbnMuJHByZU9uXSBUaGUgYnV0dG9uIGVsZW1lbnQgdG8gbW92ZSBwcmV2aW91c2UgcGFnZS4gSWYgdGhpcyBvcHRpb24gaXMgbm90IGV4aXN0IGFuZCB0aGUgZWxlbWVudCB0aGF0IGhhcyBjbGFzcyAncHJlJywgY29tcG9uZW50IGRvIG5vdCBjcmVhdGUgdGhpcyBidXR0b24uXG4gICAgICogXHRcdEBwYXJhbSB7alF1ZXJ5T2JqZWN0fSBbb3B0aW9ucy4kbmV4dE9uXSBUaGUgYnV0dG9uIGVsZW1lbnQgdG8gbW92ZSBuZXh0IHBhZ2UuIElmIHRoaXMgb3B0aW9uIGlzIG5vdCBleGlzdCBhbmQgdGhlIGVsZW1lbnQgdGhhdCBoYXMgY2xhc3MgJ25leHQnLCBjb21wb25lbnQgZG8gbm90IGNyZWF0ZSB0aGlzIGJ1dHRvbi5cbiAgICAgKiBcdFx0QHBhcmFtIHtqUXVlcnlPYmplY3R9IFtvcHRpb25zLiRsYXN0T25dIFRoZSBidXR0b24gZWxlbWVudCB0byBtb3ZlIGxhc3QgcGFnZS4gSWYgdGhpcyBvcHRpb24gaXMgbm90IGV4aXN0IGFuZCB0aGUgZWxlbWVudCB0aGF0IGhhcyBjbGFzcyAnbGFzdCcsIGNvbXBvbmVudCBkbyBub3QgY3JlYXRlIHRoaXMgYnV0dG9uLlxuICAgICAqIFx0XHRAcGFyYW0ge2pRdWVyeU9iamVjdH0gW29wdGlvbnMuJHByZV9lbmRPZmZdIFRoZSBlbGVtZW50IHRvIHNob3cgdGhhdCBwcmVfZW5kT24gYnV0dG9uIGlzIG5vdCBlbmFibGUuIElmIHRoaXMgb3B0aW9uIGlzIG5vdCBleGlzdCBhbmQgdGhlIGVsZW1lbnQgdGhhdCBoYXMgY2xhc3MgJ3ByZV9lbmRPZmYnLCBjb21wb25lbnQgZG8gbm90IGNyZWF0ZSB0aGlzIGJ1dHRvbi5cbiAgICAgKiBcdFx0QHBhcmFtIHtqUXVlcnlPYmplY3R9IFtvcHRpb25zLiRwcmVPZmZdIFRoZSBlbGVtZW50IHRvIHNob3cgdGhhdCBwcmVPbiBidXR0b24gaXMgbm90IGVuYWJsZS4gSWYgdGhpcyBvcHRpb24gaXMgbm90IGV4aXN0IGFuZCB0aGUgZWxlbWVudCB0aGF0IGhhcyBjbGFzcyAncHJlT2ZmJywgY29tcG9uZW50IGRvIG5vdCBjcmVhdGUgdGhpcyBidXR0b24uXG4gICAgICogXHRcdEBwYXJhbSB7alF1ZXJ5T2JqZWN0fSBbb3B0aW9ucy4kbmV4dE9mZl0gVGhlIGVsZW1lbnQgdG8gc2hvdyB0aGF0IG5leHRPbiBidXR0b24gaXMgbm90IGVuYWJsZS4gSWYgdGhpcyBvcHRpb24gaXMgbm90IGV4aXN0IGFuZCB0aGUgZWxlbWVudCB0aGF0IGhhcyBjbGFzcyAnbmV4dE9mZicsIGNvbXBvbmVudCBkbyBub3QgY3JlYXRlIHRoaXMgYnV0dG9uLlxuICAgICAqIFx0XHRAcGFyYW0ge2pRdWVyeU9iamVjdH0gW29wdGlvbnMuJGxhc3RPZmZdIFRoZSBlbGVtZW50IHRvIHNob3cgdGhhdCBsYXN0T24gYnV0dG9uIGlzIG5vdCBlbmFibGUuIElmIHRoaXMgb3B0aW9uIGlzIG5vdCBleGlzdCBhbmQgdGhlIGVsZW1lbnQgdGhhdCBoYXMgY2xhc3MgJ2xhc3RPZmYnLCBjb21wb25lbnQgZG8gbm90IGNyZWF0ZSB0aGlzIGJ1dHRvbi5cbiAgICAgKiBAcGFyYW0ge2pRdWVyeU9iamVjdH0gJGVsZW1lbnQgUGFnaW5hdGlvbiBjb250YWluZXJcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb25zLCAkZWxlbWVudCkge1xuICAgICAgICB2YXIgZGVmYXVsdE9wdGlvbiA9IHtcbiAgICAgICAgICAgIGl0ZW1Db3VudDogMTAsXG4gICAgICAgICAgICBpdGVtUGVyUGFnZTogMTAsXG4gICAgICAgICAgICBwYWdlUGVyUGFnZUxpc3Q6IDEwLFxuICAgICAgICAgICAgcGFnZTogMSxcbiAgICAgICAgICAgIG1vdmVVbml0OiAncGFnZWxpc3QnLFxuICAgICAgICAgICAgaXNDZW50ZXJBbGlnbjogZmFsc2UsXG4gICAgICAgICAgICBpbnNlcnRUZXh0Tm9kZTogJycsXG4gICAgICAgICAgICBjbGFzc1ByZWZpeDogJycsXG4gICAgICAgICAgICBmaXJzdEl0ZW1DbGFzc05hbWU6ICdmaXJzdC1jaGlsZCcsXG4gICAgICAgICAgICBsYXN0SXRlbUNsYXNzTmFtZTogJ2xhc3QtY2hpbGQnLFxuICAgICAgICAgICAgcGFnZVRlbXBsYXRlOiAnPGEgaHJlZj1cIiNcIj57PXBhZ2V9PC9hPicsXG4gICAgICAgICAgICBjdXJyZW50UGFnZVRlbXBsYXRlOiAnPHN0cm9uZz57PXBhZ2V9PC9zdHJvbmc+J1xuICAgICAgICB9O1xuXG5cbiAgICAgICAgaWYgKG9wdGlvbnMuaXRlbUNvdW50ID09PSAwKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIE9wdGlvbiBvYmplY3RcbiAgICAgICAgICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLl9vcHRpb25zID0gZGVmYXVsdE9wdGlvbjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX29wdGlvbnMgPSBuZS51dGlsLmV4dGVuZChkZWZhdWx0T3B0aW9uLCBvcHRpb25zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBFdmVudCBoYW5kbGVyIHNhdm9yXG4gICAgICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogdmlldyBpbnN0YW5jZVxuICAgICAgICAgKiBAdHlwZSB7UGFnaW5hdGlvblZpZXd9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl92aWV3ID0gbmV3IFZpZXcodGhpcy5fb3B0aW9ucywgJGVsZW1lbnQpO1xuICAgICAgICB0aGlzLl92aWV3LmF0dGFjaEV2ZW50KCdjbGljaycsIG5lLnV0aWwuYmluZCh0aGlzLl9vbkNsaWNrUGFnZUxpc3QsIHRoaXMpKTtcblxuICAgICAgICB0aGlzLm1vdmVQYWdlVG8odGhpcy5nZXRPcHRpb24oJ3BhZ2UnKSwgZmFsc2UpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXNldCBwYWdpbmF0aW9uXG4gICAgICogQHBhcmFtIHsqfSBpdGVtQ291bnQgUmVkcmF3IHBhZ2UgaXRlbSBjb3VudFxuICAgICAqL1xuICAgIHJlc2V0OiBmdW5jdGlvbihpdGVtQ291bnQpIHtcblxuICAgICAgICB2YXIgaXNFeGlzdCA9IG5lLnV0aWwuaXNFeGlzdHkoKGl0ZW1Db3VudCAhPT0gbnVsbCkgJiYgKGl0ZW1Db3VudCAhPT0gdW5kZWZpbmVkKSk7XG5cbiAgICAgICAgaWYgKCFpc0V4aXN0KSB7XG4gICAgICAgICAgICBpdGVtQ291bnQgPSB0aGlzLmdldE9wdGlvbignaXRlbUNvdW50Jyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldE9wdGlvbignaXRlbUNvdW50JywgaXRlbUNvdW50KTtcbiAgICAgICAgdGhpcy5tb3ZlUGFnZVRvKDEsIGZhbHNlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IG9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gb3B0aW9uS2V5IE9wdGlvbiBrZXlcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEByZXR1cm5zIHsqfVxuICAgICAqXG4gICAgICovXG4gICAgZ2V0T3B0aW9uOiBmdW5jdGlvbihvcHRpb25LZXkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX29wdGlvbnNbb3B0aW9uS2V5XTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTW92ZSB0byBzcGVjaWZpYyBwYWdlLCByZWRyYXcgbGlzdC5cbiAgICAgKiBCZWZvciBtb3ZlIGZpcmUgYmVmb3JlTW92ZSBldmVudCwgQWZ0ZXIgbW92ZSBmaXJlIGFmdGVyTW92ZSBldmVudC5cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gdGFyZ2V0UGFnZSBUYXJnZXQgcGFnZVxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNOb3RSdW5DdXN0b21FdmVudCBbaXNOb3RSdW5DdXN0b21FdmVudD10cnVlXSBXaGV0aGVyIGN1c3RvbSBldmVudCBmaXJlIG9yIG5vdFxuICAgICAqL1xuICAgIG1vdmVQYWdlVG86IGZ1bmN0aW9uKHRhcmdldFBhZ2UsIGlzTm90UnVuQ3VzdG9tRXZlbnQpIHtcblxuICAgICAgICB0YXJnZXRQYWdlID0gdGhpcy5fY29udmVydFRvQXZhaWxQYWdlKHRhcmdldFBhZ2UpO1xuICAgICAgICB0aGlzLl9jdXJyZW50UGFnZSA9IHRhcmdldFBhZ2U7XG5cbiAgICAgICAgaWYgKCFpc05vdFJ1bkN1c3RvbUV2ZW50KSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEZpcmUgJ2JlZm9yZU1vdmUnIGV2ZW50KEN1c3RvbUV2ZW50KVxuICAgICAgICAgICAgICogQHBhcmFtIHtjb21wb25lbnRFdmVudH0gZXZlbnREYXRhXG4gICAgICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnREYXRhLmV2ZW50VHlwZSBDdXN0b20gZXZlbnQgbmFtZVxuICAgICAgICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IGV2ZW50RGF0YS5wYWdlIFRhcmdldCBwYWdlXG4gICAgICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBldmVudERhdGEuc3RvcCBTdG9wIG1vdmUgc3BlY2lmaWMgcGFnZVxuICAgICAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICAgICAqIHBhZ2FuYXRpb24ub24oXCJiZWZvcmVNb3ZlXCIsIGZ1bmN0aW9uKGV2ZW50RGF0YSkge1xuICAgICAgICAgICAgICAgIHZhciBjdXJyZW50UGFnZSA9IGV2ZW50RGF0YS5wYWdlO1xuICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICovXG5cbiAgICAgICAgICAgIGlmICghdGhpcy5pbnZva2UoJ2JlZm9yZU1vdmUnLCB7IHBhZ2U6IHRhcmdldFBhZ2UgfSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9wYWdpbmF0ZSh0YXJnZXRQYWdlKTtcblxuICAgICAgICBpZiAoaXNOb3RSdW5DdXN0b21FdmVudCkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBGaXJlICdhZnRlck1vdmUnXG4gICAgICAgICAgICAgKiBAcGFyYW0ge2NvbXBvbmVudEV2ZW50fSBldmVudERhdGFcbiAgICAgICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudERhdGEuZXZlbnRUeXBlIEN1c3RvbSBldmVudCBuYW1lXG4gICAgICAgICAgICAgKiBAcGFyYW0ge051bWJlcn0gZXZlbnREYXRhLnBhZ2UgTW92ZWQgcGFnZVxuICAgICAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICAgICAqIHBhZ2FuYXRpb24ub24oXCJiZWZvcmVNb3ZlXCIsIGZ1bmN0aW9uKGV2ZW50RGF0YSkge1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRQYWdlID0gZXZlbnREYXRhLnBhZ2U7XG4gICAgICAgICB9KTtcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5maXJlKCdhZnRlck1vdmUnLCB7IHBhZ2U6IHRhcmdldFBhZ2UgfSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hhbmdlIG9wdGlvbiB2YWx1ZVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBvcHRpb25LZXkgVGhlIHRhcmdldCBvcHRpb24ga2V5XG4gICAgICogQHBhcmFtIHsqfSBvcHRpb25WYWx1ZSBUaGUgdGFyZ2V0IG9wdGlvbiB2YWx1ZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgc2V0T3B0aW9uOiBmdW5jdGlvbihvcHRpb25LZXksIG9wdGlvblZhbHVlKSB7XG4gICAgICAgIHRoaXMuX29wdGlvbnNbb3B0aW9uS2V5XSA9IG9wdGlvblZhbHVlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgY3VycmVudCBwYWdlXG4gICAgICogQHJldHVybnMge051bWJlcn0gQ3VycmVudCBwYWdlXG4gICAgICovXG4gICAgZ2V0Q3VycmVudFBhZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY3VycmVudFBhZ2UgfHwgdGhpcy5fb3B0aW9uc1sncGFnZSddO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgaXRlbSAgaW5kZXggZnJvbSBsaXN0XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHBhZ2VOdW1iZXIgUGFnZSBudW1iZXJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgICAqL1xuICAgIGdldEluZGV4T2ZGaXJzdEl0ZW06IGZ1bmN0aW9uKHBhZ2VOdW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0T3B0aW9uKCdpdGVtUGVyUGFnZScpICogKHBhZ2VOdW1iZXIgLSAxKSArIDE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBMYXN0IHBhZ2UgbnVtYmVyXG4gICAgICogQHJldHVybnMge251bWJlcn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRMYXN0UGFnZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBNYXRoLmNlaWwodGhpcy5nZXRPcHRpb24oJ2l0ZW1Db3VudCcpIC8gdGhpcy5nZXRPcHRpb24oJ2l0ZW1QZXJQYWdlJykpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbmRleCBvZiBsaXN0IGluIHRvdGFsIGxpc3RzXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHBhZ2VOdW1iZXIgUGFnZSBudW1iZXJcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0UGFnZUluZGV4OiBmdW5jdGlvbihwYWdlTnVtYmVyKSB7XG4gICAgICAgIC8vIElzQ2VudGVyQWxpZ24gPT0gdHJ1ZSBjYXNlXG4gICAgICAgIGlmICh0aGlzLmdldE9wdGlvbignaXNDZW50ZXJBbGlnbicpKSB7XG4gICAgICAgICAgICB2YXIgbGVmdCA9IE1hdGguZmxvb3IodGhpcy5nZXRPcHRpb24oJ3BhZ2VQZXJQYWdlTGlzdCcpIC8gMiksXG4gICAgICAgICAgICAgICAgcGFnZUluZGV4ID0gcGFnZU51bWJlciAtIGxlZnQ7XG4gICAgICAgICAgICBwYWdlSW5kZXggPSBNYXRoLm1heChwYWdlSW5kZXgsIDEpO1xuICAgICAgICAgICAgcGFnZUluZGV4ID0gTWF0aC5taW4ocGFnZUluZGV4LCB0aGlzLl9nZXRMYXN0UGFnZSgpIC0gdGhpcy5nZXRPcHRpb24oJ3BhZ2VQZXJQYWdlTGlzdCcpICsgMSk7XG4gICAgICAgICAgICByZXR1cm4gcGFnZUluZGV4O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBNYXRoLmNlaWwocGFnZU51bWJlciAvIHRoaXMuZ2V0T3B0aW9uKFwicGFnZVBlclBhZ2VMaXN0XCIpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHBhZ2UgbnVtYmVyIG9mIHByZXYsIG5leHQgcGFnZXNcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcmVsYXRpdmVOYW1lIERpcmVjdGlvbnMocHJlX2VuZCwgbmV4dF9lbmQsIHByZSwgbmV4dClcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAgICogQHByaXZhdGVcbiAgICAgKiAgICAgKi9cbiAgICBfZ2V0UmVsYXRpdmVQYWdlOiBmdW5jdGlvbihyZWxhdGl2ZU5hbWUpIHtcbiAgICAgICAgdmFyIHBhZ2UgPSBudWxsLFxuICAgICAgICAgICAgaXNNb3ZlUGFnZSA9IHRoaXMuZ2V0T3B0aW9uKCdtb3ZlVW5pdCcpID09PSAncGFnZScsXG4gICAgICAgICAgICBjdXJyZW50UGFnZUluZGV4ID0gdGhpcy5fZ2V0UGFnZUluZGV4KHRoaXMuZ2V0Q3VycmVudFBhZ2UoKSk7XG4gICAgICAgIGlmKHRoaXMuZ2V0T3B0aW9uKCdpc0NlbnRlckFsaWduJykpIHtcbiAgICAgICAgICAgIGlmIChyZWxhdGl2ZU5hbWUgPT09ICdwcmUnKSB7XG4gICAgICAgICAgICAgICAgcGFnZSA9IGlzTW92ZVBhZ2UgPyB0aGlzLmdldEN1cnJlbnRQYWdlKCkgLSAxIDogY3VycmVudFBhZ2VJbmRleCAtIDE7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBhZ2UgPSBpc01vdmVQYWdlID8gdGhpcy5nZXRDdXJyZW50UGFnZSgpICsgMSA6IGN1cnJlbnRQYWdlSW5kZXggKyB0aGlzLmdldE9wdGlvbigncGFnZVBlclBhZ2VMaXN0Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAocmVsYXRpdmVOYW1lID09PSAncHJlJykge1xuICAgICAgICAgICAgICAgIHBhZ2UgPSBpc01vdmVQYWdlID8gdGhpcy5nZXRDdXJyZW50UGFnZSgpIC0gMSA6IChjdXJyZW50UGFnZUluZGV4IC0gMSkgKiB0aGlzLmdldE9wdGlvbigncGFnZVBlclBhZ2VMaXN0Jyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBhZ2UgPSBpc01vdmVQYWdlID8gdGhpcy5nZXRDdXJyZW50UGFnZSgpICsgMSA6IGN1cnJlbnRQYWdlSW5kZXggKiB0aGlzLmdldE9wdGlvbigncGFnZVBlclBhZ2VMaXN0JykgKyAxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYWdlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgYXZhaWwgcGFnZSBudW1iZXIgZnJvbSBvdmVyIG51bWJlclxuICAgICAqIElmIHRvdGFsIHBhZ2UgaXMgMjMsIGJ1dCBpbnB1dCBudW1iZXIgaXMgMzAgPT4gcmV0dXJuIDIzXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHBhZ2UgUGFnZSBudW1iZXJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2NvbnZlcnRUb0F2YWlsUGFnZTogZnVuY3Rpb24ocGFnZSkge1xuICAgICAgICB2YXIgbGFzdFBhZ2VOdW1iZXIgPSB0aGlzLl9nZXRMYXN0UGFnZSgpO1xuICAgICAgICBwYWdlID0gTWF0aC5tYXgocGFnZSwgMSk7XG4gICAgICAgIHBhZ2UgPSBNYXRoLm1pbihwYWdlLCBsYXN0UGFnZU51bWJlcik7XG4gICAgICAgIHJldHVybiBwYWdlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgcmVxdWlyZSB2aWV3IHNldCwgbm90aWZ5IHZpZXcgdG8gdXBkYXRlLlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBwYWdlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcGFnaW5hdGU6IGZ1bmN0aW9uKHBhZ2Upe1xuXG4gICAgICAgIC8vIOu3sOydmCDrsoTtirwg67CPIO2OmOydtOyngOulvCDrqqjrkZAg7KCc6rGwIOuwjyDrs7XsgqxcbiAgICAgICAgdGhpcy5fdmlldy5lbXB0eSgpO1xuXG4gICAgICAgIHZhciB2aWV3U2V0ID0ge307XG5cbiAgICAgICAgdmlld1NldC5sYXN0UGFnZSA9IHRoaXMuX2dldExhc3RQYWdlKCk7XG4gICAgICAgIHZpZXdTZXQuY3VycmVudFBhZ2VJbmRleCA9IHRoaXMuX2dldFBhZ2VJbmRleChwYWdlKTtcbiAgICAgICAgdmlld1NldC5sYXN0UGFnZUxpc3RJbmRleCA9IHRoaXMuX2dldFBhZ2VJbmRleCh2aWV3U2V0Lmxhc3RQYWdlKTtcbiAgICAgICAgdmlld1NldC5wYWdlID0gcGFnZTtcblxuICAgICAgICB0aGlzLl92aWV3LnVwZGF0ZSh2aWV3U2V0LCBwYWdlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUGFnZWxpc3QgY2xpY2sgZXZlbnQgaGFkbmxlclxuICAgICAqIEBwYXJhbSB7SlF1ZXJ5RXZlbnR9IGV2ZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25DbGlja1BhZ2VMaXN0OiBmdW5jdGlvbihldmVudCkge1xuXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHZhciBwYWdlID0gbnVsbCxcbiAgICAgICAgICAgIHRhcmdldEVsZW1lbnQgPSAkKGV2ZW50LnRhcmdldCksXG4gICAgICAgICAgICB0YXJnZXRQYWdlO1xuXG4gICAgICAgIGlmICh0aGlzLl92aWV3LmlzSW4odGFyZ2V0RWxlbWVudCwgdGhpcy5nZXRPcHRpb24oJyRwcmVfZW5kT24nKSkpIHtcbiAgICAgICAgICAgIHBhZ2UgPSAxO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX3ZpZXcuaXNJbih0YXJnZXRFbGVtZW50LCB0aGlzLmdldE9wdGlvbignJGxhc3RPbicpKSkge1xuICAgICAgICAgICAgcGFnZSA9IHRoaXMuX2dldExhc3RQYWdlKCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fdmlldy5pc0luKHRhcmdldEVsZW1lbnQsIHRoaXMuZ2V0T3B0aW9uKCckcHJlT24nKSkpIHtcbiAgICAgICAgICAgIHBhZ2UgPSB0aGlzLl9nZXRSZWxhdGl2ZVBhZ2UoJ3ByZScpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX3ZpZXcuaXNJbih0YXJnZXRFbGVtZW50LCB0aGlzLmdldE9wdGlvbignJG5leHRPbicpKSkge1xuICAgICAgICAgICAgcGFnZSA9IHRoaXMuX2dldFJlbGF0aXZlUGFnZSgnbmV4dCcpO1xuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICB0YXJnZXRQYWdlID0gdGhpcy5fdmlldy5nZXRQYWdlRWxlbWVudCh0YXJnZXRFbGVtZW50KTtcblxuICAgICAgICAgICAgaWYgKHRhcmdldFBhZ2UgJiYgdGFyZ2V0UGFnZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBwYWdlID0gcGFyc2VJbnQodGFyZ2V0UGFnZS50ZXh0KCksIDEwKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICBGaXJlICdjbGljaycgY3VzdG9tIGV2ZW50IHdoZW4gcGFnZSBidXR0b24gY2xpY2tlZFxuICAgICAgICAgQHBhcmFtIHtjb21wb25lbnRFdmVudH0gZXZlbnREYXRhXG4gICAgICAgICBAcGFyYW0ge1N0cmluZ30gZXZlbnREYXRhLmV2ZW50VHlwZSBDdXN0b20gZXZlbnQgbmFtZVxuICAgICAgICAgQHBhcmFtIHtOdW1iZXJ9IGV2ZW50RGF0YS5wYWdlIFBhZ2UgdG8gbW92ZVxuICAgICAgICAgQHBhcmFtIHtGdW5jdGlvbn0gZXZlbnREYXRhLnN0b3AgU3RvcCBwYWdlIG1vdmVcbiAgICAgICAgICoqL1xuXG4gICAgICAgIHZhciBpc0ZpcmVkID0gdGhpcy5pbnZva2UoXCJjbGlja1wiLCB7XCJwYWdlXCIgOiBwYWdlfSk7XG4gICAgICAgIGlmICghaXNGaXJlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5tb3ZlUGFnZVRvKHBhZ2UpO1xuICAgIH1cbn0pO1xuLy8gQ3VzdG9tRXZlbnQgIE1peGluXG5uZS51dGlsLkN1c3RvbUV2ZW50cy5taXhpbihQYWdpbmF0aW9uKTtcblxubW9kdWxlLmV4cG9ydHMgPSBQYWdpbmF0aW9uOyIsIi8qKlxuICogQGZpbGVvdmVydmlldyBQYWdpbmF0aW9uIHZpZXcgbWFuYWdlIGFsbCBvZiBkcmF3IGVsZW1lbnRzXG4gKiAoZnJvbSBwdWcuUGFnaW5hdGlvbilcbiAqIEBhdXRob3IgTkhOIGVudGVydGFpbm1lbnQgRkUgZGV2IHRlYW0gSmVpbiBZaShqZWluLnlpQG5obmVudC5jb20pXG4gKiBAZGVwZW5kZW5jeSBwYWdpbmF0aW9uLmpzXG4gKi9cbi8qKlxuICogQGNvbnN0cnVjdG9yIG5lLmNvbXBvbmVudC5QYWdpbmF0aW9uLlBhZ2luYXRpb25WaWV3XG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBPcHRpb24gb2JqZWN0XG4gKiBAcGFyYW0ge09iamVjdH0gJGVsZW1lbnQgQ29udGFpbmVyIGVsZW1lbnRcbiAqXG4gKi9cbnZhciBWaWV3ID0gbmUudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIG5lLmNvbXBvbmVudC5QYWdpbmF0aW9uLlBhZ2luYXRpb25WaWV3LnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb25zLCAkZWxlbWVudCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogUGFnaW5hdGlvbiByb290IGVsZW1lbnRcbiAgICAgICAgICogQHR5cGUge2pRdWVyeU9iamVjdH1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2VsZW1lbnQgPSAkZWxlbWVudDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogUGFnaW5hdGlvbiBvcHRpb25zXG4gICAgICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9vcHRpb25zID0gb3B0aW9ucztcblxuICAgICAgICAvKipcbiAgICAgICAgICogU2VsZWN0b3JzXG4gICAgICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9lbGVtZW50U2VsZWN0b3IgPSB7fTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogUGFnZSBpdGVtIGxpc3RcbiAgICAgICAgICogQHR5cGUge0FycmF5fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fcGFnZUl0ZW1MaXN0ID0gW107XG5cbiAgICAgICAgbmUudXRpbC5leHRlbmQob3B0aW9ucywge1xuICAgICAgICAgICAgJHByZV9lbmRPbjogb3B0aW9uc1snJHByZV9lbmRPbiddIHx8ICQoJ2EuJyArIHRoaXMuX3dyYXBQcmVmaXgoJ3ByZV9lbmQnKSwgdGhpcy5fZWxlbWVudCksXG4gICAgICAgICAgICAkcHJlT246IG9wdGlvbnNbJyRwcmVPbiddIHx8ICQoJ2EuJyArIHRoaXMuX3dyYXBQcmVmaXgoJ3ByZScpLCB0aGlzLl9lbGVtZW50KSxcbiAgICAgICAgICAgICRuZXh0T246IG9wdGlvbnNbJyRuZXh0T24nXSB8fCAkKCdhLicgKyB0aGlzLl93cmFwUHJlZml4KCduZXh0JyksIHRoaXMuX2VsZW1lbnQpLFxuICAgICAgICAgICAgJGxhc3RPbjogb3B0aW9uc1snJGxhc3RPbiddIHx8ICQoJ2EuJyArIHRoaXMuX3dyYXBQcmVmaXgoJ25leHRfZW5kJyksIHRoaXMuX2VsZW1lbnQpLFxuICAgICAgICAgICAgJHByZV9lbmRPZmY6IG9wdGlvbnNbJyRwcmVfZW5kT2ZmJ10gfHwgJCgnc3Bhbi4nICsgdGhpcy5fd3JhcFByZWZpeCgncHJlX2VuZCcpLCB0aGlzLl9lbGVtZW50KSxcbiAgICAgICAgICAgICRwcmVPZmY6IG9wdGlvbnNbJyRwcmVPZmYnXSB8fCAkKCdzcGFuLicgKyB0aGlzLl93cmFwUHJlZml4KCdwcmUnKSwgdGhpcy5fZWxlbWVudCksXG4gICAgICAgICAgICAkbmV4dE9mZjogb3B0aW9uc1snJG5leHRPZmYnXSB8fCAkKCdzcGFuLicgKyB0aGlzLl93cmFwUHJlZml4KCduZXh0JyksIHRoaXMuX2VsZW1lbnQpLFxuICAgICAgICAgICAgJGxhc3RPZmY6IG9wdGlvbnNbJyRsYXN0T2ZmJ10gfHwgJCgnc3Bhbi4nICsgdGhpcy5fd3JhcFByZWZpeCgnbmV4dF9lbmQnKSwgdGhpcy5fZWxlbWVudClcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuYWRkQ2xhc3ModGhpcy5fd3JhcFByZWZpeCgnbG9hZGVkJykpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgdmlld1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSB2aWV3U2V0IFZhbHVlcyBvZiBlYWNoIHBhZ2luYXRpb24gdmlldyBjb21wb25lbnRzXG4gICAgICovXG4gICAgdXBkYXRlOiBmdW5jdGlvbih2aWV3U2V0KSB7XG4gICAgICAgIHRoaXMuX2FkZFRleHROb2RlKCk7XG4gICAgICAgIHRoaXMuX3NldFBhZ2VSZXN1bHQodmlld1NldC5sYXN0UGFnZSk7XG5cbiAgICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLl9vcHRpb25zLFxuICAgICAgICAgICAgZWRnZXMgPSB0aGlzLl9nZXRFZGdlKHZpZXdTZXQpLFxuICAgICAgICAgICAgbGVmdFBhZ2VOdW1iZXIgPSBlZGdlcy5sZWZ0LFxuICAgICAgICAgICAgcmlnaHRQYWdlTnVtYmVyID0gZWRnZXMucmlnaHQ7XG5cbiAgICAgICAgdmlld1NldC5sZWZ0UGFnZU51bWJlciA9IGxlZnRQYWdlTnVtYmVyO1xuICAgICAgICB2aWV3U2V0LnJpZ2h0UGFnZU51bWJlciA9IHJpZ2h0UGFnZU51bWJlcjtcblxuICAgICAgICBpZiAob3B0aW9ucy5tb3ZlVW5pdCA9PT0gJ3BhZ2UnKSB7XG4gICAgICAgICAgICB2aWV3U2V0LmN1cnJlbnRQYWdlSW5kZXggPSB2aWV3U2V0LnBhZ2U7XG4gICAgICAgICAgICB2aWV3U2V0Lmxhc3RQYWdlTGlzdEluZGV4ID0gdmlld1NldC5sYXN0UGFnZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3NldEZpcnN0KHZpZXdTZXQpO1xuICAgICAgICB0aGlzLl9zZXRQcmV2KHZpZXdTZXQpO1xuICAgICAgICB0aGlzLl9zZXRQYWdlTnVtYmVycyh2aWV3U2V0KTtcbiAgICAgICAgdGhpcy5fc2V0TmV4dCh2aWV3U2V0KTtcbiAgICAgICAgdGhpcy5fc2V0TGFzdCh2aWV3U2V0KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaW5jbHVkZVxuICAgICAqIEBwYXJhbSB7SlF1ZXJ5T2JqZWN0fSAkZmluZCBUYXJnZXQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7SlF1ZXJ5T2JqZWN0fSAkcGFyZW50IFdyYXBwZXIgZWxlbWVudFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIGlzSW46IGZ1bmN0aW9uKCRmaW5kLCAkcGFyZW50KSB7XG4gICAgICAgIGlmICghJHBhcmVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAoJGZpbmRbMF0gPT09ICRwYXJlbnRbMF0pID8gdHJ1ZSA6ICQuY29udGFpbnMoJHBhcmVudCwgJGZpbmQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgYmFzZShyb290KSBlbGVtZW50XG4gICAgICogQHJldHVybnMge0pRdWVyeU9iamVjdH1cbiAgICAgKi9cbiAgICBnZXRCYXNlRWxlbWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldEVsZW1lbnQoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVzZXQgYmFzZSBlbGVtZW50XG4gICAgICovXG4gICAgZW1wdHk6IGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLl9vcHRpb25zLFxuICAgICAgICAgICAgJHByZV9lbmRPbiA9IG9wdGlvbnMuJHByZV9lbmRPbixcbiAgICAgICAgICAgICRwcmVPbiA9IG9wdGlvbnMuJHByZU9uLFxuICAgICAgICAgICAgJG5leHRPbiA9IG9wdGlvbnMuJG5leHRPbixcbiAgICAgICAgICAgICRsYXN0T24gPSBvcHRpb25zLiRsYXN0T24sXG4gICAgICAgICAgICAkcHJlX2VuZE9mZiA9IG9wdGlvbnMuJHByZV9lbmRPZmYsXG4gICAgICAgICAgICAkcHJlT2ZmID0gb3B0aW9ucy4kcHJlT2ZmLFxuICAgICAgICAgICAgJG5leHRPZmYgPSBvcHRpb25zLiRuZXh0T2ZmLFxuICAgICAgICAgICAgJGxhc3RPZmYgPSBvcHRpb25zLiRsYXN0T2ZmO1xuXG4gICAgICAgIG9wdGlvbnMuJHByZV9lbmRPbiA9IHRoaXMuX2Nsb25lKCRwcmVfZW5kT24pO1xuICAgICAgICBvcHRpb25zLiRwcmVPbiA9IHRoaXMuX2Nsb25lKCRwcmVPbik7XG4gICAgICAgIG9wdGlvbnMuJGxhc3RPbiA9IHRoaXMuX2Nsb25lKCRsYXN0T24pO1xuICAgICAgICBvcHRpb25zLiRuZXh0T24gPSB0aGlzLl9jbG9uZSgkbmV4dE9uKTtcbiAgICAgICAgb3B0aW9ucy4kcHJlX2VuZE9mZiA9IHRoaXMuX2Nsb25lKCRwcmVfZW5kT2ZmKTtcbiAgICAgICAgb3B0aW9ucy4kcHJlT2ZmID0gdGhpcy5fY2xvbmUoJHByZU9mZik7XG4gICAgICAgIG9wdGlvbnMuJGxhc3RPZmYgPSB0aGlzLl9jbG9uZSgkbGFzdE9mZik7XG4gICAgICAgIG9wdGlvbnMuJG5leHRPZmYgPSB0aGlzLl9jbG9uZSgkbmV4dE9mZik7XG5cbiAgICAgICAgdGhpcy5fcGFnZUl0ZW1MaXN0ID0gW107XG5cbiAgICAgICAgdGhpcy5fZWxlbWVudC5lbXB0eSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGaW5kIHRhcmdldCBlbGVtZW50IGZyb20gcGFnZSBlbGVtZW50c1xuICAgICAqIEBwYXJhbSB7alF1ZXJ5T2JqZWN0fEhUTUxFbGVtZW50fSBlbCBUYXJnZXQgZWxlbWVudFxuICAgICAqIEByZXR1cm4ge2pRdWVyeU9iamVjdH1cbiAgICAgKi9cbiAgICBnZXRQYWdlRWxlbWVudDogZnVuY3Rpb24oZWwpIHtcblxuICAgICAgICB2YXIgaSxcbiAgICAgICAgICAgIGxlbmd0aCxcbiAgICAgICAgICAgIHBpY2tlZEl0ZW07XG5cbiAgICAgICAgZm9yIChpID0gMCwgbGVuZ3RoID0gdGhpcy5fcGFnZUl0ZW1MaXN0Lmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBwaWNrZWRJdGVtID0gdGhpcy5fcGFnZUl0ZW1MaXN0W2ldO1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNJbihlbCwgcGlja2VkSXRlbSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGlja2VkSXRlbTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIEV2ZW50c1xuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFR5cGUgRXZlbnQgbmFtZSB0byBhdHRhY2hcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBDYWxsYmFjayBmdW5jdGlvblxuICAgICAqL1xuICAgIGF0dGFjaEV2ZW50OiBmdW5jdGlvbihldmVudFR5cGUsIGNhbGxiYWNrKSB7XG5cbiAgICAgICAgdmFyIHRhcmdldEVsZW1lbnQgPSB0aGlzLl9lbGVtZW50LFxuICAgICAgICAgICAgaXNTYXZlZEVsZW1lbnQgPSBuZS51dGlsLmlzU3RyaW5nKHRhcmdldEVsZW1lbnQpICYmIHRoaXMuX2VsZW1lbnRTZWxlY3Rvclt0YXJnZXRFbGVtZW50XTtcblxuICAgICAgICBpZiAoaXNTYXZlZEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHRhcmdldEVsZW1lbnQgPSB0aGlzLl9nZXRFbGVtZW50KHRhcmdldEVsZW1lbnQsIHRydWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRhcmdldEVsZW1lbnQgJiYgZXZlbnRUeXBlICYmIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAkKHRhcmdldEVsZW1lbnQpLmJpbmQoZXZlbnRUeXBlLCBudWxsLCBjYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHJvb3QgZWxlbWVudFxuICAgICAqIEByZXR1cm5zIHtqUXVlcnlPYmplY3R9XG4gICAgICovXG4gICAgZ2V0RWxlbWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9lbGVtZW50O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gY2xhc3NOYW1lIGFkZGVkIHByZWZpeFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjbGFzc05hbWUgQ2xhc3MgbmFtZSB0byBiZSB3cmFwcGluZ1xuICAgICAqIEByZXR1cm5zIHsqfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3dyYXBQcmVmaXg6IGZ1bmN0aW9uKGNsYXNzTmFtZSkge1xuICAgICAgICB2YXIgY2xhc3NQcmVmaXggPSB0aGlzLl9vcHRpb25zWydjbGFzc1ByZWZpeCddO1xuICAgICAgICByZXR1cm4gY2xhc3NQcmVmaXggPyBjbGFzc1ByZWZpeCArIGNsYXNzTmFtZS5yZXBsYWNlKC9fL2csICctJykgOiBjbGFzc05hbWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFB1dCBpbnNlcnRUZXh0Tm9kZSBiZXR3ZWVuIHBhZ2UgaXRlbXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hZGRUZXh0Tm9kZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB0ZXh0Tm9kZSA9IHRoaXMuX29wdGlvbnNbJ2luc2VydFRleHROb2RlJ107XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuYXBwZW5kKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRleHROb2RlKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENsb25lIGVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jbG9uZTogZnVuY3Rpb24oJGxpbmspIHtcblxuICAgICAgICBpZiAoJGxpbmsgJiYgJGxpbmsubGVuZ3RoICYmICRsaW5rLmdldCgwKS5jbG9uZU5vZGUpIHtcbiAgICAgICAgICAgIHJldHVybiAkKCRsaW5rLmdldCgwKS5jbG9uZU5vZGUodHJ1ZSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAkbGluaztcblxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBXcmFwcGluZyBjbGFzcyBieSBwYWdlIHJlc3VsdFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBsYXN0TnVtIExhc3QgcGFnZSBudW1iZXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRQYWdlUmVzdWx0OiBmdW5jdGlvbihsYXN0TnVtKSB7XG5cbiAgICAgICAgaWYgKGxhc3ROdW0gPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuX2VsZW1lbnQuYWRkQ2xhc3ModGhpcy5fd3JhcFByZWZpeCgnbm8tcmVzdWx0JykpO1xuICAgICAgICB9IGVsc2UgaWYgKGxhc3ROdW0gPT09IDEpIHtcbiAgICAgICAgICAgIHRoaXMuX2VsZW1lbnQuYWRkQ2xhc3ModGhpcy5fd3JhcFByZWZpeCgnb25seS1vbmUnKSkucmVtb3ZlQ2xhc3ModGhpcy5fd3JhcFByZWZpeCgnbm8tcmVzdWx0JykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fZWxlbWVudC5yZW1vdmVDbGFzcyh0aGlzLl93cmFwUHJlZml4KCdvbmx5LW9uZScpKS5yZW1vdmVDbGFzcyh0aGlzLl93cmFwUHJlZml4KCduby1yZXN1bHQnKSk7XG4gICAgICAgIH1cblxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgZWFjaCBlZGdlIHBhZ2VcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdmlld1NldCBQYWdpbmF0aW9uIHZpZXcgZWxlbWVudHMgc2V0XG4gICAgICogQHJldHVybnMge3tsZWZ0OiAqLCByaWdodDogKn19XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0RWRnZTogZnVuY3Rpb24odmlld1NldCkge1xuXG4gICAgICAgIHZhciBvcHRpb25zID0gdGhpcy5fb3B0aW9ucyxcbiAgICAgICAgICAgIGxlZnRQYWdlTnVtYmVyLFxuICAgICAgICAgICAgcmlnaHRQYWdlTnVtYmVyLFxuICAgICAgICAgICAgbGVmdDtcblxuICAgICAgICBpZiAob3B0aW9ucy5pc0NlbnRlckFsaWduKSB7XG5cbiAgICAgICAgICAgIGxlZnQgPSBNYXRoLmZsb29yKG9wdGlvbnMucGFnZVBlclBhZ2VMaXN0IC8gMik7XG4gICAgICAgICAgICBsZWZ0UGFnZU51bWJlciA9IHZpZXdTZXQucGFnZSAtIGxlZnQ7XG4gICAgICAgICAgICBsZWZ0UGFnZU51bWJlciA9IE1hdGgubWF4KGxlZnRQYWdlTnVtYmVyLCAxKTtcbiAgICAgICAgICAgIHJpZ2h0UGFnZU51bWJlciA9IGxlZnRQYWdlTnVtYmVyICsgb3B0aW9ucy5wYWdlUGVyUGFnZUxpc3QgLSAxO1xuXG4gICAgICAgICAgICBpZiAocmlnaHRQYWdlTnVtYmVyID4gdmlld1NldC5sYXN0UGFnZSkge1xuICAgICAgICAgICAgICAgIGxlZnRQYWdlTnVtYmVyID0gdmlld1NldC5sYXN0UGFnZSAtIG9wdGlvbnMucGFnZVBlclBhZ2VMaXN0ICsgMTtcbiAgICAgICAgICAgICAgICBsZWZ0UGFnZU51bWJlciA9IE1hdGgubWF4KGxlZnRQYWdlTnVtYmVyLCAxKTtcbiAgICAgICAgICAgICAgICByaWdodFBhZ2VOdW1iZXIgPSB2aWV3U2V0Lmxhc3RQYWdlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIGxlZnRQYWdlTnVtYmVyID0gKHZpZXdTZXQuY3VycmVudFBhZ2VJbmRleCAtIDEpICogb3B0aW9ucy5wYWdlUGVyUGFnZUxpc3QgKyAxO1xuICAgICAgICAgICAgcmlnaHRQYWdlTnVtYmVyID0gKHZpZXdTZXQuY3VycmVudFBhZ2VJbmRleCkgKiBvcHRpb25zLnBhZ2VQZXJQYWdlTGlzdDtcbiAgICAgICAgICAgIHJpZ2h0UGFnZU51bWJlciA9IE1hdGgubWluKHJpZ2h0UGFnZU51bWJlciwgdmlld1NldC5sYXN0UGFnZSk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsZWZ0OiBsZWZ0UGFnZU51bWJlcixcbiAgICAgICAgICAgIHJpZ2h0OiByaWdodFBhZ2VOdW1iZXJcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRGVjaWRlIHRvIHNob3cgZmlyc3QgcGFnZSBsaW5rIGJ5IHdoZXRoZXIgZmlyc3QgcGFnZSBvciBub3RcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdmlld1NldCBQYWdpbmF0aW9uIHZpZXcgZWxlbWVudHMgc2V0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0Rmlyc3Q6IGZ1bmN0aW9uKHZpZXdTZXQpIHtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLl9vcHRpb25zO1xuICAgICAgICBpZiAodmlld1NldC5wYWdlID4gMSkge1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMuJHByZV9lbmRPbikge1xuICAgICAgICAgICAgICAgIHRoaXMuX2VsZW1lbnQuYXBwZW5kKG9wdGlvbnMuJHByZV9lbmRPbik7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkVGV4dE5vZGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLiRwcmVfZW5kT2ZmKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZWxlbWVudC5hcHBlbmQob3B0aW9ucy4kcHJlX2VuZE9mZik7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkVGV4dE5vZGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIERlY2lkZSB0byBzaG93IHByZXZpb3VzIHBhZ2UgbGluayBieSB3aGV0aGVyIGZpcnN0IHBhZ2Ugb3Igbm90XG4gICAgICogQHBhcmFtIHtvYmplY3R9IHZpZXdTZXQgUGFnaW5hdGlvbiB2aWV3IGVsZW1lbnRzIHNldFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldFByZXY6IGZ1bmN0aW9uKHZpZXdTZXQpIHtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLl9vcHRpb25zO1xuXG4gICAgICAgIGlmICh2aWV3U2V0LmN1cnJlbnRQYWdlSW5kZXggPiAxKSB7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy4kcHJlT24pIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9lbGVtZW50LmFwcGVuZChvcHRpb25zLiRwcmVPbik7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkVGV4dE5vZGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLiRwcmVPZmYpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9lbGVtZW50LmFwcGVuZChvcHRpb25zLiRwcmVPZmYpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2FkZFRleHROb2RlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8qKlxuICAgICAqIERlY2lkZSB0byBzaG93IG5leHQgcGFnZSBsaW5rIGJ5IHdoZXRoZXIgZmlyc3QgcGFnZSBvciBub3RcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdmlld1NldCBQYWdpbmF0aW9uIHZpZXcgZWxlbWVudHMgc2V0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0TmV4dDogZnVuY3Rpb24odmlld1NldCkge1xuICAgICAgICB2YXIgb3B0aW9ucyA9IHRoaXMuX29wdGlvbnM7XG5cbiAgICAgICAgaWYgKHZpZXdTZXQuY3VycmVudFBhZ2VJbmRleCA8IHZpZXdTZXQubGFzdFBhZ2VMaXN0SW5kZXgpIHtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLiRuZXh0T24pIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9lbGVtZW50LmFwcGVuZChvcHRpb25zLiRuZXh0T24pO1xuICAgICAgICAgICAgICAgIHRoaXMuX2FkZFRleHROb2RlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy4kbmV4dE9mZikge1xuICAgICAgICAgICAgICAgIHRoaXMuX2VsZW1lbnQuYXBwZW5kKG9wdGlvbnMuJG5leHRPZmYpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2FkZFRleHROb2RlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH0sXG4gICAgLyoqXG4gICAgICogRGVjaWRlIHRvIHNob3cgbGFzdCBwYWdlIGxpbmsgYnkgd2hldGhlciBmaXJzdCBwYWdlIG9yIG5vdFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB2aWV3U2V0IFBhZ2luYXRpb24gdmlldyBlbGVtZW50cyBzZXRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRMYXN0OiBmdW5jdGlvbih2aWV3U2V0KSB7XG5cbiAgICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLl9vcHRpb25zO1xuXG4gICAgICAgIGlmICh2aWV3U2V0LnBhZ2UgPCB2aWV3U2V0Lmxhc3RQYWdlKSB7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy4kbGFzdE9uKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZWxlbWVudC5hcHBlbmQob3B0aW9ucy4kbGFzdE9uKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRUZXh0Tm9kZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMuJGxhc3RPZmYpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9lbGVtZW50LmFwcGVuZChvcHRpb25zLiRsYXN0T2ZmKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRUZXh0Tm9kZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFNldCBwYWdlIG51bWJlciB0aGF0IHdpbGwgYmUgZHJhd25cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdmlld1NldCBQYWdpbmF0aW9uIHZpZXcgZWxlbWVudHMgc2V0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0UGFnZU51bWJlcnM6IGZ1bmN0aW9uKHZpZXdTZXQpIHtcbiAgICAgICAgdmFyICRwYWdlSXRlbSxcbiAgICAgICAgICAgIGZpcnN0UGFnZSA9IHZpZXdTZXQubGVmdFBhZ2VOdW1iZXIsXG4gICAgICAgICAgICBsYXN0UGFnZSA9IHZpZXdTZXQucmlnaHRQYWdlTnVtYmVyLFxuICAgICAgICAgICAgb3B0aW9ucyA9IHRoaXMuX29wdGlvbnMsXG4gICAgICAgICAgICBpO1xuXG4gICAgICAgIGZvciAoaSA9IGZpcnN0UGFnZTsgaSA8PSBsYXN0UGFnZTsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoaSA9PT0gdmlld1NldC5wYWdlKSB7XG4gICAgICAgICAgICAgICAgJHBhZ2VJdGVtID0gJChvcHRpb25zLmN1cnJlbnRQYWdlVGVtcGxhdGUucmVwbGFjZSgnez1wYWdlfScsIGkudG9TdHJpbmcoKSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkcGFnZUl0ZW0gPSAkKG9wdGlvbnMucGFnZVRlbXBsYXRlLnJlcGxhY2UoJ3s9cGFnZX0nLCBpLnRvU3RyaW5nKCkpKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9wYWdlSXRlbUxpc3QucHVzaCgkcGFnZUl0ZW0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaSA9PT0gZmlyc3RQYWdlKSB7XG4gICAgICAgICAgICAgICAgJHBhZ2VJdGVtLmFkZENsYXNzKHRoaXMuX3dyYXBQcmVmaXgob3B0aW9uc1snZmlyc3RJdGVtQ2xhc3NOYW1lJ10pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpID09PSBsYXN0UGFnZSkge1xuICAgICAgICAgICAgICAgICRwYWdlSXRlbS5hZGRDbGFzcyh0aGlzLl93cmFwUHJlZml4KG9wdGlvbnNbJ2xhc3RJdGVtQ2xhc3NOYW1lJ10pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX2VsZW1lbnQuYXBwZW5kKCRwYWdlSXRlbSk7XG4gICAgICAgICAgICB0aGlzLl9hZGRUZXh0Tm9kZSgpO1xuICAgICAgICB9XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVmlldzsiXX0=
