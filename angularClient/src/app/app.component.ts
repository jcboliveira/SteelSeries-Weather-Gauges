import { Component } from '@angular/core';
import { Cgauges } from './cgauges';
import { HttpService } from './http.service';
import { IGaugeOptions } from './interfaces';

declare const steelseries: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['../../../web_server/css/gauges-ss.css']
})
export class AppComponent {
  title = 'angularClient';
  _gauges: Cgauges = null;

  constructor(private HTTPService: HttpService) { }


  ngOnInit() {

    this.init();

    this.HTTPService.updateParameters
      .subscribe(
        JSON => {
          this.updateGauges(JSON);
        },
        err => console.error(err)
      );
  }

  init(): void {
    const options: IGaugeOptions = {
      degreeScale: undefined,
      pointSymbols: undefined,
      roseVisible: undefined,
      lcdTitleStrings: undefined,
      useColorLabels: undefined,
      useSections: undefined,
      userLedVisible: undefined,
      userLedColor: undefined,
      maxMinVisible: undefined,
      useSectionColors: undefined,
      pointerTypeLatest: undefined,
      pointerTypeAverage: undefined,
      pointerColorAverage: undefined,
      fullScaleDeflectionTime: 5,
      gaugeType: steelseries.GaugeType.TYPE4,
      niceScale: true,
      ledVisible: false,
      frameDesign: steelseries.FrameDesign.TILTED_GRAY,
      knobType: steelseries.KnobType.STANDARD_KNOB,
      knobStyle: steelseries.KnobStyle.SILVER,
      lcdDecimals: 1,
      digitalFont: true,
      tickLabelOrientation: steelseries.TickLabelOrientation.HORIZONTAL,
      labelNumberFormat: steelseries.LabelNumberFormat.STANDARD,
      thresholdVisible: false,
      frameVisible: false,
      maxValue: 0,
      minValue: 0,
      size: 0,
      minMeasuredValueVisible: false,
      maxMeasuredValueVisible: false,
      titleString: undefined,
      unitString: undefined,
      trendVisible: false,
      section: undefined,
      fractionalScaleDecimals: undefined,
      backgroundColor: steelseries.BackgroundColor.WHITE,
      foregroundType: steelseries.ForegroundType.TYPE5,
      pointerType: steelseries.PointerType.TYPE9,
      pointerColor: steelseries.ColorDef.RED,
      lcdColor: steelseries.LcdColor.WHITE,
    };

    this._gauges = new Cgauges(options);
    this._gauges.init();
  }

  updateGauges(parameterlist) {
    this._gauges.GaugeTemp(parameterlist);
    this._gauges.GaugeApp(parameterlist);
    this._gauges.GaugeWind(parameterlist);
    this._gauges.GaugeDir(parameterlist);
    this._gauges.GaugeRain(parameterlist);
    this._gauges.GaugeRRate(parameterlist);
    this._gauges.GaugeDew(parameterlist);
    this._gauges.GaugeBaro(parameterlist);
    this._gauges.GaugeHum(parameterlist);
    this._gauges.GaugeUV(parameterlist);
    this._gauges.GaugeSolar(parameterlist);
    this._gauges.GaugeCloudBase(parameterlist);
    this._gauges.firstRun = false;
  }

}
