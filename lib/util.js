const core = require('@lumjs/core');
const {F,N,S} = core.types;

/**
 * Is a passed value a JQuery result instance?
 * 
 * @param {*} what - Value to test.
 * @returns {boolean}
 */
function isJQuery(what)
{
  return (typeof window.jQuery === F && what instanceof window.jQuery);
}

/**
 * See if a value is an array of Element objects.
 * 
 * Generally not called on its own, this is a helper function used
 * by the `isContainer()` function.
 * 
 * @param {*} what - Value to test.
 * @param {number} [nested=0] Nesting level allowed.
 *  
 * @returns {boolean}
 */
function isArrayOfElements(what, nested=0)
{
  if (Array.isArray(what))
  {
    if (typeof nested !== N)
    {
      nested = nested ? 1 : 0;
    }

    for (const item of what)
    {
      if (!(item instanceof Element))
      {
        if (nested > 0 && isContainer(item, nested-1)) 
        { // Was a container and nesting is allowed, so we're good to go.
          continue;
        }
        return false; // Wasn't an Element, bye!
      }
    }

    // All items were elements (or nested containers if allowed).
    return true;
  }

  // Was not an array.
  return false;
}

/**
 * See if a value is a container of Elements.
 * 
 * Valid containers are:
 * 
 * - `NodeList`
 * - `HTMLCollection`
 * - `jQuery` result instance
 * - `array` of `Element` objects
 * 
 * @param {*} what - value to test
 * @param {number} [nested=0] See `ArrayOfElements()`
 * @returns {boolean}
 */
function isContainer(what, nested=0)
{
  return (what instanceof NodeList 
    || what instanceof HTMLCollection 
    || isJQuery(what)
    || isArrayOfElements(what, nested));
}

function getElementsGiven(from, opts={})
{
  const single = opts.single  ?? false; // Single item only?
  const flat   = opts.flatten ?? false; // Flatten containers?
  const fatal  = opts.fatal   ?? true;  // Die on errors?

  const doc = (opts.doc instanceof Document) 
    ? opts.doc 
    : document;

  const nested = (typeof opts.nested === N) 
    ? opts.nested 
    : 0;

  if (typeof from === S)
  { 
    if (single)
    {
      return doc.querySelector(from);
    }
    else 
    {
      return doc.querySelectorAll(from);
    }
  }
  else if (from instanceof Element)
  { 
    if (single)
    {
      return from;
    }
    else
    {
      return [from];
    }
  }
  else if (isContainer(from, nested))
  { 
    if (single)
    { 
      return findFirstElement(from, nested);
    }
    else if (flat)
    {
      return getElementsFrom(from, nested);
    }
    else
    {  
      return from;
    }
  }
  else
  {
    console.error("getElements invalid from value", {from, opts, doc});
    if (fatal)
    {
      throw new TypeError("Could not find element(s)");
    }
    return null;
  }
}

function getElementsFrom(container, nested=0, list=[])
{
  for (const item of container)
  {
    if (item instanceof Element)
    {
      if (!list.includes(item))
      { // Add the item to our list.
        list.push(item);
      }
    }
    else if (isContainer(item, nested))
    { // Recurse into the container.
      getElementsFrom(item, nested-1, list);
    }
  }

  return list;
}

function findFirstElement(container, nested=0)
{
  const cs = [];

  for (const item of container)
  {
    if (item instanceof Element)
    { // We're done here.
      return item;
    }
    else if (isContainer(item, nested))
    { // Add the container to a recursion list.
      cs.push(item);
    }
  }

  // If we reached here no Element has been found.
  for (const c of cs)
  {
    const item = findFirstElement(c, nested-1);
    if (item instanceof Element)
    {
      return item;
    }
  }

} // findFirstElement()

function getSubjectFromString(query, doc=document)
{
  const found = doc.querySelectorAll(query);

  if (found.length === 0)
  { // Nothing to see here.
    return null;
  }
  else if (found.length === 1)
  { // A single element.
    return found[0];
  }
  else
  { // Multiple elements.
    return found;
  }
}

class AbstractError extends Error 
{
  constructor(name, ...rest)
  {
    const msg = `Abstract member ${name} was not implemented`;
    super(msg, ...rest);
  }
}

exports = module.exports =
{
  isJQuery, isArrayOfElements, isContainer, getElementsGiven,
  getElementsFrom, findFirstElement, AbstractError,
  getSubjectFromString,
}
