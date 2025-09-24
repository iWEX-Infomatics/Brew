

frappe.ui.form.on('Company', {
    
    custom_navbar_color: function(frm) {
        preview_branding_change(frm);
    },
    
    custom_use_logo_in_navbar: function(frm) {
        preview_branding_change(frm);
    },
    
    after_save: function(frm) {
        
        frappe.show_alert({
            message: __('Company branding settings saved successfully!'),
            indicator: 'green'
        }, 4);
        
        if (frm.doc.name === frappe.defaults.get_default('company')) {
            setTimeout(function() {
                apply_company_theme();
            }, 1000);
        }
    }
});

function preview_branding_change(frm) {
    if (frm.doc.custom_navbar_color || frm.doc.custom_use_logo_in_navbar !== undefined) {
        let color = frm.doc.custom_navbar_color || '#497df7';
        let use_logo = frm.doc.custom_use_logo_in_navbar;
        let company_name = frm.doc.company_name || frm.doc.name;
        
        set_company_branding(color, frm.doc.company_logo, use_logo, company_name);
        
        let mode = use_logo ? 'Logo' : 'Text';
        // frappe.show_alert({
        //     message: __(`Preview: ${mode} mode with color ${color}`),
        //     indicator: 'orange'
        // }, 3);
        
        if (!frm.is_dirty()) {
            setTimeout(function() {
                apply_company_theme();
                // frappe.show_alert({
                //     message: __('Preview ended - Restored original branding'),
                //     indicator: 'gray'
                // }, 2);
            }, 5000);
        }
    }
}
