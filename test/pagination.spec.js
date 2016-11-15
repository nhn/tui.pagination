var Pagination = require('../src/js/pagination.js');

describe('Test pagination behavior', function() {

    jasmine.getFixtures().fixturesPath = "base/";


    beforeEach(function() {
        loadFixtures("test/fixtures/pageview.html");
    });

    describe('create object',  function() {
        var pagination,
            paginationOption;
        beforeEach(function() {
            pagination = new Pagination({
                itemCount: 500,
                itemPerPage: 10
            }, $('.paginate3'));

            paginationOption = new Pagination({
                itemCount: 500,
                itemPerPage: 10,
                pagePerPageList: 20,
                page: 15,
                moveUnit: 'page',
                isCenterAlign: true,
                classPrefix: 'paging-',
                firstItemClassName: 'left-child',
                lastItemClassName: 'right-child',
                pageTemplate: '<a href="#">{=page}Num</a>',
                currentPageTemplate: '<strong>{=page}Sel</strong>'
            }, $('.paginate4'));
        });


        it('Are paginations defined?', function() {
            expect(pagination).toBeDefined();
            expect(paginationOption).toBeDefined();
        });
        it('Are pationations defined, with options?', function() {

            var itemCount = pagination.getOption('itemCount'),
                itemPerPage = pagination.getOption('itemPerPage'),
                pagePerPageList = pagination.getOption('pagePerPageList'),
                page =  pagination.getOption('page'),
                moveUnit = pagination.getOption('moveUnit'),
                isCenterAlign =  pagination.getOption('isCenterAlign'),
                insertTextNode = pagination.getOption('insertTextNode'),
                classPrefix = pagination.getOption('classPrefix'),
                firstItemClass = pagination.getOption('firstItemClassName'),
                lastItemClass = pagination.getOption('lastItemClassName'),
                pageTemplate = pagination.getOption('pageTemplate'),
                currentPageTeplate = pagination.getOption('currentPageTemplate');

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

            itemCount = paginationOption.getOption('itemCount');
            itemPerPage = paginationOption.getOption('itemPerPage');
            pagePerPageList = paginationOption.getOption('pagePerPageList');
            page =  paginationOption.getOption('page');
            moveUnit = paginationOption.getOption('moveUnit');
            isCenterAlign =  paginationOption.getOption('isCenterAlign');
            insertTextNode = paginationOption.getOption('insertTextNode');
            classPrefix = paginationOption.getOption('classPrefix');
            firstItemClass = paginationOption.getOption('firstItemClassName');
            lastItemClass = paginationOption.getOption('lastItemClassName');
            pageTemplate = paginationOption.getOption('pageTemplate');
            currentPageTeplate = paginationOption.getOption('currentPageTemplate');

            expect(itemCount).toBe(500);
            expect(itemPerPage).toBe(10);
            expect(pagePerPageList).toBe(20);
            expect(page).toBe(15);
            expect(moveUnit).toBe('page');
            expect(isCenterAlign).toBe(true);
            expect(classPrefix).toBe('paging-');
            expect(firstItemClass).toBe('left-child');
            expect(lastItemClass).toBe('right-child');
            expect(pageTemplate).toBe('<a href="#">{=page}Num</a>');
            expect(currentPageTeplate).toBe('<strong>{=page}Sel</strong>');

        });

        it('Check correctly creating view via pagination.', function() {
            var view = pagination._view;
            var viewOfPaginationOption = paginationOption._view;
            expect(view).toBeDefined();
            expect(viewOfPaginationOption).toBeDefined();
        });


        it('Change options via setOption() & getOption() with itemCount attribute', function() {
            pagination.setOption('itemCount', 100);
            expect(pagination.getOption('itemCount')).toBe(100);
            pagination.setOption('itemCount', 500);
            expect(pagination.getOption('itemCount')).toBe(500);
            pagination.setOption('isCenterAlign', true);
            expect(pagination.getOption('isCenterAlign')).toBe(true);
        });

        it('Check current page via getCurrentPage()', function() {
            var page = pagination.getCurrentPage();
            expect(page).toBe(1);
        });

        it('Get First Item via getIndexOfFirstItem()', function() {
            var page = pagination.getIndexOfFirstItem(2);
            expect(page).toBe(11);
        });

        it('Get relative page via getRelativePage()', function() {
            var result,
                po = paginationOption;
            result = po._getRelativePage('pre');
            expect(result).toBe(14);
            result = po._getRelativePage('next');
            expect(result).toBe(16);
        });

        it('Check page after move via movePage(page number)', function() {
            pagination.movePageTo(1);
            var page1 = pagination.getCurrentPage();
            pagination.movePageTo(2);
            var page2 = pagination.getCurrentPage();
            pagination.movePageTo(3);
            var page3 = pagination.getCurrentPage();
            pagination.movePageTo(100);
            // 아이템의 갯수를 훨씬 넘어갈땐, 마지막 페이지가 된다
            var page4 = pagination.getCurrentPage();
            // 마지막 페이지를 구한다
            var lastPage = pagination._getLastPage();
            expect(page1).toBe(1);
            expect(page2).toBe(2);
            expect(page3).toBe(3);
            expect(page4).toBe(lastPage);
        });

        it('Check first, prev, next, last pages.', function() {
            var event,
                currentPage1,
                currentPage2,
                currentPage3,
                currentPage4,
                po = paginationOption;
            po._element = $('.paginate4');

            po._options.$pre_endOn = $('.paginate4 a.paging-pre-end');
            po._options.$preOn = $('.paginate4 a.paging-next');
            po._options.$nextOn = $('.paginate4 a.paging-next-end');
            po._options.$lastOn = $('.paginate4 a.paging-pre');

            event = jQuery.Event('click', {target: $('.paginate4 .paging-pre-end')});
            po._onClickPageList(event);
            currentPage1 = po.getCurrentPage();
            event = jQuery.Event('click', {target: $('.paginate4 .paging-next')});
            po._onClickPageList(event);
            currentPage2 = po.getCurrentPage();
            event = jQuery.Event('click', {target: $('.paginate4 .paging-next-end')});
            po._onClickPageList(event);
            currentPage3 = po.getCurrentPage();
            event = jQuery.Event('click', {target: $('.paginate4 .paging-pre')});
            po._onClickPageList(event);
            currentPage4 = po.getCurrentPage();
            expect(currentPage1).toBe(1);
            expect(currentPage2).toBe(1);
            expect(currentPage3).toBe(2);
            expect(currentPage4).toBe(50);
        });

        it('Redraw pagination via reset()', function() {
            pagination.reset();
            var page = pagination.getCurrentPage();
            expect(page).toBe(1);
        });

        it('Redraw pagination via reset() with new itemCount', function() {
            pagination.reset(100);
            var itemCount = pagination.getOption('itemCount');
            expect(itemCount).toBe(100);
        });

        it('Check custom event behavior after connect custom event handler.', function() {

            var isBeforeMoveFire1 = false,
                page;

            paginationOption.on('beforeMove', function() {
                isBeforeMoveFire1 = true;
            });

            paginationOption.movePageTo(13, false);
            page = paginationOption.getCurrentPage();

            expect(page).toBe(13);
            expect(isBeforeMoveFire1).toBeTruthy();

        });

        describe('When movePageTo() is called', function() {
            var beforeMoveMock, afterMoveMock;

            beforeEach(function() {
                beforeMoveMock = jasmine.createSpy();
                afterMoveMock = jasmine.createSpy();

                pagination.on('beforeMove', beforeMoveMock);
                pagination.on('afterMove', afterMoveMock);
            });

            it('with no option, the custom events are fired.', function() {
                pagination.movePageTo(10);

                expect(beforeMoveMock).toHaveBeenCalled();
                expect(afterMoveMock).toHaveBeenCalled();
            });

            it('with "false" option, the custom events are fired.', function() {
                pagination.movePageTo(10, false);

                expect(beforeMoveMock).toHaveBeenCalled();
                expect(afterMoveMock).toHaveBeenCalled();
            });

            it('with "true" option, the custom events are not fired.', function() {
                pagination.movePageTo(10, true);

                expect(beforeMoveMock).not.toHaveBeenCalled();
                expect(afterMoveMock).not.toHaveBeenCalled();
            });
        });
    });
});
