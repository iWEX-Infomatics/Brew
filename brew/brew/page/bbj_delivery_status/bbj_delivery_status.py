import frappe
from frappe.utils import get_url

@frappe.whitelist()
def get_bbj_sales_orders(start=0, page_length=50):
    """BBJ Bangkok Ltd के Sales Orders return करेगा, pagination support + parent.total_qty के साथ"""
    start = int(start)
    page_length = int(page_length)

    orders = frappe.get_all(
        "Sales Order",
        filters={"company": "BBJ Bangkok Ltd"},
        fields=[
            "name",
            "custom_customer_sku",
            "custom_vendor_product_id",
            "delivery_date",
            "custom_sales_order_type",
            "custom_main_stone",
            "total_qty"
        ],
        start=start,
        page_length=page_length,
        order_by="creation desc"
    )

    for o in orders:
        # Sales Order की पहली attachment (image)
        file = frappe.get_all(
            "File",
            filters={
                "attached_to_doctype": "Sales Order",
                "attached_to_name": o["name"]
            },
            fields=["file_url"],
            order_by="creation asc",
            limit=1
        )
        o["custom_product_image"] = get_url(file[0].file_url) if file else None

    return orders
