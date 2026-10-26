import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PuzzleBoard } from './puzzle-board';

describe('PuzzleBoard', () => {
  let component: PuzzleBoard;
  let fixture: ComponentFixture<PuzzleBoard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PuzzleBoard],
    }).compileComponents();

    fixture = TestBed.createComponent(PuzzleBoard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
