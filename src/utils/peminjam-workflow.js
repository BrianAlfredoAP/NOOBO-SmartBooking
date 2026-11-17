import { demoEquipment, demoRooms } from '../data/peminjam-demo.js'
import { validateTimeRange } from './time-format.js'

export function validateFskStep(step, form) {
  const errors = {}

  if (step === 0) {
    if (!form.borrowerName.trim()) errors.borrowerName = 'Nama peminjam wajib diisi.'
    if (!form.organization.trim()) errors.organization = 'Organisasi atau unit kegiatan wajib diisi.'
    if (!form.eventName.trim()) errors.eventName = 'Nama kegiatan wajib diisi.'
    if (!form.purpose.trim()) errors.purpose = 'Tujuan kegiatan wajib diisi.'
  }

  if (step === 1) {
    const participants = Number(form.participants)
    if (!form.participants || !Number.isInteger(participants) || participants < 1 || participants > 10000) {
      errors.participants = 'Masukkan jumlah peserta berupa bilangan bulat antara 1 dan 10.000.'
    }
    if (!form.date) errors.date = 'Tanggal kegiatan wajib dipilih.'
    if (!form.endDate) errors.endDate = 'Tanggal selesai kegiatan wajib dipilih.'
    if (form.date && form.endDate && form.endDate < form.date) errors.endDate = 'Tanggal selesai tidak boleh sebelum tanggal mulai.'
    if (!form.startTime) errors.startTime = 'Waktu mulai wajib diisi.'
    if (!form.endTime) errors.endTime = 'Waktu selesai wajib diisi.'
    if (form.startTime && form.endTime) Object.assign(errors, validateTimeRange(form.startTime, form.endTime))
  }

  if (step === 2) {
    demoEquipment.filter(({ id }) => id !== 'lainnya' && form.equipment[id]).forEach(({ id }) => {
      const quantity = Number(form.equipment[id])
      if (!Number.isInteger(quantity) || quantity < 1) errors[`equipment_${id}`] = 'Jumlah harus berupa bilangan bulat minimal 1.'
    })
    if (form.equipment.lainnya && !form.otherEquipment.trim()) errors.otherEquipment = 'Jelaskan fasilitas atau barang lainnya.'
  }

  return errors
}

export function buildRecommendations(form) {
  const participants = Number(form.participants) || 0
  const requested = demoEquipment
    .filter(({ id }) => id !== 'lainnya' && Number(form.equipment[id]) > 0)
    .map(({ id, label, stock, unit }) => ({
      id,
      label,
      quantity: Number(form.equipment[id]),
      unit,
      simulatedStock: stock,
      selected: true,
    }))

  if (form.equipment.lainnya && form.otherEquipment.trim()) {
    requested.push({
      id: 'lainnya',
      label: form.otherEquipment.trim(),
      quantity: 1,
      unit: 'permintaan',
      simulatedStock: null,
      selected: true,
    })
  }

  const rooms = demoRooms
    .map((room) => {
      const fits = room.capacity >= participants
      const available = room.available && room.condition === 'Baik'
      const matchingEquipment = requested.filter(({ label }) => room.equipment.includes(label)).length
      const score = (fits ? 3 : 0) + (available ? 1 : 0) + matchingEquipment * 2
      return {
        ...room,
        fits,
        score,
        matchingEquipment,
        reason: !fits
          ? `Kapasitas ${room.capacity} orang belum mencukupi untuk ${participants} peserta.`
          : `Kapasitas sesuai untuk ${participants} peserta${matchingEquipment ? `, dan ${matchingEquipment} fasilitas yang diminta tersedia di data ruangan simulasi` : ''}${form.date ? ` untuk jadwal ${form.date}` : ''}.`,
      }
    })
    .sort((a, b) => b.score - a.score)

  return { rooms, logistics: requested }
}
