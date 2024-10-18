const core = require('@lumjs/core');
const {needObj} = core.types;
const {copyProps} = core.obj;

const LumCSS = require('./index');
const {AbstractError} = require('./util');

/**
 * An abstract base class for the Info object classes.
 * @name module:@lumjs/web-css~CSSInfo
 */
class CSSInfo
{
  /**
   * Initialize common settings for an info class.
   * 
   * @param {object} subject - The object the info pertains to.
   *   Each info class may have different requirements for the subject.  
   * @param {object} [options] Options for method calls. 
   * @param {module:@lumjs/web-css} [parent] Parent instance.
   *   We will create a new instance if this is not specified.
   * @protected
   */
  constructor(subject, options, parent=null)
  {
    needObj(options);

    if (!this.validateSubject(subject, options))
    {
      const need = this.subjectType;
      let msg = 'Invalid subject';
      if (typeof need === S)
      {
        msg += `; ${need} required`;
      }
      throw new TypeError(msg);
    }

    this.options = options;
    this.subject = subject;

    if (parent instanceof LumCSS)
    {
      this.parent = parent;
      copyProps(parent.methOptions, options, parent.copyOptions);
    }
    else 
    {
      this.parent = new LumCSS(this.ownerDocument, options);
    }
  }

  /**
   * Validate the subject passed to the constructor.
   * @abstract
   * @param {object} subject - The subject passed to the constructor.
   * @param {object} [options] Options passed to the constructor. 
   * @returns {boolean} If the subject is valid or not.
   */
  validateSubject()
  {
    throw new AbstractError('validateSubject(subject, options)');
  }

  /**
   * Get the owner `Document` object 
   * 
   * This accessor may only has access to `this.subject` and `this.options`;
   * as no other properties may be initialized when this is accessed.
   * 
   * @type {Document}
   */
  get ownerDocument()
  {
    throw new AbstractError('ownerDocument');
  }

  /**
   * Get a string to be used in errors if `validateSubject()` fails.
   * 
   * Should be implemented as a simple read-only accessor.
   * e.g. `get subjectType() { return 'a document'; }
   * 
   * If not implemented the error messages will be more generic.
   * 
   * @var {string} subjectType
   */

}

module.exports = CSSInfo;
