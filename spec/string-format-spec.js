import camelize,
  {decamelize, dasherize, capitalize,
    singularize, pluralize } from 'shopie/core/string-format';

describe('string format spec', function () {
  describe('capitalize spec', function () {
    it('can capitalize spacing words', function () {
      var spacing = 'javascript framework',
        capitalized = capitalize(spacing);
      expect(capitalized).toEqual('Javascript framework');
    });

    it('can capitalize dasherize words', function () {
      var dashword = 'order-items',
        capitalized = capitalize(dashword);
      expect(capitalized).toEqual('Order-items');
    });

    it('can capitalize underscore words', function () {
      var underscore = 'underscore_word',
        capitalized = capitalize(underscore);
      expect(capitalized).toEqual('Underscore_word');
    });

    it('Do nothing if already capitalized', function () {
      var nochange = 'Capitalize word',
        capitalized = capitalize(nochange);
      expect(capitalized).toEqual(nochange);
    })
  });

  describe('camelize spec', function () {
    it('Do nothing if already camelcase words', function () {
      var camelcase = 'stringFormat',
        camelized = camelize(camelcase);
      expect(camelized).toEqual(camelcase);
    });

    it('can camelize underscore words', function () {
      var snakecase = 'string_format',
        camelized = camelize(snakecase);
      expect(camelized).toEqual('stringFormat');
    });

    it('can camelized dasherize words', function () {
      var dashword = 'string-format',
        camelized = camelize(dashword);
      expect(camelized).toEqual('stringFormat');
    });

    it('can camelized spacing words with all lowercase', function () {
      var lowerWords = 'string format module',
        camelized = camelize(lowerWords);
      expect(camelized).toEqual('stringFormatModule');
    });

    it('can camelized spacing words with all first char uppercase', function () {
      var words = 'String Format Module',
        camelized = camelize(words);
      expect(camelized).toEqual('stringFormatModule');
    });
  });
});
