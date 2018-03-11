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

MAGICMAZE.currentTimer = null;
MAGICMAZE.interval = 180;
MAGICMAZE.duration = 180;

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

		MAGICMAZE.duration = ((typeof params != 'undefined' && typeof params.duration != 'undefined') ? params.duration : MAGICMAZE.interval);
		$('#timer').html(((MAGICMAZE.duration - (MAGICMAZE.duration % 60)) / 60).toString().padStart(2, '0') + ":" + (MAGICMAZE.duration % 60).toString().padStart(2, '0'));

		MAGICMAZE.SPEECH.talk({'s':
			(((MAGICMAZE.duration - (MAGICMAZE.duration % 60)) / 60) ? ((MAGICMAZE.duration - (MAGICMAZE.duration % 60)) / 60) + ' minutes': '' ) +
			(( (MAGICMAZE.duration % 60) && ((MAGICMAZE.duration - (MAGICMAZE.duration % 60)) / 60) ) ? ' and'  : '')+
			((MAGICMAZE.duration % 60) ? (MAGICMAZE.duration % 60) + ' seconds' : '' ) +
			' remaining'
		});
		
		if (MAGICMAZE.currentTimer){
			clearInterval(MAGICMAZE.currentTimer);
			MAGICMAZE.SPEECH.talk({'s': 'Pass all action tiles to the left.'});
		}

		MAGICMAZE.currentTimer = setInterval(function() {
			MAGICMAZE.setColorStatus(MAGICMAZE.duration);
			if (MAGICMAZE.duration == 0) {
				window.speechSynthesis.cancel();
				$('#flip').prop('disabled',true);
				clearInterval(MAGICMAZE.currentTimer);
				// $('#timer').css('color','#F00');
				MAGICMAZE.SPEECH.talk({'s': 'Game over'});
			} else {
				MAGICMAZE.duration--;
				$('#timer').html(((MAGICMAZE.duration - (MAGICMAZE.duration % 60)) / 60).toString().padStart(2, '0') + ":" + (MAGICMAZE.duration % 60).toString().padStart(2, '0'));
				if ([30,20,10,5].indexOf(MAGICMAZE.duration) > -1){
					window.speechSynthesis.cancel();
					MAGICMAZE.SPEECH.talk({'s': MAGICMAZE.duration + ' seconds remaining'});
				}
			}
		}, 1000);
}

MAGICMAZE.flipTimer = function(){
	MAGICMAZE.timer({'duration' : (MAGICMAZE.interval - MAGICMAZE.duration)});
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
	$('#timer').html(((MAGICMAZE.duration - (MAGICMAZE.duration % 60)) / 60).toString().padStart(2, '0') + ":" + (MAGICMAZE.duration % 60).toString().padStart(2, '0'));
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
	MAGICMAZE.initVoices();
	if (typeof window.speechSynthesis !== 'undefined' && window.speechSynthesis.onvoiceschanged !== undefined) {
  		window.speechSynthesis.onvoiceschanged = MAGICMAZE.initVoices;
	}
	window.onbeforeunload = function(){
		window.speechSynthesis.cancel();
	}


});
