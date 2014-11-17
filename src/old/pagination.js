/**
 @fileOverview 리스트에 페이지 목록 매기고 페이지에 따른 네비게이션을 구현한 컴포넌트
 @author senxation
 @version 1.7.0
 **/
/**
 리스트에 페이지 목록 매기고 페이지에 따른 네비게이션을 구현한 컴포넌트<br />
 기본 목록은 마크업에 static하게 정의되어있고, 페이지 이동을위해 클릭시마다 보여줄 아이템 목록을 Ajax Call을 통해 받아온다.<br />
 페이지 컴포넌트가 로드되면 .loaded 클래스명이 추가된다.

 @class pug.Pagination
 @extends pug.component
 @keyword pagination, page, 페이지, 목록
 **/
"use strict";
pug.Pagination = pug.defineClass({
    __name : 'pug.Pagination',
    /**
     * 기본 옵션 저장 프로퍼티
     *
     * @property _defaultOption
     * @type {DataObject}
     * @private
     */
    _defaultOption : {
        itemCount : 10,
        itemPerPage : 10,
        pagePerPageList : 10,
        page : 1,
        moveUnit : "pagelist",
        isCenterAlign : false,
        insertTextNode : "",
        classPrefix : "",
        firstItemClassName : "first-child",
        lastItemClassName : "last-child",
        pageTemplate : "<a href='#'>{=page}</a>",
        currentPageTemplate : "<strong>{=page}</strong>"
    },
    /**
     * 생성자 함수
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
     * @example
     * 	pug.defineModule("eztrade.example",{
		 * 		_elementSelector : {
		 * 			"root" : ".pagination_parent_element",
		 * 			"pagination" : ".pagination"
		 * 		},
		 * 		initialize : function(){
		 * 			this._instanceData['paginationSample'] = pug.Pagination({
		 * 				"itemCount" : 1000, //(Number) 전체 아이템 개수
		 * 				"itemPerPage" : 10, //(Number) 한 페이지에 표시될 아이템 개수
		 * 				"pagePerPageList" : 10, //(Number) 페이지목록에 표시될 페이지 개수
		 * 				"page" : 1, //(Number) 초기 페이지
		 * 				"moveUnit" : "pagelist", //(String) 페이지목록 이동시 이동 단위 "page" || "pagelist"
		 * 				"isCenterAlign" : false, //(Boolean) 현재페이지가 항상 가운데 위치하도록 정렬. sMoveUnit이 "page"일 때만 사용
		 * 				"insertTextNode" : "", //(String) 페이지리스트 생성시 각각의 페이지 노드를 한줄로 붙여쓰지 않기 위해서는 "\n" 또는 " "를 설정한다. 이 옵션에 따라 렌더링이 달라질 수 있다.
		 * 				"classPrefix" : "pagination-", //(String) 컴포넌트에서 사용되는 클래스의 Prefix 
		 * 				"firstItemClassName" : "first-child", //(String) 첫번째 페이지리스트에 추가될 클래스명
		 * 				"lastItemClassName" : "last-child", //(String) 마지막 페이지리스트에 추가될 클래스명
		 * 				"pageTemplate" : "<a href='#'>{=page}</a>", //(String) 페이지에 대한 템플릿. {=page}부분이 페이지 번호로 대치된다. 
		 * 				"currentPageTemplate" : "<strong>{=page}</strong>", //(String) 현재페이지에 대한 템플릿. {=page}부분이 페이지 번호로 대치된다.
		 * 				"$firstPageLinkOn" : //(jQueryObject) '처음' 링크엘리먼트. 기본 값은 기준 엘리먼트 아래 pre_end 클래스명을 가지는 a 엘리먼트이다.
		 * 				"$prevPageLinkOn" : //(jQueryObject) '이전' 링크엘리먼트. 기본 값은 기준 엘리먼트 아래 pre 클래스명을 가지는 a 엘리먼트이다.
		 * 				"$nextPageLinkOn" : //(jQueryObject) '다음' 링크엘리먼트. 기본 값은 기준 엘리먼트 아래 next 클래스명을 가지는 a 엘리먼트이다.
		 * 				"$lastPageLinkOn" : //(jQueryObject) '마지막' 링크엘리먼트. 기본 값은 기준 엘리먼트 아래 next_end 클래스명을 가지는 a 엘리먼트이다.
		 * 				"$firstPageLinkOff" : //(jQueryObject) '처음' 엘리먼트. 기본 값은 기준 엘리먼트 아래 pre_end 클래스명을 가지는 span 엘리먼트이다.
		 * 				"$prevPageLinkOff" : //(jQueryObject) '이전' 엘리먼트. 기본 값은 기준 엘리먼트 아래 pre 클래스명을 가지는 span 엘리먼트이다.
		 * 				"$nextPageLinkOff" : //(jQueryObject) '다음' 엘리먼트. 기본 값은 기준 엘리먼트 아래 next 클래스명을 가지는 span 엘리먼트이다.
		 * 				"$lastPageLinkOff" : //(jQueryObject) '마지막' 엘리먼트. 기본 값은 기준 엘리먼트 아래 next_end 클래스명을 가지는 span 엘리먼트이다.
		 * 			},this._getElement('pagination')).attach({
		 *				beforeMove : function(eventData) {
		 *					//페이지 이동이 수행되기 직전에 발생
		 *					//전달되는 이벤트 객체 eventData = {
		 *					//	  page : (Number) 이동하려는 페이지
		 *					//}
		 *					//eventData.stop()을 수행하면 페이지 이동(move 이벤트)이 일어나지 않는다.
		 *				},
		 *				move : function(eventData) {
		 *					//페이지 이동이 완료된 이후 발생
		 *					//전달되는 이벤트 객체 eventData = {
		 *					//	  page : (Number) 현재 페이지
		 *					//}
		 *				},
		 *				click : function(eventData) {
		 *					//페이지 이동을 위한 숫자나 버튼을 클릭했을때 발생
		 *					//전달되는 이벤트 객체 eventData = {
		 *					//	  page : (Number) 클릭해서 이동할 페이지
		 *					//}
		 *					//eventData.stop()을 수행하면 페이지 이동(beforeMove, move 이벤트)이 일어나지 않는다.
		 *			});
		 *		}
		 *	});
		 *	pug.registerModule("eztrade.example");
		 **/
    $init : function(){
        this._pageItemList = [];
        this.option({
            $firstPageLinkOn : this.option("$firstPageLinkOn") || $("a." + this._wrapPrefix("pre_end"), this._element),
            $prevPageLinkOn : this.option("$prevPageLinkOn") || $("a." + this._wrapPrefix("pre"), this._element),
            $nextPageLinkOn : this.option("$nextPageLinkOn") || $("a." + this._wrapPrefix("next"), this._element),
            $lastPageLinkOn : this.option("$lastPageLinkOn") || $("a." + this._wrapPrefix("next_end"), this._element),
            $firstPageLinkOff : this.option("$firstPageLinkOff") || $("span." + this._wrapPrefix("pre_end"), this._element),
            $prevPageLinkOff : this.option("$prevPageLinkOff") || $("span." + this._wrapPrefix("pre"), this._element),
            $nextPageLinkOff : this.option("$nextPageLinkOff") || $("span." + this._wrapPrefix("next"), this._element),
            $lastPageLinkOff : this.option("$lastPageLinkOff") || $("span." + this._wrapPrefix("next_end"), this._element)
        });
        this._attachEventHandler(this._element, "click", $.proxy(this._onClickPageList, this));
        this.setItemCount(this.option("itemCount"));
        this.movePageTo(this.option("page"), false);
        this._element.addClass(this._wrapPrefix("loaded"));
    },

    /**
     클래스명에 Prefix 를 붙힘<br />
     Prefix는 options.classPrefix를 참조, 붙혀질 때 기존 클래스명의 언더바(_) 문자는 하이픈(-)으로 변환됨

     @method _wrapPrefix
     @private
     @param {String} className
     **/
    _wrapPrefix : function(className) {
        var classPrefix = this.option('classPrefix');
        return classPrefix ? classPrefix + className.replace(/_/g, '-') : className;
    },

    /**
     기준 엘리먼트를 구한다.

     @method getBaseElement
     @return {jQueryObject} jQuery를 랩핑한 엘리먼트
     **/
    getBaseElement : function() {
        return this._element;
    },

    /**
     전체 아이템의 개수를 리턴한다.

     @method getItemCount
     @return {Number} 아이템 개수
     **/
    getItemCount : function() {
        return this.option("itemCount");
    },

    /**
     전체 아이템의 개수를 설정한다.

     @method setItemCount
     @param {Number} n 아이템 개수
     **/
    setItemCount : function(n) {
        this.option({"itemCount" : n});
    },

    /**
     한 페이지에 보여줄 아이템의 개수를 구한다.

     @method getItemPerPage
     @return {Number} 한 페이지에 보여줄 아이템의 개수
     **/
    getItemPerPage : function() {
        return this.option("itemPerPage");
    },

    /**
     한 페이지에 보여줄 아이템의 개수를 설정한다.

     @method setItemPerPage
     @param {Object} n 아이템 개수
     **/
    setItemPerPage : function(n) {
        this.option("itemPerPage", n);
    },

    /**
     현재 페이지를 리턴한다.

     @method getCurrentPage
     @return {Number} 현재 페이지
     **/
    getCurrentPage : function() {
        return this._nCurrentPage;
    },

    /**
     해당 페이지의 첫번째 아이템이 전체 중 몇 번째 아이템인지 구한다.

     @method getFirstItemOfPage
     @param {Number} n 페이지 번호
     @return {Number}
     **/
    getFirstItemOfPage : function(n) {
        return this.getItemPerPage() * (n - 1) + 1;
    },

    /**
     아이템의 인덱스로부터 몇번째 페이지인지를 구한다.

     @method getPageOfItem
     @param {Number} n 아이템의 인덱스
     @return {Number}
     **/
    getPageOfItem : function(n) {
        return Math.ceil(n / this.getItemPerPage());
    },


    /**
     * 마지막 페이지 숫자를 구한다
     *
     * @method _getLastPage
     * @private
     * @return {Number} 마지막 페이지 숫자
     */
    _getLastPage : function() {
        return Math.ceil(this.getItemCount() / this.getItemPerPage());
    },

    /**
     * 이전, 다음 버튼을 클릭할 때 제공받을 페이지 숫자를 구한다
     *
     * @method _getRelativePage
     * @private
     * @param {String} relativeName 어떤 영역으로 옮겨갈지 정한다(pre_end, next_end, pre, next)
     * @return {Number} 해당되는 페이지 숫자
     */
    _getRelativePage : function(relativeName) {
        var nPage = null;
        var bMovePage = this.option("moveUnit") == "page";
        var nThisPageList = this._getPageList(this.getCurrentPage());

        switch (relativeName) {
            case "pre_end" :
                nPage = 1;
                break;

            case "next_end" :
                nPage = this._getLastPage();
                break;

            case "pre":
                nPage = bMovePage ? this.getCurrentPage() - 1 : (nThisPageList - 1) * this.option("pagePerPageList");
                break;

            case "next":
                nPage = bMovePage ? this.getCurrentPage() + 1 : (nThisPageList) * this.option("pagePerPageList") + 1;
                break;
        }

        return nPage;
    },

    /**
     몇번째 페이지 리스트인지 구함
     @method _getPageList
     @private
     @param {Number} thisPage
     @return {Number} 페이지 리스트 순번
     **/
    _getPageList : function(thisPage) {
        if (this.option("isCenterAlign")) {
            var nLeft = Math.floor(this.option("pagePerPageList") / 2);
            var nPageList = thisPage - nLeft;
            nPageList = Math.max(nPageList, 1);
            nPageList = Math.min(nPageList, this._getLastPage());
            return nPageList;
        }
        return Math.ceil(thisPage / this.option("pagePerPageList"));
    },

    /**
     * 엘리먼트에 원하는 자식엘리먼트가 있는지 확인한다.
     *
     * @method _isIn
     * @private
     * @param {jQueryObject} $find 존재하는지 확인할 자식 엘리먼트
     * @param {jQueryObject} $parent 부모 엘리먼트
     * @return {Boolean} 자식엘리먼트가 있으면 true, 자식 혹은 부모엘리먼트가 유효하지 않으면 false
     */
    _isIn : function($find, $parent) {
        if (!$parent) {
            return false;
        }
        return ($find[0] === $parent[0]) ? true : $find.isChildOf($parent);
    },

    /**
     * 페이지 숫자를 담은 엘리먼트 중 원하는 엘리먼트를 찾는다.
     * @method _getPageElement
     * @private
     * @param {jQueryObject|HTMLElement} el 목록 중에서 찾을 target 엘리먼트
     * @return {jQueryObject} 있을 경우 해당 엘리먼트 jQuery 객체를 반환하며, 없으면 null을 반환한다.
     */
    _getPageElement : function(el) {
        for(var i=0; i<this._pageItemList.length; i++){
            if(this._isIn(el, this._pageItemList[i])){
                return this._pageItemList[i];
            }
        }
        return null;
    },

    /**
     * 페이지 목록을 클릭했을 때 실행될 콜백함수<br />
     * 링크를 클릭했을시, 몇페이지로 이동해야 하는지 숫자를 산출한 뒤 movePageTo()를 실행시킨다.<br />
     * 'click' 컴포넌트 이벤트를 발생시킨다.<br />
     *
     * @method _onClickPageList
     * @private
     * @param we {jQueryEvent} 이벤트 객체
     */
    _onClickPageList : function(we) {
        we.preventDefault();

        var nPage = null,
            htOption = this.option(),
            el = $(we.target);

        if (this._isIn(el, htOption.$firstPageLinkOn)) {
            nPage = this._getRelativePage("pre_end");
        } else if (this._isIn(el, htOption.$prevPageLinkOn)) {
            nPage = this._getRelativePage("pre");
        } else if (this._isIn(el, htOption.$nextPageLinkOn)) {
            nPage = this._getRelativePage("next");
        } else if (this._isIn(el, htOption.$lastPageLinkOn)) {
            nPage = this._getRelativePage("next_end");
        } else {
            var elPage = this._getPageElement(el);
            if (elPage && elPage.length) {
                nPage = parseInt(elPage.text(), 10);
            } else {
                return;
            }
        }

        /**
         페이지 이동을 위한 숫자나 버튼을 클릭했을때 발생

         @event click
         @param {componentEvent} eventData
         @param {String} eventData.eventType 커스텀 이벤트명
         @param {Number} eventData.page 클릭해서 이동할 페이지
         @param {Function} eventData.stop 페이지 이동을 정지한다

         @example
         // 커스텀 이벤트 핸들링 예제
         pug.defineModule("eztrade.example", {
						...
						initialize : function(){
							// pug.Pagination 컴포넌트의 인스턴스를 생성
							this._instanceData["sample_pagination"] = new pug.Pagination({
								// 옵션을 정의한다.
								"itemCount" : 1000,
								"itemPerPage" : 10,
								"pagePerPageList" : 10
							}, this._getElement("pagination"));
							
							// 이벤트 핸들링
							this._instanceData["sample_pagination"].attach("click", function(eventData) {
								// 클릭한 페이지 번호
								var clickedPage = eventData.page;
								
								// 만약, 페이지를 이동하고 싶지 않다면
								// eventData.stop()을 호출하여 중지할 수 있다.
								if( clickedPage === 0 ) {
									eventData.stop();
								}
							});
						},
						...
					});
         pug.registerModule("eztrade.example");
         **/
        if (!this.fireEvent("click", {"page" : nPage})) {
            return;
        }

        this.movePageTo(nPage);
    },

    /**
     * 페이지 숫자를 받으면 현재 페이지 범위내로 변경하여 반환한다.<br />
     * 예를들어 총 페이지수가 23인데 30이라는 수를 넣으면 23을 반환받는다. 숫자가 1보다 작으면 1을 반환받는다.
     *
     * @method _convertToAvailPage
     * @private
     * @param {Number} page 재 페이지 범위내로 변환할 페이지 숫자
     * @return {Number} 페이지 범위내로 확인된 숫자
     */
    _convertToAvailPage : function(page) {
        var nLastPage = this._getLastPage();
        page = Math.max(page, 1);
        page = Math.min(page, nLastPage);
        return page;
    },

    /**
     지정한 페이지로 이동하고 페이지 목록을 다시 그린다.
     이동하기전 beforeMove, 이동후에 move 커스텀 이벤트를 발생한다.

     @method movePageTo
     @param {Number} page 이동할 페이지
     @param {Boolean} [isFireEvent=true] 커스텀 이벤트의 발생 여부
     **/
    movePageTo : function(page, isFireEvent){
        if (typeof isFireEvent == "undefined") {
            isFireEvent = true;
        }

        page = this._convertToAvailPage(page);
        this._nCurrentPage = page;

        if (isFireEvent) {
            /**
             페이지 이동이 수행되기 직전에 발생

             @event beforeMove
             @param {componentEvent} eventData
             @param {String} eventData.eventType 커스텀 이벤트명
             @param {Number} eventData.page 이동하게 될 페이지
             @param {Function} eventData.stop 페이지 이동을 정지한다

             @example
             // 커스텀 이벤트 핸들링 예제
             pug.defineModule("eztrade.example", {
							...
							initialize : function(){
								// pug.Pagination 컴포넌트의 인스턴스를 생성
								this._instanceData["sample_pagination"] = new pug.Pagination({
									// 옵션을 정의한다.
									"itemCount" : 1000,
									"itemPerPage" : 10,
									"pagePerPageList" : 10
								}, this._getElement("pagination"));
								
								// 이벤트 핸들링
								this._instanceData["sample_pagination"].attach("beforeMove", function(eventData) {
									// 이동하게 될 페이지
									var toPage = eventData.page;
									
									// 만약, 페이지를 이동하고 싶지 않다면
									// eventData.stop()을 호출하여 중지할 수 있다.
									if(toPage === 0) {
										eventData.stop();
									}
								});
							},
							...
						});
             pug.registerModule("eztrade.example");
             **/
            if (!this.fireEvent("beforeMove", {
                "page" : page
            })) {
                return;
            }
        }

        this._paginate(page);

        if (isFireEvent) {
            /**
             페이지 이동이 완료된 시점에서 발생

             @event move
             @param {componentEvent} eventData
             @param {String} eventData.eventType 커스텀 이벤트명
             @param {Number} eventData.page 사용자 클릭의 결과로 이동한 페이지
             @example
             // 커스텀 이벤트 핸들링 예제
             pug.defineModule("eztrade.example", {
							...
							initialize : function(){
								// pug.Pagination 컴포넌트의 인스턴스를 생성
								this._instanceData["sample_pagination"] = new pug.Pagination({
									// 옵션을 정의한다.
									"itemCount" : 1000,
									"itemPerPage" : 10,
									"pagePerPageList" : 10
								}, this._getElement("pagination"));
								
								// 이벤트 핸들링
								this._instanceData["sample_pagination"].attach("move", function(eventData) {
									// 사용자  클릭의 결과로 이동한 페이지
									var currentPage = eventData.page;
									}
								});
							},
             ...
             });
             pug.registerModule("eztrade.example");
             **/
            this.fireEvent("move", {
                "page" : page
            });
        }
    },

    /**
     페이징을 다시 그린다.

     @method reset
     @param {Number} itemCountCount 아이템의 개수가 바뀌었을 경우 설정해준다.
     **/
    reset : function(itemCount) {
        if (typeof itemCount == "undefined") {
            itemCount = this.option("itemCount");
        }

        this.setItemCount(itemCount);
        this.movePageTo(1, false);
    },

    /**
     * 페이지표시 마크업 사이사이에 options.insertTextNode를 끼어넣어준다.
     * @method _addTextNode
     * @private
     */
    _addTextNode : function() {
        var sTextNode = this.option("insertTextNode");
        this._element.append(document.createTextNode(sTextNode));
    },

    /**
     * 페이지를 실제 그리는 역할의 함수
     * @method _paginate
     * @private
     * @param {Number} page 현재페이지로 표시할 숫자
     */
    _paginate : function(page){
        this._empty();
        this._addTextNode();

        var htOption = this.option(),
            $firstPageLinkOn = htOption.$firstPageLinkOn,
            $prevPageLinkOn = htOption.$prevPageLinkOn,
            $nextPageLinkOn = htOption.$nextPageLinkOn,
            $lastPageLinkOn = htOption.$lastPageLinkOn,
            $firstPageLinkOff = htOption.$firstPageLinkOff,
            $prevPageLinkOff = htOption.$prevPageLinkOff,
            $nextPageLinkOff = htOption.$nextPageLinkOff,
            $lastPageLinkOff = htOption.$lastPageLinkOff,
            nLastPage = this._getLastPage(),
            nThisPageList = this._getPageList(page),
            nLastPageList = this._getPageList(nLastPage);

        if (nLastPage === 0) {
            this._element.addClass(this._wrapPrefix("no-result"));
        } else if (nLastPage == 1) {
            this._element.addClass(this._wrapPrefix("only-one")).removeClass(this._wrapPrefix("no-result"));
        } else {
            this._element.removeClass(this._wrapPrefix("only-one")).removeClass(this._wrapPrefix("no-result"));
        }

        var nFirstPageOfThisPageList, nLastPageOfThisPageList;
        if (htOption.isCenterAlign) {
            var nLeft = Math.floor(htOption.pagePerPageList / 2);
            nFirstPageOfThisPageList = page - nLeft;
            nFirstPageOfThisPageList = Math.max(nFirstPageOfThisPageList, 1);
            nLastPageOfThisPageList = nFirstPageOfThisPageList + htOption.pagePerPageList - 1;
            if (nLastPageOfThisPageList > nLastPage) {
                nFirstPageOfThisPageList = nLastPage - htOption.pagePerPageList + 1;
                nFirstPageOfThisPageList = Math.max(nFirstPageOfThisPageList, 1);
                nLastPageOfThisPageList = nLastPage;
            }
        } else {
            nFirstPageOfThisPageList = (nThisPageList - 1) * htOption.pagePerPageList + 1;
            nLastPageOfThisPageList = (nThisPageList) * htOption.pagePerPageList;
            nLastPageOfThisPageList = Math.min(nLastPageOfThisPageList, nLastPage);
        }

        if (htOption.moveUnit == "page") {
            nThisPageList = page;
            nLastPageList = nLastPage;
        }

        //first
        if (page > 1) {
            if ($firstPageLinkOn) {
                this._element.append($firstPageLinkOn);
                this._addTextNode();
            }
        } else {
            if ($firstPageLinkOff) {
                this._element.append($firstPageLinkOff);
                this._addTextNode();
            }
        }

        //prev
        if (nThisPageList > 1) {
            if ($prevPageLinkOn) {
                this._element.append($prevPageLinkOn);
                this._addTextNode();
            }
        } else {
            if ($prevPageLinkOff) {
                this._element.append($prevPageLinkOff);
                this._addTextNode();
            }
        }

        var $pageItem;
        for (var i = nFirstPageOfThisPageList; i <= nLastPageOfThisPageList ; i++) {
            if (i == page) {
                $pageItem = $(htOption.currentPageTemplate.replace("{=page}", i.toString()));
            } else {
                $pageItem = $(htOption.pageTemplate.replace("{=page}", i.toString()));
                this._pageItemList.push($pageItem);
            }

            if (i == nFirstPageOfThisPageList) {
                $pageItem.addClass(this._wrapPrefix(this.option("firstItemClassName")));
            }
            if (i == nLastPageOfThisPageList) {
                $pageItem.addClass(this._wrapPrefix(this.option("lastItemClassName")));
            }
            this._element.append($pageItem);

            this._addTextNode();
        }

        //next
        if (nThisPageList < nLastPageList) {
            if ($nextPageLinkOn) {
                this._element.append($nextPageLinkOn);
                this._addTextNode();
            }
        } else {
            if ($nextPageLinkOff) {
                this._element.append($nextPageLinkOff);
                this._addTextNode();
            }
        }

        //last
        if (page < nLastPage) {
            if ($lastPageLinkOn) {
                this._element.append($lastPageLinkOn);
                this._addTextNode();
            }
        } else {
            if ($lastPageLinkOff) {
                this._element.append($lastPageLinkOff);
                this._addTextNode();
            }
        }
    },

    /**
     * 기준 엘리먼트에 작성된 내용을 초기화 시킨다.
     * @method _empty
     * @private
     */
    _empty : function(){
        var htOption = this.option(),
            $firstPageLinkOn = htOption.$firstPageLinkOn,
            $prevPageLinkOn = htOption.$prevPageLinkOn,
            $nextPageLinkOn = htOption.$nextPageLinkOn,
            $lastPageLinkOn = htOption.$lastPageLinkOn,
            $firstPageLinkOff = htOption.$firstPageLinkOff,
            $prevPageLinkOff = htOption.$prevPageLinkOff,
            $nextPageLinkOff = htOption.$nextPageLinkOff,
            $lastPageLinkOff = htOption.$lastPageLinkOff;

        htOption.$firstPageLinkOn = this._clone($firstPageLinkOn);
        htOption.$prevPageLinkOn = this._clone($prevPageLinkOn);
        htOption.$lastPageLinkOn = this._clone($lastPageLinkOn);
        htOption.$nextPageLinkOn = this._clone($nextPageLinkOn);
        htOption.$firstPageLinkOff = this._clone($firstPageLinkOff);
        htOption.$prevPageLinkOff = this._clone($prevPageLinkOff);
        htOption.$lastPageLinkOff = this._clone($lastPageLinkOff);
        htOption.$nextPageLinkOff = this._clone($nextPageLinkOff);
        this._pageItemList = [];
        this._element.empty();
    },

    /**
     * 엘리먼트 복제, html은 동일하나, jQuery객체상태는 초기화 하여 반환된다.
     * @param {jQueryObject} $link 복제할 엘리먼트
     * @return {jQueryObject} 복제되어 반환된 엘리먼트
     */
    _clone : function($link) {
        if ($link && $link.length && $link.get(0).cloneNode) {
            return $($link.get(0).cloneNode(true));
        }
        return $link;
    }
}, pug.component);