import React from 'react';
import { useAuth } from "@/lib/hooks/useAuth";
import Header from "@/components/nav/Header";

const posts = [
  {
    title: "THE STORY BEHIND BLACKOUT: ABUSING GMER DRIVER TO TERMINATE PROTECTED PROCESSES",
    date: "May 3, 2024",
    content: "During a ransomware incident response, I noticed a file with a strange name that was retrieved by the team. Upon inspection, it turned out to be a driver. This raised the question \"what does a driver have to do with a ransomware incident response?\" To understand this, I…"
  },
  {
    title: "ALPHV MALWARE ANALYSIS REPORT",
    date: "June 26, 2023",
    content: "Description The file is a 32-bit Windows executable that contains BlackCat Ransomware. BlackCat, also known as Noberus or ALPHV, is a sophisticated ransomware family programmed in Rust and deployed as part of Ransomware as a Service (RaaS) operations on Windows. The ransomware can be configured to encrypt files using..."
  }
];

export default function Dashboard() {
    const { user } = useAuth();

    return (
        <div className="mx-auto px-4 min-h-screen bg-black text-[#00FF00]">
          <main className="py-8">
            <Header />
            <div className="border-b border-[#00FF00]/20 mb-8" />
            
            {posts.map((post, index) => (
              <article key={index} className="relative mb-16">
                <div className="absolute -left-8 grid grid-cols-3 gap-8 text-[#00FF00]/20">
                  {[...Array(9)].map((_, i) => (
                    <span key={i}>+</span>
                  ))}
                </div>
                
                <div className="ml-16">
                  <h2 className="text-xl mb-1">{post.title}</h2>
                  <time className="text-[#00FF00]/60 block mb-4 text-sm">
                    {post.date}
                  </time>
                  <p className="leading-relaxed">
                    {post.content}
                  </p>
                </div>
    
                {index !== posts.length - 1 && (
                  <div className="border-b border-[#00FF00]/20 mt-16" />
                )}
              </article>
            ))}
        </main>
      </div>
    );
}
