import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { AlertController, LoadingController} from 'ionic-angular';
import { Hotspot, HotspotNetwork } from '@ionic-native/hotspot';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  R ;G ;B;
  prevR ;prevG ;prevB;
  //wifistat;
  status;
  apiUrl = 'http://192.168.4.1';
  connected=false;
  Mode;

  constructor(public navCtrl: NavController,public http: HttpClient,private alertCtrl: AlertController,private hotspot: Hotspot,public loadingCtrl: LoadingController) {
    this.R = 255;
    this.G = 255;
    this.B = 255;

    this.prevR = 0;
    this.prevG = 0;
    this.prevB = 0;

    this.status ="assets/imgs/OffToggle.png";
    this.Mode = true;

    /*
    this.wifistat = {
        "color": this.connected ? 'green' : 'red', 
    }
*/
    console.log("Hello Worlds");
    this.connectESP();
  }

  setStyles() {
    let styles = {
        // CSS property names
        "color": this.connected ? 'green' : 'red', 
    };
    return styles;
  }

  ChangeMode(){
    this.Mode = !this.Mode;
  }

  Switch(){
   // alert("click");
    if(this.status == "assets/imgs/OnToggle.png"){
      //off
      this.status = "assets/imgs/OffToggle.png"

      this.SendSwitch( '/LEDOn');
      this.SendRGB();
    }else{
      //on
      this.status = "assets/imgs/OnToggle.png";

      this.SendSwitch( '/LEDOff');
      
    }
  }

  SendMode(status) {
    
    return new Promise(resolve => {
     
      this.http.get(this.apiUrl+"/special?mode="+status).subscribe(data => {
        let alert = this.alertCtrl.create({
          title: 'Mode Aktif',
          subTitle: status,
          buttons: ['Dismiss']
        });
        
        
        alert.present();

        resolve(data);
      }, err => {
        console.log(err);
      });

    });
    
     
  }

  SendSwitch(status) {
    return new Promise(resolve => {
     
      this.http.get(this.apiUrl+status).subscribe(data => {
        resolve(data);
      }, err => {
        console.log(err);
      });

    });
  }

  SendRGB() {
    //alert("change");

    if(this.status == "assets/imgs/OnToggle.png" && ( Math.abs(this.R-this.prevR)>5 || Math.abs(this.G-this.prevG)>5 || Math.abs(this.B-this.prevB)>5 ) ){
      this.prevR = this.R;
      this.prevG = this.G;
      this.prevB = this.B;

        return new Promise(resolve => {
        //"/color?R="+this.R+"&G="+this.G+"&B="+this.B
          this.http.get(this.apiUrl+"/color?R="+this.R+"&G="+this.G+"&B="+this.B).subscribe(data => {
            resolve(data);
          }, err => {
            console.log(err);
          });

        });
        
    }else{
      return "lamp off";
    }

  }

  presentAlert() {
    /*
    this.hotspot.scanWifi().then((networks: Array<HotspotNetwork>) => {
      console.log(networks);
      let alert = this.alertCtrl.create({
        title: 'Low networks',
        subTitle: JSON.stringify(networks),
        buttons: ['Dismiss']
      });

      alert.present();

  });
*/
    this.connectESP();    
  }

  connectESP(){

        this.hotspot.scanWifi().then((networks: Array<HotspotNetwork>) => {
          console.log(networks);
      });

    var ssid = "FLI-Lamp";
    var password = "password"; 

    let loading = this.loadingCtrl.create({
      content: 'Menghubungkan...'
    });
  
    loading.present();

          this.hotspot.connectToWifi(ssid, password).then( () => {
            //connection to the WiFi network was successfull
            let alert = this.alertCtrl.create({
              title: 'Koneksi sukses',
              subTitle: "Kendalikan lampu sekarang",
              buttons: ['Dismiss']
            });
      
            loading.dismiss();
            alert.present();

            this.connected = true;

      }).catch( () => {
          //connection to the WiFi network failed
          let alert = this.alertCtrl.create({
            title: 'Koneksi gagal',
            subTitle: "Apakah lampu aktif ?",
            buttons: ['Dismiss']
          });
          
          loading.dismiss();
          alert.present();

          this.connected = false;

      });
  }

}
