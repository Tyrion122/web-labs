export class NoiseMeasurement {
    constructor(value, measuredAt = new Date()) {
        this.value = value;
        this.measuredAt = measuredAt instanceof Date ? measuredAt : new Date(measuredAt);
    }

    isValid() {
        return Number.isFinite(this.value) && this.value >= 0 && this.value <= 200;
    }

    toString() {
        return `${this.measuredAt.toLocaleTimeString("uk-UA")} -> ${this.value} dB`;
    }
}