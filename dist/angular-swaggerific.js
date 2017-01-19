(function() {
	angular
		.module('angular-swaggerific', [])
		.factory('util', util)
		.factory('AngularSwaggerific', AngularSwaggerific);
	
	function util() {
		var self        = this;
		/**
		 * Check if a string value
		 * @constructor
		 * @param {*} value - Mixed data
		 * @returns {boolean}
		 */
		self.isString   = function (value) {return typeof value === 'string'};
		self.isStr      = self.isString;
		/**
		 * Check if a integer value
		 * @constructor
		 * @param {*} value - Mixed data
		 * @returns {boolean}
		 */
		self.isInteger  = function (value) {return Number (value) === value && value % 1 === 0};
		self.isInt      = self.isInteger;
		/**
		 * Check if a float value
		 * @constructor
		 * @param {*} value - Mixed data
		 * @returns {boolean}
		 */
		self.isFloat    = function (value) {return Number (value) === value && value % 1 !== 0};
		self.isDouble   = self.isFloat;
		/**
		 * Get datatype
		 * @constructor
		 * @param {*} value - Mixed data
		 * @returns {string}
		 */
		self.getDatatype = function (value) {
			if (self.isInt(value)) return 'integer';
			else if (self.isFloat(value)) return 'float';
			else if (self.isDouble(value)) return 'float';
			else if (self.isString(value)) return 'string';
			else if (value === true || value === false) return 'boolean';
			else if (angular.isArray(value)) return 'array';
			else if (angular.isObject(value)) return 'object';
		};
		/**
		 * Check if a string value
		 * @constructor
		 * @param {string} type - A string with datatype
		 * @param {*} value - Mixed data to compare datatype
		 * @returns {boolean}
		 */
		self.isSameDataType = function (type, value) {
			if (type === 'double') type = 'float';
			return type === self.getDatatype(value);
		};
		/**
		 * Replaces string variables with associated data properties
		 * @param {String} path
		 * @param {Object} data
		 * @returns {String}
		 */
		self.replace    = function (path, data) {
			if (!angular.isObject(data)) data = {};
			var value,
				properties = path.match(/[^{}]+(?=\})/g) || [];
			for (var i = 0; i < properties.length; i++) {
				var property = properties[i];
				if (!data || !data.hasOwnProperty(property)) {
					value = '';
				} else {
					value = data[property]
				}
				path = path.replace('{' + property + '}', value);
			}
			return path;
		};
		/**
		 * Returns true if a specified array contains a specified value.
		 * @param {Object} value
		 * @param {Array} array
		 * @return {Boolean}
		 */
		self.contains   = function(value, array) {return array.indexOf(value) >= 0};
		return self;
	}
	
	AngularSwaggerific.$inject = ['$log', '$http', 'util', '$httpParamSerializer', '$q'];
	
	/**
	 * @param {*} $log
	 * @param {*} $http
	 * @param {*} util
	 * @param {*} $httpParamSerializer - Require AngularJS 1.4+
	 * @param {*} $q
	 * @return {Object}
	 */
	function AngularSwaggerific($log, $http, util, $httpParamSerializer, $q) {
		
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
		};
		
		/**
		 * Creates the AngularSwaggerific API object.
		 * @returns {object} api - Reference to the AngularSwaggerific API object.
		 */
		AngularSwaggerific.prototype.init = function() {
			var self = this;
			
			var scheme = util.contains('https', _json.schemes) ? 'https://' : 'http://';
			self.host = scheme + _json.host + _json.basePath;
			
			angular.forEach(_json.paths, function(value, key) {
				angular.forEach(value, function(innerValue, innerKey) {
					var namespace;
					if (!innerValue.tags) {
						/** Set the namespace equal to the first path variable. */
						namespace = key.split ('/')[1];
						
						/**
						 * If there is no path variable (i.e. '/'), then set the namespace equal to
						 * the base path.
						 */
						if (!namespace || namespace === '') {
							namespace = _json.basePath.split ("/")[1];
						}
					} else {
						/** Set the namespace equal to the associated tag. */
						namespace = innerValue.tags[0]
					}
					
					/** Remove curly braces from the namespace. */
					namespace = namespace.replace (/[{}]/g, "");
					
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
					
					
					//
					var request = {
						uri         :   key.replace(/\/+/g,'/').replace(/(^\/|\/$)/g, '').trim(),
						path        :   [],
						headers     :   {},
						formData    :   {},
						query       :   {},
						originalData:   {},
						params      :   {},
						//body        :   null, // for now, I can't prepare body data.
						//cookies     :   null  // for now, I can't prepare cookies data.
					};
					
					//
					//console.info(innerValue.parameters);
					angular.forEach(innerValue.parameters, function (item) {
						if (request.hasOwnProperty(item.in)) {
							request.params[item.name] = {
								required:   item.required === true,
								type    :   item.type || 'string',
								in      :   item.in
							};
							
							if (angular.isArray(request[item.in])) {
								request[item.in].push(item.name);
							}
							else if (angular.isObject(request[item.in])) {
								request[item.in][item.name] = '{' + item.name + '}';
							}
						}
					});
					//
					if (_json.hasOwnProperty('securityDefinitions')) {
						angular.forEach(innerValue.security, function (rule) {
							angular.forEach(rule, function (value, property) {
								if (_json.securityDefinitions.hasOwnProperty(property)) {
									var security = _json.securityDefinitions[property];
									
									request.params[security.name] = {
										required:   true,
										type    :   'string',
										in      :   security.in
									};
									
									if (request.hasOwnProperty(security.in)) {
										request[security.in][security.name] = '{' + security.name + '}';
									}
								}
							})
						});
					}
					// IMPORTANT: To send POST or PUT request, need set content type header.
					// However, this header can be modified without problems.
					// See more in AngularSwaggerific.prototype.trigger(..., ..., ..., config)
					if (innerKey === 'post' || innerKey === 'put') {
						request.headers['Content-Type'] = "application/x-www-form-urlencoded; charset=utf-8";
					}
					request.query = $httpParamSerializer(request.query);
					(self.api[namespace])[innerValue.operationId] = function(data, config) {
						request.originalData = data;
						request.uri += '?' + encodeURI(util.replace(decodeURI(request.query), data));
						angular.forEach(request.formData, function (value, property) {
							if (data.hasOwnProperty(property)) {
								request.formData[property] = data[property];
							}
						});
						request.formData = $httpParamSerializer(request.formData);
						return self.trigger(key, innerKey, request, config);
					};
				});
			});
			
			return self.api;
		};
		
		/**
		 * Sets up and executes the HTTP request (using $http) for a specfic path.
		 * @param {String} path
		 * @param {String} method
		 * @param {Object} request
		 * @param {Object} [config]
		 * @returns {Promise} - Returns a promise from $http which can be chained to by user.
		 */
		AngularSwaggerific.prototype.trigger = function(path, method, request, config) {
			var self = this;
			var finalResponse = {
				status      :   null,
				statusText  :   null,
				data        :   null,
				validation  :   [],
				values      :   request.originalData,
				params      :   request.params
			};
			angular.forEach (request.params, function (item, param) {
				var element = request.originalData[param],
					dataType = util.getDatatype(element);
				
				if (item.required && !request.originalData.hasOwnProperty (param)) {
					finalResponse.validation.push ('Param ' + param + ' is required in ' + item.in + ' and should be a ' + item.type);
				}
				else if (!util.isSameDataType (item.type, request.originalData[param])) {
					finalResponse.validation.push ('Param ' + param + ' should be a ' + item.type + ' but is a ' + dataType);
				}
			});
			if (method !== 'post' && method !== 'put') {
				request.formData = {};
			}
			config = angular.extend ({
				url     :   self.host + request.uri,
				method  :   method,
				data    :   request.formData,
				headers :   request.headers
			}, config || {});
			
			// prepare promise
			var defered = $q.defer ();
			var promise = defered.promise;
			// If you have validation errors, you can't send xhr
			if (finalResponse.validation.length > 0) {
				defered.reject (finalResponse);
			}
			else {
				$http (config).then (function (response) {
					finalResponse.status = response.status;
					finalResponse.statusText = response.statusText;
					finalResponse.data = response.data;
					defered.resolve (finalResponse);
				}, function (response) {
					finalResponse.status = response.status;
					finalResponse.statusText = response.statusText;
					finalResponse.data = response.data;
					defered.reject (finalResponse);
				});
			}
			return promise;
		};
		return AngularSwaggerific;
	}
	
})(angular);
