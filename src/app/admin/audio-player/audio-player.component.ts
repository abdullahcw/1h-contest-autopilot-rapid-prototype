import { Component, OnInit, Input, OnDestroy, Output, EventEmitter, HostListener } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { GetImageURLService } from 'src/app/services/get-image-URL/get-image-url.service';

@Component({
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.scss']
})
export class AudioPlayerComponent implements OnInit, OnDestroy {

  @Input() url: string;
  @Output() OnEdit = new EventEmitter();
  @Output() OnDelete = new EventEmitter();
  @Input() shouldAllowEditing = false;
  currentTime = '00:00';
  audio = new Audio();
  audioURL;
  @HostListener('window:blur') onBlur() {
    this.audioPause(true);

  }
  constructor(
    public getImageURLService: GetImageURLService,
    public dialogRef: MatDialogRef<any>,
     ) { }

  ngOnInit() {
    console.log('this.url',this.url);
   if(!this.url.includes('data:audio/mpeg;base64')){
     this.imageUrlUpdated(this.url);
   }else{
    this.audioURL=this.url;
   }
  }

  play() {
    if (!this.audio.src) {
      this.audio.src = this.audioURL;
      this.audio.load();
      this.audio.play();
    } else if (this.audio.paused) {
      this.audio.play();
    } else {
      this.audio.pause();
    }

    this.audio.ontimeupdate = () => {
      const totalSecs = this.audio.currentTime;
      let hours: any = Math.floor(totalSecs / 3600);
      let minutes: any = Math.floor((totalSecs - (hours * 3600)) / 60);
      let seconds: any = Math.floor(totalSecs - (hours * 3600) - (minutes * 60));
      const shouldConsiderHours = hours >= 1;
      if (hours < 10) { hours = '0' + hours; }
      if (minutes < 10) { minutes = '0' + minutes; }
      if (seconds < 10) { seconds = '0' + seconds; }
      this.currentTime = shouldConsiderHours ? (hours + ':' + minutes + ':' + seconds) : (minutes + ':' + seconds);
    };
  }

  edit() {
    this.OnEdit.emit();
  }

  blur() {
    this.audioPause();
  }
  delete() {
    this.OnDelete.emit();
  }
  audioPause(isBlur = null) {
    if (this.audio) {
      if (isBlur) {
        this.audio.pause();
        return;
      }
      this.audio.pause();
      this.audio.currentTime = 0;
    }
  }
  ngOnDestroy() {
    this.audioPause();
  }
  imageUrlUpdated(imageUrl){  
    const that = this;
      const relativePath = this.getImageURLService.trimmedURLValue(imageUrl)
      this.getImageURLService.getURL(relativePath, function (err, data) {
        that.audioURL = data;
      });  
  }
}
