
function sendToVKGroup(formData) {
    try {
        // Проверка данных
        if (!formData || !formData.places || formData.places.length === 0) {
            console.error('Ошибка: Нет данных о выбранных местах', formData);
            alert('Пожалуйста, выберите хотя бы одно место!');
            return false;
        }

        // Формирование сообщения
        const message = `Новая заявка на бронирование для Tattoo Fest 2025:\n\n` +
                       `Имя: ${formData.name || 'не указано'}\n` +
                       `Ссылка ВК: ${formData.link || 'не указана'}\n` +
                       `Дата: ${formData.date || 'не указана'}\n` +
                       `Количество мест: ${formData.places.length}\n` +
                       `Выбранные места: ${formData.places.join(', ') || 'не указаны'}\n\n` +
                       `Пожалуйста, свяжитесь с клиентом для подтверждения бронирования!`;
        
        // Ссылка для отправки сообщения в группу
        const groupId = 'tattoo_fest_2025';
        const vkLink = `https://vk.com/write-${groupId}?text=${encodeURIComponent(message)}`;
        
        // Открываем в новом окне
        const newWindow = window.open(vkLink, '_blank', 'width=600,height=400');
        
        if (!newWindow) {
            const shouldSend = confirm('Не удалось открыть ВК. Хотите перейти вручную?');
            if (shouldSend) {
                window.location.href = vkLink;
            }
        }
        
        return true;
    } catch (error) {
        console.error('Ошибка при отправке в VK:', error);
        alert('Ошибка при попытке открыть диалог с группой. Пожалуйста, напишите в группу вручную.');
        return false;
    }
}
*/

            /* 
            if (sendToVKGroup(formData)) {
                // Помечаем места как забронированные
                selectedPlaces.forEach(placeId => {
                    const placeEl = document.querySelector(`.place[data-id="${placeId}"]`);
                    if (placeEl) {
                        placeEl.classList.remove('selected');
                        placeEl.classList.add('booked');
                    }
                });

                // Сбрасываем форму
                selectedPlaces.clear();
                updateSelectedPlacesUI();
                form.reset();
                
                alert(`Заявка на ${formData.places.length} мест отправлена! Проверьте открывшееся окно с диалогом группы.`);
            }
            