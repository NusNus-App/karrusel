import { ChangeDetectionStrategy, Component, ViewChild, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { EntityDistanceSearchResult, EntityFreeTextSearchResult } from '@app/interfaces/entity-search-result';
import { MapService } from '@app/services/map.service';
import { SearchService } from '@app/services/search.service';
import { getBucketAndPath } from '@app/shared/functions/storage';
import { IonSearchbar } from '@ionic/angular';
import { SegmentCustomEvent } from '@ionic/core';
import { Point } from 'geojson';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators';
import { SupabaseService } from '../../services/supabase.service';
import { RouteName } from '@app/shared/models/routeName';
import { EntityBadgeColor } from './entity-badge-color';
import { RouteHistoryService } from '@app/services/routeHistory.service';

enum Entity {
  artist = 'artist',
  stage = 'stage',
  asset = 'asset',
  event = 'event'
}

enum SearchMode {
  FreeText = 'FREE_TEXT',
  NearBy = 'NEAR_BY'
}

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchPage {

  private router = inject(Router);
  private supabase = inject(SupabaseService);
  private searchService = inject(SearchService);
  private mapService = inject(MapService);
  private routeHistoryService = inject(RouteHistoryService);

  routeName = RouteName;
  entity = Entity;
  searchMode = SearchMode;
  badgeColor = EntityBadgeColor;

  searchTerm = new FormControl('');
  @ViewChild(IonSearchbar) searchElement: IonSearchbar;

  private _selectedSearchMode$ = new BehaviorSubject<SearchMode>(SearchMode.FreeText);
  selectedSearchMode$: Observable<SearchMode> = this._selectedSearchMode$.asObservable();

  previousRoute$ = this.routeHistoryService.history$.pipe(
    map(history => history.previous ? history.previous : '/')
  );

  searchResults$: Observable<EntityFreeTextSearchResult[]> = this.searchTerm.valueChanges.pipe(
    debounceTime(200),
    distinctUntilChanged(),
    switchMap(term => this.searchService.textSearch(term))
  );

  nearBy$: Observable<EntityDistanceSearchResult[]> = combineLatest([
    this.searchService.nearBy$,
    this._selectedSearchMode$
  ]).pipe(
    filter(([, mode]) => mode === SearchMode.NearBy),
    map(([nearBy,]) => nearBy)
  );

  ionViewDidEnter(): void {
    if (this._selectedSearchMode$.value === SearchMode.FreeText) {
      setTimeout(() => {
        this.searchElement.setFocus();
      }, 150);
    }
  }

  imgUrl(storagePath: string): string {
    const [bucket, path] = getBucketAndPath(storagePath)
    return bucket && path ? this.supabase.publicImageUrl(bucket, path) : 'assets/karrusel_logo.png';
  }

  onSearchModeChange(ev: Event): void {
    this._selectedSearchMode$.next(
      (ev as SegmentCustomEvent).detail.value as SearchMode
    )
  }

  onShowOnMap(geom: Point) {
    this.router.navigate(['tabs', RouteName.Map]);
    this.mapService.flyTo(geom.coordinates as [number, number]);
  }
}
