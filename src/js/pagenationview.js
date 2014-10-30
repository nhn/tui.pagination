/**
 * @fileoverview 페이지네이션, 화면에 그려지는 요소들을 관리한다
 * (pug.Pagination 에서 분리)
 * @author 이제인(jein.yi@nhnent.com)
 */



/**
 *
 * @constructor
 * @param {Object} options 옵션 객체
 * @param {Object} $element 루트 엘리먼트
 *
 */
function    PaginationView(options, $element) {
    /**
     * 페이지네이션의 루트 엘리먼트
     *
     * @type {jQueryObject}
     * @private
     */
    this._element = $element;
    /**
     * 페이지네이션 지정 옵션
     *
     * @type {Object}
     * @private
     */
    this._options = options;
    /**
     * 컴포넌트에 저장되는 셀렉터
     *
     * @type {Object}
     * @private
     */
    this._elementSelector = {};
    /**
     * 선택된 엘리먼트들을 캐싱해두는 객체
     *
     * @type {Object}
     * @private
     */
    this._cachedElement = {};
    /**
     * 발생한 이벤트를 캐싱하는 데이터
     *
     * @type {Object}
     * @private
     */
    this._eventData = {};

    $.extend(options, {
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
}



/**
 * 뷰를 업데이트 한다
 *
 * @param {Object} viewSet 뷰갱신에 대한 값들
 */
PaginationView.prototype.update = function(viewSet) {
    this._addTextNode();
    this._setPageResult(viewSet.nLastPage);

    var options = this._options,
        edges = this._getEdge(viewSet),
        leftPageNumber = edges.left,
        rightPageNumber = edges.right;

    viewSet.leftPageNumber = leftPageNumber;
    viewSet.rightPageNumber = rightPageNumber;

    if (options.moveUnit === 'page') {
        viewSet.nThisPageList = viewSet.page;
        viewSet.nLastPageList = viewSet.nLastPage;
    }

    this._setFirst(viewSet);
    this._setPrev(viewSet);
    this._setPageNumbers(viewSet);
    this._setNext(viewSet);
    this._setLast(viewSet);
};

/**
 * 포함관계를 본다
 *
 * @param {JQueryObject} $find 포함되어있는 체크할 대상
 * @param {JQueryObject} $parent 포함하고 있는지 체크할 대상
 * @returns {boolean}
 */
PaginationView.prototype.isIn = function($find, $parent) {
    if (!$parent) {
        return false;
    }
    return ($find[0] === $parent[0]) ? true : $parent.find($find).length > 0;
};

/**
 * 기준 엘리먼트를 구한다
 *
 * @returns {JQueryObject}
 */
PaginationView.prototype.getBaseElement = function() {
    return this._element;
};


/**
 * 기준엘리먼트를 초기화 시킨다
 */
PaginationView.prototype.empty = function(){

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
};



/**
 * 페이지 숫자를 담은 엘리먼트 중 원하는 엘리먼트를 찾는다.
 *
 * @param {jQueryObject|HTMLElement} el 목록 중에서 찾을 target 엘리먼트
 * @return {jQueryObject} 있을 경우 해당 엘리먼트 jQuery 객체를 반환하며, 없으면 null을 반환한다.
 */

PaginationView.prototype.getPageElement = function(el) {

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
};


/**
 * targetElement 엘리먼트에 eventType 이벤트의 콜백함수로 callback 함수를 등록한다. <br />
 * - 컴포넌트 내에서 _attachEventHandler() 메서드를 이용하여 이벤트를 등록하는 경우, 내부에 해당 이벤트 정보들을 저장하게 되며,<br />
 *   추후 컴포넌트의 destroy 시에 이 정보를 이용하여 자동으로 이벤트 해제를 수행하게 된다.
 *
 * @param {String} eventType 등록할 이벤트 명
 * @param {Function} callback 해당 이벤트가 발생 시에 호출할 콜백함수
 * @return {String} eventType 과 random 값이 "_" 로 연결된 유일한 key 값.
 */
PaginationView.prototype.attachEvent = function(eventType, callback) {

    var targetElement = this._element,
        isSavedElement = typeof(targetElement) == 'string' && this._elementSelector[targetElement];

    if (isSavedElement) {
        targetElement = this._getElement(targetElement, true);
    }

    if (targetElement && eventType && callback) {

        var key = eventType + '_' + parseInt(Math.random() * 10000000, 10);
        $(targetElement).bind(eventType, null, callback);

        this._eventData[key] = {
            targetElement: targetElement,
            eventType: eventType,
            callback: callback
        };

        return key;
    }
};


/**
 * 루트 엘리먼트객체를 돌려준다.
 *
 * @returns {jQueryObject}
 */
PaginationView.prototype.getElement = function() {

    return this._element;

};

/**
 * 클래스명에 Prefix 를 붙힘<br />
 * Prefix는 options.classPrefix를 참조, 붙혀질 때 기존 클래스명의 언더바(_) 문자는 하이픈(-)으로 변환됨
 *
 * @param {String} className
 * @returns {*}
 * @private
 */
PaginationView.prototype._wrapPrefix = function(className) {
    var classPrefix = this._options['classPrefix'];
    return classPrefix ? classPrefix + className.replace(/_/g, '-') : className;
};

/**
 * 페이지표시 마크업 사이사이에 options.insertTextNode를 끼어넣어준다.
 * @private
 */
PaginationView.prototype._addTextNode = function() {

    var textNode = this._options['insertTextNode'];
    this._element.append(document.createTextNode(textNode));

};

/**
 * 엘리먼트 복제, html은 동일하나 jQuery객체상태를 초기화 하여 반환된다.
 * @returns {*}
 * @private
 */
PaginationView.prototype._clone = function($link) {

    if ($link && $link.length && $link.get(0).cloneNode) {
        return $($link.get(0).cloneNode(true));
    }
    return $link;

};

/**
 * 페이지 결과값에 따른, 결과클래스를 입힌다.
 * @param {Number} lastNum
 * @private
 */
PaginationView.prototype._setPageResult = function(lastNum) {

    if (lastNum === 0) {
        this._element.addClass(this._wrapPrefix('no-result'));
    } else if (lastNum === 1) {
        this._element.addClass(this._wrapPrefix('only-one')).removeClass(this._wrapPrefix('no-result'));
    } else {
        this._element.removeClass(this._wrapPrefix('only-one')).removeClass(this._wrapPrefix('no-result'));
    }

};


/**
 * 현재페이지의 양 끝페이지를 구한다
 *
 * @param viewSet
 * @returns {{left: *, right: *}}
 * @private
 */

PaginationView.prototype._getEdge = function(viewSet) {

    var options = this._options,
        leftPageNumber,
        rightPageNumber,
        nLeft;

    if (options.isCenterAlign) {

        nLeft = Math.floor(options.pagePerPageList / 2);
        leftPageNumber = viewSet.page - nLeft;
        leftPageNumber = Math.max(leftPageNumber, 1);
        rightPageNumber = leftPageNumber + options.pagePerPageList - 1;

        if (rightPageNumber > viewSet.nLastPage) {
            leftPageNumber = viewSet.nLastPage - options.pagePerPageList + 1;
            leftPageNumber = Math.max(leftPageNumber, 1);
            rightPageNumber = viewSet.nLastPage;
        }

    } else {

        leftPageNumber = (viewSet.nThisPageList - 1) * options.pagePerPageList + 1;
        rightPageNumber = (viewSet.nThisPageList) * options.pagePerPageList;
        rightPageNumber = Math.min(rightPageNumber, viewSet.nLastPage);

    }

    return {
        left: leftPageNumber,
        right: rightPageNumber
    };
};

/**
 * 첫번째 페이지인지 여부에 따라 첫번째페이지로 가는 링크를 노출할지 결정한다.
 *
 * @param {Obejct} viewSet
 * @private
 */
PaginationView.prototype._setFirst = function(viewSet) {
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

};

/**
 * 이전페이지가 있는지 여부에 따른 오브젝트 활성화
 *
 * @param {Object} viewSet
 * @private
 *
 */
PaginationView.prototype._setPrev = function(viewSet) {
    var options = this._options;
    if (viewSet.nThisPageList > 1) {
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
};

/**
 * 다음페이지가 있는지 여부에 따른 오브젝트 활성화
 *
 * @param {Obejct} viewSet
 * @private
 */
PaginationView.prototype._setNext = function(viewSet) {

    var options = this._options;

    if (viewSet.nThisPageList < viewSet.nLastPageList) {
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

};

/**
 * 마지막페이지가 있는지 여부에 따른 오브젝트 활성화
 *
 * @param {Object} viewSet
 * @private
 */
PaginationView.prototype._setLast = function(viewSet) {

    var options = this._options;

    if (viewSet.page < viewSet.nLastPage) {
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

};

/**
 * 페이지 넘버링을 한다
 *
 * @param {Object} viewSet
 * @private
 */
PaginationView.prototype._setPageNumbers = function(viewSet) {
    var $pageItem,
        firstPage = viewSet.leftPageNumber,
        lastPage = viewSet.rightPageNumber,
        options = this._options,
        i;

    for (i = firstPage; i <= lastPage; i++) {
        if (i == viewSet.page) {
            $pageItem = $(options.currentPageTemplate.replace('{=page}', i.toString()));
        } else {
            $pageItem = $(options.pageTemplate.replace('{=page}', i.toString()));
            this._pageItemList.push($pageItem);
        }

        if (i == firstPage) {
            $pageItem.addClass(this._wrapPrefix(this._options['firstItemClassName']));
        }
        if (i == lastPage) {
            $pageItem.addClass(this._wrapPrefix(this._options['lastItemClassName']));
        }
        this._element.append($pageItem);

        this._addTextNode();
    }
};



/**
 * 컴포넌트에 저장된 엘리먼트 셀렉터를 이용하여 key에 해당하는 엘리먼트를 찾아서 리턴한다.
 *
 * @param {String} key
 * @param {Boolean} isOriginal
 * @param {Boolean} isNotUseCache
 * @returns {*}
 * @private
 */
PaginationView.prototype._getElement = function(key, isOriginal, isNotUseCache){

    var chechedElement = this._cachedElement[key];

    if (key) {
        if (!chechedElement || isNotUseCache) {
            var sSelector = this._elementSelector[key] || '._' + key;
            this._cachedElement[key] = $(sSelector, this._cachedElement['root']);
        }
        var vResult = chechedElement;

        if (vResult) {
            return isOriginal ? (vResult.length > 1 ? vResult.get() : vResult.get(0)) : vResult;
        } else {
            return null;
        }
    } else {
        return this._element;
    }
};

