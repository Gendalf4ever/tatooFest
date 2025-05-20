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
    
    // Удаляем все, что не нужно
    value = value.replace(/^https?:\/\//i, '')
                 .replace(/^www\./i, '')
                 .replace(/^@/, '')
                 .replace(/\s+/g, '');
    
    // Добавляем базовую часть, если нужно
    if (!value.startsWith('vk.com/')) {
        value = 'vk.com/' + value;
    }
    
    // Упрощаем слэши
    value = value.replace(/(\/+)/g, '/');
    
    input.value = value.toLowerCase(); // приводим к нижнему регистру
}

   async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Валидация
    const name = bookingForm.elements.name.value.trim();
    let vkLink = vkLinkInput.value.trim();
    const vkRegex = /^(https?:\/\/)?(www\.)?vk\.com\/[a-zA-Z0-9_.\-]+$/i;
    
    // Форматируем ссылку перед проверкой
    formatVKLink(vkLinkInput);
    vkLink = vkLinkInput.value.trim();
    
    if (!name) {
        showAlert('Пожалуйста, введите ваше имя!');
        return;
    }
    
    if (!vkRegex.test(vkLink)) {
        showAlert('Пожалуйста, введите корректную ссылку VK!\nПример: vk.com/username\nИли: https://vk.com/id12345');
        vkLinkInput.focus();
        return;
    }
    
    // ... остальной код обработки формы
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
                mapSection.clientWidth / 1364.7,  //!
                mapSection.clientHeight / 784.4,  //!
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



function getDateText(date) {
    const dates = {
        '24.05': '24 мая',
        '25.05': '25 мая', 
        'both': '24 и 25 мая'
    };
    return dates[date] || date;
}