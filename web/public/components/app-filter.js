module.exports = {
  money: ['$filter', function ($filter) {
    return function (input, symbol) {
      if (input === undefined) return '';
      return $filter('number')(+input) + ' ' + symbol;
    };
  }],
  mformat: ['$filter', function ($filter) {
    return function (input, str) {
      if (input === undefined) return '';
      return str.replace('$n', $filter('number')(+input));
    };
  }],
  amPm: ['$filter', function ($filter) {
    return function (input, symbol) {
      if (input === undefined) return '';
      var tmp = input.split(':');
      var hour = +tmp[0];
      var min = +tmp[1];
      if (hour > 12) return (hour - 12) + ':' + min + ' PM';
      else return hour + ':' + min + ' AM';
    };
  }]
}