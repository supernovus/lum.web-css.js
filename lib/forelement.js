const core = require('@lumjs/core');
const {clone} = core.obj;
const CSSInfo = require('./cssinfo');

/**
 * A CSS info wrapper for individual Element objects.
 * @name module:@lumjs/web-css.ForElement
 */
class CSSforElement extends CSSInfo
{
  /**
   * Build a CSS Info object for an Element.
   * 
   * @param {Element} element - Element this is wrapping.
   * @param {object} [options] Options for method calls.
   * @param {module:@lumjs/web-css} [parent] Optional parent instance. 
   */
  constructor(element, options={}, parent=null)
  {
    super(element, options, parent);
  }

  validateSubject(obj)
  {
    return (obj instanceof Element);
  }

  get subjectType() { return 'an Element'; }

  get ownerDocument()
  { // It's easy as the subject is an Element.
    return this.subject.ownerDocument;
  }

  /**
   * Get computed styles for the element.
   */
  get computed()
  {
    if (this.$computed === undefined)
    {
      this.$computed = getComputedStyle(this.subject);
    }
    return this.$computed;
  }

  /**
   * Get inline styles for the element.
   */
  get inline()
  {
    return this.subject.style;
  }

  /**
   * Get external stylesheet rules applicable to the element.
   */
  get rules()
  {
    return this.parent.findRules(this.subject, clone(this.options));
  }

} // CSSforElement

module.exports = CSSforElement;
