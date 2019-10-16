import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FindPanelComponent } from './find-panel.component';
import { NgbModule, NgbTypeaheadConfig } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

describe('FindPanelComponent', () => {
  let component: FindPanelComponent;
  let fixture: ComponentFixture<FindPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FindPanelComponent],
      imports: [NgbModule, FormsModule, RouterTestingModule],
      providers: [NgbTypeaheadConfig]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FindPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
