import * as itertools from 'shopie/utils/itertools';

var toArray = itertools.toArray;

describe('itertools spec', function () {
  it('itertools iter can convert to iterable', function () {
    var str = 'syaiful bahri',
      iterstr = itertools.iter(str);
    expect(iterstr[Symbol.iterator]).toBeDefined();
  });
  describe('range', function () {

    it('range work with one argument', function () {
      var range = itertools.range(5);
      expect(range[Symbol.iterator]).toBeDefined();
      expect(toArray(range)).toEqual([0, 1, 2, 3, 4]);
    });

    it('range work with start stop', function () {
      var range = itertools.range(5, 0);
      expect(toArray(range)).toEqual([5,4,3,2,1]);
    });

    it('range with full argument, start stop step', function () {
      var range = itertools.range(0,10,2);
      expect(toArray(range)).toEqual([0,2,4,6,8]);
    });
  });

  it('zip, exhausted when one iter exhausted.', function () {
    var zipped = itertools.zip(itertools.range(10), ['a', 'b', 'c']);
    expect(zipped[Symbol.iterator]).toBeDefined();
    expect(toArray(zipped)).toEqual([[0,'a'], [1, 'b'], [2, 'c']]);
  });
});
