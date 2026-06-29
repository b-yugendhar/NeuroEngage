import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/UI';
import { Send, LayoutDashboard } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

export const LiveInteraction: React.FC = () => {
    const role = localStorage.getItem('neuro_role') || 'patient';
    const isDoctor = role === 'doctor';
    const username = localStorage.getItem('neuro_username') || 'User';
    const roomCode = isDoctor
        ? localStorage.getItem('neuro_pairing_code')
        : localStorage.getItem('neuro_doctor_code');

    const roomName = `NeuroEngage_Room_${roomCode || 'DEMO'}`;

    const [messages, setMessages] = useState<{ sender: string; text: string; time: string }[]>([]);
    const [input, setInput] = useState('');
    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        socketRef.current = io('http://localhost:5001');
        socketRef.current.emit('join-room', roomName);

        socketRef.current.on('receive-message', (data) => {
            setMessages((prev) => [...prev, data]);
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, [roomName]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !socketRef.current) return;

        const msgData = {
            roomId: roomName,
            sender: username,
            text: input,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        socketRef.current.emit('send-message', msgData);
        setInput('');
    };

    return (
        // Full-page shell
        <div className="min-h-screen w-full bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e293b]">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-6 h-screen flex flex-col">
                {/* Header */}
                <header className="flex justify-between items-end border-b border-border-subtle pb-3 shrink-0">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-text-primary mb-1">
                            Live Interaction
                        </h1>
                        <p className="text-text-secondary text-sm">
                            Real-time video consultation and encrypted chat.
                        </p>
                    </div>
                </header>

                {/* Main area: video huge, chat narrow */}
                <div className="flex flex-1 min-h-0 gap-4 md:gap-6 mt-3">
                    {/* VIDEO: ~75% width, fills height */}
                    <div className="flex-[3] min-w-0 rounded-2xl border border-border-subtle/60 bg-[#020617]/90 backdrop-blur-xl shadow-[0_18px_50px_rgba(0,0,0,0.65)] flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-border-subtle bg-bg-surface-elevated/20 shrink-0">
                            <div className="text-sm font-medium text-text-secondary flex items-center gap-2">
                                <LayoutDashboard size={18} />
                                Secure Video Call
                            </div>
                            <span className="text-[11px] text-text-muted">
                                Room: {roomCode || 'Demo'}
                            </span>
                        </div>
                        <div className="flex-1 relative">
                            <iframe
                                allow="camera; microphone; fullscreen; display-capture; autoplay"
                                src={`https://meet.jit.si/${roomName}`}
                                title="Jitsi Video Call"
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    width: '100%',
                                    height: '100%',
                                    border: 'none',
                                    borderRadius: '0 0 1rem 1rem',
                                }}
                            />
                        </div>
                    </div>
                    <Card className="flex-[1] w-full max-w-[420px] flex flex-col overflow-hidden bg-[#020617]/90 backdrop-blur-xl border-border-subtle/60 shadow-[0_18px_50px_rgba(0,0,0,0.65)]">
                        <CardHeader className="py-3 px-4 border-b border-border-subtle bg-bg-surface-elevated/20 shrink-0">
                            <CardTitle className="text-sm font-medium text-text-secondary">
                                Discussion Chat
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 bg-bg-base/40 relative min-h-[200px]">
                            {messages.length === 0 ? (
                                <div className="text-center text-text-muted mt-10 text-sm">
                                    No messages yet. Start the conversation.
                                </div>
                            ) : (
                                messages.map((m, i) => (
                                    <div
                                        key={i}
                                        className={`flex flex-col ${m.sender === username ? 'items-end' : 'items-start'
                                            }`}
                                    >
                                        <div className="flex items-baseline gap-2 mb-1">
                                            <span className="text-xs font-semibold text-text-primary">{m.sender}</span>
                                            <span className="text-[10px] text-text-muted">{m.time}</span>
                                        </div>
                                        <div
                                            className={`px-3 py-2 rounded-lg text-sm max-w-[85%] ${m.sender === username
                                                    ? 'bg-brand-primary text-white rounded-br-none shadow-sm'
                                                    : 'bg-bg-surface-elevated/80 border border-border-subtle text-text-primary rounded-bl-none shadow-sm'
                                                }`}
                                        >
                                            {m.text}
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </CardContent>

                        <div className="p-3 border-t border-border-subtle bg-[#020617]/90 shrink-0">
                            <form onSubmit={sendMessage} className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 px-3 py-2 text-sm rounded-md bg-bg-base/80 border border-border-subtle focus:border-brand-primary outline-none transition-colors text-text-primary"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim()}
                                    className="bg-brand-primary text-white p-2 rounded-md hover:bg-brand-accent disabled:opacity-50 transition-colors shadow-sm flex items-center justify-center"
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};