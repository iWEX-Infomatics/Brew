frappe.pages['bbj-delivery-status'].on_page_load = function(wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: "BBJ Delivery Status (Bulk)",
        single_column: true
    });

    let container = $('<div class="bbj-container mt-3"></div>').appendTo(page.main);

    let table = $(`<table class="table table-bordered table-striped">
        <thead>
            <tr>
                <th>Sales Order</th>
                <th>Customer SKU</th>
                <th>Product Image</th>
                <th>Vendor Product ID</th>
                <th>Delivery Date</th>
                <th>Sales Order Type</th>
                <th>Main Stone</th>
                <th>Total Qty</th>
            </tr>
        </thead>
        <tbody></tbody>
    </table>`).appendTo(container);

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
                        let img_html = d.custom_product_image
                            ? `<img src="${d.custom_product_image}" style="height:40px;">`
                            : "";

                        let row = `<tr>
                            <td>${d.name}</td>
                            <td>${d.custom_customer_sku || ""}</td>
                            <td>${img_html}</td>
                            <td>${d.custom_vendor_product_id || ""}</td>
                            <td>${d.delivery_date || ""}</td>
                            <td>${d.custom_sales_order_type || ""}</td>
                            <td>${d.custom_main_stone || ""}</td>
                            <td>${d.total_qty || 0}</td>
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

    load_orders();

    load_more_btn.click(() => load_orders());
};
