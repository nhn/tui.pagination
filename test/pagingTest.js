describe('페이징 객체의 동작을 테스트', function() {
    // 객체 생성
    var pagination = new ne.Component.Pagination({
    }, $('.paginate1'));

    var paginationOption = new ne.Component.Pagination({
        itemCount: 500,
        itemPerPage: 15,
        pagePerPageList: 20,
        page: 15,
        moveUnit: 'page',
        isCenterAlign: true,
        insertTextNode: 'P',
        classPrefix: 'paging',
        firstItemClassName: 'left-child',
        lastItemClassName: 'right-child',
        pageTemplate: '<a href="#">{=page}Num</a>',
        currentPageTemplate: '<strong>{=page}Sel</strong>'
    }, $('.paginate2'));

    it('생성된 객체들이 옵션에 맞게 생성되었는지 확인', function() {

        // pagination
        expect(pagination).toBeDefined();

        var itemCount = pagination._getOption('itemCount'),
            itemPerPage = pagination._getOption('itemPerPage'),
            pagePerPageList = pagination._getOption('pagePerPageList'),
            page =  pagination._getOption('page'),
            moveUnit = pagination._getOption('moveUnit'),
            isCenterAlign =  pagination._getOption('isCenterAlign'),
            insertTextNode = pagination._getOption('insertTextNode'),
            classPrefix = pagination._getOption('classPrefix'),
            firstItemClass = pagination._getOption('firstItemClassName'),
            lastItemClass = pagination._getOption('lastItemClassName'),
            pageTemplate = pagination._getOption('pageTemplate'),
            currentPageTeplate = pagination._getOption('currentPageTemplate');

        expect(itemCount).toBe(10);
        expect(itemPerPage).toBe(10);
        expect(pagePerPageList).toBe(10);
        expect(page).toBe(1);
        expect(moveUnit).toBe('pagelist');
        expect(isCenterAlign).toBe(false);
        expect(insertTextNode).toBe('');
        expect(classPrefix).toBe('');
        expect(firstItemClass).toBe('first-child');
        expect(lastItemClass).toBe('last-child');
        expect(pageTemplate).toBe('<a href="#">{=page}</a>');
        expect(currentPageTeplate).toBe('<strong>{=page}</strong>');

        itemCount = paginationOption._getOption('itemCount');
        itemPerPage = paginationOption._getOption('itemPerPage');
        pagePerPageList = paginationOption._getOption('pagePerPageList');
        page =  paginationOption._getOption('page');
        moveUnit = paginationOption._getOption('moveUnit');
        isCenterAlign =  paginationOption._getOption('isCenterAlign');
        insertTextNode = paginationOption._getOption('insertTextNode');
        classPrefix = paginationOption._getOption('classPrefix');
        firstItemClass = paginationOption._getOption('firstItemClassName');
        lastItemClass = paginationOption._getOption('lastItemClassName');
        pageTemplate = paginationOption._getOption('pageTemplate');
        currentPageTeplate = paginationOption._getOption('currentPageTemplate');

        expect(paginationOption).toBeDefined();

        expect(itemCount).toBe(500);
        expect(itemPerPage).toBe(15);
        expect(pagePerPageList).toBe(20);
        expect(page).toBe(15);
        expect(moveUnit).toBe('page');
        expect(isCenterAlign).toBe(true);
        expect(insertTextNode).toBe('P');
        expect(classPrefix).toBe('paging');
        expect(firstItemClass).toBe('left-child');
        expect(lastItemClass).toBe('right-child');
        expect(pageTemplate).toBe('<a href="#">{=page}Num</a>');
        expect(currentPageTeplate).toBe('<strong>{=page}Sel</strong>');

    });

    it('뷰가 제대로 생성 되었는지 확인한다', function() {
        var view = pagination._view;
        var viewOfPaginationOption = paginationOption._view;
        expect(view).toBeDefined();
        expect(viewOfPaginationOption).toBeDefined();
    });


    it('옵션 변경을 테스트한다. _setOption & _getOption itemCount', function() {
        pagination._setOption('itemCount', 100);
        expect(pagination._getOption('itemCount')).toBe(100);
        pagination._setOption('itemCount', 500);
        expect(pagination._getOption('itemCount')).toBe(500);
        pagination._setOption('isCenterAlign', true);
        expect(pagination._getOption('isCenterAlign')).toBe(true);
    });

    it('현재 페이지를 확인한다', function() {
        var page = pagination.getCurrentPage();
        expect(page).toBe(1);
    });

    it('페이지 이동하고 현재페이지 체크', function() {
        pagination.movePageTo(1);
        var page1 = pagination.getCurrentPage();
        pagination.movePageTo(2);
        var page2 = pagination.getCurrentPage();
        pagination.movePageTo(3);
        var page3 = pagination.getCurrentPage();
        pagination.movePageTo(4);
        var page4 = pagination.getCurrentPage();
        pagination.movePageTo(10);
        var page5 = pagination.getCurrentPage();
        pagination.movePageTo(100);
        // 아이템의 갯수를 훨씬 넘어갈땐, 마지막 페이지가 된다
        var page6 = pagination.getCurrentPage();
        // 마지막 페이지를 구한다
        var lastPage = pagination._getLastPage();
        expect(page1).toBe(1);
        expect(page2).toBe(2);
        expect(page3).toBe(3);
        expect(page4).toBe(4);
        expect(page5).toBe(10);
        expect(page6).toBe(lastPage);
    });

    it('페이징을 다시그린다.', function() {
        pagination.reset();
        var page = pagination.getCurrentPage();
        expect(page).toBe(1);
    });

    it('페이징을 다시 그린다. 아이템 카운트 재설정을 함께 한다.', function() {
        pagination.reset(100);
        var itemCount = pagination._getOption('itemCount');
        expect(itemCount).toBe(100);
    });

    describe('커스텀 이벤트를 등록하고 이벤트가 동작하는 지 확인한다.', function() {

        var isBeforeMoveFire1 = false,
            isAfterMoveFire1 = false,
            page;

        paginationOption.attach('beforeMove', function() {
            isBeforeMoveFire1 = true;
        }).attach('afterMove', function() {
            isAfterMoveFire1 = true;
            check();
        });

        function check() {
            paginationOption.movePageTo(3, true);
            page = paginationOption.getCurrentPage();

            expect(page).toBe(3);
            expect(isBeforeMoveFire1).truthy();
            expect(isAfterMoveFire1).truthy();
        }
    });

});
