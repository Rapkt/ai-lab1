import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayView } from './play-view';

describe('PlayView', () => {
  let component: PlayView;
  let fixture: ComponentFixture<PlayView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayView],
    }).compileComponents();

    fixture = TestBed.createComponent(PlayView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
