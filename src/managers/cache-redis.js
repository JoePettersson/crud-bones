var util        = require('util'),
    helper      = require('../helper'),
    dateformat  = require('dateformat');

function CacheRedis(cfg, conn, log, defaultExpireSeconds) {
    if (!cfg || !conn || !log) {
        throw new Error("Config and connection vars, and log function are required.");
    }
    this.config = cfg;
    this.connection = conn;
    this.log = log;
    // if defaultExpireSeconds is not set we set it to 60
    // but it also can be overwritten by item's info
    this.expireSeconds = defaultExpireSeconds || 60;
}

CacheRedis.prototype.putItem = function(item, callback) {
    var that = this;
    var itemId = item[ item.getEntityIndex() ];
    var cacheKey = item.getEntityName() + ':' + itemId;
    var cacheValue = JSON.stringify(item || {});
    this.log('cache putItem(): key = ' + cacheKey + ' value = ...');
    this.connection.multi()
                   .set(cacheKey, cacheValue)
                   .expire(cacheKey, item.getEntityExpiration() || that.expireSeconds)
                   .exec(function (err, results) {
        if (err) {
            that.log('Error: putItem(): ' + err);
        }
        if (callback) {
            callback(err, item);
        }
        return item;
    });
};

CacheRedis.prototype.putItemByClass = function(itemClass, item, callback) {
    var that = this;
    var itemId = item[ itemClass.entityIndex ];
    var cacheKey = itemClass.entityName + ':' + itemId;
    var cacheValue = JSON.stringify(item || {});
    this.log('cache putItemByClass(): key = ' + cacheKey + ' value = ...');
    this.connection.multi()
                   .set(cacheKey, cacheValue)
                   .expire(cacheKey,  itemClass.entityExpiration || that.expireSeconds)
                   .exec(function (err, results) {
        if (err) {
            that.log('Error: putItemByClass(): ' + err);
        }
        if (callback) {
            callback(err, item);
        }
        return item;
    });
};

CacheRedis.prototype.delItem = function(itemClass, itemId, callback) {
    var that = this;
    var cacheKey = itemClass.entityName + ':' + itemId;
    this.log('cache delItem(): key = ' + cacheKey);
    this.connection.del(cacheKey, function (err) {
        if (err) {
            that.log('Error: delItem(): ' + err);
        }
        if (callback) {
            callback(err, null);
        }
        return null;
    });
};

CacheRedis.prototype.delItems = function(itemClass, callback) {
    var that = this;
    var cacheKey = itemClass.entityName + ':*';
    this.log('cache delItems(): key = ' + cacheKey);
    this.connection.del(cacheKey, function (err) {
        if (err) {
            that.log('Error: delItems(): ' + err);
        }
        if (callback) {
            callback(err, null);
        }
        return null;
    });
};

CacheRedis.prototype.putItems = function(itemClass, items, callback) {
    var that = this;
    var cacheKey = itemClass.entityName + ':*';
    var cacheValue = JSON.stringify(items || {});
    this.log('cache putItems(): key = ' + cacheKey+ ' value = ...');
    this.connection.multi()
                   .set(cacheKey, cacheValue)
                   .expire(cacheKey, itemClass.entityExpiration || that.expireSeconds)
                   .exec(function (err, results) {
        if (err) {
            that.log('Error: putItems(): ' + err);
        }
        if (callback) {
            callback(err, items);
        }
        return items;
    });
};

CacheRedis.prototype.getItem = function(itemClass, itemId, callback) {
    var that = this;
    var cacheKey = itemClass.entityName + ':' + itemId;
    this.log('cache getItem(): key = ' + cacheKey);
    this.connection.get(cacheKey, function (err, result) {
        that.log('cache getItem(): key = ' + cacheKey + ' : ' + (result ? 'HIT' : 'MISS'));
        if (err) {
            that.log('Error: getItem(): ' + err);
        }
        if (callback) {
            callback(err, result ? JSON.parse(result) : null);
        }
        return result;
    });
};

CacheRedis.prototype.getItems = function(itemClass, callback) {
    var that = this;
    var cacheKey = itemClass.entityName + ':*';
    this.log('cache getItems(): key = ' + cacheKey);
    this.connection.get(cacheKey, function (err, result) {
        that.log('cache getItems(): key = ' + cacheKey + ' : ' + (result ? 'HIT' : 'MISS'));
        if (err) {
            that.log('Error: getItems(): ' + err);
        }
        if (callback) {
            callback(err, result ? JSON.parse(result) : null);
        }
        return result;
    });
};

module.exports.CacheRedis = CacheRedis;