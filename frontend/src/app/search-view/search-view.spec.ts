import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchView } from './search-view';

describe('SearchView', () => {
  let component: SearchView;
  let fixture: ComponentFixture<SearchView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchView],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
