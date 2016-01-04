import memoize from '../utils/functools';

const CAMELCASE1_RE = /(\-|\_|\.|\s)+(.)?/g;
const CAMELCASE2_RE = /(^|\/)([A-Z])/g;

const DECAMELIZE_RE = /([a-z\d])([A-Z])/g;

function _camelize(str) {
  return str.replace(CAMELCASE1_RE, (match, separator, chr) => {
    return chr ? chr.toUpperCase() : '';
  }).replace(CAMELCASE2_RE, (match, separator, chr) => {
    return match.toLowerCase();
  });
}

function _decamelize(str) {
  return str.replace(DECAMELIZE_RE, '$1_$2').toLowerCase();
}

export var camelize = memoize(_camelize);
export var decamelize = memoize(_decamelize);
export default camelize;

function _dasherize(str) {
  return decamelize(str).replace(/[ _]/g, '-');
}

export var dasherize = memoize(_dasherize);

function _capitalize(str) {
  return str.replace(/(^|\/)([a-z])/g, function(match, separator, chr) {
    return match.toUpperCase();
  });
}

export var capitalize = memoize(_capitalize);

var inflectorRules = (function () {
  return {
    plurals: [
      [/$/, 's'],
      [/s$/i, 's'],
      [/^(ax|test)is$/i, '$1es'],
      [/(octop|vir)us$/i, '$1i'],
      [/(octop|vir)i$/i, '$1i'],
      [/(alias|status)$/i, '$1es'],
      [/(bu)s$/i, '$1ses'],
      [/(buffal|tomat)o$/i, '$1oes'],
      [/([ti])um$/i, '$1a'],
      [/([ti])a$/i, '$1a'],
      [/sis$/i, 'ses'],
      [/(?:([^f])fe|([lr])f)$/i, '$1$2ves'],
      [/(hive)$/i, '$1s'],
      [/([^aeiouy]|qu)y$/i, '$1ies'],
      [/(x|ch|ss|sh)$/i, '$1es'],
      [/(matr|vert|ind)(?:ix|ex)$/i, '$1ices'],
      [/^(m|l)ouse$/i, '$1ice'],
      [/^(m|l)ice$/i, '$1ice'],
      [/^(ox)$/i, '$1en'],
      [/^(oxen)$/i, '$1'],
      [/(quiz)$/i, '$1zes']
    ],

    singular: [
      [/s$/i, ''],
      [/(ss)$/i, '$1'],
      [/(n)ews$/i, '$1ews'],
      [/([ti])a$/i, '$1um'],
      [/((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)(sis|ses)$/i, '$1sis'],
      [/(^analy)(sis|ses)$/i, '$1sis'],
      [/([^f])ves$/i, '$1fe'],
      [/(hive)s$/i, '$1'],
      [/(tive)s$/i, '$1'],
      [/([lr])ves$/i, '$1f'],
      [/([^aeiouy]|qu)ies$/i, '$1y'],
      [/(s)eries$/i, '$1eries'],
      [/(m)ovies$/i, '$1ovie'],
      [/(x|ch|ss|sh)es$/i, '$1'],
      [/^(m|l)ice$/i, '$1ouse'],
      [/(bus)(es)?$/i, '$1'],
      [/(o)es$/i, '$1'],
      [/(shoe)s$/i, '$1'],
      [/(cris|test)(is|es)$/i, '$1is'],
      [/^(a)x[ie]s$/i, '$1xis'],
      [/(octop|vir)(us|i)$/i, '$1us'],
      [/(alias|status)(es)?$/i, '$1'],
      [/^(ox)en/i, '$1'],
      [/(vert|ind)ices$/i, '$1ex'],
      [/(matr)ices$/i, '$1ix'],
      [/(quiz)zes$/i, '$1'],
      [/(database)s$/i, '$1']
    ],

    irregularPairs: [
      ['person', 'people'],
      ['man', 'men'],
      ['child', 'children'],
      ['sex', 'sexes'],
      ['move', 'moves'],
      ['cow', 'kine'],
      ['zombie', 'zombies']
     ],

    uncountable: [
      'equipment',
      'information',
      'rice',
      'money',
      'species',
      'series',
      'fish',
      'sheep',
      'jeans',
      'police'
    ]
  };
})();

var inflector = (function () {
  const BLANK_REGEX = /^\s*$/;
  const LAST_WORD_DASHED_REGEX = /([\w/-]+[_/\s-])([a-z\d]+$)/;
  const LAST_WORD_CAMELIZED_REGEX = /([\w/\s-]+)([A-Z][a-z\d]*$)/;
  const CAMELIZED_REGEX = /[A-Z][a-z\d]*$/;

  function makeDictionary() {
    var dict = Object.create(null);
    dict['dict'] = null;
    delete dict['dict'];
    return dict;
  }

  function loadUncountable(rules, uncountable) {
    for (var i = 0, length = uncountable.length; i < length; i++) {
      rules.uncountable[uncountable[i].toLowerCase()] = true;
    }
  }

  function loadIrregular(rules, irregularPairs) {
    var pair;

    for (var i = 0, length = irregularPairs.length; i < length; i++) {
      pair = irregularPairs[i];

      //pluralizing
      rules.irregular[pair[0].toLowerCase()] = pair[1];
      rules.irregular[pair[1].toLowerCase()] = pair[1];

      //singularizing
      rules.irregularInverse[pair[1].toLowerCase()] = pair[0];
      rules.irregularInverse[pair[0].toLowerCase()] = pair[0];
    }
  }

  var ruleSet = inflectorRules,
    rules = {
      plurals:  ruleSet.plurals || [],
      singular: ruleSet.singular || [],
      irregular: makeDictionary(),
      irregularInverse: makeDictionary(),
      uncountable: makeDictionary()
    };

  loadUncountable(rules, ruleSet.uncountable);
  loadIrregular(rules, ruleSet.irregularPairs);

  function inflect(word, typeRules, irregular) {
    var inflection, substitution, result, lowercase, wordSplit,
      firstPhrase, lastWord, isBlank, isCamelized, rule, isUncountable;

    isBlank = !word || BLANK_REGEX.test(word);

    isCamelized = CAMELIZED_REGEX.test(word);
    firstPhrase = "";

    if (isBlank) {
      return word;
    }

    lowercase = word.toLowerCase();
    wordSplit = LAST_WORD_DASHED_REGEX.exec(word) || LAST_WORD_CAMELIZED_REGEX.exec(word);

    if (wordSplit){
      firstPhrase = wordSplit[1];
      lastWord = wordSplit[2].toLowerCase();
    }

    isUncountable = rules.uncountable[lowercase] || rules.uncountable[lastWord];

    if (isUncountable) {
      return word;
    }

    for (rule in rules.irregular) {
      if (lowercase.match(rule+"$")) {
        substitution = irregular[rule];

        if (isCamelized && irregular[lastWord]) {
          substitution = capitalize(substitution);
          rule = capitalize(rule);
        }

        return word.replace(rule, substitution);
      }
    }

    for (var i = typeRules.length, min = 0; i > min; i--) {
       inflection = typeRules[i-1];
       rule = inflection[0];

      if (rule.test(word)) {
        break;
      }
    }

    inflection = inflection || [];

    rule = inflection[0];
    substitution = inflection[1];

    result = word.replace(rule, substitution);

    return result;
  }

  function pluralize(str) {
    return inflect(str, rules.plurals, rules.irregular);
  }

  function singularize(str) {
    return inflect(str, rules.singular, rules.irregularInverse);
  }

  return {
    pluralize,
    singularize
  };
})();

export var pluralize = memoize(inflector.pluralize);
export var singularize = memoize(inflector.singularize);
