(function init() {
  //main div
  var DOMroot = document.querySelector(":root");


  //related to all buttons
  var bottom_div = document.getElementById('bottom_div');
  var btns_div = document.getElementById("btns_div");

  //related to buttons in the intro scene
  var OnlyOnIntro = document.querySelectorAll(".onlyOnIntro");
  var start_btn = document.getElementById("start_btn");
  var review_btn = document.getElementById('review_btn');

  var info_div = document.getElementById('info_div');
  var info_btn = document.getElementById("info_btn");
  var infoText_para = document.getElementById("infoText_para");
  var turn = true;

  //related to buttons in the game scene
  var speedBtns_div = document.getElementById('speedBtns_div');
  var speedDown_btn = document.getElementById('speedDown_btn');
  var speedUp_btn = document.getElementById('speedUp_btn');

  var toggleAudio_btn = document.getElementById('toggleAudio_btn');
  var unmutedIcon_svg = document.getElementById('unmutedIcon_svg');
  var mutedIcon_svg = document.getElementById('mutedIcon_svg');

  var showAnswer_btn = document.getElementById("showAnswer_btn");
  var copyAnswer_btn = document.getElementById("copyAnswer_btn");
  var next_btn = document.getElementById("next_btn");

  //related to defs
  var defsCard_div = document.getElementById('defsCard_div');

  var defsList_div = document.getElementById("defsList_div");
  var defsTitle_h1 = document.getElementById('defsTitle_h1');
  var defs_ul = document.getElementById('defs_ul');

  var defs = [];
  var defsTypingSpeed = 0;

  //related to game title
  var gameTitle_div = document.getElementById('gameTitle_div');
  var gameTitle_h1 = document.getElementById('gameTitle_h1');

  //related to inputs
  var inputs_div = document.getElementById("inputs_div");
  var LetterInputs = document.getElementsByClassName('letterInputs');


  //related to tts
  var speechSynthesis = window.speechSynthesis;
  var muted = localStorage['mutedPref'] ?? true;
  var defsSpeech;

  //toast-related
  // const toastTip_div = document.getElementById("toastTip_div");
  const generalToast_div = document.getElementById('generalToast_div');
  var toastTimeId;

  //score-related
  var score = parseInt(localStorage['score']) || 0;
  var score_span = document.getElementById("score_span");


  //related to the typing effect
  var gameTitleBeenTyped;
  var doneTypingDefs;
  var wordIndex = 0;
  var stopTyping = false;
  var typingTimerId;

  //related to checking the letters
  var checkingTimerId;
  var word_guess = '';
  var sucessSoundEffect = new Audio('./audio/shortSuccessSound.mp3');
  var tipIdx = 0;
  var tip_btn = document.getElementById("tip_btn")
  var tipped = []

  // //vh fix for mobile
  // var vh = window.innerHeight * 0.01;
  // DOMroot.style.setProperty('--vh', `${vh}px`);

  // window.addEventListener('resize', () => {
  //   var vh = window.innerHeight * 0.01;
  //   DOMroot.style.setProperty('--vh', `${vh}px`);
  // })

  function setRu() {
    const view_width = window.innerWidth;
    const view_height = window.innerHeight;
    const min_view = view_width < view_height ? view_width : view_height;
    const ru = (0.0100339 - (5e-4 / 724) * view_width) * min_view;
    const ru_text = ru.toString() + "px";
    DOMroot.style.setProperty('--ru', ru_text);
    const vh = view_height * 0.01;
    DOMroot.style.setProperty('--vh', `${vh}px`);
  }
  setRu();
  window.addEventListener('resize', () => {
    setRu()
  })

  window.addEventListener('load', beginning);

  function beginning() {
    console.log("aaaaaaaa")
    tip_btn.addEventListener('click', showTip);
    info_btn.addEventListener('click', info_fun);
    start_btn.addEventListener('click', start_fun);
    review_btn.addEventListener('click', review_fun);
    gameTitleBeenTyped = typing_effect({ element: gameTitle_h1, str: 'Guess the word!', oneWordPerLine: true, fadeoutDelay: 'inf', speed: 70, disposeCursor: false })
    start_btn.style.visibility = 'visible'
    try {
      wordsUsed = JSON.parse(localStorage['wordsUsed'])
    } catch (error) {
      wordsUsed = [];
    }

  }

  async function start_fun() {
    OnlyOnIntro.forEach((e) => e.classList.add('drop-animation'));

    await gameTitleBeenTyped;

    //deleting the game title
    await deleting_effect({ element: gameTitle_h1, speed: 70, disposeCursor: false })

    next_btn.addEventListener('click', next_fun);
    showAnswer_btn.addEventListener('click', showAnswer_fun);
    // defsCard_div.addEventListener('click', skip_defsAnim);
    copyAnswer_btn.addEventListener('click', copy_answer);


    gameTitle_h1.remove();
    gameTitle_div.remove();
    info_div.remove();
    info_btn.remove();
    infoText_para.remove();
    start_btn.remove();
    review_btn.remove();


    defs_ul.style.display = 'block';
    defsCard_div.style.paddingLeft = '0px';
    defsCard_div.style.paddingRight = '0px';
    defsList_div.style.display = 'grid';
    defs_ul.style.lineHeight = '150%'
    toggleAudio_btn.style.display = 'inline-block';
    defsTitle_h1.style.visibility = 'visible';
    unmutedIcon_svg.style.display = 'inline';
    bottom_div.style.alignContent = 'center';
    score_span.innerText = "Score: " + score;
    btns_div.style.display = 'flex'
    btns_div.style.animationPlayState = 'running'
    inputs_div.style.display = 'flex';


    newWord()
      .then(() => {
        inputs_animation();
        defsCard_div.style.animationPlayState = 'running';
        setTimeout(showDefs, 2000)
        // doneTypingDefs = defsAnim();

        if ('speechSynthesis' in window) {
          voices = speechSynthesis.getVoices();
          voice = voices.find(voice => voice.name.includes('Mark'))
          !voice ? voice = voices.find(voice => voice.name.includes('English')) : null;
          if (voice) {
            console.log('voice')
            defsSpeech = new SpeechSynthesisUtterance(defs.join('. '));
            defsSpeech.voice = voice;
            defsSpeech.pitch = 1;
            defsSpeech.rate = 1;
            defsSpeech.volume = 1;
            defsSpeech.lang = 'en-US';
            if (!muted) {
              speedBtns_div.style.display = 'block'
              speechSynthesis.speak(defsSpeech);
            } else {
              mutedIcon_svg.style.display = "inline";
              unmutedIcon_svg.style.display = '';
              toggleAudio_btn.addEventListener('click', toggleAudio_fun)
            }
            speedUp_btn.addEventListener('click', speedUpTTS)
            speedDown_btn.addEventListener('click', speedDownTTS)
          }
          else {
            mutedIcon_svg.style.display = "inline";
            unmutedIcon_svg.style.display = '';
            toggleAudio_fun();
          }
        }
        else {
          mutedIcon_svg.style.display = "inline";
          unmutedIcon_svg.style.display = '';
        }
      })
      .catch(() => { console.log('nextRound error') })

  }

  function speedUpTTS() {
    defsSpeech.rate += 0.1;
    generalToast_div.classList.add('show');
    generalToast_div.innerText = `Rate: ${defsSpeech.rate.toFixed(2)}`;

    if (toastTimeId) {
      clearTimeout(toastTimeId);
    }
    toastTimeId = setTimeout(() => {
      generalToast_div.classList.remove('show');
      toastTimeId = null;
    }, 1500);
  }
  function speedDownTTS(_) {
    defsSpeech.rate -= 0.1;
    generalToast_div.classList.add('show');
    generalToast_div.innerText = `Rate: ${defsSpeech.rate.toFixed(2)}`;

    if (toastTimeId) {
      clearTimeout(toastTimeId);

    }
    toastTimeId = setTimeout(() => {
      generalToast_div.classList.remove('show');
      toastTimeId = null;
    }, 1500);
  }
  function copy_answer(_) {
    const successful = navigator.clipboard.writeText(words[wordIndex]) ?? copyFallback(words[wordIndex])

    if (successful) {
      generalToast_div.innerText = 'Copied to clipboard!';
    }
    else {
      generalToast_div.innerText = 'Failed to copy =(';
    }

    if (toastTimeId) {
      clearTimeout(toastTimeId);
    }
    generalToast_div.classList.add('show');

    toastTimeId = setTimeout(() => {
      generalToast_div.classList.remove('show');
      toastTimeId = null;
    }, 1500);
  }


  function toggleAudio_fun() {
    //muting
    console.log('oii')
    if (mutedIcon_svg.style.display == '') {
      speechSynthesis.cancel();
      mutedIcon_svg.style.display = "inline";
      unmutedIcon_svg.style.display = '';
      muted = true;
      localStorage['mutedPref'] = true;

      speedBtns_div.style.display = 'none'
    }
    //unmuting 
    else {
      speechSynthesis.speaking ? null : speechSynthesis.speak(defsSpeech);
      mutedIcon_svg.style.display = '';
      unmutedIcon_svg.style.display = "inline";
      muted = false;
      localStorage['mutedPref'] = false;
      speedBtns_div.style.display = 'block'
    }
  }
  // async function skip_defsAnim(_) {
  //   defsTypingSpeed = 0;
  //   await doneTypingDefs;
  //   defsTypingSpeed = 40;
  // }

  async function next_fun(_) {
    clearInterval(typingTimerId);
    clearInterval(checkingTimerId);
    defs_ul.innerHTML = ''
    deleting();
    word_guess = '';
    tipIdx = 0
    tipped = []
    defsCard_div.style.setProperty('--cyan', 'rgba(46, 240, 240, 0.4)');
    document.querySelector(':root').style.setProperty('--scrollColor', 'rgb(87, 186, 186)');
    inputs_div = document.getElementById("inputs_div");
    inputs_div.style.animation = '';
    defsCard_div.style.animationPlayState = 'running';
    newWord().then(() => {
      inputs_animation();
      showDefs();
      console.log("aaa")
      copyAnswer_btn.style.display = 'none'
      showAnswer_btn.style.display = 'inline-block'
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        if (voice) {
          console.log(defsSpeech)
          defsSpeech.text = defs.join('. ');
          !muted ? speechSynthesis.speak(defsSpeech) : null;
        }
        else {
          muted = true;
          localStorage['mutedPref'] = true;
        }
      }
      else {
        mutedIcon_svg.style.display = "inline";
        unmutedIcon_svg.style.display = '';
      }
    })
      .catch(() => { console.log('nextRound error') })
    return true
  }

  function showAnswer_fun(_) {
    clearInterval(checkingTimerId);
    LetterInputs = document.getElementsByClassName('letterInputs');
    for (let i = 0; i < LetterInputs.length; i++) {
      LetterInputs[i].value = words[wordIndex][i];
      LetterInputs[i].setAttribute('readonly', '');
      LetterInputs[i].style.color = '#00ffa2';
    }
    copyAnswer_btn.style.display = 'inline-block'
    showAnswer_btn.style.display = 'none'
  }

  async function typing_effect({ element, str, oneWordPerLine, fadeoutDelay, speed, disposeCursor }) {

    var end = 0;
    return new Promise((resolve, reject) => {
      var text_span = document.getElementById('text_span')
      if (!text_span || text_span.parentElement != element) {
        text_span = document.createElement('span')
        text_span.id = 'text_span'
        element.appendChild(text_span);
      }

      var cursor_span = document.getElementById('cursor_span')
      if (!cursor_span || cursor_span.parentElement != element) {
        cursor_span = document.createElement('span')
        cursor_span.innerText = '|'
        cursor_span.id = 'cursor_span'
        element.appendChild(cursor_span);
      }

      typingTimerId = setInterval(() => {

        if (stopTyping) {
          reject();
          return;
        }
        if (end === str.length) {
          if (disposeCursor) {
            cursor_span.remove();
          }
          clearInterval(typingTimerId);
          if (fadeoutDelay != 'inf') {
            setTimeout(() => {
              element.innerText = '';
              resolve();
            }, fadeoutDelay)
            return;
          }
          else {
            resolve();
            return;
          }
        }
        if (speed == 0) {
          element.innerText = str;
          clearInterval(typingTimerId);
          resolve();
          return;
        }
        if (str[end] == ' ') { //if a word has been typed
          if (oneWordPerLine) {
            text_span.appendChild(document.createElement('br'))
          }
          else {
            text_span.innerText += str[end];
          }
        }
        else {
          text_span.innerText += str[end];
        }
        end++;
      }, speed)
    })
  }
  async function deleting_effect({ element, speed, disposeCursor }) {

    return new Promise((resolve, reject) => {
      if (stopTyping) {
        reject();
        return;
      }
      var text_span = document.getElementById('text_span')
      if (!text_span) {
        text_span = document.createElement('span')
        text_span.id = 'text_span'
        element.appendChild(text_span);
      }

      var cursor_span = document.getElementById('cursor_span')
      if (!cursor_span) {
        var cursor_span = document.createElement('span')
        cursor_span.id = 'cursor_span'
        element.appendChild(cursor_span);

      }

      tam = element.innerText.length;
      typingTimerId = setInterval(() => {
        if (tam == 0) {
          if (disposeCursor) {
            cursor_span.remove();
          }
          resolve();
          clearInterval(typingTimerId);
        }
        console.log(text_span.innerHTML)
        text_span.innerText = text_span.innerText.slice(0, -1)

        tam -= 1
      }, speed)

    })
  }
  function inputs_animation() {

    inputs_div = document.getElementById("inputs_div");

    for (const a of Array(words[wordIndex].length)) {

      let input = document.createElement('input')
      input.classList.add('letterInputs')
      input.setAttribute('autocapitalize', 'none')
      input.setAttribute('autocomplete', 'new-password')
      input.setAttribute('type', 'text')
      inputs_div.appendChild(input)

    }

    LetterInputs = document.getElementsByClassName('letterInputs');

    inputs_div.style.animation = 'dealing_cards_translation 4s cubic-bezier(0,1.0,0,1.0) normal forwards, dealing_cards_spread 3s ease-in-out 0s normal forwards';

    for (let l = 0; l < words[wordIndex].length; l++) {
      if (words[wordIndex][l] == ' ') {
        LetterInputs[l].style.opacity = '0%'
        LetterInputs[l].setAttribute("value", ' ')
        LetterInputs[l].setAttribute('readonly', '')
        LetterInputs[l].style.width = "2.5vmin"
      }
      else if (words[wordIndex][l] == '-') {
        LetterInputs[l].setAttribute("value", '-')
        LetterInputs[l].setAttribute('readonly', '')
      }
    }
    LetterInputs = document.getElementsByClassName('letterInputs');
    inputHandler();
  }

  function toast(text, ms) {

    generalToast_div.classList.add('show');
    generalToast_div.innerText = text;

    if (toastTimeId) {
      clearTimeout(toastTimeId);
    }
    toastTimeId = setTimeout(() => {
      generalToast_div.classList.remove('show');
      toastTimeId = null;
    }, ms);

  }


  function checkLetters(letterInput, input_index) {
    let hit = false;
    if (letterInput.value != '') {
      if (words[wordIndex][input_index] == letterInput.value) {
        letterInput.style.color = '#00ffa2'
        letterInput.setAttribute('readOnly', '')
        hit = true;
      }
      else {
        letterInput.style.color = '#FE4A49'
      }
      if (input_index === LetterInputs.length - 1) {
        word_guess = '';
        if (letterInput.value != '') {
          for (const letterInput of LetterInputs) {
            word_guess += letterInput.value;
          }
        }
      }
    }
    if (word_guess == words[wordIndex]) {
      defsTypingSpeed = 0;
      // doneTypingDefs.then(() => defsTypingSpeed = 40);
      score += 1
      score_span.innerText = "Score: " + score;
      localStorage['score'] = score;
      defsCard_div.style.setProperty('--cyan', 'rgba(60, 137, 109, 0.4)');
      document.querySelector(':root').style.setProperty('--scrollColor', 'rgba(60, 137, 109, 0.4)');
      for (let i = 0; i < LetterInputs.length; i++) {
        LetterInputs[i].setAttribute('readonly', '');
      }

      confetti();
      speechSynthesis?.cancel();
      sucessSoundEffect.play();
    }
    return hit;
  }
  function inputHandler() {
    Array.from(LetterInputs).forEach((letterInput, input_index) => {
      letterInput.addEventListener('input', checkInput)
      letterInput.addEventListener('beforeinput', backspaceDetection)

      function checkInput(event) {
        if (letterInput.value.length === 0) {
          letterInput.style.color = 'rgb(212, 212, 212)';
          return;
        }
        if (letterInput.value.length > 1) {
          letterInput.value = letterInput.value.slice(1, 2)
        }
        let hit = checkLetters(letterInput, input_index);
        if (hit) {
          if (LetterInputs[input_index + 1]?.readOnly == true && input_index + 2 < LetterInputs.length) {
            LetterInputs[input_index + 2].focus();
          }
          else if (input_index + 1 < LetterInputs.length) {
            LetterInputs[input_index + 1].focus();
          }
        }
      }

      function backspaceDetection(event) {
        if (event.data == null) {
          letterInput.style.color = 'rgb(144, 144, 144)';
          if (letterInput.value == '') {
            if (LetterInputs[input_index - 1]?.readOnly == true && (-1 < input_index - 2)) {
              LetterInputs[input_index - 2].focus();
            }
            else if ((-1 < input_index - 1)) {
              LetterInputs[input_index - 1].focus();
            }
          }
        }
      }
    })
  }


  async function review_fun(_) {

    // Todo: don't reuse defs related elements

    await gameTitleBeenTyped;

    //deleting the game title
    deleting_effect({ element: gameTitle_h1, speed: 70, disposeCursor: false })
      .then(() => {
        btns_div.style.display = 'flex'
        btns_div.style.animationPlayState = 'running'
        defsTitle_h1.innerText = 'Seen words:'
        defsTitle_h1.style.visibility = 'visible'
        // defsCard.style.alignItems = 'flex-start'
        defs_ul.style.display = 'block';
        defsCard_div.style.paddingLeft = '0px';
        defsCard_div.style.paddingRight = '0px';
        defsList_div.style.display = 'grid';
        info_div.remove();
        next_btn.remove();
        copyAnswer_btn.remove();
        showAnswer_btn.remove();
        gameTitle_div.remove();
        start_btn.remove();
        review_btn.remove();
        info_btn.remove();
        infoText_para.remove();
        toggleAudio_btn.remove();
        defs_ul.remove();
        defsList_div.remove();

        let copy_div = document.createElement('div')
        copy_div.id = 'copy_div';

        let wordsSeen_div = document.createElement('div')
        wordsSeen_div.id = 'wordsSeen_div'

        let wordsSeenList = document.createElement('ul')
        wordsSeenList.id = 'wordsSeen_ul'

        defsCard_div.appendChild(wordsSeen_div)
        wordsSeen_div.appendChild(wordsSeenList)

        wordsSeen_div.appendChild(copy_div)

        // defsCard_div.style.animationPlayState = 'running';
        copy_div.style.display = 'flex';
        for (let i = 0; i < wordsUsed.length; i++) {

          let wordSeenHtml = document.createElement('li');
          wordSeenHtml.innerText = wordsUsed[i];
          wordsSeenList.appendChild(wordSeenHtml);

          // create the button element
          let button = document.createElement('button');
          button.classList.add('btn');

          // create the svg element
          let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('width', '50%');
          svg.setAttribute('height', '50%');
          svg.setAttribute('viewBox', '0 0 24 24');

          // create the path element
          let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttribute('fill', 'currentColor');
          path.setAttribute('d', 'M5 22q-.825 0-1.413-.588T3 20V6h2v14h11v2H5Zm4-4q-.825 0-1.413-.588T7 16V4q0-.825.588-1.413T9 2h9q.825 0 1.413.588T20 4v12q0 .825-.588 1.413T18 18H9Z');

          // add the path to the svg, and the svg to the button
          svg.appendChild(path);
          button.appendChild(svg);

          button.addEventListener('click', copySeenWord)
          copy_div.appendChild(button)

          function copySeenWord(_) {

            let successful = navigator.clipboard?.writeText(wordsUsed[i]) ?? copyFallback(wordsUsed[i]);


            generalToast_div.classList.add('show');

            if (successful) {
              generalToast_div.innerText = 'Copied to clipboard!';
            }
            else {
              generalToast_div.innerText = 'Failed to copy =(';
            }

            setTimeout(() => {
              generalToast_div.classList.remove('show');
            }, 1500);
          }
        }
      })
    function copyFallback(text) {
      var textArea = document.createElement("textarea");
      textArea.value = text;

      // Avoid scrolling to bottom
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      var successful = document.execCommand?.('copy');

      document.body.removeChild(textArea);
      if (successful) {
        return true;
      }
      else {
        return false;
      }

    }
  }
  function info_fun() {
    const description_string = 'This game intends to increase the retrievability of English words, by using the active recall method to make a concept turn into a stronger trigger for the actual word.';

    if (turn) {
      infoText_para.innerText = 'Author: Pablo Santana de Oliveira'
      turn = false
    }
    else {
      infoText_para.innerText = description_string
      turn = true
    }

  }

  function showTip() {
    console.log("alooo")
    const LetterInputs = document.getElementsByClassName('letterInputs');

    if (LetterInputs.length === 0) {
      return
    }

    if (tipped.length >= Math.floor(LetterInputs.length / 2)) {
      toast("No more tips for this word", 3000)
      return
    }

    // find unasnwered
    while (LetterInputs[tipIdx].readOnly && tipIdx < LetterInputs.length) {
      toast("Jumped idx: " + tipIdx, 3000)
      tipIdx++
    }


    LetterInputs[tipIdx].value = words[wordIndex][tipIdx]
    LetterInputs[tipIdx].readOnly = true
    LetterInputs[tipIdx].style.color = '#00ffa2';
    tipped.push(tipIdx)
    tipIdx++
  }


  function deleting() {
    while (LetterInputs.length > 0) {
      LetterInputs[LetterInputs.length - 1].remove()
    }
  }

  function error() {
    defs_ul.innerText = "Falha na conexão!"
  }


  function getValues(obj, key) {

    var objects = [];
    for (var i in obj) {
      if (!obj.hasOwnProperty(i)) continue;
      if (typeof obj[i] == 'object') {
        objects = objects.concat(getValues(obj[i], key));
      } else if (i == key) {
        objects.push(obj[i]);
      }
    }
    return objects;
  }

  async function newWord() {

    var attempts = 0;


    return newFetch();

    async function newFetch() {

      do {
        wordIndex++;
      }
      while (wordsUsed?.includes(words[wordIndex]));

      wordsUsed.push(words[wordIndex])
      localStorage['wordsUsed'] = JSON.stringify(wordsUsed)

      const response = await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + words[wordIndex])
      if (response.ok) {
        const json = await response.json();
        defs = getValues(json, 'definition');
        console.log(defs)
        return new Promise((res, rej) => res());
      }
      else if (attempts < 5) {
        attempts++;
        return newFetch();
      }
      else {
        console.log("Erro ao buscar nova palavra")
        return new Promise((res, rej) => rej());
      }
    }
  }

  function showDefs() {
    // var curDef = 0;
    const defsElem = Array.from({ length: defs.length }, () => document.createElement('li'));
    defsElem.forEach((li, i) => {
      li.innerText = defs[i];
      console.log("aaaaaaaaa")
      console.log(li.innerText)
      defs_ul.appendChild(li);
    })
    // await typeDef();
    // async function typeDef() {
    //   if (curDef < defs.length) {
    //     defs_ul.appendChild(defsElem[curDef]);
    //     await typing_effect({element: defsElem[curDef], str: defs[curDef], oneWordPerLine: false, fadeoutDelay: 'inf', speed: defsTypingSpeed, disposeCursor: curDef + 1 != defs.length});
    //     // on the last def, ^ this will be false and then we'll keep the cursor 
    //     curDef += 1;
    //     return typeDef();
    //   }
    // }
    // return new Promise((res, rej) => res());
  }
  async function waitFor(ms) {
    return new Promise(res => setTimeout(res, ms))
  }
})();