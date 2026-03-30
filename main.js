import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const canvas = document.getElementById('hero-canvas');
const context = canvas.getContext('2d');

// Configure Canvas
canvas.width = 1920;
canvas.height = 1080;

const frameCount = 241;
const currentFrame = (index) => (
  `./ezgif-244810dde00f094f-jpg/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.jpg`
);

const images = [];
const airpods = {
  frame: 0
};

// Preload Images with Progress
const preloadImages = () => {
  let loadedCount = 0;
  const loaderBar = document.getElementById('loader-bar');
  const loaderText = document.getElementById('loader-text');
  const loader = document.getElementById('loader');

  const checkComplete = () => {
    loadedCount++;
    const progress = Math.floor((loadedCount / frameCount) * 100);
    if (loaderBar) loaderBar.style.width = `${progress}%`;
    if (loaderText) loaderText.textContent = `Loading Experience ${progress}%`;

    if (loadedCount === frameCount) {
      // All loaded
      gsap.to(loader, {
        autoAlpha: 0,
        duration: 1,
        ease: "power2.inOut",
        onComplete: () => {
          loader.style.display = 'none';
          render();
        }
      });
    }
  };

  for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    img.onload = checkComplete;
    img.onerror = checkComplete;
    img.src = currentFrame(i);
    images.push(img);
  }
};

const render = () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  const img = images[airpods.frame];
  if (img) {
    const hRatio = canvas.width / img.width;
    const vRatio = canvas.height / img.height;
    const ratio = Math.max(hRatio, vRatio);
    const centerShift_x = (canvas.width - img.width * ratio) / 2;
    const centerShift_y = (canvas.height - img.height * ratio) / 2;
    context.drawImage(img, 0, 0, img.width, img.height,
      centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
  }
};

// Initialize
preloadImages();

// MASTER TIMELINE
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: "#storytelling-container",
    start: "top top",
    end: "bottom bottom",
    scrub: 1.5, // Even smoother
  }
});

// Animate frame sequence
tl.to(airpods, {
  frame: frameCount - 1,
  snap: "frame",
  ease: "none",
  onUpdate: render,
}, 0);

// COORDINATE TEXT SECTIONS
const sections = [
    { id: '#step-hero', start: 0, end: 0.12 },
    { id: '#step-process', start: 0.18, end: 0.38 },
    { id: '#step-performance', start: 0.45, end: 0.65 },
    { id: '#step-interior', start: 0.72, end: 0.88 },
    { id: '#step-final', start: 0.92, end: 1.0 }
];

sections.forEach((section) => {
    const el = document.querySelector(`${section.id} > div`);
    
    // Fade In
    tl.fromTo(el, 
        { autoAlpha: 0, y: 40, visibility: 'hidden' },
        { 
            autoAlpha: 1, 
            y: 0, 
            visibility: 'visible',
            duration: 0.08, 
            ease: "power2.out"
        }, 
        section.start
    );

    // Fade Out
    if (section.id !== '#step-final') {
        tl.to(el, {
            autoAlpha: 0,
            y: -40,
            duration: 0.08,
            ease: "power2.in",
            immediateRender: false
        }, section.end);
    }
});

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

const renderTimeSlots = () => {
    timeSlotsContainer.innerHTML = "";
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
            // If it starts after 16:15 or ends after 17:00, it's out.
            // 11th slot is 16:20 - 17:05, so we should stop at the 10th slot (15:30 - 16:15)
            return (startHour < 16) || (startHour === 16 && startMin < 20);
        });
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

confirmBtn.addEventListener('click', () => {
    const owner = document.getElementById('owner-name').value;
    const model = document.getElementById('car-model').value;
    const color = document.getElementById('car-color').value;
    const packageName = document.querySelector('.booking-header h2').textContent.replace('Agendar ', '');

    if (!owner || !model || !color) {
        alert('Por favor, preencha todos os dados do veículo.');
        return;
    }

    const booking = {
        id: Date.now(),
        date: selectedDate.toISOString(),
        time: selectedTime,
        package: packageName,
        owner,
        model,
        color,
        value: packageName.includes('Completa') ? 34.99 : 14.99,
        timestamp: new Date().toISOString()
    };

    // Save to localStorage
    const saved = JSON.parse(localStorage.getItem('brainers_bookings') || '[]');
    saved.push(booking);
    localStorage.setItem('brainers_bookings', JSON.stringify(saved));

    alert(`Sucesso! Transformação Agendada para ${owner}.\n${model} (${color})\nData: ${selectedDateText.textContent}\nHorário: ${selectedTime}`);
    
    // Clear fields
    document.getElementById('owner-name').value = '';
    document.getElementById('car-model').value = '';
    document.getElementById('car-color').value = '';
    
    closeModal();
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

// Handle window resize
window.addEventListener('resize', render);


