import { Component, OnInit } from '@angular/core';
import { SidebarService } from 'src/app/services/sidebar.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';


export interface Invoice {
  id: number;
  invoiceNumber: string;
  vendorInvoiceDate: string;
  invoiceCreatedDate: string;
  invoiceUpdatedDate: string | null;
  editedBy: string | null;
  total: Total;
  accountDue: AccountDue;
  submitter: Submitter;
  items: Item[];
}

export interface Total {
  subTotal: string;
  adjustments: string;
  grandTotal: string;
}

export interface AccountDue {
  accountType: string;
  totalDue: string;
  paymentType: string;
}

export interface Submitter {
  submitterName: string;
  department: string;
}

export interface Item {
  refId: string;
  vendorInvoiceRef: string;
  rateOfSAR: string;
  vendorId: string;
  costCode: string;
  expenseCode: string;
  quantity: string;
  amount: string;
  unit: string;
  description: string;
  expenseType: string;
  currency: string;
  total: string;
}


@Component({
  selector: 'app-view-invoice',
  templateUrl: './view-invoice.component.html',
  styleUrls: ['./view-invoice.component.scss']
})
export class ViewInvoiceComponent implements OnInit {
  sidebarActive: boolean = true; // Sidebar initially open
  isAdmin: boolean = true; // For demonstration, assume the user is admin

  invoiceDetails: Invoice[] = [];

  invoices = [
    {
      invoiceNumber: 'TelInv-2938',
      vendorName: 'APC',
      vendorId: 'APC231',
      invoiceDate: '12-Aug-2022',
      invoiceAmount: '200$',
      recurring: 'no',
      submissionDate: '20-Aug-2022',
      submissionStatus: 'approved',
      description: 'None or anything text.'
    },
    // Add more invoices here
  ];

  constructor(private sidebarService: SidebarService, private http: HttpClient,) { }

  ngOnInit() {
    // Subscribe to the sidebar state and update layout accordingly
    this.getAllInvoice();
    this.sidebarService.sidebarActive$.subscribe((state: boolean) => {
      this.sidebarActive = state;
    });
  }

  editInvoice(invoiceNumber: string) {
    console.log('Edit invoice', invoiceNumber);
  }

  viewInvoice(invoiceNumber: string) {
    console.log('View invoice', invoiceNumber);
  }


  getAllInvoice() {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    this.http.get('http://localhost:8080/webportal/v1/invoices', { headers })
      .subscribe(
        (response: any) => {
          // Assuming the response structure as shown in the example
          console.log('Invoice details fetched successfully', response);

          // Extract the invoice data from the response
          this.invoiceDetails = response.response.map((invoice: any) => ({
            invoiceNumber: invoice.invoiceNumber,
            vendorInvoiceDate: invoice.vendorInvoiceDate,
            invoiceCreatedDate: invoice.invoiceCreatedDate,

            subTotal: invoice.total.subTotal,
            adjustments: invoice.total.adjustments,
            grandTotal: invoice.total.grandTotal,

            accountType: invoice.submitter.accountType,
            totalDue: invoice.submitter.totalDue,
            paymentType: invoice.submitter.paymentType,

            submitterName: invoice.submitter.submitterName,
            department: invoice.submitter.department,

            items: invoice.items.map((item: any) => ({
              refId: item.refId,
              vendorInvoiceRef: item.vendorInvoiceRef,
              rateOfSAR: item.rateOfSAR,
              vendorId: item.vendorId,
              costCode: item.costCode,
              quantity: item.quantity,
              expenseCode: item.expenseCode,
              amount: item.amount,
              unit: item.unit,
              expenseType: item.expenseType,
              currency: item.currency,
              total: item.total,
            }))
          }));

        },
        error => {
          console.error('Error fetching details', error);
        }
      );
  }
}