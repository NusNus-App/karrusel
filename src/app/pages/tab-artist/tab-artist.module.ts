import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TabArtistPageRoutingModule } from './tab-artist-routing.module';

import { TabArtistPage } from './tab-artist.page';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    TabArtistPageRoutingModule
  ],
  declarations: [TabArtistPage]
})
export class TabArtistPageModule { }