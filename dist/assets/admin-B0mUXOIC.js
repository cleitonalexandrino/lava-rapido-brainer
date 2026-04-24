import{q as v,c as C,d as p,o as b,g as f,b as w,e as D}from"./firebase-config-Bz55sDI6.js";const u=document.getElementById("admin-tbody"),E=document.getElementById("kpi-cars-today"),T=document.getElementById("kpi-rev-today"),$=document.getElementById("kpi-cars-comp"),x=document.getElementById("kpi-rev-comp"),B=document.getElementById("kpi-avg"),g=async()=>{let o=[];try{const t=v(C(p,"bookings"),b("timestamp","desc"));(await f(t)).forEach(r=>{let m=r.data();o.push({id:r.id,...m})})}catch(t){console.error("Erro ao buscar agendamentos do banco:",t)}const n=new Date;n.setHours(0,0,0,0);const s=new Date(n);s.setDate(n.getDate()-7);const i=o.filter(t=>{const e=new Date(t.date);return e.setHours(0,0,0,0),e.getTime()===n.getTime()}),d=o.filter(t=>{const e=new Date(t.date);return e.setHours(0,0,0,0),e.getTime()===s.getTime()}),a=i.length,c=i.reduce((t,e)=>t+e.value,0),l=d.length,k=d.reduce((t,e)=>t+e.value,0);E.textContent=a,T.textContent=`R$ ${c.toFixed(2)}`,y($,a,l),y(x,c,k);const h=a>0?c/a:0;B.textContent=`R$ ${h.toFixed(2)}`,u.innerHTML="",o.slice(0,10).forEach(t=>{const e=document.createElement("tr"),r=new Date(t.date).toLocaleDateString("pt-BR");e.innerHTML=`
            <td>${t.owner}</td>
            <td>${t.model}</td>
            <td>${t.color}</td>
            <td>${t.package}</td>
            <td>${t.time}</td>
            <td>${r}</td>
            <td><span class="status-badge">Confirmado</span></td>
            <td><button class="btn-delete" data-id="${t.id}">Cancelar</button></td>
        `,u.appendChild(e)}),document.querySelectorAll(".btn-delete").forEach(t=>{t.addEventListener("click",async e=>{const r=e.target.getAttribute("data-id");if(confirm("Tem certeza que deseja cancelar p agendamento? O horário ficará vago novamente para novos clientes."))try{e.target.textContent="Apagando...",await w(D(p,"bookings",r)),g()}catch(m){console.error("Erro ao deletar:",m),alert("Erro ao excluir. Tente novamente."),e.target.textContent="Cancelar"}})})},y=(o,n,s,i)=>{if(s===0){o.innerHTML='<span class="growth-up">+100% vs sem. ant.</span>';return}const d=(n-s)/s*100,a=d>=0,c=a?"&uarr;":"&darr;",l=a?"growth-up":"growth-down";o.innerHTML=`
        <span class="${l}">${c} ${Math.abs(d).toFixed(0)}%</span>
        <span style="color:#86868b; margin-left:4px;">vs semana anterior</span>
    `};g();setInterval(g,6e4);
