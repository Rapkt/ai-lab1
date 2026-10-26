import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RaceView } from './race-view';

describe('RaceView', () => {
  let component: RaceView;
  let fixture: ComponentFixture<RaceView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RaceView],
    }).compileComponents();

    fixture = TestBed.createComponent(RaceView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
