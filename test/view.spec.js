var View = require('../src/js/view.js');

describe('Test Pagination view', function() {

    jasmine.getFixtures().fixturesPath = "base/";

    beforeEach(function() {
        loadFixtures("test/fixtures/pageview.html");
    });

    var pv = new View({
    }, $('.paginate1'));

    var pv2 = new View({
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

    it('Are the views created?', function() {
        expect(pv).toBeDefined();
        expect(pv2).toBeDefined();
    });


    it('Check the prefix applied via _wrapPrefix()', function() {
        var pfx = pv2._wrapPrefix('text');
        expect(pfx).toBe('fe_text');
    });

    it('Set page number via _setPageNumbers(move page number)', function() {
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

    it('Get each edge via _getEdge()', function() {
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
