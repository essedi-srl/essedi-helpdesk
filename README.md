# Essedi Helpdesk

Personalizzazioni Essedi per [Frappe Helpdesk](https://github.com/frappe/helpdesk), in un'app separata:
il codice di Helpdesk resta intatto e aggiornabile.

## Contenuto

- **Strato di stile comune** (`essedi_helpdesk/public/css/essedi.css`): colori del tema chiaro
  secondo la guida del marchio Essedi e la guida UI delle app interne (pulsante primario scuro,
  corallo per errori e azioni distruttive). Agisce solo sulle variabili CSS di frappe-ui.
- **Inserimento del foglio di stile** (`essedi_helpdesk/style.py`): un hook `after_request` aggiunge
  il `<link>` alle pagine `/helpdesk`, che non offrono un punto di estensione per i CSS.

## Regole del repository

Il portale e' aperto ai clienti, quindi il codice va considerato pubblicabile (AGPL-3.0):
niente credenziali, indirizzi interni o dati dei clienti. Tutto questo resta nella
configurazione del server.

## Installazione

```bash
bench get-app <url-del-repository>
bench --site <sito> install-app essedi_helpdesk
bench build --app essedi_helpdesk
```

## Licenza

AGPL-3.0, come Frappe Helpdesk.
