"""Aggiunge il foglio di stile Essedi alle pagine dell'Helpdesk e alla pagina di accesso.

La pagina /helpdesk di Helpdesk e' un file HTML generato in fase di build e non offre
punti in cui aggiungere fogli di stile. Invece di modificarla, inseriamo un <link> nella
risposta HTML, subito prima di </head>, cosi' il codice di Helpdesk resta intatto.
Lo stesso vale per le pagine di accesso di Frappe, da cui passano tecnici e clienti.
"""

import frappe

from essedi_helpdesk import __version__

CSS_HREF = "/assets/essedi_helpdesk/css/essedi.css"

# Pagine di Frappe da cui si entra nell'Helpdesk: accesso e scelta della nuova password
PAGINE_DI_ACCESSO = ("/login", "/update-password")


def _is_styled_page(path: str) -> bool:
	return path == "/helpdesk" or path.startswith("/helpdesk/") or path in PAGINE_DI_ACCESSO


def inject_style(response=None, request=None):
	"""Hook after_request: non deve mai rompere la risposta."""
	try:
		if response is None or request is None:
			return
		if not _is_styled_page(request.path or ""):
			return
		if response.mimetype != "text/html" or response.direct_passthrough:
			return
		body = response.get_data(as_text=True)
		if CSS_HREF in body or "</head>" not in body:
			return
		tag = f'<link rel="stylesheet" href="{CSS_HREF}?v={__version__}">'
		response.set_data(body.replace("</head>", tag + "</head>", 1))
	except Exception:
		frappe.log_error(title="essedi_helpdesk: stile non applicato")
