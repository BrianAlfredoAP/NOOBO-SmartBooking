const tones = {
  neutral: 'ui-badge--neutral',
  info: 'ui-badge--info',
  success: 'ui-badge--success',
  warning: 'ui-badge--warning',
  danger: 'ui-badge--danger',
}

function Badge({ tone = 'neutral', className = '', children, ...props }) {
  return (
    <span className={`ui-badge ${tones[tone] ?? tones.neutral} ${className}`.trim()} {...props}>
      {children}
    </span>
  )
}

export default Badge
