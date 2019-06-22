import { Component } from '@angular/core';
import { NavController, ModalController, ToastController } from '@ionic/angular';
import { MealPlanService } from '@/services/meal-plan.service';
import { WebsocketService } from '@/services/websocket.service';
import { LoadingService } from '@/services/loading.service';
import { UtilService } from '@/services/util.service';

@Component({
  selector: 'page-meal-plans',
  templateUrl: 'meal-plans.page.html',
  styleUrls: ['meal-plans.page.scss']
})
export class MealPlansPage {

  mealPlans: any = [];

  initialLoadComplete: boolean = false;

  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public toastCtrl: ToastController,
    public mealPlanService: MealPlanService,
    public websocketService: WebsocketService,
    public loadingService: LoadingService,
    public utilService: UtilService) {

    this.websocketService.register('mealPlan:received', () => {
      this.loadPlans();
    }, this);

    this.websocketService.register('mealPlan:removed', () => {
      this.loadPlans();
    }, this);
  }

  ionViewDidLoad() { }

  ionViewWillEnter() {
    var loading = this.loadingService.start();

    this.initialLoadComplete = false;

    this.loadPlans().then(() => {
      loading.dismiss();
      this.initialLoadComplete = true;
    }, () => {
      loading.dismiss();
      this.initialLoadComplete = true;
    });
  }

  refresh(refresher) {
    this.loadPlans().then(() => {
      refresher.target.complete();
    }, () => {
      refresher.target.complete();
    });
  }

  loadPlans() {
    return new Promise((resolve, reject) => {
      this.mealPlanService.fetch().then(response => {
        this.mealPlans = response;

        resolve();
      }).catch(async err => {
        reject();

        switch (err.status) {
          case 0:
            let offlineToast = await this.toastCtrl.create({
              message: this.utilService.standardMessages.offlineFetchMessage,
              duration: 5000
            });
            offlineToast.present();
            break;
          case 401:
            // this.navCtrl.setRoot('LoginPage', {}, { animate: true, direction: 'forward' });
            break;
          default:
            let errorToast = await this.toastCtrl.create({
              message: this.utilService.standardMessages.unexpectedError,
              duration: 30000
            });
            errorToast.present();
            break;
        }
      });
    });
  }

  async newMealPlan() {
    let modal = await this.modalCtrl.create({
      component: 'NewMealPlanModalPage'
    });
    modal.present();
    modal.onDidDismiss().then(({ data }) => {
      if (!data || !data.destination) return;

      if (data.setRoot) {
        // this.navCtrl.setRoot(data.destination, data.routingData || {}, { animate: true, direction: 'forward' });
      } else {
        // this.navCtrl.push(data.destination, data.routingData);
      }
    });
  }
  openMealPlan(mealPlanId) {
    // // this.navCtrl.setRoot(RecipePage, {}, {animate: true, direction: 'forward'});
    // this.navCtrl.push('MealPlanPage', {
    //   mealPlanId: mealPlanId
    // });
  }

  formatItemCreationDate(plainTextDate) {
    return this.utilService.formatDate(plainTextDate, { now: true });
  }
}