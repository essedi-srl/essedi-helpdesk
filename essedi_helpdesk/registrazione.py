"""Registrazione dei clienti dalla pagina /login con i dati aziendali.

Il modulo (templates/signup.html) manda, oltre a nome ed email, azienda, telefono e partita
IVA. Questa funzione sostituisce frappe.core.doctype.user.user.sign_up
(override_whitelisted_methods): controlla i dati in più, lascia a Frappe la creazione
dell'utente e poi li scrive sul contatto del nuovo utente:
- azienda -> Contact.company_name (testo dichiarato dal cliente, non il collegamento alla
  scheda cliente di Helpdesk, che resta al dominio della mail o al tecnico);
- telefono -> numero principale del contatto (lo usa la proposta del referente nel modulo);
- partita IVA -> campo personalizzato essedi_partita_iva del contatto (setup.py).
"""

import re

import frappe
from frappe.core.doctype.user.user import is_signup_disabled
from frappe.core.doctype.user.user import sign_up as sign_up_frappe

TELEFONO_VALIDO = re.compile(r"^[0-9+ ()/.-]{6,40}$")
PARTITA_IVA_VALIDA = re.compile(r"^[A-Za-z0-9 ]{0,20}$")


@frappe.whitelist(allow_guest=True)
def sign_up(
	email: str,
	full_name: str,
	redirect_to: str,
	azienda: str | None = None,
	telefono: str | None = None,
	partita_iva: str | None = None,
):
	if is_signup_disabled():
		return sign_up_frappe(email=email, full_name=full_name, redirect_to=redirect_to)

	azienda = (azienda or "").strip()
	telefono = (telefono or "").strip()
	partita_iva = (partita_iva or "").strip().upper()

	if not azienda:
		frappe.throw("Indica l'azienda per cui chiedi assistenza.")
	if len(azienda) > 140:
		frappe.throw("Il nome dell'azienda è troppo lungo.")
	if not TELEFONO_VALIDO.match(telefono):
		frappe.throw("Indica un numero di telefono valido.")
	if not PARTITA_IVA_VALIDA.match(partita_iva):
		frappe.throw("La partita IVA può contenere solo lettere e numeri.")

	esito = sign_up_frappe(email=email, full_name=full_name, redirect_to=redirect_to)

	# 1 e 2: utente creato ora; 0: già registrato (i dati esistenti non si toccano)
	if esito and esito[0] in (1, 2):
		try:
			_completa_contatto(email, full_name, azienda, telefono, partita_iva)
		except Exception:
			# l'account esiste già: la registrazione non deve fallire per i dati aggiuntivi
			frappe.log_error(title="essedi_helpdesk: dati aziendali non salvati sul contatto")
	return esito


def _completa_contatto(email, full_name, azienda, telefono, partita_iva):
	utente = frappe.db.get_value("User", {"email": email}, "name")
	if not utente:
		return
	nome = frappe.db.get_value("Contact", {"user": utente}, "name") or frappe.db.get_value(
		"Contact Email", {"email_id": email, "parenttype": "Contact"}, "parent"
	)
	if nome:
		contatto = frappe.get_doc("Contact", nome)
	else:
		# di solito il contatto lo crea già la configurazione del server; qui solo se manca
		contatto = frappe.new_doc("Contact")
		contatto.first_name = full_name
		contatto.user = utente
		contatto.add_email(email, is_primary=1)

	contatto.company_name = azienda
	if not any(p.phone == telefono for p in contatto.phone_nos):
		contatto.add_phone(telefono, is_primary_phone=0 if contatto.phone else 1)
	if partita_iva and contatto.meta.get_field("essedi_partita_iva"):
		contatto.essedi_partita_iva = partita_iva

	contatto.flags.ignore_permissions = True
	contatto.save() if nome else contatto.insert()
