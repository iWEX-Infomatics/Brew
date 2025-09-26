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

	// BBJ Delivery Status (Bulk) -> Sales Order List in New Tab
	$('<button class="btn btn-purple btn-sm mr-2 mb-2">BBJ Delivery Status (Bulk)</button>')
		.appendTo(bbj_section)
		.on('click', function() {
			let url = frappe.urllib.get_full_url("/app/sales-order?company=BBJ%20Bangkok%20Ltd");
			window.open(url, "_blank");
		});

	// BBJ Delivery Status Update Report (QA) -> Sales Order Report View in New Tab
	$('<button class="btn btn-purple btn-sm mr-2 mb-2">BBJ - Delivery Status Update Report (QA)</button>')
		.appendTo(bbj_section)
		.on('click', function() {
			let url = frappe.urllib.get_full_url("/app/sales-order/view/report?company=BBJ%20Bangkok%20Ltd");
			window.open(url, "_blank");
		});


	// === D&K Delivery Status ===
	let dk_section = $('<div class="col-md-6 buyer-section mb-4"><h4>D & K Global - Delivery Status</h4></div>').appendTo(row1);

	// DK Delivery Status (Bulk) -> Sales Order List in New Tab
	$('<button class="btn btn-danger btn-sm mr-2 mb-2">DK Delivery Status (Bulk)</button>')
		.appendTo(dk_section)
		.on('click', function() {
			let url = frappe.urllib.get_full_url("/app/sales-order?company=D%26K%20Global%20Ltd");
			window.open(url, "_blank");
		});

	// DK Delivery Status Update Report (QA) -> Sales Order Report View in New Tab
	$('<button class="btn btn-danger btn-sm mr-2 mb-2">DK Delivery Status (QA)</button>')
		.appendTo(dk_section)
		.on('click', function() {
			let url = frappe.urllib.get_full_url("/app/sales-order/view/report?company=D%26K%20Global%20Ltd");
			window.open(url, "_blank");
		});


    // Row 2: BBJ Search Products + DK Search Products
    let row2 = $('<div class="row"></div>').appendTo(page.main);

	let search_bbj_section = $('<div class="col-md-6 buyer-section mb-4"><h4>Search Products - BBJ</h4></div>').appendTo(row2);

	['Search by SKU','Search by Vendor Product ID','Search by PO'].forEach(label => {
		let btn = $('<button class="btn btn-primary btn-sm mr-2 mb-2">'+label+'</button>').appendTo(search_bbj_section);

		btn.on('click', function() {

			// Decide which field to filter
			let field_to_filter = '';
			let popup_title = '';
			if(label === 'Search by SKU') {
				field_to_filter = 'items.custom_customer_sku'; // child table field
				popup_title = 'Enter Customer SKU';
			} else if(label === 'Search by Vendor Product ID') {
				field_to_filter = 'items.custom_vendor_product_id'; // child table field
				popup_title = 'Enter Vendor Product ID';
			} else if(label === 'Search by PO') {
				field_to_filter = 'po_no'; // parent field
				popup_title = 'Enter PO Number';
			} else {
				return;
			}

			// Overlay for background blur
			let $overlay = $('<div class="popup-overlay"></div>').appendTo('body');
			$overlay.css({
				position: 'fixed',
				top: 0,
				left: 0,
				width: '100%',
				height: '100%',
				'background-color': 'rgba(0,0,0,0.5)',
				'backdrop-filter': 'blur(5px)',
				'z-index': 9998
			});

			// Popup
			let $popup = $(`
				<div class="sku-popup" style="padding:20px; background:#fff; border-radius:5px; width:300px;">
					<h5>${popup_title}</h5>
					<input type="text" class="form-control mb-2" id="input_field" placeholder="${popup_title}">
					<button class="btn btn-success btn-sm" id="search_btn">Search</button>
				</div>
			`);

			$('body').append($popup);
			$popup.css({
				position: 'fixed',
				top: '50%',
				left: '50%',
				transform: 'translate(-50%, -50%)',
				'z-index': 9999
			});

			// Search button click
			$popup.find('#search_btn').on('click', function() {
				let value = $popup.find('#input_field').val();
				if(value) {
					let filter_obj = {};

					// Add dynamic field filter
					filter_obj[field_to_filter] = value;

					// Add fixed company filter
					filter_obj['company'] = 'BBJ Bangkok Ltd';

					// Open Sales Order list view filtered
					frappe.set_route('List', 'Sales Order', filter_obj);

					$popup.remove();
					$overlay.remove();
				} else {
					frappe.msgprint('Please enter a value');
				}
			});

			// Close popup if overlay clicked
			$overlay.on('click', function() {
				$popup.remove();
				$overlay.remove();
			});

			// Trigger search on Enter key
			$popup.find('#input_field').on('keypress', function(e){
				if(e.which === 13) { // Enter key
					$popup.find('#search_btn').click();
				}
			});

		});
	});



	let dk_search_section = $('<div class="col-md-6 buyer-section mb-4"><h4>D & K Global - Search Buttons</h4></div>').appendTo(row2);

	['DK Search by SKU','DK Search by PO','DK Search by Vendor Product ID'].forEach(label => {
		let btn = $('<button class="btn btn-danger btn-sm mr-2 mb-2">'+label+'</button>').appendTo(dk_search_section);

		btn.on('click', function() {

			// Decide which field to filter
			let field_to_filter = '';
			let popup_title = '';
			if(label === 'DK Search by SKU') {
				field_to_filter = 'items.custom_customer_sku'; // child table field
				popup_title = 'Enter Customer SKU';
			} else if(label === 'DK Search by Vendor Product ID') {
				field_to_filter = 'items.custom_vendor_product_id'; // child table field
				popup_title = 'Enter Vendor Product ID';
			} else if(label === 'DK Search by PO') {
				field_to_filter = 'po_no'; // parent field
				popup_title = 'Enter PO Number';
			} else {
				return;
			}

			// Overlay for background blur
			let $overlay = $('<div class="popup-overlay"></div>').appendTo('body');
			$overlay.css({
				position: 'fixed',
				top: 0,
				left: 0,
				width: '100%',
				height: '100%',
				'background-color': 'rgba(0,0,0,0.5)',
				'backdrop-filter': 'blur(5px)',
				'z-index': 9998
			});

			// Popup
			let $popup = $(`
				<div class="sku-popup" style="padding:20px; background:#fff; border-radius:5px; width:300px;">
					<h5>${popup_title}</h5>
					<input type="text" class="form-control mb-2" id="input_field" placeholder="${popup_title}">
					<button class="btn btn-success btn-sm" id="search_btn">Search</button>
				</div>
			`);

			$('body').append($popup);
			$popup.css({
				position: 'fixed',
				top: '50%',
				left: '50%',
				transform: 'translate(-50%, -50%)',
				'z-index': 9999
			});

			// Search button click
			$popup.find('#search_btn').on('click', function() {
				let value = $popup.find('#input_field').val();
				if(value) {
					let filter_obj = {};
					filter_obj[field_to_filter] = value;

					// Fixed company filter for DK Global
					filter_obj['company'] = 'D&K Global Ltd';

					// Open Sales Order list view filtered
					frappe.set_route('List', 'Sales Order', filter_obj);

					$popup.remove();
					$overlay.remove();
				} else {
					frappe.msgprint('Please enter a value');
				}
			});

			// Close popup if overlay clicked
			$overlay.on('click', function() {
				$popup.remove();
				$overlay.remove();
			});

			// Trigger search on Enter key
			$popup.find('#input_field').on('keypress', function(e){
				if(e.which === 13) { // Enter key
					$popup.find('#search_btn').click();
				}
			});

		});
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

	['DK Search Invoice by PO','DK Search Invoice by SKU#','DK Search by Invoice#'].forEach(label => {
		let btn = $('<button class="btn btn-danger btn-sm mr-2 mb-2">'+label+'</button>').appendTo(dk_invoice_section);

		btn.on('click', function() {

			// Decide which field to filter
			let field_to_filter = '';
			let popup_title = '';
			if(label === 'DK Search Invoice by PO') {
				field_to_filter = 'po_no'; // parent field
				popup_title = 'Enter PO Number';
			} else if(label === 'DK Search Invoice by SKU#') {
				field_to_filter = 'items.custom_customer_sku'; // child table field
				popup_title = 'Enter Customer SKU';
			} else if(label === 'DK Search by Invoice#') {
				field_to_filter = 'name'; // Invoice ID
				popup_title = 'Enter Invoice Number';
			} else {
				return;
			}

			// Overlay for background blur
			let $overlay = $('<div class="popup-overlay"></div>').appendTo('body');
			$overlay.css({
				position: 'fixed',
				top: 0,
				left: 0,
				width: '100%',
				height: '100%',
				'background-color': 'rgba(0,0,0,0.5)',
				'backdrop-filter': 'blur(5px)',
				'z-index': 9998
			});

			// Popup
			let $popup = $(`
				<div class="sku-popup" style="padding:20px; background:#fff; border-radius:5px; width:300px;">
					<h5>${popup_title}</h5>
					<input type="text" class="form-control mb-2" id="input_field" placeholder="${popup_title}">
					<button class="btn btn-success btn-sm" id="search_btn">Search</button>
				</div>
			`);

			$('body').append($popup);
			$popup.css({
				position: 'fixed',
				top: '50%',
				left: '50%',
				transform: 'translate(-50%, -50%)',
				'z-index': 9999
			});

			// Search button click
			$popup.find('#search_btn').on('click', function() {
				let value = $popup.find('#input_field').val();
				if(value) {
					let filter_obj = {};
					filter_obj[field_to_filter] = value;

					// Fixed company filter for DK Global
					filter_obj['company'] = 'D&K Global Ltd';

					// Open Sales Invoice list view filtered
					frappe.set_route('List', 'Sales Invoice', filter_obj);

					$popup.remove();
					$overlay.remove();
				} else {
					frappe.msgprint('Please enter a value');
				}
			});

			// Close popup if overlay clicked
			$overlay.on('click', function() {
				$popup.remove();
				$overlay.remove();
			});

			// Trigger search on Enter key
			$popup.find('#input_field').on('keypress', function(e){
				if(e.which === 13) { // Enter key
					$popup.find('#search_btn').click();
				}
			});

		});
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

	$('<button class="btn btn-info btn-sm mr-2 mb-2">Pending Orders by Department</button>')
		.appendTo(mcgi_reports)
		.on('click', function() {
			// Sales Order report view URL with filters
			let url = frappe.urllib.get_full_url(
				"/app/sales-order/view/report?" +
				"company=MCGI%20Pvt%20Ltd&delivery_status=Not%20Delivered"
			);
        window.open(url, "_blank");
    });

	let shipment_section = $('<div class="buyer-section mb-4"><h4>Shipment Schedule for upcoming POs (MCGI)</h4></div>').appendTo(page.main);

	// Delivery Status Update Report (Bulk) -> Purchase Order List View
	$('<button class="btn btn-success btn-sm mr-2 mb-2">Delivery Status Update Report (Bulk)</button>')
		.appendTo(shipment_section)
		.on('click', function() {
			let url = frappe.urllib.get_full_url(
				"/app/purchase-order?company=MCGI%20Pvt%20Ltd&status=Delivered"
			);
			window.open(url, "_blank");
		});

	// Delivery Status Update Report (QA) -> Purchase Order Report View
	$('<button class="btn btn-success btn-sm mr-2 mb-2">Delivery Status Update Report (QA)</button>')
		.appendTo(shipment_section)
		.on('click', function() {
			let url = frappe.urllib.get_full_url(
				"/app/purchase-order/view/report?company=MCGI%20Pvt%20Ltd&status=Delivered"
			);
			window.open(url, "_blank");
		});


	let factory_section = $('<div class="buyer-section mb-4 col-md-9 pl-0"><h4>Factory Wise SKUs - BBJ , DK Global, MCGI</h4></div>').appendTo(page.main);

	const factories = [
		{label: 'BBJ - Factory wise SKUs (Pending orders as well as delivered)', company: 'BBJ Bangkok Ltd'},
		{label: 'DK - Factory wise SKUs (Pending orders as well as delivered)', company: 'DK Global'},
		{label: 'MCGI - Factory wise SKUs (Pending orders as well as delivered)', company: 'MCGI'}
	];

	factories.forEach(factory => {
		$('<button class="btn btn-lime btn-sm mr-2 mb-2">' + factory.label + '</button>')
			.appendTo(factory_section)
			.on('click', function() {
				let url = frappe.urllib.get_full_url(
					`/app/sales-order?company=${encodeURIComponent(factory.company)}&delivery_status=Not%20Delivered,Fully%20Delivered`
				);
				window.open(url, "_blank");
			});
	});

};

// Extra CSS for purple & lime buttons
frappe.require("/assets/brew/css/brew.css");
