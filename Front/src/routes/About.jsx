import React from "react";
import useSWR from "swr";
import { motion } from "framer-motion";
import Header from "@/components/nav/Header";
import { BASE_API } from "../config.json";

export default function About() {
    const fetcher = (url) =>
        fetch(`${BASE_API}${url}`, {
            headers: { Authorization: `${localStorage.getItem("token")}` },
        }).then((response) => response.json());

    const { data: user } = useSWR('/user/me', fetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false
    });

    return (
        <div className="min-h-screen bg-black text-[#00FF00] p-8">
            <Header user={user} />
            
            <motion.div
                className="border-b border-[#00FF00]/20 mb-8"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5 }}
            />
            
            <motion.div 
                className="max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
            >
                <motion.h1 
                    className="text-4xl font-bold mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    About HowToMake
                </motion.h1>
                
                <motion.div 
                    className="space-y-6 content-block auto-format-text"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <p>
                        HowToMake is a modern platform for sharing knowledge, designed to allow users 
                        to easily create and share guides, tutorials, and tips on various subjects.
                    </p>
                    
                    <h2 className="text-2xl font-semibold mt-8 mb-4">Our mission</h2>
                    <p>
                        Our mission is to create a space where knowledge can be freely shared and accessible to everyone. 
                        We believe in the power of information sharing and the importance of making specialized skills 
                        accessible to a wider audience.
                    </p>
                    
                    <h2 className="text-2xl font-semibold mt-8 mb-4">Main features</h2>
                    <ul className="list-disc ml-8 space-y-2">
                        <li>Blog creation with rich content blocks (text and images)</li>
                        <li>Intuitive user interface with retro aesthetic inspired by terminals</li>
                        <li>Secure authentication system</li>
                        <li>Ability to browse other creators' content</li>
                        <li>Mobile experience</li>
                    </ul>
                    
                    <h2 className="text-2xl font-semibold mt-8 mb-4">Technologies used</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                        <div className="bg-[#00FF00]/10 p-4 border border-[#00FF00]/30 rounded-md">
                            <h3 className="font-semibold mb-2">Frontend</h3>
                            <ul className="list-disc ml-5 text-sm">
                                <li>React</li>
                                <li>Framer Motion</li>
                                <li>Tailwind CSS</li>
                                <li>SWR</li>
                            </ul>
                        </div>
                        
                        <div className="bg-[#00FF00]/10 p-4 border border-[#00FF00]/30 rounded-md">
                            <h3 className="font-semibold mb-2">Backend</h3>
                            <ul className="list-disc ml-5 text-sm">
                                <li>Node.js</li>
                                <li>Express</li>
                                <li>MongoDB</li>
                                <li>JWT</li>
                            </ul>
                        </div>
                        
                        <div className="bg-[#00FF00]/10 p-4 border border-[#00FF00]/30 rounded-md">
                            <h3 className="font-semibold mb-2">Deployment</h3>
                            <ul className="list-disc ml-5 text-sm">
                                <li>Github Pages</li>
                                <li>Nginx</li>
                                <li>Soon..</li>
                            </ul>
                        </div>
                    </div>
                    
                    <h2 className="text-2xl font-semibold mt-8 mb-4">Our team</h2>
                    <p>
                        HowToMake was created by a passionate developer and designer 
                        who believe in the democratization of knowledge and skill.
                    </p>
                    
                    <div className="mt-16 p-6 bg-[#00FF00]/5 border border-[#00FF00]/20 rounded-md">
                        <h2 className="text-xl font-semibold mb-4">Contact us</h2>
                        <p>
                            You have questions, suggestions or feedback? 
                            Don't hesitate to contact us at <span className="underline">contact@howtomake.tech</span>
                        </p>
                    </div>
                    
                    <motion.div 
                        className="text-center text-sm text-[#00FF00]/60 mt-8 pt-8 border-t border-[#00FF00]/20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        <p>© {new Date().getFullYear()} HowToMake. All rights reserved.</p>
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
    );
}
