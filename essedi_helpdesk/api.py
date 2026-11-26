"""Metodi chiamati dagli script del portale clienti."""

import re

import frappe

# Campi del modulo di apertura che si propongono già compilati, con i dati del cliente
# collegato. Sono campi personalizzati della configurazione Essedi: se uno manca nel
# ticket, viene semplicemente saltato.
CAMPO_REFERENTE = "referente_sede"  # "Nome Cognome, telefono" dal contatto
CAMPO_SEDE = "sede_intervento"  # sede dell'ultimo ticket aperto dallo stesso utente

# Modello del ticket usato dal modulo del portale clienti
MODELLO_CLIENTI = "Default"


@frappe.whitelist()
def dati_richiedente():
	"""Valori proposti per il modulo di apertura, presi solo dai dati dell'utente collegato.

	Restituisce {fieldname: {"etichetta", "segnaposti", "valore"}}: lo script cerca il campo
	per testo di esempio o per etichetta e lo compila solo se è ancora vuoto. Il cliente può
	sempre cambiarlo. In più, con chiavi che iniziano con "__" (lo script non le tratta come
	campi):
	- "__guida": righe del testo guida con cui parte la descrizione, per riconoscere una
	  descrizione in cui il cliente non ha scritto niente;
	- "__copertura": copertura del cliente, da mostrare prima dell'invio.
	"""
	utente = frappe.session.user
	if utente in ("Guest", "Administrator"):
		return {}

	meta = frappe.get_meta("HD Ticket")
	proposte = {}

	guida = righe_guida(MODELLO_CLIENTI)
	if guida:
		proposte["__guida"] = guida
	copertura = copertura_utente(utente)
	if copertura:
		proposte["__copertura"] = copertura

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


def righe_guida(modello):
	"""Righe di testo (senza HTML) del testo guida della descrizione nel modello del ticket."""
	html = frappe.db.get_value("HD Ticket Template", modello, "description_template") or ""
	righe = []
	for pezzo in re.split(r"</p>|<br\s*/?>|</li>|</h\d>", html, flags=re.I):
		testo = " ".join(frappe.utils.strip_html(pezzo).replace("&nbsp;", " ").split())
		if testo:
			righe.append(testo)
	return righe


def copertura_utente(utente):
	"""Copertura del cliente a cui appartiene l'utente, con gli stessi testi che il server
	scrive sul ticket (Server Script "copertura contratto sul ticket": se cambi lì i testi,
	cambiali anche qui). Vuota se l'utente non è collegato a una sola scheda cliente."""
	if not frappe.get_meta("HD Customer").get_field("stato_contratto"):
		return ""
	contatti = frappe.get_all("Contact Email", filters={"email_id": utente}, pluck="parent")
	if not contatti:
		return ""
	clienti = set(
		frappe.get_all(
			"HD Customer Member",
			filters={"contact_name": ("in", contatti), "parenttype": "HD Customer"},
			pluck="parent",
		)
	)
	if len(clienti) != 1:
		return ""
	c = frappe.db.get_value(
		"HD Customer",
		clienti.pop(),
		["stato_contratto", "livello_contratto", "scadenza_contratto"],
		as_dict=True,
	)
	stato = (c or {}).get("stato_contratto") or ""
	if stato == "Attivo":
		testo = "Contratto " + (c.get("livello_contratto") or "di assistenza")
		if c.get("scadenza_contratto"):
			testo += ", valido fino al " + frappe.utils.formatdate(c.get("scadenza_contratto"), "dd/MM/yyyy")
		return testo
	if stato == "Scaduto":
		return "Contratto scaduto: intervento a preventivo"
	if stato == "Nessun contratto":
		return "Intervento a preventivo"
	return ""
