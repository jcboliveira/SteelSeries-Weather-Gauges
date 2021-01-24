
import * as moment from 'moment';
import { IGaugeOptions, ImeteoParameterList } from './interfaces';
declare var steelseries: any;

const gaugeGlobals = {
    blue: 'rgba(0, 0,  255, 0.4)',
    green: 'rgba(0, 255,  0, 0.4)',
    yellow: 'rgba(255, 255, 0, 0.4)',
    orange: 'rgba(255, 128,  0, 0.4)',
    red: 'rgba(255,  0,  0, 0.4)',
    purple: 'rgba(255, 4, 240, 0.4)',
    minMaxArea: 'rgba(0,160,0,0.3)',
    windAvgArea: 'rgba(132,212,134,0.3)',
    tempScaleMin: 0,
    tempScaleMax: 30,
    dewScaleMin: 0,
    dewScaleMax: 30,
    tempAppScaleMin: 0,
    tempAppScaleMax: 30,
    rainScaleMax: 1,
    baroScaleMin: 965,
    baroScaleMax: 1040,
    windScaleMax: 50,
    rainRateScaleMax: 5,
    uvScaleMax: 10,
    solarScaleMax: 600,
    cloudScaleMax: 300,
    leafWetScaleMax: 15,
    soilTempScaleMin: 0,
    soilTempScaleMax: 30,
    soilMoistScaleMax: 40,
    tempunit: '°C',
    pressunit: 'hPa',
    windunit: 'km/h',
};

export class Cgauges {
    private _firstRun = true;
    public set firstRun(value) {
        this._firstRun = value;
    }
    private gaugeTemp: any;
    private gaugeDew: any;
    private gaugeRain: any;
    private gaugeRRate: any;
    private gaugeHum: any;
    private gaugeBaro: any;
    private gaugeWind: any;
    private gaugeDir: any;
    private gaugeUV: any;
    private gaugeSolar: any;
    private gaugeCloud: any;
    private gaugeTempApp: any;
    private gaugeSize: number;

    constructor(params: IGaugeOptions) {
        this._params = params;
    }
    _params: IGaugeOptions;
    GaugeTemp(parameterlist: ImeteoParameterList): string[] {
        let areas: any[] = [];
        let outsideTemp = 0;
        let hourchangetemp = 0;
        let trend = 0;
        let minValue = 0;
        let maxValue = 0;
        if (!this.gaugeTemp) {
            const params = Object.create(this._params);
            params.size = Math.ceil(this.gaugeSize);
            params.section = [steelseries.Section(-5, 0, gaugeGlobals.yellow),
            steelseries.Section(0, 5, gaugeGlobals.blue),
            steelseries.Section(5, 32, gaugeGlobals.green),
            steelseries.Section(32, 36, gaugeGlobals.yellow),
            steelseries.Section(36, 39, gaugeGlobals.orange),
            steelseries.Section(39, 50, gaugeGlobals.red)];

            params.minValue = gaugeGlobals.tempScaleMin;
            params.maxValue = gaugeGlobals.tempScaleMax;
            params.minMeasuredValueVisible = false;
            params.maxMeasuredValueVisible = false;
            params.titleString = 'Temperatura';
            params.unitString = gaugeGlobals.tempunit;
            params.trendVisible = true;

            this.gaugeTemp = new steelseries.Radial('canvas_temp', params);
            return [];
        } else {
            outsideTemp = parameterlist.outsideTemp;
            hourchangetemp = parameterlist.hourchangetemp;
            maxValue = parameterlist.hiOutsideTemp;
            minValue = parameterlist.lowOutsideTemp;

            areas = [steelseries.Section(+minValue, +maxValue,
                gaugeGlobals.minMaxArea)];

            if (hourchangetemp > 0) {
                trend = steelseries.TrendState.UP;
            } else if (hourchangetemp < 0) {
                trend = steelseries.TrendState.DOWN;
            } else {
                trend = steelseries.TrendState.STEADY;
            }
            this.gaugeTemp.setTrend(trend);

            gaugeGlobals.tempScaleMax = this.setGaugeMaxScale(maxValue, gaugeGlobals.tempScaleMax, this.gaugeTemp, 10);
            gaugeGlobals.tempScaleMin = this.setGaugeMinScale(minValue, gaugeGlobals.tempScaleMin, this.gaugeTemp, 10);

            this.gaugeTemp.setArea(areas);
            if (this._firstRun === false) {
                this.gaugeTemp.setValueAnimated(outsideTemp);
            } else {
                this.gaugeTemp.setValue(outsideTemp);
            }

            let minValueTxt = '';
            let maxValueTxt = '';
            if (minValue !== undefined) {
                minValueTxt = minValue.toLocaleString();
            }
            if (maxValue !== undefined) {
                maxValueTxt = maxValue.toLocaleString();
            }

            return ['Média hora: ' + parameterlist.houravgtemp.toLocaleString() + ' °C',
            'Variação hora: ' + parameterlist.hourchangetemp.toLocaleString() + ' °C',
            'Mínima: ' + minValueTxt + ' °C às ' + parameterlist.lowOutsideTempTime,
            'Máxima: ' + maxValueTxt + ' °C às ' + parameterlist.hiOutsideTempTime];
        }
    }

    GaugeDew(parameterlist: ImeteoParameterList): string[] {
        let areas: any[] = [];
        let outsideDewPt = 0;
        let hourchangedewpt = 0;
        let trend = 0;
        let minValue = 0;
        let maxValue = 0;

        if (!this.gaugeDew) {
            const params = Object.create(this._params);
            params.size = Math.ceil(this.gaugeSize);
            params.section = [steelseries.Section(-5, 0, gaugeGlobals.yellow),
            steelseries.Section(0, 5, gaugeGlobals.blue),
            steelseries.Section(5, 32, gaugeGlobals.green),
            steelseries.Section(32, 36, gaugeGlobals.yellow),
            steelseries.Section(36, 39, gaugeGlobals.orange),
            steelseries.Section(39, 50, gaugeGlobals.red)];
            params.minValue = gaugeGlobals.tempScaleMin;
            params.maxValue = gaugeGlobals.tempScaleMax;
            params.minMeasuredValueVisible = false;
            params.maxMeasuredValueVisible = false;
            params.titleString = 'Pt. Orvalho';
            params.unitString = gaugeGlobals.tempunit;
            params.trendVisible = true;

            this.gaugeDew = new steelseries.Radial('canvas_dew', params);
            return [];

        } else {
            outsideDewPt = parameterlist.outsideDewPt;
            hourchangedewpt = parameterlist.hourchangedewpt;
            minValue = parameterlist.lowDewpoint;
            maxValue = parameterlist.hiDewpoint;
            areas = [steelseries.Section(+minValue, +maxValue,
                gaugeGlobals.minMaxArea)];

            if (hourchangedewpt > 0) {
                trend = steelseries.TrendState.UP;
            } else if (hourchangedewpt < 0) {
                trend = steelseries.TrendState.DOWN;
            } else {
                trend = steelseries.TrendState.STEADY;
            }
            this.gaugeDew.setTrend(trend);

            gaugeGlobals.dewScaleMax = this.setGaugeMaxScale(maxValue, gaugeGlobals.dewScaleMax, this.gaugeDew, 10);
            gaugeGlobals.dewScaleMin = this.setGaugeMinScale(minValue, gaugeGlobals.dewScaleMin, this.gaugeDew, 10);

            this.gaugeDew.setArea(areas);

            if (this._firstRun === false) {
                this.gaugeDew.setValueAnimated(+outsideDewPt);
            } else {
                this.gaugeDew.setValue(+outsideDewPt);
            }

            let minValueTxt = '';
            let maxValueTxt = '';
            if (minValue !== undefined) {
                minValueTxt = minValue.toLocaleString();
            }
            if (maxValue !== undefined) {
                maxValueTxt = maxValue.toLocaleString();
            }

            return ['Média hora: ' + parameterlist.houravgdewpt.toLocaleString() + ' °C',
            'Variação hora: ' + parameterlist.hourchangedewpt.toLocaleString() + ' °C',
            'Mínimo: ' + minValueTxt +  ' às ' + parameterlist.lowDewpointTime,
            'Máximo: ' + maxValueTxt + ' °C às ' + parameterlist.hiDewpointTime];
        }
    }

    GaugeApp(parameterlist: ImeteoParameterList): string[] {
        let areas: any[] = [];
        let extraTemp1 = 0;
        let trendVal = 0;
        let trend = 0;
        let minValue = 0;
        let maxValue = 0;

        if (!this.gaugeTempApp) {
            const params = Object.create(this._params);
            params.size = Math.ceil(this.gaugeSize);
            params.section = [steelseries.Section(-5, 0, gaugeGlobals.yellow),
            steelseries.Section(0, 5, gaugeGlobals.blue),
            steelseries.Section(5, 32, gaugeGlobals.green),
            steelseries.Section(32, 36, gaugeGlobals.yellow),
            steelseries.Section(36, 39, gaugeGlobals.orange),
            steelseries.Section(39, 50, gaugeGlobals.red)];
            params.minValue = gaugeGlobals.tempScaleMin;
            params.maxValue = gaugeGlobals.tempScaleMax;
            params.minMeasuredValueVisible = false;
            params.maxMeasuredValueVisible = false;
            params.titleString = 'Temp. Aparente';
            params.unitString = gaugeGlobals.tempunit;
            params.trendVisible = true;

            this.gaugeTempApp = new steelseries.Radial('canvas_app', params);
            return [];
        } else {

            extraTemp1 = parameterlist.extraTemp1;
            trendVal = parameterlist.hourchangeatemp;
            minValue = parameterlist.lowOutsideATemp;
            maxValue = parameterlist.hiOutsideATemp;
            areas = [steelseries.Section(+minValue, +maxValue,
                gaugeGlobals.minMaxArea)];

            if (trendVal > 0) {
                trend = steelseries.TrendState.UP;
            } else if (trendVal < 0) {
                trend = steelseries.TrendState.DOWN;
            } else {
                trend = steelseries.TrendState.STEADY;
            }
            this.gaugeTempApp.setTrend(trend);

            gaugeGlobals.tempAppScaleMax = this.setGaugeMaxScale(maxValue, gaugeGlobals.tempAppScaleMax, this.gaugeTempApp, 10);
            gaugeGlobals.tempAppScaleMin = this.setGaugeMinScale(minValue, gaugeGlobals.tempAppScaleMin, this.gaugeTempApp, 10);

            this.gaugeTempApp.setArea(areas);

            if (this._firstRun === false) {
                this.gaugeTempApp.setValueAnimated(+extraTemp1);
            } else {
                this.gaugeTempApp.setValue(+extraTemp1);
            }
            let minValueTxt = '';
            let maxValueTxt = '';
            if (minValue !== undefined) {
                minValueTxt = minValue.toLocaleString();
            }
            if (maxValue !== undefined) {
                maxValueTxt = maxValue.toLocaleString();
            }

            return ['Média hora: ' + parameterlist.houravgatemp.toLocaleString() + ' °C',
            'Variação hora: ' + parameterlist.hourchangeatemp.toLocaleString() + ' °C',
            'Mínima: ' + minValueTxt + ' °C às ' + parameterlist.lowOutsideATempTime,
            'Máxima: ' + maxValueTxt + ' °C às ' + parameterlist.hiOutsideATempTime];
        }
    }

    GaugeRain(parameterlist: ImeteoParameterList): string[] {
        let value = 0;
        let maxValue = 0;

        if (!this.gaugeRain) {
            const params = Object.create(this._params);
            params.size = Math.ceil(this.gaugeSize);
            params.maxValue = 2;
            params.titleString = 'Pluviosidade';
            params.unitString = 'mm';
            params.section = [steelseries.Section(0, 5, 'rgba(0, 250, 0, 1)'),
            steelseries.Section(5, 10, 'rgba(0, 250, 117, 1)'),
            steelseries.Section(10, 25, 'rgba(218, 246, 0, 1)'),
            steelseries.Section(25, 40, 'rgba(250, 186, 0, 1)'),
            steelseries.Section(40, 50, 'rgba(250, 95, 0, 1)'),
            steelseries.Section(50, 65, 'rgba(250, 0, 0, 1)'),
            steelseries.Section(65, 75, 'rgba(250, 6, 80, 1)'),
            steelseries.Section(75, 100, 'rgba(205, 18, 158, 1)'),
            steelseries.Section(100, 125, 'rgba(0, 0, 250, 1)'),
            steelseries.Section(125, 500, 'rgba(0, 219, 212, 1)')];
            params.useSectionColors = true;
            params.labelNumberFormat = steelseries.LabelNumberFormat.FRACTIONAL;
            params.fractionalScaleDecimals = 1;

            this.gaugeRain = new steelseries.RadialBargraph('canvas_rain', params);
            return [];
        } else {
            value = parameterlist.dailyRain;
            maxValue = Math.max(Math.ceil(value), gaugeGlobals.rainScaleMax);

            gaugeGlobals.rainScaleMax = this.setGaugeMaxScale(maxValue, gaugeGlobals.rainScaleMax, this.gaugeRain, 1);

            if (this._firstRun === false) {
                this.gaugeRain.setValueAnimated(value);
            } else {
                this.gaugeRain.setValue(value);
            }

            return ['Chuva na hora: ' + (Math.round(parameterlist.hourrain * 10) / 10).toLocaleString() + ' mm',
            'Chuvada: ' + parameterlist.stormRain.toLocaleString() + ' mm',
            ' início: ' + moment(parameterlist.stormStart * 1000).format('HH:mm')];

        }
    }

    GaugeRRate(parameterlist: ImeteoParameterList): string[] {
        let value = 0;

        if (!this.gaugeRRate) {
            const params = Object.create(this._params);
            params.section = [steelseries.Section(0, 0.25, gaugeGlobals.blue),
            steelseries.Section(0.25, 1, gaugeGlobals.green),
            steelseries.Section(1, 4, gaugeGlobals.yellow),
            steelseries.Section(4, 16, gaugeGlobals.orange),
            steelseries.Section(16, 50, gaugeGlobals.red),
            steelseries.Section(50, 1000, gaugeGlobals.purple)];

            params.size = Math.ceil(this.gaugeSize);
            params.maxValue = 2;
            params.maxMeasuredValueVisible = true;
            params.titleString = 'Taxa Pluv.';
            params.unitString = 'mm/h';
            params.lcdDecimals = 1;
            params.labelNumberFormat = steelseries.LabelNumberFormat.FRACTIONAL;
            params.fractionalScaleDecimals = 1;
            params.niceScale = false;

            this.gaugeRRate = new steelseries.Radial('canvas_rrate', params);
            return [];
        } else {

            value = parameterlist.rainRate;
            gaugeGlobals.rainRateScaleMax =
                this.setGaugeMaxScale(Math.ceil(parameterlist.hiRainRate)
                    , gaugeGlobals.rainRateScaleMax, this.gaugeRRate, 5);

            if (this._firstRun === false) {
                this.gaugeRRate.setValueAnimated(value);
            } else {
                this.gaugeRRate.setValue(value);
            }

            this.gaugeRRate.setMaxMeasuredValue(parameterlist.hiRainRate);

            if (parameterlist.hiRainRate > 0) {
                return ['Máxima: ' + (Math.round(parameterlist.hiRainRate * 10) / 10).toLocaleString() +
                    ' mm/h às ' + parameterlist.hiRainRateTime];
            } else {
                return ['Taxa de pluviosidade nula'];
            }
        }
    }

    GaugeHum(parameterlist: ImeteoParameterList): string[] {
        let areas: any[] = [];
        let value = 0;
        let trendVal = 0;
        let trend = 0;
        let maxValue = 0;
        let minValue = 0;
        if (!this.gaugeHum) {
            const params = Object.create(this._params);
            params.size = Math.ceil(this.gaugeSize);
            params.section = [steelseries.Section(0, 20, gaugeGlobals.yellow),
            steelseries.Section(20, 80, gaugeGlobals.green),
            steelseries.Section(80, 100, gaugeGlobals.red)];
            params.maxValue = 100;
            params.titleString = 'Humidade';
            params.unitString = 'RH%';
            params.trendVisible = true;

            this.gaugeHum = new steelseries.Radial('canvas_hum', params);
            return [];
        } else {
            value = parameterlist.outsideHumidity;
            minValue = parameterlist.lowHumidity;
            maxValue = parameterlist.hiHumidity;
            areas = [steelseries.Section(+minValue, +maxValue,
                gaugeGlobals.minMaxArea)];
            trendVal = parameterlist.hourchangehumid;

            this.gaugeHum.setArea(areas);
            if (this._firstRun === false) {
                this.gaugeHum.setValueAnimated(value);
            } else {
                this.gaugeHum.setValue(value);
            }

            if (trendVal > 0) {
                trend = steelseries.TrendState.UP;
            } else if (trendVal < 0) {
                trend = steelseries.TrendState.DOWN;
            } else {
                trend = steelseries.TrendState.STEADY;
            }
            this.gaugeHum.setTrend(trend);

            let minValueTxt = '';
            let maxValueTxt = '';
            if (minValue !== undefined) {
                minValueTxt = minValue.toLocaleString();
            }
            if (maxValue !== undefined) {
                maxValueTxt = maxValue.toLocaleString();
            }

            return ['Média hora: ' + parameterlist.houravghumid.toLocaleString() + ' %',
            'Variação hora: ' + parameterlist.hourchangehumid.toLocaleString() + ' %',
            'Mínima: ' + minValueTxt + '% às ' + parameterlist.lowHumTime,
            'Máxima: ' + maxValueTxt + '% às ' + parameterlist.hiHumTime];
        }
    }

    GaugeBaro(parameterlist: ImeteoParameterList): string[] {
        let areas: any[] = [];
        let value = 0;
        let trendVal = 0;
        let trend = '';
        let maxValueToday = 0;
        let minValueToday = 0;
        let recLow = 0;
        let recHigh = 0;
        let minValue = 0;
        let maxValue = 0;
        if (!this.gaugeBaro) {
            const params = Object.create(this._params);
            params.size = Math.ceil(this.gaugeSize);
            params.minValue = gaugeGlobals.baroScaleMin;
            params.maxValue = gaugeGlobals.baroScaleMax;
            params.niceScale = false;
            params.titleString = 'Pressão Atm.';
            params.unitString = gaugeGlobals.pressunit;
            params.trendVisible = true;
            params.labelNumberFormat = steelseries.LabelNumberFormat.FRACTIONAL;
            params.fractionalScaleDecimals = 0;

            this.gaugeBaro = new steelseries.Radial('canvas_baro', params);
            return [];
        } else {
            recLow = 965;
            recHigh = 1045;
            minValueToday = parameterlist.lowBarometer;
            maxValueToday = parameterlist.hiBarometer;
            value = parameterlist.barometer;
            trendVal = parameterlist.hourchangebarom;
            minValue = Math.min(Math.floor((recLow - 2) / 10) * 10, 990);
            maxValue = Math.max(Math.ceil((recHigh + 2) / 10) * 10, 1030);

            areas = [
                steelseries.Section(minValue, recLow, gaugeGlobals.red),
                steelseries.Section(recHigh, maxValue, gaugeGlobals.red),
                steelseries.Section(minValueToday, maxValueToday, gaugeGlobals.minMaxArea)
            ];

            if (trendVal > 0) {
                trend = steelseries.TrendState.UP;
            } else if (trendVal < 0) {
                trend = steelseries.TrendState.DOWN;
            } else {
                trend = steelseries.TrendState.STEADY;
            }
            this.gaugeBaro.setTrend(trend);

            this.gaugeBaro.setArea(areas);

            if (this._firstRun === false) {
                this.gaugeBaro.setValueAnimated(value);
            } else {
                this.gaugeBaro.setValue(value);
            }

            if (parameterlist.houravgbarom !== undefined) {
                return ['Média hora: ' + parameterlist.houravgbarom.toLocaleString() + ' hPa',
                'Variação hora: ' + parameterlist.hourchangebarom.toLocaleString() + ' hPa',
                'Mínima: ' + minValueToday.toLocaleString() + ' hPa  às ' + parameterlist.lowBarometerTime,
                'Máxima: ' + maxValueToday.toLocaleString() + ' hPa  às ' + parameterlist.hiBarometerTime];
            } else {
                return ['Sem dados'];
            }

        }
    }

    GaugeWind(parameterlist: ImeteoParameterList): string[] {
        let areas: any[] = [];
        let value = 0;
        let tenMinuteAvgWindSpeed = 0;
        let tenMinuteWindGust = 0;
        let maxValue = 0;

        if (!this.gaugeWind) {
            const params = Object.create(this._params);
            params.size = Math.ceil(this.gaugeSize);
            params.section = [steelseries.Section(0, 50, gaugeGlobals.green),
            steelseries.Section(50, 60, gaugeGlobals.yellow),
            steelseries.Section(60, 70, gaugeGlobals.orange),
            steelseries.Section(70, 200, gaugeGlobals.red)];
            params.maxValue = gaugeGlobals.windScaleMax;
            params.maxMeasuredValueVisible = true;
            params.titleString = 'Vel. Vento';
            params.unitString = gaugeGlobals.windunit;

            this.gaugeWind = new steelseries.Radial('canvas_wind', params);
            return [];
        } else {
            value = parameterlist.windSpeed;
            maxValue = parameterlist.hiWindSpeed;
            tenMinuteWindGust = parameterlist.tenMinuteWindGust;
            tenMinuteAvgWindSpeed = parameterlist.tenMinuteAvgWindSpeed;
            maxValue = Math.max(maxValue, value);

            areas = [
                steelseries.Section(0, tenMinuteAvgWindSpeed, gaugeGlobals.windAvgArea),
                steelseries.Section(tenMinuteAvgWindSpeed, tenMinuteWindGust, gaugeGlobals.minMaxArea)
            ];

            gaugeGlobals.windScaleMax = this.setGaugeMaxScale(maxValue, gaugeGlobals.windScaleMax, this.gaugeWind, 10);

            this.gaugeWind.setArea(areas);
            this.gaugeWind.setMaxMeasuredValue(maxValue);
            if (this._firstRun === false) {
                this.gaugeWind.setValueAnimated(value);
            } else {
                this.gaugeWind.setValue(value);
            }
            let maxValueTxt = '';
            if (maxValue !== undefined) {
                maxValueTxt = maxValue.toLocaleString();
            }
            let tenMinuteWindGusttxt = '';
            if (tenMinuteWindGust !== undefined) {
                tenMinuteWindGusttxt = tenMinuteWindGust.toLocaleString();
            }
            let tenMinuteAvgWindSpeedtxt = '';
            if (tenMinuteAvgWindSpeed !== undefined) {
                tenMinuteAvgWindSpeedtxt = tenMinuteAvgWindSpeed.toLocaleString();
            }
            return ['Média hora: ' + parameterlist.houravgwind.toLocaleString() + ' km/h',
            'Variação hora: ' + parameterlist.hourchangewind.toLocaleString() + ' km/h',
            'Média 10 min: ' + tenMinuteAvgWindSpeedtxt.toLocaleString() + ' km/h',
            'Máxima 10 min: ' + tenMinuteWindGusttxt.toLocaleString() + ' km/h',
            'Máxima: ' + maxValueTxt + ' km/h às ' + parameterlist.hiWindSpeedTime,
            'Beaufort: ' + parameterlist.intervalAvgBeaufortScale.toLocaleString()];
        }
    }

    GaugeDir(parameterlist: ImeteoParameterList): string[] {
        let windDirectionDegrees = 0;
        let hourdomwinddir = 0;

        if (!this.gaugeDir) {
            const params = Object.create(this._params);
            params.useSections = false;
            params.useSectionColors = false;
            params.section = undefined;
            params.size = Math.ceil(this.gaugeSize);
            params.pointerTypeLatest = steelseries.PointerType.TYPE7;
            params.pointerTypeAverage = steelseries.PointerType.TYPE8;
            params.pointerColorAverage = steelseries.ColorDef.BLUE;
            params.degreeScale = true;
            params.pointSymbols = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
            params.roseVisible = false;
            params.lcdTitleStrings = ['Último', 'Média'];
            params.useColorLabels = false;

            this.gaugeDir = new steelseries.WindDirection('canvas_dir', params);
            return [];
        } else {
            let i: number,
                rosePoints = 0, roseMax = 0,
                roseSectionAngle = 0;
            const roseAreas: any = [];

            windDirectionDegrees = parameterlist.windDirectionDegrees;
            hourdomwinddir = parameterlist.hourdomwinddir;

            if (this._firstRun === false) {
                this.gaugeDir.setValueAnimatedAverage(hourdomwinddir);
            } else {
                this.gaugeDir.setValueAverage(hourdomwinddir);
            }

            if (hourdomwinddir === 0) {
                windDirectionDegrees = 0;
            }
            if (this._firstRun === false) {
                this.gaugeDir.setValueAnimatedLatest(windDirectionDegrees);
            } else {
                this.gaugeDir.setValueLatest(windDirectionDegrees);
            }

            rosePoints = parameterlist.dayWindRoseList.length;
            roseSectionAngle = 360 / rosePoints;

            for (i = 0; i < rosePoints; i++) {
                roseMax = Math.max(roseMax, parameterlist.dayWindRoseList[i]);
            }

            if (roseMax > 0) {
                for (i = 0; i < rosePoints; i++) {
                    roseAreas[i] = steelseries.Section(
                        i * roseSectionAngle - roseSectionAngle / 2,
                        (i + 1) * roseSectionAngle - roseSectionAngle / 2,
                        'rgba(' + this.gradient('2020D0', 'D04040', parameterlist.dayWindRoseList[i] / roseMax) +
                        ',' + (parameterlist.dayWindRoseList[i] / roseMax).toFixed(2) + ')'
                    );
                }
            }
            this.gaugeDir.setArea(roseAreas);

            return ['Direção: ' + this.getord(+windDirectionDegrees),
            'Vento dominante hora: ' + this.getord(+hourdomwinddir),
            'Wind Run hoje: ' + parameterlist.daywindrun];
        }
    }

    GaugeUV(parameterlist: ImeteoParameterList): string[] {
        let value = 0;
        let maxValue = 0;

        if (!this.gaugeUV) {
            const params = Object.create(this._params);
            params.section = [steelseries.Section(0, 2.9, gaugeGlobals.green),
            steelseries.Section(2.9, 5.8, gaugeGlobals.yellow),
            steelseries.Section(5.8, 7.8, gaugeGlobals.orange),
            steelseries.Section(7.8, 10.9, gaugeGlobals.red),
            steelseries.Section(10.9, 20, gaugeGlobals.purple)];

            params.useSections = true;
            params.size = Math.ceil(this.gaugeSize);
            params.maxValue = gaugeGlobals.uvScaleMax;
            params.titleString = 'Índice UV';
            params.lcdDecimals = 1;
            params.maxMeasuredValueVisible = true;

            this.gaugeUV = new steelseries.Radial('canvas_uv', params);
            return [];
        } else {
            let indx: any;

            value = parameterlist.UV;
            maxValue = parameterlist.hiUV;

            if (+value === 0) {
                indx = 0;
            } else if (value < 2.5) {
                indx = 1;
            } else if (value < 5.5) {
                indx = 2;
            } else if (value < 7.5) {
                indx = 3;
            } else if (value < 10.5) {
                indx = 4;
            } else {
                indx = 5;
            }

            if (value > this.gaugeUV.getMaxValue()) {
                this.gaugeUV.setMaxValue(Math.ceil(value) + Math.ceil(value) % 2);
            }
            if (this._firstRun === false) {
                this.gaugeUV.setValueAnimated(value);
            } else {
                this.gaugeUV.setValue(value);
            }

            this.gaugeUV.setMaxMeasuredValue(maxValue);

            const uv_headlines = ['Índice UV não mensurável',
                'Sem perigo para a maioria das pessoas',
                'Pequeno risco de danos por exposição ao sol sem protecção',
                'Alto risco de danos por exposição ao sol sem protecção',
                'Risco muito alto de danos por exposição ao sol sem protecção',
                'Risco extremo de danos por exposição ao sol sem protecção'];

            const uv_details = ['Ainda é noite, ou o dia está com céu muito nublado.',
                'Use óculos de sol em dias ensolarados; caso tenha uma pele particularmente sencível,\n' +
                'ou exista neve no solo que reflete radiação UV, utilize protector solar.',
                'Utilize óculos de sol, e protector solar SPF 30+, proteja o corpo com roupa e use\n' +
                'chapéu. Por volta do meio dia, quando o sol está mais intenso, procure estar à sombra.',
                'Utilize óculos de sol, e protector solar SPF 30+, proteja o corpo com roupas de protecção\n' +
                'solar e use um chapéu com abas. Reduza a exposição ao sol nas duas horas anteriores e até às\n' +
                'tres horas posteriores ao meio dia solar (cerca das 11:00 até às 16:00 durante o verão nas\n' +
                'zonas que praticam horário de verão).',
                'Usar protetor solar FPS 30+, camisa, óculos de sol e um chapéu.\n' +
                'Não fique ao sol por muito tempo.',
                'Tome todas as precauções, incluindo: Usar óculos de sol, protetor solar FPS 30+,\n' +
                'cubra o corpo com roupa com mangas, vista calças, e use um chapéu de abas largas.\n' +
                'Evite a exposição ao sol nas duas horas anteriores e até às tres horas posteriores ao meio dia solar\n' +
                '(cerca das 11:00 até às 16:00 durante o verão nas zonas que praticam horário de verão).'];

            return ['Máximo: ' + maxValue + ' às ' + parameterlist.hiUVTime,
            uv_headlines[indx],
            uv_details[indx]];
        }
    }

    GaugeSolar(parameterlist: ImeteoParameterList): string[] {
        let value = 0;
        let maxValue = 0;

        if (!this.gaugeSolar) {
            const params = Object.create(this._params);
            params.section = [
                steelseries.Section(0, 600, gaugeGlobals.green),
                steelseries.Section(600, 800, gaugeGlobals.yellow),
                steelseries.Section(800, 1000, gaugeGlobals.orange),
                steelseries.Section(1000, 1800, gaugeGlobals.red)
            ];
            params.useSections = true;
            params.size = Math.ceil(this.gaugeSize);
            params.maxValue = gaugeGlobals.solarScaleMax;
            params.titleString = 'Rad. Solar';
            params.unitString = 'Wm\u207B\u00B2';
            params.niceScale = false;
            params.maxMeasuredValueVisible = true;
            params.lcdDecimals = 0;
            params.userLedVisible = true;
            params.userLedColor = steelseries.LedColor.YELLOW_LED;

            this.gaugeSolar = new steelseries.Radial('canvas_solar', params);
            return [];
        } else {
            value = parameterlist.solarRad;
            maxValue = parameterlist.hiRadiation;


            if (maxValue !== undefined) {
                gaugeGlobals.solarScaleMax = this.setGaugeMaxScale(maxValue, gaugeGlobals.solarScaleMax, this.gaugeSolar, 100);
                this.gaugeSolar.setMaxMeasuredValue(maxValue);
            } else {
                gaugeGlobals.solarScaleMax = this.setGaugeMaxScale(value, gaugeGlobals.solarScaleMax, this.gaugeSolar, 100);
                this.gaugeSolar.setMaxMeasuredValue(value);

            }

            if (this._firstRun === false) {
                this.gaugeSolar.setValueAnimated(value);
            } else {
                this.gaugeSolar.setValue(value);
            }

            if (value >= 50) {
                this.gaugeSolar.setUserLedOnOff(true);
            } else {
                this.gaugeSolar.setUserLedOnOff(false);
            }

            if (maxValue !== undefined) {
                return ['Máxima: ' + maxValue.toLocaleString() + ' W/m² às ' + parameterlist.hiRadiationTime];
            }
        }
    }

    GaugeCloudBase(parameterlist: ImeteoParameterList): void {
        let value = 0;

        if (!this.gaugeCloud) {
            const params = Object.create(this._params);
            params.section = [steelseries.Section(0, 150, gaugeGlobals.purple),
            steelseries.Section(150, 300, gaugeGlobals.red),
            steelseries.Section(300, 750, gaugeGlobals.orange),
            steelseries.Section(750, 1000, gaugeGlobals.yellow),
            steelseries.Section(1000, 5500, gaugeGlobals.green)];
            params.size = Math.ceil(this.gaugeSize);
            params.maxValue = gaugeGlobals.cloudScaleMax;
            params.titleString = 'Base das Nuvens';
            params.unitString = 'metros';
            params.lcdDecimals = 0;

            this.gaugeCloud = new steelseries.Radial('canvas_cloud', params);
        } else {
            value = parameterlist.cumulusBase;

            gaugeGlobals.cloudScaleMax = this.setGaugeMaxScale(value, gaugeGlobals.cloudScaleMax, this.gaugeCloud, 100);

            if (this._firstRun === false) {
                this.gaugeCloud.setValueAnimated(value);
            } else {
                this.gaugeCloud.setValue(value);
            }
        }
    }


    init(): void {
        if (!document.createElement('canvas').getContext) {
            const div = document.createElement('div');
            div.innerHTML = 'O seu browser não suporta HTML5...\n' +
                'Actualize o seu navegador para uma versão mais recente!\n\n' +
                'Vai ser redirecionado para uma página compativel...';
            document.getElementsByTagName('body')[0].appendChild(div);
        }
        const windowWith: number = window.innerWidth;
        this.gaugeSize = Math.round(windowWith / 2) - 10;
        if (this.gaugeSize > 210) {
            this.gaugeSize = 210;
        }

        this.GaugeTemp(undefined);
        this.GaugeDew(undefined);
        this.GaugeApp(undefined);
        this.GaugeHum(undefined);
        this.GaugeWind(undefined);
        this.GaugeDir(undefined);
        this.GaugeRain(undefined);
        this.GaugeRRate(undefined);
        this.GaugeUV(undefined);
        this.GaugeSolar(undefined);
        this.GaugeCloudBase(undefined);
        this.GaugeBaro(undefined);
    }

    //
    // --------------- Helper functions ------------------
    //

    //
    //  getord() converts a value in degrees (0-360) into a localised compass point (N, ENE, NE, etc)
    //
    private getord(deg: number): any {
        if (deg === 0) {
            return 'Calmo';
        } else {
            const coords = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'OSO', 'O', 'OSO', 'O', 'ONO', 'NO', 'NNO', 'ONO'];
            return (coords[Math.floor((deg + 11.25) / 22.5) % 16]);
        }
    }

    private gradient(startCol: string, endCol: string, fraction: number): any {
        let redOrigin: number, grnOrigin: number, bluOrigin: number,
            gradientSizeRed: any, gradientSizeGrn: any, gradientSizeBlu: any;

        redOrigin = parseInt(startCol.substr(0, 2), 16);
        grnOrigin = parseInt(startCol.substr(2, 2), 16);
        bluOrigin = parseInt(startCol.substr(4, 2), 16);

        gradientSizeRed = parseInt(endCol.substr(0, 2), 16) - redOrigin;
        gradientSizeGrn = parseInt(endCol.substr(2, 2), 16) - grnOrigin;
        gradientSizeBlu = parseInt(endCol.substr(4, 2), 16) - bluOrigin;

        return (redOrigin + (gradientSizeRed * fraction)).toFixed(0) + ',' +
            (grnOrigin + (gradientSizeGrn * fraction)).toFixed(0) + ',' +
            (bluOrigin + (gradientSizeBlu * fraction)).toFixed(0);
    }

    //
    // set gauge max scale
    private setGaugeMaxScale(maxValue: number, scaleMax: number, gauge: any, scaleStep: number): number {
        if (maxValue > gauge.getMaxValue()) {
            while (maxValue > scaleMax) {
                scaleMax += scaleStep;
            }
            gauge.setMaxValue(scaleMax);
        }
        return scaleMax;

    }

    // set gauge max and min scale
    private setGaugeMinScale(minValue: number, scaleMin: number, gauge: any, scaleStep: number): number {
        if (minValue < gauge.getMinValue()) {
            while (scaleMin > minValue) {
                scaleMin -= scaleStep;
            }
            gauge.setMinValue(scaleMin);
        }
        return scaleMin;
    }

}
