/**
 * Отправка сообщения в группу VK
 */
export function sendBookingToVK(bookingData) {
    return new Promise((resolve, reject) => {
        try {
            // Проверка данных
            if (!bookingData?.name || !bookingData?.link || !bookingData?.places) {
                throw new Error('Заполните все обязательные поля');
            }

            // Формирование сообщения
            const message = formatBookingMessage(bookingData);
            
            // Создание ссылки для группы tattoo_fest_2025
            const vkUrl = `https://vk.com/write/tattoo_fest_2025?ref=tattoo_booking&text=${encodeURIComponent(message)}`;
            
            // Открытие чата
            openChatWindow(vkUrl, resolve, reject);

        } catch (error) {
            console.error('Ошибка:', error);
            reject(error);
        }
    });
}

// Вспомогательные функции
function formatBookingMessage(data) {
    return [
        '🎨 Новая бронь на Tattoo Fest 2025',
        `👤 Клиент: ${data.name}`,
        `📱 Профиль: ${formatProfileLink(data.link)}`,
        `📅 Дата: ${formatDate(data.date)}`,
        `📍 Места: ${data.places.join(', ')}`,
        `⏱️ Время брони: ${new Date().toLocaleString()}`
    ].join('\n');
}

function formatProfileLink(link) {
    // Очистка и нормализация ссылки VK
    return link.trim()
        .replace(/^(https?:\/\/)?(www\.)?/i, '')
        .replace(/^@/, '')
        .replace(/\s+/g, '');
}

function formatDate(date) {
    const dates = {
        '24.05': '24 мая 2025',
        '25.05': '25 мая 2025',
        'both': '24-25 мая 2025'
    };
    return dates[date] || date;
}

function openChatWindow(url, resolve, reject) {
    const width = 700;
    const height = 800;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;
    
    const windowFeatures = `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`;
    
    const vkWindow = window.open(url, 'vk_tattoo_fest', windowFeatures);
    
    if (vkWindow) {
        trackWindowClose(vkWindow, resolve);
    } else {
        handleBlockedPopup(url, resolve, reject);
    }
}

function trackWindowClose(window, callback) {
    const interval = setInterval(() => {
        if (window.closed) {
            clearInterval(interval);
            callback();
        }
    }, 500);
}

function handleBlockedPopup(url, resolve, reject) {
    if (confirm('Разрешите всплывающие окна или нажмите OK для перехода вручную')) {
        window.location.href = url;
        resolve();
    } else {
        reject(new Error('Отправка отменена пользователем'));
    }
}

/**
 * Мобильная версия отправки
 */
export function sendMobile(bookingData) {
    const message = [
        '🎨 Бронь Tattoo Fest 2025',
        `👤 ${bookingData.name}`,
        `📱 ${formatProfileLink(bookingData.link)}`,
        `📅 ${formatDate(bookingData.date)}`,
        `📍 ${bookingData.places.join(',')}`,
        `⏱️ ${new Date().toLocaleTimeString()}`
    ].join('%0A');

    window.location.href = `https://vk.com/write/tattoo_fest_2025?text=${message}`;
}