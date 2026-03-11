const MAGICMAZE = (() => {
	// Constants
	const DEFAULT_INTERVAL = 180;
	const MAX_TIMER_DURATION = 300; // 5 minutes in seconds
	const ANNOUNCEMENT_INTERVALS = [30, 20, 10, 5];
	const COLOR_THRESHOLDS = {
		SAFE: 60,
		WARNING: 30,
		DANGER: 10
	};

	// State
	const state = {
		currentTimer: null,
		interval: DEFAULT_INTERVAL,
		duration: DEFAULT_INTERVAL,
		lastFlipTime: null,
		targetDuration: DEFAULT_INTERVAL,
		timerEnded: false,
		lastAnnounced: null,
		voice: null,
		timeStrings: []
	};

	// DOM Elements (cached)
	let elements = {};

	// Speech synthesis wrapper
	const speech = {
		isAvailable() {
			return typeof window.speechSynthesis !== 'undefined';
		},
		
		talk(text) {
			if (!text || !this.isAvailable()) return;
			
			try {
				const msg = new SpeechSynthesisUtterance();
				msg.volume = 1;
				msg.rate = 1;
				msg.pitch = 1;
				msg.voice = state.voice;
				msg.text = text;
				
				console.log(msg);
				window.speechSynthesis.speak(msg);
			} catch (error) {
				console.error('Speech synthesis error:', error);
			}
		}
	};

	// Pre-compute formatted time strings for performance
	const initTimeCache = (maxSeconds) => {
		state.timeStrings = new Array(maxSeconds + 1);
		for (let i = 0; i <= maxSeconds; i++) {
			const mins = Math.floor(i / 60);
			const secs = i % 60;
			state.timeStrings[i] = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
		}
	};

	// Helper function to safely get formatted time string with bounds checking
	const getTimeString = (seconds) => {
		if (seconds <= MAX_TIMER_DURATION && state.timeStrings[seconds]) {
			return state.timeStrings[seconds];
		}
		// Fallback formatting for values outside cache bounds
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
	};

	// Helper function to format time for announcements
	const formatTimeAnnouncement = (seconds) => {
		if (seconds === 0) return 'out of time - game over';
		
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		const parts = [];
		
		if (mins > 0) {
			parts.push(`${mins} ${mins === 1 ? 'minute' : 'minutes'}`);
		}
		if (secs > 0) {
			parts.push(`${secs} ${secs === 1 ? 'second' : 'seconds'}`);
		}
		
		return parts.join(' and ');
	};

	// Set color status based on time remaining
	const setColorStatus = (timeLeft = DEFAULT_INTERVAL) => {
		let newClass = 'safe';
		
		if (timeLeft > COLOR_THRESHOLDS.SAFE) {
			newClass = 'safe';
		} else if (timeLeft > COLOR_THRESHOLDS.WARNING) {
			newClass = 'warning';
		} else if (timeLeft > COLOR_THRESHOLDS.DANGER) {
			newClass = 'danger';
		} else {
			newClass = 'critical';
		}
		
		document.body.className = newClass;
	};

	// Start timer
	const startTimer = (params = {}) => {
		if (speech.isAvailable()) {
			window.speechSynthesis.cancel();
		}
		elements.timer.style.color = '#000';
		elements.flipBtn.disabled = false;
		elements.startBtn.disabled = true;

		// Initialize delta-based timing
		let duration = params.duration ?? state.interval;
		if (duration < 0 || !Number.isFinite(duration)) {
			duration = state.interval;
		}
		
		state.lastFlipTime = Date.now();
		state.targetDuration = duration;
		state.timerEnded = false;
		state.lastAnnounced = null;
		
		// Clear any existing timer
		if (state.currentTimer) {
			clearInterval(state.currentTimer);
			speech.talk('Pass all action tiles to the left.');
		}

		// Initial display update
		state.duration = duration;
		elements.timer.textContent = getTimeString(duration);

		// Initial announcement
		speech.talk(`${formatTimeAnnouncement(duration)} remaining`);

		// Update function using delta-based timing
		const updateTimer = () => {
			const now = Date.now();
			const elapsed = Math.floor((now - state.lastFlipTime) / 1000);
			const remaining = Math.max(0, state.targetDuration - elapsed);
			
			// Update display
			elements.timer.textContent = getTimeString(remaining);
			setColorStatus(remaining);
			
			// Voice announcements at specific intervals
			if (ANNOUNCEMENT_INTERVALS.includes(remaining) && remaining !== state.lastAnnounced) {
				if (speech.isAvailable()) {
					window.speechSynthesis.cancel();
				}
				setTimeout(() => {
					speech.talk(`${remaining} seconds remaining`);
				}, 50);
				state.lastAnnounced = remaining;
			}
			
			// Timer end
			if (remaining === 0 && !state.timerEnded) {
				state.timerEnded = true;
				clearInterval(state.currentTimer);
				if (speech.isAvailable()) {
					window.speechSynthesis.cancel();
				}
				elements.flipBtn.disabled = true;
				speech.talk('Game over');
			}
		};

		// Start updates (1000ms for second-level precision)
		updateTimer();
		state.currentTimer = setInterval(updateTimer, 1000);
	};

	// Flip timer
	const flipTimer = () => {
		// Calculate current remaining time using delta
		const now = Date.now();
		const elapsed = Math.floor((now - state.lastFlipTime) / 1000);
		const currentRemaining = Math.max(0, state.targetDuration - elapsed);
		
		// Invert time (flip the hourglass)
		const newDuration = state.targetDuration - currentRemaining;
		
		// Reset timing reference for new duration
		state.lastFlipTime = now;
		state.targetDuration = newDuration;
		state.lastAnnounced = null;
		state.timerEnded = false;
		
		// Update display immediately
		state.duration = newDuration;
		elements.timer.textContent = state.timeStrings[newDuration];
		setColorStatus(newDuration);
		
		// Announce
		if (speech.isAvailable()) {
			window.speechSynthesis.cancel();
		}
		setTimeout(() => {
			speech.talk(`Pass all action tiles to the left. ${formatTimeAnnouncement(newDuration)} remaining`);
		}, 50);
	};

	// Reset timer
	const resetTimer = () => {
		if (speech.isAvailable()) {
			window.speechSynthesis.cancel();
		}
		document.body.className = 'safe';
		elements.timer.style.color = '#000';
		elements.flipBtn.disabled = true;
		elements.startBtn.disabled = false;
		
		if (state.currentTimer) {
			clearInterval(state.currentTimer);
			state.currentTimer = null;
		}
		
		state.duration = state.interval;
		state.lastFlipTime = null;
		state.targetDuration = state.interval;
		state.timerEnded = false;
		state.lastAnnounced = null;
		elements.timer.textContent = state.timeStrings[state.interval];
	};

	// Initialize voices
	const initVoices = () => {
		if (!speech.isAvailable()) {
			console.warn('Speech Synthesis API not available');
			return;
		}
		
		const voices = window.speechSynthesis.getVoices();
		
		// Return early if voices haven't loaded yet
		if (voices.length === 0) {
			return;
		}
		
		// Try to find preferred voice
		const preferredVoice = voices.find(voice =>
			voice.name === 'Daniel' && voice.lang === 'en-GB'
		);
		
		if (preferredVoice) {
			state.voice = preferredVoice;
		} else {
			// Fallback: Find any English voice
			const englishVoice = voices.find(voice =>
				voice.lang.startsWith('en')
			);
			
			if (englishVoice) {
				state.voice = englishVoice;
				console.log(`Using fallback voice: ${englishVoice.name}`);
			} else {
				// Last resort: use first available voice
				state.voice = voices[0];
				console.log(`Using default voice: ${voices[0].name}`);
			}
		}
		
		// Clear the event handler once voice is set
		if (state.voice) {
			window.speechSynthesis.onvoiceschanged = null;
			speech.talk('Welcome to the Magic Maze mall; for all your adventuring needs!');
		}
	};

	// Initialize application
	const init = () => {
		// Cache DOM elements
		elements = {
			timer: document.getElementById('timer'),
			startBtn: document.getElementById('start'),
			resetBtn: document.getElementById('reset'),
			flipBtn: document.getElementById('flip')
		};

		// Initialize time cache for performance
		initTimeCache(MAX_TIMER_DURATION);
		
		// Initialize display
		elements.timer.textContent = state.timeStrings[state.interval];
		
		// Initialize voices
		initVoices();
		if (typeof window.speechSynthesis !== 'undefined' && window.speechSynthesis.onvoiceschanged !== undefined) {
			window.speechSynthesis.onvoiceschanged = initVoices;
		}
		
		// Cleanup on page unload
		window.addEventListener('beforeunload', () => {
			if (speech.isAvailable()) {
				window.speechSynthesis.cancel();
			}
		});
	};

	// Public API
	return {
		init,
		startTimer,
		flipTimer,
		resetTimer
	};
})();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', MAGICMAZE.init);
} else {
	MAGICMAZE.init();
}
