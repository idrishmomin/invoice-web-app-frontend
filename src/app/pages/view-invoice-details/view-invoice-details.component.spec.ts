import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewInvoiceDetailsComponent } from './view-invoice-details.component';

describe('AddInvoiceComponent', () => {
  let component: ViewInvoiceDetailsComponent;
  let fixture: ComponentFixture<ViewInvoiceDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewInvoiceDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewInvoiceDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
