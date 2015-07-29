(function() {
    angular
        .module('angular-swaggerific', [])
        .factory('util', util)
        .factory('AngularSwaggerific', AngularSwaggerific);

    util.$inject = ['$log'];

    function util($log) {
        return {

            parseJSON: function(json) {
                try {
                    $log.log(JSON.parse(json));
                    var o = JSON.parse(json);

                    if (o && typeof o === "object" && o !== null) {
                        return o;
                    }
                } catch (e) { 
                    $log.error(e);
                }

                return null; 
            },

            /**
             * Replaces path variables with associated data properties
             * @params path {String}, data {Object}
             * @returns {String}
             */
            replaceInPath: function(path, data) {
                var properties = path.match(/[^{}]+(?=\})/g) || [];
                for (var i = 0; i < properties.length; i++) {
                    var property = properties[i];
                    path = path.replace('{'+property+'}', data[property]);
                }

                return path;
            }
        }
    }

    AngularSwaggerific.$inject = ['$log', '$http', 'util'];

    function AngularSwaggerific($log, $http, util) {
        
        var _json = null;

        var AngularSwaggerific = function(json) {
            this.api = {};
            this.host = null;

            _json = json;

            return this.init();
        }

        AngularSwaggerific.prototype.init = function() {
            var self = this;

            self.host = 'http://' + _json.host + _json.basePath;

            angular.forEach(_json.paths, function(value, key) {
                angular.forEach(value, function(innerValue, innerKey) {
                    var namespace;
                    if (!innerValue.tags) {
                        namespace = key.split('/')[1];
                    } else {
                        namespace = innerValue.tags[0]
                    }

                    // Create namespace if it doesn't already exist.
                    if (!self.api[namespace]) {
                        self.api[namespace] = {};
                    }

                    // Map HTTP call to namespace[operationId]
                    (self.api[namespace])[innerValue.operationId] = function(data) {
                        return self.trigger(key, innerKey, data);
                    };
                });
            });

            $log.log(self.api);

            return self.api;
        }

        AngularSwaggerific.prototype.trigger = function(path, method, data) {
            var self = this;

            var data = data || {};
            var newPath = util.replaceInPath(path, data);

            return $http({
                method: method,
                url: self.host + newPath,
                data: data
            })
        }

        return AngularSwaggerific;
    }

})(angular);
