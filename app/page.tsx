import Link from "next/link";

export default function Home() {
  return (
      <main className="flex flex-col min-h-screen bg-white text-gray-900 px-6">
        {/* Top Navigation */}
        <header className="flex justify-between items-center py-4 max-w-6xl mx-auto w-full">
          <h2 className="text-xl font-semibold tracking-tight">SpeakPro AI</h2>
          <div className="space-x-4">
            <Link href="/login" className="px-5 py-2 text-gray-700 rounded-full hover:bg-gray-100 transition-colors">
              Login
            </Link>
            <Link href="/signup" className="px-5 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors">
              Sign Up
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="flex-1 flex flex-col items-center justify-center text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-semibold mb-6 leading-tight tracking-tight">
            Master Public Speaking <br />
            <span className="text-gray-800">Through AI-Powered Games</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 mb-8">
            Boost your confidence, quick thinking, and creativity with real-time,
            interactive speaking challenges — from Rapid Fire Analogies to
            improvisation drills, all powered by AI.
          </p>

          <Link
            href="/signup"
            className="bg-gray-900 hover:bg-black text-white font-medium py-3 px-8 rounded-full transition-colors"
          >
            Start Training Now
          </Link>

        </section>

        {/* Features Section */}
        <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-5xl mx-auto">
          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-lg transition">
            <h3 className="text-2xl font-medium mb-4 text-gray-800">
              🎯 Rapid Fire Analogies
            </h3>
            <p className="text-gray-500">
              Train quick thinking and mental agility with instant analogy
              challenges.
            </p>
          </div>
          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-lg transition">
            <h3 className="text-2xl font-medium mb-4 text-gray-800">🤖 AI Feedback</h3>
            <p className="text-gray-500">
              Get real-time scoring on creativity, smoothness, and relevance to
              improve instantly.
            </p>
          </div>
          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-lg transition">
            <h3 className="text-2xl font-medium mb-4 text-gray-800">🎮 Fun & Engaging</h3>
            <p className="text-gray-500">
              Practice through gamified drills that make learning addictive and
              enjoyable.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-20 text-gray-400 text-sm text-center">
          © {new Date().getFullYear()} SpeakPro AI. All rights reserved.
        </footer>
      </main>
  );
}
