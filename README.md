# ramTouchSpin

AngularJS Material implementation of [Bootstrap TouchSpin](https://github.com/istvan-ujjmeszaros/bootstrap-touchspin).

This project started as a fork of 

This project started as a fork of [sjoerd222888/ramTouchSpin](https://github.com/sjoerd222888/ramTouchSpin). It has been modified to use Angular Material styling instead of bootstrap
The scope variable will be of type Number even though a decimal separation character can be specified. The directive uses the ng-model directive.

Usage:

```html
<ram-touch-spin type="text" ng-model="yourScopeVariable" ></ram-touch-spin>
```

Example usage can also be found in the [demo file](https://github.com/sjoerd222888/ramTouchSpin/blob/master/demo/demo.html).

Various options are available  as described  in the following table:

| Attribute           | Default              | Description |
|:------------------- |:--------------------:|:----------------------------------------------------------------------------------------------------------------------------------------------- |
| ng-model            | undefined            | The scope variable to be displayed. This attribute is required otherwise an error is thrown                                                     |
| vertical            | true                 | If true show up and down buttons on the right hand side of the input or show plus (+) and (-) buttons on the right and left side otherwise      |
| step                | 1                    | Incremental/decremental step on up/down.                                                                                                        |
| initval             | undefined            | This option overwrites the scope value if it exists. The inital value will be '' if nullable is false and null otherwise.                       |
| min                 | undefined            | Minimum value.                                                                                                                                  |
| max                 | undefined            | Maximum value.                                                                                                                                  |
| decimals            | 0                    | Number of decimal points.                                                                                                                       |
| step-interval       | 100                  | Refresh rate of the spinner in milliseconds.                                                                                                    |
| step-interval-delay | 500                  | Time in milliseconds before the spinner starts to spin.                                                                                         |
| prefix              | ''                   | Text before the input.                                                                                                                          |
| postfix             | ''                   | Text after the input.                                                                                                                           |
| decimal-sep         | (value from $locale) | Decimal separation character                                                                                                                    |
| with-key            | true                 | Use up and down arrow key to increase  or decrease the number.                                                                                  |
| nullable            | false                | If true an empty text field will set the model value to null, if false it will be set to zero in that case.                                     |
| ng-disabled         | false                | Expression whether or not the touch-spin control should be disabled.                                                                            |