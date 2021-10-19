window.Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"\n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}
var ReactModuleLoader = function() {

    var useStrictRegex = /^( |\n|\t)*("|')( |\n|\t)*use( |\n|\t)*strict("|')( |\n|\t)*;/gim

    var retrieveInstance = function retrieveInstance(transform) {
        var code = transform.code.replace(useStrictRegex, "").trim();
        if(code.indexOf('var ') === 0) {
            code = code.substring(code.indexOf('=') + 1);
        }
        transform.cleanedCode = '"use strict";\n return ' + code.trim();
        return Function(transform.cleanedCode)();
    };

    var transform = function transform(code, location) {
        var transform = Babel.transform(code.split('<>').join('<React.Fragment>').split('</>').join('</React.Fragment>').split('this.useState').join('window.useState').split('React.useState').join('window.useState').replaceAll(/(^|( )+)useState/g, " window.useState").split('window.useState(').join('window.useState(this, ').split('this.useEffect').join('window.useEffect').split('React.useEffect').join('window.useEffect').replaceAll(/(^|( )+)useEffect/g, " window.useEffect").split('window.useEffect(').join('window.useEffect(this, '), {
            presets: ['es2015', 'es2015-loose', 'react', 'stage-0'],
            sourceMaps: true
        });
        transform.map.file = transform.map.sources[0] = location || 'gen_' + new Date().getTime() + '.jsx';
        transform.map.sourcesContent[0] = transform.map.sourcesContent[0].split('<React.Fragment>').join('<>').split('</React.Fragment>').join('</>').split('window.useState(this, ').join('useState(').split('window.useEffect(this, ').join('useEffect(');
        transform.scriptSource = 'data:text/javascript;charset=utf-8,' + escape(transform.code + '\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,' + window.Base64.encode(JSON.stringify(transform.map)));
        transform.instance = retrieveInstance(transform);
        return transform;
    };

    var tryFetch = function tryFetch(location) {
        if(ReactModuleLoader.additionalFetchers) {
            for(var fetcher of ReactModuleLoader.additionalFetches) {
                var promise = fetcher(location);
                if(promise) {
                    return promise;
                }
            }
        }
        return location.indexOf('.jsx') === location.length - 4 ? fetch(location + ('?' + (new Date().getTime() - 3) + '=' + (new Date().getTime() + 9))).then(data => data.text()) : undefined;
    };

    var fetchAndTransform = function fetchAndTransform(location, refresh) {
        ReactModuleLoader.promises = ReactModuleLoader.promises || {};
        refresh && delete ReactModuleLoader.promises[location];
        if (typeof Babel === 'undefined') {
            return;
        }
        var promise = ReactModuleLoader.promises[location] || tryFetch(location);
        promise && (ReactModuleLoader.promises[location] = promise = promise.then(code => code.split ? transform(code, location) : code));
        return promise;
    };

    ScriptLoader.connectExternalLoader(function tryFetchAndTransform(location) {
        return fetchAndTransform(location)?.then(transform => transform.scriptSource);
    });

    var ReactModuleLoaderInternal = function ReactModuleLoaderInternal(data) {
        var context = this;
        context.rawData = data;

        context.init = function() {
            if (context.rawData === undefined || context.rawData === null || context.rawData === '' || context.rawData.length === 0) {
                return
            }
            var modules = [];
            var scripts = [];
            if (typeof context.rawData === 'string' || typeof context.rawData === 'String') {
                modules.push(context.rawData)
            } else if (typeof context.rawData.length !== 'undefined' && context.rawData.length > 0) {
                for (var i in context.rawData) {
                    modules.push(context.rawData[i])
                }
            } else {
                if (typeof context.rawData.module === 'string' || typeof context.rawData.module === 'String') {
                    modules.push(context.rawData.module)
                } else if (typeof context.rawData.modules !== 'undefined' && typeof context.rawData.modules.length !== 'undefined' && context.rawData.modules.length > 0) {
                    for (var i in context.rawData.modules) {
                        modules.push(context.rawData.modules[i])
                    }
                }

                if (typeof context.rawData.script === 'string' || typeof context.rawData.script === 'String') {
                    scripts.push(context.rawData.script)
                } else if (typeof context.rawData.scripts !== 'undefined' && typeof context.rawData.scripts.length !== 'undefined' && context.rawData.scripts.length > 0) {
                    for (var i in context.rawData.scripts) {
                        scripts.push(context.rawData.scripts[i])
                    }
                }
            }
            for (var i in modules) {
                var module = modules[i];
                if (module.indexOf('.jsx') !== -1 ||
                    module.indexOf('.js') !== -1 ||
                    module.indexOf('.css') !== -1 ||
                    module.indexOf('.scss') !== -1) {
                    scripts.unshift(module);
                    continue;
                }
                if (module.lastIndexOf('/') !== module.length - 1) {
                    module += '/';
                }
                scripts.unshift(module + 'style.min.css', module + 'view.jsx', module + 'controller.js');
            }

            if (typeof context.rawData === 'string' ||
                typeof context.rawData === 'String' ||
                (typeof context.rawData.length !== undefined && context.rawData.length > 0)) {
                context.rawData = scripts;
            } else {
                delete context.rawData.script;
                delete context.rawData.scripts;
                delete context.rawData.module;
                delete context.rawData.modules;
                context.rawData.scripts = scripts;
            }
            ScriptLoader.load(context.rawData);
        }();
    };

    return {
        load(data) {
            new ReactModuleLoaderInternal(data)
        },
        transform,
        fetchAndTransform,
        addAdditionalFetcher(fetcher) {
            (ReactModuleLoader.additionalFetchers = ReactModuleLoader.additionalFetchers || []).push(fetcher);
        }
    };
}();