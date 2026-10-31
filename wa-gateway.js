// wa-gateway.js - Kirim WA otomatis saat disposisi baru
// Support: Fonnte, Wablas, Whacenter, atau API WA kamu sendiri

function getWASettings(){
  return JSON.parse(localStorage.getItem('waSettings') || '{"provider":"fonnte","token":"","aktif":false,"nomorBidang":{"Sekretaris":"","Kabid Mutasi & Promosi":"","Kabid Pengadaan, Pemberhentian & Informasi":"","Kabid Penilaian Kinerja Aparatur & Penghargaan":"","Kabid Pengembangan Aparatur":""}}');
}

async function kirimWAOtomatis(disposisi){
  const settings = getWASettings();
  if(!settings.aktif || !settings.token){ console.log('WA Gateway non-aktif / token kosong'); return; }

  const tujuanList = disposisi.tujuan || [disposisi.ditujukanKepada || disposisi.ditujukan] || [];
  const namaKepala = localStorage.getItem('namaKepalaBKPSDM') || 'Sah Alim Latuconsina, S.STP.,M.Si';
  
  const pesan = `🔔 *DISPOSISI BARU - BKPSDM MALUKU TENGAH*\n\n`+
  `Dari: ${disposisi.suratDari || disposisi.pengirimSurat || 'Kepala BKPSDM'}\n`+
  `No Surat: ${disposisi.nomorSurat || disposisi.noSurat || '-'}\n`+
  `Perihal: ${disposisi.perihal || disposisi.perihalSurat || '-'}\n`+
  `Sifat: ${(disposisi.sifat||[]).join(', ') || '-'}\n`+
  `Urgensi: ${(disposisi.urgensi||[]).join(', ') || '-'}\n`+
  `Catatan Kepala: ${disposisi.catatan || disposisi.arahan || '-'}\n\n`+
  `Ditujukan kepada: ${tujuanList.join(', ')}\n\n`+
  `TTD: ${namaKepala}\n`+
  `Silakan buka aplikasi E-Disposisi untuk menindaklanjuti.\n`+
  `Waktu: ${new Date().toLocaleString('id-ID')}`;

  for(const tujuan of tujuanList){
    const nomor = settings.nomorBidang[tujuan];
    if(!nomor){ console.log('Nomor WA untuk '+tujuan+' belum diisi'); continue; }
    
    try{
      let res;
      if(settings.provider==='fonnte'){
        res = await fetch('https://api.fonnte.com/send', {
          method:'POST',
          headers:{'Authorization': settings.token, 'Content-Type':'application/json'},
          body: JSON.stringify({target: nomor, message: pesan, countryCode:'62'})
        });
      } else if(settings.provider==='wablas'){
        res = await fetch('https://wablas.com/api/send-message', {
          method:'POST',
          headers:{'Authorization': settings.token, 'Content-Type':'application/json'},
          body: JSON.stringify({phone: nomor, message: pesan})
        });
      }
      console.log('WA terkirim ke '+tujuan+' ('+nomor+')', await res?.text());
      tampilkanToastWA(tujuan, nomor);
    }catch(e){ console.error('Gagal kirim WA ke '+tujuan, e); }
  }
}

function tampilkanToastWA(tujuan, nomor){
  const container=document.getElementById('toastContainer');
  if(!container) return;
  const id='wa-'+Date.now();
  container.insertAdjacentHTML('beforeend', `
    <div id="${id}" class="toast show bg-success text-white border-0 mb-2" style="min-width:340px">
      <div class="d-flex"><div class="toast-body"><strong><i class="fab fa-whatsapp me-2"></i> WA Terkirim!</strong><br><small>Ke ${tujuan} (${nomor})</small></div><button type="button" class="btn-close btn-close-white me-2 m-auto" onclick="document.getElementById('${id}').remove()"></button></div>
    </div>`);
  setTimeout(()=>{ document.getElementById(id)?.remove(); }, 6000);
}

function testWA(nomor){
  if(!nomor){ alert('Isi nomor dulu! Format: 6281234567890'); return; }
  const settings=getWASettings();
  if(!settings.token){ alert('Isi Token WA di Pengaturan Admin dulu!'); return; }
  kirimWAOtomatis({suratDari:'TEST SISTEM', nomorSurat:'TEST/001', perihal:'Ini adalah tes notifikasi WA Gateway BKPSDM', sifat:['Umum'], urgensi:['Biasa'], catatan:'Ini pesan tes', tujuan:[Object.keys(settings.nomorBidang)[0]], ttd:''});
  alert('Tes WA dikirim ke '+nomor+' - cek log console');
}

window.kirimWAOtomatis = kirimWAOtomatis;
window.testWA = testWA;