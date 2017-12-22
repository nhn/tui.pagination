'use strict';

var Pagination = require('../src/js/pagination.js');

describe('Pagination', function() {
    var pagination1, pagination2, pagination3;
    var $element1, $element2, $element3;

    beforeEach(function() {
        $element1 = $('<div id="pagination1"></div>');
        $element2 = $('<div id="pagination2"></div>');
        $element3 = $('<div id="pagination3"></div>');

        pagination1 = new Pagination($element1);

        pagination2 = new Pagination($element2, {
            totalItems: 500,
            itemsPerPage: 10,
            visiblePages: 11,
            page: 22
        });

        pagination3 = new Pagination($element3, {
            totalItems: 500,
            itemsPerPage: 10,
            visiblePages: 11,
            page: 15,
            centerAlign: true,
            template: {
                page: '<a href="#" class="page">{{page}}</a>',
                currentPage: '<span class="page">{{page}}</span>'
            }
        });
    });

    describe('Private method - ', function() {
        it('"getCurrentPage" returns page value in options', function() {
            var page1, page2, page3;
            page1 = pagination1.getCurrentPage();
            expect(page1).toBe(1); // default
            page2 = pagination2.getCurrentPage();
            expect(page2).toBe(22);
            page3 = pagination3.getCurrentPage();
            expect(page3).toBe(15);
        });

        it('"getLastPage" returns last page number on total pages.', function() {
            var lastPage1, lastPage2, lastPage3;
            lastPage1 = pagination1._getLastPage();
            expect(lastPage1).toBe(1); // default
            lastPage2 = pagination2._getLastPage();
            expect(lastPage2).toBe(50);
            lastPage3 = pagination3._getLastPage();
            expect(lastPage3).toBe(50);
        });

        it('"getPageIndex" returns different page index by "centerAlign" option.', function() {
            var pageIndex1, pageIndex2;
            pageIndex1 = pagination2._getPageIndex(12);
            expect(pageIndex1).toBe(2);
            pageIndex2 = pagination3._getPageIndex(12); // centerAlign: true
            expect(pageIndex2).toBe(7);
        });

        it('"getRelativePage" returns prev or next page by type.', function() {
            var prevPage, nextPage;
            prevPage = pagination2._getRelativePage('prev');
            expect(prevPage).toBe(21);
            nextPage = pagination2._getRelativePage('next');
            expect(nextPage).toBe(23);
        });

        it('"getMorePage" returns start or last page index of next page list by type.', function() {
            var prevPageIndex, nextPageIndex, prevCenterPageIndex, nextCenterPageIndex;
            prevPageIndex = pagination2._getMorePageIndex('prev');
            expect(prevPageIndex).toBe(11);
            nextPageIndex = pagination2._getMorePageIndex('next');
            expect(nextPageIndex).toBe(23);
            prevCenterPageIndex = pagination3._getMorePageIndex('prev');
            expect(prevCenterPageIndex).toBe(9);
            nextCenterPageIndex = pagination3._getMorePageIndex('next');
            expect(nextCenterPageIndex).toBe(21);
        });
    });

    describe('Public API -', function() {
        it('When "movePageTo" is called, the page is changed.', function() {
            var page1, page2, page3, page4, lastPage;

            pagination2.movePageTo(1);
            page1 = pagination2.getCurrentPage();
            expect(page1).toBe(1);

            pagination2.movePageTo(2);
            page2 = pagination2.getCurrentPage();
            expect(page2).toBe(2);

            pagination2.movePageTo(3);
            page3 = pagination2.getCurrentPage();
            expect(page3).toBe(3);

            pagination2.movePageTo(100);
            page4 = pagination2.getCurrentPage();
            lastPage = pagination2._getLastPage();
            expect(page4).toBe(lastPage);
        });

        it('When "reset" is called, the current page reset and total items is changed.', function() {
            var currentPage;

            pagination3.reset();
            currentPage = pagination3.getCurrentPage();
            expect(currentPage).toBe(1);

            pagination3.movePageTo(10);
            pagination3.reset();
            pagination3.movePageTo(10);
            expect(currentPage).toBe(1);
        });

        it('When "reset" is called with total items, the displaying pages are changed.', function() {
            var pages;

            pagination3.reset(0);
            pages = $element3.find('.page').length;
            expect(pages).toBe(1);

            pagination3.reset(20);
            pages = $element3.find('.page').length;
            expect(pages).toBe(2);
        });
    });

    describe('Event - ', function() {
        it('When "movePageTo" is called and the "beforeMove" event is ignore,' +
            'the current page is not changed.', function() {
            var mock = jasmine.createSpy('"beforeMove" handler').and.returnValue(false);
            var prevPage = pagination2.getCurrentPage();
            var currentPage;

            pagination2.on('beforeMove', mock);
            pagination2.movePageTo(3);

            currentPage = pagination2.getCurrentPage();
            expect(currentPage).toBe(prevPage);
        });

        it('When "movePageTo" is called and the "beforeMove" event is fired,' +
            'the current page is change.', function() {
            var mock = jasmine.createSpy('"beforeMove" handler').and.returnValue(true);
            var prevPage = pagination2.getCurrentPage();
            var currentPage;

            pagination2.on('beforeMove', mock);
            pagination2.movePageTo(3);

            currentPage = pagination2.getCurrentPage();
            expect(currentPage).not.toBe(prevPage);
        });

        it('When "movePageTo" is called and the "beforeMove" event is fired,' +
            '"afterMove" event is fired.', function() {
            var beforeMoveMock = jasmine.createSpy('"beforeMove" handler').and.returnValue(true);
            var afterMoveMock = jasmine.createSpy('"afterMove" handler');

            pagination2.on('beforeMove', beforeMoveMock);
            pagination2.on('afterMove', afterMoveMock);
            pagination2.movePageTo(3);

            expect(afterMoveMock).toHaveBeenCalled();
        });

        it('When the "first" move button is clicked, the page is changeed to 1 page.', function() {
            var currentPage;

            pagination3._onClickHandler('first');

            currentPage = pagination3.getCurrentPage();
            expect(currentPage).toBe(1);
        });

        it('When the "prev" move button is clicked, the page is changed to previous page.', function() {
            var prevPage = pagination3.getCurrentPage();
            var currentPage;

            pagination3._onClickHandler('prev');

            currentPage = pagination3.getCurrentPage();
            expect(currentPage).toBe(prevPage - 1);
        });

        it('When the "next" move button is clicked, the page is changed to next page.', function() {
            var prevPage = pagination3.getCurrentPage();
            var currentPage;

            pagination3._onClickHandler('next');

            currentPage = pagination3.getCurrentPage();
            expect(currentPage).toBe(prevPage + 1);
        });

        it('When the "last" move button is clicked, the page is changed to last page.', function() {
            var lastPage = pagination3._getLastPage();
            var currentPage;

            pagination3._onClickHandler('last');

            currentPage = pagination3.getCurrentPage();
            expect(currentPage).toBe(lastPage);
        });

        it('When the "prev" more button is clicked,' +
            'the page is changed to last page number of previous page list.', function() {
            var currentPage;

            pagination3._onClickHandler('prevMore');

            currentPage = pagination3.getCurrentPage();
            expect(currentPage).toBe(9); // first page of current page list is 10 -> 9
        });

        it('When the "prev" more button is clicked,' +
            'the page is changed to last page number of next page list.', function() {
            var currentPage;

            pagination3._onClickHandler('nextMore');

            currentPage = pagination3.getCurrentPage();
            expect(currentPage).toBe(21); // last page of current page list is 20 -> 21
        });

        it('When the page is clicked and is enabled, the current page is changed.', function() {
            var prevPage = pagination3.getCurrentPage();
            var currentPage;

            pagination3._onClickHandler(null, 3);

            currentPage = pagination3.getCurrentPage();
            expect(currentPage).not.toBe(prevPage);
        });

        it('When the page is clicked and is selected already, the current page is not changed.', function() {
            var prevPage, currentPage;

            pagination3.movePageTo(3);
            prevPage = pagination3.getCurrentPage();

            pagination3._onClickHandler(null, 3);

            currentPage = pagination3.getCurrentPage();
            expect(currentPage).toBe(prevPage);
        });
    });
});
