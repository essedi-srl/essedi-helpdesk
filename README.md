# Essedi Helpdesk

Personalizzazioni Essedi per [Frappe Helpdesk](https://github.com/frappe/helpdesk), in un'app separata:
il codice di Helpdesk resta intatto e aggiornabile.

## Contenuto

- **Strato di stile comune** (`essedi_helpdesk/public/css/essedi.css`): colori del tema chiaro
  secondo la guida del marchio Essedi e la guida UI delle app interne (pulsante primario scuro,
  corallo per errori e azioni distruttive). Agisce sulle variabili CSS di frappe-ui; l'unica
  regola su un elemento specifico mostra intero il logo della barra laterale.
- **Inserimento del foglio di stile** (`essedi_helpdesk/style.py`): un hook `after_request` aggiunge
  il `<link>` alle pagine `/helpdesk`, che non offrono un punto di estensione per i CSS.
  Il link porta la versione dell'app (`?v=`), così i browser scaricano il foglio nuovo
  a ogni rilascio.

## Configurazione richiesta

- **Logo della barra laterale** (Impostazioni Helpdesk, campo `brand_logo`): carica l'icona
  quadrata del marchio, non il logo esteso. Helpdesk lo mostra in un riquadro di 32x32 px;
  un logo largo resterebbe illeggibile anche intero. Il logo esteso può restare nelle
  impostazioni del sito web (pagina di accesso).

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

Concordare con il responsabile IT giorno e orario prima di aggiornare l'installazione in uso.

## Licenza

AGPL-3.0, come Frappe Helpdesk.
