'use strict';

// The view state and demonstration conversation stay separate from rendering.
// Replace getDemoReply with an asynchronous API adapter when a backend is ready.
const state = { page: 'home', mode: 'avatar', filter: 'Tutti', search: '', messages: [] };
const $ = (selector) => document.querySelector(selector);
const headings = {
  home: ['', 'La Tuscia, da assaporare.', ''],
  ricette: ['Sapori della Tuscia', 'Il ricettario della Tuscia', 'Ricette di famiglia, ingredienti semplici e sapori della nostra terra.'],
  borghi: ['Paesi e storie della Tuscia', 'I borghi della Tuscia', 'Un borgo diverso da incontrare a ogni visita.']
};
const recipes = [
  { id: 'lombrichelli', title: 'Lombrichelli alla viterbese', category: 'Primi', location: 'Viterbo', description: 'Pasta fatta a mano, pomodoro e il piacere delle cose semplici.', ingredients: ['400 g di farina di semola', 'Circa 200 ml di acqua', '500 g di pomodori pelati', 'Olio extravergine, aglio, basilico e sale'], steps: ['Impasta la farina con l’acqua, aggiunta poco alla volta, fino a ottenere un impasto liscio. Lascialo riposare coperto per circa mezz’ora.', 'Stacca piccoli pezzi e lavorali con le mani, formando lunghi fili di pasta.', 'Prepara un sugo semplice con olio, aglio e pomodoro. Cuoci dolcemente e aggiungi il basilico.', 'Cuoci la pasta in acqua salata, assaggiala per verificare la cottura e condiscila con il sugo.'] },
  { id: 'fagioli', title: 'Fagioli di Sutri alla ghiottona', category: 'Secondi', location: 'Sutri', description: 'Un piatto rustico da portare in tavola con una fetta di pane.', ingredients: ['500 g di fagioli già cotti', '250 g di passata di pomodoro', '1 cipolla piccola', 'Salvia, olio extravergine, sale e pane'], steps: ['Fai appassire la cipolla tritata con un filo d’olio.', 'Unisci pomodoro e salvia e lascia insaporire.', 'Aggiungi i fagioli cotti e un poco della loro acqua. Cuoci dolcemente per circa 20 minuti.', 'Servi con pane tostato e un filo di olio a crudo.'] },
  { id: 'ciambelline', title: 'Ciambelline al vino', category: 'Dolci', location: 'Tuscia', description: 'Il profumo dei biscotti appena sfornati, da condividere.', ingredients: ['500 g di farina', '150 ml di vino bianco', '130 ml di olio di semi', '150 g di zucchero, più quello per la superficie', '8 g di lievito per dolci'], steps: ['Mescola vino, olio e zucchero, poi incorpora la farina con il lievito.', 'Lavora fino a ottenere un impasto morbido e modellalo in piccole ciambelle.', 'Passa la superficie nello zucchero e disponi su una teglia rivestita.', 'Cuoci a 180 °C per circa 20–25 minuti, controllando la doratura.'] }
];
const villages = [
  { id: 'sutri', title: 'Sutri', category: 'Storia e cultura', location: 'Tuscia', description: 'Pietra, vicoli e storie da incontrare con una passeggiata lenta.', story: 'Lascia che siano i vicoli a guidarti: una piazza, una porta antica, il profumo che arriva da una cucina. Questa scheda dimostrativa anticipa lo spazio dedicato alle storie dei luoghi.', ideas: ['Una passeggiata nel centro storico', 'Una sosta in piazza', 'Un assaggio della cucina locale'] },
  { id: 'bolsena', title: 'Bolsena', category: 'Natura', location: 'Tuscia', description: 'Un invito a rallentare, tra le vie del borgo e il paesaggio del lago.', story: 'Ci sono giornate in cui basta camminare senza fretta. Immagina una passeggiata tra il borgo e il lago, con il tempo di fermarti a osservare il paesaggio. I percorsi completi arriveranno con le schede editoriali.', ideas: ['Una passeggiata vicino al lago', 'Le strade del borgo', 'Una pausa con vista'] },
  { id: 'civita', title: 'Civita di Bagnoregio', category: 'Panorami', location: 'Tuscia', description: 'Un borgo sospeso nel paesaggio, da scoprire un passo alla volta.', story: 'Il bello di un viaggio è anche il tempo che gli dedichi. Questa è un’anteprima della futura guida di Rosetta: racconti, curiosità e suggerimenti per vivere i borghi con calma.', ideas: ['Il paesaggio intorno al borgo', 'Una passeggiata tra i vicoli', 'Le storie da raccogliere lungo la strada'] }
];
function chooseFeaturedVillage() {
  let previous = null;
  try { previous = sessionStorage.getItem('nonna-last-village'); } catch { /* Storage can be unavailable. */ }
  const candidates = villages.filter(village => village.id !== previous);
  const chosen = candidates[Math.floor(Math.random() * candidates.length)] || villages[0];
  $('#featured-village-name').textContent = chosen.title;
  $('#featured-village-description').textContent = chosen.description;
  try { sessionStorage.setItem('nonna-last-village', chosen.id); } catch { /* Keep the choice in memory. */ }
}
function updateDate() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('it-IT', { timeZone: 'Europe/Rome', day: 'numeric', month: 'long', weekday: 'long' }).formatToParts(now);
  ['month', 'day', 'weekday'].forEach(key => $(`#${key}`).textContent = parts.find(part => part.type === key).value);
  const date = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  $('#calendar-date').dateTime = date;
}
function setMode(mode, focusInput = false) {
  state.mode = mode;
  const chat = mode === 'chat';
  $('#avatar-view').hidden = chat;
  $('#chat-view').hidden = !chat;
  $('#mode-switch').setAttribute('aria-pressed', String(chat));
  $('#switch-label').textContent = chat ? 'Parla con Nonna Rosetta' : 'Passa alla chat testuale';
  if (chat && !state.messages.length) appendMessage('assistant', 'Ciao, tesoro! Ti va di scoprire insieme una ricetta della Tuscia, un borgo o il detto del giorno?');
  if (focusInput) $('#chat-input').focus({ preventScroll: true });
  if (chat) $('#messages').scrollTop = $('#messages').scrollHeight;
}
function appendMessage(role, content) {
  state.messages.push({ role, content, date: new Date() });
  const row = document.createElement('div');
  row.className = `message ${role}`;
  if (role === 'assistant') {
    const avatar = document.createElement('span');
    avatar.className = 'message-avatar chat-logo';
    avatar.setAttribute('aria-hidden', 'true');
    row.append(avatar);
  }
  const wrapper = document.createElement('div');
  const bubble = document.createElement('p');
  bubble.className = 'message-bubble';
  bubble.textContent = content; // User input is never interpreted as HTML.
  const time = document.createElement('time');
  time.dateTime = new Date().toISOString();
  time.textContent = new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Rome' }).format(new Date());
  wrapper.append(bubble, time);
  row.append(wrapper);
  $('#messages').append(row);
  $('#messages').scrollTop = $('#messages').scrollHeight;
}
function getDemoReply(text) {
  const question = text.toLocaleLowerCase('it');
  if (/detto|dorme|pesci|signific/.test(question)) return '“Chi dorme nun pija pesci” ci ricorda che, per ottenere qualcosa, bisogna darsi da fare. Come in cucina: il primo passo è mettersi il grembiule!';
  const selectedVillage = villages.find(item => question.includes(item.title.toLocaleLowerCase('it')));
  if (selectedVillage) return `${selectedVillage.title}: ${selectedVillage.description} Nella sua scheda trovi qualche spunto per cominciare. Poi, con i contenuti definitivi, ti racconterò anche le sue storie.`;
  const selectedRecipe = recipes.find(item => question.includes(item.title.toLocaleLowerCase('it')));
  if (selectedRecipe) return `${selectedRecipe.title}, che bella scelta! ${selectedRecipe.description} Per cominciare, prepara: ${selectedRecipe.ingredients.slice(0, 3).join(', ')}. Nella scheda trovi tutti i passaggi.`;
  if (/borg|sutr|visit|gita|paes|luogh/.test(question)) return 'Ti porterei a Sutri, tra vicoli, piazze e sapori di casa. Apri “Borghi” qui nel menu: ho preparato qualche spunto per la tua prossima passeggiata.';
  if (/ricett|cucin|piatto|pasta|mang|lombrich/.test(question)) return 'Che ne dici dei lombrichelli alla viterbese? Farina, acqua e un bel sugo di pomodoro. Nel ricettario trovi una prima versione da leggere insieme. Le cose semplici hanno sempre una bella storia.';
  if (/ciao|buongiorno|buonasera|salve/.test(question)) return 'Ciao, tesoro! Qui c’è sempre un posto per te. Oggi preferisci una ricetta o una passeggiata tra i borghi?';
  if (/grazie/.test(question)) return 'È un piacere, tesoro. Torna quando vuoi: la cucina di Rosetta è sempre aperta!';
  return 'In questa prima anteprima posso raccontarti il detto del giorno, suggerirti una ricetta o un borgo. Prova a chiedermi “Cosa cuciniamo oggi?” e cominciamo da lì.';
}
function sendMessage(text) {
  const clean = text.trim().slice(0, 600);
  if (!clean) return;
  setMode('chat');
  appendMessage('user', clean);
  appendMessage('assistant', getDemoReply(clean));
  $('#chat-suggestions').hidden = true;
}
function renderDirectory() {
  const isRecipe = state.page === 'ricette';
  const collection = isRecipe ? recipes : villages;
  const results = collection.filter(item => (state.filter === 'Tutti' || item.category === state.filter) && `${item.title} ${item.description} ${item.location} ${(item.ingredients || []).join(' ')}`.toLocaleLowerCase('it').includes(state.search));
  const container = $('#directory-results');
  container.replaceChildren();
  results.forEach(item => {
    const article = document.createElement('article');
    article.className = 'result-card paper';
    article.innerHTML = `<div class="result-body"><p class="eyebrow">${item.category} · ${item.location}</p><h2>${item.title}</h2><p>${item.description}</p><button class="button ${isRecipe ? 'red' : 'olive'}" data-detail="${item.id}">${isRecipe ? 'Apri la ricetta' : 'Scopri il borgo'} <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span></button></div>`;
    container.append(article);
  });
  $('#empty-results').hidden = results.length > 0;
}
function route() {
  const requested = location.hash.slice(1) || 'home';
  state.page = Object.hasOwn(headings, requested) ? requested : 'home';
  state.filter = 'Tutti';
  state.search = '';
  const [kicker, title, subtitle] = headings[state.page];
  $('#header-kicker').textContent = kicker;
  $('#header-kicker').hidden = !kicker;
  $('#header-title').textContent = title;
  $('#header-subtitle').textContent = subtitle;
  $('#header-subtitle').hidden = !subtitle;
  document.title = `Nonna Rosetta · ${state.page === 'home' ? 'La Tuscia, da assaporare' : state.page === 'ricette' ? 'Ricette della Tuscia' : 'Borghi della Tuscia'}`;
  const home = state.page === 'home';
  $('#calendar').hidden = !home;
  $('#home-discovery').hidden = !home;
  $('#directory').hidden = home;
  $('#content-layout').classList.toggle('browse-layout', !home);
  document.querySelectorAll('[data-page]').forEach(link => {
    if (link.dataset.page === state.page) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  if (!home) {
    const label = state.page === 'ricette' ? 'Cerca un piatto o un ingrediente della Tuscia' : 'Cerca un borgo della Tuscia';
    $('#search-input').placeholder = label;
    $('#search-input').setAttribute('aria-label', label);
    $('#search-input').value = '';
    const categories = state.page === 'ricette' ? ['Tutti', 'Primi', 'Secondi', 'Dolci'] : ['Tutti', 'Storia e cultura', 'Natura', 'Panorami'];
    $('#filters').innerHTML = categories.map(category => `<button data-filter="${category}" aria-pressed="${category === 'Tutti'}">${category}</button>`).join('');
    renderDirectory();
  }
  requestAnimationFrame(syncSidebarHeight);
}
function syncSidebarHeight() {
  const sidebar = $('.sidebar');
  if (matchMedia('(max-width: 1000px)').matches) {
    sidebar.style.height = '';
    return;
  }
  const guideBottom = $('.guide-panel').getBoundingClientRect().bottom;
  const sidebarTop = sidebar.getBoundingClientRect().top;
  sidebar.style.height = `${Math.max(0, Math.round(guideBottom - sidebarTop))}px`;
}
function openDialog(html) {
  $('#dialog-content').innerHTML = html;
  $('#dialog-content h2').id = 'dialog-title';
  $('#detail-dialog').setAttribute('aria-labelledby', 'dialog-title');
  $('#detail-dialog').showModal();
}
function openDetail(id) {
  const recipe = recipes.find(item => item.id === id);
  if (recipe) {
    openDialog(`<p class="eyebrow">Dal ricettario di Rosetta · ${recipe.location}</p><h2>${recipe.title}</h2><p>${recipe.description}</p><p class="modal-note">Ricetta dimostrativa per 4 persone · da rifinire con i contenuti editoriali.</p><h3>Metti sul tavolo</h3><ul>${recipe.ingredients.map(text => `<li>${text}</li>`).join('')}</ul><h3>Prepariamola insieme</h3><ol>${recipe.steps.map(text => `<li>${text}</li>`).join('')}</ol><button class="button" data-dialog-chat="Parliamo della ricetta: ${recipe.title}">Chiedi a Rosetta <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span></button>`);
  } else {
    const village = villages.find(item => item.id === id);
    if (!village) return;
    openDialog(`<p class="eyebrow">A spasso nella Tuscia · ${village.category}</p><h2>${village.title}</h2><p>${village.story}</p><h3>Da assaporare con calma</h3><ul>${village.ideas.map(text => `<li>${text}</li>`).join('')}</ul><p class="modal-note">Scheda dimostrativa. Percorsi, orari e informazioni di visita saranno aggiunti nella versione completa.</p><button class="button olive" data-dialog-chat="Raccontami il borgo di ${village.title}">Parlane con Rosetta <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span></button>`);
  }
}
const info = {
  profilo: ['Il tuo angolo di casa', 'Qui troverai le tue ricette preferite e i borghi da visitare. Il profilo personale sarà disponibile nella versione completa.'],
  impostazioni: ['Come piace a te', 'La pagina si adatta già al tuo schermo e rispetta la preferenza del dispositivo per le animazioni ridotte. Le impostazioni personali arriveranno nella versione completa.'],
  assistenza: ['Una mano, quando serve', 'Usa la barra sopra Rosetta per passare dall’avatar alla chat. Puoi esplorare Ricette e Borghi dal menu, oppure chiedere il significato del detto. I messaggi di questa anteprima ricevono risposte dimostrative e restano solo nella pagina aperta.'],
  accesso: ['Sei già di casa', 'Per esplorare questa anteprima non serve un account. Accesso e registrazione saranno collegati quando sarà pronto il servizio.'],
  lingua: ['A little taste of what’s coming', 'This first preview is available in Italian. The English version will be added when the final content is ready.'],
  voce: ['La voce di Rosetta arriverà presto', 'In questa anteprima puoi già scrivermi. La conversazione vocale e l’avatar animato saranno collegati nella prossima fase. Il microfono non viene attivato.']
};
document.addEventListener('click', event => {
  const infoButton = event.target.closest('[data-info]');
  if (infoButton) { const [title, text] = info[infoButton.dataset.info]; openDialog(`<p class="eyebrow">Nonna Rosetta · Anteprima</p><h2>${title}</h2><p>${text}</p>`); }
  const prompt = event.target.closest('[data-prompt]');
  if (prompt) sendMessage(prompt.dataset.prompt);
  const filter = event.target.closest('[data-filter]');
  if (filter) { state.filter = filter.dataset.filter; document.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button === filter))); renderDirectory(); }
  const detail = event.target.closest('[data-detail]');
  if (detail) openDetail(detail.dataset.detail);
  const chat = event.target.closest('[data-dialog-chat]');
  if (chat) { $('#detail-dialog').close(); sendMessage(chat.dataset.dialogChat); $('.guide-panel').scrollIntoView({ block: 'start', behavior: 'smooth' }); $('#chat-input').focus({ preventScroll: true }); }
});
$('#mode-switch').addEventListener('click', () => setMode(state.mode === 'avatar' ? 'chat' : 'avatar'));
$('#voice-button').addEventListener('click', () => { const [title, text] = info.voce; openDialog(`<p class="eyebrow">Parliamo insieme</p><h2>${title}</h2><p>${text}</p><button class="button" data-dialog-chat="Ciao Rosetta!">Intanto, scrivimi <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span></button>`); });
$('#brand-toggle').addEventListener('click', () => {
  const active = $('#brand-toggle').classList.toggle('is-flipped');
  $('#brand-toggle').setAttribute('aria-pressed', String(active));
  $('#brand-toggle').setAttribute('aria-label', active ? 'Mostra il logo Nonna Rosetta' : 'Mostra il ritratto di Nonna Rosetta');
});
$('#chat-form').addEventListener('submit', event => { event.preventDefault(); sendMessage($('#chat-input').value); $('#chat-input').value = ''; $('#chat-input').focus(); });
$('#explain-saying').addEventListener('click', () => { sendMessage('Spiegami il detto del giorno'); $('.guide-panel').scrollIntoView({ block: 'nearest', behavior: 'smooth' }); });
$('#search-input').addEventListener('input', event => { state.search = event.target.value.trim().toLocaleLowerCase('it'); renderDirectory(); });
$('#dialog-close').addEventListener('click', () => $('#detail-dialog').close());
$('#detail-dialog').addEventListener('click', event => { if (event.target === $('#detail-dialog')) { const rect = event.target.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) event.target.close(); } });
window.addEventListener('hashchange', () => { if (location.hash === '#main') return; route(); window.scrollTo({ top: 0, behavior: 'instant' }); });
window.addEventListener('resize', syncSidebarHeight);
new ResizeObserver(syncSidebarHeight).observe($('.guide-panel'));
new ResizeObserver(syncSidebarHeight).observe($('.page-header'));
document.querySelectorAll('.primary-nav a, .secondary-nav button, .login').forEach(control => {
  control.setAttribute('aria-label', control.lastElementChild.textContent.trim());
});
chooseFeaturedVillage();
updateDate();
setInterval(updateDate, 60_000);
route();
document.fonts.ready.then(syncSidebarHeight);
