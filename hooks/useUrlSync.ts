'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useFilterStore } from '@/store/filterStore';
import { useMapStore, COUNTRY_CONFIGS, DEFAULT_COUNTRY, flyToLocation } from '@/store/mapStore';
import { useDatacenterStore } from '@/store/datacenterStore';
import { ProviderType } from '@/types/datacenter';

/**
 * Sync filters and map state with URL parameters
 * Enables shareable links like: ?country=DE&providers=AWS&dc=aws-virginia
 */
export function useUrlSync() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const {
    providers,
    providerTypes,
    capacityRange,
    pueRange,
    renewableOnly,
    toggleProvider,
    toggleProviderType,
    setCountry,
    setCapacityRange,
    setPueRange,
    setRenewableOnly,
  } = useFilterStore();

  const {
    selectDatacenter,
    setViewport,
    activeCountry,
    setActiveCountry,
    selectedDatacenter,
    viewport,
  } = useMapStore();
  const { datacenters } = useDatacenterStore();

  // Guard so the mount-read effect only fires once after datacenters are available.
  // Using a ref avoids adding the store action callbacks (which are stable but not
  // guaranteed to be referentially equal across renders) to the dependency array.
  const initializedRef = useRef(false);

  // Load from URL on mount (one time only, after datacenters are loaded)
  useEffect(() => {
    if (!searchParams || datacenters.length === 0 || initializedRef.current) return;
    initializedRef.current = true;

    // Parse country (single value; validated against known configs)
    const countryParam = searchParams.get('country');
    if (countryParam && COUNTRY_CONFIGS[countryParam]) {
      setActiveCountry(countryParam);
      setCountry(countryParam);
    }

    // Parse providers
    const providersParam = searchParams.get('providers');
    if (providersParam) {
      const providerList = providersParam.split(',');
      providerList.forEach(p => toggleProvider(p));
    }

    // Parse provider types
    const typesParam = searchParams.get('types');
    if (typesParam) {
      const typeList = typesParam.split(',');
      typeList.forEach(t => toggleProviderType(t as ProviderType));
    }

    // Parse capacity range (H-9: validate numbers and logical bounds)
    const capacityParam = searchParams.get('capacity');
    if (capacityParam) {
      const parts = capacityParam.split('-');
      const min = parseFloat(parts[0]);
      const max = parseFloat(parts[1]);
      if (
        !isNaN(min) && !isNaN(max) &&
        min >= 0 && max <= 500 && min <= max
      ) {
        setCapacityRange([min, max]);
      }
    }

    // Parse PUE range (H-9: validate numbers and logical bounds)
    const pueParam = searchParams.get('pue');
    if (pueParam) {
      const parts = pueParam.split('-');
      const min = parseFloat(parts[0]);
      const max = parseFloat(parts[1]);
      if (
        !isNaN(min) && !isNaN(max) &&
        min >= 1.0 && max <= 3.0 && min <= max
      ) {
        setPueRange([min, max]);
      }
    }

    // Parse renewable only
    const renewableParam = searchParams.get('renewable');
    if (renewableParam === 'true') {
      setRenewableOnly(true);
    }

    // Parse selected datacenter
    const dcParam = searchParams.get('dc');
    if (dcParam) {
      const datacenter = datacenters.find(dc => dc.id === dcParam);
      if (datacenter) {
        selectDatacenter(datacenter.id);
        const vp = { longitude: datacenter.lng, latitude: datacenter.lat, zoom: 8, bearing: 0, pitch: 0 };
        setViewport(vp);
        flyToLocation(vp); // Map is uncontrolled; must navigate imperatively
      }
    }

    // Parse map view
    const viewParam = searchParams.get('view');
    if (viewParam) {
      const parts = viewParam.split(',');
      const lng = parseFloat(parts[0]);
      const lat = parseFloat(parts[1]);
      const zoom = parseFloat(parts[2]);
      if (!isNaN(lng) && !isNaN(lat) && !isNaN(zoom)) {
        const vp = { longitude: lng, latitude: lat, zoom, bearing: 0, pitch: 0 };
        setViewport(vp);
        flyToLocation(vp); // Map is uncontrolled; must navigate imperatively
      }
    }
  }, [
    datacenters,
    searchParams,
    setActiveCountry,
    setCapacityRange,
    setCountry,
    setPueRange,
    setRenewableOnly,
    setViewport,
    selectDatacenter,
    toggleProvider,
    toggleProviderType,
  ]);

  // Update URL when filters or map state change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();

      // Add country (only when non-default)
      if (activeCountry !== DEFAULT_COUNTRY) {
        params.set('country', activeCountry);
      }

      // Add providers
      if (providers.size > 0) {
        params.set('providers', Array.from(providers).join(','));
      }

      // Add provider types
      if (providerTypes.size > 0) {
        params.set('types', Array.from(providerTypes).join(','));
      }

      // Add capacity range (if not default)
      if (capacityRange[0] !== 0 || capacityRange[1] !== 500) {
        params.set('capacity', `${capacityRange[0]}-${capacityRange[1]}`);
      }

      // Add PUE range (if not default)
      if (pueRange[0] !== 1.0 || pueRange[1] !== 2.0) {
        params.set('pue', `${pueRange[0]}-${pueRange[1]}`);
      }

      // Add renewable only
      if (renewableOnly) {
        params.set('renewable', 'true');
      }

      // H-8: Write selected datacenter back to dc= param
      if (selectedDatacenter) {
        params.set('dc', selectedDatacenter);
      }

      // M-12: Write current viewport back to view= param
      params.set(
        'view',
        `${viewport.longitude.toFixed(4)},${viewport.latitude.toFixed(4)},${viewport.zoom.toFixed(2)}`
      );

      // Update URL without reload
      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(newUrl, { scroll: false });
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [
    providers,
    providerTypes,
    activeCountry,
    capacityRange,
    pueRange,
    renewableOnly,
    selectedDatacenter,
    viewport,
    pathname,
    router,
  ]);
}
