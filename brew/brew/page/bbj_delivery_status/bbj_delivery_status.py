import frappe
from frappe.utils import get_url

@frappe.whitelist()
def get_bbj_sales_orders(start=0, page_length=50):
    """Return BBJ Bangkok Ltd sales order items with all required fields (pagination supported)"""
    start = int(start)
    page_length = int(page_length)

    # Fetch sales order items + parent details
    items = frappe.db.sql("""
        SELECT
            so.name AS sales_order,              -- Sales Order
            so.po_no AS customer_po,             -- Customer PO
            soi.custom_customer_sku AS customer_sku,
            so.total_qty,                        -- Parent total qty
            soi.qty AS order_qty,
            soi.rate AS unit_price,
            (soi.qty * soi.rate) AS extended_cost,
            soi.item_group AS product_type,
            so.custom_main_stone AS gemstone,    -- parent field
            so.delivery_date AS eta,
            soi.custom_vendor_product_id AS vendor_product_id,
            soi.name AS so_item_name
        FROM `tabSales Order` so
        JOIN `tabSales Order Item` soi ON soi.parent = so.name
        WHERE so.company = 'BBJ Bangkok Ltd'
        ORDER BY so.creation DESC
        LIMIT %s, %s
    """, (start, page_length), as_dict=True)

    for row in items:
        # -----------------------------
        # Picture (check on SO Item, else fallback to SO)
        # -----------------------------
        file = frappe.get_all(
            "File",
            filters={
                "attached_to_doctype": "Sales Order Item",
                "attached_to_name": row["so_item_name"]
            },
            fields=["file_url"],
            order_by="creation asc",
            limit=1
        )
        if not file:
            file = frappe.get_all(
                "File",
                filters={
                    "attached_to_doctype": "Sales Order",
                    "attached_to_name": row["sales_order"]
                },
                fields=["file_url"],
                order_by="creation asc",
                limit=1
            )
        row["picture"] = get_url(file[0].file_url) if file else None

        # -----------------------------
        # Export Invoice (first invoice for this SO item)
        # -----------------------------
        inv = frappe.db.sql("""
            SELECT sii.parent AS invoice_no, si.posting_date AS invoice_date
            FROM `tabSales Invoice Item` sii
            JOIN `tabSales Invoice` si ON si.name = sii.parent
            WHERE sii.sales_order = %s AND sii.so_detail = %s
            ORDER BY si.posting_date ASC
            LIMIT 1
        """, (row["sales_order"], row["so_item_name"]), as_dict=True)

        row["export_invoice_no"] = inv[0].invoice_no if inv else ""
        row["invoice_date"] = inv[0].invoice_date if inv else ""

        # -----------------------------
        # Latest Shipping On = latest sales invoice date
        # -----------------------------
        latest_inv = frappe.db.sql("""
            SELECT MAX(si.posting_date) AS latest_date
            FROM `tabSales Invoice Item` sii
            JOIN `tabSales Invoice` si ON si.name = sii.parent
            WHERE sii.sales_order = %s AND sii.so_detail = %s
        """, (row["sales_order"], row["so_item_name"]), as_dict=True)

        row["latest_shipping_on"] = latest_inv[0].latest_date if latest_inv and latest_inv[0].latest_date else ""

        # -----------------------------
        # Shipped Qty
        # -----------------------------
        shipped = frappe.db.sql("""
            SELECT SUM(dni.qty) AS shipped
            FROM `tabDelivery Note Item` dni
            JOIN `tabDelivery Note` dn ON dn.name = dni.parent
            WHERE dni.against_sales_order = %s
              AND dni.so_detail = %s
              AND dn.docstatus = 1
        """, (row["sales_order"], row["so_item_name"]), as_dict=True)

        row["shipped_qty"] = shipped[0].shipped if shipped and shipped[0].shipped else 0

        # -----------------------------
        # HAWB (Not used)
        # -----------------------------
        row["hawb"] = ""

    return items
