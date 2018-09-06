angular.module('ram.touchspin', [])

.directive('ramTouchSpin', ['$timeout', '$interval', '$document', '$locale', '$parse', function ($timeout, $interval, $document, $locale, $parse) {
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
        scope.decimals = attrs.decimals || 0;
        scope.stepInterval = attrs.stepInterval || 100;
        scope.stepIntervalDelay = attrs.stepIntervalDelay || 500;
        scope.emptyStringNull = attrs.nullable || false; //used in toFloat as well, TODO: improve
        var localeDecimalSeparator;
        if($locale.NUMBER_FORMATS.DECIMAL_SEP === undefined){
            //Be prepared for the case that variable name changes, this is not a public api
			//TODO: make sure this is in the public api (feature request: https://github.com/angular/angular.js/issues/13289)
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
        scope: {
			disabled:'=?ngDisabled'
		},
		require: '?ngModel',
        replace: true,
        link: function (scope, element, attrs, ngModelCtrl) {
			if(!ngModelCtrl){
				throw Error("Missing ng-model attribute on ram-touch-spin element");
			}
            var timeout, timer, clickStart;
            scope.focused = false;
			
			if(scope.disabled === undefined){
				scope.disabled = false;
			}
			
			scope.valid = true;

            setScopeValues(scope, attrs);
						
			var orignalRender = ngModelCtrl.$render;
			
			var input = element.find('input');
			 
			var modelSetter = $parse(attrs['ngModel']).assign;
			 
			ngModelCtrl.$render = function () {
				scope.val = toString( ngModelCtrl.$viewValue, scope.decimalSep);
				ngModelCtrl.$modelValue = ngModelCtrl.$viewValue;
			};
			
			//TODO: make sure timers are deleted when element is destroyed
			
			var updateNgviewValue = function(val){
				//consistency check, we should not have a string type value here
				if(typeof value === "string"){
					throw new Error("value was of string type!");
				}
				ngModelCtrl.$setViewValue(val);
				orignalRender();
				ngModelCtrl.$setValidity('invalid', true);
				scope.valid = true;
				modelSetter(scope.$parent, ngModelCtrl.$viewValue);
			}
			
			//ngModel default value is NaN
			if(isNaN(ngModelCtrl.$viewValue)){
				var initval = attrs.initval || (scope.emptyStringNull ? null : 0);
				if( attrs.initval){
					updateNgviewValue( toFloat(initval, scope));	
				}
				scope.val = initval;
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
			
			//This additional parser is a fix for old browsers (Chrome 18) where we have a string value for a strange reason.
			ngModelCtrl.$parsers.push(function(viewValue) {
				if(typeof viewValue === "string"){
					return toFloat(viewValue, scope);
				}
				return viewValue;
			});

            scope.updateValue = function () {
                if (scope.val !== undefined) {
					//check regex first 
					//TODO: move regex away from scope object
					if(scope.val === "" || scope.regex.test(scope.val)){
						
					}else{
						ngModelCtrl.$setValidity('invalid', false);
						scope.valid = false;
						orignalRender();
						return;
					}
					//parse and update
                    var value = toFloat(scope.val, scope);
                    var outOfBounds = false
                    if (scope.max != undefined && value > scope.max){
                         value = scope.max; 
                         outOfBounds = true;
                    }
                    else if (scope.min != undefined && value < scope.min) {
                        value = scope.min;
                        outOfBounds = true;
                    }
                    if(outOfBounds){
						ngModelCtrl.$setValidity('invalid', false);
						scope.valid = false;
						orignalRender();
						return;
                    }
					updateNgviewValue(value);
                }
            }
			

            scope.increment = function () {
                var value = parseFloat(parseFloat(Number(ngModelCtrl.$viewValue)) + parseFloat(scope.step)).toFixed(scope.decimals);
                if (scope.max != undefined && value > scope.max) return;
				updateNgviewValue( toFloat(value, scope));
				ngModelCtrl.$render();
            };

            scope.decrement = function () {
                var value = parseFloat(parseFloat(Number(ngModelCtrl.$viewValue)) - parseFloat(scope.step)).toFixed(scope.decimals);
                if (scope.min != undefined && value < scope.min) {
                    value = parseFloat(scope.min).toFixed(scope.decimals);
					updateNgviewValue( toFloat(value, scope));
                    return;
                }
                updateNgviewValue( toFloat(value, scope));
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
        '<md-input-container class="material-touchspin" ng-class"{\'has-error\': !valid}" layout="row">' +
        //'<div class="material-touchspin" ng-class="{\'has-error\': !valid}">' +
        '       <md-button class="md-accent md-raised material-touchspin-down" ng-mousedown="startSpinDown()" ng-mouseup="stopSpin()" ng-disabled="disabled" tabindex="-1"><md-icon>remove</md-icon></md-button>' +
		'  <input type="text" ng-model="val" ng-change="updateValue()" ng-blur="blur()" ng-focus="focus()" ng-disabled="disabled">' +
        '       <md-button class="md-accent md-raised material-touchspin-up" ng-mousedown="startSpinUp()" ng-mouseup="stopSpin()" ng-disabled="disabled" tabindex="-1"><md-icon>add</md-icon></md-button>' +
        //'</div>'
        '</md-input-container>'

    };
}]);