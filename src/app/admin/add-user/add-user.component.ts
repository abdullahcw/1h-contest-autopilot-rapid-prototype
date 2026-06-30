import { Component, OnInit, Inject, ViewChild, Output, EventEmitter, AfterViewInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DepartmentService } from 'src/app/services/department/department.service';
import { LocationService } from 'src/app/services/location/location.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { CropImageComponent } from '../../shared/crop-image/crop-image.component';
import { environment } from '../../../environments/environment';
import { GroupService } from 'src/app/services/group/group.service';
import { PlayerService } from 'src/app/services/player/player.service';
import { GlobalService, UsageLimit } from 'src/app/services/global/global.service';
import { TranslateService } from '@ngx-translate/core';
import { Role, PermissionsService, PermissionsKey } from 'src/app/services/permissions/permissions.service';
import { ManagerService } from 'src/app/services/manager/manager.service';
import { UploaderService } from 'src/app/services/uploader/uploader.service';
import { ApiService, Constants } from 'src/app/services/network/api.service';
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';
import { NgForm } from '@angular/forms';
import { ESCAPE } from '@angular/cdk/keycodes';
import { DatePipe } from '@angular/common';
import { PaywallActionComponent } from '../paywallAction/paywall-action.component';
import { FeatureFlagsService } from 'src/app/services/feature-flags/feature-flags.service';
const defaultLogoUrl = '/assets/img/default.png';
class Ethnicity {
  ethnicityId: number;
  ethnicityName: string;
}

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit, AfterViewInit {
  @ViewChild('imgInput', { static: true }) imgInput;
  @ViewChild('first_name', { static: true }) first_name;
  @ViewChild('addUser', { static: true }) addUser: NgForm;
  @Output() refreshPlayerList: EventEmitter<any> = new EventEmitter();
  @Output() userDeleted: EventEmitter<any> = new EventEmitter();
  role = Role;
  permission: any;
  user = {
    isNew: false,
    isUpdating: false,
    manager_id: '',
    player_id: '',
    profile_image_url: '',
    first_name: '',
    last_name: '',
    user_name: '',
    global_id: '',
    type_value: '',
    access_type: 'M',
    email: '',
    department_name: '',
    location_name: '',
    location_id: 0,
    is_editable: false,
    department_id: 0,

    link_locations: [],
    link_sec_locations: [],
   
    link_departments: [],
    link_sec_departments: [],

    link_locations_ids: [],
    link_sec_locations_ids: [],
    
    link_departments_ids: [],
    link_sec_departments_ids: [],

    unlink_locations: [],
    unlink_sec_locations: [],

    unlink_department: [],
    unlink_sec_department: [],

    company_id: '',
    password: '',
    group_name: '',
    group_id: 0,
    title: '',
    country_id: 0,
    country_name: '',
    state_id: 0,
    state_name: '',
    city: '',
    company_name: '',
    date_of_birth: '',
    college: '',
    college_graduation_year: 0,
    college_major: '',
    highest_degree_id: 0,
    employee_id: '',
    eth_id: 0,
    ethnicity_name: '',
    status: '',
    confirmPassword: '',
    manager_tz_id: '',
    company_custom_fields: [],
    secondary_locations: [],
    secondary_departments: [],
  };
  
  croppedImage = {
    'path': '',
    'blob': null
  };
  copyOfLinkDepartmentsIds = [];
  copyOfLinkLocationsIds = [];

  selectedLinkLocationsIds = [];
  selectedLinkSecondaryLocationsIds = [];

  copyOfLinkSecondaryDepartmentsIds = [];
  copyOfLinkSecondaryLocationsIds = [];

  isDatePickerOpen = false;
  userType: string;
  dob;
  year = 0;
  month;
  day;
  endYear;
  date = new Date();
  logo = defaultLogoUrl;
  startDate;
  departments = [];
  SecondaryDepartments = [];
  locations = [];
  secondaryLocations = [];
  timezones = [];
  default_timezone = [];
  countries = [];
  states = [];
  groups = [];
  ethnicities = [];
  is_loading = false;
  dropdownList = [];
  dropdownSettings = {};
  company;
  yearsOptions = [];
  showEthnicity = false;
  fetchLoc = false;
  fetchDept = false;
  fetchSecLoc = false;
  fetchSecDept = false;
  fetchTimezone = false;
  fetchState = false;
  fetchCountry = false;
  managerTypes = [];
  loginUser;
  readonly separatorKeysCodes: number[] = [ESCAPE];
  countryList = [];
  statesList = [];
  groupsList = [];
  locationList = [];
  locationSecondaryList= [];
  timeZoneList = [];
  preparedDepartmentList = [];
  preparedDepartmentListSceoundary = [];
  selectedTab = 0;
  selectedTimezoneId;
  customFieldsUpdated: any;
  customFields = [];
  customFieldsAPI: any;
  companySettingPermission: any;
  limit = 50;
  limitPlayer = 5;
  locationMsg = this.translate.instant('50_locations');
  departmentMsg = this.translate.instant('50_departments');
  locationMsgPlayer = this.translate.instant('5_locations');
  departmentMsgPlayer = this.translate.instant('5_departments');
  isNewLocationLinked = false;
  isNewLocationLinkedSec = false;
  headLocationId: any;
  isPrimaryId = 0;
  abc = true;
  locationListSEC= [];
  empty = {
    "location_id": '',
    'location_name': '',
    "department_id":'',
    'department_name': '',
    'location_src': [],
    'department_src': [],
    'is_loading':false
  };
  secAllFields= [];
  linked_sec_locations_departments_count = 0;
  copyOfLocationSEC: any;

  isTypeSelectDisabled(): boolean {
    if (this.globalService.isRoleLimited() && !this.user.isNew) {
      if (this.loginUser?.access_type === Role.MID_MANAGER && this.featureFlagsService.isMidManagerScopeEnhancementEnabled()) {
        return false;
      }
      return true;
    }
    return false;
  }

  constructor(private dialogRef: MatDialogRef<any>, private playerService: PlayerService, private departmentService: DepartmentService,
    private storageService: StorageService, private locationService: LocationService, private dialog: MatDialog,
    private managerService: ManagerService, private uploaderService: UploaderService, private apiService: ApiService,
    private groupService: GroupService, public globalService: GlobalService, public translate: TranslateService,
    private permissionService: PermissionsService, private cdf: ChangeDetectorRef,
    private datePipe: DatePipe,
    private featureFlagsService: FeatureFlagsService,
    @Inject(MAT_DIALOG_DATA) public userDetails: any) {
    dialogRef.disableClose = true;
  }

  @HostListener('window:keydown', ['$event']) closeOnEscape(event) {
    if (event.keyCode === ESCAPE) {
      this.dialogRef.close();
    }
  }

  ngOnInit() {
    this.companySettingPermission = this.globalService.getCompanySetting(PermissionsKey.PLAYER);
    this.globalService.companySettingReceived$.subscribe(() => {
      this.companySettingPermission = this.globalService.getCompanySetting(PermissionsKey.PLAYER);
    });
    this.company = this.storageService.getCompany();
    if (this.companySettingPermission && this.globalService.isCompanyWithCustomField()) {
      this.companyCustomFields(this.company && this.company.company_id);
    }

    // Set initial date with validation
    this.date.setFullYear(this.date.getFullYear() - 4);
    this.startDate = this.date;
    const year = 1965;
    const d = new Date();
    const till = d.getFullYear();
    for (let y = year; y <= till; y++) {
      this.yearsOptions.push(y);
    }
    this.managerTypes = this.globalService.getCompanyRoles();
    // console.log('managerTypes',this.managerTypes);

    // Get Company details from Storage

    this.showEthnicity = this.company['is_ethnicity'];
    if (this.showEthnicity) {
      this.getEthnicity();
    }

    this.loginUser = JSON.parse(this.storageService.getUser());
    if (!this.globalService.isRoleLimited() && this.userDetails.userType !== 'player') {
      // Manager/Admin users - fetch all locations
      setTimeout(() => {
        this.getLocations();
        this.getGroups();
      }, 500);
    } else if (this.globalService.isRoleLimited() && this.userDetails.userType !== 'player' && this.featureFlagsService.isMidManagerScopeEnhancementEnabled()) { // If flag is enabled, fetch groups only
      // MM/TL users - only fetch groups, locations will be handled in updateExistUser or getLocationAndDepartmentAccordingToSOM
      setTimeout(() => {
        this.getGroups();
      }, 500);
    } else if (this.userDetails.userType === 'player') {
      this.getLocationSEC();
      setTimeout(() => {
        this.getLocations();
        this.getGroups();
      }, 500);
      // in edit player scenario location is loading late thats why written separately
    }
    setTimeout(() => {
      this.getCountries();
    }, 1000);
    // Update existing user details

    if ((!(this.userDetails && this.userDetails.userInfo.isNew))) {
      // no custom field;
      if(!this.globalService.isCompanyWithCustomField()){
      this.updateExistUser();
      }
    } else { //  Create New user
      // Get linked Location and Department of Login user if MM and T
      if (this.userDetails.userType !== 'player' && (this.globalService.isRoleLimited())) {
        this.getLocationAndDepartmentAccordingToSOM();
      }
      this.user.isNew = true;
      this.user.is_editable = true;
      this.user.company_id = this.company.company_id;
  }

    if (this.userDetails.userType === Constants.MANAGER) {
      this.permission = this.permissionService.getPermissions(PermissionsKey.MANAGER);
    } else {
      this.permission = this.permissionService.getPermissions(PermissionsKey.PLAYER);
    }

  }
  companyCustomFields(CompanyId) {
    this.playerService.companyCustomFields(CompanyId, true).subscribe((res) => {
      const response = res;
      this.is_loading = false;
      if (!response.success) {
        return;
      }
      if (!(this.userDetails && this.userDetails.userInfo.isNew)) {
        this.updateExistUser();
      }
      this.customFieldsAPI = response.data.fields;
      if (this.customFieldsAPI) {
        this.user.company_custom_fields = [];
        this.customFieldsAPI.forEach(field => {
          this.user['company_custom_fields'].push({ 'key': field.filter_key, 'title': field.title, value: '' });
        });
      }
    });

  }
  updateExistUser() {
    // Set Basic User info
    this.user.isNew = false;
    this.user = this.userDetails.userInfo;
    console.log('user',this.user);
    if (this.userDetails.userType === Constants.MANAGER) {
      // Disable form till is_editable permission is received
      this.is_loading = true;
      this.managerService.getManagerDetails(this.userDetails.userInfo.manager_id).subscribe((res) => {
        const response = res;
        this.is_loading = false;
        if (!response.success) {
          return;
        }
        this.user = response.data.manager_details;
        this.user['isNew'] = false;
        this.shouldDisableForm();
        // Keep copy of Link Locations
        if (this.user.link_locations && this.user.link_locations.length) {
          this.selectedLinkLocationsIds = [];

          // new flow for the mid manager scope enhancement(MM can create TL and MM and TL can create TL)
          if(this.featureFlagsService.isMidManagerScopeEnhancementEnabled()) { 
            // Check if logged in user is Manager/Admin (has full access)
            const isLoggedInUserManagerOrAdmin = !this.globalService.isRoleLimited();
            
            // Check if logged in user is MM/TL
            const isLoggedInUserMMOrTL = this.globalService.isRoleLimited();
            
            // Check if target user is MM/TL
            const isTargetUserMMOrTL = (this.user.access_type === Role.TEAM_LEAD || this.user.access_type === Role.MID_MANAGER);
            
            if (isLoggedInUserManagerOrAdmin) {
              // Scenario 1: Manager/Admin editing any user - show all locations and departments

              // Don't restrict locations, let them see all available locations
              this.prepareLocationListForSearchSelectComponent();
              this.prepareDepartmentListForMultiSelectComponent(this.user.link_departments, true);
              // Fetch all departments for the selected locations
              this.getDepartmentsByLocation(null, this.selectedLinkLocationsIds);
            } else if (isLoggedInUserMMOrTL && isTargetUserMMOrTL) {
              // Scenario 2 & 3: MM/TL editing another MM/TL
              if (this.user.is_editable) {
                // Scenario 2: MM/TL can edit - fetch SOM locations (logged-in user's allowed locations)
                this.getLocationAndDepartmentAccordingToSOMForEdit();
              } else {
                // Scenario 3: MM/TL cannot edit - show only target user's locations
                this.locations = this.user.link_locations;
                this.prepareLocationListForSearchSelectComponent();
                this.prepareDepartmentListForMultiSelectComponent(this.user.link_departments, true);
              }
            } else {
              // Fallback: Use existing logic for other scenarios
              this.prepareLocationListForSearchSelectComponent();
              this.prepareDepartmentListForMultiSelectComponent(this.user.link_departments, true);
            }
          }else{ // old flow for the mid manager scope enhancement(MM can create TL only)
            if ((this.user.access_type === Role.TEAM_LEAD || this.user.access_type === Role.MID_MANAGER)
              && (this.storageService.getAccessType() === Role.MID_MANAGER || this.storageService.getAccessType() === Role.TEAM_LEAD)) {
                this.locations = this.user.link_locations;
            }
              // Allow Admin and Manger to change location
              this.prepareLocationListForSearchSelectComponent();
              this.prepareDepartmentListForMultiSelectComponent(this.user.link_departments, true);
          }
          
          if (this.user.access_type === Role.MANAGER) {
            this.user.location_id = this.user.link_locations[0].location_id;
          }
          this.user.link_locations.forEach(linkLoc => {
            this.selectedLinkLocationsIds.push(linkLoc.location_id);
          });
          if (this.user.access_type === Role.TEAM_LEAD || this.user.access_type === Role.MID_MANAGER) {
            this.copyOfLinkLocationsIds = this.selectedLinkLocationsIds;
          }
          this.getTimeZoneByLocation(this.selectedLinkLocationsIds);

          // If flag is disabled, get departments by location 
          // If flag is enabled dont apply this condition. Flag enabled means new flow.
          if(!this.featureFlagsService.isMidManagerScopeEnhancementEnabled()) {
            if (!this.globalService.isRoleLimited()) {
              this.getDepartmentsByLocation(null, this.selectedLinkLocationsIds);
            }
          }
        }
        // Keep copy of Link Departments
        if (this.user.link_departments && this.user.link_departments.length) {
          this.copyOfLinkDepartmentsIds = [];
          this.user.link_departments.forEach(linkDept => {
            this.copyOfLinkDepartmentsIds.push(linkDept.department_id);
          });
        }
        this.year = response.data.manager_details.college_graduation_year;
      });
    } else {
      this.is_loading = true;
      this.getDepartmentsByLocation(this.user.location_id);
      this.playerService.getPlayerDetails(this.userDetails.userInfo.player_id).subscribe((res) => {
        const response = res;
        this.is_loading = false;
        if (!response.success) {
          return;
        }

        this.user = response.data.player_details;
        this.linked_sec_locations_departments_count = response.data.player_details.linked_sec_locations_departments_count
        /// multilocation n multi dept  ************

        

        this.secAllFields = response.data.player_details.linked_sec_locations_departments;
        const isNew = false;
        this.secAllFields.forEach(locDept => {
          locDept.is_loading = true;
          this.getDepartmentsByLocationSEC(locDept.location_id,locDept,isNew);
        })

        /// multilocation n multi dept  *********
        if (this.globalService.isCompanyWithCustomField()) {
          this.user.company_custom_fields = [];
          const responseCustomFileds = response.data.player_details.custom_fields;
          if (Object.keys(responseCustomFileds).length === 0) {
            this.customFieldsAPI.forEach(field => {
              this.user['company_custom_fields'].push({ 'key': field.filter_key, 'title': field.title, value: '' });
            });
          } else {
            if (this.customFieldsAPI && (Object.keys(responseCustomFileds).length !== 0)) {
              this.customFieldsAPI.forEach(field => {
                Object.entries(response.data.player_details.custom_fields).forEach(([key, value]) => {
                  if (key === field.filter_key) {
                    this.user['company_custom_fields'].push({ 'key': field.filter_key, 'title': field.title, 'value': value });
                  }
                });
              });
            }
          }
        }
        this.user['isNew'] = false;
        this.year = response.data.player_details.college_graduation_year;
        this.shouldDisableForm();
      });

    }
  }
  checkLocationselected (){
    if(this.user.link_sec_locations.length){
      return true;
    }else{
      return false;
    }

}
  getLocationAndDepartmentAccordingToSOM() {
    this.fetchLoc = true;
    this.fetchDept = true;
    this.locationService.getLocationAndDepartmentAccordingToSOM().subscribe(res => {
      const response: any = res;
      if (!response.success) {
        this.user.link_locations = [];
        this.user.link_locations_ids = [];
        this.user.link_departments = [];
        this.user.link_departments_ids = [];
        return;
      }

      // For new users, don't pre-select locations and departments
      if (this.user.isNew && this.featureFlagsService.isMidManagerScopeEnhancementEnabled()) {
        // Set available locations to SOM locations but don't pre-select them
        this.locations = response.data.link_locations;
        this.default_timezone = response.data.default_timezone;
        this.prepareLocationListForSearchSelectComponent();
        
        // Set available departments to SOM departments but don't pre-select them
        this.prepareDepartmentListForMultiSelectComponent(response.data.link_departments, false);
        
        // Initialize empty arrays for new user
        this.user.link_locations = [];
        this.user.link_departments = [];
        this.copyOfLinkLocationsIds = [];
        this.selectedLinkLocationsIds = [];
      } else {
        // For existing users (edit scenario), use the old logic
        this.user.link_locations = response.data.link_locations;
        this.user.location_id = this.user.link_locations[0].location_id;
        this.locations = this.user.link_locations;
        this.default_timezone = response.data.default_timezone;
        this.prepareLocationListForSearchSelectComponent();
        this.user.link_departments = response.data.link_departments;
        this.prepareDepartmentListForMultiSelectComponent(this.user.link_departments, true);
        this.copyOfLinkLocationsIds = [];
        this.user.link_locations.forEach(linkLoc => {
          this.copyOfLinkLocationsIds.push(linkLoc.location_id);
        });
        this.getTimeZoneByLocation(this.copyOfLinkLocationsIds);
      }
      this.fetchLoc = false;
      this.fetchDept = false;
    });
  }

  getLocationAndDepartmentAccordingToSOMForEdit() {

    if(!this.featureFlagsService.isMidManagerScopeEnhancementEnabled()) {
      return;
    }
    
    this.fetchLoc = true;
    this.fetchDept = true;
    this.locationService.getLocationAndDepartmentAccordingToSOM().subscribe(res => {
      const response: any = res;
      if (!response.success) {
        // If SOM call fails, fallback to showing only target user's locations
        this.locations = this.user.link_locations;
        this.prepareLocationListForSearchSelectComponent();
        this.prepareDepartmentListForMultiSelectComponent(this.user.link_departments, true);
        this.fetchLoc = false;
        this.fetchDept = false;
        return;
      }

      // Store the original user's locations and departments for selection
      const originalUserLocations = [...this.user.link_locations];
      const originalUserDepartments = [...this.user.link_departments];
      
      // Set available locations to logged-in user's SOM locations
      this.locations = response.data.link_locations;
      this.default_timezone = response.data.default_timezone;
      
      // Prepare location list with available locations
      this.prepareLocationListForSearchSelectComponent();
      
      // Mark original user's locations as selected in the available locations
      this.locationList.forEach(loc => {
        const isUserLocation = originalUserLocations.some(userLoc => userLoc.location_id === loc.id);
        if (isUserLocation) {
          loc.isSelected = true;
        }
      });
      
      // Use SOM departments as available options without overwriting user's linked departments
      const availableDepartments = response.data.link_departments;
      this.preparedDepartmentList = [];
      this.prepareDepartmentListForMultiSelectComponent(availableDepartments, false);
      
      // Mark original user's departments as selected
      this.preparedDepartmentList.forEach(dept => {
        const isUserDepartment = originalUserDepartments.some(userDept => userDept.department_id === dept.id);
        if (isUserDepartment) {
          dept.isSelected = true;
        }
      });
      
      // Update selected location IDs to include original user's locations
      this.selectedLinkLocationsIds = [];
      originalUserLocations.forEach(linkLoc => {
        this.selectedLinkLocationsIds.push(linkLoc.location_id);
      });
      
      // Update copy of link locations IDs
      this.copyOfLinkLocationsIds = [...this.selectedLinkLocationsIds];
      
      // Get timezone for selected locations
      this.getTimeZoneByLocation(this.selectedLinkLocationsIds);

      // Preserve the model’s linked departments in edit flow
      this.user.link_departments = originalUserDepartments;
      
      this.fetchLoc = false;
      this.fetchDept = false;
    });
  }

  shouldDisableForm() {
    if (!this.user.is_editable) {
      this.addUser.form.disable();
    }
  }

  getGroups() {
    this.is_loading = true;
    this.groupService.getGroups(this.storageService.getCompanyId(), 'group_name', 'asc', 0, 0, '').subscribe((res) => {
      const response: any = res;
      if (!response.success) { return; }
      this.groups = response.data.group_list;
      this.groupsList = [];
      this.groups.forEach(element => {
        this.groupsList.push({ id: element.group_id, title: element.group_name });
      });
      this.is_loading = false;
    });
  }

  getLocations() {
    this.fetchLoc = true;
    this.fetchSecLoc = true;
    const filters = 'manager_id=' + this.loginUser.manager_id;
    this.locationService.getLocations(this.storageService.getCompanyId(), 'location_name', 'asc', 0, 0, filters, false).subscribe((res) => {
      const response: any = res;
      if (!response.success) { return; }
      this.locations = [];
      this.locations = response.data.location_list;
     
      // this.secAllFields.location_src = response.data.location_list;
     
      this.prepareLocationListForSearchSelectComponent();
      if (this.userDetails.userType === 'player') {
      this.prepareLocationListForMultissearchSelectComponent();
       this.fetchSecLoc = false;
      }
      if (this.user.isNew) {
        this.locations.forEach(location => {
          if (location.head_location) {
            if (this.userDetails.userType === 'player') {
              this.user.location_id = location.location_id;
              this.onLocationChangePrimary(location.location_id);
              
            }
            this.locationList.forEach(loc => {
              if ((loc.id === location.location_id) && location.head_location && this.userDetails.userType === 'player') {
                loc.isSelected = true;
                loc.isPrimary = true;
              }
            });
          }
        });
        if (this.userDetails.userType === 'player') {
          this.fetchSecLoc = false;
        }
      }
    });
  }
  prepareSecLocation() {
    this.locationSecondaryList.forEach(loc => {
      if ((loc.id === this.headLocationId) && this.userDetails.userType === 'player') {
        loc.isSelected = true;
      }
  });
}
  prepareLocationListForSearchSelectComponent() {
    this.locationList = [];
    const locLength = this.locations.length;
    this.locations.forEach(loc => {
      this.locationList.push({ id: loc.location_id, title: loc.location_name });
    });
    this.fetchLoc = locLength === this.locationList.length ? false : true;
    if (this.user.link_locations) {
      this.user.link_locations.forEach(linkLoc => {
        this.locationList.forEach(loc => {
          if (loc.id === linkLoc.location_id) {
            loc.isSelected = true;
          }
        });
      });
    }
  }
  prepareLocationListForMultissearchSelectComponent() {
    console.log('prepareLocationListForMultissearchSelectComponent')
    this.locationSecondaryList = [];
    const locLength = this.secondaryLocations.length;
    this.secondaryLocations.forEach(loc => {
      this.locationSecondaryList.push({ id: loc.location_id, title: loc.location_name });
    });
    this.fetchSecLoc = locLength === this.locationSecondaryList.length ? false : true;
    if (this.user.link_sec_locations) {
      this.user.link_sec_locations.forEach(linkLoc => {
        this.locationSecondaryList.forEach(loc => {
          if (loc.id === linkLoc.location_id) {
            loc.isSelected = true;
          }
        });
      });
    }
  }

  getCountries() {
    this.fetchCountry = true;
    this.locationService.getCountries().subscribe((res) => {
      const response: any = res;
      if (response.success) {
        this.countries = response.data.countries;
      }
      this.countryList = [];
      this.countries.forEach(element => {
        this.countryList.push({ id: element.country_id, title: element.country_name });
      });
      if (this.user.country_id) {
        this.getStates(this.user.country_id);
      }
      this.fetchCountry = false;
    });
  }

  getStates(countryId) {
    this.fetchState = true;
    this.locationService.getStates(countryId).subscribe((res) => {
      const response: any = res;
      if (response.success) {
        this.states = response.data.states;
        this.statesList = [];
        this.states.forEach(element => {
          this.statesList.push({ id: element.state_id, title: element.state_name });
        });
        if (this.states && !this.user.state_id) {
          this.user.state_id = 0;
          this.user.state_name = '';
        }
      }
      this.fetchState = false;
    });
  }

  onGroupSelectionChanged(groupId) {
    this.user.group_id = groupId;
    this.addUser.form.markAsDirty();
  }

  getEthnicity() {
    this.playerService.getEthnicity().subscribe((res) => {
      const response: any = res;
      if (!response.success) {
        return;
      }
      this.ethnicities = [];
      response.data.ethnicity.forEach(eth => {
        const ethnicity = new Ethnicity();
        ethnicity.ethnicityId = eth.ethnicity_id;
        ethnicity.ethnicityName = eth.ethnicity_name;
        this.ethnicities.push(ethnicity);
      });
    });
  }

  ngAfterViewInit() {
    this.first_name.nativeElement.focus();
    console.log('this.user.isNew',this.user.isNew);

    // while deprecating flag, remove entire else condition block and use only if block.
    if(this.featureFlagsService.isMidManagerScopeEnhancementEnabled()) {
      // MM can create TL and MM only
      if (this.user.isNew && this.loginUser.access_type === Role.MID_MANAGER) {
        console.log('managerTypes',this.managerTypes);

        this.managerTypes = this.managerTypes.filter(managerType => {
          return managerType.id === Role.TEAM_LEAD || managerType.id === Role.MID_MANAGER;
        });

        if (this.userDetails.userType !== 'player') {
          this.user.access_type = Role.MID_MANAGER;
        }

        this.cdf.detectChanges();
      }

      // TEAM_LEAD can create TL only
      if (this.user.isNew && this.loginUser.access_type === Role.TEAM_LEAD) {
        this.managerTypes = this.managerTypes.filter(managerType => {
          return managerType.id === Role.TEAM_LEAD;
        });
        if (this.userDetails.userType !== 'player') {
          // Auto-assign to TEAM_LEAD since that's the only option
          this.user.access_type = Role.TEAM_LEAD;
        }
        this.cdf.detectChanges();
      }

      // Editing flow: enable MM to toggle between TL/MM
      if (!this.user.isNew && this.loginUser.access_type === Role.MID_MANAGER) {
        if(this.user.access_type === Role.MANAGER) {
          this.managerTypes = this.managerTypes.filter(managerType => {
            return managerType.id === Role.MANAGER;
          });
        }else{
          this.managerTypes = this.managerTypes.filter(managerType => {
            return managerType.id === Role.TEAM_LEAD || managerType.id === Role.MID_MANAGER;
          });
          this.cdf.detectChanges();
      }
      }
    }else{
      if (this.user.isNew && this.loginUser.access_type === Role.MID_MANAGER) {
        console.log('managerTypes',this.managerTypes);
  
        this.managerTypes = this.managerTypes.filter(managerType => {
          return managerType.id === Role.TEAM_LEAD;
        });
        if (this.userDetails.userType !== 'player') {
          console.log('managerTypes',this.managerTypes);
  
          this.user.access_type = Role.TEAM_LEAD;
        }
        this.cdf.detectChanges();
      }
    }
  }
  cancel() {
    this.dialogRef.close();
  }
//for player
  onLocationChangePrimary(locationId) {
    this.user.location_id = locationId;
    // isSelected: forceSelected
    this.addUser.form.markAsDirty();
    this.departments = [];
    this.user.department_id = 0;
    // this.prepareSecondaryLocationAfterChnage(this.user.location_id);
    this.getDepartmentsByLocation(this.user.location_id);
  }
  
 checkSelectedPrimaryLocation(locationId){
      if(this.locationSecondaryList.length){
        const userSelectedIndex = this.locationSecondaryList.findIndex(function (loc) {
          return loc.id === locationId;
        });
        console.log('userSelectedIndex',userSelectedIndex);
          this.locationSecondaryList[userSelectedIndex].isPrimary = true;
          this.locationSecondaryList[userSelectedIndex].isSelected = true;
          const primaryId = this.isPrimaryId;
          if (primaryId) {
            const existingPrimaryIndex = this.locationSecondaryList.findIndex(function (loc) {
              return loc.id === primaryId;
            });
            this.locationSecondaryList[existingPrimaryIndex].isPrimary = false;
            this.locationSecondaryList[existingPrimaryIndex].isSelected = false;

          }
        this.isPrimaryId = locationId;
        this.locationSecondaryList = [].concat(this.locationSecondaryList);

        this.cdf.detectChanges();
      }
  }
  onLocationChange(locationId,type = null) {
    this.resetLinkLocationsAndDepartments();
    if (this.userDetails.userType !== 'player') {
      this.copyOfLinkLocationsIds.push(locationId);
    } else {
      this.user.location_id = locationId;
      // isSelected: forceSelected
      this.addUser.form.markAsDirty();
      this.departments = [];
      this.user.department_id = 0;
      this.getDepartmentsByLocation(this.user.location_id);
    }
  }

  resetLinkLocationsAndDepartments() {
    this.user.link_locations = [];
    this.user.link_departments = [];
  }
  resetLinkSecoundaryLocationsAndDepartments() {
    this.user.link_sec_locations = [];
    this.user.link_sec_departments = [];
  }

  onDepartmentChange(departmentId) {
    this.user.department_id = departmentId;
    this.addUser.form.markAsDirty();
  }
  onPrimaryDepartmentChange(departmentId) {
    this.user.department_id = departmentId;
    this.addUser.form.markAsDirty();
  }

  onCountrySelectionChanged(countryId) {
    this.user.country_id = countryId;
    // Reset state id on Country selection change
    this.user.state_id = 0;
    this.getStates(countryId);
    this.addUser.form.markAsDirty();
  }

  onStateSelectionChanged(stateId) {
    this.user.state_id = stateId;
    this.addUser.form.markAsDirty();
  }

  onTimeZoneSelectionChanged(timezoneId) {
    this.user.manager_tz_id = timezoneId;
    this.selectedTimezoneId = timezoneId;
    this.addUser.form.markAsDirty();
    if (this.user && !this.user.isNew) {
      this.addUser.form.enable();
    }
  }

  onTypeChange(type) {
    this.user.access_type = type;
  }

  getTimeZoneByLocation(locationIds) {
    this.fetchTimezone = true;
    const payload = {
      'location_ids': locationIds
    };
    this.locationService.getTimeZoneByLocation(payload).subscribe(res => {
      const response: any = res;
      this.fetchTimezone = false;
      if (!response.success) { return; }
      this.timezones = [];
      this.timezones = response.data.timezone_list;
      this.prepareTimeZoneListForSearchSelectComponent();
    });
  }

  prepareTimeZoneListForSearchSelectComponent() {
    this.timeZoneList = [];
    const timezoneLength = this.timezones.length;
    this.timezones.forEach(tz => {
      this.timeZoneList.push({ id: tz.tz_id, title: tz.tz_name, subtitle: tz.tz_unit });
      this.fetchTimezone = timezoneLength === this.timeZoneList.length ? false : true;
    });
    if (this.user.manager_tz_id) {
      this.fetchTimezone = true;
      this.timeZoneList.forEach(tz => {
        if (tz.id === this.user.manager_tz_id) {
          tz.isSelected = true;
          this.selectedTimezoneId = tz.id;
        }
      });
      this.fetchTimezone = false;
    } else if (this.default_timezone && this.default_timezone.length) {
      this.fetchTimezone = true;
      this.timeZoneList.forEach(tz => {
        if (tz.id === this.default_timezone[0].tz_id) {
          tz.isSelected = true;
          this.selectedTimezoneId = tz.id;
        }
      });
      this.fetchTimezone = false;
    }
  }

  getDepartmentsByLocation(locationId, locationIds = null, type = null) {
    this.fetchDept = true;
    const filters = 'manager_id=' + this.loginUser.manager_id;
    this.departmentService.getDepartmentByLocation(this.storageService.getCompanyId(), 'department_name', 'asc',
      locationId, locationIds, filters, false)
      .subscribe((res) => {
        const response: any = res;
        this.fetchDept = false;
        this.fetchSecDept = false;
      
          if (!response.success) {
            return;
          }
          // Prepare department list to show into menu dropdows
            this.departments = [];
            this.departments = response.data.department_list;
            this.preparedDepartmentList = [];
            this.prepareDepartmentListForMultiSelectComponent(this.departments);
          
          // Show selected for already linked departments
          if (this.user.link_departments) {
            this.user.link_departments.forEach(linkDept => {
              this.preparedDepartmentList.forEach(dept => {
                if (dept.id === linkDept.department_id) {
                  dept.isSelected = true;
                }
              });
            });
          }
      });
  }

 
  prepareDepartmentListForMultiSelectComponent(departments, forceSelected = false) {
    departments.forEach(dept => {
      this.preparedDepartmentList = [...this.preparedDepartmentList,
      { id: dept.department_id, title: dept.department_name, isSelected: forceSelected }];
    });
  }

  fileChangeEvent(event: any): void {
    const file = event.target.files[0];
    const pathComponents = event.target.value.split('.');
    const type = pathComponents[pathComponents.length - 1].toLowerCase();
    if (type.indexOf('png') === -1 && type.indexOf('jpg') === -1 && type.indexOf('jpeg') === -1) {
      this.showAlert(this.translate.instant('invalid_file_format'), this.translate.instant('valid_img_format_msg'));
      return;
    }

    const that = this;
    const fr = new FileReader();
    fr.onload = () => { // when file has loaded
      const img = new Image();
      img.onload = () => {
        if (img.width < 100 || img.height < 100) {
          this.showAlert(this.translate.instant('img_too_small'), this.translate.instant('valid_img_size_msg_100x100'));
        } else {
          that.openCropper(event);
        }
      };
      img.src = fr.result as string; // This is the data URL
    };
    fr.readAsDataURL(file);
  }

  showAlert(title, message) {
    const dialogReference = this.dialog.open(ConfirmActionComponent, {
      data: event
    });
    dialogReference.componentInstance.title = title;
    dialogReference.componentInstance.message = message;
    dialogReference.componentInstance.isMultiOption = false;
    dialogReference.componentInstance.positiveButtonText = this.translate.instant('ok_uppercase');
  }

  openCropper(event) {
    const dialogRef = this.dialog.open(CropImageComponent, {
      data: event
    });
    dialogRef.componentInstance.maxHeight = 512;
    dialogRef.componentInstance.maxWidth = 512;
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const profile_name = new Date().getTime();
        this.user.profile_image_url = result.base64;
        const company_identifier = this.company.company_name.replace(/\s/g, '');
        const path = environment.env_name + '/' + company_identifier + '/profile/' + profile_name + '.jpg';
        this.croppedImage.path = path;
        this.croppedImage.blob = result.blobedData;
        this.addUser.form.markAsDirty();
      }
    });
    dialogRef.componentInstance.title = this.translate.instant('edit_profile_img');
  }

  saveUser() {
    if (!this.shouldPasswordMatch()) {
      this.showAlert(this.translate.instant('error'), this.translate.instant('password_nt_match'));
      return;
    }
    this.user.isUpdating = true;
    this.is_loading = true;
    if (this.croppedImage.path) {
      const that = this;
      this.uploaderService.upload(this.croppedImage.path, this.croppedImage.blob, function (err, data) {
        if (!data) {
          that.globalService.showMessage(that.translate.instant('problem_with_uploading_player_profile'));
          return;
        }
        that.user.profile_image_url = data.Location;
        that.add();
      },true,'Uploading...','',true);
    } else {
      this.add();
    }
  }

  add() {
    if (this.userDetails && this.userDetails.userType === Constants.MANAGER) {
      this.addManagerDetails();
    } else {
      this.addPlayerDetails();
    }
  }

  addPlayerDetails() {

    const payload = this.createUserPayload();
    this.playerService.addPlayer(payload).subscribe((res) => {
      this.user.isUpdating = false;
      const response = res;
      this.is_loading = false;
      if (!response.success) {
        if (response.message_code === 'PLAYER_LIMIT_EXCEEDED') {
          this.showLimit(response, UsageLimit.PLAYER_EXCEEDED);
          this.globalService.addAdminGoogleEvent('Contract_Enforcement_Players_Manual_Adding');
          this.dialogRef.close();
          return;
        }
        this.globalService.showMessage(this.apiService.getErrorMessage(response.message_code));
        return;
      }
      this.globalService.addAdminGoogleEvent(`Users_Players_Add_Player_Information_${this.selectedTab}`);
      this.refreshPlayerList.emit();
      this.dialogRef.close();
    });
  }

  showLimit(response, limitType) {
    const displayData = this.globalService.usageLimit(response.data, limitType);
    const dialogRef = this.dialog.open(PaywallActionComponent,
      {
        disableClose: true,
        data: displayData
      });
    dialogRef.componentInstance.title = displayData.title;
    dialogRef.componentInstance.message = displayData.message;
  }

  addManagerDetails() {
    const payload = this.createUserPayload();
    this.managerService.addManager(payload).subscribe((res) => {
      this.user.isUpdating = false;
      const response = res;
      this.is_loading = false;
      if (!response.success) {
        if (response.message_code === 'MANAGER_LIMIT_EXCEEDED') {
          this.showLimit(response, UsageLimit.MANAGER_EXCEEDED);
          this.globalService.addAdminGoogleEvent('Contract_Enforcement_Managers_Manual_Adding');
          this.dialogRef.close();
          return;
        }
        this.globalService.showMessage(this.apiService.getErrorMessage(response.message_code));
        return;
      }
      this.globalService.addAdminGoogleEvent(`Users_Manager_Information_${this.selectedTab}`);
      this.refreshPlayerList.emit();
      this.dialogRef.close();
    });
  }

  updateUser() {
    if (!this.shouldPasswordMatch()) {
      this.showAlert(this.translate.instant('error'), this.translate.instant('password_nt_match'));
      return;
    }
    this.user.isUpdating = true;
    this.is_loading = true;
    if (this.croppedImage.path) {
      const that = this;
      this.uploaderService.upload(this.croppedImage.path, this.croppedImage.blob, function (err, data) {
        if (!data) {
          that.globalService.showMessage(that.translate.instant('problem_with_uploading_player_profile'));
          return;
        }
        that.user.profile_image_url = data.Location;
        that.update();
      },true,'Uploading...','',true);
    } else {
      this.update();
    }
  }

  shouldPasswordMatch() {
    if (!this.user.password) {
      return true;
    } else if (this.user.password === this.user.confirmPassword) {
      return true;
    }
    return false;
  }

  isPasswordValid() {
    if (!this.user.password && !this.user.confirmPassword) {
      return true;
    } else if (this.user.password && this.user.password.length >= 4 && this.user.password.length <= 32) {
      return true;
    } else if (this.user.confirmPassword && this.user.confirmPassword.length >= 4 && this.user.confirmPassword.length <= 32) {
      return true;
    }
    return false;
  }

  shouldDisable() {
    // console.log(this.globalService.isCompanyBelongsToCustomField() && this.globalService.isCompanyWithCustomField());
    if (!this.globalService.isCompanyBelongsToCustomField()) {
      if ((this.userDetails.userType === Constants.PLAYER && (!this.user.location_id || !this.user.department_id))
        || ((this.user.access_type === Role.MID_MANAGER || this.user.access_type === Role.TEAM_LEAD)
          && !(this.user.link_departments && this.user.link_departments.length && this.selectedTimezoneId)) || !this.isPasswordValid()
        ) {
        return true;
      }
    }
    return false;
  }
  checkSecLocDept(){    
    const array = this.secAllFields;
    const key1 = 'location_id';
    const key2 = 'department_id';
    // function areKeysAndValuesPresent(array, key1, key2) {
      for (const obj of array) {
        if (obj[key1] === '' && obj[key2] === '') {
          return false; // Found a matching object
        }else if (obj[key1] !== '' && obj[key2] === '') {
          return true;
        }
      }
      return false; // No matching object found

  }

  update() {
    if (this.userDetails && this.userDetails.userType === Constants.MANAGER) {
      this.updateManagerDetails();
    } else {
      this.updatePlayerDetails();
    }
  }

  updatePlayerDetails() {
    this.is_loading = true;
    const payload = this.createUserPayload();
    this.playerService.updatePlayer(payload).subscribe((res) => {
      this.user.isUpdating = false;
      const response = res;
      this.is_loading = false;
      if (!response.success) {
        this.globalService.showMessage(this.apiService.getErrorMessage(response.message_code));
        return;
      }
      this.globalService.addAdminGoogleEvent(`Users_Players_Edit_Player_Information_${this.selectedTab}`);
      this.refreshPlayerList.emit();
      this.dialogRef.close();
    });
  }

  updateManagerDetails() {
    this.is_loading = true;
    const payload = this.createUserPayload();

    console.log("user payload in update manager", payload)
    this.managerService.updateManager(payload).subscribe((res) => {
      this.user.isUpdating = false;
      const response = res;
      this.is_loading = false;
      if (!response.success) {
        this.globalService.showMessage(this.apiService.getErrorMessage(response.message_code));
        return;
      }
      this.globalService.addAdminGoogleEvent(`Users_Manager_Edit_Information_${this.selectedTab}`);
      // Update header if editing profile
      const loginUserId = +this.storageService.getLoginUserID();
      if (+this.user.manager_id === loginUserId) {
        this.storageService.userPersonalData['first_name'] = this.user.first_name;
        this.storageService.userPersonalData['last_name'] = this.user.last_name;
        this.storageService.userPersonalData['user_name'] = this.user.user_name;
        this.loginUser['global_id'] = this.user.global_id;
        this.storageService.userPersonalData['email'] = this.user.email;
        this.storageService.userPersonalData['profile_image_url'] = this.user.profile_image_url;
        this.storageService.setUser(this.loginUser);
        this.managerService.updateLoggedInUserDetails();
        this.globalService.addAdminGoogleEvent(`Homescreen_Header_Bar_By_Self_Profile_Edited_${this.selectedTab}`);
      }
      this.refreshPlayerList.emit();
      this.dialogRef.close();
    });

  }
  deleteLogo() {
    const dialogReference = this.dialog.open(ConfirmActionComponent, {
      data: event
    });
    dialogReference.componentInstance.title = this.translate.instant('confirm_action');
    dialogReference.componentInstance.message = this.translate.instant('confirm_delete_asset');
    dialogReference.componentInstance.negativeButtonText = this.translate.instant('yes_uppercase');
    dialogReference.componentInstance.positiveButtonText = this.translate.instant('no_uppercase');
    dialogReference.componentInstance.onNegativeAction.subscribe(() => {
      this.croppedImage.blob = '';
      this.croppedImage.path = '';
      this.user.profile_image_url = '';
      this.logo = defaultLogoUrl;
      this.addUser.form.markAsDirty();
    });
  }
  confirmDeletion(user) {
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: event
    });
    const message = user.access_type ?
      this.translate.instant('confirm_delete_this_manager') : this.translate.instant('confirm_delete_this_player');
    dialogRef.componentInstance.message = message;
    dialogRef.componentInstance.negativeButtonText = this.translate.instant('yes_uppercase');
    dialogRef.componentInstance.positiveButtonText = this.translate.instant('no_uppercase');
    dialogRef.componentInstance.onNegativeAction.subscribe(() => {
      this.deleteUser(user);
    });
  }

  deleteUser(user) {
    this.userDeleted.emit(user.access_type ? user.manager_id : user.player_id);
    this.dialogRef.close();
  }

  createUserPayload() {

    if (this.userDetails && this.user && this.user.date_of_birth) {
      this.startDate = this.user.date_of_birth;
      this.dob = this.datePipe.transform(this.startDate, 'yyyy-MM-dd');
    }

    let payload = {
      'first_name': this.trimWhitespaces(this.user.first_name),
      'last_name': this.trimWhitespaces(this.user.last_name),
      'user_name': this.trimWhitespaces(this.user.user_name),
      'global_id': this.trimWhitespaces(this.user.global_id),
      'email': this.trimWhitespaces(this.user.email),
      'company_id': +this.user.company_id,
      'profile_image_url': this.user.profile_image_url || '',
      'title': this.trimWhitespaces(this.user.title) || '',
      'country_id': +this.user.country_id || 0,
      'state_id': +this.user.state_id || 0,
      'city': this.user.city || '',
      'date_of_birth': this.dob ? this.dob : '',
      'college': this.user.college || '',
      'college_graduation_year': +this.year || 0,
      'college_major': this.user.college_major || '',
      'highest_degree_id': +this.user.highest_degree_id || 0,
      'employee_id': this.user.employee_id || '',
      'eth_id': +this.user.eth_id || 0,
      'password': this.user.password || '',
    };
    payload = this.globalService.removeEmptyFields(payload);
    // TODO
    console.log("userdetails in the createPayload", this.userDetails)
    console.log("user in the create payload", this.user);
    if (this.userDetails && this.userDetails.userType === Constants.MANAGER) {
      payload['manager_id'] = +this.user.manager_id;
      payload['access_type'] = this.user.access_type;
      if (this.user.access_type === Role.MANAGER) {
        // reset location and department for manager
        payload['location_id'] = 0;
        payload['department_id'] = 0;
      } else {
        // location and department compulsory except for manager
        payload['location_id'] = +this.user.location_id;
        payload['department_id'] = +this.user.department_id;
      }
    } else {
      payload['player_id'] = +this.user.player_id;
      payload['group_id'] = this.user.group_id || 0;
      payload['location_id'] = +this.user.location_id;
      payload['department_id'] = +this.user.department_id;

      if (this.globalService.isCompanyWithCustomField()) {
        const custom_fields = {};
        this.user.company_custom_fields.forEach(element => {
          custom_fields[element.key] = (element.value).trim();
        });
        payload['custom_fields'] = custom_fields;
      }

    }

    // new code for secoundary loc n dept
    if (this.userDetails.userType === 'player') {
      payload['secondary_locations_department'] = this.filterIdsFromArrayOfObjectsSEC(this.secAllFields);
  
      }

    // Link/Unlink Location/Department is only the part of MM and T
    if (this.user.access_type === Role.MID_MANAGER || this.user.access_type === Role.TEAM_LEAD) {
      // Get ids of link locations
      if (this.copyOfLinkLocationsIds && this.copyOfLinkLocationsIds.length) {
        payload['link_locations'] = this.copyOfLinkLocationsIds;
      }

      // Get ids of link departments
      if (this.user.link_departments && this.user.link_departments.length) {
        this.user.link_departments_ids = [];
        this.user.link_departments_ids = this.filterIdsFromArrayOfObjects(this.user.link_departments, 'department_id');
        payload['link_departments'] = this.user.link_departments_ids;
      }

      // Finding unlinked locations
      const unlinkLocations = this.selectedLinkLocationsIds.filter(loc => !this.copyOfLinkLocationsIds.includes(loc));
      if (unlinkLocations) {
        payload['unlink_locations'] = unlinkLocations;
      }
      // Finding unlinked departments
      const unlinkDepts = this.copyOfLinkDepartmentsIds.filter(dept => !this.user.link_departments_ids.includes(dept));
      if (unlinkDepts) {
        payload['unlink_departments'] = unlinkDepts;
      }

      if (this.user.manager_tz_id) {
        payload['manager_tz_id'] = this.user.manager_tz_id;
      } else if (this.default_timezone && this.default_timezone.length && this.default_timezone[0].tz_id) {
        payload['manager_tz_id'] = this.default_timezone[0].tz_id;
      }
    }


    console.log("user payload created : ", payload);

    return payload;
  }

  filterIdsFromArrayOfObjects(arrayToBeFilter, key) {
    if (!arrayToBeFilter) { return; }
    const arrayToBeFill = [];
    arrayToBeFilter.forEach(item => {
      arrayToBeFill.push(item[key]);
    });
    return arrayToBeFill;
  }

  trimWhitespaces(string) {
    if (string) {
      return string.replace(/\s/g, '');
    }
    return string;
  }

  selectedDepartments(newlyLinkedDepartments) {
    // Newly linked departments
    this.user.link_departments = [];
    const newDepartments = [];
    newlyLinkedDepartments.forEach(newDept => {
      newDepartments.push({ 'department_id': newDept.id, 'department_name': newDept.title });
    });
    this.user.link_departments = newDepartments;
    this.addUser.form.markAsDirty();
  }

  selectedDepartmentsSecondary(newlyLinkedDepartments) {
    this.user.link_sec_departments = [];
    const newDepartments = [];
    newlyLinkedDepartments.forEach(newDept => {
      newDepartments.push({ 'department_id': newDept.id, 'department_name': newDept.title });
    });
    this.user.link_sec_departments  = newDepartments;
    this.addUser.form.markAsDirty();
  }

  closedPanel(locationDropdownClosed) {
    // This method is used to call timezone and department for multiselect location change.
    // This method can be modified in future based on requirement of feature.
    if (locationDropdownClosed && this.isNewLocationLinked) {
      this.getTimeZoneAndDepartmentByLocation();
    }
  }


  getTimeZoneAndDepartmentByLocation() {
    if (this.copyOfLinkLocationsIds.length) {
      this.getTimeZoneByLocation(this.copyOfLinkLocationsIds);
      this.getDepartmentsByLocation(null, this.copyOfLinkLocationsIds);
    }
  }

  selectedLocations(newlyLinkedLocations) {
    this.resetLinkLocationsAndDepartments();
    const newLocationIds = [];
    newlyLinkedLocations.forEach(newLoc => {
      newLocationIds.push(newLoc.id);
    });
    this.copyOfLinkLocationsIds = newLocationIds;
    this.addUser.form.markAsDirty();
    this.departments = [];
    this.user.department_id = 0;
    this.isNewLocationLinked = true;
  }

  

  shouldDisableEditLocation() {
    if(this.featureFlagsService.isMidManagerScopeEnhancementEnabled()) {
      return this.userDetails.userType === 'player' ? this.fetchLoc : this.fetchLoc;
    }else{
      return this.userDetails.userType === 'player' ? this.fetchLoc : (this.fetchLoc || this.globalService.isRoleLimited());
    }
  }

  shouldDisableEditDepartment() {
    if(this.featureFlagsService.isMidManagerScopeEnhancementEnabled()) {
      return !this.copyOfLinkLocationsIds.length || this.fetchDept;
    }else{
      return !this.copyOfLinkLocationsIds.length || this.fetchDept || this.globalService.isRoleLimited();
    }
  }
  shouldDisableEditDepartmentSecondary() {
    console.log(this.copyOfLinkSecondaryLocationsIds.length);
    console.log(this.fetchSecDept);
    return !this.copyOfLinkSecondaryLocationsIds.length || this.fetchSecDept ;
  }

  shouldDisableEditTimeZone() {
    if(this.featureFlagsService.isMidManagerScopeEnhancementEnabled()) {
      return !this.user.link_locations || this.fetchTimezone;
    }else{
      return !this.user.link_locations || this.fetchTimezone ||
      (this.storageService.getAccessType() === Role.MID_MANAGER && this.user.access_type === Role.MID_MANAGER) ||
      (this.storageService.getAccessType() === Role.TEAM_LEAD && this.user.access_type === Role.TEAM_LEAD);
    }
  }

  shouldDisableDeptForPlayer() {
    return this.userDetails.userType === 'player' ? this.fetchDept || !this.user.location_id :
      (!this.user.location_id || this.fetchDept || !this.user.is_editable);
  }

  getTypeId() {
    switch (this.user.access_type) {
      case 'manager':
        return Role.MANAGER;
      case 'mid-manager':
        return Role.MID_MANAGER;
      case 'Team Lead':
        return Role.TEAM_LEAD;
      case 'admin':
        return Role.ADMIN;
    }
  }
  addMore() {
    const empty = {
      "location_id": '',
      'location_name': '',
      "department_id":'',
      'department_name': '',
      'location_src': JSON.parse(JSON.stringify(this.locationListSEC)),
      'department_src': [],
      'is_loading': false,
      
    };
    // this.copyOfLocationSEC = JSON.parse(JSON.stringify(this.locationListSEC));
    this.secAllFields.push(empty);
    this.linked_sec_locations_departments_count++;
    this.globalService.addAdminGoogleEvent('Add_More_Clicked');
    console.log('this.secAllFields',this.secAllFields);
    // this.getLocationSEC(); 
   
  }
  removeSecLD(index){
    this.secAllFields.splice(index, 1);
    this.linked_sec_locations_departments_count--;
    this.addUser.form.markAsDirty();
  }
  showAddMore(){
    if(this.user.isNew){
      return this.secAllFields.length < 5;
    }else{
      return this.secAllFields.length + this.user['linked_sec_locations_departments_count']; 

    }
    // return user?.linked_sec_locations_departments_count + secAllFields.length < 5
  }
  onLocationSEC(locationId,field){
    field.location_id = locationId;
    field.department_id = '';
    field.is_loading = true;
    this.addUser.form.markAsDirty();
    this.getDepartmentsByLocationSEC(locationId,field);
  }
  onDepartmentSEC(departmentId,field){
    field.department_id = departmentId;
    this.addUser.form.markAsDirty();

    // this.getDepartmentsByLocationSEC(locationId,field);
  }
  getLocationSEC(){
    // this.fetchLoc = true;
    // this.fetchSecLoc = true;
    const filters = 'manager_id=' + this.loginUser.manager_id;
    this.locationService.getLocations(this.storageService.getCompanyId(), 'location_name', 'asc', 0, 0, filters, false).subscribe((res) => {
      const response: any = res;
      if (!response.success) { return; }
      response.data.location_list;
      console.log(response.data.location_list);
      if (this.userDetails.userType === 'player') {
      // this.prepareLocationListForSEC(response.data.location_list);
      this.prepareLocationListForSEC(JSON.parse(JSON.stringify(response.data.location_list)));

      }
    });
  }
  prepareLocationListForSEC(Locations, forceSelected = false,) {
    console.log(Locations);
    Locations.filter(loc => {
      // field.location_src = [...field.location_src,
      this.locationListSEC = [...this.locationListSEC,
      { id: loc.location_id, title: loc.location_name, isSelected: forceSelected }];
    });
  }
  getDepartmentsByLocationSEC(locationId, field, isNew = true, locationIds = null, type = null) {
    const filters = 'manager_id=' + this.loginUser.manager_id;
    this.departmentService.getDepartmentByLocation(this.storageService.getCompanyId(), 'department_name', 'asc',
      locationId, locationIds, filters, false)
      .subscribe((res) => {
        const response: any = res;
        field.is_loading = false;
        if (!response.success) {
          return;
        }
        console.log('response',response)
        this.prepareDepartmentListForSEC(response.data.department_list, field, isNew);
      });
  }
  
  prepareDepartmentListForSEC(departments, field,isNew = true, forceSelected = false,) {
    // console.log('departments',departments);
    // console.log('field',field);
    // console.log('fthis.secAllFields',this.secAllFields);
      field['department_src'] = [];
      if(!isNew){
        field['location_src'] = [];
        field['location_src'] = JSON.parse(JSON.stringify(this.locationListSEC));
      }
    
    departments.filter(dept => {
      field['department_src'] = [...field['department_src'],
      { id: dept.department_id, title: dept.department_name, isSelected: forceSelected }];
    });
  }

  filterIdsFromArrayOfObjectsSEC(allFields) {
    console.log('allFields',allFields);
   const newObject=[];
    allFields.forEach(newDept => {
      if(newDept.location_id){
        newObject.push({ 'location_id':newDept.location_id, 'department_id': newDept.department_id });
      }
    });
    return newObject;
}

}

// updateExistUser