import { db } from './firebase-config.js';
import { collection, getDocs, query, orderBy, doc, deleteDoc } from 'firebase/firestore';

const tbody = document.getElementById('admin-tbody');
const kpiCarsToday = document.getElementById('kpi-cars-today');
const kpiRevToday = document.getElementById('kpi-rev-today');
const kpiCarsComp = document.getElementById('kpi-cars-comp');
const kpiRevComp = document.getElementById('kpi-rev-comp');
const kpiGrowth = document.getElementById('kpi-growth');
const kpiAvg = document.getElementById('kpi-avg');

// Returns value from booking: checks stored value or derives from package name
const getBookingValue = (b) => {
    if (b.value && b.value > 0) return b.value;
    if (b.package && b.package.toLowerCase().includes('completa')) return 34.99;
    return 14.99;
};

const isSameDay = (d1, d2) => {
    const a = new Date(d1); a.setHours(0,0,0,0);
    const b = new Date(d2); b.setHours(0,0,0,0);
    return a.getTime() === b.getTime();
};

const isSameMonth = (d1, d2) => {
    const a = new Date(d1);
    const b = new Date(d2);
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
};

const loadDashboard = async () => {
    let bookings = [];
    try {
        // Order by appointment date ascending so upcoming show first
        const q = query(collection(db, "bookings"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((document) => {
            bookings.push({ id: document.id, ...document.data() });
        });
    } catch (error) {
        console.error("Erro ao buscar agendamentos do banco:", error);
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:#ff3b30; padding:32px;">Erro ao carregar dados. Verifique a conexão.</td></tr>`;
        return;
    }

    const now = new Date();

    // --- Today's appointments (by appointment date) ---
    const todayBookings = bookings.filter(b => isSameDay(b.date, now));

    // --- This month's appointments (by appointment date) ---
    const thisMonthBookings = bookings.filter(b => isSameMonth(b.date, now));

    // --- Last month's appointments (by appointment date) ---
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthBookings = bookings.filter(b => isSameMonth(b.date, lastMonth));

    // --- Upcoming (today + future, ordered by date) ---
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const upcomingBookings = bookings
        .filter(b => new Date(b.date) >= todayStart)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    // --- KPI Values ---
    const carsToday = todayBookings.length;
    const revToday = todayBookings.reduce((acc, b) => acc + getBookingValue(b), 0);

    const carsThisMonth = thisMonthBookings.length;
    const carsLastMonth = lastMonthBookings.length;

    const allValues = thisMonthBookings.map(getBookingValue);
    const avgTicket = allValues.length > 0 ? allValues.reduce((a, b) => a + b, 0) / allValues.length : 0;

    // Growth % month over month
    const growth = carsLastMonth > 0
        ? Math.round(((carsThisMonth - carsLastMonth) / carsLastMonth) * 100)
        : (carsThisMonth > 0 ? 100 : 0);

    // --- Update KPI cards ---
    kpiCarsToday.textContent = carsToday;

    // Show upcoming count below if today = 0
    if (carsToday === 0 && upcomingBookings.length > 0) {
        kpiCarsComp.innerHTML = `<span style="color:#86868b;">${upcomingBookings.length} próximo(s) agendado(s)</span>`;
    } else {
        kpiCarsComp.innerHTML = `<span style="color:#86868b;">${carsThisMonth} este mês</span>`;
    }

    kpiRevToday.textContent = `R$ ${revToday.toFixed(2).replace('.', ',')}`;

    const revMonth = thisMonthBookings.reduce((acc, b) => acc + getBookingValue(b), 0);
    kpiRevComp.innerHTML = `<span style="color:#86868b;">R$ ${revMonth.toFixed(2).replace('.', ',')} este mês</span>`;

    if (kpiGrowth) {
        const sign = growth >= 0 ? '+' : '';
        kpiGrowth.textContent = `${sign}${growth}%`;
    }

    kpiAvg.textContent = `R$ ${avgTicket.toFixed(2).replace('.', ',')}`;

    // --- Populate Table: show upcoming first, then recent past (max 20 rows) ---
    const pastBookings = bookings
        .filter(b => new Date(b.date) < todayStart)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    const tableRows = [...upcomingBookings, ...pastBookings].slice(0, 20);

    tbody.innerHTML = '';

    if (tableRows.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:#86868b; padding:32px;">Nenhum agendamento encontrado.</td></tr>`;
        return;
    }

    tableRows.forEach(b => {
        const appointmentDate = new Date(b.date);
        const formattedDate = appointmentDate.toLocaleDateString('pt-BR');
        const isToday = isSameDay(appointmentDate, now);
        const isPast = appointmentDate < todayStart;
        const value = getBookingValue(b);

        const statusBadge = isPast
            ? `<span class="status-badge" style="background:rgba(255,255,255,0.06); color:#86868b;">Concluído</span>`
            : isToday
                ? `<span class="status-badge" style="background:rgba(255,165,0,0.15); color:#ff9f0a;">Hoje</span>`
                : `<span class="status-badge">Confirmado</span>`;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${b.owner || '—'}</td>
            <td>${b.model || '—'}</td>
            <td>${b.color || '—'}</td>
            <td>${b.package || '—'}</td>
            <td>${b.time || '—'}</td>
            <td style="${isToday ? 'color: #ff9f0a; font-weight:600;' : ''}">${formattedDate}</td>
            <td>R$ ${value.toFixed(2).replace('.', ',')}</td>
            <td>${statusBadge}</td>
            <td><button class="btn-delete" data-id="${b.id}">Cancelar</button></td>
        `;
        tbody.appendChild(row);
    });

    // Delete / cancel handlers
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.target.getAttribute('data-id');
            if (confirm("Cancelar este agendamento? O horário ficará disponível novamente.")) {
                try {
                    e.target.textContent = "Cancelando...";
                    await deleteDoc(doc(db, "bookings", id));
                    loadDashboard();
                } catch (error) {
                    console.error("Erro ao cancelar:", error);
                    alert("Erro ao cancelar. Tente novamente.");
                    e.target.textContent = "Cancelar";
                }
            }
        });
    });
};

loadDashboard();
setInterval(loadDashboard, 30000); // Refresh every 30 seconds
