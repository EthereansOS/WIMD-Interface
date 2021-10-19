var ReactModuleManager = function() {
    var createElementInternal = function(data) {
        if (window.controllerPool === undefined) {
            window.controllerPool = {}
        }

        var viewName = data.viewName
        var createNew = data.createNew
        var callerArguments = data.arguments

        window.loadedModules = window.loadedModules || {}
        createNew === true && delete window.loadedModules[viewName]

        var elementName = undefined
        var reactClass = typeof viewName !== 'string' ? viewName : window[viewName] !== undefined ? window[viewName] : undefined

        if (reactClass && reactClass.prototype && reactClass.prototype.constructor.displayName) {
            elementName = reactClass.prototype.constructor.displayName
            if (reactClass.prototype.oldRender === undefined) {
                var requireCalled = true;
                if(reactClass.prototype.requiredModules || reactClass.prototype.requiredScripts) {
                    requireCalled = false;
                }
                reactClass.prototype.oldRender = reactClass.prototype.render
                reactClass.prototype.render = function render() {

                    this.oldRender.instance = this;

                    var viewName = this.constructor.displayName
                    if (this.props.newController === true) {
                        delete window.controllerPool[elementName]
                    }
                    if (window[viewName + 'Controller'] !== undefined && this.controller === undefined) {
                        if (window.controllerPool[viewName] === undefined || window.controllerPool[viewName] === null) {
                            window.controllerPool[viewName] = new window[viewName + 'Controller'](this)
                        }
                        this.controller = window.controllerPool[viewName]
                        this.controller.view = this
                    }
                    var rendered = null;
                    var loader = true;
                    if(requireCalled !== false) {
                        this.useStateCounter = 0;
                        this.useEffectCounter = 0;
                        this.useEffectCallbacks = [];
                        this.rendering = true;
                        loader = false;
                        try {
                            rendered = this.oldRender.apply(this);
                            this.useEffectCallbacks.forEach(it => setTimeout(it));
                            this.firstUseEffectDone = true;
                        } catch(e) {
                            delete this.useEffectCallbacks;
                            if(requireCalled === "true") {
                                console.error(e);
                                rendered = this.componentDidCatch.apply(this, [e]) || React.createElement('span', {});
                            } else {
                                loader = true;
                                requireCalled = false;
                            }
                        }
                        delete this.rendering;
                    }
                    if(requireCalled === false) {
                        if(this.getCustomLoader) {
                            rendered = this.getCustomLoader();
                        } else if(React.globalLoader) {
                            rendered = React.globalLoader();
                        } else {
                            rendered = React.defaultLoader();
                        }
                        try {
                            if(rendered.type.displayName) {
                                var props = {};
                                rendered.props && Object.keys(rendered.props).map(key => props[key] = rendered.props[key]);
                                var children = props.children;
                                delete props.children;
                                rendered = ReactModuleManager.createElementNew(rendered.type.displayName, props, children);
                            }
                        } catch(e) {
                        }
                        ReactModuleLoader.load({
                            modules: this.requiredModules,
                            scripts: this.requiredScripts,
                            callback: function() {
                              Object.keys(window).filter(key => key.indexOf('_') === 0 && window[key.substring(1)] && window[key] && !window[key].default).forEach(key => (window[key] = window[key] || {}).default = window[key.substring(1)]);
                              requireCalled = 'true';
                              var _this = this;
                              this.forceUpdate(function() {
                                requireCalled = true;
                                _this.extensionsLoaded && _this.extensionsLoaded.apply(_this);
                                _this.componentDidMount && _this.componentDidMount.apply(_this);
                              });
                            }.bind(this)
                        });
                    }

                    this.oldRef = rendered.ref && rendered.ref.name.indexOf("generatedRef") === -1 ? rendered.ref : null;

                    rendered.ref = function generatedRef(ref) {
                        this.domRoot = ref;
                        ref && ref.domRoot && (this.domRoot = ref.domRoot);
                        this.domRoot && this.domRoot instanceof HTMLElement && (this.domRoot.reactInstance = this);
                        this.domRoot && this.domRoot instanceof HTMLElement  && this.parentClass && this.domRoot.parentElement && (this.domRoot.parentElement.className = this.parentClass);
                        if (this.oldRef !== undefined && this.oldRef !== null) {
                            this.oldRef.apply(this, [ref]);
                        }
                    }.bind(this)

                    var lowerCaseViewName = viewName.substring(0, 1).toLowerCase() + viewName.substring(1);
                    if (rendered.props === undefined || rendered.props === null) {
                        rendered.props = {};
                    }
                    rendered.props.className = (loader ? rendered.props.defaultClassName : rendered.props.className) || '';
                    if(rendered.props.className !== undefined && rendered.props.className !== null && !rendered.props.className.containsAloneWord(lowerCaseViewName)) {
                        if(rendered.props.className !== '') {
                            lowerCaseViewName += ' '
                        }
                        rendered.props.className = lowerCaseViewName + rendered.props.className;
                    }
                    return rendered
                }
            }

            reactClass.prototype.useState = reactClass.prototype.useState || function useState(initialValue, varName) {
                if(!this.rendering) {
                    throw "Cannot call useState while not rendering";
                }
                this.useStateVars = this.useStateVars || [];
                if(this.useStateVars.length <= this.useStateCounter) {
                    var index = this.useStateCounter;
                    var _this = this;
                    if(!varName) {
                        varName = " = _window$useState" + (index === 0 ? '' : index + 1) + "[0]";
                        varName = this.oldRender.toString().split(varName)[0];
                        varName = varName.substring(varName.lastIndexOf(" ") + 1);
                    }
                    this.useStateVars.push([initialValue, function setUseStateVarValue(newValue) {
                        _this.setUseStateVarValue(index, newValue);
                    }, varName]);
                }
                return this.useStateVars[this.useStateCounter++];
            };

            reactClass.prototype.getStateVar = reactClass.prototype.getStateVar || function getStateVar(varName) {
                return this.useStateVars.filter(it => it[2] === varName)[0][0];
            };

            reactClass.prototype.setStateVar = reactClass.prototype.setStateVar || function setStateVar(varName, varValue) {
                return this.useStateVars.filter(it => it[2] === varName)[0][1](varValue);
            };

            reactClass.prototype.setUseStateVarValue = reactClass.prototype.setUseStateVarValue || function setUseStateVarValue(varIndex, varValue) {
                var _this = this;
                _this.setUseStateVarValuesTimeout && clearTimeout(_this.setUseStateVarValuesTimeout);
                (_this.useStateVarNewValues = _this.useStateVarNewValues || {})[varIndex] = varValue;
                _this.setUseStateVarValuesTimeout = setTimeout(function() {
                    var newState = _this.useStateVarNewValues;
                    delete _this.useStateVarNewValues;
                    Object.entries(newState).forEach(it => _this.useStateVars[it[0]][0] = it[1]);
                    _this.forceUpdate();
                }, 10);
            };

            reactClass.prototype.useEffect = reactClass.prototype.useEffect || function useEffect(callback, vars) {
                if(!this.rendering) {
                    throw "Cannot call useEffect while not rendering";
                }
                var _this = this;
                callback = callback.bind(this);
                var currentIndex = _this.useEffectCounter++;
                if(!vars || (vars.length === 0 && !_this.firstUseEffectDone)) {
                    _this.useEffectCallbacks.push(callback);
                    return;
                }
                if(vars.length === 0) {
                    return;
                }
                _this.useEffectState = _this.useEffectState || {};
                var oldVars = _this.useEffectState[currentIndex] || vars;
                _this.useEffectState[currentIndex] = vars;
                for(var i in vars) {
                    if(!_this.firstUseEffectDone || oldVars[i] != vars[i]) {
                        _this.useEffectCallbacks.push(callback);
                        return;
                    }
                }
            };

            if (reactClass.prototype._internalDomRefresh === undefined) {
                reactClass.prototype._internalDomRefresh = function _internalDomRefresh() {
                    if (this.domRoot !== undefined && this.domRoot !== null && this.domRoot.length > 0) {
                        React.domRefresh && React.domRefresh(this.domRoot)
                    }
                }
            }

            if (reactClass.prototype.oldComponentDidUpdate === undefined) {
                reactClass.prototype.oldComponentDidUpdate = reactClass.prototype.componentDidUpdate
                reactClass.prototype.componentDidUpdate = function componentDidUpdate() {
                    if(requireCalled !== true) {
                        return;
                    }
                    this._internalDomRefresh.apply(this);
                    if (this.oldComponentDidUpdate !== undefined && this.oldComponentDidUpdate !== null) {
                        this.oldComponentDidUpdate.apply(this);
                    }
                }
            }

            if (reactClass.prototype.oldComponentDidMount === undefined) {
                reactClass.prototype.oldComponentDidMount = reactClass.prototype.componentDidMount
                reactClass.prototype.componentDidMount = function componentDidMount() {
                    this.mounted = true;
                    if(requireCalled === false) {
                        return;
                    }
                    this.__defineGetter__('parentComponent', function parentComponent() {
                        return this.domRoot && this.domRoot.parentElement.reactComponent;
                    });
                    if(this.subscribe) {
                        var defaultSubscriptions = (this.getDefaultSubscriptions && this.getDefaultSubscriptions.apply(this)) || null;
                        var _this = this;
                        if(defaultSubscriptions) {
                            Object.keys(defaultSubscriptions).map(function(it) {
                                _this.subscribe(it, defaultSubscriptions[it]);
                            });
                        }
                    }
                    this._internalDomRefresh.apply(this);
                    if (this.oldComponentDidMount !== undefined && this.oldComponentDidMount !== null) {
                        this.oldComponentDidMount.apply(this);
                    }
                }
            }
            if (reactClass.prototype.enqueue === undefined) {
                reactClass.prototype.enqueue = function enqueue(func, timeout) {
                    var _this = this;
                    return setTimeout(function() {
                        func.apply(_this)
                    }, timeout || 250)
                }
            }
            if (reactClass.prototype.dequeue === undefined) {
                reactClass.prototype.dequeue = function dequeue(queueElementId) {
                    cancelTimeout(queueElementId);
                }
            }
            if (reactClass.prototype.oldComponentWillUnmount === undefined) {
                reactClass.prototype.oldComponentWillUnmount = reactClass.prototype.componentWillUnmount
                reactClass.prototype.componentWillUnmount = function componentWillUnmount() {
                    this.unsubscribeAll();
                    if (this.oldComponentWillUnmount !== undefined && this.oldComponentWillUnmount !== null) {
                        this.oldComponentWillUnmount.apply(this);
                    }
                    delete this.mounted;
                }
            }
            if (reactClass.prototype.subscribe === undefined) {
                reactClass.prototype.subscribe = function subscribe(eventAddress, func) {
                    if (this.events === undefined || this.events === null) {
                        this.events = {}
                    }
                    if (this.events[eventAddress]) {
                        return;
                    }
                    var _this = this;
                    window.subscribe(eventAddress, this.events[eventAddress] = function callback() {
                        func.apply(_this, arguments)
                    })
                }
            }
            if (reactClass.prototype.unsubscribe === undefined) {
                reactClass.prototype.unsubscribe = function unsubscribe(eventAddress) {
                    if (this.events === undefined || this.events === null || !this.events[eventAddress]) {
                        return
                    }
                    window.unsubscribe(eventAddress, this.events[eventAddress])
                    delete this.events[eventAddress]
                }
            }
            if (reactClass.prototype.unsubscribeAll === undefined) {
                reactClass.prototype.unsubscribeAll = function unsubscribeAll() {
                    if (this.events === undefined || this.events === null) {
                        return
                    }
                    for (var i in this.events) {
                        window.unsubscribe(i, this.events[i])
                    }
                    delete this.events
                }
            }
            if (reactClass.prototype.emit === undefined) {
                reactClass.prototype.emit = function emit() {
                    var args = [];
                    for(var i = 1; i < arguments.length; i++) {
                        args.push(arguments[i]);
                    }
                    window.publish(arguments[0], ...args);
                }
            }
            if (reactClass.prototype.componentDidCatch === undefined) {
                reactClass.prototype.componentDidCatch = function componentDidCatch(error, info) {
                    var root = (this.domRoot && this.domRoot.reactRoot) || document.body;
                    try {
                        ReactDOM.unmountComponentAtNode(root);
                    } catch(e) {
                    }
                    try {
                        ReactDOM.render((React.globalCatcher || React.defaultCatcher)(error, info), root);
                    } catch(e) {
                    }
                }
            }
        }

        var element;
        var involveLoadedModules = true

        if (typeof viewName === 'symbol' || typeof viewName !== 'string' || !window[viewName]) {
            element = React.createElement2.apply(React, callerArguments)
            involveLoadedModules = typeof viewName !== 'string'
            if (elementName !== undefined) {
                viewName = elementName
            }
        } else if (window.loadedModules[viewName] !== undefined) {
            element = window.loadedModules[viewName]
        } else {
            callerArguments[0] = window[viewName];
            element = React.createElement2.apply(React, callerArguments)
        }

        if (involveLoadedModules === true && window.loadedModules[viewName] === undefined) {
            window.loadedModules[viewName] = element
        }

        (typeof viewName).toLowerCase() === 'string' && (window['_' + viewName] = { default : window[viewName] });

        return element
    }
    return {
        createElement(viewName) {
            return createElementInternal({
                viewName,
                arguments: arguments
            })
        },
        createElementNew(viewName) {
            return createElementInternal({
                viewName,
                createNew: true,
                arguments: arguments
            })
        }
    }
}();
!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e(require("react")):"function"==typeof define&&define.amd?define(["react"],e):"object"==typeof exports?exports.createReactClass=e(require("react")):t.createReactClass=e(t.React)}(this,function(t){return function(t){function e(o){if(n[o])return n[o].exports;var r=n[o]={i:o,l:!1,exports:{}};return t[o].call(r.exports,r,r.exports,e),r.l=!0,r.exports}var n={};return e.m=t,e.c=n,e.i=function(t){return t},e.d=function(t,n,o){e.o(t,n)||Object.defineProperty(t,n,{configurable:!1,enumerable:!0,get:o})},e.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(n,"a",n),n},e.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},e.p="",e(e.s=2)}([function(t,e,n){"use strict";function o(t){return t}function r(t,e,n){function r(t,e){var n=g.hasOwnProperty(e)?g[e]:null;_.hasOwnProperty(e)&&s("OVERRIDE_BASE"===n,"ReactClassInterface: You are attempting to override `%s` from your class specification. Ensure that your method names do not overlap with React methods.",e),t&&s("DEFINE_MANY"===n||"DEFINE_MANY_MERGED"===n,"ReactClassInterface: You are attempting to define `%s` on your component more than once. This conflict may be due to a mixin.",e)}function u(t,n){if(n){s("function"!=typeof n,"ReactClass: You're attempting to use a component class or function as a mixin. Instead, just use a regular object."),s(!e(n),"ReactClass: You're attempting to use a component as a mixin. Instead, just use a regular object.");var o=t.prototype,i=o.__reactAutoBindPairs;n.hasOwnProperty(c)&&N.mixins(t,n.mixins);for(var a in n)if(n.hasOwnProperty(a)&&a!==c){var u=n[a],p=o.hasOwnProperty(a);if(r(p,a),N.hasOwnProperty(a))N[a](t,u);else{var f=g.hasOwnProperty(a),m="function"==typeof u,h=m&&!f&&!p&&!1!==n.autobind;if(h)i.push(a,u),o[a]=u;else if(p){var y=g[a];s(f&&("DEFINE_MANY_MERGED"===y||"DEFINE_MANY"===y),"ReactClass: Unexpected spec policy %s for key %s when mixing in component specs.",y,a),"DEFINE_MANY_MERGED"===y?o[a]=l(o[a],u):"DEFINE_MANY"===y&&(o[a]=d(o[a],u))}else o[a]=u}}}else;}function p(t,e){if(e)for(var n in e){var o=e[n];if(e.hasOwnProperty(n)){var r=n in N;s(!r,'ReactClass: You are attempting to define a reserved property, `%s`, that shouldn\'t be on the "statics" key. Define it as an instance property instead; it will still be accessible on the constructor.',n);var i=n in t;s(!i,"ReactClass: You are attempting to define `%s` on your component more than once. This conflict may be due to a mixin.",n),t[n]=o}}}function f(t,e){s(t&&e&&"object"==typeof t&&"object"==typeof e,"mergeIntoWithNoDuplicateKeys(): Cannot merge non-objects.");for(var n in e)e.hasOwnProperty(n)&&(s(void 0===t[n],"mergeIntoWithNoDuplicateKeys(): Tried to merge two objects with the same key: `%s`. This conflict may be due to a mixin; in particular, this may be caused by two getInitialState() or getDefaultProps() methods returning objects with clashing keys.",n),t[n]=e[n]);return t}function l(t,e){return function(){var n=t.apply(this,arguments),o=e.apply(this,arguments);if(null==n)return o;if(null==o)return n;var r={};return f(r,n),f(r,o),r}}function d(t,e){return function(){t.apply(this,arguments),e.apply(this,arguments)}}function m(t,e){var n=e.bind(t);return n}function h(t){for(var e=t.__reactAutoBindPairs,n=0;n<e.length;n+=2){var o=e[n],r=e[n+1];t[o]=m(t,r)}}function y(t){var e=o(function(t,o,r){this.__reactAutoBindPairs.length&&h(this),this.props=t,this.context=o,this.refs=a,this.updater=r||n,this.state=null;var i=this.getInitialState?this.getInitialState():null;s("object"==typeof i&&!Array.isArray(i),"%s.getInitialState(): must return an object or null",e.displayName||"ReactCompositeComponent"),this.state=i});e.prototype=new D,e.prototype.constructor=e,e.prototype.__reactAutoBindPairs=[],E.forEach(u.bind(null,e)),u(e,b),u(e,t),u(e,v),e.getDefaultProps&&(e.defaultProps=e.getDefaultProps()),s(e.prototype.render,"createClass(...): Class specification must implement a `render` method.");for(var r in g)e.prototype[r]||(e.prototype[r]=null);return e}var E=[],g={mixins:"DEFINE_MANY",statics:"DEFINE_MANY",propTypes:"DEFINE_MANY",contextTypes:"DEFINE_MANY",childContextTypes:"DEFINE_MANY",getDefaultProps:"DEFINE_MANY_MERGED",getInitialState:"DEFINE_MANY_MERGED",getChildContext:"DEFINE_MANY_MERGED",render:"DEFINE_ONCE",componentWillMount:"DEFINE_MANY",componentDidMount:"DEFINE_MANY",componentWillReceiveProps:"DEFINE_MANY",shouldComponentUpdate:"DEFINE_ONCE",componentWillUpdate:"DEFINE_MANY",componentDidUpdate:"DEFINE_MANY",componentWillUnmount:"DEFINE_MANY",updateComponent:"OVERRIDE_BASE"},N={displayName:function(t,e){t.displayName=e},mixins:function(t,e){if(e)for(var n=0;n<e.length;n++)u(t,e[n])},childContextTypes:function(t,e){t.childContextTypes=i({},t.childContextTypes,e)},contextTypes:function(t,e){t.contextTypes=i({},t.contextTypes,e)},getDefaultProps:function(t,e){t.getDefaultProps?t.getDefaultProps=l(t.getDefaultProps,e):t.getDefaultProps=e},propTypes:function(t,e){t.propTypes=i({},t.propTypes,e)},statics:function(t,e){p(t,e)},autobind:function(){}},b={componentDidMount:function(){this.__isMounted=!0}},v={componentWillUnmount:function(){this.__isMounted=!1}},_={replaceState:function(t,e){this.updater.enqueueReplaceState(this,t,e)},isMounted:function(){return!!this.__isMounted}},D=function(){};return i(D.prototype,t.prototype,_),y}var i=n(5),a=n(3),s=n(4),c="mixins";t.exports=r},function(e,n){e.exports=t},function(t,e,n){"use strict";var o=n(1),r=n(0);if(void 0===o)throw Error("create-react-class could not find the React object. If you are using script tags, make sure that React is being loaded before create-react-class.");var i=(new o.Component).updater;t.exports=r(o.Component,o.isValidElement,i)},function(t,e,n){"use strict";var o={};t.exports=o},function(t,e,n){"use strict";function o(t,e,n,o,i,a,s,c){if(r(e),!t){var u;if(void 0===e)u=new Error("Minified exception occurred; use the non-minified dev environment for the full error message and additional helpful warnings.");else{var p=[n,o,i,a,s,c],f=0;u=new Error(e.replace(/%s/g,function(){return p[f++]})),u.name="Invariant Violation"}throw u.framesToPop=1,u}}var r=function(t){};t.exports=o},function(t,e,n){"use strict";function o(t){if(null===t||void 0===t)throw new TypeError("Object.assign cannot be called with null or undefined");return Object(t)}var r=Object.getOwnPropertySymbols,i=Object.prototype.hasOwnProperty,a=Object.prototype.propertyIsEnumerable;t.exports=function(){try{if(!Object.assign)return!1;var t=new String("abc");if(t[5]="de","5"===Object.getOwnPropertyNames(t)[0])return!1;for(var e={},n=0;n<10;n++)e["_"+String.fromCharCode(n)]=n;if("0123456789"!==Object.getOwnPropertyNames(e).map(function(t){return e[t]}).join(""))return!1;var o={};return"abcdefghijklmnopqrst".split("").forEach(function(t){o[t]=t}),"abcdefghijklmnopqrst"===Object.keys(Object.assign({},o)).join("")}catch(t){return!1}}()?Object.assign:function(t,e){for(var n,s,c=o(t),u=1;u<arguments.length;u++){n=Object(arguments[u]);for(var p in n)i.call(n,p)&&(c[p]=n[p]);if(r){s=r(n);for(var f=0;f<s.length;f++)a.call(n,s[f])&&(c[s[f]]=n[s[f]])}}return c}}])});
HTMLElement.prototype.__defineGetter__('reactComponent', function reactComponent() { var elem = this; while (elem) { if (elem.reactInstance) { return elem.reactInstance; }elem = elem.parentNode; } });
HTMLElement.prototype.__defineGetter__('reactRoot', function reactRoot() { var elem = this; while (elem) { if (!elem.reactComponent || elem._reactRootContainer) { return elem; }elem = elem.parentNode; } });
HTMLElement.prototype.__defineGetter__('isReactRoot', function isReactRoot() { return this._reactRootContainer || (!this.reactInstance && this.childNodes.length === 1 && this.childNodes[0].reactInstance) });
window.getReactRoots = window.getReactRoots || function getReactRoots() {
    var results = [];
    document.body.isReactRoot && results.push(document.body);
    var query = document.evaluate("//body/*", document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (var i = 0; i < query.snapshotLength; i++) {
        var root = query.snapshotItem(i).reactRoot;
        root && root.isReactRoot && results.indexOf(root) === -1 && results.push(root);
    }
    return results;
};
window.getReactRootInstances = window.getReactRootInstances || function getReactRootInstances() {
    return window.getReactRoots().map(it => it.childNodes[0].reactInstance || it._reactRootContainer._internalRoot.current.child.stateNode);
};
window.refreshReactRootInstances = window.refreshReactRootInstances || function refreshReactRootInstances() {
    var reactInstances = window.getReactRootInstances();
    for(var reactInstance of reactInstances) {
        delete reactInstance.controller;
        Object.entries(React.createElement(window[reactInstance.__proto__.constructor.displayName]).type.prototype).forEach(it => reactInstance[it[0]] = it[1]);
        reactInstance.forceUpdate();
    }
};

window.publish = window.publish || function publish(eventName) {
    window.subscribers = window.subscribers || {};
    if (!window.subscribers[eventName] || window.subscribers[eventName].length === 0) {
        return;
    }
    var args = [];
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
    }
    var call = function call(c) {
        c && setTimeout(() => c.apply(window, args));
    };
    window.subscribers[eventName].forEach(call);
};

window.subscribe = window.subscribe || function subscribe(eventName, callback) {
    window.subscribers = window.subscribers || {};
    window.subscribers[eventName] = window.subscribers[eventName] || [];
    for (var i = 0; i < window.subscribers[eventName].length; i++) {
        if (callback === window.subscribers[eventName][i]) {
            return;
        }
    }
    window.subscribers[eventName].push(callback);
};

window.unsubscribe = window.unsubscribe || function unsubscribe(eventName, callback) {
    if (!eventName || !callback || !window.subscribers || !window.subscribers[eventName] || window.subscribers[eventName].length === 0) {
        return;
    }
    for (var i = 0; i < window.subscribers[eventName].length; i++) {
        if (callback === window.subscribers[eventName][i]) {
            window.subscribers[eventName].splice(i, 1);
            break;
        }
    }
    window.subscribers[eventName].length === 0 && delete window.subscribers[eventName];
};
React.defaultLoader = function() {
    return React.createElement('span', {}, 'Loading...');
};
React.defaultCatcher = function(e) {
    return React.createElement('h1', {}, 'An error occurred during rendering: "' + (e.message || e) + '".\nPlease try refresh the page.');
};
Object.keys = Object.keys || (function() {
    'use strict';
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({
            toString: null
        }).propertyIsEnumerable('toString'),
        dontEnums = ['toString',
            'toLocaleString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf',
            'propertyIsEnumerable', 'constructor'
        ],
        dontEnumsLength = dontEnums.length;

    return function(obj) {
        if (typeof obj !== 'object' &&
            (typeof obj !== 'function' || obj === null)) {
            throw new TypeError('Object.keys called on non-object');
        }

        var result = [],
            prop, i;

        for (prop in obj) {
            if (hasOwnProperty.call(obj, prop)) {
                result.push(prop);
            }
        }

        if (hasDontEnumBug) {
            for (i = 0; i < dontEnumsLength; i++) {
                if (hasOwnProperty.call(obj, dontEnums[i])) {
                    result.push(dontEnums[i]);
                }
            }
        }
        return result;
    };
}());
String.prototype.containsAloneWord = String.prototype.containsAloneWord || function(searchText) {
    return new RegExp("( |\n|\t|^)" + searchText + "( |\n|\t|$)", "i").test(this)
};
window.useState = function useState() {
    var context = React;
    var args = [...arguments];
    if(args[0]?.rendering) {
        context = args[0];
    }
    args.shift();
    return context.useState.apply(context, args);
}
window.useEffect = function useEffect() {
    var context = React;
    var args = [...arguments];
    if(args[0]?.rendering) {
        context = args[0];
    }
    args.shift();
    return context.useEffect.apply(context, args);
}
window.Fragment = React.Fragment;
React.createElement2 = React.createElement;
React.createElement = ReactModuleManager.createElement
createReactClass && (React.createClass = createReactClass)