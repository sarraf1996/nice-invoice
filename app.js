const fs = require("fs");
const PDFDocument = require("pdfkit");

let niceInvoice = (invoice, path) => {
  let doc = new PDFDocument({ size: "A4", margin: 40 });

  header(doc, invoice);
  const customerInformationBottomHr = customerInformation(doc, invoice);
  invoiceTable(doc, invoice, customerInformationBottomHr);
  footer(doc, invoice);

  doc.end();
  doc.pipe(fs.createWriteStream(path));
}

let header = (doc, invoice) => {
    if (fs.existsSync(invoice.header.companyLogo)) {
        doc.image(invoice.header.companyLogo, 50, 45, { width: 50 })
        .fontSize(20)
        .text(invoice.header.companyName, 110, 57)
	    .fontSize(9)
	    .text(invoice.header.companyRegisteredMobile, 110, 77)
	    .fontSize(10)
	    .text(invoice.header.bookingId, 200, 67, { align: "right" })
        .moveDown();
    }
	else {
		doc.fontSize(20)
		.text(invoice.header.companyName, 50, 45)
		.fontSize(9)
		.text(invoice.header.companyRegisteredMobile, 50, 65)
		.fontSize(10)
		.text(invoice.header.bookingId, 200, 55, { align: "right" })
		.moveDown();
    }
}

let customerInformation = (doc, invoice) => {
    doc.fillColor("#444444")
    .fontSize(20)
    .text("Invoice", 50, 160);

    generateHr(doc, 185);

    let customerInformationLeftTop = 200, customerInformationRightTop = 200;

    doc.fontSize(10)
	.font("Helvetica")
    .text("Invoice Id:", 50, customerInformationLeftTop)
    .font("Helvetica-Bold")
    .text(invoice.invoiceId, 150, customerInformationLeftTop);
	customerInformationLeftTop = incrementCustomerInformationTop(customerInformationLeftTop);
    doc.font("Helvetica")
    .text("Billing Date:", 50, customerInformationLeftTop)
    .text(invoice.billingDate, 150, customerInformationLeftTop);
	customerInformationLeftTop = incrementCustomerInformationTop(customerInformationLeftTop);
	doc.font("Helvetica")
    .text("Customer Name:", 50, customerInformationLeftTop)
    .text(invoice.customerName, 150, customerInformationLeftTop);
	customerInformationLeftTop = incrementCustomerInformationTop(customerInformationLeftTop);
	doc.font("Helvetica")
	.text("Customer Mobile:", 50, customerInformationLeftTop)
    .text(invoice.customerMobile, 150, customerInformationLeftTop);
	customerInformationLeftTop = incrementCustomerInformationTop(customerInformationLeftTop);
	doc.font("Helvetica")
	.text("Executive Name:", 50, customerInformationLeftTop)
    .text(invoice.executiveName, 150, customerInformationLeftTop);
	customerInformationLeftTop = incrementCustomerInformationTop(customerInformationLeftTop);
	doc.font("Helvetica")
	.text("Service Type:", 50, customerInformationLeftTop)
    .text(invoice.serviceType, 150, customerInformationLeftTop);
	customerInformationLeftTop = incrementCustomerInformationTop(customerInformationLeftTop);
	doc.font("Helvetica")
	.text("Service Fixed Price:", 50, customerInformationLeftTop)
	.font("Helvetica-Bold")
    .text(invoice.serviceFixedPrice, 150, customerInformationLeftTop);
	customerInformationLeftTop = incrementCustomerInformationTop(customerInformationLeftTop);

	doc.font("Helvetica")
	.text("Vehicle Type:", 300, customerInformationRightTop)
    .text(invoice.vehicleType, 425, customerInformationRightTop);
	customerInformationRightTop = incrementCustomerInformationTop(customerInformationRightTop);
	if (invoice.vehicleNumber) {
		doc.font("Helvetica")
		.text("Vehicle Number:", 300, customerInformationRightTop)
		.text(invoice.vehicleNumber, 425, customerInformationRightTop);
		customerInformationRightTop = incrementCustomerInformationTop(customerInformationRightTop);
	}
    doc.font("Helvetica")
	.text("Vehicle Brand:", 300, customerInformationRightTop)
    .text(invoice.vehicleBrand, 425, customerInformationRightTop);
	customerInformationRightTop = incrementCustomerInformationTop(customerInformationRightTop);
	doc.font("Helvetica")
	.text("Vehicle Model:", 300, customerInformationRightTop)
    .text(invoice.vehicleModel, 425, customerInformationRightTop);
	customerInformationRightTop = incrementCustomerInformationTop(customerInformationRightTop);
	if (invoice.vehicleModelYear) {
		doc.font("Helvetica")
		.text("Vehicle Model Year:", 300, customerInformationRightTop)
		.text(invoice.vehicleModelYear, 425, customerInformationRightTop);
		customerInformationRightTop = incrementCustomerInformationTop(customerInformationRightTop);
	}
	if (invoice.vehicleFuelType) {
		doc.font("Helvetica")
		.text("Vehicle Fuel Type:", 300, customerInformationRightTop)
		.text(invoice.vehicleFuelType, 425, customerInformationRightTop);
		customerInformationRightTop = incrementCustomerInformationTop(customerInformationRightTop);
	}
	doc.font("Helvetica")
	.text("Overall Overcharge Incur:", 300, customerInformationRightTop)
	.font("Helvetica-Bold")
    .text(invoice.isOverallOverchargeIncur, 425, customerInformationRightTop);
	customerInformationRightTop = incrementCustomerInformationTop(customerInformationRightTop);
	if (invoice.totalOvercharge > 0) {
		doc.font("Helvetica")
		.text("Total Overcharge:", 300, customerInformationRightTop)
		.font("Helvetica-Bold")
		.text(`Rs. ${invoice.totalOvercharge}`, 425, customerInformationRightTop);
		customerInformationRightTop = incrementCustomerInformationTop(customerInformationRightTop);
	}
    doc.moveDown();

    const maxCustomerInformationTop = customerInformationLeftTop > customerInformationRightTop ? customerInformationLeftTop : customerInformationRightTop;
    generateHr(doc, maxCustomerInformationTop + 7);
    return maxCustomerInformationTop + 7;
}

let invoiceTable = (doc, invoice, customerInformationBottomHr) => {
    let invoiceTableTop = customerInformationBottomHr + 78;

    doc.font("Helvetica-Bold");
    tableRow(doc, invoiceTableTop, "Job Card", "Brand", "Grade", "Type", "Unit Cost", "Quantity", "Total", "Overcharge", "Table Header");
    generateHr(doc, invoiceTableTop + 20);
    invoiceTableTop = invoiceTableTop + 30;
    doc.font("Helvetica");

    for (let i = 0; i < invoice.items.length; i++) {
		const item = invoice.items[i];
		tableRow(doc, invoiceTableTop, item.jobCard, item.brand, item.grade, item.type, item.unitCost, item.quantity, item.total, item.overcharge, "Table Data");

		if (item.jobCard === "Exterior Body Wash") {
			generateHr(doc, invoiceTableTop + 32);
			invoiceTableTop = invoiceTableTop + 42;
		}
		else if (item.jobCard === "Interior Body Vacumming & Polishing") {
			generateHr(doc, invoiceTableTop + 44);
			invoiceTableTop = invoiceTableTop + 54;
		}
		else {
			generateHr(doc, invoiceTableTop + 20);
			invoiceTableTop = invoiceTableTop + 30;
		}
	}
	
    doc.font("Helvetica-Bold");
	doc.fontSize(10)
    .text("Subtotal/Estimated", 338, invoiceTableTop, { width: 96, align: "center" })
    .text(invoice.estimatedPrice, 439, invoiceTableTop, { width: 60, align: "right" });
}

let footer = (doc, invoice) => {
    if (invoice.footer.text.length !== 0) {
		doc.fontSize(10)
		.font("Helvetica")
		.text(invoice.footer.text, 50, doc.page.height - 52, { align: "center", width: doc.page.width - 100 });
	}
}

let tableRow = (doc, y, jobCard, brand, grade, type, unitCost, quantity, total, overcharge, context) => {
	if (context === "Table Header") {
		doc.fontSize(10)
		.text(jobCard, 50, y, { width: 67 })
		.text(brand, 122, y, { width: 67, align: "center" })
		.text(grade, 194, y, { width: 67, align: "center" })
		.text(type, 266, y, { width: 67, align: "center" })
		.text(unitCost, 338, y, { width: 50, align: "center" })
		.text(quantity, 393, y, { width: 41, align: "center" })
		.text(total, 439, y, { width: 40, align: "right" })
		.text(overcharge, 0, y, { align: "right" });
	}
	else {
		doc.fontSize(10)
		.text(jobCard, 50, y, { width: 67 });
		if (brand) {
			doc.font("Helvetica")
			.text(brand, 122, y, { width: 67, align: "center" });
		}
		else {
			doc.font("Helvetica")
			.text("---", 122, y, { width: 67, align: "center" });
		}
		if (grade) {
			doc.font("Helvetica")
			.text(grade, 194, y, { width: 67, align: "center" });
		}
		else {
			doc.font("Helvetica")
			.text("---", 194, y, { width: 67, align: "center" });
		}
		if (type) {
			doc.font("Helvetica")
			.text(type, 266, y, { width: 67, align: "center" });
		}
		else {
			doc.font("Helvetica")
			.text("---", 266, y, { width: 67, align: "center" });
		}
		if (unitCost) {
			doc.font("Helvetica")
			.text(unitCost, 338, y, { width: 50, align: "center" });
		}
		else {
			doc.font("Helvetica")
			.text("---", 338, y, { width: 50, align: "center" });
		}
		if (quantity) {
			doc.font("Helvetica")
			.text(quantity, 393, y, { width: 41, align: "center" });
		}
		else {
			doc.font("Helvetica")
			.text("---", 393, y, { width: 41, align: "center" });
		}
		doc.font("Helvetica")
		.text(total, 439, y, { width: 50, align: "right" });
		if (overcharge > 0) {
			doc.font("Helvetica")
			.text(`Rs. ${overcharge}`, 0, y, { align: "right" });
		}
		else {
			doc.font("Helvetica")
			.text("---", 0, y, { align: "right" });
		}
	}
}

let generateHr = (doc, y) => {
    doc.strokeColor("#aaaaaa")
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();
}

let incrementCustomerInformationTop = (value) => {
    return value + 15;
}

module.exports = niceInvoice;
