import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useSWR from "swr";
import Header from "@/components/nav/Header";
import { motion } from "framer-motion";
import { BASE_API, OWNER_ID } from "../../config.json";

const TabButton = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 ${active 
            ? 'bg-[#00FF00] text-black font-medium' 
            : 'bg-black border border-[#00FF00]/30 text-[#00FF00] hover:bg-[#00FF00]/10'} 
        rounded-md transition-colors`}
    >
        {children}
    </button>
);

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('blogs');

    const fetcher = (url) =>
        fetch(`${BASE_API}${url}`, {
            headers: { Authorization: `${localStorage.getItem("token")}` },
        }).then((response) => response.json());

    const { data: user } = useSWR('/user/me', fetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false
    });

    const { data: blogs, isLoading: blogsLoading, mutate: refreshBlogs } = useSWR('/blogs', fetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    });
    
    const { data: users, isLoading: usersLoading, mutate: refreshUsers } = useSWR('/user/all', fetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    });

    useEffect(() => {
        if (user && user.id && user.role !== 'admin' && user.role !== 'owner' && user.id !== OWNER_ID) {
            navigate('/');
        }
    }, [user, navigate]);

    const [newBlog, setNewBlog] = useState({
        title: '',
        content: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewBlog(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const createNewBlog = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch(`${BASE_API}/blogs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')
                },
                body: JSON.stringify(newBlog)
            });
            
            if (response.ok) {
                setNewBlog({ title: '', content: '' });
                refreshBlogs();
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message || 'Failed to create blog'}`);
            }
        } catch (error) {
            console.error('Error creating blog:', error);
            alert('An error occurred while creating the blog');
        }
    };

    const deleteBlog = async (blogId) => {
        if (!window.confirm('Are you sure you want to delete this blog?')) {
            return;
        }
        
        try {
            const response = await fetch(`${BASE_API}/blogs/${blogId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': localStorage.getItem('token')
                }
            });
            
            if (response.ok) {
                refreshBlogs();
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message || 'Failed to delete blog'}`);
            }
        } catch (error) {
            console.error('Error deleting blog:', error);
            alert('An error occurred while deleting the blog');
        }
    };

    if (!user) {
        return <div className="min-h-screen bg-black text-[#00FF00] p-8">Loading...</div>;
    }

    if (user && user.role !== 'admin' && user.role !== 'owner' && user.id !== OWNER_ID) {
        return null; 
    }

    const updateUserRole = async (userId, newRole) => {
        try {
            const response = await fetch(`${BASE_API}/user/${userId}/role`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')
                },
                body: JSON.stringify({ role: newRole })
            });
            
            if (response.ok) {
                refreshUsers();
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message || 'Failed to update user role'}`);
            }
        } catch (error) {
            console.error('Error updating user role:', error);
            alert('An error occurred while updating the user role');
        }
    };
    
    const deleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) {
            return;
        }
        
        try {
            const response = await fetch(`${BASE_API}/user/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': localStorage.getItem('token')
                }
            });
            
            if (response.ok) {
                refreshUsers();
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message || 'Failed to delete user'}`);
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('An error occurred while deleting the user');
        }
    };

    return (
        <div className="min-h-screen bg-black text-[#00FF00] p-8">
            <Header user={user} />
            
            <motion.div
                className="max-w-6xl mx-auto mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl font-bold mb-4 border-b border-[#00FF00]/20 pb-4">Admin Dashboard</h1>
                
                <div className="flex space-x-4 mb-8 mt-6">
                    <TabButton 
                        active={activeTab === 'blogs'} 
                        onClick={() => setActiveTab('blogs')}
                    >
                        Manage Blogs
                    </TabButton>
                    <TabButton 
                        active={activeTab === 'users'} 
                        onClick={() => setActiveTab('users')}
                    >
                        Manage Users
                    </TabButton>
                </div>
                
                {activeTab === 'blogs' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <motion.div
                        className="bg-black/40 p-6 rounded-lg border border-[#00FF00]/20"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="text-xl font-semibold mb-4">Create New Blog</h2>
                        <form onSubmit={createNewBlog} className="space-y-4">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={newBlog.title}
                                    onChange={handleInputChange}
                                    className="w-full bg-black border border-[#00FF00]/30 rounded-md p-2 text-[#00FF00] focus:ring-[#00FF00]"
                                    required
                                    maxLength={50}
                                />
                            </div>
                            <div>
                                <label htmlFor="content" className="block text-sm font-medium mb-1">Content</label>
                                <textarea
                                    id="content"
                                    name="content"
                                    value={newBlog.content}
                                    onChange={handleInputChange}
                                    className="w-full bg-black border border-[#00FF00]/30 rounded-md p-2 text-[#00FF00] h-32 focus:ring-[#00FF00]"
                                    required
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="bg-[#00FF00] text-black px-4 py-2 rounded-md font-medium hover:bg-[#00FF00]/80 transition-colors"
                            >
                                Create Blog
                            </button>
                        </form>
                    </motion.div>
                    
                    <motion.div
                        className="bg-black/40 p-6 rounded-lg border border-[#00FF00]/20"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h2 className="text-xl font-semibold mb-4">Manage Blogs</h2>
                        {blogsLoading ? (
                            <p>Loading blogs...</p>
                        ) : blogs && blogs.length > 0 ? (
                            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                {blogs.map(blog => (
                                    <div key={blog.id} className="border border-[#00FF00]/20 p-3 rounded-md">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-medium">{blog.title}</h3>
                                                <p className="text-xs text-[#00FF00]/60">{blog.createdAt}</p>
                                            </div>
                                            <button
                                                onClick={() => deleteBlog(blog.id)}
                                                className="text-red-500 hover:text-red-400 transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No blogs found</p>
                        )}
                    </motion.div>
                </div>
                ) : (
                    <motion.div 
                        className="bg-black/40 p-6 rounded-lg border border-[#00FF00]/20"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 100, damping: 12 }}
                    >
                        <h2 className="text-xl font-semibold mb-4">User Management</h2>
                        {usersLoading ? (
                            <p>Loading users...</p>
                        ) : users && users.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="border-b border-[#00FF00]/20">
                                            <th className="text-left py-2 px-4">ID</th>
                                            <th className="text-left py-2 px-4">Username</th>
                                            <th className="text-left py-2 px-4">Email</th>
                                            <th className="text-left py-2 px-4">Role</th>
                                            <th className="text-left py-2 px-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(userItem => (
                                            <tr key={userItem.id} className="border-b border-[#00FF00]/10 hover:bg-[#00FF00]/5">
                                                <td className="py-2 px-4 text-sm">{userItem.id}</td>
                                                <td className="py-2 px-4">{userItem.username}</td>
                                                <td className="py-2 px-4 text-sm">{userItem.email}</td>
                                                <td className="py-2 px-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${userItem.role === 'owner' 
                                                        ? 'bg-red-500/20 text-red-300' 
                                                        : userItem.role === 'admin' 
                                                        ? 'bg-yellow-500/20 text-yellow-300' 
                                                        : 'bg-blue-500/20 text-blue-300'}`}>
                                                        {userItem.role}
                                                    </span>
                                                </td>
                                                <td className="py-2 px-4">
                                                    {userItem.id !== OWNER_ID && (
                                                        <div className="flex space-x-2">
                                                            {userItem.role !== 'admin' && (
                                                                <motion.button 
                                                                    onClick={() => updateUserRole(userItem.id, 'admin')}
                                                                    className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded hover:bg-yellow-500/30 transition-colors"
                                                                    whileHover={{ scale: 1.05 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                >
                                                                    Make Admin
                                                                </motion.button>
                                                            )}
                                                            {userItem.role !== 'user' && (
                                                                <motion.button 
                                                                    onClick={() => updateUserRole(userItem.id, 'user')}
                                                                    className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded hover:bg-blue-500/30 transition-colors"
                                                                    whileHover={{ scale: 1.05 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                >
                                                                    Make User
                                                                </motion.button>
                                                            )}
                                                            <motion.button 
                                                                onClick={() => deleteUser(userItem.id)}
                                                                className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded hover:bg-red-500/30 transition-colors"
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                            >
                                                                Delete
                                                            </motion.button>
                                                        </div>
                                                    )}
                                                    {userItem.id === OWNER_ID && (
                                                        <span className="text-xs text-[#00FF00]/50">Owner (Protected)</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p>No users found</p>
                        )}
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
