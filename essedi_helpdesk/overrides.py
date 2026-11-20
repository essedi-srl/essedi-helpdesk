"""Estensioni dei controller e delle API di Helpdesk."""

import frappe
from helpdesk.api.doc import get_filterable_fields as helpdesk_get_filterable_fields
from helpdesk.helpdesk.doctype.hd_ticket.hd_ticket import HDTicket

# Campi riservati ai tecnici (Team, Priorità, scadenze SLA): sul server sono al livello
# di permesso 8, che i clienti non leggono. Nell'elenco del portale resterebbero colonne
# vuote, quindi le togliamo.
COLONNE_NASCOSTE_AL_CLIENTE = {"priority", "agent_group", "response_by", "resolution_by"}


def campi_non_leggibili(doctype: str) -> set:
	"""Campi del DocType che l'utente corrente non può leggere per livello di permesso."""
	meta = frappe.get_meta(doctype)
	livelli = meta.get_permlevel_access("read")
	return {df.fieldname for df in meta.fields if (df.permlevel or 0) not in livelli}


class EssediHDTicket(HDTicket):
	@staticmethod
	def default_list_data(show_customer_portal_fields=False):
		data = HDTicket.default_list_data(show_customer_portal_fields)
		if show_customer_portal_fields:
			data["columns"] = [
				col
				for col in data["columns"]
				if col.get("key") not in COLONNE_NASCOSTE_AL_CLIENTE
			]
		return data


@frappe.whitelist()
def get_filterable_fields(
	doctype: str,
	show_customer_portal_fields: bool = False,
	ignore_team_restrictions: bool = False,
):
	"""Campi proposti nel menu Filtro, senza quelli che l'utente non può leggere.

	Helpdesk propone ai clienti un elenco fisso che comprende Priorità e scadenze SLA:
	il server blocca comunque il filtro su quei campi, ma il cliente vedrebbe la voce e
	poi un errore. Per i tecnici non cambia niente: leggono tutti i livelli.
	"""
	campi = helpdesk_get_filterable_fields(
		doctype,
		show_customer_portal_fields=show_customer_portal_fields,
		ignore_team_restrictions=ignore_team_restrictions,
	)
	nascosti = campi_non_leggibili(doctype)
	return [c for c in campi if c.get("fieldname") not in nascosti]
