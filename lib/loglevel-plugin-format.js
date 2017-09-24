(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.format = factory(root);
  }
}(this, function (root) {
  'use strict';

  var merge = function merge(target) {
    var i = 1;
    var length = arguments.length;
    var key;
    for (; i < length; i++) {
      for (key in arguments[i]) {
        if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
          target[key] = arguments[i][key];
        }
      }
    }
    return target;
  };

  var defaults = {
    template: '{"timestamp": "[%t]", "level": "%l", "message": "%m"}',
    messageFormatter: function (data) {
      return data;
    },
    timestampFormatter: function (date) {
      return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1');
    },
    levelFormatter: function (level) {
      return level.toUpperCase();
    },
    nameFormatter: function (name) {
      return name || 'root';
    }
  };

  var loglevel;
  var originalFactory;
  var pluginFactory;

  var apply = function apply(logger, options) {
    if (!logger || !logger.getLogger) {
      throw new TypeError('Argument is not a root loglevel object');
    }

    if (loglevel && pluginFactory !== logger.methodFactory) {
      throw new Error("You can't reassign a plugin after appling another plugin");
    }

    loglevel = logger;

    options = merge({}, defaults, options);

    originalFactory = originalFactory || logger.methodFactory;

    pluginFactory = function methodFactory(methodName, logLevel, loggerName) {
      var rawMethod = originalFactory(methodName, logLevel, loggerName);

      var hasTimestamp = options.template.indexOf('%t') !== -1;
      var hasLevel = options.template.indexOf('%l') !== -1;
      var hasName = options.template.indexOf('%n') !== -1;
      var hasMessage = options.template.indexOf('%m') !== -1;

      return function () {
        var content = options.template;

        var length = arguments.length;
        var args = Array(length);
        var key = 0;
        for (; key < length; key++) {
          args[key] = arguments[key];
        }

        if (hasTimestamp) content = content.replace(/%t/, options.timestampFormatter(new Date()));
        if (hasLevel) content = content.replace(/%l/, options.levelFormatter(methodName));
        if (hasName) content = content.replace(/%n/, options.nameFormatter(loggerName));
        if (args.length && typeof args[0] === 'string') {
          if (hasMessage) content = content.replace(/%m/, options.messageFormatter(args[0]));
            // concat format with first argument to support string substitutions
          args[0] = content;
        } else {
          args.unshift(content);
        }

        rawMethod.apply(undefined, args);
      };
    };

    logger.methodFactory = pluginFactory;
    logger.setLevel(logger.getLevel());
    return logger;
  };

  var disable = function disable() {
    if (!loglevel) {
      throw new Error("You can't disable a not appled plugin");
    }

    if (pluginFactory !== loglevel.methodFactory) {
      throw new Error("You can't disable a plugin after appling another plugin");
    }

    loglevel.methodFactory = originalFactory;
    loglevel.setLevel(loglevel.getLevel());
    originalFactory = undefined;
    loglevel = undefined;
  };

  var api = {
    apply: apply,
    disable: disable
  };

  var save;
  if (root) {
    save = root.format;
    api.noConflict = function () {
      if (root.format === api) {
        root.format = save;
      }
      return api;
    };
  }

  return api;
}));
