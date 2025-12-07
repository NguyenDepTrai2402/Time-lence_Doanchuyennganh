import React, { useState, useEffect, useRef } from 'react';
import { AlertOctagon, AlertTriangle, AlertCircle, Zap, MessageCircle, Clock, Send, Calendar, MapPin } from 'lucide-react';
import { aiApi } from '../services/api';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function AIAssistant() {
    const [tab, setTab] = useState('priority'); // 'priority' | 'schedule' | 'chat'
    const [events, setEvents] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const [isSending, setIsSending] = useState(false);
    const chatEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    useEffect(() => {
        loadData();
    }, []);

    // Real-time updates - refetch data every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (tab === 'priority' || tab === 'schedule') {
                loadData();
            }
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [tab]);

    // Auto scroll to bottom when new message
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages]);

    const loadData = async () => {
        try {
            setLoading(true);
            console.log('📊 Loading data...');
            
            const data = await aiApi.analyzePriority();
            console.log('Priority data:', data);
            setEvents(data.events || []);
            
            const freeTime = await aiApi.findFreeTime(60);
            console.log('Free time data:', freeTime);
            console.log('Suggestions array:', freeTime.suggestions);
            
            // Đảm bảo suggestions là một mảng
            const suggestionsData = Array.isArray(freeTime.suggestions) ? freeTime.suggestions : [];
            setSuggestions(suggestionsData);
        } catch (err) {
            console.error('❌ Error loading data:', err);
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    // Format markdown-like text to JSX
    const formatMessage = (text) => {
        if (!text) return text;
        
        // Split by newlines
        const lines = text.split('\n');
        return lines.map((line, index) => {
            // Bold text **text**
            const boldRegex = /\*\*(.*?)\*\*/g;
            let formattedLine = line;
            const parts = [];
            let lastIndex = 0;
            let match;
            
            while ((match = boldRegex.exec(line)) !== null) {
                if (match.index > lastIndex) {
                    parts.push({ type: 'text', content: line.substring(lastIndex, match.index) });
                }
                parts.push({ type: 'bold', content: match[1] });
                lastIndex = match.index + match[0].length;
            }
            if (lastIndex < line.length) {
                parts.push({ type: 'text', content: line.substring(lastIndex) });
            }
            
            if (parts.length === 0) {
                parts.push({ type: 'text', content: line });
            }
            
            return (
                <div key={index} className="mb-1">
                    {parts.map((part, partIndex) => 
                        part.type === 'bold' ? (
                            <strong key={partIndex} className="font-semibold">{part.content}</strong>
                        ) : (
                            <span key={partIndex}>{part.content}</span>
                        )
                    )}
                </div>
            );
        });
    };

    // Render structured data
    const renderStructuredData = (data) => {
        if (!data) return null;

        if (data.type === 'events_list' && data.events && data.events.length > 0) {
            return (
                <div className="mt-4 space-y-2">
                    {data.events.map((event, index) => (
                        <Card key={index} className="bg-white/80 backdrop-blur-sm">
                            <CardContent className="p-3">
                                <div className="flex items-start gap-3">
                                    <div 
                                        className="w-1 h-full rounded-full flex-shrink-0"
                                        style={{ backgroundColor: event.category_color || '#3B82F6' }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-secondary-800">{event.title}</h4>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-secondary-600">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {format(new Date(event.start_time), 'HH:mm', { locale: vi })} - {format(new Date(event.end_time), 'HH:mm', { locale: vi })}
                                            </span>
                                            {event.location && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {event.location}
                                                </span>
                                            )}
                                        </div>
                                        {event.description && (
                                            <p className="text-sm text-secondary-500 mt-1">{event.description}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            );
        }

        if (data.type === 'free_days' && data.suggestions) {
            return (
                <div className="mt-4 space-y-2">
                    {data.suggestions.slice(0, 3).map((suggestion, index) => {
                        const startTime = new Date(suggestion.recommendedTime.start).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'});
                        const endTime = new Date(suggestion.recommendedTime.end).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'});
                        return (
                            <Card key={index} className="bg-green-50/80 border-green-200">
                                <CardContent className="p-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-semibold text-green-900">{suggestion.day}</h4>
                                            <p className="text-sm text-green-700">{suggestion.date}</p>
                                            <p className="text-xs text-green-600 mt-1">⏰ {startTime} - {endTime}</p>
                                        </div>
                                        <span className="text-xs bg-green-200 text-green-900 px-2 py-1 rounded-full">
                                            {suggestion.availableSlots.length} slot
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            );
        }

        return null;
    };

    const handleQuickQuestion = async (question) => {
        if (isSending) return;

        const userMsg = { type: 'user', text: question };
        setChatMessages(prev => [...prev, userMsg]);
        setIsSending(true);

        try {
            console.log('Sending message:', question);
            const response = await aiApi.chat(question);
            console.log('Response:', response);
            
            setChatMessages(prev => [...prev, { 
                type: 'ai', 
                text: response.answer || 'Không có phản hồi',
                data: response.data || null
            }]);
        } catch (err) {
            console.error('Chat Error:', err);
            setChatMessages(prev => [...prev, { 
                type: 'ai', 
                text: '❌ Lỗi: ' + (err.response?.data?.message || err.message),
                data: null
            }]);
        } finally {
            setIsSending(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim() || isSending) return;

        await handleQuickQuestion(message);
        setMessage('');
    };

    if (loading) {
        return <div className="p-6 text-center">Đang phân tích...</div>;
    }

    // Main tabs view
    return (
        <div className="space-y-6 -mt-4" style={{ paddingTop: '3.5rem' }}>
            {/* Header with quick action */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    AI Assistant
                </h1>
                {tab === 'chat' && (
                    <Button
                        onClick={() => handleQuickQuestion('Ngày nào rảnh để xếp lịch?')}
                        disabled={isSending}
                        className="whitespace-nowrap"
                    >
                        <Calendar className="h-4 w-4 mr-2" />
                        Ngày nào rảnh để xếp lịch
                    </Button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-white/20 bg-white/60 backdrop-blur-sm rounded-t-lg p-2">
                <button
                    onClick={() => setTab('priority')}
                    className={`px-4 py-2 font-medium rounded-lg transition-all ${
                        tab === 'priority'
                            ? 'bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg'
                            : 'text-secondary-600 hover:bg-white/50'
                    }`}
                >
                    ⚡ Ưu tiên
                </button>
                <button
                    onClick={() => setTab('schedule')}
                    className={`px-4 py-2 font-medium rounded-lg transition-all ${
                        tab === 'schedule'
                            ? 'bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg'
                            : 'text-secondary-600 hover:bg-white/50'
                    }`}
                >
                    📅 Xếp lịch
                </button>
                <button
                    onClick={() => setTab('chat')}
                    className={`px-4 py-2 font-medium rounded-lg transition-all ${
                        tab === 'chat'
                            ? 'bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg'
                            : 'text-secondary-600 hover:bg-white/50'
                    }`}
                >
                    💬 Hỏi AI
                </button>
            </div>

            {/* Tab Content */}
            {tab === 'priority' && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Zap className="w-6 h-6 text-amber-500" /> Ưu tiên hôm nay
                    </h2>
                    {(() => {
                        const critical = events.filter(e => e.level === 'critical');
                        const high = events.filter(e => e.level === 'high');
                        const medium = events.filter(e => e.level === 'medium');
                        
                        return (
                            <>
                                {critical.length > 0 && (
                                    <div>
                                        <h3 className="font-bold text-red-700 mb-2">🔴 CÓ NGAY ({critical.length})</h3>
                                        {critical.map(e => (
                                            <div key={e.id} className="bg-red-50 border border-red-200 rounded-lg p-4 mb-2">
                                                <h4 className="font-semibold">{e.title}</h4>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {new Date(e.start_time).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}
                                                    {e.location && ` • ${e.location}`}
                                                </p>
                                                <span className="text-sm font-bold text-red-600">{e.total} điểm</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                {high.length > 0 && (
                                    <div>
                                        <h3 className="font-bold text-orange-700 mb-2">🟠 QUAN TRỌNG ({high.length})</h3>
                                        {high.map(e => (
                                            <div key={e.id} className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-2">
                                                <h4 className="font-semibold">{e.title}</h4>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {new Date(e.start_time).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}
                                                    {e.location && ` • ${e.location}`}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {medium.length > 0 && (
                                    <div>
                                        <h3 className="font-bold text-yellow-700 mb-2">🟡 BÌNH THƯỜNG ({medium.length})</h3>
                                        {medium.map(e => (
                                            <div key={e.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-2">
                                                <h4 className="font-semibold">{e.title}</h4>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {new Date(e.start_time).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {critical.length === 0 && high.length === 0 && medium.length === 0 && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                                        <p className="text-blue-700">Hôm nay bạn không có sự kiện quan trọng nào</p>
                                    </div>
                                )}
                            </>
                        );
                    })()}
                </div>
            )}

            {tab === 'schedule' && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Clock className="w-6 h-6 text-blue-500" /> Gợi ý xếp lịch
                    </h2>
                    {!suggestions || suggestions.length === 0 ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                            <p className="text-yellow-700 font-semibold">⚠️ Không tìm thấy slot thời gian rảnh</p>
                            <p className="text-sm text-yellow-600 mt-2">Bạn rất bận trong 7 ngày tới!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {suggestions.map((sugg, idx) => {
                                const startTime = sugg.recommendedTime?.start ? new Date(sugg.recommendedTime.start).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'}) : 'N/A';
                                const endTime = sugg.recommendedTime?.end ? new Date(sugg.recommendedTime.end).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'}) : 'N/A';
                                
                                return (
                                    <div key={idx} className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-green-900 text-lg">{sugg.day}</h3>
                                                <p className="text-sm text-green-700">{sugg.date}</p>
                                            </div>
                                            <span className="bg-green-200 text-green-900 px-3 py-1 rounded-full text-sm font-semibold">
                                                Tốt nhất
                                            </span>
                                        </div>
                                        <div className="mt-4 p-3 bg-white rounded border border-green-300">
                                            <p className="text-green-800 font-semibold">⏰ {startTime} - {endTime}</p>
                                            <p className="text-sm text-green-700 mt-1">
                                                {sugg.availableSlots?.length || 0} slot rảnh trong ngày
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {tab === 'chat' && (
                <div className="flex flex-col bg-white rounded-lg border border-white/20 shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 12rem)' }}>
                    <div 
                        ref={chatContainerRef}
                        className="flex-1 p-6 overflow-y-auto space-y-4 bg-gradient-to-b from-purple-50/30 via-blue-50/30 to-indigo-50/30"
                    >
                        {chatMessages.length === 0 ? (
                            <div className="text-center text-secondary-500 py-12">
                                <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 mb-4">
                                    <MessageCircle className="w-12 h-12 text-primary" />
                                </div>
                                <p className="font-semibold mb-4 text-lg text-secondary-800">Hỏi AI về lịch biểu của bạn</p>
                                <div className="space-y-3 text-sm max-w-md mx-auto">
                                    <Card className="bg-white/80 backdrop-blur-sm cursor-pointer hover:shadow-md transition-all hover:scale-105" onClick={() => {
                                        const question = 'Ngày nào rảnh để xếp lịch?';
                                        handleQuickQuestion(question);
                                    }}>
                                        <CardContent className="p-3">
                                            <p className="text-secondary-700 font-medium">📅 "Ngày nào rảnh để xếp lịch?"</p>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-white/80 backdrop-blur-sm cursor-pointer hover:shadow-md transition-all hover:scale-105" onClick={() => {
                                        const question = 'Liệt kê chi tiết các sự kiện hôm nay';
                                        handleQuickQuestion(question);
                                    }}>
                                        <CardContent className="p-3">
                                            <p className="text-secondary-700 font-medium">📋 "Liệt kê chi tiết các sự kiện hôm nay"</p>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-white/80 backdrop-blur-sm cursor-pointer hover:shadow-md transition-all hover:scale-105" onClick={() => {
                                        const question = 'Hôm nay bận không?';
                                        handleQuickQuestion(question);
                                    }}>
                                        <CardContent className="p-3">
                                            <p className="text-secondary-700 font-medium">⏰ "Hôm nay bận không?"</p>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-white/80 backdrop-blur-sm cursor-pointer hover:shadow-md transition-all hover:scale-105" onClick={() => {
                                        const question = 'Sự kiện nào quan trọng?';
                                        handleQuickQuestion(question);
                                    }}>
                                        <CardContent className="p-3">
                                            <p className="text-secondary-700 font-medium">🎯 "Sự kiện nào quan trọng?"</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        ) : (
                            <>
                                {chatMessages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-2xl ${msg.type === 'user' ? 'bg-gradient-to-r from-primary to-purple-600 text-white rounded-2xl rounded-br-md px-4 py-3' : 'bg-white/90 backdrop-blur-sm text-secondary-800 rounded-2xl rounded-bl-md px-4 py-3 shadow-md border border-white/20'}`}>
                                            <div className="space-y-1">
                                                {formatMessage(msg.text)}
                                                {msg.data && renderStructuredData(msg.data)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={chatEndRef} />
                            </>
                        )}
                    </div>

                    <div className="p-4 border-t border-white/20 bg-white/80 backdrop-blur-sm">
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <Input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Hỏi AI về lịch biểu của bạn..."
                                className="flex-1"
                                disabled={isSending}
                            />
                            <Button
                                type="submit"
                                disabled={!message.trim() || isSending}
                                isLoading={isSending}
                            >
                                <Send className="h-4 w-4 mr-2" />
                                Gửi
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
