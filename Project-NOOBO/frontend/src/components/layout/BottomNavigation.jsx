import { NavLink } from 'react-router'

function BottomNavigation({ label, items, className = '' }) {
  return (
    <nav aria-label={label} className={`peminjam-bottom-nav ${className}`.trim()}>
      {items.map(({ to, label: itemLabel, icon: Icon, end = false }) => (
        <NavLink
          key={to}
          className={({ isActive }) => `peminjam-bottom-nav__link${isActive ? ' is-active' : ''}`}
          end={end}
          to={to}
        >
          <Icon size={19} aria-hidden="true" />
          <span>{itemLabel}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export default BottomNavigation
