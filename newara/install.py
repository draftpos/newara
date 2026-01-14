import frappe
from frappe.installer import update_site_config

def after_install():
    logo_url = "/assets/newara/images/havano-logo.jpeg"
    app_image = "/assets/newara/images/havano.jpeg"
    website_doc = frappe.get_doc("Website Settings","Website Settings")
    system_settings_doc = frappe.get_doc("System Settings","System Settings")
    stock_settings = frappe.get_doc("Stock Settings","Stock Settings")
    system_settings_doc.disable_system_update_notification = 1
    system_settings_doc.disable_change_log_notification = 1
    system_settings_doc.enable_onboarding = 0
    website_doc.app_name = "Havano"
    website_doc.app_logo = app_image
    website_doc.splash_image = app_image
    website_doc.favicon = logo_url
    stock_settings.allow_negative_stock = 1
    stock_settings.save(ignore_permissions = True)
    website_doc.save(ignore_permissions = True)
    system_settings_doc.save(ignore_permissions = True)
    update_site_config("app_logo_url", logo_url)
    frappe.clear_cache()