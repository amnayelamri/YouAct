import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { LogOut, Home } from 'lucide-react'
import '../styles/navbar.css'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            🎬 YouAct
          </Link>
          
          <div className="navbar-right">
            <Link to="/" className="navbar-link">
              <Home size={20} />
              Projects
            </Link>
            
            {user && (
              <>
                <span className="navbar-user">{user.username}</span>
                <button onClick={handleLogout} className="navbar-logout btn btn-danger btn-sm">
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
