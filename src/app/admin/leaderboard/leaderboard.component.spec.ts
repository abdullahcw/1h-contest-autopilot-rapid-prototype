import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { imports } from 'src/app/app-testing.imports';
import { providers } from 'src/app/app-testing.providers';

import { LeaderboardComponent } from './leaderboard.component';
import { ApiService } from 'src/app/services/network/api.service';
import { RequestManagerService } from 'src/app/services/network/request-manager.service';
import { LeaderboardService } from 'src/app/services/leaderboard/leaderboard.service';
import { DelegateService } from 'src/app/services/delegate/delegate.service';
import { CompanyService } from 'src/app/services/company/company.service';

describe('LeaderboardComponent', () => {
  let component: LeaderboardComponent;
  let fixture: ComponentFixture<LeaderboardComponent>;
  let requestSpy: any;

  const leaderboardServicestub= jasmine.createSpyObj('LeaderboardService',['getLeaderboardSettings']);

  let translate: TranslateService; 

  beforeEach((done) => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
      setTimeout(() => {
        done();
      }, 500);
    TestBed.configureTestingModule({
      declarations: [LeaderboardComponent],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      imports: [
        imports
      ],
      providers: [
        TranslateService,
        DelegateService,
        { provide:LeaderboardService , useValue: leaderboardServicestub },
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
    fixture = TestBed.createComponent(LeaderboardComponent);
    component = fixture.componentInstance;

    const mockLeaderboardService = [];
    leaderboardServicestub.getLeaderboardSettings.and.returnValue(of(mockLeaderboardService));
    fixture.detectChanges();
  });

  it('should create', waitForAsync(() => {
    expect(component).toBeTruthy();
  }));

  it('should clear the last leaderboard', waitForAsync(() => {
    component.leaderboardSettings.leaderboards = [
      {
        key: "all",
        option: "All",
        text: "All"
      },
      {
        fields: [
          {
            key: "location_ids",
            option: "Location",
            selected: true,
            text: "Location",
          },
          {
            key: "department_ids",
            option: "Department",
            selected: true,
            text: "Department",
          },
          {
            key: "group",
            option: "Group",
            selected: true,
            text: "Group",
          }, 
          {
            key: "group_by_player",
            option: "Group By Player",
            selected: true,
            text: "Group By Player",
          }
        ],
        key: "department_ids",
        option: "Department",
        text: "Department",
      },
      {
        fields: [
          {
            key: "location_ids",
            option: "Location",
            selected: true,
            text: "Location",
          },
          {
            key: "department_ids",
            option: "Department",
            selected: true,
            text: "Department",
          },
          {
            key: "group",
            option: "Group",
            selected: true,
            text: "Group",
          }, 
          {
            key: "group_by_player",
            option: "Group By Player",
            selected: true,
            text: "Group By Player",
          }
        ],
        key: "group_by_player",
        option: "Group By Player",
        text: "Group",
      }
    ];

    fixture.detectChanges();
    component.clearLeaderboard(2);
    expect(component.leaderboardSettings.leaderboards[2].option).toBe('');
    expect(component.leaderboardSettings.leaderboards[2].key).toBe('');
    expect(component.leaderboardSettings.leaderboards[2].text).toBe('');
  }));

  it('should check if leaderboard has same name or not', waitForAsync(() => {
    component.leaderboardSettings.leaderboards = [
      {
        key: "all",
        option: "All",
        text: "All"
      },
      {
        fields: [
          {
            key: "location_ids",
            option: "Location",
            selected: true,
            text: "Location",
          },
          {
            key: "department_ids",
            option: "Department",
            selected: true,
            text: "Department",
          },
          {
            key: "group",
            option: "Group",
            selected: true,
            text: "Group",
          }, 
          {
            key: "group_by_player",
            option: "Group By Player",
            selected: true,
            text: "Group By Player",
          }
        ],
        key: "department_ids",
        option: "Department",
        text: "Department",
      },
      {
        fields: [
          {
            key: "location_ids",
            option: "Location",
            selected: true,
            text: "Location",
          },
          {
            key: "department_ids",
            option: "Department",
            selected: true,
            text: "Department",
          },
          {
            key: "group",
            option: "Group",
            selected: true,
            text: "Group",
          }, 
          {
            key: "group_by_player",
            option: "Group By Player",
            selected: true,
            text: "Group By Player",
          }
        ],
        key: "group_by_player",
        option: "Group By Player",
        text: "Group",
      }
    ];

    fixture.detectChanges();

    component.checkLeaderboardName();
    expect(component.hasSameName).toBeFalsy();
  }));

  it('should toggle last date reset flag', waitForAsync(() => {
    component.isLastResetDateSelected = true;
    component.isLastDateSelected();
    expect(component.isLastResetDateSelected).toBeFalsy();
    component.isLastDateSelected();
    expect(component.isLastResetDateSelected).toBeTruthy();
  }));

  it('should toggle next date reset flag', waitForAsync(() => {
    component.isNextResetDateSelected = true;
    component.isNextDateSelected();
    expect(component.isNextResetDateSelected).toBeFalsy();
    component.isNextDateSelected();
    expect(component.isNextResetDateSelected).toBeTruthy();
  }));

  it('should prepare custom leaderboard', waitForAsync(() => {

    component.leaderboardSettings.leaderboards = [
      {
        key: "all",
        option: "All",
        text: "All"
      },
      {
        fields: [],
        key: "department_ids",
        option: "Department",
        text: "Department",
      },
      {
        fields: [],
        key: "group_by_player",
        option: "Group By Player",
        text: "Group",
      }
    ];

    const customfields = [
      {
        allow_multiselection: true,
        filter_key: "location_ids",
        is_custom: true,
        key_id: "location_ids",
        title: "Location",
      },
      {
        allow_multiselection: true,
        filter_key: "department_ids",
        is_custom: true,
        key_id: "department_ids",
        title: "Department",
      },
      {
        allow_multiselection: true,
        filter_key: "group",
        is_custom: true,
        key_id: "group_ids",
        title: "Group",
      },
      {
        allow_multiselection: true,
        filter_key: "group_by_player",
        is_custom: true,
        key_id: "group_by_player_ids",
        title: "Group By Player",
      }
    ];
    
    component.prepareList(customfields);
    fixture.detectChanges();
    expect(component.customfields1).toBeTruthy();
    expect(component.customfields2).toBeTruthy();

    expect(component.leaderboardSettings.leaderboards[1]['fields'].length).toBeGreaterThan(0)
    expect(component.leaderboardSettings.leaderboards[2]['fields'].length).toBeGreaterThan(0)

  }));

  it('should create payload for updating custom leaderboard', waitForAsync(() => {
    component.leaderboardSettings.leaderboards = [
      {
        key: "all",
        option: "All",
        text: "All"
      },
      {
        fields: [
          {
            key: "location_ids",
            option: "Location",
            selected: true,
            text: "Location",
          },
          {
            key: "department_ids",
            option: "Department",
            selected: true,
            text: "Department",
          },
          {
            key: "group",
            option: "Group",
            selected: true,
            text: "Group",
          }, 
          {
            key: "group_by_player",
            option: "Group By Player",
            selected: true,
            text: "Group By Player",
          }
        ],
        key: "department_ids",
        option: "Department",
        text: "Department",
      },
      {
        fields: [
          {
            key: "location_ids",
            option: "Location",
            selected: true,
            text: "Location",
          },
          {
            key: "department_ids",
            option: "Department",
            selected: true,
            text: "Department",
          },
          {
            key: "group",
            option: "Group",
            selected: true,
            text: "Group",
          }, 
          {
            key: "group_by_player",
            option: "Group By Player",
            selected: true,
            text: "Group By Player",
          }
        ],
        key: "group",
        option: "Group",
        text: "Store",
      }
    ];

    component.leaderboardPayload = component.createLeaderboardPayload();
    expect(component.leaderboardPayload.leaderboards.length).toBeGreaterThan(0);

  }));

  it ('should filter options for every leaderboard on selection change', waitForAsync(() => {
    component.leaderboardSettings.leaderboards = [
      {
        key: "all",
        option: "All",
        text: "All"
      },
      {
        fields: [
          {
            key: "location_ids",
            option: "Location",
            selected: true,
            text: "Location",
          },
          {
            key: "department_ids",
            option: "Department",
            selected: true,
            text: "Department",
          },
          {
            key: "group",
            option: "Group",
            selected: true,
            text: "Group",
          }, 
          {
            key: "group_by_player",
            option: "Group By Player",
            selected: true,
            text: "Group By Player",
          }
        ],
        key: "department_ids",
        option: "Department",
        text: "Department",
      },
      {
        fields: [
          {
            key: "location_ids",
            option: "Location",
            selected: true,
            text: "Location",
          },
          {
            key: "department_ids",
            option: "Department",
            selected: true,
            text: "Department",
          },
          {
            key: "group",
            option: "Group",
            selected: true,
            text: "Group",
          }, 
          {
            key: "group_by_player",
            option: "Group By Player",
            selected: true,
            text: "Group By Player",
          }
        ],
        key: "group_by_player",
        option: "Group By Player",
        text: "Group",
      }
    ];

    component.filterList('Group', 2);
    expect(component.leaderboardSettings.leaderboards[2].option).toBe('Group');
  }));
});
