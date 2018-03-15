import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import * as _ from 'lodash';

import { CoinbaseProvider } from '../../../../providers/coinbase/coinbase';
import { Logger } from '../../../../providers/logger/logger';
import { OnGoingProcessProvider } from '../../../../providers/on-going-process/on-going-process';
import { PopupProvider } from '../../../../providers/popup/popup';

@Component({
  selector: 'page-coinbase-settings',
  templateUrl: 'coinbase-settings.html',
})
export class CoinbaseSettingsPage {

  public coinbaseAccount: any;
  public coinbaseUser: any;

  constructor(
    private navCtrl: NavController,
    private onGoingProcessProvider: OnGoingProcessProvider,
    private popupProvider: PopupProvider,
    private logger: Logger,
    private coinbaseProvider: CoinbaseProvider
  ) {
  }

  ionViewDidLoad() {
    this.onGoingProcessProvider.set('connectingCoinbase');
    this.coinbaseProvider.init((err, data) => {
      if (err || _.isEmpty(data)) {
        this.onGoingProcessProvider.clear();
        if (err) {
          this.logger.error(err);
          let errorId = err.errors ? err.errors[0].id : null;
          err = err.errors ? err.errors[0].message : err;
          this.popupProvider.ionicAlert('Error connecting to Coinbase', err).then(() => {
            if (errorId == 'revoked_token') {
              this.coinbaseProvider.logout();
              this.navCtrl.popToRoot({ animate: false });
            }
          });
        }
        return;
      }
      let accessToken = data.accessToken;
      let accountId = data.accountId;
      this.coinbaseProvider.getAccount(accessToken, accountId, (err, account) => {
        this.onGoingProcessProvider.clear();
        this.coinbaseAccount = account.data[0];
      });
      this.coinbaseProvider.getCurrentUser(accessToken, (err, user) => {
        this.coinbaseUser = user.data;
      });
    });
  }

  public revokeToken() {
    this.popupProvider.ionicConfirm(
      'Coinbase',
      'Are you sure you would like to log out of your Coinbase account?'
    ).then((res) => {
      if (res) {
        this.coinbaseProvider.logout();
        this.navCtrl.popToRoot({ animate: false }).then(() => {
          this.navCtrl.parent.select(0);
        });
      }
    });
  };

}
