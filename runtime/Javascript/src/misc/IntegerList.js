"use strict";
/*
 * [The "BSD license"]
 *  Copyright (c) 2013 Oliver Buchtala
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions
 *  are met:
 *
 *  1. Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *  2. Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *  3. The name of the author may not be used to endorse or promote products
 *     derived from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
 *  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 *  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
 *  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 *  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 *  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 *  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 *  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var _ = require("underscore");
var Arrays = require("./Arrays");

var IntegerList = function() {
  this._data = null;
  this._size = 0;

  if (arguments.length === 0) {
    this._data = IntegerList.EMPTY_DATA;
  } else if (arguments.length === 1) {
    var arg = arguments[0];
    if (_.isNumber(arg)) {
      var capacity = arg;
      if (capacity < 0) {
        throw new Error("IllegalArgumentException");
      }
      if (capacity === 0) {
        this._data = IntegerList.EMPTY_DATA;
      } else {
        this._data = new Array(capacity);
      }
    } else if (arg instanceof IntegerList) {
      var list = arg;
      this._data = _.clone(list._data);
      this._size = list._size;
    }
  }

  if (this._data === null) {
    throw new Error("IllegalArgumentException");
  }
};

function _arraycopy(src, srcPos, dst, dstPos, n) {
  var i = 0;
  while (i < n) {
    dst[dstPos++] = src[srcPos++];
  }
}

IntegerList.__prototype__ = function() {

  this.add = function(value) {
    if (this._data.length === this._size) {
      this.ensureCapacity(this._size + 1);
    }
    this._data[this._size] = value;
    this._size++;
  };

  this.addAll = function(array) {
    this.ensureCapacity(this._size + array.length);
    _arraycopy(array, 0, this._data, this._size, array.length);
    this._size += array.length;
  };

  this.get = function(index) {
    if (index < 0 || index >= this._size) {
      throw new Error("IndexOutOfBoundsException");
    }
    return this._data[index];
  };

  this.contains = function(value) {
    return (this._data.indexOf(value) > -1);
  };

  this.set = function(index, value) {
    if (index < 0 || index >= this._size) {
      throw new Error("IndexOutOfBoundsException");
    }
    var previous = this._data[index];
    this._data[index] = value;
    return previous;
  };

  this.removeAt = function(index) {
    var value = this.get(index);
    this._data.splice(index, 1);
    this._data.push(undefined);
    this._size--;
    return value;
  };

  this.removeRange = function(fromIndex, toIndex) {
    if (fromIndex < 0 || toIndex < 0 || fromIndex > this._size || toIndex > this._size) {
      throw new Error("IndexOutOfBoundsException");
    }
    if (fromIndex > toIndex) {
      throw new Error("IllegalArgumentException");
    }
    this._data.splice(fromIndex, (toIndex - fromIndex));
    this._size -= (toIndex - fromIndex);
  };

  this.isEmpty = function() {
    return this._size === 0;
  };

  this.size = function() {
    return this._size;
  };

  this.trimToSize = function() {
    if (this._data.length === this._size) {
      return;
    }
    this._data = Arrays.copyOf(this._data, this._size);
  };

  this.clear = function() {
    Arrays.fill(this._data, 0, this._size, 0);
    this._size = 0;
  };

  this.toArray = function() {
    if (this._size === 0) {
      return IntegerList.EMPTY_DATA;
    }

    return Arrays.copyOf(this._data, this._size);
  };

  this.sort = function() {
    this._data.sort();
  };

  this.toString = function() {
    return JSON.stringify(this._data);
  };

  this.binarySearch = function(key) {
    return Arrays.binarySearch(this._data, 0, this._size, key);
  };

  this.binarySearch = function(fromIndex, toIndex, key) {
    if (fromIndex < 0 || toIndex < 0 || fromIndex > this._size || toIndex > this._size) {
      throw new Error("IndexOutOfBoundsException");
    }
    return Arrays.binarySearch(this._data, fromIndex, toIndex, key);
  };

  this.ensureCapacity = function(capacity) {
    if (capacity < 0 || capacity > IntegerList.MAX_ARRAY_SIZE) {
      throw new Error("OutOfMemoryError");
    }

    var newLength;
    if (this._data.length === 0) {
      newLength = IntegerList.INITIAL_SIZE;
    } else {
      newLength = this._data.length;
    }

    while (newLength < capacity) {
      newLength = newLength * 2;
      if (newLength < 0 || newLength > IntegerList.MAX_ARRAY_SIZE) {
        newLength = IntegerList.MAX_ARRAY_SIZE;
      }
    }

    this._data = Arrays.copyOf(this._data, newLength);
  };

};
IntegerList.prototype = new IntegerList.__prototype__();

IntegerList.EMPTY_DATA = [];
IntegerList.INITIAL_SIZE = 4;
IntegerList.MAX_ARRAY_SIZE = Number.MAX_VALUE - 8;

module.exports = IntegerList;
