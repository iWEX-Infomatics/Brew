// $(document).ready(function() {
//     apply_company_theme();
    
//     $(document).on('change', '[data-fieldname="company"]', function() {
//         setTimeout(apply_company_theme, 100);
//     });
    
//     if (frappe.defaults) {
//         frappe.defaults.on_change = apply_company_theme;
//     }
// });

// function apply_company_theme() {
//     let company = frappe.defaults.get_default('company') || 
//                   frappe.boot.sysdefaults.company ||
//                   localStorage.getItem('selected_company');
    
//     $('body').removeClass('company-bbj company-dk company-mcgi');
    
//     if (company === 'BBJ Bangkok Ltd') {
//         $('body').addClass('company-bbj');
//     } else if (company === 'D&K Global Ltd') {
//         $('body').addClass('company-dk');  
//     } else if (company === 'MCGI Pvt Ltd') {
//         $('body').addClass('company-mcgi');
//     }
// }


$(document).ready(function() {
    apply_company_theme();
    
    $(document).on('change', '[data-fieldname="company"]', function() {
        setTimeout(apply_company_theme, 500);
    });
    
    if (frappe.defaults) {
        frappe.defaults.on_change = apply_company_theme;
    }
});

function apply_company_theme() {
    let company = frappe.defaults.get_default('company') || 
                  frappe.boot.sysdefaults.company ||
                  localStorage.getItem('selected_company');
    
    $('body').removeClass('company-bbj company-dk company-mcgi');
    
    if (company === 'BBJ Bangkok Ltd') {
        $('body').addClass('company-bbj');
        set_company_branding('#FF6B35', '/files/BBJ Logo.png');
    } else if (company === 'D&K Global Ltd') {
        $('body').addClass('company-dk');
        set_company_branding('#497df7', '/files/DNK Logo.png');
    } else if (company === 'MCGI Pvt Ltd') {
        $('body').addClass('company-mcgi');
        set_company_branding('#5af188', '/files/MCGI Logo.jpg');
    }
}

function set_company_branding(color, logo_url) {
    // Navbar color
    $('.navbar').css('background-color', color);
    
    // Exact selector use karo jo console mein mila
    setTimeout(function() {
        $('a.navbar-brand.navbar-home').html(`
            <img src="${logo_url}" 
                 style="height: 28px; width: auto; max-width: 100px;" 
                 alt="Company Logo">
        `);
        
        console.log('Logo set:', logo_url);
    }, 300);
}
