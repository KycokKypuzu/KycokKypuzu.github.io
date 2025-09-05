// Инициализация Telegram Web App
Telegram.WebApp.ready();
Telegram.WebApp.expand();

let selectedDates = {
    start: null,
    end: null
};

let isOneDayMode = false;
let dp;

// Функция инициализации календаря с учетом темы
function initDatepicker() {
    const container = document.getElementById('datepicker');
    container.innerHTML = ''; // Очищаем контейнер

    dp = new AirDatepicker('#datepicker', {
        inline: true,
        dateFormat: 'dd.MM.yyyy',
        minDate: new Date(),
        range: !isOneDayMode,
        multipleDatesSeparator: ' - ',
        autoClose: false,
        onSelect: function({date, formattedDate}) {
            updateSelection(date);
        },
        onRenderCell: function({date, cellType}) {
            // Дополнительная кастомизация ячеек если нужно
            return;
        }
    });

    // Применяем тему после инициализации календаря
    setTimeout(applyCalendarTheme, 0);

    // Восстанавливаем выбранные даты если они есть
    if (selectedDates.start) {
        if (isOneDayMode) {
            dp.selectDate(selectedDates.start);
        } else {
            if (selectedDates.end) {
                dp.selectDate([selectedDates.start, selectedDates.end]);
            } else {
                dp.selectDate(selectedDates.start);
            }
        }
    }
}

// Проверка, можно ли подтвердить выбор
function canConfirm() {
    if (isOneDayMode) {
        return selectedDates.start !== null;
    } else {
        return selectedDates.start !== null && selectedDates.end !== null;
    }
}

// Инициализируем календарь при загрузке
initDatepicker();

// Обработчик переключателя
document.getElementById('oneDayToggle').addEventListener('change', function(e) {
    isOneDayMode = e.target.checked;

    // Обновляем текст инструкции
    if (isOneDayMode) {
        document.getElementById('instructions').textContent = 'Выберите дату события';
        
        // В режиме одного дня устанавливаем end = start
        if (selectedDates.start) {
            selectedDates.end = selectedDates.start;
            updateInterface();
        }
    } else {
        document.getElementById('instructions').textContent = 'Выберите дату начала, затем дату окончания события';

        // В режиме диапазона сбрасываем конечную дату если она равна начальной
        if (selectedDates.start && selectedDates.end && selectedDates.start.getTime() === selectedDates.end.getTime()) {
            selectedDates.end = null;
            updateInterface();
        }
    }

    // Переинициализируем календарь
    initDatepicker();
});

// Функция обновления выбора
function updateSelection(date) {
    if (date) {
        if (isOneDayMode) {
            // РЕЖИМ ОДНОГО ДНЯ: обе даты одинаковые
            selectedDates.start = Array.isArray(date) ? date[0] : date;
            selectedDates.end = Array.isArray(date) ? date[0] : date;
        } else {
            // РЕЖИМ ДИАПАЗОНА
            if (Array.isArray(date) && date.length === 2) {
                selectedDates.start = date[0];
                selectedDates.end = date[1];
            } else if (Array.isArray(date) && date.length === 1) {
                selectedDates.start = date[0];
                selectedDates.end = null;
            } else if (!Array.isArray(date)) {
                selectedDates.start = date;
                selectedDates.end = null;
            }
        }
    } else {
        selectedDates.start = null;
        selectedDates.end = null;
    }

    updateInterface();
}

// Функция обновления интерфейса
function updateInterface() {
    const canConfirmSelection = canConfirm();

    // Обновляем кнопку подтверждения
    const confirmButton = document.getElementById('confirmButton');
    if (canConfirmSelection) {
        confirmButton.disabled = false;
        confirmButton.classList.add('button-active');
        confirmButton.classList.remove('button-inactive');
    } else {
        confirmButton.disabled = true;
        confirmButton.classList.remove('button-active');
        confirmButton.classList.add('button-inactive');
    }

    // Обновляем информацию о выборе
    if (selectedDates.start) {
        const startFormatted = selectedDates.start.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        if (isOneDayMode) {
            document.getElementById('dateRange').textContent = startFormatted;
            document.getElementById('daysCount').textContent = 'Продолжительность: 1 день';
        } else if (selectedDates.end) {
            const endFormatted = selectedDates.end.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });

            const timeDiff = selectedDates.end - selectedDates.start;
            const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;

            document.getElementById('dateRange').textContent = `${startFormatted} - ${endFormatted}`;
            document.getElementById('daysCount').textContent = `Продолжительность: ${daysDiff} ${getDaysText(daysDiff)}`;
        } else {
            document.getElementById('dateRange').textContent = `${startFormatted} - Выберите дату окончания`;
            document.getElementById('daysCount').textContent = '';
        }

        document.getElementById('selectionInfo').style.display = 'block';
    } else {
        document.getElementById('selectionInfo').style.display = 'none';
    }

    // Обновляем стили кнопок
    updateButtonStyles();
}

// Функция для правильного склонения слова "день"
function getDaysText(days) {
    if (days % 10 === 1 && days % 100 !== 11) return 'день';
    if ([2, 3, 4].includes(days % 10) && ![12, 13, 14].includes(days % 100)) return 'дня';
    return 'дней';
}

// Функция обновления стилей кнопок
function updateButtonStyles() {
    const confirmButton = document.getElementById('confirmButton');
    const resetButton = document.getElementById('resetButton');

    if (confirmButton.disabled) {
        confirmButton.style.backgroundColor = '#ccc';
        confirmButton.style.color = '#666';
        confirmButton.style.opacity = '0.6';
        confirmButton.style.cursor = 'not-allowed';
    } else {
        confirmButton.style.backgroundColor = Telegram.WebApp.buttonColor || '#2481cc';
        confirmButton.style.color = Telegram.WebApp.buttonTextColor || '#ffffff';
        confirmButton.style.opacity = '1';
        confirmButton.style.cursor = 'pointer';
    }

    resetButton.style.backgroundColor = Telegram.WebApp.destructiveColor || '#ff3b30';
    resetButton.style.color = Telegram.WebApp.buttonTextColor || '#ffffff';
}

// Обработчик кнопки подтверждения
document.getElementById('confirmButton').addEventListener('click', function() {
    if (canConfirm()) {
        // Подготавливаем данные для отправки
        const dataToSend = {
            start_date: selectedDates.start.toISOString().split('T')[0],
            end_date: isOneDayMode ? selectedDates.start.toISOString().split('T')[0] : selectedDates.end.toISOString().split('T')[0],
            start_date_formatted: selectedDates.start.toLocaleDateString('ru-RU'),
            end_date_formatted: isOneDayMode ? selectedDates.start.toLocaleDateString('ru-RU') : selectedDates.end.toLocaleDateString('ru-RU'),
            duration: isOneDayMode ? 1 : Math.ceil((selectedDates.end - selectedDates.start) / (1000 * 60 * 60 * 24)) + 1,
            is_one_day: isOneDayMode
        };

        // Отправляем данные в бот
        Telegram.WebApp.sendData(JSON.stringify(dataToSend));

        // Закрываем Web App
        Telegram.WebApp.close();
    }
});

// Функция применения темы календаря
function applyCalendarTheme() {
    const datepicker = document.querySelector('.air-datepicker');
    if (!datepicker) return;

    // Удаляем предыдущие классы тем
    datepicker.classList.remove('air-datepicker-light', 'air-datepicker-dark');

    // Добавляем соответствующий класс темы
    if (Telegram.WebApp.colorScheme === 'dark') {
        datepicker.classList.add('air-datepicker-dark');
    } else {
        datepicker.classList.add('air-datepicker-light');
    }
}

// Обработчик кнопки сброса
document.getElementById('resetButton').addEventListener('click', function() {
    if (dp) {
        dp.clear();
    }
    selectedDates.start = null;
    selectedDates.end = null;
    document.getElementById('selectionInfo').style.display = 'none';
    document.getElementById('confirmButton').disabled = true;
    document.getElementById('oneDayToggle').checked = false;
    isOneDayMode = false;

    // Обновляем активные labels
    document.getElementById('multipleDaysLabel').classList.add('active');
    document.getElementById('oneDayToggle').checked = false;
    isOneDayMode = false;
    document.getElementById('instructions').textContent = 'Выберите дату начала, затем дату окончания события';
    initDatepicker();
    updateButtonStyles();
});

// Обновляем функцию updateTheme
function updateTheme() {
    document.body.style.backgroundColor = Telegram.WebApp.backgroundColor;
    document.body.style.color = Telegram.WebApp.textColor;
    updateButtonStyles();
    applyCalendarTheme(); // Добавляем применение темы календаря
}

// Обработчик изменения темы
Telegram.WebApp.onEvent('themeChanged', function() {
    updateTheme();
    applyCalendarTheme(); // Применяем тему календаря при изменении темы
});

// Вызываем при загрузке
applyCalendarTheme();