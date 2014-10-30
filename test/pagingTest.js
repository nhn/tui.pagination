describe('페이징 객체의 동작을 테스트', function() {
    var pagination = new Pagination({
        "itemCount": 200,
        "itemPerPage": 10,
        "pagePerPageList": 10
    }, $('.paginate1'));


    it('객체를 생성하고 생성되었는지 확인', function() {
        expect(pagination).toBeDefined();
    });

    it('옵션을 테스트한다.', function() {
        pagination._setOption('itemCount', 100);
        expect(pagination._getOption('itemCount')).toEqual(100);
        pagination._setOption('itemCount', 500);
        expect(pagination._getOption('itemCount')).toEqual(500);
    });

    it('현재 페이지를 확인한다', function() {
        var page = pagination.getCurrentPage();
        expect(page).toEqual(1);
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
        expect(page1).toEqual(1);
        expect(page2).toEqual(2);
        expect(page3).toEqual(3);
        expect(page4).toEqual(4);
        expect(page5).toEqual(10);
        expect(page6).toEqual(lastPage);
    });

    it('페이징을 다시그린다.', function() {
        pagination.reset();
        var page = pagination.getCurrentPage();
        expect(page).toEqual(1);
    });
});
