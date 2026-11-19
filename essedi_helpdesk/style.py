"""Aggiunge il foglio di stile Essedi alle pagine dell'Helpdesk.

La pagina /helpdesk di Helpdesk e' un file HTML generato in fase di build e non offre
punti in cui aggiungere fogli di stile. Invece di modificarla, inseriamo un <link> nella
risposta HTML, subito prima di </head>, cosi' il codice di Helpdesk resta intatto.
"""

import frappe

from essedi_helpdesk import __version__

CSS_HREF = "/assets/essedi_helpdesk/css/essedi.css"


def _is_helpdesk_page(path: str) -> bool:
	return path == "/helpdesk" or path.startswith("/helpdesk/")


def inject_style(response=None, request=None):
	"""Hook after_request: non deve mai rompere la risposta."""
	try:
		if response is None or request is None:
			return
		if not _is_helpdesk_page(request.path or ""):
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
