import { Injectable } from "@angular/core";
import { Resolve, Router } from "@angular/router";
import firebase from 'firebase/app';
import 'firebase/analytics';
import 'firebase/functions';
import "firebase/remote-config";
import { PermissionsService } from "src/app/services/permissions/permissions.service";
import { RequestManagerService } from "src/app/services/network/request-manager.service";
import { ApiService, EndPoint } from "src/app/services/network/api.service";
import { StorageService } from "src/app/services/storage/storage.service";
import { GetImageURLService } from "src/app/services/get-image-URL/get-image-url.service";
import { environment } from "src/environments/environment";
import { BlockerPopupComponent } from "src/app/admin/blocker-popup/blocker-popup.component";
import { MatDialog } from "@angular/material/dialog";

@Injectable()
export class ActivateAppResolver implements Resolve<Promise<any>> {
  constructor(
    public permissionsService: PermissionsService,
    public requestManager: RequestManagerService,
    public storageService: StorageService,
    public dialog: MatDialog,
    public apiService: ApiService,
    public router: Router,
    public getImageURLService: GetImageURLService
  ) {}
  resolve() {   
    // Here is a mock promise which gets 2 seconds
    return new Promise((resolve) => {
      if (this.permissionsService.awsTokens == null) {
        setTimeout(() => {
            this.requestManager
            .get(EndPoint.GET_AWS_TOKEN)
            .subscribe((response) => {
              const res: any = response;
              if (!response.success ) {
                if (response.message_code == 2000) {
                  localStorage.clear();
                  this.router.navigate(['/login']);
                }else if (response.message_code === 'CONFIG_ADMIN_DOWN') {
                const dialogRef = this.dialog.open(BlockerPopupComponent, { disableClose: true});
                }
              return;
              }
              if (response.success) {
                const remoteConfig = firebase.remoteConfig();
                remoteConfig.settings.minimumFetchIntervalMillis = 0;
                remoteConfig.fetchAndActivate().then(
                  (_res) => {
                    const pKey = remoteConfig.getValue(environment.fierbase_remote_config);  
                    this.permissionsService.awsTokens =
                      this.permissionsService.convertAPIResponse(
                        response.data,
                        pKey["_value"]
                      );
                    this.checkValidDate();
                    resolve(this.permissionsService.awsTokens);
                  },
                  (err) => {
                    // console.log("error >>>>>", err);
                  }
                );               
              }
            });
        });
      } else if (this.permissionsService.awsTokens) {
        this.checkValidDate();
        resolve(this.permissionsService.awsTokens);
      }
    });
  }

  checkValidDate(){
    const storeDate = this.storageService.getDateForCache();
    if(storeDate){
      const timeleft = Date.now() - storeDate;
      const days = Math.ceil((((timeleft / 1000) / 60) / 60) / 24);
      if(days >= 7){
        this.getImageURLService.deleteCache();
        this.storageService.setDateForCache();
      }
    }else{
      this.storageService.setDateForCache();
    }
  }
}
