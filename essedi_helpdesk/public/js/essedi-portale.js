/*
 * Aiuti per i clienti nelle pagine dei ticket, senza modificare il codice di Helpdesk.
 *
 *  - Modulo di apertura: mentre il cliente scrive l'oggetto, Helpdesk cerca articoli della
 *    base di conoscenza e, se non ne trova, mostra un grande riquadro "nessun articolo
 *    trovato" che sembra un errore. Qui il riquadro vuoto (e quello "ricerca in corso") si
 *    nasconde; quando ci sono articoli pertinenti resta visibile.
 *  - Dopo l'invio: in cima al ticket appena creato compare "Richiesta 0010 ricevuta".
 *  - Pagina del ticket del cliente: in cima compare la copertura del ticket (campo
 *    personalizzato "copertura", scritto dal server) con una frase su cosa succede dopo.
 *
 * Il riquadro si costruisce con elementi e testo semplice, mai con HTML preso dal server.
 */
(function () {
  "use strict";

  var lang = (document.documentElement.getAttribute("lang") || "it").toLowerCase();
  if (lang.indexOf("it") !== 0) return;

  var MODULO_NUOVO = /\/helpdesk\/(my-tickets|tickets)\/new\/?$/;
  var TICKET_CLIENTE = /\/helpdesk\/my-tickets\/(\d+)\/?$/;
  // Testi dei riquadri vuoti degli articoli suggeriti, in inglese e già tradotti
  var RIQUADRI_VUOTI = ["No answers found", "Nessun articolo trovato",
    "Searching...", "Ricerca in corso..."];
  var ID_RIQUADRO = "essedi-riquadro-ticket";

  var percorsoPrecedente = location.pathname;
  var appenaCreato = null; // numero del ticket inviato da questa pagina
  var coperture = {};      // numero del ticket -> testo della copertura ("" se assente)

  // Frase su cosa succede dopo, in base al testo della copertura scritto dal server
  function cosaSuccede(copertura) {
    if (/preventivo/i.test(copertura)) {
      return "Prima di intervenire vi invieremo un preventivo da approvare. La richiesta è " +
        "gestita negli orari di assistenza, senza tempi di risposta garantiti.";
    }
    if (/^contratto/i.test(copertura)) {
      return "La richiesta è gestita secondo il vostro contratto di assistenza.";
    }
    return "";
  }

  function nascondiRiquadriVuoti() {
    var testi = document.querySelectorAll("p");
    for (var i = 0; i < testi.length; i++) {
      var riquadro = testi[i].closest(".border");
      if (!riquadro) continue;
      var vuoto = RIQUADRI_VUOTI.indexOf(testi[i].textContent.trim()) !== -1;
      if (vuoto && riquadro.style.display !== "none") {
        riquadro.style.display = "none";
        riquadro.setAttribute("data-essedi-nascosto", "1");
      }
    }
    // Se Helpdesk riusa un riquadro nascosto per mostrare degli articoli, torna visibile
    var nascosti = document.querySelectorAll("[data-essedi-nascosto]");
    for (var j = 0; j < nascosti.length; j++) {
      var p = nascosti[j].querySelector("p");
      if (!p || RIQUADRI_VUOTI.indexOf(p.textContent.trim()) === -1) {
        nascosti[j].style.display = "";
        nascosti[j].removeAttribute("data-essedi-nascosto");
      }
    }
  }

  function leggiCopertura(numero) {
    if (Object.prototype.hasOwnProperty.call(coperture, numero)) return;
    coperture[numero] = undefined; // richiesta in corso
    var url = "/api/method/frappe.client.get_value?doctype=HD%20Ticket&fieldname=copertura" +
      "&filters=" + encodeURIComponent(numero);
    fetch(url, { credentials: "same-origin", headers: { Accept: "application/json" } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        coperture[numero] = (d && d.message && d.message.copertura) || "";
        programma();
      })
      .catch(function () { coperture[numero] = ""; });
  }

  function riga(testo, grassetto) {
    var el = document.createElement("div");
    if (grassetto) {
      var b = document.createElement("strong");
      b.textContent = grassetto;
      el.appendChild(b);
      el.appendChild(document.createTextNode(" "));
    }
    el.appendChild(document.createTextNode(testo));
    return el;
  }

  function togliRiquadro() {
    var vecchio = document.getElementById(ID_RIQUADRO);
    if (vecchio) vecchio.remove();
  }

  function mostraRiquadro(numero) {
    // Colonna principale della pagina del ticket (conversazione)
    var colonna = document.querySelector("section.flex-1");
    if (!colonna) return;
    leggiCopertura(numero);
    var copertura = coperture[numero];
    var creato = appenaCreato === numero;
    if (copertura === undefined && !creato) return; // aspetta la risposta del server

    var chiave = numero + "|" + creato + "|" + (copertura || "");
    var esistente = document.getElementById(ID_RIQUADRO);
    if (esistente && esistente.getAttribute("data-chiave") === chiave &&
        esistente.parentNode === colonna) return;
    togliRiquadro();
    if (!creato && !copertura) return;

    var box = document.createElement("div");
    box.id = ID_RIQUADRO;
    box.setAttribute("role", "status");
    box.setAttribute("data-chiave", chiave);
    box.style.cssText = "margin:24px 24px 0;padding:12px 16px;border-radius:8px;" +
      "border:1px solid var(--outline-gray-2,#e2e2e2);background:var(--surface-gray-1,#f8f8f8);" +
      "color:var(--ink-gray-8,#383838);font-size:14px;line-height:1.5;display:flex;" +
      "flex-direction:column;gap:4px;";
    if (creato) {
      box.style.borderLeft = "3px solid #22c55e";
      box.appendChild(riga("Richiesta " + numero + " ricevuta.", null));
      box.firstChild.style.fontWeight = "600";
      box.appendChild(riga("La trova sempre nell'elenco Ticket: le risponderemo in questa pagina.", null));
    }
    if (copertura) {
      box.appendChild(riga(copertura, "Copertura:"));
      var dopo = cosaSuccede(copertura);
      if (dopo) box.appendChild(riga(dopo, null));
    }
    colonna.insertBefore(box, colonna.firstChild);
  }

  function controlla() {
    var percorso = location.pathname;
    if (percorso !== percorsoPrecedente) {
      var m = percorso.match(TICKET_CLIENTE);
      if (m && MODULO_NUOVO.test(percorsoPrecedente)) appenaCreato = m[1];
      else if (!m || m[1] !== appenaCreato) appenaCreato = null;
      percorsoPrecedente = percorso;
    }
    if (MODULO_NUOVO.test(percorso)) nascondiRiquadriVuoti();
    var ticket = percorso.match(TICKET_CLIENTE);
    if (ticket) mostraRiquadro(ticket[1]);
    else togliRiquadro();
  }

  var programmato = false;
  function programma() {
    if (programmato) return;
    programmato = true;
    requestAnimationFrame(function () {
      programmato = false;
      try { controlla(); } catch (e) { /* mai bloccare la pagina */ }
    });
  }

  function avvia() {
    programma();
    new MutationObserver(programma).observe(document.body, { childList: true, subtree: true });
    window.addEventListener("popstate", programma);
  }

  if (document.body) avvia();
  else document.addEventListener("DOMContentLoaded", avvia);
})();
