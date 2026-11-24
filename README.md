# Essedi Helpdesk

Personalizzazioni Essedi per [Frappe Helpdesk](https://github.com/frappe/helpdesk), in un'app separata:
il codice di Helpdesk resta intatto e aggiornabile.

## Contenuto

- **Strato di stile comune** (`essedi_helpdesk/public/css/essedi.css`): colori del tema chiaro
  secondo la guida del marchio Essedi e la guida UI delle app interne (pulsante primario scuro,
  corallo per errori e azioni distruttive). Agisce soprattutto sulle variabili CSS di
  frappe-ui. Le regole su elementi specifici, descritte nel file, sono poche: logo intero
  nella barra laterale, colori dei pallini degli stati, elenco ticket del cliente leggibile
  su schermi stretti (l'oggetto si restringe, sul telefono la colonna Creato si nasconde),
  nome del contatto che va a capo nei dettagli del ticket e bordo dei campi obbligatori
  mancanti. Ognuna smette semplicemente di agire se Helpdesk cambia quell'elemento.
- **Inserimento del foglio di stile** (`essedi_helpdesk/style.py`): un hook `after_request` aggiunge
  il `<link>` alle pagine `/helpdesk` e alle pagine di accesso di Frappe (`/login`,
  `/update-password`), che non offrono un punto di estensione per i CSS.
  Il link porta la versione dell'app (`?v=`), così i browser scaricano il foglio nuovo
  a ogni rilascio. Nelle pagine `/helpdesk` lo stesso hook aggiunge anche gli script dei
  testi italiani e degli aiuti del portale (sotto).
- **Testi italiani** (`essedi_helpdesk/public/js/essedi-it.js`): una parte dell'interfaccia
  di Helpdesk ha i testi scritti fissi in inglese nel codice (intestazioni dell'elenco,
  campi e operatori dei filtri, schede del ticket, scadenze SLA, tempi relativi come
  "2 hours ago", editor, base di conoscenza, dashboard) e i record Translation non li
  cambiano. Lo script li sostituisce nella pagina dopo che Helpdesk li ha disegnati:
  - traduce solo i testi che corrispondono esattamente a una voce dell'elenco `T` o a
    uno dei modelli `MODELLI` (tempi, scadenze, date brevi, "Set ...");
  - non tocca editor, campi di testo e contenuto delle email;
  - si attiva solo se la pagina è in italiano (`<html lang="it">`).

  Prima di aggiungere una voce, controlla se il testo si traduce già con un record
  Translation: lo script serve solo per quelli che non passano dalla traduzione di Frappe.
  Dopo un aggiornamento di Helpdesk un testo nuovo o cambiato resta in inglese finché non
  lo si aggiunge all'elenco.
- **Aiuti del portale clienti** (`essedi_helpdesk/public/js/essedi-portale.js`), caricato
  dallo stesso hook nelle pagine `/helpdesk`:
  - nel modulo di apertura nasconde il riquadro degli articoli suggeriti quando non ne trova
    (o mentre li cerca): con una base di conoscenza ancora vuota sembrava un errore. Se ci
    sono articoli pertinenti il riquadro resta;
  - dopo l'invio mostra in cima al ticket «Richiesta 0010 ricevuta»;
  - nella pagina del ticket del cliente mostra in cima la copertura (campo personalizzato
    `copertura`, scritto dal server) con una frase su cosa succede dopo. La frase dipende
    dal testo della copertura: se contiene «preventivo» spiega il preventivo e l'assenza di
    tempi garantiti, se inizia con «Contratto» rimanda al contratto. Se cambi i testi scritti
    dal server, ricontrolla la funzione `cosaSuccede`;
  - nel modulo di apertura, al tentativo di invio, evidenzia insieme tutti i campi
    obbligatori vuoti (Helpdesk ne segnala uno alla volta in un avviso in basso) e porta in
    vista il primo; nel modulo cliente toglie la voce vuota iniziale dai menu a scelta;
  - nel modulo di apertura del cliente propone già compilati il referente («Nome Cognome,
    telefono» dal contatto collegato all'utente) e la sede (quella dell'ultimo ticket aperto
    dallo stesso utente), con una nota sotto il campo. Compila solo campi vuoti e il cliente
    può correggerli. I valori arrivano da `essedi_helpdesk.api.dati_richiedente`, che legge
    solo i dati dell'utente collegato; i nomi dei campi sono in cima a `api.py`, e lo script
    ritrova i campi dal testo di esempio (placeholder) del modello del ticket o dall'etichetta;
  - se in Impostazioni Helpdesk «Mostra la base di conoscenza ai clienti» è spento, nel
    portale clienti nasconde la voce di menu Base di conoscenza e gli articoli suggeriti, e
    le pagine pubbliche degli articoli (`/helpdesk/kb-public`) rimandano ai ticket. Per i
    tecnici non cambia nulla.

  Il riquadro si costruisce con testo semplice, senza HTML preso dal server.
- **Interruttore della base di conoscenza** (`essedi_helpdesk/setup.py`): all'installazione e
  a ogni `migrate` l'app crea in Impostazioni Helpdesk (DocType HD Settings) il campo
  `essedi_kb_clienti`, spento all'inizio. Si cambia dalla pagina delle impostazioni di Frappe
  (`/app/hd-settings`, ruoli Agent Manager o System Manager): il pannello impostazioni
  dentro l'Helpdesk non mostra i campi aggiunti. `style.py` lo passa agli script della
  pagina come `window.essediHelpdesk`.
- **Elenco ticket del portale clienti** (`essedi_helpdesk/overrides.py`): toglie dalle colonne
  predefinite del cliente Priorità, Team e le scadenze SLA (prima risposta e risoluzione),
  che sono riservati ai tecnici (vedi sotto) e resterebbero vuote. Helpdesk le definisce nel
  codice, quindi l'app estende il controller di HD Ticket (`override_doctype_class`).
- **Menu Filtro** (`essedi_helpdesk/overrides.py`, `override_whitelisted_methods`): toglie
  dai campi proposti quelli che l'utente non può leggere per livello di permesso. Helpdesk
  propone ai clienti un elenco fisso con Priorità e scadenze SLA: il server blocca già il
  filtro su quei campi, ma il cliente vedrebbe la voce e poi un errore. Per i tecnici
  l'elenco non cambia.

## Configurazione richiesta

- **Logo della barra laterale** (Impostazioni Helpdesk, campo `brand_logo`): carica l'icona
  quadrata del marchio, non il logo esteso. Helpdesk lo mostra in un riquadro di 32x32 px;
  un logo largo resterebbe illeggibile anche intero. Il logo esteso può restare nelle
  impostazioni del sito web (pagina di accesso).
- **Campi del ticket riservati ai tecnici**: vanno al livello di permesso 8, che i ruoli
  cliente non leggono:
  - Team (`agent_group`) e Priorità (`priority`);
  - tutti i campi dello SLA: `sla`, `response_by`, `resolution_by`, `first_responded_on`,
    `resolution_date`, `first_response_time`, `resolution_time`,
    `first_response_failed_by`, `resolution_failed_by` (`agreement_status` è già al
    livello 8). Senza il campo `sla` il portale non mostra nessuna scadenza;
  - i campi personalizzati interni (per Essedi: stato del contratto e commerciale del
    cliente).

  Per i campi standard si usa un Property Setter `permlevel`, per quelli personalizzati il
  campo `permlevel` del Custom Field. Nascondere un campo nel modello del ticket ("Visible
  to: Agents") non basta: lo toglie dalla pagina del portale ma il cliente può ancora
  leggerlo via API. I campi dello SLA continuano a essere calcolati e salvati anche quando
  il cliente apre un ticket o risponde.
- **Pagina di accesso**: è quella standard di Frappe (`/login`). I testi si cambiano con
  il DocType Translation (lingua `it`), senza toccare il codice:
  - `Welcome! Please sign in to continue.`: frase sotto "Accedi", per dire che è il
    portale assistenza;
  - `jane@example.com`: esempio nel campo email;
  - `Login with Email Link`: pulsante per entrare con un link via email.

  Il nome mostrato da Frappe è in Impostazioni di sistema (`app_name`), il logo in
  Impostazioni del sito web. La registrazione libera deve restare disattivata
  (`disable_signup` in Impostazioni del sito web): gli account dei clienti si creano
  dall'Helpdesk.
- **Stati dei ticket** (DocType HD Ticket Status):
  - colore (campo `color`) secondo la guida Narnia: blu = tocca a noi (Aperto),
    grigio = attesa del cliente o concluso (In attesa del cliente, Chiuso), viola = fermo
    per un motivo esterno (In attesa del produttore, In spedizione), verde = Risolto.
    Il rosso resta allo SLA non rispettato. Il foglio di stile porta verde e viola ai
    valori esatti di Narnia;
  - **l'etichetta per i tecnici (`label_agent`) deve restare uguale al nome dello stato**
    (`Open`, `Replied`, `Resolved`, `Closed` per quelli standard): il nome dello stato
    nasce da quel campo e l'interfaccia ritrova lo stato di un ticket confrontandoli. Con
    un'etichetta diversa elenco, portale e intestazione del ticket non mostrano più lo
    stato (pallino nero, "Stato —"), e salvando lo stato Frappe la riporta comunque al
    nome. Il testo italiano per i tecnici lo mette lo script dei testi italiani;
  - l'etichetta per i clienti (`label_customer`) si può scrivere liberamente in italiano.

## Regole del repository

Il portale e' aperto ai clienti, quindi il codice va considerato pubblicabile (AGPL-3.0):
niente credenziali, indirizzi interni o dati dei clienti. Tutto questo resta nella
configurazione del server.

## Installazione

### Con frappe_docker (installazione Essedi)

I container di frappe_docker non scaricano app all'avvio: l'app va inclusa nell'immagine.
Si costruisce un'immagine a strati sopra quella di Helpdesk già in uso, così le versioni
di Frappe e Helpdesk restano identiche. Nel Containerfile, come utente `frappe` e dentro
`/home/frappe/frappe-bench`:

1. clonare il repository in `apps/essedi_helpdesk` e fissare il commit da rilasciare;
2. installarlo con `env/bin/pip install -e apps/essedi_helpdesk`;
3. aggiungere `essedi_helpdesk` a `sites/apps.txt` (attenzione: il file dell'immagine può
   non finire con un a capo);
4. collegare `apps/essedi_helpdesk/essedi_helpdesk/public` in `assets/essedi_helpdesk`:
   l'app ha solo file statici, quindi non serve `bench build`.

Poi, sul server:

1. fare un backup del sito;
2. indicare la nuova immagine nel `docker-compose.yml` e ricreare i container
   (`docker compose up -d`);
3. aggiungere `essedi_helpdesk` anche al `sites/apps.txt` del volume dei siti, che non
   viene dall'immagine;
4. `bench --site <sito> install-app essedi_helpdesk` nel container backend, poi riavviarlo.

Per tornare indietro: `bench --site <sito> uninstall-app essedi_helpdesk`, togliere l'app da
`sites/apps.txt` del volume e rimettere l'immagine precedente nel `docker-compose.yml`.

### Con un bench classico

```bash
bench get-app <url-del-repository>
bench --site <sito> install-app essedi_helpdesk
bench build --app essedi_helpdesk
```

## Aggiornamento

1. Unire la modifica su `main` e aumentare `__version__` in `essedi_helpdesk/__init__.py`.
2. Ricostruire l'immagine con il nuovo commit e un nuovo tag.
3. Fare un backup, indicare il nuovo tag nel `docker-compose.yml` e lanciare
   `docker compose up -d`.
4. `bench --site <sito> migrate` nel container backend.
5. Se è cambiata anche la versione di Helpdesk, aprire elenco, ticket e portale clienti e
   controllare che non siano comparsi testi in inglese: vanno aggiunti a
   `essedi_helpdesk/public/js/essedi-it.js` (o a un record Translation, se il testo passa
   dalla traduzione di Frappe). Controllare anche, come cliente, il modulo di apertura e la
   pagina del ticket: gli aiuti del portale dipendono dalla struttura delle pagine di
   Helpdesk.

Concordare con il responsabile IT giorno e orario prima di aggiornare l'installazione in uso.

## Licenza

AGPL-3.0, come Frappe Helpdesk.
