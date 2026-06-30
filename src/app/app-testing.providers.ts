import { BreadcrumbsService } from 'src/app/services/breadcrumbs/breadcrumbs.service';
import { HeaderService } from 'src/app/services/header/header.service';
import { InterceptorService } from 'src/app/services/interceptor/interceptor.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateStore } from '@ngx-translate/core';
import { GlobalService } from 'src/app/services/global/global.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

export const providers = [
    TranslateStore,
    MatSnackBar,
    HeaderService,
    BreadcrumbsService,
    GlobalService,
    StorageService,
    {
        provide: HTTP_INTERCEPTORS,
        useClass: InterceptorService,
        multi: true,
    },
    { provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true,
    },
    { provide: MatDialogRef, useValue: {} },
    { provide: MAT_DIALOG_DATA, useValue: {} },
];
