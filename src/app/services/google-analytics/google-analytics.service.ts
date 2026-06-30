import { Injectable } from '@angular/core';

export class EventValuesFormation {
  key = '';
  value = '';
}


export const analyticsEventValues = {

  'Dashboard_Report_By_Team': {
    'gaEvent': 'Report_By_Team',
    'gaCat': 'Dashboard Reports',
    'gaLabel': 'By Team Viewed',
  },
  'Dashboard_Report_By_Contest': {
    'gaEvent': 'Report_By_Contest',
    'gaCat': 'Dashboard Reports',
    'gaLabel': 'By Contest Viewed',
  },
  'Dashboard_Report_By_Game__Single_Level': {
    'gaEvent': 'Report_By_Game_Single_Level',
    'gaCat': 'Dashboard Reports',
    'gaLabel': 'By Game-Single level Viewed',
  },
  'Dashboard_Report_By_Game__Multilevel': {
    'gaEvent': 'Report_By_Game_Multileve',
    'gaCat': 'Dashboard Reports',
    'gaLabel': 'By Game-Multilevel Viewed',
  },
  'Dashboard_Report_By_Player': {
    'gaEvent': 'Report_By_Player',
    'gaCat': 'Dashboard Reports',
    'gaLabel': 'By Player Viewed',
  },
  'Dashboard_Report_Mode_All_Games': {
    'gaEvent': 'Report_Mode_All_Games',
    'gaCat': 'Dashboard Reports',
    'gaLabel': 'By Mode All Games',
  },
  'Dashboard_Report_Mode_Live_Games': {
    'gaEvent': 'Report_Mode_Live_Games',
    'gaCat': 'Dashboard Reports',
    'gaLabel': 'By Mode Live Games',
  },
  'Dashboard_Report_Mode_Practice_Games': {
    'gaEvent': 'Report_Mode_Practice_Games',
    'gaCat': 'Dashboard Reports',
    'gaLabel': 'By Mode Practice Games',
  },
  'Dashboard_Report_Status_Active_Players': {
    'gaEvent': 'Report_Status_Active_Players',
    'gaCat': 'Dashboard Reports',
    'gaLabel': 'By Status Active Players',
  },
  'Dashboard_Report_Status_All_Players': {
    'gaEvent': 'Report_Status_All_Players',
    'gaCat': 'Dashboard Reports',
    'gaLabel': 'By Status All Players',
  },
  'Dashboard_Report_Location': {
    'gaEvent': 'Report_Location',
    'gaCat': 'Dashboard Reports',
    'gaLabel': 'By Location',
  },
  'Dashboard_Report_Group': {
    'gaEvent': 'Report_Group',
    'gaCat': 'Dashboard Reports',
    'gaLabel': 'By Group Selected',
  },
  'Dashboard_Report_By_today': {
    'gaEvent': 'Report_By_Today',
    'gaCat': 'Dashboard Reports',
    'gaLabel': 'Date Range Today Applied',
  },
  'Dashboard_Report_By_thisWeek': {
    'gaEvent': 'Report_By_This_Week',
    'gaCat': 'Dashboard Reports',
    'gaLabel': 'Date Range This Week Applied',
  },
  'Dashboard_Report_By_lastWeek': {
    'gaEvent': 'Report_By_Last_Week',
    'gaCat': 'Dashboard Reports',
    'gaLabel': 'Date Range Last Week Applied',
  },
  'Dashboard_Report_By_thisMonth': {
    'gaEvent': 'Report_By_This_Month',
    'gaCat': 'Dashboard Reports',
    'gaLabel': 'Date Range This Month Applied',
  },
  'Dashboard_Report_By_lastMonth': {
    'gaEvent': 'Report_By_Last_Month',
    'gaCat': 'Dashboard Reports',
    'gaLabel': 'Date Range Last Month Applied',
  },
    'Dashboard_Report_By_thisQuarter': {
    'gaEvent': 'Report_By_This_Quarter',
    'gaCat': 'Dashboard Reports',
    'gaLabel': 'Date Range This Quarter Applied',
  },
  'Dashboard_Report_By_lastQuarter': {
    'gaEvent': 'Report_By_Last_Quarter',
    'gaCat': 'Dashboard Reports',
    'gaLabel': 'Date Range Last Quarter Applied',
  },
  'Dashboard_Report_Inprogress_report_expanded': {
    'gaEvent': 'Inprogress_Report_Expanded',
    'gaCat': 'Dashboard Reports',
    'gaLabel': 'Expanded Inprogress Report',
  },
  'Dashboard_Report_Won_report_expanded': {
    'gaEvent': 'Won_Report_expanded',
    'gaCat': 'Dashboard Reports',
    'gaLabel': 'Expanded Won Report',
  },
  'Dashboard_Report_Won_report_selected': {
    'gaEvent': 'Won_Report_Selected',
    'gaCat': 'Dashboard Reports',
    'gaLabel': 'Selected Won',
  },
  'Dashboard_Report_Inprogress_report_selected': {
    'gaEvent': 'Inprogress_Report_Selected',
    'gaCat': 'Dashboard Reports',
    'gaLabel': 'Selected Inprogress',
  },
  'Dashboard_Report_Leaderboard_view_all_clicked': {
    'gaEvent': 'Leaderboard_View_All_Clicked',
    'gaCat': 'Dashboard Reports',
    'gaLabel': 'View all clicked',
  },
  'Dashboard_Report_Player_report_expanded': {
    'gaEvent': 'Player_Report_Expanded',
    'gaCat': 'Dashboard Reports',
    'gaLabel': 'Expanded Report',
  },
  'Dashboard_Report_Won_filter_applied': {
    'gaEvent': 'Won_Filter_Applied',
    'gaCat': 'Dashboard Reports',
    'gaLabel': 'Applied filter Won',
  },
  'Dashboard_Report_Inprogress_filter_applied': {
    'gaEvent': 'Inprogress_Filter_Applied',
    'gaCat': 'Dashboard Reports',
    'gaLabel': 'Applied filter Inprogress',
  },
  'Dashboard_Report_Active_Players_filter_applied': {
    'gaEvent': 'Active_Players_Filter_Applied',
    'gaCat': 'Dashboard Reports',
    'gaLabel': 'Applied filter Active Players',
  },
  'Dashboard_Calendar_day_clicked': {
    'gaEvent': 'Calendar_day_clicked',
    'gaCat': 'Dashboard',
    'gaLabel': 'Clicked Calendar',
  },
  'Dashboard_SLG_question_accuracy_report_clicked': {
    'gaEvent': 'SLG_question_accuracy_report_clicked',
    'gaCat': 'Dashboard',
    'gaLabel': 'SLG Accuracy Report Clicked',
  },
  'Dashboard_SLG_open_feedback_clicked': {
    'gaEvent': 'SLG_open_feedback_clicked',
    'gaCat': 'Dashboard',
    'gaLabel': 'SLG Feedback Report Clicked',
  },
  'Dashboard_SLG_detailed_report_clicked': {
    'gaEvent': 'SLG_detailed_report_clicked',
    'gaCat': 'Dashboard',
    'gaLabel': 'SLG Detailed Report Clicked',
  },
  'Dashboard_Reports_Report_Mode_Shop_Games': {
    'gaEvent': 'Report_Mode_Shop_Games',
    'gaCat': 'Dashboard Reports',
    'gaLabel': 'By Mode Shop Games',
  },
  'Dashboard_Reports_Report_Mode_Company_Games': {
    'gaEvent': 'Report_Mode_Company_Games',
    'gaCat': 'Dashboard Reports',
    'gaLabel': 'By Mode Company Games',
  },


  'Dashboard_Reports_Pathway_Insights': {
    'gaEvent': 'Pathway_Insights',
    'gaCat': 'Dashboard Reports',
    'gaLabel': 'Skill Insights Clicked',
  },
  'Dashboard_Reports_Skill_Insights': {
    'gaEvent': 'Skill_Insights',
    'gaCat': 'Dashboard Reports',
    'gaLabel': 'Pathway Insights Clicked',
  },
  'Dashboard_Reports_Engagement_Insights': {
    'gaEvent': 'Engagement_Insights',
    'gaCat': 'Dashboard Reports',
    'gaLabel': 'Engaement Insights Clicked',
  },
 
  
  'Detailed_Report_Report_By_Team': {
    'gaEvent': 'Report_By_Team',
    'gaCat': 'Detailed Report',
    'gaLabel': 'By Team Viewed',
  },
  'Detailed_Report_Report_By_Contest': {
    'gaEvent': 'Report_By_Contest',
    'gaCat': 'Detailed Report',
    'gaLabel': 'By Contest Viewed',
  },
  'Detailed_Report_Report_By_Game__Single_Level': {
    'gaEvent': 'Report_By_Game_Single_Level',
    'gaCat': 'Detailed Report',
    'gaLabel': 'By Game-Single level Viewed',
  },
  'Detailed_Report_Report_By_Game__Multilevel': {
    'gaEvent': 'Report_By_Game_Multileve',
    'gaCat': 'Detailed Report',
    'gaLabel': 'By Game-Multilevel Viewed',
  },
  'Detailed_Report_Report_By_Player': {
    'gaEvent': 'Report_By_Player',
    'gaCat': 'Detailed Report',
    'gaLabel': 'By Player Viewed',
  },
  'Detailed_Report_Report_Mode_All_Games': {
    'gaEvent': 'Report_Mode_All_Games',
    'gaCat': 'Detailed Report',
    'gaLabel': 'By Mode All Games',
  },
  'Detailed_Report_Report_Mode_Live_Games': {
    'gaEvent': 'Report_Mode_Live_Games',
    'gaCat': 'Detailed Report',
    'gaLabel': 'By Mode Live Games',
  },
  'Detailed_Report_Report_Mode_Practice_Games': {
    'gaEvent': 'Report_Mode_Practice_Games',
    'gaCat': 'Detailed Report',
    'gaLabel': 'By Mode Practice Games',
  },
  'Detailed_Report_Report_Status_Active_Players': {
    'gaEvent': 'Report_Status_Active_Players',
    'gaCat': 'Detailed Report',
    'gaLabel': 'By Status Active Players',
  },
  'Detailed_Report_Report_Status_All_Players': {
    'gaEvent': 'Report_Status_All_Players',
    'gaCat': 'Detailed Report',
    'gaLabel': 'By Status All Players',
  },
  'Detailed_Report_Report_Location': {
    'gaEvent': 'Report_Location',
    'gaCat': 'Detailed Report',
    'gaLabel': 'By Location',
  },
  'Detailed_Report_Report_Group': {
    'gaEvent': 'Report_Group',
    'gaCat': 'Detailed Report',
    'gaLabel': 'By Group Selected',
  },
  'Detailed_Report_Report_By_today': {
    'gaEvent': 'Report_By_Today',
    'gaCat': 'Detailed Report',
    'gaLabel': 'Date Range Today Applied',
  },
  'Detailed_Report_Report_By_thisWeek': {
    'gaEvent': 'Report_By_This_Week',
    'gaCat': 'Detailed Report',
    'gaLabel': 'Date Range This Week Applied',
  },
  'Detailed_Report_Report_By_lastWeek': {
    'gaEvent': 'Report_By_Last_Week',
    'gaCat': 'Detailed Report',
    'gaLabel': 'Date Range Last Week Applied',
  },
  'Detailed_Report_Report_By_thisMonth': {
    'gaEvent': 'Report_By_This_Month',
    'gaCat': 'Detailed Report',
    'gaLabel': 'Date Range This Month Applied',
  },
  'Detailed_Report_Report_By_lastMonth': {
    'gaEvent': 'Report_By_Last_Month',
    'gaCat': 'Detailed Report',
    'gaLabel': 'Date Range Last Month Applied',
  },
  'Detailed_Report_Report_By_thisQuarter': {
    'gaEvent': 'Report_By_This_Quarter',
    'gaCat': 'Detailed Report',
    'gaLabel': 'Date Range This Quarter Applied',
  },
  'Detailed_Report_Report_By_lastQuarter': {
    'gaEvent': 'Report_By_Last_Quarter',
    'gaCat': 'Detailed Report',
    'gaLabel': 'Date Range Last Quarter Applied',
  },
  'Detailed_Report_Report_By_custom': {
    'gaEvent': 'Report_By_Custom',
    'gaCat': 'Detailed Report',
    'gaLabel': 'Date Range Custom Applied',
  },
  'Detailed_Report_Report_By_CSV_Download': {
    'gaEvent': 'Report_CSV_Download',
    'gaCat': 'Detailed Report',
    'gaLabel': 'Downloaded CSV',
  },
  'Detailed_Report_Report_By_send_by_email': {
    'gaEvent': 'Report_Sent_By_Email',
    'gaCat': 'Detailed Report',
    'gaLabel': 'Report By Email Sent',
  },
  'Detailed_Report_Multi_level_games_tapped': {
    'gaEvent': 'Multi_level_games_tapped',
    'gaCat': 'Detailed Report',
    'gaLabel': 'MLG tapped',
  },
  'Detailed_Report_Contest_tab_clicked': {
    'gaEvent': 'Contest_tab_clicked',
    'gaCat': 'Detailed Report',
    'gaLabel': 'Contest viewed',
  },
  'Detailed_Report_Achievement_trophy_viewed': {
    'gaEvent': 'Achievement_trophy_viewed',
    'gaCat': 'Detailed Report',
    'gaLabel': 'Trophy viewed',
  },
  'Report_Player_Selected': {
    'gaEvent': 'Report_Player_Selected',
    'gaCat': 'Detailed Report',
    'gaLabel': 'Individual Player Report Viewed',
  },
  'Total_Game_Play_Player_Report_Viewed': {
    'gaEvent': 'Total_Game_Play_Player_Report_Viewed',
    'gaCat': 'Detailed Report',
    'gaLabel': 'Total Game Play of Players Viewed',
  },
  'Single_Player_Games_Player_Report_Viewed': {
    'gaEvent': 'Single_Player_Games_Player_Report_Viewed',
    'gaCat': 'Detailed Report',
    'gaLabel': 'Single Player Report Viewed',
  },
  'Multiplayer_Games_Player_Report_Viewed': {
    'gaEvent': 'Multiplayer_Games_Player_Report_Viewed',
    'gaCat': 'Detailed Report',
    'gaLabel': 'Multi Player Report Viewed',
  },
  'Detailed_Report_Shop_Game_Tab_Clicked': {
    'gaEvent': 'Shop_Game_Tab_Clicked',
    'gaCat': 'Detailed Report',
    'gaLabel': 'Clicked Tab Shop Game',
  },
  'Achievement_Player_Report_Viewed': {
    'gaEvent': 'Achievement_Player_Report_Viewed',
    'gaCat': 'Detailed Report',
    'gaLabel': 'Player Achievement Report Viewed',
  },
  'Player_Report_CSV_Downloaded': {
    'gaEvent': 'Player_Report_CSV_Downloaded',
    'gaCat': 'Detailed Report',
    'gaLabel': 'Player CSV Downloaded',
  },
  'Player_Report_Send_By_Email': {
    'gaEvent': 'Player_Report_Send_By_Email',
    'gaCat': 'Detailed Report',
    'gaLabel': 'Report by Email Sent',
  },
  'Video_Play': {
    'gaEvent': 'Video_Play',
    'gaCat': 'Detailed Report',
    'gaLabel': 'How to Run Reports',
  },
  'Game_name_tapped': {
    'gaEvent': 'Game_name_tapped',
    'gaCat': 'Detailed Report',
    'gaLabel': 'Dashboard in Contest',
  },
  'Notifications_By_New_Game_Alert_Mobile': {
    'gaEvent': 'New_Game_Alert_Mobile',
    'gaCat': 'Notifications',
    'gaLabel': 'Toggle ON For New Game Alert',
  },
  'Notifications_By_New_Game_Alert_Email': {
    'gaEvent': 'New_Game_Alert_Email',
    'gaCat': 'Notifications',
    'gaLabel': 'Toggle ON For New Game Alert',
  },
  'Notifications_By_New_Game_Attempt_Mobile': {
    'gaEvent': 'New_Game_Attempt_Mobile',
    'gaCat': 'Notifications',
    'gaLabel': 'Toggle ON For New Game Attempt',
  },
  'Notifications_By_New_Game_Attempt_Email': {
    'gaEvent': 'New_Game_Attempt_Email',
    'gaCat': 'Notifications',
    'gaLabel': 'Toggle ON For New Game Attempt',
  },
  'Notifications_Leaderborad_Update_Mobile': {
    'gaEvent': 'Leaderborad_Update_Mobile',
    'gaCat': 'Notifications',
    'gaLabel': 'Toggle ON For Leaderboard Update',
  },
  'Notifications_By_Leaderborad_Update_Email': {
    'gaEvent': 'Leaderborad_Update_Email',
    'gaCat': 'Notifications',
    'gaLabel': 'Toggle ON For Leaderboard Update',
  },
  'Notifications_By_Reminder_Mobile': {
    'gaEvent': 'Reminder_Mobile',
    'gaCat': 'Notifications',
    'gaLabel': 'Toggle ON For Game Reminder',
  },
  'Notifications_By_Reminder_Email': {
    'gaEvent': 'Reminder_Email',
    'gaCat': 'Notifications',
    'gaLabel': 'Toggle ON For Game Reminder',
  },
  'Notification_By_Custom_Notification_Mobile': {
    'gaEvent': 'Custom_Notification_Mobile',
    'gaCat': 'Notifications',
    'gaLabel': 'Custom Notification Sent',
  },
  'Notification_By_Custom_Notification_Email': {
    'gaEvent': 'Custom_Notification_Mobile',
    'gaCat': 'Notifications',
    'gaLabel': 'Custom Notification Sent',
  }, // Google Analytics Event Added In Schedule Game
  'Schedule_a_Game_By_Select_Players': {
    'gaEvent': 'Select_players',
    'gaCat': 'Schedule a Game',
    'gaLabel': 'Game Selected for Scheduling',
  },
  'Schedule_edit_started': {
    'gaEvent': 'schedule_edit_started',
    'gaCat': 'Edit schedule',
    'gaLabel': '',
  },
  'Schedule_edit_completed': {
    'gaEvent': 'schedule_edit_completed',
    'gaCat': 'Edit schedule',
    'gaLabel': '',
  },
  'Scheduling_parameter_edited': {
    'gaEvent': 'Scheduling_parameter_edited',
    'gaCat': 'Edit schedule  ',
    'gaLabel': '',
  },
  'schedule_deleted': {
    'gaEvent': 'schedule_deleted',
    'gaCat': 'Schedule a Game',
    'gaLabel': '',
  },
  'Schedule_a_Game_By_Schedule_Game_Daily_Limit': {
    'gaEvent': 'Schedule_Game',
    'gaCat': 'Schedule a Game',
    'gaLabel': 'Scheduled With Daily Limit',
  },
  'Schedule_a_Game_By_Schedule_Game_Total_Limit': {
    'gaEvent': 'Schedule_Game',
    'gaCat': 'Schedule a Game',
    'gaLabel': 'Scheduled With Total Limit',
  }, // Google Analytics Event Added In Qurstions
  'Questions_By_Add_Questions_With_2_Answer_Options': {
    'gaEvent': 'Add_Questions',
    'gaCat': 'Questions',
    'gaLabel': 'Question Created With Two Answer Options',
  },
  'Questions_By_Add_Questions_With_4_Answer_Options': {
    'gaEvent': 'Add_Questions',
    'gaCat': 'Questions',
    'gaLabel': 'Question Created With Four Answer Options',
  },
  'Questions_By_Add_Questions_With_5_Answer_Options': {
    'gaEvent': 'Add_Questions',
    'gaCat': 'Questions',
    'gaLabel': 'Question Created With Five Answer Options',
  },
  'Questions_By_Add_Questions_With_6_Answer_Options': {
    'gaEvent': 'Add_Questions',
    'gaCat': 'Questions',
    'gaLabel': 'Question Created With Six Answer Options',
  },
  'Questions_By_Add_Questions_With_7_Answer_Options': {
    'gaEvent': 'Add_Questions',
    'gaCat': 'Questions',
    'gaLabel': 'Question Created With Seven Answer Options',
  },
  'Questions_By_Add_Questions_With_8_Answer_Options': {
    'gaEvent': 'Add_Questions',
    'gaCat': 'Questions',
    'gaLabel': 'Question Created With Eight Answer Options',
  },
  'Questions_By_Add_Questions_With_9_Answer_Options': {
    'gaEvent': 'Add_Questions',
    'gaCat': 'Questions',
    'gaLabel': 'Question Created With Nine Answer Options',
  },
  'Questions_By_Add_Questions_With_10_Answer_Options': {
    'gaEvent': 'Add_Questions',
    'gaCat': 'Questions',
    'gaLabel': 'Question Created With Ten Answer Options',
  },
  'Questions_By_Select_Questions': {
    'gaEvent': 'Select_Questions',
    'gaCat': 'Questions',
    'gaLabel': 'Question Created With Two Answer Options'
  },
  'Questions_By_Add_Question_Points_Random': {
    'gaEvent': 'Add_Question_Points',
    'gaCat': 'Questions',
    'gaLabel': 'Questions Added with Random Points',
  },
  'Questions_By_Add_Questions_With_100_Answer_Options': {
    'gaEvent': 'Add_Question_Points',
    'gaCat': 'Questions',
    'gaLabel': 'Questions Added with value 100',
  },
  'Questions_By_Add_Question_Points_200': {
    'gaEvent': 'Add_Question_Points',
    'gaCat': 'Questions',
    'gaLabel': 'Questions Added with value 200',
  },
  'Questions_By_Add_Question_Points_300': {
    'gaEvent': 'Add_Question_Points',
    'gaCat': 'Questions',
    'gaLabel': 'Questions Added with value 300',
  },
  'Questions_By_Add_Question_Points_400': {
    'gaEvent': 'Add_Question_Points',
    'gaCat': 'Questions',
    'gaLabel': 'Questions Added with value 400',
  },
  'Questions_By_Add_Question_Points_500': {
    'gaEvent': 'Add_Question_Points',
    'gaCat': 'Questions',
    'gaLabel': 'Questions Added with value 500',
  },
  'Questions_By_Add_Question_Timer_10': {
    'gaEvent': 'Add_Question_Timer',
    'gaCat': 'Questions',
    'gaLabel': 'Questions Added with value 10',
  },
  'Questions_By_Add_Question_Timer_15': {
    'gaEvent': 'Add_Question_Timer',
    'gaCat': 'Questions',
    'gaLabel': 'Questions Added with value 15',
  },
  'Questions_By_Add_Question_Timer_30': {
    'gaEvent': 'Add_Question_Timer',
    'gaCat': 'Questions',
    'gaLabel': 'Questions Added with value 30',
  },
  'Questions_By_Add_Question_Timer_45': {
    'gaEvent': 'Add_Question_Timer',
    'gaCat': 'Questions',
    'gaLabel': 'Questions Added with value 45',
  },
  'Questions_By_Add_Question_Timer_60': {
    'gaEvent': 'Add_Question_Timer',
    'gaCat': 'Questions',
    'gaLabel': 'Questions Added with value 60',
  },
  'Questions_By_Question_Assets_Added_Audio': {
    'gaEvent': 'Question_Assets_Added',
    'gaCat': 'Questions',
    'gaLabel': 'Audio',
  },
  'Questions_By_Question_Assets_Added_Image': {
    'gaEvent': 'Question_Assets_Added',
    'gaCat': 'Questions',
    'gaLabel': 'Image',
  },
  'Questions_By_Question_Tag_Added': {
    'gaEvent': 'Question_Tag_Added',
    'gaCat': 'Questions',
    'gaLabel': 'Question Tag Added',
  },
  'Questions_By_Question_Activate': {
    'gaEvent': 'Question_Activate',
    'gaCat': 'Questions',
    'gaLabel': 'Question Activated',
  },
  'Questions_By_Question_Deactivate': {
    'gaEvent': 'Question_Deactivate',
    'gaCat': 'Questions',
    'gaLabel': 'Question Deactivated',
  },
  'Questions_By_Question_Download_CSV': {
    'gaEvent': 'Question_Download_CSV',
    'gaCat': 'Questions',
    'gaLabel': 'Question Downloaded',
  },
  'Question_Report_By_question_title': {
    'gaEvent': 'Filter',
    'gaCat': 'Questions',
    'gaLabel': 'Question',
  },
  'Question_Report_By_points': {
    'gaEvent': 'Filter',
    'gaCat': 'Questions',
    'gaLabel': 'Points',
  },
  'Question_Report_By_time': {
    'gaEvent': 'Filter',
    'gaCat': 'Questions',
    'gaLabel': 'Timer',
  },
  'Question_Report_By_game_id': {
    'gaEvent': 'Filter',
    'gaCat': 'Questions',
    'gaLabel': 'Game',
  },
  'Question_Report_By_tag_keywords': {
    'gaEvent': 'Filter',
    'gaCat': 'Questions',
    'gaLabel': 'Tag',
  },
  'Question_Report_By_card_number': {
    'gaEvent': 'Filter',
    'gaCat': 'Questions',
    'gaLabel': 'Card_Number',
  },
  'Question_Report_By_is_active_Active': {
    'gaEvent': 'Filter',
    'gaCat': 'Questions',
    'gaLabel': 'Active',
  },
  'Question_Report_By_is_active_Inactive': {
    'gaEvent': 'Filter',
    'gaCat': 'Questions',
    'gaLabel': 'Inactive',
  }, // Game Library Events Single Level Games
  'Game_Library_Single_level_Single_Level_Game_Selected': {
    'gaEvent': 'Single_Level_Game_Selected',
    'gaCat': 'Game Library- Single level',
    'gaLabel': 'Singlel level',
  },
  'Game_Library_Single_level_game_name': {
    'gaEvent': 'Add_Filter_Game',
    'gaCat': 'Game Library- Single level',
    'gaLabel': 'Filtered By Game',
  },
  'Game_Library_Single_level_game_type_Single_Player': {
    'gaEvent': 'Add_Filter_Type_Single_Player',
    'gaCat': 'Game Library- Single level',
    'gaLabel': 'Single Player Selected',
  },
  'Game_Library_Single_level_game_type_Multiplayer': {
    'gaEvent': 'Add_Filter_Type_Multi_Player',
    'gaCat': 'Game Library- Single level',
    'gaLabel': 'MultiPlayer Selected',
  },
  'Game_Library_Single_level_game_state_Live': {
    'gaEvent': 'Add_Filter_State_Live',
    'gaCat': 'Game Library- Single level',
    'gaLabel': 'Live Filter Applied',
  },
  'Game_Library_Single_level_game_state_Ready': {
    'gaEvent': 'Add_Filter_State_Ready',
    'gaCat': 'Game Library- Single level',
    'gaLabel': 'Ready Filter Applied',
  },
  'Game_Library_Single_level_game_state_Draft': {
    'gaEvent': 'Add_Filter_State_Draft',
    'gaCat': 'Game Library- Single level',
    'gaLabel': 'Draft Filter Applied',
  },
  'Game_Library_Single_level_game_category_id_Brand_Specific': {
    'gaEvent': 'Add_Filter_Category_Brand_Specific',
    'gaCat': 'Game Library- Single level',
    'gaLabel': 'Filtered By Brand Specific',
  },
  'Game_Library_Single_level_game_category_id_Customer_Service': {
    'gaEvent': 'Add_Filter_Category_Customer_Service',
    'gaCat': 'Game Library- Single level',
    'gaLabel': 'Filtered By Customer Service ',
  },
  'Game_Library_Single_level_game_category_id_General': {
    'gaEvent': 'Add_Filter_Category_General',
    'gaCat': 'Game Library- Single level',
    'gaLabel': 'Filtered By General ',
  },
  'Game_Library_Single_level_game_category_id_Human_Resources': {
    'gaEvent': 'Add_Filter_Category_ Human_Resource',
    'gaCat': 'Game Library- Single level',
    'gaLabel': 'Filtered By Human Resource ',
  },
  'Game_Library_Single_level_game_category_id_Leadership': {
    'gaEvent': 'Add_Filter_Category_Leadership',
    'gaCat': 'Game Library- Single level',
    'gaLabel': 'Filtered By Leadership',
  },
  'Game_Library_Single_level_game_category_id_Product_Specific': {
    'gaEvent': 'Add_Filter_Category_Product_Specific',
    'gaCat': 'Game Library- Single level',
    'gaLabel': 'Filtered By Product Specific ',
  },
  'Game_Library_Single_level_game_category_id_Sales': {
    'gaEvent': 'Add_Filter_Category_Sales',
    'gaCat': 'Game Library- Single level',
    'gaLabel': 'Filtered By Sales ',
  },
  'Game_Library_Single_level_game_category_id_Skill_Specific': {
    'gaEvent': 'Add_Filter_Category_Skill_Specific',
    'gaCat': 'Game Library- Single level',
    'gaLabel': 'Filtered By Skill Specific ',
  },
  'Game_Library_Single_level_game_category_id_Archive': {
    'gaEvent': 'Add_Filter_Category_Archive',
    'gaCat': 'Game Library- Single level',
    'gaLabel': 'Filtered By Archive',
  },
  'Game_Library_Single_level_game_category_id_Other': {
    'gaEvent': 'Add_Filter_Category_Other',
    'gaCat': 'Game Library- Single level',
    'gaLabel': 'Filtered By Other ',
  },
  'Game_Library_Single_level_owner_id': {
    'gaEvent': 'Add_Filter_Owner',
    'gaCat': 'Game Library- Single level',
    'gaLabel': 'Filtered By Owner',
  },
  'Game_Library_Single_level_Winrate_0_50': {
    'gaEvent': 'Add_Filter_Winrate',
    'gaCat': 'Game Library- Single level',
    'gaLabel': '0-50',
  },
  'Game_Library_Single_level_Winrate_51_75': {
    'gaEvent': 'Add_Filter_Winrate',
    'gaCat': 'Game Library- Single level',
    'gaLabel': '51-75',
  },
  'Game_Library_Single_level_Winrate_76_100': {
    'gaEvent': 'Add_Filter_Winrate',
    'gaCat': 'Game Library- Single level',
    'gaLabel': '76-100',
  },
  'Game_Library_Single_level_Winrate_no_gameplay': {
    'gaEvent': 'Add_Filter_Winrate',
    'gaCat': 'Game Library- Single level',
    'gaLabel': 'No Gameplay',
  },
  'Game_Library_Multi_level_Multi_Level_Game_Selected': {
    'gaEvent': 'Multi_Level_Game_Selected',
    'gaCat': 'Game Library- Multi level',
    'gaLabel': 'MultiLevel Game Selected',
  },
  'Game_Library_Multilevel_mlg_name': {
    'gaEvent': 'Add_Filter_Game',
    'gaCat': 'Game Library- Multi level',
    'gaLabel': 'Filtered By Game',
  },
  'Game_Library_Multilevel_mlg_state_Live': {
    'gaEvent': 'Add_Filter_State_Live',
    'gaCat': 'Game Library- Multi level',
    'gaLabel': 'Filtered By Live',
  },
  'Game_Library_Multilevel_mlg_state_Draft': {
    'gaEvent': 'Add_Filter_State_Draft',
    'gaCat': 'Game Library- Multi level',
    'gaLabel': 'Filtered By Draft',
  },
  'Game_Library_Multilevel_owner_id': {
    'gaEvent': 'Add_Filter_Owner',
    'gaCat': 'Game Library- Multi level',
    'gaLabel': 'Filtered By Owner',
  },
  'Banner_Replaced_draft': {
    'gaEvent': 'Banner_Replaced',
    'gaCat': 'Game Library- Multi level',
    'gaLabel': 'Draft',
  },
  'Banner_Replaced_live': {
    'gaEvent': 'Banner_Replaced',
    'gaCat': 'Game Library- Multi level',
    'gaLabel': 'Live',
  },
  'Banner_Replaced_ready': {
    'gaEvent': 'Banner_Replaced',
    'gaCat': 'Game Library- Multi level',
    'gaLabel': 'Ready',
  }, // Google Analytics Events Question Report By Accuracy
  'Question_Report_Accuracy_By_question_title': {
    'gaEvent': 'Accuracy_Report_Question',
    'gaCat': 'Question Report',
    'gaLabel': 'Filtered by Question',
  },
  'Question_Report_Accuracy_By_game_id': {
    'gaEvent': 'Accuracy_Report_Game',
    'gaCat': 'Question Report',
    'gaLabel': 'Filtered by Game',
  },
  'Question_Report_Accuracy_By_player_id': {
    'gaEvent': 'Accuracy_Report_Player',
    'gaCat': 'Question Report',
    'gaLabel': 'Filtered by Player',
  },
  'Question_Report_By_Accuracy_Report_Download': {
    'gaEvent': 'Accuracy_Report_Download',
    'gaCat': 'Question Report',
    'gaLabel': 'Question Report Download',
  },
  'Question_Report_By_Accuracy_Report_Send_By_Email': {
    'gaEvent': 'Accuracy_Report_Send_By_Email',
    'gaCat': 'Question Report',
    'gaLabel': 'Report Sent by Email',
  },
  'Question_Report_Accuracy_today': {
    'gaEvent': 'Accuracy_Report_Today',
    'gaCat': 'Question Report',
    'gaLabel': 'Date Range Today',
  },
  'Question_Report_Accuracy_thisWeek': {
    'gaEvent': 'Accuracy_Report_This_Week',
    'gaCat': 'Question Report',
    'gaLabel': 'Date Range This Week',
  },
  'Question_Report_Accuracy_lastWeek': {
    'gaEvent': 'Accuracy_Report_Last_Week',
    'gaCat': 'Question Report',
    'gaLabel': 'Date Range Last Week',
  },
  'Question_Report_Accuracy_thisMonth': {
    'gaEvent': 'Accuracy_Report_This_Month',
    'gaCat': 'Question Report',
    'gaLabel': 'Date Range This Month',
  },
  'Question_Report_Accuracy_lastMonth': {
    'gaEvent': 'Accuracy_Report_Last_Month',
    'gaCat': 'Question Report',
    'gaLabel': 'Date Range Last Month',
  },
  'Question_Report_Accuracy_By_custom': {
    'gaEvent': 'Accuracy_Report_Custom',
    'gaCat': 'Question Report',
    'gaLabel': 'Date Range Custom',
  }, // Google Analytics Events In Attempts
  'Attempts_Select_game_id': {
    'gaEvent': 'Select_Game',
    'gaCat': 'Attempts',
    'gaLabel': 'Game Selected To Add Attempts',
  },
  'Attempts_Select_Players_Name': {
    'gaEvent': 'Select_Players_Name',
    'gaCat': 'Attempts',
    'gaLabel': 'Player Selected To Add Attempts',
  },
  'Attempts_Select_location_id': {
    'gaEvent': 'Select_Players_Location',
    'gaCat': 'Attempts',
    'gaLabel': 'Players Filtered By Location',
  },
  'Attempts_Add_Attempts': {
    'gaEvent': 'Add_Attempts',
    'gaCat': 'Attempts',
    'gaLabel': 'Attempts Added',
  }, // Google Analytics In Player Feedback
  'Player_Feedback_Selected': {
    'gaEvent': 'Player_Feedback',
    'gaCat': 'Player Feedback',
    'gaLabel': 'Feedback is Selected',
  },
  'Player_Feedback_Player_Feedback_Status_Viewed_Modified': {
    'gaEvent': 'Player_Feedback_Status_Clicked',
    'gaCat': 'Player Feedback',
    'gaLabel': 'Modified',
  },
  'Player_Feedback_Player_Feedback_Status_Viewed_Original': {
    'gaEvent': 'Player_Feedback_Status_Clicked',
    'gaCat': 'Player Feedback',
    'gaLabel': 'Original',
  },
  'Player_Feedback_Player_Feedback_Status_Resolved': {
    'gaEvent': 'Player_Feedback_Status_Resolved',
    'gaCat': 'Player Feedback',
    'gaLabel': 'Feedback is Resolved',
  },
  'Player_Feedback_Player_Feedback_Download': {
    'gaEvent': 'Player_Feedback_Download',
    'gaCat': 'Player Feedback',
    'gaLabel': 'Player Feedback Downloaded',
  },
  'Player_Feedback_game_id': {
    'gaEvent': 'Player_Feedback_Filter',
    'gaCat': 'Player Feedback',
    'gaLabel': 'Filtered By Game',
  },
  'Player_Feedback_status': {
    'gaEvent': 'Player_Feedback_Filter',
    'gaCat': 'Player Feedback',
    'gaLabel': 'Filtered By Status',
  }, // Google Analytics In Paywall
  'Paywall_By_Trial_Expired': {
    'gaEvent': 'Trial_Expired',
    'gaCat': 'Paywall',
    'gaLabel': 'Paywall_Pop-up_Displayed',
  },
  'Paywall_By_Paid_Subscription_Expired': {
    'gaEvent': 'Paid_Subscription_Expired',
    'gaCat': 'Paywall',
    'gaLabel': 'Paywall_Pop-up_Displayed',
  },
  'Paywall_By_Trial_Support_Contacted_For_Subscription': {
    'gaEvent': 'Trial_Support_Contacted_For_Subscription',
    'gaCat': 'Paywall',
    'gaLabel': 'Contacted 1Huddle Support',
  },
  'Paywall_By_Paid_Support_Contacted_For_Subscription': {
    'gaEvent': 'Paid_Support_Contacted_For_Subscription',
    'gaCat': 'Paywall',
    'gaLabel': 'Contacted 1Huddle Support',
  }, // Google Analytics In Trophy Reports
  'Trophy_Reports_By_is_achieved_General': {
    'gaEvent': 'General_Trophy_Selected',
    'gaCat': 'Trophy Reports',
    'gaLabel': 'Viewed By General',
  },
  'Trophy_Reports_By_is_achieved_Game-Single Level': {
    'gaEvent': 'Game_Trophy_Selected',
    'gaCat': 'Trophy Reports',
    'gaLabel': 'Viewed By Game',
  },
  'Trophy_Reports_By_is_achieved_Contest': {
    'gaEvent': 'Contest_Trophy_Selected',
    'gaCat': 'Trophy Reports',
    'gaLabel': 'Viewed By Contest',
  },
  'Trophy_Reports_By_is_achieved_Game-Multilevel': {
    'gaEvent': 'MLG_Trophy_Selected',
    'gaCat': 'Trophy Reports',
    'gaLabel': 'Viewed By MLG',
  },
  'Trophy_Reports_Trophy_Viewed': {
    'gaEvent': 'Trophy_Details_Icon_Clicked',
    'gaCat': 'Trophy Reports',
    'gaLabel': 'Trophy Viewed',
  },
  'Trophy_Reports_By_is_achieved_Achieved': {
    'gaEvent': 'Trophy_Status_Clicked',
    'gaCat': 'Trophy Reports',
    'gaLabel': 'Achieved',
  },
  'Trophy_Reports_By_is_achieved_Not Achieved': {
    'gaEvent': 'Trophy_Status_Clicked',
    'gaCat': 'Trophy Reports',
    'gaLabel': 'Not Achieved',
  },
  'Trophy_Reports_By_name': {
    'gaEvent': 'Trophy_Player_Filter_Name',
    'gaCat': 'Trophy Reports',
    'gaLabel': 'Filtered By Name',
  },
  'Trophy_Reports_By_location_ids': {
    'gaEvent': 'Trophy_Player_Filter_Location',
    'gaCat': 'Trophy Reports',
    'gaLabel': 'Filtered By Location',
  },
  'Trophy_Reports_By_status_Active': {
    'gaEvent': 'Trophy_Player_Filter_Status',
    'gaCat': 'Trophy Reports',
    'gaLabel': 'Active',
  },
  'Trophy_Reports_By_status_Inactive': {
    'gaEvent': 'Trophy_Player_Filter_Status',
    'gaCat': 'Trophy Reports',
    'gaLabel': 'Inactive',
  },
  'Trophy_Reports_By_status_unverified': {
    'gaEvent': 'Trophy_Player_Filter_Status',
    'gaCat': 'Trophy Reports',
    'gaLabel': 'Pending Verification',
  },
  'Marketplace_Page_Views': {
    'gaEvent': 'Marketplace_Page_Views',
    'gaCat': 'Marketplace',
    'gaLabel': 'Marketplace page viewed',
  },
  'Marketplace_Game_Added_to_Library': {
    'gaEvent': 'Add_To_Game_Library',
    'gaCat': 'Marketplace',
    'gaLabel': 'Marketplace game added to company',
  },
  'Marketplace_Game_Position_Changed': {
    'gaEvent': 'Game_Position_Changed',
    'gaCat': 'Marketplace',
    'gaLabel': 'New position saved',
  },
  'Trophy_Reports_By_Trophy_Player_Report_Download': {
    'gaEvent': 'Trophy_Player_Report_Download',
    'gaCat': 'Trophy Reports',
    'gaLabel': 'Download Players CSV',
  }, // Google Ananlytics In Login
  'Login_By_SSO_Login': {
    'gaEvent': 'Login',
    'gaCat': 'Login',
    'gaLabel': 'SSO Login',
  },
  'Login_By_Regular_Login': {
    'gaEvent': 'Login',
    'gaCat': 'Login',
    'gaLabel': 'Regular Login',
  },
  'Login_By_Forgot_Passward': {
    'gaEvent': 'Forgot_Password',
    'gaCat': 'Login',
    'gaLabel': 'Password Requested',
  }, // Google Analytics In Homescreen
  'Homescreen_Header_Bar_By_Video_Play': {
    'gaEvent': 'Video_Play',
    'gaCat': 'Homescreen Header Bar',
    'gaLabel': 'Lets Get Started',
  },
  'Homescreen_Header_Bar_By_Support_Contacted': {
    'gaEvent': 'Support_Contacted',
    'gaCat': 'Homescreen Header Bar',
    'gaLabel': '',
  },
  'Homescreen_Header_Bar_By_Self_Profile_Edited_0': {
    'gaEvent': 'Self_Profile_Edited',
    'gaCat': 'Homescreen Header Bar',
    'gaLabel': 'Basic Information Updated',
  },
  'Homescreen_Header_Bar_By_Self_Profile_Edited_1': {
    'gaEvent': 'Self_Profile_Edited',
    'gaCat': 'Homescreen Header Bar',
    'gaLabel': 'Additional Information Updated',
  },
  'Homescreen_Header_Bar_By_Privacy_Policy_Viewed': {
    'gaEvent': 'Privacy_Policy_Viewed',
    'gaCat': 'Homescreen Header Bar',
    'gaLabel': '',
  },
  'Homescreen_Header_Bar_By_Terms_Viewed': {
    'gaEvent': 'Terms_Viewed',
    'gaCat': 'Homescreen Header Bar',
    'gaLabel': '',
  },
  'Homescreen_Header_Bar_By_Logged_Out': {
    'gaEvent': 'Logged_Out',
    'gaCat': 'Homescreen Header Bar',
    'gaLabel': '',
  }, // Google Analytics event in Incomplete Game Sessions
  'Incomplete_Sessions_Report_By_name': {
    'gaEvent': 'Incomplete_Sessions_Report_By_Name',
    'gaCat': 'Incomplete Sessions Report',
    'gaLabel': 'Filtered By Player Name',
  },
  'Incomplete_Sessions_Report_By_game_id': {
    'gaEvent': 'Incomplete_Sessions_Report_By_Game_Name',
    'gaCat': 'Incomplete Sessions Report',
    'gaLabel': 'Filtered By Game Name',
  },
  'Incomplete_Sessions_Report_By_location_id': {
    'gaEvent': 'Incomplete_Sessions_Report_By_Location',
    'gaCat': 'Incomplete Sessions Report',
    'gaLabel': 'Filtered By Location',
  },
  'Incomplete_Sessions_Report_By_department_id': {
    'gaEvent': 'Incomplete_Sessions_Report_By_Department',
    'gaCat': 'Incomplete Sessions Report',
    'gaLabel': 'Filtered By Department',
  },
  'Incomplete_Sessions_Report_By_Incomplete_Sessions_Deleted': {
    'gaEvent': 'Incomplete_Sessions_Deleted',
    'gaCat': 'Incomplete Sessions Report',
    'gaLabel': 'Incomplete Sessions Deleted',
  }, // Google Analytics Events Added In Game Building
  'Game_Builder_Single_level_By_Rename_Game_Name': {
    'gaEvent': 'Rename_Game_Name',
    'gaCat': 'Game Builder-Single level',
    'gaLabel': 'Rename Game',
  },
  'Game_Builder_Single_level_By_Add_Game_Image': {
    'gaEvent': 'Add_Game_Image',
    'gaCat': 'Game Builder-Single level',
    'gaLabel': 'Select Game Icon',
  },
  'Game_Builder_Single_level_By_Upload_Game_Image': {
    'gaEvent': 'Upload_Game_Image',
    'gaCat': 'Game Builder-Single level',
    'gaLabel': 'Upload Game Image',
  },
  'Game_Builder_Single_level_By_Add_Questions_From_Library': {
    'gaEvent': 'Add_Questions_From_Library',
    'gaCat': 'Game Builder-Single level',
    'gaLabel': 'Library',
  },
  'Game_Builder_Single_level_By_Upload_Questions': {
    'gaEvent': 'Upload_Questions',
    'gaCat': 'Game Builder-Single level',
    'gaLabel': 'Upload Questions',
  },
  'Game_Builder_Single_level_By_Question_Category': {
    'gaEvent': 'Question_Category',
    'gaCat': 'Game Builder-Single level',
    'gaLabel': 'Add Category',
  },
  'Game_Builder_Single_level_By_Change_Question_Category_Name': {
    'gaEvent': 'Change_Question_Category_Name',
    'gaCat': 'Game Builder-Single level',
    'gaLabel': 'Change Category Name',
  },
  'Game_Builder_Single_level_By_Delete_Question_Category': {
    'gaEvent': 'Delete_Question_Category',
    'gaCat': 'Game Builder-Single level',
    'gaLabel': 'Delete Category',
  },
  'Game_Builder_Single_level_By_Video_Play': {
    'gaEvent': 'Video_Play',
    'gaCat': 'Game Builder-Single level',
    'gaLabel': 'How To Build Games',
  },
  'Game_Builder_Single_level_By_Download_Question': {
    'gaEvent': 'Download_Question',
    'gaCat': 'Game Builder-Single level',
    'gaLabel': 'Question CSV Downloaded',
  },
  'Game_Builder_Single_level_By_Game_Preview_Title': {
    'gaEvent': 'Game_Preview_Title',
    'gaCat': 'Game Builder-Single level',
    'gaLabel': 'Title Added',
  },
  'Game_Builder_Single_level_By_Game_Preview_Video': {
    'gaEvent': 'Game_Preview_Video',
    'gaCat': 'Game Builder-Single level',
    'gaLabel': 'Video Added',
  },
  'Game_Builder_Single_level_By_Game_Preview_PDF': {
    'gaEvent': 'Game_Preview_PDF',
    'gaCat': 'Game Builder-Single level',
    'gaLabel': 'PDF Uploaded',
  },
  'Game_Builder_Single_level_By_Game_Preview_Game_Details': {
    'gaEvent': 'Game_Preview_Game_Details',
    'gaCat': 'Game Builder-Single level',
    'gaLabel': 'Game Details Added',
  },
  'Game_Builder_Single_level_By_Game_Preview_Information': {
    'gaEvent': 'Game_Preview_Information',
    'gaCat': 'Game Builder-Single level',
    'gaLabel': 'Information Added',
  },
  'Game_Builder_Single_level_By_Game_Building_Done': {
    'gaEvent': 'Game_Building_Done',
    'gaCat': 'Game Builder-Single level',
    'gaLabel': 'Single Player',
  },  
  'Game_Builder_Single_level_game_category': {
    'gaEvent': 'Game_Category_Selected',
    'gaCat': 'Game Builder-Single level',
    'gaLabel': 'Single Player',
  }, 
  // Multi Level
  'Game_Builder_Multi_level_By_Rename_Game_Name': {
    'gaEvent': 'Rename_Game_Name',
    'gaCat': 'Game Builder-Multi level',
    'gaLabel': 'Rename Game',
  },
  'Game_Builder_Multi_level_By_Upload_Game_Image': {
    'gaEvent': 'Upload_Game_Image',
    'gaCat': 'Game Builder-Multi level',
    'gaLabel': 'Upload Game Image',
  },
  'Game_Builder_Multi_level_By_Add_Games': {
    'gaEvent': 'Add_Games',
    'gaCat': 'Game Builder-Multi level',
    'gaLabel': '',
  },
  'Game_Builder_Multi_level_By_Add_Criteria_Total_Points': {
    'gaEvent': 'Add_Criteria_Total_Points',
    'gaCat': 'Game Builder-Multi level',
    'gaLabel': 'Total Points Added',
  },
  'Game_Builder_Multi_level_By_Add_Criteria_Minimum_Attempts': {
    'gaEvent': 'Add_Criteria_Minimum_Attempts',
    'gaCat': 'Game Builder-Multi level',
    'gaLabel': 'Minimum Attempts Added',
  },
  'Game_Builder_Multi_level_By_Add_Criteria_High_Score': {
    'gaEvent': 'Add_Criteria_High_Score',
    'gaCat': 'Game Builder-Multi level',
    'gaLabel': 'High Score Added',
  },
  'Game_Builder_Multi_level_By_Add_Players_Location': {
    'gaEvent': 'Add_Players_Location',
    'gaCat': 'Game Builder-Multi level',
    'gaLabel': 'Player Added',
  },
  'Game_Builder_Multi_level_By_Add_Players_Department': {
    'gaEvent': 'Add_Players_Department',
    'gaCat': 'Game Builder-Multi level',
    'gaLabel': 'Player Added',
  },
  'Game_Builder_Multi_level_By_Add_Rules': {
    'gaEvent': 'Add_Rules',
    'gaCat': 'Game Builder-Multi level',
    'gaLabel': 'Rules Added',
  },
  'Game_Builder_Multi_level_By_View_Trophy': {
    'gaEvent': 'View_Trophy',
    'gaCat': 'Game Builder-Multi level',
    'gaLabel': 'Trophy Viewed',
  },
  'Game_Builder_Multi_level_By_Game_Status_Turn_On': {
    'gaEvent': 'Game_Status_Turn_On',
    'gaCat': 'Game Builder-Multi level',
    'gaLabel': 'Multiplayer Game Live',
  },
  'Game_Builder_Multi_level_By_Game_Status_Turn_Off': {
    'gaEvent': 'Game_Status_Turned_Off',
    'gaCat': 'Game Builder-Multi level',
    'gaLabel': 'MLG_Turned_Off',
  },
  'Game_Builder_Multi_level_MLG_Cloned': {
    'gaEvent': 'MLG_Cloned',
    'gaCat': 'Game Builder-Multi level',
    'gaLabel': 'MLG Cloned',
  },
  'Game_Builder_Multi_level_Level_Position_Changed': {
    'gaEvent': 'Level_Position_Changed',
    'gaCat': 'Game Builder-Multi level',
    'gaLabel': 'Level Position updated',
  },
  'Game_Builder_Multi_level_Limit_Level_Updated_Clicked': {
    'gaEvent': 'Limit_Level_Updated_Clicked',
    'gaCat': 'Game Builder-Multi level',
    'gaLabel': 'Updated limits and levels.',
  },
  'Game_Builder_Multi_level_Limit_Added': {
    'gaEvent': 'Limit_Added',
    'gaCat': 'Game Builder-Multi level',
    'gaLabel': 'Limits added in draft state',
  },
  'Game_Builder_Multi_level_Level_Deleted': {
    'gaEvent': 'Level_Deleted',
    'gaCat': 'Game Builder-Multi level',
    'gaLabel': 'Level Deleted successfully',
  }, // Multi Player Games
  'Game_Builder_Multi_Player_By_Rename_Game_Name': {
    'gaEvent': 'Rename_Game_Name',
    'gaCat': 'Game Builder-Multi Player',
    'gaLabel': 'Rename Game',
  },
  'Game_Builder_Multi_Player_By_Add_Game_Image': {
    'gaEvent': 'Add_Game_Image',
    'gaCat': 'Game Builder-Multi Player',
    'gaLabel': 'Select Game Icon',
  },
  'Game_Builder_Multi_Player_By_Upload_Game_Image': {
    'gaEvent': 'Upload_Game_Image',
    'gaCat': 'Game Builder-Multi Player',
    'gaLabel': 'Upload Game Image',
  },
  'Game_Builder_Multi_Player_By_Add_Questions_From_Library': {
    'gaEvent': 'Add_Questions_From_Library',
    'gaCat': 'Game Builder-Multi Player',
    'gaLabel': 'Library Question Added',
  },
  'Game_Builder_Multi_Player_By_Upload_Questions_CSV': {
    'gaEvent': 'Upload_Questions',
    'gaCat': 'Game Builder-Multi Player',
    'gaLabel': 'Uploaded Questions',
  },
  'Game_Builder_Multi_Player_By_Question_Category': {
    'gaEvent': 'Question_Category',
    'gaCat': 'Game Builder-Multi Player',
    'gaLabel': 'Added Question Category',
  },
  'Game_Builder_Multi_Player_By_Change_Question_Category_Name': {
    'gaEvent': 'Change_Question_Category_Name',
    'gaCat': 'Game Builder-Multi Player',
    'gaLabel': 'Changed Question Category Name',
  },
  'Game_Builder_Multi_Player_By_Delete_Question_Category': {
    'gaEvent': 'Delete_Question_Category',
    'gaCat': 'Game Builder-Multi Player',
    'gaLabel': 'Deleted Question Category',
  },
  'Game_Builder_Multi_Player_By_Video_Play': {
    'gaEvent': 'Video_Play',
    'gaCat': 'Game Builder-Multi Player',
    'gaLabel': 'How to Build Games',
  },
  'Game_Builder_Multi_Player_By_Download_Questions': {
    'gaEvent': 'Download_Questions',
    'gaCat': 'Game Builder-Multi Player',
    'gaLabel': 'Questions Downloaded',
  },
  'Game_Builder_Multi_Player_By_Upload_Questions': {
    'gaEvent': 'Upload_Questions',
    'gaCat': 'Game Builder-Multi Player',
    'gaLabel': 'Questions Uploaded',
  },
  'Game_Builder_Multi_Player_By_Profile_Button_Clicked': {
    'gaEvent': 'Profile_Button_Clicked',
    'gaCat': 'Game Builder-Multi Player',
    'gaLabel': 'MultiPlayer Profile Created',
  },
  'Game_Builder_Multi_Player_By_Profile_Selected': {
    'gaEvent': 'Profile_Selected',
    'gaCat': 'Game Builder-Multi Player',
    'gaLabel': 'MultiPlayer Profile Selected',
  },
  'Game_Builder_Multi_Player_By_Game_Profile_Title': {
    'gaEvent': 'Game_Profile_Title',
    'gaCat': 'Game Builder-Multi Player',
    'gaLabel': 'MultiPlayer Game Profile Title Added',
  },
  'Game_Builder_Multi_Player_By_Game_Profile_Video': {
    'gaEvent': 'Game_Profile_Video',
    'gaCat': 'Game Builder-Multi Player',
    'gaLabel': 'MultiPlayer Game Profile Video Uploaded',
  },
  'Game_Builder_Multi_Player_By_Game_Profile_PDF': {
    'gaEvent': 'Game_Profile_PDF',
    'gaCat': 'Game Builder-Multi Player',
    'gaLabel': 'MultiPlayer Game Profile PDF Added',
  },
  'Game_Builder_Multi_Player_By_Game_Profile_Scenario': {
    'gaEvent': 'Game_Profile_Scenario',
    'gaCat': 'Game Builder-Multi Player',
    'gaLabel': 'MultiPlayer Game Profile Scenario Added',
  },
  'Game_Builder_Multi_Player_By_Game_Profile_Information': {
    'gaEvent': 'Game_Profile_Information',
    'gaCat': 'Game Builder-Multi Player',
    'gaLabel': 'MultiPlayer Game Profile Information Added',
  },
  'Game_Builder_Multi_Player_By_Profile_Deleted': {
    'gaEvent': 'Profile_Deleted',
    'gaCat': 'Game Builder-Multi Player',
    'gaLabel': 'MultiPlayer Game Profile Deleted',
  },
  'Game_Builder_Multi_Player_By_Game_Building_Done': {
    'gaEvent': 'Game_Building_Done',
    'gaCat': 'Game Builder-Multi Player',
    'gaLabel': 'MultiPlayer Game Created',
  },
  'Add_Question_Manually_Single_Level_Timer': {
    'gaEvent': 'Add_Question_Manually',
    'gaCat': 'Game Builder-Single level',
    'gaLabel': 'Timer',
  },
  'Add_Question_Manually_Multi_Player_Timer': {
    'gaEvent': 'Add_Question_Manually',
    'gaCat': 'Game Builder-Multi Player',
    'gaLabel': 'Timer',
  },
  'Add_Question_Manually_Single_Level_Points': {
    'gaEvent': 'Add_Question_Manually',
    'gaCat': 'Game Builder-Single level',
    'gaLabel': 'Points',
  },
  'Add_Question_Manually_Multi_Player_Points': {
    'gaEvent': 'Add_Question_Manually',
    'gaCat': 'Game Builder-Multi Player',
    'gaLabel': 'Points',
  },
  'Add_Question_Manually_Single_Level_Image': {
    'gaEvent': 'Add_Question_Manually',
    'gaCat': 'Game Builder-Single level',
    'gaLabel': 'Image',
  },
  'Add_Question_Manually_Multi_Player_Image': {
    'gaEvent': 'Add_Question_Manually',
    'gaCat': 'Game Builder-Multi Player',
    'gaLabel': 'Image',
  },
  'Add_Question_Manually_Single_Level_Audio': {
    'gaEvent': 'Add_Question_Manually',
    'gaCat': 'Game Builder-Single level',
    'gaLabel': 'Audio',
  },
  'Add_Question_Manually_Multi_Player_Audio': {
    'gaEvent': 'Add_Question_Manually',
    'gaCat': 'Game Builder-Multi Player',
    'gaLabel': 'Audio',
  }, // Google Analytics Added In More Reports
  'More_Reports_By_Game_Mode_Selected_All': {
    'gaEvent': 'Game_Mode_Selected',
    'gaCat': 'More Reports',
    'gaLabel': 'All',
  },
  'More_Reports_By_Game_Mode_Selected_Live': {
    'gaEvent': 'Game_Mode_Selected',
    'gaCat': 'More Reports',
    'gaLabel': 'Live',
  },
  'More_Reports_By_Game_Mode_Selected_Practice': {
    'gaEvent': 'Game_Mode_Selected',
    'gaCat': 'More Reports',
    'gaLabel': 'Practice',
  },
  'More_Reports_By_Players_Type_Selected_All': {
    'gaEvent': 'Players_Type_Selected',
    'gaCat': 'More Reports',
    'gaLabel': 'All',
  },
  'More_Reports_By_Players_Type_Selected_Active': {
    'gaEvent': 'Players_Type_Selected',
    'gaCat': 'More Reports',
    'gaLabel': 'Active',
  },
  'More_Reports_By_Game_Selected_single': {
    'gaEvent': 'Game_Selected',
    'gaCat': 'More Reports',
    'gaLabel': 'When Games is Selected for Report',
  },
  'More_Reports_By_Game_Selected_Multiple': {
    'gaEvent': 'Game_Selected',
    'gaCat': 'More Reports',
    'gaLabel': 'When Games are Selected for Report',
  },
  'More_Reports_By_Report_Duration_Selected_Start_Date': {
    'gaEvent': 'Report_Duration_Selected',
    'gaCat': 'More Reports',
    'gaLabel': 'Start Date',
  },
  'More_Reports_By_Report_Duration_Selected_End_Date': {
    'gaEvent': 'Report_Duration_Selected',
    'gaCat': 'More Reports',
    'gaLabel': 'End Date',
  },
  'More_Reports_By_Email_Sent': {
    'gaEvent': 'Email_Sent',
    'gaCat': 'More Reports',
    'gaLabel': 'Report Sent On Email',
  }, // trophies
  'Trophies_General_trophy_name': {
    'gaEvent': 'General_Trophy_Filter',
    'gaCat': 'Trophies',
    'gaLabel': 'General Trophy Name Entered',
  },
  'Trophies_General_Trophy_Preview': {
    'gaEvent': 'General_Trophy_Preview',
    'gaCat': 'Trophies',
    'gaLabel': 'General Trophy Previewed',
  },
  'Trophies_Game_trophy_name': {
    'gaEvent': 'Game_Trophy_Filter',
    'gaCat': 'Trophies',
    'gaLabel': 'Game Trophy Name Entered',
  },
  'Trophies_Game_Trophy_Preview': {
    'gaEvent': 'Game_Trophy_Preview',
    'gaCat': 'Trophies',
    'gaLabel': 'Game Trophy Previewed',
  },
  'Trophies_Game_Trophy_Edit_game_points': {
    'gaEvent': 'Game_Trophy_Edit',
    'gaCat': 'Trophies',
    'gaLabel': 'Points',
  },
  'Trophies_Game_Trophy_Edit_attempts': {
    'gaEvent': 'Game_Trophy_Edit',
    'gaCat': 'Trophies',
    'gaLabel': 'Attempts',
  },
  'Trophies_Game_Trophy_Edit_high_score': {
    'gaEvent': 'Game_Trophy_Edit',
    'gaCat': 'Trophies',
    'gaLabel': 'High Score',
  },
  'Trophies_Game_Trophy_Edit_trophy_description': {
    'gaEvent': 'Game_Trophy_Edit',
    'gaCat': 'Trophies',
    'gaLabel': 'Description',
  },
  'Trophies_Video_Play': {
    'gaEvent': 'Video_Play',
    'gaCat': 'Trophies',
    'gaLabel': 'How to Add Trophies',
  }, // Google Analytics Event Added In Contest
  'Contests_Create_A_Contest': {
    'gaEvent': 'Create_A_Contest',
    'gaCat': 'Contests',
    'gaLabel': 'Contest Name, Start Date and End Date added',
  },
  'Contests_Contests_Game_Icon_Changed': {
    'gaEvent': 'Contests_Game_Icon_Changed',
    'gaCat': 'Contests',
    'gaLabel': 'Contests Game Icon is Changed',
  },
  'Contests_Contests_Games_Added': {
    'gaEvent': 'Contests_Games_Added',
    'gaCat': 'Contests',
    'gaLabel': 'Contests Game Added',
  },
  'Contests_Contests_Games_Attempts_Added_Daily': {
    'gaEvent': 'Contests_Games_Attempts_Added_Daily',
    'gaCat': 'Contests',
    'gaLabel': 'Contest With Daily Attempts',
  },
  'Contests_Contests_Games_Attempts_Added_Weekly': {
    'gaEvent': 'Contests_Games_Attempts_Added_Weekly',
    'gaCat': 'Contests',
    'gaLabel': 'Contest With Weekly Attempts',
  },
  'Contests_Contests_Games_Attempts_Added_Total': {
    'gaEvent': 'Contests_Games_Attempts_Added_Total',
    'gaCat': 'Contests',
    'gaLabel': 'Contest With Total Attempts',
  },
  'Contests_Contests_Timezone_selected': {
    'gaEvent': 'Contests_TimeZone_Selected',
    'gaCat': 'Contests',
    'gaLabel': 'Timezone changed',
  },
  'Contests_Contests_Games_Duration_Selected_End_Date': {
    'gaEvent': 'Contests_Games_Duration_Selected',
    'gaCat': 'Contests',
    'gaLabel': 'End Date Entered',
  },
  'Contests_Contests_Games_Deleted': {
    'gaEvent': 'Contests_Games_Deleted',
    'gaCat': 'Contests',
    'gaLabel': 'Game Deleted',
  },
  'Contests_Video_Play': {
    'gaEvent': 'Video_Play',
    'gaCat': 'Contests',
    'gaLabel': 'How to Create Contests Video Viewed',
  },
  'Contests_Contests_Rules_Added': {
    'gaEvent': 'Contests_Rules_Added',
    'gaCat': 'Contests',
    'gaLabel': 'Rules of Contest Added',
  },
  'Contests_Contests_Reward_Selected': {
    'gaEvent': 'Contests_Reward_Selected',
    'gaCat': 'Contests',
    'gaLabel': 'Reward of Contest Added',
  },
  'Contests_Contests_Players_By_Location': {
    'gaEvent': 'Contests_Players_By_Location',
    'gaCat': 'Contests',
    'gaLabel': 'Players Added by Location for Contest',
  },
  'Contests_Contests_Players_By_Department': {
    'gaEvent': 'Contests_Players_By_Department',
    'gaCat': 'Contests',
    'gaLabel': 'Players Added by Department for Contest',
  },
  'Contests_Contests_Trophy_Viewed': {
    'gaEvent': 'Contests_Trophy_Viewed',
    'gaCat': 'Contests',
    'gaLabel': 'Contest Trophy Viewed',
  },
  'Contests_Contests_Scheduled': {
    'gaEvent': 'Contests_Scheduled',
    'gaCat': 'Contests',
    'gaLabel': 'Contest Scheduled',
  },
  'Contests_Game_filtered_by_category': {
    'gaEvent': 'Contests_Game_filtered_by_category',
    'gaCat': 'Contests',
    'gaLabel': '',
  },
  'Contests_Game_filtered_by_rating': {
    'gaEvent': 'Contests_Game_filtered_by_rating',
    'gaCat': 'Contests',
    'gaLabel': '',
  },
  'Contests_Game_filtered_by_timeplayed': {
    'gaEvent': 'Contests_Game_filtered_by_timeplayed',
    'gaCat': 'Contests',
    'gaLabel': '',
  },
  'Contests_Game_sorted_by_game': {
    'gaEvent': 'Contests_Game_sorted_by_game',
    'gaCat': 'Contests',
    'gaLabel': '',
  },
  'Contests_Game_sorted_by_category': {
    'gaEvent': 'Contests_Game_sorted_by_category',
    'gaCat': 'Contests',
    'gaLabel': '',
  },
  'Contests_Game_sorted_by_lastplayed': {
    'gaEvent': 'Contests_Game_sorted_by_lastplayed',
    'gaCat': 'Contests',
    'gaLabel': '',
  },
  'Contests_Game_sorted_by_rating': {
    'gaEvent': 'Contests_Game_sorted_by_rating',
    'gaCat': 'Contests',
    'gaLabel': '',
  },  // Google Analytics Events Added In Contest Library
  'Contests_Library_Viewed': {
    'gaEvent': 'Contests_Library_Clicked',
    'gaCat': 'Contests Library',
    'gaLabel': 'Contest Library Viewed',
  },
  'Contests_Detailed_Viewed': {
    'gaEvent': 'Contests_Details_Clicked',
    'gaCat': 'Contests Library',
    'gaLabel': 'Contests Detailed Viewed',
  },
  'Contests_Library_Filtered_By_State': {
    'gaEvent': 'Contests_Library_Filter_By_State',
    'gaCat': 'Contests Library',
    'gaLabel': 'Contest Library State Filter is Applied',
  },
  'Contests_Library_Filtered_By_Owner': {
    'gaEvent': 'Contests_Library_Filter_By_Owner',
    'gaCat': 'Contests Library',
    'gaLabel': 'Contest Library Owner Filter is Applied',
  },
  'Contests_Live_Contest_Stopped': {
    'gaEvent': 'Live_Contest_Stopped',
    'gaCat': 'Contests Library',
    'gaLabel': 'Live Contest Stopped',
  },
  'Contests_Contest_Edited': {
    'gaEvent': 'Contest_Edited',
    'gaCat': 'Contests Library',
    'gaLabel': 'Contest Edited',
  },
  'Contests_Contest_Deleted': {
    'gaEvent': 'Contest_Deleted',
    'gaCat': 'Contests Library',
    'gaLabel': 'Contest Deleted',
  },
  'Contests_Contest_Cloned': {
    'gaEvent': 'Contest_Cloned',
    'gaCat': 'Contests Library',
    'gaLabel': 'Contest Cloned',
  },
  'Contract_Enforcement_Players_Manual_Adding': {
    'gaEvent': 'CE_player_limit_reached',
    'gaCat': 'Contract Enforcement',
    'gaLabel': 'While adding manually',
  },
  'Contract_Enforcement_Players_Reactivation': {
    'gaEvent': 'CE_player_limit_reached',
    'gaCat': 'Contract Enforcement',
    'gaLabel': 'While reactivation',
  },
  'Contract_Enforcement_Players_Using_CSV': {
    'gaEvent': 'CE_player_limit_reached',
    'gaCat': 'Contract Enforcement',
    'gaLabel': 'While using CSV',
  },
  'Contract_Enforcement_Managers_Manual_Adding': {
    'gaEvent': 'CE_manager_limit_reached',
    'gaCat': 'Contract Enforcement',
    'gaLabel': 'While adding manually',
  },
  'Contract_Enforcement_Managers_Reactivation': {
    'gaEvent': 'CE_manager_limit_reached',
    'gaCat': 'Contract Enforcement',
    'gaLabel': 'While reactivation',
  },
  'Contract_Enforcement_Games_Single_Level': {
    'gaEvent': 'CE_game_limit_reached',
    'gaCat': 'Contract Enforcement',
    'gaLabel': 'via single level',
  },
  'Contract_Enforcement_Games_Multi_Player': {
    'gaEvent': 'CE_game_limit_reached',
    'gaCat': 'Contract Enforcement',
    'gaLabel': 'via multiplayer',
  },
  'Contract_Enforcement_Games_Cloning': {
    'gaEvent': 'CE_game_limit_reached',
    'gaCat': 'Contract Enforcement',
    'gaLabel': 'While game cloning',
  },
  'Contract_Enforcement_Games_Added_To_Company': {
    'gaEvent': 'CE_game_limit_reached',
    'gaCat': 'Contract Enforcement',
    'gaLabel': 'While adding game to company',
  },
  'Contract_Enforcement_Games_Added_From_Shop': {
    'gaEvent': 'CE_game_limit_reached',
    'gaCat': 'Contract Enforcement',
    'gaLabel': 'While adding shop game to library',
  }, // Google Analytics Added In Marketplace Preview Screen
  'Marketplace_Game_Preview_Screen_Viewed': {
    'gaEvent': 'Game_Preview_Screen_Viewed',
    'gaCat': 'Marketplace',
    'gaLabel': 'Game preview screen viewed',
  },
  'Marketplace_Add_To_Game_Library_After_Preview': {
    'gaEvent': 'Add_To_Game_Library',
    'gaCat': 'Marketplace',
    'gaLabel': 'Marketplace game added to company after watching preview',
  }, // Google Analytics Added In Group
  'Groups_By_Add_Groups': {
    'gaEvent': 'Add_Groups',
    'gaCat': 'Groups',
    'gaLabel': 'New Group Added',
  },
  'Groups_By_View_Groups': {
    'gaEvent': 'View_Groups',
    'gaCat': 'Groups',
    'gaLabel': 'Existing Group Viewed',
  },
  'Groups_By_Add_group_name': {
    'gaEvent': 'Add_Groups_Filter',
    'gaCat': 'Groups',
    'gaLabel': 'Filtered by Group Name',
  },
  'Groups_By_Edit_Group_Name': {
    'gaEvent': 'Edit_Group_Name',
    'gaCat': 'Groups',
    'gaLabel': 'Group Name Edited',
  },
  'Groups_By_Delete_Groups': {
    'gaEvent': 'Delete_Groups',
    'gaCat': 'Groups',
    'gaLabel': 'Groups Deleted',
  }, // Google Analytics Events Added In Deparments
  'Departments_By_Add_Department': {
    'gaEvent': 'Add_Department',
    'gaCat': 'Departments',
    'gaLabel': 'New Department Added'
  },
  'Departments_By_View_Department': {
    'gaEvent': 'Department_List_Clicked',
    'gaCat': 'Departments',
    'gaLabel': 'Department Viewed'
  },
  'Departments_By_Edit_Department': {
    'gaEvent': 'Edit_Department',
    'gaCat': 'Departments',
    'gaLabel': 'Department Edited'
  },
  'Departments_By_department_name': {
    'gaEvent': 'Department_Filter',
    'gaCat': 'Departments',
    'gaLabel': 'Filtered By Department'
  },
  'Departments_By_location_id': {
    'gaEvent': 'Location_Filter',
    'gaCat': 'Departments',
    'gaLabel': 'Filtered By Location'
  },
  // Goggle Analytics Added In Leaderboard
  'Leaderboard_By_Leaderboard_Settings_Viewed': {
    'gaEvent': 'Leaderboard_Settings_Clicked',
    'gaCat': 'Leaderboard',
    'gaLabel': 'Leaderboard Settings Viewed',
  },
  'Leaderboard_By_Start_Date_Edited': {
    'gaEvent': 'Start_Date_Edited',
    'gaCat': 'Leaderboard',
    'gaLabel': 'Start Date Edited',
  },
  'Leaderboard_By_Next_Reset_Edited': {
    'gaEvent': 'Next_Reset_Edited',
    'gaCat': 'Leaderboard',
    'gaLabel': 'Next Reset Edited',
  },
  'Leaderboard_By_Repeat_Edited_never': {
    'gaEvent': 'Repeat_Edited',
    'gaCat': 'Leaderboard',
    'gaLabel': 'Never',
  },
  'Leaderboard_By_Repeat_Edited_daily': {
    'gaEvent': 'Repeat_Edited',
    'gaCat': 'Leaderboard',
    'gaLabel': 'Daily',
  },
  'Leaderboard_By_Repeat_Edited_weekly': {
    'gaEvent': 'Repeat_Edited',
    'gaCat': 'Leaderboard',
    'gaLabel': 'Weekly',
  },
  'Leaderboard_By_Repeat_Edited_monthly': {
    'gaEvent': 'Repeat_Edited',
    'gaCat': 'Leaderboard',
    'gaLabel': 'Monthly',
  },
  'Leaderboard_By_Leaderboard_Settings_By_Group': {
    'gaEvent': 'Leaderboard_Settings_By_Group',
    'gaCat': 'Leaderboard',
    'gaLabel': 'Leaderboard By Group',

  },
  'Leaderboard_By_Leaderboard_Settings_By_Player': {
    'gaEvent': 'Leaderboard_Settings_By_Player',
    'gaCat': 'Leaderboard',
    'gaLabel': 'Leaderboard By Player',

  },
  'Leaderboard_By_Leaderboard_Saved': {
    'gaEvent': 'Leaderboard_Saved',
    'gaCat': 'Leaderboard',
    'gaLabel': 'Leaderboard Saved',

  }, 
  'Leaderboard_Leaderboard_Layout_Updated': {
    'gaEvent': 'Leaderboard_Layout_Updated',
    'gaCat': 'Leaderboard',
    'gaLabel': 'Leaderboard layout updated',

  }, // Google Analytics Added In Locations
  'Locations_By_Location_Page_Viewed': {
    'gaEvent': 'Location_Page_Clicked',
    'gaCat': 'Locations',
    'gaLabel': 'Company Locations Page Viewed',
  },
  'Locations_By_Basic_Details_Added_0': {
    'gaEvent': 'Basic_Details_Added',
    'gaCat': 'Locations',
    'gaLabel': 'Basic Details Added ',
  },
  'Locations_By_Departments_Details_Added_1': {
    'gaEvent': 'Departments_Details_Added',
    'gaCat': 'Locations',
    'gaLabel': 'Department Details Added ',
  },
  'Locations_By_Basic_Details_Edited_0': {
    'gaEvent': 'Basic_Details_Edited',
    'gaCat': 'Locations',
    'gaLabel': 'Basic Details Edited',
  },
  'Locations_By_Departments_Details_Edited_1': {
    'gaEvent': 'Departments_Details_Edited',
    'gaCat': 'Locations',
    'gaLabel': 'Departments Details Edited',
  },
  'location_by_location_name': {
    'gaEvent': 'Location_Filter',
    'gaCat': 'Locations',
    'gaLabel': 'Filtered by Location',
  },
  'location_by_city': {
    'gaEvent': 'City_Filter',
    'gaCat': 'Locations',
    'gaLabel': 'Filtered by City',
  },
  'location_by_country_id': {
    'gaEvent': 'Country_Filter',
    'gaCat': 'Locations',
    'gaLabel': 'Filtered by Country',
  },  // Google Analytics Added In VIP Code
  'VIP_Code_By_VIP_Code_Viewed': {
    'gaEvent': 'VIP_Code_Clicked',
    'gaCat': 'VIP Code',
    'gaLabel': 'VIP Code Viewed',
  },
  'VIP_Code_By_VIP_Code_Created': {
    'gaEvent': 'VIP_Code_Created',
    'gaCat': 'VIP Code',
    'gaLabel': 'New VIP Code Created',
  },
  'VIP_By_vip_code': {
    'gaEvent': 'Filter_By_Code',
    'gaCat': 'VIP Code',
    'gaLabel': 'Filtered By Code',
  },
  'VIP_By_location_ids': {
    'gaEvent': 'Filter_By_Location',
    'gaCat': 'VIP Code',
    'gaLabel': 'Filtered By Location',
  },
  'VIP_By_department_ids': {
    'gaEvent': 'Filter_By_Department',
    'gaCat': 'VIP Code',
    'gaLabel': 'Filtered By Department',
  },
  'VIP_By_status': {
    'gaEvent': 'Filter_By_Status',
    'gaCat': 'VIP Code',
    'gaLabel': 'Filtered By Status',
  },
  // Google Analytics Event Added In Manager
  'Users_Manager_Information_0': {
    'gaEvent': 'Add_Manager_Basic_Information',
    'gaCat': 'Users-Manager',
    'gaLabel': 'Image/Firstname/LastName/Department/Password/Confirm Password',
  },
  'Users_Manager_Information_1': {
    'gaEvent': 'Add_Manager_Additional_Information',
    'gaCat': 'Users-Manager',
    // tslint:disable-next-line:max-line-length
    'gaLabel': 'Jobtitle/Country/City/Date Of Birth/ College/ College Graduation Year/ College Major/ Highest Degree Completed/ Employee ID',
  },
  'Users_Manager_Filter_name': {
    'gaEvent': 'Manager_Filter_Name',
    'gaCat': 'Users-Manager',
    'gaLabel': 'Filtered By Name',
  },
  'Users_Manager_Filter_email': {
    'gaEvent': 'Manager_Filter_Email',
    'gaCat': 'Users-Manager',
    'gaLabel': 'Filtered By Email',
  },
  'Users_Manager_Filter_Location': {
    'gaEvent': 'Manager_Filter_Location',
    'gaCat': 'Users-Manager',
    'gaLabel': 'Filtered By Location',
  },
  'Users_Manager_Filter_Department': {
    'gaEvent': 'Manager_Filter_Department',
    'gaCat': 'Users-Manager',
    'gaLabel': 'Filtered By Department',
  },
  'Users_Manager_Filter_status': {
    'gaEvent': 'Manager_Filter_Status',
    'gaCat': 'Users-Manager',
    'gaLabel': 'Filtered By Status',
  },
  'Users_Manager_Filter_access_type': {
    'gaEvent': 'Manager_Selected',
    'gaCat': 'Users-Manager',
    'gaLabel': 'Manager Selected',
  },
  'Users_Manager_Filter_Manager': {
    'gaEvent': 'Manager_Filter_Type',
    'gaCat': 'Users-Manager',
    'gaLabel': 'Manager',
  },
  'Users_Manager_Filter_Mid-Manager': {
    'gaEvent': 'Manager_Filter_Type',
    'gaCat': 'Users-Manager',
    'gaLabel': 'Mid-Manager',
  },
  'Users_Manager_Filter_TeamLead': {
    'gaEvent': 'Manager_Filter_Type',
    'gaCat': 'Users-Manager',
    'gaLabel': 'Teamlead',
  },
  'Users_Manager_Filter_Inactive': {
    'gaEvent': 'Manager_Deactivated',
    'gaCat': 'Users-Manager',
    'gaLabel': 'Manager Deactivated',
  },
  'Users_Manager_Filter_Active': {
    'gaEvent': 'Manager_Activated',
    'gaCat': 'Users-Manager',
    'gaLabel': 'Manager Activated',
  },
  'Users_Manager_Report_Download_CSV': {
    'gaEvent': 'Manager_Report_Download_CSV',
    'gaCat': 'Users-Manager',
    'gaLabel': 'Manager Report Downloaded',
  },
  'Users_Manager_Edit_Information_0': {
    'gaEvent': 'Edit_Manager_Basic_Information',
    'gaCat': 'Users-Manager',
    'gaLabel': 'Image/Firstname/LastName/Department/Password/Confirm Password',
  },
  'Users_Manager_Edit_Information_1': {
    'gaEvent': 'Edit_Manager_Additional_Information',
    'gaCat': 'Users-Manager',
    // tslint:disable-next-line:max-line-length
    'gaLabel': 'Jobtitle/Country/City/Date Of Birth/ College/ College Graduation Year/ College Major/ Highest Degree Completed/ Employee ID',
  }, // Google Analytics Events Added In Players
  'Users_Players_Add_Player_Information_0': {
    'gaEvent': 'Add_Player_Basic_Information',
    'gaCat': 'Users-Players',
    'gaLabel': 'Image/Firstname/LastName/Department/Password/Confirm Password',
  },
  'Users_Players_Add_Player_Information_1': {
    'gaEvent': 'Add_Player_Additional_Information',
    'gaCat': 'Users-Players',
    // tslint:disable-next-line:max-line-length
    'gaLabel': 'Group/Jobtitle/Country/City/Date of Birth/College/College Graduation Year/College Major/Highest Degree Completed/Employee ID/Ethnicity',
  },
  'Users_Players_Players_Filter_By_name': {
    'gaEvent': 'Players_Filter_By_Name',
    'gaCat': 'Users-Players',
    'gaLabel': 'Name Filter Applied',
  },
  'Users_Players_Players_Filter_By_email': {
    'gaEvent': 'Players_Filter_By_Email',
    'gaCat': 'Users-Players',
    'gaLabel': 'Email Filter Applied',
  },
  'Users_Players_Players_Filter_By_Location': {
    'gaEvent': 'Players_Filter_By_Location',
    'gaCat': 'Users-Players',
    'gaLabel': 'Location Filter Applied',
  },
  'Users_Players_Players_Filter_By_Department': {
    'gaEvent': 'Players_Filter_By_Department',
    'gaCat': 'Users-Players',
    'gaLabel': 'Department Filter Applied',
  },
  'Users_Players_Players_Filter_By_Group': {
    'gaEvent': 'Players_Filter_By_Group',
    'gaCat': 'Users-Players',
    'gaLabel': 'Group Filter Applied',
  },
  'Users_Players_Players_Filter_By_status': {
    'gaEvent': 'Players_Filter_By_Status',
    'gaCat': 'Users-Players',
    'gaLabel': 'Status Filter Applied',
  },
  'Users_Players_Players_Filter_By_VIP Code': {
    'gaEvent': 'Players_Filter_By_VIP_Code',
    'gaCat': 'Users-Players',
    'gaLabel': 'VIP Code Filter Applied',
  },
  'Users_Players_Player_Report_Download_CSV': {
    'gaEvent': 'Player_Report_Download_CSV',
    'gaCat': 'Users-Players',
    'gaLabel': 'Player Report Downloaded',
  },
  'Users_Players_Video_Play': {
    'gaEvent': 'Video_Play',
    'gaCat': 'Users-Players',
    'gaLabel': 'How To Login & Add Users',
  },
  'Users_Players_Upload_Players_List': {
    'gaEvent': 'Upload_Players_List',
    'gaCat': 'Users-Players',
    'gaLabel': 'Players List Uploaded',
  },
  'Users_Players_Player_Selected': {
    'gaEvent': 'Player_Selected',
    'gaCat': 'Users-Players',
    'gaLabel': 'When Player is Selected',
  },
  'Users_Players_Edit_Player_Information_0': {
    'gaEvent': 'Edit_Player_Basic_Information',
    'gaCat': 'Users-Players',
    'gaLabel': 'Image/Firstname/LastName/Department/Password/Confirm Password',
  },
  'Users_Players_Edit_Player_Information_1': {
    'gaEvent': 'Edit_Player_Additional_Information',
    'gaCat': 'Users-Players',
    // tslint:disable-next-line:max-line-length
    'gaLabel': 'Group/Jobtitle/Country/City/Date of Birth/College/College Graduation Year/College Major/Highest Degree Completed/Employee ID/Ethnicity',
  },
  // Google Analytics Events Added In company
  'Company_By_Company_Page': {
    'gaEvent': 'Company_Page',
    'gaCat': 'Company',
    'gaLabel': 'Company Page Viewed',
  }, // Google Analytics Events Added In Marketplace
  'Marketplace_By_ADD_To_SHOP': {
    'gaEvent': 'ADD_To_SHOP',
    'gaCat': 'Marketplace',
    'gaLabel': ''
  },
  'Marketplace_By_Edit_Banner': {
    'gaEvent': 'Edit_Banner',
    'gaCat': 'Marketplace',
    'gaLabel': ''
  },
  'Marketplace_By_Edit_Shop_Game_Card': {
    'gaEvent': 'Edit_Shop_Game_Card',
    'gaCat': 'Marketplace',
    'gaLabel': ''
  },
  // Google Analytics Added In Game Archive
  'Game_Archiving_Game_Archived': {
    'gaEvent': 'Game_Archived',
    'gaCat': 'Game Archiving',
    'gaLabel': '',
  },
  'Game_Archiving_Game_Unarchived': {
    'gaEvent': 'Game_Unarchived',
    'gaCat': 'Game Archiving',
    'gaLabel': '',
  },
  'Game_Archiving_Archived_Game_Deleted': {
    'gaEvent': 'Archived_Game_Deleted',
    'gaCat': 'Game Archiving',
    'gaLabel': '',
  },
  'Game_Archiving_Filtered_by_Archive': {
    'gaEvent': 'Filtered_by_Archive',
    'gaCat': 'Game Archiving',
    'gaLabel': '',
  },
  // Google Analytics Added In Branding
  'Branding_By_Mobile_Background': {
    'gaEvent': 'Mobile_Background',
    'gaCat': 'Branding',
    'gaLabel': 'Mobile Background Edited',
  },
  'Branding_By_Mobile_Text': {
    'gaEvent': 'Mobile_Text',
    'gaCat': 'Branding',
    'gaLabel': 'Mobile Text Edited',
  },
  'Branding_By_Background_Image': {
    'gaEvent': 'Background_Image',
    'gaCat': 'Branding',
    'gaLabel': 'Background Image Edited',
  },
  'Branding_By_introSound': {
    'gaEvent': 'Intro_Music_Play',
    'gaCat': 'Branding',
    'gaLabel': 'Intro Music Played',
  },
  'Branding_By_introSound_Delete': {
    'gaEvent': 'Intro_Music_Delete',
    'gaCat': 'Branding',
    'gaLabel': 'Intro Music Deleted',
  },
  'Branding_By_profileThemeSound': {
    'gaEvent': 'Preview_Music_Play',
    'gaCat': 'Branding',
    'gaLabel': 'Preview Music Played',
  },
  'Branding_By_profileThemeSound_Delete': {
    'gaEvent': 'Preview_Music_Delete',
    'gaCat': 'Branding',
    'gaLabel': 'Preview Music Deleted',
  },
  'Branding_By_winScreenSound': {
    'gaEvent': 'End_Game_Music_Play',
    'gaCat': 'Branding',
    'gaLabel': 'End Game Music Played',
  },
  'Branding_By_winScreenSound_Delete': {
    'gaEvent': 'End_Game_Music_Delete',
    'gaCat': 'Branding',
    'gaLabel': 'End Game Music Deleted',
  },
  'Branding_By_hundredPercentAnimationSound': {
    'gaEvent': '100%_Score_Music_Play',
    'gaCat': 'Branding',
    'gaLabel': '100% Score Music Played',
  },
  'Branding_By_hundredPercentAnimationSound_Delete': {
    'gaEvent': '100%_Score_Music_Delete',
    'gaCat': 'Branding',
    'gaLabel': '100% Score Music Deleted',
  },
  'Branding_By_buttonSound': {
    'gaEvent': 'Button_Music_Play',
    'gaCat': 'Branding',
    'gaLabel': 'Button Music Played',
  },
  'Branding_By_buttonSound_Delete': {
    'gaEvent': 'Button_Music_Delete',
    'gaCat': 'Branding',
    'gaLabel': 'Button Music Deleted',
  },
  'Branding_By_buzzerSound': {
    'gaEvent': 'Buzzer_Music_Play',
    'gaCat': 'Branding',
    'gaLabel': 'Buzzer Music Played',
  },
  'Branding_By_buzzerSound_Delete': {
    'gaEvent': 'Buzzer_Music_Delete',
    'gaCat': 'Branding',
    'gaLabel': 'Buzzer Music Deleted',
  },
  'Branding_By_correctAnswerSound': {
    'gaEvent': 'Correct_Answer_Music_Play',
    'gaCat': 'Branding',
    'gaLabel': 'Correct Answer Music Played',
  },
  'Branding_By_correctAnswerSound_Delete': {
    'gaEvent': 'Correct_Answer_Music_Delete',
    'gaCat': 'Branding',
    'gaLabel': 'Correct Answer Music Deleted',
  },
  'Branding_By_timerSound': {
    'gaEvent': 'Timer_Music_Play',
    'gaCat': 'Branding',
    'gaLabel': 'Timer Music Played',
  },
  'Branding_By_timerSound_Delete': {
    'gaEvent': 'Timer_Music_Delete',
    'gaCat': 'Branding',
    'gaLabel': 'Timer Music Deleted',
  },
  'Branding_By_wrongAnswerSound': {
    'gaEvent': 'Wrong_Answer_Music_Play',
    'gaCat': 'Branding',
    'gaLabel': 'Wrong Answer Music Played',
  },
  'Branding_By_wrongAnswerSound_Delete': {
    'gaEvent': 'Wrong_Answer_Music_Delete',
    'gaCat': 'Branding',
    'gaLabel': 'Wrong Answer Music Deleted',
  },
  'Branding_By_whistleLongSound': {
    'gaEvent': '3_2_1_GO!_Music_Play',
    'gaCat': 'Branding',
    'gaLabel': ' 3 2 1 GO! Music Played',
  },
  'Branding_By_whistleLongSound_Delete': {
    'gaEvent': '3_2_1_GO!_Music_Delete',
    'gaCat': 'Branding',
    'gaLabel': ' 3 2 1 GO! Music Deleted',
  },
  'Branding_By_introSound_edit': {
    'gaEvent': 'Intro_Music_Edit',
    'gaCat': 'Branding',
    'gaLabel': 'Intro Music Edited',
  },
  'Branding_By_profileThemeSound_edit': {
    'gaEvent': 'Preview_Music_Edit',
    'gaCat': 'Branding',
    'gaLabel': 'Preview Music Edited',
  },
  'Branding_By_winScreenSound_edit': {
    'gaEvent': 'End_Game_Music_Edit',
    'gaCat': 'Branding',
    'gaLabel': 'End Game Music Edited',
  },
  'Branding_By_hundredPercentAnimationSound_edit': {
    'gaEvent': '100%_Score_Music_Edit',
    'gaCat': 'Branding',
    'gaLabel': '100% Score Music Edited',
  },
  'Branding_By_buttonSound_edit': {
    'gaEvent': 'Button_Music_Edit',
    'gaCat': 'Branding',
    'gaLabel': 'Button Music Edited',
  },
  'Branding_By_buzzerSound_edit': {
    'gaEvent': 'Buzzer_Music_Edit',
    'gaCat': 'Branding',
    'gaLabel': 'Buzzer Music Edited',
  },
  'Branding_By_correctAnswerSound_edit': {
    'gaEvent': 'Correct_Answer_Music_Edit',
    'gaCat': 'Branding',
    'gaLabel': 'Correct Answer Music Edited',
  },
  'Branding_By_timerSound_edit': {
    'gaEvent': 'Timer_Music_Edit',
    'gaCat': 'Branding',
    'gaLabel': 'Timer Music Edited',
  },
  'Branding_By_wrongAnswerSound_edit': {
    'gaEvent': 'Wrong_Answer_Music_Edit',
    'gaCat': 'Branding',
    'gaLabel': 'Wrong Answer Music Edited',
  },
  'Branding_By_whistleLongSound_edit': {
    'gaEvent': '3_2_1_GO!_Music_Edit',
    'gaCat': 'Branding',
    'gaLabel': '3 2 1 GO! Music Edited',
  },
  'Marketplace_By_Delete_Shop_Game': {
    'gaEvent': 'Delete_Shop_Game',
    'gaCat': 'Marketplace',
    'gaLabel': ''
  },
  'Marketplace_By_Edit_Marketplace_Game_Preview': {
    'gaEvent': 'Edit_Marketplace_Game_Preview',
    'gaCat': 'Marketplace',
    'gaLabel': ''
  }, // Google Anayltics Added in live Game deletion
  'Game_Library_Single_level_By_Game_deleted': {
    'gaEvent': 'Game_deleted',
    'gaCat': 'Game Library- Single level',
    'gaLabel': 'Delete_game',
  }, // Self Service Registration
  'SSR_User_setup_done': {
    'gaEvent': 'User_information_submitted',
    'gaCat': 'Self Service Registration',
    'gaLabel': 'SSR user information submitted'
  },
  'SSR_Company_setup_done': {
    'gaEvent': 'Company_information_submitted',
    'gaCat': 'Self Service Registration',
    'gaLabel': 'SSR Company information submitted'
  },
  'SSR_Company_created': {
    'gaEvent': 'Company_category_submitted',
    'gaCat': 'Self Service Registration',
    'gaLabel': 'SSR Company category submitted'
  },

  'SSR_Company_created_popup1': {
    'gaEvent': 'Welcome_information_P1',
    'gaCat': 'Self Service Registration',
    'gaLabel': 'Reached Welcome popup'
  },
  'SSR_Company_created_popup1_appstore': {
    'gaEvent': 'Welcome_information_P1',
    'gaCat': 'Self Service Registration',
    'gaLabel': 'App Store clicked'
  },
  'SSR_Company_created_popup1_playstore': {
    'gaEvent': 'Welcome_information_P1',
    'gaCat': 'Self Service Registration',
    'gaLabel': 'Play Store clicked'
  },
  'SSR_Company_created_popup2': {
    'gaEvent': 'Login_information_P2',
    'gaCat': 'Self Service Registration',
    'gaLabel': 'Reached Login information pop-up'
  },
  'SSR_Company_created_popup3': {
    'gaEvent': 'Shop_information_P3',
    'gaCat': 'Self Service Registration',
    'gaLabel': 'Reached Shop info pop-up'
  },
  'SSR_Company_created_popup3_video': {
    'gaEvent': 'Shop_information_P3',
    'gaCat': 'Self Service Registration',
    'gaLabel': 'video played'
  },
  'SSR_Company_created_popup4': {
    'gaEvent': 'Game_builder_information_P4',
    'gaCat': 'Self Service Registration',
    'gaLabel': 'Reached Game builder info pop-up'
  },
  'SSR_Company_created_popup4_video': {
    'gaEvent': 'Game_builder_information_P4',
    'gaCat': 'Self Service Registration',
    'gaLabel': 'video played'
  },
  'SSR_Company_created_popup5': {
    'gaEvent': 'File_upload_information_P5',
    'gaCat': 'Self Service Registration',
    'gaLabel': 'Reached File upload pop-up '
  },
  'SSR_Company_created_popup5_video': {
    'gaEvent': 'File_upload_information_P5',
    'gaCat': 'Self Service Registration',
    'gaLabel': 'offer Video played'
  },
  'SSR_Company_created_popup5_upload': {
    'gaEvent': 'File_upload_information_P5',
    'gaCat': 'Self Service Registration',
    'gaLabel': 'file uploaded'
  },
  'SSR_Company_created_popup6': {
    'gaEvent': 'Add_new_user_information_P6',
    'gaCat': 'Self Service Registration',
    'gaLabel': 'Reached Add new user pop-up'
  },
  'SSR_Company_created_popup6_copied': {
    'gaEvent': 'Add_new_user_information_P6',
    'gaCat': 'Self Service Registration',
    'gaLabel': 'Copied VIP code'
  },
  'SSR_Company_created_popup7': {
    'gaEvent': 'SSR_Completed_P7',
    'gaCat': 'Self Service Registration',
    'gaLabel': 'Flow Completed'
  },
  'Game_Library_Single_level_By_Deletion_restricted': {
    'gaEvent': 'Deletion_restricted',
    'gaCat': 'Game Library- Single level',
    'gaLabel': 'Delete_game',
  },
  'Detailed_Report_SLG_Player_Trophy_Viewed': {
    'gaEvent': 'SLG_Player_Trophy_Viewed',
    'gaCat': 'Detailed Report',
    'gaLabel': 'Manager viewed SLG trophy',
  },
  'Detailed_Report_SLG_Player_Trophy_Downloaded': {
    'gaEvent': 'SLG_Player_Trophy_Downloaded',
    'gaCat': 'Detailed Report',
    'gaLabel': 'Manager downloaded SLG trophy',
  },
  'Detailed_Report_MLG_Player_Trophy_Viewed': {
    'gaEvent': 'MLG_Player_Trophy_Viewed',
    'gaCat': 'Detailed Report',
    'gaLabel': 'Manager viewed MLG trophy',
  },
  'Detailed_Report_MLG_Player_Trophy_Downloaded': {
    'gaEvent': 'MLG_Player_Trophy_Downloaded',
    'gaCat': 'Detailed Report',
    'gaLabel': 'Manager downloaded MLG trophy',
  }, // Custom Audience
  'Custom_Audience_Custom_Audience_menu_clicked': {
    'gaEvent': 'Custom_Audience_menu_clicked',
    'gaCat': 'Custom Audience',
    'gaLabel': '',
  },
  'Custom_Audience_New_Custom_Audience_created': {
    'gaEvent': 'New_Custom_Audience_created',
    'gaCat': 'Custom Audience',
    'gaLabel': '',
  },
  'Custom_Audience_Custom_Audience_player_added': {
    'gaEvent': 'Custom_Audience_player_added',
    'gaCat': 'Custom Audience',
    'gaLabel': '',
  },
  'Custom_Audience_Custom_Audience_add_player_player_search': {
    'gaEvent': 'Custom_Audience_add_player_player_search',
    'gaCat': 'Custom Audience',
    'gaLabel': '',
  },
  'Custom_Audience_Custom_Audience_add_player_player_name_sorted': {
    'gaEvent': 'Custom_Audience_add_player_player_name_sorted',
    'gaCat': 'Custom Audience',
    'gaLabel': '',
  },
  'Custom_Audience_Custom_Audience_add_player_location_sorted': {
    'gaEvent': 'Custom_Audience_add_player_location_sorted',
    'gaCat': 'Custom Audience',
    'gaLabel': '',
  },
  'Custom_Audience_Custom_Audience_add_player_department_sorted': {
    'gaEvent': 'Custom_Audience_add_player_department_sorted',
    'gaCat': 'Custom Audience',
    'gaLabel': '',
  },
  'Custom_Audience_Custom_Audience_deleted': {
    'gaEvent': 'Custom_Audience_deleted',
    'gaCat': 'Custom Audience',
    'gaLabel': '',
  },
  'Custom_Audience_Custom_Audience_cannot_delete': {
    'gaEvent': 'Custom_Audience_cannot_delete',
    'gaCat': 'Custom Audience',
    'gaLabel': '',
  },
  'Custom_Audience_Custom_Audience_edited': {
    'gaEvent': 'Custom_Audience_edited',
    'gaCat': 'Custom Audience',
    'gaLabel': '',
  },
  'Custom_Audience_Custom_Audience_scheduling_Standalone': {
    'gaEvent': 'Custom_Audience_scheduling_Standalone',
    'gaCat': 'Custom Audience',
    'gaLabel': '',
  },
  'Custom_Audience_Custom_Audience_scheduling_MLG': {
    'gaEvent': 'Custom_Audience_scheduling_MLG',
    'gaCat': 'Custom Audience',
    'gaLabel': '',
  },
  'Custom_Audience_Custom_Audience_scheduling_Contest': {
    'gaEvent': 'Custom_Audience_scheduling_Contest',
    'gaCat': 'Custom Audience',
    'gaLabel': '',
  }, 
  'Custom_Audience_Custom_Audience_Delete_Player': {
    'gaEvent': 'Custom_Audience_Delete_Player',
    'gaCat': 'Custom Audience',
    'gaLabel': '',
  }, 
  'Custom_Audience_Create_custom_audience': {
    'gaEvent': 'Create_custom_audience',
    'gaCat': 'Custom Audience',
    'gaLabel': 'Audience created',
  }, 
  'Custom_Audience_Custom_Audience_Filter_Location': {
    'gaEvent': 'Custom_Audience_Filter_By_Location',
    'gaCat': 'Custom Audience',
    'gaLabel': 'Filter by location',
  }, 
  'Custom_Audience_Custom_Audience_Filter_Department': {
    'gaEvent': 'Custom_Audience_Filter_By_Department',
    'gaCat': 'Custom Audience',
    'gaLabel': 'filter by department',
  }, 
  // Manager Empowerment
  'Manager_Empowerment_Dashboard_By_Team': {
    'gaEvent': 'Leaderboard_Scrolled',
    'gaCat': 'Manager Empowerment - Dashboard',
    'gaLabel': 'By: Team',
  },
  'Manager_Empowerment_Dashboard_By_Game_SLG': {
    'gaEvent': 'Leaderboard_Scrolled',
    'gaCat': 'Manager Empowerment - Dashboard',
    'gaLabel': 'By: Game-SLG',
  },
  'Manager_Empowerment_Dashboard_By_Contest': {
    'gaEvent': 'Leaderboard_Scrolled',
    'gaCat': 'Manager Empowerment - Dashboard',
    'gaLabel': 'By: Contest',
  },
  // Game_Building
  'Game_Building_SLG': {
    'gaEvent': 'Build_A_Game',
    'gaCat': 'Game_Building',
    'gaLabel': 'Started building SLG',
  },
  'Game_Building_MLG': {
    'gaEvent': 'Build_A_Game',
    'gaCat': 'Game_Building',
    'gaLabel': 'Started building MLG',
  },
  'Game_Building_Multiplayer': {
    'gaEvent': 'Build_A_Game',
    'gaCat': 'Game_Building',
    'gaLabel': 'Started building Multiplayer',
  },
  'Live_MLG_New_level_added': {
    'gaEvent': 'New_level_added',
    'gaCat': 'Live MLG editing',
    'gaLabel': '',
  },
  'Live_MLG_New_level_removed': {
    'gaEvent': 'New_level_removed',
    'gaCat': 'Live MLG editing',
    'gaLabel': '',
  },
  'Live_MLG_Level_disabled': {
    'gaEvent': 'Level_disabled',
    'gaCat': 'Live MLG editing',
    'gaLabel': '',
  },
  'Live_MLG_Live_mlg_updated': {
    'gaEvent': 'Live_mlg_updated',
    'gaCat': 'Live MLG editing',
    'gaLabel': '',
  },
 
  'Pinned_Games_Pin_Game': {
    'gaEvent': 'Pin_Game',
    'gaCat': 'Pinned_Games',
    'gaLabel': '',
  },
  'Pinned_Games_Remove_Pin': {
    'gaEvent': 'Remove_Pin',
    'gaCat': 'Pinned_Games',
    'gaLabel': '',
  },
  'Pinned_Games_Remove_Pinned_Game': {
    'gaEvent': 'Remove_Pinned_Game',
    'gaCat': 'Pinned_Games',
    'gaLabel': '',
  },
  'Pinned_Games_View_Statistics': {
    'gaEvent': 'View_Statistics',
    'gaCat': 'Pinned_Games',
    'gaLabel': '',
  },
  'Pinned_Games_Pin_Game_Game_Builder': {
    'gaEvent': 'Pin_Game_Game_Builder',
    'gaCat': 'Pinned_Games',
    'gaLabel': '',
  },
  'Pinned_Games_Remove_Pin_Game_Builder': {
    'gaEvent': 'Remove_Pin_Game_Builder',
    'gaCat': 'Pinned_Games',
    'gaLabel': '',
  },
  'Pinned_Games_Expand_My_Top_Games': {
    'gaEvent': 'Expand_My_Top_Games',
    'gaCat': 'Pinned_Games',
    'gaLabel': '',
  },
  'Pinned_Games_Collapse_My_Top_Games': {
    'gaEvent': 'Collapse_My_Top_Games',
    'gaCat': 'Pinned_Games',
    'gaLabel': '',
  },
  'Shop_Game_Turned_ON': {
    'gaEvent': 'Shop_Game_Turned_ON',
    'gaCat': 'Companies',
    'gaLabel': 'On',
  },
  'Shop_Game_Turned_OFF': {
    'gaEvent': 'Shop_Game_Turned_OFF',
    'gaCat': 'Companies',
    'gaLabel': 'Off',
  },
  'Shop_Game_Turned_DISABLED': {
    'gaEvent': 'Shop_Game_Turned_DISABLED',
    'gaCat': 'Companies',
    'gaLabel': 'Disabled',
  },
  'Shop_Report_Shop_Report_Tab_Clicked': {
    'gaEvent': 'Shop_Report_Tab_Clicked',
    'gaCat': 'Side Navigation Panel',
    'gaLabel': 'Clicked Shop Report',
  },
  'Shop_Report_Shop_Report_Add_To_Library_Clicked': {
    'gaEvent': 'Shop_Report_Add_To_Library_Clicked',
    'gaCat': 'Shop Report',
    'gaLabel': 'Add to Library Tab Clicked',
  },
  'Shop_Report_Shop_Game_All_Time_Selected': {
    'gaEvent': 'Shop_Game_All_Time_Selected',
    'gaCat': 'Shop Report',
    'gaLabel': 'Date Range All Time Applied',
  },
  'Shop_Report_Shop_Game_This_Quarter_Selected': {
    'gaEvent': 'Shop_Game_This_Quarter_Selected',
    'gaCat': 'Shop Report',
    'gaLabel': 'Date Range This Quarter Applied',
  },
  'Shop_Report_Shop_Game_Last_Quarter_Selected': {
    'gaEvent': 'Shop_Game_Last_Quarter_Selected',
    'gaCat': 'Shop Report',
    'gaLabel': 'Date Range Last Quarter Applied',
  },
  'SLG_Cloned': {
    'gaEvent': 'SLG_Cloned',
    'gaCat': 'Game Library- Single level',
    'gaLabel': 'SLG Cloned',
  },
  //The Shop
  'Shop_Search_Game_Clicked': {
    'gaEvent': 'Shop_Search_Game_Clicked',
    'gaCat': 'Marketplace',
    'gaLabel': 'Game Searched and selected',
  },
  'Shop_Category_Tab_Clicked': {
    'gaEvent': 'Shop_Category_Tab_Clicked',
    'gaCat': 'Marketplace',
    'gaLabel': '',
  },
  //VIP_Reactivate_Tab_Clicked
  'VIP_Reactivate_Tab_Clicked': {
    'gaEvent': 'VIP_Reactivate_Tab_Clicked',
    'gaCat': 'VIP',
    'gaLabel': 'Reactivate Button Clicked',
  },
  'VIP_Expire_Tab_Clicked': {
    'gaEvent': 'VIP_Expire_Tab_Clicked',
    'gaCat': 'VIP',
    'gaLabel': 'Expire Button Clicked',
  },
  'Add_More_Clicked': {
    'gaEvent': 'Add_More_Clicked',
    'gaCat': 'Users-Players',
    'gaLabel': 'Secoundary Location And Department',
  },
  'Company_QR_Scanner_Opened': {
    'gaEvent': 'Company_QR_Scanner_Opened',
    'gaCat': 'Company',
    'gaLabel': 'QR Scanner opened of company',
  },
  'Company_QR_Scanner_Downloaded': {
    'gaEvent': 'Company_QR_Scanner_Downloaded',
    'gaCat': 'Company',
    'gaLabel': 'QR Scanner downloaded of the company',
  },
  'VIP_QR_Scanner_Opened': {
    'gaEvent': 'VIP_QR_Scanner_Opened',
    'gaCat': 'VIP',
    'gaLabel': 'QR Scanner opened by VIP code',
  },
  'VIP_QR_Scanner_Downloaded': {
    'gaEvent': 'VIP_QR_Scanner_Downloaded',
    'gaCat': 'VIP',
    'gaLabel': 'QR Scanner opened by VIP code',
  },
  'Winrate_Report_Selected': {
    'gaEvent': 'Winrate_Report_Selected',
    'gaCat': 'More_Reports',
    'gaLabel': 'Winrate Selected',
  },
  'Winrate_Location_Selected': {
    'gaEvent': 'Winrate_Location_Selected',
    'gaCat': 'More_Reports',
    'gaLabel': 'Location Selected',
  },
  'Winrate_Department_Selected': {
    'gaEvent': 'Winrate_Department_Selected',
    'gaCat': 'More_Reports',
    'gaLabel': 'Department Selected',
  },


  'Winrate_All_Pinned_Games_Selected': {
    'gaEvent': 'Winrate_All_Pinned_Games_Selected',
    'gaCat': 'More_Reports',
    'gaLabel': 'Select Pinned Games',
  },
  'Winrate_All_Games_Selected': {
    'gaEvent': 'Winrate_All_Games_Selected',
    'gaCat': 'More_Reports',
    'gaLabel': 'All Games Selected',
  },

  'Winrate_Email_Send': {
    'gaEvent': 'Winrate_Email_Send',
    'gaCat': 'More_Reports',
    'gaLabel': 'Email Send',
  },

  'Total_Game_Report_Selected': {
    'gaEvent': 'Total_Game_Report_Selected',
    'gaCat': 'More_Reports',
    'gaLabel': 'Report Selected',
  },
  'Winrate_Games_Selected': {
    'gaEvent': 'Winrate_Games_Selected',
    'gaCat': 'More_Reports',
    'gaLabel': 'Report Selected',
  },
  'Winrate_Pinned_Games_Selected': {
    'gaEvent': 'Winrate_Pinned_Games_Selected',
    'gaCat': 'More_Reports',
    'gaLabel': 'Report Selected',
  },

  'Total_Games_Location_Selected': {
    'gaEvent': 'Total_Games_Location_Selected',
    'gaCat': 'More_Reports',
    'gaLabel': 'Location Selected',
  },

   
  'Total_Games_Department_Selected': {
    'gaEvent': 'Total_Games_Department_Selected',
    'gaCat': 'More_Reports',
    'gaLabel': 'Department Selected',
  },
  
  'Total_Games_Email_Send': {
    'gaEvent': 'Total_Games_Email_Send',
    'gaCat': 'More_Reports',
    'gaLabel': 'Email Send',
  },
  
  'Individual_Games_Report_Selected': {
    'gaEvent': 'Individual_Games_Report_Selected',
    'gaCat': 'More_Reports',
    'gaLabel': 'Individual Games Played Report – by Player Selected',
  },
  'Individual_Games_All_Players_Selected': {
    'gaEvent': 'Individual_Games_All_Players_Selected',
    'gaCat': 'More_Reports',
    'gaLabel': 'All players report selected',
  },
  'Individual_Games_Active_Players_Selected': {
    'gaEvent': 'Individual_Games_Active_Players_Selected',
    'gaCat': 'More_Reports',
    'gaLabel': 'Active players report selected',
  },
  'Individual_Games_Email_Send': {
    'gaEvent': 'Individual_Games_Email_Send',
    'gaCat': 'More_Reports',
    'gaLabel': 'Email send from Individual Games Played Report – by Player',
  },
  
  
  
  //
  
  'SLG_Language_Preference_Clicked': {
    'gaEvent': 'Language_Preference_Clicked',
    'gaCat': 'Game Builder-Single level',
    'gaLabel': 'Preference Selected',
  },
  'SLG_Translation_Tab_Clicked': {
    'gaEvent': 'Translation_Tab_Clicked',
    'gaCat': 'Game Builder-Single level',
    'gaLabel': 'Translation tab clicked',
  },
  'AI_Assist_Tab_Clicked': {
    'gaEvent': 'AI_Assist_Tab_Clicked',
    'gaCat': 'Game Builder-Single level',
    'gaLabel': 'AI Assist button Selected',
  },
  
  'AI_Generate_Button_Clicked': {
    'gaEvent': 'AI_Generate_Button_Clicked',
    'gaCat': 'Game Builder-Single level',
    'gaLabel': 'AI Generate Button Clicked',
  },
  'AI_Add_To_Game_Clicked': {
    'gaEvent': 'AI_Add_To_Game_Clicked',
    'gaCat': 'Game Builder-Single level',
    'gaLabel': 'Question Added to game',
  },
  'AI_Upload_PDF':{
    'gaEvent': 'AI_Upload_PDF',
    'gaCat': 'Game Builder-Single level',
    'gaLabel': 'PDF Uploaded',
  },
  'AI_Category_Changed':{
    'gaEvent': 'AI_Category_Changed',
    'gaCat': 'Game Builder-Single level',
    'gaLabel': 'Select Catgeory',
  },
  // Random///3-Answer Option/
  'Answer_Option_Tab_Clicked_Random': {
    'gaEvent': 'Answer_Option_Tab_Clicked',
    'gaCat': 'Game Builder-Single level',
    'gaLabel': 'Random',
  },
  'Answer_Option_Tab_Clicked_Short': {
    'gaEvent': 'Answer_Option_Tab_Clicked',
    'gaCat': 'Game Builder-Single level',
    'gaLabel': 'Short Answer',
  },
  'Answer_Option_Tab_Clicked_2': {
    'gaEvent': 'Answer_Option_Tab_Clicked',
    'gaCat': 'Game Builder-Single level',
    'gaLabel': '2-Answer Option',
  },
  'Answer_Option_Tab_Clicked_3': {
    'gaEvent': 'Answer_Option_Tab_Clicked',
    'gaCat': 'Game Builder-Single level',
    'gaLabel': '3-Answer Option',
  },
  'Answer_Option_Tab_Clicked_4': {
    'gaEvent': 'Answer_Option_Tab_Clicked',
    'gaCat': 'Game Builder-Single level',
    'gaLabel': '4-Answer Option',
  },
  'Scheduled_Alerts_Tab_Clicked': {
    'gaEvent': 'Scheduled_Alerts_Tab_Clicked',
    'gaCat': 'Notifications',
    'gaLabel': 'Alerts Clicked',
  },
  'Add/Edit_Tab_Clicked': {
    'gaEvent': 'Add/Edit_Tab_Clicked',
    'gaCat': 'Notifications',
    'gaLabel': 'Add/Edit Clicked',
  },  
  'Edit_Clicked': {
    'gaEvent': 'Edit_Clicked',
    'gaCat': 'Notifications',
    'gaLabel': 'Edit Clicked',
  },
  'Disable_Clicked': {
    'gaEvent': 'Disable_Clicked',
    'gaCat': 'Notifications',
    'gaLabel': 'Disable Clicked',
  },
  'Game_Alert_Radio_Button_Selected': {
    'gaEvent': 'Game_Alert_Radio_Button_Selected',
    'gaCat': 'Notifications',
    'gaLabel': 'Game Radio button selected',
  },
  'General_Alert_Radio_Button_Selected': {
    'gaEvent': 'General_Alert_Radio_Button_Selected',
    'gaCat': 'Notifications',
    'gaLabel': 'General Radio button selected',
  },
  'Game_Banner_selected': {
    'gaEvent': 'Game_Banner_selected',
    'gaCat': 'Notifications',
    'gaLabel': 'Image Selected',
  },
  'Start_Date_Selected': {
    'gaEvent': 'Start_Date_Selected',
    'gaCat': 'Notifications',
    'gaLabel': 'Start Date selected',
  },
  'End_Date_Selected': {
    'gaEvent': 'End_Date_Selected',
    'gaCat': 'Notifications',
    'gaLabel': 'End Date selected',
  },
  'Push_Notification_Changed': {
    'gaEvent': 'Push_Notification_Changed',
    'gaCat': 'Notifications',
    'gaLabel': 'ON/OFF',
  },
  'Game_Alert_Update_Tab_Clicked': {
    'gaEvent': 'Game_Alert_Update_Tab_Clicked',
    'gaCat': 'Notifications',
    'gaLabel': 'Update tab clicked',
  },
  'Game_Alert_Cancel_Tab_Clicked': {
    'gaEvent': 'Game_Alert_Cancel_Tab_Clicked',
    'gaCat': 'Notifications',
    'gaLabel': 'Cancel Tab Clicked',
  },
  'Global_Pinned_Games_Edit_Clicked': {
    'gaEvent': 'Global_Pinned_Games_Edit_Clicked',
    'gaCat': 'Dashboard',
    'gaLabel': 'Edit Global Pinned Games',
  },
  'Delete_Global_Pinned_Games': {
    'gaEvent': 'Delete_Global_Pinned_Games',
    'gaCat': 'Dashboard',
    'gaLabel': 'Delete Global Pinned Games',
  },
  'Pin_Global_Games': {
    'gaEvent': 'Pin_Global_Games',
    'gaCat': 'Dashboard',
    'gaLabel': 'Pin Global Games',
  },
  'Global_Pinned_Games_Save_Clicked': {
    'gaEvent': 'Global_Pinned_Games_Save_Clicked',
    'gaCat': 'Dashboard',
    'gaLabel': 'Save Clicked',
  },
  'View_Detailed_Leaderboard_Report': {
    'gaEvent': 'Global_Pinned_Games_Save_Clicked',
    'gaCat': 'Dashboard',
    'gaLabel': 'Leaderboard Clicked',
  },
  'Winrate_info_popup': {
    'gaEvent': 'Winrate_info_popup',
    'gaCat': 'Dashboard',
    'gaLabel': 'Information popup',
  }, 
  'feedback_expanded': {
    'gaEvent': 'feedback_expanded',
    'gaCat': 'Dashboard',
    'gaLabel': 'Feedback clicked',
  },
  //company
  'Change_Clock_Policy_true': {
    'gaEvent': 'Enable_Clock_Policy',
    'gaCat': 'IP_Configration',
    'gaLabel': 'Check',
  },
  'Change_Clock_Policy_false': {
    'gaEvent': 'Enable_Clock_Policy',
    'gaCat': 'IP_Configration',
    'gaLabel': 'Uncheck',
  },
  'Change_AI_Assist_true': {
    'gaEvent': 'Change_AI_Assist',
    'gaCat': 'IP_Configration',
    'gaLabel': 'Check',
  },
  'Change_AI_Assist_false': {
    'gaEvent': 'Change_AI_Assist',
    'gaCat': 'IP_Configration',
    'gaLabel': 'Uncheck',
  },
  'Change_IP_Configration_true': {
    'gaEvent': 'Change_IP_Configration',
    'gaCat': 'IP_Configration',
    'gaLabel': 'Check',
  },
  'Change_IP_Configration_flase': {
    'gaEvent': 'Change_IP_Configration',
    'gaCat': 'IP_Configration',
    'gaLabel': 'Uncheck',
  },
  'Add_IP_Configration': {
    'gaEvent': 'Add_IP_Configration',
    'gaCat': 'IP_Configration',
    'gaLabel': 'Add IP',
  },
  'Save_IP_Configration': {
    'gaEvent': 'Save_IP_Configration',
    'gaCat': 'IP_Configration',
    'gaLabel': 'Save Configration',
  },
  'Delete_IP_Configration': {
    'gaEvent': 'Delete_IP_Configration',
    'gaCat': 'IP_Configration',
    'gaLabel': 'Delete Configration',
  },
  'IP_Loc_Dept_Save': {
    'gaEvent': 'IP_Loc_Dept_Save',
    'gaCat': 'IP_Configration',
    'gaLabel': 'Location department saved',
  },
  'Layout_Tab_Clicked': {
    'gaEvent': 'Layout_Tab_Clicked',
    'gaCat': 'Layout',
    'gaLabel': 'Layout clicked',
  },
  'Created_A_Game_Series': {
    'gaEvent': 'Created_A_Game_Series',
    'gaCat': 'Layout',
    'gaLabel': 'Game series created',
  },
  'Add_Game': {
    'gaEvent': 'Add_Game',
    'gaCat': 'Layout',
    'gaLabel': 'Add Game',
  },
  'Remove_Game': {
    'gaEvent': 'Remove_Game',
    'gaCat': 'Layout',
    'gaLabel': 'Remove Game',
  },
  
  'Rename_Game_Series_Clicked': {
    'gaEvent': 'Rename_Game_Series_Clicked',
    'gaCat': 'Layout',
    'gaLabel': 'Rename Game series',
  },
  'Delete_Game_Series': {
    'gaEvent': 'Delete_Game_Series',
    'gaCat': 'Layout',
    'gaLabel': 'Game Series Clicked',
  },
  'Manage_Game_Series': {
    'gaEvent': 'Manage_Game_Series',
    'gaCat': 'Layout',
    'gaLabel': 'Manage Game Series',
  },

  'Layout_By_location_ids': {
    'gaEvent': 'Location_Selected',
    'gaCat': 'Layout',
    'gaLabel': 'Location selected',
  },
  'Layout_By_department_ids': {
    'gaEvent': 'Filter_By_Department',
    'gaCat': 'Layout',
    'gaLabel': 'Department Selected',
  },
  'MLG_Preview_Locked': {
    'gaEvent': 'MLG_Preview_Locked',
    'gaCat': 'MLG',
    'gaLabel': 'Locked',
  },
  'MLG_Preview_Unlocked': {
    'gaEvent': 'MLG_Preview_Unlocked',
    'gaCat': 'MLG',
    'gaLabel': 'Unlocked',
  },
  'Pathway_Icon_Clicked': {
    'gaEvent': 'Pathway_Icon_Clicked',
    'gaCat': 'Pathway',
    'gaLabel': 'Pathway Icon',
  },
  'Add_A_Pathway': {
    'gaEvent': 'Add_A_Pathway',
    'gaCat': 'Pathway',
    'gaLabel': 'Pathway Added',
  },
  'Pathway_Saved': {
    'gaEvent': 'Pathway_Saved',
    'gaCat': 'Pathway',
    'gaLabel': 'Pathway Saved',
  },
  'Pathway_Deleted': {
    'gaEvent': 'Pathway_Deleted',
    'gaCat': 'Pathways',
    'gaLabel': 'Pathway Deleted',
  },
  'Pathway_Selected': {
    'gaEvent': 'Pathway_Selected',
    'gaCat': 'Game Builder',
    'gaLabel': 'Pathway Selected',
  },
  'By_Team_Achievement_Report': {
    'gaEvent': 'By_Team_Achievement_Report',
    'gaCat': 'Detailed Report',
    'gaLabel': 'Achievement Viewed by team',
  },
  'By_Team_Shop_Games_Report': {
    'gaEvent': 'By_Team_Shop_Games_Report',
    'gaCat': 'Detailed Report',
    'gaLabel': 'Shop report viwed by team',
  },
  'By_Team_Multiplayer_Games_Report': {
    'gaEvent': 'By_Team_Multiplayer_Games_Report',
    'gaCat': 'Detailed Report',
    'gaLabel': 'Multiplayer report viewed',
  },
  'By_Team_Single_Games_Report': {
    'gaEvent': 'By_Team_Single_Games_Report',
    'gaCat': 'Detailed Report',
    'gaLabel': 'Single games viewed by report',
  },
  'By_Team_Total_Game_Report': {
    'gaEvent': 'By_Team_Total_Game_Report',
    'gaCat': 'Detailed Report',
    'gaLabel': 'Total games report viewed by team',
  },
  'By_Team_Multilevel_Game_Report': {
    'gaEvent': 'By_Team_Multilevel_Game_Report',
    'gaCat': 'Detailed Report',
    'gaLabel': 'Multilevel report viewed by team',
  },
  'By_Team_Contest_Game_Report': {
    'gaEvent': 'By_Team_Contest_Game_Report',
    'gaCat': 'Detailed Report',
    'gaLabel': 'Contest report viewed by team',
  },  
  'AI_PDF_Morethan_2MB': {
    'gaEvent': 'AI_PDF_Morethan_2MB',
    'gaCat': 'AI Assist',
    'gaLabel': 'PDF is uploaded more than 2mb',
  },  
  'AI_Add_More_Questions': {
    'gaEvent': 'AI_Add_More_Questions',
    'gaCat': 'AI Assist',
    'gaLabel': 'Add more question to each category',
  },
  'AI_PDF_Processing_close': {
    'gaEvent': 'AI_PDF_Processing_close',
    'gaCat': 'AI Assist',
    'gaLabel': 'clicked on close button when PDF is processing',
  },
  'AI_PDF_Pages_Count': {
    'gaEvent': 'AI_PDF_Pages_Count',
    'gaCat': 'AI Assist',
    'gaLabel': 'Pages count for PDF to be uploaded',
  },
  
  'AI_select_question_counttobe_generated': {
    'gaEvent': 'AI_select_question_counttobe_generated',
    'gaCat': 'AI Assist',
    'gaLabel': 'Question count to be generated',
  },
  'Locked_Category_Clicked': {
    'gaEvent': 'Locked_Category_Clicked',
    'gaCat': 'AI Assist',
    'gaLabel': 'Locked Category',
  },
  'Request_Info': {
    'gaEvent': 'Request_Info',
    'gaCat': 'AI Assist',
    'gaLabel': 'Information Requested',
  },
  'Player_Winrate_Report_Selected': {
    'gaEvent': 'Player_Winrate_Report_Selected',
    'gaCat': 'More_Reports',
    'gaLabel': 'Player Winrate Selected',
  },
  'Player_Winrate_Pinned_Games_Selected': {
    'gaEvent': 'Player_Winrate_Pinned_Games_Selected',
    'gaCat': 'More_Reports',
    'gaLabel': 'Report Selected',
  },
  'Player_Winrate_Games_Selected': {
    'gaEvent': 'Player_Winrate_Games_Selected',
    'gaCat': 'More_Reports',
    'gaLabel': 'Report Selected',
  },
  'Player_Winrate_Email_Send': {
    'gaEvent': 'Player_Winrate_Email_Send',
    'gaCat': 'More_Reports',
    'gaLabel': 'Email Send',
  },
  'Player_Winrate_Location_Selected': {
    'gaEvent': 'Player_Winrate_Location_Selected',
    'gaCat': 'More_Reports',
    'gaLabel': 'Location Selected',
  },
  'Player_Winrate_Department_Selected': {
    'gaEvent': 'Player_Winrate_Department_Selected',
    'gaCat': 'More_Reports',
    'gaLabel': 'Department Selected',
  },
  'Player_Winrate_All_Pinned_Games_Selected': {
    'gaEvent': 'Player_Winrate_All_Pinned_Games_Selected',
    'gaCat': 'More_Reports',
    'gaLabel': 'Select Pinned Games',
  },
  'Player_Winrate_All_Games_Selected': {
    'gaEvent': 'Player_Winrate_All_Games_Selected',
    'gaCat': 'More_Reports',
    'gaLabel': 'All Games Selected',
  },
  'AI_Assist_Insufficient_Content': {
    'gaEvent': 'AI_Assist_Insufficient_Content',
    'gaCat': 'AI Assist',
    'gaLabel': 'Insufficient content',
  },
  'AI_Assist_topic_mismatch': {
    'gaEvent': 'AI_Assist_topic_mismatch',
    'gaCat': 'AI Assist',
    'gaLabel': 'Topic Mismatch',
  },
};

@Injectable({
  providedIn: 'root'
})


export class GoogleAnalyticsService {

  constructor() { }
}
