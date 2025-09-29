import frappe
from frappe.utils import get_url

@frappe.whitelist()
def get_bbj_sales_orders(start=0, page_length=50, company=None, gemstone=None,
                         metal_group=None, customer=None, department=None,
                         date=None, customer_sku=None):
    """Return sales order items with filters + pagination"""

    start = int(start)
    page_length = int(page_length)

    conditions = []
    values = [start, page_length]

    if company:
        conditions.append("so.company = %s")
        values.insert(0, company)
    if gemstone:
        conditions.append("so.custom_main_stone = %s")
        values.insert(0, gemstone)
    if metal_group:
        conditions.append("so.custom_metal_group = %s")
        values.insert(0, metal_group)
    if customer:
        conditions.append("so.customer = %s")
        values.insert(0, customer)
    if department:
        conditions.append("so.department = %s")
        values.insert(0, department)
    if date:
        conditions.append("DATE(so.transaction_date) = %s")
        values.insert(0, date)
    if customer_sku:
        conditions.append("soi.custom_customer_sku = %s")
        values.insert(0, customer_sku)

    condition_sql = " AND " + " AND ".join(conditions) if conditions else ""

    query = f"""
        SELECT
            so.name AS sales_order,
            so.po_no AS customer_po,
            soi.custom_customer_sku AS customer_sku,
            soi.qty AS order_qty,
            soi.rate AS unit_price,
            (soi.qty * soi.rate) AS extended_cost,
            soi.item_group AS product_type,
            so.custom_main_stone AS gemstone,
            so.custom_metal_group AS metal_group,
            so.delivery_date AS eta,
            soi.custom_vendor_product_id AS vendor_product_id,
            so.total_qty,
            so.company,
            soi.name AS so_item_name,
            so.custom_image_product
        FROM `tabSales Order` so
        JOIN `tabSales Order Item` soi ON soi.parent = so.name
        WHERE so.docstatus IN (0, 1) {condition_sql}
        ORDER BY so.creation DESC
        LIMIT %s, %s
    """

    items = frappe.db.sql(query, tuple(values), as_dict=True)

    for row in items:
        row["brand"] = ""

        # Picture Logic - First check attachments for images, then custom_image_product field
        picture_url = None
        
        # First try to get image from Sales Order Item attachments
        file = frappe.get_all(
            "File",
            filters={
                "attached_to_doctype": "Sales Order Item", 
                "attached_to_name": row["so_item_name"],
                "is_folder": 0
            },
            fields=["file_url", "file_name"], 
            order_by="creation asc"
        )
        
        # If no files in Sales Order Item, check Sales Order attachments
        if not file:
            file = frappe.get_all(
                "File",
                filters={
                    "attached_to_doctype": "Sales Order", 
                    "attached_to_name": row["sales_order"],
                    "is_folder": 0
                },
                fields=["file_url", "file_name"], 
                order_by="creation asc"
            )
        
        # Check if any attachment is an image
        if file:
            for f in file:
                file_name = f.get("file_name", "").lower()
                if any(ext in file_name for ext in ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg']):
                    picture_url = get_url(f.file_url)
                    break
        
        # If no image found in attachments, use custom_image_product field
        if not picture_url and row.get("custom_image_product"):
            picture_url = get_url(row["custom_image_product"])
        
        row["picture"] = picture_url

        # Invoice info
        inv = frappe.db.sql("""
            SELECT sii.parent AS invoice_no, si.posting_date AS invoice_date
            FROM `tabSales Invoice Item` sii
            JOIN `tabSales Invoice` si ON si.name = sii.parent
            WHERE sii.sales_order = %s AND sii.so_detail = %s
            ORDER BY si.posting_date ASC LIMIT 1
        """, (row["sales_order"], row["so_item_name"]), as_dict=True)

        if inv:
            row["export_invoice_no"] = inv[0].invoice_no
            row["invoice_date"] = inv[0].invoice_date
        else:
            row["export_invoice_no"] = ""
            row["invoice_date"] = ""

        # Latest Shipping
        latest_inv = frappe.db.sql("""
            SELECT MAX(si.posting_date) AS latest_date
            FROM `tabSales Invoice Item` sii
            JOIN `tabSales Invoice` si ON si.name = sii.parent
            WHERE sii.sales_order = %s AND sii.so_detail = %s
        """, (row["sales_order"], row["so_item_name"]), as_dict=True)
        row["latest_shipping_on"] = latest_inv[0].latest_date if latest_inv and latest_inv[0].latest_date else ""

        # Shipped Qty
        shipped = frappe.db.sql("""
            SELECT SUM(dni.qty)
            FROM `tabDelivery Note Item` dni
            JOIN `tabDelivery Note` dn ON dn.name = dni.parent
            WHERE dni.against_sales_order = %s AND dni.so_detail = %s AND dn.docstatus = 1
        """, (row["sales_order"], row["so_item_name"]))
        row["shipped_qty"] = shipped[0][0] or 0

        row["hawb"] = ""

    return items


@frappe.whitelist()
def get_so_bom_details(sales_order):
    so = frappe.get_doc("Sales Order", sales_order)

    result = {
        "bom_id": so.custom_item_bom,
        "bom_items": []
    }

    if so.custom_item_bom:
        bom_doc = frappe.get_doc("BOM", so.custom_item_bom)

        bom_items = bom_doc.get("custom_bom_items") or []

        if not bom_items:
            bom_items = bom_doc.get("items") or []

        for d in bom_items:
            result["bom_items"].append({
                "item_code": d.item_code,
                "description": getattr(d, "description", ""),
                "qty": d.qty,
                "uom": d.uom
            })

    return result