const expect = require('chai').expect;
const loglevel = require('loglevel');
const other = require('loglevel-plugin-mock');
const sinon = require('sinon');
const format = require('../lib/loglevel-plugin-format');

const spy = sinon.spy();

describe('', () => {
  beforeEach(() => {
    /* eslint-disable no-empty */
    try {
      format.disable();
    } catch (ignore) {}
    try {
      other.disable();
    } catch (ignore) {}
    try {
      format.disable();
    } catch (ignore) {}
    /* eslint-enable no-empty */
    spy.reset();
  });

  describe('API', () => {
    it('Methods', () => {
      expect(format).to.have.property('apply').with.be.a('function');
      expect(format).to.have.property('disable').with.be.a('function');
      expect(format).not.to.have.property('noConflict');
    });

    it('Empty arguments', () => {
      expect(format.apply).to.throw(TypeError, 'Argument is not a root loglevel object');
    });

    it('Not root loglevel argument', () => {
      expect(() => format.apply(loglevel.getLogger('log'))).to.throw(
        TypeError,
        'Argument is not a root loglevel object'
      );
    });

    it('Disabling a not appled plugin should throw an exception', () => {
      expect(format.disable).to.throw(Error, "You can't disable a not appled plugin");
    });

    it('Right applying', () => {
      expect(() => format.apply(loglevel)).to.not.throw();
    });

    it('Right disabling', () => {
      format.apply(loglevel);

      expect(format.disable).to.not.throw();
    });

    it('Reapplying without applying other plugin', () => {
      format.apply(loglevel);

      expect(() => format.apply(loglevel)).to.not.throw();
    });

    it('Reapplying after using another plugin should throw an exception', () => {
      format.apply(loglevel);
      other.apply(loglevel);

      expect(() => format.apply(loglevel)).to.throw(
        Error,
        "You can't reassign a plugin after appling another plugin"
      );
    });

    it('Disabling after using another plugin should throw an exception', () => {
      format.apply(loglevel);
      other.apply(loglevel);

      expect(format.disable).to.throw(
        Error,
        "You can't disable a plugin after appling another plugin"
      );
    });

    it('Reapplying after disabling another plugin should not thrown an exception', () => {
      format.apply(loglevel);
      other.apply(loglevel);
      other.disable();

      expect(() => format.apply(loglevel)).to.not.throw();
    });

    it('Disabling after disabling another plugin should not thrown an exception', () => {
      format.apply(loglevel);
      other.apply(loglevel);
      other.disable();

      expect(format.disable).to.not.throw();
    });
  });

  describe('Prefix', () => {
    it('All methods of the previous plugin should be called', () => {
      other.apply(loglevel, { method: spy });
      format.apply(loglevel);

      loglevel.enableAll();
      loglevel.trace();
      loglevel.debug();
      loglevel.info();
      loglevel.warn();
      loglevel.error();
      expect(spy.callCount).to.equal(5);
    });

    it('The format must be combined with the first argument, if it is a string', () => {
      other.apply(loglevel, { method: spy });
      format.apply(loglevel, {
        template: '{"timestamp": %t, "level": %l, "message": %m}',
        timestampFormatter() {
          return '2017';
        }
      });

      loglevel.warn('foo %s', 'bar');
      expect(spy.calledWith('{"timestamp": 2017, "level": WARN, "message": foo %s}', 'bar')).to.be.true;
    });
  });
});
