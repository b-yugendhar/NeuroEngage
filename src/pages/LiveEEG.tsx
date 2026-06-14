import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/UI';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Target, Brain, Radio, CheckCircle2, Play, ArrowRight, BatteryMedium, BrainCircuit, Monitor, Loader, Signal, AlertCircle, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BluetoothNavigator extends Navigator {
  bluetooth: {
    requestDevice(options?: unknown): Promise<unknown>;
  };
}

const COGNITIVE_TESTS: Record<string, { q: string, options: string[] }[]> = {
  "Logical Math": [
    { q: "What is 15% of 200?", options: ["30", "25", "35", "15"] },
    { q: "Solve: 8 + 2 × (5 - 3) ÷ 2", options: ["10", "12", "9", "14"] },
    { q: "If a train travels 60 miles in 45 minutes, what is its speed in mph?", options: ["80 mph", "75 mph", "90 mph", "100 mph"] },
    { q: "What is the square root of 225?", options: ["15", "25", "12", "17"] },
    { q: "Solve: 3³ - 2³", options: ["19", "25", "15", "27"] },
    { q: "If x + 5 = 12, what is 3x?", options: ["21", "24", "18", "27"] },
    { q: "What is the next number: 1, 1, 2, 3, 5, 8, _ ?", options: ["13", "11", "12", "15"] },
    { q: "How many degrees are in a triangle?", options: ["180", "360", "90", "270"] },
    { q: "What is 7 × 12?", options: ["84", "82", "78", "86"] },
    { q: "Convert 0.75 to a fraction.", options: ["3/4", "1/2", "2/3", "4/5"] }
  ],
  "Personal Empathy": [
    { q: "How do you recharge after a draining day?", options: ["Solitude and quiet", "Time with close friends", "Physical exercise", "Engaging in hobbies"] },
    { q: "When someone strongly disagrees with you, what is your first thought?", options: ["They misunderstand", "I must defend my view", "I want to hear their reason", "I want to walk away"] },
    { q: "What matters most in your daily life?", options: ["Freedom", "Security", "Achievement", "Connection"] },
    { q: "How do you handle sudden failure?", options: ["Analyze what went wrong", "Feel overwhelmed initially", "Brush it off and try again", "Seek comfort from others"] },
    { q: "Describe your ideal working environment.", options: ["Quiet and structured", "Fast-paced and collaborative", "Independent and flexible", "Creative and slightly chaotic"] },
    { q: "What is your primary motivator?", options: ["Curiosity", "Success", "Helping others", "Stability"] },
    { q: "When leading a group, you focus on:", options: ["Efficiency", "Morale", "Innovation", "Rules"] },
    { q: "How do you process anger?", options: ["Internalize it", "Express it immediately", "Channel it into action", "Talk it out calmly"] },
    { q: "What is your greatest fear?", options: ["Failure", "Rejection", "Loss of control", "Stagnation"] },
    { q: "How adaptable are you to sudden changes?", options: ["Very adaptable", "Somewhat, with effort", "I prefer routine", "I heavily resist it"] }
  ],
  "Real Life Scenarios": [
    { q: "You realize you forgot your wallet at the grocery checkout. What do you do?", options: ["Ask to hold the items while you return", "Put everything back silently", "Ask if they accept digital pay", "Panic and leave the store"] },
    { q: "A colleague takes credit for your work. How do you respond?", options: ["Confront them privately", "Call them out publicly", "Inform your manager", "Let it go to avoid conflict"] },
    { q: "You accidentally scratch a parked car. No one saw.", options: ["Leave a note with your number", "Drive away immediately", "Wait for the owner", "Call the police"] },
    { q: "Your flight gets cancelled 2 hours before takeoff.", options: ["Demand a refund immediately", "Quickly rebook the next available flight", "Wait for airline instructions", "Give up and go home"] },
    { q: "A friend borrows money and forgets to pay it back.", options: ["Remind them directly", "Drop subtle hints", "Write it off as a loss", "Wait for them to remember"] },
    { q: "You witness someone being harassed on the street.", options: ["Intervene directly", "Call the authorities", "Record it for evidence", "Walk away quickly"] },
    { q: "You are given too much change by a struggling cashier.", options: ["Return the extra money", "Keep it and walk away", "Donate it later", "Only tell them if they notice"] },
    { q: "A promotion requires relocating away from your family.", options: ["Accept it for the career", "Decline it for the family", "Negotiate a compromise", "Take time to over-analyze"] },
    { q: "You drop your phone in water.", options: ["Put it in rice", "Try to turn it on immediately", "Take it to a repair shop", "Assume it's dead"] },
    { q: "You are late for a highly important meeting.", options: ["Call ahead to inform them", "Rush and hope they don't notice", "Make up a fake excuse", "Cancel and reschedule"] }
  ],
  "Hypothetical Situations": [
    { q: "You find a button that pauses time for everyone but you. You...", options: ["Use it to sleep longer", "Use it to learn everything", "Never use it", "Use it for personal gain"] },
    { q: "If you could live forever, but you'd continue to age, would you?", options: ["Yes", "No", "Only if I have wealth", "Only if my family does too"] },
    { q: "You can save 10 strangers or your beloved pet from a fire.", options: ["The 10 strangers", "My pet", "Try to save both", "I cannot decide"] },
    { q: "You are offered $1 Million, but a random person dies.", options: ["Take the money", "Decline the money", "Find out who the person is first", "Only if it's someone bad"] },
    { q: "You discover we are living in a simulation. Do you tell anyone?", options: ["Tell the whole world", "Tell only close family", "Keep it a secret", "Try to break the simulation"] },
    { q: "If you could teleport anywhere, but only once, where do you go?", options: ["Another habitable planet", "Inside a bank vault", "To my dream vacation", "I'd save it for an emergency"] },
    { q: "You can erase one event from your past.", options: ["A major failure", "A traumatic memory", "An embarrassing moment", "I wouldn't change anything"] },
    { q: "You must survive a zombie apocalypse. Your chosen weapon is:", options: ["A crowbar", "A suppressed rifle", "A katana", "A fortified bunker"] },
    { q: "If animals could talk, which species would be the rudest?", options: ["Cats", "Seagulls", "Geese", "Chihuahuas"] },
    { q: "You find out tomorrow is the end of the world.", options: ["Spend it with loved ones", "Do everything I was afraid of", "Try to stop it", "Accept it peacefully"] }
  ],
  "Problem Solving": [
    { q: "You have a 3-gallon jug and a 5-gallon jug. How do you measure exactly 4 gallons?", options: ["Fill 5, pour to 3, empty 3, pour 2 to 3, fill 5, top off 3.", "It's impossible", "Fill both halfway", "Guess by looking at the water level"] },
    { q: "A room has 3 light switches outside. Inside are 3 bulbs. You can only enter once.", options: ["Turn 1 on for 10 mins, turn it off, turn 2 on, go in. Feel for heat.", "Flick them randomly", "It's impossible", "Look under the door"] },
    { q: "How do you drop an egg onto a concrete floor without cracking the floor?", options: ["Concrete is harder than egg", "Cook it first", "Wrap it in bubbles", "Drop it slowly"] },
    { q: "You have 8 balls. One is slightly heavier. You have a balance scale and 2 uses.", options: ["Weigh 3 vs 3. Narrow it down progressively.", "Weigh 4 vs 4, then 2 vs 2", "Weigh 1 vs 1 repeatedly", "Guess"] },
    { q: "A man shaves several times a day but still has a beard. Who is he?", options: ["A barber", "A werewolf", "A wizard", "An actor"] },
    { q: "What comes once in a minute, twice in a moment, but never in a thousand years?", options: ["The letter M", "A heartbeat", "A thought", "The sun"] },
    { q: "You are stuck in a dark room with a candle, a wood stove, and a gas lamp. You only have one match. What do you light first?", options: ["The match", "The candle", "The gas lamp", "The stove"] },
    { q: "I speak without a mouth and hear without ears.", options: ["An echo", "A ghost", "The wind", "A phone"] },
    { q: "The more of this there is, the less you see.", options: ["Darkness", "Fog", "Water", "Light"] },
    { q: "What has keys but can't open locks?", options: ["A piano", "A map", "A treasure chest", "A monkey"] }
  ],
  "Critical Thinking": [
    { q: "If A implies B, and B implies C, does not C imply not A?", options: ["Yes (Modus Tollens)", "No", "Sometimes", "Only in mathematics"] },
    { q: "Why is correlation not causation?", options: ["A third variable could cause both", "Math is subjective", "Statistics are flawed", "It is causation if the p-value is low"] },
    { q: "Which argument is a 'Straw Man' fallacy?", options: ["Misrepresenting an opponent's argument to easily defeat it", "Attacking the person instead of the argument", "Assuming something is true because everyone thinks so", "Using a celebrity endorsement"] },
    { q: "Is it possible for a statement to be neither true nor false?", options: ["Yes, paradoxes like 'This statement is false'", "No, logic is binary", "Only in philosophy", "Only if it's a question"] },
    { q: "If everyone claims a specific diet works, what is the best cognitive approach?", options: ["Look for blinded studies", "Try it yourself immediately", "Assume it's a scam", "Trust the majority"] },
    { q: "When presented with contradicting evidence to your core beliefs:", options: ["Objectively analyze the new data", "Dismiss it as flawed", "Defend your core belief harder", "Immediately change your mind"] },
    { q: "What is Occam's Razor?", options: ["The simplest explanation is usually the right one", "Always assume the worst", "Cut out useless variables in math", "Never trust coincidences"] },
    { q: "If a test is 99% accurate, and you test positive for a rare disease, are you 99% likely to have it?", options: ["No, due to the base rate fallacy", "Yes, it's 99% accurate", "It's 100% certain", "It's 50/50"] },
    { q: "What is the sunk cost fallacy?", options: ["Continuing a failing endeavor because of past investments", "Selling stocks too early", "Refusing to spend money on tools", "Assuming success brings more success"] },
    { q: "How do you evaluate source reliability?", options: ["Check for bias, methodology, and cross-references", "Trust highly-followed accounts", "If it sounds logical, it is", "Only trust government sources"] }
  ]
};

const QuizSidebar = ({ selectedTest, quizIndex, setQuizIndex, onSelectTest }: { selectedTest: string | null; quizIndex: number; setQuizIndex: (i: number) => void; onSelectTest: (t: string) => void }) => {
  if (!selectedTest) {
    return (
      <Card className="h-full border-border-subtle bg-white flex flex-col p-6 min-h-[400px]">
         <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-6">Select Cognitive Battery</h3>
         <div className="flex flex-col gap-3 overflow-y-auto pr-2 pb-2">
           {Object.keys(COGNITIVE_TESTS).map((testName) => (
             <Button 
               key={testName} 
               variant="outline" 
               className="border-gray-300 text-black hover:border-black font-medium justify-start" 
               style={{ color: '#000000' }} 
               onClick={() => onSelectTest(testName)}
             >
               {testName} (10 Qs)
             </Button>
           ))}
         </div>
      </Card>
    );
  }

  const activeQuizArray = COGNITIVE_TESTS[selectedTest];

  if (quizIndex >= activeQuizArray.length) {
    return (
      <Card className="h-full border-border-subtle bg-bg-surface-elevated/50 flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
        <div className="w-16 h-16 rounded-full bg-status-calm/10 border border-status-calm/20 text-status-calm flex items-center justify-center mb-6">
          <BrainCircuit size={32} />
        </div>
        <h3 className="text-xl font-medium text-white mb-2">{selectedTest} Completed</h3>
        <p className="text-text-secondary text-sm">Your cognitive baseline during active decision-making has been successfully logged. You may continue monitoring or stop the session.</p>
      </Card>
    );
  }

  const q = activeQuizArray[quizIndex];

  return (
    <Card className="h-full border-border-subtle bg-white flex flex-col p-6 min-h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{selectedTest}</h3>
        <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-medium">Q {quizIndex + 1} / {activeQuizArray.length}</span>
      </div>
      
      <p className="text-lg font-semibold text-black leading-relaxed mb-8">{q.q}</p>
      
      <div className="flex flex-col gap-3 mt-auto">
        {q.options.map((opt, i) => (
          <Button 
            key={i} 
            variant="outline" 
            className="justify-start text-left h-auto py-3 px-4 border-gray-300 font-medium hover:border-black hover:bg-gray-100 transition-all"
            style={{ color: '#000000' }}
            onClick={() => setQuizIndex(quizIndex + 1)}
          >
            {opt}
          </Button>
        ))}
      </div>
    </Card>
  );
};

// Minimal distinct colors
const C_ALPHA = '#a1a1aa'; 
const C_BETA = '#fca5a5';  
const C_GAMMA = '#93c5fd'; 
const C_FOCUS = '#ffffff'; 
const C_ATTENTION = '#52525b'; 

const generateMockData = (points = 30) => {
  return Array.from({ length: points }, (_, i) => {
    // Correct scientific frequency bands (Hz)
    const baseAlpha = Math.random() * 5 + 8;     // 8-13 Hz
    const baseBeta = Math.random() * 12 + 13;    // 13-25 Hz
    const baseGamma = Math.random() * 20 + 25;   // 25-45 Hz
    const alphaNorm = (baseAlpha - 8) / 5;
    const betaNorm = (baseBeta - 13) / 12;
    const gammaNorm = (baseGamma - 25) / 20;
    const focusLevel = Math.min(100, Math.max(0, (alphaNorm * 60) + ((1 - betaNorm) * 40) + (Math.random() * 10 - 5)));
    const attentionLevel = Math.min(100, Math.max(0, (gammaNorm * 70) + (alphaNorm * 30) + (Math.random() * 10 - 5)));

    return { time: i, alpha: baseAlpha, beta: baseBeta, gamma: baseGamma, focus: focusLevel, attention: attentionLevel };
  });
};

type SessionState = 'IDLE' | 'CONNECTION_SELECT' | 'DEVICE_SCANNING' | 'DEVICE_FAILED' | 'QUESTIONNAIRE' | 'HARDWARE_CHECK' | 'ACTIVE' | 'COMPLETED';

export const LiveEEG: React.FC = () => {
  const [sessionState, setSessionState] = useState<SessionState>('IDLE');
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  
  // Hardware Check Status
  const [hwStatus, setHwStatus] = useState<'waiting' | 'connecting' | 'connected'>('waiting');
  
  // Questionnaire State
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Connection and Hardware Calibration Details
  const [connectionType, setConnectionType] = useState<'demo' | 'bluetooth' | 'websocket' | 'virtual'>('demo');
  const [deviceName, setDeviceName] = useState<string>('Demo Mode');
  const [wsUrl, setWsUrl] = useState<string>('ws://localhost:8081');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // const [selectedVirtualDevice, setSelectedVirtualDevice] = useState<string>('');
  const [electrodeSignals, setElectrodeSignals] = useState<Record<string, number>>({ Fp1: 0, Fp2: 0, TP9: 0, TP10: 0 });
  const [calibrationProgress, setCalibrationProgress] = useState<number>(0);
  const [batteryLevel, setBatteryLevel] = useState<number>(100);
  const [activeSocket, setActiveSocket] = useState<WebSocket | null>(null);

  // EEG Data State (Only active in ACTIVE state)
  const initialData = generateMockData(30);
  const [eegData, setEegData] = useState(initialData);

  const statsRef = useRef({
    totalFocus: initialData.reduce((acc, curr) => acc + curr.focus, 0),
    totalBeta: initialData.reduce((acc, curr) => acc + curr.beta, 0),
    totalAttention: initialData.reduce((acc, curr) => acc + curr.attention, 0),
    count: 30
  });

  const [sessionAvgFocus, setSessionAvgFocus] = useState(statsRef.current.totalFocus / 30);
  const [sessionAvgBeta, setSessionAvgBeta] = useState(statsRef.current.totalBeta / 30);
  const [sessionAvgAttention, setSessionAvgAttention] = useState(statsRef.current.totalAttention / 30);

  // Connection handlers
  const handleConnectBluetooth = async () => {
    setIsConnecting(true);
    setErrorMsg(null);
    try {
      console.log('Requesting Bluetooth Device...');
      if (!(navigator as unknown as BluetoothNavigator).bluetooth) {
        throw new Error('Web Bluetooth is not supported in this browser. Please try Chrome, Edge, or select a Virtual Device.');
      }
      const device = await (navigator as unknown as BluetoothNavigator).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service', 'device_information']
      }) as any;
      
      console.log('Connected to bluetooth device:', device.name);
      setConnectionType('bluetooth');
      setDeviceName(device.name || 'Bluetooth Headset');
      setBatteryLevel(Math.floor(Math.random() * 20) + 80);
      setErrorMsg(null);
      setSessionState('QUESTIONNAIRE');
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Bluetooth connection failed:', err);
        if (err.name === 'NotFoundError' || err.message?.includes('cancelled')) {
          setErrorMsg('Bluetooth device selection was cancelled.');
        } else {
          setErrorMsg(err.message || 'Bluetooth connection failed.');
        }
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnectWebSocket = (targetUrl: string) => {
    setIsConnecting(true);
    setErrorMsg(null);
    try {
      const socket = new WebSocket(targetUrl);
      
      const timeout = setTimeout(() => {
        if (socket.readyState !== WebSocket.OPEN) {
          socket.close();
          setErrorMsg(`Connection to ${targetUrl} timed out. Ensure your local LSL / websocket server is running.`);
          setIsConnecting(false);
        }
      }, 5000);

      socket.onopen = () => {
        clearTimeout(timeout);
        setActiveSocket(socket);
        setConnectionType('websocket');
        setDeviceName(`WebSocket Stream`);
        setBatteryLevel(100);
        setErrorMsg(null);
        setIsConnecting(false);
        setSessionState('QUESTIONNAIRE');
      };

      socket.onerror = (err) => {
        clearTimeout(timeout);
        console.error('WebSocket error:', err);
        setErrorMsg(`Failed to connect to ${targetUrl}. Connection refused.`);
        setIsConnecting(false);
      };
      
      socket.onclose = () => {
        console.log('WebSocket connection closed.');
        setActiveSocket(null);
      };
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(`Invalid WebSocket URL: ${err.message}`);
      }
      setIsConnecting(false);
    }
  };

  const handleConnectVirtual = (vDeviceName: string) => {
    setConnectionType('virtual');
    setDeviceName(`${vDeviceName} (Virtual)`);
    setBatteryLevel(Math.floor(Math.random() * 15) + 85);
    setSessionState('QUESTIONNAIRE');
  };

  // Live Electrode signals and Calibration simulation
  useEffect(() => {
    if (sessionState !== 'HARDWARE_CHECK') {
      setCalibrationProgress(0);
      return;
    }

    if (hwStatus === 'connecting') {
      const interval = setInterval(() => {
        setCalibrationProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setHwStatus('connected');
            return 100;
          }
          return prev + 4;
        });

        setElectrodeSignals({
          Fp1: Math.floor(Math.random() * 40) + 60,
          Fp2: Math.floor(Math.random() * 30) + 70,
          TP9: Math.floor(Math.random() * 50) + 50,
          TP10: Math.floor(Math.random() * 40) + 60,
        });
      }, 100);

      return () => clearInterval(interval);
    } else if (hwStatus === 'connected') {
      setElectrodeSignals({ Fp1: 98, Fp2: 96, TP9: 94, TP10: 97 });
    } else {
      setElectrodeSignals({ Fp1: 0, Fp2: 0, TP9: 0, TP10: 0 });
    }
  }, [sessionState, hwStatus]);

  // Live EEG Streaming (Websocket or Simulation)
  useEffect(() => {
    if (sessionState !== 'ACTIVE') return;

    if (connectionType === 'websocket' && activeSocket) {
      activeSocket.onmessage = (event) => {
        try {
          const packet = JSON.parse(event.data);
          if (packet.alpha !== undefined && packet.beta !== undefined) {
            setEegData(current => {
              const newData = [...current.slice(1)];
              const lastTime = newData.length > 0 ? newData[newData.length - 1].time : 0;
              
              const alpha = packet.alpha;
              const beta = packet.beta;
              const gamma = packet.gamma || Math.random() * 20 + 25;
              const focus = packet.focus !== undefined ? packet.focus : 50;
              const attention = packet.attention !== undefined ? packet.attention : 50;

              statsRef.current.totalFocus += focus;
              statsRef.current.totalBeta += beta;
              statsRef.current.totalAttention += attention;
              statsRef.current.count += 1;
              setSessionAvgFocus(statsRef.current.totalFocus / statsRef.current.count);
              setSessionAvgBeta(statsRef.current.totalBeta / statsRef.current.count);
              setSessionAvgAttention(statsRef.current.totalAttention / statsRef.current.count);

              newData.push({
                time: packet.time || (lastTime + 1),
                alpha,
                beta,
                gamma,
                focus,
                attention
              });
              return newData;
            });
          }
        } catch (err) {
          console.error('Error parsing incoming WebSocket packet:', err);
        }
      };

      activeSocket.onerror = (err) => {
        console.error('WebSocket active error:', err);
      };

      return () => {
        if (activeSocket) {
          activeSocket.onmessage = null;
        }
      };
    } else {
      const interval = setInterval(() => {
        setEegData(current => {
          const newData = [...current.slice(1)];
          const lastTime = newData.length > 0 ? newData[newData.length - 1].time : 0;
          
          const alpha = Math.random() * 5 + 8;     // 8-13 Hz
          const beta = Math.random() * 12 + 13;    // 13-25 Hz
          const gamma = Math.random() * 20 + 25;   // 25-45 Hz
          const alphaNorm = (alpha - 8) / 5;
          const betaNorm = (beta - 13) / 12;
          const gammaNorm = (gamma - 25) / 20;
          const focus = Math.min(100, Math.max(0, (alphaNorm * 60) + ((1 - betaNorm) * 40) + (Math.random() * 10 - 5)));
          const attention = Math.min(100, Math.max(0, (gammaNorm * 70) + (alphaNorm * 30) + (Math.random() * 10 - 5)));
          
          statsRef.current.totalFocus += focus;
          statsRef.current.totalBeta += beta;
          statsRef.current.totalAttention += attention;
          statsRef.current.count += 1;
          setSessionAvgFocus(statsRef.current.totalFocus / statsRef.current.count);
          setSessionAvgBeta(statsRef.current.totalBeta / statsRef.current.count);
          setSessionAvgAttention(statsRef.current.totalAttention / statsRef.current.count);

          newData.push({ time: lastTime + 1, alpha, beta, gamma, focus, attention });
          return newData;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [sessionState, connectionType, activeSocket]);

  const handleAnswer = (question: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [question]: answer }));
  };

  const isQuestionnaireComplete = Object.keys(answers).length === 4;

  if (sessionState === 'IDLE') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] w-full animate-fade-in text-center px-4">
        <div className="w-20 h-20 rounded-full bg-bg-surface-elevated border border-border-subtle flex items-center justify-center mb-8 shadow-xl">
          <Activity size={32} className="text-white" />
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-white mb-4">Start New Diagnostic Session</h1>
        <p className="text-text-secondary max-w-md mx-auto mb-10 leading-relaxed">
          Initialize a new live patient telemetry session. You will be guided through a clinical baseline assessment and hardware calibration.
        </p>
        <Button onClick={() => setSessionState('CONNECTION_SELECT')} className="h-12 px-8 text-base transition-all duration-300 hover:scale-[1.03]" style={{ backgroundColor: 'var(--brand-primary)', color: '#ffffff', boxShadow: '0 4px 20px rgba(79,70,229,0.3)' }}>
          <Play size={18} className="mr-3" /> Start Clinical Recording
        </Button>
      </div>
    );
  }

  if (sessionState === 'CONNECTION_SELECT') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] w-full animate-fade-in px-4 max-w-4xl mx-auto py-8">
        <header className="mb-10 text-center">
          <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5 mx-auto">
            <Radio size={28} className="text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary mb-2">Select Device Input Source</h1>
          <p className="text-text-secondary text-sm max-w-md mx-auto">
            Establish a live connection to your brainwave sensor headset, or choose a simulator to test the dashboard.
          </p>
        </header>

        {errorMsg && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="w-full mb-8 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 text-left">
            <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
            <div>
              <h4 className="text-sm font-semibold text-white">Connection Issue</h4>
              <p className="text-xs text-red-300 mt-1 leading-relaxed">{errorMsg}</p>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-10">
          
          {/* Web Bluetooth Card */}
          <Card className="flex flex-col justify-between p-6 border-border-subtle bg-white relative overflow-hidden">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-400">
                  <Radio size={20} />
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">
                  Native BLE
                </span>
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">Web Bluetooth</h3>
              <p className="text-xs text-text-secondary leading-relaxed mb-6">
                Pair directly with local Bluetooth Low Energy headsets (like Muse 2/S) using the browser's native device picker.
              </p>
            </div>
            
            <Button 
              disabled={isConnecting}
              onClick={handleConnectBluetooth}
              className="w-full h-10 transition-all font-medium text-xs border-indigo-500/30 hover:border-indigo-500"
              style={{ background: 'transparent', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#a5b4fc' }}
            >
              {isConnecting && connectionType === 'bluetooth' ? (
                <span className="flex items-center gap-2">
                  <Loader size={14} className="animate-spin" /> Scanning...
                </span>
              ) : 'Search BLE Devices'}
            </Button>
          </Card>

          {/* WebSocket Card */}
          <Card className="flex flex-col justify-between p-6 border-border-subtle bg-white relative overflow-hidden">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-400">
                  <Wifi size={20} />
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
                  LSL Stream
                </span>
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">WebSocket Client</h3>
              <p className="text-xs text-text-secondary leading-relaxed mb-4">
                Stream live metrics from external hardware servers or LSL streaming scripts over local network.
              </p>
              
              <div className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  value={wsUrl}
                  onChange={(e) => setWsUrl(e.target.value)}
                  placeholder="ws://localhost:8080"
                  className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 w-full font-mono"
                />
              </div>
            </div>

            <Button 
              disabled={isConnecting}
              onClick={() => handleConnectWebSocket(wsUrl)}
              className="w-full h-10 transition-all font-medium text-xs border-blue-500/30 hover:border-blue-500"
              style={{ background: 'transparent', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#93c5fd' }}
            >
              {isConnecting && connectionType === 'websocket' ? (
                <span className="flex items-center gap-2">
                  <Loader size={14} className="animate-spin" /> Connecting...
                </span>
              ) : 'Connect WebSocket'}
            </Button>
          </Card>

          {/* Virtual Headset Card */}
          <Card className="flex flex-col justify-between p-6 border-border-subtle bg-white relative overflow-hidden">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                  <BrainCircuit size={20} />
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                  Emulator
                </span>
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">Hardware Emulator</h3>
              <p className="text-xs text-text-secondary leading-relaxed mb-6">
                Simulate battery levels, sensor contact connections, and hardware calibration sequences without physical devices.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Button 
                onClick={() => handleConnectVirtual('Muse 2')}
                className="w-full h-9 justify-start text-xs font-semibold px-4 border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800"
                variant="outline"
              >
                Pair Muse 2 (Virtual)
              </Button>
              <Button 
                onClick={() => handleConnectVirtual('OpenBCI Cyton')}
                className="w-full h-9 justify-start text-xs font-semibold px-4 border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800"
                variant="outline"
              >
                Pair OpenBCI Cyton (Virtual)
              </Button>
            </div>
          </Card>

          {/* Quick Demo Card */}
          <Card className="flex flex-col justify-between p-6 border-border-subtle bg-white relative overflow-hidden">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="p-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-400">
                  <Monitor size={20} />
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-zinc-700">
                  Offline
                </span>
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">Quick Demo Mode</h3>
              <p className="text-xs text-text-secondary leading-relaxed mb-6">
                Bypass the device connection and sensor calibration process to directly view the telemetry charts with synthetic data.
              </p>
            </div>

            <Button 
              onClick={() => {
                setConnectionType('demo');
                setDeviceName('Demo Mode');
                setSessionState('QUESTIONNAIRE');
              }}
              className="w-full h-10 transition-all font-semibold text-xs text-black"
              style={{ backgroundColor: '#ffffff' }}
            >
              Launch Demo Mode
            </Button>
          </Card>

        </div>
      </div>
    );
  }

  const activeStyle = {
    backgroundColor: '#86efac', 
    borderColor: '#86efac',
    color: '#000000',
    boxShadow: '0 0 15px rgba(134,239,172,0.3)',
    fontWeight: 600
  };

  if (sessionState === 'QUESTIONNAIRE') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] w-full animate-fade-in px-4">
        <div className="w-full max-w-xl">
          <header className="mb-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-text-primary mb-2">Pre-Session Context</h2>
            <p className="text-text-secondary text-sm">Answer these quick questions to help establish a baseline interpretation for your neural data.</p>
          </header>

          <Card className="p-8">
            <div className="flex flex-col gap-8">
              {/* Question 1 */}
              <div>
                <p className="text-text-primary font-semibold mb-3">1. How many hours of sleep did you get last night?</p>
                <div className="grid grid-cols-3 gap-3">
                  {['< 5 hours', '5-7 hours', '8+ hours'].map(opt => (
                    <button 
                      key={opt}
                      onClick={() => handleAnswer('sleep', opt)}
                      className={`py-2 px-3 border rounded text-sm transition-all ${answers['sleep'] !== opt ? 'border-border-subtle text-text-secondary hover:border-border-highlight' : ''}`}
                      style={answers['sleep'] === opt ? activeStyle : {}}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2 */}
              <div>
                <p className="text-white font-medium mb-3">2. What is your current perceived stress level?</p>
                <div className="grid grid-cols-3 gap-3">
                  {['Low / Relaxed', 'Moderate', 'High / Anxious'].map(opt => (
                    <button 
                      key={opt}
                      onClick={() => handleAnswer('stress', opt)}
                      className={`py-2 px-3 border rounded text-sm transition-all ${answers['stress'] !== opt ? 'border-border-subtle text-text-secondary hover:border-border-highlight' : ''}`}
                      style={answers['stress'] === opt ? activeStyle : {}}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 3 */}
              <div>
                <p className="text-white font-medium mb-3">3. Have you consumed caffeine in the last 2 hours?</p>
                <div className="grid grid-cols-2 gap-3">
                  {['Yes', 'No'].map(opt => (
                    <button 
                      key={opt}
                      onClick={() => handleAnswer('caffeine', opt)}
                      className={`py-2 px-3 border rounded text-sm transition-all ${answers['caffeine'] !== opt ? 'border-border-subtle text-text-secondary hover:border-border-highlight' : ''}`}
                      style={answers['caffeine'] === opt ? activeStyle : {}}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 4 */}
              <div>
                <p className="text-white font-medium mb-3">4. What primary task will you be performing during this session?</p>
                <div className="grid grid-cols-2 gap-3">
                  {['Studying', 'Problem Solving', 'Reading / Relaxing', 'Take a Cognitive Quiz'].map(opt => (
                    <button 
                      key={opt}
                      onClick={() => handleAnswer('task', opt)}
                      className={`py-2 px-3 border rounded text-sm transition-all ${answers['task'] !== opt ? 'border-border-subtle text-text-secondary hover:border-border-highlight' : ''}`}
                      style={answers['task'] === opt ? activeStyle : {}}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-border-subtle flex justify-end">
                <Button 
                  disabled={!isQuestionnaireComplete} 
                  onClick={() => setSessionState(connectionType === 'demo' ? 'ACTIVE' : 'HARDWARE_CHECK')}
                  className="px-6 h-10 transition-all duration-300 hover:scale-[1.03]"
                  style={{ 
                    backgroundColor: isQuestionnaireComplete ? '#ffffff' : '#27272a', 
                    color: isQuestionnaireComplete ? '#000000' : '#a1a1aa', 
                    boxShadow: isQuestionnaireComplete ? '0 0 25px rgba(255,255,255,0.25)' : 'none',
                    border: 'none'
                  }}
                >
                  {connectionType === 'demo' ? 'Start Recording' : 'Proceed to Hardware Setup'} <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (sessionState === 'HARDWARE_CHECK') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] w-full animate-fade-in text-center px-4 max-w-2xl mx-auto py-8">
        <h2 className="text-3xl font-bold tracking-tight text-text-primary mb-2">Hardware Calibration</h2>
        <p className="text-text-secondary mb-8 max-w-md text-sm">
          Please equip your EEG headset. We are establishing a low-impedance connection with your frontal and temporal nodes.
        </p>

        {/* Device metadata badge */}
        <div className="flex items-center gap-3 bg-bg-surface border border-border-subtle rounded-full px-4 py-1.5 mb-8 text-xs font-medium text-text-secondary">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          Source: <span className="text-text-primary font-semibold">{deviceName}</span>
          <span className="text-border-subtle">|</span>
          Battery: <span className="text-text-primary font-semibold">{batteryLevel}%</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center w-full mb-10 text-left">
          
          {/* Headset Ring Visual */}
          <div className="relative w-56 h-56 flex items-center justify-center mx-auto">
            {/* Outer rotating dash ring */}
            <div className={`absolute inset-0 rounded-full border border-dashed transition-colors duration-1000 ${
              hwStatus === 'connected' ? 'border-status-calm' : 'border-indigo-500/30 animate-[spin_6s_linear_infinite]'
            }`}></div>
            
            {/* Inner pulsing solid ring */}
            <div className={`absolute inset-6 rounded-full border transition-all duration-1000 ${
              hwStatus === 'waiting' ? 'border-border-subtle' :
              hwStatus === 'connecting' ? 'border-indigo-400/50 animate-pulse' :
              'border-status-calm shadow-[0_0_30px_rgba(134,239,172,0.15)] bg-status-calm/5'
            }`}></div>

            <Brain size={40} className={`transition-colors duration-700 relative z-10 ${
              hwStatus === 'connected' ? 'text-status-calm' : 'text-zinc-500'
            }`} />

            {hwStatus === 'connected' && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute bottom-6 right-6 bg-bg-base rounded-full shadow-lg">
                <CheckCircle2 size={28} className="text-status-calm" />
              </motion.div>
            )}
          </div>

          {/* Electrode Contact map & calibration stats */}
          <Card className="p-5 border-border-subtle bg-white w-full">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-4 flex justify-between">
              <span>Node Contact Status</span>
              {hwStatus === 'connecting' && <span className="text-[10px] text-brand-primary animate-pulse">Syncing...</span>}
              {hwStatus === 'connected' && <span className="text-[10px] text-status-calm">Locked</span>}
            </h3>

            <div className="flex flex-col gap-2.5 mb-5">
              {Object.entries(electrodeSignals).map(([node, signal]) => {
                const isGood = signal >= 80;
                const isWeak = signal > 30 && signal < 80;
                const statusColor = isGood ? 'text-status-calm bg-status-calm/10 border-status-calm/20' : 
                                    isWeak ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' : 
                                    'text-red-400 bg-red-400/10 border-red-400/20';
                
                return (
                  <div key={node} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-border-subtle">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isGood ? 'bg-status-calm' : isWeak ? 'bg-amber-400' : 'bg-red-400'}`} />
                      <span className="text-xs font-bold text-text-secondary tracking-wider">{node}</span>
                    </div>
                    <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border ${statusColor}`}>
                      {hwStatus === 'waiting' ? 'Off' : `${signal}%`}
                    </span>
                  </div>
                );
              })}
            </div>

            {hwStatus === 'connecting' && (
              <div className="w-full">
                <div className="flex justify-between text-[11px] text-text-secondary mb-1">
                  <span>Sensor alignment check...</span>
                  <span className="font-semibold text-white">{calibrationProgress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
                  <motion.div className="bg-indigo-500 h-1" initial={{ width: '0%' }} animate={{ width: `${calibrationProgress}%` }} transition={{ ease: 'linear' }} />
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="flex flex-col items-center gap-6 min-h-[100px] w-full">
          <div className="flex items-center gap-3 text-xs h-6">
            {hwStatus === 'waiting' && <span className="text-text-secondary">Ready to begin sensor signal alignment check.</span>}
            {hwStatus === 'connecting' && <><Loader size={14} className="text-brand-primary animate-spin" /> <span className="text-text-primary">Calibrating signals, please sit still...</span></>}
            {hwStatus === 'connected' && <><BatteryMedium size={14} className="text-status-calm" /> <span className="text-status-calm font-medium">Headset Calibrated & Synced (100%)</span></>}
          </div>

          <AnimatePresence mode="wait">
            {hwStatus === 'waiting' && (
              <motion.div key="equip-btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Button onClick={() => setHwStatus('connecting')} className="h-11 px-8 transition-all duration-300 hover:scale-[1.03]" style={{ backgroundColor: 'var(--brand-primary)', color: '#ffffff', boxShadow: '0 4px 20px rgba(79,70,229,0.3)', border: 'none', fontWeight: 600 }}>
                  <Play size={16} className="mr-2" /> Start Signal Check
                </Button>
              </motion.div>
            )}
            {hwStatus === 'connected' && (
              <motion.div key="start-btn" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Button onClick={() => setSessionState('ACTIVE')} className="h-11 px-8 text-base transition-all duration-300 hover:scale-[1.03]" style={{ backgroundColor: '#86efac', color: '#000000', boxShadow: '0 0 30px rgba(134,239,172,0.4)', border: 'none', fontWeight: 600 }}>
                  Begin Recording Session <Play size={16} className="ml-2" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  if (sessionState === 'COMPLETED') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] w-full animate-fade-in text-center px-4">
        <div className="w-20 h-20 rounded-full bg-status-calm/5 border border-status-calm/20 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(134,239,172,0.15)]">
          <CheckCircle2 size={32} className="text-status-calm" />
        </div>
        <h2 className="text-4xl font-bold tracking-tight text-text-primary mb-2">Session Complete</h2>
        <p className="text-text-secondary max-w-md mx-auto mb-10 leading-relaxed">
          Your telemetry has been successfully recorded. Here is a brief summary of your cognitive performance for this timeframe.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 w-full max-w-lg">
          <Card className="p-6">
            <p className="text-text-muted text-xs uppercase tracking-wider mb-2">Final Focus Score</p>
            <h3 className="text-4xl font-bold text-text-primary tracking-tight">{(sessionAvgFocus).toFixed(0)}<span className="text-lg text-text-muted ml-1">%</span></h3>
          </Card>
          <Card className="p-6">
            <p className="text-text-muted text-xs uppercase tracking-wider mb-2">Final Attention Span</p>
            <h3 className="text-4xl font-bold text-text-primary tracking-tight">{(sessionAvgAttention).toFixed(0)}<span className="text-lg text-text-muted ml-1">%</span></h3>
          </Card>
        </div>

        <div className="w-full max-w-lg mb-10 text-left">
          <h4 className="text-text-primary font-bold mb-4 text-lg">Actionable Insights</h4>
          <ul className="flex flex-col gap-3">
            {(() => {
              const stressStatus = sessionAvgBeta > 22 ? 'High' : sessionAvgBeta > 18 ? 'Elevated' : 'Neutral';
              const insights = [];
              
              if (stressStatus === 'High') {
                insights.push("Your cognitive load indicates High Stress. Step away for a mandatory 5-minute break and practice deep breathing to lower your beta waves.");
              } else if (stressStatus === 'Elevated') {
                insights.push("Your Stress is Elevated. Consider reducing the complexity of your current task or switching to a less demanding activity.");
              } else {
                insights.push("Your Stress levels are Neutral, indicating a stable and healthy cognitive load that shouldn't lead to immediate burnout.");
              }

              if (sessionAvgFocus > 70) {
                insights.push("Excellent Focus Score! You successfully maintained a state of deep concentration. Replicate this environment for future work.");
              } else if (sessionAvgFocus < 50) {
                insights.push(`Your Focus Score was low (${Math.round(sessionAvgFocus)}%). Try turning off mobile notifications to minimize environmental distractions.`);
              } else {
                insights.push("Your Focus Score is moderate. Using the Pomodoro technique (25m work / 5m rest) could help elevate your concentration levels.");
              }

              if (sessionAvgAttention > 70) {
                insights.push("Great Attention Span! Your brain is efficiently processing external stimuli without significant drops in attention.");
              } else if (sessionAvgAttention < 50) {
                insights.push(`Your Attention Span dropped to ${Math.round(sessionAvgAttention)}%. A quick physical stretch or brief walk can stimulate blood flow and refresh attention.`);
              }
              
              return insights.map((suggestion, idx) => (
                <li key={idx} className="bg-white border border-border-subtle p-4 rounded-xl text-sm text-text-secondary leading-relaxed flex items-start gap-3 shadow-sm">
                  <span className="text-[#86efac] font-bold mt-0.5">•</span> 
                  {suggestion}
                </li>
              ));
            })()}
          </ul>
        </div>

        <Button 
          onClick={() => {
            if (activeSocket) {
              activeSocket.close();
              setActiveSocket(null);
            }
            setSessionState('IDLE');
            setHwStatus('waiting');
            setAnswers({});
            setQuizIndex(0);
            setSelectedTest(null);
            setConnectionType('demo');
            setDeviceName('Demo Mode');
            setCalibrationProgress(0);
          }} 
          className="h-12 px-8 text-base transition-all duration-300 hover:scale-[1.03]" 
          style={{ backgroundColor: 'var(--brand-primary)', color: '#ffffff', boxShadow: '0 4px 20px rgba(79,70,229,0.3)' }}
        >
          Restart Session
        </Button>
      </div>
    );
  }

  // ACTIVE Session View
  return (
    <div className="flex flex-col gap-8 w-full animate-fade-in">
      <header className="flex justify-between items-end border-b border-border-subtle pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mb-1">Live Interface</h1>
          <p className="text-text-secondary text-sm">Real-time metrics and brainwave sensor telemetry.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button className="h-8 py-0 text-xs px-3 transition-opacity hover:opacity-80" style={{ backgroundColor: 'transparent', color: '#fca5a5', border: '1px solid rgba(252,165,165,0.4)', boxShadow: '0 0 15px rgba(252,165,165,0.1)' }} onClick={async () => {
            const payload = {
              userId: localStorage.getItem('neuro_user') || 'Admin',
              username: localStorage.getItem('neuro_username') || 'Unknown Subject',
              managerCode: localStorage.getItem('neuro_manager_code') || '',
              date: new Date(),
              duration: 'Live Session',
              avgStress: sessionAvgBeta > 22 ? 'High' : sessionAvgBeta > 18 ? 'Elevated' : 'Neutral',
              avgFocus: `${(sessionAvgFocus).toFixed(0)}%`,
              context: {
                ...answers,
                battery: selectedTest
              },
              waves: eegData 
            };
            try {
              await fetch('https://neuroengage.onrender.com/api/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
              });
            } catch(e) { 
              console.error('Failed to save session to DB:', e); 
            }
            if (activeSocket) {
              activeSocket.close();
              setActiveSocket(null);
            }
            setSessionState('COMPLETED');
          }}>Stop Session</Button>
          {connectionType !== 'demo' && (
            <div className="flex items-center gap-2 bg-brand-primary/10 px-3 py-1.5 rounded border border-brand-primary/20 text-brand-primary text-[11px] font-bold">
              <Signal size={12} />
              <span>{deviceName}</span>
            </div>
          )}
          <div className="flex items-center gap-2 bg-status-calm/10 px-3 py-1.5 rounded border border-status-calm/20">
            <span className="w-2 h-2 rounded-full bg-status-calm animate-pulse"></span>
            <span className="text-status-calm text-xs font-medium uppercase tracking-wider">Sensors Active</span>
          </div>
        </div>
      </header>

      {/* Dynamic Content Area: 100% width or split 2/3s and 1/3 for Quiz */}
      <div className={answers.task === 'Take a Cognitive Quiz' ? "grid grid-cols-1 lg:grid-cols-12 gap-6" : "flex flex-col gap-6"}>
        
        {/* Main Telemetry Block */}
        <div className={answers.task === 'Take a Cognitive Quiz' ? "lg:col-span-8 flex flex-col gap-6" : "w-full flex flex-col gap-6"}>
          {/* Top Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <p className="text-text-muted text-xs uppercase tracking-wider mb-2">Avg Session Load</p>
                <h3 className="text-2xl font-bold text-text-primary tracking-tight">{(sessionAvgBeta).toFixed(1)} <span className="text-sm text-text-muted">Hz</span></h3>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <p className="text-text-muted text-xs uppercase tracking-wider mb-2">Overall Stress</p>
                <h3 className={`text-2xl font-medium tracking-tight ${sessionAvgBeta > 22 ? 'text-status-stress' : 'text-white'}`}>
                  {sessionAvgBeta > 22 ? 'High' : sessionAvgBeta > 18 ? 'Elevated' : 'Neutral'}
                </h3>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <p className="text-text-muted text-xs uppercase tracking-wider mb-2">Emotion</p>
                <h3 className="text-2xl font-medium text-white tracking-tight">
                  {sessionAvgBeta > 22 ? 'Anxious' : sessionAvgBeta > 18 ? 'Focused' : 'Calm'}
                </h3>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <p className="text-text-muted text-xs uppercase tracking-wider mb-2">Cumul. Focus</p>
                <h3 className="text-2xl font-bold text-text-primary tracking-tight">{(sessionAvgFocus).toFixed(0)} <span className="text-sm text-text-muted">%</span></h3>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="w-full">
              <Card className="h-full">
                <CardHeader className="flex flex-row justify-between items-center py-4">
                  <CardTitle className="text-sm flex items-center gap-2 text-text-secondary">
                    <Activity size={14} /> Telemetry
                  </CardTitle>
                  <div className="flex items-center gap-4 text-xs text-text-muted hidden sm:flex">
                     Alpha <div className="w-2 h-2 rounded-full" style={{backgroundColor: C_ALPHA}}></div>
                     Beta <div className="w-2 h-2 rounded-full" style={{backgroundColor: C_BETA}}></div>
                     Gamma <div className="w-2 h-2 rounded-full" style={{backgroundColor: C_GAMMA}}></div>
                  </div>
                </CardHeader>
                <CardContent className="h-64 p-4 pt-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={eegData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <XAxis dataKey="time" hide />
                      <YAxis domain={[0, 100]} hide />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} labelStyle={{ display: 'none' }} />
                      <Line type="monotone" dataKey="alpha" stroke="var(--brand-primary)" strokeWidth={1} dot={false} isAnimationActive={false} />
                      <Line type="monotone" dataKey="beta" stroke="var(--status-stress)" strokeWidth={1} dot={false} isAnimationActive={false} />
                      <Line type="monotone" dataKey="gamma" stroke="var(--brand-accent)" strokeWidth={1} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="w-full">
              <Card className="h-full">
                <CardHeader className="flex flex-row justify-between items-center py-4">
                  <CardTitle className="text-sm flex items-center gap-2 text-text-secondary">
                    <Target size={14} /> Attention Vectors
                  </CardTitle>
                  <div className="flex items-center gap-4 text-xs text-text-muted hidden sm:flex">
                     Focus <div className="w-2 h-2 rounded-full" style={{backgroundColor: C_FOCUS}}></div>
                     Attention <div className="w-2 h-2 rounded-full" style={{backgroundColor: C_ATTENTION}}></div>
                  </div>
                </CardHeader>
                <CardContent className="h-64 p-4 pt-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={eegData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <XAxis dataKey="time" hide />
                      <YAxis domain={[0, 100]} hide />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} labelStyle={{ display: 'none' }} />
                      <Area type="step" dataKey="focus" stroke="var(--brand-primary)" fillOpacity={0} isAnimationActive={false} strokeWidth={1} />
                      <Area type="step" dataKey="attention" stroke="var(--brand-secondary)" fillOpacity={0.05} fill="var(--brand-secondary)" isAnimationActive={false} strokeWidth={1} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Optional Active Quiz Sidebar */}
        {answers.task === 'Take a Cognitive Quiz' && (
          <div className="lg:col-span-4 sticky top-6">
            <QuizSidebar 
              selectedTest={selectedTest}
              onSelectTest={setSelectedTest}
              quizIndex={quizIndex} 
              setQuizIndex={setQuizIndex} 
            />
          </div>
        )}

      </div>
    </div>
  );
};
