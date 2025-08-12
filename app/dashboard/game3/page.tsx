'use client'

import React, { useState, useEffect, useRef } from "react";

// const MAIN_TOPIC = "Innovation in technology";

// const RANDOM_WORDS = [
//   "PUMPKIN",
//   "HAPPINESS",
//   "PARIS",
//   "COMPUTER",
//   "OCEAN",
//   "MOUNTAIN"
// ];

const TOTAL_TIME_SECONDS = 20; // 2:30 total speech time
const WORD_INTEGRATION_TIME = 5; // seconds per word integration

export default function Game3Page() {
  const [MAIN_TOPIC, setTopic] = useState("");
  const [RANDOM_WORDS, setRandomWords] = useState([]);
  const [gamePhase, setGamePhase] = useState<"setup" | "playing" | "feedback">("setup");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [integrationTimeLeft, setIntegrationTimeLeft] = useState(WORD_INTEGRATION_TIME);
  const [totalTimeLeft, setTotalTimeLeft] = useState(TOTAL_TIME_SECONDS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const integrationTimerRef = useRef<NodeJS.Timeout | null>(null);

  const k = Math.floor(Math.random() * 6) + 10; 
  const fetchedRef = useRef(false);


  async function fetchWordsTopic() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/get-words?k=${k}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const json = await response.json();
      if (json.status && typeof json.data === 'object') {
        console.log("Fetched data:", json.data);
        setRandomWords(json.data.randomWords || []);
        setTopic(json.data.topic || "Topic unavailable");
        setCurrentWordIndex(0);
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
    
      fetchWordsTopic();
    }, []);

  useEffect(() => {
    if (gamePhase === "playing") {
      // Start total countdown timer
      totalTimerRef.current = setInterval(() => {
        setTotalTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(totalTimerRef.current!);
            clearInterval(integrationTimerRef.current!);
            setGamePhase("feedback");
            return 0;
          }
          return t - 1;
        });
      }, 1000);

      // Start integration timer for first word
      setIntegrationTimeLeft(WORD_INTEGRATION_TIME);
      integrationTimerRef.current = setInterval(() => {
        setIntegrationTimeLeft((t) => (t > 0 ? t - 1 : 0));
      }, 1000);
    }

    // Cleanup timers on phase change/unmount
    return () => {
      if (totalTimerRef.current) clearInterval(totalTimerRef.current);
      if (integrationTimerRef.current) clearInterval(integrationTimerRef.current);
    };
  }, [gamePhase]);

  // When integrationTimeLeft hits 0, go to next word or end game
  useEffect(() => {
    if (gamePhase !== "playing") return;

    if (integrationTimeLeft === 0) {
      if (currentWordIndex + 1 >= RANDOM_WORDS.length) {
        // End game if no more words
        if (totalTimerRef.current) clearInterval(totalTimerRef.current);
        if (integrationTimerRef.current) clearInterval(integrationTimerRef.current);
        setGamePhase("feedback");
      } else {
        setCurrentWordIndex((i) => i + 1);
        setIntegrationTimeLeft(WORD_INTEGRATION_TIME);
      }
    }
  }, [integrationTimeLeft, currentWordIndex, gamePhase]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

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


  if (gamePhase === "setup") {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <h1 className="text-3xl font-semibold mb-4 text-black">Game 3: Triple Step</h1>
        <p className="text-gray-700 mb-6">
          Main topic: <strong>{MAIN_TOPIC}</strong>
        </p>
        <p className="mb-6 text-gray-600">
          You will see random words to integrate into your speech, one at a time.
          You have 5 seconds to smoothly weave each word into your talk.
        </p>
        <button
          onClick={() => {
            setGamePhase("playing");
            setCurrentWordIndex(0);
            setTotalTimeLeft(TOTAL_TIME_SECONDS);
          }}
          className="bg-blue-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-blue-700 transition"
        >
          Start Speaking
        </button>
      </div>
    );
  }

  if (gamePhase === "playing") {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <h2 className="text-2xl mb-4 font-semibold text-black">{MAIN_TOPIC}</h2>

        <div className="mb-6">
          <div className="text-xl font-bold mb-2 text-gray-800">Random Word to Integrate:</div>
          <div className="text-5xl font-extrabold mb-4 text-blue-700 animate-fade-in">{RANDOM_WORDS[currentWordIndex]}</div>
          <div className="text-lg text-gray-700 mb-2">
            Integration time left: <span className="font-mono text-black">{integrationTimeLeft}s</span>
          </div>
          <div className="text-lg text-gray-700">
            Total time left: <span className="font-mono text-black">{formatTime(totalTimeLeft)}</span>
          </div>
        </div>

        <p className="text-gray-600 max-w-md mx-auto">
          Smoothly weave the displayed random word into your speech within the time limit.<br />
          Keep speaking about the main topic.
        </p>
      </div>
    );
  }

  if (gamePhase === "feedback") {
    const totalWords = RANDOM_WORDS.length;
    const wordsIntegrated = Math.min(currentWordIndex, totalWords); // assume integrated all words up to current index
    const smoothnessPercent = 80 + Math.floor(Math.random() * 15); // random between 80-95%
    
    // Pick a random missed word or none if all integrated
    const missedWord =
      wordsIntegrated < totalWords
        ? RANDOM_WORDS[wordsIntegrated]
        : null;
  
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <h1 className="text-3xl font-semibold mb-4 text-black">Game Complete!</h1>
        <p className="text-black mb-6">
          You finished integrating all the words or ran out of time.
        </p>
  
        <div className="bg-white shadow rounded p-6 max-w-md mx-auto mb-8 text-left">
          <p className="mb-2 text-black">
            <strong>Integration success:</strong> {wordsIntegrated}/{totalWords} words successfully woven in
          </p>
          <p className="mb-2 text-black">
            <strong>Smoothness rating:</strong> Maintained topic flow: {smoothnessPercent}%
          </p>
          {missedWord && (
            <p className="mb-4 text-black">
              <strong>Missed word:</strong> Struggled with: <em>"{missedWord}"</em>
            </p>
          )}
  
          {/* Placeholder for audio clips */}
          <div className="mb-6">
            <p className="font-semibold mb-2 text-black">Audio clips of best integrations:</p>
            <ul className="list-disc list-inside text-sm text-black">
              <li>Clip 1</li>
              <li>Clip 2</li>
              <li>Clip 3</li>
            </ul>
          </div>
  
          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                setGamePhase("setup");
                setCurrentWordIndex(0);
                setTotalTimeLeft(TOTAL_TIME_SECONDS);
              }}
              className="bg-blue-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-blue-700 transition"
            >
              Replay
            </button>
            <button
              onClick={() => {
                alert("Try harder words coming soon!");
              }}
              className="bg-gray-300 text-gray-800 py-3 px-6 rounded-md font-semibold hover:bg-gray-400 transition"
            >
              Try Harder Words
            </button>
          </div>
        </div>
      </div>
    );
  }
  

  return null;
}
