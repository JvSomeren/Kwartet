/**
 * Variables
 */
const minNumberOfPlayers = 3;
const maxNumberOfPlayers = 12;
const categories = ['C', 'H', 'S', 'D'];
const objects = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
var players = [];
var currentPlayerIndex = 0;

/**
 * Element selectors
 */
const eleLobby = document.getElementById("lobby");
const eleLobbyForm = document.getElementById("lobby-form");
const eleInputNumPlayers = document.getElementById("number-of-players");
const eleGame = document.getElementById("game");
const eleTurnPlayername = document.getElementById("turn-playername");
const eleTurnForm = document.getElementById("turn-form");
const eleTurnFormCategory = document.getElementById("turn-form-category");
const eleTurnFormObject = document.getElementById("turn-form-object");
const eleTurnFormPlayer = document.getElementById("turn-form-player");
const eleTurnFormButton = document.querySelector("#turn-form button");
const elePlayerHands = document.getElementById("player-hands");

/**
 * Event listeners
 */
eleLobbyForm.addEventListener("submit", startGame);
eleTurnForm.addEventListener("submit", processTurn);

/**
 * shuffle
 * 
 * Shuffle an array randomly
 * @param {array} arr 
 */
function shuffle(arr) {
  for(var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
  return arr;
}

/**
 * compare
 * 
 * Compare given parameters;
 *  -1 if b is larger
 *  1 if a is larger
 *  0 if a and b are equal
 * 
 * @param {*} a 
 * @param {*} b 
 */
function compare(a,b) {
  if (a.object < b.object)
    return -1;
  if (a.object > b.object)
    return 1;
  return 0;
}

/**
 * buildAndShuffleDeck
 * 
 * Build deck based on given categories and objects.
 * 
 * @param {array} cat 
 * @param {array} obj 
 */
function buildAndShuffleDeck(cat, obj) {
  let deck = [];
  let card = {
    categories: '',
    object: ''
  };

  for(let i = 0; i < cat.length; i++) {
    for(let j = 0; j < obj.length; j++) {
      card = {
        category: cat[i],
        object: obj[j]
      };

      deck.push(card);
    }
  }

  return shuffle(deck);
}

/**
 * sortPlayerHand
 * 
 * Sort the hand of a given player.
 * 
 * @param {integer} index 
 */
function sortPlayerHand(index) {
  players[index].deck.sort(compare);
}

/**
 * dealDeck
 * 
 * Split the given deck array among the number of given players.
 * End by sorting the dealt hands.
 * 
 * @param {array} deck 
 * @param {integer} numOfPlayers 
 */
function dealDeck(deck, numOfPlayers) {
  for(let i = 0; i < numOfPlayers; i++) {
    players[i] = {
      deck: new Array(),
      score: 0
    };
  }

  for(i = 0; i < deck.length; i++) {
    players[i % numOfPlayers].deck.push(deck[i]);
  }

  for(i = 0; i < numOfPlayers; i++) {
    sortPlayerHand(i);
  }
}

/**
 * checkForKwartet
 * 
 * Check for a given player if this player has all card of the
 * same category in his hands. If so increase his/her points by 1 and
 * remove the cards from its hand.
 * 
 * @param {integer} index 
 */
function checkForKwartet(index) {
  let lastObj = "";
  let consecutive = 1;

  sortPlayerHand(index);

  for(let i = 0; i < players[index].deck.length; i++) {
    if(players[index].deck[i].object === lastObj) {
      consecutive++;

      // if kwartet
      if(consecutive === categories.length) {
        players[index].deck.splice(i - categories.length + 1, categories.length);
        players[index].score++;
      }
    } else {
      lastObj = players[index].deck[i].object;
      consecutive = 1;
    }
  }
}

/**
 * setElePlayerHands
 * 
 * Create DOM elements for each player's hand.
 */
function setElePlayerHands() {
  while(elePlayerHands.firstChild) {
    elePlayerHands.removeChild(elePlayerHands.firstChild);
  }
  for(let i = 0; i < players.length; i++) {
    let eleHandContainer = document.createElement("div");
    eleHandContainer.className = "column";

    let eleHandPlayername = document.createElement("h3");
    eleHandPlayername.innerText = "Player " + (i+1) + " (" + players[i].score + ")";
    eleHandContainer.appendChild(eleHandPlayername);

    for(let j = 0; j < players[i].deck.length; j++) {
      let eleHandCard = document.createElement("p");
      eleHandCard.innerText = players[i].deck[j].category + " - " + players[i].deck[j].object;
      eleHandContainer.appendChild(eleHandCard);
    }
    
    elePlayerHands.appendChild(eleHandContainer);
  }
}

/**
 * prepareTurn
 * 
 * Create DOM from elements for the player's action
 */
function prepareTurn() {
  eleTurnPlayername.innerText = "Player " + (currentPlayerIndex + 1);

  if(!eleTurnFormCategory.children.length) {
    for(let i = 0; i < categories.length; i++) {
      let eleTurnFormCategoryOption = document.createElement("option");
      eleTurnFormCategoryOption.innerText = categories[i];
      eleTurnFormCategory.appendChild(eleTurnFormCategoryOption);
    }
  } else {
    eleTurnFormCategory.selectedIndex = 0;
  }

  if(!eleTurnFormObject.children.length) {
    for(i = 0; i < objects.length; i++) {
      let eleTurnFormObjectOption = document.createElement("option");
      eleTurnFormObjectOption.innerText = objects[i];
      eleTurnFormObject.appendChild(eleTurnFormObjectOption);
    }
  } else {
    eleTurnFormObject.selectedIndex = 0;
  }

  while(eleTurnFormPlayer.firstChild) {
    eleTurnFormPlayer.removeChild(eleTurnFormPlayer.firstChild);
  }
  for(i = 1; i <= players.length; i++) {
    if(i === (currentPlayerIndex + 1)) { continue; }

    let eleTurnFormPlayerOption = document.createElement("option");
    eleTurnFormPlayerOption.innerText = "Player " + i;
    eleTurnFormPlayerOption.value = i - 1;
    eleTurnFormPlayer.appendChild(eleTurnFormPlayerOption);
  }
}

/**
 * startGame
 * 
 * On game start create the hands for all players and check if a
 * player has a kwartet.
 * 
 * @param {event} e 
 */
function startGame(e) {
  e.preventDefault();

  const numberOfPlayers = parseInt(eleInputNumPlayers.value);

  if(numberOfPlayers > minNumberOfPlayers && numberOfPlayers <= maxNumberOfPlayers) {
    let deck = buildAndShuffleDeck(categories, objects);
    dealDeck(deck, numberOfPlayers);

    for(let i = 0; i < numberOfPlayers; i++) {
      checkForKwartet(i);
    }

    setElePlayerHands();

    prepareTurn();

    eleLobby.style.display = "none";
    eleGame.style.display = "block";
  }
}

/**
 * isCardInPlayerHand
 * 
 * Check if a card with a given category and object is in
 * the hand of a specific player.
 * 
 * @param {string} cat 
 * @param {string} obj 
 * @param {integer} index 
 */
function isCardInPlayerHand(cat, obj, index) {
  if(players[index].deck.some(e => e.category === cat && e.object === obj)) {
    return true;
  }

  return false;
}

/**
 * Remove the card which matches the given category and object from
 * the hand of a specific player.
 * Add this card to the hand of the current player.
 * 
 * @param {string} cat 
 * @param {string} obj 
 * @param {integer} index 
 */
function updatePlayersHands(cat, obj, index) {
  const card = {
    category: cat,
    object: obj
  };

  const cardIndex = players[index].deck.findIndex(e => e.category === cat && e.object === obj);
  players[index].deck.splice(cardIndex, 1);

  players[currentPlayerIndex].deck.push(card);
  sortPlayerHand(currentPlayerIndex);
}

/**
 * processTurn
 * 
 * 
 * 
 * @param {event} e 
 */
function processTurn(e) {
  e.preventDefault();
  eleTurnFormButton.disabled = true;

  const cat = eleTurnFormCategory.value;
  const obj = eleTurnFormObject.value;
  const player = eleTurnFormPlayer.value;

  if(isCardInPlayerHand(cat, obj, player)) {
    updatePlayersHands(cat, obj, player);
    checkForKwartet(currentPlayerIndex);

    setElePlayerHands();
    prepareTurn();
  } else {
    currentPlayerIndex = parseInt(player);
  }

  setTimeout(() => {
    prepareTurn();
    eleTurnFormButton.disabled = false;
  }, 500);
}
