import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Play, Pause, SkipForward, SkipBack, Heart,
  User, Music, Zap, Coffee, CloudRain, RotateCcw
} from 'lucide-react';

// Safe fallback to avoid blank-screen runtime issues from animation libs.
const motion = { div: 'div', button: 'button' };

const USERS_STORAGE_KEY = 'moodsync_users';
const MOOD_OPTIONS = [
  { id: 'Happy', icon: <Zap size={18} /> },
  { id: 'Calm', icon: <Coffee size={18} /> },
  { id: 'Sad', icon: <CloudRain size={18} /> }
];
const LANGUAGE_FILTERS = ['All', 'Hindi', 'English'];
const q = (question, answers) => ({ q: question, a: answers.map(([text, mood]) => ({ text, mood })) });

const loadUsers = () => {
  try {
    const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
};

const saveUsers = (users) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

const ALL_SONGS = [
  { id: 37, title: "One Dance", artist: "Drake", mood: "Happy", language: "english", url: "/songs/one_dance.mp3" },
  { id: 38, title: "Baby", artist: "Justin Bieber", mood: "Happy", language: "english", url: "/songs/baby.mp3" },
  { id: 39, title: "Last Friday Night", artist: "Katy Perry", mood: "Happy", language: "english", url: "/songs/last_friday_night.mp3" },
  { id: 40, title: "Obsessed", artist: "Mariah Carey", mood: "Happy", language: "english", url: "/songs/obsessed.mp3" },
  { id: 41, title: "What Makes You Beautiful", artist: "One Direction", mood: "Happy", language: "english", url: "/songs/what_makes_you_beautiful.mp3" },
  { id: 42, title: "Levitating", artist: "Dua Lipa", mood: "Happy", language: "english", url: "/songs/levitating.mp3" },
  { id: 43, title: "Gasolina", artist: "Daddy Yankee", mood: "Happy", language: "english", url: "/songs/gasolina.mp3" },
  { id: 44, title: "One Kiss", artist: "Calvin Harris & Dua Lipa", mood: "Happy", language: "english", url: "/songs/one_kiss.mp3" },
  { id: 21, title: "Dope Shope", artist: "Honey Singh", mood: "Happy", language: "hindi", url: "/songs/dope_shope.mp3" },
  { id: 22, title: "Angreji Beat", artist: "Honey Singh", mood: "Happy", language: "hindi", url: "/songs/angreji_beat.mp3" },
  { id: 23, title: "Party All Night", artist: "Honey Singh", mood: "Happy", language: "hindi", url: "/songs/party_all_night.mp3" },
  { id: 24, title: "Chaar Botal Vodka", artist: "Honey Singh", mood: "Happy", language: "hindi", url: "/songs/chaar_botal_vodka.mp3" },
  { id: 25, title: "Vele", artist: "Vishal-Shekhar", mood: "Happy", language: "hindi", url: "/songs/vele.mp3" },
  { id: 26, title: "Blue Eyes", artist: "Honey Singh", mood: "Happy", language: "hindi", url: "/songs/blue_eyes.mp3" },
  { id: 27, title: "Brown Rang", artist: "Honey Singh", mood: "Happy", language: "hindi", url: "/songs/brown_rang.mp3" },
  { id: 28, title: "Desi Kalakaar", artist: "Honey Singh", mood: "Happy", language: "hindi", url: "/songs/desi_kalakaar.mp3" },
  { id: 50, title: "white ferrari", artist: "Frank Ocean", mood: "Calm", language: "english", url: "/songs/white_ferrari.mp3" },
  { id: 51, title: "thinking bout you", artist: "Frank Ocean", mood: "Calm", language: "english", url: "/songs/thinking_bout_you.mp3" },
  { id: 29, title: "Hosanna", artist: "A.R. Rahman", mood: "Calm", language: "hindi", url: "/songs/hosanna.mp3" },
  { id: 30, title: "Subhanallah", artist: "Sreerama Chandra", mood: "Calm", language: "hindi", url: "/songs/subhanallah.mp3" },
  { id: 31, title: "Tu Hi Hai", artist: "Arijit Singh", mood: "Calm", language: "hindi", url: "/songs/tu_hi_hai.mp3" },
  { id: 32, title: "Katiya Karun", artist: "Harshdeep Kaur", mood: "Calm", language: "hindi", url: "/songs/katiya_karun.mp3" },
  { id: 33, title: "Sauda Hai Dil Ka", artist: "Anupam Amod", mood: "Calm", language: "hindi", url: "/songs/sauda_hai_dil_ka.mp3" },
  { id: 34, title: "Mere Liye Tum Kaafi Ho", artist: "Ayushmann Khurrana", mood: "Calm", language: "hindi", url: "/songs/mere_liye_tum_kaafi_ho.mp3" },
  { id: 35, title: "Titli", artist: "Chinmayi Sripaada", mood: "Calm", language: "hindi", url: "/songs/titli.mp3" },
  { id: 36, title: "Jab Tak", artist: "Armaan Malik", mood: "Calm", language: "hindi", url: "/songs/jab_tak.mp3" },
  { id: 9, title: "cigarettes out the window", artist: "TV Girl", mood: "Sad", language: "english", url: "/songs/cigarettes_out_the_window.mp3" },
  { id: 10, title: "daddy issues", artist: "The Neighbourhood", mood: "Sad", language: "english", url: "/songs/daddy_issues.mp3" },
  { id: 11, title: "blue hair", artist: "TV Girl", mood: "Sad", language: "english", url: "/songs/blue_hair.mp3" },
  { id: 12, title: "sad", artist: "XXXTENTACION", mood: "Sad", language: "english", url: "/songs/sad.mp3" },
  { id: 45, title: "american wedding", artist: "Frank Ocean", mood: "Sad", language: "english", url: "/songs/american_wedding.mp3" },
  { id: 46, title: "505", artist: "Arctic Monkeys", mood: "Sad", language: "english", url: "/songs/505.mp3" },
  { id: 47, title: "dancing with your ghost", artist: "Sasha Alex Sloan", mood: "Sad", language: "english", url: "/songs/dancing_with_your_ghost.mp3" },
  { id: 49, title: "moonlight", artist: "XXXTENTACION", mood: "Sad", language: "english", url: "/songs/moonlight.mp3" },
  { id: 13, title: "Paaro", artist: "Aditya Rikhari", mood: "Sad", language: "hindi", url: "/songs/paaro.mp3" },
  { id: 14, title: "Dooron Dooron", artist: "Vishal Mishra", mood: "Sad", language: "hindi", url: "/songs/dooron_dooron.mp3" },
  { id: 15, title: "Kun Faya Kun", artist: "A.R. Rahman", mood: "Sad", language: "hindi", url: "/songs/kun_faya_kun.mp3" },
  { id: 16, title: "Ye Tune Kya Kiya", artist: "Javed Bashir", mood: "Sad", language: "hindi", url: "/songs/ye_tune_kya_kiya.mp3" },
  { id: 17, title: "Husn", artist: "Anuv Jain", mood: "Sad", language: "hindi", url: "/songs/husn.mp3" },
  { id: 18, title: "Oh Meri Laila", artist: "Atif Aslam", mood: "Sad", language: "hindi", url: "/songs/oh_meri_laila.mp3" },
  { id: 19, title: "Tu Jaane Na", artist: "Atif Aslam", mood: "Sad", language: "hindi", url: "/songs/tu_jaane_na.mp3" },
  { id: 20, title: "Abhi Na Jao Chhod Kar", artist: "Mohammed Rafi & Asha Bhosle", mood: "Sad", language: "hindi", url: "/songs/abhi_na_jao.mp3" }
];

const QUESTIONS = [
  q("What lighting matches your current energy?", [["Bright and Sunlight", "Happy"], ["Soft and Cozy", "Calm"], ["Dim and Moody", "Sad"]]),
  q("Pick an environment to teleport to right now.", [["Sunlit Beach", "Happy"], ["Quiet Library", "Calm"], ["Rainy Coffee Shop", "Sad"]]),
  q("How would you describe your current pace?", [["Racing and Excited", "Happy"], ["Steady and Flowing", "Calm"], ["Slow and Pensive", "Sad"]]),
  q("If your mood was a color, what would it be?", [["Electric Yellow", "Happy"], ["Deep Ocean Blue", "Calm"], ["Misty Charcoal", "Sad"]]),
  q("What activity sounds most appealing?", [["Festival / Party", "Happy"], ["Stargazing", "Calm"], ["Journaling", "Sad"]])
];

const LoginView = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login');
  const [message, setMessage] = useState('');
  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setMessage('');
  };

  const handleAuth = () => {
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!normalizedEmail || !trimmedPassword) {
      setMessage('Please fill in email and password.');
      return;
    }

    const users = loadUsers();
    const existingUser = users.find(u => u.email === normalizedEmail);

    if (mode === 'signup') {
      if (existingUser) {
        setMessage('Account already exists. Please log in.');
        setMode('login');
        return;
      }

      const updatedUsers = [...users, { email: normalizedEmail, password: trimmedPassword }];
      saveUsers(updatedUsers);
      setMessage('Account created! You can log in now.');
      setMode('login');
      setPassword('');
      return;
    }

    if (!existingUser || existingUser.password !== trimmedPassword) {
      setMessage('Invalid email or password.');
      return;
    }

    setMessage('');
    onLogin(normalizedEmail.split('@')[0] || 'User');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="premium-card red-glow-hover"
      style={{ width: '400px' }}
    >
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--primary)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>MoodSync</h1>
        <p style={{ color: "var(--text-dim)" }}>Harmony in every beat.</p>
      </div>
      <div className="input-group">
        <label>Email Address</label>
        <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div className="input-group">
        <label>Password</label>
        <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      {!!message && (
        <p style={{ fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '1rem' }}>{message}</p>
      )}
      <button className="btn-primary" style={{ width: '100%' }} onClick={handleAuth}>
        {mode === 'login' ? 'Login' : 'Sign up'} <Zap size={18} />
      </button>
      <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: "var(--text-dim)" }}>
        {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
        <span
          style={{ color: 'var(--primary)', cursor: 'pointer' }}
          onClick={toggleMode}
        >
          {mode === 'login' ? 'Sign up' : 'Login'}
        </span>
      </p>
    </motion.div>
  );
};

const QuizView = ({ onComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scores, setScores] = useState({ Happy: 0, Calm: 0, Sad: 0 });

  const handleAnswer = (mood) => {
    const newScores = { ...scores, [mood]: scores[mood] + 1 };
    setScores(newScores);
    if (currentIdx < QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      const winner = Object.keys(newScores).reduce((a, b) => newScores[a] > newScores[b] ? a : b);
      onComplete(winner);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="premium-card"
      style={{ width: '600px', textAlign: 'center' }}
    >
      <p style={{ color: 'var(--primary)', fontWeight: '700', marginBottom: '1rem' }}>
        QUESTION {currentIdx + 1} OF {QUESTIONS.length}
      </p>
      <h2 style={{ fontSize: '1.8rem', marginBottom: '2.5rem' }}>{QUESTIONS[currentIdx].q}</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {QUESTIONS[currentIdx].a.map((ans, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary"
            style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'var(--secondary)' }}
            onClick={() => handleAnswer(ans.mood)}
          >
            {ans.text}
          </motion.button>
        ))}
      </div>

      <div style={{ marginTop: '2.5rem', height: '6px', background: 'var(--glass)', borderRadius: '10px', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${((currentIdx + 1) / QUESTIONS.length) * 100}%` }}
          style={{ height: '100%', background: 'var(--primary)' }}
        />
      </div>
    </motion.div>
  );
};

const DashboardView = ({ user, mood, setMood, setView }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [filter, setFilter] = useState('All');
  const audioRef = useRef(new Audio());

  const playlist = useMemo(() => {
    return ALL_SONGS.filter(s => {
      const moodMatch = s.mood === mood;
      const langMatch = filter === 'All' || s.language === filter.toLowerCase();
      return moodMatch && langMatch;
    });
  }, [mood, filter]);

  const currentSongIndex = useMemo(() => {
    if (!currentSong) return -1;
    return playlist.findIndex(song => song.id === currentSong.id);
  }, [playlist, currentSong]);

  useEffect(() => {
    const audio = audioRef.current;
    if (currentSong?.url) {
      const songUrl = currentSong.url.startsWith('/') ? currentSong.url : '/' + currentSong.url;
      const currentSrcPath = new URL(audio.src, window.location.origin).pathname;

      if (currentSrcPath !== songUrl) {
        audio.src = currentSong.url;
        audio.load();
        if (isPlaying) audio.play().catch(e => console.log("Playback blocked:", e));
      }
    } else {
      audio.pause();
      audio.src = '';
    }
  }, [currentSong]);

  useEffect(() => {
    if (isPlaying && currentSong?.url) {
      audioRef.current.play().catch(e => console.log("Playback blocked:", e));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      audioRef.current.pause();
      audioRef.current.src = "";
    };
  }, []);

  const toggleFavorite = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const goToAdjacentSong = (direction) => {
    if (!playlist.length) return;

    const baseIndex = currentSongIndex >= 0 ? currentSongIndex : 0;
    const nextIndex = (baseIndex + direction + playlist.length) % playlist.length;
    setCurrentSong(playlist[nextIndex]);
    setIsPlaying(true);
  };

  return (
    <div style={{ width: '100%', maxWidth: '1200px', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '10px' }}><Music size={24} /></div>
          <h2 style={{ letterSpacing: '2px', fontSize: '1.2rem', fontWeight: '800' }}>MOODSYNC</h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--glass)', padding: '6px 15px', borderRadius: '15px', border: '1px solid var(--glass-border)' }}>
          <button 
            onClick={() => { audioRef.current.pause(); setView('quiz'); }}
            title="Retake Quiz"
            className="icon-btn"
            style={{ color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <RotateCcw size={18} />
          </button>
          <div style={{ width: '1px', height: '20px', background: 'var(--glass-border)' }} />
          {MOOD_OPTIONS.map(m => (
            <button
              key={m.id}
              onClick={() => { 
                setIsPlaying(false);
                setCurrentSong(null);
                setMood(m.id); 
              }}
              title={`Switch to ${m.id}`}
              className={`mood-btn ${mood === m.id ? 'active' : ''}`}
              style={{ 
                color: mood === m.id ? 'var(--primary)' : 'var(--text-dim)', 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                transition: 'var(--transition)',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {m.icon}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: '700', fontSize: '0.9rem' }}>{user}</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '600' }}>MOOD: {mood.toUpperCase()}</p>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(45deg, #8B0000, #333)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={20} /></div>
          </div>
        </div>
      </header>

      <section style={{ display: 'flex', justifyContent: 'center' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="premium-card"
          style={{
            width: '100%', maxWidth: '600px',
            background: 'linear-gradient(135deg, #1a1a1a 0%, #0b0b0b 100%)',
            textAlign: 'center', borderTop: '2px solid var(--primary)'
          }}
        >
          <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', letterSpacing: '4px', marginBottom: '1.5rem' }}>NOW PLAYING</p>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{currentSong?.title || "Pick a Song"}</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', marginBottom: '2rem' }}>{currentSong?.artist || "Start the rhythm"}</p>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '3rem', marginBottom: '1.5rem' }}>
            <button
              className="icon-btn"
              style={{ background: 'none', border: 'none', color: 'white' }}
              onClick={() => goToAdjacentSong(-1)}
            >
              <SkipBack size={32} />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{ background: 'var(--primary)', border: 'none', width: '70px', height: '70px', borderRadius: '50%', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {isPlaying ? <Pause size={32} /> : <Play size={32} fill="white" />}
            </button>
            <button
              className="icon-btn"
              style={{ background: 'none', border: 'none', color: 'white' }}
              onClick={() => goToAdjacentSong(1)}
            >
              <SkipForward size={32} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--primary)', fontSize: '0.8rem', justifyContent: 'center' }}>
            <span style={{ padding: '4px 12px', background: 'rgba(139,0,0,0.2)', borderRadius: '20px', fontWeight: 'bold' }}>{mood}</span>
          </div>
        </motion.div>
      </section>

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.5rem' }}>Your {mood} Playlist</h3>
          <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--glass)', padding: '4px', borderRadius: '12px' }}>
            {LANGUAGE_FILTERS.map(lang => (
              <button
                key={lang}
                onClick={() => setFilter(lang)}
                className={`filter-btn ${filter === lang ? 'active' : ''}`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {playlist.map(song => (
            <motion.div
              key={song.id}
              whileHover={{ scale: 1.03 }}
              className="premium-card red-glow-hover"
              style={{ padding: '1.5rem', cursor: 'pointer', background: 'rgba(255,255,255,0.02)', position: 'relative' }}
              onClick={() => { setCurrentSong(song); setIsPlaying(true); }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '0.3rem' }}>{song.title}</h4>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>{song.artist}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(song.id); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <Heart size={20} fill={favorites.includes(song.id) ? "var(--primary)" : "none"} color={favorites.includes(song.id) ? "var(--primary)" : "var(--text-dim)"} />
                </button>
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.8rem' }}>
                <span className="mood-tag" style={{ fontSize: '0.7rem' }}>{song.mood}</span>
                <span className="lang-tag">{song.language}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

function App() {
  const [view, setView] = useState('login');
  const [user, setUser] = useState('');
  const [mood, setMood] = useState(null);

  const handleLogin = (name) => {
    setUser(name);
    setView('quiz');
  };

  const handleQuizComplete = (detectedMood) => {
    setMood(detectedMood);
    setView('dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: view === 'dashboard' ? 'flex-start' : 'center',
      padding: '2rem',
      backgroundColor: 'var(--bg-dark)'
    }}>
      {view === 'login' && <LoginView onLogin={handleLogin} />}
      {view === 'quiz' && <QuizView onComplete={handleQuizComplete} />}
      {view === 'dashboard' && <DashboardView user={user} mood={mood} setMood={setMood} setView={setView} />}
    </div>
  );
}

export default App;
