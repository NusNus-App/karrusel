import { Injectable } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators';
import { ArtistWithRelations } from '@app/interfaces/artist';
import { StoreService } from '@app/store/store.service';
import { FavoritesService } from '@app/services/favorites.service';
import { pathToImageUrl } from '@app/shared/utils';

@Injectable({
  providedIn: 'root'
})
export class ArtistStateService {

  artistsWithFavorites$: Observable<ArtistWithRelations[]> = combineLatest([
    this.store.artists$,
    this.favoritesService.favorites$
  ]).pipe(
    map(([artists, favorites]) => artists.map(artist => ({
      ...artist,
      imgUrl: this.imgUrl(artist.storage_path),
      // Favorites only exists if user added artists to favorites
      isFavorite: favorites?.artists.includes(artist.id)
    }))),
    distinctUntilChanged(),
    shareReplay()
  )

  constructor(
    private store: StoreService,
    private favoritesService: FavoritesService,
  ) { }

  public toggleArtistFavorite(id: string): void {
    this.favoritesService.toggleFavorite('artists', id);
  }

  private imgUrl(path: string): string {
    // TODO don't use hard coded fall back logo 
    return path ? pathToImageUrl(path) : 'assets/distortion_logo.png';
  }
}
