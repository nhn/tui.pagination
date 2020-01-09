'use strict';

var View = require('@/view.js');

function createElement(tagName, id) {
  var elem = document.createElement(tagName);
  elem.id = id;
  document.body.appendChild(elem);

  return elem;
}

describe('View', function() {
  var pagination1, pagination2;
  var element1, element2;
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
    element1 = createElement('div', 'pagination1');
    element2 = createElement('div', 'pagination2');

    pagination1 = new View('pagination1', {
      firstItemClassName: 'left-child',
      lastItemClassName: 'right-child'
    });

    pagination1.update(viewData);

    pagination2 = new View(element2, {
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

  afterEach(function() {
    document.body.removeChild(element1);
    document.body.removeChild(element2);
  });

  describe('basic opitons - ', function() {
    it(
      'When the value of "element" is string,' +
        'the container DOM element should be created and appended on body.',
      function() {
        var rootElement = pagination1._getContainerElement();
        expect(rootElement).toEqual(element1);
      }
    );

    it('"firstItemClassName" option should add a className on the first button except move, more buttons', function() {
      var firstItem = element1.querySelector('.left-child');
      var prevMoreButton = pagination1._buttons.prevMore;

      expect(firstItem).toEqual(prevMoreButton);
    });

    it('"lastItemClassName" option should add a className on the last button except move, more buttons', function() {
      var lastItem = element1.querySelector('.right-child');
      var nextMoreButton = pagination1._buttons.nextMore;

      expect(lastItem).toBe(nextMoreButton);
    });
  });

  describe('template options - ', function() {
    it('When "page" value set, the component should have customized page buttons', function() {
      expect(element2.querySelector('.page').innerHTML).toBe('10Num');
    });

    it('When "moveButton" value is not set, the component should have each default move buttons', function() {
      expect(element1.querySelectorAll('.tui-first').length).toBe(1);
      expect(element1.querySelectorAll('.tui-prev').length).toBe(1);
      expect(element1.querySelectorAll('.tui-next').length).toBe(1);
      expect(element1.querySelectorAll('.tui-last').length).toBe(1);
    });

    it('When "moveButton" value set, the component should have each customized move buttons', function() {
      expect(element2.querySelectorAll('.custom.first').length).toBe(1);
      expect(element2.querySelectorAll('.custom.prev').length).toBe(1);
      expect(element2.querySelectorAll('.custom.next').length).toBe(1);
      expect(element2.querySelectorAll('.custom.last').length).toBe(1);
    });

    it('When "moreButton" value is not set, the component should have each default more buttons', function() {
      expect(element1.querySelectorAll('.tui-prev-is-ellip').length).toBe(1);
      expect(element1.querySelectorAll('.tui-next-is-ellip').length).toBe(1);
    });

    it('When "moreButton" value set, the component should have each customized more buttons', function() {
      expect(element2.querySelectorAll('.more').length).toBe(2);
    });
  });

  describe('Public method - ', function() {
    it('When "empty" is called, the container element should be _empty', function() {
      var rootElement = pagination1._getContainerElement();

      pagination1._empty();

      expect(rootElement.childNodes.length).toBe(0);
    });

    it('When "update" is called, the page elements should be updated', function() {
      var prevPage = element2.querySelector('.page').innerHTML;
      var currentPage;

      pagination2.update({
        page: 1,
        currentPageIndex: 1,
        lastPage: 1,
        lastPageListIndex: 1,
        leftPageNumber: 1,
        rightPageNumber: 3,
        prevMore: false,
        nextMore: false
      });

      currentPage = element2.querySelector('.page').innerHTML;

      expect(currentPage).not.toBe(prevPage);
    });

    it('When "findPageElement" is called, it should find the target element in the page elements', function() {
      var findElement, foundElement;

      findElement = element2.querySelectorAll('.page')[3];
      foundElement = pagination2._findPageElement(findElement);

      expect(foundElement).toBe(findElement);

      findElement = element2.querySelector('.current');
      foundElement = pagination2._findPageElement(findElement);

      expect(foundElement).toBe(null);
    });
  });
});
