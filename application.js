var MAGICMAZE = {};

// voice variables
MAGICMAZE.SPEECH = {};
MAGICMAZE.SPEECH.talk = function(params){
	msg = new SpeechSynthesisUtterance();
		msg.volume = 1; // 0 to 1
		msg.rate = 1;
		msg.pitch = 1;
		msg.voice = MAGICMAZE.SPEECH.voice;
	
	msg.text = (( typeof params.s != 'undefined' ) ? params.s : '' );

	console.log(msg);
	window.speechSynthesis.speak(msg);
}

// Timer state variables
MAGICMAZE.currentTimer = null;
MAGICMAZE.interval = 180;
MAGICMAZE.duration = 180;
MAGICMAZE.startTime = null;
MAGICMAZE.lastFlipTime = null;
MAGICMAZE.targetDuration = 180;
MAGICMAZE.timerEnded = false;
MAGICMAZE.lastAnnounced = null;

// Pre-compute formatted time strings for performance
MAGICMAZE.timeStrings = [];
MAGICMAZE.initTimeCache = function(maxSeconds) {
	MAGICMAZE.timeStrings = new Array(maxSeconds + 1);
	for (var i = 0; i <= maxSeconds; i++) {
		var mins = Math.floor(i / 60);
		var secs = i % 60;
		MAGICMAZE.timeStrings[i] =
			String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
	}
};

// Helper function to format time for announcements
MAGICMAZE.formatTimeAnnouncement = function(seconds) {
	var mins = Math.floor(seconds / 60);
	var secs = seconds % 60;
	var announcement = '';
	
	if (mins > 0) {
		announcement += mins + (mins === 1 ? ' minute' : ' minutes');
	}
	if (mins > 0 && secs > 0) {
		announcement += ' and ';
	}
	if (secs > 0) {
		announcement += secs + (secs === 1 ? ' second' : ' seconds');
	}
	
	return announcement;
};

MAGICMAZE.setColorStatus = function(t){
	var timeLeft = ((typeof t == 'number') ? t : 180);
	var newClass = 'safe';
	
	if (timeLeft > 60){
		newClass = 'safe';
	} else if (timeLeft > 30) {
		newClass = 'warning';
	} else if (timeLeft > 10) {
		newClass = 'danger';
	} else {
		newClass = 'critical';
	}
	$('body').removeClass().addClass(newClass);
}

MAGICMAZE.timer = function(params){
		
		window.speechSynthesis.cancel();
		$('#timer').css('color','#000');
		$('#flip').prop('disabled',false);
		$('#start').prop('disabled',true);

		// Initialize delta-based timing
		var duration = ((typeof params != 'undefined' && typeof params.duration != 'undefined') ? params.duration : MAGICMAZE.interval);
		MAGICMAZE.startTime = Date.now();
		MAGICMAZE.lastFlipTime = MAGICMAZE.startTime;
		MAGICMAZE.targetDuration = duration;
		MAGICMAZE.timerEnded = false;
		MAGICMAZE.lastAnnounced = null;
		
		// Clear any existing timer
		if (MAGICMAZE.currentTimer){
			clearInterval(MAGICMAZE.currentTimer);
			MAGICMAZE.SPEECH.talk({'s': 'Pass all action tiles to the left.'});
		}

		// Initial display update
		MAGICMAZE.duration = duration;
		$('#timer').html(MAGICMAZE.timeStrings[duration]);

		// Initial announcement
		MAGICMAZE.SPEECH.talk({'s': MAGICMAZE.formatTimeAnnouncement(duration) + ' remaining'});

		// Update function using delta-based timing
		var updateTimer = function() {
			var now = Date.now();
			var elapsed = Math.floor((now - MAGICMAZE.lastFlipTime) / 1000);
			var remaining = Math.max(0, MAGICMAZE.targetDuration - elapsed);
			
			MAGICMAZE.duration = remaining;
			
			// Update display
			$('#timer').html(MAGICMAZE.timeStrings[remaining]);
			MAGICMAZE.setColorStatus(remaining);
			
			// Voice announcements at specific intervals
			if ([30, 20, 10, 5].indexOf(remaining) > -1 && remaining !== MAGICMAZE.lastAnnounced) {
				window.speechSynthesis.cancel();
				MAGICMAZE.SPEECH.talk({'s': remaining + ' seconds remaining'});
				MAGICMAZE.lastAnnounced = remaining;
			}
			
			// Timer end
			if (remaining === 0 && !MAGICMAZE.timerEnded) {
				MAGICMAZE.timerEnded = true;
				clearInterval(MAGICMAZE.currentTimer);
				window.speechSynthesis.cancel();
				$('#flip').prop('disabled', true);
				MAGICMAZE.SPEECH.talk({'s': 'Game over'});
			}
		};

		// Start updates (100ms for smooth display, but accuracy from delta)
		updateTimer();
		MAGICMAZE.currentTimer = setInterval(updateTimer, 100);
}

MAGICMAZE.flipTimer = function(){
	// Calculate current remaining time using delta
	var now = Date.now();
	var elapsed = Math.floor((now - MAGICMAZE.lastFlipTime) / 1000);
	var currentRemaining = Math.max(0, MAGICMAZE.targetDuration - elapsed);
	
	// Invert time (flip the hourglass)
	var newDuration = MAGICMAZE.targetDuration - currentRemaining;
	
	// Reset timing reference for new duration
	MAGICMAZE.lastFlipTime = now;
	MAGICMAZE.targetDuration = newDuration;
	MAGICMAZE.lastAnnounced = null;
	MAGICMAZE.timerEnded = false;
	
	// Update display immediately
	MAGICMAZE.duration = newDuration;
	$('#timer').html(MAGICMAZE.timeStrings[newDuration]);
	MAGICMAZE.setColorStatus(newDuration);
	
	// Announce
	window.speechSynthesis.cancel();
	MAGICMAZE.SPEECH.talk({
		's': 'Pass all action tiles to the left. ' +
		     MAGICMAZE.formatTimeAnnouncement(newDuration) + ' remaining'
	});
}
MAGICMAZE.resetTimer = function(){
	window.speechSynthesis.cancel();
	$('body').removeClass().addClass('safe');
	$('#timer').css('color','#000');
	$('#flip').prop('disabled',true);
	$('#start').prop('disabled',false);
	clearInterval(MAGICMAZE.currentTimer);
	MAGICMAZE.currentTimer = null;
	MAGICMAZE.duration = MAGICMAZE.interval;
	MAGICMAZE.startTime = null;
	MAGICMAZE.lastFlipTime = null;
	MAGICMAZE.targetDuration = MAGICMAZE.interval;
	MAGICMAZE.timerEnded = false;
	MAGICMAZE.lastAnnounced = null;
	$('#timer').html(MAGICMAZE.timeStrings[MAGICMAZE.interval]);
}

MAGICMAZE.initVoices = function(){
	if(typeof window.speechSynthesis === 'undefined') {
		return;
	}
	
	$.each(window.speechSynthesis.getVoices(), function(idx, voice){
		if (voice.name == 'Daniel' && voice.lang == 'en-GB'){ // 'Google UK English Male'
			window.speechSynthesis.onvoiceschanged = false;
			MAGICMAZE.SPEECH.voice = voice;
			MAGICMAZE.SPEECH.talk({'s': 'Welcome to the Magic Maze mall; for all your adventuring needs!'});
			return;
		}
	});
}

$(document).ready(function(){
	// Initialize time cache for performance
	MAGICMAZE.initTimeCache(300); // Support up to 5 minutes
	
	// Initialize display
	$('#timer').html(MAGICMAZE.timeStrings[MAGICMAZE.interval]);
	
	// Initialize voices
	MAGICMAZE.initVoices();
	if (typeof window.speechSynthesis !== 'undefined' && window.speechSynthesis.onvoiceschanged !== undefined) {
  		window.speechSynthesis.onvoiceschanged = MAGICMAZE.initVoices;
	}
	window.onbeforeunload = function(){
		window.speechSynthesis.cancel();
	}
});
