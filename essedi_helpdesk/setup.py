"""Campi personalizzati creati dall'app (all'installazione e a ogni migrate).

- Impostazioni Helpdesk > "Mostra la base di conoscenza ai clienti": interruttore letto da
  style.py e applicato da public/js/essedi-portale.js. Spento, i clienti non vedono la voce
  di menu, le pagine pubbliche degli articoli e gli articoli suggeriti nel modulo.
- Contatto > "Partita IVA": scritta dalla registrazione dei clienti (registrazione.py),
  accanto al nome dell'azienda dichiarato dal cliente (campo standard company_name).
"""

from frappe.custom.doctype.custom_field.custom_field import create_custom_fields

CAMPI = {
	"HD Settings": [
		{
			"fieldname": "essedi_kb_clienti",
			"label": "Mostra la base di conoscenza ai clienti",
			"fieldtype": "Check",
			"default": "0",
			"insert_after": "prefer_knowledge_base",
			"description": "Spento, nel portale clienti non compaiono la voce Base di conoscenza "
			"e gli articoli suggeriti. Per i tecnici non cambia nulla.",
		}
	],
	"Contact": [
		{
			"fieldname": "essedi_partita_iva",
			"label": "Partita IVA",
			"fieldtype": "Data",
			"insert_after": "company_name",
			"description": "Indicata dal cliente quando si è registrato sul portale.",
		}
	],
}


def crea_campi():
	create_custom_fields(CAMPI, update=True)
