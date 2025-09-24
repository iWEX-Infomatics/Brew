$(document).ready(function() {
    apply_company_theme();
    
    $(document).on('change', '[data-fieldname="company"]', function() {
        setTimeout(apply_company_theme, 500);
    });
    
    detect_page_company();
});

frappe.ready(function() {
    apply_company_theme();
});

if (frappe.defaults) {
    frappe.defaults.on_change = function() {
        setTimeout(apply_company_theme, 300);
    };
}

frappe.realtime.on('company_branding_updated', function(data) {
    let current_company = frappe.defaults.get_default('company');
    
    if (data.company === current_company) {
        set_company_branding(
            data.custom_navbar_color, 
            data.company_logo,
            data.custom_use_logo_in_navbar,
            data.company_name
        );
        
        frappe.show_alert({
            message: __('Company branding updated in real-time!'),
            indicator: 'green'
        }, 3);
    }
});

function apply_company_theme() {
    
    let company = frappe.defaults.get_default('company') || 
                  frappe.boot.sysdefaults.company;
    
    
    if (!company) {
        set_company_branding('#497df7', null, 0, 'ERPNext');
        return;
    }
    
    frappe.call({
        method: "frappe.client.get_value",
        args: {
            doctype: "Company",
            filters: {name: company},
            fieldname: ["custom_navbar_color", "company_logo", "custom_use_logo_in_navbar", "company_name"]
        },
        callback: function(r) {
            
            if (r.message) {
                let navbar_color = r.message.custom_navbar_color;
                let company_logo = r.message.company_logo;
                let use_logo = r.message.custom_use_logo_in_navbar;
                let company_name = r.message.company_name || company;
                
                
                let final_color = navbar_color || '#497df7';
                set_company_branding(final_color, company_logo, use_logo, company_name);
            } else {
                set_company_branding('#497df7', null, 0, company);
            }
        },
        error: function(r) {
            set_company_branding('#497df7', null, 0, company);
        }
    });
}

function set_company_branding(color, logo_url, use_logo, company_name) {

    $('.navbar').css({
        'background-color': color,
        'transition': 'background-color 0.3s ease'
    });
    
    
    let shouldUseLogo = false;
    if (use_logo === 1 || use_logo === "1" || use_logo === true) {
        shouldUseLogo = true;
    }
        
    setTimeout(function() {
        let navbar_brand = $('a.navbar-brand.navbar-home');
        
        if (shouldUseLogo && logo_url) {
            console.log("🖼️ Displaying company logo");
            navbar_brand.html(`
                <img src="${logo_url}" 
                     style="height: 32px; width: auto; max-width: 150px; transition: all 0.3s ease;" 
                     alt="${company_name} Logo"
                     title="${company_name}">
            `);
        } else {
            navbar_brand.html(`
                <span style="
                    color: black !important; 
                    font-weight: 600 !important; 
                    font-size: 14px !important; 
                    text-decoration: none !important;
                    transition: all 0.3s ease;
                    letter-spacing: 0.5px;
                    padding: 8px 4px;
                    display: inline-block !important;
                    line-height: 1.2;
                " 
                title="${company_name}">
                    ${company_name}
                </span>
            `);
            
            navbar_brand.find('img').remove();
        }
    }, 300);
    
    window.current_branding = {
        color: color,
        logo: logo_url,
        use_logo: shouldUseLogo,
        company_name: company_name,
        applied_at: new Date()
    };
    
}

function detect_page_company() {
    let current_url = window.location.href;
    let url_company_match = current_url.match(/company\/([^\/]+)/);
    
    if (url_company_match) {
        let url_company = decodeURIComponent(url_company_match[1]);
        let current_company = frappe.defaults.get_default('company');
        
        
        if (url_company !== current_company) {
            test_company_branding(url_company);
        }
    }
}

function test_company_branding(company_name) {
    
    frappe.call({
        method: "frappe.client.get_value",
        args: {
            doctype: "Company",
            filters: {name: company_name},
            fieldname: ["custom_navbar_color", "company_logo", "custom_use_logo_in_navbar", "company_name"]
        },
        callback: function(r) {
            
            if (r.message) {
                let color = r.message.custom_navbar_color || '#497df7';
                let use_logo = r.message.custom_use_logo_in_navbar;
                let company_display_name = r.message.company_name || company_name;
                
                set_company_branding(
                    color,
                    r.message.company_logo,
                    use_logo,
                    company_display_name
                );
                
                let display_type = use_logo == 1 ? 'Logo' : 'Text';
                frappe.show_alert({
                    message: __(`Preview: ${company_name} (${display_type} Mode)`),
                    indicator: 'blue'
                }, 4);
            }
        }
    });
}

window.apply_company_theme = apply_company_theme;
window.test_company_branding = test_company_branding;
window.set_company_branding = set_company_branding;

window.toggle_logo_text = function(company_name) {
    frappe.call({
        method: "frappe.client.get_value",
        args: {
            doctype: "Company",
            filters: {name: company_name},
            fieldname: ["custom_use_logo_in_navbar"]
        },
        callback: function(r) {
            if (r.message) {
                let current_value = r.message.custom_use_logo_in_navbar;
                let new_value = current_value == 1 ? 0 : 1;
                
                frappe.call({
                    method: "frappe.client.set_value",
                    args: {
                        doctype: "Company",
                        name: company_name,
                        fieldname: "custom_use_logo_in_navbar",
                        value: new_value
                    },
                    callback: function() {
                        let mode = new_value == 1 ? 'Logo' : 'Text';
                        console.log(`Toggled ${company_name} to ${mode} mode`);
                        test_company_branding(company_name);
                    }
                });
            }
        }
    });
};
