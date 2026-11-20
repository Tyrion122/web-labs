import { NoiseSensor } from "./models/NoiseSensor.js";
import { NoiseMeasurement } from "./models/NoiseMeasurement.js";
import { MobileNoiseSensor } from "./models/MobileNoiseSensor.js";
import { MonitoringSystem } from "./services/MonitoringSystem.js";

const sensorsData = [
    {
        id: "NS-01",
        district: "Галицький",
        location: "просп. Свободи",
        noiseLevel: 58
    },
    {
        id: "NS-02",
        district: "Франківський",
        location: "вул. Наукова",
        noiseLevel: 74
    },
    {
        id: "NS-03",
        district: "Шевченківський",
        location: "просп. Чорновола",
        noiseLevel: 83
    }
];

const statusLabels = {
    normal: "Норма",
    warning: "Попередження",
    critical: "Критичний рівень"
};

const monitoringSystem = new MonitoringSystem();
const initialSensors = sensorsData.map(item => NoiseSensor.fromObject(item));
initialSensors.forEach(sensor => monitoringSystem.addSensor(sensor));

const mobileSensor = new MobileNoiseSensor("NS-04", "Личаківський", "вул. Личаківська", 52, 18);
monitoringSystem.addSensor(mobileSensor);

const sensorA = new NoiseSensor("TEST-1", "Галицький", "пл. Ринок", 50);
const sensorB = new NoiseSensor("TEST-2", "Франківський", "вул. Стрийська", 65);
sensorA.updateNoiseLevel(48);

console.group("Лабораторна робота №5: перевірка класів та prototype");
console.log("Незалежність стану екземплярів:", sensorA.noiseLevel, sensorB.noiseLevel);
console.log("sensorA.getStatus === sensorB.getStatus:", sensorA.getStatus === sensorB.getStatus);
console.log("Object.hasOwn(sensorA, 'noiseLevel'):", Object.hasOwn(sensorA, "noiseLevel"));
console.log("Object.hasOwn(sensorA, 'getStatus'):", Object.hasOwn(sensorA, "getStatus"));
console.log("Середній шум базових 3 датчиків:", (initialSensors.reduce((acc, s) => acc + s.noiseLevel, 0) / initialSensors.length).toFixed(2));
console.log("Критичні датчики:", monitoringSystem.getCriticalSensors());
console.log("Датчики Галицького району:", monitoringSystem.getSensorsByDistrict("Галицький"));
console.log("Мобільний датчик потребує зарядки:", mobileSensor.needsCharging());
console.groupEnd();

function renderSensorCard(sensor) {
    const status = sensor.getStatus();
    const card = document.createElement("article");
    card.className = `metric-card sensor-card ${status}`;

    const badgeClassMap = {
        normal: "badge--success",
        warning: "badge--warning",
        critical: "badge--danger"
    };

    const batteryInfo = sensor instanceof MobileNoiseSensor
        ? `<span class="metric-card__meta">Заряд батареї: ${sensor.batteryLevel}%${sensor.needsCharging() ? " (потрібна зарядка)" : ""}</span>`
        : "";

    card.innerHTML = `
        <span class="metric-card__label">${sensor.id} · ${sensor.district} район</span>
        <strong class="metric-card__value">${sensor.noiseLevel} dB</strong>
        <span class="metric-card__meta">${sensor.location}</span>
        ${batteryInfo}
        <span class="badge ${badgeClassMap[status]}">${statusLabels[status]}</span>
    `;

    return card;
}

function renderDashboard(system, districtFilter = "all") {
    const grid = document.getElementById("sensors-grid");
    const avgElement = document.getElementById("average-noise-value");
    const criticalCountElement = document.getElementById("critical-count-value");
    const selectElement = document.getElementById("sensor-select");

    if (!grid) {
        return;
    }

    const sensorsToRender = districtFilter === "all"
        ? system.sensors
        : system.getSensorsByDistrict(districtFilter);

    grid.innerHTML = "";
    sensorsToRender.forEach(sensor => {
        grid.appendChild(renderSensorCard(sensor));
    });

    const avg = system.getAverageNoiseLevel();
    if (avgElement) {
        avgElement.textContent = avg !== null ? `${avg.toFixed(2)} dB` : "Немає даних";
    }

    if (criticalCountElement) {
        criticalCountElement.textContent = `${system.getCriticalSensors().length} шт.`;
    }

    if (selectElement && selectElement.options.length === 0) {
        system.sensors.forEach(sensor => {
            const option = document.createElement("option");
            option.value = sensor.id;
            option.textContent = `${sensor.id} — ${sensor.district} (${sensor.location})`;
            selectElement.appendChild(option);
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const districtSelect = document.getElementById("district-filter");
    const updateForm = document.getElementById("measurement-form");

    renderDashboard(monitoringSystem);

    if (districtSelect) {
        districtSelect.addEventListener("change", event => {
            renderDashboard(monitoringSystem, event.target.value);
        });
    }

    if (updateForm) {
        updateForm.addEventListener("submit", event => {
            event.preventDefault();
            const sensorId = document.getElementById("sensor-select").value;
            const rawValue = Number(document.getElementById("new-noise-level").value);
            const targetSensor = monitoringSystem.findSensorById(sensorId);

            if (!targetSensor) {
                return;
            }

            try {
                const measurement = new NoiseMeasurement(rawValue);
                targetSensor.addMeasurement(measurement);
                const currentFilter = districtSelect ? districtSelect.value : "all";
                renderDashboard(monitoringSystem, currentFilter);
                updateForm.reset();
            } catch (error) {
                alert(error.message);
            }
        });
    }
});