import { Link } from 'react-router'
import nooboLogo from '../../assets/logo.png'

function Brand({ to = '/auth' }) {
  return (
    <Link aria-label="NOOBO, ke halaman autentikasi" className="brand" to={to}>
      <img alt="" aria-hidden="true" className="brand__logo" src={nooboLogo} />
    </Link>
  )
}

export default Brand
