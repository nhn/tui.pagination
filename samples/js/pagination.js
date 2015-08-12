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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9qcy9wYWdpbmF0aW9uLmpzIiwic3JjL2pzL3ZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0VUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibmUudXRpbC5kZWZpbmVOYW1lc3BhY2UoJ25lLmNvbXBvbmVudC5QYWdpbmF0aW9uJywgcmVxdWlyZSgnLi9zcmMvanMvcGFnaW5hdGlvbi5qcycpKTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBDb3JlIG9mIHBhZ2luYXRpb24gY29tcG9uZW50LCBjcmVhdGUgcGFnaW5hdGlvbiB2aWV3IGFuZCBhdHRhY2ggZXZlbnRzLlxuICogKGZyb20gcHVnLlBhZ2luYXRpb24pXG4gKiBAYXV0aG9yIE5ITiBlbnRlcnRhaW5tZW50IEZFIGRldiB0ZWFtKGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbSlcbiAqIEBkZXBlbmRlbmN5IGpxdWVyeS0xLjguMy5taW4uanMsIGNvZGUtc25pcHBldC5qc1xuICovXG5cbnZhciBWaWV3ID0gcmVxdWlyZSgnLi92aWV3LmpzJyk7XG5cbi8qKlxuICogUGFnaW5hdGlvbiBjb3JlIGNsYXNzXG4gKiBAY29uc3RydWN0b3IgbmUuY29tcG9uZW50LlBhZ2luYXRpb25cbiAqXG4gKi9cbnZhciBQYWdpbmF0aW9uID0gbmUudXRpbC5kZWZpbmVDbGFzcygvKipAbGVuZHMgbmUuY29tcG9uZW50LlBhZ2luYXRpb24ucHJvdG90eXBlICove1xuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVcbiAgICAgKiBAcGFyYW0ge0RhdGFPYmplY3R9IG9wdGlvbnMgT3B0aW9uIG9iamVjdFxuICAgICAqIFx0XHRAcGFyYW0ge051bWJlcn0gW29wdGlvbnMuaXRlbUNvdW50PTEwXSBUb3RhbCBpdGVtIGNvdW50XG4gICAgICogXHRcdEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5pdGVtUGVyUGFnZT0xMF0gSXRlbSBjb3VudCBwZXIgcGFnZVxuICAgICAqIFx0XHRAcGFyYW0ge051bWJlcn0gW29wdGlvbnMucGFnZVBlclBhZ2VMaXN0PTEwXSBEaXNwbGF5IHBhZ2UgbGluayBjb3VudFxuICAgICAqIFx0XHRAcGFyYW0ge051bWJlcn0gW29wdGlvbnMucGFnZT0xXSBwYWdlIERpc3BsYXkgcGFnZSBhZnRlciBwYWdpbmF0aW9uIGRyYXcuXG4gICAgICogXHRcdEBwYXJhbSB7U3RyaW5nfSBbb3B0aW9ucy5tb3ZlVW5pdD1cInBhZ2VsaXN0XCJdIFBhZ2UgbW92ZSB1bml0LlxuICAgICAqIFx0XHRcdDx1bD5cbiAgICAgKiBcdFx0XHRcdDxsaT5wYWdlbGlzdCA6IE1vdmUgcGFnZSBmb3IgdW5pdDwvbGk+XG4gICAgICogXHRcdFx0XHQ8bGk+cGFnZSA6IE1vdmUgb25lIHBhZ2U8L2xpPlxuICAgICAqIFx0XHRcdDwvdWw+XG4gICAgICogXHRcdEBwYXJhbSB7Qm9vbGVhbn1bb3B0aW9ucy5pc0NlbnRlckFsaWduPWZhbHNlXSBXaGV0aGVyIGN1cnJlbnQgcGFnZSBrZWVwIGNlbnRlciBvciBub3RcbiAgICAgKiBcdFx0QHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLmluc2VydFRleHROb2RlPVwiXCJdIFRoZSBjb3VwbGVyIGJldHdlZW4gcGFnZSBsaW5rc1xuICAgICAqIFx0XHRAcGFyYW0ge1N0cmluZ30gW29wdGlvbnMuY2xhc3NQcmVmaXg9XCJcIl0gQSBwcmVmaXggb2YgY2xhc3MgbmFtZVxuICAgICAqIFx0XHRAcGFyYW0ge1N0cmluZ30gW29wdGlvbnMuZmlyc3RJdGVtQ2xhc3NOYW1lPVwiZmlyc3QtY2hpbGRcIl0gVGhlIGNsYXNzIG5hbWUgaXMgZ3JhbnRlZCBmaXJzdCBwYWdlIGxpbmsgaXRlbVxuICAgICAqIFx0XHRAcGFyYW0ge1N0cmluZ30gW29wdGlvbnMubGFzdEl0ZW1DbGFzc05hbWU9XCJsYXN0LWNoaWxkXCJdIFRoZSBjbGFzcyBuYW1lIGlzIGdyYW50ZWQgZmlyc3QgcGFnZSBsaW5rIGl0ZW1cbiAgICAgKiBcdFx0QHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLnBhZ2VUZW1wbGF0ZT1cIjxhIGhyZWY9JyMnPns9cGFnZX08L2E+XCJdIFRoZSBtYXJrdXAgdGVtcGxhdGUgdG8gc2hvdyBwYWdlIGl0ZW0gc3VjaCBhcyAxLCAyLCAzLCAuLiB7PXBhZ2V9IHdpbGwgYmUgY2hhbmdlZCBlYWNoIHBhZ2UgbnVtYmVyLlxuICAgICAqIFx0XHRAcGFyYW0ge1N0cmluZ30gW29wdGlvbnMuY3VycmVudFBhZ2VUZW1wbGF0ZT1cIjxzdHJvbmc+ez1wYWdlfTwvc3Ryb25nPlwiXSBUaGUgbWFya3VwIHRlbXBsYXRlIGZvciBjdXJyZW50IHBhZ2Ugez1wYWdlfSB3aWxsIGJlIGNoYW5nZWQgY3VycmVudCBwYWdlIG51bWJlci5cbiAgICAgKiBcdFx0QHBhcmFtIHtqUXVlcnlPYmplY3R9IFtvcHRpb25zLiRwcmVfZW5kT25dIFRoZSBidXR0b24gZWxlbWVudCB0byBtb3ZlIGZpcnN0IHBhZ2UuIElmIHRoaXMgb3B0aW9uIGlzIG5vdCBleGlzdCBhbmQgdGhlIGVsZW1lbnQgdGhhdCBoYXMgY2xhc3MgJ3ByZV9lbmQnLCBjb21wb25lbnQgZG8gbm90IGNyZWF0ZSB0aGlzIGJ1dHRvbi5cbiAgICAgKiBcdFx0QHBhcmFtIHtqUXVlcnlPYmplY3R9IFtvcHRpb25zLiRwcmVPbl0gVGhlIGJ1dHRvbiBlbGVtZW50IHRvIG1vdmUgcHJldmlvdXNlIHBhZ2UuIElmIHRoaXMgb3B0aW9uIGlzIG5vdCBleGlzdCBhbmQgdGhlIGVsZW1lbnQgdGhhdCBoYXMgY2xhc3MgJ3ByZScsIGNvbXBvbmVudCBkbyBub3QgY3JlYXRlIHRoaXMgYnV0dG9uLlxuICAgICAqIFx0XHRAcGFyYW0ge2pRdWVyeU9iamVjdH0gW29wdGlvbnMuJG5leHRPbl0gVGhlIGJ1dHRvbiBlbGVtZW50IHRvIG1vdmUgbmV4dCBwYWdlLiBJZiB0aGlzIG9wdGlvbiBpcyBub3QgZXhpc3QgYW5kIHRoZSBlbGVtZW50IHRoYXQgaGFzIGNsYXNzICduZXh0JywgY29tcG9uZW50IGRvIG5vdCBjcmVhdGUgdGhpcyBidXR0b24uXG4gICAgICogXHRcdEBwYXJhbSB7alF1ZXJ5T2JqZWN0fSBbb3B0aW9ucy4kbGFzdE9uXSBUaGUgYnV0dG9uIGVsZW1lbnQgdG8gbW92ZSBsYXN0IHBhZ2UuIElmIHRoaXMgb3B0aW9uIGlzIG5vdCBleGlzdCBhbmQgdGhlIGVsZW1lbnQgdGhhdCBoYXMgY2xhc3MgJ2xhc3QnLCBjb21wb25lbnQgZG8gbm90IGNyZWF0ZSB0aGlzIGJ1dHRvbi5cbiAgICAgKiBcdFx0QHBhcmFtIHtqUXVlcnlPYmplY3R9IFtvcHRpb25zLiRwcmVfZW5kT2ZmXSBUaGUgZWxlbWVudCB0byBzaG93IHRoYXQgcHJlX2VuZE9uIGJ1dHRvbiBpcyBub3QgZW5hYmxlLiBJZiB0aGlzIG9wdGlvbiBpcyBub3QgZXhpc3QgYW5kIHRoZSBlbGVtZW50IHRoYXQgaGFzIGNsYXNzICdwcmVfZW5kT2ZmJywgY29tcG9uZW50IGRvIG5vdCBjcmVhdGUgdGhpcyBidXR0b24uXG4gICAgICogXHRcdEBwYXJhbSB7alF1ZXJ5T2JqZWN0fSBbb3B0aW9ucy4kcHJlT2ZmXSBUaGUgZWxlbWVudCB0byBzaG93IHRoYXQgcHJlT24gYnV0dG9uIGlzIG5vdCBlbmFibGUuIElmIHRoaXMgb3B0aW9uIGlzIG5vdCBleGlzdCBhbmQgdGhlIGVsZW1lbnQgdGhhdCBoYXMgY2xhc3MgJ3ByZU9mZicsIGNvbXBvbmVudCBkbyBub3QgY3JlYXRlIHRoaXMgYnV0dG9uLlxuICAgICAqIFx0XHRAcGFyYW0ge2pRdWVyeU9iamVjdH0gW29wdGlvbnMuJG5leHRPZmZdIFRoZSBlbGVtZW50IHRvIHNob3cgdGhhdCBuZXh0T24gYnV0dG9uIGlzIG5vdCBlbmFibGUuIElmIHRoaXMgb3B0aW9uIGlzIG5vdCBleGlzdCBhbmQgdGhlIGVsZW1lbnQgdGhhdCBoYXMgY2xhc3MgJ25leHRPZmYnLCBjb21wb25lbnQgZG8gbm90IGNyZWF0ZSB0aGlzIGJ1dHRvbi5cbiAgICAgKiBcdFx0QHBhcmFtIHtqUXVlcnlPYmplY3R9IFtvcHRpb25zLiRsYXN0T2ZmXSBUaGUgZWxlbWVudCB0byBzaG93IHRoYXQgbGFzdE9uIGJ1dHRvbiBpcyBub3QgZW5hYmxlLiBJZiB0aGlzIG9wdGlvbiBpcyBub3QgZXhpc3QgYW5kIHRoZSBlbGVtZW50IHRoYXQgaGFzIGNsYXNzICdsYXN0T2ZmJywgY29tcG9uZW50IGRvIG5vdCBjcmVhdGUgdGhpcyBidXR0b24uXG4gICAgICogQHBhcmFtIHtqUXVlcnlPYmplY3R9ICRlbGVtZW50IFBhZ2luYXRpb24gY29udGFpbmVyXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24ob3B0aW9ucywgJGVsZW1lbnQpIHtcbiAgICAgICAgdmFyIGRlZmF1bHRPcHRpb24gPSB7XG4gICAgICAgICAgICBpdGVtQ291bnQ6IDEwLFxuICAgICAgICAgICAgaXRlbVBlclBhZ2U6IDEwLFxuICAgICAgICAgICAgcGFnZVBlclBhZ2VMaXN0OiAxMCxcbiAgICAgICAgICAgIHBhZ2U6IDEsXG4gICAgICAgICAgICBtb3ZlVW5pdDogJ3BhZ2VsaXN0JyxcbiAgICAgICAgICAgIGlzQ2VudGVyQWxpZ246IGZhbHNlLFxuICAgICAgICAgICAgaW5zZXJ0VGV4dE5vZGU6ICcnLFxuICAgICAgICAgICAgY2xhc3NQcmVmaXg6ICcnLFxuICAgICAgICAgICAgZmlyc3RJdGVtQ2xhc3NOYW1lOiAnZmlyc3QtY2hpbGQnLFxuICAgICAgICAgICAgbGFzdEl0ZW1DbGFzc05hbWU6ICdsYXN0LWNoaWxkJyxcbiAgICAgICAgICAgIHBhZ2VUZW1wbGF0ZTogJzxhIGhyZWY9XCIjXCI+ez1wYWdlfTwvYT4nLFxuICAgICAgICAgICAgY3VycmVudFBhZ2VUZW1wbGF0ZTogJzxzdHJvbmc+ez1wYWdlfTwvc3Ryb25nPidcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoIW9wdGlvbnMuaXRlbUNvdW50KSB7XG4gICAgICAgICAgICBhbGVydCgnaXRlbUNvdW50IGhhdmUgdG8gbW9yZSB0aGFuIDEnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBPcHRpb24gb2JqZWN0XG4gICAgICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9vcHRpb25zID0gbmUudXRpbC5leHRlbmQoZGVmYXVsdE9wdGlvbiwgb3B0aW9ucyk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEV2ZW50IGhhbmRsZXIgc2F2b3JcbiAgICAgICAgICogQHR5cGUge09iamVjdH1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiB2aWV3IGluc3RhbmNlXG4gICAgICAgICAqIEB0eXBlIHtQYWdpbmF0aW9uVmlld31cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3ZpZXcgPSBuZXcgVmlldyh0aGlzLl9vcHRpb25zLCAkZWxlbWVudCk7XG4gICAgICAgIHRoaXMuX3ZpZXcuYXR0YWNoRXZlbnQoJ2NsaWNrJywgbmUudXRpbC5iaW5kKHRoaXMuX29uQ2xpY2tQYWdlTGlzdCwgdGhpcykpO1xuXG4gICAgICAgIHRoaXMubW92ZVBhZ2VUbyh0aGlzLmdldE9wdGlvbigncGFnZScpLCBmYWxzZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlc2V0IHBhZ2luYXRpb25cbiAgICAgKiBAcGFyYW0geyp9IGl0ZW1Db3VudCBSZWRyYXcgcGFnZSBpdGVtIGNvdW50XG4gICAgICovXG4gICAgcmVzZXQ6IGZ1bmN0aW9uKGl0ZW1Db3VudCkge1xuXG4gICAgICAgIHZhciBpc0V4aXN0ID0gbmUudXRpbC5pc0V4aXN0eSgoaXRlbUNvdW50ICE9PSBudWxsKSAmJiAoaXRlbUNvdW50ICE9PSB1bmRlZmluZWQpKTtcblxuICAgICAgICBpZiAoIWlzRXhpc3QpIHtcbiAgICAgICAgICAgIGl0ZW1Db3VudCA9IHRoaXMuZ2V0T3B0aW9uKCdpdGVtQ291bnQnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0T3B0aW9uKCdpdGVtQ291bnQnLCBpdGVtQ291bnQpO1xuICAgICAgICB0aGlzLm1vdmVQYWdlVG8oMSwgZmFsc2UpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgb3B0aW9uc1xuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBvcHRpb25LZXkgT3B0aW9uIGtleVxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICpcbiAgICAgKi9cbiAgICBnZXRPcHRpb246IGZ1bmN0aW9uKG9wdGlvbktleSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fb3B0aW9uc1tvcHRpb25LZXldO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBNb3ZlIHRvIHNwZWNpZmljIHBhZ2UsIHJlZHJhdyBsaXN0LlxuICAgICAqIEJlZm9yIG1vdmUgZmlyZSBiZWZvcmVNb3ZlIGV2ZW50LCBBZnRlciBtb3ZlIGZpcmUgYWZ0ZXJNb3ZlIGV2ZW50LlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB0YXJnZXRQYWdlIFRhcmdldCBwYWdlXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBpc05vdFJ1bkN1c3RvbUV2ZW50IFtpc05vdFJ1bkN1c3RvbUV2ZW50PXRydWVdIFdoZXRoZXIgY3VzdG9tIGV2ZW50IGZpcmUgb3Igbm90XG4gICAgICovXG4gICAgbW92ZVBhZ2VUbzogZnVuY3Rpb24odGFyZ2V0UGFnZSwgaXNOb3RSdW5DdXN0b21FdmVudCkge1xuXG4gICAgICAgIHRhcmdldFBhZ2UgPSB0aGlzLl9jb252ZXJ0VG9BdmFpbFBhZ2UodGFyZ2V0UGFnZSk7XG4gICAgICAgIHRoaXMuX2N1cnJlbnRQYWdlID0gdGFyZ2V0UGFnZTtcblxuICAgICAgICBpZiAoIWlzTm90UnVuQ3VzdG9tRXZlbnQpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogRmlyZSAnYmVmb3JlTW92ZScgZXZlbnQoQ3VzdG9tRXZlbnQpXG4gICAgICAgICAgICAgKiBAcGFyYW0ge2NvbXBvbmVudEV2ZW50fSBldmVudERhdGFcbiAgICAgICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudERhdGEuZXZlbnRUeXBlIEN1c3RvbSBldmVudCBuYW1lXG4gICAgICAgICAgICAgKiBAcGFyYW0ge051bWJlcn0gZXZlbnREYXRhLnBhZ2UgVGFyZ2V0IHBhZ2VcbiAgICAgICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGV2ZW50RGF0YS5zdG9wIFN0b3AgbW92ZSBzcGVjaWZpYyBwYWdlXG4gICAgICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgICAgICogcGFnYW5hdGlvbi5vbihcImJlZm9yZU1vdmVcIiwgZnVuY3Rpb24oZXZlbnREYXRhKSB7XG4gICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRQYWdlID0gZXZlbnREYXRhLnBhZ2U7XG4gICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgKi9cblxuICAgICAgICAgICAgaWYgKCF0aGlzLmludm9rZSgnYmVmb3JlTW92ZScsIHsgcGFnZTogdGFyZ2V0UGFnZSB9KSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3BhZ2luYXRlKHRhcmdldFBhZ2UpO1xuXG4gICAgICAgIGlmIChpc05vdFJ1bkN1c3RvbUV2ZW50KSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEZpcmUgJ2FmdGVyTW92ZSdcbiAgICAgICAgICAgICAqIEBwYXJhbSB7Y29tcG9uZW50RXZlbnR9IGV2ZW50RGF0YVxuICAgICAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50RGF0YS5ldmVudFR5cGUgQ3VzdG9tIGV2ZW50IG5hbWVcbiAgICAgICAgICAgICAqIEBwYXJhbSB7TnVtYmVyfSBldmVudERhdGEucGFnZSBNb3ZlZCBwYWdlXG4gICAgICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgICAgICogcGFnYW5hdGlvbi5vbihcImJlZm9yZU1vdmVcIiwgZnVuY3Rpb24oZXZlbnREYXRhKSB7XG4gICAgICAgICAgICB2YXIgY3VycmVudFBhZ2UgPSBldmVudERhdGEucGFnZTtcbiAgICAgICAgIH0pO1xuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLmZpcmUoJ2FmdGVyTW92ZScsIHsgcGFnZTogdGFyZ2V0UGFnZSB9KTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGFuZ2Ugb3B0aW9uIHZhbHVlXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbktleSBUaGUgdGFyZ2V0IG9wdGlvbiBrZXlcbiAgICAgKiBAcGFyYW0geyp9IG9wdGlvblZhbHVlIFRoZSB0YXJnZXQgb3B0aW9uIHZhbHVlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBzZXRPcHRpb246IGZ1bmN0aW9uKG9wdGlvbktleSwgb3B0aW9uVmFsdWUpIHtcbiAgICAgICAgdGhpcy5fb3B0aW9uc1tvcHRpb25LZXldID0gb3B0aW9uVmFsdWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjdXJyZW50IHBhZ2VcbiAgICAgKiBAcmV0dXJucyB7TnVtYmVyfSBDdXJyZW50IHBhZ2VcbiAgICAgKi9cbiAgICBnZXRDdXJyZW50UGFnZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jdXJyZW50UGFnZSB8fCB0aGlzLl9vcHRpb25zWydwYWdlJ107XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBpdGVtICBpbmRleCBmcm9tIGxpc3RcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gcGFnZU51bWJlciBQYWdlIG51bWJlclxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAgICovXG4gICAgZ2V0SW5kZXhPZkZpcnN0SXRlbTogZnVuY3Rpb24ocGFnZU51bWJlcikge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRPcHRpb24oJ2l0ZW1QZXJQYWdlJykgKiAocGFnZU51bWJlciAtIDEpICsgMTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IExhc3QgcGFnZSBudW1iZXJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldExhc3RQYWdlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIE1hdGguY2VpbCh0aGlzLmdldE9wdGlvbignaXRlbUNvdW50JykgLyB0aGlzLmdldE9wdGlvbignaXRlbVBlclBhZ2UnKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEluZGV4IG9mIGxpc3QgaW4gdG90YWwgbGlzdHNcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gcGFnZU51bWJlciBQYWdlIG51bWJlclxuICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRQYWdlSW5kZXg6IGZ1bmN0aW9uKHBhZ2VOdW1iZXIpIHtcbiAgICAgICAgLy8gSXNDZW50ZXJBbGlnbiA9PSB0cnVlIGNhc2VcbiAgICAgICAgaWYgKHRoaXMuZ2V0T3B0aW9uKCdpc0NlbnRlckFsaWduJykpIHtcbiAgICAgICAgICAgIHZhciBsZWZ0ID0gTWF0aC5mbG9vcih0aGlzLmdldE9wdGlvbigncGFnZVBlclBhZ2VMaXN0JykgLyAyKSxcbiAgICAgICAgICAgICAgICBwYWdlSW5kZXggPSBwYWdlTnVtYmVyIC0gbGVmdDtcbiAgICAgICAgICAgIHBhZ2VJbmRleCA9IE1hdGgubWF4KHBhZ2VJbmRleCwgMSk7XG4gICAgICAgICAgICBwYWdlSW5kZXggPSBNYXRoLm1pbihwYWdlSW5kZXgsIHRoaXMuX2dldExhc3RQYWdlKCkgLSB0aGlzLmdldE9wdGlvbigncGFnZVBlclBhZ2VMaXN0JykgKyAxKTtcbiAgICAgICAgICAgIHJldHVybiBwYWdlSW5kZXg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE1hdGguY2VpbChwYWdlTnVtYmVyIC8gdGhpcy5nZXRPcHRpb24oXCJwYWdlUGVyUGFnZUxpc3RcIikpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgcGFnZSBudW1iZXIgb2YgcHJldiwgbmV4dCBwYWdlc1xuICAgICAqIEBwYXJhbSB7U3RyaW5nfSByZWxhdGl2ZU5hbWUgRGlyZWN0aW9ucyhwcmVfZW5kLCBuZXh0X2VuZCwgcHJlLCBuZXh0KVxuICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqICAgICAqL1xuICAgIF9nZXRSZWxhdGl2ZVBhZ2U6IGZ1bmN0aW9uKHJlbGF0aXZlTmFtZSkge1xuICAgICAgICB2YXIgcGFnZSA9IG51bGwsXG4gICAgICAgICAgICBpc01vdmVQYWdlID0gdGhpcy5nZXRPcHRpb24oJ21vdmVVbml0JykgPT09ICdwYWdlJyxcbiAgICAgICAgICAgIGN1cnJlbnRQYWdlSW5kZXggPSB0aGlzLl9nZXRQYWdlSW5kZXgodGhpcy5nZXRDdXJyZW50UGFnZSgpKTtcbiAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ2lzQ2VudGVyQWxpZ24nKSkge1xuICAgICAgICAgICAgaWYgKHJlbGF0aXZlTmFtZSA9PT0gJ3ByZScpIHtcbiAgICAgICAgICAgICAgICBwYWdlID0gaXNNb3ZlUGFnZSA/IHRoaXMuZ2V0Q3VycmVudFBhZ2UoKSAtIDEgOiBjdXJyZW50UGFnZUluZGV4IC0gMTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcGFnZSA9IGlzTW92ZVBhZ2UgPyB0aGlzLmdldEN1cnJlbnRQYWdlKCkgKyAxIDogY3VycmVudFBhZ2VJbmRleCArIHRoaXMuZ2V0T3B0aW9uKCdwYWdlUGVyUGFnZUxpc3QnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChyZWxhdGl2ZU5hbWUgPT09ICdwcmUnKSB7XG4gICAgICAgICAgICAgICAgcGFnZSA9IGlzTW92ZVBhZ2UgPyB0aGlzLmdldEN1cnJlbnRQYWdlKCkgLSAxIDogKGN1cnJlbnRQYWdlSW5kZXggLSAxKSAqIHRoaXMuZ2V0T3B0aW9uKCdwYWdlUGVyUGFnZUxpc3QnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcGFnZSA9IGlzTW92ZVBhZ2UgPyB0aGlzLmdldEN1cnJlbnRQYWdlKCkgKyAxIDogY3VycmVudFBhZ2VJbmRleCAqIHRoaXMuZ2V0T3B0aW9uKCdwYWdlUGVyUGFnZUxpc3QnKSArIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBhZ2U7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBhdmFpbCBwYWdlIG51bWJlciBmcm9tIG92ZXIgbnVtYmVyXG4gICAgICogSWYgdG90YWwgcGFnZSBpcyAyMywgYnV0IGlucHV0IG51bWJlciBpcyAzMCA9PiByZXR1cm4gMjNcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gcGFnZSBQYWdlIG51bWJlclxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY29udmVydFRvQXZhaWxQYWdlOiBmdW5jdGlvbihwYWdlKSB7XG4gICAgICAgIHZhciBsYXN0UGFnZU51bWJlciA9IHRoaXMuX2dldExhc3RQYWdlKCk7XG4gICAgICAgIHBhZ2UgPSBNYXRoLm1heChwYWdlLCAxKTtcbiAgICAgICAgcGFnZSA9IE1hdGgubWluKHBhZ2UsIGxhc3RQYWdlTnVtYmVyKTtcbiAgICAgICAgcmV0dXJuIHBhZ2U7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSByZXF1aXJlIHZpZXcgc2V0LCBub3RpZnkgdmlldyB0byB1cGRhdGUuXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHBhZ2VcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9wYWdpbmF0ZTogZnVuY3Rpb24ocGFnZSl7XG5cbiAgICAgICAgLy8g67ew7J2YIOuyhO2KvCDrsI8g7Y6Y7J207KeA66W8IOuqqOuRkCDsoJzqsbAg67CPIOuzteyCrFxuICAgICAgICB0aGlzLl92aWV3LmVtcHR5KCk7XG5cbiAgICAgICAgdmFyIHZpZXdTZXQgPSB7fTtcblxuICAgICAgICB2aWV3U2V0Lmxhc3RQYWdlID0gdGhpcy5fZ2V0TGFzdFBhZ2UoKTtcbiAgICAgICAgdmlld1NldC5jdXJyZW50UGFnZUluZGV4ID0gdGhpcy5fZ2V0UGFnZUluZGV4KHBhZ2UpO1xuICAgICAgICB2aWV3U2V0Lmxhc3RQYWdlTGlzdEluZGV4ID0gdGhpcy5fZ2V0UGFnZUluZGV4KHZpZXdTZXQubGFzdFBhZ2UpO1xuICAgICAgICB2aWV3U2V0LnBhZ2UgPSBwYWdlO1xuXG4gICAgICAgIHRoaXMuX3ZpZXcudXBkYXRlKHZpZXdTZXQsIHBhZ2UpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBQYWdlbGlzdCBjbGljayBldmVudCBoYWRubGVyXG4gICAgICogQHBhcmFtIHtKUXVlcnlFdmVudH0gZXZlbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbkNsaWNrUGFnZUxpc3Q6IGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdmFyIHBhZ2UgPSBudWxsLFxuICAgICAgICAgICAgdGFyZ2V0RWxlbWVudCA9ICQoZXZlbnQudGFyZ2V0KSxcbiAgICAgICAgICAgIHRhcmdldFBhZ2U7XG5cbiAgICAgICAgaWYgKHRoaXMuX3ZpZXcuaXNJbih0YXJnZXRFbGVtZW50LCB0aGlzLmdldE9wdGlvbignJHByZV9lbmRPbicpKSkge1xuICAgICAgICAgICAgcGFnZSA9IDE7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fdmlldy5pc0luKHRhcmdldEVsZW1lbnQsIHRoaXMuZ2V0T3B0aW9uKCckbGFzdE9uJykpKSB7XG4gICAgICAgICAgICBwYWdlID0gdGhpcy5fZ2V0TGFzdFBhZ2UoKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl92aWV3LmlzSW4odGFyZ2V0RWxlbWVudCwgdGhpcy5nZXRPcHRpb24oJyRwcmVPbicpKSkge1xuICAgICAgICAgICAgcGFnZSA9IHRoaXMuX2dldFJlbGF0aXZlUGFnZSgncHJlJyk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fdmlldy5pc0luKHRhcmdldEVsZW1lbnQsIHRoaXMuZ2V0T3B0aW9uKCckbmV4dE9uJykpKSB7XG4gICAgICAgICAgICBwYWdlID0gdGhpcy5fZ2V0UmVsYXRpdmVQYWdlKCduZXh0Jyk7XG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIHRhcmdldFBhZ2UgPSB0aGlzLl92aWV3LmdldFBhZ2VFbGVtZW50KHRhcmdldEVsZW1lbnQpO1xuXG4gICAgICAgICAgICBpZiAodGFyZ2V0UGFnZSAmJiB0YXJnZXRQYWdlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHBhZ2UgPSBwYXJzZUludCh0YXJnZXRQYWdlLnRleHQoKSwgMTApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgIEZpcmUgJ2NsaWNrJyBjdXN0b20gZXZlbnQgd2hlbiBwYWdlIGJ1dHRvbiBjbGlja2VkXG4gICAgICAgICBAcGFyYW0ge2NvbXBvbmVudEV2ZW50fSBldmVudERhdGFcbiAgICAgICAgIEBwYXJhbSB7U3RyaW5nfSBldmVudERhdGEuZXZlbnRUeXBlIEN1c3RvbSBldmVudCBuYW1lXG4gICAgICAgICBAcGFyYW0ge051bWJlcn0gZXZlbnREYXRhLnBhZ2UgUGFnZSB0byBtb3ZlXG4gICAgICAgICBAcGFyYW0ge0Z1bmN0aW9ufSBldmVudERhdGEuc3RvcCBTdG9wIHBhZ2UgbW92ZVxuICAgICAgICAgKiovXG5cbiAgICAgICAgdmFyIGlzRmlyZWQgPSB0aGlzLmludm9rZShcImNsaWNrXCIsIHtcInBhZ2VcIiA6IHBhZ2V9KTtcbiAgICAgICAgaWYgKCFpc0ZpcmVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm1vdmVQYWdlVG8ocGFnZSk7XG4gICAgfVxufSk7XG4vLyBDdXN0b21FdmVudCAgTWl4aW5cbm5lLnV0aWwuQ3VzdG9tRXZlbnRzLm1peGluKFBhZ2luYXRpb24pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBhZ2luYXRpb247IiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFBhZ2luYXRpb24gdmlldyBtYW5hZ2UgYWxsIG9mIGRyYXcgZWxlbWVudHNcbiAqIChmcm9tIHB1Zy5QYWdpbmF0aW9uKVxuICogQGF1dGhvciBOSE4gZW50ZXJ0YWlubWVudCBGRSBkZXYgdGVhbSBKZWluIFlpKGplaW4ueWlAbmhuZW50LmNvbSlcbiAqIEBkZXBlbmRlbmN5IHBhZ2luYXRpb24uanNcbiAqL1xuLyoqXG4gKiBAY29uc3RydWN0b3IgbmUuY29tcG9uZW50LlBhZ2luYXRpb24uUGFnaW5hdGlvblZpZXdcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIE9wdGlvbiBvYmplY3RcbiAqIEBwYXJhbSB7T2JqZWN0fSAkZWxlbWVudCBDb250YWluZXIgZWxlbWVudFxuICpcbiAqL1xudmFyIFZpZXcgPSBuZS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgbmUuY29tcG9uZW50LlBhZ2luYXRpb24uUGFnaW5hdGlvblZpZXcucHJvdG90eXBlICove1xuICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbnMsICRlbGVtZW50KSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQYWdpbmF0aW9uIHJvb3QgZWxlbWVudFxuICAgICAgICAgKiBAdHlwZSB7alF1ZXJ5T2JqZWN0fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fZWxlbWVudCA9ICRlbGVtZW50O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQYWdpbmF0aW9uIG9wdGlvbnNcbiAgICAgICAgICogQHR5cGUge09iamVjdH1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX29wdGlvbnMgPSBvcHRpb25zO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZWxlY3RvcnNcbiAgICAgICAgICogQHR5cGUge09iamVjdH1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2VsZW1lbnRTZWxlY3RvciA9IHt9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQYWdlIGl0ZW0gbGlzdFxuICAgICAgICAgKiBAdHlwZSB7QXJyYXl9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9wYWdlSXRlbUxpc3QgPSBbXTtcblxuICAgICAgICBuZS51dGlsLmV4dGVuZChvcHRpb25zLCB7XG4gICAgICAgICAgICAkcHJlX2VuZE9uOiBvcHRpb25zWyckcHJlX2VuZE9uJ10gfHwgJCgnYS4nICsgdGhpcy5fd3JhcFByZWZpeCgncHJlX2VuZCcpLCB0aGlzLl9lbGVtZW50KSxcbiAgICAgICAgICAgICRwcmVPbjogb3B0aW9uc1snJHByZU9uJ10gfHwgJCgnYS4nICsgdGhpcy5fd3JhcFByZWZpeCgncHJlJyksIHRoaXMuX2VsZW1lbnQpLFxuICAgICAgICAgICAgJG5leHRPbjogb3B0aW9uc1snJG5leHRPbiddIHx8ICQoJ2EuJyArIHRoaXMuX3dyYXBQcmVmaXgoJ25leHQnKSwgdGhpcy5fZWxlbWVudCksXG4gICAgICAgICAgICAkbGFzdE9uOiBvcHRpb25zWyckbGFzdE9uJ10gfHwgJCgnYS4nICsgdGhpcy5fd3JhcFByZWZpeCgnbmV4dF9lbmQnKSwgdGhpcy5fZWxlbWVudCksXG4gICAgICAgICAgICAkcHJlX2VuZE9mZjogb3B0aW9uc1snJHByZV9lbmRPZmYnXSB8fCAkKCdzcGFuLicgKyB0aGlzLl93cmFwUHJlZml4KCdwcmVfZW5kJyksIHRoaXMuX2VsZW1lbnQpLFxuICAgICAgICAgICAgJHByZU9mZjogb3B0aW9uc1snJHByZU9mZiddIHx8ICQoJ3NwYW4uJyArIHRoaXMuX3dyYXBQcmVmaXgoJ3ByZScpLCB0aGlzLl9lbGVtZW50KSxcbiAgICAgICAgICAgICRuZXh0T2ZmOiBvcHRpb25zWyckbmV4dE9mZiddIHx8ICQoJ3NwYW4uJyArIHRoaXMuX3dyYXBQcmVmaXgoJ25leHQnKSwgdGhpcy5fZWxlbWVudCksXG4gICAgICAgICAgICAkbGFzdE9mZjogb3B0aW9uc1snJGxhc3RPZmYnXSB8fCAkKCdzcGFuLicgKyB0aGlzLl93cmFwUHJlZml4KCduZXh0X2VuZCcpLCB0aGlzLl9lbGVtZW50KVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5hZGRDbGFzcyh0aGlzLl93cmFwUHJlZml4KCdsb2FkZWQnKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZSB2aWV3XG4gICAgICogQHBhcmFtIHtPYmplY3R9IHZpZXdTZXQgVmFsdWVzIG9mIGVhY2ggcGFnaW5hdGlvbiB2aWV3IGNvbXBvbmVudHNcbiAgICAgKi9cbiAgICB1cGRhdGU6IGZ1bmN0aW9uKHZpZXdTZXQpIHtcbiAgICAgICAgdGhpcy5fYWRkVGV4dE5vZGUoKTtcbiAgICAgICAgdGhpcy5fc2V0UGFnZVJlc3VsdCh2aWV3U2V0Lmxhc3RQYWdlKTtcblxuICAgICAgICB2YXIgb3B0aW9ucyA9IHRoaXMuX29wdGlvbnMsXG4gICAgICAgICAgICBlZGdlcyA9IHRoaXMuX2dldEVkZ2Uodmlld1NldCksXG4gICAgICAgICAgICBsZWZ0UGFnZU51bWJlciA9IGVkZ2VzLmxlZnQsXG4gICAgICAgICAgICByaWdodFBhZ2VOdW1iZXIgPSBlZGdlcy5yaWdodDtcblxuICAgICAgICB2aWV3U2V0LmxlZnRQYWdlTnVtYmVyID0gbGVmdFBhZ2VOdW1iZXI7XG4gICAgICAgIHZpZXdTZXQucmlnaHRQYWdlTnVtYmVyID0gcmlnaHRQYWdlTnVtYmVyO1xuXG4gICAgICAgIGlmIChvcHRpb25zLm1vdmVVbml0ID09PSAncGFnZScpIHtcbiAgICAgICAgICAgIHZpZXdTZXQuY3VycmVudFBhZ2VJbmRleCA9IHZpZXdTZXQucGFnZTtcbiAgICAgICAgICAgIHZpZXdTZXQubGFzdFBhZ2VMaXN0SW5kZXggPSB2aWV3U2V0Lmxhc3RQYWdlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fc2V0Rmlyc3Qodmlld1NldCk7XG4gICAgICAgIHRoaXMuX3NldFByZXYodmlld1NldCk7XG4gICAgICAgIHRoaXMuX3NldFBhZ2VOdW1iZXJzKHZpZXdTZXQpO1xuICAgICAgICB0aGlzLl9zZXROZXh0KHZpZXdTZXQpO1xuICAgICAgICB0aGlzLl9zZXRMYXN0KHZpZXdTZXQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpbmNsdWRlXG4gICAgICogQHBhcmFtIHtKUXVlcnlPYmplY3R9ICRmaW5kIFRhcmdldCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtKUXVlcnlPYmplY3R9ICRwYXJlbnQgV3JhcHBlciBlbGVtZW50XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgaXNJbjogZnVuY3Rpb24oJGZpbmQsICRwYXJlbnQpIHtcbiAgICAgICAgaWYgKCEkcGFyZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICgkZmluZFswXSA9PT0gJHBhcmVudFswXSkgPyB0cnVlIDogJC5jb250YWlucygkcGFyZW50LCAkZmluZCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBiYXNlKHJvb3QpIGVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyB7SlF1ZXJ5T2JqZWN0fVxuICAgICAqL1xuICAgIGdldEJhc2VFbGVtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RWxlbWVudCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXNldCBiYXNlIGVsZW1lbnRcbiAgICAgKi9cbiAgICBlbXB0eTogZnVuY3Rpb24oKXtcblxuICAgICAgICB2YXIgb3B0aW9ucyA9IHRoaXMuX29wdGlvbnMsXG4gICAgICAgICAgICAkcHJlX2VuZE9uID0gb3B0aW9ucy4kcHJlX2VuZE9uLFxuICAgICAgICAgICAgJHByZU9uID0gb3B0aW9ucy4kcHJlT24sXG4gICAgICAgICAgICAkbmV4dE9uID0gb3B0aW9ucy4kbmV4dE9uLFxuICAgICAgICAgICAgJGxhc3RPbiA9IG9wdGlvbnMuJGxhc3RPbixcbiAgICAgICAgICAgICRwcmVfZW5kT2ZmID0gb3B0aW9ucy4kcHJlX2VuZE9mZixcbiAgICAgICAgICAgICRwcmVPZmYgPSBvcHRpb25zLiRwcmVPZmYsXG4gICAgICAgICAgICAkbmV4dE9mZiA9IG9wdGlvbnMuJG5leHRPZmYsXG4gICAgICAgICAgICAkbGFzdE9mZiA9IG9wdGlvbnMuJGxhc3RPZmY7XG5cbiAgICAgICAgb3B0aW9ucy4kcHJlX2VuZE9uID0gdGhpcy5fY2xvbmUoJHByZV9lbmRPbik7XG4gICAgICAgIG9wdGlvbnMuJHByZU9uID0gdGhpcy5fY2xvbmUoJHByZU9uKTtcbiAgICAgICAgb3B0aW9ucy4kbGFzdE9uID0gdGhpcy5fY2xvbmUoJGxhc3RPbik7XG4gICAgICAgIG9wdGlvbnMuJG5leHRPbiA9IHRoaXMuX2Nsb25lKCRuZXh0T24pO1xuICAgICAgICBvcHRpb25zLiRwcmVfZW5kT2ZmID0gdGhpcy5fY2xvbmUoJHByZV9lbmRPZmYpO1xuICAgICAgICBvcHRpb25zLiRwcmVPZmYgPSB0aGlzLl9jbG9uZSgkcHJlT2ZmKTtcbiAgICAgICAgb3B0aW9ucy4kbGFzdE9mZiA9IHRoaXMuX2Nsb25lKCRsYXN0T2ZmKTtcbiAgICAgICAgb3B0aW9ucy4kbmV4dE9mZiA9IHRoaXMuX2Nsb25lKCRuZXh0T2ZmKTtcblxuICAgICAgICB0aGlzLl9wYWdlSXRlbUxpc3QgPSBbXTtcblxuICAgICAgICB0aGlzLl9lbGVtZW50LmVtcHR5KCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZpbmQgdGFyZ2V0IGVsZW1lbnQgZnJvbSBwYWdlIGVsZW1lbnRzXG4gICAgICogQHBhcmFtIHtqUXVlcnlPYmplY3R8SFRNTEVsZW1lbnR9IGVsIFRhcmdldCBlbGVtZW50XG4gICAgICogQHJldHVybiB7alF1ZXJ5T2JqZWN0fVxuICAgICAqL1xuICAgIGdldFBhZ2VFbGVtZW50OiBmdW5jdGlvbihlbCkge1xuXG4gICAgICAgIHZhciBpLFxuICAgICAgICAgICAgbGVuZ3RoLFxuICAgICAgICAgICAgcGlja2VkSXRlbTtcblxuICAgICAgICBmb3IgKGkgPSAwLCBsZW5ndGggPSB0aGlzLl9wYWdlSXRlbUxpc3QubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHBpY2tlZEl0ZW0gPSB0aGlzLl9wYWdlSXRlbUxpc3RbaV07XG4gICAgICAgICAgICBpZiAodGhpcy5pc0luKGVsLCBwaWNrZWRJdGVtKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwaWNrZWRJdGVtO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggRXZlbnRzXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50VHlwZSBFdmVudCBuYW1lIHRvIGF0dGFjaFxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIENhbGxiYWNrIGZ1bmN0aW9uXG4gICAgICovXG4gICAgYXR0YWNoRXZlbnQ6IGZ1bmN0aW9uKGV2ZW50VHlwZSwgY2FsbGJhY2spIHtcblxuICAgICAgICB2YXIgdGFyZ2V0RWxlbWVudCA9IHRoaXMuX2VsZW1lbnQsXG4gICAgICAgICAgICBpc1NhdmVkRWxlbWVudCA9IG5lLnV0aWwuaXNTdHJpbmcodGFyZ2V0RWxlbWVudCkgJiYgdGhpcy5fZWxlbWVudFNlbGVjdG9yW3RhcmdldEVsZW1lbnRdO1xuXG4gICAgICAgIGlmIChpc1NhdmVkRWxlbWVudCkge1xuICAgICAgICAgICAgdGFyZ2V0RWxlbWVudCA9IHRoaXMuX2dldEVsZW1lbnQodGFyZ2V0RWxlbWVudCwgdHJ1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGFyZ2V0RWxlbWVudCAmJiBldmVudFR5cGUgJiYgY2FsbGJhY2spIHtcbiAgICAgICAgICAgICQodGFyZ2V0RWxlbWVudCkuYmluZChldmVudFR5cGUsIG51bGwsIGNhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgcm9vdCBlbGVtZW50XG4gICAgICogQHJldHVybnMge2pRdWVyeU9iamVjdH1cbiAgICAgKi9cbiAgICBnZXRFbGVtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2VsZW1lbnQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiBjbGFzc05hbWUgYWRkZWQgcHJlZml4XG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGNsYXNzTmFtZSBDbGFzcyBuYW1lIHRvIGJlIHdyYXBwaW5nXG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfd3JhcFByZWZpeDogZnVuY3Rpb24oY2xhc3NOYW1lKSB7XG4gICAgICAgIHZhciBjbGFzc1ByZWZpeCA9IHRoaXMuX29wdGlvbnNbJ2NsYXNzUHJlZml4J107XG4gICAgICAgIHJldHVybiBjbGFzc1ByZWZpeCA/IGNsYXNzUHJlZml4ICsgY2xhc3NOYW1lLnJlcGxhY2UoL18vZywgJy0nKSA6IGNsYXNzTmFtZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUHV0IGluc2VydFRleHROb2RlIGJldHdlZW4gcGFnZSBpdGVtc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2FkZFRleHROb2RlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHRleHROb2RlID0gdGhpcy5fb3B0aW9uc1snaW5zZXJ0VGV4dE5vZGUnXTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5hcHBlbmQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGV4dE5vZGUpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2xvbmUgZWxlbWVudFxuICAgICAqIEByZXR1cm5zIHsqfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2Nsb25lOiBmdW5jdGlvbigkbGluaykge1xuXG4gICAgICAgIGlmICgkbGluayAmJiAkbGluay5sZW5ndGggJiYgJGxpbmsuZ2V0KDApLmNsb25lTm9kZSkge1xuICAgICAgICAgICAgcmV0dXJuICQoJGxpbmsuZ2V0KDApLmNsb25lTm9kZSh0cnVlKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICRsaW5rO1xuXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFdyYXBwaW5nIGNsYXNzIGJ5IHBhZ2UgcmVzdWx0XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGxhc3ROdW0gTGFzdCBwYWdlIG51bWJlclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldFBhZ2VSZXN1bHQ6IGZ1bmN0aW9uKGxhc3ROdW0pIHtcblxuICAgICAgICBpZiAobGFzdE51bSA9PT0gMCkge1xuICAgICAgICAgICAgdGhpcy5fZWxlbWVudC5hZGRDbGFzcyh0aGlzLl93cmFwUHJlZml4KCduby1yZXN1bHQnKSk7XG4gICAgICAgIH0gZWxzZSBpZiAobGFzdE51bSA9PT0gMSkge1xuICAgICAgICAgICAgdGhpcy5fZWxlbWVudC5hZGRDbGFzcyh0aGlzLl93cmFwUHJlZml4KCdvbmx5LW9uZScpKS5yZW1vdmVDbGFzcyh0aGlzLl93cmFwUHJlZml4KCduby1yZXN1bHQnKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9lbGVtZW50LnJlbW92ZUNsYXNzKHRoaXMuX3dyYXBQcmVmaXgoJ29ubHktb25lJykpLnJlbW92ZUNsYXNzKHRoaXMuX3dyYXBQcmVmaXgoJ25vLXJlc3VsdCcpKTtcbiAgICAgICAgfVxuXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBlYWNoIGVkZ2UgcGFnZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB2aWV3U2V0IFBhZ2luYXRpb24gdmlldyBlbGVtZW50cyBzZXRcbiAgICAgKiBAcmV0dXJucyB7e2xlZnQ6ICosIHJpZ2h0OiAqfX1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRFZGdlOiBmdW5jdGlvbih2aWV3U2V0KSB7XG5cbiAgICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLl9vcHRpb25zLFxuICAgICAgICAgICAgbGVmdFBhZ2VOdW1iZXIsXG4gICAgICAgICAgICByaWdodFBhZ2VOdW1iZXIsXG4gICAgICAgICAgICBsZWZ0O1xuXG4gICAgICAgIGlmIChvcHRpb25zLmlzQ2VudGVyQWxpZ24pIHtcblxuICAgICAgICAgICAgbGVmdCA9IE1hdGguZmxvb3Iob3B0aW9ucy5wYWdlUGVyUGFnZUxpc3QgLyAyKTtcbiAgICAgICAgICAgIGxlZnRQYWdlTnVtYmVyID0gdmlld1NldC5wYWdlIC0gbGVmdDtcbiAgICAgICAgICAgIGxlZnRQYWdlTnVtYmVyID0gTWF0aC5tYXgobGVmdFBhZ2VOdW1iZXIsIDEpO1xuICAgICAgICAgICAgcmlnaHRQYWdlTnVtYmVyID0gbGVmdFBhZ2VOdW1iZXIgKyBvcHRpb25zLnBhZ2VQZXJQYWdlTGlzdCAtIDE7XG5cbiAgICAgICAgICAgIGlmIChyaWdodFBhZ2VOdW1iZXIgPiB2aWV3U2V0Lmxhc3RQYWdlKSB7XG4gICAgICAgICAgICAgICAgbGVmdFBhZ2VOdW1iZXIgPSB2aWV3U2V0Lmxhc3RQYWdlIC0gb3B0aW9ucy5wYWdlUGVyUGFnZUxpc3QgKyAxO1xuICAgICAgICAgICAgICAgIGxlZnRQYWdlTnVtYmVyID0gTWF0aC5tYXgobGVmdFBhZ2VOdW1iZXIsIDEpO1xuICAgICAgICAgICAgICAgIHJpZ2h0UGFnZU51bWJlciA9IHZpZXdTZXQubGFzdFBhZ2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgbGVmdFBhZ2VOdW1iZXIgPSAodmlld1NldC5jdXJyZW50UGFnZUluZGV4IC0gMSkgKiBvcHRpb25zLnBhZ2VQZXJQYWdlTGlzdCArIDE7XG4gICAgICAgICAgICByaWdodFBhZ2VOdW1iZXIgPSAodmlld1NldC5jdXJyZW50UGFnZUluZGV4KSAqIG9wdGlvbnMucGFnZVBlclBhZ2VMaXN0O1xuICAgICAgICAgICAgcmlnaHRQYWdlTnVtYmVyID0gTWF0aC5taW4ocmlnaHRQYWdlTnVtYmVyLCB2aWV3U2V0Lmxhc3RQYWdlKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxlZnQ6IGxlZnRQYWdlTnVtYmVyLFxuICAgICAgICAgICAgcmlnaHQ6IHJpZ2h0UGFnZU51bWJlclxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBEZWNpZGUgdG8gc2hvdyBmaXJzdCBwYWdlIGxpbmsgYnkgd2hldGhlciBmaXJzdCBwYWdlIG9yIG5vdFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB2aWV3U2V0IFBhZ2luYXRpb24gdmlldyBlbGVtZW50cyBzZXRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRGaXJzdDogZnVuY3Rpb24odmlld1NldCkge1xuICAgICAgICB2YXIgb3B0aW9ucyA9IHRoaXMuX29wdGlvbnM7XG4gICAgICAgIGlmICh2aWV3U2V0LnBhZ2UgPiAxKSB7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy4kcHJlX2VuZE9uKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZWxlbWVudC5hcHBlbmQob3B0aW9ucy4kcHJlX2VuZE9uKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRUZXh0Tm9kZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMuJHByZV9lbmRPZmYpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9lbGVtZW50LmFwcGVuZChvcHRpb25zLiRwcmVfZW5kT2ZmKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRUZXh0Tm9kZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRGVjaWRlIHRvIHNob3cgcHJldmlvdXMgcGFnZSBsaW5rIGJ5IHdoZXRoZXIgZmlyc3QgcGFnZSBvciBub3RcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdmlld1NldCBQYWdpbmF0aW9uIHZpZXcgZWxlbWVudHMgc2V0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0UHJldjogZnVuY3Rpb24odmlld1NldCkge1xuICAgICAgICB2YXIgb3B0aW9ucyA9IHRoaXMuX29wdGlvbnM7XG5cbiAgICAgICAgaWYgKHZpZXdTZXQuY3VycmVudFBhZ2VJbmRleCA+IDEpIHtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLiRwcmVPbikge1xuICAgICAgICAgICAgICAgIHRoaXMuX2VsZW1lbnQuYXBwZW5kKG9wdGlvbnMuJHByZU9uKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRUZXh0Tm9kZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMuJHByZU9mZikge1xuICAgICAgICAgICAgICAgIHRoaXMuX2VsZW1lbnQuYXBwZW5kKG9wdGlvbnMuJHByZU9mZik7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkVGV4dE5vZGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgLyoqXG4gICAgICogRGVjaWRlIHRvIHNob3cgbmV4dCBwYWdlIGxpbmsgYnkgd2hldGhlciBmaXJzdCBwYWdlIG9yIG5vdFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB2aWV3U2V0IFBhZ2luYXRpb24gdmlldyBlbGVtZW50cyBzZXRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXROZXh0OiBmdW5jdGlvbih2aWV3U2V0KSB7XG4gICAgICAgIHZhciBvcHRpb25zID0gdGhpcy5fb3B0aW9ucztcblxuICAgICAgICBpZiAodmlld1NldC5jdXJyZW50UGFnZUluZGV4IDwgdmlld1NldC5sYXN0UGFnZUxpc3RJbmRleCkge1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMuJG5leHRPbikge1xuICAgICAgICAgICAgICAgIHRoaXMuX2VsZW1lbnQuYXBwZW5kKG9wdGlvbnMuJG5leHRPbik7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkVGV4dE5vZGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLiRuZXh0T2ZmKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZWxlbWVudC5hcHBlbmQob3B0aW9ucy4kbmV4dE9mZik7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkVGV4dE5vZGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBEZWNpZGUgdG8gc2hvdyBsYXN0IHBhZ2UgbGluayBieSB3aGV0aGVyIGZpcnN0IHBhZ2Ugb3Igbm90XG4gICAgICogQHBhcmFtIHtvYmplY3R9IHZpZXdTZXQgUGFnaW5hdGlvbiB2aWV3IGVsZW1lbnRzIHNldFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldExhc3Q6IGZ1bmN0aW9uKHZpZXdTZXQpIHtcblxuICAgICAgICB2YXIgb3B0aW9ucyA9IHRoaXMuX29wdGlvbnM7XG5cbiAgICAgICAgaWYgKHZpZXdTZXQucGFnZSA8IHZpZXdTZXQubGFzdFBhZ2UpIHtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLiRsYXN0T24pIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9lbGVtZW50LmFwcGVuZChvcHRpb25zLiRsYXN0T24pO1xuICAgICAgICAgICAgICAgIHRoaXMuX2FkZFRleHROb2RlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy4kbGFzdE9mZikge1xuICAgICAgICAgICAgICAgIHRoaXMuX2VsZW1lbnQuYXBwZW5kKG9wdGlvbnMuJGxhc3RPZmYpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2FkZFRleHROb2RlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH0sXG4gICAgLyoqXG4gICAgICogU2V0IHBhZ2UgbnVtYmVyIHRoYXQgd2lsbCBiZSBkcmF3blxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB2aWV3U2V0IFBhZ2luYXRpb24gdmlldyBlbGVtZW50cyBzZXRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRQYWdlTnVtYmVyczogZnVuY3Rpb24odmlld1NldCkge1xuICAgICAgICB2YXIgJHBhZ2VJdGVtLFxuICAgICAgICAgICAgZmlyc3RQYWdlID0gdmlld1NldC5sZWZ0UGFnZU51bWJlcixcbiAgICAgICAgICAgIGxhc3RQYWdlID0gdmlld1NldC5yaWdodFBhZ2VOdW1iZXIsXG4gICAgICAgICAgICBvcHRpb25zID0gdGhpcy5fb3B0aW9ucyxcbiAgICAgICAgICAgIGk7XG5cbiAgICAgICAgZm9yIChpID0gZmlyc3RQYWdlOyBpIDw9IGxhc3RQYWdlOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChpID09PSB2aWV3U2V0LnBhZ2UpIHtcbiAgICAgICAgICAgICAgICAkcGFnZUl0ZW0gPSAkKG9wdGlvbnMuY3VycmVudFBhZ2VUZW1wbGF0ZS5yZXBsYWNlKCd7PXBhZ2V9JywgaS50b1N0cmluZygpKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICRwYWdlSXRlbSA9ICQob3B0aW9ucy5wYWdlVGVtcGxhdGUucmVwbGFjZSgnez1wYWdlfScsIGkudG9TdHJpbmcoKSkpO1xuICAgICAgICAgICAgICAgIHRoaXMuX3BhZ2VJdGVtTGlzdC5wdXNoKCRwYWdlSXRlbSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChpID09PSBmaXJzdFBhZ2UpIHtcbiAgICAgICAgICAgICAgICAkcGFnZUl0ZW0uYWRkQ2xhc3ModGhpcy5fd3JhcFByZWZpeChvcHRpb25zWydmaXJzdEl0ZW1DbGFzc05hbWUnXSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGkgPT09IGxhc3RQYWdlKSB7XG4gICAgICAgICAgICAgICAgJHBhZ2VJdGVtLmFkZENsYXNzKHRoaXMuX3dyYXBQcmVmaXgob3B0aW9uc1snbGFzdEl0ZW1DbGFzc05hbWUnXSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fZWxlbWVudC5hcHBlbmQoJHBhZ2VJdGVtKTtcbiAgICAgICAgICAgIHRoaXMuX2FkZFRleHROb2RlKCk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBWaWV3OyJdfQ==
