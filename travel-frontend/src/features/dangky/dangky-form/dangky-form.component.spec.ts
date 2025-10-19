import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DangkyFormComponent } from './dangky-form.component';

describe('DangkyFormComponent', () => {
  let component: DangkyFormComponent;
  let fixture: ComponentFixture<DangkyFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DangkyFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DangkyFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
