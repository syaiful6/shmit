import Model,
  {attr, numberTransformer, booleanTransformer,
    dateTransformer, hasOne, hasMany} from '../../core/model';
import inherits from '../../utils/inherits';

export default (function (BaseModel) {
  function Product() {
    BaseModel.apply(this, arguments);
  }

  inherits(Product, BaseModel);

  Object.defineProperties(Product.prototype, {
    name: attr('name'),
    slug: attr('slug'),
    shortDescription: attr('short-description'),
    description: attr('description'),
    image: attr('image'),
    unitPrice: attr('unit-price', numberTransformer),
    isActive: attr('is-active', booleanTransformer),
    status: attr('status'),
    createdAt: attr('created-at', dateTransformer),
    updatedAt: attr('updated-at', dateTransformer),

    parent: hasOne('parent'),
    variants: {
      enumerable: true,
      configurable: true,
      get: function () {
        var parent = this.parent;
        if (typeof parent.toJSON !== 'function') {
          var records = this.store.peekRecords('products');
          return records.filter(function (data) {
            return data.id && data.id() === this.id();
          });
        }
      }
    },

    author: hasOne('author')
  });

  return Product;
})(Model);
