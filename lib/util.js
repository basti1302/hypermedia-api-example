'use strict';

var _ = require('lodash');

exports.filterByQueryTerm = function(list, queryObject, queryKey, objectKey) {
  var queryValue = queryObject[queryKey];
  if (queryValue) {
    return _.filter(list, function(obj) {
      var objectValue = obj[objectKey];
      if (!objectValue) {
        console.log('object does not have value for ' + objectKey);
        return false;
      } else if (typeof objectValue === 'string') {
        console.log('string comparison for query key ' + queryKey);
        return objectValue.toUpperCase().indexOf(queryValue.toUpperCase()) >= 0;
      } else if (typeof objectValue === 'number') {
        console.log('num comparison for query key ' + queryKey);
        var f = parseFloat(queryValue);
        console.log('parsed to ' + f);
        if (isNaN(f)) {
          console.log('NaN for query key ' + queryKey + ': ' + queryValue);
          return true;
        }
        return objectValue == f;
      } else {
        console.log('Can\'t filter by query key ' + queryKey + ': ' +
          queryValue);
        return true;
      }
    });
  }
  console.log('Ignoring query key ' + queryKey);
  return list;
}
