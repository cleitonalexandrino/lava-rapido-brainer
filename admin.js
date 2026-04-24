import { db } from './firebase-config.js';
import { collection, getDocs, query, orderBy, doc, deleteDoc } from 'firebase/firestore';

const tbody = document.getElementById('admin-tbody');
const kpiCarsToday = document.getElementById('kpi-cars-today');
const kpiRevToday = document.getElementById('kpi-rev-today');
const kpiCarsComp = document.getElementById('kpi-cars-comp');
const kpiRevComp = document.getElementById('kpi-rev-comp');
const kpiAvg = document.getElementById('kpi-avg');

const loadDashboard = async () => {
    let bookings = [];
    try {
        const q = query(collection(db, "bookings"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            let data = doc.data();
            // Provide a fallback ID for sorting if timestamp is not sufficient
            bookings.push({ id: doc.id, ...data });
        });
    } catch (error) {
        console.error("Erro ao buscar agendamentos do banco:", error);
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
    
    bookings.slice(0, 10).forEach(b => {
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
            <td><button class="btn-delete" data-id="${b.id}">Cancelar</button></td>
        `;
        tbody.appendChild(row);
    });

    // Eventos dos botões de exclusão
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.target.getAttribute('data-id');
            if (confirm("Tem certeza que deseja cancelar p agendamento? O horário ficará vago novamente para novos clientes.")) {
                try {
                    e.target.textContent = "Apagando...";
                    await deleteDoc(doc(db, "bookings", id));
                    loadDashboard(); // Recarrega os dados do banco imediatamente
                } catch (error) {
                    console.error("Erro ao deletar:", error);
                    alert("Erro ao excluir. Tente novamente.");
                    e.target.textContent = "Cancelar";
                }
            }
        });
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
