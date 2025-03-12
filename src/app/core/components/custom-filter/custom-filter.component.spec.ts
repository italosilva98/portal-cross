import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomFilterComponent } from './custom-filter.component';

describe('CustomFilterComponent', () => {
  let component: CustomFilterComponent;
  let fixture: ComponentFixture<CustomFilterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CustomFilterComponent]
    });
    fixture = TestBed.createComponent(CustomFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
