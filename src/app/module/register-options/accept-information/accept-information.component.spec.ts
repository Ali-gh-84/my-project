import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcceptInformationComponent } from './accept-information.component';

describe('AcceptInformationComponent', () => {
  let component: AcceptInformationComponent;
  let fixture: ComponentFixture<AcceptInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcceptInformationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AcceptInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
