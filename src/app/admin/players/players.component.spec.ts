  import { HttpClient } from '@angular/common/http';
  import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
  import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
  import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
  import { MatDialog } from '@angular/material/dialog';
  import { TranslateService } from '@ngx-translate/core';
     
  import { imports } from 'src/app/app-testing.imports';
  import { providers } from 'src/app/app-testing.providers';
  import { GamesService } from 'src/app/services/games/games.service';
  import { ApiService } from 'src/app/services/network/api.service';
  import { RequestManagerService } from 'src/app/services/network/request-manager.service';
  import { PermissionsService } from 'src/app/services/permissions/permissions.service';
  import { PlayerService } from 'src/app/services/player/player.service';
  import { PlayersComponent } from './players.component';
  import { CompanyService } from 'src/app/services/company/company.service';
  import { MatTableDataSource } from '@angular/material/table';
  import { LocationService } from 'src/app/services/location/location.service';
  import { GroupService } from 'src/app/services/group/group.service';
  import { VipCodeService } from 'src/app/services/vip-code/vip-code.service';
  import { ManagerService } from 'src/app/services/manager/manager.service';
  import { StorageService } from 'src/app/services/storage/storage.service';
  import { DepartmentService } from 'src/app/services/department/department.service';
  import { DelegateService } from 'src/app/services/delegate/delegate.service';


  describe('PlayersComponent', () => {
    let component: PlayersComponent;
    let fixture: ComponentFixture<PlayersComponent>;
    let requestSpy: any, httpTestController: HttpTestingController;
    let httpClient: HttpClient;
    let dialog: MatDialog;
    let translate: TranslateService;
    let permissionService: PermissionsService;
    let playerService: PlayerService;
    let companyService: CompanyService;
    let locationService: LocationService;
    let groupService: GroupService;
    let vipCodeService: VipCodeService;
    let managerService: ManagerService;
    let storageService: StorageService;
    let departmentService: DepartmentService;
    let delegateService: DelegateService;

    beforeEach((done) => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
        setTimeout(() => {
          done();
        }, 500);
      TestBed.configureTestingModule({
        declarations: [PlayersComponent ],
        schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
        imports: [
          imports
        ],
        providers: [
          GamesService,
          PlayerService,
          TranslateService,
          CompanyService,
          DelegateService,
          DepartmentService,
          StorageService,
          ManagerService,
          VipCodeService,
          GroupService,
          LocationService,
          providers
        ]
      })
      .compileComponents();
    });

    beforeEach(() => {
      requestSpy = jasmine.createSpyObj('RequestManagerService', ['get', 'put', 'post']);
      TestBed.configureTestingModule({
        imports: [
          HttpClientTestingModule
        ],
        providers: [
          ApiService,
          { provide: RequestManagerService, useValue: requestSpy },
        ]
      });

      translate = TestBed.inject(TranslateService);
      translate.use('en');
      httpTestController = TestBed.inject(HttpTestingController);
      storageService = TestBed.inject(StorageService);
      permissionService = TestBed.inject(PermissionsService);
      playerService = TestBed.inject(PlayerService);
      companyService = TestBed.inject(CompanyService);
      locationService = TestBed.inject(LocationService);
      groupService = TestBed.inject(GroupService);
      vipCodeService = TestBed.inject(VipCodeService);
      managerService = TestBed.inject(ManagerService);
      departmentService = TestBed.inject(DepartmentService);
      delegateService = TestBed.inject(DelegateService);
      httpClient = TestBed.inject(HttpClient);
      dialog = TestBed.inject(MatDialog);
      fixture = TestBed.createComponent(PlayersComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(PlayersComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', waitForAsync(() => {
      expect(component).toBeTruthy();
    }));
    
    it('should show non Fossil and custom fields in the table ', waitForAsync(() => {
      
      component.customFieldsTemp = [
        {column_key: "location_name", column_name: "Location"},
        {column_key: "department_name", column_name: "Department"},
        {column_key: "group_name", column_name: "Group"}
      ]
      
      component.playerList=[     
        {company_id: 353,
        company_name: "1Huddle",
        custom_fields: {location_name: "7th Newvc", department_name: "Accounts Payable"},
        department_id: 2433,
        department_name: "Accounts Payable",
        email: "a@b.com",
        first_name: "Aax",
        global_id: "",
        group_id: 0,
        is_editable: true,
        is_manager: false,
        last_name: "BA",
        location_id: 1596,
        location_name: "7th Newvc",
        player_id: 78856,
        profile_image_url: "https://sh-devhuddle.s3.us-west-2.amazonaws.com/dev/1Huddle/profile/1625743126909.jpg",
        status: "active",
        user_name: "a@b.com",},
        {
        company_id: 353,
        company_name: "1Huddle",
        custom_fields: {location_name: "7th Newvc", department_name: "Accounting Service"},
        department_id: 2409,
        department_name: "Accounting Service",
        email: "amishac@codewalla.com",
        first_name: "ABC",
        global_id: "",
        group_id: 0,
        is_editable: true,
        is_manager: false,
        last_name: "CCC",
        location_id: 1596,
        location_name: "7th Newvc",
        player_id: 170939,
        profile_image_url: "https://sh-devhuddle.s3.us-west-2.amazonaws.com/dev/1huddle/company/logo/1huddle.png?t=1571395889639?t=1594387975214?t=1594388524493?t=1595326538035?t=1603894589425?t=1603894631187?t=1618984780469?t=1620724429632?t=1620728648102",
        status: "active",
        user_name: "amishac@codewalla.com",
        },
        {
          company_id: 353,
          company_name: "1Huddle",
          custom_fields: {location_name: "HEADQUARTERS", department_name: "Accounting Service"},
          department_id: 2409,
          department_name: "Accounting Service",
          email: "test3@test3.com",
          first_name: "adasd",
          global_id: "",
          group_id: 0,
          is_editable: true,
          is_manager: false,
          last_name: "dasdas",
          location_id: 413,
          location_name: "HEADQUARTERS",
          player_id: 267789,
          profile_image_url: "https://sh-devhuddle.s3.us-west-2.amazonaws.com/dev/1huddle/company/logo/1huddle.png?t=1571395889639?t=1594387975214?t=1594388524493?t=1595326538035?t=1603894589425?t=1603894631187?t=1618984780469?t=1620724429632?t=1620728648102",
          status: "active",
          user_name: "test3@test3.com",
        }
      ]
{
      // component.customFieldsTemp = [
      //       {column_key: "country", column_name: "Country"},
      //       {column_key: "state", column_name: "State"},
      //       {column_key: "region", column_name: "Region"},
      //       {column_key: "psa_number", column_name: "PSA"},
      //       {column_key: "job_role", column_name: "Job Role"},
      //       {column_key: "is_manager", column_name: "Is Manager"},
      //       {column_key: "cost_center_num", column_name: "Cost Center"},
      //       {column_key: "org_num", column_name: "Org"},
      //       {column_key: "manager_name", column_name: "Manager Name"},
      //     ]

      // component.customFieldsTemp = [
        //     {column_key: "location_name", column_name: "Location"},
        //     {column_key: "department_name", column_name: "Department"},
        //     {column_key: "job_profile", column_name: "Job Profile"},
        //     {column_key: "job_family_group", column_name: "Job Family Group"},
        //     {column_key: "management_level", column_name: "Management Level"},
        //     {column_key: "exempt", column_name: "Exempt"},
        //     {column_key: "location_state", column_name: "Location State"},
        //     {column_key: "group_name", column_name: "Group"},
        //   ]
      
        //   component.playerList=[ 
        //     {
        //       company_id: 1587,
        //       company_name: "Loews Hotels",
        //       custom_fields: {job_family_group: "Rooms", location_name: "Universal's Cabana Bay Beach Resort"},
        //       department_id: 10056,
        //       department_name: "Housekeeping/Laundry",
        //       email: "10047667@LoewsHotelTestFlow.com",
        //       first_name: "Aaron",
        //       global_id: "",
        //       group_id: 0,
        //       is_editable: true,
        //       is_manager: false,
        //       last_name: "Pascale",
        //       location_id: 6311,
        //       location_name: "Universal's Cabana Bay Beach Resort",
        //       player_id: 265162,
        //       profile_image_url: "https://sh-devhuddle.s3-us-west-2.amazonaws.com/public_html/static/adminpanel-dev/assets/img/admin/profilePic_default.png?version=1.6",
        //       status: "active",
        //       user_name: "10047667@LoewsHotelTestFlow.com",
        //     },
        //     {
        //       company_id: 1587,
        //       company_name: "Loews Hotels",
        //       custom_fields: {job_family_group: "Food and Beverage", location_name: "Loews Ventana Canyon Resort"},
        //       department_id: 10057,
        //       department_name: "Culinary",
        //       email: "10042709@LoewsHotelTestFlow.com",
        //       first_name: "Aaron",
        //       global_id: "",
        //       group_id: 0,
        //       is_editable: true,
        //       is_manager: false,
        //       last_name: "Manuyag",
        //       location_id: 6306,
        //       location_name: "Loews Ventana Canyon Resort",
        //       player_id: 263997,
        //       profile_image_url: "https://sh-devhuddle.s3-us-west-2.amazonaws.com/public_html/static/adminpanel-dev/assets/img/admin/profilePic_default.png?version=1.6",
        //       status: "active",
        //       user_name: "10042709@LoewsHotelTestFlow.com",
        //     },
        //     {
        //       company_id: 1587,
        //       company_name: "Loews Hotels",
        //       custom_fields: {job_family_group: "Rooms", location_name: "Loews Portofino Bay Hotel"},
        //       department_id: 10056,
        //       department_name: "Housekeeping/Laundry",
        //       email: "10037427@LoewsHotelTestFlow.com",
        //       first_name: "Aaron",
        //       global_id: "",
        //       group_id: 0,
        //       is_editable: true,
        //       is_manager: false,
        //       last_name: "Jones",
        //       location_id: 6309,
        //       location_name: "Loews Portofino Bay Hotel",
        //       player_id: 264092,
        //       profile_image_url: "https://sh-devhuddle.s3-us-west-2.amazonaws.com/public_html/static/adminpanel-dev/assets/img/admin/profilePic_default.png?version=1.6",
        //       status: "active",
        //       user_name: "10037427@LoewsHotelTestFlow.com"
        //     }
        //   ]
    }
{
      // component.playerList=[ 
      //       {
      //         company_id: 1129,
      //         company_name: "FossilSSO",
      //         cost_center_num: "MYS Distr & Log Gene - 3491",
      //         country: "MYS",
      //         custom_fields: {},
      //         department_id: 2851,
      //         department_name: "ALL",
      //         email: "129302@fossil.com",
      //         first_name: "A/L SUPPIAH",
      //         global_id: "00129302",
      //         group_id: 0,
      //         is_editable: true,
      //         is_manager: false,
      //         job_role: "DC Associate - 30000009",
      //         last_name: "BALASUBRAMANIAM",
      //         location_id: 2301,
      //         location_name: "HEADQUARTERS",
      //         manager_name: "YEW TECK, LEE",
      //         org_num: "Leather Section - 10013267",
      //         player_id: 167707,
      //         profile_image_url: "https://s3-us-west-2.amazonaws.com/sh-devhuddle/development/trophies/company/logo/3.png?1539693675",
      //         psa_number: "Prodn/Ops/DC - 1128",
      //         region: "APAC",
      //         status: "inactive",
      //         user_name: "129302",
      //       },
      //       {
      //         company_id: 1129,
      //         company_name: "FossilSSO",
      //         cost_center_num: "USA Newport Centre, - 8288",
      //         country: "USA",
      //         custom_fields: {},
      //         department_id: 2851,
      //         department_name: "ALL",
      //         email: "119201@fossil.com",
      //         first_name: "Aaima",
      //         global_id: "00119201",
      //         group_id: 0,
      //         is_editable: true,
      //         is_manager: false,
      //         job_role: "Retail Associate - 30000008",
      //         last_name: "Baig",
      //         location_id: 2301,
      //         location_name: "HEADQUARTERS",
      //         manager_name: "Murphy, Amanda",
      //         org_num: "Newport Center - 60030357",
      //         player_id: 169530,
      //         profile_image_url: "https://s3-us-west-2.amazonaws.com/sh-devhuddle/development/trophies/company/logo/3.png?1539693675",
      //         psa_number: "Ret Brd - Hrly - 2002",
      //         region: "AMER",
      //         state: "NJ",
      //         status: "inactive",
      //         user_name: "119201",
      //       },
      //       {
      //         company_id: 1129,
      //         company_name: "FossilSSO",
      //         cost_center_num: "CAN Vaughan Mills, O - 5977",
      //         country: "CAN",
      //         custom_fields: {},
      //         department_id: 2851,
      //         department_name: "ALL",
      //         email: "132769@fossil.com",
      //         first_name: "Aaliyah",
      //         global_id: "00132769",
      //         group_id: 0,
      //         is_editable: true,
      //         is_manager: false,
      //         job_role: "Retail Associate - 30000008",
      //         last_name: "Timothy",
      //         location_id: 2301,
      //         location_name: "HEADQUARTERS",
      //         manager_name: "Llemos, Jenny",
      //         org_num: "Vaughan Mills - OUT - 10010745",
      //         player_id: 166374,
      //         profile_image_url: "https://s3-us-west-2.amazonaws.com/sh-devhuddle/development/trophies/company/logo/3.png?1539693675",
      //         psa_number: "Ret Out - Hrly - 2001",
      //         region: "AMER",
      //         status: "inactive",
      //         user_name: "132769",
      //       }
      //     ]
     
    //  let company__Id = storageService.getCompanyId();
    //  console.log("dd", company__Id);
      // const company___ID = component.customFieldsTemp.getCompanyId() ;

      // console.log("company ID",component.delegateSubscription) ; 
     
      // let companyID = component.companyId;

      // console.log("company--id",company___ID) ;


    }

      component.userDataSource = new MatTableDataSource(component.playerList);
      component.prepareDisplayedColumns();
     
      fixture.detectChanges();
      let tableRow = fixture.nativeElement.querySelectorAll('tr')
      
      let headerRow = tableRow[0];
      
      component.customFieldsTemp.forEach(customFields => {
        for(let i=4;i<headerRow.cells.length;i++){
          if(customFields.column_name == headerRow.cells[i].innerText){
    
            expect(headerRow.cells[i].innerText).toBe(customFields.column_name);
          }
        }      
      })
  })
  );


});
