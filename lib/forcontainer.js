const core = require('@lumjs/core');
const {clone} = core.obj;
const CSSInfo = require('./cssinfo');
const ForElem = require('./forelement');
const {isContainer,getElementsFrom,findFirstElement} = require('./util');

/**
 * A CSS info wrapper for Element containers.
 * @name module:@lumjs/web-css.ForContainer
 */
class CSSforContainer extends CSSInfo
{
  /**
   * Build a CSS Info object for a Container.
   * 
   * @param {object} container - Container object.
   * @param {object} [options] Options for method calls.
   * @param {LumCSS} [parent] Optional parent instance.
   */
  constructor(container, options={}, parent=null)
  {
    super(container, options, parent);
    this.useAll = options.defaultAll ?? false;
  }

  validateSubject(obj, opts)
  {
    const nested = (typeof opts.nested === N) ? opts.nested : 0;
    return isContainer(obj, nested);
  }

  get subjectType() { return 'a container of elements'; }

  get ownerDocument()
  { // Just get the ownerDocument from the first element.
    return this.firstElement.ownerDocument;
  }

  /**
   * Get the first element in the container.
   * @type {Element}
   */
  get firstElement()
  {
    if (this.$firstElement === undefined)
    {
      const opts = this.options;
      const nested = (typeof opts.nested === N) ? opts.nested : 0;
      this.$firstElement = findFirstElement(this.subject, nested);
    }
    return this.$firstElement;
  }

  /**
   * Get all elements in the container.
   * @type {Element[]}
   */
  get elements()
  {
    if (this.$elements === undefined)
    {
      const opts = this.options;
      const nested = (typeof opts.nested === N) ? opts.nested : 0;
      this.$elements = getElementsFrom(this.subject, nested);
    }
    return this.$elements;
  }

  /**
   * Get CSS info objects for all elements in the container.
   * @type {module:@lumjs/web-css.ForElement[]}
   */
  get cssForElements()
  {
    if (this.$cssForElements === undefined)
    {
      const css4el = [];
      for (const elem of this.elements)
      {
        const forEl = new ForElem(elem, clone(this.options), this.parent);
        css4el.push(forEl);
      }
      this.$cssForElements = css4el;
    }
    return this.$cssForElements;
  }

  get firstComputed()
  {
    return this.cssForElements[0].computed;
  }

  get firstInline()
  {
    return this.cssForElements[0].inline;
  }

  get firstRules()
  {
    return this.cssForElements[0].rules;
  }

  fromAll(prop)
  {
    const results = [];
    for (const css in this.cssForElements)
    {
      results.push(css[prop]);
    }
    return results;
  }

  get allComputed()
  {
    return this.fromAll('computed');
  }

  get allInline()
  {
    return this.fromAll('inline');
  }

  get allRules()
  {
    return this.fromAll('rules');
  }

  get element()
  {
    return (this.useAll ? this.elements : this.firstElement);
  }

  get computed()
  {
    return (this.useAll ? this.allComputed : this.firstComputed);
  }

  get inline()
  {
    return (this.useAll ? this.allInline : this.firstInline);
  }

  get rules()
  {
    return (this.useAll ? this.allRules : this.firstRules);
  }

} // CSSforElement

module.exports = CSSforContainer;

