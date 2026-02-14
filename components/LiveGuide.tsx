import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const LiveGuide: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const sessionRef = useRef<any>(null);
  const audioContextInRef = useRef<AudioContext | null>(null);
  const audioContextOutRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());

  const startSession = async () => {
    setIsConnecting(true);
    
    // Safely retrieve the API key
    const apiKey = (window as any).process?.env?.API_KEY || (typeof process !== 'undefined' ? process.env.API_KEY : '');
    const ai = new GoogleGenAI({ apiKey: apiKey || '' });

    try {
      if (!audioContextInRef.current) {
        audioContextInRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      }
      if (!audioContextOutRef.current) {
        audioContextOutRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);

            const source = audioContextInRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextInRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob: Blob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextInRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setTranscript(prev => [...prev.slice(-4), `Zyro: ${message.serverContent?.outputTranscription?.text}`]);
            }
            if (message.serverContent?.inputTranscription) {
              setTranscript(prev => [...prev.slice(-4), `You: ${message.serverContent?.inputTranscription?.text}`]);
            }

            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && audioContextOutRef.current) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContextOutRef.current.currentTime);
              const buffer = await decodeAudioData(decode(base64Audio), audioContextOutRef.current, 24000, 1);
              const source = audioContextOutRef.current.createBufferSource();
              source.buffer = buffer;
              source.connect(audioContextOutRef.current.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => {
                try { s.stop(); } catch(e) {}
              });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Live Guide Error:', e);
            stopSession();
          },
          onclose: () => {
            setIsActive(false);
            setIsConnecting(false);
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: 'You are Zyro, an expert Indian travel guide. Speak in a warm, welcoming tone. Help users with travel suggestions, historical context, and local etiquette.',
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } }
          }
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error('Failed to start session', err);
      setIsConnecting(false);
      setIsActive(false);
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      try { sessionRef.current.close(); } catch(e) {}
      sessionRef.current = null;
    }
    setIsActive(false);
    setIsConnecting(false);
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-slate-900/60 backdrop-blur-2xl rounded-[50px] border border-white/5 shadow-2xl max-w-2xl w-full">
      <div className={`w-44 h-44 rounded-full mb-10 flex items-center justify-center relative transition-all duration-700 ${isActive ? 'bg-blue-600/20 scale-110' : 'bg-slate-800 shadow-inner'}`}>
        {isActive && (
          <>
            <div className="absolute inset-0 rounded-full animate-ping bg-blue-500/20"></div>
            <div className="absolute -inset-4 rounded-full animate-pulse bg-gradient-to-tr from-blue-500/10 via-purple-500/10 to-pink-500/10"></div>
            <div className="flex space-x-1 items-center justify-center h-full">
               {[1,2,3,4,5].map(i => (
                 <div key={i} className="w-1.5 bg-blue-400 rounded-full animate-bounce" style={{height: `${20 + Math.random() * 40}px`, animationDelay: `${i * 0.1}s`}}></div>
               ))}
            </div>
          </>
        )}
        {!isActive && (
          <i className="fas fa-microphone-slash text-6xl text-slate-700"></i>
        )}
      </div>

      <div className="mb-12">
        <h2 className="text-3xl font-black mb-3 text-white tracking-tight">Vocal Core</h2>
        <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">
          {isActive ? 'System is active and listening' : 'Connect to establish voice link'}
        </p>
      </div>

      {isActive ? (
        <button 
          onClick={stopSession}
          className="bg-white hover:bg-red-50 text-red-600 px-14 py-6 rounded-[28px] font-black transition-all flex items-center space-x-4 shadow-2xl active:scale-95"
        >
          <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
          <span className="text-lg">Close Comm-link</span>
        </button>
      ) : (
        <button 
          onClick={startSession}
          disabled={isConnecting}
          className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 hover:scale-[1.02] active:scale-95 disabled:grayscale text-white px-14 py-6 rounded-[28px] font-black transition-all shadow-[0_20px_40px_rgba(79,70,229,0.3)] flex items-center space-x-4"
        >
          {isConnecting ? (
            <i className="fas fa-circle-notch animate-spin text-2xl"></i>
          ) : (
            <>
              <i className="fas fa-compass text-xl"></i>
              <span className="text-lg">Initiate AI Voice</span>
            </>
          )}
        </button>
      )}

      {transcript.length > 0 && (
        <div className="mt-12 w-full bg-black/40 p-8 rounded-[32px] border border-white/5 text-left shadow-inner max-h-64 overflow-y-auto custom-scrollbar">
          {transcript.map((line, i) => (
            <div key={i} className={`mb-6 flex flex-col ${line.startsWith('You:') ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[85%] px-6 py-4 rounded-2xl ${line.startsWith('You:') ? 'bg-blue-600/20 text-blue-100 rounded-br-none' : 'bg-slate-800/40 text-slate-200 rounded-bl-none border border-white/5'}`}>
                 <span className="block text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">{line.split(':')[0]}</span>
                 <p className="font-medium">{line.split(':').slice(1).join(':').trim()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveGuide;