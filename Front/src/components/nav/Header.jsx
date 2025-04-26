import React from 'react';
import { Link } from 'react-router-dom';
import { OWNER_ID } from '../../../src/config.json';

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
            <Link to="/blogs" className="hover:text-[#00FF00]/80 transition-colors underline">
              BLOGS
            </Link>
          </li>
          <li>
            <Link to="/blogs/create" className="hover:text-[#00FF00]/80 transition-colors underline">
              CREATE BLOG
            </Link>
          </li>
          {user && user.id ? <>
            {(user.role === 'admin' || user.role === 'owner' || user.id === OWNER_ID) && (
              <li>
                <Link to="/admin/dashboard" className="hover:text-[#00FF00]/80 transition-colors underline font-bold">
                  ADMIN
                </Link>
              </li>
            )}
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