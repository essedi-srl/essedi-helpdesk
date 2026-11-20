app_name = "essedi_helpdesk"
app_title = "Essedi Helpdesk"
app_publisher = "Essedi Srl"
app_description = "Personalizzazioni Essedi per Frappe Helpdesk"
app_email = "info@essedisrl.eu"
app_license = "AGPL-3.0"
required_apps = ["helpdesk"]

# Foglio di stile Essedi nelle pagine /helpdesk (tecnici e portale clienti) e di accesso
after_request = ["essedi_helpdesk.style.inject_style"]

# Elenco ticket del portale clienti senza le colonne riservate ai tecnici
override_doctype_class = {"HD Ticket": "essedi_helpdesk.overrides.EssediHDTicket"}
