# angular-swaggerific
A promise-based service which allows you to easily interact with API endpoints that have been created using [Swagger](http://swagger.io/).

## Quick Start

#### Install angular-swaggerific with [Bower](http://www.bower.io)

```
$ bower install angular-swaggerific --save
```

#### Include the required libraries in your `index.html`:

```html
<script src="bower_components/angular/angular.js"></script>
<script src="bower_components/angular-simple-sprite/angular-swaggerific.min.js"></script>
```

#### Inject the `angular-swaggerific` module into your app:

```javascript
angular.module('myApp', ['angular-swaggerific']);
```

#### Implement the `angular-swaggerific` service:

```javascript
angular
  .module('my-app', ['angular-swaggerific'])
  .run(function($rootScope, $log, $window, AngularSwaggerific) {
    /**
    * Note that 'swaggerJson' refers to the generated JSON from your Swagger API.
    * Visit editor.swagger.io to import your API and generate your JSON file.
    */
    var mySwaggerAPI = new AngularSwaggerific($window.swaggerJson);

    mySwaggerAPI.{namespace}.{operationId}(options)
      .then(function(data) {
      	$log.log("Success! " + data);
      }, function(err) {
      	$log.log("Error! " + err);
      });

    /**
    * Pet Store Examples
    */

    mySwaggerAPI.pet.getPetById({petId:1})
      .then(function(data) {
     	 $log.log("Success! Pet: " + data);
      }, function(err) {
     	 $log.log("Error! " + err);
      });

    mySwaggerAPI.pet.findPetsByTags({params:{tags:"example"}})
      .then(function(data) {
     	 $log.log("Success! Pets: " + data);
      }, function(err) {
     	 $log.log("Error! " + err);
      });

    /**
    * Allow all duplicate requests to be sent by default
	*   - this doesn't require the allowDuplicate option to be set
    */
    mySwaggerAPI.allowDuplicateRequests(true);

    /**
    * Cancel all current requests that are made through the swagger client
	*   - all pending requests are cancelled/rejected
    */
    mySwaggerAPI.cancelRequests();
  });
```

#### Possible Options

In the options section, you put any of the variables that are passed in the URL, as they appear in the Swagger JSON. For instance, the Pet Store Swagger example has `/pet/{petId}` as a URL, so in the options, you would pass `petID` with the ID you are wanting.

+ params `[object]`
  + Params are the variables that can be passed as a parameter.
  + If it is a `GET` or `DELETE` request, they are appended to the URL
  + If it is a `POST` or `PUT` request, they are sent as form data
+ allowDuplicate `boolean`
  + If set to `true`, duplicate requests will continue to be sent
  + If omitted or `false`, previous duplicate requests will be rejected/cancelled

___

For a more detailed documentation, please visit the [Angular Swaggerific Docs](http://traderev.github.io/angular-swaggerific).

## License

```
The MIT License (MIT)

Copyright (c) 2015 NthGen Software Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
