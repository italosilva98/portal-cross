import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabletTasksComponent } from './tablet-tasks.component';

describe('TabletTasksComponent', () => {
  let component: TabletTasksComponent;
  let fixture: ComponentFixture<TabletTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TabletTasksComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TabletTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
