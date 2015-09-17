(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
ne.util.defineNamespace('toast.ui.doc', require('./src/js/app'));

},{"./src/js/app":2}],2:[function(require,module,exports){
var Menu = require('./menu');
var Content = require('./content');
var Search = require('./search');

var App = ne.util.defineClass({
    /**
     * Initialize
     * @param {object} option 
     */
    init: function(option) {
        this.menu = new Menu({
            element: option.element.menu,
            tab: option.element.tab
        });
        this.content = new Content({
            element: option.element.content,
            codeElement: option.element.code,
            content: option.data.content
        });
        this.search = new Search({
            element: option.element.search
        });
        this._menu = option.data.menu;
        this.setMenu();
        this.setEvent();
    },

    /**
     * Set events
     */
    setEvent: function() {
        this.content.on('notify', ne.util.bind(this.changePage, this));
        this.menu.on('notify', ne.util.bind(this.changePage, this));
        this.menu.on('tabChange', ne.util.bind(this.changeTab, this));
        this.search.on('search', ne.util.bind(this.searchList, this));
        this.search.on('notify', ne.util.bind(this.changePage, this));
    },

    /**
     * Search words by lnb data
     */
    searchList: function(data) {
        var word = data.text,
            classes = this._menu.classes,
            namespaces = this._menu.namespaces,
            result = this.findIn(word, classes);
        result = result.concat(this.findIn(word, namespaces));
        if (!word) {
            result = [];
        }
        data.callback(result);
    },

    /**
     * Find in lnb array
     */
    findIn: function(str, array) {
        var result = [], 
            self = this;
        ne.util.forEach(array, function(el) {
            var code = self.getCode(el.meta);
            if (el.methods) {
                ne.util.forEach(el.methods, function(m) {
                    if (m.id.replace('.', '').toLowerCase().indexOf(str.toLowerCase()) !== -1 && m.access !== 'private') {
                        result.push({
                            id: m.id,
                            label: self.highlighting(m.id, str),
                            group: el.longname,
                            code: code
                        });
                    }
                });            
            }
        });
        return result;
    },

    /**
     * Highlight query
     */
    highlighting: function(word, str) {
        var reg = new RegExp(str, 'i', 'g'),
            origin = reg.exec(word)[0];
        return word.replace(reg, '<strong>' + origin + '</strong>');
    },

    /**
     * Chagne Tab
     */
    changeTab: function(data) {
        this.content.changeTab(data.state);
   },

    /**
     * Set Content page by data
     */
    changePage: function(data) {
        var html;
        if (data.name) {
            this.changeTab({state: 'info'});
            this.menu.turnOnInfo();
            this.content.setInfo(fedoc.content[data.name + '.html']);
            this.content.setCode(fedoc.content[data.codeName + '.html']);
            this.content.moveTo('#contentTab');
        }

        if (data.line) {
            this.menu.turnOnCode();
            this.content.moveToLine(data.line);
        }   
        
        if (data.href) {
            this.content.moveTo(data.href);
        }
        this.menu.focus(data.name, data.codeName); 
        this.search.reset(); 
    },

    /**
     * Set menu object to html
     * @todo This might be moved to menu.js
     */
    setMenu: function() {
        var html = '',
            self = this,
            classes = this._menu.classes,
            namespace = this._menu.namespaces,
            tutorials = this._menu.tutorials;


        if (tutorials && tutorials.length) {
            html += '<h3>Samples</h3>';
        }

        html += '<ul class="tutorials">';

        ne.util.forEach(tutorials, function(el) {
            html += '<li clsss="tutorials"><a class="tutorialLink" href="tutorial-' + el.name + '.html" target="_blank">' + el.title + '</a></li>';
        });
        
        html += '</ul>';
        
        if (classes && classes.length) {
            html += '<h3>Classes</h3>';
        }

        html += '<ul class="classes">';
        ne.util.forEach(classes, function(el) {
            var code = self.getCode(el.meta),
                mhtml = '';
            html += '<li class="listitem" data-spec="'+el.longname+'" data-code="'+code+'"><a href="#">' + el.longname + '</a>';
            if (el.members) {           
                ne.util.forEach(el.members, function(m) {
                    if (m.access === 'private') return;
                    mhtml += '<li class="memberitem" data-spec="' + el.longname + '" data-code="' + code + '"><a href="#' + m.id + '">' + m.id + '</a></li>';
                });
                if (mhtml) {
                    html += '<div class="title"><strong>Members</strong></div>';
                    html += '<ul class="inner">';
                    html += mhtml;
                    html += '</ul>';
                }
            }
            if (el.methods) {
                html += '<div class="title"><strong>Methods</strong></div>';
                html += '<ul class="inner">';
                ne.util.forEach(el.methods, function(m) {
                    if (m.access === 'private') return;
                    html += '<li class="memberitem" data-spec="'+el.longname+'" data-code="'+code+'"><a href="#' + m.id + '">' + m.id + '</a></li>';
                });
                html += '</ul>';
            }
            html += '</li>';
        });
        html += '</ul>';
        
        if (namespace && namespace.length) {
            html += '<h3>Modules</h3>';
        }
        
        html += '<ul class="namespace">';
        ne.util.forEach(namespace, function(el) {
            var code = self.getCode(el.meta), 
                mhtml = '';
            html += '<li class="listitem" data-spec="'+el.longname+'" data-code="'+code+'"><a href="#">' + el.longname + '</a>';
            if (el.members) {
                ne.util.forEach(el.members, function(m) {
                    if (m.access === 'private') return;
                    mhtml += '<li class="memberitem" data-spec="'+el.longname+'" data-code="'+code+'"><a href="#' + m.id + '">' + m.id + '</a></li>';
                });
                if (mhtml) {
                    html += '<div class="title"><strong>Members</strong></div>';
                    html += '<ul class="inner">';
                    html += mhtml;
                    html += '</ul>';
                }
            }
            if (el.methods) {
                html += '<div class="title"><strong>Methods</strong></div>';
                html += '<ul class="inner">';
            ne.util.forEach(el.methods, function(m) {
                if (m.access === 'private') return;
                html += '<li class="memberitem" data-spec="'+el.longname+'" data-code="'+code+'"><a href="#' + m.id + '">' + m.id.replace('.', '') + '</a></li>';
                });
                html += '</ul>';
            }
            html += '</li>';
});
        html += '</ul>';
        this.menu.setMenu(html);
    },

    find: function() {
        return [
            {
                id: 'idididid'
            },
            {
                id: 'asdfasdf'
            }
        ];
    },
    
    /**
     * Meta data
     */
    getCode: function(meta) {
        var path = meta.path.split('/src/')[1];
        
        if (path && path.indexOf('js/') !== -1) {
            path = path.split('js/')[1];
        } else if (path && path.indexOf('js') !== -1) {
            path = path.split('js')[1];
        }

       if (!path) {
            return meta.filename;
        }
        return path.replace(/\//g, '_') + '_' + meta.filename;
    },

    /**
     * Set content
     */
    setContent: function(html) {
        this.content.setInfo(html);
    }, 
    
    /**
     * Pick data from text files
     * @param {string} name A file name
     */
    pickData: function(name, callback) {
        var url = name,
            urlCode = name + '.js';
        
        this.content.setInfo(fedoc.content[name]);
        this.content.setCode(fedoc.content[urlCode]);
    },
});

module.exports = App;

},{"./content":3,"./menu":4,"./search":5}],3:[function(require,module,exports){
var Content = ne.util.defineClass({
    /**
     * Initialize
     */
    init: function(option) {
        this.$info = option.element;
        this.$code = option.codeElement;
        this.state = 'info';
        this.$code.hide();
        this.setInfo(option.content);
        this.setEvent();
    },

    setEvent: function() {
        this.$info.on('click', ne.util.bind(this.onClick, this));
    },

    onClick: function(e) {
        var target = e.target,
            tagName = target.tagName.toLowerCase(), 
            readme = this.$info.find('.readme');
        if (tagName === 'a') {
            if (readme.length &&  $.contains(readme[0], target)) {
                open(target.href);
            }
           e.preventDefault();
        }
        if (
            tagName === 'code' &&
            $(target).parent().hasClass('container-source') 
           ) {
            this.fire('notify', {
                line: parseInt(target.innerHTML.replace('line', ''), 10) || 1
            });
        }
    },

    /**
     * Set information html to info
     */
    setInfo: function(html) {
        this.$info.html(html);
    },

    /**
     * Set code html to code
     */
    setCode: function(code) {
        this.$code.html(code);
        this.setCodeLine();
    },
    
    /**
     * Set code line
     */
    setCodeLine: function() {
        prettyPrint();
        var source = this.$code.find('.prettyprint');
        var i = 0;
        var lineNumber = 0;
        var lineId;
        var lines;
        var totalLines;
        var anchorHash;

        if (source && source[0]) {
            anchorHash = document.location.hash.substring(1);
            lines = source[0].getElementsByTagName('li');
            totalLines = lines.length;

            for (; i < totalLines; i++) {
                lineNumber++;
                lineId = 'line' + lineNumber;
                lines[i].id = lineId;
                if (lineId === anchorHash) {
                    lines[i].className += ' selected';
                }
            }
        }
    },

    /**
     * Change tab for state change
     * @param {string} state A state to chagne tab
     */
    changeTab: function(state) {
        if (state === 'info') {
            this._enableInfo();
        } else {
            this._enableCode();
        }
    },

    /**
     * Be enable info state
     */
    _enableInfo: function() {
        this.state = 'info';        
        this.$info.show();
        this.$code.hide();
    },

    /**
     * Be enable code state
     */
    _enableCode: function() {
        this.state = 'code';
        this.$code.show();
        this.$info.hide();
    },

    /**
     * Move to moethod by id
     */
    moveTo: function(id) {
        document.location = document.URL.split('#')[0] + id; 
    },

    /**
     * Change tab and move to line (number)
     * @param {number} line The number of line to move
     */
    moveToLine: function(line) {
        this.changeTab('code');
        document.location = document.URL.split('#')[0] + '#line' + line; 
    }
});

ne.util.CustomEvents.mixin(Content);
module.exports = Content;

},{}],4:[function(require,module,exports){
var Menu = ne.util.defineClass({
    /**
     * Initialize
     */
    init: function(option) {
        this.$menu = option.element;
        this.$tab = option.tab;
        this.current = 'main';
        this.state = 'info';
        this.setEvent();
    },

    /**
     * Set event to page move
     */
    setEvent: function() {
        this.$menu.on('click', ne.util.bind(this.onClickMenu, this));
        this.$tab.on('click', ne.util.bind(this.onClickTab, this));
    },

    /**
     * Tab chnage event
     * @param {object} event The JqueryEvent object
     */
    onClickTab: function(event) {
        var target = $(event.target);
        if (target.hasClass('tabmenu')
           && !target.hasClass('on')) {
            var isCode = target.hasClass('code');
            this.fire('tabChange', {
                state: isCode ? 'code' : 'info'
            });

            if (isCode) {
                this.turnOnCode();
            } else {
                this.turnOnInfo();
            }
        }
    },

    /**
     * Focus menu
     */
    focus: function(spec, code) {
        if (!spec || !code) {
            return;
        }

        this.$menu.find('.listitem').each(function(index) {
            var self = $(this);
            if (self.attr('data-spec') === spec && self.attr('data-code')) {
                self.addClass('selected');
            } else {
                $(this).removeClass('selected');
            }
        });
    },
    turnOnInfo: function() {
        $('.tabmenu').removeClass('on');
        this.$tab.find('.info').addClass('on');
    },
    turnOnCode: function() {
        $('.tabmenu').removeClass('on');
        this.$tab.find('.code').addClass('on');
    },

    /**
     * Notify for change content
     */
    onClickMenu: function(event) {
        event.preventDefault();
        var target = $(event.target),
            isTutorial = target.hasClass('tutorialLink'),
            href = target.attr('href'),
            target = href ? target.parent() : target,
            spec = target.attr('data-spec'),
            code = target.attr('data-code');

        if (isTutorial) {
            window.open(href);
            return;
        }

        if (spec) {
            this.fire('notify', {
                name: spec,
                codeName: code,
                href: href
            });
        }
       
    },

    /**
     * Set menu html
     * @param {string} html A html string to set menu
     */
    setMenu: function(html) {
        this.$menu.html(html);
    },

    /**
     * Select menu with state
     */
    select: function(menu, state) {
        this.current = menu;
        this.state = state || 'info';
    },
    
    /**
     * Open selected menu
     */ 
    open: function(menu) {
        this.$menu.find('.' + menu).addClass('unfold'); 
    },

    /**
     * Set tab menu html
     */
    setTab: function(html) {
        this.$tab.html(html);
    }, 
    
    /**
     * On selected tab
     */
    tabOn: function(name) {
         this.$tab.removeClass();
         this.$tab.addClass('tab tab-' + name);
    }
});

ne.util.CustomEvents.mixin(Menu);
module.exports = Menu;

},{}],5:[function(require,module,exports){
var Search = ne.util.defineClass({

    keyUp: 38,
    keyDown: 40,
    enter: 13,

    /**
     * Initialize
     */
    init: function(option, app) {
        this.$el = option.element;
        this.$input = this.$el.find('input');
        this.$list = this.$el.find('.searchList');
        this.$list.hide();
        this.root = app;
        this._addEvent();
        this.index = null;
    },

    /**
     * Add Events
     */
    _addEvent: function() {
        this.$input.on('keyup', ne.util.bind(function(event) {
            if(event.keyCode === this.keyUp || event.keyCode === this.keyDown || event.keyCode === this.enter) {
                if (this.$list.css('display') !== 'none') {
                    if (event.keyCode === this.enter) {
                        // that is no way, this.find(event.target.value);
                        var selected = this.$list.find('li.on'), 
                            first = this.$list.find('li').eq(0),
                            query;
                        if (selected.length !== 0) {
                            this.onSubmit({ target: selected[0] });
                        } else if (first.length !== 0) {
                            this.onSubmit({ target: first[0]});
                        }
                    } else {
                        this.selectItem(event.keyCode);
                    }
                }
            } else {
                this.find(event.target.value); 
            }
        }, this));
    },

    /**
     * Select item by keyboard
     */
    selectItem: function(code) {
        this.$list.find('li').removeClass('on');
        var len = this.$list.find('li').length;
        if (!ne.util.isNumber(this.index)) {
            this.index = 0;
        }  else {
            if (code === this.keyUp) {
                this.index = (this.index - 1 + len) % len;
            } else {
                this.index = (this.index + 1) % len;
            }
        }
        this.$list.find('li').eq(this.index).addClass('on');
        this.$input.val(this.$list.find('li.on').find('a').text());
    },
    
    /**
     * Reset search
     */ 
    reset: function() {
        this.$input.val('');
        this.$list.find('li').off('click');
        this.$list.empty();
        this.$list.hide();
        this.index = null;
    },

    /**
     * Submit for change by search result list
     */ 
    onSubmit: function(event) {
        var target = event.target,
            href,
            spec, 
            code;
        target = this.getTarget(target);
        href = target.find('a').attr('href');
        spec = target.find('span').attr('data-spec');
        code = target.find('span').attr('data-code');
        
        this.fire('notify', {
             codeName: code,
             name: spec,
             href: href
        });
    }, 

    /**
     * Get target
     * @param {object} target The target that have to extract
     */
    getTarget: function(target) {
        var tagName = target.tagName.toUpperCase(),
            $target = $(target);
        if (tagName !== 'LI') {
            return this.getTarget($target.parent()[0]);
        } else {
            return $target;
        }
    },
    
    /**
     * Find word by input text
     */
    find: function(text) {
        var self = this;
        this.$list.hide();
        this.fire('search', { 
            text: text,
            callback: function(data) {
                self.update(data);
            }
        });
    },

    /**
     * Update search list
     */
    update: function(list) {
        var str = ''; 
        ne.util.forEach(list, function(el) {
            str += '<li><span data-spec="' + el.group + '" data-code="' + el.code + '"><a href="#' + el.id + '">' + el.label.replace('.', '') + '</a><span class="group">' + el.group + '</span></span></li>'; 
        });
        this.$list.html(str);
        if (str) {
            this.$list.show();
        }
        this.$list.find('li').on('click', ne.util.bind(this.onSubmit, this)); 
    }
});

ne.util.CustomEvents.mixin(Search);
module.exports = Search;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9qcy9hcHAuanMiLCJzcmMvanMvY29udGVudC5qcyIsInNyYy9qcy9tZW51LmpzIiwic3JjL2pzL3NlYXJjaC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0UUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibmUudXRpbC5kZWZpbmVOYW1lc3BhY2UoJ3RvYXN0LnVpLmRvYycsIHJlcXVpcmUoJy4vc3JjL2pzL2FwcCcpKTtcbiIsInZhciBNZW51ID0gcmVxdWlyZSgnLi9tZW51Jyk7XG52YXIgQ29udGVudCA9IHJlcXVpcmUoJy4vY29udGVudCcpO1xudmFyIFNlYXJjaCA9IHJlcXVpcmUoJy4vc2VhcmNoJyk7XG5cbnZhciBBcHAgPSBuZS51dGlsLmRlZmluZUNsYXNzKHtcbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbiBcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgdGhpcy5tZW51ID0gbmV3IE1lbnUoe1xuICAgICAgICAgICAgZWxlbWVudDogb3B0aW9uLmVsZW1lbnQubWVudSxcbiAgICAgICAgICAgIHRhYjogb3B0aW9uLmVsZW1lbnQudGFiXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmNvbnRlbnQgPSBuZXcgQ29udGVudCh7XG4gICAgICAgICAgICBlbGVtZW50OiBvcHRpb24uZWxlbWVudC5jb250ZW50LFxuICAgICAgICAgICAgY29kZUVsZW1lbnQ6IG9wdGlvbi5lbGVtZW50LmNvZGUsXG4gICAgICAgICAgICBjb250ZW50OiBvcHRpb24uZGF0YS5jb250ZW50XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnNlYXJjaCA9IG5ldyBTZWFyY2goe1xuICAgICAgICAgICAgZWxlbWVudDogb3B0aW9uLmVsZW1lbnQuc2VhcmNoXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLl9tZW51ID0gb3B0aW9uLmRhdGEubWVudTtcbiAgICAgICAgdGhpcy5zZXRNZW51KCk7XG4gICAgICAgIHRoaXMuc2V0RXZlbnQoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGV2ZW50c1xuICAgICAqL1xuICAgIHNldEV2ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5jb250ZW50Lm9uKCdub3RpZnknLCBuZS51dGlsLmJpbmQodGhpcy5jaGFuZ2VQYWdlLCB0aGlzKSk7XG4gICAgICAgIHRoaXMubWVudS5vbignbm90aWZ5JywgbmUudXRpbC5iaW5kKHRoaXMuY2hhbmdlUGFnZSwgdGhpcykpO1xuICAgICAgICB0aGlzLm1lbnUub24oJ3RhYkNoYW5nZScsIG5lLnV0aWwuYmluZCh0aGlzLmNoYW5nZVRhYiwgdGhpcykpO1xuICAgICAgICB0aGlzLnNlYXJjaC5vbignc2VhcmNoJywgbmUudXRpbC5iaW5kKHRoaXMuc2VhcmNoTGlzdCwgdGhpcykpO1xuICAgICAgICB0aGlzLnNlYXJjaC5vbignbm90aWZ5JywgbmUudXRpbC5iaW5kKHRoaXMuY2hhbmdlUGFnZSwgdGhpcykpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZWFyY2ggd29yZHMgYnkgbG5iIGRhdGFcbiAgICAgKi9cbiAgICBzZWFyY2hMaXN0OiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciB3b3JkID0gZGF0YS50ZXh0LFxuICAgICAgICAgICAgY2xhc3NlcyA9IHRoaXMuX21lbnUuY2xhc3NlcyxcbiAgICAgICAgICAgIG5hbWVzcGFjZXMgPSB0aGlzLl9tZW51Lm5hbWVzcGFjZXMsXG4gICAgICAgICAgICByZXN1bHQgPSB0aGlzLmZpbmRJbih3b3JkLCBjbGFzc2VzKTtcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdCh0aGlzLmZpbmRJbih3b3JkLCBuYW1lc3BhY2VzKSk7XG4gICAgICAgIGlmICghd29yZCkge1xuICAgICAgICAgICAgcmVzdWx0ID0gW107XG4gICAgICAgIH1cbiAgICAgICAgZGF0YS5jYWxsYmFjayhyZXN1bHQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGaW5kIGluIGxuYiBhcnJheVxuICAgICAqL1xuICAgIGZpbmRJbjogZnVuY3Rpb24oc3RyLCBhcnJheSkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gW10sIFxuICAgICAgICAgICAgc2VsZiA9IHRoaXM7XG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaChhcnJheSwgZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgICAgIHZhciBjb2RlID0gc2VsZi5nZXRDb2RlKGVsLm1ldGEpO1xuICAgICAgICAgICAgaWYgKGVsLm1ldGhvZHMpIHtcbiAgICAgICAgICAgICAgICBuZS51dGlsLmZvckVhY2goZWwubWV0aG9kcywgZnVuY3Rpb24obSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobS5pZC5yZXBsYWNlKCcuJywgJycpLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzdHIudG9Mb3dlckNhc2UoKSkgIT09IC0xICYmIG0uYWNjZXNzICE9PSAncHJpdmF0ZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogbS5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogc2VsZi5oaWdobGlnaHRpbmcobS5pZCwgc3RyKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm91cDogZWwubG9uZ25hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogY29kZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTsgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhpZ2hsaWdodCBxdWVyeVxuICAgICAqL1xuICAgIGhpZ2hsaWdodGluZzogZnVuY3Rpb24od29yZCwgc3RyKSB7XG4gICAgICAgIHZhciByZWcgPSBuZXcgUmVnRXhwKHN0ciwgJ2knLCAnZycpLFxuICAgICAgICAgICAgb3JpZ2luID0gcmVnLmV4ZWMod29yZClbMF07XG4gICAgICAgIHJldHVybiB3b3JkLnJlcGxhY2UocmVnLCAnPHN0cm9uZz4nICsgb3JpZ2luICsgJzwvc3Ryb25nPicpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGFnbmUgVGFiXG4gICAgICovXG4gICAgY2hhbmdlVGFiOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHRoaXMuY29udGVudC5jaGFuZ2VUYWIoZGF0YS5zdGF0ZSk7XG4gICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IENvbnRlbnQgcGFnZSBieSBkYXRhXG4gICAgICovXG4gICAgY2hhbmdlUGFnZTogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgaHRtbDtcbiAgICAgICAgaWYgKGRhdGEubmFtZSkge1xuICAgICAgICAgICAgdGhpcy5jaGFuZ2VUYWIoe3N0YXRlOiAnaW5mbyd9KTtcbiAgICAgICAgICAgIHRoaXMubWVudS50dXJuT25JbmZvKCk7XG4gICAgICAgICAgICB0aGlzLmNvbnRlbnQuc2V0SW5mbyhmZWRvYy5jb250ZW50W2RhdGEubmFtZSArICcuaHRtbCddKTtcbiAgICAgICAgICAgIHRoaXMuY29udGVudC5zZXRDb2RlKGZlZG9jLmNvbnRlbnRbZGF0YS5jb2RlTmFtZSArICcuaHRtbCddKTtcbiAgICAgICAgICAgIHRoaXMuY29udGVudC5tb3ZlVG8oJyNjb250ZW50VGFiJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZGF0YS5saW5lKSB7XG4gICAgICAgICAgICB0aGlzLm1lbnUudHVybk9uQ29kZSgpO1xuICAgICAgICAgICAgdGhpcy5jb250ZW50Lm1vdmVUb0xpbmUoZGF0YS5saW5lKTtcbiAgICAgICAgfSAgIFxuICAgICAgICBcbiAgICAgICAgaWYgKGRhdGEuaHJlZikge1xuICAgICAgICAgICAgdGhpcy5jb250ZW50Lm1vdmVUbyhkYXRhLmhyZWYpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubWVudS5mb2N1cyhkYXRhLm5hbWUsIGRhdGEuY29kZU5hbWUpOyBcbiAgICAgICAgdGhpcy5zZWFyY2gucmVzZXQoKTsgXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBtZW51IG9iamVjdCB0byBodG1sXG4gICAgICogQHRvZG8gVGhpcyBtaWdodCBiZSBtb3ZlZCB0byBtZW51LmpzXG4gICAgICovXG4gICAgc2V0TWVudTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBodG1sID0gJycsXG4gICAgICAgICAgICBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgIGNsYXNzZXMgPSB0aGlzLl9tZW51LmNsYXNzZXMsXG4gICAgICAgICAgICBuYW1lc3BhY2UgPSB0aGlzLl9tZW51Lm5hbWVzcGFjZXMsXG4gICAgICAgICAgICB0dXRvcmlhbHMgPSB0aGlzLl9tZW51LnR1dG9yaWFscztcblxuXG4gICAgICAgIGlmICh0dXRvcmlhbHMgJiYgdHV0b3JpYWxzLmxlbmd0aCkge1xuICAgICAgICAgICAgaHRtbCArPSAnPGgzPlNhbXBsZXM8L2gzPic7XG4gICAgICAgIH1cblxuICAgICAgICBodG1sICs9ICc8dWwgY2xhc3M9XCJ0dXRvcmlhbHNcIj4nO1xuXG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaCh0dXRvcmlhbHMsIGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgICAgICBodG1sICs9ICc8bGkgY2xzc3M9XCJ0dXRvcmlhbHNcIj48YSBjbGFzcz1cInR1dG9yaWFsTGlua1wiIGhyZWY9XCJ0dXRvcmlhbC0nICsgZWwubmFtZSArICcuaHRtbFwiIHRhcmdldD1cIl9ibGFua1wiPicgKyBlbC50aXRsZSArICc8L2E+PC9saT4nO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGh0bWwgKz0gJzwvdWw+JztcbiAgICAgICAgXG4gICAgICAgIGlmIChjbGFzc2VzICYmIGNsYXNzZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBodG1sICs9ICc8aDM+Q2xhc3NlczwvaDM+JztcbiAgICAgICAgfVxuXG4gICAgICAgIGh0bWwgKz0gJzx1bCBjbGFzcz1cImNsYXNzZXNcIj4nO1xuICAgICAgICBuZS51dGlsLmZvckVhY2goY2xhc3NlcywgZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgICAgIHZhciBjb2RlID0gc2VsZi5nZXRDb2RlKGVsLm1ldGEpLFxuICAgICAgICAgICAgICAgIG1odG1sID0gJyc7XG4gICAgICAgICAgICBodG1sICs9ICc8bGkgY2xhc3M9XCJsaXN0aXRlbVwiIGRhdGEtc3BlYz1cIicrZWwubG9uZ25hbWUrJ1wiIGRhdGEtY29kZT1cIicrY29kZSsnXCI+PGEgaHJlZj1cIiNcIj4nICsgZWwubG9uZ25hbWUgKyAnPC9hPic7XG4gICAgICAgICAgICBpZiAoZWwubWVtYmVycykgeyAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgbmUudXRpbC5mb3JFYWNoKGVsLm1lbWJlcnMsIGZ1bmN0aW9uKG0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG0uYWNjZXNzID09PSAncHJpdmF0ZScpIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgbWh0bWwgKz0gJzxsaSBjbGFzcz1cIm1lbWJlcml0ZW1cIiBkYXRhLXNwZWM9XCInICsgZWwubG9uZ25hbWUgKyAnXCIgZGF0YS1jb2RlPVwiJyArIGNvZGUgKyAnXCI+PGEgaHJlZj1cIiMnICsgbS5pZCArICdcIj4nICsgbS5pZCArICc8L2E+PC9saT4nO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChtaHRtbCkge1xuICAgICAgICAgICAgICAgICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwidGl0bGVcIj48c3Ryb25nPk1lbWJlcnM8L3N0cm9uZz48L2Rpdj4nO1xuICAgICAgICAgICAgICAgICAgICBodG1sICs9ICc8dWwgY2xhc3M9XCJpbm5lclwiPic7XG4gICAgICAgICAgICAgICAgICAgIGh0bWwgKz0gbWh0bWw7XG4gICAgICAgICAgICAgICAgICAgIGh0bWwgKz0gJzwvdWw+JztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZWwubWV0aG9kcykge1xuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJ0aXRsZVwiPjxzdHJvbmc+TWV0aG9kczwvc3Ryb25nPjwvZGl2Pic7XG4gICAgICAgICAgICAgICAgaHRtbCArPSAnPHVsIGNsYXNzPVwiaW5uZXJcIj4nO1xuICAgICAgICAgICAgICAgIG5lLnV0aWwuZm9yRWFjaChlbC5tZXRob2RzLCBmdW5jdGlvbihtKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtLmFjY2VzcyA9PT0gJ3ByaXZhdGUnKSByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxsaSBjbGFzcz1cIm1lbWJlcml0ZW1cIiBkYXRhLXNwZWM9XCInK2VsLmxvbmduYW1lKydcIiBkYXRhLWNvZGU9XCInK2NvZGUrJ1wiPjxhIGhyZWY9XCIjJyArIG0uaWQgKyAnXCI+JyArIG0uaWQgKyAnPC9hPjwvbGk+JztcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBodG1sICs9ICc8L3VsPic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBodG1sICs9ICc8L2xpPic7XG4gICAgICAgIH0pO1xuICAgICAgICBodG1sICs9ICc8L3VsPic7XG4gICAgICAgIFxuICAgICAgICBpZiAobmFtZXNwYWNlICYmIG5hbWVzcGFjZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGh0bWwgKz0gJzxoMz5Nb2R1bGVzPC9oMz4nO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBodG1sICs9ICc8dWwgY2xhc3M9XCJuYW1lc3BhY2VcIj4nO1xuICAgICAgICBuZS51dGlsLmZvckVhY2gobmFtZXNwYWNlLCBmdW5jdGlvbihlbCkge1xuICAgICAgICAgICAgdmFyIGNvZGUgPSBzZWxmLmdldENvZGUoZWwubWV0YSksIFxuICAgICAgICAgICAgICAgIG1odG1sID0gJyc7XG4gICAgICAgICAgICBodG1sICs9ICc8bGkgY2xhc3M9XCJsaXN0aXRlbVwiIGRhdGEtc3BlYz1cIicrZWwubG9uZ25hbWUrJ1wiIGRhdGEtY29kZT1cIicrY29kZSsnXCI+PGEgaHJlZj1cIiNcIj4nICsgZWwubG9uZ25hbWUgKyAnPC9hPic7XG4gICAgICAgICAgICBpZiAoZWwubWVtYmVycykge1xuICAgICAgICAgICAgICAgIG5lLnV0aWwuZm9yRWFjaChlbC5tZW1iZXJzLCBmdW5jdGlvbihtKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtLmFjY2VzcyA9PT0gJ3ByaXZhdGUnKSByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIG1odG1sICs9ICc8bGkgY2xhc3M9XCJtZW1iZXJpdGVtXCIgZGF0YS1zcGVjPVwiJytlbC5sb25nbmFtZSsnXCIgZGF0YS1jb2RlPVwiJytjb2RlKydcIj48YSBocmVmPVwiIycgKyBtLmlkICsgJ1wiPicgKyBtLmlkICsgJzwvYT48L2xpPic7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKG1odG1sKSB7XG4gICAgICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJ0aXRsZVwiPjxzdHJvbmc+TWVtYmVyczwvc3Ryb25nPjwvZGl2Pic7XG4gICAgICAgICAgICAgICAgICAgIGh0bWwgKz0gJzx1bCBjbGFzcz1cImlubmVyXCI+JztcbiAgICAgICAgICAgICAgICAgICAgaHRtbCArPSBtaHRtbDtcbiAgICAgICAgICAgICAgICAgICAgaHRtbCArPSAnPC91bD4nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChlbC5tZXRob2RzKSB7XG4gICAgICAgICAgICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInRpdGxlXCI+PHN0cm9uZz5NZXRob2RzPC9zdHJvbmc+PC9kaXY+JztcbiAgICAgICAgICAgICAgICBodG1sICs9ICc8dWwgY2xhc3M9XCJpbm5lclwiPic7XG4gICAgICAgICAgICBuZS51dGlsLmZvckVhY2goZWwubWV0aG9kcywgZnVuY3Rpb24obSkge1xuICAgICAgICAgICAgICAgIGlmIChtLmFjY2VzcyA9PT0gJ3ByaXZhdGUnKSByZXR1cm47XG4gICAgICAgICAgICAgICAgaHRtbCArPSAnPGxpIGNsYXNzPVwibWVtYmVyaXRlbVwiIGRhdGEtc3BlYz1cIicrZWwubG9uZ25hbWUrJ1wiIGRhdGEtY29kZT1cIicrY29kZSsnXCI+PGEgaHJlZj1cIiMnICsgbS5pZCArICdcIj4nICsgbS5pZC5yZXBsYWNlKCcuJywgJycpICsgJzwvYT48L2xpPic7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaHRtbCArPSAnPC91bD4nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaHRtbCArPSAnPC9saT4nO1xufSk7XG4gICAgICAgIGh0bWwgKz0gJzwvdWw+JztcbiAgICAgICAgdGhpcy5tZW51LnNldE1lbnUoaHRtbCk7XG4gICAgfSxcblxuICAgIGZpbmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlkOiAnaWRpZGlkaWQnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlkOiAnYXNkZmFzZGYnXG4gICAgICAgICAgICB9XG4gICAgICAgIF07XG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiBNZXRhIGRhdGFcbiAgICAgKi9cbiAgICBnZXRDb2RlOiBmdW5jdGlvbihtZXRhKSB7XG4gICAgICAgIHZhciBwYXRoID0gbWV0YS5wYXRoLnNwbGl0KCcvc3JjLycpWzFdO1xuICAgICAgICBcbiAgICAgICAgaWYgKHBhdGggJiYgcGF0aC5pbmRleE9mKCdqcy8nKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHBhdGggPSBwYXRoLnNwbGl0KCdqcy8nKVsxXTtcbiAgICAgICAgfSBlbHNlIGlmIChwYXRoICYmIHBhdGguaW5kZXhPZignanMnKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHBhdGggPSBwYXRoLnNwbGl0KCdqcycpWzFdO1xuICAgICAgICB9XG5cbiAgICAgICBpZiAoIXBhdGgpIHtcbiAgICAgICAgICAgIHJldHVybiBtZXRhLmZpbGVuYW1lO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYXRoLnJlcGxhY2UoL1xcLy9nLCAnXycpICsgJ18nICsgbWV0YS5maWxlbmFtZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGNvbnRlbnRcbiAgICAgKi9cbiAgICBzZXRDb250ZW50OiBmdW5jdGlvbihodG1sKSB7XG4gICAgICAgIHRoaXMuY29udGVudC5zZXRJbmZvKGh0bWwpO1xuICAgIH0sIFxuICAgIFxuICAgIC8qKlxuICAgICAqIFBpY2sgZGF0YSBmcm9tIHRleHQgZmlsZXNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBBIGZpbGUgbmFtZVxuICAgICAqL1xuICAgIHBpY2tEYXRhOiBmdW5jdGlvbihuYW1lLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgdXJsID0gbmFtZSxcbiAgICAgICAgICAgIHVybENvZGUgPSBuYW1lICsgJy5qcyc7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmNvbnRlbnQuc2V0SW5mbyhmZWRvYy5jb250ZW50W25hbWVdKTtcbiAgICAgICAgdGhpcy5jb250ZW50LnNldENvZGUoZmVkb2MuY29udGVudFt1cmxDb2RlXSk7XG4gICAgfSxcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcDtcbiIsInZhciBDb250ZW50ID0gbmUudXRpbC5kZWZpbmVDbGFzcyh7XG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZVxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgICB0aGlzLiRpbmZvID0gb3B0aW9uLmVsZW1lbnQ7XG4gICAgICAgIHRoaXMuJGNvZGUgPSBvcHRpb24uY29kZUVsZW1lbnQ7XG4gICAgICAgIHRoaXMuc3RhdGUgPSAnaW5mbyc7XG4gICAgICAgIHRoaXMuJGNvZGUuaGlkZSgpO1xuICAgICAgICB0aGlzLnNldEluZm8ob3B0aW9uLmNvbnRlbnQpO1xuICAgICAgICB0aGlzLnNldEV2ZW50KCk7XG4gICAgfSxcblxuICAgIHNldEV2ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy4kaW5mby5vbignY2xpY2snLCBuZS51dGlsLmJpbmQodGhpcy5vbkNsaWNrLCB0aGlzKSk7XG4gICAgfSxcblxuICAgIG9uQ2xpY2s6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyIHRhcmdldCA9IGUudGFyZ2V0LFxuICAgICAgICAgICAgdGFnTmFtZSA9IHRhcmdldC50YWdOYW1lLnRvTG93ZXJDYXNlKCksIFxuICAgICAgICAgICAgcmVhZG1lID0gdGhpcy4kaW5mby5maW5kKCcucmVhZG1lJyk7XG4gICAgICAgIGlmICh0YWdOYW1lID09PSAnYScpIHtcbiAgICAgICAgICAgIGlmIChyZWFkbWUubGVuZ3RoICYmICAkLmNvbnRhaW5zKHJlYWRtZVswXSwgdGFyZ2V0KSkge1xuICAgICAgICAgICAgICAgIG9wZW4odGFyZ2V0LmhyZWYpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgdGFnTmFtZSA9PT0gJ2NvZGUnICYmXG4gICAgICAgICAgICAkKHRhcmdldCkucGFyZW50KCkuaGFzQ2xhc3MoJ2NvbnRhaW5lci1zb3VyY2UnKSBcbiAgICAgICAgICAgKSB7XG4gICAgICAgICAgICB0aGlzLmZpcmUoJ25vdGlmeScsIHtcbiAgICAgICAgICAgICAgICBsaW5lOiBwYXJzZUludCh0YXJnZXQuaW5uZXJIVE1MLnJlcGxhY2UoJ2xpbmUnLCAnJyksIDEwKSB8fCAxXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgaW5mb3JtYXRpb24gaHRtbCB0byBpbmZvXG4gICAgICovXG4gICAgc2V0SW5mbzogZnVuY3Rpb24oaHRtbCkge1xuICAgICAgICB0aGlzLiRpbmZvLmh0bWwoaHRtbCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBjb2RlIGh0bWwgdG8gY29kZVxuICAgICAqL1xuICAgIHNldENvZGU6IGZ1bmN0aW9uKGNvZGUpIHtcbiAgICAgICAgdGhpcy4kY29kZS5odG1sKGNvZGUpO1xuICAgICAgICB0aGlzLnNldENvZGVMaW5lKCk7XG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiBTZXQgY29kZSBsaW5lXG4gICAgICovXG4gICAgc2V0Q29kZUxpbmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICBwcmV0dHlQcmludCgpO1xuICAgICAgICB2YXIgc291cmNlID0gdGhpcy4kY29kZS5maW5kKCcucHJldHR5cHJpbnQnKTtcbiAgICAgICAgdmFyIGkgPSAwO1xuICAgICAgICB2YXIgbGluZU51bWJlciA9IDA7XG4gICAgICAgIHZhciBsaW5lSWQ7XG4gICAgICAgIHZhciBsaW5lcztcbiAgICAgICAgdmFyIHRvdGFsTGluZXM7XG4gICAgICAgIHZhciBhbmNob3JIYXNoO1xuXG4gICAgICAgIGlmIChzb3VyY2UgJiYgc291cmNlWzBdKSB7XG4gICAgICAgICAgICBhbmNob3JIYXNoID0gZG9jdW1lbnQubG9jYXRpb24uaGFzaC5zdWJzdHJpbmcoMSk7XG4gICAgICAgICAgICBsaW5lcyA9IHNvdXJjZVswXS5nZXRFbGVtZW50c0J5VGFnTmFtZSgnbGknKTtcbiAgICAgICAgICAgIHRvdGFsTGluZXMgPSBsaW5lcy5sZW5ndGg7XG5cbiAgICAgICAgICAgIGZvciAoOyBpIDwgdG90YWxMaW5lczsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGluZU51bWJlcisrO1xuICAgICAgICAgICAgICAgIGxpbmVJZCA9ICdsaW5lJyArIGxpbmVOdW1iZXI7XG4gICAgICAgICAgICAgICAgbGluZXNbaV0uaWQgPSBsaW5lSWQ7XG4gICAgICAgICAgICAgICAgaWYgKGxpbmVJZCA9PT0gYW5jaG9ySGFzaCkge1xuICAgICAgICAgICAgICAgICAgICBsaW5lc1tpXS5jbGFzc05hbWUgKz0gJyBzZWxlY3RlZCc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoYW5nZSB0YWIgZm9yIHN0YXRlIGNoYW5nZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZSBBIHN0YXRlIHRvIGNoYWduZSB0YWJcbiAgICAgKi9cbiAgICBjaGFuZ2VUYWI6IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgICAgIGlmIChzdGF0ZSA9PT0gJ2luZm8nKSB7XG4gICAgICAgICAgICB0aGlzLl9lbmFibGVJbmZvKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9lbmFibGVDb2RlKCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQmUgZW5hYmxlIGluZm8gc3RhdGVcbiAgICAgKi9cbiAgICBfZW5hYmxlSW5mbzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc3RhdGUgPSAnaW5mbyc7ICAgICAgICBcbiAgICAgICAgdGhpcy4kaW5mby5zaG93KCk7XG4gICAgICAgIHRoaXMuJGNvZGUuaGlkZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBCZSBlbmFibGUgY29kZSBzdGF0ZVxuICAgICAqL1xuICAgIF9lbmFibGVDb2RlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zdGF0ZSA9ICdjb2RlJztcbiAgICAgICAgdGhpcy4kY29kZS5zaG93KCk7XG4gICAgICAgIHRoaXMuJGluZm8uaGlkZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBNb3ZlIHRvIG1vZXRob2QgYnkgaWRcbiAgICAgKi9cbiAgICBtb3ZlVG86IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgIGRvY3VtZW50LmxvY2F0aW9uID0gZG9jdW1lbnQuVVJMLnNwbGl0KCcjJylbMF0gKyBpZDsgXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoYW5nZSB0YWIgYW5kIG1vdmUgdG8gbGluZSAobnVtYmVyKVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBsaW5lIFRoZSBudW1iZXIgb2YgbGluZSB0byBtb3ZlXG4gICAgICovXG4gICAgbW92ZVRvTGluZTogZnVuY3Rpb24obGluZSkge1xuICAgICAgICB0aGlzLmNoYW5nZVRhYignY29kZScpO1xuICAgICAgICBkb2N1bWVudC5sb2NhdGlvbiA9IGRvY3VtZW50LlVSTC5zcGxpdCgnIycpWzBdICsgJyNsaW5lJyArIGxpbmU7IFxuICAgIH1cbn0pO1xuXG5uZS51dGlsLkN1c3RvbUV2ZW50cy5taXhpbihDb250ZW50KTtcbm1vZHVsZS5leHBvcnRzID0gQ29udGVudDtcbiIsInZhciBNZW51ID0gbmUudXRpbC5kZWZpbmVDbGFzcyh7XG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZVxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgICB0aGlzLiRtZW51ID0gb3B0aW9uLmVsZW1lbnQ7XG4gICAgICAgIHRoaXMuJHRhYiA9IG9wdGlvbi50YWI7XG4gICAgICAgIHRoaXMuY3VycmVudCA9ICdtYWluJztcbiAgICAgICAgdGhpcy5zdGF0ZSA9ICdpbmZvJztcbiAgICAgICAgdGhpcy5zZXRFdmVudCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgZXZlbnQgdG8gcGFnZSBtb3ZlXG4gICAgICovXG4gICAgc2V0RXZlbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLiRtZW51Lm9uKCdjbGljaycsIG5lLnV0aWwuYmluZCh0aGlzLm9uQ2xpY2tNZW51LCB0aGlzKSk7XG4gICAgICAgIHRoaXMuJHRhYi5vbignY2xpY2snLCBuZS51dGlsLmJpbmQodGhpcy5vbkNsaWNrVGFiLCB0aGlzKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRhYiBjaG5hZ2UgZXZlbnRcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZXZlbnQgVGhlIEpxdWVyeUV2ZW50IG9iamVjdFxuICAgICAqL1xuICAgIG9uQ2xpY2tUYWI6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIHZhciB0YXJnZXQgPSAkKGV2ZW50LnRhcmdldCk7XG4gICAgICAgIGlmICh0YXJnZXQuaGFzQ2xhc3MoJ3RhYm1lbnUnKVxuICAgICAgICAgICAmJiAhdGFyZ2V0Lmhhc0NsYXNzKCdvbicpKSB7XG4gICAgICAgICAgICB2YXIgaXNDb2RlID0gdGFyZ2V0Lmhhc0NsYXNzKCdjb2RlJyk7XG4gICAgICAgICAgICB0aGlzLmZpcmUoJ3RhYkNoYW5nZScsIHtcbiAgICAgICAgICAgICAgICBzdGF0ZTogaXNDb2RlID8gJ2NvZGUnIDogJ2luZm8nXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKGlzQ29kZSkge1xuICAgICAgICAgICAgICAgIHRoaXMudHVybk9uQ29kZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnR1cm5PbkluZm8oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGb2N1cyBtZW51XG4gICAgICovXG4gICAgZm9jdXM6IGZ1bmN0aW9uKHNwZWMsIGNvZGUpIHtcbiAgICAgICAgaWYgKCFzcGVjIHx8ICFjb2RlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLiRtZW51LmZpbmQoJy5saXN0aXRlbScpLmVhY2goZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBzZWxmID0gJCh0aGlzKTtcbiAgICAgICAgICAgIGlmIChzZWxmLmF0dHIoJ2RhdGEtc3BlYycpID09PSBzcGVjICYmIHNlbGYuYXR0cignZGF0YS1jb2RlJykpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmFkZENsYXNzKCdzZWxlY3RlZCcpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIHR1cm5PbkluZm86IGZ1bmN0aW9uKCkge1xuICAgICAgICAkKCcudGFibWVudScpLnJlbW92ZUNsYXNzKCdvbicpO1xuICAgICAgICB0aGlzLiR0YWIuZmluZCgnLmluZm8nKS5hZGRDbGFzcygnb24nKTtcbiAgICB9LFxuICAgIHR1cm5PbkNvZGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAkKCcudGFibWVudScpLnJlbW92ZUNsYXNzKCdvbicpO1xuICAgICAgICB0aGlzLiR0YWIuZmluZCgnLmNvZGUnKS5hZGRDbGFzcygnb24nKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTm90aWZ5IGZvciBjaGFuZ2UgY29udGVudFxuICAgICAqL1xuICAgIG9uQ2xpY2tNZW51OiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB2YXIgdGFyZ2V0ID0gJChldmVudC50YXJnZXQpLFxuICAgICAgICAgICAgaXNUdXRvcmlhbCA9IHRhcmdldC5oYXNDbGFzcygndHV0b3JpYWxMaW5rJyksXG4gICAgICAgICAgICBocmVmID0gdGFyZ2V0LmF0dHIoJ2hyZWYnKSxcbiAgICAgICAgICAgIHRhcmdldCA9IGhyZWYgPyB0YXJnZXQucGFyZW50KCkgOiB0YXJnZXQsXG4gICAgICAgICAgICBzcGVjID0gdGFyZ2V0LmF0dHIoJ2RhdGEtc3BlYycpLFxuICAgICAgICAgICAgY29kZSA9IHRhcmdldC5hdHRyKCdkYXRhLWNvZGUnKTtcblxuICAgICAgICBpZiAoaXNUdXRvcmlhbCkge1xuICAgICAgICAgICAgd2luZG93Lm9wZW4oaHJlZik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3BlYykge1xuICAgICAgICAgICAgdGhpcy5maXJlKCdub3RpZnknLCB7XG4gICAgICAgICAgICAgICAgbmFtZTogc3BlYyxcbiAgICAgICAgICAgICAgICBjb2RlTmFtZTogY29kZSxcbiAgICAgICAgICAgICAgICBocmVmOiBocmVmXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgIFxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgbWVudSBodG1sXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGh0bWwgQSBodG1sIHN0cmluZyB0byBzZXQgbWVudVxuICAgICAqL1xuICAgIHNldE1lbnU6IGZ1bmN0aW9uKGh0bWwpIHtcbiAgICAgICAgdGhpcy4kbWVudS5odG1sKGh0bWwpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZWxlY3QgbWVudSB3aXRoIHN0YXRlXG4gICAgICovXG4gICAgc2VsZWN0OiBmdW5jdGlvbihtZW51LCBzdGF0ZSkge1xuICAgICAgICB0aGlzLmN1cnJlbnQgPSBtZW51O1xuICAgICAgICB0aGlzLnN0YXRlID0gc3RhdGUgfHwgJ2luZm8nO1xuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICogT3BlbiBzZWxlY3RlZCBtZW51XG4gICAgICovIFxuICAgIG9wZW46IGZ1bmN0aW9uKG1lbnUpIHtcbiAgICAgICAgdGhpcy4kbWVudS5maW5kKCcuJyArIG1lbnUpLmFkZENsYXNzKCd1bmZvbGQnKTsgXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCB0YWIgbWVudSBodG1sXG4gICAgICovXG4gICAgc2V0VGFiOiBmdW5jdGlvbihodG1sKSB7XG4gICAgICAgIHRoaXMuJHRhYi5odG1sKGh0bWwpO1xuICAgIH0sIFxuICAgIFxuICAgIC8qKlxuICAgICAqIE9uIHNlbGVjdGVkIHRhYlxuICAgICAqL1xuICAgIHRhYk9uOiBmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgICB0aGlzLiR0YWIucmVtb3ZlQ2xhc3MoKTtcbiAgICAgICAgIHRoaXMuJHRhYi5hZGRDbGFzcygndGFiIHRhYi0nICsgbmFtZSk7XG4gICAgfVxufSk7XG5cbm5lLnV0aWwuQ3VzdG9tRXZlbnRzLm1peGluKE1lbnUpO1xubW9kdWxlLmV4cG9ydHMgPSBNZW51O1xuIiwidmFyIFNlYXJjaCA9IG5lLnV0aWwuZGVmaW5lQ2xhc3Moe1xuXG4gICAga2V5VXA6IDM4LFxuICAgIGtleURvd246IDQwLFxuICAgIGVudGVyOiAxMyxcblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb24sIGFwcCkge1xuICAgICAgICB0aGlzLiRlbCA9IG9wdGlvbi5lbGVtZW50O1xuICAgICAgICB0aGlzLiRpbnB1dCA9IHRoaXMuJGVsLmZpbmQoJ2lucHV0Jyk7XG4gICAgICAgIHRoaXMuJGxpc3QgPSB0aGlzLiRlbC5maW5kKCcuc2VhcmNoTGlzdCcpO1xuICAgICAgICB0aGlzLiRsaXN0LmhpZGUoKTtcbiAgICAgICAgdGhpcy5yb290ID0gYXBwO1xuICAgICAgICB0aGlzLl9hZGRFdmVudCgpO1xuICAgICAgICB0aGlzLmluZGV4ID0gbnVsbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIEV2ZW50c1xuICAgICAqL1xuICAgIF9hZGRFdmVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuJGlucHV0Lm9uKCdrZXl1cCcsIG5lLnV0aWwuYmluZChmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgaWYoZXZlbnQua2V5Q29kZSA9PT0gdGhpcy5rZXlVcCB8fCBldmVudC5rZXlDb2RlID09PSB0aGlzLmtleURvd24gfHwgZXZlbnQua2V5Q29kZSA9PT0gdGhpcy5lbnRlcikge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLiRsaXN0LmNzcygnZGlzcGxheScpICE9PSAnbm9uZScpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IHRoaXMuZW50ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoYXQgaXMgbm8gd2F5LCB0aGlzLmZpbmQoZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzZWxlY3RlZCA9IHRoaXMuJGxpc3QuZmluZCgnbGkub24nKSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3QgPSB0aGlzLiRsaXN0LmZpbmQoJ2xpJykuZXEoMCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlcnk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWQubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vblN1Ym1pdCh7IHRhcmdldDogc2VsZWN0ZWRbMF0gfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGZpcnN0Lmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25TdWJtaXQoeyB0YXJnZXQ6IGZpcnN0WzBdfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdEl0ZW0oZXZlbnQua2V5Q29kZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZmluZChldmVudC50YXJnZXQudmFsdWUpOyBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcykpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZWxlY3QgaXRlbSBieSBrZXlib2FyZFxuICAgICAqL1xuICAgIHNlbGVjdEl0ZW06IGZ1bmN0aW9uKGNvZGUpIHtcbiAgICAgICAgdGhpcy4kbGlzdC5maW5kKCdsaScpLnJlbW92ZUNsYXNzKCdvbicpO1xuICAgICAgICB2YXIgbGVuID0gdGhpcy4kbGlzdC5maW5kKCdsaScpLmxlbmd0aDtcbiAgICAgICAgaWYgKCFuZS51dGlsLmlzTnVtYmVyKHRoaXMuaW5kZXgpKSB7XG4gICAgICAgICAgICB0aGlzLmluZGV4ID0gMDtcbiAgICAgICAgfSAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoY29kZSA9PT0gdGhpcy5rZXlVcCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaW5kZXggPSAodGhpcy5pbmRleCAtIDEgKyBsZW4pICUgbGVuO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmluZGV4ID0gKHRoaXMuaW5kZXggKyAxKSAlIGxlbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLiRsaXN0LmZpbmQoJ2xpJykuZXEodGhpcy5pbmRleCkuYWRkQ2xhc3MoJ29uJyk7XG4gICAgICAgIHRoaXMuJGlucHV0LnZhbCh0aGlzLiRsaXN0LmZpbmQoJ2xpLm9uJykuZmluZCgnYScpLnRleHQoKSk7XG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiBSZXNldCBzZWFyY2hcbiAgICAgKi8gXG4gICAgcmVzZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLiRpbnB1dC52YWwoJycpO1xuICAgICAgICB0aGlzLiRsaXN0LmZpbmQoJ2xpJykub2ZmKCdjbGljaycpO1xuICAgICAgICB0aGlzLiRsaXN0LmVtcHR5KCk7XG4gICAgICAgIHRoaXMuJGxpc3QuaGlkZSgpO1xuICAgICAgICB0aGlzLmluZGV4ID0gbnVsbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU3VibWl0IGZvciBjaGFuZ2UgYnkgc2VhcmNoIHJlc3VsdCBsaXN0XG4gICAgICovIFxuICAgIG9uU3VibWl0OiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICB2YXIgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0LFxuICAgICAgICAgICAgaHJlZixcbiAgICAgICAgICAgIHNwZWMsIFxuICAgICAgICAgICAgY29kZTtcbiAgICAgICAgdGFyZ2V0ID0gdGhpcy5nZXRUYXJnZXQodGFyZ2V0KTtcbiAgICAgICAgaHJlZiA9IHRhcmdldC5maW5kKCdhJykuYXR0cignaHJlZicpO1xuICAgICAgICBzcGVjID0gdGFyZ2V0LmZpbmQoJ3NwYW4nKS5hdHRyKCdkYXRhLXNwZWMnKTtcbiAgICAgICAgY29kZSA9IHRhcmdldC5maW5kKCdzcGFuJykuYXR0cignZGF0YS1jb2RlJyk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmZpcmUoJ25vdGlmeScsIHtcbiAgICAgICAgICAgICBjb2RlTmFtZTogY29kZSxcbiAgICAgICAgICAgICBuYW1lOiBzcGVjLFxuICAgICAgICAgICAgIGhyZWY6IGhyZWZcbiAgICAgICAgfSk7XG4gICAgfSwgXG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGFyZ2V0XG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRhcmdldCBUaGUgdGFyZ2V0IHRoYXQgaGF2ZSB0byBleHRyYWN0XG4gICAgICovXG4gICAgZ2V0VGFyZ2V0OiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgICAgdmFyIHRhZ05hbWUgPSB0YXJnZXQudGFnTmFtZS50b1VwcGVyQ2FzZSgpLFxuICAgICAgICAgICAgJHRhcmdldCA9ICQodGFyZ2V0KTtcbiAgICAgICAgaWYgKHRhZ05hbWUgIT09ICdMSScpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldFRhcmdldCgkdGFyZ2V0LnBhcmVudCgpWzBdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAkdGFyZ2V0O1xuICAgICAgICB9XG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiBGaW5kIHdvcmQgYnkgaW5wdXQgdGV4dFxuICAgICAqL1xuICAgIGZpbmQ6IGZ1bmN0aW9uKHRleHQpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB0aGlzLiRsaXN0LmhpZGUoKTtcbiAgICAgICAgdGhpcy5maXJlKCdzZWFyY2gnLCB7IFxuICAgICAgICAgICAgdGV4dDogdGV4dCxcbiAgICAgICAgICAgIGNhbGxiYWNrOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgc2VsZi51cGRhdGUoZGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgc2VhcmNoIGxpc3RcbiAgICAgKi9cbiAgICB1cGRhdGU6IGZ1bmN0aW9uKGxpc3QpIHtcbiAgICAgICAgdmFyIHN0ciA9ICcnOyBcbiAgICAgICAgbmUudXRpbC5mb3JFYWNoKGxpc3QsIGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgICAgICBzdHIgKz0gJzxsaT48c3BhbiBkYXRhLXNwZWM9XCInICsgZWwuZ3JvdXAgKyAnXCIgZGF0YS1jb2RlPVwiJyArIGVsLmNvZGUgKyAnXCI+PGEgaHJlZj1cIiMnICsgZWwuaWQgKyAnXCI+JyArIGVsLmxhYmVsLnJlcGxhY2UoJy4nLCAnJykgKyAnPC9hPjxzcGFuIGNsYXNzPVwiZ3JvdXBcIj4nICsgZWwuZ3JvdXAgKyAnPC9zcGFuPjwvc3Bhbj48L2xpPic7IFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy4kbGlzdC5odG1sKHN0cik7XG4gICAgICAgIGlmIChzdHIpIHtcbiAgICAgICAgICAgIHRoaXMuJGxpc3Quc2hvdygpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuJGxpc3QuZmluZCgnbGknKS5vbignY2xpY2snLCBuZS51dGlsLmJpbmQodGhpcy5vblN1Ym1pdCwgdGhpcykpOyBcbiAgICB9XG59KTtcblxubmUudXRpbC5DdXN0b21FdmVudHMubWl4aW4oU2VhcmNoKTtcbm1vZHVsZS5leHBvcnRzID0gU2VhcmNoO1xuIl19
