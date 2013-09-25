"use strict";

var Arrays = {};

Arrays.binary_search = function(array, start, end, key) {
  var pivot;
  while (true) {
    pivot = Math.floor((start + end) / 2);
    if ((pivot === end || pivot === start) && array[pivot] !== key) {
      return -1;
    }
    if (array[pivot] > key) {
      end = pivot;
    } else if (array[pivot] < key) {
      start = pivot;
    } else {
      return pivot;
    }
  }
};

Arrays.copyOf = function(array, newSize) {
  var copy = array.slice(0, newSize);
  if (newSize > array.length) {
    copy = copy.concat(new Array(newSize-array.length));
  }
  return copy;
};

Arrays.fill = function(array, start, end, value) {
  var i = start;
  while (i < end) {
    array[i++] = value;
  }
};

module.exports = Arrays;
