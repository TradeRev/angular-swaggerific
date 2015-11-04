(function() {
    angular
        .module('angular-swaggerific', [])
        .factory('util', util)
        .factory('AngularSwaggerific', AngularSwaggerific);

    function util() {
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
         *
         * @param {string} json - The generated Swagger JSON object, or a URL to an external Swagger JSON document.
         * @constructor
         */
        var AngularSwaggerific = function(json) {
            this.api = {};
            this.host = null;

            if (!json || json === '') {
                $log.error("Invalid JSON.");
                return {};
            } else {
                _json = json;
            }
        };

        /**
         * Creates the AngularSwaggerific API object.
         *
         * @param {function(Error)} cb - Executed when AngularSwaggerific is fully initialized.
         */
        AngularSwaggerific.prototype.init = function(cb) {
            var self = this;

            /**
             * If we have the JSON already, parse it and initialize the API.
             * Otherwise, assume a remote API definition exists and load it.
             */
            if (self.isValidUrl(_json)) {
                $http({
                    method: "GET",
                    url: _json
                }).then(

                    /**
                     * Remote Swagger API definition loaded!
                     *
                     * @param response
                     */
                    function(response) {
                        _json = response.data;
                        self.init(cb);
                    },

                    /**
                     * Error loading the remote Swagger API definition.
                     *
                     * @param err {Error}
                     */
                    function(err) {
                        cb(err);
                    }
                );
            } else {
                // Sanitize the basePath and API host
                if (!_json.basePath || _json.basePath == '/') {
                    _json.basePath = "";
                }

                if (_json.host.indexOf('http') !== 0) {
                    _json.host = "http://" + _json.host;
                }

                self.host = _json.host + _json.basePath;

                // Iterate over the available paths and construct the API methods dynamically
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

                        (self.api[namespace])[innerValue.operationId] = function(data, headers) {
                            return self.trigger(key, innerKey, data, headers);
                        };
                    });

                });

                cb(null);
            }
        };

        /**
         * Sets up and executes the HTTP request (using $http) for a specific path.
         *
         * @param {String} path - The path of the endpoint.
         * @param {String} method - The method of the HTTP request (i.e. get, post, delete, put).
         * @param {Object} data - User passed data.
         * @params {Object} [headers] - Optional additional headers
         * @returns {Promise} - Returns a promise from $http which can be chained to by user.
         */
        AngularSwaggerific.prototype.trigger = function(path, method, data, headers) {
            var self = this;

            data = data || {};

            var getParams, postData;
            if (angular.lowercase(method) === 'get') {
                getParams = data || {};
            } else {
                postData = data || {};
            }

            var newPath = util.replaceInPath(path, data);

            return $http({
                headers: headers || {},
                method: method,
                url: self.host + newPath,
                data: postData,
                params: getParams
            })
        };

        /**
         * Checks if a String is a valid URL.
         *
         * @param string {String}
         * @returns {Boolean}
         */
        AngularSwaggerific.prototype.isValidUrl = function(string) {
            var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
                '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
                '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
                '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
                '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
                '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
            return pattern.test(string);
        };


        return AngularSwaggerific;
    }

})(angular);
