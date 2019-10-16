import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSnackBar } from '@angular/material';
import { FormsModule } from '@angular/forms';
import { NgbModule, NgbTypeaheadConfig } from '@ng-bootstrap/ng-bootstrap';

import { ApplicationsComponent } from './applications.component';
import { FindPanelComponent } from './find-panel/find-panel.component';
import { AppMapComponent } from './app-map/app-map.component';

describe('ApplicationsComponent', () => {
  let component: ApplicationsComponent;
  let fixture: ComponentFixture<ApplicationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ApplicationsComponent, FindPanelComponent, AppMapComponent],
      imports: [NgbModule, FormsModule, RouterTestingModule],
      providers: [NgbTypeaheadConfig, MatSnackBar]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should be created', () => {
    expect(component).toBeTruthy();
  });
});
