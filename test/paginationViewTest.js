describe('페이징 객체의 동작을 테스트', function() {
    // 객체 생성

    jasmine.getFixtures().fixturesPath = "base/";

    beforeEach(function() {
        loadFixtures("test/fixture/pageview.html");
    });

    var pv = new ne.component.Pagination.PaginationView({
    }, $('.paginate1'));

    var pv2 = new ne.component.Pagination.PaginationView({
        itemCount: 500,
        itemPerPage: 10,
        pagePerPageList: 10,
        page: 15,
        moveUnit: 'page',
        isCenterAlign: true,
        insertTextNode: 'P',
        classPrefix: 'fe_',
        firstItemClassName: 'left-child',
        lastItemClassName: 'right-child',
        pageTemplate: '<a href="#">{=page}Num</a>',
        currentPageTemplate: '<strong>{=page}Sel</strong>'
    }, $('.paginate2'));

    it('생성 확인', function() {
        expect(pv).toBeDefined();
        expect(pv2).toBeDefined();
    });


    it('_wrapPrefix확인', function() {
        var pfx = pv2._wrapPrefix('text');
        expect(pfx).toBe('fe_text');
    });

    it('_setPageNumbers 페이지 세팅', function() {
        var viewSet = {
            leftPageNumber: 11,
            rightPageNumber: 20,
            page: 15
        },
        pageList;
        pv2._setPageNumbers(viewSet);
        pageList = pv2._pageItemList;
        expect(pageList.length).toBe(9);
    });

    it('_getEdge 양끝점을 구한다.', function() {
        var viewSet = {
            lastPage: 50,
            page: 5
        },
        set;
        pv2._options.isCenterAlign = true;
        set = pv2._getEdge(viewSet);
        expect(set.left).toBe(1);
        expect(set.right).toBe(10);

        viewSet = {
            lastPage: 50,
            page: 51
        };
        set = pv2._getEdge(viewSet);
        expect(set.left).toBe(41);
        expect(set.right).toBe(50);
    });

});
