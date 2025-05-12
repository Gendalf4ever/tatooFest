document.addEventListener('DOMContentLoaded', function() {
    // Инициализация элементов
    const map = document.getElementById('map');
    const bookingForm = document.getElementById('bookingForm');
    const vkLinkInput = bookingForm.elements.link;
    let selectedPlaces = new Set();

    // Основные функции
    function initMap() {
        places.forEach((place, index) => {
            const placeEl = document.createElement('div');
            placeEl.className = `place ${place.class}`;
            placeEl.style.cssText = `
                left: ${place.x}px;
                top: ${place.y}px;
                transform: rotate(${place.rotate}deg);
            `;
            placeEl.dataset.id = index;
            placeEl.title = `Место #${index+1} | Тип: ${place.class.replace('_', ' ')}`;

            placeEl.addEventListener('click', togglePlaceSelection);
            map.appendChild(placeEl);
        });
    }

    function togglePlaceSelection() {
        const placeId = this.dataset.id;
        
        if (this.classList.contains('booked')) {
            showAlert('Это место уже забронировано!');
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
    }

    function updateSelectedPlacesUI() {
        const countElement = document.getElementById('selectedPlacesCount');
        const listElement = document.getElementById('selectedPlacesList');
        
        if (countElement) countElement.textContent = selectedPlaces.size;
        
        if (listElement) {
            listElement.innerHTML = selectedPlaces.size > 0 
                ? Array.from(selectedPlaces)
                    .map(id => `<div>Место #${parseInt(id)+1}</div>`)
                    .join('')
                : '<div class="empty">Выберите места на карте</div>';
        }
    }

    function formatVKLink(input) {
        let value = input.value.trim();
        
        if (!value) return;
        
        if (!value.includes('vk.com/') && !value.startsWith('@')) {
            value = 'vk.com/' + value;
        } else if (value.startsWith('@')) {
            value = 'vk.com/' + value.substring(1);
        }
        
        value = value.replace(/(\/+)/g, '/');
        input.value = value;
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        
        // Валидация
        const name = bookingForm.elements.name.value.trim();
        const vkLink = vkLinkInput.value.trim();
        const vkRegex = /^(https?:\/\/)?(www\.)?vk\.com\/([a-zA-Z0-9_\.-]+)/;
        
        if (!name) {
            showAlert('Пожалуйста, введите ваше имя!');
            return;
        }
        
        if (!vkRegex.test(vkLink)) {
            showAlert('Пожалуйста, введите корректную ссылку VK!\nПример: vk.com/username');
            vkLinkInput.focus();
            return;
        }
        
        if (selectedPlaces.size === 0) {
            showAlert('Пожалуйста, выберите хотя бы одно место!');
            return;
        }
        
        // Подготовка данных
        const formData = {
            name,
            link: vkLink,
            date: document.querySelector('input[name="date"]:checked').value,
            places: Array.from(selectedPlaces).map(id => parseInt(id)+1),
            placesIds: Array.from(selectedPlaces),
            timestamp: new Date().toISOString()
        };

        try {
            // Отправка в VK
            await sendBookingToVK(formData);
            
            // Обновление UI
            selectedPlaces.forEach(placeId => {
                const placeEl = document.querySelector(`.place[data-id="${placeId}"]`);
                if (placeEl) {
                    placeEl.classList.remove('selected');
                    placeEl.classList.add('booked');
                }
            });

            // Сброс формы
            selectedPlaces.clear();
            updateSelectedPlacesUI();
            bookingForm.reset();
            
            showAlert(`Успешно забронировано ${formData.places.length} мест!`);
            
            // Сохранение в localStorage
            saveBookingToHistory(formData);
            
        } catch (error) {
            console.error('Ошибка бронирования:', error);
            showAlert('Ошибка при отправке брони. Пожалуйста, попробуйте ещё раз.');
        }
    }

    function saveBookingToHistory(booking) {
        try {
            const history = JSON.parse(localStorage.getItem('bookingHistory') || '[]');
            history.push(booking);
            localStorage.setItem('bookingHistory', JSON.stringify(history));
        } catch (e) {
            console.error('Ошибка сохранения истории:', e);
        }
    }

    function showAlert(message) {
        const alertEl = document.createElement('div');
        alertEl.className = 'custom-alert';
        alertEl.textContent = message;
        document.body.appendChild(alertEl);
        
        setTimeout(() => {
            alertEl.classList.add('fade-out');
            setTimeout(() => alertEl.remove(), 300);
        }, 3000);
    }

    function scaleMap() {
        const mapSection = document.querySelector('.map-section');
        if (mapSection) {
            const scale = Math.min(
                mapSection.clientWidth / 1364.7,
                mapSection.clientHeight / 784.4,
                1 // Максимальный масштаб 100%
            );
            map.style.transform = `scale(${scale})`;
        }
    }

    // Инициализация
    function init() {
        initMap();
        scaleMap();
        updateSelectedPlacesUI();
        
        // Обработчики событий
        bookingForm.addEventListener('submit', handleFormSubmit);
        vkLinkInput.addEventListener('blur', () => formatVKLink(vkLinkInput));
        window.addEventListener('resize', scaleMap);
    }

    init();
});

// Отправка в VK (можно вынести в отдельный файл vk.js)
async function sendBookingToVK(bookingData) {
    return new Promise((resolve, reject) => {
        try {
            const message = `Новая бронь на Tattoo Fest!\n\n` +
                          `👤 Имя: ${bookingData.name}\n` +
                          `🔗 Профиль: ${normalizeVkLink(bookingData.link)}\n` +
                          `📅 Дата: ${getDateText(bookingData.date)}\n` +
                          `📍 Места: ${bookingData.places.join(', ')}\n\n` +
                          `🕒 ${new Date().toLocaleString()}`;

            const vkUrl = `https://vk.com/write-tattoo_fest_2025?text=${encodeURIComponent(message)}`;
            
            const width = 600;
            const height = 700;
            const left = (screen.width - width) / 2;
            const top = (screen.height - height) / 2;
            
            const vkWindow = window.open(vkUrl, 'vk_booking', 
                `width=${width},height=${height},left=${left},top=${top}`);
            
            if (!vkWindow) {
                const shouldProceed = confirm(
                    'Разрешите всплывающие окна или нажмите OK для ручной отправки'
                );
                
                if (shouldProceed) {
                    window.location.href = vkUrl;
                    resolve();
                } else {
                    reject(new Error('Отправка отменена'));
                }
            } else {
                const checkInterval = setInterval(() => {
                    if (vkWindow.closed) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 500);
            }
        } catch (error) {
            reject(error);
        }
    });
}

function normalizeVkLink(link) {
    return link.startsWith('http') ? link : `https://${link}`;
}

function getDateText(date) {
    const dates = {
        '24.05': '24 мая',
        '25.05': '25 мая', 
        'both': '24 и 25 мая'
    };
    return dates[date] || date;
}