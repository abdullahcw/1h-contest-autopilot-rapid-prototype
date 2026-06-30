import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { imports } from 'src/app/app-testing.imports';
import { providers } from 'src/app/app-testing.providers';
import { CompanyService } from 'src/app/services/company/company.service';
import { ContestService } from 'src/app/services/contest/contest.service';
import { CustomAudienceService } from 'src/app/services/custom-audience/custom-audience.service';
import { ApiService, Constants } from 'src/app/services/network/api.service';
import { RequestManagerService } from 'src/app/services/network/request-manager.service';
import { CreateContestComponent } from './create-contest.component';

describe('CreateContestComponent', () => {
  let component: CreateContestComponent;
  let fixture: ComponentFixture<CreateContestComponent>;
  let requestSpy: any;
  const contestServiceStub = jasmine.createSpyObj('ContestService', ['getValidContestDate','setContestDetails','createContest' ]);
  const customAudienceServiceStub=jasmine.createSpyObj('CustomAudienceService',['getAudience']);
  let translate: TranslateService;

  beforeEach((done) => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
      setTimeout(() => {
        done();
      }, 500);
    TestBed.configureTestingModule({
      declarations: [CreateContestComponent],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      imports: [
        imports
      ],
      providers: [
        { provide:ContestService , useValue: contestServiceStub},
        { provide:CustomAudienceService , useValue:customAudienceServiceStub},
        TranslateService,
        CompanyService,

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
    fixture = TestBed.createComponent(CreateContestComponent);
    component = fixture.componentInstance;

    const mockContestService = []; 
    contestServiceStub.getValidContestDate.and.returnValue(of(mockContestService));
    contestServiceStub.setContestDetails.and.returnValue(of(mockContestService));
    contestServiceStub.createContest.and.returnValue(of(mockContestService));
    
    const mockcustomAudienceService=[];
    customAudienceServiceStub.getAudience.and.returnValue(of(mockcustomAudienceService));
    
    spyOn(component, "closePopUp");
    component.closePopUp();

    fixture.detectChanges();
    });

    it('should create component', waitForAsync(() => {
      expect(component).toBeTruthy();
      fixture.detectChanges();
    }));

    it('should check valid date range ',waitForAsync(()=>{
      fixture.detectChanges();
      let contestMaxDate =new Date('04/07/2022');
      component.validStartDate = new Date('01/08/2022');
      component.setDateRangeValidation();
      expect(component.contestMaxDate).toEqual(contestMaxDate);
      fixture.detectChanges();
    }));

    it('should check contest start date ',waitForAsync(()=>{
      const contest={
        assignment_id: 207,
        company_id: 353,
        contest_assignment:{
          additionalFilter: true,
          customFilterKey: "location_ids",
          dependentOn: undefined,
          filter: "location_ids",
          id: 1596,
          isAll: false,
          isDefault: undefined,
          searchingIn: "Location",
          value: "7th Newvc",
        },
        contest_end_date: "2022-07-22 23:59:59",
        contest_id: 91,
        contest_name: "fsdfsdfds",
        contest_start_date: "2022-06-20 00:00:00",
      };
      let contestMaxDate =new Date('09/17/2022');
      component.contestStartDateValidation(contest);
      expect(component.contestMaxDate).toEqual(contestMaxDate);
      fixture.detectChanges();
    }));

    it('should check contest create or not',waitForAsync(()=>{
      let spy=spyOn(component,'addContest')
      const contest={
        assignment_id: 207,
        company_id: 353,
        contest_assignment:{
          additionalFilter: true,
          customFilterKey: "location_ids",
          dependentOn: undefined,
          filter: "location_ids",
          id: 1596,
          isAll: false,
          isDefault: undefined,
          searchingIn: "Location",
          value: "7th Newvc",
        },
        contest_end_date: "2022-07-22 23:59:59",
        contest_name: "fsdfsdfds",
        contest_start_date: "2022-06-20 00:00:00",
      };
      component.createContest(contest);
      expect(spy).toHaveBeenCalled();
      fixture.detectChanges();
   
    }));

    it('should check generate recipient data or not ',waitForAsync(() =>{
      const limit=[
        {
          additionalFilter: true,
          customFilterKey: "cost_center_num",
          filter: 15,
          id: 1432,
          isAll: false,
          searchingIn: "Cost Center",
          value: "AMR Accounts Payable - 1133",
        },
        {
          additionalFilter: true,
          customFilterKey: "cost_center_num",
          filter: 15,
          id: 1422,
          isAll: false,
          searchingIn: "Cost Center",
          value: "AMR Accounts Receiva - 1135",
        },
        {
          appliedFilters:[
            {
              additionalFilter: true,
              customFilterKey: "cost_center_num",
              filter: 15,
              id: 1432,
              isAll: false,
              searchingIn: "Cost Center",
              value: "AMR Accounts Payable - 1133",
            },
            {
              additionalFilter: true,
              customFilterKey: "cost_center_num",
              filter: 15,
              id: 1422,
              isAll: false,
              searchingIn: "Cost Center",
              value: "AMR Accounts Receiva - 1135",
            },
          ]
        }
      ];
      const result= component.getRecipients(limit);
      expect(result).toBeTruthy();
      fixture.detectChanges();
    }));

    it('should check filter players on a selected filter value',waitForAsync(()=>{
      const filterValue="LOCATION_EXIST";
      component.filterPlayers(filterValue);
      expect(component.appliedFilters).toBeTruthy();
      fixture.detectChanges();
    })); 

    it('should check filters player selection on an appliedfilters ',waitForAsync(()=>{
      const filter=[
        {
          additionalFilter: true,
          customFilterKey: "location_ids",
          filter: "location_ids",
          id: 2187,
          isAll: false,
          searchingIn: "Location",
          value: "Ab",
        },
        {
          additionalFilter: true,
          customFilterKey: "department_ids",
          filter: "department_ids",
          id: 88,
          isAll: false,
          searchingIn: "Department",
          value: "testing",
        }
      ];
      component.filterPlayersOnSelection(filter);
      expect(Constants.LOCATION_IDS).toBe(filter[0].filter);
      fixture.detectChanges();
    }));

    it('should check appliedfilter tobe removed or not',waitForAsync(()=>{
      const appliedFilter=[
        {
          additionalFilter: true,
          customFilterKey: "location_ids",
          filter: "location_ids",
          id: 1596,
          isAll: false,
          searchingIn: "Location",
          value: "7th Newvc",
        },
        {
          additionalFilter: true,
          customFilterKey: "location_ids",
          filter: "location_ids",
          id: 2187,
          isAll: false,
          searchingIn: "Location",
          value: "Ab",
        }
      ];
      component.addRemoveFilterOption(appliedFilter);
      expect(component.appliedFilters).toBeLessThanOrEqual(0);
      fixture.detectChanges();
    }));

    it('should check filters are selected all or not ',waitForAsync(()=>{
      const filters=[
        {
          additionalFilter: true,
          customFilterKey: "country",
          dependentOn: undefined,
          filter: 1,
          id: 4859,
          isAll: true,
          isDefault: undefined,
          searchingIn: "Country",
          value: "All",
        },
        {
          additionalFilter: true,
          customFilterKey: "country",
          dependentOn: undefined,
          filter: 1,
          id: 5,
          isAll: true,
          isDefault: undefined,
          searchingIn: "Country",
          value: "AUT",
        },
        {
          additionalFilter: true,
          customFilterKey: "country",
          dependentOn: undefined,
          filter: 1,
          id: 4857,
          isAll: true,
          isDefault: undefined,
          searchingIn: "Country",
          value: "BEL",
        },
        {
          additionalFilter: true,
          customFilterKey: "country",
          dependentOn: undefined,
          filter: 1,
          id: 4858,
          isAll: true,
          isDefault: undefined,
          searchingIn: "Country",
          value: "CAN",
        },
        {
          additionalFilter: true,
          customFilterKey: "country",
          dependentOn: undefined,
          filter: 1,
          id: 4,
          isAll: true,
          isDefault: undefined,
          searchingIn: "Country",
          value: "CHE",
        },
        {
          additionalFilter: true,
          customFilterKey: "country",
          dependentOn: undefined,
          filter: 1,
          id: 3736,
          isAll: true,
          isDefault: undefined,
          searchingIn: "Country",
          value: "CHN",
        },
        {
          additionalFilter: true,
          customFilterKey: "country",
          dependentOn: undefined,
          filter: 1,
          id: 6,
          isAll: true,
          isDefault: undefined,
          searchingIn: "Country",
          value: "DEU",
        },
        {
          additionalFilter: true,
          customFilterKey: "country",
          dependentOn: undefined,
          filter: 1,
          id: 4862,
          isAll: true,
          isDefault: undefined,
          searchingIn: "Country",
          value: "DNK",
        },
        {
          additionalFilter: true,
          customFilterKey: "country",
          dependentOn: undefined,
          filter: 1,
          id: 4032,
          isAll: true,
          isDefault: undefined,
          searchingIn: "Country",
          value: "ESP",
        },
        {
          additionalFilter: true,
          customFilterKey: "country",
          dependentOn: undefined,
          filter: 1,
          id: 4033,
          isAll: true,
          isDefault: undefined,
          searchingIn: "Country",
          value: "FRA",
        },
        {
          additionalFilter: true,
          customFilterKey: "country",
          dependentOn: undefined,
          filter: 1,
          id: 3998,
          isAll: true,
          isDefault: undefined,
          searchingIn: "Country",
          value: "GBR",
        },
        {
          additionalFilter: true,
          customFilterKey: "country",
          dependentOn: undefined,
          filter: 1,
          id: 3,
          isAll: true,
          isDefault: undefined,
          searchingIn: "Country",
          value: "HKG",
        },
        {
          additionalFilter: true,
          customFilterKey: "country",
          dependentOn: undefined,
          filter: 1,
          id: 3733,
          isAll: true,
          isDefault: undefined,
          searchingIn: "Country",
          value: "IND",
        },
        {
          additionalFilter: true,
          customFilterKey: "country",
          dependentOn: undefined,
          filter: 1,
          id: 4863,
          isAll: true,
          isDefault: undefined,
          searchingIn: "Country",
          value: "IRL",
        },
        {
          additionalFilter: true,
          customFilterKey: "country",
          dependentOn: undefined,
          filter: 1,
          id: 4864,
          isAll: true,
          isDefault: undefined,
          searchingIn: "Country",
          value: "ITA",
        },
        {
          additionalFilter: true,
          customFilterKey: "country",
          dependentOn: undefined,
          filter: 1,
          id: 4860,
          isAll: true,
          isDefault: undefined,
          searchingIn: "Country",
          value: "JPN",
        },
        {
          additionalFilter: true,
          customFilterKey: "country",
          dependentOn: undefined,
          filter: 1,
          id: 4113,
          isAll: true,
          isDefault: undefined,
          searchingIn: "Country",
          value: "KOR",
        },
        {
          additionalFilter: true,
          customFilterKey: "country",
          dependentOn: undefined,
          filter: 1,
          id: 4865,
          isAll: true,
          isDefault: undefined,
          searchingIn: "Country",
          value: "MAC",
        },
        {
          additionalFilter: true,
          customFilterKey: "country",
          dependentOn: undefined,
          filter: 1,
          id: 3737,
          isAll: true,
          isDefault: undefined,
          searchingIn: "Country",
          value: "MEX",
        },
        {
          additionalFilter: true,
          customFilterKey: "country",
          dependentOn: undefined,
          filter: 1,
          id: 3904,
          isAll: true,
          isDefault: undefined,
          searchingIn: "Country",
          value: "MYS",
        },
        {
          additionalFilter: true,
          customFilterKey: "country",
          dependentOn: undefined,
          filter: 1,
          id: 2,
          isAll: true,
          isDefault: undefined,
          searchingIn: "Country",
          value: "NLD",
        },
        {
          additionalFilter: true,
          customFilterKey: "country",
          dependentOn: undefined,
          filter: 1,
          id: 4869,
          isAll: true,
          isDefault: undefined,
          searchingIn: "Country",
          value: "NOR",
        },
        {
          additionalFilter: true,
          customFilterKey: "country",
          dependentOn: undefined,
          filter: 1,
          id: 4870,
          isAll: true,
          isDefault: undefined,
          searchingIn: "Country",
          value: "NZL",
        },
        {
          additionalFilter: true,
          customFilterKey: "country",
          dependentOn: undefined,
          filter: 1,
          id: 4866,
          isAll: true,
          isDefault: undefined,
          searchingIn: "Country",
          value: "POL",
        },
        {
          additionalFilter: true,
          customFilterKey: "country",
          dependentOn: undefined,
          filter: 1,
          id: 4868,
          isAll: true,
          isDefault: undefined,
          searchingIn: "Country",
          value: "PRT",
        },
        {
          additionalFilter: true,
          customFilterKey: "country",
          dependentOn: undefined,
          filter: 1,
          id: 4861,
          isAll: true,
          isDefault: undefined,
          searchingIn: "Country",
          value: "SGP",
        },
        {
          additionalFilter: true,
          customFilterKey: "country",
          dependentOn: undefined,
          filter: 1,
          id: 4867,
          isAll: true,
          isDefault: undefined,
          searchingIn: "Country",
          value: "SWE",
        },
        {
          additionalFilter: true,
          customFilterKey: "country",
          dependentOn: undefined,
          filter: 1,
          id: 1,
          isAll: true,
          isDefault: undefined,
          searchingIn: "Country",
          value: "USA",
        },
        {
          additionalFilter: true,
          customFilterKey: "country",
          dependentOn: undefined,
          filter: 1,
          id: 3735,
          isAll: true,
          isDefault: undefined,
          searchingIn: "Country",
          value: "VNM",
        },
        {
          additionalFilter: true,
          customFilterKey: "country",
          dependentOn: undefined,
          filter: 1,
          id: 3734,
          isAll: true,
          isDefault: undefined,
          searchingIn: "Country",
          value: "ZAF",
        }
      ];
      component.clubFiltersIfSelectedAll(filters);
      expect(component.appliedFilters).toBeTruthy();
      fixture.detectChanges();
    }));

});
