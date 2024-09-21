import { Component, OnInit } from '@angular/core';
import { SidebarService } from 'src/app/services/sidebar.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';



interface Currency {
  id: string;
  currencyName: string;
  currencySymbol: string;
}

interface ExpenseCode {
  id: string;
  code: string;
  type: string;
}

interface CostCenter {
  id: string;
  code: string;
  name: string;
}

interface Vendor {
  vendorId: string;
  name: string;
}

@Component({
  selector: 'app-add-invoice',
  templateUrl: './add-invoice.component.html',
  styleUrls: ['./add-invoice.component.scss']
})

export class AddInvoiceComponent implements OnInit {

  sidebarActive: boolean = false;
  clientName: string = '';
  invoiceDate: string = '';
  items: any[] = [
    {
      vendorInvoiceRef: '',
      vendorId: '',
      
      costCode: '',
      expenseCode: '',
      quantity: '',
      unit: '',
      rateOfSAR: '',
      description: '',
      expenceType: '',
      currency: '',
      subtotal: 0
    }
  ];

  vendors = [
    { id: '1', name: 'Vendor 1' },
    { id: '2', name: 'Vendor 2' },
    { id: '3', name: 'Vendor 3' }
  ];


  costCodes = ['CostCode1', 'CostCode2', 'CostCode3'];
  expenseCodes = ['ExpenseCode1', 'ExpenseCode2', 'ExpenseCode3'];
  units = ['PCS', 'KG', 'Litre'];
  currencies = ['USD', 'EUR', 'GBP'];

  vendorList: Vendor[] = [];
  expenseCodeList: ExpenseCode[] = [];
  costCenterList: CostCenter[] = [];
  currenciesList: Currency[] = [];

  constructor(private sidebarService: SidebarService, private http: HttpClient, private router: Router) { } // Inject HttpClient

  ngOnInit() {
    // this.getAllOtherDetails();
    let flage = localStorage.getItem("lastname");
    this.sidebarService.sidebarActive$.subscribe((state: any) => {
      this.sidebarActive = !state;
      if (flage) {
        this.sidebarActive = true;
      }
    });
  }

  addItem() {
    this.items.push({
      vendorInvoiceRef: '',
      vendorId: '',
      costCode: '',
      expenseCode: '',
      quantity: 0,
      amount: 0,
      unit: '',
      description: '',
      expenceType: '',
      currency: '',
      subtotal: 0
    });
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
  }

  calculateSubtotalAmount(): number {
    return this.items.reduce((sum, item) => sum + (item.quantity * item.amount), 0);
  }

  getGrandTotal(): number {
    return this.calculateSubtotalAmount(); // You can add more logic if needed
  }

  getAllOtherDetails() {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    this.http.get('http://localhost:8080/webportal/v1/otherdetails', { headers })
      .subscribe(
        (response: any) => {
          // Assuming the response structure as shown in the example
          console.log('Invoice Other details fetch successfully', response);

          // Extract the currencies list from the API response
          this.currenciesList = response.response.currenciesList.map((item: any) => ({
            id: item.id,
            currencyName: item.currencyName,
            currencySymbol: item.currencySymbol
          }));

          this.vendorList = response.response.currenciesList.map((item: any) => ({
            id: item.id,
            vendorId: item.vendorId,
            name: item.name
          }));

          this.expenseCodeList = response.response.currenciesList.map((item: any) => ({
            id: item.id,
            code: item.code,
            type: item.type
          }));

          this.costCenterList = response.response.currenciesList.map((item: any) => ({
            id: item.id,
            code: item.code,
            name: item.name
          }));

        },
        error => {
          console.error('Error fetching details', error);
        }
      );
  }
  showSuccessNotification: boolean = false;


  submitInvoice() {
    const invoiceData = {
      vendorInvoiceDate: this.invoiceDate,
      total: {
        subTotal: this.calculateSubtotalAmount(),
        adjustments: "0.00", // Adjust as needed
        grandTotal: this.getGrandTotal()
      },
      accountDue: {
        accountType: "Private Account", // Customize as needed
        totalDue: "$ 6657",
        paymentType: "Bank"
      },
      submitter: {
        submiterName: "Samad",
        department: "Telecom"
      },
      items: this.items.map((item, index) => ({
        refId: (index + 1).toString(), // If you have a reference ID
        vendorInvoiceRef: item.vendorInvoiceRef,
        rateOfSAR: item.rateOfSAR,
        vendorId: item.vendorId,
        costCode: item.costCode,
        expenseCode: item.expenseCode,
        quantity: item.quantity,
        amount: item.amount,
        unit: item.unit,
        description: item.description,
        expenceType: item.expenceType,
        currency: item.currency,
        total: item.quantity * item.amount
      }))
    };


    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    this.http.post('http://localhost:8080/webportal/v1/createinvoice', invoiceData, { headers })
      .subscribe(
        response => {
          // Show success notification
          this.showSuccessNotification = true;

          // Hide the notification after 3 seconds
          setTimeout(() => {
            this.showSuccessNotification = false;
            // After hiding the notification, navigate to InvoiceView
            this.router.navigate(['/InvoiceView']);
          }, 5000);
        },
        error => {
          console.error('Error submitting invoice', error);
        }
      );
  }


}
