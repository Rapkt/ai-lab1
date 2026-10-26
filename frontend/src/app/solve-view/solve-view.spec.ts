import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SolveView } from './solve-view';

describe('SolveView', () => {
  let component: SolveView;
  let fixture: ComponentFixture<SolveView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolveView],
    }).compileComponents();

    fixture = TestBed.createComponent(SolveView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
