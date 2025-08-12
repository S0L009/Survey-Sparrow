'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Settings } from 'lucide-react';
import { blobToWavBase64 } from '@/lib/utilities';
// const ANALOGIES = [
//   "Business is like",
//   "Success is like", 
//   "Love is like",
//   "Life is like",
//   "Learning is like",
//   "Friendship is like",
//   "Time is like",
//   "Dreams are like",
//   "Failure is like",
//   "Technology is like",
//   "Money is like",
//   "Creativity is like",
//   "Leadership is like",
//   "Change is like",
//   "Fear is like",
//   "Hope is like",
//   "Knowledge is like",
//   "Trust is like",
//   "Growth is like",
//   "Communication is like"
// ];

export default function Game1Page() {
  const [gamePhase, setGamePhase] = useState<'setup' | 'playing' | 'feedback'>('setup');
  const [currentRound, setCurrentRound] = useState(0);
  const [timerDuration, setTimerDuration] = useState(5);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameAnalogies, setGameAnalogies] = useState<string[]>([]);
  const [recordings, setRecordings] = useState<(Blob | null)[]>([]);
  const [micAccessGranted, setMicAccessGranted] = useState(false);
  const [permissionChecked, setPermissionChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Timer refs
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const nextRoundTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const roundActiveRef = useRef(false);

  // MediaRecorder refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const k = 5;

  const [loadingAnalogies, setLoadingAnalogies] = useState(true);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);


  const [analysisResults, setAnalysisResults] = useState<any[]>([]);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const loadingMessages = ["Analyzing…", "Cooking…", "Mixing ingredients…", "Almost ready…"];
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState(loadingMessages[0]);



  // Initialize analogies & recordings array

  async function fetchAnalogies() {
    try {
      setLoading(true);
      setError(null);
      setLoadingAnalogies(true);
      const res = await fetch(`/api/get-analogies?k=${k}`);
      const json = await res.json();

      if (json.status && Array.isArray(json.data)) {
        const shuffled = [...json.data].sort(() => Math.random() - 0.5);
        setGameAnalogies(shuffled);
        setRecordings(Array(shuffled.length).fill(null));
      } else {
        console.error("Invalid response:", json);
      }
    } catch (error) {
      console.error("Error fetching analogies:", error);
    } finally {
      setLoadingAnalogies(false);
    setLoading(false);

    }
  }

  useEffect(() => {
    fetchAnalogies();
  }, [k]);
  

  // Check mic permission once during setup
  useEffect(() => {
    if (permissionChecked) return;
    // Check permission status
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'microphone' as PermissionName }).then(result => {
        if (result.state === 'granted') {
          setMicAccessGranted(true);
        } else {
          setMicAccessGranted(false);
        }
        setPermissionChecked(true);
      }).catch(() => {
        // If permissions API not supported, fallback to request on start
        setPermissionChecked(true);
      });
    } else {
      setPermissionChecked(true);
    }
  }, [permissionChecked]);

  // Request mic access explicitly during setup if not granted
  const requestMicAccess = async () => {
    if (micAccessGranted) return true; // Already granted
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Keep stream active for media recorder later
      mediaStreamRef.current = stream;
      setMicAccessGranted(true);
      return true;
    } catch (e) {
      alert("Microphone access is required to play this game.");
      return false;
    }
  };

  // Start MediaRecorder for current round
  const startRecording = async (roundIndex: number) => {
    if (!micAccessGranted) {
      const granted = await requestMicAccess();
      if (!granted) {
        return;
      }
    }
  
    let stream = mediaStreamRef.current;
    if (!stream) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
      } catch (err) {
        alert("Could not access microphone: " + err);
        return;
      }
    }
  
    const options = { mimeType: 'audio/webm' };
    const mediaRecorder = new MediaRecorder(stream, options);
  
    mediaRecorderRef.current = mediaRecorder;
    recordedChunksRef.current = [];
  
    // Capture roundIndex locally to use inside the event handlers
    const capturedRoundIndex = roundIndex;
  
    mediaRecorder.ondataavailable = event => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };
  
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
      setRecordings(prev => {
        const newRec = [...prev];
        newRec[capturedRoundIndex] = blob;  // Save at correct index
        return newRec;
      });
    };
  
    mediaRecorder.start();
  };

  // Stop MediaRecorder for current round
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  // Start a round explicitly
  const startRound = (roundIndex: number) => {
    if (roundActiveRef.current) return; // prevent double start
    roundActiveRef.current = true;
  
    setCurrentRound(roundIndex);
    setTimeLeft(timerDuration);
  
    // Start recording audio for this round
    startRecording(roundIndex);  // <-- pass roundIndex here
  
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    if (nextRoundTimeoutRef.current) {
      clearTimeout(nextRoundTimeoutRef.current);
    }
  
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }
  
          // Stop recording for this round before moving on
          stopRecording();
  
          nextRoundTimeoutRef.current = setTimeout(() => {
            roundActiveRef.current = false;
            nextRoundTimeoutRef.current = null;
  
            if (roundIndex + 1 < gameAnalogies.length) {
              startRound(roundIndex + 1);  // start next round
            } else {
              setGamePhase('feedback');
            }
          }, 500);
  
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Start the game and first round
  const startGame = async () => {
    // Request mic permission during setup before game starts
    if (!micAccessGranted) {
      const granted = await requestMicAccess();
      if (!granted) return;
    }
    if (loadingAnalogies) {
      setShowLoadingScreen(true);
      return; // will auto-start when loading done
    }
    // if (gameAnalogies.length === 0) return;
    setGamePhase('playing');
    startRound(0);
  };


  // Send feedback data to backend
  async function sendFeedbackData() {
    setLoadingAnalysis(true);
  
    const dataList = [];
  
    for (let i = 0; i < recordings.length; i++) {
      const rec = recordings[i];
      if (rec) {
        const audioBase64 = await blobToWavBase64(rec);
        dataList.push({
          prompt: gameAnalogies[i],
          audio: audioBase64,  // base64 string here
        });
      }
    }
  
    try {
      const res = await fetch("/api/analyze-analogies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: dataList }),
      });
  
      const json = await res.json();
      if (json.status && Array.isArray(json.data)) {
        setAnalysisResults(json.data);
      } else {
        console.error("Invalid analysis response:", json.message);
      }
    } catch (err) {
      console.error("Error sending feedback:", err);
    } finally {
      setLoadingAnalysis(false);
    }
  }

  useEffect(() => {
    if (gamePhase === 'feedback') {
      sendFeedbackData();
    }
  }, [gamePhase]);


  useEffect(() => {
    if (loadingAnalysis) {
      let index = 0;
      const interval = setInterval(() => {
        index = (index + 1) % loadingMessages.length;
        setCurrentLoadingMessage(loadingMessages[index]);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [loadingAnalysis]);
  

  useEffect(() => {
    if (showLoadingScreen && !loadingAnalogies) {
      setShowLoadingScreen(false);
      setGamePhase('playing');
      startRound(0);
    }
  }, [loadingAnalogies, showLoadingScreen]);

  // Reset game to setup
  const resetGame = async () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (nextRoundTimeoutRef.current) clearTimeout(nextRoundTimeoutRef.current);

    stopRecording();

    roundActiveRef.current = false;
    setTimeLeft(0);
    setCurrentRound(0);
    setGamePhase('setup');
    setRecordings(Array(gameAnalogies.length).fill(null));


    await fetchAnalogies();
  };

  // Helper to play a recording
  const playRecording = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.play();
  };


  if (showLoadingScreen) {
    return (
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-lg shadow-lg rounded-xl px-6 py-4 flex items-center gap-3 z-50">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></span>
          <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
          <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
        </div>
        <span className="text-sm font-medium text-gray-800">Loading Analogies...</span>
      </div>
    );
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

  

  // Setup Screen
  if (gamePhase === 'setup') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Rapid Fire Analogies</h1>
          <p className="text-lg text-gray-600 mb-6">
            Complete each analogy instantly. Don't think—just speak!
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-6 space-y-6">
          <div className="flex items-center mb-4">
            <Settings className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900">Game Settings & Instructions</h2>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Response Time per Round: {timerDuration} seconds
            </label>
            <input
              type="range"
              min="2"
              max="5"
              step="1"
              value={timerDuration}
              onChange={(e) => setTimerDuration(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>2s (Hard)</span>
              <span>3s (Medium)</span>
              <span>4s (Easy)</span>
              <span>5s (Very Easy)</span>
            </div>
           <div className="bg-gray-50 rounded-lg p-4">
             <h3 className="font-semibold text-gray-900 mb-2">Instructions:</h3>
             <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
               <li>You'll see incomplete analogies like "Business is like..."</li>
               <li>Speak your completion immediately when prompted</li>
               <li>Don't overthink - trust your first instinct</li>
               <li>Keep speaking even if you make mistakes</li>
               <li>The game will record and analyze your responses</li>
               <li><strong>Total Rounds:</strong> {gameAnalogies.length}</li>
               <li>Each round, you will see an incomplete analogy and have {timerDuration} seconds to speak your completion.</li>
             </ul>
           </div>
          </div>

          <button
            onClick={startGame}
            className="w-full font-semibold py-4 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white cursor-pointer flex items-center justify-center"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Game ({gameAnalogies.length} rounds)
          </button>
        </div>
      </div>
    );
  }

  // Playing Screen - keep your old timer UI exactly
  if (gamePhase === 'playing') {
    const progress = ((currentRound + 1) / gameAnalogies.length) * 100;
    const timeProgress = timeLeft > 0 ? (timeLeft / timerDuration) * 100 : 0;

    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-500">
              Round {currentRound + 1} of {gameAnalogies.length}
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            {gameAnalogies[currentRound]}...
          </h2>

          <div className="relative w-32 h-32 mx-auto mb-6">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill={timeLeft <= 1 ? "#ef4444" : "#3b82f6"}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 50}`}
                strokeDashoffset={`${2 * Math.PI * 50 * (1 - timeProgress / 100)}`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-3xl font-bold ${timeLeft <= 1 ? 'text-red-500' : 'text-blue-600'}`}>
                {timeLeft}
              </span>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={resetGame}
            className="text-gray-500 hover:text-gray-700 font-medium"
          >
            Stop Game
          </button>
        </div>
      </div>
    );
  }

  // Feedback Screen
  if (gamePhase === 'feedback') {
      if (loadingAnalysis) {
        return (
          <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mb-6"></div>
            <p className="text-lg font-medium text-gray-700">{currentLoadingMessage}</p>
          </div>
        );
      }
    
      return (
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Game Complete!</h1>
            <p className="text-lg text-gray-600">Thanks for playing!</p>
          </div>
    
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-black">Analysis Results</h2>
            <ul className="space-y-4">
              {analysisResults.map((item, i) => (
                <li key={i} className="bg-white shadow rounded-lg p-4">
                  <p className="font-semibold text-black">{item.prompt}</p>
                  <p className="italic text-gray-600">"{item.userResponse}"</p>
                  <p className="text-sm text-gray-500">Response Time: {item.responseTime}s</p>
                  <p className="text-sm text-gray-500">Audio Duration: {item.audioDuration}s</p>
                  <p className="text-gray-700 mt-2">{item.analysis}</p>
                </li>
              ))}
            </ul>
          </div>
    
          <div className="text-center">
            <button
              onClick={resetGame}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center mx-auto"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Play Again
            </button>
          </div>
        </div>
      );
  }
  
  return null;
}