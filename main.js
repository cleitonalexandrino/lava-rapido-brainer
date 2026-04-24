import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

gsap.registerPlugin(ScrollTrigger);



console.log('Lava Rapido Brainer JS Initializing...');

// Animações removidas - Substituídas por Hero Estático com Ferrari


// NAVBAR SCRUB
ScrollTrigger.create({
    start: 'top -50',
    onUpdate: (self) => {
        const navbar = document.getElementById('navbar');
        if (self.direction === 1) {
            navbar.classList.add('scrolled');
        } else if (self.scroll() < 50) {
            navbar.classList.remove('scrolled');
        }
    }
});

// BOOKING MODAL LOGIC
const modal = document.getElementById('booking-modal');
const closeBtn = document.querySelector('.modal-close');
const backdrop = document.querySelector('.modal-backdrop');
const openBtns = document.querySelectorAll('.cta-button, .cta-outline, .nav-cta .cta-button'); // Expanded selector

const calendarDays = document.getElementById('calendar-days');
const currentMonthYearText = document.getElementById('current-month-year');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const timeSlotsContainer = document.getElementById('time-slots');
const confirmBtn = document.getElementById('confirm-booking');
const selectedDateText = document.getElementById('selected-date-text');
const selectedTimeText = document.getElementById('selected-time-text');

let currentDate = new Date();
let selectedDate = null;
let selectedTime = null;

const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const openModal = () => {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderCalendar();
};

const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
};

// Target specifically booking buttons
openBtns.forEach(btn => {
    if (btn.textContent.toLowerCase().includes('agendar') || btn.innerText.toLowerCase().includes('agendar')) {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });
    }
});

closeBtn.addEventListener('click', closeModal);
backdrop.addEventListener('click', closeModal);

const renderCalendar = () => {
    calendarDays.innerHTML = "";
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    currentMonthYearText.textContent = `${months[month]} ${year}`;
    
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0,0,0,0);

    // Empty slots for previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
        const div = document.createElement('div');
        calendarDays.appendChild(div);
    }

    // Actual days
    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i);
        const dayEl = document.createElement('div');
        dayEl.classList.add('calendar-day');
        dayEl.textContent = i;

        if (date < today || date.getDay() === 0) {
            dayEl.classList.add('disabled');
        } else {
            if (date.getTime() === today.getTime()) dayEl.classList.add('today');
            if (selectedDate && date.getTime() === selectedDate.getTime()) dayEl.classList.add('active');
            
            dayEl.addEventListener('click', () => {
                selectedDate = date;
                selectedTime = null; // Reset time when date changes
                renderCalendar();
                renderTimeSlots();
                updateSummary();
            });
        }
        calendarDays.appendChild(dayEl);
    }
};

const renderTimeSlots = async () => {
    timeSlotsContainer.innerHTML = "<div style='grid-column: 1/-1; text-align:center; color: #86868b; font-size:12px;'>Carregando horários vagos...</div>";
    if (!selectedDate) return;

    let slots = [
        "08:00 - 08:45", "08:50 - 09:35", "09:40 - 10:25", 
        "10:30 - 11:15", "11:20 - 12:05", "12:10 - 12:55",
        "13:00 - 13:45", "13:50 - 14:35", "14:40 - 15:25",
        "15:30 - 16:15", "16:20 - 17:05", "17:10 - 17:55",
        "18:00 - 18:45"
    ];

    // Saturday logic: closes at 17h
    if (selectedDate.getDay() === 6) {
        slots = slots.filter(time => {
            const startHour = parseInt(time.split(':')[0]);
            const startMin = parseInt(time.split(':')[1].split(' ')[0]);
            return (startHour < 16) || (startHour === 16 && startMin < 20);
        });
    }

    // Buscando agendamentos existentes para esse dia
    let bookedTimes = [];
    try {
        const q = query(collection(db, "bookings"), where("date", "==", selectedDate.toISOString()));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(doc => {
            if (doc.data().time) {
                bookedTimes.push(doc.data().time);
            }
        });
    } catch (error) {
        console.error("Erro ao buscar horários vagos:", error);
    }
    
    // Tira as horas que já estão marcadas no banco
    slots = slots.filter(time => !bookedTimes.includes(time));

    timeSlotsContainer.innerHTML = "";
    
    if (slots.length === 0) {
        timeSlotsContainer.innerHTML = "<div style='grid-column: 1/-1; text-align:center; color: #ff3b30; font-size:14px; margin-top:20px;'>Agenda lotada para este dia!</div>";
        return;
    }

    slots.forEach(time => {
        const slotEl = document.createElement('div');
        slotEl.classList.add('time-slot');
        slotEl.style.width = '100%'; // Full width for better readability of the range
        slotEl.textContent = time;
        
        if (selectedTime === time) slotEl.classList.add('active');

        slotEl.onclick = () => {
            selectedTime = time;
            document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('active'));
            slotEl.classList.add('active');
            updateSummary();
        };
        timeSlotsContainer.appendChild(slotEl);
    });
};

const updateSummary = () => {
    if (selectedDate) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        selectedDateText.textContent = selectedDate.toLocaleDateString('pt-BR', options);
    }
    if (selectedTime) {
        selectedTimeText.textContent = `Horário selecionado: ${selectedTime}`;
        confirmBtn.disabled = false;
    } else {
        confirmBtn.disabled = true;
    }
};

prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

confirmBtn.addEventListener('click', async () => {
    const owner = document.getElementById('owner-name').value;
    const model = document.getElementById('car-model').value;
    const color = document.getElementById('car-color').value;
    const packageName = document.querySelector('.booking-header h2').textContent.replace('Agendar ', '');

    if (!owner || !model || !color) {
        alert('Por favor, preencha todos os dados do veículo.');
        return;
    }

    const booking = {
        date: selectedDate.toISOString(),
        time: selectedTime,
        package: packageName,
        owner,
        model,
        color,
        value: packageName.includes('Completa') ? 34.99 : 14.99,
        timestamp: new Date().toISOString()
    };

    try {
        const originalText = confirmBtn.textContent;
        confirmBtn.textContent = 'Aguarde...';
        confirmBtn.disabled = true;

        // Save to Firebase
        await addDoc(collection(db, "bookings"), booking);
        
        confirmBtn.textContent = originalText;

        alert(`Sucesso! Transformação Agendada para ${owner}.\n${model} (${color})\nData: ${selectedDateText.textContent}\nHorário: ${selectedTime}`);
        
        // Clear fields
        document.getElementById('owner-name').value = '';
        document.getElementById('car-model').value = '';
        document.getElementById('car-color').value = '';
        
        closeModal();
    } catch (error) {
        console.error("Erro ao salvar agendamento:", error);
        alert("Ocorreu um erro ao salvar seu agendamento. Tente novamente.");
        confirmBtn.textContent = 'Confirmar Agendamento';
        confirmBtn.disabled = false;
    }
});

// PACKAGES MODAL LOGIC
const packagesModal = document.getElementById('packages-modal');
const packagesCloseBtn = packagesModal.querySelector('.modal-close');
const packagesBackdrop = packagesModal.querySelector('.modal-backdrop');
const viewPackagesBtn = document.getElementById('view-packages-btn');

const openPackagesModal = (e) => {
    if (e) e.preventDefault();
    packagesModal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

const closePackagesModal = () => {
    packagesModal.classList.remove('active');
    document.body.style.overflow = '';
};

if (viewPackagesBtn) {
    viewPackagesBtn.addEventListener('click', openPackagesModal);
}

packagesCloseBtn.addEventListener('click', closePackagesModal);
packagesBackdrop.addEventListener('click', closePackagesModal);

// Select package and go to booking
document.querySelectorAll('.select-package').forEach(btn => {
    btn.addEventListener('click', () => {
        const packageName = btn.getAttribute('data-package');
        closePackagesModal();
        
        // Slightly delay opening booking to allow for smooth transition
        setTimeout(() => {
            openModal();
            // Update heading with package name
            document.querySelector('.booking-header h2').textContent = `Agendar ${packageName}`;
        }, 300);
    });
});


