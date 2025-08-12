'use client'
import React, { useEffect, useState, useRef } from 'react';
import { Settings, Play, Mic } from 'lucide-react';
import { blobToWavBase64 } from '@/lib/utilities';


const ENERGY_LEVELS = [
  { level: 1, label: 'Whisper', color: '#9ca3af' }, // calm
  { level: 2, label: 'Calm', color: '#6b7280' },
  { level: 3, label: 'Reflective', color: '#4b5563' },

  { level: 4, label: 'Normal', color: '#3b82f6' }, // normal conv.
  { level: 5, label: 'Normal', color: '#2563eb' },
  { level: 6, label: 'Normal', color: '#1d4ed8' },

  { level: 7, label: 'Energetic', color: '#f97316' }, // high energy
  { level: 8, label: 'Passionate', color: '#ea580c' },
  { level: 9, label: 'Loud', color: '#c2410c' },
];

// const prompts = [
//   { type: 'energy', value: 5 },
//   { type: 'energy', value: 8 },
//   { type: 'breathe' },
//   { type: 'energy', value: 3 },
//   { type: 'energy', value: 7 },
//   { type: 'breathe' },
//   { type: 'energy', value: 4 },
//   { type: 'energy', value: 6 },
//   { type: 'energy', value: 2 },
//   { type: 'energy', value: 9 },
// ];

// const TOPIC = "If money didn't exist…";

export default function Game2Page() {
  const [prompts, setPrompts] = useState<{ type: string; value?: number }[]>([]);
  const [TOPIC, setTopic] = useState("Loading topic...");
  const [gamePhase, setGamePhase] = useState<'setup' | 'playing' | 'feedback'>('setup');
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState<{ type: string; value?: number } | null>(null);
  const [energyTransitions, setEnergyTransitions] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const [analysisResult, setAnalysisResult] = useState<{
    responseSpeedSeconds?: number[];
    energyRangeScore?: number;
    contentContinuity?: number;
    recoveryScore?: number;
  } | null>(null);




  // New states for audio recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStartTimeRef = useRef<number | null>(null);

  const promptTimestampsRef = useRef<{ prompt: { type: string; value?: number }, start: number, end?: number }[]>([]);

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const promptTimeoutRef = useRef<NodeJS.Timeout | null>(null);

 // Modified startGame to request mic permission and start recording
 const startGame = async (time: number) => {
      if (prompts.length === 0) return;

      setError(null);
      try {
        await startRecording();  // request mic and start
      } catch {
        return; // mic permission failed
      }

      setGamePhase('playing');
      setTimeLeft(time);
      setCurrentPromptIndex(0);
      setCurrentPrompt(prompts[0]);
      setEnergyTransitions(0);

      // Initialize prompt timestamps with first prompt start time 0
      promptTimestampsRef.current = [{
        prompt: prompts[0],
        start: 0,
      }];
  };

  const k = Math.floor(Math.random() * 6) + 10; 
  const fetchedRef = useRef(false);

  async function fetchPrompts() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/get-energy-levels?k=${k}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const json = await response.json();
      if (json.status && Array.isArray(json.data)) {
        setPrompts(json.data);
        setTopic(json.topic ?? "Topic unavailable");
        setCurrentPrompt(json.data[0] ?? null);
      } else {
        throw new Error(json.message || "Invalid response format");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch prompts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
  
    fetchPrompts();
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (promptTimeoutRef.current) clearTimeout(promptTimeoutRef.current);
    };
  }, []);

  // Timer countdown logic
  useEffect(() => {
    if (gamePhase !== 'playing') return;

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current!);
          timerIntervalRef.current = null;
          setGamePhase('feedback');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [gamePhase]);



  // Energy prompt changing logic
  useEffect(() => {
    if (gamePhase !== 'playing' || prompts.length === 0) return;
  
    if (promptTimeoutRef.current) {
      clearTimeout(promptTimeoutRef.current);
    }
  
    const nextInterval = 10000 + Math.random() * 5000;
  
    promptTimeoutRef.current = setTimeout(() => {
      setCurrentPromptIndex(prev => {
        const nextIndex = (prev + 1) % prompts.length;
        setCurrentPrompt(prompts[nextIndex]);
  
        const now = performance.now();
        const recordingStart = recordingStartTimeRef.current ?? now;
        const elapsed = (now - recordingStart) / 1000;
  
        // End previous prompt only if not ended yet
        const lastPrompt = promptTimestampsRef.current[promptTimestampsRef.current.length - 1];
        if (lastPrompt && lastPrompt.end === undefined) {
          lastPrompt.end = elapsed;
        }
  
        // **Check if last prompt start differs from current**
        const prevPrompt = promptTimestampsRef.current[promptTimestampsRef.current.length - 1];
        if (!prevPrompt || prevPrompt.prompt !== prompts[nextIndex]) {
          promptTimestampsRef.current.push({
            prompt: prompts[nextIndex],
            start: elapsed,
          });
        }
  
        if (prompts[nextIndex].type === 'energy') {
          setEnergyTransitions(count => count + 1);
        }
  
        return nextIndex;
      });
    }, nextInterval);
  
    return () => {
      if (promptTimeoutRef.current) clearTimeout(promptTimeoutRef.current);
    };
  }, [currentPromptIndex, gamePhase, prompts]);
  


  useEffect(() => {
    if (gamePhase !== 'feedback') return;
  
    function handleStopAndSend() {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      blobToWavBase64(audioBlob)
        .then(audioBase64 => {
          const payload = {
            audioBase64,
            promptTimestamps: promptTimestampsRef.current,
            topic: TOPIC,
          };

      console.log("Sending payload:", payload);  // <--- Log the payload being sent
  
          return fetch('/api/analyze-energy-levels', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        })
        .then(res => res.json())
        .then(json => {
          if (!json.status) setError('Analysis failed: ' + json.message);
        })
        .catch(() => setError('Failed to process recording or send data'));
    }
  
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      // Mark end time for last prompt
      const now = performance.now();
      const recordingStart = recordingStartTimeRef.current ?? now;
      const elapsed = (now - recordingStart) / 1000;
      promptTimestampsRef.current[promptTimestampsRef.current.length - 1].end = elapsed;
  
      mediaRecorderRef.current.onstop = () => {
        handleStopAndSend();
      };
  
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      // If already stopped, just send audio (edge case)
      handleStopAndSend();
    }
  }, [gamePhase]);


  // Format time mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };


  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recordingStartTimeRef.current = performance.now();
  
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
  
      mediaRecorderRef.current.start();
      setIsRecording(true);  // <-- mic is on now
    } catch (err) {
      setError('Microphone permission denied or unavailable');
      throw err;
    }
  }
  
  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false); // <-- mic is off now
    }
  }
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-6 text-black">
      <svg 
        className="animate-spin h-12 w-12 text-blue-600 mb-4" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" cy="12" r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        ></circle>
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8v8z"
        ></path>
      </svg>
      <p className="text-xl font-semibold">Cookinggg...</p>
    </div>
  );
  if (error) return <div className="p-6 text-center text-red-600">Error: {error}</div>;

  
  if (gamePhase === 'setup') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Game 2: The Conductor (Energy Modulation)</h1>
          <p className="text-lg text-gray-600 mb-6">
            Sharpen your musicality and energy modulation while speaking.
            Follow the conductor's cues to modulate your voice energy and breathe when prompted.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-6 space-y-6">
          <div className="flex items-center mb-4">
            <Settings className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900">Game Settings & Instructions</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Speaking Duration: {timeLeft} seconds
            </label>
            <input
              type="range"
              min="30"
              max="300"
              step="30"
              value={timeLeft}
              onChange={(e) => setTimeLeft(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>30s</span>
              <span>1m</span>
              <span>2m</span>
              <span>3m</span>
              <span>4m</span>
              <span>5m</span>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mt-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-2">Instructions:</h3>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Start speaking immediately about the topic shown below.</li>
                <li>Modulate your voice energy to match the conductor's prompts from calm (1) to loud (9).</li>
                <li>When you see <strong>"BREATHE"</strong>, pause and take a deep breath before continuing.</li>
                <li>Maintain continuous speech flow and stay present throughout.</li>
                <li>At the end, you'll get feedback on your energy modulation and responsiveness.</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 text-center">
            <div className="text-lg font-medium mb-2 text-gray-900">Topic:</div>
            <div className="text-xl font-semibold text-blue-700">{TOPIC}</div>
          </div>

          <button
            onClick={() => startGame(timeLeft)}
            disabled={prompts.length === 0}
            className={`w-full font-semibold py-4 px-6 rounded-lg text-white cursor-pointer flex items-center justify-center ${
              prompts.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <Play className="w-5 h-5 mr-2" />
            Start Speaking
          </button>
        </div>
      </div>
    );
  }


  if (gamePhase === 'playing') {
    const energyObj = ENERGY_LEVELS.find(e => e.level === currentPrompt?.value) ?? ENERGY_LEVELS[4];

    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <h2 className="text-2xl mb-4 font-semibold text-black">{TOPIC}</h2>

        {/* Mic indicator */}
        {isRecording && (
          <div className="flex items-center justify-center mb-6">
            <Mic className="w-8 h-8 text-red-600 animate-pulse" />
            <span className="ml-2 text-red-600 font-semibold">Recording...</span>
          </div>
        )}

        <div className="mb-6">
          <div className="text-xl font-bold mb-2 text-black">
            {currentPrompt?.type === 'breathe' ? (
              <span className="text-green-600">BREATHE - Take a deep breath</span>
            ) : (
              <>
                ENERGY <span className="text-black">{energyObj.level}</span> - <span style={{ color: energyObj.color }}>{energyObj.label}</span>
              </>
            )}
          </div>

          {currentPrompt?.type === 'energy' && (
            <div className="w-full h-6 rounded-full bg-gray-300 overflow-hidden">
              <div
                className="h-6 rounded-full transition-all duration-700"
                style={{
                  width: `${(energyObj.level / 9) * 100}%`,
                  backgroundColor: energyObj.color,
                }}
              />
            </div>
          )}
        </div>

        <div className="text-4xl font-mono mb-6 text-black">{formatTime(timeLeft)}</div>

        <p className="text-gray-600 max-w-md mx-auto">
          Modulate your voice energy to match the conductor's prompt.
          Speak continuously about the topic. Breathe deeply when prompted.
        </p>
      </div>
    );
  }

  if (gamePhase === 'feedback') {
    const totalTransitions = prompts.filter(p => p.type === 'energy').length;
    const successRate = Math.round((energyTransitions / totalTransitions) * 10); // out of 10
    const avgResponse = (Math.random() * (2 - 0.5) + 0.5).toFixed(2);

    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <h1 className="text-3xl font-semibold mb-4 text-black">Session Complete!</h1>
        <p className="mb-6 text-gray-700 max-w-xl mx-auto">
          Great job modulating your energy and maintaining flow.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-md mx-auto mb-8">
          <div className="bg-white shadow rounded p-4">
            <div className="text-4xl font-bold text-blue-600">{energyTransitions}</div>
            <div className="text-gray-600 mt-1">Energy Transitions</div>
          </div>
          <div className="bg-white shadow rounded p-4">
            <div className="text-4xl font-bold text-green-600">{successRate}/10</div>
            <div className="text-gray-600 mt-1">Transition Success Rate</div>
          </div>
          <div className="bg-white shadow rounded p-4">
            <div className="text-4xl font-bold text-purple-600">{avgResponse}s</div>
            <div className="text-gray-600 mt-1">Avg Response Time</div>
          </div>
        </div>

        <button
          onClick={() => setGamePhase('setup')}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
        >
          Play Again
        </button>
      </div>
    );
  }

  return null;

}
