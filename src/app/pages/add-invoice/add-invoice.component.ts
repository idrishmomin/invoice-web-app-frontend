import { Component, OnInit } from '@angular/core';
import { SidebarService } from 'src/app/services/sidebar.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonDetailsService } from 'src/app/services/common-details.service';
import { InvoiceService } from 'src/app/services/invoice.service';
import { ToastrService } from 'ngx-toastr';

interface Accounts {
  id: string;
  name: string;
  code: string;
}

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

interface Submitter {
  id: string;
  name: string;
}


interface Department {
  id: string;
  name: string;
}

interface CostCenter {
  id: string;
  code: string;
  name: string;
}

interface Vendor {
  id: string;
  vendorId: string;
  vendorName: string;
}

@Component({
  selector: 'app-add-invoice',
  templateUrl: './add-invoice.component.html',
  styleUrls: ['./add-invoice.component.scss']
})

export class AddInvoiceComponent implements OnInit {

  sidebarActive: boolean = false;

  recurrings = ['Yes', 'No'];
  vendorList: Vendor[] = [];
  expenseTypeList: ExpenseCode[] = [];
  costCenterList: CostCenter[] = [];
  accountsList: Accounts[] = [];
  currenciesList: Currency[] = [];
  submitterList: Submitter[] = [];
  departmentList: Department[] = [];
  paymentTypeList: string[] = [];
  invoiceStatus: string[] = [];
  totalInvoiceAmount: number = 0; // Variable to keep track of the total amount
  invoiceCreateFormGroup: FormGroup;

  constructor(private fb: FormBuilder, private commonService: CommonDetailsService, private invoiceService: InvoiceService, private toastr: ToastrService) {
    this.invoiceCreateFormGroup = this.fb.group({

      accountType: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],  // Allow multiple letters in client name
      paymentType: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],  // Allow multiple letters in client name
      submitter: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],  // Allow multiple letters in client name
      department: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],  // Allow multiple letters in client name

      billTo: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],  // Allow multiple letters in client name
      paymentDueDate: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],  // Allow multiple letters in client name
      vendorBankDetails: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],  // Allow multiple letters in client name

      items: this.fb.array([this.itemFormGroup()]),  // Initialize the form array with one item,
      invoiceTotal: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],  // Allow multiple letters in client name
      adjustments: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],  // Allow multiple letters in client name

    });
  }

  ngOnInit(): void {
    this.getCommonDetailsData();
  }

  // Getter for clientName
  get clientName() {
    return this.invoiceCreateFormGroup.get('clientName');
  }

  // Getter for accountType
  get accountType() {
    return this.invoiceCreateFormGroup.get('accountType');
  }

  get submitterName() {
    return this.invoiceCreateFormGroup.get('submitter');
  }

  get departmentName() {
    return this.invoiceCreateFormGroup.get('department');
  }

  get billTo() {
    return this.invoiceCreateFormGroup.get('billTo');
  }

  get paymentDueDate() {
    return this.invoiceCreateFormGroup.get('paymentDueDate');
  }

  get adjustments() {
    return this.invoiceCreateFormGroup.get('adjustments');
  }

  // Getter for paymentType
  get paymentType() {
    return this.invoiceCreateFormGroup.get('paymentType');
  }

  // Getter for the FormArray (items)
  get items(): FormArray {
    return this.invoiceCreateFormGroup.get('items') as FormArray;
  }

  // Method to create a new FormGroup for an item
  itemFormGroup(): FormGroup {
    return this.fb.group({
      vendorInvoiceRef: ['', Validators.required],
      vendorName: ['', Validators.required],
      vendorId: ['', Validators.required], //
      vendorInvoiceDate: ['', Validators.required],
      costCode: ['', Validators.required],
      expenseType: ['', Validators.required],
      description: ['', Validators.required],
      rateOfSAR: ['', Validators.required],
      currency: ['', Validators.required],
      recurring: ['', Validators.required],
      invoiceAmount: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],  // Pattern for numeric values
      invoiceTotal: [{ value: '', disabled: true }], // Disabled field, calculated value
    });
  }


  onVendorChange(event: Event, item: AbstractControl): void {
    const selectedVendor = (event.target as HTMLSelectElement).value; // Get the selected vendor object

    console.log(`Vendor Name----------------: ${selectedVendor}`); // Print the vendorId

    const vendor = this.vendorList.find(v => v.vendorName === selectedVendor); // Find the vendor by name
    if (vendor) {
      item.get('vendorId')?.setValue(vendor.vendorId); // Set the vendorId in the FormGroup
    }
  }


  onDateChange(event: Event, item: AbstractControl): void {
    const input = event.target as HTMLInputElement;
    const selectedDate = input.value; // This will be in YYYY-MM-DD format
    // Perform any modifications to the date as needed
    item.get('vendorInvoiceDate')?.setValue(selectedDate); // Update the FormGroup with the modified date
  }

  paymentDueDateType(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selectedDate = input.value; // This will be in YYYY-MM-DD format
    this.paymentDueDate?.setValue(selectedDate);
  }

  // Method to calculate the total invoice amount
  getTotalInvoiceAmount(): number {
    const items = this.items.value; // Get the array of items
    let total = 0;

    // Loop through each item and add the invoiceAmount value
    items.forEach((item: any) => {
      const amount = parseFloat(item.invoiceTotal); // Parse the value as float
      if (!isNaN(amount)) {
        total += amount; // Add to the total if it's a valid number
      }
    });
    return total; // Return the total sum
  }



  // Method to calculate the total invoice amount for the current row (recurring * rateofSAR)
  getTotalInvoiceAmountForRow(item: AbstractControl): void {
    const invoiceAmount = parseFloat(item.get('invoiceAmount')?.value) || 0; // Fallback to 0
    const rateOfSAR = parseFloat(item.get('rateOfSAR')?.value) || 0; // Fallback to 0

    const total = invoiceAmount * rateOfSAR;
    item.get('invoiceTotal')?.setValue(total); // Store the total in invoiceTotal
  }



  // Method to add a new item to the FormArray
  addItem(): void {
    this.items.push(this.itemFormGroup());
    // Update the total whenever a new item is added
    this.totalInvoiceAmount = this.getTotalInvoiceAmount();
  }

  // Method to remove an item from the FormArray
  removeItem(index: number): void {
    const removedItem = this.items.at(index); // Get the item to be removed
    const amount = parseFloat(removedItem.get('invoiceAmount')?.value); // Get the invoice amount of the removed item

    if (!isNaN(amount)) {
      this.totalInvoiceAmount -= amount; // Subtract the amount from the total
    }

    this.items.removeAt(index); // Remove the item at the specified index
  }


  prepareItemsData(): any[] {
    return this.items.controls.map((item: AbstractControl) => {
      const formGroup = item as FormGroup;

      if (formGroup) {
        return {
          vendorInvoiceRef: formGroup.get('vendorInvoiceRef')?.value || '',
          vendorId: formGroup.get('vendorId')?.value || 'V1',
          vendorName: formGroup.get('vendorName')?.value || '',
          vendorInvoiceDate: formGroup.get('vendorInvoiceDate')?.value || '',
          costCode: formGroup.get('costCode')?.value || '',
          expenseType: formGroup.get('expenseType')?.value || '',
          description: formGroup.get('description')?.value || 'test',
          rateOfSAR: formGroup.get('rateOfSAR')?.value || '1.00',
          currency: formGroup.get('currency')?.value || 'USD',
          invoiceAmount: formGroup.get('invoiceAmount')?.value || '',
          recurring: formGroup.get('recurring')?.value || 'NO',
          invoiceTotal: formGroup.get('invoiceTotal')?.value || 0,
        };
      } else {
        // Handle the case where formGroup is null, if necessary
        return null; 
      }
    }).filter(item => item !== null); // Filter out any null entries
  }


  // Method to submit the invoice form
  submitInvoice() {
    console.log(this.items);
    const totalInvoiceAmount = this.getTotalInvoiceAmount(); // Calculate the total amount

    const requestData = {
      invoiceNumber: '',  // Dummy value for invoice number
      total: {
        subTotal: totalInvoiceAmount.toString(),  // Use the calculated totalInvoiceAmount
        adjustments: this.adjustments?.value,  // Dummy value for adjustments
        grandTotal: '$' + (totalInvoiceAmount + this.adjustments?.value).toString(),  // Example dummy value for grand total (just for illustration)
      },
      accountDetails: {
        accountType: this.accountType?.value || 'Private Account',  // Use form value, or a dummy value
        paymentType: this.paymentType?.value || 'Bank',  // Use form value, or a dummy value
      },
      submitter: {
        submitterName: this.submitterName?.value,
        department: this.departmentName?.value,
      },

      vendorDetails: {
        billTo: this.billTo?.value,
        paymentDue: this.paymentDueDate?.value,
        vendorBankDetails: this.departmentName?.value || 'Refer Invoice',
      },

      invoiceStatus: "PENDING", // TODO
      createdBy: "ADMIN",  // TODO pass value from session name

      items: this.prepareItemsData(),
    };

    console.log(requestData);  // Log the final requestData JSON object

    this.invoiceService.createInvoice(requestData).subscribe((response: any) => {
      console.log(response);
      this.toastr.success('Invoice Created successFully with  invoice id ' + response.response.invoiceNumber, 'Success', {
        timeOut: 300000, // Optional - already set in forRoot
      });
      this.invoiceCreateFormGroup.reset();
    }, (error: any) => {
      console.error('Error fetching details:', error);
      this.toastr.error('Something went wrong.', 'Error');

    })


  }

  getCommonDetailsData() {
    this.commonService.getAllOtherDetails().subscribe(
      (response: any) => {
        this.costCenterList = response.response.costCenterList;
        this.expenseTypeList = response.response.expenseCodesList;
        this.currenciesList = response.response.currenciesList;
        this.accountsList = response.response.accountsList;
        this.departmentList = response.response.departmentList;
        this.paymentTypeList = response.response.paymentType;
        this.invoiceStatus = response.response.invoiceStatus;
        this.submitterList = response.response.submitterList;
        this.vendorList = response.response.vendorList;

      },
      (error: any) => {
        console.error('Error fetching details:', error);
      }
    );
  }
}