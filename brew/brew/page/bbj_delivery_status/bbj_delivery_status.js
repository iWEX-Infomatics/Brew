frappe.pages['bbj-delivery-status'].on_page_load = function(wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: "BBJ Delivery Status (Bulk)",
        single_column: true
    });

    let container = $('<div class="bbj-container mt-3"></div>').appendTo(page.main);

    // Scrollable wrapper
    let scrollContainer = $(`<div style="overflow-x:auto; white-space:nowrap;"></div>`).appendTo(container);

    // Table
    let table = $(`<table class="table table-bordered table-striped" style="min-width: 1800px;">
        <thead>
            <tr>
                <th>Sales Order</th>
                <th>PO (Customer PO)</th>
                <th>SKU (Customer SKU)</th>
                <th>Picture</th>
                <th>Order Qty</th>
                <th>Unit Price</th>
                <th>Extended Cost</th>
                <th>Product Type</th>
                <th>Gemstone</th>
                <th>ETA (Delivery Date)</th>
                <th>Latest Shipping On</th>
                <th>Export Invoice No. (SKU Sales Invoice ID)</th>
                <th>HAWB</th>
                <th>Shipped Qty</th>
                <th>Invoice Date (SKU Sales Invoice Date)</th>
            </tr>
        </thead>
        <tbody></tbody>
    </table>`).appendTo(scrollContainer);

    // Load More button
    let load_more_btn = $('<button class="btn btn-primary mt-3">Load More</button>')
        .appendTo(container);

    let start = 0;
    let page_length = 50;

    function load_orders() {
        frappe.call({
            method: "brew.brew.page.bbj_delivery_status.bbj_delivery_status.get_bbj_sales_orders",
            args: { start, page_length },
            callback: function(r) {
                if (r.message && r.message.length) {
                    r.message.forEach(d => {
                        let img_html = d.picture
                            ? `<img src="${d.picture}" style="height:40px;">`
                            : "";

                        // Sales Order clickable link
                        let so_link = d.sales_order
                            ? `<a href="/app/sales-order/${d.sales_order}" target="_blank">${d.sales_order}</a>`
                            : "";

                        let row = `<tr>
                            <td>${so_link}</td>
                            <td>${d.customer_po || ""}</td>
                            <td>${d.customer_sku || ""}</td>
                            <td>${img_html}</td>
                            <td>${d.order_qty || 0}</td>
                            <td>${d.unit_price || 0}</td>
                            <td>${d.extended_cost || 0}</td>
                            <td>${d.product_type || ""}</td>
                            <td>${d.gemstone || ""}</td>
                            <td>${d.eta || ""}</td>
                            <td>${d.latest_shipping_on || ""}</td>
                            <td>${d.export_invoice_no || ""}</td>
                            <td>${d.hawb || ""}</td>
                            <td>${d.shipped_qty || 0}</td>
                            <td>${d.invoice_date || ""}</td>
                        </tr>`;
                        table.find("tbody").append(row);
                    });

                    start += page_length;
                } else {
                    load_more_btn.hide();
                }
            }
        });
    }

    // First load
    load_orders();

    // Load More
    load_more_btn.click(() => load_orders());
};
