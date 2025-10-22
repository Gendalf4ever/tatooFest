/**
 * Отправка сообщения в группу (финальная версия)
 */
function sendBookingToVK(bookingData) {
    return new Promise((resolve, reject) => {
        try {
            console.log('Отправляемые данные:', bookingData); // Для отладки
            
            // Формируем сообщение с данными
            const message = [
                '🎨 Новая бронь на Tattoo Fest 2025',
                '',
                `👤 Имя: ${bookingData.name.trim()}`,
                `🔗 VK: https://vk.com/${normalizeLink(bookingData.link)}`,
                `📅 Дата: ${formatDate(bookingData.date)}`,
                `📍 Забронированные места: #${bookingData.places.join(', #')}`,
                '',
                `⏱ Время брони: ${new Date().toLocaleString('ru-RU')}`
            ].join('\n');

            console.log('Сформированное сообщение:', message); // Для отладки

            const groupId = -230557513; // ID вашей группы (с минусом)

            // Создаем URL с предзаполненным текстом
            const vkUrl = `https://vk.com/write${groupId}?text=${encodeURIComponent(message)}`;
            
            console.log('URL для VK:', vkUrl); // Для отладки
            
            // Открываем окно VK с предзаполненным сообщением
            const popup = window.open(vkUrl, '_blank', 'width=700,height=800,scrollbars=yes,resizable=yes');

            if (popup) {
                // Ждем закрытия окна
                const timer = setInterval(() => {
                    if (popup.closed) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 500);
                
                // Таймаут на случай если окно не закроется
                setTimeout(() => {
                    clearInterval(timer);
                    resolve();
                }, 300000); // 5 минут
            } else {
                // Если popup заблокирован, переходим по ссылке
                window.location.href = vkUrl;
                resolve();
            }
        } catch (error) {
            console.error('Ошибка отправки:', error);
            reject(error);
        }
    });
}

/**
 * Нормализация ссылки на профиль VK
 */
function normalizeLink(link) {
    if (!link) return 'не указано';
    return link.toString()
        .replace(/(https?:\/\/)?(www\.)?(vk\.com\/|vkontakte\.ru\/)?/i, '')
        .replace(/^@/, '')
        .replace(/\s+/g, '')
        .trim();
}

/**
 * Форматирование даты в читаемый вид
 */
function formatDate(date) {
    const dates = {
        '29.11': '29 ноября',
        '30.11': '30 ноября',
        'both': 'оба дня'
    };
    return dates[date] || date;
}