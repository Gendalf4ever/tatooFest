import { CONFIG } from './config.js';
import { places } from './places-data.js';

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    initApplication();
});

function initApplication() {
    let selectedPlaces = new Set();
    
    initPlaces();
    initFormHandlers();
    initMapScaling();
    
    function initPlaces() {
        const container = document.querySelector('.html-places');
        
        places.forEach(place => {
            const placeEl = createPlaceElement(place);
            container.appendChild(placeEl);
            
            placeEl.addEventListener('click', () => {
                togglePlaceSelection(placeEl, place.id);
            });
        });
    }
    
    function createPlaceElement(place) {
        const el = document.createElement('div');
        el.className = `place ${place.class}`;
        el.id = `place-${place.id}`;
        el.dataset.id = place.id;
        el.dataset.available = place.available;
        
        // Позиционирование
        el.style.left = `${(place.x / CONFIG.MAP_SIZE.width) * 100}%`;
        el.style.top = `${(place.y / CONFIG.MAP_SIZE.height) * 100}%`;
        el.style.transform = `rotate(${place.rotate}deg)`;
        
        // Информация при наведении
        el.title = `${CONFIG.PLACE_TYPES[place.class].name}\nМесто #${place.id}`;
        
        return el;
    }
    
    function togglePlaceSelection(element, placeId) {
        if (element.classList.contains('booked')) {
            alert('Это место уже забронировано!');
            return;
        }
        
        if (selectedPlaces.has(placeId)) {
            selectedPlaces.delete(placeId);
            element.classList.remove('selected');
        } else {
            selectedPlaces.add(placeId);
            element.classList.add('selected');
        }
        
        updateSelectedPlacesUI();
    }
    
    function updateSelectedPlacesUI() {
        document.getElementById('selectedPlacesCount').textContent = selectedPlaces.size;
        
        const listElement = document.getElementById('selectedPlacesList');
        listElement.innerHTML = '';
        
        selectedPlaces.forEach(id => {
            const place = places.find(p => p.id === id);
            const item = document.createElement('div');
            item.className = 'selected-place';
            item.textContent = `Место #${id} (${CONFIG.PLACE_TYPES[place.class].name})`;
            listElement.appendChild(item);
        });
    }
    
    function initFormHandlers() {
        const form = document.getElementById('bookingForm');
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (selectedPlaces.size === 0) {
                alert('Пожалуйста, выберите хотя бы одно место!');
                return;
            }
            
            const formData = {
                name: form.elements.name.value.trim(),
                link: formatVKLink(form.elements.link.value),
                date: form.querySelector('input[name="date"]:checked').value,
                places: Array.from(selectedPlaces).map(id => `#${id}`),
                placeIds: Array.from(selectedPlaces)
            };
            
            try {
                // Отправка данных
                const success = await sendBookingData(formData);
                
                if (success) {
                    // Пометить места как забронированные
                    selectedPlaces.forEach(id => {
                        const el = document.getElementById(`place-${id}`);
                        if (el) el.classList.add('booked');
                    });
                    
                    // Сброс формы
                    selectedPlaces.clear();
                    updateSelectedPlacesUI();
                    form.reset();
                }
            } catch (error) {
                console.error('Ошибка бронирования:', error);
                alert('Произошла ошибка при бронировании. Пожалуйста, попробуйте ещё раз.');
            }
        });
        
        // Валидация VK ссылки
        form.elements.link.addEventListener('blur', function() {
            this.value = formatVKLink(this.value);
        });
    }
    
    function formatVKLink(input) {
        let value = input.trim();
        if (value && !value.includes('vk.com/')) {
            value = 'vk.com/' + value.replace(/^@/, '');
        }
        return value.replace(/[^a-zA-Z0-9_\.\-\/]/g, '');
    }
    
    async function sendBookingData(data) {
        // Режим разработки - вывод в консоль
        if (process.env.NODE_ENV === 'development') {
            console.log('Данные бронирования:', data);
            alert(`Тестовая заявка на ${data.places.length} мест!\n(режим разработки)`);
            return true;
        }
        
        // Реальный вызов API
        try {
            const response = await fetch('/api/booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) throw new Error('Ошибка сервера');
            
            alert('Бронирование успешно отправлено!');
            return true;
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка при отправке данных. Пожалуйста, попробуйте ещё раз.');
            return false;
        }
    }
    
    function initMapScaling() {
        function scaleMap() {
            const mapSection = document.querySelector('.map-section');
            if (!mapSection) return;
            
            const scale = Math.min(
                mapSection.clientWidth / CONFIG.MAP_SIZE.width,
                mapSection.clientHeight / CONFIG.MAP_SIZE.height
            );
            
            document.getElementById('map').style.transform = `scale(${scale})`;
        }
        
        window.addEventListener('resize', scaleMap);
        scaleMap();
    }
}