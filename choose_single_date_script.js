// Инициализация Telegram Web App
Telegram.WebApp.ready();
Telegram.WebApp.expand();

let selectedDate = null;
let dp;

// Инициализация календаря
function initDatepicker() {
    const container = document.getElementById('datepicker');
    container.innerHTML = ''; // Очищаем контейнер

    dp = new AirDatepicker('#datepicker', {
        inline: true,
        dateFormat: 'dd.MM.yyyy',
        minDate: new Date(),
        range: false, // Отключаем выбор диапазона
        multipleDates: false, // Отключаем множественный выбор
        autoClose: false,
        onSelect: function({date, formattedDate}) {
            updateSelection(date);
        }
    });

    // Восстанавливаем выбранную дату если есть
    if (selectedDate) {
        dp.selectDate(selectedDate);
    }
}

// Проверка, можно ли подтвердить выбор
function canConfirm() {
    return selectedDate !== null;
}

// Инициализируем календарь при загрузке
initDatepicker();

// Функция обновления выбора
function updateSelection(date) {
    if (date) {
        selectedDate = Array.isArray(date) ? date[0] : date;
    } else {
        selectedDate = null;
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
    if (selectedDate) {
        const dateFormatted = selectedDate.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        document.getElementById('dateRange').textContent = dateFormatted;
        document.getElementById('selectionInfo').style.display = 'block';
    } else {
        document.getElementById('selectionInfo').style.display = 'none';
    }

    // Обновляем стили кнопок
    updateButtonStyles();
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
            selected_date: selectedDate.toISOString().split('T')[0],
            selected_date_formatted: selectedDate.toLocaleDateString('ru-RU'),
            is_single_date: true
        };

        // Отправляем данные в бот
        Telegram.WebApp.sendData(JSON.stringify(dataToSend));

        // Закрываем Web App
        Telegram.WebApp.close();
    }
});

// Обработчик кнопки сброса
document.getElementById('resetButton').addEventListener('click', function() {
    if (dp) {
        dp.clear();
    }
    selectedDate = null;
    document.getElementById('selectionInfo').style.display = 'none';
    document.getElementById('confirmButton').disabled = true;
    initDatepicker();
    updateButtonStyles();
});

// Обработка темы Telegram
function updateTheme() {
    document.body.style.backgroundColor = Telegram.WebApp.backgroundColor;
    document.body.style.color = Telegram.WebApp.textColor;
    updateButtonStyles();
}

Telegram.WebApp.onEvent('themeChanged', updateTheme);
updateTheme();