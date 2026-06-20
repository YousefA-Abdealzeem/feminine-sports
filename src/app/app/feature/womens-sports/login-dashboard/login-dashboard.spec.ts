import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginDashboard } from './login-dashboard';

describe('LoginDashboard', () => {
  let component: LoginDashboard;
  let fixture: ComponentFixture<LoginDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
