function Delegate() {}
Delegate.create = function(o, f) {
    var a = [],
        i, l = arguments.length;
    for (i = 2; i < l; i++) {
        a[i - 2] = arguments[i]
    }
    return function() {
        var aP = [].concat(arguments, a);
        f.apply(o, aP)
    }
};
var Tween = function(obj, prop, func, begin, finish, duration, suffixe) {
    this.init(obj, prop, func, begin, finish, duration, suffixe)
};
var t = Tween.prototype;
t.obj = {};
t.prop = "";
t.func = function(t, b, c, d) {
    return c * t / d + b
};
t.begin = 0;
t.change = 0;
t.prevTime = 0;
t.prevPos = 0;
t.looping = false;
t._duration = 0;
t._time = 0;
t._pos = 0;
t._position = 0;
t._startTime = 0;
t._finish = 0;
t.name = "";
t.suffixe = "";
t._listeners = [];
t.setTime = function(t) {
    this.prevTime = this._time;
    if (t > this.getDuration()) {
        if (this.looping) {
            this.rewind(t - this._duration);
            this.update();
            this.broadcastMessage("onMotionLooped", {
                target: this,
                type: "onMotionLooped"
            })
        } else {
            this._time = this._duration;
            this.update();
            this.stop();
            this.broadcastMessage("onMotionFinished", {
                target: this,
                type: "onMotionFinished"
            })
        }
    } else if (t < 0) {
        this.rewind();
        this.update()
    } else {
        this._time = t;
        this.update()
    }
};
t.getTime = function() {
    return this._time
};
t.setDuration = function(d) {
    this._duration = d === null || d <= 0 ? 1e5 : d
};
t.getDuration = function() {
    return this._duration
};
t.setPosition = function(p) {
    this.prevPos = this._pos;
    var a = this.suffixe !== "" ? this.suffixe : "";
    this.obj[this.prop] = Math.round(p) + a;
    this._pos = p;
    this.broadcastMessage("onMotionChanged", {
        target: this,
        type: "onMotionChanged"
    })
};
t.getPosition = function(t) {
    if (t === undefined) {
        t = this._time
    }
    return this.func(t, this.begin, this.change, this._duration)
};
t.setFinish = function(f) {
    this.change = f - this.begin
};
t.getFinish = function() {
    return this.begin + this.change
};
t.init = function(obj, prop, func, begin, finish, duration, suffixe) {
    if (!arguments.length) {
        return
    }
    this._listeners = [];
    this.addListener(this);
    if (suffixe) {
        this.suffixe = suffixe
    }
    this.obj = obj;
    this.prop = prop;
    this.begin = begin;
    this._pos = begin;
    this.setDuration(duration);
    if (func !== null && func !== "") {
        this.func = func
    }
    this.setFinish(finish)
};
t.start = function() {
    this.rewind();
    this.startEnterFrame();
    this.broadcastMessage("onMotionStarted", {
        target: this,
        type: "onMotionStarted"
    })
};
t.rewind = function(t) {
    this.stop();
    this._time = t === undefined ? 0 : t;
    this.fixTime();
    this.update()
};
t.fforward = function() {
    this._time = this._duration;
    this.fixTime();
    this.update()
};
t.update = function() {
    this.setPosition(this.getPosition(this._time))
};
t.startEnterFrame = function() {
    this.stopEnterFrame();
    this.isPlaying = true;
    this.onEnterFrame()
};
t.onEnterFrame = function() {
    if (this.isPlaying) {
        this.nextFrame();
        setTimeout(Delegate.create(this, this.onEnterFrame), 25)
    }
};
t.nextFrame = function() {
    this.setTime((this.getTimer() - this._startTime) / 1e3)
};
t.stop = function() {
    this.stopEnterFrame();
    this.broadcastMessage("onMotionStopped", {
        target: this,
        type: "onMotionStopped"
    })
};
t.stopEnterFrame = function() {
    this.isPlaying = false
};
t.playing = function() {
    return this.isPlaying
};
t.continueTo = function(finish, duration) {
    this.begin = this._pos;
    this.setFinish(finish);
    if (this._duration !== undefined) {
        this.setDuration(duration)
    }
    this.start()
};
t.resume = function() {
    this.fixTime();
    this.startEnterFrame();
    this.broadcastMessage("onMotionResumed", {
        target: this,
        type: "onMotionResumed"
    })
};
t.yoyo = function() {
    this.continueTo(this.begin, this._time)
};
t.addListener = function(o) {
    this.removeListener(o);
    return this._listeners.push(o)
};
t.removeListener = function(o) {
    var a = this._listeners,
        i = a.length;
    while (i--) {
        if (a[i] === o) {
            a.splice(i, 1);
            return true
        }
    }
    return false
};
t.broadcastMessage = function() {
    var arr = [],
        i, e, a = this._listeners,
        l = a.length;
    for (i = 0; i < arguments.length; i++) {
        arr.push(arguments[i])
    }
    e = arr.shift();
    for (i = 0; i < l; i++) {
        if (a[i][e]) {
            a[i][e].apply(a[i], arr)
        }
    }
};
t.fixTime = function() {
    this._startTime = this.getTimer() - this._time * 1e3
};
t.getTimer = function() {
    return (new Date).getTime() - this._time
};
Tween.backEaseIn = function(t, b, c, d, a, p) {
    var s = 1.70158;
    return c * (t /= d) * t * ((s + 1) * t - s) + b
};
Tween.backEaseOut = function(t, b, c, d, a, p) {
    var s = 1.70158;
    return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b
};
Tween.backEaseInOut = function(t, b, c, d, a, p) {
    var s = 1.70158;
    if ((t /= d / 2) < 1) {
        return c / 2 * (t * t * (((s *= 1.525) + 1) * t - s)) + b
    }
    return c / 2 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b
};
Tween.elasticEaseIn = function(t, b, c, d, a, p) {
    var s;
    if (t === 0) {
        return b
    }
    if ((t /= d) === 1) {
        return b + c
    }
    if (!p) {
        p = d * .3
    }
    if (!a || a < Math.abs(c)) {
        a = c;
        s = p / 4
    } else {
        s = p / (2 * Math.PI) * Math.asin(c / a)
    }
    return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b
};
Tween.elasticEaseOut = function(t, b, c, d, a, p) {
    var s;
    if (t === 0) {
        return b
    }
    if ((t /= d) === 1) {
        return b + c
    }
    if (!p) {
        p = d * .3
    }
    if (!a || a < Math.abs(c)) {
        a = c;
        s = p / 4
    } else {
        s = p / (2 * Math.PI) * Math.asin(c / a)
    }
    return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b
};
Tween.elasticEaseInOut = function(t, b, c, d, a, p) {
    var s;
    if (t === 0) {
        return b
    }
    if ((t /= d / 2) === 2) {
        return b + c
    }
    if (!p) {
        p = d * (.3 * 1.5)
    }
    if (!a || a < Math.abs(c)) {
        a = c;
        s = p / 4
    } else {
        s = p / (2 * Math.PI) * Math.asin(c / a)
    }
    if (t < 1) {
        return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b
    }
    return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b
};
Tween.bounceEaseOut = function(t, b, c, d) {
    if ((t /= d) < 1 / 2.75) {
        return c * (7.5625 * t * t) + b
    } else if (t < 2 / 2.75) {
        return c * (7.5625 * (t -= 1.5 / 2.75) * t + .75) + b
    } else if (t < 2.5 / 2.75) {
        return c * (7.5625 * (t -= 2.25 / 2.75) * t + .9375) + b
    } else {
        return c * (7.5625 * (t -= 2.625 / 2.75) * t + .984375) + b
    }
};
Tween.bounceEaseIn = function(t, b, c, d) {
    return c - Tween.bounceEaseOut(d - t, 0, c, d) + b
};
Tween.bounceEaseInOut = function(t, b, c, d) {
    if (t < d / 2) {
        return Tween.bounceEaseIn(t * 2, 0, c, d) * .5 + b
    } else {
        return Tween.bounceEaseOut(t * 2 - d, 0, c, d) * .5 + c * .5 + b
    }
};
Tween.strongEaseInOut = function(t, b, c, d) {
    return c * (t /= d) * t * t * t * t + b
};
Tween.regularEaseIn = function(t, b, c, d) {
    return c * (t /= d) * t + b
};
Tween.regularEaseOut = function(t, b, c, d) {
    return -c * (t /= d) * (t - 2) + b
};
Tween.regularEaseInOut = function(t, b, c, d) {
    if ((t /= d / 2) < 1) {
        return c / 2 * t * t + b
    }
    return -c / 2 * (--t * (t - 2) - 1) + b
};
Tween.strongEaseIn = function(t, b, c, d) {
    return c * (t /= d) * t * t * t * t + b
};
Tween.strongEaseOut = function(t, b, c, d) {
    return c * ((t = t / d - 1) * t * t * t * t + 1) + b
};
Tween.strongEaseInOut = function(t, b, c, d) {
    if ((t /= d / 2) < 1) {
        return c / 2 * t * t * t * t * t + b
    }
    return c / 2 * ((t -= 2) * t * t * t * t + 2) + b
};
var steelseries = function() {
    var HALF_PI = Math.PI * .5,
        TWO_PI = Math.PI * 2,
        PI = Math.PI,
        RAD_FACTOR = Math.PI / 180,
        DEG_FACTOR = 180 / Math.PI,
        doc = document,
        lcdFontName = "LCDMono2Ultra,Arial,Verdana,sans-serif",
        stdFontName = "Arial,Verdana,sans-serif";
    var radial = function(canvas, parameters) {
        parameters = parameters || {};
        var gaugeType = undefined === parameters.gaugeType ? steelseries.GaugeType.TYPE4 : parameters.gaugeType,
            size = undefined === parameters.size ? 0 : parameters.size,
            minValue = undefined === parameters.minValue ? 0 : parameters.minValue,
            maxValue = undefined === parameters.maxValue ? minValue + 100 : parameters.maxValue,
            niceScale = undefined === parameters.niceScale ? true : parameters.niceScale,
            threshold = undefined === parameters.threshold ? (maxValue - minValue) / 2 + minValue : parameters.threshold,
            thresholdRising = undefined === parameters.thresholdRising ? true : parameters.thresholdRising,
            section = undefined === parameters.section ? null : parameters.section,
            area = undefined === parameters.area ? null : parameters.area,
            titleString = undefined === parameters.titleString ? "" : parameters.titleString,
            unitString = undefined === parameters.unitString ? "" : parameters.unitString,
            frameDesign = undefined === parameters.frameDesign ? steelseries.FrameDesign.METAL : parameters.frameDesign,
            frameVisible = undefined === parameters.frameVisible ? true : parameters.frameVisible,
            backgroundColor = undefined === parameters.backgroundColor ? steelseries.BackgroundColor.DARK_GRAY : parameters.backgroundColor,
            backgroundVisible = undefined === parameters.backgroundVisible ? true : parameters.backgroundVisible,
            pointerType = undefined === parameters.pointerType ? steelseries.PointerType.TYPE1 : parameters.pointerType,
            pointerColor = undefined === parameters.pointerColor ? steelseries.ColorDef.RED : parameters.pointerColor,
            knobType = undefined === parameters.knobType ? steelseries.KnobType.STANDARD_KNOB : parameters.knobType,
            knobStyle = undefined === parameters.knobStyle ? steelseries.KnobStyle.SILVER : parameters.knobStyle,
            lcdColor = undefined === parameters.lcdColor ? steelseries.LcdColor.STANDARD : parameters.lcdColor,
            lcdVisible = undefined === parameters.lcdVisible ? true : parameters.lcdVisible,
            lcdDecimals = undefined === parameters.lcdDecimals ? 2 : parameters.lcdDecimals,
            digitalFont = undefined === parameters.digitalFont ? false : parameters.digitalFont,
            fractionalScaleDecimals = undefined === parameters.fractionalScaleDecimals ? 1 : parameters.fractionalScaleDecimals,
            ledColor = undefined === parameters.ledColor ? steelseries.LedColor.RED_LED : parameters.ledColor,
            ledVisible = undefined === parameters.ledVisible ? true : parameters.ledVisible,
            userLedColor = undefined === parameters.userLedColor ? steelseries.LedColor.GREEN_LED : parameters.userLedColor,
            userLedVisible = undefined === parameters.userLedVisible ? false : parameters.userLedVisible,
            thresholdVisible = undefined === parameters.thresholdVisible ? true : parameters.thresholdVisible,
            minMeasuredValueVisible = undefined === parameters.minMeasuredValueVisible ? false : parameters.minMeasuredValueVisible,
            maxMeasuredValueVisible = undefined === parameters.maxMeasuredValueVisible ? false : parameters.maxMeasuredValueVisible,
            foregroundType = undefined === parameters.foregroundType ? steelseries.ForegroundType.TYPE1 : parameters.foregroundType,
            foregroundVisible = undefined === parameters.foregroundVisible ? true : parameters.foregroundVisible,
            labelNumberFormat = undefined === parameters.labelNumberFormat ? steelseries.LabelNumberFormat.STANDARD : parameters.labelNumberFormat,
            playAlarm = undefined === parameters.playAlarm ? false : parameters.playAlarm,
            alarmSound = undefined === parameters.alarmSound ? false : parameters.alarmSound,
            customLayer = undefined === parameters.customLayer ? null : parameters.customLayer,
            tickLabelOrientation = undefined === parameters.tickLabelOrientation ? gaugeType === steelseries.GaugeType.TYPE1 ? steelseries.TickLabelOrientation.TANGENT : steelseries.TickLabelOrientation.NORMAL : parameters.tickLabelOrientation,
            trendVisible = undefined === parameters.trendVisible ? false : parameters.trendVisible,
            trendColors = undefined === parameters.trendColors ? [steelseries.LedColor.RED_LED, steelseries.LedColor.GREEN_LED, steelseries.LedColor.CYAN_LED] : parameters.trendColors,
            useOdometer = undefined === parameters.useOdometer ? false : parameters.useOdometer,
            odometerParams = undefined === parameters.odometerParams ? {} : parameters.odometerParams,
            odometerUseValue = undefined === parameters.odometerUseValue ? false : parameters.odometerUseValue,
            fullScaleDeflectionTime = undefined === parameters.fullScaleDeflectionTime ? 2.5 : parameters.fullScaleDeflectionTime;
        var mainCtx = getCanvasContext(canvas);
        if (size === 0) {
            size = Math.min(mainCtx.canvas.width, mainCtx.canvas.height)
        }
        mainCtx.canvas.width = size;
        mainCtx.canvas.height = size;
        var audioElement;
        if (playAlarm && alarmSound !== false) {
            audioElement = doc.createElement("audio");
            audioElement.setAttribute("src", alarmSound);
            audioElement.setAttribute("preload", "auto")
        }
        var value = minValue;
        var odoValue = minValue;
        var self = this;
        var minMeasuredValue = maxValue;
        var maxMeasuredValue = minValue;
        var ledBlinking = false;
        var userLedBlinking = false;
        var ledTimerId = 0;
        var userLedTimerId = 0;
        var tween;
        var repainting = false;
        var trendIndicator = steelseries.TrendState.OFF;
        var trendSize = size * .06;
        var trendPosX = size * .29;
        var trendPosY = size * .36;
        var freeAreaAngle;
        var rotationOffset;
        var tickmarkOffset;
        var angleRange;
        var angleStep;
        var angle = rotationOffset + (value - minValue) * angleStep;
        var imageWidth = size;
        var imageHeight = size;
        var centerX = imageWidth / 2;
        var centerY = imageHeight / 2;
        var ledSize = size * .093457;
        var ledPosX = .6 * imageWidth;
        var ledPosY = .4 * imageHeight;
        var userLedPosX = gaugeType === steelseries.GaugeType.TYPE3 ? .6 * imageWidth : centerX - ledSize / 2;
        var userLedPosY = gaugeType === steelseries.GaugeType.TYPE3 ? .72 * imageHeight : .75 * imageHeight;
        var lcdFontHeight = Math.floor(imageWidth / 10);
        var stdFont = lcdFontHeight + "px " + stdFontName;
        var lcdFont = lcdFontHeight + "px " + lcdFontName;
        var lcdHeight = imageHeight * .13;
        var lcdWidth = imageWidth * .4;
        var lcdPosX = (imageWidth - lcdWidth) / 2;
        var lcdPosY = imageHeight * .57;
        var odoPosX, odoPosY = imageHeight * .61;
        var shadowOffset = imageWidth * .006;
        var initialized = false;
        var niceMinValue = minValue;
        var niceMaxValue = maxValue;
        var niceRange = maxValue - minValue;
        var range = niceMaxValue - niceMinValue;
        var minorTickSpacing = 0;
        var majorTickSpacing = 0;
        var maxNoOfMinorTicks = 10;
        var maxNoOfMajorTicks = 10;
        var calculate = function calculate() {
            if (niceScale) {
                niceRange = calcNiceNumber(maxValue - minValue, false);
                majorTickSpacing = calcNiceNumber(niceRange / (maxNoOfMajorTicks - 1), true);
                niceMinValue = Math.floor(minValue / majorTickSpacing) * majorTickSpacing;
                niceMaxValue = Math.ceil(maxValue / majorTickSpacing) * majorTickSpacing;
                minorTickSpacing = calcNiceNumber(majorTickSpacing / (maxNoOfMinorTicks - 1), true);
                minValue = niceMinValue;
                maxValue = niceMaxValue;
                range = maxValue - minValue
            } else {
                niceRange = maxValue - minValue;
                niceMinValue = minValue;
                niceMaxValue = maxValue;
                range = niceRange;
                majorTickSpacing = calcNiceNumber(niceRange / (maxNoOfMajorTicks - 1), true);
                minorTickSpacing = calcNiceNumber(majorTickSpacing / (maxNoOfMinorTicks - 1), true)
            }
            switch (gaugeType.type) {
                case "type1":
                    freeAreaAngle = 0;
                    rotationOffset = PI;
                    tickmarkOffset = HALF_PI;
                    angleRange = HALF_PI;
                    angleStep = angleRange / range;
                    break;
                case "type2":
                    freeAreaAngle = 0;
                    rotationOffset = PI;
                    tickmarkOffset = HALF_PI;
                    angleRange = PI;
                    angleStep = angleRange / range;
                    break;
                case "type3":
                    freeAreaAngle = 0;
                    rotationOffset = HALF_PI;
                    tickmarkOffset = 0;
                    angleRange = 1.5 * PI;
                    angleStep = angleRange / range;
                    break;
                case "type4":
                default:
                    freeAreaAngle = 60 * RAD_FACTOR;
                    rotationOffset = HALF_PI + freeAreaAngle / 2;
                    tickmarkOffset = 0;
                    angleRange = TWO_PI - freeAreaAngle;
                    angleStep = angleRange / range;
                    break
            }
            angle = rotationOffset + (value - minValue) * angleStep
        };
        var frameBuffer = createBuffer(size, size);
        var frameContext = frameBuffer.getContext("2d");
        var backgroundBuffer = createBuffer(size, size);
        var backgroundContext = backgroundBuffer.getContext("2d");
        var lcdBuffer;
        var ledBufferOn = createBuffer(ledSize, ledSize);
        var ledContextOn = ledBufferOn.getContext("2d");
        var ledBufferOff = createBuffer(ledSize, ledSize);
        var ledContextOff = ledBufferOff.getContext("2d");
        var ledBuffer = ledBufferOff;
        var userLedBufferOn = createBuffer(ledSize, ledSize);
        var userLedContextOn = userLedBufferOn.getContext("2d");
        var userLedBufferOff = createBuffer(ledSize, ledSize);
        var userLedContextOff = userLedBufferOff.getContext("2d");
        var userLedBuffer = userLedBufferOff;
        var minMeasuredValueBuffer = createBuffer(Math.ceil(size * .028037), Math.ceil(size * .028037));
        var minMeasuredValueCtx = minMeasuredValueBuffer.getContext("2d");
        var maxMeasuredValueBuffer = createBuffer(Math.ceil(size * .028037), Math.ceil(size * .028037));
        var maxMeasuredValueCtx = maxMeasuredValueBuffer.getContext("2d");
        var pointerBuffer = createBuffer(size, size);
        var pointerContext = pointerBuffer.getContext("2d");
        var foregroundBuffer = createBuffer(size, size);
        var foregroundContext = foregroundBuffer.getContext("2d");
        var trendUpBuffer, trendSteadyBuffer, trendDownBuffer, trendOffBuffer;
        var odoGauge, odoBuffer, odoContext;
        if (useOdometer && lcdVisible) {
            odoBuffer = createBuffer(10, 10);
            odoContext = odoBuffer.getContext("2d")
        }
        var drawLcdText = function(ctx, value) {
            ctx.restore();
            ctx.save();
            ctx.textAlign = "right";
            ctx.strokeStyle = lcdColor.textColor;
            ctx.fillStyle = lcdColor.textColor;
            if (lcdColor === steelseries.LcdColor.STANDARD || lcdColor === steelseries.LcdColor.STANDARD_GREEN) {
                ctx.shadowColor = "gray";
                ctx.shadowOffsetX = imageWidth * .007;
                ctx.shadowOffsetY = imageWidth * .007;
                ctx.shadowBlur = imageWidth * .007
            }
            if (digitalFont) {
                ctx.font = lcdFont
            } else {
                ctx.font = stdFont
            }
            ctx.fillText(value.toLocaleString("pt-PT", {
                maximumFractionDigits: lcdDecimals,
                minimumFractionDigits: lcdDecimals
            }), lcdPosX + lcdWidth - lcdWidth * .05, lcdPosY + lcdHeight * .5 + lcdFontHeight * .38, lcdWidth * .9);
            ctx.restore()
        };
        var drawPostsImage = function(ctx) {
            ctx.save();
            if ("type1" === gaugeType.type) {
                ctx.drawImage(createKnobImage(Math.ceil(imageHeight * .037383), steelseries.KnobType.STANDARD_KNOB, knobStyle), imageWidth * .523364, imageHeight * .130841)
            }
            if ("type1" === gaugeType.type || "type2" === gaugeType.type) {
                ctx.drawImage(createKnobImage(Math.ceil(imageHeight * .037383), steelseries.KnobType.STANDARD_KNOB, knobStyle), imageWidth * .130841, imageHeight * .514018)
            }
            if ("type2" === gaugeType.type || "type3" === gaugeType.type) {
                ctx.drawImage(createKnobImage(Math.ceil(imageHeight * .037383), steelseries.KnobType.STANDARD_KNOB, knobStyle), imageWidth * .831775, imageHeight * .514018)
            }
            if ("type3" === gaugeType.type) {
                ctx.drawImage(createKnobImage(Math.ceil(imageHeight * .037383), steelseries.KnobType.STANDARD_KNOB, knobStyle), imageWidth * .523364, imageHeight * .831775)
            }
            if ("type4" === gaugeType.type) {
                ctx.drawImage(createKnobImage(Math.ceil(imageHeight * .037383), steelseries.KnobType.STANDARD_KNOB, knobStyle), imageWidth * .336448, imageHeight * .803738);
                ctx.drawImage(createKnobImage(Math.ceil(imageHeight * .037383), steelseries.KnobType.STANDARD_KNOB, knobStyle), imageWidth * .626168, imageHeight * .803738)
            }
            ctx.restore()
        };
        var createThresholdImage = function() {
            var thresholdBuffer = doc.createElement("canvas");
            thresholdBuffer.width = Math.ceil(size * .046728);
            thresholdBuffer.height = Math.ceil(thresholdBuffer.width * .9);
            var thresholdCtx = thresholdBuffer.getContext("2d");
            thresholdCtx.save();
            var gradThreshold = thresholdCtx.createLinearGradient(0, .1, 0, thresholdBuffer.height * .9);
            gradThreshold.addColorStop(0, "#520000");
            gradThreshold.addColorStop(.3, "#fc1d00");
            gradThreshold.addColorStop(.59, "#fc1d00");
            gradThreshold.addColorStop(1, "#520000");
            thresholdCtx.fillStyle = gradThreshold;
            thresholdCtx.beginPath();
            thresholdCtx.moveTo(thresholdBuffer.width * .5, .1);
            thresholdCtx.lineTo(thresholdBuffer.width * .9, thresholdBuffer.height * .9);
            thresholdCtx.lineTo(thresholdBuffer.width * .1, thresholdBuffer.height * .9);
            thresholdCtx.lineTo(thresholdBuffer.width * .5, .1);
            thresholdCtx.closePath();
            thresholdCtx.fill();
            thresholdCtx.strokeStyle = "#FFFFFF";
            thresholdCtx.stroke();
            thresholdCtx.restore();
            return thresholdBuffer
        };
        var drawAreaSectionImage = function(ctx, start, stop, color, filled) {
            if (start < minValue) {
                start = minValue
            } else if (start > maxValue) {
                start = maxValue
            }
            if (stop < minValue) {
                stop = minValue
            } else if (stop > maxValue) {
                stop = maxValue
            }
            if (start >= stop) {
                return
            }
            ctx.save();
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.lineWidth = imageWidth * .035;
            var startAngle = angleRange / range * start - angleRange / range * minValue;
            var stopAngle = startAngle + (stop - start) / (range / angleRange);
            ctx.translate(centerX, centerY);
            ctx.rotate(rotationOffset);
            ctx.beginPath();
            if (filled) {
                ctx.moveTo(0, 0);
                ctx.arc(0, 0, imageWidth * .365 - ctx.lineWidth / 2, startAngle, stopAngle, false)
            } else {
                ctx.arc(0, 0, imageWidth * .365, startAngle, stopAngle, false)
            }
            if (filled) {
                ctx.moveTo(0, 0);
                ctx.fill()
            } else {
                ctx.stroke()
            }
            ctx.translate(-centerX, -centerY);
            ctx.restore()
        };
        var drawTickmarksImage = function(ctx, labelNumberFormat) {
            var fontSize = Math.ceil(imageWidth * .04),
                alpha = rotationOffset,
                rotationStep = angleStep * minorTickSpacing,
                textRotationAngle, valueCounter = minValue,
                majorTickCounter = maxNoOfMinorTicks - 1,
                OUTER_POINT = imageWidth * .38,
                MAJOR_INNER_POINT = imageWidth * .35,
                MED_INNER_POINT = imageWidth * .355,
                MINOR_INNER_POINT = imageWidth * .36,
                TEXT_TRANSLATE_X = imageWidth * .3,
                TEXT_WIDTH = imageWidth * .1,
                HALF_MAX_NO_OF_MINOR_TICKS = maxNoOfMinorTicks / 2,
                MAX_VALUE_ROUNDED = parseFloat(maxValue.toFixed(2)),
                i;
            backgroundColor.labelColor.setAlpha(1);
            ctx.save();
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = fontSize + "px " + stdFontName;
            ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor();
            ctx.fillStyle = backgroundColor.labelColor.getRgbaColor();
            ctx.translate(centerX, centerY);
            ctx.rotate(rotationOffset);
            if (gaugeType.type === "type1" || gaugeType.type === "type2") {
                TEXT_WIDTH = imageWidth * .04
            }
            for (i = minValue; parseFloat(i.toFixed(2)) <= MAX_VALUE_ROUNDED; i += minorTickSpacing) {
                textRotationAngle = rotationStep + HALF_PI;
                majorTickCounter++;
                if (majorTickCounter === maxNoOfMinorTicks) {
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(OUTER_POINT, 0);
                    ctx.lineTo(MAJOR_INNER_POINT, 0);
                    ctx.closePath();
                    ctx.stroke();
                    ctx.save();
                    ctx.translate(TEXT_TRANSLATE_X, 0);
                    switch (tickLabelOrientation.type) {
                        case "horizontal":
                            textRotationAngle = -alpha;
                            break;
                        case "tangent":
                            textRotationAngle = alpha <= HALF_PI + PI ? PI : 0;
                            break;
                        case "normal":
                        default:
                            textRotationAngle = HALF_PI;
                            break
                    }
                    ctx.rotate(textRotationAngle);
                    switch (labelNumberFormat.format) {
                        case "fractional":
                            ctx.fillText(valueCounter.toFixed(fractionalScaleDecimals), 0, 0, TEXT_WIDTH);
                            break;
                        case "scientific":
                            ctx.fillText(valueCounter.toPrecision(2), 0, 0, TEXT_WIDTH);
                            break;
                        case "standard":
                        default:
                            ctx.fillText(valueCounter.toFixed(0), 0, 0, TEXT_WIDTH);
                            break
                    }
                    ctx.translate(-TEXT_TRANSLATE_X, 0);
                    ctx.restore();
                    valueCounter += majorTickSpacing;
                    majorTickCounter = 0;
                    ctx.rotate(rotationStep);
                    alpha += rotationStep;
                    continue
                }
                if (0 === maxNoOfMinorTicks % 2 && majorTickCounter === HALF_MAX_NO_OF_MINOR_TICKS) {
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(OUTER_POINT, 0);
                    ctx.lineTo(MED_INNER_POINT, 0);
                    ctx.closePath();
                    ctx.stroke()
                } else {
                    ctx.lineWidth = .5;
                    ctx.beginPath();
                    ctx.moveTo(OUTER_POINT, 0);
                    ctx.lineTo(MINOR_INNER_POINT, 0);
                    ctx.closePath();
                    ctx.stroke()
                }
                ctx.rotate(rotationStep);
                alpha += rotationStep
            }
            ctx.translate(-centerX, -centerY);
            ctx.restore()
        };
        var init = function(parameters) {
            parameters = parameters || {};
            var drawFrame = undefined === parameters.frame ? false : parameters.frame;
            var drawBackground = undefined === parameters.background ? false : parameters.background;
            var drawLed = undefined === parameters.led ? false : parameters.led;
            var drawUserLed = undefined === parameters.userLed ? false : parameters.userLed;
            var drawPointer = undefined === parameters.pointer ? false : parameters.pointer;
            var drawForeground = undefined === parameters.foreground ? false : parameters.foreground;
            var drawTrend = undefined === parameters.trend ? false : parameters.trend;
            var drawOdo = undefined === parameters.odo ? false : parameters.odo;
            initialized = true;
            calculate();
            if (drawFrame && frameVisible) {
                drawRadialFrameImage(frameContext, frameDesign, centerX, centerY, imageWidth, imageHeight)
            }
            if (drawBackground && backgroundVisible) {
                drawRadialBackgroundImage(backgroundContext, backgroundColor, centerX, centerY, imageWidth, imageHeight);
                drawRadialCustomImage(backgroundContext, customLayer, centerX, centerY, imageWidth, imageHeight)
            }
            if (drawLed) {
                ledContextOn.drawImage(createLedImage(Math.ceil(size * .093457), 1, ledColor), 0, 0);
                ledContextOff.drawImage(createLedImage(Math.ceil(size * .093457), 0, ledColor), 0, 0)
            }
            if (drawUserLed) {
                userLedContextOn.drawImage(createLedImage(Math.ceil(size * .093457), 1, userLedColor), 0, 0);
                userLedContextOff.drawImage(createLedImage(Math.ceil(size * .093457), 0, userLedColor), 0, 0)
            }
            if (minMeasuredValueVisible) {
                minMeasuredValueCtx.drawImage(createMeasuredValueImage(Math.ceil(size * .028037), steelseries.ColorDef.BLUE.dark.getRgbaColor(), true, true), 0, 0)
            }
            if (maxMeasuredValueVisible) {
                maxMeasuredValueCtx.drawImage(createMeasuredValueImage(Math.ceil(size * .028037), steelseries.ColorDef.RED.medium.getRgbaColor(), true), 0, 0)
            }
            if (drawBackground && backgroundVisible) {
                drawPostsImage(backgroundContext);
                if (null !== section && 0 < section.length) {
                    var sectionIndex = section.length;
                    do {
                        sectionIndex--;
                        drawAreaSectionImage(backgroundContext, section[sectionIndex].start, section[sectionIndex].stop, section[sectionIndex].color, false)
                    } while (0 < sectionIndex)
                }
                if (null !== area && 0 < area.length) {
                    var areaIndex = area.length;
                    do {
                        areaIndex--;
                        drawAreaSectionImage(backgroundContext, area[areaIndex].start, area[areaIndex].stop, area[areaIndex].color, true)
                    } while (0 < areaIndex)
                }
                drawTickmarksImage(backgroundContext, labelNumberFormat);
                drawTitleImage(backgroundContext, imageWidth, imageHeight, titleString, unitString, backgroundColor, true, true)
            }
            if (drawBackground && thresholdVisible) {
                backgroundContext.save();
                backgroundContext.translate(centerX, centerY);
                backgroundContext.rotate(rotationOffset + (threshold - minValue) * angleStep + HALF_PI);
                backgroundContext.translate(-centerX, -centerY);
                backgroundContext.drawImage(createThresholdImage(), imageWidth * .475, imageHeight * .13);
                backgroundContext.translate(centerX, centerY);
                backgroundContext.restore()
            }
            if (drawBackground && lcdVisible) {
                if (useOdometer && drawOdo) {
                    odoGauge = new steelseries.Odometer("", {
                        _context: odoContext,
                        height: size * .075,
                        decimals: odometerParams.decimals,
                        digits: odometerParams.digits === undefined ? 5 : odometerParams.digits,
                        valueForeColor: odometerParams.valueForeColor,
                        valueBackColor: odometerParams.valueBackColor,
                        decimalForeColor: odometerParams.decimalForeColor,
                        decimalBackColor: odometerParams.decimalBackColor,
                        font: odometerParams.font,
                        value: value
                    });
                    odoPosX = (imageWidth - odoBuffer.width) / 2
                } else if (!useOdometer) {
                    lcdBuffer = createLcdBackgroundImage(lcdWidth, lcdHeight, lcdColor);
                    backgroundContext.drawImage(lcdBuffer, lcdPosX, lcdPosY)
                }
            }
            if (drawPointer) {
                drawPointerImage(pointerContext, imageWidth, pointerType, pointerColor, backgroundColor.labelColor)
            }
            if (drawForeground && foregroundVisible) {
                var knobVisible = pointerType.type === "type15" || pointerType.type === "type16" ? false : true;
                drawRadialForegroundImage(foregroundContext, foregroundType, imageWidth, imageHeight, knobVisible, knobType, knobStyle, gaugeType)
            }
            if (drawTrend && trendVisible) {
                trendUpBuffer = createTrendIndicator(trendSize, steelseries.TrendState.UP, trendColors);
                trendSteadyBuffer = createTrendIndicator(trendSize, steelseries.TrendState.STEADY, trendColors);
                trendDownBuffer = createTrendIndicator(trendSize, steelseries.TrendState.DOWN, trendColors);
                trendOffBuffer = createTrendIndicator(trendSize, steelseries.TrendState.OFF, trendColors)
            }
        };
        var resetBuffers = function(buffers) {
            buffers = buffers || {};
            var resetFrame = undefined === buffers.frame ? false : buffers.frame;
            var resetBackground = undefined === buffers.background ? false : buffers.background;
            var resetLed = undefined === buffers.led ? false : buffers.led;
            var resetUserLed = undefined === buffers.userLed ? false : buffers.userLed;
            var resetPointer = undefined === buffers.pointer ? false : buffers.pointer;
            var resetForeground = undefined === buffers.foreground ? false : buffers.foreground;
            if (resetFrame) {
                frameBuffer.width = size;
                frameBuffer.height = size;
                frameContext = frameBuffer.getContext("2d")
            }
            if (resetBackground) {
                backgroundBuffer.width = size;
                backgroundBuffer.height = size;
                backgroundContext = backgroundBuffer.getContext("2d")
            }
            if (resetLed) {
                ledBufferOn.width = Math.ceil(size * .093457);
                ledBufferOn.height = Math.ceil(size * .093457);
                ledContextOn = ledBufferOn.getContext("2d");
                ledBufferOff.width = Math.ceil(size * .093457);
                ledBufferOff.height = Math.ceil(size * .093457);
                ledContextOff = ledBufferOff.getContext("2d");
                ledBuffer = ledBufferOff
            }
            if (resetUserLed) {
                userLedBufferOn.width = Math.ceil(size * .093457);
                userLedBufferOn.height = Math.ceil(size * .093457);
                userLedContextOn = userLedBufferOn.getContext("2d");
                userLedBufferOff.width = Math.ceil(size * .093457);
                userLedBufferOff.height = Math.ceil(size * .093457);
                userLedContextOff = userLedBufferOff.getContext("2d");
                userLedBuffer = userLedBufferOff
            }
            if (resetPointer) {
                pointerBuffer.width = size;
                pointerBuffer.height = size;
                pointerContext = pointerBuffer.getContext("2d")
            }
            if (resetForeground) {
                foregroundBuffer.width = size;
                foregroundBuffer.height = size;
                foregroundContext = foregroundBuffer.getContext("2d")
            }
        };
        var toggleAndRepaintLed = function() {
            if (ledVisible) {
                if (ledBuffer === ledBufferOn) {
                    ledBuffer = ledBufferOff
                } else {
                    ledBuffer = ledBufferOn
                }
                if (!repainting) {
                    repainting = true;
                    requestAnimFrame(self.repaint)
                }
            }
        };
        var toggleAndRepaintUserLed = function() {
            if (userLedVisible) {
                if (userLedBuffer === userLedBufferOn) {
                    userLedBuffer = userLedBufferOff
                } else {
                    userLedBuffer = userLedBufferOn
                }
                if (!repainting) {
                    repainting = true;
                    requestAnimFrame(self.repaint)
                }
            }
        };
        var blink = function(blinking) {
            if (blinking) {
                ledTimerId = setInterval(toggleAndRepaintLed, 1e3)
            } else {
                clearInterval(ledTimerId);
                ledBuffer = ledBufferOff
            }
        };
        var blinkUser = function(blinking) {
            if (blinking) {
                userLedTimerId = setInterval(toggleAndRepaintUserLed, 1e3)
            } else {
                clearInterval(userLedTimerId);
                userLedBuffer = userLedBufferOff
            }
        };
        this.setValue = function(newValue) {
            newValue = parseFloat(newValue);
            var targetValue = newValue < minValue ? minValue : newValue > maxValue ? maxValue : newValue;
            if (value !== targetValue) {
                value = targetValue;
                if (value > maxMeasuredValue) {
                    maxMeasuredValue = value
                }
                if (value < minMeasuredValue) {
                    minMeasuredValue = value
                }
                if (value >= threshold && !ledBlinking && thresholdRising || value <= threshold && !ledBlinking && !thresholdRising) {
                    ledBlinking = true;
                    blink(ledBlinking);
                    if (playAlarm) {
                        audioElement.play()
                    }
                } else if (value < threshold && ledBlinking && thresholdRising || value > threshold && ledBlinking && !thresholdRising) {
                    ledBlinking = false;
                    blink(ledBlinking);
                    if (playAlarm) {
                        audioElement.pause()
                    }
                }
                this.repaint()
            }
            return this
        };
        this.getValue = function() {
            return value
        };
        this.setOdoValue = function(newValue) {
            newValue = parseFloat(newValue);
            var targetValue = newValue < 0 ? 0 : newValue;
            if (odoValue !== targetValue) {
                odoValue = targetValue;
                this.repaint()
            }
            return this
        };
        this.getOdoValue = function() {
            return odoValue
        };
        this.setValueAnimated = function(newValue, callback) {
            newValue = parseFloat(newValue);
            var targetValue = newValue < minValue ? minValue : newValue > maxValue ? maxValue : newValue,
                gauge = this,
                time;
            if (value !== targetValue) {
                if (undefined !== tween && tween.isPlaying) {
                    tween.stop()
                }
                time = fullScaleDeflectionTime * Math.abs(targetValue - value) / (maxValue - minValue);
                time = Math.max(time, fullScaleDeflectionTime / 5);
                tween = new Tween({}, "", Tween.regularEaseInOut, value, targetValue, time);
                tween.onMotionChanged = function(event) {
                    value = event.target._pos;
                    if (value >= threshold && !ledBlinking && thresholdRising || value <= threshold && !ledBlinking && !thresholdRising) {
                        ledBlinking = true;
                        blink(ledBlinking);
                        if (playAlarm) {
                            audioElement.play()
                        }
                    } else if (value < threshold && ledBlinking && thresholdRising || value > threshold && ledBlinking && !thresholdRising) {
                        ledBlinking = false;
                        blink(ledBlinking);
                        if (playAlarm) {
                            audioElement.pause()
                        }
                    }
                    if (value > maxMeasuredValue) {
                        maxMeasuredValue = value
                    }
                    if (value < minMeasuredValue) {
                        minMeasuredValue = value
                    }
                    if (!repainting) {
                        repainting = true;
                        requestAnimFrame(gauge.repaint)
                    }
                };
                if (callback && typeof callback === "function") {
                    tween.onMotionFinished = callback
                }
                tween.start()
            }
            return this
        };
        this.resetMinMeasuredValue = function() {
            minMeasuredValue = value;
            this.repaint()
        };
        this.resetMaxMeasuredValue = function() {
            maxMeasuredValue = value;
            this.repaint();
            return this
        };
        this.setMinMeasuredValueVisible = function(visible) {
            minMeasuredValueVisible = !!visible;
            this.repaint();
            return this
        };
        this.setMaxMeasuredValueVisible = function(visible) {
            maxMeasuredValueVisible = !!visible;
            this.repaint();
            return this
        };
        this.setMaxMeasuredValue = function(newValue) {
            newValue = parseFloat(newValue);
            var targetValue = newValue < minValue ? minValue : newValue > maxValue ? maxValue : newValue;
            maxMeasuredValue = targetValue;
            this.repaint();
            return this
        };
        this.setMinMeasuredValue = function(newValue) {
            newValue = parseFloat(newValue);
            var targetValue = newValue < minValue ? minValue : newValue > maxValue ? maxValue : newValue;
            minMeasuredValue = targetValue;
            this.repaint();
            return this
        };
        this.setTitleString = function(title) {
            titleString = title;
            resetBuffers({
                background: true
            });
            init({
                background: true
            });
            this.repaint();
            return this
        };
        this.setUnitString = function(unit) {
            unitString = unit;
            resetBuffers({
                background: true
            });
            init({
                background: true
            });
            this.repaint();
            return this
        };
        this.setMinValue = function(value) {
            minValue = parseFloat(value);
            resetBuffers({
                frame: true,
                background: true
            });
            init({
                frame: true,
                background: true
            });
            this.repaint();
            return this
        };
        this.getMinValue = function() {
            return minValue
        };
        this.setMaxValue = function(value) {
            maxValue = parseFloat(value);
            resetBuffers({
                frame: true,
                background: true
            });
            init({
                frame: true,
                background: true
            });
            this.repaint();
            return this
        };
        this.getMaxValue = function() {
            return maxValue
        };
        this.setThreshold = function(newValue) {
            newValue = parseFloat(newValue);
            var targetValue = newValue < minValue ? minValue : newValue > maxValue ? maxValue : newValue;
            threshold = targetValue;
            resetBuffers({
                background: true
            });
            init({
                background: true
            });
            this.repaint();
            return this
        };
        this.setArea = function(areaVal) {
            area = areaVal;
            resetBuffers({
                background: true,
                foreground: true
            });
            init({
                background: true,
                foreground: true
            });
            this.repaint();
            return this
        };
        this.setSection = function(areaSec) {
            section = areaSec;
            resetBuffers({
                background: true,
                foreground: true
            });
            init({
                background: true,
                foreground: true
            });
            this.repaint();
            return this
        };
        this.setThresholdVisible = function(visible) {
            thresholdVisible = !!visible;
            this.repaint();
            return this
        };
        this.setThresholdRising = function(rising) {
            thresholdRising = !!rising;
            ledBlinking = !ledBlinking;
            blink(ledBlinking);
            this.repaint();
            return this
        };
        this.setLcdDecimals = function(decimals) {
            lcdDecimals = parseInt(decimals, 10);
            this.repaint();
            return this
        };
        this.setFrameDesign = function(newFrameDesign) {
            resetBuffers({
                frame: true
            });
            frameDesign = newFrameDesign;
            init({
                frame: true
            });
            this.repaint();
            return this
        };
        this.setBackgroundColor = function(newBackgroundColor) {
            resetBuffers({
                background: true,
                pointer: pointerType.type === "type2" || pointerType.type === "type13" ? true : false
            });
            backgroundColor = newBackgroundColor;
            init({
                background: true,
                pointer: pointerType.type === "type2" || pointerType.type === "type13" ? true : false
            });
            this.repaint();
            return this
        };
        this.setForegroundType = function(newForegroundType) {
            resetBuffers({
                foreground: true
            });
            foregroundType = newForegroundType;
            init({
                foreground: true
            });
            this.repaint();
            return this
        };
        this.setPointerType = function(newPointerType) {
            resetBuffers({
                pointer: true,
                foreground: true
            });
            pointerType = newPointerType;
            init({
                pointer: true,
                foreground: true
            });
            this.repaint();
            return this
        };
        this.setPointerColor = function(newPointerColor) {
            resetBuffers({
                pointer: true
            });
            pointerColor = newPointerColor;
            init({
                pointer: true
            });
            this.repaint();
            return this
        };
        this.setLedColor = function(newLedColor) {
            resetBuffers({
                led: true
            });
            ledColor = newLedColor;
            init({
                led: true
            });
            this.repaint();
            return this
        };
        this.setUserLedColor = function(newLedColor) {
            resetBuffers({
                userLed: true
            });
            userLedColor = newLedColor;
            init({
                userLed: true
            });
            this.repaint();
            return this
        };
        this.toggleUserLed = function() {
            if (userLedBuffer === userLedBufferOn) {
                userLedBuffer = userLedBufferOff
            } else {
                userLedBuffer = userLedBufferOn
            }
            this.repaint();
            return this
        };
        this.setUserLedOnOff = function(on) {
            if (true === on) {
                userLedBuffer = userLedBufferOn
            } else {
                userLedBuffer = userLedBufferOff
            }
            this.repaint();
            return this
        };
        this.blinkUserLed = function(blink) {
            if (blink) {
                if (!userLedBlinking) {
                    blinkUser(true);
                    userLedBlinking = true
                }
            } else {
                if (userLedBlinking) {
                    clearInterval(userLedTimerId);
                    userLedBlinking = false
                }
            }
            return this
        };
        this.setLedVisible = function(visible) {
            ledVisible = !!visible;
            this.repaint();
            return this
        };
        this.setUserLedVisible = function(visible) {
            userLedVisible = !!visible;
            this.repaint();
            return this
        };
        this.setLcdColor = function(newLcdColor) {
            lcdColor = newLcdColor;
            resetBuffers({
                background: true
            });
            init({
                background: true
            });
            this.repaint();
            return this
        };
        this.setTrend = function(newValue) {
            trendIndicator = newValue;
            this.repaint();
            return this
        };
        this.setTrendVisible = function(visible) {
            trendVisible = !!visible;
            this.repaint();
            return this
        };
        this.setFractionalScaleDecimals = function(decimals) {
            fractionalScaleDecimals = parseInt(decimals, 10);
            resetBuffers({
                background: true
            });
            init({
                background: true
            });
            this.repaint();
            return this
        };
        this.setLabelNumberFormat = function(format) {
            labelNumberFormat = format;
            resetBuffers({
                background: true
            });
            init({
                background: true
            });
            this.repaint();
            return this
        };
        this.repaint = function() {
            if (!initialized) {
                init({
                    frame: true,
                    background: true,
                    led: true,
                    userLed: true,
                    pointer: true,
                    trend: true,
                    foreground: true,
                    odo: true
                })
            }
            mainCtx.clearRect(0, 0, size, size);
            if (frameVisible) {
                mainCtx.drawImage(frameBuffer, 0, 0)
            }
            mainCtx.drawImage(backgroundBuffer, 0, 0);
            if (lcdVisible) {
                if (useOdometer) {
                    odoGauge.setValue(odometerUseValue ? value : odoValue);
                    mainCtx.drawImage(odoBuffer, odoPosX, odoPosY)
                } else {
                    drawLcdText(mainCtx, value)
                }
            }
            if (ledVisible) {
                mainCtx.drawImage(ledBuffer, ledPosX, ledPosY)
            }
            if (userLedVisible) {
                mainCtx.drawImage(userLedBuffer, userLedPosX, userLedPosY)
            }
            if (trendVisible) {
                switch (trendIndicator.state) {
                    case "up":
                        mainCtx.drawImage(trendUpBuffer, trendPosX, trendPosY);
                        break;
                    case "steady":
                        mainCtx.drawImage(trendSteadyBuffer, trendPosX, trendPosY);
                        break;
                    case "down":
                        mainCtx.drawImage(trendDownBuffer, trendPosX, trendPosY);
                        break;
                    case "off":
                        mainCtx.drawImage(trendOffBuffer, trendPosX, trendPosY);
                        break
                }
            }
            if (minMeasuredValueVisible) {
                mainCtx.save();
                mainCtx.translate(centerX, centerY);
                mainCtx.rotate(rotationOffset + HALF_PI + (minMeasuredValue - minValue) * angleStep);
                mainCtx.translate(-centerX, -centerY);
                mainCtx.drawImage(minMeasuredValueBuffer, mainCtx.canvas.width * .4865, mainCtx.canvas.height * .105);
                mainCtx.restore()
            }
            if (maxMeasuredValueVisible) {
                mainCtx.save();
                mainCtx.translate(centerX, centerY);
                mainCtx.rotate(rotationOffset + HALF_PI + (maxMeasuredValue - minValue) * angleStep);
                mainCtx.translate(-centerX, -centerY);
                mainCtx.drawImage(maxMeasuredValueBuffer, mainCtx.canvas.width * .4865, mainCtx.canvas.height * .105);
                mainCtx.restore()
            }
            angle = rotationOffset + HALF_PI + (value - minValue) * angleStep;
            mainCtx.save();
            mainCtx.translate(centerX, centerY);
            mainCtx.rotate(angle);
            mainCtx.translate(-centerX, -centerY);
            mainCtx.shadowColor = "rgba(0, 0, 0, 0.8)";
            mainCtx.shadowOffsetX = mainCtx.shadowOffsetY = shadowOffset;
            mainCtx.shadowBlur = shadowOffset * 2;
            mainCtx.drawImage(pointerBuffer, 0, 0);
            mainCtx.restore();
            if (foregroundVisible) {
                mainCtx.drawImage(foregroundBuffer, 0, 0)
            }
            repainting = false
        };
        this.repaint();
        return this
    };
    var radialBargraph = function(canvas, parameters) {
        parameters = parameters || {};
        var gaugeType = undefined === parameters.gaugeType ? steelseries.GaugeType.TYPE4 : parameters.gaugeType,
            size = undefined === parameters.size ? 0 : parameters.size,
            minValue = undefined === parameters.minValue ? 0 : parameters.minValue,
            maxValue = undefined === parameters.maxValue ? minValue + 100 : parameters.maxValue,
            niceScale = undefined === parameters.niceScale ? true : parameters.niceScale,
            threshold = undefined === parameters.threshold ? (maxValue - minValue) / 2 + minValue : parameters.threshold,
            thresholdRising = undefined === parameters.thresholdRising ? true : parameters.thresholdRising,
            section = undefined === parameters.section ? null : parameters.section,
            useSectionColors = undefined === parameters.useSectionColors ? false : parameters.useSectionColors,
            titleString = undefined === parameters.titleString ? "" : parameters.titleString,
            unitString = undefined === parameters.unitString ? "" : parameters.unitString,
            frameDesign = undefined === parameters.frameDesign ? steelseries.FrameDesign.METAL : parameters.frameDesign,
            frameVisible = undefined === parameters.frameVisible ? true : parameters.frameVisible,
            backgroundColor = undefined === parameters.backgroundColor ? steelseries.BackgroundColor.DARK_GRAY : parameters.backgroundColor,
            backgroundVisible = undefined === parameters.backgroundVisible ? true : parameters.backgroundVisible,
            valueColor = undefined === parameters.valueColor ? steelseries.ColorDef.RED : parameters.valueColor,
            lcdColor = undefined === parameters.lcdColor ? steelseries.LcdColor.STANDARD : parameters.lcdColor,
            lcdVisible = undefined === parameters.lcdVisible ? true : parameters.lcdVisible,
            lcdDecimals = undefined === parameters.lcdDecimals ? 2 : parameters.lcdDecimals,
            digitalFont = undefined === parameters.digitalFont ? false : parameters.digitalFont,
            fractionalScaleDecimals = undefined === parameters.fractionalScaleDecimals ? 1 : parameters.fractionalScaleDecimals,
            customLayer = undefined === parameters.customLayer ? null : parameters.customLayer,
            ledColor = undefined === parameters.ledColor ? steelseries.LedColor.RED_LED : parameters.ledColor,
            ledVisible = undefined === parameters.ledVisible ? true : parameters.ledVisible,
            userLedColor = undefined === parameters.userLedColor ? steelseries.LedColor.GREEN_LED : parameters.userLedColor,
            userLedVisible = undefined === parameters.userLedVisible ? false : parameters.userLedVisible,
            labelNumberFormat = undefined === parameters.labelNumberFormat ? steelseries.LabelNumberFormat.STANDARD : parameters.labelNumberFormat,
            foregroundType = undefined === parameters.foregroundType ? steelseries.ForegroundType.TYPE1 : parameters.foregroundType,
            foregroundVisible = undefined === parameters.foregroundVisible ? true : parameters.foregroundVisible,
            playAlarm = undefined === parameters.playAlarm ? false : parameters.playAlarm,
            alarmSound = undefined === parameters.alarmSound ? false : parameters.alarmSound,
            valueGradient = undefined === parameters.valueGradient ? null : parameters.valueGradient,
            useValueGradient = undefined === parameters.useValueGradient ? false : parameters.useValueGradient,
            tickLabelOrientation = undefined === parameters.tickLabelOrientation ? gaugeType === steelseries.GaugeType.TYPE1 ? steelseries.TickLabelOrientation.TANGENT : steelseries.TickLabelOrientation.NORMAL : parameters.tickLabelOrientation,
            trendVisible = undefined === parameters.trendVisible ? false : parameters.trendVisible,
            trendColors = undefined === parameters.trendColors ? [steelseries.LedColor.RED_LED, steelseries.LedColor.GREEN_LED, steelseries.LedColor.CYAN_LED] : parameters.trendColors,
            fullScaleDeflectionTime = undefined === parameters.fullScaleDeflectionTime ? 2.5 : parameters.fullScaleDeflectionTime;
        var mainCtx = getCanvasContext(canvas);
        if (size === 0) {
            size = Math.min(mainCtx.canvas.width, mainCtx.canvas.height)
        }
        mainCtx.canvas.width = size;
        mainCtx.canvas.height = size;
        if (playAlarm && alarmSound !== false) {
            var audioElement = doc.createElement("audio");
            audioElement.setAttribute("src", alarmSound);
            audioElement.setAttribute("preload", "auto")
        }
        var value = minValue;
        var range = maxValue - minValue;
        var ledBlinking = false;
        var ledTimerId = 0;
        var userLedBlinking = false;
        var userLedTimerId = 0;
        var tween;
        var self = this;
        var repainting = false;
        var freeAreaAngle;
        var rotationOffset;
        var bargraphOffset;
        var tickmarkOffset;
        var angleRange;
        var degAngleRange;
        var angleStep;
        var angle;
        var sectionAngles = [];
        var isSectionsVisible = false;
        var isGradientVisible = false;
        var imageWidth = size;
        var imageHeight = size;
        var centerX = imageWidth / 2;
        var centerY = imageHeight / 2;
        var lcdFontHeight = Math.floor(imageWidth / 10);
        var stdFont = lcdFontHeight + "px " + stdFontName;
        var lcdFont = lcdFontHeight + "px " + lcdFontName;
        var lcdHeight = imageHeight * .13;
        var lcdWidth = imageWidth * .4;
        var lcdPosX = (imageWidth - lcdWidth) / 2;
        var lcdPosY = imageHeight / 2 - lcdHeight / 2;
        var ACTIVE_LED_POS_X = imageWidth * .116822;
        var ACTIVE_LED_POS_Y = imageWidth * .485981;
        var LED_SIZE = Math.ceil(size * .093457);
        var LED_POS_X = imageWidth * .53;
        var LED_POS_Y = imageHeight * .61;
        var USER_LED_POS_X = gaugeType === steelseries.GaugeType.TYPE3 ? .7 * imageWidth : centerX - LED_SIZE / 2;
        var USER_LED_POS_Y = gaugeType === steelseries.GaugeType.TYPE3 ? .61 * imageHeight : .75 * imageHeight;
        var trendIndicator = steelseries.TrendState.OFF;
        var trendSize = size * .06;
        var trendPosX = size * .38;
        var trendPosY = size * .57;
        switch (gaugeType.type) {
            case "type1":
                freeAreaAngle = 0;
                rotationOffset = PI;
                bargraphOffset = 0;
                tickmarkOffset = HALF_PI;
                angleRange = HALF_PI;
                degAngleRange = angleRange * DEG_FACTOR;
                angleStep = angleRange / range;
                break;
            case "type2":
                freeAreaAngle = 0;
                rotationOffset = PI;
                bargraphOffset = 0;
                tickmarkOffset = HALF_PI;
                angleRange = PI;
                degAngleRange = angleRange * DEG_FACTOR;
                angleStep = angleRange / range;
                break;
            case "type3":
                freeAreaAngle = 0;
                rotationOffset = HALF_PI;
                bargraphOffset = -HALF_PI;
                tickmarkOffset = 0;
                angleRange = 1.5 * PI;
                degAngleRange = angleRange * DEG_FACTOR;
                angleStep = angleRange / range;
                break;
            case "type4":
            default:
                freeAreaAngle = 60 * RAD_FACTOR;
                rotationOffset = HALF_PI + freeAreaAngle / 2;
                bargraphOffset = -TWO_PI / 6;
                tickmarkOffset = 0;
                angleRange = TWO_PI - freeAreaAngle;
                degAngleRange = angleRange * DEG_FACTOR;
                angleStep = angleRange / range;
                break
        }
        var frameBuffer = createBuffer(size, size);
        var frameContext = frameBuffer.getContext("2d");
        var backgroundBuffer = createBuffer(size, size);
        var backgroundContext = backgroundBuffer.getContext("2d");
        var lcdBuffer;
        var activeLedBuffer = createBuffer(Math.ceil(size * .060747), Math.ceil(size * .023364));
        var activeLedContext = activeLedBuffer.getContext("2d");
        var ledBufferOn = createBuffer(LED_SIZE, LED_SIZE);
        var ledContextOn = ledBufferOn.getContext("2d");
        var ledBufferOff = createBuffer(LED_SIZE, LED_SIZE);
        var ledContextOff = ledBufferOff.getContext("2d");
        var ledBuffer = ledBufferOff;
        var userLedBufferOn = createBuffer(LED_SIZE, LED_SIZE);
        var userLedContextOn = userLedBufferOn.getContext("2d");
        var userLedBufferOff = createBuffer(LED_SIZE, LED_SIZE);
        var userLedContextOff = userLedBufferOff.getContext("2d");
        var userLedBuffer = userLedBufferOff;
        var ledBackground;
        var foregroundBuffer = createBuffer(size, size);
        var foregroundContext = foregroundBuffer.getContext("2d");
        var trendUpBuffer, trendSteadyBuffer, trendDownBuffer, trendOffBuffer;
        var initialized = false;
        var niceMinValue = minValue;
        var niceMaxValue = maxValue;
        var niceRange = maxValue - minValue;
        range = niceMaxValue - niceMinValue;
        var minorTickSpacing = 0;
        var majorTickSpacing = 0;
        var maxNoOfMinorTicks = 10;
        var maxNoOfMajorTicks = 10;
        var calculate = function calculate() {
            if (niceScale) {
                niceRange = calcNiceNumber(maxValue - minValue, false);
                majorTickSpacing = calcNiceNumber(niceRange / (maxNoOfMajorTicks - 1), true);
                niceMinValue = Math.floor(minValue / majorTickSpacing) * majorTickSpacing;
                niceMaxValue = Math.ceil(maxValue / majorTickSpacing) * majorTickSpacing;
                minorTickSpacing = calcNiceNumber(majorTickSpacing / (maxNoOfMinorTicks - 1), true);
                minValue = niceMinValue;
                maxValue = niceMaxValue;
                range = maxValue - minValue
            } else {
                niceRange = maxValue - minValue;
                niceMinValue = minValue;
                niceMaxValue = maxValue;
                range = niceRange;
                majorTickSpacing = calcNiceNumber(niceRange / (maxNoOfMajorTicks - 1), true);
                minorTickSpacing = calcNiceNumber(majorTickSpacing / (maxNoOfMinorTicks - 1), true)
            }
            switch (gaugeType.type) {
                case "type1":
                    freeAreaAngle = 0;
                    rotationOffset = PI;
                    tickmarkOffset = HALF_PI;
                    angleRange = HALF_PI;
                    angleStep = angleRange / range;
                    break;
                case "type2":
                    freeAreaAngle = 0;
                    rotationOffset = PI;
                    tickmarkOffset = HALF_PI;
                    angleRange = PI;
                    angleStep = angleRange / range;
                    break;
                case "type3":
                    freeAreaAngle = 0;
                    rotationOffset = HALF_PI;
                    tickmarkOffset = 0;
                    angleRange = 1.5 * PI;
                    angleStep = angleRange / range;
                    break;
                case "type4":
                default:
                    freeAreaAngle = 60 * RAD_FACTOR;
                    rotationOffset = HALF_PI + freeAreaAngle / 2;
                    tickmarkOffset = 0;
                    angleRange = TWO_PI - freeAreaAngle;
                    angleStep = angleRange / range;
                    break
            }
            angle = rotationOffset + (value - minValue) * angleStep
        };
        var init = function(parameters) {
            parameters = parameters || {};
            var drawFrame = undefined === parameters.frame ? false : parameters.frame;
            var drawBackground = undefined === parameters.background ? false : parameters.background;
            var drawLed = undefined === parameters.led ? false : parameters.led;
            var drawUserLed = undefined === parameters.userLed ? false : parameters.userLed;
            var drawValue = undefined === parameters.value ? false : parameters.value;
            var drawForeground = undefined === parameters.foreground ? false : parameters.foreground;
            var drawTrend = undefined === parameters.trend ? false : parameters.trend;
            initialized = true;
            calculate();
            if (drawFrame && frameVisible) {
                drawRadialFrameImage(frameContext, frameDesign, centerX, centerY, imageWidth, imageHeight)
            }
            if (drawBackground && backgroundVisible) {
                drawRadialBackgroundImage(backgroundContext, backgroundColor, centerX, centerY, imageWidth, imageHeight);
                drawRadialCustomImage(backgroundContext, customLayer, centerX, centerY, imageWidth, imageHeight)
            }
            if (drawLed) {
                ledContextOn.drawImage(createLedImage(LED_SIZE, 1, ledColor), 0, 0);
                ledContextOff.drawImage(createLedImage(LED_SIZE, 0, ledColor), 0, 0);
                ledBackground = backgroundContext.getImageData(LED_POS_X, LED_POS_Y, LED_SIZE, LED_SIZE)
            }
            if (drawUserLed) {
                userLedContextOn.drawImage(createLedImage(Math.ceil(LED_SIZE), 1, userLedColor), 0, 0);
                userLedContextOff.drawImage(createLedImage(Math.ceil(LED_SIZE), 0, userLedColor), 0, 0)
            }
            if (drawBackground) {
                drawBargraphTrackImage(backgroundContext)
            }
            if (drawBackground && backgroundVisible) {
                drawTickmarksImage(backgroundContext, labelNumberFormat);
                drawTitleImage(backgroundContext, imageWidth, imageHeight, titleString, unitString, backgroundColor, true, true)
            }
            if (drawBackground && lcdVisible) {
                lcdBuffer = createLcdBackgroundImage(lcdWidth, lcdHeight, lcdColor);
                backgroundContext.drawImage(lcdBuffer, lcdPosX, lcdPosY)
            }
            isSectionsVisible = false;
            if (useSectionColors && null !== section && 0 < section.length) {
                isSectionsVisible = true;
                var sectionIndex = section.length;
                sectionAngles = [];
                do {
                    sectionIndex--;
                    sectionAngles.push({
                        start: (section[sectionIndex].start + Math.abs(minValue)) / (maxValue - minValue) * degAngleRange,
                        stop: (section[sectionIndex].stop + Math.abs(minValue)) / (maxValue - minValue) * degAngleRange,
                        color: customColorDef(section[sectionIndex].color)
                    })
                } while (0 < sectionIndex)
            }
            isGradientVisible = false;
            if (useValueGradient && valueGradient !== null) {
                isSectionsVisible = false;
                isGradientVisible = true
            }
            if (drawValue) {
                drawActiveLed(activeLedContext, valueColor)
            }
            if (drawForeground && foregroundVisible) {
                drawRadialForegroundImage(foregroundContext, foregroundType, imageWidth, imageHeight, false)
            }
            if (drawTrend && trendVisible) {
                trendUpBuffer = createTrendIndicator(trendSize, steelseries.TrendState.UP, trendColors);
                trendSteadyBuffer = createTrendIndicator(trendSize, steelseries.TrendState.STEADY, trendColors);
                trendDownBuffer = createTrendIndicator(trendSize, steelseries.TrendState.DOWN, trendColors);
                trendOffBuffer = createTrendIndicator(trendSize, steelseries.TrendState.OFF, trendColors)
            }
        };
        var resetBuffers = function(buffers) {
            buffers = buffers || {};
            var resetFrame = undefined === buffers.frame ? false : buffers.frame;
            var resetBackground = undefined === buffers.background ? false : buffers.background;
            var resetLed = undefined === buffers.led ? false : buffers.led;
            var resetUserLed = undefined === buffers.userLed ? false : buffers.userLed;
            var resetValue = undefined === buffers.value ? false : buffers.value;
            var resetForeground = undefined === buffers.foreground ? false : buffers.foreground;
            if (resetFrame) {
                frameBuffer.width = size;
                frameBuffer.height = size;
                frameContext = frameBuffer.getContext("2d")
            }
            if (resetBackground) {
                backgroundBuffer.width = size;
                backgroundBuffer.height = size;
                backgroundContext = backgroundBuffer.getContext("2d")
            }
            if (resetValue) {
                activeLedBuffer.width = Math.ceil(size * .060747);
                activeLedBuffer.height = Math.ceil(size * .023364);
                activeLedContext = activeLedBuffer.getContext("2d")
            }
            if (resetLed) {
                ledBufferOn.width = Math.ceil(LED_SIZE);
                ledBufferOn.height = Math.ceil(LED_SIZE);
                ledContextOn = ledBufferOn.getContext("2d");
                ledBufferOff.width = Math.ceil(LED_SIZE);
                ledBufferOff.height = Math.ceil(LED_SIZE);
                ledContextOff = ledBufferOff.getContext("2d");
                ledBuffer = ledBufferOff
            }
            if (resetUserLed) {
                userLedBufferOn.width = Math.ceil(LED_SIZE);
                userLedBufferOn.height = Math.ceil(LED_SIZE);
                userLedContextOn = userLedBufferOn.getContext("2d");
                userLedBufferOff.width = Math.ceil(LED_SIZE);
                userLedBufferOff.height = Math.ceil(LED_SIZE);
                userLedContextOff = userLedBufferOff.getContext("2d");
                userLedBuffer = userLedBufferOff
            }
            if (resetForeground) {
                foregroundBuffer.width = size;
                foregroundBuffer.height = size;
                foregroundContext = foregroundBuffer.getContext("2d")
            }
        };
        var drawBargraphTrackImage = function(ctx) {
            ctx.save();
            ctx.save();
            ctx.lineWidth = size * .085;
            ctx.beginPath();
            ctx.translate(centerX, centerY);
            ctx.rotate(rotationOffset - 4 * RAD_FACTOR);
            ctx.translate(-centerX, -centerY);
            ctx.arc(centerX, centerY, imageWidth * .35514, 0, angleRange + 8 * RAD_FACTOR, false);
            ctx.rotate(-rotationOffset);
            var ledTrackFrameGradient = ctx.createLinearGradient(0, .107476 * imageHeight, 0, .897195 * imageHeight);
            ledTrackFrameGradient.addColorStop(0, "#000000");
            ledTrackFrameGradient.addColorStop(.22, "#333333");
            ledTrackFrameGradient.addColorStop(.76, "#333333");
            ledTrackFrameGradient.addColorStop(1, "#cccccc");
            ctx.strokeStyle = ledTrackFrameGradient;
            ctx.stroke();
            ctx.restore();
            ctx.save();
            ctx.lineWidth = size * .075;
            ctx.beginPath();
            ctx.translate(centerX, centerY);
            ctx.rotate(rotationOffset - 4 * RAD_FACTOR);
            ctx.translate(-centerX, -centerY);
            ctx.arc(centerX, centerY, imageWidth * .35514, 0, angleRange + 8 * RAD_FACTOR, false);
            ctx.rotate(-rotationOffset);
            var ledTrackMainGradient = ctx.createLinearGradient(0, .112149 * imageHeight, 0, .892523 * imageHeight);
            ledTrackMainGradient.addColorStop(0, "#111111");
            ledTrackMainGradient.addColorStop(1, "#333333");
            ctx.strokeStyle = ledTrackMainGradient;
            ctx.stroke();
            ctx.restore();
            var ledCenterX = (imageWidth * .116822 + imageWidth * .060747) / 2;
            var ledCenterY = (imageWidth * .485981 + imageWidth * .023364) / 2;
            var ledOffGradient = ctx.createRadialGradient(ledCenterX, ledCenterY, 0, ledCenterX, ledCenterY, .030373 * imageWidth);
            ledOffGradient.addColorStop(0, "#3c3c3c");
            ledOffGradient.addColorStop(1, "#323232");
            var angle = 0;
            for (angle = 0; angle <= degAngleRange; angle += 5) {
                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.rotate(angle * RAD_FACTOR + bargraphOffset);
                ctx.translate(-centerX, -centerY);
                ctx.beginPath();
                ctx.rect(imageWidth * .116822, imageWidth * .485981, imageWidth * .060747, imageWidth * .023364);
                ctx.closePath();
                ctx.fillStyle = ledOffGradient;
                ctx.fill();
                ctx.restore()
            }
            ctx.restore()
        };
        var drawActiveLed = function(ctx, color) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.closePath();
            var ledCenterX = ctx.canvas.width / 2;
            var ledCenterY = ctx.canvas.height / 2;
            var ledGradient = mainCtx.createRadialGradient(ledCenterX, ledCenterY, 0, ledCenterX, ledCenterY, ctx.canvas.width / 2);
            ledGradient.addColorStop(0, color.light.getRgbaColor());
            ledGradient.addColorStop(1, color.dark.getRgbaColor());
            ctx.fillStyle = ledGradient;
            ctx.fill();
            ctx.restore()
        };
        var drawLcdText = function(ctx, value) {
            ctx.save();
            ctx.textAlign = "right";
            ctx.strokeStyle = lcdColor.textColor;
            ctx.fillStyle = lcdColor.textColor;
            if (lcdColor === steelseries.LcdColor.STANDARD || lcdColor === steelseries.LcdColor.STANDARD_GREEN) {
                ctx.shadowColor = "gray";
                ctx.shadowOffsetX = imageWidth * .007;
                ctx.shadowOffsetY = imageWidth * .007;
                ctx.shadowBlur = imageWidth * .007
            }
            if (digitalFont) {
                ctx.font = lcdFont
            } else {
                ctx.font = stdFont
            }
            ctx.fillText(value.toLocaleString("pt-PT", {
                maximumFractionDigits: lcdDecimals,
                minimumFractionDigits: lcdDecimals
            }), lcdPosX + lcdWidth - lcdWidth * .05, lcdPosY + lcdHeight * .5 + lcdFontHeight * .38, lcdWidth * .9);
            ctx.restore()
        };
        var drawTickmarksImage = function(ctx, labelNumberFormat) {
            var alpha = rotationOffset,
                rotationStep = angleStep * minorTickSpacing,
                textRotationAngle, fontSize = Math.ceil(imageWidth * .04),
                valueCounter = minValue,
                majorTickCounter = maxNoOfMinorTicks - 1,
                TEXT_TRANSLATE_X = imageWidth * .28,
                TEXT_WIDTH = imageWidth * .1,
                MAX_VALUE_ROUNDED = parseFloat(maxValue.toFixed(2)),
                i;
            backgroundColor.labelColor.setAlpha(1);
            ctx.save();
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = fontSize + "px " + stdFontName;
            ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor();
            ctx.fillStyle = backgroundColor.labelColor.getRgbaColor();
            ctx.translate(centerX, centerY);
            ctx.rotate(rotationOffset);
            if (gaugeType.type === "type1" || gaugeType.type === "type2") {
                TEXT_WIDTH = imageWidth * .0375
            }
            for (i = minValue; parseFloat(i.toFixed(2)) <= MAX_VALUE_ROUNDED; i += minorTickSpacing) {
                textRotationAngle = +rotationStep + HALF_PI;
                majorTickCounter++;
                if (majorTickCounter === maxNoOfMinorTicks) {
                    ctx.save();
                    ctx.translate(TEXT_TRANSLATE_X, 0);
                    switch (tickLabelOrientation.type) {
                        case "horizontal":
                            textRotationAngle = -alpha;
                            break;
                        case "tangent":
                            textRotationAngle = alpha <= HALF_PI + PI ? PI : 0;
                            break;
                        case "normal":
                        default:
                            textRotationAngle = HALF_PI;
                            break
                    }
                    ctx.rotate(textRotationAngle);
                    switch (labelNumberFormat.format) {
                        case "fractional":
                            ctx.fillText(valueCounter.toFixed(fractionalScaleDecimals), 0, 0, TEXT_WIDTH);
                            break;
                        case "scientific":
                            ctx.fillText(valueCounter.toPrecision(2), 0, 0, TEXT_WIDTH);
                            break;
                        case "standard":
                        default:
                            ctx.fillText(valueCounter.toFixed(0), 0, 0, TEXT_WIDTH);
                            break
                    }
                    ctx.translate(-TEXT_TRANSLATE_X, 0);
                    ctx.restore();
                    valueCounter += majorTickSpacing;
                    majorTickCounter = 0;
                    ctx.rotate(rotationStep);
                    alpha += rotationStep;
                    continue
                }
                ctx.rotate(rotationStep);
                alpha += rotationStep
            }
            ctx.translate(-centerX, -centerY);
            ctx.restore()
        };
        var blink = function(blinking) {
            if (blinking) {
                ledTimerId = setInterval(toggleAndRepaintLed, 1e3)
            } else {
                clearInterval(ledTimerId);
                ledBuffer = ledBufferOff
            }
        };
        var blinkUser = function(blinking) {
            if (blinking) {
                userLedTimerId = setInterval(toggleAndRepaintUserLed, 1e3)
            } else {
                clearInterval(userLedTimerId);
                userLedBuffer = userLedBufferOff
            }
        };
        var toggleAndRepaintLed = function() {
            if (ledVisible) {
                if (ledBuffer === ledBufferOn) {
                    ledBuffer = ledBufferOff
                } else {
                    ledBuffer = ledBufferOn
                }
                if (!repainting) {
                    repainting = true;
                    requestAnimFrame(self.repaint)
                }
            }
        };
        var toggleAndRepaintUserLed = function() {
            if (userLedVisible) {
                if (userLedBuffer === userLedBufferOn) {
                    userLedBuffer = userLedBufferOff
                } else {
                    userLedBuffer = userLedBufferOn
                }
                if (!repainting) {
                    repainting = true;
                    requestAnimFrame(self.repaint)
                }
            }
        };
        this.setValue = function(newValue) {
            newValue = parseFloat(newValue);
            var targetValue = newValue < minValue ? minValue : newValue > maxValue ? maxValue : newValue;
            if (value !== targetValue) {
                value = targetValue;
                if (value >= threshold && !ledBlinking && thresholdRising || value <= threshold && !ledBlinking && !thresholdRising) {
                    ledBlinking = true;
                    blink(ledBlinking);
                    if (playAlarm) {
                        audioElement.play()
                    }
                } else if (value < threshold && ledBlinking && thresholdRising || value > threshold && ledBlinking && !thresholdRising) {
                    ledBlinking = false;
                    blink(ledBlinking);
                    if (playAlarm) {
                        audioElement.pause()
                    }
                }
                this.repaint()
            }
            return this
        };
        this.getValue = function() {
            return value
        };
        this.setValueAnimated = function(newValue, callback) {
            newValue = parseFloat(newValue);
            var targetValue = newValue < minValue ? minValue : newValue > maxValue ? maxValue : newValue,
                gauge = this,
                time;
            if (value !== targetValue) {
                if (undefined !== tween && tween.isPlaying) {
                    tween.stop()
                }
                time = fullScaleDeflectionTime * Math.abs(targetValue - value) / (maxValue - minValue);
                time = Math.max(time, fullScaleDeflectionTime / 5);
                tween = new Tween({}, "", Tween.regularEaseInOut, value, targetValue, time);
                tween.onMotionChanged = function(event) {
                    value = event.target._pos;
                    if (value >= threshold && !ledBlinking && thresholdRising || value <= threshold && !ledBlinking && !thresholdRising) {
                        ledBlinking = true;
                        blink(ledBlinking);
                        if (playAlarm) {
                            audioElement.play()
                        }
                    } else if (value < threshold && ledBlinking && thresholdRising || value > threshold && ledBlinking && !thresholdRising) {
                        ledBlinking = false;
                        blink(ledBlinking);
                        if (playAlarm) {
                            audioElement.pause()
                        }
                    }
                    if (!repainting) {
                        repainting = true;
                        requestAnimFrame(gauge.repaint)
                    }
                };
                if (callback && typeof callback === "function") {
                    tween.onMotionFinished = callback
                }
                tween.start()
            }
            return this
        };
        this.setFrameDesign = function(newFrameDesign) {
            resetBuffers({
                frame: true
            });
            frameDesign = newFrameDesign;
            init({
                frame: true
            });
            this.repaint();
            return this
        };
        this.setBackgroundColor = function(newBackgroundColor) {
            resetBuffers({
                background: true,
                led: true
            });
            backgroundColor = newBackgroundColor;
            init({
                background: true,
                led: true
            });
            this.repaint();
            return this
        };
        this.setForegroundType = function(newForegroundType) {
            resetBuffers({
                foreground: true
            });
            foregroundType = newForegroundType;
            init({
                foreground: true
            });
            this.repaint();
            return this
        };
        this.setValueColor = function(newValueColor) {
            resetBuffers({
                value: true
            });
            valueColor = newValueColor;
            init({
                value: true
            });
            this.repaint();
            return this
        };
        this.setLedColor = function(newLedColor) {
            resetBuffers({
                led: true
            });
            ledColor = newLedColor;
            init({
                led: true
            });
            this.repaint();
            return this
        };
        this.setUserLedColor = function(newLedColor) {
            resetBuffers({
                userLed: true
            });
            userLedColor = newLedColor;
            init({
                userLed: true
            });
            this.repaint();
            return this
        };
        this.toggleUserLed = function() {
            if (userLedBuffer === userLedBufferOn) {
                userLedBuffer = userLedBufferOff
            } else {
                userLedBuffer = userLedBufferOn
            }
            this.repaint();
            return this
        };
        this.setUserLedOnOff = function(on) {
            if (true === on) {
                userLedBuffer = userLedBufferOn
            } else {
                userLedBuffer = userLedBufferOff
            }
            this.repaint();
            return this
        };
        this.blinkUserLed = function(blink) {
            if (blink) {
                if (!userLedBlinking) {
                    blinkUser(true);
                    userLedBlinking = true
                }
            } else {
                if (userLedBlinking) {
                    clearInterval(userLedTimerId);
                    userLedBlinking = false
                }
            }
            return this
        };
        this.setLedVisible = function(visible) {
            ledVisible = !!visible;
            this.repaint();
            return this
        };
        this.setUserLedVisible = function(visible) {
            userLedVisible = !!visible;
            this.repaint();
            return this
        };
        this.setLcdColor = function(newLcdColor) {
            lcdColor = newLcdColor;
            resetBuffers({
                background: true
            });
            init({
                background: true
            });
            this.repaint();
            return this
        };
        this.setLcdDecimals = function(decimals) {
            lcdDecimals = parseInt(decimals, 10);
            this.repaint();
            return this
        };
        this.setSection = function(areaSec) {
            section = areaSec;
            init();
            this.repaint();
            return this
        };
        this.setSectionActive = function(value) {
            useSectionColors = value;
            init();
            this.repaint();
            return this
        };
        this.setGradient = function(grad) {
            valueGradient = grad;
            init();
            this.repaint();
            return this
        };
        this.setGradientActive = function(value) {
            useValueGradient = value;
            init();
            this.repaint();
            return this
        };
        this.setMinValue = function(value) {
            minValue = value;
            resetBuffers({
                background: true
            });
            init({
                background: true
            });
            this.repaint();
            return this
        };
        this.getMinValue = function() {
            return minValue
        };
        this.setMaxValue = function(value) {
            maxValue = value;
            resetBuffers({
                background: true
            });
            init({
                background: true
            });
            this.repaint();
            return this
        };
        this.getMaxValue = function() {
            return maxValue
        };
        this.setThreshold = function(newValue) {
            newValue = parseFloat(newValue);
            var targetValue = newValue < minValue ? minValue : newValue > maxValue ? maxValue : newValue;
            threshold = targetValue;
            resetBuffers({
                background: true
            });
            init({
                background: true
            });
            this.repaint();
            return this
        };
        this.setThresholdRising = function(rising) {
            thresholdRising = !!rising;
            ledBlinking = !ledBlinking;
            blink(ledBlinking);
            this.repaint();
            return this
        };
        this.setTitleString = function(title) {
            titleString = title;
            resetBuffers({
                background: true
            });
            init({
                background: true
            });
            this.repaint();
            return this
        };
        this.setUnitString = function(unit) {
            unitString = unit;
            resetBuffers({
                background: true
            });
            init({
                background: true
            });
            this.repaint();
            return this
        };
        this.setTrend = function(newValue) {
            trendIndicator = newValue;
            this.repaint();
            return this
        };
        this.setTrendVisible = function(visible) {
            trendVisible = !!visible;
            this.repaint();
            return this
        };
        this.setFractionalScaleDecimals = function(decimals) {
            fractionalScaleDecimals = parseInt(decimals, 10);
            resetBuffers({
                background: true
            });
            init({
                background: true
            });
            this.repaint()
        };
        this.setLabelNumberFormat = function(format) {
            labelNumberFormat = format;
            resetBuffers({
                background: true
            });
            init({
                background: true
            });
            this.repaint();
            return this
        };
        this.repaint = function() {
            var activeLedAngle = (value - minValue) / (maxValue - minValue) * degAngleRange,
                activeLedColor, lastActiveLedColor = valueColor,
                angle, i, currentValue, gradRange, fraction;
            if (!initialized) {
                init({
                    frame: true,
                    background: true,
                    led: true,
                    userLed: true,
                    value: true,
                    trend: true,
                    foreground: true
                })
            }
            mainCtx.clearRect(0, 0, size, size);
            if (frameVisible) {
                mainCtx.drawImage(frameBuffer, 0, 0)
            }
            mainCtx.drawImage(backgroundBuffer, 0, 0);
            for (angle = 0; angle <= activeLedAngle; angle += 5) {
                activeLedColor = valueColor;
                if (isGradientVisible) {
                    currentValue = minValue + angle / degAngleRange * (maxValue - minValue);
                    gradRange = valueGradient.getEnd() - valueGradient.getStart();
                    fraction = (currentValue - minValue) / gradRange;
                    fraction = Math.max(Math.min(fraction, 1), 0);
                    activeLedColor = customColorDef(valueGradient.getColorAt(fraction).getRgbaColor())
                } else if (isSectionsVisible) {
                    for (i = 0; i < sectionAngles.length; i++) {
                        if (angle >= sectionAngles[i].start && angle < sectionAngles[i].stop) {
                            activeLedColor = sectionAngles[i].color;
                            break
                        }
                    }
                }
                if (lastActiveLedColor.medium.getHexColor() !== activeLedColor.medium.getHexColor()) {
                    drawActiveLed(activeLedContext, activeLedColor);
                    lastActiveLedColor = activeLedColor
                }
                mainCtx.save();
                mainCtx.translate(centerX, centerY);
                mainCtx.rotate(angle * RAD_FACTOR + bargraphOffset);
                mainCtx.translate(-centerX, -centerY);
                mainCtx.drawImage(activeLedBuffer, ACTIVE_LED_POS_X, ACTIVE_LED_POS_Y);
                mainCtx.restore()
            }
            if (lcdVisible) {
                drawLcdText(mainCtx, value)
            }
            if (ledVisible) {
                mainCtx.drawImage(ledBuffer, LED_POS_X, LED_POS_Y)
            }
            if (userLedVisible) {
                mainCtx.drawImage(userLedBuffer, USER_LED_POS_X, USER_LED_POS_Y)
            }
            if (trendVisible) {
                switch (trendIndicator.state) {
                    case "up":
                        mainCtx.drawImage(trendUpBuffer, trendPosX, trendPosY);
                        break;
                    case "steady":
                        mainCtx.drawImage(trendSteadyBuffer, trendPosX, trendPosY);
                        break;
                    case "down":
                        mainCtx.drawImage(trendDownBuffer, trendPosX, trendPosY);
                        break;
                    case "off":
                        mainCtx.drawImage(trendOffBuffer, trendPosX, trendPosY);
                        break
                }
            }
            if (foregroundVisible) {
                mainCtx.drawImage(foregroundBuffer, 0, 0)
            }
            repainting = false
        };
        this.repaint();
        return this
    };
    var displaySingle = function(canvas, parameters) {
        parameters = parameters || {};
        var width = undefined === parameters.width ? 0 : parameters.width,
            height = undefined === parameters.height ? 0 : parameters.height,
            lcdColor = undefined === parameters.lcdColor ? steelseries.LcdColor.STANDARD : parameters.lcdColor,
            lcdDecimals = undefined === parameters.lcdDecimals ? 2 : parameters.lcdDecimals,
            unitString = undefined === parameters.unitString ? "" : parameters.unitString,
            unitStringVisible = undefined === parameters.unitStringVisible ? false : parameters.unitStringVisible,
            headerString = undefined === parameters.headerString ? "" : parameters.headerString,
            headerStringVisible = undefined === parameters.headerStringVisible ? false : parameters.headerStringVisible,
            digitalFont = undefined === parameters.digitalFont ? false : parameters.digitalFont,
            valuesNumeric = undefined === parameters.valuesNumeric ? true : parameters.valuesNumeric,
            value = undefined === parameters.value ? 0 : parameters.value,
            alwaysScroll = undefined === parameters.alwaysScroll ? false : parameters.alwaysScroll,
            autoScroll = undefined === parameters.autoScroll ? false : parameters.autoScroll,
            section = undefined === parameters.section ? null : parameters.section;
        var scrolling = false;
        var scrollX = 0;
        var scrollTimer;
        var repainting = false;
        var self = this;
        var mainCtx = getCanvasContext(canvas);
        if (width === 0) {
            width = mainCtx.canvas.width
        }
        if (height === 0) {
            height = mainCtx.canvas.height
        }
        mainCtx.canvas.width = width;
        mainCtx.canvas.height = height;
        var imageWidth = width;
        var imageHeight = height;
        var textWidth = 0;
        var fontHeight = Math.floor(imageHeight / 1.5);
        var stdFont = fontHeight + "px " + stdFontName;
        var lcdFont = fontHeight + "px " + lcdFontName;
        var initialized = false;
        var lcdBuffer;
        var sectionBuffer = [];
        var sectionForegroundColor = [];
        var drawLcdText = function(value, color) {
            mainCtx.save();
            mainCtx.textAlign = "right";
            mainCtx.strokeStyle = color;
            mainCtx.fillStyle = color;
            mainCtx.beginPath();
            mainCtx.rect(2, 0, imageWidth - 4, imageHeight);
            mainCtx.closePath();
            mainCtx.clip();
            if ((lcdColor === steelseries.LcdColor.STANDARD || lcdColor === steelseries.LcdColor.STANDARD_GREEN) && section === null) {
                mainCtx.shadowColor = "gray";
                mainCtx.shadowOffsetX = imageHeight * .035;
                mainCtx.shadowOffsetY = imageHeight * .035;
                mainCtx.shadowBlur = imageHeight * .055
            }
            mainCtx.font = digitalFont ? lcdFont : stdFont;
            if (valuesNumeric) {
                var unitWidth = 0;
                textWidth = 0;
                if (unitStringVisible) {
                    mainCtx.font = Math.floor(imageHeight / 2.5) + "px " + stdFontName;
                    unitWidth = mainCtx.measureText(unitString).width
                }
                mainCtx.font = digitalFont ? lcdFont : stdFont;
                var lcdText = value.toLocaleString("pt-PT", {
                    maximumFractionDigits: lcdDecimals,
                    minimumFractionDigits: lcdDecimals
                });
                textWidth = mainCtx.measureText(lcdText).width;
                var vPos = .38;
                if (headerStringVisible) {
                    vPos = .52
                }
                mainCtx.fillText(lcdText, imageWidth - unitWidth - 4 - scrollX, imageHeight * .5 + fontHeight * vPos);
                if (unitStringVisible) {
                    mainCtx.font = Math.floor(imageHeight / 2.5) + "px " + stdFontName;
                    mainCtx.fillText(unitString, imageWidth - 2 - scrollX, imageHeight * .5 + fontHeight * vPos)
                }
                if (headerStringVisible) {
                    mainCtx.textAlign = "center";
                    mainCtx.font = Math.floor(imageHeight / 3.5) + "px " + stdFontName;
                    mainCtx.fillText(headerString, imageWidth / 2, imageHeight * .3)
                }
            } else {
                textWidth = mainCtx.measureText(value).width;
                if (alwaysScroll || autoScroll && textWidth > imageWidth - 4) {
                    if (!scrolling) {
                        if (textWidth > imageWidth * .8) {
                            scrollX = imageWidth - textWidth - imageWidth * .2
                        } else {
                            scrollX = 0
                        }
                        scrolling = true;
                        clearTimeout(scrollTimer);
                        scrollTimer = setTimeout(animate, 200)
                    }
                } else if (autoScroll && textWidth <= imageWidth - 4) {
                    scrollX = 0;
                    scrolling = false
                }
                mainCtx.fillText(value, imageWidth - 2 - scrollX, imageHeight * .5 + fontHeight * .38)
            }
            mainCtx.restore()
        };
        var createLcdSectionImage = function(width, height, color, lcdColor) {
            var lcdSectionBuffer = createBuffer(width, height);
            var lcdCtx = lcdSectionBuffer.getContext("2d");
            lcdCtx.save();
            var xB = 0;
            var yB = 0;
            var wB = width;
            var hB = height;
            var rB = Math.min(width, height) * .095;
            var lcdBackground = lcdCtx.createLinearGradient(0, yB, 0, yB + hB);
            lcdBackground.addColorStop(0, "#4c4c4c");
            lcdBackground.addColorStop(.08, "#666666");
            lcdBackground.addColorStop(.92, "#666666");
            lcdBackground.addColorStop(1, "#e6e6e6");
            lcdCtx.fillStyle = lcdBackground;
            roundedRectangle(lcdCtx, xB, yB, wB, hB, rB);
            lcdCtx.fill();
            lcdCtx.restore();
            lcdCtx.save();
            var rgb = getColorValues(color);
            var hsb = rgbToHsb(rgb[0], rgb[1], rgb[2]);
            var rgbStart = getColorValues(lcdColor.gradientStartColor);
            var hsbStart = rgbToHsb(rgbStart[0], rgbStart[1], rgbStart[2]);
            var rgbFraction1 = getColorValues(lcdColor.gradientFraction1Color);
            var hsbFraction1 = rgbToHsb(rgbFraction1[0], rgbFraction1[1], rgbFraction1[2]);
            var rgbFraction2 = getColorValues(lcdColor.gradientFraction2Color);
            var hsbFraction2 = rgbToHsb(rgbFraction2[0], rgbFraction2[1], rgbFraction2[2]);
            var rgbFraction3 = getColorValues(lcdColor.gradientFraction3Color);
            var hsbFraction3 = rgbToHsb(rgbFraction3[0], rgbFraction3[1], rgbFraction3[2]);
            var rgbStop = getColorValues(lcdColor.gradientStopColor);
            var hsbStop = rgbToHsb(rgbStop[0], rgbStop[1], rgbStop[2]);
            var startColor = hsbToRgb(hsb[0], hsb[1], hsbStart[2] - .31);
            var fraction1Color = hsbToRgb(hsb[0], hsb[1], hsbFraction1[2] - .31);
            var fraction2Color = hsbToRgb(hsb[0], hsb[1], hsbFraction2[2] - .31);
            var fraction3Color = hsbToRgb(hsb[0], hsb[1], hsbFraction3[2] - .31);
            var stopColor = hsbToRgb(hsb[0], hsb[1], hsbStop[2] - .31);
            var xF = 1;
            var yF = 1;
            var wF = width - 2;
            var hF = height - 2;
            var rF = rB - 1;
            var lcdForeground = lcdCtx.createLinearGradient(0, yF, 0, yF + hF);
            lcdForeground.addColorStop(0, "rgb(" + startColor[0] + ", " + startColor[1] + ", " + startColor[2] + ")");
            lcdForeground.addColorStop(.03, "rgb(" + fraction1Color[0] + "," + fraction1Color[1] + "," + fraction1Color[2] + ")");
            lcdForeground.addColorStop(.49, "rgb(" + fraction2Color[0] + "," + fraction2Color[1] + "," + fraction2Color[2] + ")");
            lcdForeground.addColorStop(.5, "rgb(" + fraction3Color[0] + "," + fraction3Color[1] + "," + fraction3Color[2] + ")");
            lcdForeground.addColorStop(1, "rgb(" + stopColor[0] + "," + stopColor[1] + "," + stopColor[2] + ")");
            lcdCtx.fillStyle = lcdForeground;
            roundedRectangle(lcdCtx, xF, yF, wF, hF, rF);
            lcdCtx.fill();
            lcdCtx.restore();
            return lcdSectionBuffer
        };
        var createSectionForegroundColor = function(sectionColor) {
            var rgbSection = getColorValues(sectionColor);
            var hsbSection = rgbToHsb(rgbSection[0], rgbSection[1], rgbSection[2]);
            var sectionForegroundRgb = hsbToRgb(hsbSection[0], .57, .83);
            return "rgb(" + sectionForegroundRgb[0] + ", " + sectionForegroundRgb[1] + ", " + sectionForegroundRgb[2] + ")"
        };
        var animate = function() {
            if (scrolling) {
                if (scrollX > imageWidth) {
                    scrollX = -textWidth
                }
                scrollX += 2;
                scrollTimer = setTimeout(animate, 50)
            } else {
                scrollX = 0
            }
            if (!repainting) {
                repainting = true;
                requestAnimFrame(self.repaint)
            }
        };
        var init = function() {
            var sectionIndex;
            initialized = true;
            lcdBuffer = createLcdBackgroundImage(width, height, lcdColor);
            if (null !== section && 0 < section.length) {
                for (sectionIndex = 0; sectionIndex < section.length; sectionIndex++) {
                    sectionBuffer[sectionIndex] = createLcdSectionImage(width, height, section[sectionIndex].color, lcdColor);
                    sectionForegroundColor[sectionIndex] = createSectionForegroundColor(section[sectionIndex].color)
                }
            }
        };
        this.setValue = function(newValue) {
            if (value !== newValue) {
                value = newValue;
                this.repaint()
            }
            return this
        };
        this.setLcdColor = function(newLcdColor) {
            lcdColor = newLcdColor;
            init();
            this.repaint();
            return this
        };
        this.setSection = function(newSection) {
            section = newSection;
            init({
                background: true,
                foreground: true
            });
            this.repaint();
            return this
        };
        this.setScrolling = function(scroll) {
            if (scroll) {
                if (scrolling) {
                    return
                } else {
                    scrolling = scroll;
                    animate()
                }
            } else {
                scrolling = scroll
            }
            return this
        };
        this.repaint = function() {
            if (!initialized) {
                init()
            }
            mainCtx.clearRect(0, 0, mainCtx.canvas.width, mainCtx.canvas.height);
            var lcdBackgroundBuffer = lcdBuffer;
            var lcdTextColor = lcdColor.textColor;
            var sectionIndex;
            if (null !== section && 0 < section.length) {
                for (sectionIndex = 0; sectionIndex < section.length; sectionIndex++) {
                    if (value >= section[sectionIndex].start && value <= section[sectionIndex].stop) {
                        lcdBackgroundBuffer = sectionBuffer[sectionIndex];
                        lcdTextColor = sectionForegroundColor[sectionIndex];
                        break
                    }
                }
            }
            mainCtx.drawImage(lcdBackgroundBuffer, 0, 0);
            drawLcdText(value, lcdTextColor);
            repainting = false
        };
        this.repaint();
        return this
    };
    var windDirection = function(canvas, parameters) {
        parameters = parameters || {};
        var size = undefined === parameters.size ? 0 : parameters.size,
            frameDesign = undefined === parameters.frameDesign ? steelseries.FrameDesign.METAL : parameters.frameDesign,
            frameVisible = undefined === parameters.frameVisible ? true : parameters.frameVisible,
            backgroundColor = undefined === parameters.backgroundColor ? steelseries.BackgroundColor.DARK_GRAY : parameters.backgroundColor,
            backgroundVisible = undefined === parameters.backgroundVisible ? true : parameters.backgroundVisible,
            pointerTypeLatest = undefined === parameters.pointerTypeLatest ? steelseries.PointerType.TYPE1 : parameters.pointerTypeLatest,
            pointerTypeAverage = undefined === parameters.pointerTypeAverage ? steelseries.PointerType.TYPE8 : parameters.pointerTypeAverage,
            pointerColor = undefined === parameters.pointerColor ? steelseries.ColorDef.RED : parameters.pointerColor,
            pointerColorAverage = undefined === parameters.pointerColorAverage ? steelseries.ColorDef.BLUE : parameters.pointerColorAverage,
            knobType = undefined === parameters.knobType ? steelseries.KnobType.STANDARD_KNOB : parameters.knobType,
            knobStyle = undefined === parameters.knobStyle ? steelseries.KnobStyle.SILVER : parameters.knobStyle,
            foregroundType = undefined === parameters.foregroundType ? steelseries.ForegroundType.TYPE1 : parameters.foregroundType,
            foregroundVisible = undefined === parameters.foregroundVisible ? true : parameters.foregroundVisible,
            pointSymbols = undefined === parameters.pointSymbols ? ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] : parameters.pointSymbols,
            pointSymbolsVisible = undefined === parameters.pointSymbolsVisible ? true : parameters.pointSymbolsVisible,
            customLayer = undefined === parameters.customLayer ? null : parameters.customLayer,
            degreeScale = undefined === parameters.degreeScale ? true : parameters.degreeScale,
            degreeScaleHalf = undefined === parameters.degreeScaleHalf ? false : parameters.degreeScaleHalf,
            roseVisible = undefined === parameters.roseVisible ? false : parameters.roseVisible,
            lcdColor = undefined === parameters.lcdColor ? steelseries.LcdColor.STANDARD : parameters.lcdColor,
            lcdVisible = undefined === parameters.lcdVisible ? true : parameters.lcdVisible,
            digitalFont = undefined === parameters.digitalFont ? false : parameters.digitalFont,
            section = undefined === parameters.section ? null : parameters.section,
            area = undefined === parameters.area ? null : parameters.area,
            lcdTitleStrings = undefined === parameters.lcdTitleStrings ? ["Latest", "Average"] : parameters.lcdTitleStrings,
            titleString = undefined === parameters.titleString ? "" : parameters.titleString,
            useColorLabels = undefined === parameters.useColorLabels ? false : parameters.useColorLabels,
            fullScaleDeflectionTime = undefined === parameters.fullScaleDeflectionTime ? 2.5 : parameters.fullScaleDeflectionTime;
        var tweenLatest;
        var tweenAverage;
        var valueLatest = 0;
        var valueAverage = 0;
        var angleStep = RAD_FACTOR;
        var angleLatest = this.valueLatest;
        var angleAverage = this.valueAverage;
        var rotationOffset = -HALF_PI;
        var angleRange = TWO_PI;
        var range = 360;
        var repainting = false;
        var mainCtx = getCanvasContext(canvas);
        if (size === 0) {
            size = Math.min(mainCtx.canvas.width, mainCtx.canvas.height)
        }
        mainCtx.canvas.width = size;
        mainCtx.canvas.height = size;
        var imageWidth = size;
        var imageHeight = size;
        var centerX = imageWidth / 2;
        var centerY = imageHeight / 2;
        var lcdFontHeight = Math.floor(imageWidth / 10);
        var stdFont = lcdFontHeight + "px " + stdFontName;
        var lcdFont = lcdFontHeight + "px " + lcdFontName;
        var lcdWidth = imageWidth * .3;
        var lcdHeight = imageHeight * .12;
        var lcdPosX = (imageWidth - lcdWidth) / 2;
        var lcdPosY1 = imageHeight * .32;
        var lcdPosY2 = imageHeight * .565;
        var initialized = false;
        var backgroundBuffer = createBuffer(size, size);
        var backgroundContext = backgroundBuffer.getContext("2d");
        var lcdBuffer;
        var pointerBufferLatest = createBuffer(size, size);
        var pointerContextLatest = pointerBufferLatest.getContext("2d");
        var pointerBufferAverage = createBuffer(size, size);
        var pointerContextAverage = pointerBufferAverage.getContext("2d");
        var foregroundBuffer = createBuffer(size, size);
        var foregroundContext = foregroundBuffer.getContext("2d");
        var drawLcdText = function(value, bLatest) {
            mainCtx.save();
            mainCtx.textAlign = "center";
            mainCtx.strokeStyle = lcdColor.textColor;
            mainCtx.fillStyle = lcdColor.textColor;
            while (value < -180) {
                value += 360
            }
            if (!degreeScaleHalf && value < 0) {
                value += 360
            }
            if (degreeScaleHalf && value > 180) {
                value = -(360 - value)
            }
            if (value >= 0) {
                value = "00" + Math.round(value);
                value = value.substring(value.length, value.length - 3)
            } else {
                value = "00" + Math.abs(Math.round(value));
                value = "-" + value.substring(value.length, value.length - 3)
            }
            if (lcdColor === steelseries.LcdColor.STANDARD || lcdColor === steelseries.LcdColor.STANDARD_GREEN) {
                mainCtx.shadowColor = "gray";
                mainCtx.shadowOffsetX = imageWidth * .007;
                mainCtx.shadowOffsetY = imageWidth * .007;
                mainCtx.shadowBlur = imageWidth * .007
            }
            mainCtx.font = digitalFont ? lcdFont : stdFont;
            mainCtx.fillText(value + "°", imageWidth / 2 + lcdWidth * .05, (bLatest ? lcdPosY1 : lcdPosY2) + lcdHeight * .5 + lcdFontHeight * .38, lcdWidth * .9);
            mainCtx.restore()
        };
        var drawAreaSectionImage = function(ctx, start, stop, color, filled) {
            ctx.save();
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.lineWidth = imageWidth * .035;
            var startAngle = angleRange / range * start;
            var stopAngle = startAngle + (stop - start) / (range / angleRange);
            ctx.translate(centerX, centerY);
            ctx.rotate(rotationOffset);
            ctx.beginPath();
            if (filled) {
                ctx.moveTo(0, 0);
                ctx.arc(0, 0, imageWidth * .365 - ctx.lineWidth / 2, startAngle, stopAngle, false)
            } else {
                ctx.arc(0, 0, imageWidth * .365, startAngle, stopAngle, false)
            }
            if (filled) {
                ctx.moveTo(0, 0);
                ctx.fill()
            } else {
                ctx.stroke()
            }
            ctx.translate(-centerX, -centerY);
            ctx.restore()
        };
        var drawTickmarksImage = function(ctx) {
            var OUTER_POINT = imageWidth * .38,
                MAJOR_INNER_POINT = imageWidth * .35,
                MINOR_INNER_POINT = imageWidth * .36,
                TEXT_WIDTH = imageWidth * .1,
                TEXT_TRANSLATE_X = imageWidth * .31,
                CARDINAL_TRANSLATE_X = imageWidth * .36,
                stdFont, smlFont, i, val, to;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.save();
            ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor();
            ctx.fillStyle = backgroundColor.labelColor.getRgbaColor();
            ctx.translate(centerX, centerY);
            if (!degreeScale) {
                stdFont = .12 * imageWidth + "px serif";
                smlFont = .06 * imageWidth + "px serif";
                ctx.lineWidth = 1;
                ctx.strokeStyle = backgroundColor.symbolColor.getRgbaColor();
                for (i = 0; 360 > i; i += 2.5) {
                    if (0 === i % 5) {
                        ctx.beginPath();
                        ctx.moveTo(imageWidth * .38, 0);
                        ctx.lineTo(imageWidth * .36, 0);
                        ctx.closePath();
                        ctx.stroke()
                    }
                    ctx.save();
                    switch (i) {
                        case 0:
                            ctx.translate(imageWidth * .35, 0);
                            ctx.rotate(HALF_PI);
                            ctx.font = stdFont;
                            ctx.fillText(pointSymbols[2], 0, 0);
                            ctx.translate(-imageWidth * .35, 0);
                            break;
                        case 45:
                            ctx.translate(imageWidth * .29, 0);
                            ctx.rotate(HALF_PI);
                            ctx.font = smlFont;
                            ctx.fillText(pointSymbols[3], 0, 0);
                            ctx.translate(-imageWidth * .29, 0);
                            break;
                        case 90:
                            ctx.translate(imageWidth * .35, 0);
                            ctx.rotate(HALF_PI);
                            ctx.font = stdFont;
                            ctx.fillText(pointSymbols[4], 0, 0);
                            ctx.translate(-imageWidth * .35, 0);
                            break;
                        case 135:
                            ctx.translate(imageWidth * .29, 0);
                            ctx.rotate(HALF_PI);
                            ctx.font = smlFont;
                            ctx.fillText(pointSymbols[5], 0, 0);
                            ctx.translate(-imageWidth * .29, 0);
                            break;
                        case 180:
                            ctx.translate(imageWidth * .35, 0);
                            ctx.rotate(HALF_PI);
                            ctx.font = stdFont;
                            ctx.fillText(pointSymbols[6], 0, 0);
                            ctx.translate(-imageWidth * .35, 0);
                            break;
                        case 225:
                            ctx.translate(imageWidth * .29, 0);
                            ctx.rotate(HALF_PI);
                            ctx.font = smlFont;
                            ctx.fillText(pointSymbols[7], 0, 0);
                            ctx.translate(-imageWidth * .29, 0);
                            break;
                        case 270:
                            ctx.translate(imageWidth * .35, 0);
                            ctx.rotate(HALF_PI);
                            ctx.font = stdFont;
                            ctx.fillText(pointSymbols[0], 0, 0);
                            ctx.translate(-imageWidth * .35, 0);
                            break;
                        case 315:
                            ctx.translate(imageWidth * .29, 0);
                            ctx.rotate(HALF_PI);
                            ctx.font = smlFont;
                            ctx.fillText(pointSymbols[1], 0, 0);
                            ctx.translate(-imageWidth * .29, 0);
                            break
                    }
                    ctx.restore();
                    if (roseVisible && (0 === i || 22.5 === i || 45 === i || 67.5 === i || 90 === i || 112.5 === i || 135 === i || 157.5 === i || 180 === i || 202.5 === i || 225 === i || 247.5 === i || 270 === i || 292.5 === i || 315 === i || 337.5 === i || 360 === i)) {
                        ctx.save();
                        ctx.beginPath();
                        if (i % 45) {
                            ctx.moveTo(imageWidth * .29, 0)
                        } else {
                            ctx.moveTo(imageWidth * .38, 0)
                        }
                        ctx.lineTo(imageWidth * .1, 0);
                        ctx.closePath();
                        ctx.restore();
                        ctx.stroke()
                    }
                    ctx.rotate(angleStep * 2.5)
                }
            } else {
                stdFont = Math.floor(.1 * imageWidth) + "px serif bold";
                smlFont = Math.floor(imageWidth * .04) + "px " + stdFontName;
                ctx.rotate(angleStep * 5);
                for (i = 5; 360 >= i; i += 5) {
                    ctx.save();
                    if (pointSymbolsVisible) {
                        switch (i) {
                            case 360:
                                ctx.translate(CARDINAL_TRANSLATE_X, 0);
                                ctx.rotate(HALF_PI);
                                ctx.font = stdFont;
                                ctx.fillText(pointSymbols[2], 0, 0, TEXT_WIDTH);
                                ctx.translate(-CARDINAL_TRANSLATE_X, 0);
                                break;
                            case 90:
                                ctx.translate(CARDINAL_TRANSLATE_X, 0);
                                ctx.rotate(HALF_PI);
                                ctx.font = stdFont;
                                ctx.fillText(pointSymbols[4], 0, 0, TEXT_WIDTH);
                                ctx.translate(-CARDINAL_TRANSLATE_X, 0);
                                break;
                            case 180:
                                ctx.translate(CARDINAL_TRANSLATE_X, 0);
                                ctx.rotate(HALF_PI);
                                ctx.font = stdFont;
                                ctx.fillText(pointSymbols[6], 0, 0, TEXT_WIDTH);
                                ctx.translate(-CARDINAL_TRANSLATE_X, 0);
                                break;
                            case 270:
                                ctx.translate(CARDINAL_TRANSLATE_X, 0);
                                ctx.rotate(HALF_PI);
                                ctx.font = stdFont;
                                ctx.fillText(pointSymbols[0], 0, 0, TEXT_WIDTH);
                                ctx.translate(-CARDINAL_TRANSLATE_X, 0);
                                break;
                            case 5:
                            case 85:
                            case 95:
                            case 175:
                            case 185:
                            case 265:
                            case 275:
                            case 355:
                                break;
                            default:
                                if ((i + 90) % 20) {
                                    ctx.lineWidth = (i + 90) % 5 ? 1.5 : 1;
                                    ctx.beginPath();
                                    ctx.moveTo(OUTER_POINT, 0);
                                    to = (i + 90) % 10 ? MINOR_INNER_POINT : MAJOR_INNER_POINT;
                                    ctx.lineTo(to, 0);
                                    ctx.closePath();
                                    ctx.stroke()
                                } else {
                                    ctx.lineWidth = 1.5;
                                    ctx.beginPath();
                                    ctx.moveTo(OUTER_POINT, 0);
                                    ctx.lineTo(MAJOR_INNER_POINT, 0);
                                    ctx.closePath();
                                    ctx.stroke();
                                    val = (i + 90) % 360;
                                    ctx.translate(TEXT_TRANSLATE_X, 0);
                                    ctx.rotate(HALF_PI);
                                    ctx.font = smlFont;
                                    ctx.fillText("0".substring(val >= 100) + val, 0, 0, TEXT_WIDTH);
                                    ctx.translate(-TEXT_TRANSLATE_X, 0)
                                }
                        }
                    } else {
                        if ((i + 90) % 20) {
                            ctx.lineWidth = (i + 90) % 5 ? 1.5 : 1;
                            ctx.beginPath();
                            ctx.moveTo(OUTER_POINT, 0);
                            to = (i + 90) % 10 ? MINOR_INNER_POINT : MAJOR_INNER_POINT;
                            ctx.lineTo(to, 0);
                            ctx.closePath();
                            ctx.stroke()
                        } else {
                            ctx.lineWidth = 1.5;
                            ctx.beginPath();
                            ctx.moveTo(OUTER_POINT, 0);
                            ctx.lineTo(MAJOR_INNER_POINT, 0);
                            ctx.closePath();
                            ctx.stroke();
                            val = (i + 90) % 360;
                            if (degreeScaleHalf) {
                                if (val > 180) {
                                    val = -(360 - val)
                                }
                            }
                            ctx.translate(TEXT_TRANSLATE_X, 0);
                            ctx.rotate(HALF_PI);
                            ctx.font = smlFont;
                            ctx.fillText(val, 0, 0, TEXT_WIDTH);
                            ctx.translate(-TEXT_TRANSLATE_X, 0)
                        }
                    }
                    ctx.restore();
                    ctx.rotate(angleStep * 5)
                }
            }
            ctx.translate(-centerX, -centerY);
            ctx.restore()
        };
        var drawLcdTitles = function(ctx) {
            if (lcdTitleStrings.length > 0) {
                ctx.save();
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = useColorLabels ? pointerColor.medium.getRgbaColor() : backgroundColor.labelColor.getRgbaColor();
                ctx.font = .04 * imageWidth + "px " + stdFontName;
                ctx.fillText(lcdTitleStrings[0], imageWidth / 2, imageHeight * .29, imageWidth * .3);
                ctx.fillStyle = useColorLabels ? pointerColorAverage.medium.getRgbaColor() : backgroundColor.labelColor.getRgbaColor();
                ctx.fillText(lcdTitleStrings[1], imageWidth / 2, imageHeight * .71, imageWidth * .3);
                if (titleString.length > 0) {
                    ctx.fillStyle = backgroundColor.labelColor.getRgbaColor();
                    ctx.font = .0467 * imageWidth + "px " + stdFontName;
                    ctx.fillText(titleString, imageWidth / 2, imageHeight * .5, imageWidth * .3)
                }
            }
        };
        var init = function(parameters) {
            parameters = parameters || {};
            var drawBackground = undefined === parameters.background ? false : parameters.background;
            var drawPointer = undefined === parameters.pointer ? false : parameters.pointer;
            var drawForeground = undefined === parameters.foreground ? false : parameters.foreground;
            initialized = true;
            if (drawBackground && frameVisible) {
                drawRadialFrameImage(backgroundContext, frameDesign, centerX, centerY, imageWidth, imageHeight)
            }
            if (drawBackground && backgroundVisible) {
                drawRadialBackgroundImage(backgroundContext, backgroundColor, centerX, centerY, imageWidth, imageHeight);
                drawRadialCustomImage(backgroundContext, customLayer, centerX, centerY, imageWidth, imageHeight);
                if (null !== section && 0 < section.length) {
                    var sectionIndex = section.length;
                    do {
                        sectionIndex--;
                        drawAreaSectionImage(backgroundContext, section[sectionIndex].start, section[sectionIndex].stop, section[sectionIndex].color, false)
                    } while (0 < sectionIndex)
                }
                if (null !== area && 0 < area.length) {
                    var areaIndex = area.length;
                    do {
                        areaIndex--;
                        drawAreaSectionImage(backgroundContext, area[areaIndex].start, area[areaIndex].stop, area[areaIndex].color, true)
                    } while (0 < areaIndex)
                }
                drawTickmarksImage(backgroundContext)
            }
            if (drawBackground && roseVisible) {
                drawRoseImage(backgroundContext, centerX, centerY, imageWidth, imageHeight, backgroundColor)
            }
            if (drawBackground && lcdVisible) {
                lcdBuffer = createLcdBackgroundImage(lcdWidth, lcdHeight, lcdColor);
                backgroundContext.drawImage(lcdBuffer, lcdPosX, lcdPosY1);
                backgroundContext.drawImage(lcdBuffer, lcdPosX, lcdPosY2);
                drawLcdTitles(backgroundContext)
            }
            if (drawPointer) {
                drawPointerImage(pointerContextAverage, imageWidth, pointerTypeAverage, pointerColorAverage, backgroundColor.labelColor);
                drawPointerImage(pointerContextLatest, imageWidth, pointerTypeLatest, pointerColor, backgroundColor.labelColor)
            }
            if (drawForeground && foregroundVisible) {
                var knobVisible = pointerTypeLatest.type === "type15" || pointerTypeLatest.type === "type16" ? false : true;
                drawRadialForegroundImage(foregroundContext, foregroundType, imageWidth, imageHeight, knobVisible, knobType, knobStyle)
            }
        };
        var resetBuffers = function(buffers) {
            buffers = buffers || {};
            var resetBackground = undefined === buffers.background ? false : buffers.background;
            var resetPointer = undefined === buffers.pointer ? false : buffers.pointer;
            var resetForeground = undefined === buffers.foreground ? false : buffers.foreground;
            if (resetBackground) {
                backgroundBuffer.width = size;
                backgroundBuffer.height = size;
                backgroundContext = backgroundBuffer.getContext("2d")
            }
            if (resetPointer) {
                pointerBufferLatest.width = size;
                pointerBufferLatest.height = size;
                pointerContextLatest = pointerBufferLatest.getContext("2d");
                pointerBufferAverage.width = size;
                pointerBufferAverage.height = size;
                pointerContextAverage = pointerBufferAverage.getContext("2d")
            }
            if (resetForeground) {
                foregroundBuffer.width = size;
                foregroundBuffer.height = size;
                foregroundContext = foregroundBuffer.getContext("2d")
            }
        };
        this.setValueLatest = function(newValue) {
            newValue = parseFloat(newValue);
            newValue = newValue === 360 ? 360 : newValue % 360;
            if (valueLatest !== newValue) {
                valueLatest = newValue;
                this.repaint()
            }
            return this
        };
        this.getValueLatest = function() {
            return valueLatest
        };
        this.setValueAverage = function(newValue) {
            newValue = parseFloat(newValue);
            newValue = newValue === 360 ? 360 : newValue % 360;
            if (valueAverage !== newValue) {
                valueAverage = newValue;
                this.repaint()
            }
            return this
        };
        this.getValueAverage = function() {
            return valueAverage
        };
        this.setValueAnimatedLatest = function(newValue, callback) {
            var targetValue, gauge = this,
                diff, time;
            newValue = parseFloat(newValue);
            targetValue = newValue === 360 ? 360 : newValue % 360;
            if (valueLatest !== targetValue) {
                if (undefined !== tweenLatest && tweenLatest.isPlaying) {
                    tweenLatest.stop()
                }
                diff = getShortestAngle(valueLatest, targetValue);
                if (diff !== 0) {
                    time = fullScaleDeflectionTime * Math.abs(diff) / 180;
                    time = Math.max(time, fullScaleDeflectionTime / 5);
                    tweenLatest = new Tween({}, "", Tween.regularEaseInOut, valueLatest, valueLatest + diff, time);
                    tweenLatest.onMotionChanged = function(event) {
                        valueLatest = event.target._pos === 360 ? 360 : event.target._pos % 360;
                        if (!repainting) {
                            repainting = true;
                            requestAnimFrame(gauge.repaint)
                        }
                    };
                    tweenLatest.onMotionFinished = function() {
                        valueLatest = targetValue;
                        if (!repainting) {
                            repainting = true;
                            requestAnimFrame(gauge.repaint)
                        }
                        if (callback && typeof callback === "function") {
                            callback()
                        }
                    };
                    tweenLatest.start()
                } else {
                    valueLatest = targetValue;
                    if (!repainting) {
                        repainting = true;
                        requestAnimFrame(gauge.repaint)
                    }
                }
            }
            return this
        };
        this.setValueAnimatedAverage = function(newValue, callback) {
            var targetValue, gauge = this,
                diff, time;
            newValue = parseFloat(newValue);
            targetValue = newValue === 360 ? 360 : newValue % 360;
            if (valueAverage !== newValue) {
                if (undefined !== tweenAverage && tweenAverage.isPlaying) {
                    tweenAverage.stop()
                }
                diff = getShortestAngle(valueAverage, targetValue);
                if (diff !== 0) {
                    time = fullScaleDeflectionTime * Math.abs(diff) / 180;
                    time = Math.max(time, fullScaleDeflectionTime / 5);
                    tweenAverage = new Tween({}, "", Tween.regularEaseInOut, valueAverage, valueAverage + diff, time);
                    tweenAverage.onMotionChanged = function(event) {
                        valueAverage = event.target._pos === 360 ? 360 : event.target._pos % 360;
                        if (!repainting) {
                            repainting = true;
                            requestAnimFrame(gauge.repaint)
                        }
                    };
                    tweenAverage.onMotionFinished = function() {
                        valueAverage = targetValue;
                        if (!repainting) {
                            repainting = true;
                            requestAnimFrame(gauge.repaint)
                        }
                        if (callback && typeof callback === "function") {
                            callback()
                        }
                    };
                    tweenAverage.start()
                } else {
                    valueAverage = targetValue;
                    if (!repainting) {
                        repainting = true;
                        requestAnimFrame(gauge.repaint)
                    }
                }
            }
            return this
        };
        this.setArea = function(areaVal) {
            area = areaVal;
            resetBuffers({
                background: true
            });
            init({
                background: true
            });
            this.repaint();
            return this
        };
        this.setSection = function(areaSec) {
            section = areaSec;
            resetBuffers({
                background: true
            });
            init({
                background: true
            });
            this.repaint();
            return this
        };
        this.setFrameDesign = function(newFrameDesign) {
            frameDesign = newFrameDesign;
            resetBuffers({
                background: true
            });
            init({
                background: true
            });
            this.repaint();
            return this
        };
        this.setBackgroundColor = function(newBackgroundColor) {
            backgroundColor = newBackgroundColor;
            resetBuffers({
                background: true
            });
            init({
                background: true
            });
            this.repaint();
            return this
        };
        this.setForegroundType = function(newForegroundType) {
            resetBuffers({
                foreground: true
            });
            foregroundType = newForegroundType;
            init({
                foreground: true
            });
            this.repaint();
            return this
        };
        this.setPointerColor = function(newPointerColor) {
            resetBuffers({
                pointer: true
            });
            pointerColor = newPointerColor;
            init({
                pointer: true
            });
            this.repaint();
            return this
        };
        this.setPointerColorAverage = function(newPointerColor) {
            resetBuffers({
                pointer: true
            });
            pointerColorAverage = newPointerColor;
            init({
                pointer: true
            });
            this.repaint();
            return this
        };
        this.setPointerType = function(newPointerType) {
            pointerTypeLatest = newPointerType;
            resetBuffers({
                pointer: true,
                foreground: true
            });
            init({
                pointer: true,
                foreground: true
            });
            this.repaint();
            return this
        };
        this.setPointerTypeAverage = function(newPointerType) {
            pointerTypeAverage = newPointerType;
            resetBuffers({
                pointer: true,
                foreground: true
            });
            init({
                pointer: true,
                foreground: true
            });
            this.repaint();
            return this
        };
        this.setPointSymbols = function(newPointSymbols) {
            pointSymbols = newPointSymbols;
            resetBuffers({
                background: true
            });
            init({
                background: true
            });
            this.repaint();
            return this
        };
        this.setLcdColor = function(newLcdColor) {
            lcdColor = newLcdColor;
            resetBuffers({
                background: true
            });
            init({
                background: true
            });
            this.repaint();
            return this
        };
        this.setLcdTitleStrings = function(titles) {
            lcdTitleStrings = titles;
            resetBuffers({
                background: true
            });
            init({
                background: true
            });
            this.repaint();
            return this
        };
        this.repaint = function() {
            if (!initialized) {
                init({
                    frame: true,
                    background: true,
                    led: true,
                    pointer: true,
                    foreground: true
                })
            }
            mainCtx.clearRect(0, 0, mainCtx.canvas.width, mainCtx.canvas.height);
            if (frameVisible || backgroundVisible) {
                mainCtx.drawImage(backgroundBuffer, 0, 0)
            }
            if (lcdVisible) {
                drawLcdText(valueLatest, true);
                drawLcdText(valueAverage, false)
            }
            angleAverage = valueAverage * angleStep;
            var shadowOffset = imageWidth * .006;
            mainCtx.save();
            mainCtx.translate(centerX, centerY);
            mainCtx.rotate(angleAverage);
            mainCtx.translate(-centerX, -centerY);
            mainCtx.shadowColor = "rgba(0, 0, 0, 0.8)";
            mainCtx.shadowOffsetX = mainCtx.shadowOffsetY = shadowOffset;
            mainCtx.shadowBlur = shadowOffset * 2;
            mainCtx.drawImage(pointerBufferAverage, 0, 0);
            angleLatest = valueLatest * angleStep - angleAverage;
            mainCtx.translate(centerX, centerY);
            mainCtx.rotate(angleLatest);
            mainCtx.translate(-centerX, -centerY);
            mainCtx.drawImage(pointerBufferLatest, 0, 0);
            mainCtx.restore();
            if (foregroundVisible) {
                mainCtx.drawImage(foregroundBuffer, 0, 0)
            }
            repainting = false
        };
        this.repaint();
        return this
    };
    var led = function(canvas, parameters) {
        parameters = parameters || {};
        var size = undefined === parameters.size ? 0 : parameters.size,
            ledColor = undefined === parameters.ledColor ? steelseries.LedColor.RED_LED : parameters.ledColor;
        var ledBlinking = false;
        var ledTimerId = 0;
        var mainCtx = getCanvasContext(canvas);
        if (size === 0) {
            size = Math.min(mainCtx.canvas.width, mainCtx.canvas.height)
        }
        mainCtx.canvas.width = size;
        mainCtx.canvas.height = size;
        var initialized = false;
        var ledBufferOn = doc.createElement("canvas");
        ledBufferOn.width = size;
        ledBufferOn.height = size;
        var ledContextOn = ledBufferOn.getContext("2d");
        var ledBufferOff = doc.createElement("canvas");
        ledBufferOff.width = size;
        ledBufferOff.height = size;
        var ledContextOff = ledBufferOff.getContext("2d");
        var ledBuffer = ledBufferOff;
        var init = function() {
            initialized = true;
            ledContextOn.clearRect(0, 0, ledContextOn.canvas.width, ledContextOn.canvas.height);
            ledContextOn.drawImage(createLedImage(size, 1, ledColor), 0, 0);
            ledContextOff.clearRect(0, 0, ledContextOff.canvas.width, ledContextOff.canvas.height);
            ledContextOff.drawImage(createLedImage(size, 0, ledColor), 0, 0)
        };
        this.toggleLed = function() {
            if (ledBuffer === ledBufferOn) {
                ledBuffer = ledBufferOff
            } else {
                ledBuffer = ledBufferOn
            }
            repaint();
            return this
        };
        this.setLedColor = function(newColor) {
            ledColor = newColor;
            initialized = false;
            repaint();
            return this
        };
        this.setLedOnOff = function(on) {
            if (!!on) {
                ledBuffer = ledBufferOn
            } else {
                ledBuffer = ledBufferOff
            }
            repaint();
            return this
        };
        this.blink = function(blink) {
            if (!!blink) {
                if (!ledBlinking) {
                    ledTimerId = setInterval(this.toggleLed, 1e3);
                    ledBlinking = true
                }
            } else {
                if (ledBlinking) {
                    clearInterval(ledTimerId);
                    ledBlinking = false;
                    ledBuffer = ledBufferOff
                }
            }
            return this
        };
        var repaint = function() {
            if (!initialized) {
                init()
            }
            mainCtx.save();
            mainCtx.clearRect(0, 0, mainCtx.canvas.width, mainCtx.canvas.height);
            mainCtx.drawImage(ledBuffer, 0, 0);
            mainCtx.restore()
        };
        repaint();
        return this
    };
    var odometer = function(canvas, parameters) {
        parameters = parameters || {};
        var _context = undefined === parameters._context ? null : parameters._context,
            height = undefined === parameters.height ? 0 : parameters.height,
            digits = undefined === parameters.digits ? 6 : parameters.digits,
            decimals = undefined === parameters.decimals ? 1 : parameters.decimals,
            decimalBackColor = undefined === parameters.decimalBackColor ? "#F0F0F0" : parameters.decimalBackColor,
            decimalForeColor = undefined === parameters.decimalForeColor ? "#F01010" : parameters.decimalForeColor,
            font = undefined === parameters.font ? "sans-serif" : parameters.font,
            value = undefined === parameters.value ? 0 : parameters.value,
            valueBackColor = undefined === parameters.valueBackColor ? "#050505" : parameters.valueBackColor,
            valueForeColor = undefined === parameters.valueForeColor ? "#F8F8F8" : parameters.valueForeColor,
            wobbleFactor = undefined === parameters.wobbleFactor ? .07 : parameters.wobbleFactor,
            initialized = false,
            tween, ctx, repainting = false,
            digitHeight, digitWidth, stdFont, width, columnHeight, verticalSpace, zeroOffset, wobble = [],
            backgroundBuffer, backgroundContext, foregroundBuffer, foregroundContext, digitBuffer, digitContext, decimalBuffer, decimalContext;
        if (_context) {
            ctx = _context
        } else {
            ctx = getCanvasContext(canvas)
        }
        if (height === 0) {
            height = ctx.canvas.height
        }
        if (value < 0) {
            value = 0
        }
        digitHeight = Math.floor(height * .85);
        stdFont = "600 " + digitHeight + "px " + font;
        digitWidth = Math.floor(height * .68);
        width = digitWidth * (digits + decimals);
        columnHeight = digitHeight * 11;
        verticalSpace = columnHeight / 12;
        zeroOffset = verticalSpace * .81;
        ctx.canvas.width = width;
        ctx.canvas.height = height;
        backgroundBuffer = createBuffer(width, height);
        backgroundContext = backgroundBuffer.getContext("2d");
        foregroundBuffer = createBuffer(width, height);
        foregroundContext = foregroundBuffer.getContext("2d");
        digitBuffer = createBuffer(digitWidth, columnHeight * 1.1);
        digitContext = digitBuffer.getContext("2d");
        decimalBuffer = createBuffer(digitWidth, columnHeight * 1.1);
        decimalContext = decimalBuffer.getContext("2d");

        function init() {
            var grad, i;
            initialized = true;
            foregroundContext.rect(0, 0, width, height);
            grad = foregroundContext.createLinearGradient(0, 0, 0, height);
            grad.addColorStop(0, "rgba(0, 0, 0, 1)");
            grad.addColorStop(.1, "rgba(0, 0, 0, 0.4)");
            grad.addColorStop(.33, "rgba(255, 255, 255, 0.45)");
            grad.addColorStop(.46, "rgba(255, 255, 255, 0)");
            grad.addColorStop(.9, "rgba(0, 0, 0, 0.4)");
            grad.addColorStop(1, "rgba(0, 0, 0, 1)");
            foregroundContext.fillStyle = grad;
            foregroundContext.fill();
            digitContext.rect(0, 0, digitWidth, columnHeight * 1.1);
            digitContext.fillStyle = valueBackColor;
            digitContext.fill();
            digitContext.strokeStyle = "#f0f0f0";
            digitContext.lineWidth = "1px";
            digitContext.moveTo(0, 0);
            digitContext.lineTo(0, columnHeight * 1.1);
            digitContext.stroke();
            digitContext.strokeStyle = "#202020";
            digitContext.moveTo(digitWidth, 0);
            digitContext.lineTo(digitWidth, columnHeight * 1.1);
            digitContext.stroke();
            digitContext.textAlign = "center";
            digitContext.textBaseline = "middle";
            digitContext.font = stdFont;
            digitContext.fillStyle = valueForeColor;
            for (i = 9; i < 21; i++) {
                digitContext.fillText(i % 10, digitWidth * .5, verticalSpace * (i - 9) + verticalSpace / 2)
            }
            if (decimals > 0) {
                decimalContext.rect(0, 0, digitWidth, columnHeight * 1.1);
                decimalContext.fillStyle = decimalBackColor;
                decimalContext.fill();
                decimalContext.strokeStyle = "#f0f0f0";
                decimalContext.lineWidth = "1px";
                decimalContext.moveTo(0, 0);
                decimalContext.lineTo(0, columnHeight * 1.1);
                decimalContext.stroke();
                decimalContext.strokeStyle = "#202020";
                decimalContext.moveTo(digitWidth, 0);
                decimalContext.lineTo(digitWidth, columnHeight * 1.1);
                decimalContext.stroke();
                decimalContext.textAlign = "center";
                decimalContext.textBaseline = "middle";
                decimalContext.font = stdFont;
                decimalContext.fillStyle = decimalForeColor;
                for (i = 9; i < 21; i++) {
                    decimalContext.fillText(i % 10, digitWidth * .5, verticalSpace * (i - 9) + verticalSpace / 2)
                }
            }
            for (i = 0; i < digits + decimals; i++) {
                wobble[i] = Math.random() * wobbleFactor * height - wobbleFactor * height / 2
            }
        }

        function drawDigits() {
            var pos = 1,
                val = value,
                i, num, numb, frac, prevNum;
            for (i = 0; i < decimals; i++) {
                val *= 10
            }
            numb = Math.floor(val);
            frac = val - numb;
            numb = String(numb);
            prevNum = 9;
            for (i = 0; i < decimals + digits; i++) {
                num = +numb.substring(numb.length - i - 1, numb.length - i) || 0;
                if (prevNum !== 9) {
                    frac = 0
                }
                if (i < decimals) {
                    backgroundContext.drawImage(decimalBuffer, width - digitWidth * pos, -(verticalSpace * (num + frac) + zeroOffset + wobble[i]))
                } else {
                    backgroundContext.drawImage(digitBuffer, width - digitWidth * pos, -(verticalSpace * (num + frac) + zeroOffset + wobble[i]))
                }
                pos++;
                prevNum = num
            }
        }
        this.setValueAnimated = function(newVal, callback) {
            var gauge = this;
            newVal = parseFloat(newVal);
            if (newVal < 0) {
                newVal = 0
            }
            if (value !== newVal) {
                if (undefined !== tween && tween.isPlaying) {
                    tween.stop()
                }
                tween = new Tween({}, "", Tween.strongEaseOut, value, newVal, 2);
                tween.onMotionChanged = function(event) {
                    value = event.target._pos;
                    if (!repainting) {
                        repainting = true;
                        requestAnimFrame(gauge.repaint)
                    }
                };
                if (callback && typeof callback === "function") {
                    tween.onMotionFinished = callback
                }
                tween.start()
            }
            this.repaint();
            return this
        };
        this.setValue = function(newVal) {
            value = parseFloat(newVal);
            if (value < 0) {
                value = 0
            }
            this.repaint();
            return this
        };
        this.getValue = function() {
            return value
        };
        this.repaint = function() {
            if (!initialized) {
                init()
            }
            drawDigits();
            backgroundContext.drawImage(foregroundBuffer, 0, 0);
            ctx.drawImage(backgroundBuffer, 0, 0);
            repainting = false
        };
        this.repaint()
    };
    var drawRoseImage = function(ctx, centerX, centerY, imageWidth, imageHeight, backgroundColor) {
        var fill = true,
            i, grad, symbolColor = backgroundColor.symbolColor.getRgbaColor();
        ctx.save();
        ctx.lineWidth = 1;
        ctx.fillStyle = symbolColor;
        ctx.strokeStyle = symbolColor;
        ctx.translate(centerX, centerY);
        for (i = 0; i < 360; i += 15) {
            fill = !fill;
            ctx.beginPath();
            ctx.arc(0, 0, imageWidth * .26, i * RAD_FACTOR, (i + 15) * RAD_FACTOR, false);
            ctx.arc(0, 0, imageWidth * .23, (i + 15) * RAD_FACTOR, i * RAD_FACTOR, true);
            ctx.closePath();
            if (fill) {
                ctx.fill()
            }
            ctx.stroke()
        }
        ctx.translate(-centerX, -centerY);
        for (i = 0; 360 >= i; i += 90) {
            ctx.beginPath();
            ctx.moveTo(imageWidth * .560747, imageHeight * .584112);
            ctx.lineTo(imageWidth * .640186, imageHeight * .644859);
            ctx.lineTo(imageWidth * .584112, imageHeight * .560747);
            ctx.lineTo(imageWidth * .560747, imageHeight * .584112);
            ctx.closePath();
            ctx.fillStyle = symbolColor;
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(imageWidth * .523364, imageHeight * .397196);
            ctx.lineTo(imageWidth * .5, imageHeight * .196261);
            ctx.lineTo(imageWidth * .471962, imageHeight * .397196);
            ctx.lineTo(imageWidth * .523364, imageHeight * .397196);
            ctx.closePath();
            grad = ctx.createLinearGradient(.476635 * imageWidth, 0, .518691 * imageWidth, 0);
            grad.addColorStop(0, "rgb(222, 223, 218)");
            grad.addColorStop(.48, "rgb(222, 223, 218)");
            grad.addColorStop(.49, symbolColor);
            grad.addColorStop(1, symbolColor);
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.stroke();
            ctx.translate(centerX, centerY);
            ctx.rotate(i * RAD_FACTOR);
            ctx.translate(-centerX, -centerY)
        }
        ctx.beginPath();
        ctx.translate(centerX, centerY);
        ctx.arc(0, 0, imageWidth * .1, 0, TWO_PI, false);
        ctx.lineWidth = imageWidth * .022;
        ctx.stroke();
        ctx.translate(-centerX, -centerY);
        ctx.restore()
    };
    var drawPointerImage = function(ctx, size, ptrType, ptrColor, lblColor) {
        var ptrBuffer, ptrCtx, grad, radius, cacheKey = size.toString() + ptrType.type + ptrColor.light.getHexColor() + ptrColor.medium.getHexColor();
        if (!drawPointerImage.cache[cacheKey]) {
            ptrBuffer = createBuffer(size, size);
            ptrCtx = ptrBuffer.getContext("2d");
            switch (ptrType.type) {
                case "type2":
                    grad = ptrCtx.createLinearGradient(0, size * .471962, 0, size * .130841);
                    grad.addColorStop(0, lblColor.getRgbaColor());
                    grad.addColorStop(.36, lblColor.getRgbaColor());
                    grad.addColorStop(.361, ptrColor.light.getRgbaColor());
                    grad.addColorStop(1, ptrColor.light.getRgbaColor());
                    ptrCtx.fillStyle = grad;
                    ptrCtx.beginPath();
                    ptrCtx.moveTo(size * .518691, size * .471962);
                    ptrCtx.lineTo(size * .509345, size * .462616);
                    ptrCtx.lineTo(size * .509345, size * .341121);
                    ptrCtx.lineTo(size * .504672, size * .130841);
                    ptrCtx.lineTo(size * .495327, size * .130841);
                    ptrCtx.lineTo(size * .490654, size * .341121);
                    ptrCtx.lineTo(size * .490654, size * .462616);
                    ptrCtx.lineTo(size * .481308, size * .471962);
                    ptrCtx.closePath();
                    ptrCtx.fill();
                    break;
                case "type3":
                    ptrCtx.beginPath();
                    ptrCtx.rect(size * .495327, size * .130841, size * .009345, size * .373831);
                    ptrCtx.closePath();
                    ptrCtx.fillStyle = ptrColor.light.getRgbaColor();
                    ptrCtx.fill();
                    break;
                case "type4":
                    grad = ptrCtx.createLinearGradient(.467289 * size, 0, .528036 * size, 0);
                    grad.addColorStop(0, ptrColor.dark.getRgbaColor());
                    grad.addColorStop(.51, ptrColor.dark.getRgbaColor());
                    grad.addColorStop(.52, ptrColor.light.getRgbaColor());
                    grad.addColorStop(1, ptrColor.light.getRgbaColor());
                    ptrCtx.fillStyle = grad;
                    ptrCtx.beginPath();
                    ptrCtx.moveTo(size * .5, size * .126168);
                    ptrCtx.lineTo(size * .514018, size * .135514);
                    ptrCtx.lineTo(size * .53271, size * .5);
                    ptrCtx.lineTo(size * .523364, size * .602803);
                    ptrCtx.lineTo(size * .476635, size * .602803);
                    ptrCtx.lineTo(size * .467289, size * .5);
                    ptrCtx.lineTo(size * .485981, size * .135514);
                    ptrCtx.lineTo(size * .5, size * .126168);
                    ptrCtx.closePath();
                    ptrCtx.fill();
                    break;
                case "type5":
                    grad = ptrCtx.createLinearGradient(.471962 * size, 0, .528036 * size, 0);
                    grad.addColorStop(0, ptrColor.light.getRgbaColor());
                    grad.addColorStop(.5, ptrColor.light.getRgbaColor());
                    grad.addColorStop(.5, ptrColor.medium.getRgbaColor());
                    grad.addColorStop(1, ptrColor.medium.getRgbaColor());
                    ptrCtx.fillStyle = grad;
                    ptrCtx.beginPath();
                    ptrCtx.moveTo(size * .5, size * .495327);
                    ptrCtx.lineTo(size * .528037, size * .495327);
                    ptrCtx.lineTo(size * .5, size * .149532);
                    ptrCtx.lineTo(size * .471962, size * .495327);
                    ptrCtx.lineTo(size * .5, size * .495327);
                    ptrCtx.closePath();
                    ptrCtx.fill();
                    ptrCtx.lineWidth = 1;
                    ptrCtx.lineCap = "square";
                    ptrCtx.lineJoin = "miter";
                    ptrCtx.strokeStyle = ptrColor.dark.getRgbaColor();
                    ptrCtx.stroke();
                    break;
                case "type6":
                    ptrCtx.fillStyle = ptrColor.medium.getRgbaColor();
                    ptrCtx.beginPath();
                    ptrCtx.moveTo(size * .481308, size * .485981);
                    ptrCtx.lineTo(size * .481308, size * .392523);
                    ptrCtx.lineTo(size * .485981, size * .317757);
                    ptrCtx.lineTo(size * .495327, size * .130841);
                    ptrCtx.lineTo(size * .504672, size * .130841);
                    ptrCtx.lineTo(size * .514018, size * .317757);
                    ptrCtx.lineTo(size * .518691, size * .38785);
                    ptrCtx.lineTo(size * .518691, size * .485981);
                    ptrCtx.lineTo(size * .504672, size * .485981);
                    ptrCtx.lineTo(size * .504672, size * .38785);
                    ptrCtx.lineTo(size * .5, size * .317757);
                    ptrCtx.lineTo(size * .495327, size * .392523);
                    ptrCtx.lineTo(size * .495327, size * .485981);
                    ptrCtx.lineTo(size * .481308, size * .485981);
                    ptrCtx.closePath();
                    ptrCtx.fill();
                    break;
                case "type7":
                    grad = ptrCtx.createLinearGradient(.481308 * size, 0, .518691 * size, 0);
                    grad.addColorStop(0, ptrColor.dark.getRgbaColor());
                    grad.addColorStop(1, ptrColor.medium.getRgbaColor());
                    ptrCtx.fillStyle = grad;
                    ptrCtx.beginPath();
                    ptrCtx.moveTo(size * .490654, size * .130841);
                    ptrCtx.lineTo(size * .481308, size * .5);
                    ptrCtx.lineTo(size * .518691, size * .5);
                    ptrCtx.lineTo(size * .504672, size * .130841);
                    ptrCtx.lineTo(size * .490654, size * .130841);
                    ptrCtx.closePath();
                    ptrCtx.fill();
                    break;
                case "type8":
                    grad = ptrCtx.createLinearGradient(.471962 * size, 0, .528036 * size, 0);
                    grad.addColorStop(0, ptrColor.light.getRgbaColor());
                    grad.addColorStop(.5, ptrColor.light.getRgbaColor());
                    grad.addColorStop(.5, ptrColor.medium.getRgbaColor());
                    grad.addColorStop(1, ptrColor.medium.getRgbaColor());
                    ptrCtx.fillStyle = grad;
                    ptrCtx.strokeStyle = ptrColor.dark.getRgbaColor();
                    ptrCtx.beginPath();
                    ptrCtx.moveTo(size * .5, size * .53271);
                    ptrCtx.lineTo(size * .53271, size * .5);
                    ptrCtx.bezierCurveTo(size * .53271, size * .5, size * .509345, size * .457943, size * .5, size * .149532);
                    ptrCtx.bezierCurveTo(size * .490654, size * .457943, size * .467289, size * .5, size * .467289, size * .5);
                    ptrCtx.lineTo(size * .5, size * .53271);
                    ptrCtx.closePath();
                    ptrCtx.fill();
                    ptrCtx.stroke();
                    break;
                case "type9":
                    grad = ptrCtx.createLinearGradient(.471962 * size, 0, .528036 * size, 0);
                    grad.addColorStop(0, "rgb(50, 50, 50)");
                    grad.addColorStop(.5, "#666666");
                    grad.addColorStop(1, "rgb(50, 50, 50)");
                    ptrCtx.fillStyle = grad;
                    ptrCtx.strokeStyle = "#2E2E2E";
                    ptrCtx.beginPath();
                    ptrCtx.moveTo(size * .495327, size * .233644);
                    ptrCtx.lineTo(size * .504672, size * .233644);
                    ptrCtx.lineTo(size * .514018, size * .439252);
                    ptrCtx.lineTo(size * .485981, size * .439252);
                    ptrCtx.lineTo(size * .495327, size * .233644);
                    ptrCtx.closePath();
                    ptrCtx.moveTo(size * .490654, size * .130841);
                    ptrCtx.lineTo(size * .471962, size * .471962);
                    ptrCtx.lineTo(size * .471962, size * .528037);
                    ptrCtx.bezierCurveTo(size * .471962, size * .528037, size * .476635, size * .602803, size * .476635, size * .602803);
                    ptrCtx.bezierCurveTo(size * .476635, size * .607476, size * .481308, size * .607476, size * .5, size * .607476);
                    ptrCtx.bezierCurveTo(size * .518691, size * .607476, size * .523364, size * .607476, size * .523364, size * .602803);
                    ptrCtx.bezierCurveTo(size * .523364, size * .602803, size * .528037, size * .528037, size * .528037, size * .528037);
                    ptrCtx.lineTo(size * .528037, size * .471962);
                    ptrCtx.lineTo(size * .509345, size * .130841);
                    ptrCtx.lineTo(size * .490654, size * .130841);
                    ptrCtx.closePath();
                    ptrCtx.fill();
                    ptrCtx.beginPath();
                    ptrCtx.moveTo(size * .495327, size * .219626);
                    ptrCtx.lineTo(size * .504672, size * .219626);
                    ptrCtx.lineTo(size * .504672, size * .135514);
                    ptrCtx.lineTo(size * .495327, size * .135514);
                    ptrCtx.lineTo(size * .495327, size * .219626);
                    ptrCtx.closePath();
                    ptrCtx.fillStyle = ptrColor.medium.getRgbaColor();
                    ptrCtx.fill();
                    break;
                case "type10":
                    ptrCtx.beginPath();
                    ptrCtx.moveTo(size * .5, size * .149532);
                    ptrCtx.bezierCurveTo(size * .5, size * .149532, size * .443925, size * .490654, size * .443925, size * .5);
                    ptrCtx.bezierCurveTo(size * .443925, size * .53271, size * .467289, size * .556074, size * .5, size * .556074);
                    ptrCtx.bezierCurveTo(size * .53271, size * .556074, size * .556074, size * .53271, size * .556074, size * .5);
                    ptrCtx.bezierCurveTo(size * .556074, size * .490654, size * .5, size * .149532, size * .5, size * .149532);
                    ptrCtx.closePath();
                    grad = ptrCtx.createLinearGradient(.471962 * size, 0, .528036 * size, 0);
                    grad.addColorStop(0, ptrColor.light.getRgbaColor());
                    grad.addColorStop(.5, ptrColor.light.getRgbaColor());
                    grad.addColorStop(.5, ptrColor.medium.getRgbaColor());
                    grad.addColorStop(1, ptrColor.medium.getRgbaColor());
                    ptrCtx.fillStyle = grad;
                    ptrCtx.strokeStyle = ptrColor.medium.getRgbaColor();
                    ptrCtx.lineWidth = 1;
                    ptrCtx.lineCap = "square";
                    ptrCtx.lineJoin = "miter";
                    ptrCtx.fill();
                    ptrCtx.stroke();
                    break;
                case "type11":
                    ptrCtx.beginPath();
                    ptrCtx.moveTo(.5 * size, .168224 * size);
                    ptrCtx.lineTo(.485981 * size, .5 * size);
                    ptrCtx.bezierCurveTo(.485981 * size, .5 * size, .481308 * size, .584112 * size, .5 * size, .584112 * size);
                    ptrCtx.bezierCurveTo(.514018 * size, .584112 * size, .509345 * size, .5 * size, .509345 * size, .5 * size);
                    ptrCtx.lineTo(.5 * size, .168224 * size);
                    ptrCtx.closePath();
                    grad = ptrCtx.createLinearGradient(0, .168224 * size, 0, .584112 * size);
                    grad.addColorStop(0, ptrColor.medium.getRgbaColor());
                    grad.addColorStop(1, ptrColor.dark.getRgbaColor());
                    ptrCtx.fillStyle = grad;
                    ptrCtx.strokeStyle = ptrColor.dark.getRgbaColor();
                    ptrCtx.fill();
                    ptrCtx.stroke();
                    break;
                case "type12":
                    ptrCtx.beginPath();
                    ptrCtx.moveTo(.5 * size, .168224 * size);
                    ptrCtx.lineTo(.485981 * size, .5 * size);
                    ptrCtx.lineTo(.5 * size, .504672 * size);
                    ptrCtx.lineTo(.509345 * size, .5 * size);
                    ptrCtx.lineTo(.5 * size, .168224 * size);
                    ptrCtx.closePath();
                    grad = ptrCtx.createLinearGradient(0, .168224 * size, 0, .504672 * size);
                    grad.addColorStop(0, ptrColor.medium.getRgbaColor());
                    grad.addColorStop(1, ptrColor.dark.getRgbaColor());
                    ptrCtx.fillStyle = grad;
                    ptrCtx.strokeStyle = ptrColor.dark.getRgbaColor();
                    ptrCtx.fill();
                    ptrCtx.stroke();
                    break;
                case "type13":
                case "type14":
                    ptrCtx.beginPath();
                    ptrCtx.moveTo(.485981 * size, .168224 * size);
                    ptrCtx.lineTo(.5 * size, .130841 * size);
                    ptrCtx.lineTo(.509345 * size, .168224 * size);
                    ptrCtx.lineTo(.509345 * size, .509345 * size);
                    ptrCtx.lineTo(.485981 * size, .509345 * size);
                    ptrCtx.lineTo(.485981 * size, .168224 * size);
                    ptrCtx.closePath();
                    if (ptrType.type === "type13") {
                        grad = ptrCtx.createLinearGradient(0, .5 * size, 0, .130841 * size);
                        grad.addColorStop(0, lblColor.getRgbaColor());
                        grad.addColorStop(.85, lblColor.getRgbaColor());
                        grad.addColorStop(.85, ptrColor.medium.getRgbaColor());
                        grad.addColorStop(1, ptrColor.medium.getRgbaColor());
                        ptrCtx.fillStyle = grad
                    } else {
                        grad = ptrCtx.createLinearGradient(.485981 * size, 0, .509345 * size, 0);
                        grad.addColorStop(0, ptrColor.veryDark.getRgbaColor());
                        grad.addColorStop(.5, ptrColor.light.getRgbaColor());
                        grad.addColorStop(1, ptrColor.veryDark.getRgbaColor());
                        ptrCtx.fillStyle = grad
                    }
                    ptrCtx.fill();
                    break;
                case "type15":
                case "type16":
                    ptrCtx.beginPath();
                    ptrCtx.moveTo(size * .509345, size * .457943);
                    ptrCtx.lineTo(size * .5015, size * .13);
                    ptrCtx.lineTo(size * .4985, size * .13);
                    ptrCtx.lineTo(size * .490654, size * .457943);
                    ptrCtx.bezierCurveTo(size * .490654, size * .457943, size * .490654, size * .457943, size * .490654, size * .457943);
                    ptrCtx.bezierCurveTo(size * .471962, size * .462616, size * .457943, size * .481308, size * .457943, size * .5);
                    ptrCtx.bezierCurveTo(size * .457943, size * .518691, size * .471962, size * .537383, size * .490654, size * .542056);
                    ptrCtx.bezierCurveTo(size * .490654, size * .542056, size * .490654, size * .542056, size * .490654, size * .542056);
                    if (ptrType.type === "type15") {
                        ptrCtx.lineTo(size * .490654, size * .57);
                        ptrCtx.bezierCurveTo(size * .46, size * .58, size * .46, size * .62, size * .490654, size * .63);
                        ptrCtx.bezierCurveTo(size * .47, size * .62, size * .48, size * .59, size * .5, size * .59);
                        ptrCtx.bezierCurveTo(size * .53, size * .59, size * .52, size * .62, size * .509345, size * .63);
                        ptrCtx.bezierCurveTo(size * .54, size * .62, size * .54, size * .58, size * .509345, size * .57);
                        ptrCtx.lineTo(size * .509345, size * .57)
                    } else {
                        ptrCtx.lineTo(size * .490654, size * .621495);
                        ptrCtx.lineTo(size * .509345, size * .621495)
                    }
                    ptrCtx.lineTo(size * .509345, size * .542056);
                    ptrCtx.bezierCurveTo(size * .509345, size * .542056, size * .509345, size * .542056, size * .509345, size * .542056);
                    ptrCtx.bezierCurveTo(size * .528037, size * .537383, size * .542056, size * .518691, size * .542056, size * .5);
                    ptrCtx.bezierCurveTo(size * .542056, size * .481308, size * .528037, size * .462616, size * .509345, size * .457943);
                    ptrCtx.bezierCurveTo(size * .509345, size * .457943, size * .509345, size * .457943, size * .509345, size * .457943);
                    ptrCtx.closePath();
                    if (ptrType.type === "type15") {
                        grad = ptrCtx.createLinearGradient(0, 0, 0, size * .63)
                    } else {
                        grad = ptrCtx.createLinearGradient(0, 0, 0, size * .621495)
                    }
                    grad.addColorStop(0, ptrColor.medium.getRgbaColor());
                    grad.addColorStop(.388888, ptrColor.medium.getRgbaColor());
                    grad.addColorStop(.5, ptrColor.light.getRgbaColor());
                    grad.addColorStop(.611111, ptrColor.medium.getRgbaColor());
                    grad.addColorStop(1, ptrColor.medium.getRgbaColor());
                    ptrCtx.fillStyle = grad;
                    ptrCtx.strokeStyle = ptrColor.dark.getRgbaColor();
                    ptrCtx.fill();
                    ptrCtx.stroke();
                    ptrCtx.beginPath();
                    radius = size * .06542 / 2;
                    ptrCtx.arc(size * .5, size * .5, radius, 0, TWO_PI);
                    grad = ptrCtx.createLinearGradient(size * .5 - radius, size * .5 + radius, 0, size * .5 + radius);
                    grad.addColorStop(0, "#e6b35c");
                    grad.addColorStop(.01, "#e6b35c");
                    grad.addColorStop(.99, "#c48200");
                    grad.addColorStop(1, "#c48200");
                    ptrCtx.fillStyle = grad;
                    ptrCtx.closePath();
                    ptrCtx.fill();
                    ptrCtx.beginPath();
                    radius = size * .046728 / 2;
                    ptrCtx.arc(size * .5, size * .5, radius, 0, TWO_PI);
                    grad = ptrCtx.createRadialGradient(size * .5, size * .5, 0, size * .5, size * .5, radius);
                    grad.addColorStop(0, "#c5c5c5");
                    grad.addColorStop(.19, "#c5c5c5");
                    grad.addColorStop(.22, "#000000");
                    grad.addColorStop(.8, "#000000");
                    grad.addColorStop(.99, "#707070");
                    grad.addColorStop(1, "#707070");
                    ptrCtx.fillStyle = grad;
                    ptrCtx.closePath();
                    ptrCtx.fill();
                    break;
                case "type1":
                default:
                    grad = ptrCtx.createLinearGradient(0, size * .471962, 0, size * .130841);
                    grad.addColorStop(0, ptrColor.veryDark.getRgbaColor());
                    grad.addColorStop(.3, ptrColor.medium.getRgbaColor());
                    grad.addColorStop(.59, ptrColor.medium.getRgbaColor());
                    grad.addColorStop(1, ptrColor.veryDark.getRgbaColor());
                    ptrCtx.fillStyle = grad;
                    ptrCtx.beginPath();
                    ptrCtx.moveTo(size * .518691, size * .471962);
                    ptrCtx.bezierCurveTo(size * .514018, size * .457943, size * .509345, size * .415887, size * .509345, size * .401869);
                    ptrCtx.bezierCurveTo(size * .504672, size * .383177, size * .5, size * .130841, size * .5, size * .130841);
                    ptrCtx.bezierCurveTo(size * .5, size * .130841, size * .490654, size * .383177, size * .490654, size * .397196);
                    ptrCtx.bezierCurveTo(size * .490654, size * .415887, size * .485981, size * .457943, size * .481308, size * .471962);
                    ptrCtx.bezierCurveTo(size * .471962, size * .481308, size * .467289, size * .490654, size * .467289, size * .5);
                    ptrCtx.bezierCurveTo(size * .467289, size * .518691, size * .481308, size * .53271, size * .5, size * .53271);
                    ptrCtx.bezierCurveTo(size * .518691, size * .53271, size * .53271, size * .518691, size * .53271, size * .5);
                    ptrCtx.bezierCurveTo(size * .53271, size * .490654, size * .528037, size * .481308, size * .518691, size * .471962);
                    ptrCtx.closePath();
                    ptrCtx.fill();
                    break
            }
            drawPointerImage.cache[cacheKey] = ptrBuffer
        }
        ctx.drawImage(drawPointerImage.cache[cacheKey], 0, 0);
        return this
    };
    drawPointerImage.cache = {};
    var drawRadialFrameImage = function(ctx, frameDesign, centerX, centerY, imageWidth, imageHeight) {
        var radFBuffer, radFCtx, grad, outerX, innerX, fractions, colors, cacheKey = imageWidth.toString() + imageHeight + frameDesign.design;
        if (!drawRadialFrameImage.cache[cacheKey]) {
            radFBuffer = createBuffer(imageWidth, imageHeight);
            radFCtx = radFBuffer.getContext("2d");
            radFCtx.fillStyle = "#848484";
            radFCtx.strokeStyle = "rgba(132, 132, 132, 0.5)";
            radFCtx.beginPath();
            radFCtx.arc(centerX, centerY, imageWidth / 2, 0, TWO_PI, true);
            radFCtx.closePath();
            radFCtx.fill();
            radFCtx.stroke();
            radFCtx.beginPath();
            radFCtx.arc(centerX, centerY, imageWidth * .990654 / 2, 0, TWO_PI, true);
            radFCtx.closePath();
            switch (frameDesign.design) {
                case "metal":
                    grad = radFCtx.createLinearGradient(0, imageWidth * .004672, 0, imageHeight * .990654);
                    grad.addColorStop(0, "#fefefe");
                    grad.addColorStop(.07, "rgb(210, 210, 210)");
                    grad.addColorStop(.12, "rgb(179, 179, 179)");
                    grad.addColorStop(1, "rgb(213, 213, 213)");
                    radFCtx.fillStyle = grad;
                    radFCtx.fill();
                    break;
                case "brass":
                    grad = radFCtx.createLinearGradient(0, imageWidth * .004672, 0, imageHeight * .990654);
                    grad.addColorStop(0, "rgb(249, 243, 155)");
                    grad.addColorStop(.05, "rgb(246, 226, 101)");
                    grad.addColorStop(.1, "rgb(240, 225, 132)");
                    grad.addColorStop(.5, "rgb(90, 57, 22)");
                    grad.addColorStop(.9, "rgb(249, 237, 139)");
                    grad.addColorStop(.95, "rgb(243, 226, 108)");
                    grad.addColorStop(1, "rgb(202, 182, 113)");
                    radFCtx.fillStyle = grad;
                    radFCtx.fill();
                    break;
                case "steel":
                    grad = radFCtx.createLinearGradient(0, imageWidth * .004672, 0, imageHeight * .990654);
                    grad.addColorStop(0, "rgb(231, 237, 237)");
                    grad.addColorStop(.05, "rgb(189, 199, 198)");
                    grad.addColorStop(.1, "rgb(192, 201, 200)");
                    grad.addColorStop(.5, "rgb(23, 31, 33)");
                    grad.addColorStop(.9, "rgb(196, 205, 204)");
                    grad.addColorStop(.95, "rgb(194, 204, 203)");
                    grad.addColorStop(1, "rgb(189, 201, 199)");
                    radFCtx.fillStyle = grad;
                    radFCtx.fill();
                    break;
                case "gold":
                    grad = radFCtx.createLinearGradient(0, imageWidth * .004672, 0, imageHeight * .990654);
                    grad.addColorStop(0, "rgb(255, 255, 207)");
                    grad.addColorStop(.15, "rgb(255, 237, 96)");
                    grad.addColorStop(.22, "rgb(254, 199, 57)");
                    grad.addColorStop(.3, "rgb(255, 249, 203)");
                    grad.addColorStop(.38, "rgb(255, 199, 64)");
                    grad.addColorStop(.44, "rgb(252, 194, 60)");
                    grad.addColorStop(.51, "rgb(255, 204, 59)");
                    grad.addColorStop(.6, "rgb(213, 134, 29)");
                    grad.addColorStop(.68, "rgb(255, 201, 56)");
                    grad.addColorStop(.75, "rgb(212, 135, 29)");
                    grad.addColorStop(1, "rgb(247, 238, 101)");
                    radFCtx.fillStyle = grad;
                    radFCtx.fill();
                    break;
                case "anthracite":
                    grad = radFCtx.createLinearGradient(0, .004672 * imageHeight, 0, .995326 * imageHeight);
                    grad.addColorStop(0, "rgb(118, 117, 135)");
                    grad.addColorStop(.06, "rgb(74, 74, 82)");
                    grad.addColorStop(.12, "rgb(50, 50, 54)");
                    grad.addColorStop(1, "rgb(79, 79, 87)");
                    radFCtx.fillStyle = grad;
                    radFCtx.fill();
                    break;
                case "tiltedGray":
                    grad = radFCtx.createLinearGradient(.233644 * imageWidth, .084112 * imageHeight, .81258 * imageWidth, .910919 * imageHeight);
                    grad.addColorStop(0, "#ffffff");
                    grad.addColorStop(.07, "rgb(210, 210, 210)");
                    grad.addColorStop(.16, "rgb(179, 179, 179)");
                    grad.addColorStop(.33, "#ffffff");
                    grad.addColorStop(.55, "#c5c5c5");
                    grad.addColorStop(.79, "#ffffff");
                    grad.addColorStop(1, "#666666");
                    radFCtx.fillStyle = grad;
                    radFCtx.fill();
                    break;
                case "tiltedBlack":
                    grad = radFCtx.createLinearGradient(.228971 * imageWidth, .079439 * imageHeight, .802547 * imageWidth, .898591 * imageHeight);
                    grad.addColorStop(0, "#666666");
                    grad.addColorStop(.21, "#000000");
                    grad.addColorStop(.47, "#666666");
                    grad.addColorStop(.99, "#000000");
                    grad.addColorStop(1, "#000000");
                    radFCtx.fillStyle = grad;
                    radFCtx.fill();
                    break;
                case "glossyMetal":
                    grad = radFCtx.createRadialGradient(.5 * imageWidth, .5 * imageHeight, 0, .5 * imageWidth, .5 * imageWidth, .5 * imageWidth);
                    grad.addColorStop(0, "rgb(207, 207, 207)");
                    grad.addColorStop(.96, "rgb(205, 204, 205)");
                    grad.addColorStop(1, "rgb(244, 244, 244)");
                    radFCtx.fillStyle = grad;
                    radFCtx.fill();
                    radFCtx.beginPath();
                    radFCtx.arc(.5 * imageWidth, .5 * imageHeight, .973962 * imageWidth / 2, 0, TWO_PI);
                    radFCtx.closePath();
                    grad = radFCtx.createLinearGradient(0, imageHeight - .971962 * imageHeight, 0, .971962 * imageHeight);
                    grad.addColorStop(0, "rgb(249, 249, 249)");
                    grad.addColorStop(.23, "rgb(200, 195, 191)");
                    grad.addColorStop(.36, "#ffffff");
                    grad.addColorStop(.59, "rgb(29, 29, 29)");
                    grad.addColorStop(.76, "rgb(200, 194, 192)");
                    grad.addColorStop(1, "rgb(209, 209, 209)");
                    radFCtx.fillStyle = grad;
                    radFCtx.fill();
                    radFCtx.beginPath();
                    radFCtx.arc(.5 * imageWidth, .5 * imageHeight, .869158 * imageWidth / 2, 0, TWO_PI);
                    radFCtx.closePath();
                    radFCtx.fillStyle = "#f6f6f6";
                    radFCtx.fill();
                    radFCtx.beginPath();
                    radFCtx.arc(.5 * imageWidth, .5 * imageHeight, .85 * imageWidth / 2, 0, TWO_PI);
                    radFCtx.closePath();
                    radFCtx.fillStyle = "#333333";
                    radFCtx.fill();
                    break;
                case "blackMetal":
                    fractions = [0, .125, .347222, .5, .680555, .875, 1];
                    colors = [new RgbaColor(254, 254, 254, 1), new RgbaColor(0, 0, 0, 1), new RgbaColor(153, 153, 153, 1), new RgbaColor(0, 0, 0, 1), new RgbaColor(153, 153, 153, 1), new RgbaColor(0, 0, 0, 1), new RgbaColor(254, 254, 254, 1)];
                    radFCtx.save();
                    radFCtx.arc(centerX, centerY, imageWidth * .990654 / 2, 0, TWO_PI, true);
                    radFCtx.clip();
                    outerX = imageWidth * .495327;
                    innerX = imageWidth * .42056;
                    grad = new ConicalGradient(fractions, colors);
                    grad.fillCircle(radFCtx, centerX, centerY, innerX, outerX);
                    radFCtx.strokeStyle = "#848484";
                    radFCtx.strokeStyle = "rgba(132, 132, 132, 0.8)";
                    radFCtx.beginPath();
                    radFCtx.lineWidth = imageWidth / 90;
                    radFCtx.arc(centerX, centerY, imageWidth / 2, 0, TWO_PI, true);
                    radFCtx.closePath();
                    radFCtx.stroke();
                    radFCtx.restore();
                    break;
                case "shinyMetal":
                    fractions = [0, .125, .25, .347222, .5, .652777, .75, .875, 1];
                    colors = [new RgbaColor(254, 254, 254, 1), new RgbaColor(210, 210, 210, 1), new RgbaColor(179, 179, 179, 1), new RgbaColor(238, 238, 238, 1), new RgbaColor(160, 160, 160, 1), new RgbaColor(238, 238, 238, 1), new RgbaColor(179, 179, 179, 1), new RgbaColor(210, 210, 210, 1), new RgbaColor(254, 254, 254, 1)];
                    radFCtx.save();
                    radFCtx.arc(centerX, centerY, imageWidth * .990654 / 2, 0, TWO_PI, true);
                    radFCtx.clip();
                    outerX = imageWidth * .495327;
                    innerX = imageWidth * .42056;
                    grad = new ConicalGradient(fractions, colors);
                    grad.fillCircle(radFCtx, centerX, centerY, innerX, outerX);
                    radFCtx.strokeStyle = "#848484";
                    radFCtx.strokeStyle = "rgba(132, 132, 132, 0.8)";
                    radFCtx.beginPath();
                    radFCtx.lineWidth = imageWidth / 90;
                    radFCtx.arc(centerX, centerY, imageWidth / 2, 0, TWO_PI, true);
                    radFCtx.closePath();
                    radFCtx.stroke();
                    radFCtx.restore();
                    break;
                case "chrome":
                    fractions = [0, .09, .12, .16, .25, .29, .33, .38, .48, .52, .63, .68, .8, .83, .87, .97, 1];
                    colors = [new RgbaColor(255, 255, 255, 1), new RgbaColor(255, 255, 255, 1), new RgbaColor(136, 136, 138, 1), new RgbaColor(164, 185, 190, 1), new RgbaColor(158, 179, 182, 1), new RgbaColor(112, 112, 112, 1), new RgbaColor(221, 227, 227, 1), new RgbaColor(155, 176, 179, 1), new RgbaColor(156, 176, 177, 1), new RgbaColor(254, 255, 255, 1), new RgbaColor(255, 255, 255, 1), new RgbaColor(156, 180, 180, 1), new RgbaColor(198, 209, 211, 1), new RgbaColor(246, 248, 247, 1), new RgbaColor(204, 216, 216, 1), new RgbaColor(164, 188, 190, 1), new RgbaColor(255, 255, 255, 1)];
                    radFCtx.save();
                    radFCtx.arc(centerX, centerY, imageWidth * .990654 / 2, 0, TWO_PI, true);
                    radFCtx.clip();
                    outerX = imageWidth * .495327;
                    innerX = imageWidth * .42056;
                    grad = new ConicalGradient(fractions, colors);
                    grad.fillCircle(radFCtx, centerX, centerY, innerX, outerX);
                    radFCtx.strokeStyle = "#848484";
                    radFCtx.strokeStyle = "rgba(132, 132, 132, 0.8)";
                    radFCtx.beginPath();
                    radFCtx.lineWidth = imageWidth / 90;
                    radFCtx.arc(centerX, centerY, imageWidth / 2, 0, TWO_PI, true);
                    radFCtx.closePath();
                    radFCtx.stroke();
                    radFCtx.restore();
                    break
            }
            radFCtx.fillStyle = "rgb(191, 191, 191)";
            radFCtx.beginPath();
            radFCtx.arc(centerX, centerY, imageWidth * .841121 / 2, 0, TWO_PI, true);
            radFCtx.closePath();
            radFCtx.fill();
            radFCtx.globalCompositeOperation = "destination-out";
            radFCtx.beginPath();
            radFCtx.arc(centerX, centerY, imageWidth * .83 / 2, 0, TWO_PI, true);
            radFCtx.closePath();
            radFCtx.fill();
            drawRadialFrameImage.cache[cacheKey] = radFBuffer
        }
        ctx.drawImage(drawRadialFrameImage.cache[cacheKey], 0, 0);
        return this
    };
    drawRadialFrameImage.cache = {};
    var drawRadialBackgroundImage = function(ctx, backgroundColor, centerX, centerY, imageWidth, imageHeight) {
        var radBBuffer, radBCtx, grad, fractions, colors, backgroundOffsetX = imageWidth * .831775 / 2,
            mono, textureColor, texture, radius, turnRadius, stepSize, end, i, cacheKey = imageWidth.toString() + imageHeight + backgroundColor.name;
        if (!drawRadialBackgroundImage.cache[cacheKey]) {
            radBBuffer = createBuffer(imageWidth, imageHeight);
            radBCtx = radBBuffer.getContext("2d");
            radBCtx.beginPath();
            radBCtx.arc(centerX, centerY, backgroundOffsetX, 0, TWO_PI, true);
            radBCtx.closePath();
            if (backgroundColor.name === "CARBON" || backgroundColor.name === "PUNCHED_SHEET" || backgroundColor.name === "BRUSHED_METAL" || backgroundColor.name === "BRUSHED_STAINLESS") {
                if (backgroundColor.name === "CARBON") {
                    radBCtx.fillStyle = radBCtx.createPattern(carbonBuffer, "repeat");
                    radBCtx.fill()
                }
                if (backgroundColor.name === "PUNCHED_SHEET") {
                    radBCtx.fillStyle = radBCtx.createPattern(punchedSheetBuffer, "repeat");
                    radBCtx.fill()
                }
                grad = radBCtx.createLinearGradient(backgroundOffsetX, 0, imageWidth - backgroundOffsetX, 0);
                grad.addColorStop(0, "rgba(0, 0, 0, 0.25)");
                grad.addColorStop(.5, "rgba(0, 0, 0, 0)");
                grad.addColorStop(1, "rgba(0, 0, 0, 0.25)");
                radBCtx.fillStyle = grad;
                radBCtx.beginPath();
                radBCtx.arc(centerX, centerY, backgroundOffsetX, 0, TWO_PI, true);
                radBCtx.closePath();
                radBCtx.fill();
                if (backgroundColor.name === "BRUSHED_METAL" || backgroundColor.name === "BRUSHED_STAINLESS") {
                    mono = backgroundColor.name === "BRUSHED_METAL" ? true : false;
                    textureColor = parseInt(backgroundColor.gradientStop.getHexColor().substr(-6), 16);
                    texture = brushedMetalTexture(textureColor, 5, .1, mono, .5);
                    radBCtx.fillStyle = radBCtx.createPattern(texture.fill(0, 0, imageWidth, imageHeight), "no-repeat");
                    radBCtx.fill()
                }
            } else if (backgroundColor.name === "STAINLESS" || backgroundColor.name === "TURNED") {
                fractions = [0, .03, .1, .14, .24, .33, .38, .5, .62, .67, .76, .81, .85, .97, 1];
                colors = [new RgbaColor("#FDFDFD"), new RgbaColor("#FDFDFD"), new RgbaColor("#B2B2B4"), new RgbaColor("#ACACAE"), new RgbaColor("#FDFDFD"), new RgbaColor("#8E8E8E"), new RgbaColor("#8E8E8E"), new RgbaColor("#FDFDFD"), new RgbaColor("#8E8E8E"), new RgbaColor("#8E8E8E"), new RgbaColor("#FDFDFD"), new RgbaColor("#ACACAE"), new RgbaColor("#B2B2B4"), new RgbaColor("#FDFDFD"), new RgbaColor("#FDFDFD")];
                grad = new ConicalGradient(fractions, colors);
                grad.fillCircle(radBCtx, centerX, centerY, 0, backgroundOffsetX);
                if (backgroundColor.name === "TURNED") {
                    radius = backgroundOffsetX;
                    turnRadius = radius * .55;
                    stepSize = RAD_FACTOR * (500 / radius);
                    radBCtx.save();
                    radBCtx.beginPath();
                    radBCtx.arc(centerX, centerY, radius, 0, TWO_PI);
                    radBCtx.closePath();
                    radBCtx.clip();
                    radBCtx.lineWidth = .5;
                    end = TWO_PI - stepSize * .3;
                    for (i = 0; i < end; i += stepSize) {
                        radBCtx.strokeStyle = "rgba(240, 240, 255, 0.25)";
                        radBCtx.beginPath();
                        radBCtx.arc(centerX + turnRadius, centerY, turnRadius, 0, TWO_PI);
                        radBCtx.stroke();
                        radBCtx.translate(centerX, centerY);
                        radBCtx.rotate(stepSize * .3);
                        radBCtx.translate(-centerX, -centerY);
                        radBCtx.strokeStyle = "rgba(25, 10, 10, 0.1)";
                        radBCtx.beginPath();
                        radBCtx.arc(centerX + turnRadius, centerY, turnRadius, 0, TWO_PI);
                        radBCtx.stroke();
                        radBCtx.translate(centerX, centerY);
                        radBCtx.rotate(stepSize - stepSize * .3);
                        radBCtx.translate(-centerX, -centerY)
                    }
                    radBCtx.restore()
                }
            } else {
                grad = radBCtx.createLinearGradient(0, imageWidth * .084112, 0, backgroundOffsetX * 2);
                grad.addColorStop(0, backgroundColor.gradientStart.getRgbaColor());
                grad.addColorStop(.4, backgroundColor.gradientFraction.getRgbaColor());
                grad.addColorStop(1, backgroundColor.gradientStop.getRgbaColor());
                radBCtx.fillStyle = grad;
                radBCtx.fill()
            }
            grad = radBCtx.createRadialGradient(centerX, centerY, 0, centerX, centerY, backgroundOffsetX);
            grad.addColorStop(0, "rgba(0, 0, 0, 0)");
            grad.addColorStop(.7, "rgba(0, 0, 0, 0)");
            grad.addColorStop(.71, "rgba(0, 0, 0, 0)");
            grad.addColorStop(.86, "rgba(0, 0, 0, 0.03)");
            grad.addColorStop(.92, "rgba(0, 0, 0, 0.07)");
            grad.addColorStop(.97, "rgba(0, 0, 0, 0.15)");
            grad.addColorStop(1, "rgba(0, 0, 0, 0.3)");
            radBCtx.fillStyle = grad;
            radBCtx.beginPath();
            radBCtx.arc(centerX, centerY, backgroundOffsetX, 0, TWO_PI, true);
            radBCtx.closePath();
            radBCtx.fill();
            drawRadialBackgroundImage.cache[cacheKey] = radBBuffer
        }
        ctx.drawImage(drawRadialBackgroundImage.cache[cacheKey], 0, 0);
        return this
    };
    drawRadialBackgroundImage.cache = {};
    var drawRadialCustomImage = function(ctx, img, centerX, centerY, imageWidth, imageHeight) {
        var drawWidth = imageWidth * .831775,
            drawHeight = imageHeight * .831775,
            x = (imageWidth - drawWidth) / 2,
            y = (imageHeight - drawHeight) / 2;
        if (img !== null && img.height > 0 && img.width > 0) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, centerY, imageWidth * .831775 / 2, 0, TWO_PI, true);
            ctx.clip();
            ctx.drawImage(img, x, y, drawWidth, drawHeight);
            ctx.restore()
        }
        return this
    };
    var drawRadialForegroundImage = function(ctx, foregroundType, imageWidth, imageHeight, withCenterKnob, knob, style, gaugeType, orientation) {
        var radFgBuffer, radFgCtx, knobSize = Math.ceil(imageHeight * .084112),
            knobX = imageWidth * .5 - knobSize / 2,
            knobY = imageHeight * .5 - knobSize / 2,
            shadowOffset = imageWidth * .008,
            gradHighlight, gradHighlight2, cacheKey = foregroundType.type + imageWidth + imageHeight + withCenterKnob + (knob !== undefined ? knob.type : "-") + (style !== undefined ? style.style : "-") + (orientation !== undefined ? orientation.type : "-");
        if (!drawRadialForegroundImage.cache[cacheKey]) {
            radFgBuffer = createBuffer(imageWidth, imageHeight);
            radFgCtx = radFgBuffer.getContext("2d");
            if (withCenterKnob) {
                radFgCtx.shadowColor = "rgba(0, 0, 0, 0.8)";
                radFgCtx.shadowOffsetX = radFgCtx.shadowOffsetY = shadowOffset;
                radFgCtx.shadowBlur = shadowOffset * 2;
                if (gaugeType === steelseries.GaugeType.TYPE5) {
                    if (steelseries.Orientation.WEST === orientation) {
                        knobX = imageWidth * .733644 - knobSize / 2;
                        radFgCtx.drawImage(createKnobImage(knobSize, knob, style), knobX, knobY)
                    } else if (steelseries.Orientation.EAST === orientation) {
                        knobX = imageWidth * (1 - .733644) - knobSize / 2;
                        radFgCtx.drawImage(createKnobImage(knobSize, knob, style), knobX, knobY)
                    } else {
                        knobY = imageHeight * .733644 - knobSize / 2;
                        radFgCtx.drawImage(createKnobImage(knobSize, knob, style), knobX, imageHeight * .6857)
                    }
                } else {
                    radFgCtx.drawImage(createKnobImage(knobSize, knob, style), knobX, knobY)
                }
                radFgCtx.shadowOffsetX = radFgCtx.shadowOffsetY = 0;
                radFgCtx.shadowBlur = 0
            }
            switch (foregroundType.type) {
                case "type2":
                    radFgCtx.beginPath();
                    radFgCtx.moveTo(imageWidth * .135514, imageHeight * .696261);
                    radFgCtx.bezierCurveTo(imageWidth * .214953, imageHeight * .588785, imageWidth * .317757, imageHeight * .5, imageWidth * .462616, imageHeight * .425233);
                    radFgCtx.bezierCurveTo(imageWidth * .612149, imageHeight * .345794, imageWidth * .733644, imageHeight * .317757, imageWidth * .873831, imageHeight * .322429);
                    radFgCtx.bezierCurveTo(imageWidth * .766355, imageHeight * .112149, imageWidth * .528037, imageHeight * .023364, imageWidth * .313084, imageHeight * .130841);
                    radFgCtx.bezierCurveTo(imageWidth * .09813, imageHeight * .238317, imageWidth * .028037, imageHeight * .485981, imageWidth * .135514, imageHeight * .696261);
                    radFgCtx.closePath();
                    gradHighlight = radFgCtx.createLinearGradient(.313084 * imageWidth, .135514 * imageHeight, .495528 * imageWidth, .493582 * imageHeight);
                    gradHighlight.addColorStop(0, "rgba(255, 255, 255, 0.275)");
                    gradHighlight.addColorStop(1, "rgba(255, 255, 255, 0.015)");
                    break;
                case "type3":
                    radFgCtx.beginPath();
                    radFgCtx.moveTo(imageWidth * .084112, imageHeight * .509345);
                    radFgCtx.bezierCurveTo(imageWidth * .21028, imageHeight * .556074, imageWidth * .462616, imageHeight * .560747, imageWidth * .5, imageHeight * .560747);
                    radFgCtx.bezierCurveTo(imageWidth * .537383, imageHeight * .560747, imageWidth * .794392, imageHeight * .560747, imageWidth * .915887, imageHeight * .509345);
                    radFgCtx.bezierCurveTo(imageWidth * .915887, imageHeight * .2757, imageWidth * .738317, imageHeight * .084112, imageWidth * .5, imageHeight * .084112);
                    radFgCtx.bezierCurveTo(imageWidth * .261682, imageHeight * .084112, imageWidth * .084112, imageHeight * .2757, imageWidth * .084112, imageHeight * .509345);
                    radFgCtx.closePath();
                    gradHighlight = radFgCtx.createLinearGradient(0, .093457 * imageHeight, 0, .556073 * imageHeight);
                    gradHighlight.addColorStop(0, "rgba(255, 255, 255, 0.275)");
                    gradHighlight.addColorStop(1, "rgba(255, 255, 255, 0.015)");
                    break;
                case "type4":
                    radFgCtx.beginPath();
                    radFgCtx.moveTo(imageWidth * .67757, imageHeight * .24299);
                    radFgCtx.bezierCurveTo(imageWidth * .771028, imageHeight * .308411, imageWidth * .822429, imageHeight * .411214, imageWidth * .813084, imageHeight * .528037);
                    radFgCtx.bezierCurveTo(imageWidth * .799065, imageHeight * .654205, imageWidth * .719626, imageHeight * .757009, imageWidth * .593457, imageHeight * .799065);
                    radFgCtx.bezierCurveTo(imageWidth * .485981, imageHeight * .831775, imageWidth * .369158, imageHeight * .808411, imageWidth * .285046, imageHeight * .728971);
                    radFgCtx.bezierCurveTo(imageWidth * .2757, imageHeight * .719626, imageWidth * .252336, imageHeight * .714953, imageWidth * .233644, imageHeight * .728971);
                    radFgCtx.bezierCurveTo(imageWidth * .214953, imageHeight * .747663, imageWidth * .219626, imageHeight * .771028, imageWidth * .228971, imageHeight * .7757);
                    radFgCtx.bezierCurveTo(imageWidth * .331775, imageHeight * .878504, imageWidth * .476635, imageHeight * .915887, imageWidth * .616822, imageHeight * .869158);
                    radFgCtx.bezierCurveTo(imageWidth * .771028, imageHeight * .822429, imageWidth * .873831, imageHeight * .691588, imageWidth * .88785, imageHeight * .53271);
                    radFgCtx.bezierCurveTo(imageWidth * .897196, imageHeight * .38785, imageWidth * .836448, imageHeight * .257009, imageWidth * .719626, imageHeight * .182242);
                    radFgCtx.bezierCurveTo(imageWidth * .705607, imageHeight * .172897, imageWidth * .682242, imageHeight * .163551, imageWidth * .663551, imageHeight * .186915);
                    radFgCtx.bezierCurveTo(imageWidth * .654205, imageHeight * .205607, imageWidth * .668224, imageHeight * .238317, imageWidth * .67757, imageHeight * .24299);
                    radFgCtx.closePath();
                    gradHighlight = radFgCtx.createRadialGradient(.5 * imageWidth, .5 * imageHeight, 0, .5 * imageWidth, .5 * imageHeight, .38785 * imageWidth);
                    gradHighlight.addColorStop(0, "rgba(255, 255, 255, 0)");
                    gradHighlight.addColorStop(.82, "rgba(255, 255, 255, 0)");
                    gradHighlight.addColorStop(.83, "rgba(255, 255, 255, 0)");
                    gradHighlight.addColorStop(1, "rgba(255, 255, 255, 0.15)");
                    radFgCtx.beginPath();
                    radFgCtx.moveTo(imageWidth * .261682, imageHeight * .224299);
                    radFgCtx.bezierCurveTo(imageWidth * .285046, imageHeight * .238317, imageWidth * .252336, imageHeight * .285046, imageWidth * .24299, imageHeight * .317757);
                    radFgCtx.bezierCurveTo(imageWidth * .24299, imageHeight * .350467, imageWidth * .271028, imageHeight * .383177, imageWidth * .271028, imageHeight * .397196);
                    radFgCtx.bezierCurveTo(imageWidth * .2757, imageHeight * .415887, imageWidth * .261682, imageHeight * .457943, imageWidth * .238317, imageHeight * .509345);
                    radFgCtx.bezierCurveTo(imageWidth * .224299, imageHeight * .542056, imageWidth * .17757, imageHeight * .612149, imageWidth * .158878, imageHeight * .612149);
                    radFgCtx.bezierCurveTo(imageWidth * .144859, imageHeight * .612149, imageWidth * .088785, imageHeight * .546728, imageWidth * .130841, imageHeight * .369158);
                    radFgCtx.bezierCurveTo(imageWidth * .140186, imageHeight * .336448, imageWidth * .214953, imageHeight * .200934, imageWidth * .261682, imageHeight * .224299);
                    radFgCtx.closePath();
                    gradHighlight2 = radFgCtx.createLinearGradient(.130841 * imageWidth, .369158 * imageHeight, .273839 * imageWidth, .412877 * imageHeight);
                    gradHighlight2.addColorStop(0, "rgba(255, 255, 255, 0.275)");
                    gradHighlight2.addColorStop(1, "rgba(255, 255, 255, 0.015)");
                    radFgCtx.fillStyle = gradHighlight2;
                    radFgCtx.fill();
                    break;
                case "type5":
                    radFgCtx.beginPath();
                    radFgCtx.moveTo(imageWidth * .084112, imageHeight * .5);
                    radFgCtx.bezierCurveTo(imageWidth * .084112, imageHeight * .271028, imageWidth * .271028, imageHeight * .084112, imageWidth * .5, imageHeight * .084112);
                    radFgCtx.bezierCurveTo(imageWidth * .700934, imageHeight * .084112, imageWidth * .864485, imageHeight * .224299, imageWidth * .906542, imageHeight * .411214);
                    radFgCtx.bezierCurveTo(imageWidth * .911214, imageHeight * .439252, imageWidth * .911214, imageHeight * .518691, imageWidth * .845794, imageHeight * .537383);
                    radFgCtx.bezierCurveTo(imageWidth * .794392, imageHeight * .546728, imageWidth * .551401, imageHeight * .411214, imageWidth * .392523, imageHeight * .457943);
                    radFgCtx.bezierCurveTo(imageWidth * .168224, imageHeight * .509345, imageWidth * .135514, imageHeight * .7757, imageWidth * .093457, imageHeight * .593457);
                    radFgCtx.bezierCurveTo(imageWidth * .088785, imageHeight * .560747, imageWidth * .084112, imageHeight * .53271, imageWidth * .084112, imageHeight * .5);
                    radFgCtx.closePath();
                    gradHighlight = radFgCtx.createLinearGradient(0, .084112 * imageHeight, 0, .644859 * imageHeight);
                    gradHighlight.addColorStop(0, "rgba(255, 255, 255, 0.275)");
                    gradHighlight.addColorStop(1, "rgba(255, 255, 255, 0.015)");
                    break;
                case "type1":
                default:
                    radFgCtx.beginPath();
                    radFgCtx.moveTo(imageWidth * .084112, imageHeight * .509345);
                    radFgCtx.bezierCurveTo(imageWidth * .205607, imageHeight * .448598, imageWidth * .336448, imageHeight * .415887, imageWidth * .5, imageHeight * .415887);
                    radFgCtx.bezierCurveTo(imageWidth * .672897, imageHeight * .415887, imageWidth * .789719, imageHeight * .443925, imageWidth * .915887, imageHeight * .509345);
                    radFgCtx.bezierCurveTo(imageWidth * .915887, imageHeight * .2757, imageWidth * .738317, imageHeight * .084112, imageWidth * .5, imageHeight * .084112);
                    radFgCtx.bezierCurveTo(imageWidth * .261682, imageHeight * .084112, imageWidth * .084112, imageHeight * .2757, imageWidth * .084112, imageHeight * .509345);
                    radFgCtx.closePath();
                    gradHighlight = radFgCtx.createLinearGradient(0, .088785 * imageHeight, 0, .490654 * imageHeight);
                    gradHighlight.addColorStop(0, "rgba(255, 255, 255, 0.275)");
                    gradHighlight.addColorStop(1, "rgba(255, 255, 255, 0.015)");
                    break
            }
            radFgCtx.fillStyle = gradHighlight;
            radFgCtx.fill();
            drawRadialForegroundImage.cache[cacheKey] = radFgBuffer
        }
        ctx.drawImage(drawRadialForegroundImage.cache[cacheKey], 0, 0);
        return this
    };
    drawRadialForegroundImage.cache = {};
    var createKnobImage = function(size, knob, style) {
        var knobBuffer, knobCtx, maxPostCenterX = size / 2,
            maxPostCenterY = size / 2,
            grad, cacheKey = size.toString() + knob.type + style.style;
        if (!createKnobImage.cache[cacheKey]) {
            knobBuffer = createBuffer(size * 1.18889, size * 1.18889);
            knobCtx = knobBuffer.getContext("2d");
            switch (knob.type) {
                case "metalKnob":
                    knobCtx.beginPath();
                    knobCtx.moveTo(0, size * .5);
                    knobCtx.bezierCurveTo(0, size * .222222, size * .222222, 0, size * .5, 0);
                    knobCtx.bezierCurveTo(size * .777777, 0, size, size * .222222, size, size * .5);
                    knobCtx.bezierCurveTo(size, size * .777777, size * .777777, size, size * .5, size);
                    knobCtx.bezierCurveTo(size * .222222, size, 0, size * .777777, 0, size * .5);
                    knobCtx.closePath();
                    grad = knobCtx.createLinearGradient(0, 0, 0, size);
                    grad.addColorStop(0, "rgb(92, 95, 101)");
                    grad.addColorStop(.47, "rgb(46, 49, 53)");
                    grad.addColorStop(1, "rgb(22, 23, 26)");
                    knobCtx.fillStyle = grad;
                    knobCtx.fill();
                    knobCtx.beginPath();
                    knobCtx.moveTo(size * .055555, size * .5);
                    knobCtx.bezierCurveTo(size * .055555, size * .277777, size * .277777, size * .055555, size * .5, size * .055555);
                    knobCtx.bezierCurveTo(size * .722222, size * .055555, size * .944444, size * .277777, size * .944444, size * .5);
                    knobCtx.bezierCurveTo(size * .944444, size * .722222, size * .722222, size * .944444, size * .5, size * .944444);
                    knobCtx.bezierCurveTo(size * .277777, size * .944444, size * .055555, size * .722222, size * .055555, size * .5);
                    knobCtx.closePath();
                    grad = knobCtx.createLinearGradient(0, .055555 * size, 0, .944443 * size);
                    switch (style.style) {
                        case "black":
                            grad.addColorStop(0, "rgb(43, 42, 47)");
                            grad.addColorStop(1, "rgb(26, 27, 32)");
                            break;
                        case "brass":
                            grad.addColorStop(0, "rgb(150, 110, 54)");
                            grad.addColorStop(1, "rgb(124, 95, 61)");
                            break;
                        case "silver":
                        default:
                            grad.addColorStop(0, "rgb(204, 204, 204)");
                            grad.addColorStop(1, "rgb(87, 92, 98)");
                            break
                    }
                    knobCtx.fillStyle = grad;
                    knobCtx.fill();
                    knobCtx.beginPath();
                    knobCtx.moveTo(size * .777777, size * .833333);
                    knobCtx.bezierCurveTo(size * .722222, size * .722222, size * .611111, size * .666666, size * .5, size * .666666);
                    knobCtx.bezierCurveTo(size * .388888, size * .666666, size * .277777, size * .722222, size * .222222, size * .833333);
                    knobCtx.bezierCurveTo(size * .277777, size * .888888, size * .388888, size * .944444, size * .5, size * .944444);
                    knobCtx.bezierCurveTo(size * .611111, size * .944444, size * .722222, size * .888888, size * .777777, size * .833333);
                    knobCtx.closePath();
                    grad = knobCtx.createRadialGradient(.555555 * size, .944444 * size, 0, .555555 * size, .944444 * size, .388888 * size);
                    grad.addColorStop(0, "rgba(255, 255, 255, 0.6)");
                    grad.addColorStop(1, "rgba(255, 255, 255, 0)");
                    knobCtx.fillStyle = grad;
                    knobCtx.fill();
                    knobCtx.beginPath();
                    knobCtx.moveTo(size * .944444, size * .277777);
                    knobCtx.bezierCurveTo(size * .833333, size * .111111, size * .666666, 0, size * .5, 0);
                    knobCtx.bezierCurveTo(size * .333333, 0, size * .166666, size * .111111, size * .055555, size * .277777);
                    knobCtx.bezierCurveTo(size * .166666, size * .333333, size * .333333, size * .388888, size * .5, size * .388888);
                    knobCtx.bezierCurveTo(size * .666666, size * .388888, size * .833333, size * .333333, size * .944444, size * .277777);
                    knobCtx.closePath();
                    grad = knobCtx.createRadialGradient(.5 * size, 0, 0, .5 * size, 0, .583333 * size);
                    grad.addColorStop(0, "rgba(255, 255, 255, 0.749019)");
                    grad.addColorStop(1, "rgba(255, 255, 255, 0)");
                    knobCtx.fillStyle = grad;
                    knobCtx.fill();
                    knobCtx.beginPath();
                    knobCtx.moveTo(size * .277777, size * .555555);
                    knobCtx.bezierCurveTo(size * .277777, size * .388888, size * .388888, size * .277777, size * .5, size * .277777);
                    knobCtx.bezierCurveTo(size * .611111, size * .277777, size * .777777, size * .388888, size * .777777, size * .555555);
                    knobCtx.bezierCurveTo(size * .777777, size * .666666, size * .611111, size * .777777, size * .5, size * .777777);
                    knobCtx.bezierCurveTo(size * .388888, size * .777777, size * .277777, size * .666666, size * .277777, size * .555555);
                    knobCtx.closePath();
                    grad = knobCtx.createLinearGradient(0, .277777 * size, 0, .722221 * size);
                    grad.addColorStop(0, "#000000");
                    grad.addColorStop(1, "rgb(204, 204, 204)");
                    knobCtx.fillStyle = grad;
                    knobCtx.fill();
                    knobCtx.beginPath();
                    knobCtx.moveTo(size * .333333, size * .555555);
                    knobCtx.bezierCurveTo(size * .333333, size * .444444, size * .388888, size * .333333, size * .5, size * .333333);
                    knobCtx.bezierCurveTo(size * .611111, size * .333333, size * .722222, size * .444444, size * .722222, size * .555555);
                    knobCtx.bezierCurveTo(size * .722222, size * .611111, size * .611111, size * .722222, size * .5, size * .722222);
                    knobCtx.bezierCurveTo(size * .388888, size * .722222, size * .333333, size * .611111, size * .333333, size * .555555);
                    knobCtx.closePath();
                    grad = knobCtx.createLinearGradient(0, .333333 * size, 0, .666666 * size);
                    grad.addColorStop(0, "rgb(10, 9, 1)");
                    grad.addColorStop(1, "rgb(42, 41, 37)");
                    knobCtx.fillStyle = grad;
                    knobCtx.fill();
                    break;
                case "standardKnob":
                    grad = knobCtx.createLinearGradient(0, 0, 0, size);
                    grad.addColorStop(0, "rgb(180, 180, 180)");
                    grad.addColorStop(.46, "rgb(63, 63, 63)");
                    grad.addColorStop(1, "rgb(40, 40, 40)");
                    knobCtx.fillStyle = grad;
                    knobCtx.beginPath();
                    knobCtx.arc(maxPostCenterX, maxPostCenterY, size / 2, 0, TWO_PI, true);
                    knobCtx.closePath();
                    knobCtx.fill();
                    grad = knobCtx.createLinearGradient(0, size - size * .77, 0, size - size * .77 + size * .77);
                    switch (style.style) {
                        case "black":
                            grad.addColorStop(0, "rgb(191, 191, 191)");
                            grad.addColorStop(.5, "rgb(45, 44, 49)");
                            grad.addColorStop(1, "rgb(125, 126, 128)");
                            break;
                        case "brass":
                            grad.addColorStop(0, "rgb(223, 208, 174)");
                            grad.addColorStop(.5, "rgb(123, 95, 63)");
                            grad.addColorStop(1, "rgb(207, 190, 157)");
                            break;
                        case "silver":
                        default:
                            grad.addColorStop(0, "rgb(215, 215, 215)");
                            grad.addColorStop(.5, "rgb(116, 116, 116)");
                            grad.addColorStop(1, "rgb(215, 215, 215)");
                            break
                    }
                    knobCtx.fillStyle = grad;
                    knobCtx.beginPath();
                    knobCtx.arc(maxPostCenterX, maxPostCenterY, size * .77 / 2, 0, TWO_PI, true);
                    knobCtx.closePath();
                    knobCtx.fill();
                    grad = knobCtx.createRadialGradient(maxPostCenterX, maxPostCenterY, 0, maxPostCenterX, maxPostCenterY, size * .77 / 2);
                    grad.addColorStop(0, "rgba(0, 0, 0, 0)");
                    grad.addColorStop(.75, "rgba(0, 0, 0, 0)");
                    grad.addColorStop(.76, "rgba(0, 0, 0, 0.01)");
                    grad.addColorStop(1, "rgba(0, 0, 0, 0.2)");
                    knobCtx.fillStyle = grad;
                    knobCtx.beginPath();
                    knobCtx.arc(maxPostCenterX, maxPostCenterY, size * .77 / 2, 0, TWO_PI, true);
                    knobCtx.closePath();
                    knobCtx.fill();
                    break
            }
            createKnobImage.cache[cacheKey] = knobBuffer
        }
        return createKnobImage.cache[cacheKey]
    };
    createKnobImage.cache = {};
    var createLedImage = function(size, state, ledColor) {
        var ledBuffer, ledCtx, ledCenterX = 2 * Math.round(size / 4),
            ledCenterY = 2 * Math.round(size / 4),
            grad, cacheKey = size.toString() + state + ledColor.outerColor_ON;
        if (!createLedImage.cache[cacheKey]) {
            ledBuffer = createBuffer(size, size);
            ledCtx = ledBuffer.getContext("2d");
            switch (state) {
                case 0:
                    grad = ledCtx.createRadialGradient(ledCenterX, ledCenterY, 0, ledCenterX, ledCenterY, size * .5 / 2);
                    grad.addColorStop(0, ledColor.innerColor1_OFF);
                    grad.addColorStop(.2, ledColor.innerColor2_OFF);
                    grad.addColorStop(1, ledColor.outerColor_OFF);
                    ledCtx.fillStyle = grad;
                    ledCtx.beginPath();
                    ledCtx.arc(ledCenterX, ledCenterY, size * .5 / 2, 0, TWO_PI, true);
                    ledCtx.closePath();
                    ledCtx.fill();
                    grad = ledCtx.createRadialGradient(ledCenterX, ledCenterY, 0, ledCenterX, ledCenterY, size * .5 / 2);
                    grad.addColorStop(0, "rgba(0, 0, 0, 0)");
                    grad.addColorStop(.8, "rgba(0, 0, 0, 0)");
                    grad.addColorStop(1, "rgba(0, 0, 0, 0.4)");
                    ledCtx.fillStyle = grad;
                    ledCtx.beginPath();
                    ledCtx.arc(ledCenterX, ledCenterY, size * .5 / 2, 0, TWO_PI, true);
                    ledCtx.closePath();
                    ledCtx.fill();
                    grad = ledCtx.createLinearGradient(0, .35 * size, 0, .35 * size + .15 * size);
                    grad.addColorStop(0, "rgba(255, 255, 255, 0.4)");
                    grad.addColorStop(1, "rgba(255, 255, 255, 0)");
                    ledCtx.fillStyle = grad;
                    ledCtx.beginPath();
                    ledCtx.arc(ledCenterX, .35 * size + .2 * size / 2, size * .2, 0, TWO_PI, true);
                    ledCtx.closePath();
                    ledCtx.fill();
                    break;
                case 1:
                    grad = ledCtx.createRadialGradient(ledCenterX, ledCenterY, 0, ledCenterX, ledCenterY, size * .5 / 2);
                    grad.addColorStop(0, ledColor.innerColor1_ON);
                    grad.addColorStop(.2, ledColor.innerColor2_ON);
                    grad.addColorStop(1, ledColor.outerColor_ON);
                    ledCtx.fillStyle = grad;
                    ledCtx.beginPath();
                    ledCtx.arc(ledCenterX, ledCenterY, size * .5 / 2, 0, TWO_PI, true);
                    ledCtx.closePath();
                    ledCtx.fill();
                    grad = ledCtx.createRadialGradient(ledCenterX, ledCenterY, 0, ledCenterX, ledCenterY, size * .5 / 2);
                    grad.addColorStop(0, "rgba(0, 0, 0, 0)");
                    grad.addColorStop(.8, "rgba(0, 0, 0, 0)");
                    grad.addColorStop(1, "rgba(0, 0, 0, 0.4)");
                    ledCtx.fillStyle = grad;
                    ledCtx.beginPath();
                    ledCtx.arc(ledCenterX, ledCenterY, size * .5 / 2, 0, TWO_PI, true);
                    ledCtx.closePath();
                    ledCtx.fill();
                    grad = ledCtx.createLinearGradient(0, .35 * size, 0, .35 * size + .15 * size);
                    grad.addColorStop(0, "rgba(255, 255, 255, 0.4)");
                    grad.addColorStop(1, "rgba(255, 255, 255, 0)");
                    ledCtx.fillStyle = grad;
                    ledCtx.beginPath();
                    ledCtx.arc(ledCenterX, .35 * size + .2 * size / 2, size * .2, 0, TWO_PI, true);
                    ledCtx.closePath();
                    ledCtx.fill();
                    grad = ledCtx.createRadialGradient(ledCenterX, ledCenterY, 0, ledCenterX, ledCenterY, size / 2);
                    grad.addColorStop(0, setAlpha(ledColor.coronaColor, 0));
                    grad.addColorStop(.6, setAlpha(ledColor.coronaColor, .4));
                    grad.addColorStop(.7, setAlpha(ledColor.coronaColor, .25));
                    grad.addColorStop(.8, setAlpha(ledColor.coronaColor, .15));
                    grad.addColorStop(.85, setAlpha(ledColor.coronaColor, .05));
                    grad.addColorStop(1, setAlpha(ledColor.coronaColor, 0));
                    ledCtx.fillStyle = grad;
                    ledCtx.beginPath();
                    ledCtx.arc(ledCenterX, ledCenterY, size / 2, 0, TWO_PI, true);
                    ledCtx.closePath();
                    ledCtx.fill();
                    break
            }
            createLedImage.cache[cacheKey] = ledBuffer
        }
        return createLedImage.cache[cacheKey]
    };
    createLedImage.cache = {};
    var createLcdBackgroundImage = function(width, height, lcdColor) {
        var lcdBuffer, lcdCtx, xB = 0,
            yB = 0,
            wB = width,
            hB = height,
            rB = Math.min(width, height) * .095,
            grad, xF = 1,
            yF = 1,
            wF = width - 2,
            hF = height - 2,
            rF = rB - 1,
            cacheKey = width.toString() + height + JSON.stringify(lcdColor);
        if (!createLcdBackgroundImage.cache[cacheKey]) {
            lcdBuffer = createBuffer(width, height);
            lcdCtx = lcdBuffer.getContext("2d");
            grad = lcdCtx.createLinearGradient(0, yB, 0, yB + hB);
            grad.addColorStop(0, "#4c4c4c");
            grad.addColorStop(.08, "#666666");
            grad.addColorStop(.92, "#666666");
            grad.addColorStop(1, "#e6e6e6");
            lcdCtx.fillStyle = grad;
            roundedRectangle(lcdCtx, xB, yB, wB, hB, rB);
            lcdCtx.fill();
            grad = lcdCtx.createLinearGradient(0, yF, 0, yF + hF);
            grad.addColorStop(0, lcdColor.gradientStartColor);
            grad.addColorStop(.03, lcdColor.gradientFraction1Color);
            grad.addColorStop(.49, lcdColor.gradientFraction2Color);
            grad.addColorStop(.5, lcdColor.gradientFraction3Color);
            grad.addColorStop(1, lcdColor.gradientStopColor);
            lcdCtx.fillStyle = grad;
            roundedRectangle(lcdCtx, xF, yF, wF, hF, rF);
            lcdCtx.fill();
            createLcdBackgroundImage.cache[cacheKey] = lcdBuffer
        }
        return createLcdBackgroundImage.cache[cacheKey]
    };
    createLcdBackgroundImage.cache = {};
    var createMeasuredValueImage = function(size, indicatorColor, radial, vertical) {
        var indicatorBuffer, indicatorCtx, cacheKey = size.toString() + indicatorColor + radial + vertical;
        if (!createMeasuredValueImage.cache[cacheKey]) {
            indicatorBuffer = doc.createElement("canvas");
            indicatorCtx = indicatorBuffer.getContext("2d");
            indicatorBuffer.width = size;
            indicatorBuffer.height = size;
            indicatorCtx.fillStyle = indicatorColor;
            if (radial) {
                indicatorCtx.beginPath();
                indicatorCtx.moveTo(size * .5, size);
                indicatorCtx.lineTo(0, 0);
                indicatorCtx.lineTo(size, 0);
                indicatorCtx.closePath();
                indicatorCtx.fill()
            } else {
                if (vertical) {
                    indicatorCtx.beginPath();
                    indicatorCtx.moveTo(size, size * .5);
                    indicatorCtx.lineTo(0, 0);
                    indicatorCtx.lineTo(0, size);
                    indicatorCtx.closePath();
                    indicatorCtx.fill()
                } else {
                    indicatorCtx.beginPath();
                    indicatorCtx.moveTo(size * .5, 0);
                    indicatorCtx.lineTo(size, size);
                    indicatorCtx.lineTo(0, size);
                    indicatorCtx.closePath();
                    indicatorCtx.fill()
                }
            }
            createMeasuredValueImage.cache[cacheKey] = indicatorBuffer
        }
        return createMeasuredValueImage.cache[cacheKey]
    };
    createMeasuredValueImage.cache = {};
    var createTrendIndicator = function(width, onSection, colors) {
        var height = width * 2,
            trendBuffer, trendCtx, fill, cacheKey = onSection.state + width + JSON.stringify(colors),
            drawUpArrow = function() {
                var ledColor = colors[0];
                if (onSection.state === "up") {
                    fill = trendCtx.createRadialGradient(.5 * width, .2 * height, 0, .5 * width, .2 * height, .5 * width);
                    fill.addColorStop(0, ledColor.innerColor1_ON);
                    fill.addColorStop(.2, ledColor.innerColor2_ON);
                    fill.addColorStop(1, ledColor.outerColor_ON)
                } else {
                    fill = trendCtx.createLinearGradient(0, 0, 0, .5 * height);
                    fill.addColorStop(0, "#323232");
                    fill.addColorStop(1, "#5c5c5c")
                }
                trendCtx.fillStyle = fill;
                trendCtx.beginPath();
                trendCtx.moveTo(.5 * width, 0);
                trendCtx.lineTo(width, .2 * height);
                trendCtx.lineTo(.752 * width, .2 * height);
                trendCtx.lineTo(.752 * width, .37 * height);
                trendCtx.lineTo(.252 * width, .37 * height);
                trendCtx.lineTo(.252 * width, .2 * height);
                trendCtx.lineTo(0, .2 * height);
                trendCtx.closePath();
                trendCtx.fill();
                if (onSection.state !== "up") {
                    trendCtx.strokeStyle = "rgba(0, 0, 0, 0.4)";
                    trendCtx.beginPath();
                    trendCtx.moveTo(0, .2 * height);
                    trendCtx.lineTo(.5 * width, 0);
                    trendCtx.lineTo(width, .2 * height);
                    trendCtx.moveTo(.252 * width, .2 * height);
                    trendCtx.lineTo(.252 * width, .37 * height);
                    trendCtx.stroke();
                    trendCtx.strokeStyle = "rgba(255, 255, 255, 0.3)";
                    trendCtx.beginPath();
                    trendCtx.moveTo(.252 * width, .37 * height);
                    trendCtx.lineTo(.752 * width, .37 * height);
                    trendCtx.lineTo(.752 * width, .2 * height);
                    trendCtx.lineTo(width, .2 * height);
                    trendCtx.stroke()
                } else {
                    fill = trendCtx.createRadialGradient(.5 * width, .2 * height, 0, .5 * width, .2 * height, .7 * width);
                    fill.addColorStop(0, setAlpha(ledColor.coronaColor, 0));
                    fill.addColorStop(.5, setAlpha(ledColor.coronaColor, .3));
                    fill.addColorStop(.7, setAlpha(ledColor.coronaColor, .2));
                    fill.addColorStop(.8, setAlpha(ledColor.coronaColor, .1));
                    fill.addColorStop(.85, setAlpha(ledColor.coronaColor, .05));
                    fill.addColorStop(1, setAlpha(ledColor.coronaColor, 0));
                    trendCtx.fillStyle = fill;
                    trendCtx.beginPath();
                    trendCtx.arc(.5 * width, .2 * height, .7 * width, 0, TWO_PI, true);
                    trendCtx.closePath();
                    trendCtx.fill()
                }
            },
            drawEquals = function() {
                var ledColor = colors[1];
                trendCtx.beginPath();
                if (onSection.state === "steady") {
                    fill = ledColor.outerColor_ON;
                    trendCtx.fillStyle = fill;
                    trendCtx.rect(.128 * width, .41 * height, .744 * width, .074 * height);
                    trendCtx.rect(.128 * width, .516 * height, .744 * width, .074 * height);
                    trendCtx.closePath();
                    trendCtx.fill()
                } else {
                    fill = trendCtx.createLinearGradient(0, .41 * height, 0, .41 * height + .074 * height);
                    fill.addColorStop(0, "#323232");
                    fill.addColorStop(1, "#5c5c5c");
                    trendCtx.fillStyle = fill;
                    trendCtx.rect(.128 * width, .41 * height, .744 * width, .074 * height);
                    trendCtx.closePath();
                    trendCtx.fill();
                    fill = trendCtx.createLinearGradient(0, .516 * height, 0, .516 * height + .074 * height);
                    fill.addColorStop(0, "#323232");
                    fill.addColorStop(1, "#5c5c5c");
                    trendCtx.fillStyle = fill;
                    trendCtx.rect(.128 * width, .516 * height, .744 * width, .074 * height);
                    trendCtx.closePath();
                    trendCtx.fill()
                }
                if (onSection.state !== "steady") {
                    trendCtx.strokeStyle = "rgba(0, 0, 0, 0.4)";
                    trendCtx.beginPath();
                    trendCtx.moveTo(.128 * width, .41 * height + .074 * height);
                    trendCtx.lineTo(.128 * width, .41 * height);
                    trendCtx.lineTo(.128 * width + .744 * width, .41 * height);
                    trendCtx.stroke();
                    trendCtx.beginPath();
                    trendCtx.moveTo(.128 * width, .516 * height + .074 * height);
                    trendCtx.lineTo(.128 * width, .516 * height);
                    trendCtx.lineTo(.128 * width + .744 * width, .516 * height);
                    trendCtx.stroke();
                    trendCtx.strokeStyle = "rgba(255, 255, 255, 0.3)";
                    trendCtx.beginPath();
                    trendCtx.moveTo(.128 * width + .744 * width, .41 * height);
                    trendCtx.lineTo(.128 * width + .744 * width, .41 * height + .074 * height);
                    trendCtx.lineTo(.128 * width, .41 * height + .074 * height);
                    trendCtx.stroke();
                    trendCtx.beginPath();
                    trendCtx.moveTo(.128 * width + .744 * width, .516 * height);
                    trendCtx.lineTo(.128 * width + .744 * width, .516 * height + .074 * height);
                    trendCtx.lineTo(.128 * width, .516 * height + .074 * height);
                    trendCtx.stroke()
                } else {
                    fill = trendCtx.createRadialGradient(.5 * width, .5 * height, 0, .5 * width, .5 * height, .7 * width);
                    fill.addColorStop(0, setAlpha(ledColor.coronaColor, 0));
                    fill.addColorStop(.5, setAlpha(ledColor.coronaColor, .3));
                    fill.addColorStop(.7, setAlpha(ledColor.coronaColor, .2));
                    fill.addColorStop(.8, setAlpha(ledColor.coronaColor, .1));
                    fill.addColorStop(.85, setAlpha(ledColor.coronaColor, .05));
                    fill.addColorStop(1, setAlpha(ledColor.coronaColor, 0));
                    trendCtx.fillStyle = fill;
                    trendCtx.beginPath();
                    trendCtx.arc(.5 * width, .5 * height, .7 * width, 0, TWO_PI, true);
                    trendCtx.closePath();
                    trendCtx.fill()
                }
            },
            drawDownArrow = function() {
                var ledColor = colors[2];
                if (onSection.state === "down") {
                    fill = trendCtx.createRadialGradient(.5 * width, .8 * height, 0, .5 * width, .8 * height, .5 * width);
                    fill.addColorStop(0, ledColor.innerColor1_ON);
                    fill.addColorStop(.2, ledColor.innerColor2_ON);
                    fill.addColorStop(1, ledColor.outerColor_ON)
                } else {
                    fill = trendCtx.createLinearGradient(0, .63 * height, 0, height);
                    fill.addColorStop(0, "#323232");
                    fill.addColorStop(1, "#5c5c5c")
                }
                trendCtx.beginPath();
                trendCtx.fillStyle = fill;
                trendCtx.moveTo(.5 * width, height);
                trendCtx.lineTo(width, .8 * height);
                trendCtx.lineTo(.725 * width, .8 * height);
                trendCtx.lineTo(.725 * width, .63 * height);
                trendCtx.lineTo(.252 * width, .63 * height);
                trendCtx.lineTo(.252 * width, .8 * height);
                trendCtx.lineTo(0, .8 * height);
                trendCtx.closePath();
                trendCtx.fill();
                if (onSection.state !== "down") {
                    trendCtx.strokeStyle = "rgba(0, 0, 0, 0.4)";
                    trendCtx.beginPath();
                    trendCtx.moveTo(0, .8 * height);
                    trendCtx.lineTo(.252 * width, .8 * height);
                    trendCtx.moveTo(.252 * width, .63 * height);
                    trendCtx.lineTo(.752 * width, .63 * height);
                    trendCtx.stroke();
                    trendCtx.beginPath();
                    trendCtx.moveTo(.752 * width, .8 * height);
                    trendCtx.lineTo(width, .8 * height);
                    trendCtx.stroke();
                    trendCtx.strokeStyle = "rgba(255, 255, 255, 0.3)";
                    trendCtx.beginPath();
                    trendCtx.moveTo(0, .8 * height);
                    trendCtx.lineTo(.5 * width, height);
                    trendCtx.lineTo(width, .8 * height);
                    trendCtx.stroke();
                    trendCtx.beginPath();
                    trendCtx.moveTo(.752 * width, .8 * height);
                    trendCtx.lineTo(.752 * width, .63 * height);
                    trendCtx.stroke()
                } else {
                    fill = trendCtx.createRadialGradient(.5 * width, .8 * height, 0, .5 * width, .8 * height, .7 * width);
                    fill.addColorStop(0, setAlpha(ledColor.coronaColor, 0));
                    fill.addColorStop(.5, setAlpha(ledColor.coronaColor, .3));
                    fill.addColorStop(.7, setAlpha(ledColor.coronaColor, .2));
                    fill.addColorStop(.8, setAlpha(ledColor.coronaColor, .1));
                    fill.addColorStop(.85, setAlpha(ledColor.coronaColor, .05));
                    fill.addColorStop(1, setAlpha(ledColor.coronaColor, 0));
                    trendCtx.fillStyle = fill;
                    trendCtx.beginPath();
                    trendCtx.arc(.5 * width, .8 * height, .7 * width, 0, TWO_PI, true);
                    trendCtx.closePath();
                    trendCtx.fill()
                }
            };
        if (!createTrendIndicator.cache[cacheKey]) {
            trendBuffer = createBuffer(width * 2, width * 4);
            trendCtx = trendBuffer.getContext("2d");
            trendCtx.translate(width * .5, width * .5);
            switch (onSection.state) {
                case "up":
                    drawDownArrow();
                    drawEquals();
                    drawUpArrow();
                    break;
                case "steady":
                    drawDownArrow();
                    drawUpArrow();
                    drawEquals();
                    break;
                case "down":
                default:
                    drawUpArrow();
                    drawEquals();
                    drawDownArrow();
                    break
            }
            createTrendIndicator.cache[cacheKey] = trendBuffer
        }
        return createTrendIndicator.cache[cacheKey]
    };
    createTrendIndicator.cache = {};
    var drawTitleImage = function(ctx, imageWidth, imageHeight, titleString, unitString, backgroundColor, vertical, radial, altPos, gaugeType) {
        gaugeType = undefined === gaugeType ? gaugeType = steelseries.GaugeType.TYPE1 : gaugeType;
        ctx.save();
        ctx.textAlign = radial ? "center" : "left";
        ctx.textBaseline = "middle";
        ctx.strokeStyle = backgroundColor.labelColor.getRgbaColor();
        ctx.fillStyle = backgroundColor.labelColor.getRgbaColor();
        if (radial) {
            ctx.font = .046728 * imageWidth + "px " + stdFontName;
            ctx.fillText(titleString, imageWidth / 2, imageHeight * .3, imageWidth * .3);
            ctx.fillText(unitString, imageWidth / 2, imageHeight * .38, imageWidth * .3)
        } else {
            if (vertical) {
                ctx.font = .1 * imageWidth + "px " + stdFontName;
                ctx.save();
                ctx.translate(.671428 * imageWidth, .1375 * imageHeight);
                ctx.rotate(1.570796);
                ctx.fillText(titleString, 0, 0);
                ctx.translate(-.671428 * imageWidth, -.1375 * imageHeight);
                ctx.restore();
                ctx.font = .071428 * imageWidth + "px " + stdFontName;
                if (altPos) {
                    if (gaugeType.type === "type2") {
                        ctx.textAlign = "right";
                        ctx.fillText(unitString, .36 * imageWidth, imageHeight * .79, imageWidth * .25)
                    } else {
                        ctx.fillText(unitString, .63 * imageWidth, imageHeight * .85, imageWidth * .2)
                    }
                } else {
                    ctx.textAlign = "center";
                    if (gaugeType.type === "type2") {
                        ctx.fillText(unitString, imageWidth / 2, imageHeight * .92, imageWidth * .2)
                    } else {
                        ctx.fillText(unitString, imageWidth / 2, imageHeight * .89, imageWidth * .2)
                    }
                }
            } else {
                ctx.font = .035 * imageWidth + "px " + stdFontName;
                ctx.fillText(titleString, imageWidth * .15, imageHeight * .25, imageWidth * .3);
                ctx.font = .025 * imageWidth + "px " + stdFontName;
                ctx.fillText(unitString, imageWidth * .0625, imageHeight * .7, imageWidth * .07)
            }
        }
        ctx.restore()
    };
    var carbonBuffer = drawToBuffer(12, 12, function(ctx) {
        var imageWidth = ctx.canvas.width,
            imageHeight = ctx.canvas.height,
            offsetX = 0,
            offsetY = 0,
            grad;
        ctx.save();
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, imageWidth * .5, imageHeight * .5);
        ctx.closePath();
        ctx.restore();
        grad = ctx.createLinearGradient(0, offsetY * imageHeight, 0, .5 * imageHeight + offsetY * imageHeight);
        grad.addColorStop(0, "rgb(35, 35, 35)");
        grad.addColorStop(1, "rgb(23, 23, 23)");
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.save();
        ctx.beginPath();
        ctx.rect(imageWidth * .083333, 0, imageWidth * .333333, imageHeight * .416666);
        ctx.closePath();
        ctx.restore();
        offsetX = .083333;
        offsetY = 0;
        grad = ctx.createLinearGradient(0, offsetY * imageHeight, 0, .416666 * imageHeight + offsetY * imageHeight);
        grad.addColorStop(0, "rgb(38, 38, 38)");
        grad.addColorStop(1, "rgb(30, 30, 30)");
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.save();
        ctx.beginPath();
        ctx.rect(imageWidth * .5, imageHeight * .5, imageWidth * .5, imageHeight * .5);
        ctx.closePath();
        ctx.restore();
        offsetX = .5;
        offsetY = .5;
        grad = ctx.createLinearGradient(0, offsetY * imageHeight, 0, .5 * imageHeight + offsetY * imageHeight);
        grad.addColorStop(0, "rgb(35, 35, 35)");
        grad.addColorStop(1, "rgb(23, 23, 23)");
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.save();
        ctx.beginPath();
        ctx.rect(imageWidth * .583333, imageHeight * .5, imageWidth * .333333, imageHeight * .416666);
        ctx.closePath();
        ctx.restore();
        offsetX = .583333;
        offsetY = .5;
        grad = ctx.createLinearGradient(0, offsetY * imageHeight, 0, .416666 * imageHeight + offsetY * imageHeight);
        grad.addColorStop(0, "rgb(38, 38, 38)");
        grad.addColorStop(1, "rgb(30, 30, 30)");
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.save();
        ctx.beginPath();
        ctx.rect(imageWidth * .5, 0, imageWidth * .5, imageHeight * .5);
        ctx.closePath();
        ctx.restore();
        offsetX = .5;
        offsetY = 0;
        grad = ctx.createLinearGradient(0, offsetY * imageHeight, 0, .5 * imageHeight + offsetY * imageHeight);
        grad.addColorStop(0, "#303030");
        grad.addColorStop(1, "rgb(40, 40, 40)");
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.save();
        ctx.beginPath();
        ctx.rect(imageWidth * .583333, imageHeight * .083333, imageWidth * .333333, imageHeight * .416666);
        ctx.closePath();
        ctx.restore();
        offsetX = .583333;
        offsetY = .083333;
        grad = ctx.createLinearGradient(0, offsetY * imageHeight, 0, .416666 * imageHeight + offsetY * imageHeight);
        grad.addColorStop(0, "rgb(53, 53, 53)");
        grad.addColorStop(1, "rgb(45, 45, 45)");
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, imageHeight * .5, imageWidth * .5, imageHeight * .5);
        ctx.closePath();
        ctx.restore();
        offsetX = 0;
        offsetY = .5;
        grad = ctx.createLinearGradient(0, offsetY * imageHeight, 0, .5 * imageHeight + offsetY * imageHeight);
        grad.addColorStop(0, "#303030");
        grad.addColorStop(1, "#282828");
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.save();
        ctx.beginPath();
        ctx.rect(imageWidth * .083333, imageHeight * .583333, imageWidth * .333333, imageHeight * .416666);
        ctx.closePath();
        ctx.restore();
        offsetX = .083333;
        offsetY = .583333;
        grad = ctx.createLinearGradient(0, offsetY * imageHeight, 0, .416666 * imageHeight + offsetY * imageHeight);
        grad.addColorStop(0, "#353535");
        grad.addColorStop(1, "#2d2d2d");
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore()
    });
    var punchedSheetBuffer = drawToBuffer(15, 15, function(ctx) {
        var imageWidth = ctx.canvas.width,
            imageHeight = ctx.canvas.height,
            grad;
        ctx.save();
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, imageWidth, imageHeight);
        ctx.closePath();
        ctx.restore();
        ctx.fillStyle = "#1D2123";
        ctx.fill();
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, imageHeight * .266666);
        ctx.bezierCurveTo(0, imageHeight * .4, imageWidth * .066666, imageHeight * .466666, imageWidth * .2, imageHeight * .466666);
        ctx.bezierCurveTo(imageWidth * .333333, imageHeight * .466666, imageWidth * .4, imageHeight * .4, imageWidth * .4, imageHeight * .266666);
        ctx.bezierCurveTo(imageWidth * .4, imageHeight * .133333, imageWidth * .333333, imageHeight * .066666, imageWidth * .2, imageHeight * .066666);
        ctx.bezierCurveTo(imageWidth * .066666, imageHeight * .066666, 0, imageHeight * .133333, 0, imageHeight * .266666);
        ctx.closePath();
        grad = ctx.createLinearGradient(0, .066666 * imageHeight, 0, .466666 * imageHeight);
        grad.addColorStop(0, "#000000");
        grad.addColorStop(1, "#444444");
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, imageHeight * .2);
        ctx.bezierCurveTo(0, imageHeight * .333333, imageWidth * .066666, imageHeight * .4, imageWidth * .2, imageHeight * .4);
        ctx.bezierCurveTo(imageWidth * .333333, imageHeight * .4, imageWidth * .4, imageHeight * .333333, imageWidth * .4, imageHeight * .2);
        ctx.bezierCurveTo(imageWidth * .4, imageHeight * .066666, imageWidth * .333333, 0, imageWidth * .2, 0);
        ctx.bezierCurveTo(imageWidth * .066666, 0, 0, imageHeight * .066666, 0, imageHeight * .2);
        ctx.closePath();
        ctx.fillStyle = "#050506";
        ctx.fill();
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(imageWidth * .466666, imageHeight * .733333);
        ctx.bezierCurveTo(imageWidth * .466666, imageHeight * .866666, imageWidth * .533333, imageHeight * .933333, imageWidth * .666666, imageHeight * .933333);
        ctx.bezierCurveTo(imageWidth * .8, imageHeight * .933333, imageWidth * .866666, imageHeight * .866666, imageWidth * .866666, imageHeight * .733333);
        ctx.bezierCurveTo(imageWidth * .866666, imageHeight * .6, imageWidth * .8, imageHeight * .533333, imageWidth * .666666, imageHeight * .533333);
        ctx.bezierCurveTo(imageWidth * .533333, imageHeight * .533333, imageWidth * .466666, imageHeight * .6, imageWidth * .466666, imageHeight * .733333);
        ctx.closePath();
        grad = ctx.createLinearGradient(0, .533333 * imageHeight, 0, .933333 * imageHeight);
        grad.addColorStop(0, "#000000");
        grad.addColorStop(1, "#444444");
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(imageWidth * .466666, imageHeight * .666666);
        ctx.bezierCurveTo(imageWidth * .466666, imageHeight * .8, imageWidth * .533333, imageHeight * .866666, imageWidth * .666666, imageHeight * .866666);
        ctx.bezierCurveTo(imageWidth * .8, imageHeight * .866666, imageWidth * .866666, imageHeight * .8, imageWidth * .866666, imageHeight * .666666);
        ctx.bezierCurveTo(imageWidth * .866666, imageHeight * .533333, imageWidth * .8, imageHeight * .466666, imageWidth * .666666, imageHeight * .466666);
        ctx.bezierCurveTo(imageWidth * .533333, imageHeight * .466666, imageWidth * .466666, imageHeight * .533333, imageWidth * .466666, imageHeight * .666666);
        ctx.closePath();
        ctx.fillStyle = "#050506";
        ctx.fill();
        ctx.restore()
    });
    var brushedMetalTexture = function(color, radius, amount, monochrome, shine) {
        this.fill = function(startX, startY, endX, endY) {
            var i, x, y, sinArr, width, height, outCanvas, outCanvasContext, inPixels, outPixels, alpha = 255,
                red = color >> 16 & 255,
                green = color >> 8 & 255,
                blue = color & 255,
                n = 0,
                variation = 255 * amount,
                totR, totG, totB, indx, tr, tg, tb, f;
            startX = Math.floor(startX);
            startY = Math.floor(startY);
            endX = Math.ceil(endX);
            endY = Math.ceil(endY);
            width = endX - startX;
            height = endY - startY;
            outCanvas = createBuffer(width, height);
            outCanvasContext = outCanvas.getContext("2d");
            inPixels = outCanvasContext.createImageData(width, height);
            outPixels = outCanvasContext.createImageData(width, height);
            if (shine !== 0) {
                sinArr = [];
                for (i = 0; i < width; i++) {
                    sinArr[i] = 255 * shine * Math.sin(i / width * PI) | 0
                }
            }
            for (y = 0; y < height; y++) {
                if (radius !== 0) {
                    totR = totG = totB = 0
                }
                for (x = 0; x < width; x++) {
                    indx = y * width * 4 + x * 4;
                    tr = red;
                    tg = green;
                    tb = blue;
                    if (shine !== 0) {
                        f = sinArr[x];
                        tr += f;
                        tg += f;
                        tb += f
                    }
                    if (monochrome) {
                        n = (2 * Math.random() - 1) * variation | 0;
                        inPixels.data[indx] = clamp(tr + n);
                        inPixels.data[indx + 1] = clamp(tg + n);
                        inPixels.data[indx + 2] = clamp(tb + n);
                        inPixels.data[indx + 3] = alpha
                    } else {
                        inPixels.data[indx] = random(tr, variation);
                        inPixels.data[indx + 1] = random(tg, variation);
                        inPixels.data[indx + 2] = random(tb, variation);
                        inPixels.data[indx + 3] = alpha
                    }
                }
            }
            if (radius > 0) {
                horizontalBlur(inPixels, outPixels, width, height, radius, alpha);
                outCanvasContext.putImageData(outPixels, startX, startY)
            } else {
                outCanvasContext.putImageData(inPixels, startX, startY)
            }
            return outCanvas
        };

        function random(x, vari) {
            x += (2 * Math.random() - 1) * vari | 0;
            return x < 0 ? 0 : x > 255 ? 255 : x
        }

        function clamp(C) {
            return C < 0 ? 0 : C > 255 ? 255 : C
        }

        function horizontalBlur(inPix, outPix, width, height, radius, alpha) {
            var x, y, i, mul, indx, totR, totG, totB;
            if (radius >= width) {
                radius = width - 1
            }
            mul = 1 / (radius * 2 + 1);
            indx = 0;
            for (y = 0; y < height; y++) {
                totR = totG = totB = 0;
                for (x = 0; x < radius; x++) {
                    i = (indx + x) * 4;
                    totR += inPix.data[i];
                    totG += inPix.data[i + 1];
                    totB += inPix.data[i + 2]
                }
                for (x = 0; x < width; x++) {
                    if (x > radius) {
                        i = (indx - radius - 1) * 4;
                        totR -= inPix.data[i];
                        totG -= inPix.data[i + 1];
                        totB -= inPix.data[i + 2]
                    }
                    if (x + radius < width) {
                        i = (indx + radius) * 4;
                        totR += inPix.data[i];
                        totG += inPix.data[i + 1];
                        totB += inPix.data[i + 2]
                    }
                    i = indx * 4;
                    outPix.data[i] = totR * mul | 0;
                    outPix.data[i + 1] = totG * mul | 0;
                    outPix.data[i + 2] = totB * mul | 0;
                    outPix.data[i + 3] = alpha;
                    indx++
                }
            }
        }
        return this
    };
    var RgbaColor = function(r, g, b, a) {
        var red, green, blue, alpha;
        if (arguments.length === 1) {
            b = parseInt(r.substr(5, 2), 16);
            g = parseInt(r.substr(3, 2), 16);
            r = parseInt(r.substr(1, 2), 16);
            a = 1
        } else if (arguments.length === 3) {
            a = 1
        }

        function validateColors() {
            red = range(r, 255);
            green = range(g, 255);
            blue = range(b, 255);
            alpha = range(a, 1)
        }
        validateColors();
        this.getRed = function() {
            return red
        };
        this.setRed = function(r) {
            red = range(r, 255)
        };
        this.getGreen = function() {
            return green
        };
        this.setGreen = function(g) {
            green = range(g, 255)
        };
        this.getBlue = function() {
            return blue
        };
        this.setBlue = function(b) {
            blue = range(b, 255)
        };
        this.getAlpha = function() {
            return alpha
        };
        this.setAlpha = function(a) {
            alpha = range(a, 1)
        };
        this.getRgbaColor = function() {
            return "rgba(" + red + ", " + green + ", " + blue + ", " + alpha + ")"
        };
        this.getRgbColor = function() {
            return "rgb(" + red + ", " + green + ", " + blue + ")"
        };
        this.getHexColor = function() {
            return "#" + red.toString(16) + green.toString(16) + blue.toString(16)
        }
    };
    var ConicalGradient = function(fractions, colors) {
        var limit = fractions.length - 1,
            i;
        for (i = 0; i <= limit; i++) {
            fractions[i] = TWO_PI * fractions[i] - PI
        }
        this.fillCircle = function(ctx, centerX, centerY, innerX, outerX) {
            var angle, radius = Math.ceil(outerX),
                diameter = radius * 2,
                pixels, alpha, x, y, dx, dy, dy2, distance, indx, pixColor, buffer, bufferCtx;
            pixels = ctx.createImageData(diameter, diameter);
            alpha = 255;
            for (y = 0; y < diameter; y++) {
                dy = radius - y;
                dy2 = dy * dy;
                for (x = 0; x < diameter; x++) {
                    dx = x - radius;
                    distance = Math.sqrt(dx * dx + dy2);
                    if (distance <= radius && distance >= innerX) {
                        angle = Math.atan2(dx, dy);
                        for (i = 0; i < limit; i++) {
                            if (angle >= fractions[i] && angle < fractions[i + 1]) {
                                pixColor = getColorFromFraction(colors[i], colors[i + 1], fractions[i + 1] - fractions[i], angle - fractions[i], true)
                            }
                        }
                        indx = (diameter - y) * diameter * 4 + x * 4;
                        pixels.data[indx] = pixColor[0];
                        pixels.data[indx + 1] = pixColor[1];
                        pixels.data[indx + 2] = pixColor[2];
                        pixels.data[indx + 3] = alpha
                    }
                }
            }
            buffer = createBuffer(diameter, diameter);
            bufferCtx = buffer.getContext("2d");
            bufferCtx.putImageData(pixels, 0, 0);
            ctx.drawImage(buffer, centerX - radius, centerY - radius)
        };
        this.fillRect = function(ctx, centerX, centerY, width, height, thicknessX, thicknessY) {
            var angle, width2, height2, pixels, alpha, x, y, dx, dy, indx, pixColor, buffer, bufferCtx;
            width = Math.ceil(width);
            height = Math.ceil(height);
            width2 = width / 2;
            height2 = height / 2;
            thicknessX = Math.ceil(thicknessX);
            thicknessY = Math.ceil(thicknessY);
            pixels = ctx.createImageData(width, height);
            alpha = 255;
            for (y = 0; y < height; y++) {
                dy = height2 - y;
                for (x = 0; x < width; x++) {
                    if (y > thicknessY && y <= height - thicknessY) {
                        if (x > thicknessX && x < width - thicknessX) {
                            x = width - thicknessX
                        }
                    }
                    dx = x - width2;
                    angle = Math.atan2(dx, dy);
                    for (i = 0; i < limit; i++) {
                        if (angle >= fractions[i] && angle < fractions[i + 1]) {
                            pixColor = getColorFromFraction(colors[i], colors[i + 1], fractions[i + 1] - fractions[i], angle - fractions[i], true)
                        }
                    }
                    indx = (height - y) * width * 4 + x * 4;
                    pixels.data[indx] = pixColor[0];
                    pixels.data[indx + 1] = pixColor[0];
                    pixels.data[indx + 2] = pixColor[0];
                    pixels.data[indx + 3] = alpha
                }
            }
            buffer = createBuffer(width, height);
            bufferCtx = buffer.getContext("2d");
            bufferCtx.putImageData(pixels, 0, 0);
            ctx.drawImage(buffer, centerX - width2, centerY - height2)
        }
    };
    var GradientWrapper = function(start, end, fractions, colors) {
        this.getColorAt = function(fraction) {
            var lowerLimit = 0,
                lowerIndex = 0,
                upperLimit = 1,
                upperIndex = 1,
                i, interpolationFraction;
            fraction = fraction < 0 ? 0 : fraction > 1 ? 1 : fraction;
            for (i = 0; i < fractions.length; i++) {
                if (fractions[i] < fraction && lowerLimit < fractions[i]) {
                    lowerLimit = fractions[i];
                    lowerIndex = i
                }
                if (fractions[i] === fraction) {
                    return colors[i]
                }
                if (fractions[i] > fraction && upperLimit >= fractions[i]) {
                    upperLimit = fractions[i];
                    upperIndex = i
                }
            }
            interpolationFraction = (fraction - lowerLimit) / (upperLimit - lowerLimit);
            return getColorFromFraction(colors[lowerIndex], colors[upperIndex], 1, interpolationFraction)
        };
        this.getStart = function() {
            return start
        };
        this.getEnd = function() {
            return end
        }
    };

    function setAlpha(hex, alpha) {
        var hexColor = "#" === hex.charAt(0) ? hex.substring(1, 7) : hex,
            red = parseInt(hexColor.substring(0, 2), 16),
            green = parseInt(hexColor.substring(2, 4), 16),
            blue = parseInt(hexColor.substring(4, 6), 16),
            color = "rgba(" + red + "," + green + "," + blue + "," + alpha + ")";
        return color
    }

    function getColorFromFraction(sourceColor, destinationColor, range, fraction, returnRawData) {
        var INT_TO_FLOAT = 1 / 255,
            sourceRed = sourceColor.getRed(),
            sourceGreen = sourceColor.getGreen(),
            sourceBlue = sourceColor.getBlue(),
            sourceAlpha = sourceColor.getAlpha(),
            deltaRed = destinationColor.getRed() - sourceRed,
            deltaGreen = destinationColor.getGreen() - sourceGreen,
            deltaBlue = destinationColor.getBlue() - sourceBlue,
            deltaAlpha = destinationColor.getAlpha() * INT_TO_FLOAT - sourceAlpha * INT_TO_FLOAT,
            fractionRed = deltaRed / range * fraction,
            fractionGreen = deltaGreen / range * fraction,
            fractionBlue = deltaBlue / range * fraction,
            fractionAlpha = deltaAlpha / range * fraction;
        returnRawData = returnRawData || false;
        if (returnRawData) {
            return [(sourceRed + fractionRed).toFixed(0), (sourceGreen + fractionGreen).toFixed(0), (sourceBlue + fractionBlue).toFixed(0), sourceAlpha + fractionAlpha]
        } else {
            return new RgbaColor((sourceRed + fractionRed).toFixed(0), (sourceGreen + fractionGreen).toFixed(0), (sourceBlue + fractionBlue).toFixed(0), sourceAlpha + fractionAlpha)
        }
    }

    function section(start, stop, color) {
        return {
            start: start,
            stop: stop,
            color: color
        }
    }
    Math.log10 = function(value) {
        return Math.log(value) / Math.LN10
    };

    function calcNiceNumber(range, round) {
        var exponent = Math.floor(Math.log10(range)),
            fraction = range / Math.pow(10, exponent),
            niceFraction;
        if (round) {
            if (1.5 > fraction) {
                niceFraction = 1
            } else if (3 > fraction) {
                niceFraction = 2
            } else if (7 > fraction) {
                niceFraction = 5
            } else {
                niceFraction = 10
            }
        } else {
            if (1 >= fraction) {
                niceFraction = 1
            } else if (2 >= fraction) {
                niceFraction = 2
            } else if (5 >= fraction) {
                niceFraction = 5
            } else {
                niceFraction = 10
            }
        }
        return niceFraction * Math.pow(10, exponent)
    }

    function roundedRectangle(ctx, x, y, w, h, radius) {
        var r = x + w,
            b = y + h;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(r - radius, y);
        ctx.quadraticCurveTo(r, y, r, y + radius);
        ctx.lineTo(r, y + h - radius);
        ctx.quadraticCurveTo(r, b, r - radius, b);
        ctx.lineTo(x + radius, b);
        ctx.quadraticCurveTo(x, b, x, b - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath()
    }

    function createBuffer(width, height) {
        var buffer = doc.createElement("canvas");
        buffer.width = width;
        buffer.height = height;
        return buffer
    }

    function drawToBuffer(width, height, drawFunction) {
        var buffer = doc.createElement("canvas");
        buffer.width = width;
        buffer.height = height;
        drawFunction(buffer.getContext("2d"));
        return buffer
    }

    function getColorValues(color) {
        var colorData, lookupBuffer = drawToBuffer(1, 1, function(ctx) {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.rect(0, 0, 1, 1);
            ctx.fill()
        });
        colorData = lookupBuffer.getContext("2d").getImageData(0, 0, 2, 2).data;
        return [colorData[0], colorData[1], colorData[2], colorData[3]]
    }

    function customColorDef(color) {
        var VERY_DARK, DARK, LIGHT, LIGHTER, VERY_LIGHT, values = getColorValues(color),
            rgbaCol = new RgbaColor(values[0], values[1], values[2], values[3]);
        VERY_DARK = darker(rgbaCol, .32);
        DARK = darker(rgbaCol, .62);
        LIGHT = lighter(rgbaCol, .84);
        LIGHTER = lighter(rgbaCol, .94);
        VERY_LIGHT = lighter(rgbaCol, 1);
        return new ColorDef(VERY_DARK, DARK, rgbaCol, LIGHT, LIGHTER, VERY_LIGHT)
    }

    function rgbToHsl(red, green, blue) {
        var min, max, hue, saturation, lightness, delta;
        red /= 255;
        green /= 255;
        blue /= 255;
        max = Math.max(red, green, blue);
        min = Math.min(red, green, blue);
        lightness = (max + min) / 2;
        if (max === min) {
            hue = saturation = 0
        } else {
            delta = max - min;
            saturation = lightness > .5 ? delta / (2 - max - min) : delta / (max + min);
            switch (max) {
                case red:
                    hue = (green - blue) / delta + (green < blue ? 6 : 0);
                    break;
                case green:
                    hue = (blue - red) / delta + 2;
                    break;
                case blue:
                    hue = (red - green) / delta + 4;
                    break
            }
            hue /= 6
        }
        return [hue, saturation, lightness]
    }

    function hsbToRgb(hue, saturation, brightness) {
        var r, g, b, i = Math.floor(hue * 6),
            f = hue * 6 - i,
            p = brightness * (1 - saturation),
            q = brightness * (1 - f * saturation),
            t = brightness * (1 - (1 - f) * saturation);
        switch (i % 6) {
            case 0:
                r = brightness;
                g = t;
                b = p;
                break;
            case 1:
                r = q;
                g = brightness;
                b = p;
                break;
            case 2:
                r = p;
                g = brightness;
                b = t;
                break;
            case 3:
                r = p;
                g = q;
                b = brightness;
                break;
            case 4:
                r = t;
                g = p;
                b = brightness;
                break;
            case 5:
                r = brightness;
                g = p;
                b = q;
                break
        }
        return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)]
    }

    function rgbToHsb(r, g, b) {
        var min, max, hue, saturation, brightness, delta;
        r = r / 255;
        g = g / 255;
        b = b / 255;
        max = Math.max(r, g, b);
        min = Math.min(r, g, b);
        brightness = max;
        delta = max - min;
        saturation = max === 0 ? 0 : delta / max;
        if (max === min) {
            hue = 0
        } else {
            switch (max) {
                case r:
                    hue = (g - b) / delta + (g < b ? 6 : 0);
                    break;
                case g:
                    hue = (b - r) / delta + 2;
                    break;
                case b:
                    hue = (r - g) / delta + 4;
                    break
            }
            hue /= 6
        }
        return [hue, saturation, brightness]
    }

    function range(value, limit) {
        return value < 0 ? 0 : value > limit ? limit : value
    }

    function darker(color, fraction) {
        var red = Math.floor(color.getRed() * (1 - fraction)),
            green = Math.floor(color.getGreen() * (1 - fraction)),
            blue = Math.floor(color.getBlue() * (1 - fraction));
        red = range(red, 255);
        green = range(green, 255);
        blue = range(blue, 255);
        return new RgbaColor(red, green, blue, color.getAlpha())
    }

    function lighter(color, fraction) {
        var red = Math.round(color.getRed() * (1 + fraction)),
            green = Math.round(color.getGreen() * (1 + fraction)),
            blue = Math.round(color.getBlue() * (1 + fraction));
        red = range(red, 255);
        green = range(green, 255);
        blue = range(blue, 255);
        return new RgbaColor(red, green, blue, color.getAlpha())
    }

    function wrap(value, lower, upper) {
        var distance, times;
        if (upper <= lower) {
            throw "Rotary bounds are of negative or zero size"
        }
        distance = upper - lower;
        times = Math.floor((value - lower) / distance);
        return value - times * distance
    }

    function getShortestAngle(from, to) {
        return wrap(to - from, -180, 180)
    }
    var requestAnimFrame = function() {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
            window.setTimeout(callback, 1e3 / 16)
        }
    }();

    function getCanvasContext(elementOrId) {
        var element = typeof elementOrId === "string" || elementOrId instanceof String ? doc.getElementById(elementOrId) : elementOrId;
        return element.getContext("2d")
    }
    var BackgroundColorDef;
    (function() {
        BackgroundColorDef = function(gradientStart, gradientFraction, gradientStop, labelColor, symbolColor, name) {
            this.gradientStart = gradientStart;
            this.gradientFraction = gradientFraction;
            this.gradientStop = gradientStop;
            this.labelColor = labelColor;
            this.symbolColor = symbolColor;
            this.name = name
        }
    })();
    var LcdColorDef;
    (function() {
        LcdColorDef = function(gradientStartColor, gradientFraction1Color, gradientFraction2Color, gradientFraction3Color, gradientStopColor, textColor) {
            this.gradientStartColor = gradientStartColor;
            this.gradientFraction1Color = gradientFraction1Color;
            this.gradientFraction2Color = gradientFraction2Color;
            this.gradientFraction3Color = gradientFraction3Color;
            this.gradientStopColor = gradientStopColor;
            this.textColor = textColor
        }
    })();
    var ColorDef;
    (function() {
        ColorDef = function(veryDark, dark, medium, light, lighter, veryLight) {
            this.veryDark = veryDark;
            this.dark = dark;
            this.medium = medium;
            this.light = light;
            this.lighter = lighter;
            this.veryLight = veryLight
        }
    })();
    var LedColorDef;
    (function() {
        LedColorDef = function(innerColor1_ON, innerColor2_ON, outerColor_ON, coronaColor, innerColor1_OFF, innerColor2_OFF, outerColor_OFF) {
            this.innerColor1_ON = innerColor1_ON;
            this.innerColor2_ON = innerColor2_ON;
            this.outerColor_ON = outerColor_ON;
            this.coronaColor = coronaColor;
            this.innerColor1_OFF = innerColor1_OFF;
            this.innerColor2_OFF = innerColor2_OFF;
            this.outerColor_OFF = outerColor_OFF
        }
    })();
    var GaugeTypeDef;
    (function() {
        GaugeTypeDef = function(type) {
            this.type = type
        }
    })();
    var OrientationDef;
    (function() {
        OrientationDef = function(type) {
            this.type = type
        }
    })();
    var KnobTypeDef;
    (function() {
        KnobTypeDef = function(type) {
            this.type = type
        }
    })();
    var KnobStyleDef;
    (function() {
        KnobStyleDef = function(style) {
            this.style = style
        }
    })();
    var FrameDesignDef;
    (function() {
        FrameDesignDef = function(design) {
            this.design = design
        }
    })();
    var PointerTypeDef;
    (function() {
        PointerTypeDef = function(type) {
            this.type = type
        }
    })();
    var ForegroundTypeDef;
    (function() {
        ForegroundTypeDef = function(type) {
            this.type = type
        }
    })();
    var LabelNumberFormatDef;
    (function() {
        LabelNumberFormatDef = function(format) {
            this.format = format
        }
    })();
    var TickLabelOrientationDef;
    (function() {
        TickLabelOrientationDef = function(type) {
            this.type = type
        }
    })();
    var TrendStateDef;
    (function() {
        TrendStateDef = function(state) {
            this.state = state
        }
    })();
    var backgroundColor = {
        DARK_GRAY: new BackgroundColorDef(new RgbaColor(0, 0, 0, 1), new RgbaColor(51, 51, 51, 1), new RgbaColor(153, 153, 153, 1), new RgbaColor(255, 255, 255, 1), new RgbaColor(180, 180, 180, 1), "DARK_GRAY"),
        SATIN_GRAY: new BackgroundColorDef(new RgbaColor(45, 57, 57, 1), new RgbaColor(45, 57, 57, 1), new RgbaColor(45, 57, 57, 1), new RgbaColor(167, 184, 180, 1), new RgbaColor(137, 154, 150, 1), "SATIN_GRAY"),
        LIGHT_GRAY: new BackgroundColorDef(new RgbaColor(130, 130, 130, 1), new RgbaColor(181, 181, 181, 1), new RgbaColor(253, 253, 253, 1), new RgbaColor(0, 0, 0, 1), new RgbaColor(80, 80, 80, 1), "LIGHT_GRAY"),
        WHITE: new BackgroundColorDef(new RgbaColor(255, 255, 255, 1), new RgbaColor(255, 255, 255, 1), new RgbaColor(255, 255, 255, 1), new RgbaColor(0, 0, 0, 1), new RgbaColor(80, 80, 80, 1), "WHITE"),
        BLACK: new BackgroundColorDef(new RgbaColor(0, 0, 0, 1), new RgbaColor(0, 0, 0, 1), new RgbaColor(0, 0, 0, 1), new RgbaColor(255, 255, 255, 1), new RgbaColor(150, 150, 150, 1), "BLACK"),
        BEIGE: new BackgroundColorDef(new RgbaColor(178, 172, 150, 1), new RgbaColor(204, 205, 184, 1), new RgbaColor(231, 231, 214, 1), new RgbaColor(0, 0, 0, 1), new RgbaColor(80, 80, 80, 1), "BEIGE"),
        BROWN: new BackgroundColorDef(new RgbaColor(245, 225, 193, 1), new RgbaColor(245, 225, 193, 1), new RgbaColor(255, 250, 240, 1), new RgbaColor(109, 73, 47, 1), new RgbaColor(89, 53, 27, 1), "BROWN"),
        RED: new BackgroundColorDef(new RgbaColor(198, 93, 95, 1), new RgbaColor(212, 132, 134, 1), new RgbaColor(242, 218, 218, 1), new RgbaColor(0, 0, 0, 1), new RgbaColor(90, 0, 0, 1), "RED"),
        GREEN: new BackgroundColorDef(new RgbaColor(65, 120, 40, 1), new RgbaColor(129, 171, 95, 1), new RgbaColor(218, 237, 202, 1), new RgbaColor(0, 0, 0, 1), new RgbaColor(0, 90, 0, 1), "GREEN"),
        BLUE: new BackgroundColorDef(new RgbaColor(45, 83, 122, 1), new RgbaColor(115, 144, 170, 1), new RgbaColor(227, 234, 238, 1), new RgbaColor(0, 0, 0, 1), new RgbaColor(0, 0, 90, 1), "BLUE"),
        ANTHRACITE: new BackgroundColorDef(new RgbaColor(50, 50, 54, 1), new RgbaColor(47, 47, 51, 1), new RgbaColor(69, 69, 74, 1), new RgbaColor(250, 250, 250, 1), new RgbaColor(180, 180, 180, 1), "ANTHRACITE"),
        MUD: new BackgroundColorDef(new RgbaColor(80, 86, 82, 1), new RgbaColor(70, 76, 72, 1), new RgbaColor(57, 62, 58, 1), new RgbaColor(255, 255, 240, 1), new RgbaColor(225, 225, 210, 1), "MUD"),
        PUNCHED_SHEET: new BackgroundColorDef(new RgbaColor(50, 50, 54, 1), new RgbaColor(47, 47, 51, 1), new RgbaColor(69, 69, 74, 1), new RgbaColor(255, 255, 255, 1), new RgbaColor(180, 180, 180, 1), "PUNCHED_SHEET"),
        CARBON: new BackgroundColorDef(new RgbaColor(50, 50, 54, 1), new RgbaColor(47, 47, 51, 1), new RgbaColor(69, 69, 74, 1), new RgbaColor(255, 255, 255, 1), new RgbaColor(180, 180, 180, 1), "CARBON"),
        STAINLESS: new BackgroundColorDef(new RgbaColor(130, 130, 130, 1), new RgbaColor(181, 181, 181, 1), new RgbaColor(253, 253, 253, 1), new RgbaColor(0, 0, 0, 1), new RgbaColor(80, 80, 80, 1), "STAINLESS"),
        BRUSHED_METAL: new BackgroundColorDef(new RgbaColor(50, 50, 54, 1), new RgbaColor(47, 47, 51, 1), new RgbaColor(69, 69, 74, 1), new RgbaColor(0, 0, 0, 1), new RgbaColor(80, 80, 80, 1), "BRUSHED_METAL"),
        BRUSHED_STAINLESS: new BackgroundColorDef(new RgbaColor(50, 50, 54, 1), new RgbaColor(47, 47, 51, 1), new RgbaColor(110, 110, 112, 1), new RgbaColor(0, 0, 0, 1), new RgbaColor(80, 80, 80, 1), "BRUSHED_STAINLESS"),
        TURNED: new BackgroundColorDef(new RgbaColor(130, 130, 130, 1), new RgbaColor(181, 181, 181, 1), new RgbaColor(253, 253, 253, 1), new RgbaColor(0, 0, 0, 1), new RgbaColor(80, 80, 80, 1), "TURNED")
    };
    var lcdColor = {
        BEIGE: new LcdColorDef("#c8c8b1", "rgb(241, 237, 207)", "rgb(234, 230, 194)", "rgb(225, 220, 183)", "rgb(237, 232, 191)", "#000000"),
        BLUE: new LcdColorDef("#ffffff", "rgb(231, 246, 255)", "rgb(170, 224, 255)", "rgb(136, 212, 255)", "rgb(192, 232, 255)", "#124564"),
        ORANGE: new LcdColorDef("#ffffff", "rgb(255, 245, 225)", "rgb(255, 217, 147)", "rgb(255, 201, 104)", "rgb(255, 227, 173)", "#503700"),
        RED: new LcdColorDef("#ffffff", "rgb(255, 225, 225)", "rgb(253, 152, 152)", "rgb(252, 114, 115)", "rgb(254, 178, 178)", "#4f0c0e"),
        YELLOW: new LcdColorDef("#ffffff", "rgb(245, 255, 186)", "rgb(210, 255, 0)", "rgb(158, 205, 0)", "rgb(210, 255, 0)", "#405300"),
        WHITE: new LcdColorDef("#ffffff", "#ffffff", "rgb(241, 246, 242)", "rgb(229, 239, 244)", "#ffffff", "#000000"),
        GRAY: new LcdColorDef("#414141", "rgb(117, 117, 117)", "rgb(87, 87, 87)", "#414141", "rgb(81, 81, 81)", "#ffffff"),
        BLACK: new LcdColorDef("#414141", "#666666", "#333333", "#000000", "#333333", "#cccccc"),
        GREEN: new LcdColorDef("rgb(33, 67, 67)", "rgb(33, 67, 67)", "rgb(29, 58, 58)", "rgb(28, 57, 57)", "rgb(23, 46, 46)", "rgba(0, 185, 165, 255)"),
        BLUE2: new LcdColorDef("rgb(0, 68, 103)", "rgb(8, 109, 165)", "rgb(0, 72, 117)", "rgb(0, 72, 117)", "rgb(0, 68, 103)", "rgb(111, 182, 228)"),
        BLUE_BLACK: new LcdColorDef("rgb(22, 125, 212)", "rgb(3, 162, 254)", "rgb(3, 162, 254)", "rgb(3, 162, 254)", "rgb(11, 172, 244)", "#000000"),
        BLUE_DARKBLUE: new LcdColorDef("rgb(18, 33, 88)", "rgb(18, 33, 88)", "rgb(19, 30, 90)", "rgb(17, 31, 94)", "rgb(21, 25, 90)", "rgb(23, 99, 221)"),
        BLUE_GRAY: new LcdColorDef("rgb(135, 174, 255)", "rgb(101, 159, 255)", "rgb(44, 93, 255)", "rgb(27, 65, 254)", "rgb(12, 50, 255)", "#b2b4ed"),
        STANDARD: new LcdColorDef("rgb(131, 133, 119)", "rgb(176, 183, 167)", "rgb(165, 174, 153)", "rgb(166, 175, 156)", "rgb(175, 184, 165)", "rgb(35, 42, 52)"),
        STANDARD_GREEN: new LcdColorDef("#ffffff", "rgb(219, 230, 220)", "rgb(179, 194, 178)", "rgb(153, 176, 151)", "rgb(114, 138, 109)", "#080C06"),
        BLUE_BLUE: new LcdColorDef("rgb(100, 168, 253)", "rgb(100, 168, 253)", "rgb(95, 160, 250)", "rgb(80, 144, 252)", "rgb(74, 134, 255)", "#002cbb"),
        RED_DARKRED: new LcdColorDef("rgb(72, 36, 50)", "rgb(185, 111, 110)", "rgb(148, 66, 72)", "rgb(83, 19, 20)", "rgb(7, 6, 14)", "#FE8B92"),
        DARKBLUE: new LcdColorDef("rgb(14, 24, 31)", "rgb(46, 105, 144)", "rgb(19, 64, 96)", "rgb(6, 20, 29)", "rgb(8, 9, 10)", "#3DB3FF"),
        LILA: new LcdColorDef("rgb(175, 164, 255)", "rgb(188, 168, 253)", "rgb(176, 159, 255)", "rgb(174, 147, 252)", "rgb(168, 136, 233)", "#076148"),
        BLACKRED: new LcdColorDef("rgb(8, 12, 11)", "rgb(10, 11, 13)", "rgb(11, 10, 15)", "rgb(7, 13, 9)", "rgb(9, 13, 14)", "#B50026"),
        DARKGREEN: new LcdColorDef("rgb(25, 85, 0)", "rgb(47, 154, 0)", "rgb(30, 101, 0)", "rgb(30, 101, 0)", "rgb(25, 85, 0)", "#233123"),
        AMBER: new LcdColorDef("rgb(182, 71, 0)", "rgb(236, 155, 25)", "rgb(212, 93, 5)", "rgb(212, 93, 5)", "rgb(182, 71, 0)", "#593A0A"),
        LIGHTBLUE: new LcdColorDef("rgb(125, 146, 184)", "rgb(197, 212, 231)", "rgb(138, 155, 194)", "rgb(138, 155, 194)", "rgb(125, 146, 184)", "#090051"),
        SECTIONS: new LcdColorDef("#b2b2b2", "#ffffff", "#c4c4c4", "#c4c4c4", "#b2b2b2", "#000000")
    };
    var color = {
        RED: new ColorDef(new RgbaColor(82, 0, 0, 1), new RgbaColor(158, 0, 19, 1), new RgbaColor(213, 0, 25, 1), new RgbaColor(240, 82, 88, 1), new RgbaColor(255, 171, 173, 1), new RgbaColor(255, 217, 218, 1)),
        GREEN: new ColorDef(new RgbaColor(8, 54, 4, 1), new RgbaColor(0, 107, 14, 1), new RgbaColor(15, 148, 0, 1), new RgbaColor(121, 186, 37, 1), new RgbaColor(190, 231, 141, 1), new RgbaColor(234, 247, 218, 1)),
        BLUE: new ColorDef(new RgbaColor(0, 11, 68, 1), new RgbaColor(0, 73, 135, 1), new RgbaColor(0, 108, 201, 1), new RgbaColor(0, 141, 242, 1), new RgbaColor(122, 200, 255, 1), new RgbaColor(204, 236, 255, 1)),
        ORANGE: new ColorDef(new RgbaColor(118, 83, 30, 1), new RgbaColor(215, 67, 0, 1), new RgbaColor(240, 117, 0, 1), new RgbaColor(255, 166, 0, 1), new RgbaColor(255, 255, 128, 1), new RgbaColor(255, 247, 194, 1)),
        YELLOW: new ColorDef(new RgbaColor(41, 41, 0, 1), new RgbaColor(102, 102, 0, 1), new RgbaColor(177, 165, 0, 1), new RgbaColor(255, 242, 0, 1), new RgbaColor(255, 250, 153, 1), new RgbaColor(255, 252, 204, 1)),
        CYAN: new ColorDef(new RgbaColor(15, 109, 109, 1), new RgbaColor(0, 109, 144, 1), new RgbaColor(0, 144, 191, 1), new RgbaColor(0, 174, 239, 1), new RgbaColor(153, 223, 249, 1), new RgbaColor(204, 239, 252, 1)),
        MAGENTA: new ColorDef(new RgbaColor(98, 0, 114, 1), new RgbaColor(128, 24, 72, 1), new RgbaColor(191, 36, 107, 1), new RgbaColor(255, 48, 143, 1), new RgbaColor(255, 172, 210, 1), new RgbaColor(255, 214, 23, 1)),
        WHITE: new ColorDef(new RgbaColor(210, 210, 210, 1), new RgbaColor(220, 220, 220, 1), new RgbaColor(235, 235, 235, 1), new RgbaColor(255, 255, 255, 1), new RgbaColor(255, 255, 255, 1), new RgbaColor(255, 255, 255, 1)),
        GRAY: new ColorDef(new RgbaColor(25, 25, 25, 1), new RgbaColor(51, 51, 51, 1), new RgbaColor(76, 76, 76, 1), new RgbaColor(128, 128, 128, 1), new RgbaColor(204, 204, 204, 1), new RgbaColor(243, 243, 243, 1)),
        BLACK: new ColorDef(new RgbaColor(0, 0, 0, 1), new RgbaColor(5, 5, 5, 1), new RgbaColor(10, 10, 10, 1), new RgbaColor(15, 15, 15, 1), new RgbaColor(20, 20, 20, 1), new RgbaColor(25, 25, 25, 1)),
        RAITH: new ColorDef(new RgbaColor(0, 32, 65, 1), new RgbaColor(0, 65, 125, 1), new RgbaColor(0, 106, 172, 1), new RgbaColor(130, 180, 214, 1), new RgbaColor(148, 203, 242, 1), new RgbaColor(191, 229, 255, 1)),
        GREEN_LCD: new ColorDef(new RgbaColor(0, 55, 45, 1), new RgbaColor(15, 109, 93, 1), new RgbaColor(0, 185, 165, 1), new RgbaColor(48, 255, 204, 1), new RgbaColor(153, 255, 227, 1), new RgbaColor(204, 255, 241, 1)),
        JUG_GREEN: new ColorDef(new RgbaColor(0, 56, 0, 1), new RgbaColor(32, 69, 36, 1), new RgbaColor(50, 161, 0, 1), new RgbaColor(129, 206, 0, 1), new RgbaColor(190, 231, 141, 1), new RgbaColor(234, 247, 218, 1))
    };
    var ledColor = {
        RED_LED: new LedColorDef("#FF9A89", "#FF9A89", "#FF3300", "#FF8D70", "#7E1C00", "#7E1C00", "#641B00"),
        GREEN_LED: new LedColorDef("#9AFF89", "#9AFF89", "#59FF2A", "#A5FF00", "#1C7E00", "#1C7E00", "#1B6400"),
        BLUE_LED: new LedColorDef("#899AFF", "#899AFF", "#0033FF", "#708DFF", "#001C7E", "#001C7E", "#001B64"),
        ORANGE_LED: new LedColorDef("#FEA23F", "#FEA23F", "#FD6C00", "#FD6C00", "#592800", "#592800", "#421F00"),
        YELLOW_LED: new LedColorDef("#FFFF62", "#FFFF62", "#FFFF00", "#FFFF00", "#6B6D00", "#6B6D00", "#515300"),
        CYAN_LED: new LedColorDef("#00FFFF", "#00FFFF", "#1BC3C3", "#00FFFF", "#083B3B", "#083B3B", "#052727"),
        MAGENTA_LED: new LedColorDef("#D300FF", "#D300FF", "#8600CB", "#C300FF", "#38004B", "#38004B", "#280035")
    };
    var gaugeType = {
        TYPE1: new GaugeTypeDef("type1"),
        TYPE2: new GaugeTypeDef("type2"),
        TYPE3: new GaugeTypeDef("type3"),
        TYPE4: new GaugeTypeDef("type4"),
        TYPE5: new GaugeTypeDef("type5")
    };
    var orientation = {
        NORTH: new OrientationDef("north"),
        SOUTH: new OrientationDef("south"),
        EAST: new OrientationDef("east"),
        WEST: new OrientationDef("west")
    };
    var knobType = {
        STANDARD_KNOB: new KnobTypeDef("standardKnob"),
        METAL_KNOB: new KnobTypeDef("metalKnob")
    };
    var knobStyle = {
        BLACK: new KnobStyleDef("black"),
        BRASS: new KnobStyleDef("brass"),
        SILVER: new KnobStyleDef("silver")
    };
    var frameDesign = {
        BLACK_METAL: new FrameDesignDef("blackMetal"),
        METAL: new FrameDesignDef("metal"),
        SHINY_METAL: new FrameDesignDef("shinyMetal"),
        BRASS: new FrameDesignDef("brass"),
        STEEL: new FrameDesignDef("steel"),
        CHROME: new FrameDesignDef("chrome"),
        GOLD: new FrameDesignDef("gold"),
        ANTHRACITE: new FrameDesignDef("anthracite"),
        TILTED_GRAY: new FrameDesignDef("tiltedGray"),
        TILTED_BLACK: new FrameDesignDef("tiltedBlack"),
        GLOSSY_METAL: new FrameDesignDef("glossyMetal")
    };
    var pointerType = {
        TYPE1: new PointerTypeDef("type1"),
        TYPE2: new PointerTypeDef("type2"),
        TYPE3: new PointerTypeDef("type3"),
        TYPE4: new PointerTypeDef("type4"),
        TYPE5: new PointerTypeDef("type5"),
        TYPE6: new PointerTypeDef("type6"),
        TYPE7: new PointerTypeDef("type7"),
        TYPE8: new PointerTypeDef("type8"),
        TYPE9: new PointerTypeDef("type9"),
        TYPE10: new PointerTypeDef("type10"),
        TYPE11: new PointerTypeDef("type11"),
        TYPE12: new PointerTypeDef("type12"),
        TYPE13: new PointerTypeDef("type13"),
        TYPE14: new PointerTypeDef("type14"),
        TYPE15: new PointerTypeDef("type15"),
        TYPE16: new PointerTypeDef("type16")
    };
    var foregroundType = {
        TYPE1: new ForegroundTypeDef("type1"),
        TYPE2: new ForegroundTypeDef("type2"),
        TYPE3: new ForegroundTypeDef("type3"),
        TYPE4: new ForegroundTypeDef("type4"),
        TYPE5: new ForegroundTypeDef("type5")
    };
    var labelNumberFormat = {
        STANDARD: new LabelNumberFormatDef("standard"),
        FRACTIONAL: new LabelNumberFormatDef("fractional"),
        SCIENTIFIC: new LabelNumberFormatDef("scientific")
    };
    var tickLabelOrientation = {
        NORMAL: new TickLabelOrientationDef("normal"),
        HORIZONTAL: new TickLabelOrientationDef("horizontal"),
        TANGENT: new TickLabelOrientationDef("tangent")
    };
    var trendState = {
        UP: new TrendStateDef("up"),
        STEADY: new TrendStateDef("steady"),
        DOWN: new TrendStateDef("down"),
        OFF: new TrendStateDef("off")
    };
    return {
        Radial: radial,
        RadialBargraph: radialBargraph,
        DisplaySingle: displaySingle,
        WindDirection: windDirection,
        Led: led,
        Odometer: odometer,
        drawFrame: drawRadialFrameImage,
        drawBackground: drawRadialBackgroundImage,
        drawForeground: drawRadialForegroundImage,
        rgbaColor: RgbaColor,
        ConicalGradient: ConicalGradient,
        setAlpha: setAlpha,
        getColorFromFraction: getColorFromFraction,
        gradientWrapper: GradientWrapper,
        BackgroundColor: backgroundColor,
        LcdColor: lcdColor,
        ColorDef: color,
        LedColor: ledColor,
        GaugeType: gaugeType,
        Orientation: orientation,
        FrameDesign: frameDesign,
        PointerType: pointerType,
        ForegroundType: foregroundType,
        KnobType: knobType,
        KnobStyle: knobStyle,
        LabelNumberFormat: labelNumberFormat,
        TickLabelOrientation: tickLabelOrientation,
        TrendState: trendState,
        Section: section
    }
}();