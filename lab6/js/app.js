import { NoiseSensor } from "./models/NoiseSensor.js";

const sensorsData = [
    {
        id: "NS-01",
        district: "Галицький",
        location: "просп. Свободи, 14",
        noiseLevel: 52
    },
    {
        id: "NS-02",
        district: "Франківський",
        location: "вул. Наукова, 8",
        noiseLevel: 68
    },
    {
        id: "NS-03",
        district: "Шевченківський",
        location: "просп. Чорновола, 21",
        noiseLevel: 83
    },
    {
        id: "NS-04",
        district: "Сихівський",
        location: "вул. Зелена, 102",
        noiseLevel: 49
    },
    {
        id: "NS-05",
        district: "Личаківський",
        location: "вул. Пасічна, 30",
        noiseLevel: 71
    },
    {
        id: "NS-06",
        district: "Залізничний",
        location: "вул. Городоцька, 155",
        noiseLevel: 86
    }
];

const sensors = sensorsData.map((item) => NoiseSensor.fromObject(item));

const sensorList = document.querySelector(".sensor-list");
const districtFilter = document.querySelector("#district-filter");
const criticalFilter = document.querySelector("#critical-filter");

function createSensorCard(sensor) {
    const status = sensor.getStatus();
    const card = document.createElement("article");
    card.classList.add("sensor-card");
    card.classList.add(`sensor-card--${status}`);

    const header = document.createElement("div");
    header.classList.add("sensor-card__header");

    const title = document.createElement("h3");
    title.classList.add("sensor-card__title");
    title.textContent = sensor.id;

    const statusBadge = document.createElement("span");
    statusBadge.classList.add("sensor-card__status");

    const statusDot = document.createElement("span");
    statusDot.classList.add("sensor-card__dot");

    const statusText = document.createElement("span");
    statusText.textContent = status;

    statusBadge.append(statusDot, statusText);
    header.append(title, statusBadge);

    const meta = document.createElement("div");
    meta.classList.add("sensor-card__meta");

    const district = document.createElement("p");
    district.classList.add("sensor-card__row");
    district.textContent = `📍 ${sensor.district} район`;

    const location = document.createElement("p");
    location.classList.add("sensor-card__row");
    location.textContent = `🏢 ${sensor.location}`;

    meta.append(district, location);

    const footer = document.createElement("div");
    footer.classList.add("sensor-card__footer");

    const levelLabel = document.createElement("span");
    levelLabel.classList.add("sensor-card__label");
    levelLabel.textContent = "🎚️ Рівень шуму: ";

    const levelValue = document.createElement("strong");
    levelValue.classList.add("sensor-card__value");
    levelValue.textContent = `${sensor.noiseLevel} дБ`;

    footer.append(levelLabel, levelValue);
    card.append(header, meta, footer);

    return card;
}

function renderSensors(sensorArray) {
    sensorList.replaceChildren();
    sensorArray.forEach((sensor) => {
        const card = createSensorCard(sensor);
        sensorList.append(card);
    });
}

function applyFilters() {
    const selectedDistrict = districtFilter.value;
    const criticalOnly = criticalFilter.checked;

    const filteredSensors = sensors.filter((sensor) => {
        const matchesDistrict =
            selectedDistrict === "all" ||
            sensor.district === selectedDistrict;
        const matchesStatus =
            !criticalOnly ||
            sensor.getStatus() === "critical";

        return matchesDistrict && matchesStatus;
    });

    renderSensors(filteredSensors);
}

renderSensors(sensors);

districtFilter.addEventListener("change", applyFilters);
criticalFilter.addEventListener("change", applyFilters);