'use strict';

var View = require('../src/js/view.js');

describe('View', function() {
    var pagination1, pagination2;
    var $element1, $element2;
    var viewData = {
        page: 15,
        currentPageIndex: 15,
        lastPage: 50,
        lastPageListIndex: 50,
        leftPageNumber: 10,
        rightPageNumber: 20,
        prevMore: true,
        nextMore: true
    };

    beforeEach(function() {
        $element1 = $('<div id="pagination1"></div>');
        $element2 = $('<div id="pagination2"></div>');

        pagination1 = new View($element1[0], {
            firstItemClassName: 'left-child',
            lastItemClassName: 'right-child'
        });

        pagination1.update(viewData);

        pagination2 = new View($element2, {
            firstItemClassName: 'left-child',
            lastItemClassName: 'right-child',
            template: {
                page: '<a class="page" href="#">{{page}}Num</a>',
                currentPage: '<strong class="current page1">{{page}}</strong>',
                moveButton: '<div class="custom {{type}}"></div>',
                moreButton: function() {
                    return '<div class="more"></div>';
                }
            }
        });

        pagination2.update(viewData);
    });

    describe('basic opitons - ', function() {
        it('When the value of "element" is string,' +
            'the container DOM element is created and append on body.', function() {
            var rootElement = pagination1._getContainerElement();
            expect(rootElement).toEqual($element1[0]);
        });

        it('"firstItemClassName" option add class name on the first button except move, more buttons.', function() {
            var firstItem = $element1.find('.left-child')[0];
            var prevMoreButton = pagination1._buttons.prevMore;

            expect(firstItem).toEqual(prevMoreButton);
        });

        it('"lastItemClassName" option add class name on the last button except move, more buttons.', function() {
            var lastItem = $element1.find('.right-child')[0];
            var nextMoreButton = pagination1._buttons.nextMore;

            expect(lastItem).toBe(nextMoreButton);
        });
    });

    describe('template options - ', function() {
        it('When "page" value set, the component has customaized page buttons.', function() {
            expect($element2.find('.page').eq(0).html()).toBe('10Num');
        });

        it('When "moveButton" value is not set, the component has each default move buttons.', function() {
            expect($element1.find('.tui-first').length).toBe(1);
            expect($element1.find('.tui-prev').length).toBe(1);
            expect($element1.find('.tui-next').length).toBe(1);
            expect($element1.find('.tui-last').length).toBe(1);
        });

        it('When "moveButton" value set, the component has each customaized move buttons.', function() {
            expect($element2.find('.custom.first').length).toBe(1);
            expect($element2.find('.custom.prev').length).toBe(1);
            expect($element2.find('.custom.next').length).toBe(1);
            expect($element2.find('.custom.last').length).toBe(1);
        });

        it('When "moreButton" value is not set, the component has each default more buttons.', function() {
            expect($element1.find('.tui-prev-is-ellip').length).toBe(1);
            expect($element1.find('.tui-next-is-ellip').length).toBe(1);
        });

        it('When "moreButton" value set, the component has each customaized more buttons.', function() {
            expect($element2.find('.more').length).toBe(2);
        });
    });

    describe('Public method - ', function() {
        it('When "empty" is called, the container element is _empty.', function() {
            var rootElement = pagination1._getContainerElement();

            pagination1._empty();

            expect(rootElement.childNodes.length).toBe(0);
        });

        it('When "update" is called, the page elements are updated.', function() {
            var prevPage = Number($element2.find('.page').html());
            var currentPage;

            pagination2.update({
                page: 1,
                currentPageIndex: 1,
                lastPage: 1,
                lastPageListIndex: 1,
                leftPageNumber: 1,
                rightPageNumber: 1,
                prevMore: false,
                nextMore: false
            });

            currentPage = Number($element2.find('.page').html());

            expect(currentPage).not.toBe(prevPage);
        });

        it('When "findPageElement" is called, find the target element in the page elements.', function() {
            var findElement, foundElement;

            findElement = $element2.find('.page').eq(3)[0];
            foundElement = pagination2._findPageElement(findElement);

            expect(foundElement).toBe(findElement);

            findElement = $element2.find('.current')[0];
            foundElement = pagination2._findPageElement(findElement);

            expect(foundElement).toBe(null);
        });
    });
});
