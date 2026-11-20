"""Estensioni dei controller di Helpdesk."""

from helpdesk.helpdesk.doctype.hd_ticket.hd_ticket import HDTicket

# Campi riservati ai tecnici: sul server sono al livello di permesso 8, che i clienti
# non leggono. Nell'elenco del portale resterebbero colonne vuote, quindi le togliamo.
COLONNE_NASCOSTE_AL_CLIENTE = {"priority", "agent_group"}


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
