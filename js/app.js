// Основной модуль бронирования
 //импорт vk.js
import { sendBookingToVK } from './vk.js'; 
const BookingApp = (() => {
    // Элементы DOM
    let map, bookingForm, vkLinkInput;
    let selectedPlaces = new Set();

    // Инициализация карты мест
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

    // Выбор/отмена выбора места
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

    // Обновление списка выбранных мест
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

    // Форматирование ссылки VK
    function formatVKLink(input) {
        let value = input.value.trim();
        if (!value) return;
        
        value = value.replace(/^https?:\/\//i, '')
                     .replace(/^www\./i, '')
                     .replace(/^@/, '')
                     .replace(/\s+/g, '')
                     .replace(/(\/+)/g, '/');
        
        input.value = value.toLowerCase();
    }

    // Обработка отправки формы
    async function handleFormSubmit(e) {
        e.preventDefault();
        
        // Валидация данных
        const name = bookingForm.elements.name.value.trim();
        const vkLink = vkLinkInput.value.trim();
        const vkRegex = /^(https?:\/\/)?(www\.)?vk\.com\/[a-zA-Z0-9_.\-]+$/i;
        
        if (!validateForm(name, vkLink, vkRegex)) return;
        
        // Подготовка данных
        const formData = prepareFormData(name, vkLink);
        
        try {
            // Отправка данных
            await sendBookingToVK(formData);
            processSuccessfulBooking(formData);
        } catch (error) {
            handleBookingError(error);
        }
    }

    // Валидация формы
    function validateForm(name, vkLink, vkRegex) {
        if (!name) {
            showAlert('Пожалуйста, введите ваше имя!');
            return false;
        }
        
        if (!vkRegex.test(vkLink)) {
            showAlert('Пожалуйста, введите корректную ссылку VK!\nПример: vk.com/username');
            vkLinkInput.focus();
            return false;
        }
        
        if (selectedPlaces.size === 0) {
            showAlert('Пожалуйста, выберите хотя бы одно место!');
            return false;
        }
        
        return true;
    }

    // Подготовка данных формы
    function prepareFormData(name, vkLink) {
        return {
            name,
            link: vkLink,
            date: document.querySelector('input[name="date"]:checked').value,
            places: Array.from(selectedPlaces).map(id => parseInt(id)+1),
            placesIds: Array.from(selectedPlaces),
            timestamp: new Date().toISOString()
        };
    }

    // Обработка успешного бронирования
    function processSuccessfulBooking(formData) {
        selectedPlaces.forEach(placeId => {
            const placeEl = document.querySelector(`.place[data-id="${placeId}"]`);
            if (placeEl) {
                placeEl.classList.remove('selected');
                placeEl.classList.add('booked');
            }
        });

        selectedPlaces.clear();
        updateSelectedPlacesUI();
        bookingForm.reset();
        showAlert(`Успешно забронировано ${formData.places.length} мест!`);
        saveBookingToHistory(formData);
    }

    // Обработка ошибок
    function handleBookingError(error) {
        console.error('Ошибка бронирования:', error);
        showAlert('Ошибка при отправке брони. Пожалуйста, попробуйте ещё раз.');
    }

    // Сохранение в историю
    function saveBookingToHistory(booking) {
        try {
            const history = JSON.parse(localStorage.getItem('bookingHistory') || '[]');
            history.push(booking);
            localStorage.setItem('bookingHistory', JSON.stringify(history));
        } catch (e) {
            console.error('Ошибка сохранения истории:', e);
        }
    }

    // Показ уведомлений
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

    // Масштабирование карты
    function scaleMap() {
        const mapSection = document.querySelector('.map-section');
        if (mapSection) {
            const scale = Math.min(
                mapSection.clientWidth / 1364.7,
                mapSection.clientHeight / 784.4,
                1
            );
            map.style.transform = `scale(${scale})`;
        }
    }

    // Инициализация приложения
    function init() {
        map = document.getElementById('map');
        bookingForm = document.getElementById('bookingForm');
        vkLinkInput = bookingForm.elements.link;

        initMap();
        scaleMap();
        updateSelectedPlacesUI();
        
        bookingForm.addEventListener('submit', handleFormSubmit);
        vkLinkInput.addEventListener('blur', () => formatVKLink(vkLinkInput));
        window.addEventListener('resize', scaleMap);
    }

    // Публичные методы
    return {
        init
    };
})();

// Запуск приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', () => BookingApp.init());

// Вспомогательная функция для форматирования даты
function getDateText(date) {
    const dates = {
        '24.05': '24 мая',
        '25.05': '25 мая', 
        'both': '24 и 25 мая'
    };
    return dates[date] || date;
}