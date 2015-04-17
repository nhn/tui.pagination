/*!Component-Pagination v1.0.0 | NHN Entertainment*/
(function() {
/**
 * @fileoverview 클래스와 비슷한방식으로 생성자를 만들고 상속을 구현할 수 있는 메소드를 제공하는 모듈
 * @author FE개발팀
 * @dependency inheritance.js, object.js
 */

(function(ne) {
    'use strict';
    if (!ne) {
        ne = window.ne = {};
    }
    if (!ne.util) {
        ne.util = window.ne.util = {};
    }

    /**
     * 객체의 생성및 상속을 편하게 도와주는 메소드
     * @param {*} [parent] 상속받을 생성자.
     * @param {Object} props 생성할 생성자의프로토타입에 들어갈 멤버들
     * @param {Function} props.init 인스턴스가 생성될때 실행됨
     * @param {Object} props.static 생성자의 클래스 맴버형태로 들어갈 멤버들
     * @returns {*}
     * @example
     *
     * var Parent = defineClasss({
     *     init: function() {
     *         this.name = 'made by def';
     *     },
     *     method: function() {
     *         //..can do something with this
     *     },
     *     static: {
     *         staticMethod: function() {
     *              //..do something
     *         }
     *     }
     * });
     *
     * var Child = defineClass(Parent, {
     *     method2: function() {}
     * });
     *
     *
     * Parent.staticMethod();
     *
     * var parentInstance = new Parent();
     * console.log(parentInstance.name); //made by def
     * parentInstance.staticMethod(); // Error
     *
     *
     * var childInstance = new Child();
     * childInstance.method();
     * childInstance.method2();
     *
     *
     */
    var defineClass = function(parent, props) {
        var obj;

        if (!props) {
            props = parent;
            parent = null;
        }

        obj = props.init || function(){};

        parent && ne.util.inherit(obj, parent);

        if (props.hasOwnProperty('static')) {
            ne.util.extend(obj, props.static);
            delete props.static;
        }

        ne.util.extend(obj.prototype, props);

        return obj;
    };

    ne.util.defineClass = defineClass;

})(window.ne);
/**
 * @fileoverview 옵저버 패턴을 이용하여 객체 간 커스텀 이벤트를 전달할 수 있는 기능을 제공하는 모듈
 * @author FE개발팀
 * @dependency type.js, collection.js object.js
 */

(function(ne) {
    'use strict';
    /* istanbul ignore if */
    if (!ne) {
        ne = window.ne = {};
    }
    if (!ne.util) {
        ne.util = window.ne.util = {};
    }

    /**
     * 이벤트 핸들러에 저장되는 단위
     * @typedef {object} eventItem
     * @property {object.<string, object>} eventObject
     * @property {function()} eventObject.fn 이벤트 핸들러 함수
     * @property {*} [eventObject.ctx] 이벤트 핸들러 실행 시 컨텍스트 지정가능
     */


    /**
     * 커스텀 이벤트 클래스
     * @constructor
     * @exports CustomEvents
     * @class
     */
    function CustomEvents() {

        /**
         * 이벤트 핸들러를 저장하는 객체
         * @type {object.<string, eventItem>}
         * @private
         */
        this._events = {};
    }

    var CustomEventMethod = /** @lends CustomEvents */ {
        /**
         * 인스턴스가 발생하는 이벤트에 핸들러를 등록하는 메서드
         * @param {(object|String)} types - 이벤트 타입 (타입과 함수 쌍으로 된 객체를 전달할 수도 있고 타입만
         * 전달할 수 있다. 후자의 경우 두 번째 인자에 핸들러를 전달해야 한다.)
         * @param {function()=} fn - 이벤트 핸들러 목록
         * @param {*=} context
         * @example
         * // 첫 번째 인자에 이벤트명:핸들러 데이터 객체를 넘긴 경우
         * instance.on({
         *     zoom: function() {},
         *     pan: function() {}
         * }, this);
         *
         * // 여러 이벤트를 한 핸들러로 처리할 수 있도록 함
         * instance.on('zoom pan', function() {});
         */
        on: function(types, fn, context) {
            this._toggle(true, types, fn, context);
        },

        /**
         * 인스턴스에 등록했던 이벤트 핸들러를 해제할 수 있다.
         * @param {(object|string)=} types 등록 해지를 원하는 이벤트 객체 또는 타입명. 아무 인자도 전달하지 않으면 모든 이벤트를 해제한다.
         * @param {Function=} fn
         * @param {*=} context
         * @example
         * // zoom 이벤트만 해제
         * instance.off('zoom', onZoom);
         *
         * // pan 이벤트 해제 (이벤트 바인딩 시에 context를 넘겼으면 그대로 넘겨주어야 한다)
         * instance.off('pan', onPan, this);
         *
         * // 인스턴스 내 모든 이벤트 해제
         * instance.off();
         */
        off: function(types, fn, context) {
            if (!ne.util.isExisty(types)) {
                this._events = null;
                return;
            }

            this._toggle(false, types, fn, context);
        },

        /**
         * on, off 메서드의 중복 코드를 줄이기 위해 만든 on토글 메서드
         * @param {boolean} isOn
         * @param {(Object|String)} types - 이벤트 타입 (타입과 함수 쌍으로 된 객체를 전달할 수도 있고 타입만
         * 전달할 수 있다. 후자의 경우 두 번째 인자에 핸들러를 전달해야 한다.)
         * @param {function()=} fn - 이벤트 핸들러 목록
         * @param {*=} context
         * @private
         */
        _toggle: function(isOn, types, fn, context) {
            var methodName = isOn ? '_on' : '_off',
                method = this[methodName];

            if (ne.util.isObject(types)) {
                ne.util.forEachOwnProperties(types, function(handler, type) {
                    method.call(this, type, handler, fn);
                }, this);
            } else {
                types = types.split(' ');

                ne.util.forEach(types, function(type) {
                    method.call(this, type, fn, context);
                }, this);
            }
        },

        /**
         * 내부적으로 실제로 이벤트를 등록하는 로직을 담는 메서드.
         *
         * 옵션에 따라 이벤트를 배열에 등록하기도 하고 해시에 등록하기도 한다.
         *
         * 두개를 사용하는 기준:
         *
         * 핸들러가 이미 this바인딩이 되어 있고 핸들러를 사용하는 object가 같은 종류가 동시다발적으로 생성/삭제되는 경우에는 context인자를
         * 전달하여 해시의 빠른 접근 속도를 이용하는 것이 좋다.
         *
         * @param {(object.<string, function()>|string)} type - 이벤트 타입 (타입과 함수 쌍으로 된 객체를 전달할 수도 있고 타입만
         * 전달할 수 있다. 후자의 경우 두 번째 인자에 핸들러를 전달해야 한다.)
         * @param {function()} fn - 이벤트 핸들러
         * @param {*=} context
         * @private
         */
        _on: function(type, fn, context) {
            var events = this._events = this._events || {},
                contextId = context && (context !== this) && ne.util.stamp(context);

            if (contextId) {
                /*
                 context가 현재 인스턴스와 다를 때 context의 아이디로 내부의 해시에서 빠르게 해당 핸들러를 컨트롤 하기 위한 로직.
                 이렇게 하면 동시에 많은 이벤트를 발생시키거나 제거할 때 성능면에서 많은 이점을 제공한다.
                 특히 동시에 많은 엘리먼트들이 추가되거나 해제될 때 도움이 될 수 있다.
                 */
                var indexKey = type + '_idx',
                    indexLenKey = type + '_len',
                    typeIndex = events[indexKey] = events[indexKey] || {},
                    id = ne.util.stamp(fn) + '_' + contextId; // 핸들러의 id + context의 id

                if (!typeIndex[id]) {
                    typeIndex[id] = {
                        fn: fn,
                        ctx: context
                    };

                    // 할당된 이벤트의 갯수를 추적해 두고 할당된 핸들러가 없는지 여부를 빠르게 확인하기 위해 사용한다
                    events[indexLenKey] = (events[indexLenKey] || 0) + 1;
                }
            } else {
                // fn이 이미 this 바인딩이 된 상태에서 올 경우 단순하게 처리해준다
                events[type] = events[type] || [];
                events[type].push({fn: fn});
            }
        },

        /**
         * 실제로 구독을 해제하는 메서드
         * @param {(object|string)=} type 등록 해지를 원하는 핸들러명
         * @param {function} fn
         * @param {*} context
         * @private
         */
        _off: function(type, fn, context) {
            var events = this._events,
                indexKey = type + '_idx',
                indexLenKey = type + '_len';

            if (!events) {
                return;
            }

            var contextId = context && (context !== this) && ne.util.stamp(context),
                listeners,
                id;

            if (contextId) {
                id = ne.util.stamp(fn) + '_' + contextId;
                listeners = events[indexKey];

                if (listeners && listeners[id]) {
                    listeners[id] = null;
                    events[indexLenKey] -= 1;
                }

            } else {
                listeners = events[type];

                if (listeners) {
                    ne.util.forEach(listeners, function(listener, index) {
                        if (ne.util.isExisty(listener) && (listener.fn === fn)) {
                            listeners.splice(index, 1);
                            return true;
                        }
                    });
                }
            }
        },

        /**
         * 이벤트를 발생시키는 메서드
         *
         * 등록한 리스너들의 실행 결과를 boolean AND 연산하여
         *
         * 반환한다는 점에서 {@link CustomEvents#fire} 와 차이가 있다
         *
         * 보통 컴포넌트 레벨에서 before 이벤트로 사용자에게
         *
         * 이벤트를 취소할 수 있게 해 주는 기능에서 사용한다.
         * @param {string} type
         * @param {*...} data
         * @returns {*}
         * @example
         * // 확대 기능을 지원하는 컴포넌트 내부 코드라 가정
         * if (this.invoke('beforeZoom')) {    // 사용자가 등록한 리스너 결과 체크
         *     // 리스너의 실행결과가 true 일 경우
         *     // doSomething
         * }
         *
         * //
         * // 아래는 사용자의 서비스 코드
         * map.on({
         *     'beforeZoom': function() {
         *         if (that.disabled && this.getState()) {    //서비스 페이지에서 어떤 조건에 의해 이벤트를 취소해야한다
         *             return false;
         *         }
         *         return true;
         *     }
         * });
         */
        invoke: function(type, data) {
            if (!this.hasListener(type)) {
                return true;
            }

            var args = Array.prototype.slice.call(arguments, 1),
                events = this._events;

            if (!events) {
                return true;
            }

            var typeIndex = events[type + '_idx'],
                listeners,
                result = true;

            if (events[type]) {
                listeners = events[type].slice();

                ne.util.forEach(listeners, function(listener) {
                    if (listener.fn.apply(this, args) === false) {
                        result = false;
                    }
                }, this);
            }

            ne.util.forEachOwnProperties(typeIndex, function(eventItem) {
                if (eventItem.fn.apply(eventItem.ctx, args) === false) {
                    result = false;
                }
            });

            return result;
        },

        /**
         * 이벤트를 발생시키는 메서드
         * @param {string} type 이벤트 타입명
         * @param {(object|string)=} data 발생과 함께 전달할 이벤트 데이터
         * @return {*}
         * @example
         * instance.fire('move', { direction: 'left' });
         *
         * // 이벤트 핸들러 처리
         * instance.on('move', function(moveEvent) {
         *     var direction = moveEvent.direction;
         * });
         */
        fire: function(type, data) {
            this.invoke.apply(this, arguments);
            return this;
        },

        /**
         * 이벤트 핸들러 존재 여부 확인
         * @param {string} type 핸들러명
         * @return {boolean}
         */
        hasListener: function(type) {
            var events = this._events,
                existyFunc = ne.util.isExisty;

            return existyFunc(events) && (existyFunc(events[type]) || events[type + '_len']);
        },

        /**
         * 등록된 이벤트 핸들러의 갯수 반환
         * @param {string} type
         * @returns {number}
         */
        getListenerLength: function(type) {
            var events = this._events,
                lenKey = type + '_len',
                length = 0,
                types,
                len;

            if (!ne.util.isExisty(events)) {
                return 0;
            }

            types = events[type];
            len = events[lenKey];

            length += (ne.util.isExisty(types) && ne.util.isArray(types)) ? types.length : 0;
            length += ne.util.isExisty(len) ? len : 0;

            return length;
        },

        /**
         * 단발성 커스텀 이벤트 핸들러 등록 시 사용
         * @param {(object|string)} types 이벤트명:핸들러 객체 또는 이벤트명
         * @param {function()=} fn 핸들러 함수
         * @param {*=} context
         */
        once: function(types, fn, context) {
            var that = this;

            if (ne.util.isObject(types)) {
                ne.util.forEachOwnProperties(types, function(handler, type) {
                    this.once(type, handler, fn);
                }, this);

                return;
            }

            function onceHandler() {
                fn.apply(context, arguments);
                that.off(types, onceHandler, context);
            }

            this.on(types, onceHandler, context);
        }

    };

    CustomEvents.prototype = CustomEventMethod;
    CustomEvents.prototype.constructor = CustomEvents;

    /**
     * 커스텀 이벤트 기능을 믹스인할 때 사용하는 메서드
     * @param {function()} func 생성자 함수
     * @example
     * // 모델 클래스 변경 시 컨트롤러에게 알림을 주고 싶은데
     * // 그 기능을 모델 클래스 자체에게 주고 싶다
     * function Model() {}
     *
     * // 커스텀 이벤트 믹스인
     * ne.util.CustomEvents.mixin(Model);
     *
     * var model = new Model();
     *
     * model.on('changed', function() {}, this);
     */
    CustomEvents.mixin = function(func) {
        ne.util.extend(func.prototype, CustomEventMethod);
    };

    ne.util.CustomEvents = CustomEvents;

})(window.ne);

/**
 * @fileoverview
 * @author FE개발팀
 */

(function(ne) {
    'use strict';
    /* istanbul ignore if */
    if (!ne) {
        ne = window.ne = {};
    }
    if (!ne.util) {
        ne.util = window.ne.util = {};
    }

    /**
     * 데이터 객체를 확장하는 메서드 (deep copy 는 하지 않는다)
     * @param {object} target - 확장될 객체
     * @param {...object} objects - 프로퍼티를 복사할 객체들
     * @return {object}
     */
    function extend(target, objects) {
        var source,
            prop,
            hasOwnProp = Object.prototype.hasOwnProperty,
            i,
            len;

        for (i = 1, len = arguments.length; i < len; i++) {
            source = arguments[i];
            for (prop in source) {
                if (hasOwnProp.call(source, prop)) {
                    target[prop] = source[prop];
                }
            }
        }
        return target;
    }

    /**
     * @type {number}
     */
    var lastId = 0;

    /**
     * 객체에 unique한 ID를 프로퍼티로 할당한다.
     * @param {object} obj - ID를 할당할 객체
     * @return {number}
     */
    function stamp(obj) {
        obj.__fe_id = obj.__fe_id || ++lastId;
        return obj.__fe_id;
    }

    function resetLastId() {
        lastId = 0;
    }

    /**
     * 객체를 전달받아 객체의 키목록을 배열로만들어 리턴해준다.
     * @param obj
     * @returns {Array}
     */
    var keys = function(obj) {
        var keys = [],
            key;

        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                keys.push(key);
            }
        }

        return keys;
    };

    ne.util.extend = extend;
    ne.util.stamp = stamp;
    ne.util._resetLastId = resetLastId;
    ne.util.keys = Object.keys || keys;

})(window.ne);
/**
 * @fileoverview 간단한 상속 시뮬레이션
 * @author FE개발팀
 */

(function(ne) {
    'use strict';
    /* istanbul ignore if */
    if (!ne) {
        ne = window.ne = {};
    }
    if (!ne.util) {
        ne.util = window.ne.util = {};
    }

    /**
     * 전달된 객체를 prototype으로 사용하는 객체를 만들어 반환하는 메서드
     * @param {Object} obj
     * @return {Object}
     */
    function createObject() {
        function F() {}

        return function(obj) {
            F.prototype = obj;
            return new F;
        };
    }

    /**
     * 단순 prototype 확장을 응용한 상속 메서드
     *
     * **주의점**
     *
     * 단순 프로토타입 확장 기능만 제공하므로 자식 생성자의 prototype을 덮어쓰면 안된다.
     *
     * @example
     * function Animal(leg) {
     *     this.leg = leg;
     * }
     *
     * Animal.prototype.growl = function() {
     *     // ...
     * };
     *
     * function Person(name) {
     *     this.name = name;
     * }
     *
     * // 상속
     * core.inherit(Person, Animal);
     *
     * // 이 이후부터는 프로퍼티 편집만으로 확장해야 한다.
     * Person.prototype.walk = function(direction) {
     *     // ...
     * };
     * @param {function} subType 자식 생성자 함수
     * @param {function} superType 부모 생성자 함수
     */
    function inherit(subType, superType) {
        var prototype = ne.util.createObject(superType.prototype);
        prototype.constructor = subType;
        subType.prototype = prototype;
    }

    ne.util.createObject = createObject();
    ne.util.inherit = inherit;

})(window.ne);
/**
 * @fileoverview 타입체크 모듈
 * @author FE개발팀
 */

(function(ne) {
    'use strict';
    /* istanbul ignore if */
    if (!ne) {
        ne = window.ne = {};
    }
    if (!ne.util) {
        ne.util = window.ne.util = {};
    }

    /**
     * 값이 정의되어 있는지 확인(null과 undefined가 아니면 true를 반환한다)
     * @param {*} obj
     * @param {(String|Array)} [key]
     * @returns {boolean}
     * @example
     *
     * var obj = {a: {b: {c: 1}}};
     * a 가 존재하는지 확인한다(존재함, true반환)
     * ne.util.isExisty(a);
     * => true;
     * a 에 속성 b 가 존재하는지 확인한다.(존재함, true반환)
     * ne.util.isExisty(a, 'b');
     * => true;
     * a 의 속성 b에 c가 존재하는지 확인한다.(존재함, true반환)
     * ne.util.isExisty(a, 'b.c');
     * => true;
     * a 의 속성 b에 d가 존재하는지 확인한다.(존재하지 않음, false반환)
     * ne.util.isExisty(a, 'b.d');
     * => false;
     */
    function isExisty(obj, key) {
        if (arguments.length < 2) {
            return !isNull(obj) && !isUndefined(obj);
        }
        if (!isObject(obj)) {
            return false;
        }

        key = isString(key) ? key.split('.') : key;

        if (!isArray(key)) {
            return false;
        }
        key.unshift(obj);

        var res = ne.util.reduce(key, function(acc, a) {
            if (!acc) {
                return;
            }
            return acc[a];
        });
        return !isNull(res) && !isUndefined(res);
    }

    /**
     * 인자가 undefiend 인지 체크하는 메서드
     * @param obj
     * @returns {boolean}
     */
    function isUndefined(obj) {
        return obj === undefined;
    }

    /**
     * 인자가 null 인지 체크하는 메서드
     * @param {*} obj
     * @returns {boolean}
     */
    function isNull(obj) {
        return obj === null;
    }

    /**
     * 인자가 null, undefined, false가 아닌지 확인하는 메서드
     * (0도 true로 간주한다)
     *
     * @param {*} obj
     * @return {boolean}
     */
    function isTruthy(obj) {
        return isExisty(obj) && obj !== false;
    }

    /**
     * 인자가 null, undefined, false인지 확인하는 메서드
     * (truthy의 반대값)
     * @param {*} obj
     * @return {boolean}
     */
    function isFalsy(obj) {
        return !isTruthy(obj);
    }


    var toString = Object.prototype.toString;

    /**
     * 인자가 arguments 객체인지 확인
     * @param {*} obj
     * @return {boolean}
     */
    function isArguments(obj) {
        var result = isExisty(obj) &&
            ((toString.call(obj) === '[object Arguments]') || 'callee' in obj);

        return result;
    }

    /**
     * 인자가 배열인지 확인
     * @param {*} obj
     * @return {boolean}
     */
    function isArray(obj) {
        return toString.call(obj) === '[object Array]';
    }

    /**
     * 인자가 객체인지 확인하는 메서드
     * @param {*} obj
     * @return {boolean}
     */
    function isObject(obj) {
        return obj === Object(obj);
    }

    /**
     * 인자가 함수인지 확인하는 메서드
     * @param {*} obj
     * @return {boolean}
     */
    function isFunction(obj) {
        return toString.call(obj) === '[object Function]';
    }

    /**
     * 인자가 숫자인지 확인하는 메서드
     * @param {*} obj
     * @return {boolean}
     */
    function isNumber(obj) {
        return toString.call(obj) === '[object Number]';
    }

    /**
     * 인자가 문자열인지 확인하는 메서드
     * @param obj
     * @return {boolean}
     */
    function isString(obj) {
        return toString.call(obj) === '[object String]';
    }

    /**
     * 인자가 불리언 타입인지 확인하는 메서드
     * @param {*} obj
     * @return {boolean}
     */
    function isBoolean(obj) {
        return toString.call(obj) === '[object Boolean]';
    }

    /**
     * 인자가 HTML Node 인지 검사한다. (Text Node 도 포함)
     * @param {HTMLElement} html
     * @return {Boolean} HTMLElement 인지 여부
     */
    function isHTMLNode(html) {
        if (typeof(HTMLElement) === 'object') {
            return (html && (html instanceof HTMLElement || !!html.nodeType));
        }
        return !!(html && html.nodeType);
    }
    /**
     * 인자가 HTML Tag 인지 검사한다. (Text Node 제외)
     * @param {HTMLElement} html
     * @return {Boolean} HTMLElement 인지 여부
     */
    function isHTMLTag(html) {
        if (typeof(HTMLElement) === 'object') {
            return (html && (html instanceof HTMLElement));
        }
        return !!(html && html.nodeType && html.nodeType === 1);
    }
    /**
     * null, undefined 여부와 순회 가능한 객체의 순회가능 갯수가 0인지 체크한다.
     * @param {*} obj 평가할 대상
     * @return {boolean}
     */
    function isEmpty(obj) {
        var key,
            hasKey = false;

        if (!isExisty(obj)) {
            return true;
        }

        if (isArray(obj) || isArguments(obj)) {
            return obj.length === 0;
        }

        if (isObject(obj) && !isFunction(obj)) {
            ne.util.forEachOwnProperties(obj, function() {
                hasKey = true;
                return false;
            });

            return !hasKey;
        }

        return true;

    }

    /**
     * isEmpty 메서드와 반대로 동작한다.
     * @param {*} obj 평가할 대상
     * @return {boolean}
     */
    function isNotEmpty(obj) {
        return !isEmpty(obj);
    }


    ne.util.isExisty = isExisty;
    ne.util.isUndefined = isUndefined;
    ne.util.isNull = isNull;
    ne.util.isTruthy = isTruthy;
    ne.util.isFalsy = isFalsy;
    ne.util.isArguments = isArguments;
    ne.util.isArray = Array.isArray || isArray;
    ne.util.isObject = isObject;
    ne.util.isFunction = isFunction;
    ne.util.isNumber = isNumber;
    ne.util.isString = isString;
    ne.util.isBoolean = isBoolean;
    ne.util.isHTMLNode = isHTMLNode;
    ne.util.isHTMLTag = isHTMLTag;
    ne.util.isEmpty = isEmpty;
    ne.util.isNotEmpty = isNotEmpty;

})(window.ne);
/**
 * @fileoverview 객체나 배열을 다루기위한 펑션들이 정의 되어있는 모듈
 * @author FE개발팀
 * @dependency type.js, object.js
 */

(function(ne) {
    'use strict';
    if (!ne) {
        ne = window.ne = {};
    }
    if (!ne.util) {
        ne.util = window.ne.util = {};
    }

    /**
     * 배열나 유사배열를 순회하며 콜백함수에 전달한다.
     * 콜백함수가 false를 리턴하면 순회를 종료한다.
     * @param {Array} arr
     * @param {Function} iteratee  값이 전달될 콜백함수
     * @param {*} [context] 콜백함수의 컨텍스트
     * @example
     *
     * var sum = 0;
     *
     * forEachArray([1,2,3], function(value){
     *     sum += value;
     * });
     *
     * => sum == 6
     */
    function forEachArray(arr, iteratee, context) {
        var index = 0,
            len = arr.length;

        for (; index < len; index++) {
            if (iteratee.call(context || null, arr[index], index, arr) === false) {
                break;
            }
        }
    }


    /**
     * obj에 상속된 프로퍼티를 제외한 obj의 고유의 프로퍼티만 순회하며 콜백함수에 전달한다.
     * 콜백함수가 false를 리턴하면 순회를 중료한다.
     * @param {object} obj
     * @param {Function} iteratee  프로퍼티가 전달될 콜백함수
     * @param {*} [context] 콜백함수의 컨텍스트
     * @example
     * var sum = 0;
     *
     * forEachOwnProperties({a:1,b:2,c:3}, function(value){
     *     sum += value;
     * });
     *
     * => sum == 6
     **/
    function forEachOwnProperties(obj, iteratee, context) {
        var key;

        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (iteratee.call(context || null, obj[key], key, obj) === false) {
                    break;
                }
            }
        }
    }

    /**
     * 파라메터로 전달된 객체나 배열를 순회하며 데이터를 콜백함수에 전달한다.
     * 유사배열의 경우 배열로 전환후 사용해야함.(ex2 참고)
     * 콜백함수가 false를 리턴하면 순회를 종료한다.
     * @param {*} obj 순회할 객체
     * @param {Function} iteratee 데이터가 전달될 콜백함수
     * @param {*} [context] 콜백함수의 컨텍스트
     * @example
     *
     * //ex1)
     * var sum = 0;
     *
     * forEach([1,2,3], function(value){
     *     sum += value;
     * });
     *
     * => sum == 6
     *
     * //ex2) 유사 배열사용
     * function sum(){
     *     var factors = Array.prototype.slice.call(arguments); //arguments를 배열로 변환, arguments와 같은정보를 가진 새 배열 리턴
     *
     *     forEach(factors, function(value){
     *          ......
     *     });
     * }
     *
     **/
    function forEach(obj, iteratee, context) {
        var key,
            len;

        if (ne.util.isArray(obj)) {
            for (key = 0, len = obj.length; key < len; key++) {
                iteratee.call(context || null, obj[key], key, obj);
            }
        } else {
            ne.util.forEachOwnProperties(obj, iteratee, context);
        }
    }

    /**
     * 파라메터로 전달된 객체나 배열를 순회하며 콜백을 실행한 리턴값을 배열로 만들어 리턴한다.
     * 유사배열의 경우 배열로 전환후 사용해야함.(forEach example참고)
     * @param {*} obj 순회할 객체
     * @param {Function} iteratee 데이터가 전달될 콜백함수
     * @param {*} [context] 콜백함수의 컨텍스트
     * @returns {Array}
     * @example
     * map([0,1,2,3], function(value) {
     *     return value + 1;
     * });
     *
     * => [1,2,3,4];
     */
    function map(obj, iteratee, context) {
        var resultArray = [];

        ne.util.forEach(obj, function() {
            resultArray.push(iteratee.apply(context || null, arguments));
        });

        return resultArray;
    }

    /**
     * 파라메터로 전달된 객체나 배열를 순회하며 콜백을 실행한 리턴값을 다음 콜백의 첫번째 인자로 넘겨준다.
     * 유사배열의 경우 배열로 전환후 사용해야함.(forEach example참고)
     * @param {*} obj 순회할 객체
     * @param {Function} iteratee 데이터가 전달될 콜백함수
     * @param {*} [context] 콜백함수의 컨텍스트
     * @returns {*}
     * @example
     * reduce([0,1,2,3], function(stored, value) {
     *     return stored + value;
     * });
     *
     * => 6;
     */
    function reduce(obj, iteratee, context) {
        var keys,
            index = 0,
            length,
            store;


        if (!ne.util.isArray(obj)) {
            keys = ne.util.keys(obj);
        }

        length = keys ? keys.length : obj.length;

        store = obj[keys ? keys[index++] : index++];

        for (; index < length; index++) {
            store = iteratee.call(context || null, store, obj[keys ? keys[index] : index]);
        }

        return store;
    }
    /**
     * 유사배열을 배열 형태로 변환한다.
     * - IE 8 이하 버전에서 Array.prototype.slice.call 이 오류가 나는 경우가 있어 try-catch 로 예외 처리를 한다.
     * @param {*} arrayLike 유사배열
     * @return {Array}
     * @example


     var arrayLike = {
        0: 'one',
        1: 'two',
        2: 'three',
        3: 'four',
        length: 4
    };
     var result = toArray(arrayLike);

     => ['one', 'two', 'three', 'four'];
     */
    function toArray(arrayLike) {
        var arr;
        try {
            arr = Array.prototype.slice.call(arrayLike);
        } catch (e) {
            arr = [];
            forEachArray(arrayLike, function(value) {
                arr.push(value);
            });
        }
        return arr;
    }

    ne.util.forEachOwnProperties = forEachOwnProperties;
    ne.util.forEachArray = forEachArray;
    ne.util.forEach = forEach;
    ne.util.toArray = toArray;
    ne.util.map = map;
    ne.util.reduce = reduce;

})(window.ne);
/**
 * @fileoverview 함수관련 메서드 모음
 * @author FE개발팀
 */

(function(ne) {
    'use strict';
    /* istanbul ignore if */
    if (!ne) {
        ne = window.ne = {};
    }
    if (!ne.util) {
        ne.util = window.ne.util = {};
    }

    /**
     * 커링 메서드
     * @param {function()} fn
     * @param {*} obj - this로 사용될 객체
     * @return {function()}
     */
    function bind(fn, obj) {
        var slice = Array.prototype.slice;

        if (fn.bind) {
            return fn.bind.apply(fn, slice.call(arguments, 1));
        }

        /* istanbul ignore next */
        var args = slice.call(arguments, 2);

        /* istanbul ignore next */
        return function() {
            /* istanbul ignore next */
            return fn.apply(obj, args.length ? args.concat(slice.call(arguments)) : arguments);
        };
    }

    ne.util.bind = bind;

})(window.ne);

/**
 * @fileoverview 페이지네이션의 뷰를 생성하고, 이벤트를 건다.
 * (pug.Pagination 에서 분리)
 * @author 이제인(jein.yi@nhnent.com)
 * @dependency jquery-1.11.1.min.js, common.js
 */


/* istanbul ignore next */
if (!ne.component) {
    ne.component = {};
}

/**
 *
 * @constructor ne.component.Pagination
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
 * 		@param {jQueryObject} [options.$pre_endOn] 페이지 목록에서 페이지의 맨 처음으로 이동하는 버튼으로 사용되는 엘리먼트이다. 처음으로 이동할 수 있는 경우만 노출되며 값을 지정하지 않거나 pre_end 클래스 명을 가진 a 엘리먼트가 존재하지 않으면 버튼이 생성되지 않는다.<br/>기본 값 : 페이지 목록 엘리먼트 아래의 pre_end 클래스 명을 가지고 있는 a 엘리먼트
 * 		@param {jQueryObject} [options.$preOn] 페이지 목록에서 이전 페이지 또는 이전 페이지목록으로 이동하는 버튼으로 사용되는 엘리먼트이다. 이전으로 이동할 수 있는 경우만 노출되며 값을 지정하지 않거나 pre 클래스 명을 가진 a 엘리먼트가 존재하지 않으면 버튼이 생성되지 않는다.<br/>기본 값 : 페이지 목록 엘리먼트 아래의 pre 클래스 명을 가지고 있는 a 엘리먼트
 * 		@param {jQueryObject} [options.$nextOn] 페이지 목록에서 다음 페이지 또는 다음 페이지목록으로 이동하는 버튼으로 사용되는 엘리먼트이다. 다음으로 이동할 수 있는 경우만 노출되며 값을 지정하지 않거나 next 클래스 명을 가진 a 엘리먼트가 존재하지 않으면 버튼이 생성되지 않는다.<br/>기본 값 : 페이지 목록 엘리먼트 아래의 next 클래스 명을 가지고 있는 a 엘리먼트
 * 		@param {jQueryObject} [options.$lastOn] 페이지 목록에서 페이지의 맨 마지막으로 이동하는 버튼으로 사용되는 엘리먼트이다. 마지막으로 이동할 수 있는 경우만 노출되며 값을 지정하지 않거나 next_end 클래스 명을 가진 a 엘리먼트가 존재하지 않으면 버튼이 생성되지 않는다.<br/>기본 값 : 페이지 목록 엘리먼트 아래의 next_end 클래스 명을 가지고 있는 a 엘리먼트
 * 		@param {jQueryObject} [options.$pre_endOff] elFirstPageLinkOn과는 반대로 처음으로 이동할 수 없는 경우에 사용자에게 비활성화된 상태를 보여주기 위한 엘리먼트이다. 값을 지정하지 않거나 pre_end 클래스 명을 가진 span 엘리먼트가 존재하지 않으면 버튼이 생성되지 않는다.<br/>기본 값 : 페이지 목록 엘리먼트 아래의 pre_end 클래스 명을 가지고 있는 span 엘리먼트
 * 		@param {jQueryObject} [options.$preOff] elPrevPageLinkOn과는 반대로 이전으로 이동할 수 없는 경우에 사용자에게 비활성화된 상태를 보여주기 위한 엘리먼트이다. 값을 지정하지 않거나 pre 클래스 명을 가진 span 엘리먼트가 존재하지 않으면 버튼이 생성되지 않는다.<br/>기본 값 : 페이지 목록 엘리먼트 아래의 pre 클래스 명을 가지고 있는 span 엘리먼트
 * 		@param {jQueryObject} [options.$nextOff] elNextPageLinkOn과는 반대로 다음으로 이동할 수 없는 경우에 사용자에게 비활성화된 상태를 보여주기 위한 엘리먼트이다. 값을 지정하지 않거나 next 클래스 명을 가진 span 엘리먼트가 존재하지 않으면 버튼이 생성되지 않는다.<br/>기본 값 : 페이지 목록 엘리먼트 아래의 next 클래스 명을 가지고 있는 span 엘리먼트
 * 		@param {jQueryObject} [options.$lastOff] zelLastPageLinkOn과는 반대로 마지막으로 이동할 수 없는 경우에 사용자에게 비활성화된 상태를 보여주기 위한 엘리먼트이다. 값을 지정하지 않거나 next_end 클래스 명을 가진 span 엘리먼트가 존재하지 않으면 버튼이 생성되지 않는다.<br/>기본 값 : 페이지 목록 엘리먼트 아래의 next_end 클래스 명을 가지고 있는 span 엘리먼트
 * @param {jQueryObject} $element 페이지목록을 생성할 jQuery객체가 랩핑된 엘리먼트
 *
 */
ne.component.Pagination = ne.util.defineClass(/**@lends ne.component.Pagination.prototype */{
    init: function(options, $element) {
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
        this._options = ne.util.extend(defaultOption, options);
        /**
         * 이벤트 핸들러 저장객체
         *
         * @type {Object}
         * @private
         */
        this._events = {};

        // 뷰 생성
        /**
         * 뷰객체
         * @type {PaginationView}
         * @private
         */
        this._view = new ne.component.Pagination.PaginationView(this._options, $element);
        this._view.attachEvent('click', ne.util.bind(this._onClickPageList, this));
        // 페이지 초기화(이동)
        this.movePageTo(this.getOption('page'), false);
    },
    /**
     * 페이징을 다시 그린다
     *
     * @param {*} itemCount 다시 그릴 페이지의 아이템 갯수
     */
    reset: function(itemCount) {

        var isExist = ne.util.isExisty((itemCount !== null) && (itemCount !== undefined));

        if (!isExist) {
            itemCount = this.getOption('itemCount');
        }

        this.setOption('itemCount', itemCount);
        this.movePageTo(1, false);
    },
    /**
     * 옵션값을 가져온다
     *
     * @param {String} optionKey 가져올 옵션 키 값
     * @private
     * @returns {*}
     *
     */
    getOption: function(optionKey) {

        return this._options[optionKey];

    },
    /**
     * 지정한 페이지로 이동하고, 페이지 목록을 다시 그린다
     * 이동하기 전엔 beforeMove라는 커스텀 이벤트를 발생시키고, 이동후에는 afterMove라는 커스텀 이벤터를 발생시킨다.
     *
     * @param {Number} targetPage 이동할 페이지
     * @param {Boolean} isNotRunCustomEvent [isNotRunCustomEvent=true] 커스텀 이벤트의 발생 여부
     */
    movePageTo: function(targetPage, isNotRunCustomEvent) {

        targetPage = this._convertToAvailPage(targetPage);

        this._currentPage = targetPage;

        if (!isNotRunCustomEvent) {
            /**
             * 페이지 이동이 수행되기 직전에 발생
             *
             * @param {componentEvent} eventData
             * @param {String} eventData.eventType 커스텀 이벤트명
             * @param {Number} eventData.page 이동하게 될 페이지
             * @param {Function} eventData.stop 페이지 이동을 정지한다
             * @example
             * paganation.on("beforeMove", function(eventData) {
                // 사용자  클릭의 결과로 이동한 페이지
                var currentPage = eventData.page;
             });
             */

            if (!this.invoke('beforeMove', { page: targetPage })) {
                return;
            }
        }

        this._paginate(targetPage);

        if (isNotRunCustomEvent) {
            /**
             * 페이지 이동이 완료된 시점에서 발생
             *
             * @param {componentEvent} eventData
             * @param {String} eventData.eventType 커스텀 이벤트명
             * @param {Number} eventData.page 사용자 클릭의 결과로 이동한 페이지
             * @example
             * paganation.on("beforeMove", function(eventData) {
            // 사용자  클릭의 결과로 이동한 페이지
            var currentPage = eventData.page;
         });
             */
            this.fire('afterMove', { page: targetPage });
        }
    },
    /**
     * 옵션값을 변경한다
     *
     * @param {String} optionKey 변경할 옵션 키 값
     * @param {*} optionValue 변경할 옵션 값
     * @private
     */
    setOption: function(optionKey, optionValue) {

        this._options[optionKey] = optionValue;

    },
    /**
     * 현재 페이지를 가져온다
     *
     * @returns {Number} 현재 페이지
     */
    getCurrentPage: function() {

        return this._currentPage || this._options['page'];

    },
    /**
     * 해당 페이지의 첫번째 아이템이 전체중 몇번째 인지 구한다
     *
     * @param {Number} pageNumber 해당 페이지 번호
     * @returns {number}
     */
    getIndexOfFirstItem: function(pageNumber) {

        return this.getOption('itemPerPage') * (pageNumber - 1) + 1;

    },
    /**
     * 마지막 페이지 숫자를 구함
     *
     * @returns {number} 마지막 페이지 숫자
     * @private
     */
    _getLastPage: function() {
        return Math.ceil(this.getOption('itemCount') / this.getOption('itemPerPage'));

    },
    /**
     * 몇번째 페이지 리스트인지 구함
     *
     * @param {Number} pageNumber
     * @return {Number} 페이지 리스트 순번
     * @private
     */
    _getPageIndex: function(pageNumber) {
        //현재 페이지 리스트가 중앙에 와야할때
        if (this.getOption('isCenterAlign')) {
            var left = Math.floor(this.getOption('pagePerPageList') / 2),
                pageIndex = pageNumber - left;

            pageIndex = Math.max(pageIndex, 1);
            pageIndex = Math.min(pageIndex, this._getLastPage());
            return pageIndex;
        }
        return Math.ceil(pageNumber / this.getOption("pagePerPageList"));
    },
    /**
     * 이전, 다음 버튼을 클릭할 때 제공받을 페이지 숫자를 구한다
     *
     * @param {String} relativeName 어떤 영역으로 옮겨갈지 정한다(pre_end, next_end, pre, next)
     * @return {Number} 해당되는 페이지 숫자
     * @private
     *
     */
    _getRelativePage: function(relativeName) {
        var page = null,
            isMovePage = this.getOption('moveUnit') === 'page',
            currentPageIndex = this._getPageIndex(this.getCurrentPage());
        if (relativeName === 'pre') {
            page = isMovePage ? this.getCurrentPage() - 1 : (currentPageIndex - 1) * this.getOption('pagePerPageList');
        } else {
            page = isMovePage ? this.getCurrentPage() + 1 : (currentPageIndex) * this.getOption('pagePerPageList') + 1;
        }
        return page;
    },
    /**
     * 페이지 숫자를 받으면 현재 페이지 범위내로 변경하여 반환한다.
     * 예를들어 총 페이지수가 23인데 30이라는 수를 넣으면 23을 반환받는다. 숫자가 1보다 작으면 1을 반환받는다.
     *
     * @param {Number} page
     * @returns {number} 페이지 범위내로 확인된 숫자
     * @private
     */
    _convertToAvailPage: function(page) {
        var lastPageNumber = this._getLastPage();
        page = Math.max(page, 1);
        page = Math.min(page, lastPageNumber);
        return page;
    },
    /**
     * 페이지를 그리는데 필요한 뷰셋을 만들고, 뷰에 업데이트를 요청한다
     *
     * @param {Number} page
     * @private
     */
    _paginate: function(page){

        // 뷰의 버튼 및 페이지를 모두 제거 및 복사
        this._view.empty();

        var viewSet = {};

        viewSet.lastPage = this._getLastPage();
        viewSet.currentPageIndex = this._getPageIndex(page);
        viewSet.lastPageListIndex = this._getPageIndex(viewSet.lastPage);
        viewSet.page = page;

        this._view.update(viewSet, page);
    },
    /**
     * 페이지네이션 이벤트 핸들
     *
     * @param {JQueryEvent} event
     * @private
     */
    _onClickPageList: function(event) {

        event.preventDefault();

        var page = null,
            targetElement = $(event.target),
            targetPage;

        if (this._view.isIn(targetElement, this.getOption('$pre_endOn'))) {
            page = 1;
        } else if (this._view.isIn(targetElement, this.getOption('$lastOn'))) {
            page = this._getLastPage();
        } else if (this._view.isIn(targetElement, this.getOption('$preOn'))) {
            page = this._getRelativePage('pre');
        } else if (this._view.isIn(targetElement, this.getOption('$nextOn'))) {
            page = this._getRelativePage('next');
        } else {

            targetPage = this._view.getPageElement(targetElement);

            if (targetPage && targetPage.length) {
                page = parseInt(targetPage.text(), 10);
            } else {
                return;
            }
        }

        /**
         페이지 이동을 위한 숫자나 버튼을 클릭했을때 발생

         @param {componentEvent} eventData
         @param {String} eventData.eventType 커스텀 이벤트명
         @param {Number} eventData.page 클릭해서 이동할 페이지
         @param {Function} eventData.stop 페이지 이동을 정지한다

         **/

        var isFired = this.invoke("click", {"page" : page});
        if (!isFired) {
            return;
        }

        this.movePageTo(page);
    }
});
// 커스텀 이벤트 믹스인
ne.util.CustomEvents.mixin(ne.component.Pagination);
/**
 * @fileoverview 페이지네이션, 화면에 그려지는 요소들을 관리한다
 * (pug.Pagination 에서 분리)
 * @author 이제인(jein.yi@nhnent.com)
 */
/**
 * @constructor ne.component.Pagination.PaginationView
 * @param {Object} options 옵션 객체
 * @param {Object} $element 루트 엘리먼트
 *
 */
ne.component.Pagination.PaginationView = ne.util.defineClass(/** @lends ne.component.Pagination.PaginationView.prototype */{
    init: function(options, $element) {
        /**
         * 페이지네이션의 루트 엘리먼트
         *
         * @type {jQueryObject}
         * @private
         */
        this._element = $element;
        /**
         * 페이지네이션 지정 옵션
         *
         * @type {Object}
         * @private
         */
        this._options = options;
        /**
         * 컴포넌트에 저장되는 셀렉터
         *
         * @type {Object}
         * @private
         */
        this._elementSelector = {};
        /**
         * 선택된 엘리먼트들을 캐싱해두는 객체
         *
         * @type {Object}
         * @private
         */
        this._cachedElement = {};
        /**
         * 페이지 아이템 리스트
         *
         * @type {Array}
         * @private
         */
        this._pageItemList = [];

        ne.util.extend(options, {
            $pre_endOn: options['$pre_endOn'] || $('a.' + this._wrapPrefix('pre_end'), this._element),
            $preOn: options['$preOn'] || $('a.' + this._wrapPrefix('pre'), this._element),
            $nextOn: options['$nextOn'] || $('a.' + this._wrapPrefix('next'), this._element),
            $lastOn: options['$lastOn'] || $('a.' + this._wrapPrefix('next_end'), this._element),
            $pre_endOff: options['$pre_endOff'] || $('span.' + this._wrapPrefix('pre_end'), this._element),
            $preOff: options['$preOff'] || $('span.' + this._wrapPrefix('pre'), this._element),
            $nextOff: options['$nextOff'] || $('span.' + this._wrapPrefix('next'), this._element),
            $lastOff: options['$lastOff'] || $('span.' + this._wrapPrefix('next_end'), this._element)
        });
        this._element.addClass(this._wrapPrefix('loaded'));
    },
    /**
     * 뷰를 업데이트 한다
     *
     * @param {Object} viewSet 뷰갱신에 대한 값들
     */
    update: function(viewSet) {
        this._addTextNode();
        this._setPageResult(viewSet.lastPage);

        var options = this._options,
            edges = this._getEdge(viewSet),
            leftPageNumber = edges.left,
            rightPageNumber = edges.right;

        viewSet.leftPageNumber = leftPageNumber;
        viewSet.rightPageNumber = rightPageNumber;

        if (options.moveUnit === 'page') {
            viewSet.currentPageIndex = viewSet.page;
            viewSet.lastPageListIndex = viewSet.lastPage;
        }

        this._setFirst(viewSet);
        this._setPrev(viewSet);
        this._setPageNumbers(viewSet);
        this._setNext(viewSet);
        this._setLast(viewSet);
    },
    /**
     * 포함관계를 본다
     *
     * @param {JQueryObject} $find 포함되어있는 체크할 대상
     * @param {JQueryObject} $parent 포함하고 있는지 체크할 대상
     * @returns {boolean}
     */
    isIn: function($find, $parent) {
        if (!$parent) {
            return false;
        }
        return ($find[0] === $parent[0]) ? true : $.contains($parent, $find);
    },
    /**
     * 기준 엘리먼트를 구한다
     *
     * @returns {JQueryObject}
     */
    getBaseElement: function() {
        return this._element;
    },
    /**
     * 기준엘리먼트를 초기화 시킨다
     */
    empty: function(){

        var options = this._options,
            $pre_endOn = options.$pre_endOn,
            $preOn = options.$preOn,
            $nextOn = options.$nextOn,
            $lastOn = options.$lastOn,
            $pre_endOff = options.$pre_endOff,
            $preOff = options.$preOff,
            $nextOff = options.$nextOff,
            $lastOff = options.$lastOff;

        options.$pre_endOn = this._clone($pre_endOn);
        options.$preOn = this._clone($preOn);
        options.$lastOn = this._clone($lastOn);
        options.$nextOn = this._clone($nextOn);
        options.$pre_endOff = this._clone($pre_endOff);
        options.$preOff = this._clone($preOff);
        options.$lastOff = this._clone($lastOff);
        options.$nextOff = this._clone($nextOff);

        this._pageItemList = [];

        this._element.empty();
    },
    /**
     * 페이지 숫자를 담은 엘리먼트 중 원하는 엘리먼트를 찾는다.
     *
     * @param {jQueryObject|HTMLElement} el 목록 중에서 찾을 target 엘리먼트
     * @return {jQueryObject} 있을 경우 해당 엘리먼트 jQuery 객체를 반환하며, 없으면 null을 반환한다.
     */
    getPageElement: function(el) {

        var i,
            length,
            pickedItem;

        for (i = 0, length = this._pageItemList.length; i < length; i++) {
            pickedItem = this._pageItemList[i];
            if (this.isIn(el, pickedItem)) {
                return pickedItem;
            }
        }
        return null;
    },
    /**
     * targetElement 엘리먼트에 eventType 이벤트의 콜백함수로 callback 함수를 등록한다.
     *
     * @param {String} eventType 등록할 이벤트 명
     * @param {Function} callback 해당 이벤트가 발생 시에 호출할 콜백함수
     */
    attachEvent: function(eventType, callback) {

        var targetElement = this._element,
            isSavedElement = ne.util.isString(targetElement) && this._elementSelector[targetElement];

        if (isSavedElement) {
            targetElement = this._getElement(targetElement, true);
        }

        if (targetElement && eventType && callback) {
            $(targetElement).bind(eventType, null, callback);
        }
    },
    /**
     * 루트 엘리먼트객체를 돌려준다.
     *
     * @returns {jQueryObject}
     */
    getElement: function() {

        return this._element;

    },
    /**
     * 클래스명에 Prefix 를 붙힘
     * Prefix는 options.classPrefix를 참조, 붙혀질 때 기존 클래스명의 언더바(_) 문자는 하이픈(-)으로 변환됨
     *
     * @param {String} className
     * @returns {*}
     * @private
     */
    _wrapPrefix: function(className) {
        var classPrefix = this._options['classPrefix'];
        return classPrefix ? classPrefix + className.replace(/_/g, '-') : className;
    },
    /**
     * 페이지표시 마크업 사이사이에 options.insertTextNode를 끼어넣어준다.
     * @private
     */
    _addTextNode: function() {

        var textNode = this._options['insertTextNode'];
        this._element.append(document.createTextNode(textNode));

    },
    /**
     * 엘리먼트 복제, html은 동일하나 jQuery객체상태를 초기화 하여 반환된다.
     * @returns {*}
     * @private
     */
    _clone: function($link) {

        if ($link && $link.length && $link.get(0).cloneNode) {
            return $($link.get(0).cloneNode(true));
        }
        return $link;

    },
    /**
     * 페이지 결과값에 따른, 결과클래스를 입힌다.
     * @param {Number} lastNum
     * @private
     */
    _setPageResult: function(lastNum) {

        if (lastNum === 0) {
            this._element.addClass(this._wrapPrefix('no-result'));
        } else if (lastNum === 1) {
            this._element.addClass(this._wrapPrefix('only-one')).removeClass(this._wrapPrefix('no-result'));
        } else {
            this._element.removeClass(this._wrapPrefix('only-one')).removeClass(this._wrapPrefix('no-result'));
        }

    },
    /**
     * 현재페이지의 양 끝페이지를 구한다
     *
     * @param viewSet
     * @returns {{left: *, right: *}}
     * @private
     */

    _getEdge: function(viewSet) {

        var options = this._options,
            leftPageNumber,
            rightPageNumber,
            left;

        if (options.isCenterAlign) {

            left = Math.floor(options.pagePerPageList / 2);
            leftPageNumber = viewSet.page - left;
            leftPageNumber = Math.max(leftPageNumber, 1);
            rightPageNumber = leftPageNumber + options.pagePerPageList - 1;

            if (rightPageNumber > viewSet.lastPage) {
                leftPageNumber = viewSet.lastPage - options.pagePerPageList + 1;
                leftPageNumber = Math.max(leftPageNumber, 1);
                rightPageNumber = viewSet.lastPage;
            }

        } else {

            leftPageNumber = (viewSet.currentPageIndex - 1) * options.pagePerPageList + 1;
            rightPageNumber = (viewSet.currentPageIndex) * options.pagePerPageList;
            rightPageNumber = Math.min(rightPageNumber, viewSet.lastPage);

        }

        return {
            left: leftPageNumber,
            right: rightPageNumber
        };
    },
    /**
     * 첫번째 페이지인지 여부에 따라 첫번째페이지로 가는 링크를 노출할지 결정한다.
     *
     * @param {Object} viewSet
     * @private
     */
    _setFirst: function(viewSet) {
        var options = this._options;
        if (viewSet.page > 1) {
            if (options.$pre_endOn) {
                this._element.append(options.$pre_endOn);
                this._addTextNode();
            }
        } else {
            if (options.$pre_endOff) {
                this._element.append(options.$pre_endOff);
                this._addTextNode();
            }
        }

    },
    /**
     * 이전페이지가 있는지 여부에 따른 오브젝트 활성화
     *
     * @param {Object} viewSet
     * @private
     *
     */
    _setPrev: function(viewSet) {
        var options = this._options;

        if (viewSet.currentPageIndex > 1) {
            if (options.$preOn) {
                this._element.append(options.$preOn);
                this._addTextNode();
            }
        } else {
            if (options.$preOff) {
                this._element.append(options.$preOff);
                this._addTextNode();
            }
        }
    },
    /**
     * 다음페이지가 있는지 여부에 따른 오브젝트 활성화
     *
     * @param {Obejct} viewSet
     * @private
     */
    _setNext: function(viewSet) {
        var options = this._options;

        if (viewSet.currentPageIndex < viewSet.lastPageListIndex) {
            if (options.$nextOn) {
                this._element.append(options.$nextOn);
                this._addTextNode();
            }
        } else {
            if (options.$nextOff) {
                this._element.append(options.$nextOff);
                this._addTextNode();
            }
        }

    },
    /**
     * 마지막페이지가 있는지 여부에 따른 오브젝트 활성화
     *
     * @param {Object} viewSet
     * @private
     */
    _setLast: function(viewSet) {

        var options = this._options;

        if (viewSet.page < viewSet.lastPage) {
            if (options.$lastOn) {
                this._element.append(options.$lastOn);
                this._addTextNode();
            }
        } else {
            if (options.$lastOff) {
                this._element.append(options.$lastOff);
                this._addTextNode();
            }
        }

    },
    /**
     * 페이지 넘버링을 한다
     *
     * @param {Object} viewSet
     * @private
     */
    _setPageNumbers: function(viewSet) {
        var $pageItem,
            firstPage = viewSet.leftPageNumber,
            lastPage = viewSet.rightPageNumber,
            options = this._options,
            i;

        for (i = firstPage; i <= lastPage; i++) {
            if (i === viewSet.page) {
                $pageItem = $(options.currentPageTemplate.replace('{=page}', i.toString()));
            } else {
                $pageItem = $(options.pageTemplate.replace('{=page}', i.toString()));
                this._pageItemList.push($pageItem);
            }

            if (i === firstPage) {
                $pageItem.addClass(this._wrapPrefix(options['firstItemClassName']));
            }
            if (i === lastPage) {
                $pageItem.addClass(this._wrapPrefix(options['lastItemClassName']));
            }
            this._element.append($pageItem);
            this._addTextNode();
        }
    }
});

})();