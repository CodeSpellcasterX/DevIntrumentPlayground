const pianoKeys = document.querySelectorAll(".piano-keys .key"),
volumeSlider = document.querySelector(".volume-slider input"),
keysCheckbox = document.querySelector(".keys-checkbox input");
const dropArea = document.getElementById('drop-area');
const cardsContainer = document.getElementById('cards-container');

const chatWindow = document.getElementById('chat-window');
const chatbotButton = document.getElementById('chatbot-button');
const chatMessages = document.getElementById('chat-messages');
let isFocused = false;
let initialResponseSent = false;

let allKeys = [],
audio = new Audio(`./src/tunes/a.wav`);


const playTune = (key) => {
    audio.src = `./src/tunes/${key}.wav`;
    audio.play();

    const clickedKey = document.querySelector(`[data-key="${key}"]`);
    clickedKey.classList.add("active");
    setTimeout(() => {
        clickedKey.classList.remove("active");
    }, 150);
}

pianoKeys.forEach(key => {
    allKeys.push(key.dataset.key); // adding data-key value to the allKeys array
    // calling playTune function with passing data-key value as an argument
    key.addEventListener("click", () => playTune(key.dataset.key));
});

const handleVolume = (e) => {
    audio.volume = e.target.value; // passing the range slider value as an audio volume
}

const showHideKeys = () => {
    // toggling hide class from each key on the checkbox click
    pianoKeys.forEach(key => key.classList.toggle("hide"));
}

const pressedKey = (e) => {
    // if the pressed key is in the allKeys array, only call the playTune function
    if(allKeys.includes(e.key) && !isFocused) playTune(e.key);
}

keysCheckbox.addEventListener("click", showHideKeys);
volumeSlider.addEventListener("input", handleVolume);
document.addEventListener("keydown", pressedKey);

window.addEventListener("online", () => {
    const statusText = "Online 🟢"
    const status = document.getElementById("status");
    status.style.color = 'green'
    status.textContent = statusText;
})

window.addEventListener("offline", () => {
    const statusText = "Offline 🔘"
    const status = document.getElementById("status");
    status.style.color = 'grey'
    status.textContent = statusText;
})

function loadCards() {
    const cards = JSON.parse(localStorage.getItem('cards')) || [];
    cards.forEach(({ metadata, url, position }) => createCard(metadata, url, position));
}

function createCard(metadata, url, position) {
    const card = document.createElement('div');
    card.className = 'card';
    card.draggable = true;
    card.style.left = `${position.x}px`;
    card.style.top = `${position.y}px`;

    const image = metadata && metadata.image ? `<img src="${metadata.image}" alt="Preview">` : '';
    const title = metadata && metadata.title ? metadata.title : 'No Title Available';

    card.innerHTML = `
        ${image}
        <a href="${url}" target="_blank" style="font-weight:bold">${title}</a>
        <button class="delete-btn">Remove</button>
    `;

    card.querySelector('.delete-btn').addEventListener('click', () => deleteCard(card, url));
    card.addEventListener('dragstart', dragStart);
    card.addEventListener('dragend', (event) => dragEnd(event, card, metadata, url));

    cardsContainer.appendChild(card);
}

function saveCard(metadata, url, position) {
    const cards = JSON.parse(localStorage.getItem('cards')) || [];
    cards.push({ metadata, url, position });
    localStorage.setItem('cards', JSON.stringify(cards));
}

function dragStart(event) {
    event.dataTransfer.setData('text/plain', null); // Required for Firefox
}

function dragEnd(event, card, metadata, url) {
    const rect = cardsContainer.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    card.style.left = `${x}px`;
    card.style.top = `${y}px`;

    // Update position in local storage
    const cards = JSON.parse(localStorage.getItem('cards')) || [];
    const index = cards.findIndex(c => c.url === url);
    if (index !== -1) {
        cards[index].position = { x, y };
        localStorage.setItem('cards', JSON.stringify(cards));
    }
}

function deleteCard(card, url) {
    card.remove();
    const cards = JSON.parse(localStorage.getItem('cards')) || [];
    const updatedCards = cards.filter(c => c.url !== url);
    localStorage.setItem('cards', JSON.stringify(updatedCards));
}


dropArea.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropArea.style.backgroundColor = '#e0e0e0';
});

dropArea.addEventListener('dragleave', () => {
    dropArea.style.backgroundColor = '#f9f9f9';
});

dropArea.addEventListener('drop', async (event) => {
    event.preventDefault();
    dropArea.style.backgroundColor = '#f9f9f9';

    const url = event.dataTransfer.getData('text/uri-list') || event.dataTransfer.getData('text/plain');

    if (url) {
        const metadata = await fetchMetadata(url);
        createCard(metadata, url, { x: 10, y: 10 });
        saveCard(metadata, url, { x: 10, y: 10 });
    }
});

async function fetchMetadata(url) {
    try {
        const response = await fetch(`https://api.linkpreview.net/?key=09a350483941d6838034410fb21ed3b8&q=${url}`);
        const data = await response.json();
        console.log(response);
        return data;
    } catch (error) {
        console.error('Error fetching metadata:', error);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', function(){

    const chatInput = document.getElementById('chat-input');
    loadCards();
    //check for the original starting status
     if( navigator.onLine == true ){
        const statusText = "Online 🟢"
        const status = document.getElementById("status");
        status.style.color = 'green'
        status.textContent = statusText;
     }else{
        const statusText = "Offline 🔘"
        const status = document.getElementById("status");
        status.style.color = 'grey'
        status.textContent = statusText;
     }

     chatbotButton.addEventListener('click', () => {
        chatWindow.classList.toggle('hidden');
        const isVisible = !chatWindow.classList.contains('hidden');

        if (isVisible && !initialResponseSent) {
            console.log("entered")
            setTimeout(() => {
                addMessageToChat('Bot', 'Hello! How can I assist you today?');
            }, 1000);
            initialResponseSent = true;
        }
    });

    chatInput.addEventListener('focus', () => {
        isFocused = true;
    });

    chatInput.addEventListener('blur', () => {
        isFocused = false;
    });
  
    chatInput.addEventListener('keypress', async (e) => {
      if (e.key === 'Enter') {
        const message = e.target.value;
        if (message.trim()) {
          addMessageToChat('You', message);
          e.target.value = '';
        }

        try {
            console.log("hello")
            const response = await fetch('https://api.aimlapi.com/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer 435924130e7e495a954d8f3d3857ed71'
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "user",
                            content: message
                        },
                    ],
                    max_tokens: 512,
                    stream: false,
                }),
            });
    
            if (!response.ok) {
                throw new Error('Failed to fetch HTML/CSS content');
            }
            const data = await response.json();
            addMessageToChat('Bot', data.choices[0]?.message.content)
        } catch (error) {
            console.error('Error fetching HTML/CSS content:', error);
            addMessageToChat('Bot', "Free Trial assitance is over ☹️")
        }
        
      }
    });
  
    function addMessageToChat(sender, message) {
      const messageElement = document.createElement('div');
      messageElement.innerHTML = `<strong class="decorated-text">${sender}:</strong> ${message}`;
      chatMessages.appendChild(messageElement);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
 });

 chatInput.addEventListener('keydown', (e) => {
    if (chatInput.value.trim().length > 0) {
      // Prevent default actions if the text box has content
      if (e.key !== 'Enter' && e.key !== 'Backspace' && e.key !== 'Tab') {
        e.preventDefault();
      }
    }
});

function startTimer(duration) {
    let timer = duration, minutes, seconds;
    const timerElement = document.getElementById('timer');
    const timerButtonElement = document.getElementById('start-timer-btn');
    timerButtonElement.style.visibility = 'hidden'
    timerElement.style.visibility = 'visible';
    
    // Check if the browser supports notifications
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  
    const interval = setInterval(() => {
      minutes = parseInt(timer / 60, 10);
      seconds = parseInt(timer % 60, 10);
  
      minutes = minutes < 10 ? '0' + minutes : minutes;
      seconds = seconds < 10 ? '0' + seconds : seconds;
  
      timerElement.textContent = minutes + ':' + seconds;
  
      if (--timer < 0) {
        timerElement.style.visibility = 'hidden'
        timerButtonElement.style.visibility = 'visible'
        timerButtonElement.style.top = '0rem'
        clearInterval(interval);
        sendNotification();
      }
    }, 1000);
  }
  
  // Function to send a web notification
  function sendNotification() {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Timer Finished', {
        body: 'Your timer has ended.',
        icon: './src/images/Background.jpg' // Optional: Add your own icon URL
      });
    }
  }