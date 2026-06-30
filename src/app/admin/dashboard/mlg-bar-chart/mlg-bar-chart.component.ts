import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import Chart from 'chart.js';
@Component({
  selector: 'app-mlg-bar-chart',
  templateUrl: './mlg-bar-chart.component.html',
  styleUrls: ['./mlg-bar-chart.component.scss']
})
export class MlgBarChartComponent implements OnInit {
  @ViewChild('barChartCanvas') barChartCanvas: ElementRef;
  @Input() chartData: any;
  yaxisValues = [0];
  constructor() { }

  ngOnInit(): void {
    console.log(this.chartData)
  }

  ngAfterViewInit() {
    // wait for the view to init before using the element
    console.log(this.chartData);
    const v = this.chartData.ceil_max_gameplay/5;    
    for(let i=0;i<5;i++){      
        this.yaxisValues[i + 1] = this.yaxisValues[i] + v;      
    }
    console.log(this.yaxisValues)    
    const that = this;
    if (this.barChartCanvas) {
      let context: CanvasRenderingContext2D =
        this.barChartCanvas.nativeElement.getContext("2d");
      const myChart = new Chart(context, {
        type: "bar",
        data: {
          labels: this.chartData.labels,
          datasets: [
            {
              label: "# Games played",
              data: this.chartData.game_play_counts,
              backgroundColor: "#3F55CA",
              borderColor: "#3F55CA",
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: true,
                  fontFamily: "Roboto_Bold",
                  fontSize: 14,
                  fontColor: "#000",
                },
                afterBuildTicks: function(scale) {                                    
                  return scale.ticks = that.yaxisValues;
                },
              },
            ],
            xAxes: [
              {
                gridLines: {
                  display: false,
                },
                ticks: {
                  fontFamily: "Roboto_Bold",
                  fontSize: 14,
                  fontColor: "#000",
                },
              },
            ],
          },
          legend: {
            display: false,
          },
          animation: {
            duration: 0, // general animation time
          },
          hover: {
            animationDuration: 0, // duration of animations when hovering an item
          },
          responsive: false,
          responsiveAnimationDuration: 0, // animation duration after a resize
        },
      });
    }
  }

  showChart() {
    if (this.chartData) {
      if (this.chartData.game_play_counts.some(val => val > 0) && this.chartData.step_size > 0) {
        return true;
      }
      if (this.chartData.game_play_counts.every(val => val == 0) && this.chartData.step_size == 0) {
        return false;
      }
    }
  }
}
