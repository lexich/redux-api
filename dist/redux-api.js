(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("redux-api", [], factory);
	else if(typeof exports === 'object')
		exports["redux-api"] = factory();
	else
		root["redux-api"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 27);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.setExpire = setExpire;
exports.getCacheManager = getCacheManager;

exports.default = function (cache) {
  if (!cache) {
    return null;
  }
  if (cache === true) {
    return Manager;
  } else {
    return _extends({}, Manager, cache);
  }
};

var MockNowDate = exports.MockNowDate = {
  date: undefined,
  push: function push(date) {
    this.date = date;
  },
  pop: function pop() {
    if (this.date) {
      var d = this.date;
      this.date = undefined;
      return new Date(d);
    } else {
      return new Date();
    }
  }
};

var Manager = exports.Manager = {
  expire: false,
  getData: function getData(cache) {
    if (!cache) {
      return;
    }
    var expire = cache.expire,
        data = cache.data;

    if (expire === false || expire === undefined || expire === null) {
      return data;
    }
    if (expire instanceof Date) {
      if (expire.valueOf() > MockNowDate.pop().valueOf()) {
        return data;
      }
    }
  },
  id: function id(params) {
    if (!params) {
      return "";
    }
    return Object.keys(params).reduce(function (memo, key) {
      return memo + (key + "=" + params[key] + ";");
    }, "");
  }
};

function setExpire(value, oldDate) {
  var expire = value;
  if (typeof expire === "number" || expire instanceof Number) {
    var d = MockNowDate.pop();
    d.setSeconds(d.getSeconds() + expire);
    expire = d;
  }
  if (oldDate instanceof Date && expire instanceof Date) {
    if (expire.valueOf() < oldDate.valueOf()) {
      expire = oldDate;
    }
  }
  return expire;
}

function getCacheManager(expire, cache) {
  if (expire !== undefined) {
    var ret = _extends({}, Manager, cache);
    if (ret.expire !== false) {
      ret.expire = setExpire(expire, ret.expire);
    }
    return ret;
  } else if (cache) {
    return _extends({}, Manager, cache);
  } else {
    return null;
  }
}

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// Load modules


// Declare internals

var internals = {};
internals.hexTable = new Array(256);
for (var h = 0; h < 256; ++h) {
    internals.hexTable[h] = '%' + ((h < 16 ? '0' : '') + h.toString(16)).toUpperCase();
}

exports.arrayToObject = function (source, options) {

    var obj = options.plainObjects ? Object.create(null) : {};
    for (var i = 0, il = source.length; i < il; ++i) {
        if (typeof source[i] !== 'undefined') {

            obj[i] = source[i];
        }
    }

    return obj;
};

exports.merge = function (target, source, options) {

    if (!source) {
        return target;
    }

    if ((typeof source === 'undefined' ? 'undefined' : _typeof(source)) !== 'object') {
        if (Array.isArray(target)) {
            target.push(source);
        } else if ((typeof target === 'undefined' ? 'undefined' : _typeof(target)) === 'object') {
            target[source] = true;
        } else {
            target = [target, source];
        }

        return target;
    }

    if ((typeof target === 'undefined' ? 'undefined' : _typeof(target)) !== 'object') {
        target = [target].concat(source);
        return target;
    }

    if (Array.isArray(target) && !Array.isArray(source)) {

        target = exports.arrayToObject(target, options);
    }

    var keys = Object.keys(source);
    for (var k = 0, kl = keys.length; k < kl; ++k) {
        var key = keys[k];
        var value = source[key];

        if (!Object.prototype.hasOwnProperty.call(target, key)) {
            target[key] = value;
        } else {
            target[key] = exports.merge(target[key], value, options);
        }
    }

    return target;
};

exports.decode = function (str) {

    try {
        return decodeURIComponent(str.replace(/\+/g, ' '));
    } catch (e) {
        return str;
    }
};

exports.encode = function (str) {

    // This code was originally written by Brian White (mscdex) for the io.js core querystring library.
    // It has been adapted here for stricter adherence to RFC 3986
    if (str.length === 0) {
        return str;
    }

    if (typeof str !== 'string') {
        str = '' + str;
    }

    var out = '';
    for (var i = 0, il = str.length; i < il; ++i) {
        var c = str.charCodeAt(i);

        if (c === 0x2D || // -
        c === 0x2E || // .
        c === 0x5F || // _
        c === 0x7E || // ~
        c >= 0x30 && c <= 0x39 || // 0-9
        c >= 0x41 && c <= 0x5A || // a-z
        c >= 0x61 && c <= 0x7A) {
            // A-Z

            out += str[i];
            continue;
        }

        if (c < 0x80) {
            out += internals.hexTable[c];
            continue;
        }

        if (c < 0x800) {
            out += internals.hexTable[0xC0 | c >> 6] + internals.hexTable[0x80 | c & 0x3F];
            continue;
        }

        if (c < 0xD800 || c >= 0xE000) {
            out += internals.hexTable[0xE0 | c >> 12] + internals.hexTable[0x80 | c >> 6 & 0x3F] + internals.hexTable[0x80 | c & 0x3F];
            continue;
        }

        ++i;
        c = 0x10000 + ((c & 0x3FF) << 10 | str.charCodeAt(i) & 0x3FF);
        out += internals.hexTable[0xF0 | c >> 18] + internals.hexTable[0x80 | c >> 12 & 0x3F] + internals.hexTable[0x80 | c >> 6 & 0x3F] + internals.hexTable[0x80 | c & 0x3F];
    }

    return out;
};

exports.compact = function (obj, refs) {

    if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object' || obj === null) {

        return obj;
    }

    refs = refs || [];
    var lookup = refs.indexOf(obj);
    if (lookup !== -1) {
        return refs[lookup];
    }

    refs.push(obj);

    if (Array.isArray(obj)) {
        var compacted = [];

        for (var i = 0, il = obj.length; i < il; ++i) {
            if (typeof obj[i] !== 'undefined') {
                compacted.push(obj[i]);
            }
        }

        return compacted;
    }

    var keys = Object.keys(obj);
    for (i = 0, il = keys.length; i < il; ++i) {
        var key = keys[i];
        obj[key] = exports.compact(obj[key], refs);
    }

    return obj;
};

exports.isRegExp = function (obj) {

    return Object.prototype.toString.call(obj) === '[object RegExp]';
};

exports.isBuffer = function (obj) {

    if (obj === null || typeof obj === 'undefined') {

        return false;
    }

    return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
};

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var punycode = __webpack_require__(10);
var util = __webpack_require__(17);

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,


// Special case for a simple path URL
simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,


// RFC 2396: characters reserved for delimiting URLs.
// We actually just auto-escape these.
delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],


// RFC 2396: characters not allowed for various reasons.
unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),


// Allowed by RFCs, but cause of XSS attacks.  Always escape these.
autoEscape = ['\''].concat(unwise),

// Characters that are never ever allowed in a hostname.
// Note that any invalid chars are also handled, but these
// are the ones that are *expected* to be seen, so we fast-path
// them.
nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,

// protocols that can allow "unsafe" and "unwise" chars.
unsafeProtocol = {
  'javascript': true,
  'javascript:': true
},

// protocols that never have a hostname.
hostlessProtocol = {
  'javascript': true,
  'javascript:': true
},

// protocols that always contain a // bit.
slashedProtocol = {
  'http': true,
  'https': true,
  'ftp': true,
  'gopher': true,
  'file': true,
  'http:': true,
  'https:': true,
  'ftp:': true,
  'gopher:': true,
  'file:': true
},
    querystring = __webpack_require__(16);

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && util.isObject(url) && url instanceof Url) return url;

  var u = new Url();
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function (url, parseQueryString, slashesDenoteHost) {
  if (!util.isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + (typeof url === 'undefined' ? 'undefined' : _typeof(url)));
  }

  // Copy chrome, IE, opera backslash-handling behavior.
  // Back slashes before the query string get converted to forward slashes
  // See: https://code.google.com/p/chromium/issues/detail?id=25916
  var queryIndex = url.indexOf('?'),
      splitter = queryIndex !== -1 && queryIndex < url.indexOf('#') ? '?' : '#',
      uSplit = url.split(splitter),
      slashRegex = /\\/g;
  uSplit[0] = uSplit[0].replace(slashRegex, '/');
  url = uSplit.join(splitter);

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  if (!slashesDenoteHost && url.split('#').length === 1) {
    // Try fast path regexp
    var simplePath = simplePathPattern.exec(rest);
    if (simplePath) {
      this.path = rest;
      this.href = rest;
      this.pathname = simplePath[1];
      if (simplePath[2]) {
        this.search = simplePath[2];
        if (parseQueryString) {
          this.query = querystring.parse(this.search.substr(1));
        } else {
          this.query = this.search.substr(1);
        }
      } else if (parseQueryString) {
        this.search = '';
        this.query = {};
      }
      return this;
    }
  }

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] && (slashes || proto && !slashedProtocol[proto])) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1) hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' && this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a punycoded representation of "domain".
      // It only converts parts of the domain name that
      // have non-ASCII characters, i.e. it doesn't matter if
      // you call it with a domain that already is ASCII-only.
      this.hostname = punycode.toASCII(this.hostname);
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      if (rest.indexOf(ae) === -1) continue;
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }

  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] && this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (util.isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function () {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ? this.hostname : '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query && util.isObject(this.query) && Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || query && '?' + query || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes || (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function (match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function (relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function (relative) {
  if (util.isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  var tkeys = Object.keys(this);
  for (var tk = 0; tk < tkeys.length; tk++) {
    var tkey = tkeys[tk];
    result[tkey] = this[tkey];
  }

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    var rkeys = Object.keys(relative);
    for (var rk = 0; rk < rkeys.length; rk++) {
      var rkey = rkeys[rk];
      if (rkey !== 'protocol') result[rkey] = relative[rkey];
    }

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] && result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      var keys = Object.keys(relative);
      for (var v = 0; v < keys.length; v++) {
        var k = keys[v];
        result[k] = relative[k];
      }
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift())) {}
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = result.pathname && result.pathname.charAt(0) === '/',
      isRelAbs = relative.host || relative.pathname && relative.pathname.charAt(0) === '/',
      mustEndAbs = isRelAbs || isSourceAbs || result.host && relative.pathname,
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = relative.host || relative.host === '' ? relative.host : result.host;
    result.hostname = relative.hostname || relative.hostname === '' ? relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!util.isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especially happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ? result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') + (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (result.host || relative.host || srcPath.length > 1) && (last === '.' || last === '..') || last === '';

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last === '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' && (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && srcPath.join('/').substr(-1) !== '/') {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' || srcPath[0] && srcPath[0].charAt(0) === '/';

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' : srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especially happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ? result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || result.host && srcPath.length;

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') + (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function () {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mergePair = mergePair;

exports.default = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return args.length ? args.reduce(mergePair) : null;
};

/* eslint no-void: 0 */
var toString = Object.prototype.toString;
var OBJECT = "[object Object]";
var ARRAY = "[object Array]";

function mergePair(a, b) {
  if (a === void 0) {
    return b;
  }
  if (b === void 0) {
    return a;
  }

  var aType = toString.call(a);
  var bType = toString.call(b);
  if (aType === ARRAY) {
    return a.concat(b);
  }
  if (bType === ARRAY) {
    return [a].concat(b);
  }
  if (aType !== OBJECT || bType !== OBJECT) {
    return b;
  }
  return Object.keys(b).reduce(function (memo, key) {
    memo[key] = mergePair(a[key], b[key]);
    return memo;
  }, a);
}

/***/ }),
/* 4 */
/***/ (function(module, exports) {

/* WEBPACK VAR INJECTION */(function(__webpack_amd_options__) {/* globals __webpack_amd_options__ */
module.exports = __webpack_amd_options__;

/* WEBPACK VAR INJECTION */}.call(exports, {}))

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = actionFn;

var _fastApply = __webpack_require__(9);

var _fastApply2 = _interopRequireDefault(_fastApply);

var _url = __webpack_require__(2);

var _url2 = _interopRequireDefault(_url);

var _urlTransform = __webpack_require__(24);

var _urlTransform2 = _interopRequireDefault(_urlTransform);

var _merge = __webpack_require__(3);

var _merge2 = _interopRequireDefault(_merge);

var _get = __webpack_require__(25);

var _get2 = _interopRequireDefault(_get);

var _fetchResolver = __webpack_require__(22);

var _fetchResolver2 = _interopRequireDefault(_fetchResolver);

var _PubSub = __webpack_require__(20);

var _PubSub2 = _interopRequireDefault(_PubSub);

var _createHolder = __webpack_require__(21);

var _createHolder2 = _interopRequireDefault(_createHolder);

var _helpers = __webpack_require__(23);

var _cache = __webpack_require__(0);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Constructor for create action
 * @param  {String} url          endpoint's url
 * @param  {String} name         action name
 * @param  {Object} options      action configuration
 * @param  {Object} ACTIONS      map of actions
 * @param  {[type]} fetchAdapter adapter for fetching data
 * @return {Function+Object}     action function object
 */
function actionFn(url, name, options) {
  var ACTIONS = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var meta = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
  var actionFetch = ACTIONS.actionFetch,
      actionSuccess = ACTIONS.actionSuccess,
      actionFail = ACTIONS.actionFail,
      actionReset = ACTIONS.actionReset,
      actionCache = ACTIONS.actionCache,
      actionAbort = ACTIONS.actionAbort;

  var pubsub = new _PubSub2.default();
  var requestHolder = (0, _createHolder2.default)();

  function getOptions(urlT, params, getState) {
    var globalOptions = !meta.holder ? {} : meta.holder.options instanceof Function ? meta.holder.options(urlT, params, getState) : meta.holder.options;
    var baseOptions = !(options instanceof Function) ? options : options(urlT, params, getState);
    return (0, _merge2.default)({}, globalOptions, baseOptions, params);
  }

  function getUrl(pathvars, params, getState) {
    var resultUrlT = (0, _urlTransform2.default)(url, pathvars, meta.urlOptions);
    var urlT = resultUrlT;
    var rootUrl = (0, _get2.default)(meta, "holder", "rootUrl");
    rootUrl = !(rootUrl instanceof Function) ? rootUrl : rootUrl(urlT, params, getState);
    if (rootUrl) {
      var rootUrlObject = _url2.default.parse(rootUrl);
      var urlObject = _url2.default.parse(urlT);
      if (!urlObject.host) {
        var urlPath = (rootUrlObject.path ? rootUrlObject.path.replace(/\/$/, "") : "") + "/" + (urlObject.path ? urlObject.path.replace(/^\//, "") : "");
        urlT = rootUrlObject.protocol + "//" + rootUrlObject.host + urlPath;
      }
    }
    return urlT;
  }

  function fetch(pathvars, params) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var getState = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : _helpers.none;
    var dispatch = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : _helpers.none;

    var urlT = getUrl(pathvars, params, getState);
    var opts = getOptions(urlT, params, getState);
    var id = meta.reducerName || "";
    var cacheManager = (0, _cache.getCacheManager)(options.expire, meta.cache);

    if (cacheManager && getState !== _helpers.none) {
      var state = getState();
      var cache = (0, _get2.default)(state, meta.prefix, meta.reducerName, "cache");
      id += "_" + cacheManager.id(pathvars, params);
      var data = cacheManager.getData(cache && id && cache[id] !== undefined && cache[id]);
      if (data !== undefined) {
        return Promise.resolve(data);
      }
    }
    var response = meta.fetch(urlT, opts);
    if (cacheManager && dispatch !== _helpers.none && id) {
      response.then(function (data) {
        dispatch({ type: actionCache, id: id, data: data, expire: cacheManager.expire });
      });
    }
    return response;
  }

  function abort() {
    var defer = requestHolder.pop();
    var err = new Error("Application abort request");
    defer && defer.reject(err);
    return err;
  }

  /**
   * Fetch data from server
   * @param  {Object}   pathvars    path vars for url
   * @param  {Object}   params      fetch params
   * @param  {Function} getState    helper meta function
   */
  function request(pathvars, params, options) {
    var getState = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : _helpers.none;
    var dispatch = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : _helpers.none;

    var response = fetch(pathvars, params, options, getState, dispatch);
    var result = !meta.validation ? response : response.then(function (data) {
      return new Promise(function (resolve, reject) {
        return meta.validation(data, function (err) {
          return err ? reject(err) : resolve(data);
        });
      });
    });
    var ret = result;
    var responseHandler = (0, _get2.default)(meta, "holder", "responseHandler");
    if (responseHandler) {
      if (result && result.then) {
        ret = result.then(function (data) {
          var res = responseHandler(null, data);
          if (res === undefined) {
            return data;
          } else {
            return res;
          }
        }, function (err) {
          return responseHandler(err);
        });
      } else {
        ret = responseHandler(result);
      }
    }
    ret && ret.catch && ret.catch(_helpers.none);
    return ret;
  }

  /**
   * Fetch data from server
   * @param  {Object}   pathvars    path vars for url
   * @param  {Object}   params      fetch params
   * @param  {Function} callback)   callback execute after end request
   */
  function fn() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var _extractArgs = (0, _helpers.extractArgs)(args),
        _extractArgs2 = _slicedToArray(_extractArgs, 3),
        pathvars = _extractArgs2[0],
        params = _extractArgs2[1],
        callback = _extractArgs2[2];

    var syncing = params ? !!params.syncing : false;
    params && delete params.syncing;
    pubsub.push(callback);
    return function () {
      var middlewareParser = (0, _get2.default)(meta, "holder", "middlewareParser") || _helpers.defaultMiddlewareArgsParser;

      var _middlewareParser = middlewareParser.apply(undefined, arguments),
          dispatch = _middlewareParser.dispatch,
          getState = _middlewareParser.getState;

      var state = getState();
      var isLoading = (0, _get2.default)(state, meta.prefix, meta.reducerName, "loading");
      if (isLoading) {
        return Promise.reject("isLoading");
      }
      var requestOptions = { pathvars: pathvars, params: params };
      var prevData = (0, _get2.default)(state, meta.prefix, meta.reducerName, "data");
      dispatch({ type: actionFetch, syncing: syncing, request: requestOptions });
      var fetchResolverOpts = {
        dispatch: dispatch,
        getState: getState,
        request: requestOptions,
        actions: meta.actions,
        prefetch: meta.prefetch
      };
      if (Object.defineProperty) {
        Object.defineProperty(fetchResolverOpts, "requestOptions", {
          get: function get() {
            /* eslint no-console: 0 */
            console.warn("Deprecated option, use `request` option");
            return requestOptions;
          }
        });
      } else {
        fetchResolverOpts.requestOptions = requestOptions;
      }

      var result = new Promise(function (done, fail) {
        (0, _fetchResolver2.default)(0, fetchResolverOpts, function (err) {
          if (err) {
            pubsub.reject(err);
            return fail(err);
          }
          new Promise(function (resolve, reject) {
            requestHolder.set({
              resolve: resolve,
              reject: reject,
              promise: request(pathvars, params, {}, getState, dispatch).then(resolve, reject)
            });
          }).then(function (d) {
            requestHolder.pop();
            var data = meta.transformer(d, prevData, {
              type: actionSuccess,
              request: requestOptions
            });
            dispatch({
              data: data,
              origData: d,
              type: actionSuccess,
              syncing: false,
              request: requestOptions
            });
            if (meta.broadcast) {
              meta.broadcast.forEach(function (type) {
                dispatch({
                  type: type,
                  data: data,
                  origData: d,
                  request: requestOptions
                });
              });
            }
            if (meta.postfetch) {
              meta.postfetch.forEach(function (postfetch) {
                postfetch instanceof Function && postfetch({
                  data: data,
                  getState: getState,
                  dispatch: dispatch,
                  actions: meta.actions,
                  request: requestOptions
                });
              });
            }
            pubsub.resolve(data);
            done(data);
          }, function (error) {
            dispatch({
              error: error,
              type: actionFail,
              loading: false,
              syncing: false,
              request: requestOptions
            });
            pubsub.reject(error);
            fail(error);
          });
        });
      });
      result.catch(_helpers.none);
      return result;
    };
  }

  /*
    Pure rest request
   */
  fn.request = function (pathvars, params, options) {
    return request(pathvars, params, options || {});
  };

  /**
   * Reset store to initial state
   */
  fn.reset = function (mutation) {
    abort();
    return mutation === "sync" ? { type: actionReset, mutation: mutation } : { type: actionReset };
  };

  /*
    Abort request
   */
  fn.abort = function () {
    var error = abort();
    return { type: actionAbort, error: error };
  };

  fn.force = function () {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return function (dispatch, getState) {
      var state = getState();
      var isLoading = (0, _get2.default)(state, meta.prefix, meta.reducerName, "loading");
      if (isLoading) {
        dispatch(fn.abort());
      }
      return fn.apply(undefined, args)(dispatch, getState);
    };
  };

  /**
   * Sync store with server. In server mode works as usual method.
   * If data have already synced, data would not fetch after call this method.
   * @param  {Object} pathvars    path vars for url
   * @param  {Object} params      fetch params
   * @param  {Function} callback) callback execute after end request
   */
  fn.sync = function () {
    for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    var _extractArgs3 = (0, _helpers.extractArgs)(args),
        _extractArgs4 = _slicedToArray(_extractArgs3, 3),
        pathvars = _extractArgs4[0],
        params = _extractArgs4[1],
        callback = _extractArgs4[2];

    var isServer = meta.holder ? meta.holder.server : false;
    return function (dispatch, getState) {
      var state = getState();
      var store = (0, _get2.default)(state, meta.prefix, name);
      if (!isServer && store && store.sync) {
        callback(null, store.data);
        return;
      }
      var modifyParams = _extends({}, params, { syncing: true });
      return fn(pathvars, modifyParams, callback)(dispatch, getState);
    };
  };

  var helpers = meta.helpers || {};
  if (meta.crud) {
    helpers = _extends({}, _helpers.CRUD, helpers);
  }
  var fnHelperCallback = function fnHelperCallback(memo, func, helpername) {
    if (memo[helpername]) {
      throw new Error("Helper name: \"" + helpername + "\" for endpoint \"" + name + "\" has been already reserved");
    }

    var _ref = func instanceof Function ? { call: func } : func,
        sync = _ref.sync,
        call = _ref.call;

    memo[helpername] = function () {
      for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      return function (dispatch, getState) {
        var index = args.length - 1;
        var callbackFn = args[index] instanceof Function ? args[index] : _helpers.none;
        var helpersResult = (0, _fastApply2.default)(call, { getState: getState, dispatch: dispatch, actions: meta.actions }, args);
        var result = new Promise(function (resolve, reject) {
          var callback = function callback(err, data) {
            err ? reject(err) : resolve(data);
            callbackFn(err, data);
          };
          // If helper alias using async functionality
          if (helpersResult instanceof Function) {
            helpersResult(function (error) {
              var newArgs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

              if (error) {
                callback(error);
              } else {
                (0, _fastApply2.default)(sync ? fn.sync : fn, null, newArgs.concat(callback))(dispatch, getState);
              }
            });
          } else {
            // if helper alias is synchronous
            var _helpersResult = _slicedToArray(helpersResult, 2),
                pathvars = _helpersResult[0],
                params = _helpersResult[1];

            (0, _fastApply2.default)(sync ? fn.sync : fn, null, [pathvars, params, callback])(dispatch, getState);
          }
        });
        result.catch(_helpers.none);
        return result;
      };
    };
    return memo;
  };

  return Object.keys(helpers).reduce(function (memo, key) {
    return fnHelperCallback(memo, helpers[key], key, helpers);
  }, fn);
}
module.exports = exports["default"];

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = async;
/**
 *
 * @param  {[type]}    dispatch [description]
 * @param  {...[type]} args     [description]
 * @return {[type]}             [description]
 * @example
 * async(dispatch,
 *   cb=> actions.test(1, cb),
 *   actions.test2
 * ).then(()=> async(dispatch, actions.test3))
 */
function async(dispatch) {
  for (var _len = arguments.length, restFunctions = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    restFunctions[_key - 2] = arguments[_key];
  }

  var currentFunction = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  return new Promise(function (resolve, reject) {
    if (!currentFunction) {
      reject("no chain function");
    } else {
      dispatch(currentFunction(function (err, data) {
        err ? reject(err) : resolve(data);
      }) || {});
    }
  }).then(function (data) {
    if (restFunctions.length) {
      return async.apply(undefined, [dispatch].concat(restFunctions));
    } else {
      return data;
    }
  });
}
module.exports = exports["default"];

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/* eslint no-case-declarations: 0 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = reducerFn;

var _cache = __webpack_require__(0);

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Reducer contructor
 * @param  {Object}   initialState default initial state
 * @param  {Object}   actions      actions map
 * @param  {Function} reducer      custom reducer function
 * @return {Function}              reducer function
 */
function reducerFn(initialState) {
  var actions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var reducer = arguments[2];
  var actionFetch = actions.actionFetch,
      actionSuccess = actions.actionSuccess,
      actionFail = actions.actionFail,
      actionReset = actions.actionReset,
      actionCache = actions.actionCache,
      actionAbort = actions.actionAbort;

  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    var action = arguments[1];

    var request = action.request || {};
    switch (action.type) {
      case actionFetch:
        return _extends({}, state, {
          request: request,
          loading: true,
          error: null,
          syncing: !!action.syncing
        });
      case actionSuccess:
        return _extends({}, state, {
          loading: false,
          sync: true,
          syncing: false,
          error: null,
          data: action.data
        });
      case actionFail:
        return _extends({}, state, {
          loading: false,
          error: action.error,
          syncing: false
        });
      case actionReset:
        var mutation = action.mutation;

        return mutation === "sync" ? _extends({}, state, {
          request: null,
          sync: false
        }) : _extends({}, initialState);
      case actionAbort:
        return _extends({}, state, {
          request: null,
          loading: false,
          syncing: false,
          error: action.error
        });
      case actionCache:
        var id = action.id,
            data = action.data;

        var cacheExpire = state.cache[id] ? state.cache[id].expire : null;
        var expire = (0, _cache.setExpire)(action.expire, cacheExpire);
        return _extends({}, state, {
          cache: _extends({}, state.cache, _defineProperty({}, id, { expire: expire, data: data }))
        });
      default:
        return reducer ? reducer(state, action) : state;
    }
  };
}
module.exports = exports["default"];

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var toString = Object.prototype.toString;
var OBJECT = "[object Object]";

/**
 * Default responce transformens
 */
exports.default = {
  array: function array(data) {
    return !data ? [] : Array.isArray(data) ? data : [data];
  },
  object: function object(data) {
    if (!data) {
      return {};
    }
    return toString.call(data) === OBJECT ? data : { data: data };
  }
};
module.exports = exports["default"];

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = fastApply;

function fastApply(fn, context, args) {

    switch (args ? args.length : 0) {
        case 0:
            return context ? fn.call(context) : fn();
        case 1:
            return context ? fn.call(context, args[0]) : fn(args[0]);
        case 2:
            return context ? fn.call(context, args[0], args[1]) : fn(args[0], args[1]);
        case 3:
            return context ? fn.call(context, args[0], args[1], args[2]) : fn(args[0], args[1], args[2]);
        case 4:
            return context ? fn.call(context, args[0], args[1], args[2], args[3]) : fn(args[0], args[1], args[2], args[3]);
        case 5:
            return context ? fn.call(context, args[0], args[1], args[2], args[3], args[4]) : fn(args[0], args[1], args[2], args[3], args[4]);
        default:
            return fn.apply(context, args);
    }
}

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(module, global) {var __WEBPACK_AMD_DEFINE_RESULT__;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*! https://mths.be/punycode v1.4.1 by @mathias */
;(function (root) {

	/** Detect free variables */
	var freeExports = ( false ? 'undefined' : _typeof(exports)) == 'object' && exports && !exports.nodeType && exports;
	var freeModule = ( false ? 'undefined' : _typeof(module)) == 'object' && module && !module.nodeType && module;
	var freeGlobal = (typeof global === 'undefined' ? 'undefined' : _typeof(global)) == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal || freeGlobal.self === freeGlobal) {
		root = freeGlobal;
	}

	/**
  * The `punycode` object.
  * @name punycode
  * @type Object
  */
	var punycode,


	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647,
	    // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	    tMin = 1,
	    tMax = 26,
	    skew = 38,
	    damp = 700,
	    initialBias = 72,
	    initialN = 128,
	    // 0x80
	delimiter = '-',
	    // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	    regexNonASCII = /[^\x20-\x7E]/,
	    // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g,
	    // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},


	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	    floor = Math.floor,
	    stringFromCharCode = String.fromCharCode,


	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
  * A generic error utility function.
  * @private
  * @param {String} type The error type.
  * @returns {Error} Throws a `RangeError` with the applicable error message.
  */
	function error(type) {
		throw new RangeError(errors[type]);
	}

	/**
  * A generic `Array#map` utility function.
  * @private
  * @param {Array} array The array to iterate over.
  * @param {Function} callback The function that gets called for every array
  * item.
  * @returns {Array} A new array of values returned by the callback function.
  */
	function map(array, fn) {
		var length = array.length;
		var result = [];
		while (length--) {
			result[length] = fn(array[length]);
		}
		return result;
	}

	/**
  * A simple `Array#map`-like wrapper to work with domain name strings or email
  * addresses.
  * @private
  * @param {String} domain The domain name or email address.
  * @param {Function} callback The function that gets called for every
  * character.
  * @returns {Array} A new string of characters returned by the callback
  * function.
  */
	function mapDomain(string, fn) {
		var parts = string.split('@');
		var result = '';
		if (parts.length > 1) {
			// In email addresses, only the domain name should be punycoded. Leave
			// the local part (i.e. everything up to `@`) intact.
			result = parts[0] + '@';
			string = parts[1];
		}
		// Avoid `split(regex)` for IE8 compatibility. See #17.
		string = string.replace(regexSeparators, '\x2E');
		var labels = string.split('.');
		var encoded = map(labels, fn).join('.');
		return result + encoded;
	}

	/**
  * Creates an array containing the numeric code points of each Unicode
  * character in the string. While JavaScript uses UCS-2 internally,
  * this function will convert a pair of surrogate halves (each of which
  * UCS-2 exposes as separate characters) into a single code point,
  * matching UTF-16.
  * @see `punycode.ucs2.encode`
  * @see <https://mathiasbynens.be/notes/javascript-encoding>
  * @memberOf punycode.ucs2
  * @name decode
  * @param {String} string The Unicode input string (UCS-2).
  * @returns {Array} The new array of code points.
  */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) {
					// low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
  * Creates a string based on an array of numeric code points.
  * @see `punycode.ucs2.decode`
  * @memberOf punycode.ucs2
  * @name encode
  * @param {Array} codePoints The array of numeric code points.
  * @returns {String} The new Unicode string (UCS-2).
  */
	function ucs2encode(array) {
		return map(array, function (value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
  * Converts a basic code point into a digit/integer.
  * @see `digitToBasic()`
  * @private
  * @param {Number} codePoint The basic numeric code point value.
  * @returns {Number} The numeric value of a basic code point (for use in
  * representing integers) in the range `0` to `base - 1`, or `base` if
  * the code point does not represent a value.
  */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
  * Converts a digit/integer into a basic code point.
  * @see `basicToDigit()`
  * @private
  * @param {Number} digit The numeric value of a basic code point.
  * @returns {Number} The basic code point whose value (when used for
  * representing integers) is `digit`, which needs to be in the range
  * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
  * used; else, the lowercase form is used. The behavior is undefined
  * if `flag` is non-zero and `digit` has no uppercase form.
  */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
  * Bias adaptation function as per section 3.4 of RFC 3492.
  * https://tools.ietf.org/html/rfc3492#section-3.4
  * @private
  */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (; /* no initialization */delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
  * Converts a Punycode string of ASCII-only symbols to a string of Unicode
  * symbols.
  * @memberOf punycode
  * @param {String} input The Punycode string of ASCII-only symbols.
  * @returns {String} The resulting string of Unicode symbols.
  */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,

		/** Cached calculation results */
		baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength;) /* no final expression */{

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base;; /* no condition */k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;
			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);
		}

		return ucs2encode(output);
	}

	/**
  * Converts a string of Unicode symbols (e.g. a domain name label) to a
  * Punycode string of ASCII-only symbols.
  * @memberOf punycode
  * @param {String} input The string of Unicode symbols.
  * @returns {String} The resulting Punycode string of ASCII-only symbols.
  */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],

		/** `inputLength` will hold the number of code points in `input`. */
		inputLength,

		/** Cached calculation results */
		handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base;; /* no condition */k += base) {
						t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0)));
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;
		}
		return output.join('');
	}

	/**
  * Converts a Punycode string representing a domain name or an email address
  * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
  * it doesn't matter if you call it on a string that has already been
  * converted to Unicode.
  * @memberOf punycode
  * @param {String} input The Punycoded domain name or email address to
  * convert to Unicode.
  * @returns {String} The Unicode representation of the given Punycode
  * string.
  */
	function toUnicode(input) {
		return mapDomain(input, function (string) {
			return regexPunycode.test(string) ? decode(string.slice(4).toLowerCase()) : string;
		});
	}

	/**
  * Converts a Unicode string representing a domain name or an email address to
  * Punycode. Only the non-ASCII parts of the domain name will be converted,
  * i.e. it doesn't matter if you call it with a domain that's already in
  * ASCII.
  * @memberOf punycode
  * @param {String} input The domain name or email address to convert, as a
  * Unicode string.
  * @returns {String} The Punycode representation of the given domain name or
  * email address.
  */
	function toASCII(input) {
		return mapDomain(input, function (string) {
			return regexNonASCII.test(string) ? 'xn--' + encode(string) : string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
   * A string representing the current Punycode.js version number.
   * @memberOf punycode
   * @type String
   */
		'version': '1.4.1',
		/**
   * An object of methods to convert from JavaScript's internal character
   * representation (UCS-2) to Unicode code points, and back.
   * @see <https://mathiasbynens.be/notes/javascript-encoding>
   * @memberOf punycode
   * @type Object
   */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if ("function" == 'function' && _typeof(__webpack_require__(4)) == 'object' && __webpack_require__(4)) {
		!(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
			return punycode;
		}.call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else if (freeExports && freeModule) {
		if (module.exports == freeExports) {
			// in Node.js, io.js, or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else {
			// in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else {
		// in Rhino or a web browser
		root.punycode = punycode;
	}
})(undefined);
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(19)(module), __webpack_require__(18)))

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// Load modules

var Stringify = __webpack_require__(13);
var Parse = __webpack_require__(12);

// Declare internals

var internals = {};

module.exports = {
    stringify: Stringify,
    parse: Parse
};

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// Load modules

var Utils = __webpack_require__(1);

// Declare internals

var internals = {
    delimiter: '&',
    depth: 5,
    arrayLimit: 20,
    parameterLimit: 1000,
    strictNullHandling: false,
    plainObjects: false,
    allowPrototypes: false,
    allowDots: false
};

internals.parseValues = function (str, options) {

    var obj = {};
    var parts = str.split(options.delimiter, options.parameterLimit === Infinity ? undefined : options.parameterLimit);

    for (var i = 0, il = parts.length; i < il; ++i) {
        var part = parts[i];
        var pos = part.indexOf(']=') === -1 ? part.indexOf('=') : part.indexOf(']=') + 1;

        if (pos === -1) {
            obj[Utils.decode(part)] = '';

            if (options.strictNullHandling) {
                obj[Utils.decode(part)] = null;
            }
        } else {
            var key = Utils.decode(part.slice(0, pos));
            var val = Utils.decode(part.slice(pos + 1));

            if (!Object.prototype.hasOwnProperty.call(obj, key)) {
                obj[key] = val;
            } else {
                obj[key] = [].concat(obj[key]).concat(val);
            }
        }
    }

    return obj;
};

internals.parseObject = function (chain, val, options) {

    if (!chain.length) {
        return val;
    }

    var root = chain.shift();

    var obj;
    if (root === '[]') {
        obj = [];
        obj = obj.concat(internals.parseObject(chain, val, options));
    } else {
        obj = options.plainObjects ? Object.create(null) : {};
        var cleanRoot = root[0] === '[' && root[root.length - 1] === ']' ? root.slice(1, root.length - 1) : root;
        var index = parseInt(cleanRoot, 10);
        var indexString = '' + index;
        if (!isNaN(index) && root !== cleanRoot && indexString === cleanRoot && index >= 0 && options.parseArrays && index <= options.arrayLimit) {

            obj = [];
            obj[index] = internals.parseObject(chain, val, options);
        } else {
            obj[cleanRoot] = internals.parseObject(chain, val, options);
        }
    }

    return obj;
};

internals.parseKeys = function (key, val, options) {

    if (!key) {
        return;
    }

    // Transform dot notation to bracket notation

    if (options.allowDots) {
        key = key.replace(/\.([^\.\[]+)/g, '[$1]');
    }

    // The regex chunks

    var parent = /^([^\[\]]*)/;
    var child = /(\[[^\[\]]*\])/g;

    // Get the parent

    var segment = parent.exec(key);

    // Stash the parent if it exists

    var keys = [];
    if (segment[1]) {
        // If we aren't using plain objects, optionally prefix keys
        // that would overwrite object prototype properties
        if (!options.plainObjects && Object.prototype.hasOwnProperty(segment[1])) {

            if (!options.allowPrototypes) {
                return;
            }
        }

        keys.push(segment[1]);
    }

    // Loop through children appending to the array until we hit depth

    var i = 0;
    while ((segment = child.exec(key)) !== null && i < options.depth) {

        ++i;
        if (!options.plainObjects && Object.prototype.hasOwnProperty(segment[1].replace(/\[|\]/g, ''))) {

            if (!options.allowPrototypes) {
                continue;
            }
        }
        keys.push(segment[1]);
    }

    // If there's a remainder, just add whatever is left

    if (segment) {
        keys.push('[' + key.slice(segment.index) + ']');
    }

    return internals.parseObject(keys, val, options);
};

module.exports = function (str, options) {

    options = options || {};
    options.delimiter = typeof options.delimiter === 'string' || Utils.isRegExp(options.delimiter) ? options.delimiter : internals.delimiter;
    options.depth = typeof options.depth === 'number' ? options.depth : internals.depth;
    options.arrayLimit = typeof options.arrayLimit === 'number' ? options.arrayLimit : internals.arrayLimit;
    options.parseArrays = options.parseArrays !== false;
    options.allowDots = typeof options.allowDots === 'boolean' ? options.allowDots : internals.allowDots;
    options.plainObjects = typeof options.plainObjects === 'boolean' ? options.plainObjects : internals.plainObjects;
    options.allowPrototypes = typeof options.allowPrototypes === 'boolean' ? options.allowPrototypes : internals.allowPrototypes;
    options.parameterLimit = typeof options.parameterLimit === 'number' ? options.parameterLimit : internals.parameterLimit;
    options.strictNullHandling = typeof options.strictNullHandling === 'boolean' ? options.strictNullHandling : internals.strictNullHandling;

    if (str === '' || str === null || typeof str === 'undefined') {

        return options.plainObjects ? Object.create(null) : {};
    }

    var tempObj = typeof str === 'string' ? internals.parseValues(str, options) : str;
    var obj = options.plainObjects ? Object.create(null) : {};

    // Iterate over the keys and setup the new object

    var keys = Object.keys(tempObj);
    for (var i = 0, il = keys.length; i < il; ++i) {
        var key = keys[i];
        var newObj = internals.parseKeys(key, tempObj[key], options);
        obj = Utils.merge(obj, newObj, options);
    }

    return Utils.compact(obj);
};

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// Load modules

var Utils = __webpack_require__(1);

// Declare internals

var internals = {
    delimiter: '&',
    arrayPrefixGenerators: {
        brackets: function brackets(prefix, key) {

            return prefix + '[]';
        },
        indices: function indices(prefix, key) {

            return prefix + '[' + key + ']';
        },
        repeat: function repeat(prefix, key) {

            return prefix;
        }
    },
    strictNullHandling: false,
    skipNulls: false,
    encode: true
};

internals.stringify = function (obj, prefix, generateArrayPrefix, strictNullHandling, skipNulls, encode, filter, sort) {

    if (typeof filter === 'function') {
        obj = filter(prefix, obj);
    } else if (Utils.isBuffer(obj)) {
        obj = obj.toString();
    } else if (obj instanceof Date) {
        obj = obj.toISOString();
    } else if (obj === null) {
        if (strictNullHandling) {
            return encode ? Utils.encode(prefix) : prefix;
        }

        obj = '';
    }

    if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {

        if (encode) {
            return [Utils.encode(prefix) + '=' + Utils.encode(obj)];
        }
        return [prefix + '=' + obj];
    }

    var values = [];

    if (typeof obj === 'undefined') {
        return values;
    }

    var objKeys;
    if (Array.isArray(filter)) {
        objKeys = filter;
    } else {
        var keys = Object.keys(obj);
        objKeys = sort ? keys.sort(sort) : keys;
    }

    for (var i = 0, il = objKeys.length; i < il; ++i) {
        var key = objKeys[i];

        if (skipNulls && obj[key] === null) {

            continue;
        }

        if (Array.isArray(obj)) {
            values = values.concat(internals.stringify(obj[key], generateArrayPrefix(prefix, key), generateArrayPrefix, strictNullHandling, skipNulls, encode, filter));
        } else {
            values = values.concat(internals.stringify(obj[key], prefix + '[' + key + ']', generateArrayPrefix, strictNullHandling, skipNulls, encode, filter));
        }
    }

    return values;
};

module.exports = function (obj, options) {

    options = options || {};
    var delimiter = typeof options.delimiter === 'undefined' ? internals.delimiter : options.delimiter;
    var strictNullHandling = typeof options.strictNullHandling === 'boolean' ? options.strictNullHandling : internals.strictNullHandling;
    var skipNulls = typeof options.skipNulls === 'boolean' ? options.skipNulls : internals.skipNulls;
    var encode = typeof options.encode === 'boolean' ? options.encode : internals.encode;
    var sort = typeof options.sort === 'function' ? options.sort : null;
    var objKeys;
    var filter;
    if (typeof options.filter === 'function') {
        filter = options.filter;
        obj = filter('', obj);
    } else if (Array.isArray(options.filter)) {
        objKeys = filter = options.filter;
    }

    var keys = [];

    if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object' || obj === null) {

        return '';
    }

    var arrayFormat;
    if (options.arrayFormat in internals.arrayPrefixGenerators) {
        arrayFormat = options.arrayFormat;
    } else if ('indices' in options) {
        arrayFormat = options.indices ? 'indices' : 'repeat';
    } else {
        arrayFormat = 'indices';
    }

    var generateArrayPrefix = internals.arrayPrefixGenerators[arrayFormat];

    if (!objKeys) {
        objKeys = Object.keys(obj);
    }

    if (sort) {
        objKeys.sort(sort);
    }

    for (var i = 0, il = objKeys.length; i < il; ++i) {
        var key = objKeys[i];

        if (skipNulls && obj[key] === null) {

            continue;
        }

        keys = keys.concat(internals.stringify(obj[key], key, generateArrayPrefix, strictNullHandling, skipNulls, encode, filter, sort));
    }

    return keys.join(delimiter);
};

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function (qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr,
        vstr,
        k,
        v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var stringifyPrimitive = function stringifyPrimitive(v) {
  switch (typeof v === 'undefined' ? 'undefined' : _typeof(v)) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function (obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object') {
    return map(objectKeys(obj), function (k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function (v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);
  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq + encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map(xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.decode = exports.parse = __webpack_require__(14);
exports.encode = exports.stringify = __webpack_require__(15);

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

module.exports = {
  isString: function isString(arg) {
    return typeof arg === 'string';
  },
  isObject: function isObject(arg) {
    return (typeof arg === 'undefined' ? 'undefined' : _typeof(arg)) === 'object' && arg !== null;
  },
  isNull: function isNull(arg) {
    return arg === null;
  },
  isNullOrUndefined: function isNullOrUndefined(arg) {
    return arg == null;
  }
};

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var g;

// This works in non-strict mode
g = function () {
	return this;
}();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1, eval)("this");
} catch (e) {
	// This works if the window reference is available
	if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function (module) {
	if (!module.webpackPolyfill) {
		module.deprecate = function () {};
		module.paths = [];
		// module.parent = undefined by default
		if (!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function get() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function get() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PubSub = function () {
  function PubSub() {
    _classCallCheck(this, PubSub);

    this.container = [];
  }

  _createClass(PubSub, [{
    key: "push",
    value: function push(cb) {
      cb instanceof Function && this.container.push(cb);
    }
  }, {
    key: "resolve",
    value: function resolve(data) {
      var container = this.container;
      this.container = [];
      container.forEach(function (cb) {
        return cb(null, data);
      });
    }
  }, {
    key: "reject",
    value: function reject(err) {
      var container = this.container;
      this.container = [];
      container.forEach(function (cb) {
        return cb(err);
      });
    }
  }]);

  return PubSub;
}();

exports.default = PubSub;
module.exports = exports["default"];

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  var data = void 0;
  var hasData = false;
  return {
    set: function set(val) {
      if (!hasData) {
        data = val;
        hasData = true;
        return true;
      }
      return false;
    },
    empty: function empty() {
      return !hasData;
    },
    pop: function pop() {
      if (hasData) {
        hasData = false;
        var result = data;
        data = null;
        return result;
      }
    }
  };
};

module.exports = exports["default"];

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = fetchResolver;
function none() {}

function fetchResolver() {
  var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var cb = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : none;

  if (!opts.prefetch || index >= opts.prefetch.length) {
    cb();
  } else {
    opts.prefetch[index](opts, function (err) {
      return err ? cb(err) : fetchResolver(index + 1, opts, cb);
    });
  }
}
module.exports = exports["default"];

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.none = none;
exports.extractArgs = extractArgs;
exports.helperCrudFunction = helperCrudFunction;
exports.defaultMiddlewareArgsParser = defaultMiddlewareArgsParser;
function none() {}

function extractArgs(args) {
  var pathvars = void 0;
  var params = {};
  var callback = void 0;
  if (args[0] instanceof Function) {
    callback = args[0];
  } else if (args[1] instanceof Function) {
    pathvars = args[0];
    callback = args[1];
  } else {
    pathvars = args[0];
    params = args[1];
    callback = args[2] || none;
  }
  return [pathvars, params, callback];
}

function helperCrudFunction(name) {
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var _extractArgs = extractArgs(args),
        _extractArgs2 = _slicedToArray(_extractArgs, 3),
        pathvars = _extractArgs2[0],
        params = _extractArgs2[1],
        cb = _extractArgs2[2];

    return [pathvars, _extends({}, params, { method: name.toUpperCase() }), cb];
  };
}

function defaultMiddlewareArgsParser(dispatch, getState) {
  return { dispatch: dispatch, getState: getState };
}

var CRUD = exports.CRUD = ["get", "post", "put", "delete", "patch"].reduce(function (memo, name) {
  memo[name] = helperCrudFunction(name);
  return memo;
}, {});

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = urlTransform;

var _qs = __webpack_require__(11);

var _qs2 = _interopRequireDefault(_qs);

var _url = __webpack_require__(2);

var _omit = __webpack_require__(26);

var _omit2 = _interopRequireDefault(_omit);

var _merge = __webpack_require__(3);

var _merge2 = _interopRequireDefault(_merge);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint no-useless-escape: 0 */
var rxClean = /(\(:[^\)]+\)|:[^\/]+\/?)/g;

/**
 * Url modification
 * @param  {String} url     url template
 * @param  {Object} params  params for url template
 * @param  {Object} options transformation options, accepts +delimiter+, +arrayFormat+,
 *                          +qsStringifyOptions+ and +qsParseOptions+
 * @return {String}         result url
 */
function urlTransform(url, params, options) {
  if (!url) {
    return "";
  }
  params || (params = {});
  var usedKeys = {};
  var urlWithParams = Object.keys(params).reduce(function (url, key) {
    var value = params[key];
    var rx = new RegExp("(\\(:" + key + "\\)|:" + key + ")(/?)", "g");
    return url.replace(rx, function (_, _1, slash) {
      usedKeys[key] = value;
      return value ? value + slash : value;
    });
  }, url);

  if (!urlWithParams) {
    return urlWithParams;
  }

  var _parse = (0, _url.parse)(urlWithParams),
      protocol = _parse.protocol,
      host = _parse.host,
      path = _parse.path;

  var cleanURL = host ? protocol + "//" + host + path.replace(rxClean, "") : path.replace(rxClean, "");
  var usedKeysArray = Object.keys(usedKeys);
  if (usedKeysArray.length !== Object.keys(params).length) {
    var urlObject = cleanURL.split("?");
    options || (options = {});
    var _options = options,
        arrayFormat = _options.arrayFormat,
        delimiter = _options.delimiter;

    var qsParseOptions = _extends({
      arrayFormat: arrayFormat,
      delimiter: delimiter
    }, options.qsParseOptions);
    var mergeParams = (0, _merge2.default)(urlObject[1] && _qs2.default.parse(urlObject[1], qsParseOptions), (0, _omit2.default)(params, usedKeysArray));
    var qsStringifyOptions = _extends({
      arrayFormat: arrayFormat,
      delimiter: delimiter
    }, options.qsStringifyOptions);
    var urlStringParams = _qs2.default.stringify(mergeParams, qsStringifyOptions);
    return urlObject[0] + "?" + urlStringParams;
  }
  return cleanURL;
}
module.exports = exports["default"];

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/* eslint no-void: 0 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function isEmpty(name) {
  return name === "" || name === null || name === void 0;
}

function get(obj) {
  for (var _len = arguments.length, path = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    path[_key - 1] = arguments[_key];
  }

  return path.reduce(function (memo, name) {
    return Array.isArray(name) ? get.apply(undefined, [memo].concat(_toConsumableArray(name))) : isEmpty(name) ? memo : memo && memo[name];
  }, obj);
}

exports.default = get;
module.exports = exports["default"];

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = function (object, props) {
  if (!Array.isArray(props)) {
    return _extends({}, object);
  }

  return Object.keys(object || {}).reduce(function (memo, key) {
    if (props.indexOf(key) === -1) {
      memo[key] = object[key];
    }
    return memo;
  }, {});
};

module.exports = exports["default"];

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/* eslint no-void: 0 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = reduxApi;

var _reducerFn = __webpack_require__(7);

var _reducerFn2 = _interopRequireDefault(_reducerFn);

var _actionFn = __webpack_require__(5);

var _actionFn2 = _interopRequireDefault(_actionFn);

var _transformers = __webpack_require__(8);

var _transformers2 = _interopRequireDefault(_transformers);

var _async = __webpack_require__(6);

var _async2 = _interopRequireDefault(_async);

var _cache = __webpack_require__(0);

var _cache2 = _interopRequireDefault(_cache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// export { transformers, async };

/**
 * Default configuration for each endpoint
 * @type {Object}
 */
var defaultEndpointConfig = {
  transformer: _transformers2.default.object
};

var PREFIX = "@@redux-api";
/**
 * Entry api point
 * @param {Object} config Rest api configuration
 * @param {Object} baseConfig baseConfig settings for Rest api
 * @param {Function} fetch Adapter for rest requests
 * @param {Boolean} isServer false by default (fif you want to use it for isomorphic apps)
 * @return {actions, reducers}        { actions, reducers}
 * @example ```js
 *   const api = reduxApi({
 *     test: "/plain/url",
 *     testItem: "/plain/url/:id",
 *     testModify: {
 *       url: "/plain/url/:endpoint",

 *       transformer: (data)=> !data ?
 *          { title: "", message: "" } :
 *          { title: data.title, message: data.message },
 *       options: {
 *         method: "post"
 *         headers: {
 *           "Accept": "application/json",
 *           "Content-Type": "application/json"
 *         }
 *       }
 *     }
 *   });
 *   // register reducers
 *
 *   // call actions
 *   dispatch(api.actions.test());
 *   dispatch(api.actions.testItem({id: 1}));
 *   dispatch(api.actions.testModify({endpoint: "upload-1"}, {
 *     body: JSON.stringify({title: "Hello", message: "World"})
 *   }));
 * ```
 */

function reduxApi(config, baseConfig) {
  config || (config = {});

  var fetchHolder = {
    fetch: null,
    server: false,
    rootUrl: null,
    middlewareParser: null,
    options: {},
    responseHandler: null
  };

  var cfg = {
    use: function use(key, value) {
      fetchHolder[key] = value;

      return this;
    },
    init: function init(fetch) {
      var isServer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var rootUrl = arguments[2];

      /* eslint no-console: 0 */
      console.warn("Deprecated method, use `use` method");
      this.use("fetch", fetch);
      this.use("server", isServer);
      this.use("rootUrl", rootUrl);
      return this;
    },

    actions: {},
    reducers: {},
    events: {}
  };
  function fnConfigCallback(memo, value, key) {
    var opts = (typeof value === "undefined" ? "undefined" : _typeof(value)) === "object" ? _extends({}, defaultEndpointConfig, { reducerName: key }, value) : _extends({}, defaultEndpointConfig, { reducerName: key, url: value });

    if (opts.broadcast !== void 0) {
      /* eslint no-console: 0 */
      console.warn("Deprecated `broadcast` option. you shoud use `events`" + "to catch redux-api events (see https://github.com/lexich/redux-api/blob/master/DOCS.md#Events)");
    }

    var url = opts.url,
        urlOptions = opts.urlOptions,
        options = opts.options,
        transformer = opts.transformer,
        broadcast = opts.broadcast,
        crud = opts.crud,
        reducerName = opts.reducerName,
        prefetch = opts.prefetch,
        postfetch = opts.postfetch,
        validation = opts.validation,
        helpers = opts.helpers;


    var prefix = baseConfig && baseConfig.prefix || "";

    var ACTIONS = {
      actionFetch: PREFIX + "@" + prefix + reducerName,
      actionSuccess: PREFIX + "@" + prefix + reducerName + "_success",
      actionFail: PREFIX + "@" + prefix + reducerName + "_fail",
      actionReset: PREFIX + "@" + prefix + reducerName + "_delete",
      actionCache: PREFIX + "@" + prefix + reducerName + "_cache",
      actionAbort: PREFIX + "@" + prefix + reducerName + "_abort"
    };

    var fetch = opts.fetch ? opts.fetch : function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return fetchHolder.fetch.apply(this, args);
    };

    var meta = {
      holder: fetchHolder,
      virtual: !!opts.virtual,
      actions: memo.actions,
      cache: (0, _cache2.default)(opts.cache),
      urlOptions: urlOptions,
      fetch: fetch,
      broadcast: broadcast,
      reducerName: reducerName,
      prefetch: prefetch,
      postfetch: postfetch,
      validation: validation,
      helpers: helpers,
      transformer: transformer,
      prefix: prefix,
      crud: crud
    };

    memo.actions[key] = (0, _actionFn2.default)(url, key, options, ACTIONS, meta);

    if (!meta.virtual && !memo.reducers[reducerName]) {
      var data = transformer();
      var sync = false;
      var syncing = false;
      var loading = false;
      var initialState = opts.cache ? { sync: sync, syncing: syncing, loading: loading, data: data, cache: {}, request: null } : { sync: sync, syncing: syncing, loading: loading, data: data, request: null };

      var reducer = opts.reducer ? opts.reducer.bind(memo) : null;
      memo.reducers[reducerName] = (0, _reducerFn2.default)(initialState, ACTIONS, reducer);
    }
    memo.events[reducerName] = ACTIONS;
    return memo;
  }

  return Object.keys(config).reduce(function (memo, key) {
    return fnConfigCallback(memo, config[key], key, config);
  }, cfg);
}

reduxApi.transformers = _transformers2.default;
reduxApi.async = _async2.default;
module.exports = exports["default"];

/***/ })
/******/ ]);
});