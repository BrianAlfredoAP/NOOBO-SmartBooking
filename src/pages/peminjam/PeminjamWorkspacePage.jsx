import { useState } from 'react'
import { ArrowLeft, Bell, CalendarDays, CheckCheck, ClipboardList, Search, Download, Printer, PackageCheck } from 'lucide-react'
import { Link, useLocation, useNavigate, useOutletContext, useParams } from 'react-router'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { demoRecords } from '../../data/peminjam-workspace-demo.js'
import { formatTimeRange } from '../../utils/time-format.js'

const titleMap = { pengajuan:'Peminjaman Saya', riwayat:'Riwayat Peminjaman', profil:'Profil Peminjam', notifikasi:'Notifikasi' }

function Back({ to='/peminjam/pengajuan', children='Kembali' }) { return <Link className="workflow-back-link" to={to}><ArrowLeft size={17} aria-hidden="true"/>{children}</Link> }
function InfoList({ rows }) { return <dl className="confirmation-details">{rows.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value || 'Belum tersedia pada data demonstrasi'}</dd></div>)}</dl> }

function TransactionFilters({ status, setStatus, start, setStart, end, setEnd, onApply, onReset }) {
  return <section className="transaction-filters" aria-label="Filter transaksi">
    <label className="filter-field"><span>Filter status</span><select value={status} onChange={event=>setStatus(event.target.value)}>{['Semua','Menunggu Pembina','Menunggu Logistik','Disetujui','Ditolak','Selesai'].map(value=><option key={value}>{value}</option>)}</select></label>
    <fieldset className="filter-range"><legend>Rentang tanggal</legend><label className="filter-field"><span>Tanggal mulai</span><span className="filter-date"><CalendarDays size={16}/><input aria-label="Tanggal mulai filter" type="date" value={start} onChange={event=>setStart(event.target.value)}/></span></label><label className="filter-field"><span>Tanggal selesai</span><span className="filter-date"><CalendarDays size={16}/><input aria-label="Tanggal selesai filter" type="date" value={end} onChange={event=>setEnd(event.target.value)}/></span></label></fieldset>
    <div className="filter-actions"><Button onClick={onApply}>Terapkan</Button><Button onClick={onReset} variant="secondary">Reset Filter</Button></div>
  </section>
}

function SbpgForm({ record, report, setReturnReports }) {
  const [now]=useState(()=>Date.now())
  const [items,setItems]=useState(()=>record.logistics.map(item=>({...item,returnedQuantity:'',condition:''})))
  const [notes,setNotes]=useState(''), [confirmOpen,setConfirmOpen]=useState(false), [sent,setSent]=useState(false)
  const deadline=Date.parse(`${record.event.date}T${record.event.endTime}:00+07:00`)+60*60*1000
  const late=now>deadline
  const complete=items.length>0&&items.every(item=>item.returnedQuantity!==''&&Number(item.returnedQuantity)>=0&&Number(item.returnedQuantity)<=Number(item.quantity)&&item.condition&&((item.condition==='Baik')||notes.trim()))
  const submit=()=>{const lateAtSubmit=Date.now()>deadline;setReturnReports(current=>({...current,[record.id]:{items,notes,submittedAt:new Date().toISOString(),late:lateAtSubmit}}));setSent(true);setConfirmOpen(false)}
  if(record.returned||report||sent)return <Card><Badge tone="info">{report?.logisticsInspection?.status==='Selesai'||record.returned?'Selesai · simulasi':sent||report?'Menunggu Pemeriksaan Logistik':'SBPG simulasi tercatat'}</Badge><p>{report?.logisticsInspection?.status==='Selesai'?'Laporan dan hasil pemeriksaan Logistik tercatat pada simulasi.':record.returned?'Data contoh menunjukkan SBPG telah dikirim.':'Laporan pengembalian tercatat pada simulasi.'}</p>{report&&<InfoList rows={[["Status barang",report.items.every(item=>Number(item.returnedQuantity)===Number(item.quantity)&&item.condition==='Baik')?'Lengkap':'Tidak Lengkap'],["Jumlah barang dilaporkan",report.items.map(item=>`${item.label}: ${item.returnedQuantity} ${item.unit}`).join(', ')],["Catatan",report.notes],["Dikirim",new Date(report.submittedAt).toLocaleString('id-ID',{hourCycle:'h23',timeZone:'Asia/Jakarta'})],["Tenggat",report.late?'Terlambat':'Tepat waktu']]}/>}</Card>
  return <>
    <Card className="sbpg-form"><h2>Checklist pengembalian</h2><p>{record.event.name} · batas kirim: {new Date(deadline).toLocaleString('id-ID',{hourCycle:'h23',timeZone:'Asia/Jakarta'})} WIB</p><Badge tone={late?'danger':'info'}>{late?'Terlambat menurut waktu demo':'Belum melewati batas demo'}</Badge>
      {items.map((item,index)=><div className="sbpg-item" key={item.label}><strong>{item.label} · dipinjam {item.quantity} {item.unit}</strong><label className="form-field"><span className="form-field__label">Jumlah dikembalikan</span><input className="form-control" min="0" max={item.quantity} type="number" value={item.returnedQuantity} onChange={event=>setItems(current=>current.map((value,i)=>i===index?{...value,returnedQuantity:event.target.value}:value))}/></label><label className="form-field"><span className="form-field__label">Kondisi barang</span><select className="form-control" value={item.condition} onChange={event=>setItems(current=>current.map((value,i)=>i===index?{...value,condition:event.target.value}:value))}><option value="">Pilih kondisi</option><option>Baik</option><option>Rusak</option><option>Hilang</option></select></label></div>)}
      <label className="form-field"><span className="form-field__label">Catatan kerusakan atau kehilangan</span><textarea className="form-control workflow-textarea" maxLength="500" value={notes} onChange={event=>setNotes(event.target.value)} placeholder="Wajib diisi jika ada barang rusak atau hilang"/></label>
    </Card>
    <Button disabled={!complete} onClick={()=>setConfirmOpen(true)}><PackageCheck size={16}/>Konfirmasi pengiriman SBPG</Button>
    <p className="demo-disclaimer">Pencatatan waktu dan pemeriksaan fisik Logistik belum terhubung ke backend.</p>
    <Modal open={confirmOpen} onClose={()=>setConfirmOpen(false)} title="Kirim laporan pengembalian?"><p className="modal-copy">Data akan dicatat pada simulasi dan ditandai menunggu pemeriksaan Logistik Kampus.</p><div className="modal-actions"><Button variant="secondary" onClick={()=>setConfirmOpen(false)}>Periksa lagi</Button><Button onClick={submit}>Kirim SBPG</Button></div></Modal>
  </>
}

export default function PeminjamWorkspacePage({ section }) {
  const navigate=useNavigate(), location=useLocation(), params=useParams(), outlet=useOutletContext()
  const [currentTime]=useState(()=>Date.now())
  const [query,setQuery]=useState(''), [filter,setFilter]=useState('Semua'), [dateStart,setDateStart]=useState(''), [dateEnd,setDateEnd]=useState('')
  const [draftFilter,setDraftFilter]=useState('Semua'), [draftStart,setDraftStart]=useState(''), [draftEnd,setDraftEnd]=useState('')
  const { notifications, setNotifications, returnReports, setReturnReports, notificationPreferences, logisticsDecisions = {} } = outlet
  const dynamic=(outlet.submittedApplications||[]).map((a)=>({...a,event:{...a.event,name:a.event.name},pembina:a.supervisorStatus||a.pembina||'Menunggu Persetujuan Pembina',logistik:a.logisticsStatus||a.logistik||'Menunggu pemeriksaan Logistik',canIssueSbp:Boolean(a.sbpPublished)}))
  const records=[...dynamic,...demoRecords.map(item=>({...item,...logisticsDecisions[item.id],canIssueSbp:Boolean(logisticsDecisions[item.id]?.sbpPublished??item.canIssueSbp),logistik:logisticsDecisions[item.id]?.logisticsStatus||logisticsDecisions[item.id]?.status||item.logistik,rejectionReason:logisticsDecisions[item.id]?.logisticsNote||item.rejectionReason,returnReport:returnReports[item.id]||item.returnReport}))]
  const record=records.find(x=>x.id===params.id)
  const preferenceForCategory={Pengajuan:'applicationStatus',Persetujuan:'applicationStatus',Dokumen:'documents',Kegiatan:'eventReminders',Pengembalian:'returnReminders','Informasi Kampus':'campusInformation'}
  const visibleNotifications=notifications.filter((item)=>!notificationPreferences.doNotDisturb&&notificationPreferences[preferenceForCategory[item.category]||'applicationStatus'])
  const statusMatch=(record)=>{
    if(filter==='Semua')return true
    if(filter==='Menunggu Pembina')return record.status.includes('Pembina')||record.status==='Pengajuan Diterima'
    if(filter==='Menunggu Logistik')return record.status.includes('Logistik')||record.logistik?.includes('Menunggu')
    if(filter==='Disetujui')return record.status==='Dipinjam'||record.status==='Disetujui'
    if(filter==='Ditolak')return record.status.includes('Ditolak')
    return record.status==='Selesai'
  }
  const filtered=records.filter(x=>statusMatch(x)&&(!dateStart||x.event?.date>=dateStart)&&(!dateEnd||x.event?.date<=dateEnd)&&`${x.id} ${x.event?.name} ${x.room?.name}`.toLowerCase().includes(query.toLowerCase()))
  const openDoc=(id,kind='sbp')=>navigate(`/peminjam/dokumen/${id}?jenis=${kind}`,{state:{from:location.pathname}})
  const pageBack=()=>navigate(-1)

  if(section==='detail') return !record ? <div className="workflow-page"><Back to={location.state?.from||'/peminjam/pengajuan'}/><Card><h1>Pengajuan tidak ditemukan</h1><p>Data demonstrasi tidak tersedia.</p></Card></div> : <div className="workflow-page"><Back to={location.state?.from||'/peminjam/pengajuan'}/><header className="workflow-heading"><p className="eyebrow">DETAIL PENGAJUAN</p><h1>{record.event.name}</h1><p className="page-description">{record.id} · data demonstrasi</p></header><Card className="confirmation-section"><h2>Informasi kegiatan</h2><InfoList rows={[["Nama kegiatan",record.event.name],["Tujuan",record.event.purpose],["Jumlah peserta",`${record.event.participants} orang`],["Jadwal",`${record.event.date} · ${formatTimeRange(record.event.startTime,record.event.endTime)}`],["Peminjam",record.borrower.name],["Organisasi",record.borrower.organization],["WhatsApp",record.borrower.whatsapp],["Ruangan",`${record.room.name} · ${record.room.building} · kapasitas ${record.room.capacity}`],["Fasilitas ruangan",record.room.equipment.join(', ')],["Logistik",record.logistics.map(x=>`${x.label} (${x.quantity} ${x.unit})`).join(', ')],["Email Pembina",record.supervisorEmail],["Status Pembina",record.pembina],["Status Logistik",record.logistik],["Alasan penolakan",record.rejectionReason||'Tidak ada pada data simulasi'],["Status SBPG",record.returnReport?.logisticsInspection?.status==='Selesai'?'Selesai · simulasi':record.returnReport?'Menunggu pemeriksaan Logistik':record.returned?'Selesai · simulasi':'Belum dikirim']]} /></Card><Card className="confirmation-section"><h2>Proses pengajuan</h2><ol className="request-timeline"><li>FPP diterima sistem simulasi</li><li>{record.pembina}</li><li>{record.logistik}</li></ol><Badge tone={record.status==='Selesai'?'success':'warning'}>{record.status}</Badge></Card><div className="workspace-actions">{record.canIssueSbp&&<Button onClick={()=>openDoc(record.id)}>Lihat SBP</Button>}{record.canIssueSbp&&<Button variant="secondary" onClick={()=>openDoc(record.id,'sbpg')}>{record.returned||record.returnReport?'Lihat SBPG':'Isi SBPG'}</Button>}<Button variant="secondary" onClick={pageBack}>Kembali ke daftar</Button></div></div>

  if(section==='notifikasi-detail') { const n=notifications.find(x=>x.id===params.id); if(!n)return <div className="workflow-page"><Back to="/peminjam/notifikasi"/><Card><h1>Notifikasi tidak ditemukan</h1></Card></div>; return <div className="workflow-page"><Back to="/peminjam/notifikasi"/><header className="workflow-heading"><p className="eyebrow">{n.category}</p><h1>{n.title}</h1><p className="page-description">{n.date}</p></header><Card><p>{n.body}</p><Button onClick={()=>navigate(`/peminjam/pengajuan/${n.requestId}`,{state:{from:location.pathname}})}>Lihat pengajuan</Button></Card></div> }

  if(section==='dokumen') {
    const kind=new URLSearchParams(window.location.search).get('jenis')||'sbp'
    if(!record)return <div className="workflow-page"><Back/><Card><h1>Transaksi tidak ditemukan</h1></Card></div>
    if(kind==='sbp'&&!record.canIssueSbp)return <div className="workflow-page"><Back to={location.state?.from||`/peminjam/pengajuan/${record.id}`}/><Card><h1>SBP belum tersedia</h1><p>SBP hanya tersedia setelah persetujuan Pembina dan Logistik. Status transaksi ini: {record.status}.</p></Card></div>
    const eventEnd=Date.parse(`${record.event.endDate||record.event.date}T${record.event.endTime}:00+07:00`)
    if(kind==='sbpg'&&(!record.canIssueSbp||currentTime<eventEnd))return <div className="workflow-page"><Back to={location.state?.from||`/peminjam/pengajuan/${record.id}`}/><Card><h1>SBPG belum tersedia</h1><p>Laporan pengembalian dapat dibuat setelah transaksi disetujui dan kegiatan selesai.</p></Card></div>
    return <div className="workflow-page"><Back to={location.state?.from||`/peminjam/pengajuan/${record.id}`}/><header className="workflow-heading"><p className="eyebrow">DOKUMEN SIMULASI · {record.id}</p><h1>{kind==='sbpg'?'SBPG · Pengembalian':'SBP · Peminjaman'}</h1><p className="page-description">Dokumen demonstrasi, bukan dokumen resmi.</p></header>{kind==='sbp'?<><Card className="document-preview"><p className="document-preview__notice">SBP SIMULASI — tersedia karena kedua persetujuan demo tercatat</p><h2>Surat Bukti Peminjaman</h2><InfoList rows={[["Nomor dokumen",`SBP-${record.id}`],["Peminjam",record.borrower.name],["Kegiatan",record.event.name],["Jadwal",`${record.event.date} · ${formatTimeRange(record.event.startTime,record.event.endTime)}`],["Ruangan",`${record.room.name}, ${record.room.building}`],["Fasilitas",record.logistics.map(x=>`${x.label}: ${x.quantity} ${x.unit}`).join(', ')],["Status persetujuan",`${record.pembina}; ${record.logistik}`]]}/></Card><div className="workspace-actions"><Button onClick={()=>window.print()}><Printer size={16}/>Cetak</Button><Button variant="secondary" onClick={()=>{const b=new Blob([`SBP SIMULASI ${record.id}\n${record.event.name}\n${record.room.name}`],{type:'text/plain'});const a=document.createElement('a');const url=URL.createObjectURL(b);a.href=url;a.download=`SBP-${record.id}.txt`;a.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000)}}><Download size={16}/>Unduh</Button><Button variant="tertiary" onClick={()=>openDoc(record.id,'sbpg')}>Isi SBPG</Button></div></>:<SbpgForm record={record} report={record.returnReport} setReturnReports={setReturnReports}/>}</div>
  }

  if(section==='pengajuan'||section==='riwayat') return <div className="workflow-page"><header className="workflow-heading"><p className="eyebrow">{section==='pengajuan'?'PEMANTAUAN':'TRANSAKSI'}</p><h1>{titleMap[section]}</h1><p className="page-description">Daftar transaksi demonstrasi Peminjam.</p></header><label className="workspace-search"><Search size={17}/><input aria-label="Cari nama kegiatan atau ruangan" placeholder="Cari kegiatan, ruangan, atau ID" value={query} onChange={e=>setQuery(e.target.value)}/></label><TransactionFilters status={draftFilter} setStatus={setDraftFilter} start={draftStart} setStart={setDraftStart} end={draftEnd} setEnd={setDraftEnd} onApply={()=>{setFilter(draftFilter);setDateStart(draftStart);setDateEnd(draftEnd)}} onReset={()=>{setQuery('');setDraftFilter('Semua');setDraftStart('');setDraftEnd('');setFilter('Semua');setDateStart('');setDateEnd('')}}/><div className="status-list">{filtered.length?filtered.map(x=><button key={x.id} className="workspace-record" onClick={()=>navigate(`/peminjam/pengajuan/${x.id}`,{state:{from:location.pathname}})}><span className="workspace-record__icon"><ClipboardList size={18}/></span><span className="workspace-record__body"><strong>{x.event.name}</strong><small>{x.room.name} · {x.event.date} · {formatTimeRange(x.event.startTime,x.event.endTime)} · {x.event.participants} peserta</small><small>{x.id}</small><Badge tone={x.status==='Selesai'||x.status==='Dipinjam'?'success':'warning'}>{x.status}</Badge></span></button>):<Card><h2>Tidak ada transaksi ditemukan</h2><p>Ubah pencarian, rentang tanggal, atau filter status.</p></Card>}</div><p className="demo-disclaimer">Status persetujuan dan ketersediaan merupakan data simulasi.</p></div>

  if(section==='notifikasi') return <div className="workflow-page"><Back to={location.state?.from||'/peminjam'}/><header className="workflow-heading"><p className="eyebrow">PEMBARUAN</p><h1>Notifikasi</h1></header><div className="workspace-actions"><Button variant="secondary" onClick={()=>setNotifications(v=>v.map(n=>({...n,read:true})))}><CheckCheck size={16}/>Tandai semua dibaca</Button></div><div className="status-list">{visibleNotifications.length?visibleNotifications.map(n=><button className={`workspace-record ${n.read?'is-read':''}`} key={n.id} onClick={()=>{setNotifications(v=>v.map(x=>x.id===n.id?{...x,read:true}:x));navigate(`/peminjam/notifikasi/${n.id}`,{state:{from:location.pathname}})}}><span className="workspace-record__icon"><Bell size={18}/></span><span className="workspace-record__body"><strong>{n.title}</strong><small>{n.body}</small><small>{n.category} · {n.date} · {n.read?'Dibaca':'Belum dibaca'}</small></span>{!n.read&&<span className="notification-dot"/>}</button>):<Card><h2>Tidak ada notifikasi yang tampil</h2><p>Aktifkan preferensi terkait atau nonaktifkan Do Not Disturb untuk melihat pembaruan demo.</p></Card>}</div></div>

  return null
}


