// app.js
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация карты
    const map = document.getElementById('map');
    let selectedPlaces = new Set();

    // Функция для автоматического форматирования VK ссылки
    function formatVKLink(input) {
        let value = input.value.trim();
        
        // Если введен только username (без vk.com/)
        if (value.length > 0 && !value.includes('vk.com/')) {
            value = 'vk.com/' + value.replace(/^@/, '');
        }
        
        // Удаляем все лишние символы
        value = value.replace(/[^a-zA-Z0-9_\.\-\/]/g, '');
        
        input.value = value;
    }

    // Инициализация элементов мест
    places.forEach((place, index) => {
        const placeEl = document.createElement('div');
        placeEl.className = `place ${place.class}`;
        placeEl.style.left = `${place.x}px`;
        placeEl.style.top = `${place.y}px`;
        placeEl.style.transform = `rotate(${place.rotate}deg)`;
        placeEl.dataset.id = index;
        placeEl.title = `Место #${index+1} | Тип: ${place.class.replace('_', ' ')}`;

        placeEl.addEventListener('click', function() {
            const placeId = this.dataset.id;
            
            if (this.classList.contains('booked')) {
                alert('Это место уже забронировано!');
                return;
            }
            
            if (selectedPlaces.has(placeId)) {
                selectedPlaces.delete(placeId);
                this.classList.remove('selected');
            } else {
                selectedPlaces.add(placeId);
                this.classList.add('selected');
            }
            
            updateSelectedPlacesUI();
        });

        map.appendChild(placeEl);
    });

    // Обновление UI выбранных мест
    function updateSelectedPlacesUI() {
        const countElement = document.getElementById('selectedPlacesCount');
        const listElement = document.getElementById('selectedPlacesList');
        
        if (countElement) countElement.textContent = selectedPlaces.size;
        if (listElement) {
            listElement.innerHTML = '';
            selectedPlaces.forEach(placeId => {
                const placeInfo = document.createElement('div');
                placeInfo.textContent = `Место #${parseInt(placeId)+1}`;
                listElement.appendChild(placeInfo);
            });
        }
    }

    // Обработка формы
    document.getElementById('bookingForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const form = this;
        
        // Валидация VK ссылки
        const vkLinkInput = this.elements.link;
        const vkLink = vkLinkInput.value.trim();
        const vkRegex = /^(https?:\/\/)?(www\.)?vk\.com\/([a-zA-Z0-9_\.-]+)/;
        
        if (!vkRegex.test(vkLink)) {
            alert('Пожалуйста, введите корректную ссылку на страницу VK!\nПример: vk.com/username или https://vk.com/id12345');
            vkLinkInput.focus();
            return;
        }
        
        if (selectedPlaces.size === 0) {
            alert('Пожалуйста, выберите хотя бы одно место!');
            return;
        }
        
        const formData = {
            name: this.elements.name.value.trim(),
            link: vkLink,
            date: document.querySelector('input[name="date"]:checked').value,
            places: Array.from(selectedPlaces).map(id => parseInt(id)+1),
            placesIds: Array.from(selectedPlaces)
        };
        
        // Временная заглушка без отправки в VK
        console.log("Тестовые данные бронирования:", formData);
        
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
        
        alert(`Тестовая заявка на ${formData.places.length} мест сохранена! (отправка в VK отключена)`);
    });

    // Масштабирование карты
    function scaleMap() {
        const mapSection = document.querySelector('.map-section');
        if (mapSection) {
            const scale = Math.min(
                mapSection.clientWidth / 1364.7,
                mapSection.clientHeight / 784.4
            );
            const mapElement = document.getElementById('map');
            if (mapElement) {
                mapElement.style.transform = `scale(${scale})`;
            }
        }
    }

    // Обработчик для форматирования VK ссылки при вводе
    document.querySelector('input[name="link"]').addEventListener('blur', function() {
        formatVKLink(this);
    });

    // Инициализация при загрузке
    scaleMap();
    updateSelectedPlacesUI();
    
    window.addEventListener('resize', scaleMap);
});

// Функция для отправки в VK (закомментирована, но оставлена для будущего использования)
/*
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