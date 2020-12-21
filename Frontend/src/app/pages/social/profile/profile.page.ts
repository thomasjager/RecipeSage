import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastController, AlertController, NavController } from '@ionic/angular';

import { UserService } from '@/services/user.service';
import { LoadingService } from '@/services/loading.service';
import { UtilService, RouteMap, AuthType } from '@/services/util.service';
import { RecipeService } from '@/services/recipe.service';

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss']
})
export class ProfilePage {
  defaultBackHref: string = RouteMap.SocialPage.getPath();

  handle: string;
  profile;

  constructor(
    public navCtrl: NavController,
    public route: ActivatedRoute,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public utilService: UtilService,
    public loadingService: LoadingService,
    public recipeService: RecipeService,
    public userService: UserService) {

    this.handle = this.route.snapshot.paramMap.get('handle').substring(1);
    this.load();
  }

  async profileDisabledError() {
    const alert = await this.alertCtrl.create({
      header: 'Profile is not enabled',
      message: 'This user has disabled their profile and is therefore private/inaccessible.',
      buttons: [
        {
          text: 'Okay',
          handler: () => {
            this.navCtrl.navigateRoot(RouteMap.PeoplePage.getPath());
          }
        }
      ]
    });
    alert.present();
  }

  async load() {
    const loading = this.loadingService.start();
    this.profile = await this.userService.getProfileByHandle(this.handle, {
      403: () => this.profileDisabledError()
    });

    loading.dismiss();
  }

  open(item) {
    if(item.type === "all-recipes") {
      this.navCtrl.navigateForward(RouteMap.HomePage.getPath('main', { userId: item.userId }));
    } else if(item.type === "label") {
      this.navCtrl.navigateForward(RouteMap.HomePage.getPath('main', { userId: item.userId, selectedLabels: [item.label.title] }));
    } else if (item.type === "recipe") {
      this.navCtrl.navigateForward(RouteMap.RecipePage.getPath(item.recipe.id));
    }
  }

  async addFriend() {
    const loading = this.loadingService.start();

    await this.userService.addFriend(this.profile.id);
    loading.dismiss();

    const tst = await this.toastCtrl.create({
      message: 'Friend invite sent!',
      duration: 5000,
      buttons: [{
        side: 'end',
        role: 'cancel',
        text: 'Dismiss',
      }]
    });
    tst.present();

    this.load();
  }

  async deleteFriend() {
    const loading = this.loadingService.start();

    await this.userService.deleteFriend(this.profile.id);
    loading.dismiss();

    const tst = await this.toastCtrl.create({
      message: 'Friendship removed',
      duration: 5000,
      buttons: [{
        side: 'end',
        role: 'cancel',
        text: 'Dismiss',
      }]
    });
    tst.present();

    this.load();
  }

  // async removeFriend() {
  //   const loading = this.loadingService.start();

  //   this.userService.removeFriend(this.profile.id).then(async response => {
  //     loading.dismiss();

  //     const tst = await this.toastCtrl.create({
  //       message: 'Friend invite sent!',
  //       duration: 5000
  //     });
  //     tst.present();
  //   }).catch(async err => {
  //     loading.dismiss();
  //     switch (err.response.status) {
  //       case 0:
  //         (await this.toastCtrl.create({
  //           message: this.utilService.standardMessages.offlinePushMessage,
  //           duration: 5000
  //         })).present();
  //         break;
  //       case 401:
  //         this.navCtrl.navigateRoot(RouteMap.AuthPage.getPath(AuthType.Login));
  //         break;
  //       case 404:
  //         (await this.toastCtrl.create({
  //           message: 'We\'re having trouble finding that user.',
  //           duration: 5000
  //         })).present();
  //         break;
  //       default:
  //         const errorToast = await this.toastCtrl.create({
  //           message: this.utilService.standardMessages.unexpectedError,
  //           duration: 30000
  //         });
  //         errorToast.present();
  //         break;
  //     }
  //   });
  // }
}