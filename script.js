// Stato dell'applicazione
const state = {
    currentScreen: 'off',
    pin: '',
    correctPin: '1234',
    conversations: [],
    currentConversationId: null,
    contacts: [],
    dialNumber: '',
    callIntervalId: null,
    callStartTime: null,
    callSpeakerOn: false,
    callMuted: false,
    callKeypadVisible: false,
    callCurrentNumber: '',
    settings: {
        theme: 'light',
        startupSound: true,
        vibration: true,
        volume: 80
    },
    photos: [],
    cameraFlashOn: false,
    cameraFacing: 'back'
};

// Elementi DOM
const screens = {
    off: document.getElementById('phone-off'),
    boot: document.getElementById('boot-screen'),
    lock: document.getElementById('lock-screen'),
    home: document.getElementById('home-screen'),
    messagesList: document.getElementById('messages-list'),
    messages: document.getElementById('messages-app'),
    placeholder: document.getElementById('placeholder-app'),
    phoneApp: document.getElementById('phone-app'),
    phoneCallScreen: document.getElementById('phone-call-screen'),
    settingsApp: document.getElementById('settings-app'),
    cameraApp: document.getElementById('camera-app'),
    cameraGalleryScreen: document.getElementById('camera-gallery-screen')
};

const powerBtn = document.getElementById('power-btn');
const pinDots = [
    document.getElementById('pin-dot-1'),
    document.getElementById('pin-dot-2'),
    document.getElementById('pin-dot-3'),
    document.getElementById('pin-dot-4')
];
const pinError = document.getElementById('pin-error');
const keypadKeys = document.querySelectorAll('.key[data-key]');
const deleteBtn = document.getElementById('delete-btn');
const appIcons = document.querySelectorAll('.app-icon');
const backBtn = document.getElementById('back-btn');
const sendBtn = document.getElementById('send-btn');
const messageInput = document.getElementById('message-input');
const recipientInput = document.getElementById('recipient-input');
const contactNameInput = document.getElementById('contact-name-input');
const chatArea = document.getElementById('chat-area');
const appBackBtns = document.querySelectorAll('.app-back-btn');
const newConversationBtn = document.getElementById('new-conversation-btn');
const conversationsList = document.getElementById('conversations-list');
const contactInputWrapper = document.getElementById('contact-input-wrapper');
const contactName = document.getElementById('contact-name');
const contactNumber = document.getElementById('contact-number');
const messagesListBackBtn = document.getElementById('messages-list-back-btn');
const contactsPickerList = document.getElementById('contacts-picker-list');
const addContactForm = document.getElementById('add-contact-form');
const newContactNameInput = document.getElementById('new-contact-name');
const newContactNumberInput = document.getElementById('new-contact-number');
const contactFormCancel = document.getElementById('contact-form-cancel');
const contactFormSave = document.getElementById('contact-form-save');

// Funzione per cambiare schermata
function showScreen(screenName) {
    // Nascondi tutte le schermate
    Object.values(screens).forEach(screen => {
        if (screen) {
            screen.classList.add('hidden');
        }
    });
    
    // Mostra la schermata richiesta
    if (screens[screenName]) {
        screens[screenName].classList.remove('hidden');
        state.currentScreen = screenName;
    }
}

// 1. Accensione del telefono
function powerOn() {
    showScreen('boot');
    bootSystem();
}

// 2. Boot del sistema
function bootSystem() {
    // Dopo 2-3 secondi mostra la schermata di blocco
    setTimeout(() => {
        showScreen('lock');
        resetPin();
    }, 2500);
}

// 3. Reset PIN
function resetPin() {
    state.pin = '';
    pinDots.forEach(dot => {
        dot.classList.remove('filled');
    });
    pinError.classList.add('hidden');
}

// 4. Aggiungi cifra al PIN
function addPinDigit(digit) {
    if (state.pin.length < 4) {
        state.pin += digit;
        pinDots[state.pin.length - 1].classList.add('filled');
        
        // Se abbiamo 4 cifre, verifica il PIN
        if (state.pin.length === 4) {
            setTimeout(() => {
                unlockPhone();
            }, 300);
        }
    }
}

// 5. Rimuovi cifra dal PIN
function removePinDigit() {
    if (state.pin.length > 0) {
        pinDots[state.pin.length - 1].classList.remove('filled');
        state.pin = state.pin.slice(0, -1);
    }
}

// 6. Sblocca telefono
function unlockPhone() {
    if (state.pin === state.correctPin) {
        // PIN corretto - sblocca
        showScreen('home');
        resetPin();
    } else {
        // PIN errato - mostra errore e reset
        pinError.classList.remove('hidden');
        // Aggiungi animazione di vibrazione
        screens.lock.style.animation = 'shake 0.5s ease';
        setTimeout(() => {
            screens.lock.style.animation = '';
        }, 500);
        
        setTimeout(() => {
            resetPin();
        }, 1500);
    }
}

// 7. Apri app
function openApp(appName) {
    if (appName === 'messages') {
        showScreen('messagesList');
        renderConversationsList();
    } else if (appName === 'phone') {
        showScreen('phoneApp');
        updateDialDisplay();
        renderContactsList();
        renderContactsPicker();
    } else if (appName === 'settings') {
        showScreen('settingsApp');
        initSettingsUI();
    } else if (appName === 'camera') {
        showScreen('cameraApp');
        initCameraUI();
    } else {
        const placeholderTitle = document.getElementById('placeholder-title');
        const placeholderIcon = document.getElementById('placeholder-icon');
        const appLabels = { };
        const appInfo = appLabels[appName] || { title: 'App', icon: '📱' };
        if (placeholderTitle) placeholderTitle.textContent = appInfo.title;
        if (placeholderIcon) placeholderIcon.textContent = appInfo.icon;
        showScreen('placeholder');
    }
}

// 8. Torna alla home
function goHome() {
    showScreen('home');
}

// 8b. Torna alla lista conversazioni
function goToConversationsList() {
    showScreen('messagesList');
    renderConversationsList();
}

// 8c. Apri nuova conversazione
function openNewConversation() {
    state.currentConversationId = null;
    if (contactNameInput) contactNameInput.value = '';
    if (recipientInput) recipientInput.value = '';
    if (messageInput) messageInput.value = '';
    if (contactName) contactName.textContent = 'Nuovo messaggio';
    if (contactNumber) contactNumber.textContent = '';
    if (contactInputWrapper) contactInputWrapper.classList.remove('hidden');
    if (chatArea) {
        chatArea.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-icon">💬</div>
                <p>Inizia una nuova conversazione</p>
            </div>
        `;
    }
    renderContactsPicker();
    showScreen('messages');
}

// 8d. Apri conversazione esistente
function openConversation(conversationId) {
    const conversation = state.conversations.find(c => c.id === conversationId);
    if (!conversation) return;
    
    state.currentConversationId = conversationId;
    if (contactName) contactName.textContent = conversation.name || conversation.number;
    if (contactNumber) contactNumber.textContent = conversation.number;
    if (contactInputWrapper) contactInputWrapper.classList.add('hidden');
    
    // Renderizza i messaggi
    if (chatArea) {
        chatArea.innerHTML = '';
        conversation.messages.forEach(msg => {
            const messageEl = createMessageElement(msg.text, msg.type, conversation.name || conversation.number, msg.timestamp);
            chatArea.appendChild(messageEl);
        });
        chatArea.scrollTop = chatArea.scrollHeight;
    }
    showScreen('messages');
}

// 8e. Renderizza lista conversazioni
function renderConversationsList() {
    if (state.conversations.length === 0) {
        conversationsList.innerHTML = `
            <div class="empty-conversations">
                <div class="empty-icon">💬</div>
                <p>Nessuna conversazione</p>
                <p class="empty-hint">Tocca + per iniziare</p>
            </div>
        `;
        return;
    }
    
    conversationsList.innerHTML = state.conversations.map(conv => {
        const lastMessage = conv.messages[conv.messages.length - 1];
        const preview = lastMessage ? lastMessage.text : 'Nessun messaggio';
        const time = lastMessage ? formatTime(lastMessage.timestamp) : '';
        
        return `
            <div class="conversation-item" data-conversation-id="${conv.id}">
                <div class="conversation-avatar">${getInitials(conv.name || conv.number)}</div>
                <div class="conversation-info">
                    <div class="conversation-name">${conv.name || conv.number}</div>
                    <div class="conversation-preview">${preview}</div>
                </div>
                <div class="conversation-time">${time}</div>
            </div>
        `;
    }).join('');
    
    // Aggiungi event listeners
    conversationsList.querySelectorAll('.conversation-item').forEach(item => {
        item.addEventListener('click', () => {
            const conversationId = parseInt(item.getAttribute('data-conversation-id'));
            openConversation(conversationId);
        });
    });
}

// 8f. Ottieni iniziali per avatar
function getInitials(text) {
    if (!text) return '?';
    const parts = text.split(' ');
    if (parts.length > 1) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return text.substring(0, 2).toUpperCase();
}

// 8h. Trova conversazione per numero (evita duplicati)
function findConversationByNumber(number) {
    const n = (number || '').trim();
    return state.conversations.find(c => (c.number || '').trim() === n);
}

// 8g. Formatta ora
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Ora';
    if (minutes < 60) return `${minutes}m`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
    return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
}

// ——— App Telefono ———
function updateDialDisplay() {
    const el = document.getElementById('dial-display');
    if (el) el.textContent = state.dialNumber || '';
}

function switchPhoneTab(tabName) {
    document.querySelectorAll('.phone-tab').forEach(t => t.classList.remove('active'));
    const tab = document.querySelector('.phone-tab[data-tab="' + tabName + '"]');
    if (tab) tab.classList.add('active');
    document.getElementById('phone-dialer').classList.toggle('hidden', tabName !== 'dialer');
    document.getElementById('phone-contacts').classList.toggle('hidden', tabName !== 'contacts');
    if (tabName === 'contacts') renderContactsList();
}

function dialAppend(digit) {
    state.dialNumber += digit;
    updateDialDisplay();
}

function dialDelete() {
    state.dialNumber = state.dialNumber.slice(0, -1);
    updateDialDisplay();
}

function getContactByNumber(number) {
    const n = (number || '').trim();
    return state.contacts.find(c => (c.number || '').trim() === n);
}

function startCall() {
    const num = state.dialNumber.trim();
    if (!num) return;
    const contact = getContactByNumber(num);
    const name = contact ? contact.name : (num || 'Numero sconosciuto');
    const displayNumber = num || '—';

    state.callCurrentNumber = num;
    state.callSpeakerOn = false;
    state.callMuted = false;
    state.callKeypadVisible = false;

    document.getElementById('call-avatar').textContent = getInitials(name);
    document.getElementById('call-name').textContent = name;
    document.getElementById('call-number').textContent = displayNumber;
    document.getElementById('call-duration').textContent = '00:00';
    updateCallOptionButtons();

    const dtmfPanel = document.getElementById('call-dtmf-keypad');
    if (dtmfPanel) dtmfPanel.classList.add('hidden');

    state.callStartTime = Date.now();
    state.callIntervalId = setInterval(() => {
        const sec = Math.floor((Date.now() - state.callStartTime) / 1000);
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        const el = document.getElementById('call-duration');
        if (el) el.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    }, 1000);

    showScreen('phoneCallScreen');
}

function updateCallOptionButtons() {
    const speakerBtn = document.getElementById('call-speaker-btn');
    const muteBtn = document.getElementById('call-mute-btn');
    const keypadBtn = document.getElementById('call-keypad-btn');
    const speakerIcon = document.getElementById('call-speaker-icon');
    if (speakerBtn) speakerBtn.classList.toggle('active', state.callSpeakerOn);
    if (speakerIcon) speakerIcon.textContent = state.callSpeakerOn ? '🔈' : '🔊';
    if (muteBtn) muteBtn.classList.toggle('active', state.callMuted);
    const muteIcon = document.getElementById('call-mute-icon');
    if (muteIcon) muteIcon.textContent = state.callMuted ? '🔇' : '🎤';
    if (keypadBtn) keypadBtn.classList.toggle('active', state.callKeypadVisible);
}

function toggleCallSpeaker() {
    state.callSpeakerOn = !state.callSpeakerOn;
    updateCallOptionButtons();
}

function toggleCallMute() {
    state.callMuted = !state.callMuted;
    updateCallOptionButtons();
}

function toggleCallKeypad() {
    state.callKeypadVisible = !state.callKeypadVisible;
    const dtmfPanel = document.getElementById('call-dtmf-keypad');
    if (dtmfPanel) dtmfPanel.classList.toggle('hidden', !state.callKeypadVisible);
    updateCallOptionButtons();
}

function addCallToContacts() {
    const num = state.callCurrentNumber.trim();
    if (!num) return;
    if (getContactByNumber(num)) return;
    endCall();
    showScreen('phoneApp');
    switchPhoneTab('contacts');
    openAddContactForm(num);
}

function endCall() {
    if (state.callIntervalId) {
        clearInterval(state.callIntervalId);
        state.callIntervalId = null;
    }
    state.callStartTime = null;
    state.callSpeakerOn = false;
    state.callMuted = false;
    state.callKeypadVisible = false;
    state.callCurrentNumber = '';
    showScreen('phoneApp');
    updateDialDisplay();
}

function renderContactsList() {
    const list = document.getElementById('contacts-list');
    if (!list) return;

    if (state.contacts.length === 0) {
        list.innerHTML = `
            <div class="empty-conversations" id="contacts-empty">
                <div class="empty-icon">👤</div>
                <p>Nessun contatto</p>
                <p class="empty-hint">Aggiungi un contatto</p>
            </div>`;
        return;
    }
    list.innerHTML = state.contacts.map(c => `
        <div class="contact-item" data-contact-number="${(c.number || '').replace(/"/g, '&quot;')}">
            <div class="contact-item-avatar">${getInitials(c.name || c.number)}</div>
            <div class="contact-item-info">
                <div class="contact-item-name">${escapeHtml(c.name || 'Senza nome')}</div>
                <div class="contact-item-number">${escapeHtml(c.number || '')}</div>
            </div>
        </div>
    `).join('');

    list.querySelectorAll('.contact-item').forEach(item => {
        item.addEventListener('click', () => {
            const number = item.getAttribute('data-contact-number');
            if (number) {
                state.dialNumber = number;
                switchPhoneTab('dialer');
                updateDialDisplay();
            }
        });
    });
}

function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
}

function openAddContactForm(prefillNumber) {
    if (newContactNameInput) newContactNameInput.value = '';
    if (newContactNumberInput) {
        newContactNumberInput.value = (prefillNumber != null && prefillNumber !== '') ? String(prefillNumber).trim() : '';
    }
    if (addContactForm) addContactForm.classList.remove('hidden');
}

function closeAddContactForm() {
    if (addContactForm) addContactForm.classList.add('hidden');
}

function saveContact() {
    const name = (newContactNameInput && newContactNameInput.value.trim()) || '';
    const number = (newContactNumberInput && newContactNumberInput.value.trim()) || '';
    if (!number) return;
    state.contacts.push({ id: Date.now(), name: name || null, number });
    closeAddContactForm();
    renderContactsList();
    renderContactsPicker();
}

function renderContactsPicker() {
    const picker = document.getElementById('contacts-picker');
    if (!contactsPickerList) return;
    if (picker) picker.classList.toggle('hidden', state.contacts.length === 0);
    contactsPickerList.innerHTML = '';
    state.contacts.forEach(c => {
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = 'contact-pill';
        pill.textContent = c.name ? `${c.name} (${c.number})` : c.number;
        pill.addEventListener('click', () => {
            const existing = findConversationByNumber(c.number);
            if (existing) {
                openConversation(existing.id);
                return;
            }
            if (contactNameInput) contactNameInput.value = c.name || '';
            if (recipientInput) recipientInput.value = c.number || '';
            pill.classList.add('selected');
            contactsPickerList.querySelectorAll('.contact-pill').forEach(p => { if (p !== pill) p.classList.remove('selected'); });
        });
        contactsPickerList.appendChild(pill);
    });
}

// ——— App Impostazioni ———
function initSettingsUI() {
    const themeOptions = document.querySelectorAll('.settings-toggle-option[data-setting="theme"]');
    themeOptions.forEach(opt => {
        opt.classList.toggle('active', opt.getAttribute('data-value') === state.settings.theme);
        opt.onclick = () => {
            const value = opt.getAttribute('data-value');
            state.settings.theme = value;
            themeOptions.forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            applyTheme(value);
        };
    });

    const startupSound = document.getElementById('setting-startup-sound');
    const vibration = document.getElementById('setting-vibration');
    const volumeSlider = document.getElementById('setting-volume');
    const volumeValue = document.getElementById('setting-volume-value');
    if (startupSound) {
        startupSound.checked = state.settings.startupSound;
        startupSound.onchange = () => { state.settings.startupSound = startupSound.checked; };
    }
    if (vibration) {
        vibration.checked = state.settings.vibration;
        vibration.onchange = () => { state.settings.vibration = vibration.checked; };
    }
    if (volumeSlider) {
        volumeSlider.value = state.settings.volume;
        if (volumeValue) volumeValue.textContent = state.settings.volume + '%';
        volumeSlider.oninput = () => {
            state.settings.volume = parseInt(volumeSlider.value, 10);
            if (volumeValue) volumeValue.textContent = state.settings.volume + '%';
        };
    }
    applyTheme(state.settings.theme);
}

function applyTheme(theme) {
    const container = document.querySelector('.phone-container');
    if (container) container.classList.toggle('theme-dark', theme === 'dark');
}

// ——— App Fotocamera ———
function initCameraUI() {
    updateCameraGalleryPreview();
    const shutterBtn = document.getElementById('camera-shutter-btn');
    const flashBtn = document.getElementById('camera-flash-btn');
    const switchBtn = document.getElementById('camera-switch-btn');
    const preview = document.getElementById('camera-gallery-preview');
    if (shutterBtn) shutterBtn.onclick = takePhoto;
    if (flashBtn) {
        flashBtn.classList.toggle('active', state.cameraFlashOn);
        flashBtn.onclick = () => {
            state.cameraFlashOn = !state.cameraFlashOn;
            flashBtn.classList.toggle('active', state.cameraFlashOn);
        };
    }
    if (switchBtn) {
        switchBtn.onclick = () => {
            state.cameraFacing = state.cameraFacing === 'back' ? 'front' : 'back';
        };
    }
    if (preview) {
        preview.onclick = () => {
            if (state.photos.length > 0) openCameraGallery();
        };
    }
}

function takePhoto() {
    const overlay = document.getElementById('camera-flash-overlay');
    if (overlay && state.cameraFlashOn) {
        overlay.classList.remove('hidden');
        overlay.classList.add('flash');
        setTimeout(() => {
            overlay.classList.remove('flash');
            overlay.classList.add('hidden');
        }, 400);
    }
    const colors = ['#667eea', '#764ba2', '#2ecc71', '#e74c3c', '#3498db', '#f39c12'];
    const color = colors[state.photos.length % colors.length];
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 200, 200);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '14px sans-serif';
    ctx.fillText('Foto ' + (state.photos.length + 1), 20, 110);
    state.photos.push({ id: Date.now(), dataUrl: canvas.toDataURL('image/png') });
    updateCameraGalleryPreview();
}

function updateCameraGalleryPreview() {
    const preview = document.getElementById('camera-gallery-preview');
    const empty = document.getElementById('camera-gallery-empty');
    if (!preview) return;
    preview.classList.toggle('empty', state.photos.length === 0);
    if (state.photos.length === 0) {
        preview.innerHTML = '<div class="camera-gallery-empty" id="camera-gallery-empty">Nessuna foto</div>';
    } else {
        const last = state.photos[state.photos.length - 1];
        preview.innerHTML = '<img src="' + last.dataUrl + '" alt="Ultima" style="width:100%;height:100%;object-fit:cover;">';
    }
}

function openCameraGallery() {
    renderCameraGallery();
    showScreen('cameraGalleryScreen');
}

function renderCameraGallery() {
    const content = document.getElementById('camera-gallery-content');
    const emptyState = document.getElementById('camera-gallery-empty-state');
    if (!content) return;
    if (state.photos.length === 0) {
        content.innerHTML = '<div class="camera-gallery-empty-state" id="camera-gallery-empty-state"><div class="empty-icon">🖼️</div><p>Nessuna foto</p></div>';
        return;
    }
    emptyState && emptyState.remove();
    content.innerHTML = state.photos.map(p => '<div class="camera-photo-item"><img src="' + p.dataUrl + '" alt="Foto"></div>').join('');
}

// 9. Invia messaggio
function sendMessage() {
    if (!messageInput || !chatArea) return;
    
    const messageText = messageInput.value.trim();
    const recipient = recipientInput ? recipientInput.value.trim() : '';
    const contactNameValue = contactNameInput ? contactNameInput.value.trim() : '';
    
    if (!messageText) {
        return;
    }
    
    if (!state.currentConversationId && !recipient) {
        alert('Inserisci un numero destinatario');
        return;
    }
    
    let conversation;
    const timestamp = Date.now();
    
    if (state.currentConversationId) {
        // Conversazione esistente
        conversation = state.conversations.find(c => c.id === state.currentConversationId);
        if (!conversation) return;
    } else {
        // Cerca conversazione già esistente con questo numero (evita duplicati)
        const existing = findConversationByNumber(recipient);
        if (existing) {
            conversation = existing;
            state.currentConversationId = existing.id;
            if (contactName) contactName.textContent = conversation.name || conversation.number;
            if (contactNumber) contactNumber.textContent = conversation.number;
            if (contactInputWrapper) contactInputWrapper.classList.add('hidden');
        } else {
            // Nuova conversazione
            const conversationId = Date.now();
            conversation = {
                id: conversationId,
                number: recipient,
                name: contactNameValue || null,
                messages: []
            };
            state.conversations.push(conversation);
            state.currentConversationId = conversationId;
            if (contactName) contactName.textContent = conversation.name || conversation.number;
            if (contactNumber) contactNumber.textContent = conversation.number;
            if (contactInputWrapper) contactInputWrapper.classList.add('hidden');
        }
    }
    
    // Rimuovi messaggio di benvenuto se presente
    const welcomeMsg = chatArea.querySelector('.welcome-message');
    if (welcomeMsg) {
        welcomeMsg.remove();
    }
    
    // Aggiungi messaggio inviato
    const sentMessage = {
        text: messageText,
        type: 'sent',
        timestamp: timestamp
    };
    conversation.messages.push(sentMessage);
    
    const sentMessageEl = createMessageElement(messageText, 'sent', conversation.name || conversation.number, timestamp);
    chatArea.appendChild(sentMessageEl);
    
    // Scrolla in basso
    chatArea.scrollTop = chatArea.scrollHeight;
    
    // Pulisci input
    messageInput.value = '';
    
    // Simula risposta automatica dopo 1-2 secondi
    setTimeout(() => {
        const replyText = getAutoReply(messageText);
        
        const receivedMessage = {
            text: replyText,
            type: 'received',
            timestamp: Date.now()
        };
        conversation.messages.push(receivedMessage);
        
        const receivedMessageEl = createMessageElement(
            replyText,
            'received',
            conversation.name || conversation.number,
            receivedMessage.timestamp
        );
        chatArea.appendChild(receivedMessageEl);
        chatArea.scrollTop = chatArea.scrollHeight;
        
        // Aggiorna lista conversazioni
        renderConversationsList();
    }, 1000 + Math.random() * 1000);
}

// Risposta automatica: prima controlla parole chiave, altrimenti messaggio random
function getAutoReply(userMessage) {
    const text = (userMessage || '').toLowerCase().trim();
    
    // Parole chiave → risposte specifiche (ordine conta: più specifiche prima)
    const keywordResponses = [
        { keywords: ['ciao', 'salve', 'hey', 'buongiorno', 'buonasera'], replies: ['Ciao! Come stai?', 'Ciao! 👍', 'Salve! Di cosa hai bisogno?', 'Hey! Tutto bene?'] },
        { keywords: ['grazie', 'grazie mille'], replies: ['Prego!', 'Figurati!', 'Di niente!', 'Quando vuoi!'] },
        { keywords: ['arrivederci', 'ciao ciao', 'a dopo'], replies: ['A presto!', 'Ciao! A dopo 👋', 'Arrivederci!'] },
        { keywords: ['come stai', 'come va', 'tutto bene'], replies: ['Tutto bene, grazie! E tu?', 'Bene! Tu come stai?', 'Tutto ok qui 👍'] },
        { keywords: ['sì', 'si', 'ok', 'va bene', 'perfetto'], replies: ['Perfetto!', 'Ok!', 'Va bene così 👍'] },
        { keywords: ['no', 'no grazie'], replies: ['Ok, nessun problema.', 'Va bene!', 'Come preferisci.'] },
        { keywords: ['aiuto', 'help'], replies: ['Dimmi pure, in cosa posso aiutarti?', 'Sono qui! Cosa ti serve?', 'Certo, scrivimi pure.'] },
        { keywords: ['ora', 'orario', 'quando'], replies: ['Quando preferisci tu!', 'Possiamo anche ora, se va bene.', 'Fammi sapere tu l’orario.'] },
        { keywords: ['dove', 'indirizzo', 'luogo'], replies: ['Ti mando l’indirizzo tra poco.', 'Siamo in centro, ti indico dopo.', 'Ti scrivo il luogo esatto.'] },
        { keywords: ['prezzo', 'costo', 'quanto costa'], replies: ['Ti mando i dettagli sui prezzi.', 'Il costo dipende, ti aggiorno.', 'Ti faccio sapere il prezzo.'] },
        { keywords: ['amore', 'ti amo', 'ti voglio bene'], replies: ['Anch’io 💕', 'Ti voglio bene!', 'Grazie, anche io! ❤️'] },
        { keywords: ['ridere', 'ahah', 'lol', 'haha'], replies: ['Ahahah 😄', '😂', 'Mi fa piacere!'] },
        { keywords: ['scusa', 'scusami', 'mi dispiace'], replies: ['Tranquillo, nessun problema.', 'Non preoccuparti!', 'Va bene, figurati.'] }
    ];
    
    for (const { keywords, replies } of keywordResponses) {
        if (keywords.some(kw => text.includes(kw))) {
            return replies[Math.floor(Math.random() * replies.length)];
        }
    }
    
    // Nessuna parola chiave: risposta generica random
    const randomResponses = [
        'Messaggio ricevuto',
        'Ok, grazie!',
        'Ricevuto 👍',
        'Perfetto!',
        'Grazie per il messaggio',
        'Ok!',
        'Fatto!',
        'Va bene.',
        'Ricevuto, grazie.',
        'Perfetto, grazie!',
        'Notato!',
        'Capito 👍',
        'D’accordo!',
        'Tutto chiaro.',
        'Ti rispondo appena posso.',
        'Visto!',
        'Grazie mille!',
        'Super!',
        'Ottimo!'
    ];
    return randomResponses[Math.floor(Math.random() * randomResponses.length)];
}

// 10. Crea elemento messaggio
function createMessageElement(text, type, recipient, timestamp) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = text;
    
    const info = document.createElement('div');
    info.className = 'message-info';
    const time = timestamp ? new Date(timestamp) : new Date();
    info.textContent = `${type === 'sent' ? 'Tu' : (recipient || 'Contatto')} • ${time.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`;
    
    messageDiv.appendChild(bubble);
    messageDiv.appendChild(info);
    
    return messageDiv;
}

// Event Listeners

// Tasto di accensione
powerBtn.addEventListener('click', powerOn);

// Tastierino numerico
keypadKeys.forEach(key => {
    key.addEventListener('click', () => {
        const digit = key.getAttribute('data-key');
        addPinDigit(digit);
    });
});

// Tasto cancella
deleteBtn.addEventListener('click', removePinDigit);

// Icone app
appIcons.forEach(icon => {
    icon.addEventListener('click', () => {
        const appName = icon.getAttribute('data-app');
        openApp(appName);
    });
});

// Pulsante indietro (Messaggi) – torna alla lista conversazioni
backBtn.addEventListener('click', goToConversationsList);

// Esci dall'app Messaggi (dalla lista) – torna alla home
if (messagesListBackBtn) {
    messagesListBackBtn.addEventListener('click', goHome);
}

// Nuova conversazione
if (newConversationBtn) {
    newConversationBtn.addEventListener('click', openNewConversation);
}

// Pulsanti indietro (App placeholder)
appBackBtns.forEach(btn => {
    btn.addEventListener('click', goHome);
});

document.querySelectorAll('.settings-back-btn').forEach(btn => {
    btn.addEventListener('click', goHome);
});
document.querySelectorAll('.camera-back-btn').forEach(btn => {
    btn.addEventListener('click', goHome);
});
document.querySelectorAll('.camera-gallery-back-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        showScreen('cameraApp');
        initCameraUI();
    });
});

// App Telefono: tab, tastierino, chiamata, contatti
document.querySelectorAll('.phone-tab').forEach(tab => {
    tab.addEventListener('click', () => switchPhoneTab(tab.getAttribute('data-tab')));
});
document.querySelectorAll('.dial-key').forEach(key => {
    key.addEventListener('click', () => dialAppend(key.getAttribute('data-dial')));
});
const dialDeleteBtn = document.getElementById('dial-delete-btn');
if (dialDeleteBtn) dialDeleteBtn.addEventListener('click', dialDelete);
const dialCallBtn = document.getElementById('dial-call-btn');
if (dialCallBtn) dialCallBtn.addEventListener('click', startCall);
document.querySelectorAll('.phone-back-btn').forEach(btn => {
    btn.addEventListener('click', goHome);
});
const callHangupBtn = document.getElementById('call-hangup-btn');
if (callHangupBtn) callHangupBtn.addEventListener('click', endCall);
const callSpeakerBtn = document.getElementById('call-speaker-btn');
if (callSpeakerBtn) callSpeakerBtn.addEventListener('click', toggleCallSpeaker);
const callMuteBtn = document.getElementById('call-mute-btn');
if (callMuteBtn) callMuteBtn.addEventListener('click', toggleCallMute);
const callKeypadBtn = document.getElementById('call-keypad-btn');
if (callKeypadBtn) callKeypadBtn.addEventListener('click', toggleCallKeypad);
const callAddContactBtn = document.getElementById('call-add-contact-btn');
if (callAddContactBtn) callAddContactBtn.addEventListener('click', addCallToContacts);
document.querySelectorAll('.call-dtmf-key').forEach(key => {
    key.addEventListener('click', () => {
        const digit = key.getAttribute('data-dtmf');
        if (digit) { /* simulazione tono DTMF: nessuna azione reale */ }
    });
});
const addContactBtn = document.getElementById('add-contact-btn');
if (addContactBtn) addContactBtn.addEventListener('click', openAddContactForm);
if (contactFormCancel) contactFormCancel.addEventListener('click', closeAddContactForm);
if (contactFormSave) contactFormSave.addEventListener('click', saveContact);

// Invia messaggio
sendBtn.addEventListener('click', sendMessage);

// Invia messaggio con Enter
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Invia messaggio con Enter anche nel campo destinatario/nome
recipientInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        messageInput.focus();
    }
});

contactNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        recipientInput.focus();
    }
});

// Inizializzazione
showScreen('off');
