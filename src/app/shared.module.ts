import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatProgressBarModule, MatSnackBarModule } from '@angular/material';
import { NgxTextOverflowClampModule } from 'ngx-text-overflow-clamp';

import { OrderByPipe } from 'app/pipes/order-by.pipe';
import { NewlinesPipe } from 'app/pipes/newlines.pipe';
import { ObjectFilterPipe } from 'app/pipes/object-filter.pipe';
import { LinkifyPipe } from 'app/pipes/linkify.pipe';

import { VarDirective } from 'app/utils/ng-var.directive';
import { DragMoveDirective } from 'app/utils/drag-move.directive';

// re-usable component widgets
import { ActivityComponent } from 'app/activity/activity.component';

@NgModule({
  imports: [BrowserModule, MatProgressBarModule, MatSnackBarModule, NgxTextOverflowClampModule],
  declarations: [
    OrderByPipe,
    NewlinesPipe,
    ObjectFilterPipe,
    LinkifyPipe,
    VarDirective,
    DragMoveDirective,
    ActivityComponent
  ],
  exports: [
    MatProgressBarModule,
    MatSnackBarModule,
    NgxTextOverflowClampModule,
    OrderByPipe,
    NewlinesPipe,
    ObjectFilterPipe,
    LinkifyPipe,
    VarDirective,
    DragMoveDirective,
    ActivityComponent
  ]
})
export class SharedModule {}
