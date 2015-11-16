angular.module('ram.touchspin', [])

.directive('ramTouchSpin', ['$timeout', '$interval', '$document', '$locale', function ($timeout, $interval, $document, $locale) {
    'use strict';

    var keyCodes = {
        left: 37,
        right: 39,
        up: 38,
        down: 40
    };

    var setScopeValues = function (scope, attrs) {
        scope.min = parseFloat(Number(attrs.min)) || undefined;
        scope.max = parseFloat(Number(attrs.max)) || undefined;
        scope.step = attrs.step || 1;
        scope.prefix = attrs.prefix || undefined;
        scope.postfix = attrs.postfix || undefined;
        scope.decimals = attrs.decimals || 0;
        scope.stepInterval = attrs.stepInterval || 100;
        scope.stepIntervalDelay = attrs.stepIntervalDelay || 500;
        scope.initval = attrs.initval || '';
        scope.model = scope.model || scope.initval;
        var localeDecimalSeparator;
        if($locale.NUMBER_FORMATS.DECIMAL_SEP === undefined){
            //Be prepared for the case that variable name changes, this is not a public api
            localeDecimalSeparator = '.';
        }
        else{
            localeDecimalSeparator = $locale.NUMBER_FORMATS.DECIMAL_SEP;
        }
        scope.decimalSep = attrs.decimalSep || localeDecimalSeparator;
        if (attrs.withKey === "false") {
            scope.withKey = false;
        } else {
            scope.withKey = true;
        }
        if (attrs.vertical === "false") {
            scope.verticalButtons = false;
        } else {
            scope.verticalButtons = true;
        }
        if (scope.decimalSep === ".") {
            scope.regex = /^-?(?:\d+|\d*\.(\d+)?)$/i;
        } else if (scope.decimalSep === ",") {
            scope.regex = /^-?(?:\d+|\d*\,(\d+)?)$/i;
        } else {
            //any decimal separator
            scope.regex = new RegExp("^-?(?:\\d+|\\d*" + scope.decimalSep + "(\\d+)?)$");
        }
    };

    var toFloat = function (value, decimalSep) {
        if (decimalSep !== "." && (typeof value === "string" || value instanceof String)) {
            value = value.replace(decimalSep, ".");
        }
        value = parseFloat(Number(value));
        return value;
    }

    var toString = function (value, decimalSep) {
        if(value === null || value === undefined){
            return "";
        }
        if( typeof value === 'number'){
            value = value.toString();
        }
        value = value.replace('.', decimalSep);
        return value;
    }


    return {
        restrict: 'EA',
        scope: {
            model: "="
        },
        replace: true,
        link: function (scope, element, attrs) {
            var timeout, timer, clickStart;
            scope.focused = false;

            setScopeValues(scope, attrs);

            //val is our copy in string representation
            scope.val = toString(scope.model, scope.decimalSep);

            scope.$watch('model', function (newVal, oldVal) {
                if (newVal === oldVal) return;
                scope.val = toString(newVal, scope.decimalSep);
            }, false);

            scope.updateValue = function () {
                if (scope.val !== undefined) {
                    scope.model = toFloat(scope.val, scope.decimalSep);
                }
            }

            scope.increment = function () {
                var value = parseFloat(parseFloat(Number(scope.model)) + parseFloat(scope.step)).toFixed(scope.decimals);
                if (scope.max != undefined && value > scope.max) return;
                scope.model = toFloat(value);
            };

            scope.decrement = function () {
                var value = parseFloat(parseFloat(Number(scope.model)) - parseFloat(scope.step)).toFixed(scope.decimals);
                if (scope.max != undefined && value < scope.min) {
                    value = parseFloat(scope.min).toFixed(scope.decimals);
                    scope.model = toFloat(value);
                    return;
                }
                scope.model = toFloat(value);
            };

           scope.startSpinUp = function () {
				scope.increment();

				clickStart = Date.now();
				scope.stopSpin();

				$timeout(function() {
					timer = $interval(function() {
						scope.increment();
					}, scope.stepInterval);
				}, scope.stepIntervalDelay);
			};

			scope.startSpinDown = function () {
				scope.decrement();

				clickStart = Date.now();
                scope.stopSpin();

				var timeout = $timeout(function() {
					timer = $interval(function() {
						scope.decrement();
					}, scope.stepInterval);
				}, scope.stepIntervalDelay);
			};

			scope.stopSpin = function () {
				if (Date.now() - clickStart > scope.stepIntervalDelay) {
					$timeout.cancel(timeout);
					$interval.cancel(timer);
				} else {
					$timeout(function() {
						$timeout.cancel(timeout);
						$interval.cancel(timer);
					}, scope.stepIntervalDelay);
				}
			};

            scope.focus = function () {
                scope.focused = true;
            }

            scope.blur = function () {
                scope.focused = false;
            }

            var $body = $document.find('body');
            $body.bind('keydown', function (event) {
                if (!scope.withKey || !scope.focused) {
                    return;
                }
                event = event || window.event;
                var which = event.which;
                if (which === keyCodes.up) {
                    scope.increment();
                    event.preventDefault();
                    scope.$apply();
                } else if (which === keyCodes.down) {
                    scope.decrement();
                    event.preventDefault();
                    scope.$apply();
                }
            });
        },

        template:
		'<div class="input-group bootstrap-touchspin">' +
		'  <span class="input-group-btn" ng-if="!verticalButtons">' +
		'    <button class="btn btn-default bootstrap-touchspin-down" ng-mousedown="startSpinDown()" ng-mouseup="stopSpin()"><i class="fa fa-minus"></i></button>' +
		'  </span>' +
		'  <span class="input-group-addon bootstrap-touchspin-prefix" ng-show="prefix" ng-bind="prefix"></span>' +
		'  <input type="text" ng-model="val" ng-pattern="regex" class="form-control" ng-change="updateValue()" ng-blur="blur()" ng-focus="focus()">' +
		'  <span class="input-group-addon bootstrap-touchspin-postfix" ng-show="postfix" ng-bind="postfix"></span>' +
        '  <span class="input-group-btn" ng-if="!verticalButtons">' +
		'    <button class="btn btn-default bootstrap-touchspin-down" ng-mousedown="startSpinUp()" ng-mouseup="stopSpin()"><i class="fa fa-plus"></i></button>' +
		'  </span>' +
        '  <span class="input-group-btn-vertical" ng-if="verticalButtons">' +
        '      <button class="btn btn-default bootstrap-touchspin-up" type="button" ng-mousedown="startSpinUp()" ng-mouseup="stopSpin()"><i class="glyphicon glyphicon-chevron-up"></i></button>' +
        '      <button class="btn btn-default bootstrap-touchspin-down" type="button"ng-mousedown="startSpinDown()" ng-mouseup="stopSpin()"><i class="glyphicon glyphicon-chevron-down"></i></button>' +
        '  </span>' +
		'</div>'

    };

}]);