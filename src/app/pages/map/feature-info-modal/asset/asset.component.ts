import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MapClickedFeature } from '@app/interfaces/map-clicked-feature';
import { MapLayer } from '@app/interfaces/map-layer';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { MapStateService } from '../../state/map-state.service';

@Component({
  selector: 'app-asset',
  templateUrl: './asset.component.html',
  styleUrls: ['./asset.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssetComponent {

  private mapStateService = inject(MapStateService);

  asset$: Observable<MapClickedFeature<any>> = this.mapStateService.selectedMapFeature$.pipe(
    filter(feature => (
      feature.mapLayer === MapLayer.Asset ||
      feature.mapLayer === MapLayer.AssetIcon
    ))
  );

  location$: Observable<[number, number]> = this.asset$.pipe(
    map(stage => stage.geometry.coordinates as [number, number])
  );

  onOpenGoogleMapsDirections(coords: [number, number]): void {
    const url = `https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=${coords[1]},${coords[0]}`;
    window.open(url, '_blank');
  }

}
