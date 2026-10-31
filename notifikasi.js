// notifikasi.js V3 - Popup + Sound + WA Trigger - BKPSDM Maluku Tengah
let lastCount = parseInt(localStorage.getItem('lastDisposisiCount') || '0');
const audioNotif = new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_58d3d8e386.mp3');
audioNotif.volume = 0.6;

function getAllDisposisi(){
  const a = JSON.parse(localStorage.getItem('daftarDisposisiBidang') || '[]');
  const b = JSON.parse(localStorage.getItem('disposisiMasuk') || '[]');
  return [...a,...b];
}

function cekNotifikasiBaru() {
  const total = getAllDisposisi().length;
  const baru = total - lastCount;
  
  const badge = document.getElementById('notifBadge');
  if(badge){
    if(total>0){
      badge.textContent = baru>0 ? baru : total;
      badge.style.display='inline-block';
      badge.className = 'position-absolute top-0 start-100 translate-middle badge rounded-pill '+(baru>0?'bg-danger':'bg-secondary');
      if(baru>0) badge.classList.add('animate__animated','animate__bounce');
    } else badge.style.display='none';
  }

  if(baru>0 && total>lastCount){
    const all = getAllDisposisi();
    const latest = all[all.length-1];
    const tujuan = latest.tujuan ? latest.tujuan.join(', ') : (latest.ditujukanKepada || latest.ditujukan || '-');
    
    tampilkanToast(
      '📩 Disposisi Baru dari Kepala!',
      `<b>Dari:</b> ${latest.suratDari || latest.pengirimSurat || 'Sah Alim Latuconsina'}<br>
       <b>Perihal:</b> ${(latest.perihal || latest.perihalSurat || '').substring(0,60)}<br>
       <b>Tujuan:</b> ${tujuan}<br>
       <b>Catatan:</b> ${(latest.catatan || latest.arahan || '').substring(0,60)}...`,
      latest.ttd || localStorage.getItem('ttdKepala') || ''
    );
    try{ audioNotif.play(); }catch(e){}
    if (navigator.vibrate) navigator.vibrate([200,100,200]);

    // SIMPAN KE NOTIFIKASI
    let notifs = JSON.parse(localStorage.getItem('notifikasiDisposisi')||'[]');
    notifs.unshift({
      id: Date.now(),
      judul: 'Disposisi Baru',
      dari: latest.suratDari || 'Kepala BKPSDM',
      perihal: latest.perihal || latest.perihalSurat || '-',
      tujuan: tujuan,
      waktu: new Date().toLocaleString('id-ID'),
      dibaca:false,
      data: latest
    });
    localStorage.setItem('notifikasiDisposisi', JSON.stringify(notifs.slice(0,30)));

    // TRIGGER WA GATEWAY OTOMATIS
    if(window.kirimWAOtomatis) window.kirimWAOtomatis(latest);
  }

  localStorage.setItem('lastDisposisiCount', total);
  lastCount = total;
}

function tampilkanToast(judul, isi, ttd){
  const container = document.getElementById('toastContainer');
  if(!container) return;
  const id='toast-'+Date.now();
  const namaKepala = localStorage.getItem('namaKepalaBKPSDM') || 'Sah Alim Latuconsina, S.STP.,M.Si';
  container.insertAdjacentHTML('beforeend', `
  <div id="${id}" class="toast show bg-white border-start border-4 border-primary shadow-lg mb-3" style="min-width:380px; border-radius:12px; animation: slideIn .4s ease">
    <div class="d-flex">
      <div class="toast-body p-3">
        <div class="d-flex justify-content-between"><strong class="text-primary"><i class="fas fa-bell me-2"></i> ${judul}</strong><small class="text-muted">${new Date().toLocaleTimeString('id-ID')}</small></div>
        <div class="small mt-2" style="line-height:1.5">${isi}</div>
        <div class="d-flex align-items-center mt-2">
          ${ttd?`<img src="${ttd}" style="height:32px;background:#fff;padding:2px;border:1px solid #eee;border-radius:4px" class="me-2">`:''}
          <small><b>${namaKepala}</b><br><span class="text-muted" style="font-size:10px">${localStorage.getItem('nipKepalaBKPSDM')||'NIP. 198005151999121001'}</span></small>
        </div>
        <div class="mt-3">
          <button class="btn btn-primary btn-sm" onclick="location.href='disposisi-bidang.html'"><i class="fas fa-eye me-1"></i> Buka</button>
          <button class="btn btn-outline-secondary btn-sm" onclick="document.getElementById('${id}').remove()">Nanti</button>
        </div>
      </div>
      <button type="button" class="btn-close me-2 mt-2" onclick="document.getElementById('${id}').remove()"></button>
    </div>
  </div>`);
  setTimeout(()=>{ const el=document.getElementById(id); if(el) el.remove(); }, 10000);
}

function renderDropdownNotif(){
  const list=JSON.parse(localStorage.getItem('notifikasiDisposisi')||'[]');
  const drop=document.getElementById('notifDropdown');
  if(!drop) return;
  if(list.length===0){ drop.innerHTML='<li class="p-3 text-center text-muted small">🔔 Belum ada notifikasi<br><small>Notifikasi akan muncul saat Kepala kirim disposisi</small></li>'; return; }
  drop.innerHTML = list.map(n=>`
    <li><a class="dropdown-item py-2 ${!n.dibaca?'bg-light fw-bold':''}" href="disposisi-bidang.html" onclick="tandaiNotifDibaca(${n.id})" style="white-space:normal">
      <div class="d-flex"><div class="me-2"><i class="fas fa-envelope-open-text text-primary"></i></div><div><div class="small">${n.perihal.substring(0,45)}...</div><small class="text-muted">Dari: ${n.dari} • ${n.waktu}</small><br><span class="badge bg-info bg-opacity-10 text-info" style="font-size:10px">${n.tujuan}</span></div></div>
    </a></li>`).join('') + `<li><hr class="dropdown-divider"></li><li class="d-flex justify-content-between px-3 py-1"><a href="#" onclick="hapusNotifikasi()" class="small text-danger">Hapus Semua</a><a href="#" onclick="tandaiSemuaDibaca()" class="small text-primary">Tandai Dibaca</a></li>`;
}

function tandaiNotifDibaca(id){ let l=JSON.parse(localStorage.getItem('notifikasiDisposisi')||'[]'); l=l.map(n=> n.id===id?{...n,dibaca:true}:n); localStorage.setItem('notifikasiDisposisi', JSON.stringify(l)); }
function tandaiSemuaDibaca(){ let l=JSON.parse(localStorage.getItem('notifikasiDisposisi')||'[]'); l=l.map(n=> ({...n,dibaca:true})); localStorage.setItem('notifikasiDisposisi', JSON.stringify(l)); renderDropdownNotif(); }
function hapusNotifikasi(){ if(!confirm('Hapus semua notifikasi?')) return; localStorage.removeItem('notifikasiDisposisi'); renderDropdownNotif(); const b=document.getElementById('notifBadge'); if(b) b.style.display='none'; }

document.addEventListener('DOMContentLoaded', ()=>{
  cekNotifikasiBaru(); renderDropdownNotif();
  setInterval(cekNotifikasiBaru, 3000);
  setInterval(renderDropdownNotif, 5000);
});