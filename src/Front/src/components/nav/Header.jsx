import React from 'react';
import { Link } from 'react-router-dom';

export default function Header({ user }) {
  function logout() {
    localStorage.removeItem('token');
    location.replace('/blogs');
  }

  return (
    <header className="py-4 flex justify-around items-center border-b border-[#00FF00]/20">
      <Link to="/" className="hover:text-[#00FF00]/80 transition-colors">
        HOWTOMAKE
      </Link>
      <nav>
        <ul className="flex space-x-4">
          <li>
            <Link to="/about" className="hover:text-[#00FF00]/80 transition-colors underline">
              ABOUT
            </Link>
          </li>
          <li>
            <Link to="/blogs/create" className="hover:text-[#00FF00]/80 transition-colors underline">
              CREATE BLOG
            </Link>
          </li>
          {user && user.id ? <>
            <li>
              <Link onClick={() => logout()} className="hover:text-[#00FF00]/80 transition-colors underline">
                LOGOUT
              </Link>
            </li>
          </> : <>
            <li>
              <Link to="/auth/login" className="hover:text-[#00FF00]/80 transition-colors underline">
                LOGIN
              </Link>
            </li>
            <li>
              <Link to="/auth/register" className="hover:text-[#00FF00]/80 transition-colors underline">
                REGISTER
              </Link>
            </li>
          </>}
        </ul>
      </nav>
    </header>
  );
}