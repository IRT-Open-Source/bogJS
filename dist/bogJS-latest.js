(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
"use strict";

global.__BROWSERIFY_META_DATA__GIT_VERSION = "b251f86 v0.4.2";
global.__BROWSERIFY_META_DATA__CREATED_AT = "Wed Sep 26 2018 15:01:39 GMT+0200 (Mitteleuropäische Sommerzeit)";

// making the objects globally available
window.ChannelOrderTest = require('./src/channelorder_test');
window.AudioData = require('./src/html5_player/core').AudioData;
window.IRTPlayer = require('./src/html5_player/core').IRTPlayer;
window.GainController = require('./src/gain_controller');
window.MediaElementController = require('./src/media_controller');
window.ObjectController = require('./src/object');
window.ObjectManager = require('./src/object_manager');
window.SceneReader = require('./src/scene_reader');
//window.UIManager = require('./src/ui');

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./src/channelorder_test":6,"./src/gain_controller":7,"./src/html5_player/core":8,"./src/media_controller":9,"./src/object":10,"./src/object_manager":11,"./src/scene_reader":12}],2:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],3:[function(require,module,exports){
//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind,
    nativeCreate       = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.8.3';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value)) return _.matcher(value);
    return _.property(value);
  };
  _.iteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, undefinedOnly) {
    return function(obj) {
      var length = arguments.length;
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = property('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  function createReduce(dir) {
    // Optimized iterator function as using arguments.length
    // in the main function will deoptimize the, see #1991.
    function iterator(obj, iteratee, memo, keys, index, length) {
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    }

    return function(obj, iteratee, memo, context) {
      iteratee = optimizeCb(iteratee, context, 4);
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      // Determine the initial value if none is provided.
      if (arguments.length < 3) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      return iterator(obj, iteratee, memo, keys, index, length);
    };
  }

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var key;
    if (isArrayLike(obj)) {
      key = _.findIndex(obj, predicate, context);
    } else {
      key = _.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      var func = isFunc ? method : value[method];
      return func == null ? func : func.apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = isArrayLike(obj) ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, startIndex) {
    var output = [], idx = 0;
    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        if (!shallow) value = flatten(value, shallow, strict);
        var j = 0, len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(arguments, true, true, 1);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    return _.unzip(arguments);
  };

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions
  function createPredicateIndexFinder(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  }

  // Returns the first index on an array-like that passes a predicate test
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions
  function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
            i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  }

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var args = slice.call(arguments, 2);
    var bound = function() {
      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  function collectNonEnumProps(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  }

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object
  // In contrast to _.map it returns an object
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys =  _.keys(obj),
          length = keys.length,
          results = {},
          currentKey;
      for (var index = 0; index < length; index++) {
        currentKey = keys[index];
        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
      }
      return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s)
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(object, oiteratee, context) {
    var result = {}, obj = object, iteratee, keys;
    if (obj == null) return result;
    if (_.isFunction(oiteratee)) {
      keys = _.allKeys(obj);
      iteratee = optimizeCb(oiteratee, context);
    } else {
      keys = flatten(arguments, false, false, 1);
      iteratee = function(value, key, obj) { return key in obj; };
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(flatten(arguments, false, false, 1), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), and in Safari 8 (#1929).
  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = property;

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    return obj == null ? function(){} : function(key) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property, fallback) {
    var value = object == null ? void 0 : object[property];
    if (value === void 0) {
      value = fallback;
    }
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return '' + this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}.call(this));

},{}],4:[function(require,module,exports){
var WAAClock = require('./lib/WAAClock')

module.exports = WAAClock
if (typeof window !== 'undefined') window.WAAClock = WAAClock

},{"./lib/WAAClock":5}],5:[function(require,module,exports){
(function (process){
var isBrowser = (typeof window !== 'undefined')

var CLOCK_DEFAULTS = {
  toleranceLate: 0.10,
  toleranceEarly: 0.001
}

// ==================== Event ==================== //
var Event = function(clock, deadline, func) {
  this.clock = clock
  this.func = func
  this._cleared = false // Flag used to clear an event inside callback

  this.toleranceLate = clock.toleranceLate
  this.toleranceEarly = clock.toleranceEarly
  this._latestTime = null
  this._earliestTime = null
  this.deadline = null
  this.repeatTime = null

  this.schedule(deadline)
}

// Unschedules the event
Event.prototype.clear = function() {
  this.clock._removeEvent(this)
  this._cleared = true
  return this
}

// Sets the event to repeat every `time` seconds.
Event.prototype.repeat = function(time) {
  if (time === 0)
    throw new Error('delay cannot be 0')
  this.repeatTime = time
  if (!this.clock._hasEvent(this))
    this.schedule(this.deadline + this.repeatTime)
  return this
}

// Sets the time tolerance of the event.
// The event will be executed in the interval `[deadline - early, deadline + late]`
// If the clock fails to execute the event in time, the event will be dropped.
Event.prototype.tolerance = function(values) {
  if (typeof values.late === 'number')
    this.toleranceLate = values.late
  if (typeof values.early === 'number')
    this.toleranceEarly = values.early
  this._refreshEarlyLateDates()
  if (this.clock._hasEvent(this)) {
    this.clock._removeEvent(this)
    this.clock._insertEvent(this)
  }
  return this
}

// Returns true if the event is repeated, false otherwise
Event.prototype.isRepeated = function() { return this.repeatTime !== null }

// Schedules the event to be ran before `deadline`.
// If the time is within the event tolerance, we handle the event immediately.
// If the event was already scheduled at a different time, it is rescheduled.
Event.prototype.schedule = function(deadline) {
  this._cleared = false
  this.deadline = deadline
  this._refreshEarlyLateDates()

  if (this.clock.context.currentTime >= this._earliestTime) {
    this._execute()
  
  } else if (this.clock._hasEvent(this)) {
    this.clock._removeEvent(this)
    this.clock._insertEvent(this)
  
  } else this.clock._insertEvent(this)
}

Event.prototype.timeStretch = function(tRef, ratio) {
  if (this.isRepeated())
    this.repeatTime = this.repeatTime * ratio

  var deadline = tRef + ratio * (this.deadline - tRef)
  // If the deadline is too close or past, and the event has a repeat,
  // we calculate the next repeat possible in the stretched space.
  if (this.isRepeated()) {
    while (this.clock.context.currentTime >= deadline - this.toleranceEarly)
      deadline += this.repeatTime
  }
  this.schedule(deadline)
}

// Executes the event
Event.prototype._execute = function() {
  if (this.clock._started === false) return
  this.clock._removeEvent(this)

  if (this.clock.context.currentTime < this._latestTime)
    this.func(this)
  else {
    if (this.onexpired) this.onexpired(this)
    console.warn('event expired')
  }
  // In the case `schedule` is called inside `func`, we need to avoid
  // overrwriting with yet another `schedule`.
  if (!this.clock._hasEvent(this) && this.isRepeated() && !this._cleared)
    this.schedule(this.deadline + this.repeatTime) 
}

// Updates cached times
Event.prototype._refreshEarlyLateDates = function() {
  this._latestTime = this.deadline + this.toleranceLate
  this._earliestTime = this.deadline - this.toleranceEarly
}

// ==================== WAAClock ==================== //
var WAAClock = module.exports = function(context, opts) {
  var self = this
  opts = opts || {}
  this.tickMethod = opts.tickMethod || 'ScriptProcessorNode'
  this.toleranceEarly = opts.toleranceEarly || CLOCK_DEFAULTS.toleranceEarly
  this.toleranceLate = opts.toleranceLate || CLOCK_DEFAULTS.toleranceLate
  this.context = context
  this._events = []
  this._started = false
}

// ---------- Public API ---------- //
// Schedules `func` to run after `delay` seconds.
WAAClock.prototype.setTimeout = function(func, delay) {
  return this._createEvent(func, this._absTime(delay))
}

// Schedules `func` to run before `deadline`.
WAAClock.prototype.callbackAtTime = function(func, deadline) {
  return this._createEvent(func, deadline)
}

// Stretches `deadline` and `repeat` of all scheduled `events` by `ratio`, keeping
// their relative distance to `tRef`. In fact this is equivalent to changing the tempo.
WAAClock.prototype.timeStretch = function(tRef, events, ratio) {
  events.forEach(function(event) { event.timeStretch(tRef, ratio) })
  return events
}

// Removes all scheduled events and starts the clock 
WAAClock.prototype.start = function() {
  if (this._started === false) {
    var self = this
    this._started = true
    this._events = []

    if (this.tickMethod === 'ScriptProcessorNode') {
      var bufferSize = 256
      // We have to keep a reference to the node to avoid garbage collection
      this._clockNode = this.context.createScriptProcessor(bufferSize, 1, 1)
      this._clockNode.connect(this.context.destination)
      this._clockNode.onaudioprocess = function () {
        process.nextTick(function() { self._tick() })
      }
    } else if (this.tickMethod === 'manual') null // _tick is called manually

    else throw new Error('invalid tickMethod ' + this.tickMethod)
  }
}

// Stops the clock
WAAClock.prototype.stop = function() {
  if (this._started === true) {
    this._started = false
    this._clockNode.disconnect()
  }  
}

// ---------- Private ---------- //

// This function is ran periodically, and at each tick it executes
// events for which `currentTime` is included in their tolerance interval.
WAAClock.prototype._tick = function() {
  var event = this._events.shift()

  while(event && event._earliestTime <= this.context.currentTime) {
    event._execute()
    event = this._events.shift()
  }

  // Put back the last event
  if(event) this._events.unshift(event)
}

// Creates an event and insert it to the list
WAAClock.prototype._createEvent = function(func, deadline) {
  return new Event(this, deadline, func)
}

// Inserts an event to the list
WAAClock.prototype._insertEvent = function(event) {
  this._events.splice(this._indexByTime(event._earliestTime), 0, event)
}

// Removes an event from the list
WAAClock.prototype._removeEvent = function(event) {
  var ind = this._events.indexOf(event)
  if (ind !== -1) this._events.splice(ind, 1)
}

// Returns true if `event` is in queue, false otherwise
WAAClock.prototype._hasEvent = function(event) {
 return this._events.indexOf(event) !== -1
}

// Returns the index of the first event whose deadline is >= to `deadline`
WAAClock.prototype._indexByTime = function(deadline) {
  // performs a binary search
  var low = 0
    , high = this._events.length
    , mid
  while (low < high) {
    mid = Math.floor((low + high) / 2)
    if (this._events[mid]._earliestTime < deadline)
      low = mid + 1
    else high = mid
  }
  return low
}

// Converts from relative time to absolute time
WAAClock.prototype._absTime = function(relTime) {
  return relTime + this.context.currentTime
}

// Converts from absolute time to relative time 
WAAClock.prototype._relTime = function(absTime) {
  return absTime - this.context.currentTime
}
}).call(this,require('_process'))

},{"_process":2}],6:[function(require,module,exports){
'use strict';

/*jshint esversion: 6 */
/**
 * @file channelorder_test.js
 * @author Michael Weitnauer: {@link weitnauer@irt.de}
 */

/**
 * @module bogJS
 */

var _ = require('underscore');

/**
 * GainController
 * @constructor
 *
 * @param ctx - Web Audio API Audio Context instance
 * @param [targetNode=ctx.destination] - Web Audio API node to which the
 * output of the GainController shall be connected to.
 */

/**
 * ChannelOrderTest will start loading, deconding and playing as soon as the
 * instance of the class is created. The test files will be looped and for
 * each loop, the [testChs]{@link module:bogJS~ChannelOrderTest#testChs} method
 * is called. If the test file has been played five times and no order could
 * be detected, the default order will be triggered.
 * @constructor
 *
 * @param {String} container - to be tested file extension w/o dot ("mp4")
 * @param {Number} tracks - To be tested channel number for container
 * @param {Object.<AudioContext>} [ctx=AudioContext] - if no AudioContext
 *      instance is passed, it will be created.
 * @param {String} [root="signals/order"] - path to test encoded files
 * @fires module:bogJS~ChannelOrderTest#order_ready
 */
var ChannelOrderTest = function ChannelOrderTest(container, tracks, ctx) {
    var root = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "signals/order/";

    if (typeof ctx === 'undefined') {
        if (typeof AudioContext !== 'undefined') {
            var ctx = new AudioContext();
        } else if (typeof webkitAudioContext !== 'undefined') {
            var ctx = new webkitAudioContext();
        } else {
            alert("Your browser doesn't support the Web Audio API!");
        }
    }
    /** @var {Object.<AudioContext>} */
    this.ctx = ctx;

    this._tracks = parseInt(tracks);
    this._splitter = this.ctx.createChannelSplitter(this._tracks);
    this.analysers = [];
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.value = 0;
    this.gainNode.connect(this.ctx.destination);

    for (var i = 0; i < this._tracks; i++) {
        this.analysers[i] = this.ctx.createAnalyser();
        this.analysers[i].fftSize = 2048; // "hard-coded" due to Safari -> analyser chrashes if fftSize value is greater than 2048
        this._splitter.connect(this.analysers[i], i);
        this.analysers[i].connect(this.gainNode);
    }
    //var root = root || "http://lab.irt.de/demos/order/";
    if (container === "webm") {
        // we assume opus if webm is used
        container = "opus";
    }
    var url = root + tracks + "chs." + container;
    this._loadSound(url);
};

ChannelOrderTest.prototype = {
    /**
     * Load and test passed audio signal
     *
     * @protected
     * @param {string} url - URL
     */
    _loadSound: function _loadSound(url) {
        this.audio = document.createElement('audio');
        this.audio.src = url;
        this.audio.loop = true;
        this.audio.load();
        this.mediaElement = this.ctx.createMediaElementSource(this.audio);
        this.mediaElement.connect(this._splitter);
        this.audio.play();
        var last_unique = [];

        this.audio.onended = function () {
            console.debug("ChannelOrderTest Playback ended");
        };

        // onplay will be fired once the audio playback started
        $(this.audio).on("play", function () {
            var _this = this;

            console.debug("Channel order testfile started...");
            // this is a fix to make the channel order test working on Firefox
            // the initial attempt (listen on "playing") did no more in FF after
            // an update.

            var _loop = function _loop(i, _p) {
                _p = _p.then(function () {
                    return new Promise(function (resolve) {
                        return setTimeout(function () {
                            var order = this.testChs();
                            var unique = _.unique(order);
                            // the returned order should be identical for two consecutive calls
                            // to make sure we have a reliable result
                            if (unique.length === this._tracks && _.isEqual(last_unique, unique)) {
                                console.info('Channel order detected: ' + order);
                                /**
                                 * If channel order was detected and ensured, the event is
                                 * fired with channel order as array.
                                 * @event module:bogJS~ChannelOrderTest#order_ready
                                 * @property {Number[]} order - Array containing the detected
                                 * order
                                 */
                                $(document).triggerHandler('order_ready', [order]);
                                this.audio.pause();
                                return;
                            } else if (unique.length === this._tracks) {
                                last_unique = unique;
                            }
                            console.debug("Channel order not yet detected. Iteration:  " + i);
                            if (i >= 9) {
                                console.warn("Channel order not detectable. Stopping indentfication and trigger default values.");
                                order = _.range(this._tracks);
                                $(document).triggerHandler('order_ready', [order]);
                                this.audio.pause();
                            }
                            resolve();
                        }.bind(_this), 500);
                    });
                });
                p = _p;
            };

            for (var i = 0, p = Promise.resolve(); i < 10; i++) {
                _loop(i, p);
            }
        }.bind(this, last_unique));
    },

    /**
     * Save frequency bins to arrays for later analysis
     * @protected
     * @returns {Number[]}  Nested array (Float32Array) containing the frequency
     * bins for each channel
     */
    _getFreqData: function _getFreqData() {
        var freqBins = [];
        var freqBinaryBins = [];
        for (var i = 0; i < this._tracks; i++) {
            // Float32Array should be the same length as the frequencyBinCount
            freqBins[i] = new Float32Array(this.analysers[i].frequencyBinCount);
            // fill the Float32Array with data returned from getFloatFrequencyData()
            this.analysers[i].getFloatFrequencyData(freqBins[i]);
        }
        return freqBins;
    },

    /**
     * Will conduct the detection of the channel order.
     * @returns {Number[]}  Array containing the detected. e.g. [0, 3, 1, 2]
     * channel order
     */
    testChs: function testChs() {
        var freqBins = this._getFreqData();
        var indices = [];
        for (var i = 0; i < freqBins.length; i++) {
            var idx = _.indexOf(freqBins[i], _.max(freqBins[i]));
            indices[i] = idx;
        }
        console.debug("Decoded indices: " + indices);
        // to avoid the array is mutated and numerical sorted
        var sorted_indices = indices.concat().sort(function (a, b) {
            return a - b;
        });
        console.debug("Sorted indices: " + sorted_indices);
        var normalized_indices = [];
        for (var i = 0; i < indices.length; i++) {
            normalized_indices[i] = _.indexOf(sorted_indices, indices[i]);
        }
        return normalized_indices;
    },

    /**
    * Explicit play function for mobile devices which will not start the media
    * element automatically without user gesture.
    */
    playAudio: function playAudio() {
        this.audio.play();
    }
};

module.exports = ChannelOrderTest;

},{"underscore":3}],7:[function(require,module,exports){
"use strict";

/*jshint esversion: 6 */
/**
 * @file media_controller.js
 * @author Michael Weitnauer: {@link weitnauer@irt.de}
 */

/**
 * @module bogJS
 *
 */

/**
 * GainController
 * @constructor
 *
 * @param ctx - Web Audio API Audio Context instance
 * @param [targetNode=ctx.destination] - Web Audio API node to which the
 * output of the GainController shall be connected to.
 */

var GainController = function GainController(ctx) {
    var targetNode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ctx.destination;

    this._gain = 1;
    this.gainNode = ctx.createGain();

    // Experimental highpass to avoid sizzling noinse while chaning view / angle
    //this.highpass = ctx.createBiquadFilter();
    //this.highpass.type = "highpass";
    //this.highpass.connect(this.gainNode);
    //this.setHighpassFreq(80);

    // FIXME: if applied here, the gainNode stays
    // connected with ctx.destination:
    this.connect(targetNode);
};

GainController.prototype = {

    /**
     * Mutes the node object
     *
     */
    mute: function mute() {
        this.setGain(0);
    },

    /**
     * Unmutes node object
     *
     */
    unmute: function unmute() {
        this.setGain(1);
    },

    /**
     * setGain
     *
     * @param {Float} val - Values between 0 and 1
     */
    setGain: function setGain(val) {
        this.gainNode.gain.value = val;
        this._gain = this.getGain();
    },

    /**
     * getGain
     *
     * @returns {Float} gain - Float value between 0 and 1
     */
    getGain: function getGain() {
        return this.gainNode.gain.value;
    },

    /**
    * Disconnects and reconnects {@link GainController} instance to passed
    * AudioNode(s)
    *
    * @param {(Object|Object[])} nodes - Single of array of AudioNodes to which
    * the {@link MediaElementController} instance shall be reconnected.
    */
    reconnect: function reconnect(nodes) {
        this.disconnect();
        this.connect(nodes);
    },

    /**
     * connect
     *
     * @param {(Object|Object[])} nodes - one or multple Web Audio API nodes to
     * which the output of the GainController instance shall be connected to.
     */
    connect: function connect(nodes) {
        console.debug("Connecting GainController to " + nodes);
        if (Object.prototype.toString.call(nodes) != "[object Array]") {
            // == single Node
            this.gainNode.connect(nodes);
        } else {
            // == array of Nodes
            for (var i = 0; i < nodes.length; i++) {
                this.gainNode.connect(nodes[i]);
            }
        }
    },

    /**
    * This method will disconnect output of the {@link GainController} instance from
    * a given node or all connected nodes if node is not given/undefined.
    */
    disconnect: function disconnect(node) {
        //console.debug("Disconnecting ", this, " from ", node);
        this.gainNode.disconnect(node);
    },

    setHighpassFreq: function setHighpassFreq(freq) {
        //this.highpass.frequency.value = freq;
    }
};

module.exports = GainController;

},{}],8:[function(require,module,exports){
"use strict";

/**
 * @file irtPlayer_new.js
 * @author Michael Weitnauer: {@link weitnauer@irt.de}
 */

/**
 * @license
 * ----------------------------------------------------------------------------
 * irtPlayer, a Javascript HTML5 Audio library for comparing audio files gaplessly
 * v2.0.0
 * Licensed under the MIT license.
 * http://www.irt.de
 * ----------------------------------------------------------------------------
 * Copyright (C) 2015 Institut für Rundfunktechnik GmbH
 * http://www.irt.de
 * ----------------------------------------------------------------------------
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files ( the "Software" ), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * ----------------------------------------------------------------------------
 */

/**
 * @module irtPlayer
 *
 */

/**
 * Represents AudioData class which has all the logic to control an
 * audio signal
 *
 * @constructor
 *
 * @param {Object} ctx - An AudioContext instance.
 * @param {string} url - URL of the audio source (with or without
 * extension).
 * @param {Object} [targetNode=ctx.destination] - The audio node to which the AudioData
 * instance shall be connected
 * @param {boolean} [checkSupportFlag=true] - Enable / disable extension
 * support for passed url (see [AudioData._checkExtension]{@link AudioData#_checkExtension})
 *
 * @fires module:irtPlayer~AudioData#audio_init
 * @fires module:irtPlayer~AudioData#audio_loaded
 * @fires module:irtPlayer~AudioData#audio_ended
 */

var AudioData = function AudioData(ctx, url, targetNode, checkSupportFlag) {
    /** @protected
     * @var {boolean} */
    this.canplay = false;
    var checkSupportFlag = checkSupportFlag || true;
    if (checkSupportFlag == true) {
        var url = this._checkExtension(url);
    }
    /** @var {Object.<AudioContext>} */
    this.ctx = ctx;
    this.url = url;

    this._playing = false;
    this._looping = true;
    this._rangeStart = 0;
    this._rangeEnd = 0;
    this._startTime = 0;
    this._startOffset = 0;

    /** @var {Object.<GainNode>} */
    this.gainNode = this.ctx.createGain();
    this.gain = this.getGain();
    var targetNode = targetNode || this.ctx.destination;
    this.gainNode.connect(targetNode); // FF either refuses to break this connection or simply displays a no more existing connection..
};

AudioData.prototype = {

    /**
     * Create instance of new AudioBufferSource every time {@link
     * AudioData#play} is called and initialize it.
     *
     * @protected
     */
    _initBuffer: function _initBuffer() {
        this.audio = this.ctx.createBufferSource();
        this.audio.loop = this._looping;
        //this.audio.loop = false;  // workaround to compensate Chrome behavior. see comment in play()
        this.audio.buffer = this._buffer;
        this.audio.connect(this.gainNode);
        this.audio.loopStart = this._rangeStart;
        this.audio.loopEnd = this._rangeEnd;
        this.audio.onended = this._onendedHandler.bind(this);

        /**
         * Will be fired once the new AudioBufferSource has been
         * initilized.
         * @event module:irtPlayer~AudioData#audio_init
         */
        $(this).triggerHandler("audio_init");
    },

    /**
     * Will be called if AudioBufferSource instance has ended
     *
     * @protected
     */
    _onendedHandler: function _onendedHandler() {
        //console.debug("Audio buffer has ended!");
        this._playing = false;
        //this._startOffset = 0;

        /**
         * Will be fired once the playback has ended
         * @event module:irtPlayer~AudioData#audio_ended
         */
        $(this).triggerHandler("audio_ended");
    },

    load: function load() {
        this._loadSound(this.url);
    },

    /**
    * Start playback of audio signal
    *
    * @param {number} [pos] - Position from which the playback shall start
    * (optional)
    */
    play: function play(pos) {
        if (this._playing == false && this.canplay) {
            this._initBuffer();
            this._startTime = this.audio.context.currentTime;
            console.debug("Start time: " + this._startTime);
            if (typeof pos != 'number') {
                // detection with _.isNumber() could be more robust
                var buffer_duration = this._buffer.duration;
                var offset = (this._rangeStart + this._startOffset) % buffer_duration;
                var duration = this._rangeEnd - offset;
                console.debug("Offset: " + offset + "   Duration: " + duration);

                // Passing a duration to start() causes undefined
                // situation in current versions of Chrome. FF, Safari
                // and Opera seem to treat this situation properly. See
                // also https://github.com/WebAudio/web-audio-api/issues/421
                this.audio.start(0, offset, duration);
                //this.audio.start(0, offset);
            } else {
                console.debug("Starting playback at " + pos);
                this._startOffset = pos;
                var duration = this._rangeEnd - pos;
                this.audio.start(0, pos, duration);
            }
            // workaround to force looping in Chrome. see comment above.
            // Chrome seems to ignore looping state if duration is
            // passed. --> init() with loop = false, then set "real"
            // loop state here:
            //this.audio.loop = this._looping;
            this._playing = true;
        }
    },

    /**
     * Pause playback  - will only be executed if {@link
     * AudioData#_playing} flag is true.
     *
     */
    pause: function pause() {
        if (this._playing == true) {
            this.audio.stop(0);
            // Measure how much time passed since the last pause.
            this._startOffset += this.audio.context.currentTime - this._startTime;
            this._playing = false;
            console.debug("Start offset: " + this._startOffset);
        }
    },

    /**
     * Stops playback - if method is called during the playback
     * is stopped, the thrown error will be catched.
     */
    stop: function stop() {
        try {
            this.audio.stop(0);
            this._startOffset = 0;
            this._playing = false;
        } catch (err) {
            console.warn("Can't stop audio.. " + err);
        }
    },

    /**
     * Sets gain of {@link AudioData} instance
     *
     * @param {float} gain - Value between 0.0 and 1.0
     */
    setGain: function setGain(gain) {
        if (gain >= 0.0 && gain <= 1.0) {
            this.gainNode.gain.value = gain;
            this.gain = this.gainNode.gain.value; // avoids that we accept uncompatible values
        } else {
            console.warn("Gain values must be between 0 and 1");
        }
    },

    /**
     * Returns current gain value of {@link AudioData} instance
     *
     * @return {float} value - Float gain value
     */
    getGain: function getGain() {
        return this.gainNode.gain.value; // or do we trust in this.gain ??
    },

    /**
     * Disables / enables the loop of the {@link AudioData} instance
     */
    toggleLoop: function toggleLoop() {
        if (this._looping == false) {
            this._looping = true;
        } else {
            this._looping = false;
        }
        try {
            //this.pause();
            this.audio.loop = this._looping;
            //this.play();
        } catch (err) {
            console.warn("Can't set loop state: " + err);
        }
    },

    /**
     * Disables / enables the loop of the {@link AudioData} instance
     */
    setLoopState: function setLoopState(bool) {
        this._looping = bool;
        try {
            //this.pause();
            this.audio.loop = this._looping;
            //this.play();
        } catch (err) {
            console.warn("Can't set loop state: " + err);
        }
    },

    /**
     * Sets start position for playback
     *
     * @param {float} pos  - Start playback always at passed
     * position
     */
    setRangeStart: function setRangeStart(pos) {
        pos = parseFloat(pos);
        if (pos >= 0) {
            pos = pos;
        } else {
            pos = 0;
        }
        this._rangeStart = pos;
        try {
            this.audio.loopStart = this._rangeStart;
            console.debug("Loop start: " + pos);
        } catch (err) {
            console.warn("Can't set loop start yet.." + err);
        }
    },

    /**
     * Sets end position for playback
     *
     * @param {float} pos  - Playback end always at passed
     * position
     */
    setRangeEnd: function setRangeEnd(pos) {
        pos = parseFloat(pos);
        if (pos <= this._buffer.duration) {
            pos = pos;
        } else {
            pos = this._buffer.duration;
        }
        this._rangeEnd = pos;
        try {
            this.audio.loopEnd = this._rangeEnd;
            console.debug("Loop end: " + pos);
        } catch (err) {
            console.warn("Can't set loop start yet.." + err);
        }
    },

    /**
     * Mutes {@link AudioData} instance
     */
    mute: function mute() {
        this.setGain(0.0);
    },

    /**
     * Unmutes {@link AudioData} instance
     */
    unmute: function unmute() {
        this.setGain(1.0);
    },

    /**
     * Jump to passed position during playback
     *
     * @param {float} pos  - Must be between 0 and {@link
     * AudioData._rangeEnd}
     */
    setTime: function setTime(pos) {
        if (pos >= 0 && pos <= this._rangeEnd) {
            this.stop();
            this.play(pos);
        }
    },

    /**
     * Returns current playback position
     *
     * @return {number} value - Current playback position
     */
    getTime: function getTime() {
        if (this._playing) {
            return this.audio.context.currentTime - this._startTime + this._startOffset;
        } else {
            return this._startOffset;
        }
    },

    /**
    * Disconnects and reconnects {@link AudioData} instance to passed
    * AudioNode(s)
    *
    * @param {...Object} nodes - Variable number of AudioNodes to which
    * the {@link AudioData} instance shall be reconnected.
    */
    reconnect: function reconnect(nodes) {
        this.disconnect();
        if (Object.prototype.toString.call(nodes) != "[object Array]") {
            // == single Node
            this.gainNode.connect(nodes);
        } else {
            // == array of Nodes
            for (var i = 0; i < nodes.length; i++) {
                this.gainNode.connect(nodes[i]);
            }
        }
    },

    /**
    * This method will disconnect the {@link AudioData} instance from
    * all connected nodes (afterwards). Should be mostly
    * ctx.destination.
    */
    disconnect: function disconnect() {
        this.gainNode.disconnect();
    },

    /**
     * Method will check whether the passed URL has an extension.
     * Additionaly, {@link AudioData#_checkSupport} will be executed to
     * identify the possible containers / codecs.
     *
     * @protected
     * @param {string} url - URL
     *
     * @return {string} src - URL including file type extension which should be
     * compatible with browser
     */
    _checkExtension: function _checkExtension(url) {
        var supports = this._checkSupport();

        var re = /\.[0-9a-z]{3,4}$/i; // strips the file extension (must be 3 or 4 characters)
        var ext = re.exec(url);
        if (ext == null) {
            if (supports.indexOf(".opus") > -1) {
                var src = url + ".opus";
            } else if (supports.indexOf(".mp4") > -1) {
                var src = url + ".mp4";
            }
            /*
            else if (supports.indexOf(".m4a") > -1) {
                var src = url + ".m4a";
            }*/
            else if (supports.indexOf(".ogg") > -1) {
                    var src = url + ".ogg";
                } else if (supports.indexOf(".mp3") > -1) {
                    var src = url + ".mp3";
                } else if (supports.indexOf(".wav") > -1) {
                    var src = url + ".wav";
                }
        } else {
            if (supports.indexOf(ext[0]) > -1) {
                var src = url;
            } else {
                console.error("ERROR: Your browser does not support the needed audio codec (" + ext[0] + ")!");
                var src = "";
            }
        }
        return src;
    },

    /**
     * Detects whether the browser can play one of the listed containers
     * / codecs
     *
     * @protected
     * @return {string[]} support - An array containing all compatible
     * formats
     */
    _checkSupport: function _checkSupport() {
        var supports = [];
        if (document.createElement('audio').canPlayType("audio/ogg codecs=opus") != "") {
            supports.push(".opus");
        }
        if (document.createElement('audio').canPlayType("audio/ogg") != "") {
            supports.push(".ogg");
        }
        if (document.createElement('audio').canPlayType("audio/x-wav") != "") {
            supports.push(".wav");
        }
        if (document.createElement('audio').canPlayType("audio/mpeg") != "") {
            supports.push(".mp3");
        }
        if (document.createElement('audio').canPlayType('audio/mp4') != "") {
            supports.push(".mp4");
        }
        if (document.createElement('audio').canPlayType('audio/mp4; codecs="mp4a.40.5"') != "") {
            supports.push(".m4a");
        }
        console.debug("Your browser seems to support these containers: " + supports);
        return supports;
    },

    /**
     * Load passed audio signal
     *
     * @protected
     * @param {string} url - URL
     */
    _loadSound: function _loadSound(url) {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';

        // Decode asynchronously
        var that = this;
        request.onload = function () {
            that.ctx.decodeAudioData(request.response, function (buffer) {
                that._buffer = buffer;
                that.canplay = true;
                that._rangeEnd = that._buffer.duration;
                that.duration = that._buffer.duration;
                console.debug("audio loaded & decoded!");

                /**
                 * Will be fired if the audio data has been loaded &
                 * decoded
                 * @event module:irtPlayer~AudioData#audio_loaded
                 */
                $(that).triggerHandler("audio_loaded");
            });
        };
        request.send();
    }

    /**
     * Represents Controller class which has all the logic to control an
     * array of {@link AudioData} instances
     *
     * @constructor
     *
     * @param {Object} [ctx] - An AudioContext instance.
     * @param {string[]} [sounds] - Array with list of URLs of the audio sources (with or without
     * extension).
     * @param {boolean} [checkSupportFlag=true] - Enable / disable extension
     * support for passed url (see [AudioData._checkExtension]{@link AudioData#_checkExtension})
     *
     * @fires module:irtPlayer~IRTPlayer#player_ready
     * @fires module:irtPlayer~IRTPlayer#player_ended
     */
};var IRTPlayer = function IRTPlayer(ctx, sounds, checkSupportFlag) {
    if (typeof ctx === 'undefined') {
        if (typeof AudioContext !== 'undefined') {
            var ctx = new AudioContext();
        } else if (typeof webkitAudioContext !== 'undefined') {
            var ctx = new webkitAudioContext();
        } else {
            alert("Your browser doesn't support the Web Audio API!");
        }
    }

    var checkSupportFlag = typeof checkSupportFlag !== 'undefined' ? checkSupportFlag : true;
    this._checkSupport = checkSupportFlag;
    this.ctx = ctx;

    /**
     * @description Flag if audio signals will be looped
     * @var {boolean} */
    this.loopingState = true;

    /**
     * @description Array of {@link AudioData} instances
     * @var {AudioData[]} */
    this.signals = [];

    /** @var {boolean} */
    this.playing = false;
    this.canplay = false;
    this.init(sounds);

    /**
     * @description Global volume for all {@link AudioData} instances
     * @var {float} */
    this.vol = 1.0;

    /**
     * @description Has array entry integer of currently active file.
     * See {@link IRTPlayer#muteOthers} or  {@link IRTPlayer#attenuateOthers}
     * @var {integer}
     */
    this.activeSignal = null;
    //this.muteOthers(0);
    this._loaded_counter = 0;
    this._ended_counter = 0;
};

IRTPlayer.prototype = {

    /**
     * Adds all audio signals of passed array to the player
     *
     * @param {string[]} sounds - Array of URLs
     */
    init: function init(sounds) {
        if (typeof sounds != "undefined") {
            for (var i = 0; i < sounds.length; i++) {
                //this.signals[i] = new AudioData(this.ctx, sounds[i]); // can be also used to reset tracks array
                this.addURL(sounds[i]);
            }

            // we must bind the event listeners here, because within
            // addURL() it would fulfilled every time the event would
            // be triggered, since the signals[] array does not yet
            // contain all signals during addURL() calls here..
            /*
            for (var i=0; i < this.signals.length; i++){
                this._addEventListener(this.signals[i]);
            }
            */
        } else {
            console.warn('No urls for sounds passed');
        }
    },

    /**
     * Will add audio sources manually to the {@link IRTPlayer} instance
     *
     * @param {string} url - URL of to be added audio source
     */
    addURL: function addURL(url) {
        var audio = new AudioData(this.ctx, url, this.ctx.destination, this._checkSupport);
        this.addAudioData(audio);

        // The event listener must be registered before the event trigger can be
        // created! So we call the load() method explicitely afterwards.
        audio.load();
    },

    /**
     * Will add {@link AudioData} instances to the {@link IRTPlayer} instance
     *
     * @param {AudioData} audioData - instance of to be added audio data object
     */
    addAudioData: function addAudioData(audioData) {
        this._addEventListener(audioData);
        audioData.setLoopState(false);
        this.signals.push(audioData);
    },

    _addEventListener: function _addEventListener(audioData) {
        // NOTE: This is likely working only due to the delayed loading of
        // the audio files. As we all know, the event listener must be already registered
        // before the event trigger can be registered as well. So in the worst case,
        // the audio files will be loaded and decoded _before_ the listener is
        // registered which means that NO event will be triggered and received..!
        // TODO: find a good workaround for this issue!
        $(audioData).on("audio_loaded", function () {
            this._loaded_counter += 1;
            if (this._loaded_counter == this.signals.length) {
                console.debug("All buffers are loaded & decoded");
                /**
                 * Will be fired to the DOM once all audio signals are loaded.
                 * This event is triggered to the DOM and not to the object instance
                 * as this would mean that the listener would have to be registered on
                 * the not yet exisiting object instance... ==> logic proplem.
                 * TODO: find alternative solution with promises, callback, etc
                 * @event module:irtPlayer~IRTPlayer#player_ready
                 */
                $(this).triggerHandler("player_ready");
                this.canplay = true;
                this.duration = this.signals[0].duration;
            }
        }.bind(this));

        $(audioData).on("audio_ended", function () {
            this._ended_counter += 1;
            if (this._ended_counter == this.signals.length) {
                this.playing = false;
                console.debug("All buffers ended");
                /**
                 * Will be fired to the DOM once all audio signals are loaded.
                 * This event is triggered to the DOM and not to the object instance
                 * as this would mean that the listener would have to be registered on
                 * the not yet exisiting object instance... ==> logic proplem.
                 * TODO: find alternative solution with promises, callback, etc
                 * @event module:irtPlayer~IRTPlayer#player_ended
                 */
                $(this).triggerHandler("player_ended");
            }
        }.bind(this));
    },

    /**
     * Toggles play / pause of playback
     */
    togglePlay: function togglePlay() {
        if (this.playing == false) {
            this.play();
        } else {
            this.pause();
        }
    },

    /**
     * Starts playback of all audio sources in {@link IRTPlayer#signals}
     */
    play: function play() {
        this._do('play');
        this.playing = true;
        this._do('setLoopState', this.loopingState);
        this._ended_counter = 0;
    },

    /**
     * Pauses playback of all audio sources in {@link IRTPlayer#signals}
     */
    pause: function pause() {
        this._do('pause');
        this.playing = false;
    },

    /**
     * Stops playback of all audio sources in {@link IRTPlayer#signals}
     */
    stop: function stop() {
        this._do('stop');
        this.playing = false;
        this._do("setLoopState", false);
    },

    /**
     * Will mute all audio sources of {@link IRTPlayer#signals} but the
     * one with the passed index
     *
     * @param {integer} id - Array index number of active audio source
     */
    muteOthers: function muteOthers(id) {
        id = parseInt(id);
        if (id < this.signals.length && id >= 0) {
            this._do('mute');
            this.signals[id].unmute();
            this.activeSignal = id;
        } else {
            console.error("Passed array index invalid!");
        }
    },

    /**
     * Will unmute all audio sources in {@link IRTPlayer#signals}
     */
    unmuteAll: function unmuteAll() {
        this._do('unmute');
        this.activeSignal = null;
    },

    /**
     * Will attenuate all audio sources of {@link IRTPlayer#signals} but the
     * one with the passed index. The active one will have gain value of
     * {@link IRTPlayer#vol}
     *
     * @param {integer} id - Array index number of active audio source
     * @param {float} attenuation - Gain value for other (attenuated)
     * audio sources
     */
    attenuateOthers: function attenuateOthers(id, attenuation) {
        id = parseInt(id);
        if (id < this.signals.length && id >= 0) {
            this._do('setGain', attenuation);
            this.signals[id].setGain(this.vol);
            this.activeSignal = id;
        } else {
            console.error("Passed array index invalid!");
        }
    },

    /**
     * Disables / enables looping of the audio sources
     */
    toggleLoop: function toggleLoop() {
        if (this.loopingState == false) {
            this.loopingState = true;
        } else {
            this.loopingState = false;
        }
        this._do('toggleLoop');
    },

    /**
     * Sets start position for playback
     *
     * @param {float} pos  - Start playback always at passed
     * position for all audio sources in {@link IRTPlayer#signals}
     */
    setRangeStart: function setRangeStart(pos) {
        console.info("Range start: " + pos);
        this._do('setRangeStart', pos);
    },

    /**
     * Sets end position for playback
     *
     * @param {float} pos  - End playback always at passed
     * position for all audio sources in {@link IRTPlayer#signals}
     */
    setRangeEnd: function setRangeEnd(pos) {
        console.info("Range end: " + pos);
        this._do('setRangeEnd', pos);
    },

    /**
     * Jump to passed position during playback
     *
     * @param {float} time  - Must be between 0 and {@link
     * AudioData#_rangeEnd}
     */
    setTime: function setTime(time) {
        this._do('setTime', time);
    },

    /**
     * Returns current position of playback
     * @return {number} pos - Current playback position
     */
    getTime: function getTime() {
        return this.signals[0].getTime();
    },

    /**
     * Helper function to apply AudioData methods for all instances in
     * {@link IRTPlayer#signals} array
     * @param {string} func - Name of the method to be executed
     * @param {...args} args - variable number of additional arguments that
     * should be passed to the method
     * @protected
     */
    _do: function _do(func) {
        if (arguments.length == 2) {
            var args = arguments[1]; // prevents that a single argument will be passed as array with one entry
        } else {
            var args = Array.prototype.splice.call(arguments, 1);
        }
        for (var i = 0; i < this.signals.length; i++) {
            this.signals[i][func](args);
        }
    }
};

exports.AudioData = AudioData;
exports.IRTPlayer = IRTPlayer;

},{}],9:[function(require,module,exports){
'use strict';

/*jshint esversion: 6 */
/**
 * @file media_controller.js
 * @author Michael Weitnauer: {@link weitnauer@irt.de}
 */

/**
 * @module bogJS
 *
 */

var GainController = require('./gain_controller');

/**
 * Represents MediaElementController class which has all the logic to control a HTML5 media element
 * Every track / channel of the media element can be controlled separately.
 *
 * @constructor
 *
 * @param {Object} ctx - An AudioContext instance.
 * @param {string} mediaElement - HTML5 media element
 * @param {Number} tracks - Number of media element channels
 * @param {Object} [targetNodeList=ctx.destination] - The audio node to which the MediaElementController
 * @fires module:bogJS~MediaElementController#audio_init
 * @fires module:bogJS~MediaElementController#audio_loaded
 * @fires module:bogJS~MediaElementController#audio_ended
 */
var MediaElementController = function MediaElementController(ctx, mediaElement, tracks, targetNodeList) {
    /** @protected
     * @var {boolean} */
    this.canplay = false;

    /** @var {Object.<AudioContext>} */
    this.ctx = ctx;

    this._mediaElement = mediaElement;
    this._mediaSourceNode = this.ctx.createMediaElementSource(this._mediaElement);
    this._tracks = tracks;
    this._splitter = this.ctx.createChannelSplitter(this._tracks);
    this._mediaSourceNode.connect(this._splitter);

    this.gainController = [];
    if (typeof targetNodeList === 'undefined') {
        var targetNodeList = [];
        for (var i = 0; i < this._tracks; i++) {
            targetNodeList.push(this.ctx.destination);
        }
    }
    for (var i = 0; i < this._tracks; i++) {
        this.gainController[i] = new GainController(this.ctx, targetNodeList[i]);

        // TODO: Workaround for wrong channel order of decoded bitstream
        this._splitter.connect(this.gainController[i].gainNode, i);
    }

    this._mediaElement.onended = function () {
        console.debug("Audio buffer has ended!");
        this._playing = false;

        /**
         * Will be fired once the playback has ended
         * @event module:bogJS~MediaElementController#audio_ended
         */
        $(this).triggerHandler("audio_ended");
    }.bind(this);

    this._mediaElement.onstalled = function () {
        console.info("Pausing playback - need to buffer more");
        this.ctx.suspend();
    }.bind(this);

    this._mediaElement.onplaying = function () {
        console.info("Resuming playback of media element");
        if (this.ctx.state === "suspended") {
            this.ctx.resume();
        }
    }.bind(this);

    this._mediaElement.oncanplaythrough = function () {
        this.canplay = true;
        console.info("Playback of media element can start");

        /**
         * Will be fired if media element playback can start
         * @event module:bogJS~MediaElementController#audio_loaded
         */
        $(this).triggerHandler('audio_loaded');
        if (this.ctx.state === "suspended") {
            this.ctx.resume();
        }
    }.bind(this);

    this._mediaElement.load();
    this._playing = false;
    this._looping = false;
};

MediaElementController.prototype = {
    /**
    * Start playback of audio signal
    *
    * @param {number} [pos] - Position from which the playback shall start
    * (optional)
    */
    play: function play(pos) {
        if (typeof pos != 'number') {
            // detection with _.isNumber() could be more robust
            this._mediaElement.play();
        } else {
            console.debug("Starting playback at " + pos);
            this.setTime(pos);
            this._mediaElement.play();
        }
        this._playing = true;
    },

    /**
     * Pause playback.
     *
     */
    pause: function pause() {
        this._mediaElement.pause();
        this._playing = false;
    },

    /**
     * Stops playback.
     */
    stop: function stop() {
        this._mediaElement.pause();
        this._playing = false;
        this._mediaElement.currentTime = 0;
    },

    /**
     * Sets gain of {@link MediaElementController} instance
     *
     * @param {float} gain - Value between 0.0 and 1.0
     */
    setVolume: function setVolume(vol) {
        this._mediaElement.volume = vol;
    },

    /**
     * Returns current gain value of {@link MediaElementController} instance
     *
     * @return {float} value - Float gain value
     */
    getVolume: function getVolume() {
        return this._mediaElement.volume;
    },

    /**
     * Disables / enables the loop of the {@link MediaElementController} instance
     */
    toggleLoop: function toggleLoop() {
        if (this._looping == false) {
            this._looping = true;
        } else {
            this._looping = false;
        }
        this._mediaElement.loop = this._looping;
    },

    /**
     * Disables / enables the loop of the {@link MediaElementController} instance
     */
    setLoopState: function setLoopState(bool) {
        this._looping = bool;
        this._mediaElement.loop = this._looping;
    },

    /**
     * Mutes {@link MediaElementController} instance
     */
    mute: function mute() {
        this._mediaElement.muted = true;
    },

    /**
     * Unmutes {@link MediaElementController} instance
     */
    unmute: function unmute() {
        this._mediaElement.muted = false;
    },

    /**
     * Jump to passed position during playback
     *
     * @param {float} pos  - Must be >= 0
     */
    setTime: function setTime(pos) {
        if (pos >= 0) {
            this._mediaElement.currentTime = pos;
        }
    },

    /**
     * Returns current playback position
     *
     * @return {number} value - Current playback position
     */
    getTime: function getTime() {
        return this._mediaElement.currentTime;
    }
};

module.exports = MediaElementController;

},{"./gain_controller":7}],10:[function(require,module,exports){
"use strict";

/*jshint esversion: 6 */
/**
 * @file object.js
 * @author Michael Weitnauer [weitnauer@irt.de]
 */

/**
 * @module bogJS
 */

var GainController = require('./gain_controller');

/**
 * Represents ObjectController class which has all the logic to control an
 * audio object
 *
 * @constructor
 *
 * @param {Object} ctx - An AudioContext instance.
 * @param {AudioData} sourceNode - Instance of an {@link
 * module:irtPlayer~AudioData|AudioData} object.
 * @param {AudioData} [targetNode=ctx.destination] - Instance of an
 * Web Audio API node to which the output of the ObjectController
 * shall be connected to.
 */

var ObjectController = function ObjectController(ctx, sourceNode) {
    var targetNode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ctx.destination;

    /**
     * Instance of Web Audio Panner node
     * @var {Object.<AudioContext.PannerNode>}
     */
    this.panner = ctx.createPanner();

    // Experimental highpass to avoid sizzling noinse while chaning view / angle
    //this.highpass = ctx.createBiquadFilter();
    //this.highpass.type = "highpass";
    //this.setHighpassFreq(80);
    //this.highpass.connect(this.panner);

    /**
     * Has the current panning mode of the object
     * @readonly
     */
    this.panningType = "equalpower";
    this.panner.maxDistance = 10;

    this.setPanningType(this.panningType);
    this.position = [0, 0, 0]; // FIXME: make private and use set and get methods
    this.gain = 1; // valid values between 0 and 1  // FIXME: make private and use set and get methods

    this._state = false;
    this.stateNode = new GainController(ctx, this.panner);
    this.interactiveGain = new GainController(ctx, this.stateNode.gainNode);

    this.setAudio(sourceNode);
    this.panner.connect(targetNode);
};

ObjectController.prototype = {

    /**
     * Change position of panner object within 3D space
     *
     * @param {Float[]} xyz - An array with three entries: [x, y, z]
      * @see Interpolation as per AudioParam Interface not possible with
     * current WAA version. The PannerNode will be deprecated in V1
     * and a new SpatializerNode will be introduced that should
     * support interpolation _and_ loading own HRTF databases!!
     * {@link https://github.com/WebAudio/web-audio-api/issues/372| GitHub issue 372}
     */
    setPosition: function setPosition(xyz) {
        var my_xyz = [parseFloat(xyz[0]), parseFloat(xyz[1]), parseFloat(xyz[2])];
        this.panner.setPosition(xyz[0], xyz[1], xyz[2]);
        console.debug("New Position: " + my_xyz);
        this.position = xyz;
    },

    /**
     * Get current Position of object
     * @return {Float[]} position - Array with current [x, y, z] values
     */
    getPosition: function getPosition() {
        return this.position;
    },

    /**
     * Enabling / disabling the object
     *
     * @param {Boolean} state - Enables / disables the panner object
     * instance
     */
    setStatus: function setStatus(state) {
        if (state === true || state == 1) {
            this.stateNode.unmute();
            this._state = true;
        } else if (state === false || state == 0) {
            this.stateNode.mute();
            this._state = false;
        }
        console.info("Setting state to " + this._state);
    },

    /**
     * Sets gain value of {@link
     * module:bogJS~GainController#gainNode|GainController.gainNode}
     * Separate GainNode to be used for interactive Gain control, aka
     * cross-fading between one group and another.
     * @param {Float} gain - Must be between 0.0 and 1.0
     */
    setInteractiveGain: function setInteractiveGain(gain) {
        this.interactiveGain.setGain(gain);
        this._interactiveGain = gain;
    },

    /**
     * Returns current object state
     * @return {Boolean} status
     */
    getStatus: function getStatus() {
        return this._state;
    },

    /**
     * Sets gain value of {@link
     * module:irtPlayer~AudioData#gainNode|AudioData.gainNode}
     *
     * @param {Float} gain - Must be between 0.0 and 1.0
     * @param {Float} [time=Now] - At which time shall the gain value be applied
     * @param {Boolean} [interpolation=false] - Set to true if gain
     * value shall be linear faded to passed gain value from passed time on. If
     * false, the gain value will be applied immediately.
     */
    setGain: function setGain(gain) {
        var time = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "now";
        var interpolation = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

        if (time === "now") {
            this.audio.setGain(gain);
            this.gain = gain;
        } else if (time !== "now" && interpolation === false) {
            this.audio.gainNode.gain.setValueAtTime(gain, time);
        } else if (time !== "now" && interpolation !== false) {
            this.audio.gainNode.gain.linearRampToValueAtTime(gain, time);
        }
    },

    /**
     * Get current gain value of {@link
     * module:irtPlayer~AudioData#gainNode|AudioData.gainNode}
     *
     * @return {Float} gain
     */
    getGain: function getGain() {
        return this.audio.getGain(); // or do we trust in this.gain ??
    },

    /**
     * Set panning type of Panner object instance.
     * Currently, "equalpower" only supports Stereo (2ch) panning.
     *
     * @param {("HRTF"|"equalpower")} panningType - Choose "HRTF" for binaural
     * rendering or "equalpower" for Stereo rendering.
     */
    setPanningType: function setPanningType(panningType) {
        if (panningType === "HRTF" || panningType === "equalpower") {
            this.panner.panningModel = panningType;
            this.panningType = this.panner.panningModel;
        } else {
            console.error("Only >>HRTF<< or >>equalpower<< are valid types");
        }
    },

    /**
     * Get panning type
     * @return {("HRTF"|"equalpower")} panningType - Either "HRTF" or "equalpower"
     */
    getPanningType: function getPanningType() {
        return this.panner.panningModel;
    },

    /**
     * Sets the double value describing how quickly the volume is reduced
     * as the source moves away from the listener. The initial default value
     * is 1. This value is used by all distance models.
     *
     * @param {Float} factor
     */
    setRollOffFactor: function setRollOffFactor(factor) {
        this.panner.rolloffFactor = factor;
    },

    /**
     * Sets the value determining which algorithm to use to reduce the
     * volume of the audio source as it moves away from the listener. The
     * initial default value is "inverse" which should be equivalent to 1/r.
     *
     * @param {("inverse"|"exponential"|"linear")} model - "inverse" is the default setting
     */
    setDistanceModel: function setDistanceModel(model) {
        this.panner.distanceModel = model;
    },

    /**
     * Sets the value representing the reference distance for reducing volume
     * as the audio source moves further from the listener. The initial
     * default value is 1. This value is used by all distance models.
     *
     * @param {float} refDistance
     */
    setRefDistance: function setRefDistance(refDistance) {
        this.panner.refDistance = refDistance;
    },

    /**
     * Sets the value representing the maximum distance between the audio
     * source and the listener, after which the volume is not reduced any
     * further. The initial default value is 10000. This value is used
     * only by the linear distance model.
     *
     * @param {float} maxDistance
     */
    setMaxDistance: function setMaxDistance(maxDistance) {
        this.panner.maxDistance = maxDistance;
    },

    /**
     * Connects the input of the ObjectController instance
     * with the output of the passed audioNode.
     *
     * @param {AudioData} audioNode - Instance of an {@link
     * module:irtPlayer~AudioData|AudioData} or GainController object.
     */
    setAudio: function setAudio(audioNode) {
        // call disconnect only if this.audio exists
        // it is absolutely essential to disconnect the old audio instance
        // before the new one can be assigned!
        /* FIXME: clarify the expected behaviour of a setAudio() method!
        if (this.audio){
            this.audio.disconnect(this.panner);
        }
        */
        this.audio = audioNode;
        // just to make sure we assigned a valid audioNode..
        if (this.audio) {
            // FIXME: AudioData() class should also have a connect method.
            // Better would be to use derived class mechanisms.
            if (this.audio.connect) {
                this.audio.connect(this.interactiveGain.gainNode);
            } else {
                this.audio.reconnect(this.interactiveGain.gainNode);
            }
        }
    },

    setHighpassFreq: function setHighpassFreq(freq) {
        this.highpass.frequency.value = freq;
    }
};

module.exports = ObjectController;

},{"./gain_controller":7}],11:[function(require,module,exports){
'use strict';

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
    return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

/*jshint esversion: 6 */
/**
 * @file object_manager.js
 * @author Michael Weitnauer [weitnauer@irt.de]
 */

/**
 * @module bogJS
 */

/**
 * @typedef keyframes
 * @type {object}
 * @example
 * keyframes = {0.0: [{obj: "Cello", cmd: "position", params: [3.2, 4, 0]},
 *                    {obj: "Cembalo", cmd: "gain", params: 0.5}],
 *              0.4: [{obj: "Cembalo", cmd: "is_present", params: 0},
 *                    {obj: "Cello", cmd: "gain", params: 1.0}],
 *              235: [{obj: "Viola", cmd: "is_present", params: 1},
 *                    {obj: "Viola", cmd: "position", params: [0.5, 3.2, 0.5]}]};
 */

/**
 * @typedef audioURLs
 * @type {object}
 * @example
 * audioURLs = {Cello: "http://sounds.myserver.com/Cello.ogg",
 *              Cembalo: "http://sounds.myserver.com/Cembalo.wav",
 *              Viola: "../../Viola.m4a"}
 */

/**
 * @typedef sceneInfo
 * @type {object}
 * @example
 * sceneInfo = {name: "My fancy scene",
 *              listener_position: [0, 0, 0],
 *              listener_orientation: [0, 1, 0],
 *              object_count: 3,
 *              room_dimensions: [10, 10, 3]}
 */

/**
 * @typedef singleObjects
 * @type {object}
 * @example
 * singleObjects = {"70.754":["Birds1_L","Birds1_R"],
 *                  "72.0":["Birds2_L","Birds2_R"],
 *                  "79.29":["Birds3"],
 *                  "90.65":["Crows"],
 *                  "102.55":["Vulcano_L","Vulcano_R"],
 *                  "117.55":["Stones_L","Stones_R"]}
 */

/**
 * @typedef groupObjects
 * @type {object}
 * @example
 * groupObjects = {"78.2":["Birds1_L","Birds1_R"],
 *                  "90.65":["Birds"],
 *                  "117.55":["Stones_L","Stones_R"]}
 */

/**
 * @typedef audiobeds
 * @type {object}
 * @example
 * audiobeds =  {Bed0: "bed_0", Bed1: "bed_1", Bed2: "bed_2", Bed3: "bed_3", Bed4: "bed_4"}
 */

window._ = require('underscore');
var WAAClock = require('waaclock');
var ChannelOrderTest = require('./channelorder_test');
var AudioData = require('./html5_player/core').AudioData;
var IRTPlayer = require('./html5_player/core').IRTPlayer;
var ObjectController = require('./object');
var GainController = require('./gain_controller');
var MediaElementController = require('./media_controller');
var SceneReader = require('./scene_reader');

/**
 * Represents ObjectManager class which has all the logic to control
 * several {@link module:bogJS~ObjectController|ObjectController} instances along with metadata
 *
 * @constructor
 *
 * @param {string} url - URL of the metadata source.
 * @param {Object} [ctx] - An AudioContext instance.
 * @param {Object} [reader] - A reader instance that has a load() method
 * and will fire a event called "scene_loaded". The event must also pass
 * {@link module:bogJS~keyframes|keyframes}, {@link module:bogJS~audioURLs|audioURLs}
 * and {@link module:bogJS~sceneInfo|sceneInfo}. See {@link
 * module:bogJS~SceneReader#load|SceneReader.load()}
 * @param {Object} [mediaElement] - A HMTL5 media element instance to be used as
 * audio bed. If passed, any potentially other given audio bed from the scene
 * file will be ignored.
 * @param {Number} [audiobed_tracks] - If mediaElement is passed, the expected
 * channel number must be passed as well.
 * @param {String} [channelorder_root] - Path to encoded channel order detection
 * test files. See also [ChannelOrderTest]{@link module:bogJS~ChannelOrderTest}
 * and the README.md file.
 * @fires module:bogJS~ObjectManager#om_newGain
 * @fires module:bogJS~ObjectManager#om_newPosition
 * @fires module:bogJS~ObjectManager#om_newTrackMapping
 * @fires module:bogJS~ObjectManager#om_isActive
 *
 */
var ObjectManager = function ObjectManager(url, ctx, reader, mediaElement, audiobed_tracks, channelorder_root) {
    if (typeof ctx === 'undefined') {
        if (typeof AudioContext !== 'undefined') {
            var ctx = new AudioContext();
        } else if (typeof webkitAudioContext !== 'undefined') {
            var ctx = new webkitAudioContext();
        } else {
            alert("Your browser doesn't support the Web Audio API!");
        }
    }
    /**
     * Instance of Web Audio AudioContext
     * @var {Object.<AudioContext>}
     */
    this.ctx = ctx;
    this.masterGain = new GainController(this.ctx, ctx.destination);
    /**
     * Instance of {@link SceneReader}
     * @var {(CustomReaderInstance|Object.<module:bogJS~SceneReader>)}
     */
    this.reader = reader || new SceneReader();

    this._mediaElement = mediaElement;
    this._mediaElementTracks = audiobed_tracks;
    this._channorder_root = channelorder_root;

    /**
     * Instance of {@link module:irtPlayer~IRTPlayer|IRTPlayer}
     * @var {Object.<module:irtPlayer~IRTPlayer>}
     */
    this._clock = new WAAClock(this.ctx);
    this._evts = {};
    this._timer_evt = false;
    this._audioURLs = {};
    this._currentKeyframeIndex = 0;
    this._kfMapping = {};
    this._last_kfMapping = {};

    this._audiobedTracks = {};
    this._groupObjURLs = {};
    this._singleObjURLs = {};
    this._audiobed = false;
    this._groupObjPlayers = {};
    this._singleObjAudios = {};
    this._kf_canplay = {};

    /**
     * Array of all {@link module:bogJS~ObjectController|ObjectController} instances that are controlled
     * by the {@link module:bogJS~ObjectManager|ObjectManager}
     * @var {module:bogJS~ObjectController[]}
     */
    this.objects = {};
    this._audioInstances = {};
    this._panningType = "equalpower";

    /**
     * If set to true, the ObjectManager will ignore keyframe updates!
     * @var {boolean}
     * @default false
     */
    this.interactive = false;
    this.playing = false;

    this._listenerOrientation = [0, 0, -1];
    this.setListenerOrientation(0, 0, -1);

    $(this.reader).on('scene_loaded', function (e, keyframes, audioURLs, sceneInfo, groupObjects, singleObjects, audiobeds, interactiveInfo) {
        console.debug('Scene data loaded!');

        /**
         * 'Dictionary' containing keyframes + commands triplets per keyframe.
         * @abstract
         * @var {module:bogJS~keyframes}
         */
        this._keyframes = keyframes;

        /**
         * 'Dictionary' containing mapping for objects and URLs.
         * @abstract
         * @var {module:bogJS~audioURLs}
         */
        this._audioURLs = audioURLs;

        /**
         * 'Dictionary' containing additional scene info
         * @abstract
         * @var {module:bogJS~sceneInfo}
         */
        this._sceneInfo = sceneInfo;
        /**
         * 'Dictionary' containing interactive info
         * @abstract
         * @var {module:bogJS~interactiveInfo}
         */
        this.interactiveInfo = interactiveInfo;
        this.object_count = sceneInfo.object_count || 0;
        this.roomDimensions = sceneInfo.room_dimensions || [10, 10, 3];
        this._listenerPosition = sceneInfo.listener_position || [0, 0, 0];

        /**
         * 'Dictionary' containing mapping for objects and audiobed tracks
         * @abstract
         * @var {module:bogJS~audiobeds}
         */
        this._audiobedTracks = audiobeds;

        /**
         * 'Dictionary' containing info to identify grouped objects
         * @abstract
         * @var {module:bogJS~groupObjects}
         */
        this._groupObjURLs = groupObjects;

        /**
         * 'Dictionary' containing info to identify single objects
         * @abstract
         * @var {module:bogJS~singleObjects}
         */
        this._singleObjURLs = singleObjects;

        this.init();
    }.bind(this));
    this.reader.load(url);
};

ObjectManager.prototype = {

    /**
     * Creates [AudioData]{@link module:irtPlayer~AudioData} and
     * [ObjectController]{@link module:bogJS~ObjectController} instances and
     * adds the AudioData instances to the {@link module:bogJS~ObjectManager#player}
     */
    init: function init() {
        if (typeof this._mediaElement !== 'undefined') {
            this._audiobed = new MediaElementController(this.ctx, this._mediaElement, this._mediaElementTracks);
        } else if (this._sceneInfo.audiobed_url) {
            var a = document.createElement("audio");
            var src = this._sceneInfo.audiobed_url;
            if (/\.[0-9a-z]{3,4}$/i.exec(src) === null) {
                // if no file extension is stated
                if (a.canPlayType('audio/ogg codecs=opus')) {
                    a.type = 'audio/ogg codecs=opus';
                    src = src + '.opus';
                } else {
                    a.type = 'audio/mp4';
                    src = src + '.mp4';
                }
            }
            a.src = src;
            this._mediaElementTracks = parseInt(this._sceneInfo.audiobed_tracks);
            this._audiobed = new MediaElementController(this.ctx, a, this._mediaElementTracks);
        }
        if (this._audiobed !== false) {
            // If there is an audiobed, we can trigger the om_ready event even
            // though other keyframe assets are not yet ready. We need to trigger
            // the event here in case NO other assets are used.
            // This is for sure not really a sophisticated way to solve this but it
            // should work. In the worst case, the playback will pause again if
            // the assets are not yet loaded and decoded.
            $(this._audiobed).on('audio_loaded', function () {
                console.debug("Audiobed loaded, detect channel order..");
                var url = "";
                if (this._audiobed._mediaElement.src !== "") {
                    url = this._audiobed._mediaElement.src;
                } else if (this._audiobed._mediaElement.currentSrc !== "") {
                    url = this._audiobed._mediaElement.currentSrc;
                } else {
                    console.error("The src of the audiobed couldn't be detected!");
                }
                var re = /\.[0-9a-z]{3,4}$/i; // strips the file extension (must be 3 or 4 characters)
                var container = re.exec(url)[0];
                container = container.split('.').join(""); // removes dot from the string
                this._chOrderTest = new ChannelOrderTest(container, this._mediaElementTracks, this.ctx, this._channorder_root);
                $(document).triggerHandler('om_ready');
                console.debug('Audiobed ready for playback');
                //var chOrder = this._chOrderTest.testChs();
            }.bind(this));

            $(this._audiobed).on('audio_ended', function () {
                $(document).triggerHandler('om_ended');
                om.stop();
            }.bind(this));

            $(document).on('order_ready', function (e, order) {
                console.debug('Got channel order: ' + order);
                this._chOrder = order;
                // firstly, disconnect any connections to other nodes to avoid
                // confusions and strange behaviours..
                for (var i = 0; i < order.length; i++) {
                    this.objects["Bed" + order[i]].audio.disconnect();
                }
                // now assign correct gainController to corresponding
                // pannerNode
                for (var i = 0; i < order.length; i++) {
                    console.debug("Reconnecting GainController " + i + " with Bed " + order[i]);
                    this.objects["Bed" + order[i]].setAudio(this._audiobed.gainController[i]);
                }
            }.bind(this));
        }

        for (var obj in this._audiobedTracks) {
            var trackNr = parseInt(this._audiobedTracks[obj].split("_")[1]);
            this.objects[obj] = new ObjectController(this.ctx, this._audiobed.gainController[trackNr], this.masterGain.gainNode);
            this.objects[obj].audio._id = obj;
            this.objects[obj].panner._id = obj;
        }

        for (var kf in this._groupObjURLs) {
            this._groupObjPlayers[kf] = {};
            this._kf_canplay[kf] = {};
            for (var group in this._groupObjURLs[kf]) {
                this._kf_canplay[kf][group] = false;
                var player = new IRTPlayer(this.ctx);
                $(player).on('player_ready', this._loadedStateDelegate(kf, group));
                for (var idx in this._groupObjURLs[kf][group]) {
                    var obj = this._groupObjURLs[kf][group][idx];
                    var url = this._audioURLs[obj];
                    var audioInstance = new AudioData(this.ctx, url);
                    audioInstance.load();
                    audioInstance.setLoopState(false);
                    this.objects[obj] = new ObjectController(this.ctx, audioInstance, this.masterGain.gainNode);
                    player.addAudioData(audioInstance);
                    this._groupObjPlayers[kf][group] = player;
                }
            }
        }

        for (var kf in this._singleObjURLs) {
            this._singleObjAudios[kf] = {};
            if (!this._kf_canplay[kf]) {
                this._kf_canplay[kf] = {};
            }
            for (var idx in this._singleObjURLs[kf]) {
                var obj = this._singleObjURLs[kf][idx];
                var url = this._audioURLs[obj];
                this._kf_canplay[kf][obj] = false;
                var audioInstance = new AudioData(this.ctx, url);
                $(audioInstance).on("audio_loaded", this._loadedStateDelegate(kf, obj));
                audioInstance.load();
                audioInstance.setLoopState(false);
                this.objects[obj] = new ObjectController(this.ctx, audioInstance, this.masterGain.gainNode);
                this._singleObjAudios[kf][obj] = audioInstance;
            }
        }
        this.setPanningType(this._panningType);
        $(document).triggerHandler('om_initialized');
        console.debug('Scene sucessfully initialized!');
        if (this.interactiveInfo.switchGroups) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = Object.keys(this.interactiveInfo.switchGroups)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var g = _step.value;

                    this._initSwitchGroup(g);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        }
        //this.start();
    },

    /**
     * Starts playback and rendering of audio scene
     */
    start: function start() {
        if (this._checkReadyStart() === true && this.playing === false) {
            this._clock.start();
            this._startTime = this.ctx.currentTime;
            this._processCurrentKeyframes();
            if (this._audiobed !== false) {
                this._audiobed.play();
            }
            var that = this;
            if (!this._timer_evt) {
                this._timer_evt = this._clock.setTimeout(function () {
                    console.debug(that.ctx.currentTime);
                }, 1).repeat(1);
            }
            this.playing = true;
            return true;
        } else {
            console.info("Audio signals not yet ready for playing.");
            return false;
        }
    },

    /**
     * Pauses playback
     */
    pause: function pause() {
        this.ctx.suspend();
        if (this._audiobed !== false) {
            this._audiobed.pause();
        }
        this.playing = false;
    },

    /**
     * Resumes playback of all objects if paused.
     *
     */
    resume: function resume() {
        this.ctx.resume();
        if (this._audiobed !== false) {
            this._audiobed.play();
        }
        this.playing = true;
    },

    /**
     * togglePause
     *
     */
    togglePause: function togglePause() {
        if (this.ctx.state === 'running') {
            this.pause();
        } else if (this.ctx.state === 'suspended') {
            this.resume();
        }
    },

    /**
     * Stops playback and internal clock
     */
    stop: function stop() {
        this._clock.stop();
        if (this._audiobed !== false) {
            this._audiobed.stop();
        }
        for (var kf in this._groupObjPlayers) {
            for (var group in this._groupObjPlayers[kf]) {
                this._groupObjPlayers[kf][group].stop();
            }
        }
        for (var kf in this._singleObjAudios) {
            for (var idx in this._singleObjAudios[kf]) {
                this._singleObjAudios[kf][idx].stop();
            }
        }
        this.playing = false;
    },

    /**
     * Will change the playback position of all single, group and audiobed
     * signals. Further, the closes keyframe ahead of the passed time will be
     * activated.
     *
     * @param {float} time - Desired playback position
     */
    setTime: function setTime(time) {
        var set_audiobed_time = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

        // activate closest keyframe before time to avoid
        // missing / "forgetting" object commands..
        var times = Object.keys(this._keyframes);

        // works even in case the keys are strings
        var closest_kf = _.min(times); //Get the lowest numberin case it match nothing.
        for (var i = 0; i < times.length; i++) {
            if (times[i] <= time && times[i] > closest_kf) {
                closest_kf = times[i];
            }
        }
        this._handleKeyframe(closest_kf);

        for (var key in this._evts) {
            var evt = this._evts[key];
            var evt_time = parseFloat(key);
            var newTime = evt_time - time + this.ctx.currentTime;
            //console.debug("Evt " + key + " rescheduled from " + evt.deadline + " to " + newTime);
            evt.schedule(newTime);
        }

        // set single and grouped audio signals to the passed position and
        // check if passed time > duration of the single and grouped audio
        // signals:
        var now = this.ctx.currentTime - this._startTime;
        for (var kf in this._singleObjAudios) {
            var audioStartPos = parseFloat(kf);
            for (var idx in this._singleObjAudios[kf]) {
                var duration = this._singleObjAudios[kf][idx].duration;
                var audioNewPos = time - audioStartPos;
                // negative time values shall stop the signal.
                if (audioNewPos <= 0) {
                    this._singleObjAudios[kf][idx].stop();
                } else {
                    // should stop audio if audioNewPos > duration
                    this._singleObjAudios[kf][idx].setTime(audioNewPos);
                    console.debug("Set audio " + idx + " to position " + audioNewPos);
                }
            }
        }
        for (var kf in this._groupObjPlayers) {
            var audioStartPos = parseFloat(kf);
            for (var group in this._groupObjPlayers[kf]) {
                var duration = this._groupObjPlayers[kf][group].duration;
                var audioNewPos = time - audioStartPos;
                // negative time values shall stop the signal.
                if (audioNewPos <= 0) {
                    this._groupObjPlayers[kf][group].stop();
                } else {
                    // should stop audio if audioNewPos > duration
                    this._groupObjPlayers[kf][group].setTime(audioNewPos);
                    console.debug("Set group " + group + " to position " + audioNewPos);
                }
            }
        }
        if (this._audiobed !== false && set_audiobed_time) {
            this._audiobed.setTime(time);
        }
    },

    /**
     * Toggle panning type between Headphones (binaural) and Stereo rendering
     */
    togglePanningType: function togglePanningType() {
        if (this._panningType === "HRTF") {
            this.setPanningType("equalpower");
            this._panningType = "equalpower";
        } else if (this._panningType === "equalpower") {
            this.setPanningType("HRTF");
            this._panningType = "HRTF";
        }
    },

    /**
     * @param {("HRTF"|"equalpower")} type - Panning type for all
     * objects
     */
    setPanningType: function setPanningType(type) {
        for (var key in this.objects) {
            this.objects[key].setPanningType(type);
        }
        this._panningType = type;
    },

    /**
     * @returns {("HRTF"|"equalpower")} panningType
     */
    getPanningType: function getPanningType() {
        return this._panningType;
    },

    /**
     * Sets listener orientation. Coordinate usage as intended by the Web
     * Audio API. See also {@link https://webaudio.github.io/web-audio-api/#the-audiolistener-interface}
     * NOTE: This function currently takes only the head rotation but not the
     * tilt into account.
     *
     * @param x
     * @param y
     * @param z
     */
    setListenerOrientation: function setListenerOrientation(x, y, z) {
        this._listenerOrientation = [x, y, z];
        this.ctx.listener.setOrientation(x, y, z, 0, 1, 0);
    },

    /**
     * getListenerOrientation
     * @returns listenerOrientation
     */
    getListenerOrientation: function getListenerOrientation() {
        return this._listenerOrientation;
    },

    /**
     * setListenerPosition
     * Coordinate usage as intended by the Web
     * Audio API. See also {@link https://webaudio.github.io/web-audio-api/#the-audiolistener-interface}
     * @param x
     * @param y
     * @param z
     */
    setListenerPosition: function setListenerPosition(x, y, z) {
        this._listenerPosition = [x, y, z];
        this.ctx.listener.setPosition(x, y, 0);
    },

    /**
     * getListenerPosition
     * @returns listenerPosition
     */
    getListenerPosition: function getListenerPosition() {
        return this._listenerPosition;
    },

    _handleKeyframe: function _handleKeyframe(key) {
        console.debug("Activating keyframe: " + key);
        var keyframe = this._keyframes[key];
        //this._kfMapping = {};
        if (this.interactive === false) {
            for (var i = 0; i < keyframe.length; i++) {
                var triplet = keyframe[i];
                var obj = triplet.obj;
                var cmd = triplet.cmd;
                var params = triplet.params;
                if (cmd === "position") {
                    this.objects[obj].setPosition(params);
                    /**
                     * Will be fired if object from list gets new Position as per
                     * the scene data
                     * @event module:bogJS~ObjectManager#om_newPosition
                     * @property {string} obj - Name of object
                     * @property {float[]} pos - New position values as array [x, y, z]
                     */
                    $(this).triggerHandler('om_newPosition', [obj, params]);
                } else if (cmd === "gain") {
                    this.objects[obj].setGain(params);
                    /**
                     * Will be fired if object from list gets new Gain
                     * value as per scene data / {@link module:bogJS~ObjectManager#_keyframes}
                     * @event module:bogJS~ObjectManager#om_newGain
                     * @property {string} obj - Name of object
                     * @property {number} gain - New gain value
                     */
                    $(this).triggerHandler('om_newGain', [obj, params]);
                } else if (cmd === "track_mapping") {
                    var url = params;
                    if (url in this._kfMapping === false) {
                        this._kfMapping[url] = obj;
                    } else if (url in this._kfMapping === true && this._kfMapping[url] !== obj) {
                        var objs = [];
                        var alreadyThere = [this._kfMapping[url]];
                        this._kfMapping[url] = objs.concat.apply(obj, alreadyThere);
                    }
                } else if (cmd === "is_present") {
                    var state;
                    if (params === 0) {
                        state = false;
                    } else if (params === 1) {
                        state = true;
                    } else {
                        state = params;
                    }
                    // Removing as it was never really used and conflicts with switchGroups??
                    this.objects[obj].setStatus(state);
                    /**
                     * Will be fired if object from list has new State
                     * @event module:bogJS~ObjectManager#om_isActive
                     * @property {string} obj - Name of object
                     * @property {boolean} bool - Bool value if active or not
                     */
                    $(this).triggerHandler('om_isActive', [obj, state]);
                }
            }
        }
        this._handleKeyframeAssets(key);
        //this._handleKeyframeMappings();
    },

    _handleKeyframeAssets: function _handleKeyframeAssets(kf) {
        //this._kf_canplay = {};
        if (kf in this._groupObjPlayers) {
            for (var group in this._groupObjPlayers[kf]) {
                var tmpGrp = this._groupObjPlayers[kf][group]; // TODO: does this cause additional delay?
                if (tmpGrp.canplay === false) {
                    $(tmpGrp).on("audio_loaded", this._loadedStateDelegate(kf, group));
                }
            }
        }
        if (kf in this._singleObjAudios) {
            for (var obj in this._singleObjAudios[kf]) {
                var tmpAudio = this._singleObjAudios[kf][obj]; // TODO: does this cause additional delay?
                if (tmpAudio.canplay === false) {
                    $(tmpAudio).on("audio_loaded", this._loadedStateDelegate(kf, obj));
                }
            }
        }

        // now check if all assets are ready for playing:
        for (var el in this._kf_canplay[kf]) {
            console.debug(el);
            if (this._kf_canplay[kf][el] === false) {
                console.debug("Pausing playback as not all assets are decoded yet.. ");
                this.pause();
                break;
            }
        }
        // if we came to this point: start playback of all keyframe assets
        this._startKeyframeAssets(kf);
    },

    _startKeyframeAssets: function _startKeyframeAssets(kf) {
        if (kf in this._groupObjPlayers) {
            for (var group in this._groupObjPlayers[kf]) {
                var tmpGrp = this._groupObjPlayers[kf][group]; // TODO: does this cause additional delay?
                tmpGrp.play();
            }
        }
        if (kf in this._singleObjAudios) {
            for (var obj in this._singleObjAudios[kf]) {
                var tmpAudio = this._singleObjAudios[kf][obj]; // TODO: does this cause additional delay?
                tmpAudio.play();
            }
        }
    },

    _loadedStateDelegate: function _loadedStateDelegate(kf, obj) {
        return function () {
            console.debug("Asset now ready: " + obj);
            this._kf_canplay[kf][obj] = true;
            this._checkLoadedState(kf);
        }.bind(this);
    },

    _checkLoadedState: function _checkLoadedState(kf) {
        console.debug(this._kf_canplay[kf]);
        for (var obj in this._kf_canplay[kf]) {
            if (this._kf_canplay[kf][obj] !== true) {
                console.debug("We still need to wait for decoding of asset(s)");
                return; // break loop and return in case any of the objects is not yet ready
            }
        }

        var first_kf = _.min(Object.keys(this._keyframes)); //Get the first keyframe
        if (kf === first_kf) {
            $(document).triggerHandler('om_ready');
        }
        if (this.ctx.state === "suspended") {
            console.debug("Resuming playback - all assets are decoded now");
            this.resume();
        }
    },

    _handleKeyframeMappings: function _handleKeyframeMappings() {
        if (JSON.stringify(this._last_kfMapping) !== JSON.stringify(this._kfMapping)) {
            console.info("Track mapping has changed" + JSON.stringify(this._kfMapping));
            // Firstly disconnect everything to make sure that no old
            // mappings stay connected
            // That means that changes have to be made explicitely and
            // not implicitely!
            for (var key in this._audioInstances) {
                this._audioInstances[key].disconnect();
            }
            /*
            TODO: Irgendwie herausfinden, was sich zum aktuellen Mapping geändert hat.
            Dann dementsprechend connecten /disconnecten.
            */

            // And now connect all the mappings as per the keyframe
            for (var key in this._kfMapping) {
                var pannerObjects = [];
                var objs = this._kfMapping[key];
                if (typeof objs === "string") {
                    // == attribute
                    pannerObjects = this.objects[objs].highpass;
                } else if ((typeof objs === 'undefined' ? 'undefined' : _typeof(objs)) === "object") {
                    // == array
                    for (var i = 0; i < objs.length; i++) {
                        console.trace("Adding " + objs[i] + " to the pannerObject array");
                        pannerObjects.push(this.objects[objs[i]].highpass);
                    }
                }
                this._audioInstances[key].reconnect(pannerObjects);
                console.debug("Reconnecting " + key + " with " + objs);

                /**
                 * Will be fired if track mapping for object from list changes
                 * @event module:bogJS~ObjectManager#om_newTrackMapping
                 * @property {string} obj - Name of object
                 * @property {string[]} objs - Array of to be connected objects
                 */
                $(this).triggerHandler('om_newTrackMapping', [key, objs]);
            }
        }
        this._last_kfMapping = JSON.parse(JSON.stringify(this._kfMapping)); // making a "copy" and not a reference
    },

    _processCurrentKeyframes: function _processCurrentKeyframes() {
        for (var key in this._keyframes) {
            console.debug("Processing keyframe " + key);
            var relTime = parseFloat(this.ctx.currentTime - this._startTime + parseFloat(key));
            this._evts[key] = this._clock.setTimeout(this._buildKeyframeCallback(key, relTime), relTime);
        }
    },

    _buildKeyframeCallback: function _buildKeyframeCallback(key, relTime) {
        var that = this;
        return function () {
            that._handleKeyframe(key);
            that._currentKeyframeIndex = parseFloat(key);
            console.debug('Keyframe ' + key + ' reached at context time: ' + relTime);
        };
    },

    /*
    update: function(){
        console.trace("Updating scene..")
        // neue metadaten lesen
        // aktuelle Zeit vom AudioContext holen
        // Objekt-Eigenschaften entsprechend ändern
        // this.readMetadata();
        // this.processCurrentKeyframes();
    },
    */

    _checkReadyStart: function _checkReadyStart() {
        if (this._audiobed !== false) {
            return this._audiobed.canplay;
        } else {
            return true;
        }
    },

    /**
     * Sets RollOffFactor for all objects via
     * {@link module:bogJS~ObjectController#setRollOffFactor}
     * @param factor
     */
    setRollOffFactor: function setRollOffFactor(factor) {
        for (var key in this.objects) {
            this.objects[key].setRollOffFactor(factor);
        }
        this._triggerChange();
    },

    /**
     * Sets DistanceModel for all objects via
     * {@link module:bogJS~ObjectController#setDistanceModel}
     * @param model
     */
    setDistanceModel: function setDistanceModel(model) {
        for (var key in this.objects) {
            this.objects[key].setDistanceModel(model);
        }
        this._triggerChange();
    },

    /**
     * Sets RefDistance for all objects via
     * {@link module:bogJS~ObjectController#setRefDistance}
     * @param refDistance
     */
    setRefDistance: function setRefDistance(refDistance) {
        for (var key in this.objects) {
            this.objects[key].setRefDistance(refDistance);
        }
        this._triggerChange();
    },

    /**
     * Sets MaxDistance for all objects via
     * {@link module:bogJS~ObjectController#setMaxDistance}
     * @param maxDistance
     */
    setMaxDistance: function setMaxDistance(maxDistance) {
        for (var key in this.objects) {
            this.objects[key].setMaxDistance(maxDistance);
        }
        this._triggerChange();
    },

    setHighpassFreq: function setHighpassFreq(freq) {
        for (var key in this.objects) {
            this.objects[key].setHighpassFreq(freq);
        }
    },

    _initSwitchGroup: function _initSwitchGroup(groupName) {
        var item = this.interactiveInfo.switchGroups[groupName].default;
        this.switchGroup(groupName, item);
    },

    switchGroup: function switchGroup(groupName, item) {
        var objects = Object.values(this.interactiveInfo.switchGroups[groupName].items);
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = objects[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var obj = _step2.value;

                this.objects[obj].setStatus(false);
            }
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                }
            } finally {
                if (_didIteratorError2) {
                    throw _iteratorError2;
                }
            }
        }

        var active_obj = this.interactiveInfo.switchGroups[groupName].items[item];
        console.info("SwitchGroup " + groupName + " enable " + active_obj);
        this.objects[active_obj].setStatus(true);
    },

    setInteractiveGain: function setInteractiveGain(groupName, dBValue) {
        var minLogGain = parseFloat(this.interactiveInfo.gain[groupName].range[0]);
        var maxLogGain = parseFloat(this.interactiveInfo.gain[groupName].range[1]);
        var gainValue;
        if (parseFloat(dBValue) > maxLogGain) {
            gainValue = maxLogGain;
        } else if (parseFloat(dBValue) < minLogGain) {
            gainValue = minLogGain;
        } else {
            gainValue = dBValue;
        }
        // Crossfading
        //var range = Math.abs(minLogGain) * 0.5 + maxLogGain * 0.5;
        var gainGroup = Math.pow(10, gainValue * 0.5 / 20);
        var gainOther = Math.pow(10, -1 * gainValue * 0.5 / 20);
        var groupObjects = this.interactiveInfo.gain[groupName].objects;
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
            for (var _iterator3 = groupObjects[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var obj = _step3.value;

                this.objects[obj].setInteractiveGain(gainGroup);
            }
            // find other objects
        } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                    _iterator3.return();
                }
            } finally {
                if (_didIteratorError3) {
                    throw _iteratorError3;
                }
            }
        }

        var otherObjects = _.difference(Object.keys(this.objects), groupObjects);
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
            for (var _iterator4 = otherObjects[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                var oth = _step4.value;

                this.objects[oth].setInteractiveGain(gainOther);
            }
        } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion4 && _iterator4.return) {
                    _iterator4.return();
                }
            } finally {
                if (_didIteratorError4) {
                    throw _iteratorError4;
                }
            }
        }

        console.debug("Set group " + groupName + " gain to " + gainGroup + " and other objects to " + gainOther);
    },

    /**
     * @private
     * As Chrome (FF works) does not automatically use the new paramters of
     * distanceModle, refDistance and maxDistance, we need to trigger a change
     * by ourself. The additional value of 0.000001 for x seems to be the
     * threshold for Chrome to change the rendering.
     */
    _triggerChange: function _triggerChange() {
        var pos = this.getListenerPosition();
        this.setListenerPosition(pos[0] + 0.000001, pos[1], pos[2]);
        this.setListenerPosition(pos[0], pos[1], pos[2]);
    }
};

module.exports = ObjectManager;

},{"./channelorder_test":6,"./gain_controller":7,"./html5_player/core":8,"./media_controller":9,"./object":10,"./scene_reader":12,"underscore":3,"waaclock":4}],12:[function(require,module,exports){
"use strict";

/**
 * @file scene_reader.js
 * @author Michael Weitnauer [weitnauer@irt.de]
 */

/**
 * @module bogJS
 */

/**
 * @callback loaded_callback
 */

/**
 * Represents SceneReader class. Will load and parse scene data from URL for the
 * {@link module:bogJS~ObjectManager|ObjectManager} instance
 *
 * @constructor
 * @abstract
 *
 * @param {loaded_callback} [loaded_callback=undefined] - Callback that will be executed
 * if scene data is loaded and parsed.
 * @fires module:bogJS~SceneReader#scene_loaded
 *
 */

var SceneReader = function SceneReader(loaded_callback) {
    //this.load(url);
    this.callback = loaded_callback || undefined;
};

SceneReader.prototype = {

    /**
     * Executes XHR to load and parse the scene data from the passed URL
     *
     * @param {string} url - URL to scene data target
     * @fires module:bogJS~SceneReader#scene_loaded
     */
    load: function load(url) {
        // we need to do this as within the anonymous success function of the ajax call,
        // 'this' will refer to the window object and NOT to the SceneReader instance!
        var that = this;
        $.ajax({
            type: "GET",
            url: url,
            dataType: "text",
            success: function success(text) {
                that.parse(text);
                if (that.callback !== undefined) {
                    that.callback.call();
                }
            }
        });
    },

    parse: function parse(rawText) {
        var commands = this._tokenize(rawText);
        var data = this._parseSpatdif(commands);
        var keyframes = data[0];
        var audioURLs = data[1];
        var sceneInfo = data[2];
        var groupObjects = data[3];
        var audiobeds = data[4];
        var extraObjects = data[5];
        var interactiveInfo = data[6];
        var singleObjects = {};
        for (var kf in extraObjects) {
            for (var group in groupObjects[kf]) {
                for (var el in groupObjects[kf][group]) {
                    var obj = groupObjects[kf][group][el];
                    var idx = extraObjects[kf].indexOf(obj);
                    console.debug('Checking for double entry for object ' + obj);
                    if (idx > -1) {
                        extraObjects[kf].splice(idx, 1);
                        console.debug('Found group object ' + obj + ' also as single objects entry. Removing if from the list.');
                    }
                }
            }
        }
        singleObjects = extraObjects;

        /**
         * Will be fired if scene data is loaded and parsed
         * @event module:bogJS~SceneReader#scene_loaded
         * @abstract
         *
         * @property {module:bogJS~keyframes} keyframes - 'Dictionary' with keyframes
         * (Array with commands per detected keyframe in scene)
         *
         * @property {module:bogJS~audioURLs} audioURLs - 'Dictionary' with audioURLs
         * per Object in Scene (to be used for mapping of objects to
         * audio signals)
         *
         * @property {module:bogJS~sceneInfo} sceneInfo - 'Dictionary' with additional sceneInfo
         * (Can contain 'name', 'object_count', 'listener_orientation',
         * 'listener_position' and / or 'room_dimensions')
         *
         * @property {module:bogJS~groupObjects} groupObjects - 'Dictionary'
         * containing info to identify grouped objects
         *
         * @property {module:bogJS~singleObjects} singleObjects - 'Dictionary'
         * containing info to identify single objects
         *
         * @property {module:bogJS~audiobeds} audiobeds - 'Dictionary'
         * containing objects and their "track mapping" info
         *
         * @property {module:bogJS~interactiveInfo} interactiveInfo - 'Dictionary'
         * containing info for interactive objects and groups
         */
        $(this).triggerHandler('scene_loaded', [keyframes, audioURLs, sceneInfo, groupObjects, singleObjects, audiobeds, interactiveInfo]);
    },

    _tokenize: function _tokenize(d) {
        var lines = [];
        var data = d.split('\n');
        for (var i = 0; i < data.length; i++) {
            if (data[i].indexOf("/spatdif") === 0) {
                //String.prototype.startsWith() not yet widely supported
                var l = {};
                var line = data[i].split(' ');
                var command = line[0].split('/');
                l.cmd = command.slice(1, command.length);
                l.params = line.slice(1, line.length);
                if (l.params.length === 1) {
                    l.params = l.params[0]; // avoids having an array for a single value
                }
                lines[lines.length] = l; // makes sure that we append the data at the end and won't skip indices
            }
        }
        return lines;
    },

    _parseSpatdif: function _parseSpatdif(m) {
        var keyframes = {};
        var audioURLs = {};
        var sceneInfo = {};
        var interactiveInfo = {};
        interactiveInfo.switchGroups = {};
        interactiveInfo.gain = {};
        var groups = {};
        var extraObjects = {};
        var audiobeds = {};
        var keyframe = null;
        for (var i = 0; i < m.length; i++) {
            if (m[i].cmd[0] === "spatdif") {
                // darauf verzichten um die lesbarkeit des codes zu verbesern?
                if (m[i].cmd[1] === "meta") {
                    var meta = m[i];
                    if (meta.cmd[3] === "name") {
                        sceneInfo.name = meta.params;
                    } else if (meta.cmd[2] === "objects") {
                        sceneInfo.object_count = meta.params;
                    } else if (meta.cmd[2] === "reference" && meta.cmd[3] === "orientation") {
                        sceneInfo.listener_orientation = this._parseFloatArray(meta.params);
                    } else if (meta.cmd[2] === "room" && meta.cmd[3] === "origin") {
                        sceneInfo.listener_position = this._parseFloatArray(meta.params);
                    } else if (meta.cmd[2] === "room" && meta.cmd[3] === "dimension") {
                        sceneInfo.room_dimensions = this._parseFloatArray(meta.params);
                    } else if (meta.cmd[2] === "audiobed" && meta.cmd[3] === "url") {
                        sceneInfo.audiobed_url = meta.params;
                    } else if (meta.cmd[2] === "audiobed" && meta.cmd[3] === "tracks") {
                        sceneInfo.audiobed_tracks = meta.params;
                    } else if (meta.cmd[2] === "interactive") {
                        if (meta.cmd[3] === "switchGroup") {
                            if (meta.cmd[4] === "label") {
                                var label = meta.params[0];
                                interactiveInfo.switchGroups[label] = {};
                                interactiveInfo.switchGroups[label].default = meta.params[1];
                                interactiveInfo.switchGroups[label].items = {};
                            } else {
                                var item_label = meta.params[0];
                                interactiveInfo.switchGroups[label].items[item_label] = meta.params[1];
                            }
                        } else if (meta.cmd[3] === "gain") {
                            if (meta.cmd[4] === "label") {
                                var label = meta.params[0];
                                interactiveInfo.gain[label] = {};
                                interactiveInfo.gain[label].range = [meta.params[1], meta.params[2]];
                                interactiveInfo.gain[label].objects = [];
                            } else {
                                interactiveInfo.gain[label].objects.push(meta.params);
                            }
                        }
                    }
                } else if (m[i].cmd[1] === "time") {
                    keyframe = m[i].params;
                    keyframes[keyframe] = [];
                } else if (m[i].cmd[1] === "source" && keyframe !== null) {
                    // ignore the commands until the first keyframe appears
                    var obj = m[i].cmd[2];
                    var cmd = m[i].cmd[3];
                    var params = m[i].params;

                    if (cmd === "track_mapping") {
                        if (params.startsWith("bed_") && obj in audiobeds === false) {
                            audiobeds[obj] = params;
                        } else if (params.startsWith("bed_") === false && obj in audioURLs === false) {
                            audioURLs[obj] = params;
                            if (keyframe in extraObjects === false) {
                                extraObjects[keyframe] = [];
                            }
                            extraObjects[keyframe].push(obj);
                        }
                    }

                    if (cmd === "group") {
                        if (keyframe in groups === false) {
                            groups[keyframe] = {};
                        }
                        if (params in groups[keyframe] === false) {
                            groups[keyframe][params] = [];
                        }
                        if (groups[keyframe][params].indexOf(obj) === -1) {
                            groups[keyframe][params].push(obj); // == groups.keyframe.params.push(obj)
                            console.debug("Adding " + obj + " to group " + params + " at keyframe " + keyframe);
                        }
                    }
                    var triplet = {};
                    triplet.obj = obj;
                    if (cmd === "active") {
                        cmd = "is_present";
                    }
                    triplet.cmd = cmd;
                    triplet.params = m[i].params;
                    keyframes[keyframe].push(triplet);
                }
            }
        }
        return [keyframes, audioURLs, sceneInfo, groups, audiobeds, extraObjects, interactiveInfo];
    },

    _parseFloatArray: function _parseFloatArray(array) {
        var tmp_array = [];
        for (var n in array) {
            var number = parseFloat(array[n]);
            if (!isNaN(number)) {
                tmp_array[tmp_array.length] = number;
            }
        }
        return tmp_array;
    }

};

module.exports = SceneReader;

},{}]},{},[1])
//# sourceMappingURL=bogJS-latest.js.map
