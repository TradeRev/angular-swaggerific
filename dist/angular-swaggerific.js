(function() {
    angular
        .module('angular-swaggerific', [])
        .factory('util', util)
        .factory('AngularSwaggerific', AngularSwaggerific);

    util.$inject = ['$log'];

    function util($log) {
        return {

            /**
             * Replaces path variables with associated data properties
             * @param {string} path - The endpoint path.
             * @param {object} data - Data defined by the user.
             * @returns {string} - Newly created path using data passed in by user.
             */
            replaceInPath: function(path, data) {
                var properties = path.match(/[^{}]+(?=\})/g) || [];
                for (var i = 0; i < properties.length; i++) {
                    var property = properties[i];
                    path = path.replace('{' + property + '}', data[property]);
                }

                return path;
            }

        }
    }

    AngularSwaggerific.$inject = ['$log', '$http', 'util'];

    function AngularSwaggerific($log, $http, util) {

        var _json = null;

        /**
         * Represents an AngularSwaggerific object.
         * @constructor
         * @param {string} json - The generated Swagger JSON object.
         * @returns {object} api - Reference to the AngularSwaggerific API object.
         */
        var AngularSwaggerific = function(json) {
            this.api = {};
            this.host = null;

            if (!json || json === '') {
                $log.error("Invalid JSON.");
                return {};
            }

            _json = json;

            return this.init();
        }

        /**
         * Creates the AngularSwaggerific API object.
         * @returns {object} api - Reference to the AngularSwaggerific API object.
         */
        AngularSwaggerific.prototype.init = function() {
            var self = this;

            self.host = 'http://' + _json.host + _json.basePath;

            angular.forEach(_json.paths, function(value, key) {
                angular.forEach(value, function(innerValue, innerKey) {
                    var namespace;
                    if (!innerValue.tags) {
                        /** Set the namespace equal to the first path variable. */
                        namespace = key.split('/')[1];

                        /**
                         * If there is no path variable (i.e. '/'), then set the namespace equal to
                         * the base path.
                         */
                        if (!namespace || namespace === '') {
                            namespace = _json.basePath.split("/")[1];
                        }
                    } else {
                        /** Set the namespace equal to the associated tag. */
                        namespace = innerValue.tags[0]
                    }

                    /** Remove curly braces from the namespace. */
                    namespace = namespace.replace(/[{}]/g, "");

                    /** Create the namespace if it doesn't already exist. */
                    if (!self.api[namespace]) {
                        self.api[namespace] = {};
                    }

                    /**
                     * Map HTTP call to namespace[operationId].
                     * If there is no operationId, then use method (i.e. get, post, put)
                     */
                    if (!innerValue.operationId) {
                        innerValue.operationId = innerKey;
                    }

                    (self.api[namespace])[innerValue.operationId] = function(data) {
                        return self.trigger(key, innerKey, data);
                    };
                });
            });

            return self.api;
        }

        /**
         * Sets up and executes the HTTP request (using $http) for a specfic path.
         * @param {string} path - The path of the endpoint.
         * @param {method} method - The method of the HTTP request (i.e. get, post, delete, put).
         * @param {data} data - User passed data.
         * @returns {Promise} - Returns a promise from $http which can be chained to by user.
         */
        AngularSwaggerific.prototype.trigger = function(path, method, data) {
            var self = this;

            var getParams, postData;
            if (angular.lowercase(method) === 'get') {
                getParams = data || {};
            } else {
                postData = data || {};
            }

            var newPath = util.replaceInPath(path, data);

            return $http({
                method: method,
                url: self.host + newPath,
                data: postData,
                params: getParams
            });
        };

        return AngularSwaggerific;
    }

})(angular);
