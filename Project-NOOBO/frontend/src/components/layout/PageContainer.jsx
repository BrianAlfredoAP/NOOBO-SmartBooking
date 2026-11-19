function PageContainer({ as: Component = 'main', className = '', children, ...props }) {
  return (
    <Component className={`page-container ${className}`.trim()} {...props}>
      {children}
    </Component>
  )
}

export default PageContainer
