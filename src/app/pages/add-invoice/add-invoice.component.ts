import { Component, OnInit } from '@angular/core';
import { AbstractControl, Form, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonDetailsService } from 'src/app/services/common-details.service';
import { InvoiceService } from 'src/app/services/invoice.service';
import { ToastrService } from 'ngx-toastr';
import { getLoginUserEmail } from 'src/app/utils/jwt-util';
import { ExpenseTypeModalComponent } from 'src/app/components/expense-type-modal/expense-type-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';


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
  category: string;
  expenseCode: string;
  expenseName: string;
}

interface Submitter {
  id: string;
  name: string;
}


interface Department {
  id: string;
  departmentName: string;
  departmentManager: string;
  submitter: string;

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
  bankDetails: BankDetails;
}

interface BankDetails {
  bankName: string;
  ibanNumber: string;
  bankAddress: string;
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
  subTotalAmount: number = 0;
  invoiceCreateFormGroup: FormGroup;

  defaultBankDetails: BankDetails = {
    bankName: '', 
    ibanNumber: '',
    bankAddress: ''
  };

  selectedVendorBankDetails: BankDetails = this.defaultBankDetails;

  expenseTypeCategories: string[] = []; // List of categories
  expenseTypeByCategory: Map<string, ExpenseCode[]> = new Map(); // Category-ExpenseType Map
  constructor(private fb: FormBuilder,
    private commonService: CommonDetailsService,
    private invoiceService: InvoiceService,
    private userService: UserService,
    private toastr: ToastrService,
    private router: Router,
    public dialog: MatDialog) {
    this.invoiceCreateFormGroup = this.fb.group({
      invoiceNumber: [''],
      invoiceStatus: [''],
      accountType: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],  // Allow multiple letters in client name
      paymentType: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],  // Allow multiple letters in client name
      submitter: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],  // Allow multiple letters in client name
      department: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],  // Allow multiple letters in client name

      billTo: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],  // Allow multiple letters in client name
      paymentDueDate: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],  // Allow multiple letters in client name
      vendorBankDetails: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],  // Allow multiple letters in client name

      items: this.fb.array([this.itemFormGroup()]),  // Initialize the form array with one item,
      adjustments: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],  // Allow multiple letters in client name
      subTotalAmount: [{ value: this.subTotalAmount, disabled: true }],

    });
  }

  

  ngOnInit(): void {
    this.getCommonDetailsData();
    this.getUserDetails();
  }

  openExpenseTypeDialog(item: any): void {
    const dialogRef = this.dialog.open(ExpenseTypeModalComponent, {
      width: '400px',
      data: {
        categories: this.expenseTypeCategories,
        expenseTypeByCategory: this.expenseTypeByCategory
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Set the selected expense code into the form control
        item.get('expenseType').setValue(result.expenseCode);
      }
    });
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

  get vendorBankDetails() {
    return this.invoiceCreateFormGroup.get('vendorBankDetails');
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

  get invoiceNumber() {
    return this.invoiceCreateFormGroup.get('invoiceNumber');
  }

  get invoiceStatusValue() {
    return this.invoiceCreateFormGroup.get('invoiceStatus');
  }
  // Getter for paymentType
  get paymentType() {
    return this.invoiceCreateFormGroup.get('paymentType');
  }

  // Getter for the FormArray (items)
  get items(): FormArray {
    return this.invoiceCreateFormGroup.get('items') as FormArray;
  }

  bankDetailsFormGroup(): FormGroup {
    return this.fb.group({
      bankName: ['', Validators.required],
      ibanNumber: ['', Validators.required],
      bankAddress: ['', Validators.required],
    })
  };


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
      rateOfSAR: ['1.00', Validators.required],
      currency: ['SAR', Validators.required],
      recurring: ['', Validators.required],
      invoiceAmount: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],  // Pattern for numeric values
      invoiceTotal: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
    });
  }


  onVendorChange(event: Event, item: AbstractControl): void {
    const selectedVendor = (event.target as HTMLSelectElement).value;

    const vendor = this.vendorList.find(v => v.vendorName === selectedVendor);
    if (vendor) {
      item.get('vendorId')?.setValue(vendor.vendorId);
    }
  }

  userDetails: any;

  getUserDetails() {
    let loggedInEmail = getLoginUserEmail();
    this.userService.getUserDetails(loggedInEmail).subscribe(
      (response: any) => {
        this.userDetails = response.data.userDetails;
      },
      (error: any) => {
        console.error('Error fetching user details:', error);
        this.toastr.error('Something went wrong.', 'Error');
      }
    );
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

  getTotalInvoiceAmount(): number {
    const items = this.items.value; // Get the array of items
    let total = 0;

    // Loop through each item and add the invoiceTotal value
    items.forEach((item: any) => {
      const amount = parseFloat(item.invoiceTotal);
      if (!isNaN(amount)) {
        total += amount;
      }
    });

    total = parseFloat(total.toFixed(2));
    this.subTotalAmount = total;
    this.invoiceCreateFormGroup.get('subTotalAmount')?.setValue(total.toFixed(2)); // Store as a string to retain ".00"

    return total;
  }


  // Method to calculate the total invoice amount for the current row (recurring * rateofSAR)
  getTotalInvoiceAmountForRow(item: AbstractControl): void {
    const invoiceAmount = parseFloat(item.get('invoiceAmount')?.value) || 0; // Fallback to 0
    const rateOfSAR = parseFloat(item.get('rateOfSAR')?.value) || 1.00; // Fallback to 0

    if (!isNaN(invoiceAmount) && !isNaN(rateOfSAR)) {
      // const total = invoiceAmount * rateOfSAR;
      const total = (invoiceAmount * rateOfSAR).toFixed(2); // Ensure 2 decimal places
      item.get('invoiceTotal')?.setValue(total);
    } else {
      console.warn("Invalid values for invoiceAmount or rateOfSAR in row:", item.value);
    }

    // Update the overall total whenever an item's total changes
    this.getTotalInvoiceAmount();
  }



  // Method to add a new item to the FormArray
  addItem(): void {
    this.items.push(this.itemFormGroup());
    // Update the total whenever a new item is added
    this.subTotalAmount = this.getTotalInvoiceAmount();
  }

  // Method to remove an item from the FormArray
  removeItem(index: number): void {
    const removedItem = this.items.at(index); // Get the item to be removed
    const amount = parseFloat(removedItem.get('invoiceAmount')?.value); // Get the invoice amount of the removed item

    if (!isNaN(amount)) {
      this.subTotalAmount -= amount; // Subtract the amount from the total
    }

    this.items.removeAt(index); // Remove the item at the specified index
  }

  navigateToInvoiceView(): void {
    this.router.navigate(['/InvoiceView']);
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
  saveInvoice() {
    const submitterValue = `${this.userDetails.name} ${this.userDetails.surname}`;
    const department = this.userDetails.department;
    const totalInvoiceAmount = this.getTotalInvoiceAmount();

    const requestData = {
      invoiceNumber: '',
      total: {
        subTotal: totalInvoiceAmount.toFixed(2).toString(),
        adjustments: parseFloat(this.adjustments?.value || 0.00).toFixed(2), 
        grandTotal: (totalInvoiceAmount + parseFloat(this.adjustments?.value || 0)).toFixed(2),
      },
      accountDetails: {
        accountType: this.accountType?.value || 'Private Account',
        paymentType: this.paymentType?.value || 'Bank',
      },
      submitter: {
        submitterName: submitterValue,
        department: department,
      },

      vendorDetails: {
        billTo: this.billTo?.value,
        paymentDue: this.paymentDueDate?.value,
        vendorBankDetails: this.selectedVendorBankDetails,
      },

      invoiceStatus: this.invoiceStatus[0],
      createdBy: getLoginUserEmail(),
      items: this.prepareItemsData(),
    };

    this.invoiceService.createInvoice(requestData).subscribe((response: any) => {
      this.toastr.success('Invoice Created successFully with  invoice id ' + response.invoiceNumber, 'Success', {
        timeOut: 5000, // Optional - already set in forRoot
      });
      this.router.navigate(['/InvoiceView']);
    }, (error: any) => {
      console.error('Error fetching details:', error);
      this.toastr.error(error.error, 'VALIDATION', {
        timeOut: 5000,
      });

    })
  }

  isVendorInvoiceRefAlreadyExistMessage = "";
  isVendorInvoiceRefAlreadyExist(e: any) {
    let vendorInvoiceRef = e.target.value;
    if (vendorInvoiceRef !== "") {
      this.invoiceService.isVendorInvoiceRefAlreadyExist(vendorInvoiceRef).subscribe((response: any) => {
        this.isVendorInvoiceRefAlreadyExistMessage = response.response;
      })
    }
  }

  getCommonDetailsData() {
    this.commonService.getAllOtherDetails().subscribe(
      (response: any) => {
        this.costCenterList = response.costCenterList;
        this.expenseTypeList = response.expenseCodesList;
        this.currenciesList = response.currenciesList;
        this.accountsList = response.accountsList;
        this.departmentList = response.departmentList;
        this.paymentTypeList = response.paymentType;
        this.invoiceStatus = response.invoiceStatus;
        this.submitterList = response.submitterList;
        this.vendorList = response.vendorList;
        this.expenseTypeByCategory = new Map<string, ExpenseCode[]>(
          Object.entries(response.expenseTypeByCategory)
        );
        this.expenseTypeCategories = Array.from(this.expenseTypeByCategory.keys());
      },
      (error: any) => {
        console.error('Error fetching details:', error);
      }
    );
  }

  // onVendorChangeEvent(e: any) {
  //   this.selectedVendorBankDetails = this.vendorList.find(data => data.vendorName === e.target.value)?.bankDetails;
  //   this.vendorBankDetails?.setValue(this.selectedVendorBankDetails);
  //   console.log(this.selectedVendorBankDetails);
  // }

  onVendorChangeEvent(e: any) {
    const foundDetails = this.vendorList.find(data => data.vendorName === e.target.value)?.bankDetails;
    if (foundDetails) {
        this.selectedVendorBankDetails = foundDetails;
        console.log(this.selectedVendorBankDetails);
    } else {
        console.error("No bank details found for the selected vendor.");
        // Optionally reset to default or handle the absence of details
    }
}

  selectSubmitter(e: any) {
    const data = this.departmentList.find(data => data.submitter === e.target.value)?.departmentName;
    this.departmentName?.setValue(data)
  }
}