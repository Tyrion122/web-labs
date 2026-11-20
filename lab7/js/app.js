const API_URL = "https://6b0018517fc363ccff09caff.mockapi.io/api/v1/sensors";

let sensors = [];

const container = document.querySelector("#sensors-list");
const districtFilter = document.querySelector("#district-filter");
const criticalFilter = document.querySelector("#critical-filter");

function getNoiseCategory(noiseLevel) {
    if (noiseLevel > 70) {
        return "critical";
    }
    if (noiseLevel > 55) {
        return "warning";
    }
    return "normal";
}

function createSensorCard(sensor) {
    const noiseCategory = getNoiseCategory(sensor.noiseLevel);
    const card = document.createElement("article");
    card.classList.add("sensor-card");
    card.classList.add(`sensor-card--${noiseCategory}`);
    card.classList.add(`sensor-card--state-${sensor.status}`);

    const header = document.createElement("div");
    header.classList.add("sensor-card__header");

    const title = document.createElement("h3");
    title.classList.add("sensor-card__title");
    title.textContent = sensor.name;

    const statusBadge = document.createElement("span");
    statusBadge.classList.add("sensor-card__status");

    const statusDot = document.createElement("span");
    statusDot.classList.add("sensor-card__dot");

    const statusText = document.createElement("span");
    statusText.textContent = sensor.status;

    statusBadge.append(statusDot, statusText);
    header.append(title, statusBadge);

    const meta = document.createElement("div");
    meta.classList.add("sensor-card__meta");

    const district = document.createElement("p");
    district.classList.add("sensor-card__row");
    district.textContent = `Район: ${sensor.district}`;

    const stateRow = document.createElement("p");
    stateRow.classList.add("sensor-card__row");
    stateRow.textContent = `Статус: ${sensor.status}`;

    meta.append(district, stateRow);

    const footer = document.createElement("div");
    footer.classList.add("sensor-card__footer");

    const levelLabel = document.createElement("span");
    levelLabel.classList.add("sensor-card__label");
    levelLabel.textContent = "Рівень шуму: ";

    const levelValue = document.createElement("strong");
    levelValue.classList.add("sensor-card__value");
    levelValue.textContent = `${sensor.noiseLevel} дБ`;

    footer.append(levelLabel, levelValue);
    card.append(header, meta, footer);

    return card;
}

function renderSensors(sensorsList) {
    container.replaceChildren();
    sensorsList.forEach((sensor) => {
        const card = createSensorCard(sensor);
        container.append(card);
    });
}

function applyFilters() {
    const selectedDistrict = districtFilter.value;
    const criticalOnly = criticalFilter.checked;

    const filteredSensors = sensors.filter((sensor) => {
        const matchesDistrict =
            selectedDistrict === "all" ||
            sensor.district === selectedDistrict;
        const matchesCritical =
            !criticalOnly ||
            sensor.noiseLevel > 70;

        return matchesDistrict && matchesCritical;
    });

    renderSensors(filteredSensors);
}

async function loadSensors() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        sensors = await response.json();
        applyFilters();
    } catch (error) {
        console.error("Не вдалося завантажити сенсори:", error);
        container.innerHTML = "<p class=\"sensors__error\">Не вдалося завантажити дані.</p>";
    }
}

districtFilter.addEventListener("change", applyFilters);
criticalFilter.addEventListener("change", applyFilters);

loadSensors();