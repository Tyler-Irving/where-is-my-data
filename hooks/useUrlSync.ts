'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useFilterStore } from '@/store/filterStore';
import { useMapStore } from '@/store/mapStore';
import { useDatacenterStore } from '@/store/datacenterStore';

/**
 * Sync filters and map state with URL parameters
 * Enables shareable links like: ?provider=AWS&state=VA&dc=aws-virginia
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
    setCapacityRange,
    setPueRange,
    setRenewableOnly,
  } = useFilterStore();
  
  const { selectDatacenter, setViewport } = useMapStore();
  const { datacenters } = useDatacenterStore();

  // Load from URL on mount (one time only)
  useEffect(() => {
    if (!searchParams || datacenters.length === 0) return;
    
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
      typeList.forEach(t => toggleProviderType(t as any));
    }
    
    // Parse capacity range
    const capacityParam = searchParams.get('capacity');
    if (capacityParam) {
      const [min, max] = capacityParam.split('-').map(Number);
      if (!isNaN(min) && !isNaN(max)) {
        setCapacityRange([min, max]);
      }
    }
    
    // Parse PUE range
    const pueParam = searchParams.get('pue');
    if (pueParam) {
      const [min, max] = pueParam.split('-').map(Number);
      if (!isNaN(min) && !isNaN(max)) {
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
        setViewport({
          longitude: datacenter.lng,
          latitude: datacenter.lat,
          zoom: 8,
          bearing: 0,
          pitch: 0,
        });
      }
    }
    
    // Parse map view
    const viewParam = searchParams.get('view');
    if (viewParam) {
      const [lng, lat, zoom] = viewParam.split(',').map(Number);
      if (!isNaN(lng) && !isNaN(lat) && !isNaN(zoom)) {
        setViewport({
          longitude: lng,
          latitude: lat,
          zoom,
          bearing: 0,
          pitch: 0,
        });
      }
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datacenters.length]); // Only run when datacenters are loaded

  // Update URL when filters change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      
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
      
      // Update URL without reload
      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(newUrl, { scroll: false });
    }, 500); // 500ms debounce
    
    return () => clearTimeout(timer);
  }, [providers, providerTypes, capacityRange, pueRange, renewableOnly, pathname, router]);
}
