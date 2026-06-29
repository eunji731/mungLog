'use client';

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { MapPin, ZoomIn, ZoomOut } from 'lucide-react';
import NaverMap from '@/app/map/components/NaverMap';
import MapSearchBar from '@/app/map/components/MapSearchBar';
import MarkerDetailPanel from '@/app/map/components/MarkerDetailPanel';
import { useMapMarkers, MapMemoryDetail, BBox } from '@/app/map/hooks/useMapMarkers';
import { getImagePath } from '@/lib/clientApi';

const WORLD_BBOX: BBox = { swLat: -90, swLng: -180, neLat: 90, neLng: 180 };

function calcFit(markers: naver.maps.Marker[]): { center: naver.maps.LatLng; zoom: number } | null {
  if (markers.length === 0) return null;
  const firstPos = markers[0].getPosition() as naver.maps.LatLng;
  const bounds = new naver.maps.LatLngBounds(firstPos, firstPos);
  markers.forEach(m => bounds.extend(m.getPosition() as naver.maps.LatLng));
  const sw = bounds.getSW() as naver.maps.LatLng;
  const ne = bounds.getNE() as naver.maps.LatLng;
  const latSpan = Math.max(ne.lat() - sw.lat(), 0.005);
  const lngSpan = Math.max(ne.lng() - sw.lng(), 0.005);
  const center = bounds.getCenter() as naver.maps.LatLng;
  const cosLat = Math.cos((center.lat() * Math.PI) / 180);
  const maxSpan = Math.max(latSpan, lngSpan * cosLat);
  const zoom = Math.min(14, Math.max(7, Math.floor(Math.log2(90 / maxSpan))));
  return { center, zoom };
}

export default function MapPage() {
  const { markers, loading, detailLoading, fetchMarkers, fetchDetail, searchMarkers } = useMapMarkers();
  const [selectedDetail, setSelectedDetail] = useState<MapMemoryDetail | null>(null);
  const [mapVisible, setMapVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MapMemoryDetail[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const mapInstanceRef = useRef<naver.maps.Map | null>(null);
  const markersRef = useRef<naver.maps.Marker[]>([]);
  const lastBboxRef = useRef<BBox>(WORLD_BBOX);
  const isFirstLoad = useRef(true);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const groupedMarkers = useMemo(() => {
    const momentMap = new Map<string, typeof markers[0]>();
    markers.forEach(m => {
      if (!momentMap.has(m.id)) {
        momentMap.set(m.id, m);
      }
    });
    return Array.from(momentMap.values());
  }, [markers]);

  const photosForSelectedMoment = useMemo(() => {
    if (!selectedDetail) return [];
    return [{ id: selectedDetail.photoId, path: selectedDetail.path }];
  }, [selectedDetail]);

  const handleMapLoad = useCallback((map: naver.maps.Map) => {
    mapInstanceRef.current = map;
    fetchMarkers(WORLD_BBOX);
  }, [fetchMarkers]);

  const handleBoundsChanged = useCallback((bounds: naver.maps.LatLngBounds) => {
    const sw = bounds.getSW() as naver.maps.LatLng;
    const ne = bounds.getNE() as naver.maps.LatLng;
    const bbox: BBox = { swLat: sw.lat(), swLng: sw.lng(), neLat: ne.lat(), neLng: ne.lng() };
    lastBboxRef.current = bbox;
    if (!searchQuery) {
      fetchMarkers(bbox, mapInstanceRef.current?.getZoom());
    }
  }, [fetchMarkers, searchQuery]);

  useEffect(() => {
    if (isFirstLoad.current) return;
    if (mapInstanceRef.current && !searchQuery) {
      fetchMarkers(lastBboxRef.current);
    }
  }, [fetchMarkers, searchQuery]);

  const updateMarkers = useCallback((map: naver.maps.Map) => {
    if (!window.naver) return;

    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    groupedMarkers.forEach((marker) => {
      const thumbUrl = getImagePath(marker.thumb);
      const naverMarker = new naver.maps.Marker({
        position: new naver.maps.LatLng(marker.lat, marker.lng),
        map,
        title: marker.dateKey,
        icon: {
          content: `
            <div class="relative group cursor-pointer">
              <div class="text-main-yellow drop-shadow-lg transition-transform group-hover:scale-110">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="currentColor" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3" fill="white"></circle>
                </svg>
              </div>
              <div class="absolute top-1 left-1 w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-white shadow-sm ring-2 ring-main-yellow/20">
                <img src="${thumbUrl}" alt="" class="w-full h-full object-cover" />
              </div>
            </div>
          `,
          anchor: new naver.maps.Point(22, 44),
        },
      });

      naver.maps.Event.addListener(naverMarker, 'click', async () => {
        const detail = await fetchDetail(marker.id);
        if (detail) setSelectedDetail(detail);
      });

      markersRef.current.push(naverMarker);
    });

    if (isFirstLoad.current && groupedMarkers.length > 0) {
      isFirstLoad.current = false;
      const fit = calcFit(markersRef.current);
      if (fit) {
        map.setCenter(fit.center);
        map.setZoom(fit.zoom);
      }
      setMapVisible(true);
    } else if (isFirstLoad.current && !loading) {
      isFirstLoad.current = false;
      setMapVisible(true);
    }
  }, [groupedMarkers, fetchDetail, loading]);

  useEffect(() => {
    if (mapInstanceRef.current) {
      updateMarkers(mapInstanceRef.current);
    }
  }, [groupedMarkers, updateMarkers]);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      fetchMarkers(lastBboxRef.current);
      return;
    }

    setIsSearching(true);
    setShowResults(true);
    try {
      const results = await searchMarkers(query);
      setSearchResults(results);
      if (results.length > 0 && mapInstanceRef.current) {
        const tempMarkers = results.map(r => new naver.maps.Marker({
          position: new naver.maps.LatLng(r.latitude, r.longitude)
        }));
        const fit = calcFit(tempMarkers);
        if (fit) {
          mapInstanceRef.current.morph(fit.center, fit.zoom);
        }
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  }, [fetchMarkers, searchMarkers]);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      handleSearch(searchQuery);
    }, 500);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [searchQuery, handleSearch]);

  const handleResultClick = (result: MapMemoryDetail) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(new naver.maps.LatLng(result.latitude, result.longitude));
      mapInstanceRef.current.setZoom(16);
      setSelectedDetail(result);
      setShowResults(false);
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation && mapInstanceRef.current) {
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        mapInstanceRef.current?.setCenter(new naver.maps.LatLng(coords.latitude, coords.longitude));
        mapInstanceRef.current?.setZoom(16);
      });
    }
  };

  const handleZoomIn = () => mapInstanceRef.current?.setZoom((mapInstanceRef.current.getZoom() ?? 13) + 1);
  const handleZoomOut = () => mapInstanceRef.current?.setZoom((mapInstanceRef.current.getZoom() ?? 13) - 1);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background relative overflow-hidden">
      <div className={`absolute inset-0 transition-opacity duration-300 ${mapVisible ? 'opacity-100' : 'opacity-0'}`}>
        <NaverMap onMapLoad={handleMapLoad} onBoundsChanged={handleBoundsChanged} />
      </div>

      {!mapVisible && (
        <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
          <div className="flex items-center gap-2 px-4 py-2 bg-background rounded-full shadow-lg text-sm font-bold text-text-sub">
            <MapPin className="w-4 h-4 animate-bounce text-main-green" />
            추억 찾는 중...
          </div>
        </div>
      )}

      {mapVisible && loading && !isSearching && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-background/90 backdrop-blur-sm rounded-full shadow text-xs font-bold text-text-sub">
            <MapPin className="w-3 h-3 animate-bounce text-main-green" />
            업데이트 중
          </div>
        </div>
      )}

      <MapSearchBar
        query={searchQuery}
        onChange={setSearchQuery}
        onClear={() => { setSearchQuery(''); setShowResults(false); }}
        searchResults={searchResults}
        isSearching={isSearching}
        showResults={showResults}
        onShowResults={setShowResults}
        onResultClick={handleResultClick}
        onLocationClick={handleCurrentLocation}
      />

      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2">
        <button onClick={handleZoomIn} className="p-3 bg-background border border-border rounded-xl shadow-lg text-text-main hover:bg-surface-green transition-all">
          <ZoomIn className="w-5 h-5" />
        </button>
        <button onClick={handleZoomOut} className="p-3 bg-background border border-border rounded-xl shadow-lg text-text-main hover:bg-surface-green transition-all">
          <ZoomOut className="w-5 h-5" />
        </button>
      </div>

      {selectedDetail && (
        <MarkerDetailPanel
          detail={selectedDetail}
          loading={detailLoading}
          photos={photosForSelectedMoment}
          onClose={() => setSelectedDetail(null)}
        />
      )}
    </div>
  );
}
