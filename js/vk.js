/**
 * Отправка сообщения в группу (финальная версия)
 */
export function sendBookingToVK(bookingData) {
    return new Promise((resolve, reject) => {
        try {
            const message = [
                '🎨 Новая бронь на Tattoo Fest 2025',
                `👤 ${bookingData.name.trim()}`,
                `🔗 ${normalizeLink(bookingData.link)}`,
                `📅 ${formatDate(bookingData.date)}`,
                `📍 Места: ${bookingData.places.join(', ')}`,
                `⏱ ${new Date().toLocaleTimeString()}`
            ].join('\n');

            const groupId = -230557513; // ID вашей группы (с минусом)

            const vkUrl = `https://vk.com/write${groupId}?text=${encodeURIComponent(message)}`;
            
            const popup = window.open(vkUrl, '_blank', 'width=700,height=800');

            if (popup) {
                const timer = setInterval(() => {
                    if (popup.closed) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 500);
            } else {
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
        '30.08': '30 августа',
        '31.08': '31 августа',
        'both': 'оба дня'
    };
    return dates[date] || date;
}