import { Component, OnInit, AfterViewInit, OnDestroy, Renderer2, ViewChild } from '@angular/core';
import { MatSnackBarRef, SimpleSnackBar, MatSnackBar } from '@angular/material';
// import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

import { Observable, Subject, Subscription, concat } from 'rxjs';
import _ from 'lodash';

import { AppMapComponent } from './app-map/app-map.component';
import { FindPanelComponent } from './find-panel/find-panel.component';
import { ExplorePanelComponent } from './explore-panel/explore-panel.component';
import { DetailsPanelComponent } from './details-panel/details-panel.component';
// import { SplashModalComponent, SplashModalResult } from './splash-modal/splash-modal.component';
import { Application } from 'app/models/application';
import { UrlService } from 'app/services/url.service';
import { takeUntil, finalize } from 'rxjs/operators';

export interface IFiltersType {
  cpStatuses: string[];
  appStatuses: string[];
  applicant: string;
  clidDtid: string;
  purposes: string[];
  subpurposes: string[];
  publishFrom: Date;
  publishTo: Date;
}

const emptyFilters: IFiltersType = {
  cpStatuses: [],
  appStatuses: [],
  applicant: null,
  clidDtid: null,
  purposes: [],
  subpurposes: [],
  publishFrom: null,
  publishTo: null
};

// NB: this number needs to be small enough to give reasonable app loading feedback on slow networks
//     but large enough for optimized "added/deleted" app logic (see map component)
const PAGE_SIZE = 250;

@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss']
})
export class ApplicationsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('appmap') appmap: AppMapComponent;
  @ViewChild('findPanel') findPanel: FindPanelComponent;
  @ViewChild('explorePanel') explorePanel: ExplorePanelComponent;
  @ViewChild('detailsPanel') detailsPanel: DetailsPanelComponent;

  public isApplicationsListVisible = false;
  public isExploreAppsVisible = false;
  public isFindAppsVisible = false;
  public isApplicationsMapVisible = true;
  public isSidePanelVisible = false;
  public isAppDetailsVisible = false;

  // private showSplashModal = false;
  public isLoading = false; // initial value
  private loadInitialApps = true;
  // private splashModal: NgbModalRef = null;
  private snackbarRef: MatSnackBarRef<SimpleSnackBar> = null;
  private filters: IFiltersType = emptyFilters;
  private coordinates: string = null;
  public apps: Application[] = [];
  public totalNumber = 0;
  private observablesSub: Subscription = null;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    public snackbar: MatSnackBar,
    // private modalService: NgbModal,
    private router: Router,
    public urlService: UrlService,
    private renderer: Renderer2
  ) {
    // watch for URL param changes
    // NB: this must be in constructor to get initial filters
    this.urlService.onNavEnd$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(event => {
      const urlTree = router.parseUrl(event.url);
      if (urlTree) {
        // if splash modal is open, close it in case user clicked Back
        // if (this.splashModal) {
        //   this.splashModal.dismiss();
        // }
        this.isSidePanelVisible = false;
        this.isAppDetailsVisible = false;
        this.isExploreAppsVisible = false;
        this.isFindAppsVisible = false;

        switch (urlTree.fragment) {
          // case 'splash':
          //   this.showSplashModal = true;
          //   break;
          case 'details':
            this.isSidePanelVisible = this.isAppDetailsVisible = true;
            break;
          case 'explore':
            this.isSidePanelVisible = this.isExploreAppsVisible = true;
            break;
          case 'find':
            this.isSidePanelVisible = this.isFindAppsVisible = true;
            break;
        }
      }
    });
  }

  ngOnInit() {
    this.renderer.addClass(document.body, 'no-scroll');
  }

  ngAfterViewInit() {
    // show splash modal (unless a sub-component has already turned off this flag)
    // if (this.showSplashModal) {
    //   // do this in another event so it's not in current change detection cycle
    //   setTimeout(() => {
    //     this.splashModal = this.modalService.open(SplashModalComponent, {
    //       backdrop: 'static',
    //       windowClass: 'splash-modal'
    //     });
    //     this.splashModal.result.then(result => {
    //       this.splashModal = null;
    //       this.showSplashModal = false;
    //       // if user dismissed the modal or clicked Explore then load initial apps
    //       // otherwise user clicked Find, which will load filtered apps
    //       switch (result) {
    //         case SplashModalResult.Dismissed:
    //           this.urlService.setFragment(null);
    //           this.getApps();
    //           break;
    //         case SplashModalResult.Exploring:
    //           this.getApps();
    //           break;
    //         case SplashModalResult.Finding:
    //           break;
    //       }
    //     });
    //   });
    //   return;
    // }

    // load initial apps (unless a sub-component has already turned off this flag)
    if (this.loadInitialApps) {
      // this.getApps();
    }
  }

  ngOnDestroy() {
    // if (this.splashModal) {
    //   this.splashModal.dismiss();
    // }
    if (this.snackbarRef) {
      this.hideSnackbar();
    }
    this.renderer.removeClass(document.body, 'no-scroll');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  // show snackbar
  // NB: use debounce to delay snackbar opening so we can cancel it preemptively if loading takes less than 500ms
  // tslint:disable-next-line:member-ordering
  private showSnackbar = _.debounce(() => {
    this.snackbarRef = this.snackbar.open('Loading applications ...');
  }, 500);

  // hide snackbar
  private hideSnackbar() {
    // cancel any pending open
    this.showSnackbar.cancel();

    // if snackbar is showing, dismiss it
    // NB: use debounce to delay snackbar dismissal so it is visible for at least 500ms
    _.debounce(() => {
      if (this.snackbarRef) {
        this.snackbarRef.dismiss();
        this.snackbarRef = null;
      }
    }, 500)();
  }


  /**
   * Event handler called when Find component updates its filters.
   */
  public updateFindFilters(findFilters: IFiltersType) {
    this.loadInitialApps = false; // skip initial app load
    // NB: first source is 'emptyFilters' to ensure all properties are set
    this.filters = { ...emptyFilters, ...findFilters };
    // clear other filters
    this.explorePanel.clearAllFilters(false);
    // this.getApps();
    // don't show Find panel automatically
  }

  /**
   * Event handler called when Explore component updates its filters.
   */
  public updateExploreFilters(exploreFilters: IFiltersType) {
    this.loadInitialApps = false; // skip initial app load
    // NB: first source is 'emptyFilters' to ensure all properties are set
    this.filters = { ...emptyFilters, ...exploreFilters };
    // clear other filters
    this.findPanel.clearAllFilters(false);
    // this.getApps();
    // don't show Explore panel automatically
  }

  /**
   * Event handler called when Details component updates/clears its current app.
   */
  public updateDetails(app: Application, show: boolean) {
    this.appmap.onHighlightApplication(app, show);
    // show/hide Details panel
    this.isSidePanelVisible = show;
    this.isAppDetailsVisible = true;
    this.urlService.setFragment(this.isSidePanelVisible ? 'details' : null);
  }

  /**
   * Event handler called when map component view has changed.
   */
  public updateCoordinates() {
    console.log('updateCoordinates');
    // this.getApps(false); // total number is not affected
  }


  /**
   * Called when map component visibility is toggled.
   */
  public toggleAppMap() {
    if (this.isApplicationsMapVisible) {
      this.isApplicationsMapVisible = false;
    } else {
      this.isApplicationsMapVisible = true;
      // make map visible in next timeslice
      // to visually separate panel opening from data loading
      setTimeout(() => {
        this.appmap.onMapVisible();
      });
    }
  }

  // show Find Applications interface
  public toggleFind() {
    // show side panel if it's hidden or THIS component isn't already visible
    this.isSidePanelVisible = !this.isSidePanelVisible || !this.isFindAppsVisible;

    this.isAppDetailsVisible = false;
    this.isExploreAppsVisible = false;
    this.isFindAppsVisible = true;
    this.urlService.setFragment(this.isSidePanelVisible ? 'find' : null);
  }

  // show Explore Applications interface
  public toggleExplore() {
    // show side panel if it's hidden or THIS component isn't already visible
    this.isSidePanelVisible = !this.isSidePanelVisible || !this.isExploreAppsVisible;

    this.isAppDetailsVisible = false;
    this.isExploreAppsVisible = true;
    this.isFindAppsVisible = false;
    this.urlService.setFragment(this.isSidePanelVisible ? 'explore' : null);
  }

  // show Application Details interface
  public toggleDetails() {
    // show side panel if it's hidden or THIS component isn't already visible
    this.isSidePanelVisible = !this.isSidePanelVisible || !this.isAppDetailsVisible;

    this.isAppDetailsVisible = true;
    this.isExploreAppsVisible = false;
    this.isFindAppsVisible = false;
    this.urlService.setFragment(this.isSidePanelVisible ? 'details' : null);
  }

  // public disableSplash() {
  //   // this is called by Find/Explore when they have filters to apply or by Details when it has an app to display
  //   // ie, on init, if the above are true then bypass the splash modal
  //   this.showSplashModal = false;
  // }

  public closeSidePanel() {
    this.isSidePanelVisible = false;

    // if user just closed details panel, unset the app
    if (this.isAppDetailsVisible) {
      this.detailsPanel.clearAllFilters();
    }

    this.urlService.setFragment(null);
  }

  public clearFilters() {
    this.findPanel.clearAllFilters(false);
    this.explorePanel.clearAllFilters(false);
    this.filters = emptyFilters;
  }
}
