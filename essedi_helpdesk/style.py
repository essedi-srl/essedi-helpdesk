"""Aggiunge foglio di stile e testi italiani Essedi alle pagine dell'Helpdesk.

La pagina /helpdesk di Helpdesk e' un file HTML generato in fase di build e non offre
punti in cui aggiungere fogli di stile o script. Invece di modificarla, inseriamo i tag
nella risposta HTML, subito prima di </head>, cosi' il codice di Helpdesk resta intatto.
- foglio di stile: pagine /helpdesk e pagine di accesso di Frappe (da cui passano
  tecnici e clienti);
- script dei testi italiani (public/js/essedi-it.js): solo pagine /helpdesk, perche'
  le pagine di accesso si traducono gia' da configurazione.
"""

import frappe

from essedi_helpdesk import __version__

CSS_HREF = "/assets/essedi_helpdesk/css/essedi.css"
JS_SRC = "/assets/essedi_helpdesk/js/essedi-it.js"

# Pagine di Frappe da cui si entra nell'Helpdesk: accesso e scelta della nuova password
PAGINE_DI_ACCESSO = ("/login", "/update-password")


def _is_helpdesk_page(path: str) -> bool:
	return path == "/helpdesk" or path.startswith("/helpdesk/")


def _is_styled_page(path: str) -> bool:
	return _is_helpdesk_page(path) or path in PAGINE_DI_ACCESSO


def inject_style(response=None, request=None):
	"""Hook after_request: non deve mai rompere la risposta."""
	try:
		if response is None or request is None:
			return
		path = request.path or ""
		if not _is_styled_page(path):
			return
		if response.mimetype != "text/html" or response.direct_passthrough:
			return
		body = response.get_data(as_text=True)
		if CSS_HREF in body or "</head>" not in body:
			return
		tags = f'<link rel="stylesheet" href="{CSS_HREF}?v={__version__}">'
		if _is_helpdesk_page(path):
			tags += f'<script src="{JS_SRC}?v={__version__}" defer></script>'
		response.set_data(body.replace("</head>", tags + "</head>", 1))
	except Exception:
		frappe.log_error(title="essedi_helpdesk: stile non applicato")
