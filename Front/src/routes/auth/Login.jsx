import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BASE_API } from "../../config.json";

export default function Login() {
    const [datas, setDatas] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    async function login() {
        if (!datas.email) return setError('Email is required.');
        if (!datas.password) return setError('Password is required.');
        
        setIsLoading(true);
        setError('');

        fetch(`${BASE_API}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datas)
        })
            .then(response => response.json())
            .then(json => {
                setIsLoading(false);
                if (json.token) {
                    localStorage.setItem('token', json.token);
                    window.location.replace('/blogs');
                } else {
                    setError(json.message || 'An error occured.');
                }
            })
            .catch(() => {
                setIsLoading(false);
                setError('An error occured.');
            });
    }

    return (
        <main className="py-8 flex flex-col justify-center items-center min-h-screen bg-black text-[#00FF00]">
            <div className="w-full max-w-md">
                <h1 className="text-2xl mb-6 text-center">Log in</h1>
                {error ? <p className="text-red-500 text-center">{error}</p> : null}
                <label htmlFor="email" className="relative w-full mt-4">
                    <box-icon class="fill-[#00FF00] opacity-30 w-6 h-6 absolute top-1/2 transform -translate-y-1/2 left-3" type='solid' name='user'></box-icon>
                    <Input className="text-[#00FF00] bg-black border-[#00FF00] mb-4 pl-10" onChange={(e) => setDatas(prev => ({ ...prev, email: e.target.value }))} type="email" name="email" id="email" placeholder="Email" />
                </label>
                <label htmlFor="password" className="relative w-full mt-4">
                    <box-icon class="fill-[#00FF00] opacity-30 w-6 h-6 absolute top-1/2 transform -translate-y-1/2 left-3" type='solid' name='lock-alt'></box-icon>
                    <Input className="text-[#00FF00] bg-black border-[#00FF00] pl-10" onChange={(e) => setDatas(prev => ({ ...prev, password: e.target.value }))} type="password" name="password" id="password" placeholder="Password" />
                </label>
                <div className="flex items-center justify-between w-full px-8 mt-10">
                    <h2 className="text-2xl font-extrabold mt-2 mb-2">Login</h2>
                    <Button size='icon' onClick={() => login()} disabled={isLoading} className="bg-[#00FF00] text-black hover:bg-[#00FF00]/80">
                        {isLoading ? 'Logging in...' : <box-icon class="h-8 w-8 fill-black" name='right-arrow-alt'></box-icon>}
                    </Button>
                </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-8 w-full mt-8">
                <Link to="/auth/register" className="text-[#00FF00]/60 font-light cursor-pointer hover:text-[#00FF00]">I don't have an account yet</Link>
            </div>
        </main>
    );
}

