import db from '../db';
import { WorkflowService } from './workflowService';

export class TransactionService {
    /**
     * Converts a Sales Quotation into a Sales Order.
     * 1. Copies all quotation data to a new order.
     * 2. Copies all quotation items to new order items.
     * 3. Links the new order back to the quotation.
     * 4. Moves the quotation to 'converted' status.
     * 5. Initializes the new order's workflow.
     */
    static async convertQuotationToOrder(quotationId: string, userId: string, tenantId: number) {
        // 1. Fetch quotation and items
        const { data: quotation, error: quoError } = await db
            .from('sales_quotations')
            .select('*, items:sales_quotation_items(*)')
            .eq('id', quotationId)
            .eq('company_id', tenantId)
            .single();

        if (quoError || !quotation) throw new Error("Quotation not found");
        if (quotation.status === 'converted') throw new Error("Quotation already converted to order");

        // 2. Map to Sales Order
        const newOrder = {
            company_id: tenantId,
            contact_id: quotation.contact_id,
            quotation_id: quotationId,
            date: new Date().toISOString(),
            reference_no: `ORD-${quotation.reference_no.split('-')[1]}`, // Generate new ref based on quote
            subtotal: quotation.subtotal,
            tax_amount: quotation.tax_amount,
            grand_total: quotation.grand_total,
            status: 'draft',
            created_at: new Date().toISOString()
        };

        const { data: orderData, error: orderError } = await db
            .from('sales_orders')
            .insert(newOrder)
            .select('id')
            .single();

        if (orderError) throw orderError;
        const orderId = orderData.id;

        // 3. Insert items
        const newItems = (quotation.items || []).map((item: any) => ({
            order_id: orderId,
            company_id: tenantId,
            product_id: item.product_id,
            variant_id: item.variant_id,
            qty: item.qty,
            unit_price: item.unit_price,
            amount: item.amount
        }));

        const { error: itemsError } = await db.from('sales_order_items').insert(newItems);
        if (itemsError) throw itemsError;

        // 4. Update Quotation Status
        await db.from('sales_quotations').update({ status: 'converted' }).eq('id', quotationId).eq('company_id', tenantId);

        // 5. Audit Log
        await db.from('audit_logs').insert({
            company_id: tenantId,
            user_id: userId,
            entity_type: 'sales_orders',
            entity_id: orderId,
            action: 'converted_from_quotation',
            new_data: { quotation_id: quotationId }
        });

        return { orderId };
    }

    /**
     * Generates a Sales Invoice from a Sales Order.
     */
    static async generateInvoiceFromOrder(orderId: string, userId: string, tenantId: number) {
        // 1. Fetch order and items
        const { data: order, error: orderError } = await db
            .from('sales_orders')
            .select('*, items:sales_order_items(*)')
            .eq('id', orderId)
            .eq('company_id', tenantId)
            .single();

        if (orderError || !order) throw new Error("Order not found");
        if (order.status === 'invoiced') throw new Error("Order already invoiced");

        // 2. Map to Sales Invoice
        const newInvoice = {
            company_id: tenantId,
            contact_id: order.contact_id,
            order_id: orderId,
            date: new Date().toISOString(),
            reference_no: `INV-${order.reference_no.split('-')[1]}`,
            subtotal: order.subtotal,
            tax_amount: order.tax_amount,
            grand_total: order.grand_total,
            status: 'unpaid',
            created_at: new Date().toISOString()
        };

        const { data: invoiceData, error: invoiceError } = await db
            .from('sales_invoices')
            .insert(newInvoice)
            .select('id')
            .single();

        if (invoiceError) throw invoiceError;
        const invoiceId = invoiceData.id;

        // 3. Log lifecycle activity
        await db.from('audit_logs').insert({
            company_id: tenantId,
            user_id: userId,
            entity_type: 'sales_invoices',
            entity_id: invoiceId,
            action: 'generated_from_order',
            new_data: { order_id: orderId }
        });

        return { invoiceId };
    }

    /**
     * Converts a Purchase Order into a Goods Receipt Note (GRN).
     */
    static async convertPurchaseOrderToGRN(purchaseOrderId: string, userId: string, tenantId: number) {
        // 1. Fetch PO and items
        const { data: po, error: poError } = await db
            .from('purchase_orders')
            .select('*, items:purchase_order_items(*)')
            .eq('id', purchaseOrderId)
            .eq('company_id', tenantId)
            .single();

        if (poError || !po) throw new Error("Purchase Order not found");
        if (po.status === 'received') throw new Error("Purchase Order already received");

        // 2. Map to Goods Receipt (GRN)
        const newGRN = {
            company_id: tenantId,
            party_id: po.party_id,
            purchase_order_id: purchaseOrderId,
            date: new Date().toISOString(),
            grn_number: `GRN-${po.po_number.split('-')[1]}`,
            warehouse_id: po.warehouse_id || null, // Default Godown
            status: 'Draft',
            created_at: new Date().toISOString()
        };

        const { data: grnData, error: grnError } = await db
            .from('goods_receipts')
            .insert(newGRN)
            .select('id')
            .single();

        if (grnError) throw grnError;
        const grnId = grnData.id;

        // 3. Insert items
        const newItems = (po.items || []).map((item: any) => ({
            grn_id: grnId,
            company_id: tenantId,
            product_id: item.product_id,
            quantity_ordered: item.quantity,
            quantity_received: item.quantity,
            unit_price: item.unit_price,
            status: 'Pending'
        }));

        const { error: itemsError } = await db.from('goods_receipt_items').insert(newItems);
        if (itemsError) throw itemsError;

        // 4. Update PO Status
        await db.from('purchase_orders').update({ status: 'received' }).eq('id', purchaseOrderId).eq('company_id', tenantId);

        return { grnId };
    }

    /**
     * Generates a Purchase Bill from a Purchase Order.
     */
    static async generateBillFromPurchaseOrder(purchaseOrderId: string, userId: string, tenantId: number) {
        // 1. Fetch PO and items
        const { data: po, error: poError } = await db
            .from('purchase_orders')
            .select('*, items:purchase_order_items(*)')
            .eq('id', purchaseOrderId)
            .eq('company_id', tenantId)
            .single();

        if (poError || !po) throw new Error("Purchase Order not found");
        if (po.status === 'billed') throw new Error("Purchase Order already billed");

        // 2. Map to Purchase Bill
        const newBill = {
            company_id: tenantId,
            party_id: po.party_id,
            purchase_order_id: purchaseOrderId,
            date: new Date().toISOString(),
            bill_number: `BILL-${po.po_number.split('-')[1]}`,
            subtotal: po.subtotal,
            tax_amount: po.tax_amount,
            grand_total: po.grand_total,
            status: 'Draft',
            created_at: new Date().toISOString()
        };

        const { data: billData, error: billError } = await db
            .from('purchase_bills')
            .insert(newBill)
            .select('id')
            .single();

        if (billError) throw billError;
        const billId = billData.id;

        // 3. Insert items
        const newItems = (po.items || []).map((item: any) => ({
            bill_id: billId,
            company_id: tenantId,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            tax_rate: item.tax_rate,
            amount: item.amount
        }));

        const { error: itemsError } = await db.from('purchase_bill_items').insert(newItems);
        if (itemsError) throw itemsError;

        // 4. Update PO Status
        await db.from('purchase_orders').update({ status: 'billed' }).eq('id', purchaseOrderId).eq('company_id', tenantId);

        return { billId };
    }
}
