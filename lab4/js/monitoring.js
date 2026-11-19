const noiseLevels = [
    42, 55, 61, 78, 83, 67, 49, 72, 91, 58, 64, 76,
    53, 47, 88, 69, 74, 82, 95, 51, 71, -1, 85, 63,
    79, 39, 141, 86
];

const warningLevel = 70;
const criticalLevel = 85;
const minValidLevel = 30;
const maxValidLevel = 130;

const formatLevel = value => `${value} dB`;
const isAboveThreshold = (value, threshold) => value > threshold;

function isValidLevel(level, min, max) {
    return Number.isFinite(level) && level >= min && level <= max;
}

function findFirstValid(data, min, max) {
    if (data.length === 0) {
        return null;
    }

    let index = 0;
    do {
        if (isValidLevel(data[index], min, max)) {
            return {
                value: data[index],
                position: index + 1
            };
        }
        index++;
    } while (index < data.length);

    return null;
}

function calculateAverage(data, min, max) {
    let sum = 0;
    let count = 0;

    for (const level of data) {
        if (!isValidLevel(level, min, max)) {
            continue;
        }
        sum += level;
        count++;
    }

    if (count === 0) {
        return null;
    }

    return sum / count;
}

function findMinimum(data, min, max) {
    let minValue = null;

    for (const level of data) {
        if (!isValidLevel(level, min, max)) {
            continue;
        }
        if (minValue === null || level < minValue) {
            minValue = level;
        }
    }

    return minValue;
}

function findMaximum(data, min, max) {
    let maxValue = null;

    for (const level of data) {
        if (!isValidLevel(level, min, max)) {
            continue;
        }
        if (maxValue === null || level > maxValue) {
            maxValue = level;
        }
    }

    return maxValue;
}

const countByCategory = function (data, warnLimit, critLimit, min, max) {
    let normal = 0;
    let warning = 0;
    let critical = 0;
    let invalid = 0;

    for (const level of data) {
        if (!isValidLevel(level, min, max)) {
            invalid++;
            continue;
        }

        if (isAboveThreshold(level, critLimit)) {
            critical++;
        } else if (isAboveThreshold(level, warnLimit)) {
            warning++;
        } else {
            normal++;
        }
    }

    return {
        normal,
        warning,
        critical,
        valid: normal + warning + critical,
        invalid
    };
};

function findFirstCritical(data, critLimit, min, max) {
    for (let i = 0; i < data.length; i++) {
        const level = data[i];
        if (!isValidLevel(level, min, max)) {
            continue;
        }
        if (isAboveThreshold(level, critLimit)) {
            return {
                value: level,
                index: i,
                position: i + 1
            };
        }
    }

    return null;
}

function findRecovery(data, firstCritical, warnLimit, min, max) {
    if (!firstCritical) {
        return null;
    }

    let i = firstCritical.index + 1;
    let streak = 0;

    while (i < data.length) {
        const level = data[i];

        if (isValidLevel(level, min, max) && !isAboveThreshold(level, warnLimit)) {
            streak++;
            if (streak === 3) {
                return {
                    value: level,
                    position: i + 1
                };
            }
        } else {
            streak = 0;
        }

        i++;
    }

    return null;
}

function findInvalidRecords(data, min, max) {
    const invalidList = [];

    for (let i = 0; i < data.length; i++) {
        if (!isValidLevel(data[i], min, max)) {
            invalidList.push({
                value: data[i],
                position: i + 1
            });
        }
    }

    return invalidList;
}

function generateReport(title, data, warnLimit, critLimit, min, max, classifierFn) {
    const stats = classifierFn(data, warnLimit, critLimit, min, max);
    const average = calculateAverage(data, min, max);
    const minimum = findMinimum(data, min, max);
    const maximum = findMaximum(data, min, max);
    const firstValid = findFirstValid(data, min, max);
    const firstCritical = findFirstCritical(data, critLimit, min, max);
    const recovery = findRecovery(data, firstCritical, warnLimit, min, max);
    const invalidRecords = findInvalidRecords(data, min, max);
    const totalExceededWarning = stats.warning + stats.critical;

    console.group(title);
    console.log(`Пороги: попередження > ${formatLevel(warnLimit)}; критичний рівень > ${formatLevel(critLimit)}`);
    console.log(`Усього вимірювань: ${data.length}`);
    console.log(`Коректних: ${stats.valid}`);
    console.log(`Некоректних: ${stats.invalid}`);

    console.table([
        { Категорія: "Без перевищення", Кількість: stats.normal },
        { Категорія: "Попередження", Кількість: stats.warning },
        { Категорія: "Критичні", Кількість: stats.critical }
    ]);

    if (average !== null) {
        console.log(`Перше коректне вимірювання: ${formatLevel(firstValid.value)}, позиція ${firstValid.position}`);
        console.log(`Середній рівень: ${average.toFixed(2).replace(".", ",")} dB`);
        console.log(`Мінімальний рівень: ${formatLevel(minimum)}`);
        console.log(`Максимальний рівень: ${formatLevel(maximum)}`);
    } else {
        console.log("Середній, мінімальний та максимальний рівні: null (немає коректних даних)");
    }

    if (firstCritical) {
        console.log(`Перше критичне вимірювання: ${formatLevel(firstCritical.value)}, позиція ${firstCritical.position}`);
    } else {
        console.log("Перше критичне вимірювання: не виявлено");
    }

    if (recovery) {
        console.log(`Відновлення -- три безпечні вимірювання поспіль: позиція ${recovery.position} (${formatLevel(recovery.value)})`);
    } else {
        console.log("Відновлення -- три безпечні вимірювання поспіль: не знайдено");
    }

    if (totalExceededWarning > 0) {
        console.warn(`Поріг ${formatLevel(warnLimit)} перевищено у ${totalExceededWarning} вимірюваннях.`);
    }

    if (invalidRecords.length > 0) {
        const details = invalidRecords
            .map(item => `позиція ${item.position} (${formatLevel(item.value)})`)
            .join(", ");
        console.error(`Некоректні дані: ${details}.`);
    }

    if (stats.critical > 0 && !recovery) {
        console.log(`Висновок: зафіксовано ${stats.critical} критичні вимірювання; після першого з них стійкого відновлення не виявлено.`);
    } else if (stats.critical > 0 && recovery) {
        console.log(`Висновок: зафіксовано ${stats.critical} критичні вимірювання; стійке відновлення зафіксовано на позиції ${recovery.position}.`);
    } else if (stats.valid === 0) {
        console.log("Висновок: коректні вимірювання для аналізу відсутні.");
    } else {
        console.log("Висновок: критичних перевищень не зафіксовано, акустична ситуація контрольована.");
    }

    console.groupEnd();
}

generateReport(
    "Акустична варта -- звіт моніторингу",
    noiseLevels,
    warningLevel,
    criticalLevel,
    minValidLevel,
    maxValidLevel,
    countByCategory
);

generateReport(
    "Тест 1: порожній набір []",
    [],
    warningLevel,
    criticalLevel,
    minValidLevel,
    maxValidLevel,
    countByCategory
);

generateReport(
    "Тест 2: лише некоректні дані [-1, 141]",
    [-1, 141],
    warningLevel,
    criticalLevel,
    minValidLevel,
    maxValidLevel,
    countByCategory
);

generateReport(
    "Тест 3: граничні значення [70, 85, 86]",
    [70, 85, 86],
    warningLevel,
    criticalLevel,
    minValidLevel,
    maxValidLevel,
    countByCategory
);

generateReport(
    "Тест 4: перервана серія відновлення та успішне відновлення",
    [90, 50, 55, 75, 45, 60, 68],
    warningLevel,
    criticalLevel,
    minValidLevel,
    maxValidLevel,
    countByCategory
);