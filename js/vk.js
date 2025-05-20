export function sendBookingToVK(bookingData) {
    return new Promise((resolve, reject) => {
        try {
            // Проверяем обязательные данные
            if (!bookingData || !bookingData.name || !bookingData.link || !bookingData.places || !bookingData.date) {
                throw new Error('Неполные данные для бронирования');
            }

            // Формируем текст сообщения
            const messageText = `Новая бронь на Tattoo Fest!\n\n` +
                               `👤 Имя: ${bookingData.name}\n` +
                               `🔗 Профиль: ${normalizeVkLink(bookingData.link)}\n` +
                               `📅 Дата: ${getDateText(bookingData.date)}\n` +
                               `📍 Места: ${bookingData.places.join(', ')}\n` +
                               `🕒 Время брони: ${new Date().toLocaleString()}`;

            // Формируем ссылку для отправки сообщения
            const groupId = extractGroupId('testgroupbebebe'); // Или можно из URL https://vk.com/tattoo_fest_2025
            const vkUrl = createVkMessageUrl(groupId, messageText);

            // Открываем окно отправки сообщения
            openVkMessageWindow(vkUrl, resolve, reject);
            
        } catch (error) {
            console.error('Ошибка при подготовке сообщения:', error);
            reject(error);
        }
    });
}

// Вспомогательные функции:

function normalizeVkLink(link) {
    // Приводим ссылку к единому формату
    return link.startsWith('http') ? link : `https://${link}`;
}

function getDateText(dateValue) {
    const dates = {
        '24.05': '24 мая',
        '25.05': '25 мая',
        'both': '24 и 25 мая'
    };
    return dates[dateValue] || dateValue;
}

function extractGroupId(groupUrl) {
    // Извлекаем короткое имя группы из URL
    const match = groupUrl.match(/(?:https?:\/\/)?(?:www\.)?vk\.com\/([a-zA-Z0-9_\-]+)/);
    return match ? match[1] : groupUrl;
}

function createVkMessageUrl(groupId, message) {
    // Создаем URL для отправки сообщения группе
    const encodedMessage = encodeURIComponent(message);
    return `https://vk.com/write-${groupId}?text=${encodedMessage}`;
}

function openVkMessageWindow(url, resolve, reject) {
    // Пытаемся открыть окно
    const width = 600;
    const height = 700;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;
    
    const windowFeatures = `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`;
    
    const vkWindow = window.open(url, 'vk_message', windowFeatures);
    
    if (!vkWindow) {
        // Если окно заблокировано, предлагаем альтернативу
        const shouldProceed = confirm(
            'Пожалуйста, разрешите всплывающие окна для этого сайта.\n' +
            'Или нажмите OK, чтобы перейти к отправке вручную.'
        );
        
        if (shouldProceed) {
            window.location.href = url;
            resolve();
        } else {
            reject(new Error('Отправка отменена пользователем'));
        }
    } else {
        // Проверяем, закрыл ли пользователь окно
        const checkWindow = setInterval(() => {
            if (vkWindow.closed) {
                clearInterval(checkWindow);
                resolve();
            }
        }, 500);
    }
}

// Альтернативный метод для мобильных устройств
export function sendViaMobile(bookingData) {
    const messageText = `Новая бронь на Tattoo Fest!%0A%0A` +
                       `👤 Имя: ${bookingData.name}%0A` +
                       `🔗 Профиль: ${normalizeVkLink(bookingData.link)}%0A` +
                       `📅 Дата: ${getDateText(bookingData.date)}%0A` +
                       `📍 Места: ${bookingData.places.join(', ')}`;
    
    window.location.href = `https://vk.com/write-${extractGroupId('testgroupbebebe')}?text=${messageText}`;
}