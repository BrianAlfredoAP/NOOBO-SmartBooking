const variants = {
  primary: 'ui-button--primary',
  secondary: 'ui-button--secondary',
  tertiary: 'ui-button--tertiary',
  destructive: 'ui-button--destructive',
}

function Button({ variant = 'primary', size = 'md', className = '', ...props }) {
  const variantClass = variants[variant] ?? variants.primary
  return (
    <button
      className={`ui-button ui-button--${size} ${variantClass} ${className}`.trim()}
      {...props}
    />
  )
}

export default Button
