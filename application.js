const magicMaze = {
  currentTimer: null,
  interval: 180,
  duration: 180,

  timer(params) {
    $('#flip').prop('disabled', false)
    $('#start').prop('disabled', true)

    magicMaze.duration = (
      (typeof params !== 'undefined' && typeof params.duration !== 'undefined') ?
        params.duration :
        magicMaze.interval
    )
    $('#timer').html(((magicMaze.duration - (magicMaze.duration % 60)) / 60).toString().padStart(2, '0') + ":" + (magicMaze.duration % 60).toString().padStart(2, '0'))

    if (magicMaze.currentTimer) {
      clearInterval(magicMaze.currentTimer)
    }

    magicMaze.currentTimer = setInterval(function () {
      if (magicMaze.duration < 30) {
        $('body').removeClass('green').addClass('red')
      } else {
        $('body').removeClass('red').addClass('green')
      }
      if (magicMaze.duration === 0) {
        $('#flip').prop('disabled', true)
        clearInterval(magicMaze.currentTimer)
      } else {
        magicMaze.duration--
        $('#timer').html(((magicMaze.duration - (magicMaze.duration % 60)) / 60).toString().padStart(2, '0') + ":" + (magicMaze.duration % 60).toString().padStart(2, '0'))
      }
    }, 1000)
  },

  flipTimer() {
    magicMaze.timer({
      'duration': magicMaze.interval - magicMaze.duration
    })
  },

  resetTimer() {
    $('body').removeClass().addClass('green')
    $('#flip').prop('disabled', true)
    $('#start').prop('disabled', false)
    clearInterval(magicMaze.currentTimer)
    magicMaze.currentTimer = null
    magicMaze.duration = magicMaze.interval
    $('#timer').html(((magicMaze.duration - (magicMaze.duration % 60)) / 60).toString().padStart(2, '0') + ":" + (magicMaze.duration % 60).toString().padStart(2, '0'))
  }
}

$(document).ready(function () {
  $(document).keypress(function (e) {
    if (e.which === 13) {
      magicMaze.flipTimer()
    }
  })
})
