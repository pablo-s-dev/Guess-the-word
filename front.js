var gameTitleHtml = document.getElementById('gameTitle');
var gameTitleContainer = document.getElementById('gameTitleContainer');
var defsListHtml = document.getElementById('defsList');
var defsCard = document.getElementById('defsCard');
var unmutedIcon = document.getElementById('unmutedIcon');
var mutedIcon = document.getElementById('mutedIcon');
var toggleAudioBtn = document.getElementById('toggleAudioBtn');
var defsTitleHtml = document.getElementById('defsTitle');
var gameContainer = document.getElementById("gameContainer");
var topContainer = document.getElementById("topContainer");
var topContainer = document.getElementById("topContainer");
var onlyOnIntro = document.querySelectorAll(".onlyOnIntro");
var info = document.getElementById("info");
var startBtn = document.getElementById("startBtn");
var btnContainer = document.getElementById("btnContainer");
var bottomContainer = document.getElementById('bottomContainer');
var letterInputs = document.getElementsByClassName('letterInputs');
var reviewBtn = document.getElementById('reviewBtn');
var inputsContainer = document.getElementById("inputsContainer");
var inputHtml = '<input type="text" class="letterInputs" maxlength="1" autocapitalize="none" autocomplete="new-password">';
var next = document.getElementById("next");
var showAnswerBtn = document.getElementById("showAnswerBtn");
var copyAnswerBtn = document.getElementById("copyAnswerBtn");
var score = parseInt(localStorage['score']) || 0;
var wordsSeen;
var score_e = document.getElementById("score");
let description = document.getElementById("description");
var cursorHtml = '<span id="cursor">|</span>';
var typingPromise;
var word_guess = '';
var defsTyped = 0;
var nDefs = 0;
var nTypes = 0;
var index;
var defs = [];
var defs_single_string = '';
var gTypingSpeed = 40;
var muted = false;
var definitions = [];
var defsSpeech;
var checkingTimerId;
var n_letters = 0;
var break_lines = 0;
var n_lines = 0;
var speechSynthesis = window.speechSynthesis;
var breakTyping = false;
var typeTimerId;
let switcher = false;
var doneTypingDefs;
var sucessSoundEffect;
const copyHtml = `<button class="btn" style="position: absolute; right: -70px; width: 3vmin; height: 3vmin; ">
<svg xmlns="http://www.w3.org/2000/svg" width="50%" height="50%" viewBox="0 0 24 24" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
  <path fill="currentColor" d="M5 22q-.825 0-1.413-.588T3 20V6h2v14h11v2H5Zm4-4q-.825 0-1.413-.588T7 16V4q0-.825.588-1.413T9 2h9q.825 0 1.413.588T20 4v12q0 .825-.588 1.413T18 18H9Z"/>
</svg>
</button>`
const description_string = 'This game intends to increase the retrievability of English words by using the active recall method to make a concept turn into a stronger trigger for the actual word.'

window.addEventListener('load', beggining);
window.addEventListener('resize', ()=>{
  let vh = window.visualViewport.height * 0.01;
  gameContainer.style.setProperty('--vh', `${vh}px`);
})




async function typing_effect(element, str, oneWordPerLine, fadeOut, speed, deleteTheCursor) {
  var e=0, b=0;

  return new Promise((resolve, reject) => {
    if(breakTyping){
      reject();
      return;
    }
    //deleting effect
    if(str == ''){
      str = element.innerText;
      tam = element.innerHTML.length;
      i = 0;
      typeTimerId = setInterval(() => {
        if(i >= tam){
          resolve();
          clearInterval(typeTimerId);
        }
        element.innerHTML = element.textContent.slice(0, -2) + cursorHtml;
        i += 1
      }, speed)
    }
    //typing effect
    else{
      e = 0;
      b = 0;
      word = '';  
      typeTimerId = setInterval(() => {
        if(gTypingSpeed == 0){
          element.innerText = str;
          clearInterval(typeTimerId);
          resolve();
          return;
        }
      e = e + 1;
      if (str[e - 1] == ' ') { //if a word has been typed
        if (oneWordPerLine) {
          word += str.slice(b, e) + '<br>'
        }
        else {
          word += str.slice(b, e)
        }
        b = e;
        element.innerHTML = word + cursorHtml;
      }
      else {
        element.innerHTML = word + str.slice(b, e) + cursorHtml;
      }
      if (e === str.length) {
        if(deleteTheCursor){
          element.innerHTML = word + str.slice(b, e);
        }
        clearInterval(typeTimerId);
        e = 0;
        if (fadeOut != 'inf') {
          setTimeout(() => {
            element.innerHTML = '';
            resolve();
          }, fadeOut)
        }
        else{
          resolve();
        }
      }
    }, speed)}
  })
}

function beggining() {
  speechSynthesis?.cancel();
  info.addEventListener('click', info_fun);
  startBtn.addEventListener('click', start_fun);
  reviewBtn.addEventListener('click', review_fun);
  typingPromise = typing_effect(gameTitleHtml, 'Guess the word!', true, 'inf', 70, false)
  startBtn.style.visibility = 'visible'
  try {
    wordsSeen = JSON.parse(localStorage['wordsUsed'])
  } catch (error) {
    wordsSeen = [];
  }
  
}
async function review_fun(_) {
    await typingPromise;
    //deleting the game title
    typing_effect(gameTitleHtml, '', false, 0, 50, false)
      .then(()=>{

        btnContainer.style.display = 'flex'
        btnContainer.style.animationPlayState = 'running'
        defsTitleHtml.innerText = 'Seen words:'
        defsTitleHtml.style.visibility = 'visible'
        next.remove();
        copyAnswerBtn.remove();
        showAnswerBtn.remove();
        gameTitleContainer.remove();
        startBtn.remove();
        reviewBtn.remove();
        info.remove();
        description.remove();
        toggleAudioBtn.remove();

        defsCard.style.animationPlayState = 'running';

        for(let i = 0; i<wordsSeen.length; i++){
          let wordSeenHtml = document.createElement('li');
          wordSeenHtml.innerHTML = wordsSeen[i];
          wordSeenHtml.innerHTML += copyHtml;
          wordSeenHtml.lastElementChild.addEventListener('click', copySeenWord)
          defsListHtml.appendChild (wordSeenHtml);

          function copySeenWord(_){
            navigator.clipboard.writeText(wordSeenHtml.innerText)
          }
        }
    })
}
function info_fun() {
  if (switcher) {
    description.innerText = 'Author: Pablo Santana de Oliveira'
    switcher = false
  }
  else {
    description.innerText = description_string
    switcher = true
  }

}

async function start_fun() {
  sucessSoundEffect = new Audio('./audio/shortSuccessSound.mp3')
  onlyOnIntro.forEach((e)=>e.classList.add('running-animation'));
  
  await typingPromise;
  //deleting the game title
  await typing_effect(gameTitleHtml, '', false, 0, 50, false)

  next.addEventListener('click', next_fun);
  showAnswerBtn.addEventListener('click', showAnswer_fun);
  defsCard.addEventListener('click', skip_defsAnim);
  copyAnswerBtn.addEventListener('click', copy_answer);


  gameTitleHtml.remove();
  gameTitleContainer.remove();
  info.remove();
  description.remove();
  startBtn.remove();
  reviewBtn.remove();

  toggleAudioBtn.style.display = 'inline-block'
  defsTitleHtml.style.visibility = 'visible';
  unmutedIcon.style.display = 'inline';
  bottomContainer.style.alignContent = 'center';
  score_e = document.getElementById("score");
  score_e.innerText = "Score: " + score;
  btnContainer.style.display = 'flex'
  btnContainer.style.animationPlayState = 'running'
  inputsContainer.style.display = 'flex';
  newWord()
    .then(() => {
      inputs_animation();
      defsCard.style.animationPlayState = 'running';
      doneTypingDefs = defsAnim();
      if ('speechSynthesis' in window) {
        voices = speechSynthesis.getVoices();
        voice = voices.find(voice=> voice.name.includes('Mark'))
        !voice ? voice = voices.find(voice=> voice.name.includes('English')) : null;
        if(voice){
          defsSpeech = new SpeechSynthesisUtterance(defs.join('. '));
          defsSpeech.voice = voice;
          defsSpeech.pitch = 1;
          defsSpeech.rate = 1;
          defsSpeech.volume = 1;
          defsSpeech.lang = 'en-US';
          speechSynthesis.speak(defsSpeech);
          toggleAudioBtn.addEventListener('click', toggleAudio_fun);
        }
        else{
          toggleAudio_fun();
        }
      }
      else {
        mutedIcon.style.display = "inline";
        unmutedIcon.style.display = '';
      }
    })
    .catch(()=>{console.log('nextRound error')})


  function copy_answer(_){
    navigator.clipboard.writeText(words[index])
  }


  function toggleAudio_fun(_){
    //muting
    if (mutedIcon.style.display == '') { 
      speechSynthesis.cancel();
      mutedIcon.style.display = "inline";
      unmutedIcon.style.display = '';
      muted = true;
    }
    //unmuting 
    else {
      speechSynthesis.speaking? null : speechSynthesis.speak(defsSpeech);
      mutedIcon.style.display = '';
      unmutedIcon.style.display = "inline";
      muted = false;
    }
  }
  async function skip_defsAnim(_) {
    gTypingSpeed = 0;
    await doneTypingDefs;
    gTypingSpeed = 40;
  }

  async function next_fun(_) {
    clearInterval(typeTimerId);
    clearInterval(checkingTimerId);
    defsListHtml.innerHTML = ''
    deleting();
    defsListHtml.innerHTML = ''
    word_guess = '';
    inputsContainer = document.getElementById("inputsContainer");
    inputsContainer.style.animation = '';
    newWord().then(() => {
      inputs_animation();
      doneTypingDefs = defsAnim();
      copyAnswerBtn.style.display = 'none'
      showAnswerBtn.style.display = 'inline-block'
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        if(voice){
          defsSpeech = new SpeechSynthesisUtterance(defs.join('. '));
          defsSpeech.voice = voice;
          defsSpeech.pitch = 1;
          defsSpeech.rate = 1;
          defsSpeech.volume = 1;
          defsSpeech.lang = 'en-US';
          speechSynthesis.speak(defsSpeech);
          toggleAudioBtn.addEventListener('click', toggleAudio_fun);
          !muted ? speechSynthesis.speak(defsSpeech) : null;
        }
        else{
          muted = true;
        }
      } 
      else {
        mutedIcon.style.display = "inline";
        unmutedIcon.style.display = '';
      }
    })
    .catch(()=>{console.log('nextRound error')})
    return new Promise((res, rej)=>res())
  }

  function showAnswer_fun(_) {
    clearInterval(checkingTimerId);
    letterInputs = document.getElementsByClassName('letterInputs');
    for(let i=0; i<letterInputs.length; i++){
      letterInputs[i].setAttribute('value', words[index][i]);
      letterInputs[i].setAttribute('readonly', '');
      letterInputs[i].style.color = '#3C896D';
    }
    copyAnswerBtn.style.display = 'inline-block'
    showAnswerBtn.style.display = 'none'
  }
}


function deleting() {
  while (letterInputs.length > 0) {
    letterInputs[letterInputs.length - 1].remove()
  }
}

function error() {
  defsListHtml.innerText = "Falha na conexão!"
}

function inputs_animation() {
  inputsContainer = document.getElementById("inputsContainer");
  for (const a of Array(words[index].length)) {
    inputsContainer.innerHTML += inputHtml;
  }

  letterInputs = document.getElementsByClassName('letterInputs');
  inputsContainer.style.animation = 'dealing_cards_translation 4s cubic-bezier(0,1.0,0,1.0) normal forwards, dealing_cards_spread 3s ease-in-out 0s normal forwards';
  for (let l = 0; l < words[index].length; l++) {
    if (words[index][l] == ' ') {
      letterInputs[l].style.opacity = '0%'
      letterInputs[l].setAttribute("value", ' ')
      letterInputs[l].setAttribute('readonly', '')
      letterInputs[l].style.width = "2.5vmin"
    }
    else if (words[index][l] == '-') {
      letterInputs[l].setAttribute("value", '-')
      letterInputs[l].setAttribute('readonly', '')
    }
  }
  letterInputs = document.getElementsByClassName('letterInputs');
  inputsContainer = document.getElementById("inputs_container");

  inputHandler();
}


function checkLetters(letterInput, input_index){
  let hit = false;
  console.log('checking')
  if (letterInput.value != '') {
    if (words[index][input_index] == letterInput.value) {
      letterInput.style.color = '#3C896D'
      hit = true;
    }
    else {
      letterInput.style.color = '#FE4A49'
    }
    if (input_index === letterInputs.length - 1) {
      word_guess = '';
      if (letterInput.value != '') {
        for (const letterInput of letterInputs) {
          word_guess += letterInput.value;
        }
      }
    }
  }
  if (word_guess == words[index]) {
    gTypingSpeed = 0;
    doneTypingDefs.then(()=>gTypingSpeed = 40);
    score += 1
    score_e.innerText = "Score: " + score;
    localStorage['score'] = score;
    defsCard.style.setProperty('--cyan', 'rgba(60, 137, 109, 0.4)');
    document.querySelector(':root').style.setProperty('--scrollColor', 'rgba(60, 137, 109, 0.4)');
    for(let i=0; i<letterInputs.length; i++){
      letterInputs[i].setAttribute('readonly', '');
    }

    confetti();
    speechSynthesis?.cancel();
    sucessSoundEffect.play();
  }
  return hit;
}
function inputHandler() {
  console.log('input')
  Array.from(letterInputs).forEach((letterInput, input_index)=>{
    letterInput.addEventListener('keypress', checking)
    function checking(event){
      event.preventDefault();
      const key = event.key; 
      console.log(event)
      if (key === "Backspace") {
        letterInput.style.color = 'rgb(144, 144, 144)';

        if(letterInput.value == ''){
          if (letterInputs[input_index - 1]?.readOnly == true) {
            -1 < input_index - 2 ? letterInputs[input_index - 2].focus() : null;;
          }
          else {
            (-1 < input_index - 1) ? letterInputs[input_index - 1].focus() : null;
          }
        }
        else{
          letterInput.setAttribute('value', '')
          letterInput.setSelectionRange(1, 1);
        }
      }
      else{
        letterInput.setAttribute("value", key);
        letterInput.setSelectionRange(1, 1);
        console.log('alooo')
        let hit = checkLetters(letterInput, input_index);
        if(hit){
          if (letterInputs[input_index + 1]?.readOnly == true) {
            input_index + 2 < letterInputs.length ? letterInputs[input_index + 2].focus() : null;
          }
          else {
            input_index + 1 < letterInputs.length ? letterInputs[input_index + 1].focus() : null;
          }
        }
      }
    }
  })
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
var word2 = '';

async function newWord() {

  var attempts = 0;
  var wordFound = false;
  var wordPromise;
  return newFetch();
  
  async function newFetch(){

    do{
      index = (Math.floor(Math.random() * words.length));
    }
    while(wordsSeen?.includes(words[index]));

    wordsSeen.push(words[index])
    localStorage['wordsUsed'] = JSON.stringify(wordsSeen)

    const response = await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + words[index])
    if (response.ok) {
      const json = await response.json();
      defs = getValues(json, 'definition');
      return new Promise((res, rej)=>res());
    }
    else if(attempts < 5){
      attempts++;
      return newFetch();
    }
    else{
      return new Promise((res, rej)=>rej());
    }
  }
}

async function defsAnim(){ 
  var curDef = 0;
  const defsElem = Array.from({length: defs.length}, () => document.createElement('li'));
  await typeDef();
  async function typeDef(){
    if(curDef < defs.length){
      defsListHtml.appendChild(defsElem[curDef]);
      await typing_effect(defsElem[curDef], defs[curDef], false, 'inf', gTypingSpeed,  curDef + 1 != defs.length);
// on the last index, ^ this will be false and then we'll keep the cursor 
      curDef += 1;
      return typeDef();
    }
  }
  return new Promise((res, rej)=>res());
}