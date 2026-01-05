
import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, StopCircle, RefreshCw, Volume2, VolumeX, PlayCircle } from 'lucide-react';
import { ChatMessage, OperationalEvent, UserRole, Shift } from '../types';
import { createChatSession, sendMessageStream } from '../services/geminiService';
import { Chat } from "@google/genai";

interface AssistantProps {
  events: OperationalEvent[];
  currentRole: UserRole;
  currentShift: Shift | null;
}

export const Assistant: React.FC<AssistantProps> = ({ events, currentRole, currentShift }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false); // "Headset Mode"
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Refs
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const synthesisRef = useRef<SpeechSynthesis>(window.speechSynthesis);

  // --- TTS ENGINE ---
  const speakText = (text: string) => {
    if (!synthesisRef.current) return;
    
    // Stop current speech
    synthesisRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Voice Config - Prefer English to match the "Restaurant Veteran" persona
    const voices = synthesisRef.current.getVoices();
    const voice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) || voices.find(v => v.lang.startsWith('en'));
    if (voice) utterance.voice = voice;

    utterance.lang = 'en-US';
    utterance.pitch = 1;
    utterance.rate = 1.15; // Slightly faster for "Kitchen Pace"

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthesisRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    synthesisRef.current?.cancel();
    setIsSpeaking(false);
  };

  // --- LIFECYCLE ---

  // Init Session
  useEffect(() => {
    const shiftStatus = currentShift?.status || 'undefined';
    chatSessionRef.current = createChatSession(currentRole, shiftStatus);

    const initText = `Chief of Staff online. Role: ${currentRole}. Service: ${shiftStatus === 'active' ? 'LIVE' : 'OFFLINE'}.`;
    
    setMessages([
      {
        id: 'init-1',
        role: 'model',
        text: initText,
        timestamp: Date.now()
      }
    ]);
  }, [currentRole, currentShift?.status]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load voices async (Chrome fix)
  useEffect(() => {
    const loadVoices = () => {
      synthesisRef.current.getVoices();
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || !chatSessionRef.current || isLoading) return;

    // Stop previous speech if any
    stopSpeaking();

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const modelMsgId = (Date.now() + 1).toString();
    // Placeholder for streaming
    setMessages(prev => [...prev, {
      id: modelMsgId,
      role: 'model',
      text: '',
      timestamp: Date.now(),
      isStreaming: true
    }]);

    try {
      let fullResponseBuffer = '';
      const recentEvents = events.slice(-10);

      await sendMessageStream(
        chatSessionRef.current, 
        currentRole, // Pass role to match service signature
        userMsg.text, 
        recentEvents,
        (chunk) => {
          fullResponseBuffer += chunk;
          setMessages(prev => prev.map(msg => 
            msg.id === modelMsgId 
              ? { ...msg, text: msg.text + chunk }
              : msg
          ));
        }
      );

      // Once stream is done, if AutoSpeak is ON, read it all
      if (autoSpeak) {
        speakText(fullResponseBuffer);
      }

    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === modelMsgId 
          ? { ...msg, text: "Neural core connection error." }
          : msg
      ));
    } finally {
      setMessages(prev => prev.map(msg => 
        msg.id === modelMsgId 
          ? { ...msg, isStreaming: false }
          : msg
      ));
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-xl relative">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            {isSpeaking && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
              </span>
            )}
          </div>
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white text-sm">Neural Core</h2>
            <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider flex items-center gap-1">
              {currentRole} • {currentShift?.status === 'active' ? 'ON AIR' : 'OFF'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
           {/* Auto-Speak Toggle */}
           <button 
             onClick={() => {
               if (isSpeaking) stopSpeaking();
               setAutoSpeak(!autoSpeak);
             }}
             className={`p-2 rounded-lg transition-all ${autoSpeak ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
             title={autoSpeak ? "Headset Mode ON" : "Silent Mode"}
           >
             {autoSpeak ? <Volume2 size={18} /> : <VolumeX size={18} />}
           </button>

           <button 
             onClick={() => {
                const shiftStatus = currentShift?.status || 'undefined';
                chatSessionRef.current = createChatSession(currentRole, shiftStatus);
                stopSpeaking();
                setMessages(prev => [...prev, {id: Date.now().toString(), role: 'model', text: 'Memory buffer reset.', timestamp: Date.now()}]);
             }}
             className="p-2 text-slate-400 hover:text-indigo-500 transition-colors"
             title="Reset Context"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm
              ${msg.role === 'user' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-indigo-600 text-white'}
            `}>
              {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            
            <div className={`group relative max-w-[85%]`}>
               <div className={`
                 p-4 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap
                 ${msg.role === 'user' 
                   ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 rounded-tr-none' 
                   : 'bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-none'}
               `}>
                 {msg.text}
                 {msg.isStreaming && <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-indigo-500 animate-pulse"/>}
               </div>
               
               {/* Play Button per message (Model only) */}
               {msg.role === 'model' && !msg.isStreaming && (
                 <button 
                   onClick={() => speakText(msg.text)}
                   className="absolute -right-8 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-indigo-500"
                   title="Play message"
                 >
                   <PlayCircle size={16} />
                 </button>
               )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white/80 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 backdrop-blur-md">
        <div className="flex gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`Orders for ${currentRole}...`}
            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm font-medium"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20"
          >
            {isLoading ? <StopCircle size={18} className="animate-pulse"/> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};
