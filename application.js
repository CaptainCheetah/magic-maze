var MAGICMAZE = {};

// voice variables
MAGICMAZE.SPEECH = {};
// MAGICMAZE.SPEECH.repeatMsg = '';
MAGICMAZE.SPEECH.talk = function(params){ // s, f, n, callback, callbackvar
	console.log('MAGICMAZE.SPEECH.talk');
	console.log(params);

	// var wait = ((typeof params.w == 'undefined') ? 500 : params.w );

	msg = new SpeechSynthesisUtterance();
		msg.volume = 1; // 0 to 1
		msg.rate = 1;
		msg.pitch = 1;
		msg.voice = MAGICMAZE.SPEECH.voice;


/*
		msg.onend = function(){
			window.speechSynthesis.pause();
			window.setTimeout(function() { window.speechSynthesis.resume() }, wait);
			if (typeof params.callback != 'undefined') {
				params.callback(params.callbackvar);
			}
		}
*/
	msg.text = (( typeof params.s != 'undefined' ) ? params.s : '' );

	console.log(msg);
	window.speechSynthesis.speak(msg);
}

MAGICMAZE.currentTimer = null;
MAGICMAZE.interval = 180;
MAGICMAZE.duration = 180;

MAGICMAZE.timer = function(params){
		window.speechSynthesis.cancel();
		$('#timer').css('color','#FFF');
		$('#flip').prop('disabled',false);
		$('#start').prop('disabled',true);

		MAGICMAZE.duration = ((typeof params != 'undefined' && typeof params.duration != 'undefined') ? params.duration : MAGICMAZE.interval);
		document.getElementById("timer").innerHTML = ((MAGICMAZE.duration - (MAGICMAZE.duration % 60)) / 60).toString().padStart(2, '0') + ":" + (MAGICMAZE.duration % 60).toString().padStart(2, '0');

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
			// document.getElementById("timer").innerHTML = ((MAGICMAZE.duration - (MAGICMAZE.duration % 60)) / 60).toString().padStart(2, '0') + ":" + (MAGICMAZE.duration % 60).toString().padStart(2, '0');
			if (MAGICMAZE.duration == 0) {
				$('#flip').prop('disabled',true);
				clearInterval(MAGICMAZE.currentTimer);
				$('#timer').css('color','#F00');
				MAGICMAZE.SPEECH.talk({'s': 'Game over'});
			} else {
				MAGICMAZE.duration--;
				document.getElementById("timer").innerHTML = ((MAGICMAZE.duration - (MAGICMAZE.duration % 60)) / 60).toString().padStart(2, '0') + ":" + (MAGICMAZE.duration % 60).toString().padStart(2, '0');
				if ([30,20,10,5].indexOf(MAGICMAZE.duration) > -1){
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
	$('#timer').css('color','#FFF');
	$('#flip').prop('disabled',true);
	$('#start').prop('disabled',false);
	clearInterval(MAGICMAZE.currentTimer);
	MAGICMAZE.currentTimer = null;
	MAGICMAZE.duration = MAGICMAZE.interval;
	document.getElementById("timer").innerHTML = ((MAGICMAZE.duration - (MAGICMAZE.duration % 60)) / 60).toString().padStart(2, '0') + ":" + (MAGICMAZE.duration % 60).toString().padStart(2, '0');
}

$(document).ready(function(){

	window.speechSynthesis.onvoiceschanged = function() {

		$.each(window.speechSynthesis.getVoices(), function(idx, voice){
			// console.log(voice.name);
			if (voice.name == 'Google UK English Female'){ // 'Google UK English Male'){
				window.speechSynthesis.onvoiceschanged = false;
				MAGICMAZE.SPEECH.voice = voice;
				MAGICMAZE.SPEECH.talk({'s': 'Welcome to the Magic Maze mall; for all your dungeoneering needs!'});
				// MAGICMAZE.timer();
			}
		});


	}

	window.onbeforeunload = function(){
		window.speechSynthesis.cancel();
	}


});
