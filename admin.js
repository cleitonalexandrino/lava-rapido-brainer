// admin.js
const tbody = document.getElementById('admin-tbody');
const kpiCarsToday = document.getElementById('kpi-cars-today');
const kpiRevToday = document.getElementById('kpi-rev-today');
const kpiCarsComp = document.getElementById('kpi-cars-comp');
const kpiRevComp = document.getElementById('kpi-rev-comp');
const kpiAvg = document.getElementById('kpi-avg');

const loadDashboard = () => {
    let bookings = JSON.parse(localStorage.getItem('brainers_bookings') || '[]');
    
    // Seed mock data if empty for demo purposes
    if (bookings.length === 0) {
        const today = new Date();
        const lastWeek = new Date();
        lastWeek.setDate(today.getDate() - 7);

        const mockData = [
            { id: 101, owner: 'Carlos Alberto', model: 'Porsche 911', color: 'Cinza Giz', package: 'Lavagem Completa', date: today.toISOString(), time: '10:00', value: 34.99, timestamp: today.toISOString() },
            { id: 102, owner: 'Marina Silva', model: 'Audi Q5', color: 'Branco', package: 'Lavagem Simples', date: today.toISOString(), time: '14:00', value: 14.99, timestamp: today.toISOString() },
            { id: 103, owner: 'João Pedro', model: 'Mustang GT', color: 'Azul', package: 'Lavagem Completa', date: lastWeek.toISOString(), time: '09:00', value: 34.99, timestamp: lastWeek.toISOString() }
        ];
        bookings = mockData;
        localStorage.setItem('brainers_bookings', JSON.stringify(mockData));
    }

    const today = new Date();
    today.setHours(0,0,0,0);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    // Filter Today
    const todayBookings = bookings.filter(b => {
        const bDate = new Date(b.date);
        bDate.setHours(0,0,0,0);
        return bDate.getTime() === today.getTime();
    });

    // Filter Last Week (Same Day)
    const lastWeekBookings = bookings.filter(b => {
        const bDate = new Date(b.date);
        bDate.setHours(0,0,0,0);
        return bDate.getTime() === sevenDaysAgo.getTime();
    });

    // Calculate Today Stats
    const totalCarsToday = todayBookings.length;
    const totalRevToday = todayBookings.reduce((acc, curr) => acc + curr.value, 0);

    // Calculate Last Week Stats
    const totalCarsLastWeek = lastWeekBookings.length;
    const totalRevLastWeek = lastWeekBookings.reduce((acc, curr) => acc + curr.value, 0);

    // Update UI
    kpiCarsToday.textContent = totalCarsToday;
    kpiRevToday.textContent = `R$ ${totalRevToday.toFixed(2)}`;

    // Comparison Logic
    updateComparison(kpiCarsComp, totalCarsToday, totalCarsLastWeek, 'lavagens');
    updateComparison(kpiRevComp, totalRevToday, totalRevLastWeek, 'financeiro');

    // Average Ticket
    const avg = totalCarsToday > 0 ? (totalRevToday / totalCarsToday) : 0;
    kpiAvg.textContent = `R$ ${avg.toFixed(2)}`;

    // Populate Table (Most Recent First)
    tbody.innerHTML = '';
    const sorted = [...bookings].sort((a,b) => b.id - a.id);
    
    sorted.slice(0, 10).forEach(b => {
        const row = document.createElement('tr');
        const formattedDate = new Date(b.date).toLocaleDateString('pt-BR');
        
        row.innerHTML = `
            <td>${b.owner}</td>
            <td>${b.model}</td>
            <td>${b.color}</td>
            <td>${b.package}</td>
            <td>${b.time}</td>
            <td>${formattedDate}</td>
            <td><span class="status-badge">Confirmado</span></td>
        `;
        tbody.appendChild(row);
    });
};

const updateComparison = (el, current, previous, label) => {
    if (previous === 0) {
        el.innerHTML = `<span class="growth-up">+100% vs sem. ant.</span>`;
        return;
    }

    const diff = ((current - previous) / previous) * 100;
    const isGrowth = diff >= 0;
    const arrow = isGrowth ? '&uarr;' : '&darr;';
    const colorClass = isGrowth ? 'growth-up' : 'growth-down';

    el.innerHTML = `
        <span class="${colorClass}">${arrow} ${Math.abs(diff).toFixed(0)}%</span>
        <span style="color:#86868b; margin-left:4px;">vs semana anterior</span>
    `;
};

// Auto-run on load
loadDashboard();

// Refresh every minute
setInterval(loadDashboard, 60000);
