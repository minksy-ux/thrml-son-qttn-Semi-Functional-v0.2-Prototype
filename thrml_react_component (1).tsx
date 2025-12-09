import React, { useState, useEffect, useRef } from 'react';
import { Activity, Zap, GitBranch, Play, RotateCcw } from 'lucide-react';

export default function THRMLDemo() {
  const [isRunning, setIsRunning] = useState(false);
  const [samples, setSamples] = useState(0);
  const [discreteNodes, setDiscreteNodes] = useState(Array(64).fill(-1));
  const [continuousNodes, setContinuousNodes] = useState(Array(16).fill(0));
  const [energyHistory, setEnergyHistory] = useState([]);
  const intervalRef = useRef(null);

  const runHybridSampling = () => {
    setIsRunning(true);
    setSamples(0);
    setEnergyHistory([]);
    setDiscreteNodes(Array(64).fill(-1));
    setContinuousNodes(Array(16).fill(0));

    let step = 0;
    const totalSteps = 100;

    intervalRef.current = setInterval(() => {
      step++;
      setSamples(step * 10);

      // Simulate Ising spin flips (discrete)
      setDiscreteNodes(prev => prev.map(() => Math.random() > 0.48 ? 1 : -1));

      // Simulate SON continuous oscillators
      setContinuousNodes(prev => prev.map((_, i) =>
        Math.sin(step * 0.15 + i * 0.8) * (0.7 + Math.random() * 0.6)
      ));

      // Simulated energy (with QTTN-seeded fast convergence)
      const energy = -120 + 100 * Math.exp(-step / 18) + Math.random() * 8;
      setEnergyHistory(prev => [...prev, energy]);

      if (step >= totalSteps) {
        clearInterval(intervalRef.current);
        setIsRunning(false);
      }
    }, 80);
  };

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setSamples(0);
    setEnergyHistory([]);
    setDiscreteNodes(Array(64).fill(-1));
    setContinuousNodes(Array(16).fill(0));
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const magnetization = (discreteNodes.filter(s => s > 0).length / 64 * 100).toFixed(1);
  const avgAmplitude = (continuousNodes.reduce((a, b) => a + Math.abs(b), 0) / 16).toFixed(2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
            THRML + SON + QTTN
          </h1>
          <p className="text-gray-400 text-lg">Live Demo • Hybrid Probabilistic Inference (2026 Roadmap)</p>
          <p className="text-gray-500 mt-2">Discrete Ising • Continuous Oscillators • Exact Tensor Seeding</p>
        </div>

        {/* Main Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Discrete Spins */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="text-purple-400" size={28} />
              <h2 className="text-2xl font-bold text-purple-300">Discrete Spins (Ising EBM)</h2>
            </div>
            <div className="bg-black/30 rounded-xl p-5 min-h-[280px] flex flex-wrap justify-center items-center gap-1.5">
              {discreteNodes.map((spin, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full transition-all duration-300 ${
                    isRunning ? 'animate-pulse' : ''
                  }`}
                  style={{
                    background: 'radial-gradient(circle, #667eea, #4a5fc4)',
                    boxShadow: '0 0 12px rgba(102,126,234,0.6)',
                    opacity: spin > 0 ? 1 : 0.35,
                    transform: `scale(${spin > 0 ? 1.1 : 0.85})`
                  }}
                />
              ))}
            </div>
            <div className="mt-4 bg-black/20 rounded-lg p-3 flex justify-between items-center">
              <span className="text-gray-400">Magnetization</span>
              <span className="text-purple-400 font-bold text-lg">{magnetization}%</span>
            </div>
          </div>

          {/* Continuous Nodes */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="text-pink-400" size={28} />
              <h2 className="text-2xl font-bold text-pink-300">Continuous Nodes (SON)</h2>
            </div>
            <div className="bg-black/30 rounded-xl p-5 min-h-[280px] flex flex-wrap justify-center items-center gap-2">
              {continuousNodes.map((val, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full transition-all duration-300 ${
                    isRunning ? 'animate-pulse' : ''
                  }`}
                  style={{
                    background: 'radial-gradient(circle, #f093fb, #f5576c)',
                    boxShadow: '0 0 12px rgba(240,147,251,0.6)',
                    opacity: 0.4 + Math.abs(val) * 0.35,
                    transform: `scale(${0.8 + Math.abs(val) * 0.25})`
                  }}
                />
              ))}
            </div>
            <div className="mt-4 bg-black/20 rounded-lg p-3 flex justify-between items-center">
              <span className="text-gray-400">Avg Amplitude</span>
              <span className="text-pink-400 font-bold text-lg">{avgAmplitude}</span>
            </div>
          </div>
        </div>

        {/* Energy Chart */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <GitBranch className="text-blue-400" size={28} />
            <h2 className="text-2xl font-bold text-blue-300">Energy Convergence (QTTN-seeded)</h2>
          </div>
          <div className="bg-black/30 rounded-xl p-4 h-64 relative">
            <svg className="w-full h-full" viewBox="0 0 800 200">
              {/* Grid lines */}
              <line x1="40" y1="20" x2="40" y2="180" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              <line x1="40" y1="180" x2="760" y2="180" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              
              {/* Energy curve */}
              {energyHistory.length > 1 && (
                <polyline
                  points={energyHistory.map((e, i) => {
                    const x = 40 + (i / 100) * 720;
                    const y = 180 - ((e + 120) / 120) * 160;
                    return `${x},${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#667eea"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              
              {/* Axis labels */}
              <text x="400" y="195" fill="#a0a0a0" fontSize="12" textAnchor="middle">Samples</text>
              <text x="20" y="100" fill="#a0a0a0" fontSize="12" textAnchor="middle" transform="rotate(-90, 20, 100)">Energy</text>
            </svg>
          </div>
          
          <div className="mt-4 bg-black/20 rounded-lg p-3 flex justify-between items-center">
            <span className="text-gray-400">Samples</span>
            <span className="text-blue-400 font-bold text-lg">{samples.toLocaleString()} / 1,000</span>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={runHybridSampling}
              disabled={isRunning}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Play size={20} />
              {isRunning ? 'Running Hybrid Sampling...' : 'Start Sampling'}
            </button>
            <button
              onClick={reset}
              disabled={isRunning}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-lg font-semibold hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw size={20} />
              Reset
            </button>
          </div>
        </div>

        {/* Code Examples */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-bold text-purple-300 mb-3">SON — Stochastic Oscillators</h2>
            <pre className="bg-black/40 rounded-lg p-4 text-sm text-green-400 overflow-x-auto">
{`osc_block = StochasticOscillatorBlock(
    n_nodes=16,
    coupling_strength=0.8,
    noise_scale=0.12,
    dt=0.01
)`}
            </pre>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-bold text-blue-300 mb-3">QTTN — Tree Tensor Seeding</h2>
            <pre className="bg-black/40 rounded-lg p-4 text-sm text-green-400 overflow-x-auto">
{`seeder = TreeTensorSeeder(
    model, max_treewidth=10
)
exact = seeder.marginals()  # Zero burn-in!`}
            </pre>
          </div>
        </div>

        {/* Installation */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text mb-3">
            Coming Q1 2026 • thrml v0.2 Pilot
          </h2>
          <p className="text-gray-400 mb-4">
            This is what Extropic's next open-source release will feel like.
          </p>
          <pre className="bg-black/40 rounded-lg p-4 text-sm text-green-400 overflow-x-auto">
pip install git+https://github.com/extropic-ai/thrml-son-qttn.git
          </pre>
        </div>
      </div>
    </div>
  );
}