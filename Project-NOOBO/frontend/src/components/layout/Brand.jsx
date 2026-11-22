import { Link } from 'react-router'
import primaryLogo from '../../assets/brand/NOOBO-Primary-Dark.svg'

function Brand({ to = '/auth' }) {
  return (
    <Link aria-label="NOOBO, ke halaman autentikasi" className="brand" to={to}>
      <img alt="NOOBO — Easy Book, Easy Use" className="brand__logo" src={primaryLogo} />
    </Link>
  )
}

export default Brand
