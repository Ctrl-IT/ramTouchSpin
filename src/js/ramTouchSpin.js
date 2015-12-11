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
        if(attrs.min !== undefined){
            scope.min = parseFloat(Number(attrs.min));    
        }else{
            scope.min = undefined;
        }
        if(attrs.max !== undefined){
            scope.max = parseFloat(Number(attrs.max));    
        }else{
            scope.max = undefined;
        }
        scope.step = attrs.step || 1;
        scope.prefix = attrs.prefix || undefined;
        scope.postfix = attrs.postfix || undefined;
        scope.decimals = attrs.decimals || 0;
        scope.stepInterval = attrs.stepInterval || 100;
        scope.stepIntervalDelay = attrs.stepIntervalDelay || 500;
        scope.emptyStringNull = attrs.nullable || false; //used in toFloat TODO: improve
        scope.initval = attrs.initval || (scope.emptyStringNull ? null : 0);
		//TODO: hanlde initial value
        //scope.model = scope.model !== undefined ? scope.model : scope.initval;
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

    var toFloat = function (value, scope) {
        if(value === "" && scope.emptyStringNull){
            return null;
        }
        if (scope.decimalSep !== "." && (typeof value === "string" || value instanceof String)) {
            value = value.replace(scope.decimalSep, ".");
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
        scope: true,
		require: '?ngModel',
        replace: true,
        link: function (scope, element, attrs, ngModelCtrl) {
			if(!ngModelCtrl){
				throw Error("Missing ng-model attribute on ram-touch-spin element");
			}
            var timeout, timer, clickStart;
            scope.focused = false;

            setScopeValues(scope, attrs);

			//Move the name attribute
			var divElem = angular.element(element);
			divElem.removeAttr('name');
			angular.element(divElem[0].querySelector('input')).attr('name', name);
			
			var orignalRender = ngModelCtrl.$render;
			
			ngModelCtrl.$render = function () {
				scope.val = toString( ngModelCtrl.$modelValue, scope.decimalSep);
			};
			
			
			var updateNgModelValue = function(val){
				ngModelCtrl.$setViewValue(val);
				orignalRender();	
			}
			
			//handle nullable by adding a ngModelController parser
			if(attrs.nullable){
				ngModelCtrl.$parsers.push(function(viewValue) {
					if(viewValue === "") {
						return null;
					}
					return viewValue;
				});	
			}
			

            scope.updateValue = function () {
                if (scope.val !== undefined) {
					//check regex first
					if(scope.val === "" || scope.regex.test(scope.val)){
						ngModelCtrl.$setValidity('invalid', true);
					}else{
						ngModelCtrl.$setValidity('invalid', false);
						orignalRender();
						return;
					}
					//parse and update
                    var value = toFloat(scope.val, scope);
                    var adjustVal = false
                    if (scope.max != undefined && value > scope.max){
                         value = scope.max; 
                         adjustVal = true;
                    }
                    else if (scope.min != undefined && value < scope.min) {
                        value = scope.min;
                        adjustVal = true;
                    }
                    if(adjustVal){
                        scope.val = toString(value,  scope.decimalSep);
                    }
					updateNgModelValue(value);
                }
            }
			

            scope.increment = function () {
                var value = parseFloat(parseFloat(Number(ngModelCtrl.$modelValue)) + parseFloat(scope.step)).toFixed(scope.decimals);
                if (scope.max != undefined && value > scope.max) return;
				updateNgModelValue( toFloat(value, scope));
				ngModelCtrl.$render();
            };

            scope.decrement = function () {
                var value = parseFloat(parseFloat(Number(ngModelCtrl.$modelValue)) - parseFloat(scope.step)).toFixed(scope.decimals);
                if (scope.min != undefined && value < scope.min) {
                    value = parseFloat(scope.min).toFixed(scope.decimals);
					updateNgModelValue( toFloat(value, scope));
                    return;
                }
                updateNgModelValue( toFloat(value, scope));
				ngModelCtrl.$render();
            };

           scope.startSpinUp = function () {
				scope.increment();

				clickStart = Date.now();

				timeout = $timeout(function() {
					timer = $interval(function() {
						scope.increment();
					}, scope.stepInterval);
				}, scope.stepIntervalDelay);
			};

			scope.startSpinDown = function () {
				scope.decrement();

				clickStart = Date.now();

				timeout = $timeout(function() {
					timer = $interval(function() {
						scope.decrement();
					}, scope.stepInterval);
				}, scope.stepIntervalDelay);
			};

			scope.stopSpin = function () {
                $timeout.cancel(timeout);
                $interval.cancel(timer);
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
		'  <input type="text" ng-model="val" class="form-control" ng-change="updateValue()" ng-blur="blur()" ng-focus="focus()">' +
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