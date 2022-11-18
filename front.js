var title = document.getElementById('main-title');
var defs_html = document.getElementById('defs');
var cursor2 = document.getElementById('cursor2');
var middle = document.getElementById('middle');
var word_guess = '';
var defsTyped = 0;
var nDefsOfSameType = 0;
var nTypes = 0;
var index;
var defs = [];
var defs_single_string = '';
import words from './words.json' assert {type: 'json'};
var cursor_html = '<span class="cursor">|</span>';
var cursor2_html = '<span id="cursor2">|</span>';
var title_defs = document.getElementById('title-defs');
var input_html = '<input type="text" name="" class="letterInputs" maxlength="1" autocapitalize="none" autocomplete="off">'
var definitions = [];
var input_index = 0;
var bottom = document.getElementsByClassName('bottom')[0];
var letterInputs = document.getElementsByClassName('letterInputs');
var checking;
var n_letters = 0
var break_lines = 0
var n_lines = 0
let next;
let inputs_container = document.getElementById("inputs_container");
let t;
let description = document.getElementById("description");
var typeTimer;
var game = document.getElementsByClassName("game")[0];
var top = document.getElementsByClassName("top")[0];
var middle = document.getElementsByClassName("middle")[0];
var mid = document.getElementsByClassName("mid")[0];
next = document.getElementsByClassName("next")[0];
var info = document.getElementById("info");
let start_button = document.getElementById("start");
let switcher = false;
let score = parseInt(localStorage['score']) || 0;
var score_e = document.getElementById("score");
const description_string = 'This game intends to increase the retrievability of English words by using the active recall method to make a concept turn into a stronger trigger for the actual word.'

function typing_effect(element, str, br, fadeOut, speed){

  return new Promise((resolve, reject)=>{
    element.innerHTML = ''
    let word = '';
    let e = 0;
    let b = 0;
    typeTimer = setInterval(()=>{
      e = e + 1;
    if(str[e-1] == ' '){
      if(br){
        word += str.slice(b, e) + '<br>' 
      }
      else{
        word += str.slice(b, e)
      }
      b = e;
      element.innerHTML = word + cursor_html;
    }
    else{
      element.innerHTML = word + str.slice(b, e) + cursor_html;
    }
    if (e === str.length) {
      clearInterval(typeTimer);
      e = 0;
      if(fadeOut != 'inf'){
        setTimeout(()=>{
          element.innerHTML = '';
          resolve();
        }, fadeOut)
      }
    }
    }, speed)
    
  })
}

function beggining(){
  info.addEventListener('click', info_fun);
  start_button.addEventListener('click', start_fun);
  typing_effect(title, 'Guess the word!', true, 'inf', 70)
  start_button.style.visibility = 'visible'
}

function info_fun(){
  if(switcher){
    description.innerText = description_string
    switcher = false
  }
  else{
    description.innerText = 'Author: Pablo Santana de Oliveira'
    switcher = true
  }
  
}

function start_fun(){
  description.remove();
  info.remove();
  start_button.remove();
  title_defs.innerText = 'Definitions:'
  title_defs.appendChild(score_e)
  score_e = document.getElementById("score");
  score_e.innerText = "Score: "+score;
  middle.style.animationPlayState = 'running'
  next.style.display = 'inline-block'
  next.style.animationPlayState = 'running'
  title.remove();
  newWord()
  .then(()=>{
      inputs_animation();
    })
}

function next_fun(){
  clearInterval(t);
  clearInterval(checking);
  setTimeout(()=>{
  deleting();
  defs_single_string = ''
  defs_html.innerHTML = ''
  word_guess = '';
  input_index = 0;
  inputs_container.style.animation = '';
  newWord().then(()=>{
    inputs_animation();
  })

  }, 300)
}
function deleting() {
  while(letterInputs.length>0){
    letterInputs[letterInputs.length-1].remove()
  }
}

function error(){
  defs_html.innerText = "Falha na conexão!"
}

function inputs_animation(){
  inputs_container = document.getElementById("inputs_container");
  
  for(const a of Array(words[index].length)){
    inputs_container.innerHTML += input_html;
  }

  letterInputs = document.getElementsByClassName('letterInputs');
  inputs_container.style.animation = 'dealing_cards_translation 2s cubic-bezier(0,1.02,0,1.02) 1s normal forwards, dealing_cards_spread 1.5s ease-in-out 1s normal forwards';
  for(let l = 0; l<words[index].length; l++){
    if(words[index][l] == ' '){
      letterInputs[l].style.opacity = '0%'
      letterInputs[l].setAttribute("value", ' ')
      letterInputs[l].setAttribute('readonly', '')
      letterInputs[l].style.width = "2.5vmin"
    }
    else if(words[index][l] == '-'){
      letterInputs[l].setAttribute("value", '-')
      letterInputs[l].setAttribute('readonly', '')
    }
  }
  letterInputs = document.getElementsByClassName('letterInputs');
  inputs_container = document.getElementById("inputs_container");

  next.addEventListener('click', next_fun)
  letterInputs[input_index]?.focus();
  backspace_detection();

  checking = setInterval(()=>{

    if(letterInputs[input_index]?.value != ''){
      check_letters(letterInputs[input_index]);
      if(input_index < words[index].length - 1){
        if(letterInputs[input_index+1].readOnly == true){
          input_index += 2;
          letterInputs[input_index]?.focus();
        }
        else{
          input_index += 1;
          letterInputs[input_index]?.focus();
        }

      }
    }
    else if(letterInputs[input_index]){
      letterInputs[input_index].style.color = 'white';
    }
  }, 200)

  return new Promise((resolve, reject) => {
    resolve();
  })
  
}


var check_letters = (letterInput)=>{
  if(word_guess == words[index]){
    score +=1
    score_e.innerText = "Score: "+score;
    localStorage['score'] = score;
    next_fun();
  }
  else if(letterInput.value != ''){
    if(words[index][input_index] == letterInput.value){
      letterInput.style.color = 'green'
    }
    else{
      letterInput.style.color = 'red'
    }
    if(letterInputs.length - 1 == input_index){
      if(letterInput.value != ''){
        for(const letterInput of letterInputs){
          word_guess += letterInput.value;
        }
      }
      
    }
  }
  else{
    letterInput.style.color = 'white'
  }
  
}
function backspace_detection(){
  for(const letterInput of letterInputs){
    letterInput.addEventListener('keydown', function(event) {
      const key = event.key; // const {key} = event; ES6+
      if (key === "Backspace" && input_index>0 && letterInput.value == '') {
        if(letterInputs[input_index+1]?.readOnly == true){
          input_index -= 2;
        }
        else{
          input_index -= 1;
        }
        letterInputs[input_index]?.focus();
        letterInputs[input_index].setAttribute("value", '');
      }
    });
  }
 
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

async function newWord(){
  index = ( Math.floor(Math.random() * 233464));
  await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + words[index])
  .then((response)=>{
    if(response.ok){
      response.json().then((json)=>{
        defs = getValues(json, 'definition')
        stringify();
        typeTimerForDefs();
        return new Promise((resolve, reject) => {
          resolve();
        })
      })
      
    }
    else{
      return newWord();
    }
  })
  
}
function stringify(){
  let x = 0
  while(x<defs.length){
    if(x+1 == defs.length){
      defs_single_string += '→ ' + defs[x]
    }else{
      defs_single_string += '→ ' + defs[x] + '\r\n';
    }
    x += 1
  }
}
function typeTimerForDefs(){
  title_defs.style.visibility = 'visible';

  let div_middle_height = parseFloat(window.getComputedStyle(document.getElementsByClassName('middle')[0], null).getPropertyValue('height').replace("px", ''));
  let div_middle_width = parseFloat(window.getComputedStyle(document.getElementsByClassName('middle')[0], null).getPropertyValue('width').replace("px", ''));
  let prev_font_size = div_middle_height * 0.07;

  break_lines = 0

  for(let def of defs){
    break_lines += Math.floor(((def.length + 2) * prev_font_size) / (parseFloat(document.getElementsByClassName('middle')[0].clientWidth)));
  }
  n_lines = defs.length + break_lines;

  if(n_lines * prev_font_size > div_middle_height){
    while(n_lines * prev_font_size > div_middle_height){
      break_lines = 0
      prev_font_size *= 0.99
      for(let def of defs){
        break_lines += Math.floor(((def.length + 2) * prev_font_size) / (parseFloat(document.getElementsByClassName('middle')[0].clientWidth)));
      }
      n_lines = defs.length + break_lines;
      
    }
    let target_font_size_per = (prev_font_size / div_middle_height) * 100;
    defs_html.style.fontSize = (target_font_size_per).toString() + '%';
  }
  
  let i = 0
  const t = setInterval(function() {
    i = i+1
    defs_html.innerHTML = defs_single_string.slice(0, i) + cursor2_html;
    if(i > defs_single_string.length){ //typed all defs
      clearInterval(t);
      defs_html.innerHTML = defs_single_string.slice(0, i);
    }
  }, 70)

}

beggining();