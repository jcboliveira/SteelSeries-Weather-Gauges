export interface IGaugeOptions {
    fullScaleDeflectionTime: number;
    gaugeType: any;
    minValue: number;
    niceScale: boolean;
    ledVisible: boolean;
    frameDesign: any;
    backgroundColor: any;
    foregroundType: any;
    pointerType: any;
    pointerColor: any;
    knobType: any;
    knobStyle: any;
    lcdColor: any;
    lcdDecimals: number;
    digitalFont: boolean;
    tickLabelOrientation: any;
    labelNumberFormat: any;
    thresholdVisible: boolean;
    frameVisible: boolean;
    maxValue: number;
    minMeasuredValueVisible: boolean;
    maxMeasuredValueVisible: boolean;
    titleString: string;
    unitString: string;
    trendVisible: boolean;
    section: Array<any>;
    fractionalScaleDecimals: number;
    size: number;
    useSectionColors: boolean;
    pointerTypeLatest: any;
    pointerTypeAverage: any;
    pointerColorAverage: any;
    degreeScale: boolean;
    pointSymbols: any;
    roseVisible: boolean;
    lcdTitleStrings: Array<any>;
    useColorLabels: boolean;
    useSections: boolean;
    userLedVisible: boolean;
    userLedColor: any;
    maxMinVisible: boolean;
}
export interface ImeteoParameterList {
    barometer: number;
    cumulusBase: number;
    dailyRain: number;
    dayavgatemp: number;
    dayavgbarom: number;
    dayavgdewpt: number;
    dayavghumid: number;
    dayavgtemp: number;
    dayavgwind: number;
    dayWindRoseList: number[];
    daywindrun: number;
    ET: number;
    extraTemp1: number;
    hiBarometer: number;
    hiBarometerTime: string;
    hiDewpoint: number;
    hiDewpointTime: string;
    hiHumidity: number;
    hiHumTime: number;
    hiMonthlyaTemp: number;
    hiMonthlyBarometer: number;
    hiMonthlyDewpoint: number;
    hiMonthlyHumidity: number;
    hiMonthlyOutsideTemp: number;
    hiMonthlyRadiation: number;
    hiMonthlyRainRate: number;
    hiMonthlyUV: number;
    hiMonthlyWindSpeed: number;
    hiOutsideATemp: number;
    hiOutsideATempTime: string;
    hiOutsideTemp: number;
    hiOutsideTempTime: string;
    hiRadiation: number;
    hiRadiationTime: string;
    hiRainRate: number;
    hiRainRateTime: string;
    hiUV: number;
    hiUVTime: string;
    hiWindSpeed: number;
    hiWindSpeedTime: string;
    hiYearlyaTemp: number;
    hiYearlyBarometer: number;
    hiYearlyDewpoint: number;
    hiYearlyHumidity: number;
    hiYearlyOutsideTemp: number;
    hiYearlyRadiation: number;
    hiYearlyRainRate: number;
    hiYearlyUV: number;
    hiYearlyWindSpeed: number;
    houravgatemp: number;
    houravgbarom: number;
    houravgdewpt: number;
    houravghumid: number;
    houravgtemp: number;
    houravgwind: number;
    hourchangeatemp: number;
    hourchangebarom: number;
    hourchangedewpt: number;
    hourchangehumid: number;
    hourchangetemp: number;
    hourchangewind: number;
    hourchangewinddir: number;
    hourdomwinddir: number;
    hourrain: number;
    insideTemp: number;
    insideHumidity: number;
    intervalAvgBeaufortScale: string;
    lowBarometer: number;
    lowBarometerTime: string;
    lowDewpoint: number;
    lowDewpointTime: string;
    lowHumidity: number;
    lowHumTime: number;
    lowMonthlyaTemp: number;
    lowMonthlyBarometer: number;
    lowMonthlyDewpoint: number;
    lowMonthlyHumidity: number;
    lowMonthlyOutsideTemp: number;
    lowOutsideATemp: number;
    lowOutsideATempTime: string;
    lowOutsideTemp: number;
    lowOutsideTempTime: string;
    lowYearlyaTemp: number;
    lowYearlyBarometer: number;
    lowYearlyDewpoint: number;
    lowYearlyHumidity: number;
    lowYearlyOutsideTemp: number;
    monthlyRain: number;
    monthtodateavgatemp: number;
    monthtodateavgbarom: number;
    monthtodateavgdewpt: number;
    monthtodateavghumid: number;
    monthtodateavgtemp: number;
    monthtodateavgwind: number;
    monthtodatedomwinddir: number;
    monthtodatemaxatempdate: string;
    monthtodatemaxbaromdate: string;
    monthtodatemaxdewptdate: string;
    monthtodatemaxgustdate: string;
    monthtodatemaxhumiddate: string;
    monthtodatemaxrainratedate: string;
    monthtodatemaxtempdate: string;
    monthtodatemaxwinddate: string;
    monthtodateminatempdate: string;
    monthtodateminbaromdate: string;
    monthtodatemindewptdate: string;
    monthtodateminhumiddate: string;
    monthtodatemintempdate: string;
    outsideHumidity: number;
    outsideDewPt: number;
    outsideTemp: number;
    rainRate: number;
    solarRad: number;
    stationDate: string;
    stationTimeNoSecs: string;
    stormRain: number;
    stormStart: number;
    tenMinuteAvgWindSpeed: number;
    tenMinuteWindGust: number;
    totalRain: number;
    twoMinuteAvgWindSpeed: number;
    UV: number;
    windDirectionDegrees: number;
    WinddirtenMinuteWindGust: number;
    windGustDirectionDegrees: number;
    windGustSpeed: number;
    windSpeed: number;
    yeartodateavgatemp: number;
    yeartodateavgbarom: number;
    yeartodateavgdewpt: number;
    yeartodateavghumid: number;
    yeartodateavgtemp: number;
    yeartodateavgwind: number;
    yeartodatedomwinddir: number;
    yeartodatemaxatempdate: string;
    yeartodatemaxbaromdate: string;
    yeartodatemaxdewptdate: string;
    yeartodatemaxgustdate: string;
    yeartodatemaxhumiddate: string;
    yeartodatemaxrainratedate: string;
    yeartodatemaxtempdate: string;
    yeartodatemaxwinddate: string;
    yeartodateminatempdate: string;
    yeartodateminbaromdate: string;
    yeartodatemindewptdate: string;
    yeartodateminhumiddate: string;
    yeartodatemintempdate: string;
}
