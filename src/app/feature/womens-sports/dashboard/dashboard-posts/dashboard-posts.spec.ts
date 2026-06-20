import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardPosts } from './dashboard-posts';

describe('DashboardPosts', () => {
  let component: DashboardPosts;
  let fixture: ComponentFixture<DashboardPosts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPosts],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPosts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
