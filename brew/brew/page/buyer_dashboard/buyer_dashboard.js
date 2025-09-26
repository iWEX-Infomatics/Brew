frappe.pages['buyer-dashboard'].on_page_load = function(wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: "Buyer's Dashboard",
        single_column: true
    });

    // Row 1: BBJ Shipment Schedule (left) + D&K Delivery Status (right)
    let row1 = $('<div class="row"></div>').appendTo(page.main);

	// === BBJ Shipment Schedule ===
	let bbj_section = $('<div class="col-md-6 buyer-section mb-4"><h4>BBJ Shipment Schedule</h4></div>').appendTo(row1);

	// BBJ Delivery Status (Bulk) button with click action
	$('<button class="btn btn-purple btn-sm mr-2 mb-2">BBJ Delivery Status (Bulk)</button>')
		.appendTo(bbj_section)
		.click(function() {
			frappe.set_route("bbj-delivery-status");
		});

	$('<button class="btn btn-purple btn-sm mr-2 mb-2">BBJ - Delivery Status Update Report (QA)</button>')
		.appendTo(bbj_section);

    // === D&K Delivery Status ===
    let dk_section = $('<div class="col-md-6 buyer-section mb-4"><h4>D & K Global - Delivery Status</h4></div>').appendTo(row1);
    $('<button class="btn btn-danger btn-sm mr-2 mb-2">DK Delivery Status (Bulk)</button>').appendTo(dk_section);
    $('<button class="btn btn-danger btn-sm mr-2 mb-2">DK Delivery Status (QA)</button>').appendTo(dk_section);

    // Row 2: BBJ Search Products + DK Search Products
    let row2 = $('<div class="row"></div>').appendTo(page.main);

    let search_bbj_section = $('<div class="col-md-6 buyer-section mb-4"><h4>Search Products - BBJ</h4></div>').appendTo(row2);
    ['Search by SKU','Search by Vendor Product ID','Search by PO'].forEach(label => {
        $('<button class="btn btn-primary btn-sm mr-2 mb-2">'+label+'</button>').appendTo(search_bbj_section);
    });

    let dk_search_section = $('<div class="col-md-6 buyer-section mb-4"><h4>D & K Global - Search Buttons</h4></div>').appendTo(row2);
    ['DK Search by SKU','DK Search by PO','DK Search by Vendor Product ID'].forEach(label => {
        $('<button class="btn btn-danger btn-sm mr-2 mb-2">'+label+'</button>').appendTo(dk_search_section);
    });

    // Row 3: BBJ Invoices + DK Invoices
    let row3 = $('<div class="row"></div>').appendTo(page.main);

    let invoice_bbj_section = $('<div class="col-md-6 buyer-section mb-4"><h4>Search BBJ Invoices (Including GDFs)</h4></div>').appendTo(row3);
    ['Search BBJ Invoice by PO','Search BBJ Invoice by SKU#','Search BBJ Invoice by Invoice#',
     'Search BBJ Invoice by anything','Search BBJ GDFs','Search worksheet by Invoice#']
        .forEach(label => {
            $('<button class="btn btn-dark btn-sm mr-2 mb-2">'+label+'</button>').appendTo(invoice_bbj_section);
        });

    let dk_invoice_section = $('<div class="col-md-6 buyer-section mb-4"><h4>D & K Global - Invoice Search</h4></div>').appendTo(row3);
    ['DK Search Invoice by PO','DK Search Invoice by SKU#','DK Search by Invoice#']
        .forEach(label => {
            $('<button class="btn btn-danger btn-sm mr-2 mb-2">'+label+'</button>').appendTo(dk_invoice_section);
        });

    // Row 4: BBJ Reports + DK Reports
    let row4 = $('<div class="row"></div>').appendTo(page.main);

    let reports_bbj_section = $('<div class="col-md-6 buyer-section mb-4"><h4>BBJ Reports</h4></div>').appendTo(row4);
    ['BBJ Invoices and GDFs','Overdue orders by Department','Search BBJ GDFs',
     'Pending Orders by Department','Stone Price Search']
        .forEach(label => {
            $('<button class="btn btn-info btn-sm mr-2 mb-2">'+label+'</button>').appendTo(reports_bbj_section);
        });

    let dk_reports_section = $('<div class="col-md-6 buyer-section mb-4"><h4>D & K Global - Reports</h4></div>').appendTo(row4);
    ['DK Invoices and GDFs','DK Pending Orders by Department','DK Past Due Orders by Department',
     'Jewelry Measurements Requested','DK All records with Jewelry Measurements']
        .forEach(label => {
            $('<button class="btn btn-danger btn-sm mr-2 mb-2">'+label+'</button>').appendTo(dk_reports_section);
        });

    // ===== MCGI (full width) =====
    let mcgi_search = $('<div class="buyer-section mb-4"><h4>MCGI Search Tools</h4></div>').appendTo(page.main);
    ['Search MCGI GDF by PO','Search by SKU#','Search by Vendor Product ID','Search by PO#']
        .forEach(label => {
            $('<button class="btn btn-primary btn-sm mr-2 mb-2">'+label+'</button>').appendTo(mcgi_search);
        });

    let mcgi_reports = $('<div class="buyer-section mb-4"><h4>MCGI Reports</h4></div>').appendTo(page.main);
    $('<button class="btn btn-info btn-sm mr-2 mb-2">Pending Orders by Department</button>').appendTo(mcgi_reports);

    let shipment_section = $('<div class="buyer-section mb-4"><h4>Shipment Schedule for upcoming POs (MCGI)</h4></div>').appendTo(page.main);
    ['Delivery Status Update Report (Bulk)','Delivery Status Update Report (QA)']
        .forEach(label => {
            $('<button class="btn btn-success btn-sm mr-2 mb-2">'+label+'</button>').appendTo(shipment_section);
        });

    let factory_section = $('<div class="buyer-section mb-4 col-md-9 pl-0"><h4>Factory Wise SKUs - BBJ , DK Global, MCGI</h4></div>').appendTo(page.main);
    ['BBJ - Factory wise SKUs (Pending orders as well as delivered)',
     'DK - Factory wise SKUs (Pending orders as well as delivered)',
     'MCGI - Factory wise SKUs (Pending orders as well as delivered)']
        .forEach(label => {
            $('<button class="btn btn-lime btn-sm mr-2 mb-2">'+label+'</button>').appendTo(factory_section);
        });
};

// Extra CSS for purple & lime buttons
frappe.require("/assets/brew/css/brew.css");
