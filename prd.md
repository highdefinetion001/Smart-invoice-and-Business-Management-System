PRD — Smart Invoice & Business Management System
1. Project Overview
Smart Invoice & Business Management System is an internal, owner-only web application for managing materials, customers, invoices, payments, expenses, and business reports.

The system is designed primarily around one workflow:

Add materials + define their rates → create an invoice → enter customer-specific dimensions → automatically calculate quantity/area and price → apply discount/GST → generate PDF invoice → track payment.

There will be no customer portal or customer login in the initial version.

The application should have a clean, professional dashboard using Next.js + shadcn/ui, with a layout similar to the provided invoice screenshot.

2. Technology Stack
Frontend
Next.js

TypeScript

Tailwind CSS

shadcn/ui

React Hook Form

Zod for validation

Backend
Spring Boot

Java

REST API

Spring Security

JWT authentication

Database
MySQL

PDF Generation
Use OpenHTMLtoPDF or iText on the Spring Boot backend.

Recommendation: OpenHTMLtoPDF for the first version because invoice templates can be created using HTML/CSS and converted into PDFs.

3. User Roles
Owner/Admin
Only one application interface is required.

The owner can:

Log in

Manage materials

Manage customers

Create invoices

Edit invoices

Delete/cancel invoices

Record payments

Manage expenses

View sales

View outstanding payments

Generate/download PDFs

View business reports

There is no customer-facing interface.

4. Core Business Concept
The most important entity is Material.

Instead of having complicated product costing such as:

Labour cost

Manufacturing cost

Processing cost

Profit margin

Other production costs

the system should keep the pricing model simple.

Material
Each material should have:

Field	Example
Material Name	Acrylic Sheet
Material Code	ACR-001
Rate	₹150
Rate Unit	sq.ft
Description	5mm transparent acrylic
Status	Active/Inactive

The owner can create as many materials as needed.

5. Material Rate System
The owner should be able to define how a material is priced.

For example:

Material
Acrylic Sheet

Rate:

₹150 / sq.ft

When creating an invoice, the owner selects:

Acrylic Sheet

Then enters the dimensions required by the customer.

Example:

Width: 4 ft
Length: 6 ft

The system automatically calculates:

Area = Width × Length

Area = 4 × 6
Area = 24 sq.ft

Then:

Price = Area × Material Rate

Price = 24 × ₹150

Price = ₹3,600

The invoice line should therefore show:

Acrylic Sheet
4 ft × 6 ft
24 sq.ft × ₹150
₹3,600

6. Supported Measurement Units
The initial system should support:

Sq. ft

Sq. m

Running ft

Piece

Kg

Meter

Custom unit

However, the dimension-based calculation is the primary workflow.

For example:

Square Feet
Width × Length × Rate

Piece
Quantity × Rate

Running Feet
Length × Rate

The calculation method should depend on the material's configured unit.

7. Owner Dashboard
After login, the owner lands on a dashboard.

Dashboard Cards
Show:

Total Sales

Total Invoices

Paid Amount

Pending Amount

Total Expenses

Current Month Sales

Example:

┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ Total Sales    │ │ Pending        │ │ Paid           │
│ ₹2,45,000      │ │ ₹52,000        │ │ ₹1,93,000      │
└────────────────┘ └────────────────┘ └────────────────┘

┌────────────────┐ ┌────────────────┐
│ Total Expenses │ │ Invoices       │
│ ₹72,500        │ │ 48             │
└────────────────┘ └────────────────┘

Dashboard Charts
Include:

Sales by month

Payments received

Pending payments

Expenses by category

8. Material Management
Material List
Route:

/materials

Display:

Material	Code	Rate	Unit	Status	Actions
Acrylic Sheet	ACR-001	₹150	Sq.ft	Active	Edit/Delete
PVC Board	PVC-001	₹90	Sq.ft	Active	Edit/Delete

Actions
Add Material

Edit Material

Delete Material

Activate/Deactivate

Search

Filter

9. Add Material
Form:

Basic Information
Material Name

Acrylic Sheet

Material Code

ACR-001

Rate

150

Unit

Square Feet

Description

5mm transparent acrylic sheet

Calculation Type
○ Dimensions
○ Quantity

For dimension-based materials:

Width × Length × Rate

For quantity-based materials:

Quantity × Rate

10. Customer Management
Although customers do not have their own portal, the owner needs to maintain customer records.

Route:

/customers

Customer fields
Customer Name

Phone Number

Email

Address

GST Number (optional)

Notes

Customer actions
Add

Edit

Delete

View customer

View invoices

View outstanding amount

View payment history

11. Invoice Management
Route:

/invoices

Invoice list
Invoice	Customer	Date	Amount	Paid	Due	Status
INV-001	ABC Pvt Ltd	27/09/2026	₹12,500	₹12,500	₹0	Paid
INV-002	XYZ Ltd	27/09/2026	₹8,500	₹3,000	₹5,500	Partial

Filters
All

Paid

Partially Paid

Pending

Overdue

Date range

12. Create Invoice
This is the core screen of the application.

The provided screenshot should be used as the general UI direction.

Route:

/invoices/new

Invoice Header
Customer
Dropdown/search:

Select or add customer

Invoice Date
27-09-2026

Due Date
10-10-2026

Payment Terms
Net 15

13. Invoice Line Items
The owner can add multiple materials.

Example
┌────────────────────────────────────────────────────────────┐
│ Material                                                    │
│ [ Acrylic Sheet                              ▼ ]           │
│                                                            │
│ Width          Length         Unit          Rate           │
│ [ 4 ]          [ 6 ]          Sq.ft        ₹150           │
│                                                            │
│ Specifications                                             │
│ [ 5mm transparent acrylic                         ]        │
│                                                            │
│ Qty / Area: 24 sq.ft                         ₹3,600        │
└────────────────────────────────────────────────────────────┘

                         + Add Item

14. Automatic Dimension Calculation
When the owner enters:

Width = 4
Length = 6
Rate = ₹150

the system immediately calculates:

4 × 6 = 24 sq.ft

24 × ₹150 = ₹3,600

The owner should not manually enter the calculated price.

Formula
area = width × length

lineTotal = area × rate

15. Multiple Invoice Items
An invoice can contain multiple materials.

Example:

Item 1
Acrylic Sheet
4 × 6 ft
24 sq.ft
₹150/sq.ft
₹3,600

Item 2
PVC Board
3 × 4 ft
12 sq.ft
₹90/sq.ft
₹1,080

Invoice subtotal
₹4,680

16. Invoice Summary
The right side of the invoice creation page should have a sticky summary panel, similar to the supplied screenshot.

Cost Summary

Line Items                 ₹4,680

Subtotal                   ₹4,680

Discount
[ Fixed ▼ ] [ 0 ]

Discount Amount            - ₹0

Tax (GST)
[ ✓ ]

GST %                      18%

GST Amount                 + ₹842.40

──────────────────────────────

Total                      ₹5,522.40

17. Discount
Support two discount types:

Fixed
Discount: ₹500

Percentage
Discount: 10%

Calculation:

Subtotal = ₹10,000

10% discount = ₹1,000

Taxable amount = ₹9,000

18. GST / Tax
GST should be configurable.

Default:

GST: 18%

The owner can:

Enable/disable GST

Change GST percentage

Example:

Subtotal       ₹10,000
Discount       ₹1,000
Taxable        ₹9,000
GST 18%        ₹1,620
────────────────────
Total          ₹10,620

The exact tax calculation should be clearly stored on the invoice so that historical invoices do not change if the default GST rate is changed later.

19. Invoice Notes
Support:

Customer Notes
Material will be delivered within 5 working days.

Internal Notes
Customer requested urgent delivery.

Internal notes should not appear on the customer-facing PDF.

20. Save Invoice
Buttons:

Cancel
Save Draft
Save Invoice

After saving:

Invoice #INV-0001

The owner can then:

View

Edit

Download PDF

Print

Record payment

Cancel invoice

21. Invoice PDF
The generated PDF should look professional and suitable for sending/printing.

Example structure:

                 COMPANY NAME
             Address / Phone / GSTIN

------------------------------------------------

INVOICE

Invoice No: INV-0001
Date: 27/09/2026
Due Date: 10/10/2026

BILL TO

Customer Name
Address
Phone
GSTIN

------------------------------------------------

Item        Dimensions     Qty      Rate      Amount

Acrylic     4 × 6 ft       24       ₹150      ₹3,600
PVC Board   3 × 4 ft       12       ₹90       ₹1,080

------------------------------------------------

                         Subtotal    ₹4,680
                         Discount    ₹500
                         GST 18%     ₹752.40
                         ---------------------
                         TOTAL       ₹4,932.40

Payment Status: PARTIALLY PAID

------------------------------------------------

Notes:
Thank you for your business.

The company details should be configurable in:

Settings → Business Profile

22. Payment Management
The owner can record payments against invoices.

Record Payment
Invoice: INV-0001

Invoice Amount: ₹10,000
Paid: ₹4,000
Outstanding: ₹6,000

Payment Amount:
[ ₹2,000 ]

Payment Method:
[ Cash ▼ ]

Payment Date:
[ 27-09-2026 ]

Reference:
[ Optional ]

[ Record Payment ]

Payment methods
Cash

UPI

Bank Transfer

Card

Cheque

Other

23. Payment Status
Automatically determine:

Unpaid
Paid = ₹0

Partially Paid
0 < Paid < Total

Paid
Paid = Total

The owner should not manually set the status.

24. Expense Management
Route:

/expenses

The owner can record business expenses.

Expense fields
Expense title

Category

Amount

Date

Description

Payment method

Attachment (optional)

Example:

Electricity        ₹4,500
Transport          ₹2,000
Material Purchase  ₹25,000
Office Expense     ₹1,500

25. Reports
Route:

/reports

Sales Report
Show:

Total sales

Number of invoices

Paid amount

Pending amount

Discounts

GST collected

Expense Report
Show:

Total expenses

Expense by category

Monthly expenses

Profit/Business Summary
A simple business summary can show:

Sales
- Expenses
----------------
Net Business Amount

This should be presented as a financial summary rather than trying to calculate detailed manufacturing profit, since the simplified system does not track labour/manufacturing costs.

26. Invoice Search
Allow searching by:

Invoice number

Customer name

Customer phone

Date

Example:

[ Search invoices... ]

27. Dashboard Navigation
Recommended sidebar:

Smart Invoice
────────────────────

Dashboard

Sales
  Invoices
  Payments

Customers

Materials

Expenses

Reports

────────────────────

Settings

Business Profile

Logout

Keep the navigation simple. Do not add unnecessary modules such as inventory warehouses, employee management, customer portals, subscriptions, etc. in the first version.

28. Settings
Business Profile
Owner can configure:

Business name

Logo

Address

Phone

Email

GSTIN

Invoice prefix

Default GST rate

Invoice footer

Bank details

UPI details

Example:

Invoice Prefix: INV

Default GST: 18%

Payment Terms:
Net 15

29. Database Structure
Recommended core tables:

users
id
name
email
password_hash
created_at
updated_at

materials
id
name
code
rate
unit
calculation_type
description
is_active
created_at
updated_at

customers
id
name
phone
email
address
gst_number
notes
created_at
updated_at

invoices
id
invoice_number
customer_id
invoice_date
due_date
subtotal
discount_type
discount_value
discount_amount
tax_rate
tax_amount
total_amount
paid_amount
status
customer_notes
internal_notes
created_at
updated_at

invoice_items
id
invoice_id
material_id
material_name
rate
unit
width
length
quantity
calculated_area
line_total
specifications

Important: Store material_name and rate on the invoice item as a snapshot.

That means if the owner later changes:

Acrylic Sheet
₹150 → ₹180

old invoices still show:

₹150

rather than changing historical invoice values.

payments
id
invoice_id
amount
payment_date
payment_method
reference
notes
created_at

expenses
id
title
category
amount
expense_date
payment_method
description
created_at

business_settings
id
business_name
logo
address
phone
email
gst_number
invoice_prefix
default_tax_rate
invoice_footer
bank_details
upi_details

30. API Structure
Spring Boot REST API:

/api/auth
/api/materials
/api/customers
/api/invoices
/api/invoices/{id}
/api/invoices/{id}/payments
/api/payments
/api/expenses
/api/reports
/api/settings

Example:

POST /api/materials
GET /api/materials
PUT /api/materials/{id}
DELETE /api/materials/{id}

Invoice:

POST /api/invoices
GET /api/invoices
GET /api/invoices/{id}
PUT /api/invoices/{id}
DELETE /api/invoices/{id}
GET /api/invoices/{id}/pdf

Payments:

POST /api/invoices/{id}/payments
GET /api/invoices/{id}/payments

31. Important Invoice Calculation Logic
The calculation should happen consistently on the backend as the source of truth.

For a dimension-based item:

area = width × length

line_total = area × rate

For quantity-based items:

line_total = quantity × rate

Then:

subtotal = sum(line_total)

Discount:

taxable_amount = subtotal - discount_amount

GST:

tax_amount = taxable_amount × tax_rate / 100

Final:

total = taxable_amount + tax_amount

Example:

Width = 5
Length = 8
Rate = ₹100

Area = 40 sq.ft

Line total = ₹4,000

Discount = ₹200

Taxable = ₹3,800

GST 18% = ₹684

Final = ₹4,484

32. UI/UX Requirements
Use shadcn/ui components throughout.

Important components:

Button

Input

Select

Combobox

Date Picker

Dialog

Dropdown Menu

Table

Card

Badge

Tabs

Toast

Sheet

Alert Dialog

Form

Command

Design
Clean white/neutral background

Rounded cards

Subtle borders

Minimal shadows

Professional typography

Responsive layout

Desktop-first but tablet-friendly

The invoice creation page should closely follow the structure of the screenshot you provided:

Large invoice form on the left + sticky cost summary on the right.

33. Invoice Creation UX
The flow should be extremely quick:

Create Invoice
      ↓
Select Customer
      ↓
Select Material
      ↓
Enter Width
      ↓
Enter Length
      ↓
System calculates area
      ↓
System calculates price
      ↓
Add another material if needed
      ↓
Apply discount/GST
      ↓
Save Invoice
      ↓
Generate PDF
      ↓
Record payment

The owner should not have to manually calculate anything.

34. MVP Scope
Phase 1 — Required
Authentication

Owner login

Materials

Add

Edit

Delete

Rate

Unit

Calculation type

Customers

Add

Edit

Delete

Search

Invoices

Create

Multiple line items

Dimensions

Automatic calculation

Discount

GST

Notes

Save/edit/delete

Payments

Record payment

Payment status

Payment history

PDF

Generate invoice PDF

Download

Print

Dashboard

Sales

Pending payments

Paid payments

Invoice count

Expenses

Add

Edit

Delete

List

35. Phase 2
Can be added later:

Advanced reports

Excel/CSV export

Recurring invoices

WhatsApp invoice sharing

Email invoices

Payment reminders

Material rate history

Multiple businesses

Multiple users

Audit logs

Barcode/QR support

Inventory/stock management

These should not complicate the MVP.

36. Final Product Definition
The application should essentially be:

A simple owner-side business invoicing system where the owner maintains material rates and creates dimension-based invoices automatically.

The central workflow is:

MATERIAL
   │
   ├── Name
   ├── Code
   ├── Rate
   └── Unit
        │
        ▼
   CREATE INVOICE
        │
        ├── Customer
        │
        ├── Material
        │
        ├── Width
        ├── Length
        │
        ▼
   Width × Length
        │
        ▼
   Area / Quantity
        │
        ▼
   Area × Rate
        │
        ▼
   Line Total
        │
        ▼
   Subtotal
        │
        ├── Discount
        └── GST
        │
        ▼
   FINAL TOTAL
        │
        ▼
   INVOICE PDF
        │
        ▼
   PAYMENT TRACKING
