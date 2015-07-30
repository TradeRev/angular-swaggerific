# angular-swaggerific
A promise-based service which allows you to easily interact with API endpoints that have been created using [Swagger](http://swagger.io/).

## Quick Start

+ Install angular-swaggerific with [Bower](http://www.bower.io)

```
$ bower install angular-swaggerific --save
```

+ Include the required libraries in your `index.html`: 

```html
<script src="bower_components/angular/angular.js"></script>
<script src="bower_components/angular-simple-sprite/angular-swaggerific.min.js"></script>
```

+ Inject the `angular-swaggerific` module into your app:

```javascript
angular.module('myApp', ['angular-swaggerific']);
```

+ Implement the `angular-swaggerific` service:

```javascript
angular
  .module('my-app', ['angular-swaggerific'])
  .run(function($rootScope, $log, $window, AngularSwaggerific) {
    /**
    * Note that 'swaggerJson' refers to the generated JSON from your Swagger API. 
    * Visit editor.swagger.io to import your API and generate your JSON file.
    */ 
    var mySwaggerAPI = new AngularSwaggerific($window.swaggerJson);

    MySwaggerAPI.{namespace}.{operationId}({"id": 1})
      .then(function(data) { 
        $log.log("Success! " + data);
      }, function(err) {
        $log.log("Error! " + err);
    });
  }); 
```

For a more detailed documentation, please visit the Angular Swaggerific Docs.

## License

```
The MIT License (MIT)

Copyright (c) <2015> <TradeRev>

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


