'use strict';

System.register(['app/plugins/sdk', 'lodash', 'app/core/utils/kbn', 'app/core/time_series', './css/trend-panel.css!'], function (_export, _context) {
  "use strict";

  var MetricsPanelCtrl, _, kbn, TimeSeries, _createClass, TrendCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  return {
    setters: [function (_appPluginsSdk) {
      MetricsPanelCtrl = _appPluginsSdk.MetricsPanelCtrl;
    }, function (_lodash) {
      _ = _lodash.default;
    }, function (_appCoreUtilsKbn) {
      kbn = _appCoreUtilsKbn.default;
    }, function (_appCoreTime_series) {
      TimeSeries = _appCoreTime_series.default;
    }, function (_cssTrendPanelCss) {}],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      _export('TrendCtrl', TrendCtrl = function (_MetricsPanelCtrl) {
        _inherits(TrendCtrl, _MetricsPanelCtrl);

        function TrendCtrl($scope, $injector, $rootScope) {
          _classCallCheck(this, TrendCtrl);

          var _this = _possibleConstructorReturn(this, (TrendCtrl.__proto__ || Object.getPrototypeOf(TrendCtrl)).call(this, $scope, $injector));

          _this.$rootScope = $rootScope;

          var panelDefaults = {
            isValueColored: false,
            colors: ['#d44a3a', '#e5ac0e', '#299c46'],
            colorInBackground: false,
            thresholds: "",
            prefix: '',
            postfix: '',
            valueName: 'avg',
            format: 'none',
            prefixFontSize: '50%',
            valueFontSize: '80%',
            postfixFontSize: '50%',
            trend: {
              show: true,
              valueFontSize: '80%',
              signFontSize: '70%',
              unitFontSize: '50%',
              showDiff: false,
              colors: ['#d44a3a', '#e5ac0e', '#299c46'],
              sign: ['???', '???', '???'],
              colorInBackground: false,
              thresholds: "0,0"
            }
          };

          _.defaultsDeep(_this.panel, panelDefaults);

          _this.events.on('data-received', _this.onDataReceived.bind(_this));
          _this.events.on('data-error', _this.onDataError.bind(_this));
          _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_this));
          _this.events.on('panel-teardown', _this.onPanelTeardown.bind(_this));
          _this.events.on('panel-initialized', _this.render.bind(_this));

          _this.data = { trend: { percent: 0, sign: 0 } };

          _this.valueNameOptions = [{ value: 'min', text: 'Min' }, { value: 'max', text: 'Max' }, { value: 'avg', text: 'Average' }, { value: 'current', text: 'Current' }, { value: 'total', text: 'Total' }, { value: 'name', text: 'Name' }, { value: 'first', text: 'First' }, { value: 'delta', text: 'Delta' }, { value: 'diff', text: 'Difference' }, { value: 'range', text: 'Range' }, { value: 'last_time', text: 'Time of last point' }];
          return _this;
        }

        //
        // Event Handling
        //


        _createClass(TrendCtrl, [{
          key: 'onDataError',
          value: function onDataError(err) {
            console.log(err);
            this.onDataReceived([]);
          }
        }, {
          key: 'onDataReceived',
          value: function onDataReceived(dataList) {
            var data = {};
            console.log('onDataReceived()', dataList);
            this.series = dataList.map(this.seriesHandler.bind(this));
            this.setValues(data);

            this.data = data;
            this.render();
          }
        }, {
          key: 'onInitEditMode',
          value: function onInitEditMode() {
            this.fontSizes = ['20%', '30%', '50%', '70%', '80%', '100%', '110%', '120%', '150%', '170%', '200%'];
            this.unitFormats = kbn.getUnitFormats();
            this.addEditorTab('Options', 'public/plugins/trend-panel/editor.html', 2);
          }
        }, {
          key: 'onPanelTeardown',
          value: function onPanelTeardown() {
            this.$timeout.cancel(this.nextTickPromise);
          }
        }, {
          key: 'onColorChange',
          value: function onColorChange(colors, panelColorIndex) {
            var _this2 = this;

            return function (color) {
              colors[panelColorIndex] = color;
              _this2.render();
            };
          }
        }, {
          key: 'seriesHandler',
          value: function seriesHandler(seriesData) {
            var series = new TimeSeries({
              datapoints: seriesData.datapoints || [],
              alias: seriesData.target
            });

            series.flotpairs = series.getFlotPairs(this.panel.nullPointMode);
            return series;
          }
        }, {
          key: 'setValues',
          value: function setValues(data) {
            data.flotpairs = [];

            // console.log(`${this.panel.prefix} > setValues()`)
            // console.log(this.series)

            if (this.series && this.series.length > 0) {
              var lastPoint = _.last(this.series[0].datapoints);
              var lastValue = _.isArray(lastPoint) ? lastPoint[0] : null;

              if (this.panel.valueName === 'name') {
                data.value = 0;
                data.valueRounded = 0;
                data.valueFormatted = this.series[0].alias;
              } else if (_.isString(lastValue)) {
                data.value = 0;
                data.valueFormatted = _.escape(lastValue);
                data.valueRounded = 0;
              } else if (this.panel.valueName === 'last_time') {
                var formatFunc = kbn.valueFormats[this.panel.format];
                data.value = lastPoint[1];
                data.valueRounded = data.value;
                data.valueFormatted = formatFunc(data.value, 0, 0);
              } else {
                data.value = this.series[0].stats[this.panel.valueName];
                data.flotpairs = this.series[0].flotpairs;

                var decimalInfo = this.getDecimalsForValue(data.value);
                var _formatFunc = kbn.valueFormats[this.panel.format];
                data.valueFormatted = _formatFunc(data.value, decimalInfo.decimals, decimalInfo.scaledDecimals);
                data.valueRounded = kbn.roundValue(data.value, decimalInfo.decimals);
              }

              // Add $__name variable for using in prefix or postfix
              data.scopedVars = _.extend({}, this.panel.scopedVars);
              data.scopedVars['__name'] = { value: this.series[0].label }; // eslint-disable-line
            } else {
              data.value = NaN;
              data.valueRounded = NaN;
              data.valueFormatted = null;
            }

            if (this.series && this.series.length >= 1 && data.value != null && this.panel.targets.length > 1) {
              this.getTrendValue(data, this.series[1] === undefined ? 0 : this.series[1].stats[this.panel.valueName], data.value);
            } else {
              data.trend = {};
            }

            console.log(this.panel.prefix + ' > trend');
            console.log(data.trend);
          }
        }, {
          key: 'getTrendValue',
          value: function getTrendValue(data, original, current) {

            data.trend = {};
            // const original = 130.2456;
            var increase = current - original;

            // console.log(current, original, increase)

            var percent = 0;
            if (original !== 0) {
              percent = increase / original * 100;
              if (percent > 0) {
                data.trend.sign = 1;
              } else if (percent < 0) {
                data.trend.sign = -1;
              } else {
                data.trend.sign = 0;
              }
              var numDecimals = 2;
              data.trend.percent = Math.abs(parseFloat(Math.round(percent * 100) / 100).toFixed(numDecimals));
              data.trend.percentFull = data.trend.percent | 0;
              data.trend.percentDecimals = Math.round((data.trend.percent % 1).toFixed(numDecimals) * Math.pow(10, numDecimals));
            } else {
              if (current > 0) {
                data.trend.sign = 1;
              } else if (current < 0) {
                data.trend.sign = -1;
              } else {
                data.trend.sign = 0;
              }

              // Cannot divide by zero, percent change must be represented as NaN
              data.trend.percent = NaN;
            }

            data.trend.increase = increase;
            data.trend.original = original;

            var decimalInfo = this.getDecimalsForValue(increase);
            var formatFunc = kbn.valueFormats[this.panel.format];
            data.trend.increaseFormatted = formatFunc(increase, decimalInfo.decimals, decimalInfo.scaledDecimals);
            data.trend.increaseRounded = kbn.roundValue(increase, decimalInfo.decimals);
          }
        }, {
          key: 'setUnitFormat',
          value: function setUnitFormat(subItem) {
            this.panel.format = subItem.value;
            this.refresh();
          }
        }, {
          key: 'getDecimalsForValue',
          value: function getDecimalsForValue(value) {
            if (_.isNumber(this.panel.decimals)) {
              return { decimals: this.panel.decimals, scaledDecimals: null };
            }

            var delta = value / 2;
            var dec = -Math.floor(Math.log(Math.abs(delta)) / Math.LN10);

            var magn = Math.pow(10, -dec);
            var norm = delta / magn; // norm is between 1.0 and 10.0
            var size = null;

            if (norm < 1.5) {
              size = 1;
            } else if (norm < 3) {
              size = 2;
              // special case for 2.5, requires an extra decimal
              if (norm > 2.25) {
                size = 2.5;
                ++dec;
              }
            } else if (norm < 7.5) {
              size = 5;
            } else {
              size = 10;
            }

            size *= magn;

            // reduce starting decimals if not needed
            if (Math.floor(value) === value) {
              dec = 0;
            }

            var result = {};
            result.decimals = Math.max(0, dec);
            result.scaledDecimals = result.decimals - Math.floor(Math.log(size) / Math.LN10) + 2;

            return result;
          }
        }, {
          key: 'invertColorOrder',
          value: function invertColorOrder(colors) {
            var tmp = colors[0];
            colors[0] = colors[2];
            colors[2] = tmp;
            this.render();
          }
        }, {
          key: 'getColorForTrendValue',
          value: function getColorForTrendValue() {
            if (!_.isFinite(this.data.trend.percent)) {
              // Trend percent is not representable, probably due to an empty/ missing previous query value
              // Just return the "no-change color"
              return this.panel.trend.colors[1];
            }

            var value = this.data.trend.percent * this.data.trend.sign;

            var thresholds = this.panel.trend.thresholds.split(',').map(function (strVale) {
              return Number(strVale.trim());
            });

            if (value < thresholds[0]) {
              return this.panel.trend.colors[0];
            } else if (value >= thresholds[0] && value <= thresholds[1]) {
              return this.panel.trend.colors[1];
            } else {
              return this.panel.trend.colors[2];
            }
          }
        }, {
          key: 'getColorForValue',
          value: function getColorForValue() {
            if (!_.isFinite(this.data.value)) {
              return null;
            }

            var thresholds = this.panel.thresholds.split(',').map(function (strVale) {
              return Number(strVale.trim());
            });

            for (var i = thresholds.length; i > 0; i--) {
              if (this.data.value >= thresholds[i - 1]) {
                return this.panel.colors[i];
              }
            }

            return _.first(this.panel.colors);
          }
        }, {
          key: 'link',
          value: function link(scope, elem) {
            var _this3 = this;

            this.events.on('render', function () {
              var $panelContainer = elem.find('.trend-panel-value-container');
              var $valueContainer = elem.find('.trend-panel-value-container > span.trend-panel-value');
              var $prefixContainer = elem.find('.trend-panel-value-container > span.trend-panel-prefix');
              var $postfixContainer = elem.find('.trend-panel-value-container > span.trend-panel-postfix');
              var $trendContainer = elem.find('.trend-panel-trend-container');
              var $signContainer = elem.find('.trend-panel-trend-container > span.trend-panel-sign');
              var $unitContainer = elem.find('.trend-panel-trend-container > span.trend-panel-unit');
              var $diffContainer = elem.find('.trend-panel-trend-container > span.trend-panel-diff');
              var $trendValueContainer = elem.find('.trend-panel-trend-container > span.trend-panel-trend-value');
              var $trendDigitContainer = elem.find('.trend-panel-trend-container > span.trend-panel-trend-digits');

              $prefixContainer.html(_this3.panel.prefix);
              $postfixContainer.html(_this3.panel.postfix);
              $prefixContainer.css('font-size', _this3.panel.prefixFontSize);
              $valueContainer.css('font-size', _this3.panel.valueFontSize);

              if (_this3.data.valueFormatted) {
                $valueContainer.html(_this3.data.valueFormatted);
              } else {
                $valueContainer.html('N/A');
              }

              if (_this3.panel.trend.show && _this3.data.trend.hasOwnProperty('percent') && _this3.data.trend.hasOwnProperty('sign')) {

                $signContainer.html(_this3.panel.trend.sign[_this3.data.trend.sign + 1]);
                $signContainer.css('font-size', _this3.panel.trend.signFontSize);
                $trendValueContainer.html(!_.isFinite(_this3.data.trend.percent) ? 'N/A' : _this3.data.trend.percentFull);
                $trendValueContainer.css('font-size', _this3.panel.trend.valueFontSize);
                $trendDigitContainer.html(_this3.data.trend.percentDecimals && _this3.data.trend.percentDecimals !== 0 ? '.' + _this3.data.trend.percentDecimals : '');
                $trendDigitContainer.css('font-size', _this3.panel.trend.valueFontSize);
                $unitContainer.html('%');
                $unitContainer.css('font-size', _this3.panel.trend.unitFontSize);
                var backgroundColor = _this3.panel.trend.colorInBackground ? _this3.getColorForTrendValue() : '#cccccc';
                var foregroundColor = _this3.panel.trend.colorInBackground ? '#cccccc' : _this3.getColorForTrendValue();

                $trendContainer.removeAttr('style');
                if (_this3.panel.trend.colorInBackground) {
                  $trendContainer.css('background-color', backgroundColor);
                } else {
                  $trendContainer.css('color', foregroundColor);
                }

                if (_this3.panel.trend.showDiff && _this3.data.trend.increaseRounded && _this3.data.trend.increaseRounded !== 0) {
                  $diffContainer.html(_this3.data.trend.increaseRounded > 0 ? '+' + _this3.data.trend.increaseFormatted : _this3.data.trend.increaseFormatted);
                  $diffContainer.css({
                    'background-color': foregroundColor,
                    'color': backgroundColor,
                    'font-size': '30%',
                    'margin-left': '15px',
                    'padding': '2px 4px',
                    'border-radius': '5px'
                  });
                } else {
                  $diffContainer.html('');
                  $diffContainer.removeAttr('style');
                }
              } else {
                $signContainer.html('');
                $signContainer.removeAttr('style');
                if (_this3.panel.trend.show && _this3.panel.targets.length == 1) {
                  $trendValueContainer.html("Provide query 'B' to see trend");
                } else {
                  $trendValueContainer.html('');
                }
                $trendValueContainer.removeAttr('style');
                $unitContainer.html('');
                $unitContainer.removeAttr('style');
                $diffContainer.html('&nbsp;');
                $diffContainer.removeAttr('style');
              }

              if (_this3.panel.isValueColored) {
                var color = _this3.getColorForValue();
                if (_this3.panel.colorInBackground) {
                  $panelContainer.css('background-color', color);
                  $panelContainer.css('color', '');
                } else {
                  $panelContainer.css('color', color);
                  $panelContainer.css('background-color', '');
                }
              } else {
                $panelContainer.css('background-color', 'transparent');
                $panelContainer.css('color', '');
              }
            });
          }
        }]);

        return TrendCtrl;
      }(MetricsPanelCtrl));

      _export('TrendCtrl', TrendCtrl);

      TrendCtrl.templateUrl = 'module.html';
    }
  };
});
//# sourceMappingURL=trend_ctrl.js.map
