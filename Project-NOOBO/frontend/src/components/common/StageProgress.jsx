import { Check } from 'lucide-react'

export default function StageProgress({ stages, activeIndex, completedIndexes = [], label = 'Tahapan proses' }) {
  const completed = new Set(completedIndexes)
  return <ol aria-label={label} className="stage-progress">
    {stages.map((stage, index) => {
      const done = completed.has(index) || index < activeIndex
      const current = index === activeIndex
      return <li className={`${current ? 'is-current' : ''} ${done ? 'is-complete' : ''}`} key={stage}>
        <span aria-current={current ? 'step' : undefined} className="stage-progress__marker">{done ? <Check size={14} aria-label="Selesai"/> : String(index + 1).padStart(2, '0')}</span>
        <small>{stage}</small>
      </li>
    })}
  </ol>
}
