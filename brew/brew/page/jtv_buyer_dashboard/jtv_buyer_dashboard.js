frappe.pages['jtv-buyer-dashboard'].on_page_load = function(wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: "JTV Buyer's Dashboard",
        single_column: true
    });

    let filter_area = $('<div class="filters-row d-flex flex-nowrap align-items-center" style="position: sticky; top: 46px; background: white; z-index: 1000; padding: 10px 0;" ></div>').appendTo(page.main);

    function add_filter(fieldname, label, fieldtype, options=null, width="140px") {
        let field = frappe.ui.form.make_control({
            df: {
                fieldname: fieldname,
                label: label,
                fieldtype: fieldtype,
                options: options,
                reqd: 0
            },
            parent: filter_area,
            render_input: true
        });
        field.$wrapper.css({
            "margin-right": "10px",
            "width": width,
            "max-width": width
        });
        return field;
    }

    // 🔹 Company filter as Select with fixed 3 options
    let company_filter_wrapper = $('<div style="margin-right:10px; width:190px;"></div>').appendTo(filter_area);
    let company_filter = frappe.ui.form.make_control({
        df: {
            fieldname: "company",
            label: "Company",
            fieldtype: "Select",
            options: ["All", "BBJ Bangkok Ltd", "D&K Global Ltd", "MCGI Pvt Ltd"],
            reqd: 0
        },
        parent: company_filter_wrapper,
        render_input: true
    });
    company_filter.$wrapper.css({"margin-right":"10px", "width":"190px"});
    company_filter.set_value("All"); // default value

    // 🔹 Other filters (normal)
    let gemstone_filter = frappe.ui.form.make_control({
    df: {
        fieldname: "gemstone",
        label: "Gemstone",
        fieldtype: "Link",
        options: "Gemstones",
        only_select: true   // 🔹 यह line create + advanced search हटा देगी
    },
    parent: filter_area,
    render_input: true
	});
	gemstone_filter.$wrapper.css({
		"margin-right": "10px",
		"width": "180px",
		"max-width": "180px"
	});

    let metal_group_filter = frappe.ui.form.make_control({
    df: {
        fieldname: "metal_group",
        label: "Metal Type",
        fieldtype: "Select",
        options: [
            "All",
            "Gold",
            "Silver",
            "Platinum",
            "Copper",
            "Brass",
            "Steel",
            "Base metal alloys"
        ]
    },
    parent: filter_area,
    render_input: true
	});
	metal_group_filter.$wrapper.css({"margin-right": "10px", "width": "200px"});
	metal_group_filter.set_value("All");   // default

    let department_filter = frappe.ui.form.make_control({
    df: {
        fieldname: "department",
        label: "Department",
        fieldtype: "Link",
        options: "Customer Departments",
        only_select: true   // 🔹 Hide "Create New" + "Advanced Search"
    },
    parent: filter_area,
    render_input: true
});
department_filter.$wrapper.css({
    "margin-right": "10px",
    "width": "180px",
    "max-width": "180px"
});

	let date_filter = frappe.ui.form.make_control({
        df: { fieldname: "date_range", label: "Date Range", fieldtype: "DateRange" },
        parent: filter_area,
        render_input: true
    });
    date_filter.$wrapper.css({"margin-right": "10px","width":"220px","max-width":"220px"});
    let sku_filter         = add_filter("customer_sku", "SKU", "Data", null, "190px");

    let btn_area = $(`<div class="d-flex align-items-center ml-2"></div>`).appendTo(filter_area);
    let apply_btn = $(`<button class="btn btn-primary btn-sm mr-2">Apply</button>`).appendTo(btn_area);
    let reset_btn = $(`<button class="btn btn-sm" title="Reset Filters" style="font-size:20px !important;">🔄</button>`).appendTo(btn_area);

    let container = $(`<div class="bbj-container" style="overflow-x: auto;overflow-y: auto;height: 500px;"></div>`).appendTo(page.main);

    let table = $(`
        <table class="table table-bordered table-striped" style="min-width: 3000px;margin-top:0px !important;">
        <thead style="position: sticky; top: 0; z-index: 100; background-color: white;">
            <tr>
                <th></th>
                <th>Picture</th>
                <th>Order</th>
                <th>Company</th>
                <th>PO</th>
                <th>SKU</th>
                <th>Order Qty</th>
                <th>Unit Price</th>
                <th>Extended Cost</th>
                <th>Product Type</th>
                <th>Gemstone</th>
                <th>Metal Group</th>
                <th>Brand</th>
                <th>ETA (Delivery Date)</th>
                <th>Latest Shipping On</th>
                <th>Export Invoice No.</th>
                <th>HAWB</th>
                <th>Shipped Qty</th>
                <th>Invoice Date</th>
            </tr>
		<tr class="filters-row-inputs">
		<th></th>
		<th></th> 
		<th><input type="text" class="form-control form-control-sm" placeholder="Search"></th>
		<th><input type="text" class="form-control form-control-sm" placeholder="Search"></th>
		<th><input type="text" class="form-control form-control-sm" placeholder="Search"></th>
		<th><input type="text" class="form-control form-control-sm" placeholder="Search"></th>
		<th><input type="text" class="form-control form-control-sm" placeholder="Search"></th>
		<th><input type="text" class="form-control form-control-sm" placeholder="Search"></th>
		<th><input type="text" class="form-control form-control-sm" placeholder="Search"></th>
		<th><input type="text" class="form-control form-control-sm" placeholder="Search"></th>
		<th><input type="text" class="form-control form-control-sm" placeholder="Search"></th>
		<th><input type="text" class="form-control form-control-sm" placeholder="Search"></th>
		<th><input type="text" class="form-control form-control-sm" placeholder="Search"></th>
		<th><input type="text" class="form-control form-control-sm" placeholder="Search"></th>
		<th><input type="text" class="form-control form-control-sm" placeholder="Search"></th>
		<th><input type="text" class="form-control form-control-sm" placeholder="Search"></th>
		<th><input type="text" class="form-control form-control-sm" placeholder="Search"></th>
		<th><input type="text" class="form-control form-control-sm" placeholder="Search"></th>
		<th><input type="text" class="form-control form-control-sm" placeholder="Search"></th>
		</tr>
        </thead>
        <tbody></tbody>
        </table>
    `).appendTo(container);

    let load_more_btn = $('<button class="btn btn-primary mt-3">Load More</button>').appendTo(container);

    let start = 0;
    let page_length = 50;
    let loaded_sales_orders = new Set();

	function get_filters() {
		let date_range = date_filter.get_value();
		return {
			company: company_filter.get_value() === "All" ? "" : company_filter.get_value(),
			gemstone: gemstone_filter.get_value(),
			metal_group: metal_group_filter.get_value() === "All" ? "" : metal_group_filter.get_value(),
			department: department_filter.get_value(),
			from_date: date_range ? date_range[0] : "",
			to_date: date_range ? date_range[1] : "",
			customer_sku: sku_filter.get_value()
		};
	}


    function load_orders(reset=false) {
        if (reset) {
            start = 0;
            loaded_sales_orders.clear();
            table.find("tbody").empty();
            load_more_btn.show();
        }

        frappe.call({
            method: "brew.brew.page.jtv_buyer_dashboard.jtv_buyer_dashboard.get_bbj_sales_orders",
            args: Object.assign({ start, page_length }, get_filters()),
            callback: function(r) {
                if (r.message && r.message.length) {
                    r.message.forEach(d => {
                        if (loaded_sales_orders.has(d.sales_order)) return;
                        loaded_sales_orders.add(d.sales_order);
                        let img_html = d.picture
                            ? `<img src="${d.picture}" class="zoom-img" style="height:40px;">`
                            : `<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/330px-No-Image-Placeholder.svg.png" class="zoom-img" style="height:40px;">`;

                        let row = $(`
                            <tr data-so="${d.sales_order}">
                                <td><button class="btn btn-sm btn-outline-secondary expand-btn">+</button></td>
                                <td>${img_html}</td>
                                <td><a href="/app/sales-order/${d.sales_order}" target="_blank">${d.sales_order}</a></td>
                                <td>${d.company || ""}</td>
                                <td>${d.customer_po || ""}</td>
                                <td>${d.customer_sku || ""}</td>
                                <td>${d.total_qty || 0}</td>
                                <td>${d.unit_price || 0}</td>
                                <td>${d.extended_cost || 0}</td>
                                <td>${d.product_type || ""}</td>
                                <td>${d.gemstone || ""}</td>
                                <td>${d.metal_group || ""}</td>
                                <td>${d.brand || ""}</td>
                                <td>${d.eta || ""}</td>
                                <td>${d.latest_shipping_on || ""}</td>
                                <td>${d.export_invoice_no || ""}</td>
                                <td>${d.hawb || ""}</td>
                                <td>${d.shipped_qty || 0}</td>
                                <td>${d.invoice_date || ""}</td>
                            </tr>
                        `);
                        table.find("tbody").append(row);
                    });

                    start += page_length;
                } else {
                    load_more_btn.hide();
                }
            }
        });
    }

    table.on("click", ".expand-btn", function() {
        let btn = $(this);
        let tr = btn.closest("tr");
        let so = tr.data("so");

        if (btn.text() === "+") {
            frappe.call({
                method: "brew.brew.page.jtv_buyer_dashboard.jtv_buyer_dashboard.get_so_bom_details",
                args: { sales_order: so },
                callback: function(r) {
                    if (r.message) {
                        let bom_html = `
                            <tr class="bom-details">
                                <td colspan="19">
                                    <strong>BOM:</strong> ${r.message.bom_id || "N/A"}<br>
                                    <table class="table table-sm table-bordered mt-2">
                                        <thead>
                                            <tr>
                                                <th>Item Code</th>
                                                <th>Description</th>
                                                <th>Qty</th>
                                                <th>UOM</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${(r.message.bom_items || []).map(i => `
                                            <tr>
                                                <td>${i.item_code}</td>
                                                <td>${i.description || ""}</td>
                                                <td>${i.qty}</td>
                                                <td>${i.uom}</td>
                                            </tr>`).join("")}
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        `;
                        tr.after(bom_html);
                        btn.text("-");
                    }
                }
            });
        } else {
            tr.next(".bom-details").remove();
            btn.text("+");
        }
    });

    load_orders();

    load_more_btn.click(() => load_orders());
    apply_btn.click(() => load_orders(true));
    reset_btn.click(() => {
        [gemstone_filter, metal_group_filter, department_filter, date_filter, sku_filter].forEach(f => f.set_value(""));
        company_filter.set_value("All");
        load_orders(true);
    });

    table.find("thead tr.filters-row-inputs th input").on("keyup", function() {
        let colIndex = $(this).parent().index();
        let searchVal = $(this).val().toLowerCase();
        table.find("tbody tr").each(function() {
            let cellText = $(this).find("td").eq(colIndex).text().toLowerCase();
            $(this).toggle(cellText.indexOf(searchVal) > -1);
        });
    });

    $("<style>")
        .prop("type", "text/css")
        .html(`
            .zoom-img {
                transition: transform 0.3s ease-in-out;
                cursor: zoom-in;
            }
            .zoom-img:hover {
                transform: scale(3);
                width:50px;
                position: relative;
                z-index: 9999;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                background: #fff;
                border:1px solid #12008675;
            }
        `).appendTo("head");
};
