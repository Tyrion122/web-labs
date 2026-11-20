import { NoiseMeasurement } from "./NoiseMeasurement.js";

export const NOISE_LIMITS = Object.freeze({
    normalMax: 55,
    warningMax: 70
});

export class NoiseSensor {
    constructor(id, district, location, noiseLevel) {
        if (!NoiseSensor.isValidNoiseLevel(noiseLevel)) {
            throw new Error(`Некоректний початковий рівень шуму для датчика ${id}`);
        }
        this.id = id;
        this.district = district;
        this.location = location;
        this.noiseLevel = noiseLevel;
        this.measurements = [];
    }

    static isValidNoiseLevel(value) {
        return Number.isFinite(value) && value >= 0 && value <= 200;
    }

    static fromObject(data) {
        if (!data || typeof data.id !== "string" || typeof data.district !== "string" || typeof data.location !== "string") {
            throw new Error("Некоректні дані для створення датчика");
        }
        return new NoiseSensor(data.id, data.district, data.location, data.noiseLevel);
    }

    getStatus() {
        if (this.noiseLevel <= NOISE_LIMITS.normalMax) {
            return "normal";
        }
        if (this.noiseLevel <= NOISE_LIMITS.warningMax) {
            return "warning";
        }
        return "critical";
    }

    updateNoiseLevel(value) {
        if (!NoiseSensor.isValidNoiseLevel(value)) {
            throw new Error(`Неприпустиме значення рівня шуму: ${value}`);
        }
        this.noiseLevel = value;
    }

    addMeasurement(measurement) {
        if (!(measurement instanceof NoiseMeasurement)) {
            throw new Error("Очікується екземпляр NoiseMeasurement");
        }
        if (!measurement.isValid()) {
            throw new Error(`Некоректне значення вимірювання: ${measurement.value}`);
        }
        this.measurements.push(measurement);
        this.noiseLevel = measurement.value;
    }
}