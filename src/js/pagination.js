/**
 * @fileoverview 페이지네이션의 뷰를 생성하고, 이벤트를 건다.
 * (pug.Pagination 에서 분리)
 * @author 이제인(jein.yi@nhnent.com)
 */

/**
 *
 * @constructor
 * @param {DataObject} options 옵션 객체
 * 		@param {Number} [options.itemCount=10] 리스트의 전체 아이템 개수
 * 		@param {Number} [options.itemPerPage=10] 한 페이지에 표시 될 아이템의 개수를 정의한다.
 * 		@param {Number} [options.pagePerPageList=10] 페이지 목록에 표시 될 페이지의 개수를 정의한다.
 * 		@param {Number} [options.page=1] Pagination 컴포넌트가 로딩되었을 때 보여 주는 페이지이다. 기본값으로는 1이 설정된다. 아래의 이미지에서는 12페이지를 선택한 경우이다.
 * 		@param {String} [options.moveUnit="pagelist"] 이전/다음 버튼을 누르는 경우 한 페이지씩(page) 또는 페이지 목록(pagelist) 단위로 이동하게 해주는 설정 값이다.
 * 			<ul>
 * 				<li>pagelist : nPagePerPageList로 설정한 값 기준으로 이동한다.(기본값 기준으로 10페이지)</li>
 * 				<li>page : 한 페이지 씩 이동한다.</li>
 * 			</ul>
 * 		@param {Boolean}[options.isCenterAlign=false] 현재 페이지가 항상 가운데에 오도록 정렬해주는 값이다. 이전 또는 다음 버튼을 눌러서 페이지를 이동하는 경우 이동 된 페이지가 중앙에 오게 된다.<br/>※ 이 값을 true로 할 경우엔 moveUnit이 항상 "page"로 설정되어야 한다.
 * 		@param {String} [options.insertTextNode=""] 페이지 목록에서 페이지의 마크업들을 연결해주는 문자열이다. 설정 값에 따라서 각각의 페이지를 보여주는 노드 (예 <a href="#">11</a><a href="#">12</a>에서 a태그)를 "\n" 또는 " "등으로 설정해서 변경할 수 있다. (위의 예에서는 a태그 사이의 간격이 한 줄 또는 하나의 공백문자로 변경되게 된다.)<br/>※ 주의할 점은 이 옵션에 따라 렌더링이 달라질 수 있다는 점이다.
 * 		@param {String} [options.classPrefix=""] 클래스명 접두어
 * 		@param {String} [options.firstItemClassName="first-child"] 페이지 목록에서 첫 번째 페이지 항목에 추가되는 클래스명
 * 		@param {String} [options.lastItemClassName="last-child"] 페이지 목록에서 마지막 페이지 항목에 추가되는 클래스명
 * 		@param {String} [options.pageTemplate="<a href='#'>{=page}</a>"] 1, 2, 3, .. 과 같은 페이지를 보여주는 엘리먼트를 어떤 마크업으로 보여줄 지를 설정한다. {=page}가 페이지 번호로 교체된다.
 * 		@param {String} [options.currentPageTemplate="<strong>{=page}</strong>"] 페이지 목록에서 보여주고 있는 현재 페이지를 어떻게 보여줄 지 설정하는 마크업 템플릿이다. {=page}가 현재 페이지 번호로 교체된다.
 * 		@param {jQueryObject} [options.$firstPageLinkOn] 페이지 목록에서 페이지의 맨 처음으로 이동하는 버튼으로 사용되는 엘리먼트이다. 처음으로 이동할 수 있는 경우만 노출되며 값을 지정하지 않거나 pre_end 클래스 명을 가진 a 엘리먼트가 존재하지 않으면 버튼이 생성되지 않는다.<br/>기본 값 : 페이지 목록 엘리먼트 아래의 pre_end 클래스 명을 가지고 있는 a 엘리먼트
 * 		@param {jQueryObject} [options.$prevPageLinkOn] 페이지 목록에서 이전 페이지 또는 이전 페이지목록으로 이동하는 버튼으로 사용되는 엘리먼트이다. 이전으로 이동할 수 있는 경우만 노출되며 값을 지정하지 않거나 pre 클래스 명을 가진 a 엘리먼트가 존재하지 않으면 버튼이 생성되지 않는다.<br/>기본 값 : 페이지 목록 엘리먼트 아래의 pre 클래스 명을 가지고 있는 a 엘리먼트
 * 		@param {jQueryObject} [options.$nextPageLinkOn] 페이지 목록에서 다음 페이지 또는 다음 페이지목록으로 이동하는 버튼으로 사용되는 엘리먼트이다. 다음으로 이동할 수 있는 경우만 노출되며 값을 지정하지 않거나 next 클래스 명을 가진 a 엘리먼트가 존재하지 않으면 버튼이 생성되지 않는다.<br/>기본 값 : 페이지 목록 엘리먼트 아래의 next 클래스 명을 가지고 있는 a 엘리먼트
 * 		@param {jQueryObject} [options.$lastPageLinkOn] 페이지 목록에서 페이지의 맨 마지막으로 이동하는 버튼으로 사용되는 엘리먼트이다. 마지막으로 이동할 수 있는 경우만 노출되며 값을 지정하지 않거나 next_end 클래스 명을 가진 a 엘리먼트가 존재하지 않으면 버튼이 생성되지 않는다.<br/>기본 값 : 페이지 목록 엘리먼트 아래의 next_end 클래스 명을 가지고 있는 a 엘리먼트
 * 		@param {jQueryObject} [options.$firstPageLinkOff] elFirstPageLinkOn과는 반대로 처음으로 이동할 수 없는 경우에 사용자에게 비활성화된 상태를 보여주기 위한 엘리먼트이다. 값을 지정하지 않거나 pre_end 클래스 명을 가진 span 엘리먼트가 존재하지 않으면 버튼이 생성되지 않는다.<br/>기본 값 : 페이지 목록 엘리먼트 아래의 pre_end 클래스 명을 가지고 있는 span 엘리먼트
 * 		@param {jQueryObject} [options.$prevPageLinkOff] elPrevPageLinkOn과는 반대로 이전으로 이동할 수 없는 경우에 사용자에게 비활성화된 상태를 보여주기 위한 엘리먼트이다. 값을 지정하지 않거나 pre 클래스 명을 가진 span 엘리먼트가 존재하지 않으면 버튼이 생성되지 않는다.<br/>기본 값 : 페이지 목록 엘리먼트 아래의 pre 클래스 명을 가지고 있는 span 엘리먼트
 * 		@param {jQueryObject} [options.$nextPageLinkOff] elNextPageLinkOn과는 반대로 다음으로 이동할 수 없는 경우에 사용자에게 비활성화된 상태를 보여주기 위한 엘리먼트이다. 값을 지정하지 않거나 next 클래스 명을 가진 span 엘리먼트가 존재하지 않으면 버튼이 생성되지 않는다.<br/>기본 값 : 페이지 목록 엘리먼트 아래의 next 클래스 명을 가지고 있는 span 엘리먼트
 * 		@param {jQueryObject} [options.$lastPageLinkOff] zelLastPageLinkOn과는 반대로 마지막으로 이동할 수 없는 경우에 사용자에게 비활성화된 상태를 보여주기 위한 엘리먼트이다. 값을 지정하지 않거나 next_end 클래스 명을 가진 span 엘리먼트가 존재하지 않으면 버튼이 생성되지 않는다.<br/>기본 값 : 페이지 목록 엘리먼트 아래의 next_end 클래스 명을 가지고 있는 span 엘리먼트
 * @param {jQueryObject} $element 페이지목록을 생성할 jQuery객체가 랩핑된 엘리먼트
 *
 */
function Pagination(options, $element) {

    // 기본옵션
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

    /**
     * 옵션객체
     * @type {Object}
     * @private
     */
    this._options = $.extend(defaultOption, options);
    /**
     * 이벤트 핸들러 저장객체
     *
     * @type {Object}
     * @private
     */
    this._eventHandler = {};

    // 뷰 생성
    /**
     * 뷰객체
     * @type {PaginationView}
     * @private
     */
    this._view = new PaginationView(this._options, $element);

    this._view.attachEvent('click', $.proxy(this._onClickPageList, this));
    // 페이지 초기화(이동)
    this.movePageTo(this._getOption('page'), false);

};


/**
 * 페이징을 다시 그린다
 *
 * @param itemCount
 */
Pagination.prototype.reset = function(itemCount) {

    var isExist = itemCount !== null && itemCount !== undefined;

    if (!isExist) {
        itemCount = this._getOption('itemCount');
    }

    this._setOption('itemCount', itemCount);
    this.movePageTo(1, false);
};

/**
 * 옵션값을 가져온다
 *
 * @param {String} optionKey 가져올 옵션 키 값
 * @private
 * @returns {*}
 *
 */
Pagination.prototype._getOption = function(optionKey) {

    return this._options[optionKey];

};


/**
 * 지정한 페이지로 이동하고, 페이지 목록을 다시 그린다
 * 이동하기 전엔 beforeMove라는 커스텀 이벤트를 발생시키고, 이동후에는 afterMove라는 커스텀 이벤터를 발생시킨다.
 *
 * @param {Number} targetPage 이동할 페이지
 * @param {Boolean} runCustomEvent [runCustomEvent=true] 커스텀 이벤트의 발생 여부
 */
Pagination.prototype.movePageTo = function(targetPage, runCustomEvent) {

    runCustomEvent = !!(runCustomEvent || runCustomEvent === undefined);

    targetPage = this._convertToAvailPage(targetPage);

    this._currentPage = targetPage;

    if (runCustomEvent) {
        /**
         * 페이지 이동이 수행되기 직전에 발생
         *
         * @global
         * @event beforeMove
         * @param {ComponentEvent} eventData
         * @param {String} eventData.eventType 커스텀 이벤트명
         * @param {Number} eventData.page 이동하게 될 페이지
         * @param {Function} eventData.stop 페이지 이동을 정지한다
         * @example
         * paganation.attach("beforeMove", function(eventData) {
            // 사용자  클릭의 결과로 이동한 페이지
            var currentPage = eventData.page;
         });
         */

        if (!this.fireEvent('beforeMove', { page: targetPage })) {
            return;
        }
    }

    this._paginate(targetPage);

    if (runCustomEvent) {
        /**
         * 페이지 이동이 완료된 시점에서 발생
         *
         * @global
         * @event afterMove
         * @param {ComponentEvent} eventData
         * @param {String} eventData.eventType 커스텀 이벤트명
         * @param {Number} eventData.page 사용자 클릭의 결과로 이동한 페이지
         * @example
         * paganation.attach("beforeMove", function(eventData) {
            // 사용자  클릭의 결과로 이동한 페이지
            var currentPage = eventData.page;
         });
         */
        this.fireEvent('afterMove', { page: targetPage });
    }
};


/**
 * 옵션값을 변경한다
 *
 * @param {String} optionKey 변경할 옵션 키 값
 * @param {*} optionValue 변경할 옵션 값
 * @private
 */
Pagination.prototype._setOption = function(optionKey, optionValue) {

    this._options[optionKey] = optionValue;

};

/**
 * 현재 페이지를 가져온다
 *
 * @returns {Number} 현재 페이지
 */
Pagination.prototype.getCurrentPage = function() {

    return this._currentPage || this._options['page'];

};

/**
 * 해당 페이지의 첫번째 아이템이 전체중 몇번째 인지 구한다
 *
 * @param {Number} pageNumber 해당 페이지 번호
 * @returns {number}
 */
Pagination.prototype.getFirstItemOfPage = function(pageNumber) {

    return this._getOption('itemPerPage') * (pageNumber - 1) + 1;

};

/**
 * 마지막 페이지 숫자를 구함
 *
 * @returns {number} 마지막 페이지 숫자
 * @private
 */
Pagination.prototype._getLastPage = function() {

    return Math.ceil(this._getOption('itemCount') / this._getOption('itemPerPage'));

};


/**
 * 몇번째 페이지 리스트인지 구함
 *
 * @param {Number} pageNumber
 * @return {Number} 페이지 리스트 순번
 * @private
 */
Pagination.prototype._getPageList = function(pageNumber) {
    if (this._options["isCenterAlign"]) {
        var nLeft = Math.floor(this._options["pagePerPageList"] / 2);
        var nPageList = pageNumber - nLeft;
        nPageList = Math.max(nPageList, 1);
        nPageList = Math.min(nPageList, this._getLastPage());
        return nPageList;
    }
    return Math.ceil(pageNumber / this._options["pagePerPageList"]);
};

/**
 * 이전, 다음 버튼을 클릭할 때 제공받을 페이지 숫자를 구한다
 *
 * @param {String} relativeName 어떤 영역으로 옮겨갈지 정한다(pre_end, next_end, pre, next)
 * @return {Number} 해당되는 페이지 숫자
 * @private
 *
 */
Pagination.prototype._getRelativePage = function(relativeName) {
    var nPage = null,
        bMovePage = this._getOption('moveUnit') === 'page',
        nThisPageList = this._getPageList(this.getCurrentPage());
    switch (relativeName) {
        case 'pre_end' :
            nPage = 1;
            break;

        case 'next_end' :
            nPage = this._getLastPage();
            break;

        case 'pre':
            nPage = bMovePage ? this.getCurrentPage() - 1 : (nThisPageList - 1) * this._getOption('pagePerPageList');
            break;

        case 'next':
            nPage = bMovePage ? this.getCurrentPage() + 1 : (nThisPageList) * this._getOption('pagePerPageList') + 1;
            break;
    }

    return nPage;
};

/**
 * 페이지 숫자를 받으면 현재 페이지 범위내로 변경하여 반환한다.
 * 예를들어 총 페이지수가 23인데 30이라는 수를 넣으면 23을 반환받는다. 숫자가 1보다 작으면 1을 반환받는다.
 *
 * @param {Number} page
 * @returns {number} 페이지 범위내로 확인된 숫자
 * @private
 */
Pagination.prototype._convertToAvailPage = function(page) {
    var lastPageNumber = this._getLastPage();
    page = Math.max(page, 1);
    page = Math.min(page, lastPageNumber);
    return page;
};


/**
 * 페이지를 그리는데 필요한 뷰셋을 만들고, 뷰에 업데이트를 요청한다
 *
 * @param {Number} page
 * @private
 */
Pagination.prototype._paginate = function(page){

    // 뷰의 버튼 및 페이지를 모두 제거 및 복사
    this._view.empty();

    var viewSet = {};

    viewSet.nLastPage = this._getLastPage();
    viewSet.nThisPageList = this._getPageList(page);
    viewSet.nLastPageList = this._getPageList(viewSet.nLastPage);
    viewSet.page = page;

    this._view.update(viewSet, page);
};

/**
 * 페이지네이션 이벤트 핸들
 *
 * @param we
 * @private
 */
Pagination.prototype._onClickPageList = function(we) {

    we.preventDefault();

    var nPage = null,
        htOption = this._options,
        el = $(we.target),
        elPage;

    if (this._view.isIn(el, htOption.$firstPageLinkOn)) {
        nPage = this._getRelativePage('pre_end');
    } else if (this._view.isIn(el, htOption.$prevPageLinkOn)) {
        nPage = this._getRelativePage('pre');
    } else if (this._view.isIn(el, htOption.$nextPageLinkOn)) {
        nPage = this._getRelativePage('next');
    } else if (this._view.isIn(el, htOption.$lastPageLinkOn)) {
        nPage = this._getRelativePage('next_end');
    } else {

        elPage = this._view.getPageElement(el);

        if (elPage && elPage.length) {
            nPage = parseInt(elPage.text(), 10);
        } else {
            return;
        }
    }

    /**
     페이지 이동을 위한 숫자나 버튼을 클릭했을때 발생

     @event click
     @param {ComponentEvent} eventData
     @param {String} eventData.eventType 커스텀 이벤트명
     @param {Number} eventData.page 클릭해서 이동할 페이지
     @param {Function} eventData.stop 페이지 이동을 정지한다

     **/

    var isFired = this.fireEvent("click", {"page" : nPage});
    if (!isFired) {
        return;
    }

    this.movePageTo(nPage);
};

/**
 * 커스텀 이벤트를 등록시킨다
 * @param {String} eventType
 * @param {Function} handlerToAttach
 * @returns {Pagination}
 */
Pagination.prototype.attach = function(eventType, handlerToAttach) {
    if (arguments.length == 1) {
        for(var x in arguments[0]){
            this.attach(x, arguments[0][x]);
        }
        return this;
    }

    var handlerList = this._eventHandler[eventType];
    if (typeof handlerList == 'undefined'){
        handlerList = this._eventHandler[eventType] = [];
    }
    handlerList.push(handlerToAttach);

    return this;
}



/**
 * 이벤트를 발생시킨다.
 *
 * @param {String} eventType 커스텀 이벤트명
 * @param {Object} eventObject 커스텀 이벤트 핸들러에 전달되는 객체.
 * @return {Boolean} 핸들러의 커스텀 이벤트객체에서 stop메서드가 수행되면 false를 리턴
 */
Pagination.prototype.fireEvent = function(eventType, eventObject) {
    eventObject = eventObject || {};

    var inlineHandler = this['on' + eventType],
        handlerList = this._eventHandler[eventType] || [],
        hasInlineHandler = $.isFunction(inlineHandler),
        hasHandlerList = handlerList.length > 0;

    if (!hasInlineHandler && !hasHandlerList) {
        return true;
    }

    handlerList = handlerList.concat(); //fireEvent수행시 핸들러 내부에서 detach되어도 최초수행시의 핸들러리스트는 모두 수행하게 하기위한 복사
    eventObject.eventType = eventType;

    if (!eventObject._aExtend) {
        eventObject._aExtend = [];

        eventObject.stop = function(){
            if (eventObject._aExtend.length > 0) {
                eventObject._aExtend[eventObject._aExtend.length - 1].bCanceled = true;
            }
        };
    }

    eventObject._aExtend.push({
        sType: eventType,
        bCanceled: false
    });

    var aArg = [eventObject],
        i, nLen;

    for (i = 2, nLen = arguments.length; i < nLen; i++){
        aArg.push(arguments[i]);
    }

    if (hasInlineHandler) {
        inlineHandler.apply(this, aArg);
    }

    if (hasHandlerList) {
        var handler;
        for (i = 0; (handler = handlerList[i]); i++) {
            handler.apply(this, aArg);
        }
    }

    return !eventObject._aExtend.pop().bCanceled;
};
