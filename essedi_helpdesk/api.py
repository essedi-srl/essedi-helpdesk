"""Metodi chiamati dagli script del portale clienti."""

import frappe

# Campi del modulo di apertura che si propongono già compilati, con i dati del cliente
# collegato. Sono campi personalizzati della configurazione Essedi: se uno manca nel
# ticket, viene semplicemente saltato.
CAMPO_REFERENTE = "referente_sede"  # "Nome Cognome, telefono" dal contatto
CAMPO_SEDE = "sede_intervento"  # sede dell'ultimo ticket aperto dallo stesso utente


@frappe.whitelist()
def dati_richiedente():
	"""Valori proposti per il modulo di apertura, presi solo dai dati dell'utente collegato.

	Restituisce {fieldname: {"etichetta", "segnaposti", "valore"}}: lo script cerca il campo
	per testo di esempio o per etichetta e lo compila solo se è ancora vuoto. Il cliente può
	sempre cambiarlo.
	"""
	utente = frappe.session.user
	if utente in ("Guest", "Administrator"):
		return {}

	meta = frappe.get_meta("HD Ticket")
	proposte = {}

	def proponi(campo, valore):
		df = meta.get_field(campo)
		if df and valore:
			# il modulo mostra etichetta e testo di esempio del modello del ticket
			segnaposti = frappe.get_all(
				"HD Ticket Template Field",
				filters={"fieldname": campo, "placeholder": ("is", "set")},
				pluck="placeholder",
			)
			proposte[campo] = {
				"etichetta": df.label,
				"segnaposti": sorted(set(segnaposti)),
				"valore": valore,
			}

	if meta.get_field(CAMPO_REFERENTE):
		contatto = frappe.db.get_value("Contact Email", {"email_id": utente}, "parent")
		nome, telefono = None, None
		if contatto:
			c = frappe.db.get_value(
				"Contact", contatto, ["full_name", "mobile_no", "phone"], as_dict=True
			)
			if c:
				nome, telefono = c.full_name, c.mobile_no or c.phone
		nome = nome or frappe.db.get_value("User", utente, "full_name")
		proponi(CAMPO_REFERENTE, ", ".join(v for v in (nome, telefono) if v))

	if meta.get_field(CAMPO_SEDE):
		ultimo = frappe.get_all(
			"HD Ticket",
			filters={"raised_by": utente, CAMPO_SEDE: ("is", "set")},
			pluck=CAMPO_SEDE,
			order_by="creation desc",
			limit=1,
		)
		proponi(CAMPO_SEDE, ultimo[0] if ultimo else None)

	return proposte
