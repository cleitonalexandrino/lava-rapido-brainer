import"./style-DoM88kg_.js";const m=document.getElementById("admin-tbody"),v=document.getElementById("kpi-cars-today"),y=document.getElementById("kpi-rev-today"),S=document.getElementById("kpi-cars-comp"),w=document.getElementById("kpi-rev-comp"),D=document.getElementById("kpi-avg"),p=()=>{let o=JSON.parse(localStorage.getItem("brainers_bookings")||"[]");if(o.length===0){const t=new Date,e=new Date;e.setDate(t.getDate()-7);const i=[{id:101,owner:"Carlos Alberto",model:"Porsche 911",color:"Cinza Giz",package:"Lavagem Completa",date:t.toISOString(),time:"10:00",value:34.99,timestamp:t.toISOString()},{id:102,owner:"Marina Silva",model:"Audi Q5",color:"Branco",package:"Lavagem Simples",date:t.toISOString(),time:"14:00",value:14.99,timestamp:t.toISOString()},{id:103,owner:"João Pedro",model:"Mustang GT",color:"Azul",package:"Lavagem Completa",date:e.toISOString(),time:"09:00",value:34.99,timestamp:e.toISOString()}];o=i,localStorage.setItem("brainers_bookings",JSON.stringify(i))}const n=new Date;n.setHours(0,0,0,0);const s=new Date(n);s.setDate(n.getDate()-7);const c=o.filter(t=>{const e=new Date(t.date);return e.setHours(0,0,0,0),e.getTime()===n.getTime()}),r=o.filter(t=>{const e=new Date(t.date);return e.setHours(0,0,0,0),e.getTime()===s.getTime()}),a=c.length,d=c.reduce((t,e)=>t+e.value,0),l=r.length,u=r.reduce((t,e)=>t+e.value,0);v.textContent=a,y.textContent=`R$ ${d.toFixed(2)}`,g(S,a,l),g(w,d,u);const k=a>0?d/a:0;D.textContent=`R$ ${k.toFixed(2)}`,m.innerHTML="",[...o].sort((t,e)=>e.id-t.id).slice(0,10).forEach(t=>{const e=document.createElement("tr"),i=new Date(t.date).toLocaleDateString("pt-BR");e.innerHTML=`
            <td>${t.owner}</td>
            <td>${t.model}</td>
            <td>${t.color}</td>
            <td>${t.package}</td>
            <td>${t.time}</td>
            <td>${i}</td>
            <td><span class="status-badge">Confirmado</span></td>
        `,m.appendChild(e)})},g=(o,n,s,c)=>{if(s===0){o.innerHTML='<span class="growth-up">+100% vs sem. ant.</span>';return}const r=(n-s)/s*100,a=r>=0,d=a?"&uarr;":"&darr;",l=a?"growth-up":"growth-down";o.innerHTML=`
        <span class="${l}">${d} ${Math.abs(r).toFixed(0)}%</span>
        <span style="color:#86868b; margin-left:4px;">vs semana anterior</span>
    `};p();setInterval(p,6e4);
