# loglevel-plugin-format
fork from [loglevel-plugin-prefix](https://github.com/kutuluk/loglevel-plugin-prefix)

loglevel plugin for log message formatting

## Installation

```sh
npm install loglevel-plugin-format --save
```

## API

```javascript
apply(log[, options]);
```

This method applies the plugin to the logger.

**log** - root logger, imported from loglevel package

**options** - configuration object

```javascript
var defaults = {
  template: '{"timestamp": %t, "level": %l, "message": %m}',
  messageFormatter: function(data){
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
```

The **template** is a string containing zero or more placeholder tokens. Each placeholder token is replaced with the value from loglevel messages parameters. Supported placeholders are:

- %t - timestamp of message
- %l - level of message
- %n - name of logger
- %m - message of logger

