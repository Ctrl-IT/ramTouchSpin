# ramTouchSpin

AngularJS implementation of Bootstrap Touchspin.

Note: this project started as a fork of [jkuri.ngTouchSpin](https://github.com/jkuri/ngTouchSpin). It has been heavily modified and also renamed in order to follow the angular naming convetions.
This implementation overcomes some issues of the original version, for example does arrow keys not block normal key input. The scope variable is a number and not a string.

Usage:

```html
<input type="text" model="testValue" ram-touch-spin>
```

Various options are availbe as decribed in the following table:

| Attribute           | Default        | Description |
|:------------------- |:--------------:|:----------------------------------------------------------------------------------------------------------------------------------------------- |
| model               | undefined      | The scope variable to be displayed. This option is required!   |
| vertical            | true           | If true show up and down buttons on the right hand side of the input field show plus (+) and (-) buttons on the right and left side otherwise   |
| step                | 1              | Incremental/decremental step on up/down change. |
| initval             | undefined      | If the scope variable already exists this option is ignored otherwise the value is used to initialy set the scope variable.
| min                 | undefined      | Minimum value. |
| max                 | undefined      | Maximum value. |
| decimals            | 0              | Number of decimal points. |
| step-interval       | 100            | Refresh rate of the spinner in milliseconds. |
| step-interval-delay | 500            | Time in milliseconds before the spinner starts to spin. |
| prefix              | ""             | Text before the input. |
| postfix             | ""             | Text after the input. |
| decimal-sep         | "."            | Decimal separation character |
| with-key            | true           | Use up and down arrow key to increas or decrease the number |







