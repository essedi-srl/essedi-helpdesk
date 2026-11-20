/*
 * Testi italiani per le parti di Helpdesk scritte fisse in inglese.
 *
 * Molti testi dell'interfaccia di Helpdesk passano dal sistema di traduzione di Frappe
 * e si traducono da configurazione (record Translation). Alcuni invece sono scritti
 * direttamente nel codice dell'interfaccia e restano in inglese qualunque traduzione
 * si configuri. Questo script li sostituisce nella pagina, dopo che Helpdesk li ha
 * disegnati, senza modificare il codice di Helpdesk.
 *
 * Regole:
 *  - si traduce solo un testo che corrisponde ESATTAMENTE a una voce dell'elenco
 *    (o a uno dei modelli in fondo): un testo nuovo o cambiato da un aggiornamento di
 *    Helpdesk resta semplicemente in inglese, non si rompe niente;
 *  - non si tocca quello che scrive l'utente (editor, campi di testo, messaggi).
 */
(function () {
  "use strict";

  var lang = (document.documentElement.getAttribute("lang") || "it").toLowerCase();
  if (lang.indexOf("it") !== 0) return;

  var T = {
    // Struttura e comandi comuni
    "Collapse": "Riduci",
    "Expand": "Espandi",
    "Filter": "Filtro",
    "Refresh": "Aggiorna",
    "Search fields...": "Cerca campi...",
    "Notifications alt+T": "Notifiche alt+T",
    "No notifications to show": "Nessuna notifica da mostrare",
    "Main": "Menu principale",
    "More options": "Altre opzioni",
    "Minimize": "Riduci a icona",
    "Close": "Chiudi",
    "Close toast": "Chiudi",
    "Clear": "Svuota",
    "Accept": "Accetta",
    "Reject": "Rifiuta",
    "Show popup": "Mostra elenco",
    "Open linked record": "Apri il record collegato",
    "Select all": "Seleziona tutti",
    "Select an option": "Selezioni un'opzione",
    "Type something": "Scriva qui",
    "Yes": "Sì",
    "No": "No",
    "Cancel": "Annulla",
    "Update": "Aggiorna",
    "Apps": "App",
    "Italy": "Italia",

    // Elenco ticket: colonne, campi dei filtri, operatori
    "Name": "Nome",
    "Subject": "Oggetto",
    "Status": "Stato",
    "Priority": "Priorità",
    "First response": "Prima risposta",
    "First Response": "Prima risposta",
    "Resolution": "Risoluzione",
    "Assigned To": "Assegnato a",
    "Assigned to": "Assegnato a",
    "Assigned on": "Assegnato il",
    "Customer": "Cliente",
    "Type": "Categoria",
    "Contact": "Contatto",
    "Rating": "Valutazione",
    "Created": "Creato",
    "Created By": "Creato da",
    "Created On": "Creato il",
    "Last Updated By": "Ultimo aggiornamento di",
    "Last Updated On": "Ultimo aggiornamento il",
    "Tags": "Tag",
    "Email Account": "Account email",
    "Resolution By": "Scadenza risoluzione",
    "Response By": "Scadenza prima risposta",
    "Resolution Failed By": "Ritardo sulla risoluzione",
    "First Response Failed By": "Ritardo sulla prima risposta",
    "Feedback (Extra)": "Feedback (note)",
    "Feedback (Option)": "Feedback (scelta)",
    "Average Response Time": "Tempo medio di risposta",
    "Raised By (Email)": "Aperto da (email)",
    "Status Category": "Categoria di stato",
    "Ticket Type": "Categoria",
    "User Resolution Time": "Tempo di risoluzione per l'utente",
    "Key": "Chiave",
    "First Responded On": "Prima risposta il",
    "Ticket Merged": "Ticket unito",
    "Via Customer Portal": "Dal portale clienti",
    "Ticket raised outside working hours": "Aperto fuori orario",
    "Merged With": "Unito al ticket",
    "SLA Status": "Stato SLA",
    "Ticket Split From": "Separato dal ticket",
    "Opening Date": "Data di apertura",
    "Description": "Descrizione",
    "First Response Time": "Tempo di prima risposta",
    "Resolution Date": "Data di risoluzione",
    "Resolution Time": "Tempo di risoluzione",
    "Summary": "Riepilogo",
    "Last Agent Response": "Ultima risposta del tecnico",
    "Last Customer Response": "Ultima risposta del cliente",
    "Resolution Details": "Dettagli della risoluzione",
    "Template": "Modulo",
    "On Hold Since": "In attesa dal",
    "Total Hold Time": "Tempo totale in attesa",
    "Equals": "Uguale a",
    "Not Equals": "Diverso da",
    "Like": "Contiene",
    "Not Like": "Non contiene",
    "In": "Tra i valori",
    "Not In": "Non tra i valori",
    "Between": "Compreso tra",
    "Timespan": "Periodo",
    "Set": "Compilato",
    "Not Set": "Non compilato",
    "Yesterday": "Ieri",
    "Today": "Oggi",
    "Tomorrow": "Domani",
    "Last 7 Days": "Ultimi 7 giorni",
    "Last 14 Days": "Ultimi 14 giorni",
    "Last 30 Days": "Ultimi 30 giorni",
    "Last 90 Days": "Ultimi 90 giorni",
    "Last 6 Months": "Ultimi 6 mesi",
    "Last Week": "Settimana scorsa",
    "Last Month": "Mese scorso",
    "Last Quarter": "Trimestre scorso",
    "Last Year": "Anno scorso",
    "This Week": "Questa settimana",
    "This Month": "Questo mese",
    "This Quarter": "Questo trimestre",
    "This Year": "Quest'anno",
    "Next 7 Days": "Prossimi 7 giorni",
    "Next 14 Days": "Prossimi 14 giorni",
    "Next 30 Days": "Prossimi 30 giorni",
    "Next 6 Months": "Prossimi 6 mesi",
    "Next Week": "Settimana prossima",
    "Next Month": "Mese prossimo",
    "Next Quarter": "Trimestre prossimo",
    "Next Year": "Anno prossimo",
    "Reset Changes": "Annulla modifiche",
    "Label": "Etichetta",
    "Width": "Larghezza",

    // Priorità (valori standard)
    "Low": "Bassa",
    "Medium": "Media",
    "High": "Alta",
    "Urgent": "Urgente",

    // Ticket: pannello attività, risposta, commenti
    "Activity": "Attività",
    "Emails": "Email",
    "Comments": "Commenti",
    "Analytics": "Analisi",
    "Reply": "Rispondi",
    "Comment": "Commenta",
    "Send": "Invia",
    "Send (Ctrl + ⏎)": "Invia (Ctrl + ⏎)",
    "Send (⌘ + ⏎)": "Invia (⌘ + ⏎)",
    "Comment (Ctrl + ⏎)": "Commenta (Ctrl + ⏎)",
    "Comment (⌘ + ⏎)": "Commenta (⌘ + ⏎)",
    "Discard": "Scarta",
    "Discard?": "Scartare?",
    "Email content": "Contenuto dell'email",
    ": Automatic Assignment": ": assegnazione automatica",
    "Ancora nessun Activity": "Ancora nessuna attività",
    "Ancora nessun Emails": "Ancora nessuna email",
    "Ancora nessun Comments": "Ancora nessun commento",
    "Ticket details": "Dettagli del ticket",
    "Ticket ID": "N. ticket",
    "Expected First Response": "Prima risposta prevista",
    "Expected Resolution": "Risoluzione prevista",
    "Fulfilled": "Rispettato",
    "On Hold": "In attesa",

    // Editor di testo
    "Heading": "Titolo",
    "Heading 1": "Titolo 1",
    "Heading 2": "Titolo 2",
    "Heading 3": "Titolo 3",
    "Heading 4": "Titolo 4",
    "Paragraph": "Paragrafo",
    "Bold": "Grassetto",
    "Italic": "Corsivo",
    "Strike": "Barrato",
    "Font Color": "Colore del testo",
    "Highlight": "Evidenzia",
    "Align Left": "Allinea a sinistra",
    "Align Center": "Centra",
    "Align Right": "Allinea a destra",
    "Bullet List": "Elenco puntato",
    "Ordered List": "Elenco numerato",
    "Blockquote": "Citazione",
    "Code": "Codice",
    "Code block": "Blocco di codice",
    "Image / Gallery": "Immagine o galleria",
    "Table": "Tabella",
    "Horizontal Rule": "Linea orizzontale",
    "Clear formatting": "Rimuovi formattazione",
    "Insert column left": "Inserisci colonna a sinistra",
    "Insert column right": "Inserisci colonna a destra",
    "Delete column": "Elimina colonna",
    "Insert row above": "Inserisci riga sopra",
    "Insert row below": "Inserisci riga sotto",
    "Delete row": "Elimina riga",
    "Toggle header row": "Riga di intestazione",
    "Merge or split cells": "Unisci o dividi celle",
    "Cell color": "Colore della cella",
    "Delete table": "Elimina tabella",

    // Base di conoscenza
    "Knowledge Base": "Base di conoscenza",
    "Ask a question...": "Faccia una domanda...",
    "Help center": "Guida di Helpdesk",
    "All articles": "Tutti gli articoli",
    "Search articles...": "Cerca articoli...",
    "Open docs": "Apri la documentazione",
    "Title": "Titolo",
    "Author": "Autore",
    "Last Modified": "Ultima modifica",
    "General": "Generale",
    "Draft": "Bozza",
    "published by": "pubblicato da",

    // Clienti e contatti
    "Customer Type": "Tipo di cliente",
    "Email ID": "Email",
    "Mobile No": "Cellulare",
    "Mobile": "Cellulare",
    "Company": "Azienda",

    // Dashboard
    "% SLA Fulfilled": "% SLA rispettati",
    "SLA Fulfilled": "SLA rispettati",
    "No data": "Nessun dato",
    "Avg. Feedback Rating": "Valutazione media",
    "Ticket Trend": "Andamento dei ticket",
    "Date": "Data",
    "Open": "Aperti",
    "Closed": "Chiusi",
    "Feedback Trend": "Andamento delle valutazioni",
    "No feedback data": "Nessuna valutazione",
    "Feedback insights will appear once responses are collected.":
      "I dati compariranno quando arriveranno le prime valutazioni.",
    "Tickets by Team": "Ticket per team",
    "Percentage of total tickets by team": "Percentuale dei ticket per team",
    "Tickets by Type": "Ticket per categoria",
    "Percentage of total tickets by type": "Percentuale dei ticket per categoria",
    "Tickets by Priority": "Ticket per priorità",
    "Percentage of total tickets by priority": "Percentuale dei ticket per priorità",
    "Tickets by Channel": "Ticket per canale",
    "Percentage of total tickets by channel": "Percentuale dei ticket per canale",
    "Count": "Numero",
    "Top Tags": "Tag più usati",
    "Most used tags in this period": "Tag più usati nel periodo",
    "First Ticket": "Primo ticket",
    "Tag Trend": "Andamento dei tag",
    "Daily volume of the top 5 tags": "Volume giornaliero dei 5 tag più usati"
  };

  var MESI = { Jan: "gen", Feb: "feb", Mar: "mar", Apr: "apr", May: "mag", Jun: "giu",
    Jul: "lug", Aug: "ago", Sep: "set", Oct: "ott", Nov: "nov", Dec: "dic" };
  var UNITA = { second: ["secondo", "secondi"], minute: ["minuto", "minuti"], hour: ["ora", "ore"],
    day: ["giorno", "giorni"], month: ["mese", "mesi"], year: ["anno", "anni"] };
  var UNO = { "a few seconds": "pochi secondi", "a minute": "un minuto", "an hour": "un'ora",
    "a day": "un giorno", "a month": "un mese", "a year": "un anno" };

  function unita(n, u) {
    var k = u.replace(/s$/, "");
    return UNITA[k] ? n + " " + UNITA[k][n === "1" ? 0 : 1] : n + " " + u;
  }
  function durata(s) {
    // "2d 4h" -> "2g 4h"
    return s.replace(/(\d+)d\b/g, "$1g");
  }

  // Modelli per i testi composti (tempi, scadenze, conteggi). Si applicano al testo intero.
  var MODELLI = [
    [/^(a few seconds|a minute|an hour|a day|a month|a year) ago$/, function (m, a) { return UNO[a] + " fa"; }],
    [/^(\d+) (seconds?|minutes?|hours?|days?|months?|years?) ago$/, function (m, n, u) { return unita(n, u) + " fa"; }],
    [/^in (a few seconds|a minute|an hour|a day|a month|a year)$/, function (m, a) { return "tra " + UNO[a]; }],
    [/^in (\d+) (seconds?|minutes?|hours?|days?|months?|years?)$/, function (m, n, u) { return "tra " + unita(n, u); }],
    [/^(.*\S) in (a few seconds|a minute|an hour|a day|a month|a year)$/, function (m, p, a) { return p + " tra " + UNO[a]; }],
    [/^(\d+) days? (\d+)h$/, function (m, d, h) { return d + (d === "1" ? " giorno " : " giorni ") + h + "h"; }],
    [/^Due in (.+)$/, function (m, d) { return "Scade tra " + durata(d); }],
    [/^Overdue by (.+)$/, function (m, d) { return "In ritardo di " + durata(d); }],
    [/^Failed by (.+)$/, function (m, d) { return "Non rispettato di " + durata(d); }],
    [/^Fulfilled in (.+)$/, function (m, d) { return "Rispettato in " + durata(d); }],
    [/^(\d+) rows? selected$/, function (m, n) { return n === "1" ? "1 selezionato" : n + " selezionati"; }],
    [/^(\d+) Articles?$/, function (m, n) { return n === "1" ? "1 articolo" : n + " articoli"; }],
    [/^(\d+) of (\d+)$/, function (m, a, b) { return a + " di " + b; }],
    [/^Set (.+)\.\.\.$/, function (m, f) { return "Imposta " + (T[f] || f) + "..."; }],
    [/^(.+) is required$/, function (m, f) { return "Campo obbligatorio: " + (T[f] || f); }],
    [/^Hide (.+)$/, function (m, f) { return T[f] ? "Nascondi " + T[f] : null; }],
    [/^Average tickets per day is around (.+)$/, function (m, n) { return "In media circa " + n + " ticket al giorno"; }],
    // Date brevi: "Nov 20, 9:28 am" -> "20 nov, 9:28" (anche dentro un testo, es. "scade Nov 23, 9:28 am")
    [/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{1,2}), (\d{1,2}):(\d{2}) ?([AaPp][Mm])\b/g,
      function (m, mese, g, h, min, ap) {
        var ore = parseInt(h, 10) % 12 + (/p/i.test(ap) ? 12 : 0);
        return g + " " + MESI[mese] + ", " + ore + ":" + min;
      }]
  ];

  function traduci(testo) {
    if (Object.prototype.hasOwnProperty.call(T, testo)) return T[testo];
    for (var i = 0; i < MODELLI.length; i++) {
      var re = MODELLI[i][0];
      re.lastIndex = 0;
      if (re.test(testo)) {
        re.lastIndex = 0;
        var fuori = testo.replace(re, MODELLI[i][1]);
        if (fuori && fuori !== testo && fuori.indexOf("null") === -1) return fuori;
      }
    }
    // Etichette composte, es. "Ticket Trend, Average tickets per day is around 0"
    if (testo.indexOf(", ") > 0 && testo.length < 160) {
      var parti = testo.split(", "), cambiato = false;
      for (var j = 0; j < parti.length; j++) {
        var t = Object.prototype.hasOwnProperty.call(T, parti[j]) ? T[parti[j]] : null;
        if (!t) {
          for (var k = 0; k < MODELLI.length - 1 && !t; k++) {
            if (MODELLI[k][0].test(parti[j])) t = parti[j].replace(MODELLI[k][0], MODELLI[k][1]);
          }
        }
        if (t && t.indexOf("null") === -1) { parti[j] = t; cambiato = true; }
      }
      if (cambiato) return parti.join(", ");
    }
    return null;
  }

  // Zone con testo scritto dagli utenti: non si toccano
  var ESCLUSI = "[contenteditable], .ProseMirror, textarea, input, pre, code, iframe";

  function escluso(el) {
    return !el || (el.closest && el.closest(ESCLUSI));
  }

  function nodoTesto(n) {
    var el = n.parentElement;
    if (escluso(el) || el.tagName === "SCRIPT" || el.tagName === "STYLE") return;
    var v = n.nodeValue, t = v.trim();
    if (!t || t.length > 200 || !/[A-Za-z]/.test(t)) return;
    var it = traduci(t);
    if (it !== null && it !== t) n.nodeValue = v.replace(t, it);
  }

  var ATTRIBUTI = ["placeholder", "title", "aria-label"];

  function attributi(el) {
    for (var i = 0; i < ATTRIBUTI.length; i++) {
      var a = ATTRIBUTI[i], v = el.getAttribute(a);
      if (!v) continue;
      // nei campi di testo si traduce solo il suggerimento, mai il contenuto
      if (el.closest && el.closest("[contenteditable], .ProseMirror") && a !== "aria-label") continue;
      var it = traduci(v.trim());
      if (it !== null && it !== v) el.setAttribute(a, it);
    }
  }

  function percorri(radice) {
    if (radice.nodeType === 3) { nodoTesto(radice); return; }
    if (radice.nodeType !== 1) return;
    attributi(radice);
    var w = document.createTreeWalker(radice, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    var n;
    while ((n = w.nextNode())) {
      if (n.nodeType === 3) nodoTesto(n); else attributi(n);
    }
  }

  function titolo() {
    var t = document.title, it = t && traduci(t);
    if (it && it !== t) document.title = it;
  }

  var coda = [], programmato = false;
  function elabora() {
    programmato = false;
    var lavoro = coda; coda = [];
    for (var i = 0; i < lavoro.length; i++) {
      try { percorri(lavoro[i]); } catch (e) { /* mai bloccare la pagina */ }
    }
    titolo();
  }
  function accoda(n) {
    coda.push(n);
    if (!programmato) { programmato = true; requestAnimationFrame(elabora); }
  }

  function avvia() {
    accoda(document.body);
    new MutationObserver(function (mutazioni) {
      for (var i = 0; i < mutazioni.length; i++) {
        var m = mutazioni[i];
        if (m.type === "childList") {
          for (var j = 0; j < m.addedNodes.length; j++) accoda(m.addedNodes[j]);
        } else if (m.type === "characterData") {
          accoda(m.target);
        } else if (m.type === "attributes") {
          accoda(m.target);
        }
      }
    }).observe(document.body, {
      childList: true, subtree: true, characterData: true,
      attributes: true, attributeFilter: ATTRIBUTI
    });
    var t = document.querySelector("title");
    if (t) new MutationObserver(titolo).observe(t, { childList: true, characterData: true, subtree: true });
  }

  if (document.body) avvia();
  else document.addEventListener("DOMContentLoaded", avvia);
})();
