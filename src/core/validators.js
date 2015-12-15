export default function ValidationError(message) {
  this.name = 'ValidationError';
  this.message = message || 'Validation Error';
  this.stack = (new Error()).stack;
}

ValidationError.prototype = Object.create(Error.prototype);
ValidationError.constructor = ValidationError;

function ValidationError(message) {
  this.name = 'ValidationError';
  this.message = message || 'Validation Error';
  this.stack = (new Error()).stack;
}

ValidationError.prototype = Object.create(Error.prototype);
ValidationError.constructor = ValidationError;

export function EmailValidator(message, code, whitelist) {
  if (message) {
    this.message = message;
  }
  if (code) {
    this.code = code;
  }
  if (whitelist) {
    this.domainWhitelist = whitelist;
  }
}

EmailValidator.prototype = Object.create({
  message: 'Enter a valid email',
  code: 'invalid email',
  domainWhitelist: ['localhost'],
  userRe: /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))$/i,
  validate: function (value) {
    if (/\s/.test(value) || !value.indexOf('@')) {
      throw new ValidationError(this.message);
    }
    var [userPart, domainPart] = value.split('@');
    if (!this.userRe.test(userPart)) {
      throw new ValidationError(this.message);
    }
    if (this.domainWhitelist.indexOf(domainPart) === -1 &&
      !this.validateDomainPart(domainPart)) {
      throw new ValidationError(this.message);
    }
  },

  validateDomainPart(value) {
    var parts = value.split('.');
    var tld = parts.pop();
    if (!parts.length || !/^([a-z\u00a1-\uffff]{2,}|xn[a-z0-9-]{2,})$/i.test(tld)) {
      return false;
    }
    for (var part, i = 0; i < parts.length; i++) {
      part = parts[i];

      if (!/^[a-z\u00a1-\uffff0-9-]+$/i.test(part)) {
        return false;
      }
      if (part[0] === '-' || part[part.length - 1] === '-' ||
        part.indexOf('---') >= 0) {
        return false;
      }
    }
    return true;
  }
});

export var validateEmail = new EmailValidator();

export function BaseValidator(limitValue, message) {
  this.limitValue = limitValue;
  if (message) {
    this.message = message;
  }
}

BaseValidator.prototype = Object.create({
  message: function () {
    return `Ensure this value is ${this.limitValue} (it is ${this.showValue}).`;
  },

  clean: function (a) {
    return a;
  },

  compare: function (a, b) {
    return a !== b;
  },

  validate: function (value) {
    var cleaned = this.clean(value);
    this.showValue = cleaned;
    if (this.compare(cleaned, this.limitValue)) {
      var message = typeof this.message === 'function' ? this.message() : this.message;
      throw new ValidationError(message);
    }
  }
});

export class MaxValueValidator extends BaseValidator {
  message() {
    return `Ensure this value is less than or equal to ${this.limitValue}.`;
  }

  compare(a, b) {
    return a > b;
  }
}

export class MinValueValidator extends BaseValidator {
  message() {
    return `Ensure this value is less than or equal to ${this.limitValue}.`;
  }

  compare(a, b) {
    return a < b;
  }
}

export class MaxLengthValueValidator extends MaxValueValidator {
  message() {
    return `Ensure this value has at most ${this.limitValue} character (it has ${this.showValue}).`;
  }

  clean(a) {
    return a.length;
  }
}

export class MinLengthValidator extends MinValueValidator {
  message() {
    return `Ensure this value has at least ${this.limitValue} character (it has ${this.showValue}).`;
  },

  clean(a) {
    return a.length;
  }
}
