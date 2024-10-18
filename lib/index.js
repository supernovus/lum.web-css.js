const core = require('@lumjs/core');
const {S,N} = core.types;
const {copyProps} = core.obj;
const {getElementsGiven,getSubjectFromString} = require('./util');

/**
 * A simple class for working with CSS in the browser.
 * 
 * @exports module:@lumjs/web-css
 */
class LumCSS
{
  /**
   * Build a new Lum CSS helper instance.
   * 
   * @param {Document} [doc] - The top-level Document.
   *   We will use the global `document` variable if this is not defined.
   * @param {object} [methOpts] Default options for all methods.
   *   If no options are specified, we'll use built-in defaults.
   * @param {object} [copyOpts] Options for `copyProps()`.
   *   Used to merge `methOpts` into options passed to methods.
   */
  constructor (doc, methOpts={}, copyOpts={})
  {
    /**
     * The top-level document.
     * @type {Document}
     */
    this.doc = (doc instanceof Document) ? doc : document;

    /**
     * A link to `doc.styleSheets`
     * @type {StyleSheetList}
     */
    this.sheets = this.doc.styleSheets;

    /**
     * Default options to use in all methods.
     * @type {object}
     */
    this.methOptions = methOpts;

    /**
     * Options to use for `copyProps()`.
     * @type {object}
     */
    this.copyOptions = copyOpts;
  }

  /**
   * Find *external* Stylesheet rules applicable to specified element(s).
   * 
   * @param {(object|string)} element - Element(s) to get rules for.
   * 
   * If an `object`, may be a DOM `Element, NodeList, HTMLCollection`,
   * a `jQuery` results object representing one or more elements,
   * or an `array` of DOM `Element` objects.
   * 
   * If a `string` we pass it to `querySelectorAll()` or `querySelector()`
   * (depending on `single` option) to get the list of elements.
   * 
   * @param {object} [options] Options
   * @param {boolean} [options.single=false] Only use first element in a list?
   * @param {number} [options.nested=0] Allow arrays of nested containers?
   * @param {array} [options.matches] The array of matches to append to.
   *   If not specified, we'll use a new array.
   * 
   * @returns {array} The array of matches.
   */
  findRules (element, options={}, copyDefaults=true)
  {
    if (copyDefaults)
      copyProps(this.methOptions, options, this.copyOptions);

    const matches = Array.isArray(options.matches) ? options.matches : [];
    const nested  = (typeof options.nested === N)  ? options.nested  : 0;

    if (options.doc === undefined)   options.doc   = this.doc;
    if (options.fatal === undefined) options.fatal = false;

    element = getElementsGiven(element, options);
    if (element === null || element === undefined)
    { // Nothing was returned, we're done here.
      return matches;
    }

    if (!(element instanceof Element))
    { // If it's not an element, it's a container.
      const subOpts = copyProps(options, {matches, nested: nested-1});
      for (const subElem of element)
      {
        this.findRules(subElem, subOpts);
      }
      return matches;
    }

    function loopRules (rules)
    {
      for (const rule of rules)
      {
        if (rule instanceof CSSMediaRule)
        {
          if (window.matchMedia(rule.conditionText).matches)
          {
            loopRules(rule.cssRules);
          }
        }
        // TODO: support other CSSGroupingRule/CSSConditionRule types.
        else if (rule instanceof CSSStyleRule)
        {
          if (element.matches(rule.selectorText))
          {
            matches.push(rule);
          }
        }
      }
    }

    for (const sheet of this.sheets)
    {
      loopRules(sheet.cssRules);
    }

    return matches;
  }

  /**
   * Find *all* CSS style declarations applicable to one or more elements.
   * 
   * Uses `this` LumCSS instance as the parent.
   * 
   * @param {(object|string)} subject - Element(s) for the info object.
   * 
   * If this is a `string` then we call `querySelectorAll(subject)`;
   * if the resulting `NodeList` has just one child element, that element
   * will be used as the subject.
   * 
   * If the returned list has more than one subject, we use the list
   * as a container subject.
   * 
   * @param {object} [options] Options to pass to the info object.
   * 
   * @returns {object} The type of object depends on `subject`.
   * 
   * If the `subject` is an `Element` we use `ForElement`.
   * If the `subject` is any kind of container, we use `ForContainer`.
   * Any other value is invalid and we'll throw an error.
   */
  for(subject, options={})
  {
    return getInfoForSubject(subject, options, this.doc, this);
  }

  /**
   * The same as `#for()` except builds a new LumCSS instance.
   * 
   * @param {(object|string)} subject
   * @param {object} [options] 
   * @returns {object}
   */
  static for(subject, options={})
  {
    return getInfoForSubject(subject, options, options.doc);
  }

} // LumCSS class

// Private function.
function getInfoForSubject(subject, options, doc, parent)
{
  if (typeof subject === S)
  { // A string.
    subject = getSubjectFromString(subject, doc);
  }

  if (!subject)
  {
    throw new Error("No element could be found.");
  }

  if (subject instanceof Element)
  {
    return new ForElement(subject, options, parent);
  }
  else
  {
    return new ForContainer(subject, options, parent);
  }
}

module.exports = LumCSS;

const ForElement   = require('./forelement');
const ForContainer = require('./forcontainer');

LumCSS.ForElement   = ForElement;
LumCSS.ForContainer = ForContainer;
