// Mock datacenter data - 100 datacenters across USA
import { Datacenter } from '@/types/datacenter';

export const mockDatacenters: Datacenter[] = [
  // Virginia (Ashburn - Data Center Alley)
  { id: 'dc-001', name: 'AWS US-East-1a', provider: 'AWS', lat: 39.0438, lng: -77.4874, city: 'Ashburn', state: 'VA', powerStatus: 'high', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-20T15:00:00Z' },
  { id: 'dc-002', name: 'AWS US-East-1b', provider: 'AWS', lat: 39.0520, lng: -77.5100, city: 'Ashburn', state: 'VA', powerStatus: 'medium', waterStatus: 'low', verified: true, source: 'official', lastUpdated: '2026-02-20T14:30:00Z' },
  { id: 'dc-003', name: 'Azure East US', provider: 'Azure', lat: 39.0290, lng: -77.4730, city: 'Ashburn', state: 'VA', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-20T15:15:00Z' },
  { id: 'dc-004', name: 'Google US-East4', provider: 'Google', lat: 39.0400, lng: -77.4950, city: 'Ashburn', state: 'VA', powerStatus: 'low', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-20T15:10:00Z' },
  { id: 'dc-005', name: 'Oracle Ashburn', provider: 'Oracle', lat: 39.0350, lng: -77.4820, city: 'Ashburn', state: 'VA', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-20T15:05:00Z' },
  
  // Oregon (Hillsboro)
  { id: 'dc-006', name: 'AWS US-West-2', provider: 'AWS', lat: 45.5230, lng: -122.9890, city: 'Hillsboro', state: 'OR', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-20T14:00:00Z' },
  { id: 'dc-007', name: 'Azure West US', provider: 'Azure', lat: 45.5180, lng: -123.0020, city: 'Hillsboro', state: 'OR', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-20T14:15:00Z' },
  { id: 'dc-008', name: 'Google US-West1', provider: 'Google', lat: 45.5310, lng: -122.9750, city: 'The Dalles', state: 'OR', powerStatus: 'none', waterStatus: 'medium', verified: true, source: 'official', lastUpdated: '2026-02-20T14:10:00Z' },
  
  // California (multiple regions)
  { id: 'dc-009', name: 'AWS US-West-1', provider: 'AWS', lat: 37.3541, lng: -121.9552, city: 'San Jose', state: 'CA', powerStatus: 'none', waterStatus: 'high', verified: true, source: 'official', lastUpdated: '2026-02-20T13:00:00Z' },
  { id: 'dc-010', name: 'Google US-West2', provider: 'Google', lat: 34.0522, lng: -118.2437, city: 'Los Angeles', state: 'CA', powerStatus: 'medium', waterStatus: 'high', verified: true, source: 'official', lastUpdated: '2026-02-20T13:30:00Z' },
  { id: 'dc-011', name: 'Meta Prineville', provider: 'Meta', lat: 44.2993, lng: -120.8342, city: 'Prineville', state: 'OR', powerStatus: 'none', waterStatus: 'low', verified: true, source: 'official', lastUpdated: '2026-02-20T13:45:00Z' },
  { id: 'dc-012', name: 'Apple Reno', provider: 'Apple', lat: 39.5296, lng: -119.8138, city: 'Reno', state: 'NV', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-20T13:20:00Z' },
  
  // Texas (multiple cities)
  { id: 'dc-013', name: 'Azure South Central US', provider: 'Azure', lat: 29.7604, lng: -95.3698, city: 'Houston', state: 'TX', powerStatus: 'critical', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-20T12:00:00Z' },
  { id: 'dc-014', name: 'Google US-South1', provider: 'Google', lat: 32.7767, lng: -96.7970, city: 'Dallas', state: 'TX', powerStatus: 'high', waterStatus: 'medium', verified: true, source: 'official', lastUpdated: '2026-02-20T12:15:00Z' },
  { id: 'dc-015', name: 'AWS US-South-1', provider: 'AWS', lat: 30.2672, lng: -97.7431, city: 'Austin', state: 'TX', powerStatus: 'medium', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-20T12:30:00Z' },
  { id: 'dc-016', name: 'Oracle Dallas', provider: 'Oracle', lat: 32.7800, lng: -96.8089, city: 'Dallas', state: 'TX', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-20T12:45:00Z' },
  
  // Illinois (Chicago)
  { id: 'dc-017', name: 'Azure North Central US', provider: 'Azure', lat: 41.8781, lng: -87.6298, city: 'Chicago', state: 'IL', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-20T11:00:00Z' },
  { id: 'dc-018', name: 'Google US-Central1', provider: 'Google', lat: 41.2619, lng: -95.8608, city: 'Council Bluffs', state: 'IA', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-20T11:15:00Z' },
  { id: 'dc-019', name: 'AWS US-Central-1', provider: 'AWS', lat: 41.8500, lng: -87.6500, city: 'Chicago', state: 'IL', powerStatus: 'low', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-20T11:30:00Z' },
  
  // Ohio (Columbus)
  { id: 'dc-020', name: 'AWS US-East-2', provider: 'AWS', lat: 39.9612, lng: -82.9988, city: 'Columbus', state: 'OH', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-20T10:00:00Z' },
  { id: 'dc-021', name: 'Azure East US 2', provider: 'Azure', lat: 39.9700, lng: -83.0100, city: 'Columbus', state: 'OH', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-20T10:15:00Z' },
  
  // Georgia (Atlanta)
  { id: 'dc-022', name: 'Google US-East1', provider: 'Google', lat: 33.7490, lng: -84.3880, city: 'Atlanta', state: 'GA', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-20T09:00:00Z' },
  { id: 'dc-023', name: 'Oracle Atlanta', provider: 'Oracle', lat: 33.7550, lng: -84.3900, city: 'Atlanta', state: 'GA', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-20T09:15:00Z' },
  
  // North Carolina (multiple)
  { id: 'dc-024', name: 'Apple Maiden', provider: 'Apple', lat: 35.5743, lng: -81.2195, city: 'Maiden', state: 'NC', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-20T08:00:00Z' },
  { id: 'dc-025', name: 'Google Lenoir', provider: 'Google', lat: 35.9140, lng: -81.5390, city: 'Lenoir', state: 'NC', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-20T08:15:00Z' },
  
  // South Carolina
  { id: 'dc-026', name: 'Google Berkeley County', provider: 'Google', lat: 33.2057, lng: -80.0131, city: 'Berkeley County', state: 'SC', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-20T07:00:00Z' },
  
  // Iowa
  { id: 'dc-027', name: 'Meta Altoona', provider: 'Meta', lat: 41.6545, lng: -93.4650, city: 'Altoona', state: 'IA', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-20T06:00:00Z' },
  { id: 'dc-028', name: 'Microsoft Des Moines', provider: 'Azure', lat: 41.5868, lng: -93.6250, city: 'Des Moines', state: 'IA', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-20T06:15:00Z' },
  
  // Nebraska
  { id: 'dc-029', name: 'Meta Papillion', provider: 'Meta', lat: 41.1544, lng: -96.0422, city: 'Papillion', state: 'NE', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-20T05:00:00Z' },
  
  // Arizona (Phoenix)
  { id: 'dc-030', name: 'Azure West US 2', provider: 'Azure', lat: 33.4484, lng: -112.0740, city: 'Phoenix', state: 'AZ', powerStatus: 'low', waterStatus: 'critical', verified: true, source: 'official', lastUpdated: '2026-02-20T04:00:00Z' },
  { id: 'dc-031', name: 'AWS US-West-3', provider: 'AWS', lat: 33.4500, lng: -112.0833, city: 'Phoenix', state: 'AZ', powerStatus: 'none', waterStatus: 'high', verified: true, source: 'official', lastUpdated: '2026-02-20T04:15:00Z' },
  
  // Nevada (Las Vegas)
  { id: 'dc-032', name: 'Switch Las Vegas', provider: 'Switch', lat: 36.1699, lng: -115.1398, city: 'Las Vegas', state: 'NV', powerStatus: 'none', waterStatus: 'medium', verified: true, source: 'official', lastUpdated: '2026-02-20T03:00:00Z' },
  
  // New York
  { id: 'dc-033', name: 'Equinix NY5', provider: 'Equinix', lat: 40.7128, lng: -74.0060, city: 'New York', state: 'NY', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-20T02:00:00Z' },
  { id: 'dc-034', name: 'Digital Realty NYC', provider: 'Digital Realty', lat: 40.7140, lng: -74.0095, city: 'New York', state: 'NY', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-20T02:15:00Z' },
  
  // New Jersey
  { id: 'dc-035', name: 'Equinix NY2', provider: 'Equinix', lat: 40.7357, lng: -74.1724, city: 'Secaucus', state: 'NJ', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-20T01:00:00Z' },
  
  // Massachusetts
  { id: 'dc-036', name: 'Equinix BO1', provider: 'Equinix', lat: 42.3601, lng: -71.0589, city: 'Boston', state: 'MA', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-20T00:00:00Z' },
  
  // Pennsylvania
  { id: 'dc-037', name: 'QTS Philadelphia', provider: 'QTS', lat: 39.9526, lng: -75.1652, city: 'Philadelphia', state: 'PA', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-19T23:00:00Z' },
  
  // Florida
  { id: 'dc-038', name: 'NAP of the Americas', provider: 'Equinix', lat: 25.7617, lng: -80.1918, city: 'Miami', state: 'FL', powerStatus: 'low', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-19T22:00:00Z' },
  { id: 'dc-039', name: 'CyrusOne Tampa', provider: 'CyrusOne', lat: 27.9506, lng: -82.4572, city: 'Tampa', state: 'FL', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-19T22:15:00Z' },
  
  // Washington State
  { id: 'dc-040', name: 'Azure West US 3', provider: 'Azure', lat: 47.6062, lng: -122.3321, city: 'Seattle', state: 'WA', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-19T21:00:00Z' },
  { id: 'dc-041', name: 'Meta Redmond', provider: 'Meta', lat: 47.6740, lng: -122.1215, city: 'Redmond', state: 'WA', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-19T21:15:00Z' },
  
  // Additional Virginia datacenters (high density area)
  { id: 'dc-042', name: 'Digital Realty Ashburn', provider: 'Digital Realty', lat: 39.0458, lng: -77.4900, city: 'Ashburn', state: 'VA', powerStatus: 'medium', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-19T20:00:00Z' },
  { id: 'dc-043', name: 'CyrusOne Ashburn', provider: 'CyrusOne', lat: 39.0480, lng: -77.4880, city: 'Ashburn', state: 'VA', powerStatus: 'high', waterStatus: 'low', verified: true, source: 'official', lastUpdated: '2026-02-19T20:15:00Z' },
  { id: 'dc-044', name: 'QTS Ashburn', provider: 'QTS', lat: 39.0410, lng: -77.4850, city: 'Ashburn', state: 'VA', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-19T20:30:00Z' },
  { id: 'dc-045', name: 'Equinix DC1', provider: 'Equinix', lat: 39.0425, lng: -77.4865, city: 'Ashburn', state: 'VA', powerStatus: 'low', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-19T20:45:00Z' },
  { id: 'dc-046', name: 'CoreSite VA2', provider: 'CoreSite', lat: 39.0445, lng: -77.4890, city: 'Ashburn', state: 'VA', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-19T21:00:00Z' },
  
  // Additional Texas datacenters
  { id: 'dc-047', name: 'CyrusOne Houston', provider: 'CyrusOne', lat: 29.7650, lng: -95.3750, city: 'Houston', state: 'TX', powerStatus: 'critical', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-19T19:00:00Z' },
  { id: 'dc-048', name: 'Digital Realty Dallas', provider: 'Digital Realty', lat: 32.7800, lng: -96.8000, city: 'Dallas', state: 'TX', powerStatus: 'high', waterStatus: 'medium', verified: true, source: 'official', lastUpdated: '2026-02-19T19:15:00Z' },
  { id: 'dc-049', name: 'QTS Dallas', provider: 'QTS', lat: 32.7820, lng: -96.8050, city: 'Dallas', state: 'TX', powerStatus: 'medium', waterStatus: 'low', verified: true, source: 'official', lastUpdated: '2026-02-19T19:30:00Z' },
  { id: 'dc-050', name: 'Meta Fort Worth', provider: 'Meta', lat: 32.7555, lng: -97.3308, city: 'Fort Worth', state: 'TX', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-19T19:45:00Z' },
  
  // Additional California datacenters
  { id: 'dc-051', name: 'Equinix SV1', provider: 'Equinix', lat: 37.3688, lng: -121.9144, city: 'San Jose', state: 'CA', powerStatus: 'none', waterStatus: 'high', verified: true, source: 'official', lastUpdated: '2026-02-19T18:00:00Z' },
  { id: 'dc-052', name: 'Digital Realty Santa Clara', provider: 'Digital Realty', lat: 37.3541, lng: -121.9692, city: 'Santa Clara', state: 'CA', powerStatus: 'low', waterStatus: 'critical', verified: true, source: 'official', lastUpdated: '2026-02-19T18:15:00Z' },
  { id: 'dc-053', name: 'CoreSite LA1', provider: 'CoreSite', lat: 34.0522, lng: -118.2537, city: 'Los Angeles', state: 'CA', powerStatus: 'medium', waterStatus: 'high', verified: true, source: 'official', lastUpdated: '2026-02-19T18:30:00Z' },
  { id: 'dc-054', name: 'Equinix LA3', provider: 'Equinix', lat: 34.0500, lng: -118.2500, city: 'Los Angeles', state: 'CA', powerStatus: 'none', waterStatus: 'medium', verified: true, source: 'official', lastUpdated: '2026-02-19T18:45:00Z' },
  { id: 'dc-055', name: 'CyrusOne Sacramento', provider: 'CyrusOne', lat: 38.5816, lng: -121.4944, city: 'Sacramento', state: 'CA', powerStatus: 'none', waterStatus: 'low', verified: true, source: 'official', lastUpdated: '2026-02-19T19:00:00Z' },
  
  // Additional Chicago area
  { id: 'dc-056', name: 'Equinix CH1', provider: 'Equinix', lat: 41.8850, lng: -87.6200, city: 'Chicago', state: 'IL', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-19T17:00:00Z' },
  { id: 'dc-057', name: 'Digital Realty Chicago', provider: 'Digital Realty', lat: 41.8820, lng: -87.6250, city: 'Chicago', state: 'IL', powerStatus: 'low', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-19T17:15:00Z' },
  { id: 'dc-058', name: 'CyrusOne Chicago', provider: 'CyrusOne', lat: 41.8790, lng: -87.6280, city: 'Chicago', state: 'IL', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-19T17:30:00Z' },
  
  // Minnesota
  { id: 'dc-059', name: 'CyrusOne Minneapolis', provider: 'CyrusOne', lat: 44.9778, lng: -93.2650, city: 'Minneapolis', state: 'MN', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-19T16:00:00Z' },
  
  // Missouri
  { id: 'dc-060', name: 'CyrusOne Kansas City', provider: 'CyrusOne', lat: 39.0997, lng: -94.5786, city: 'Kansas City', state: 'MO', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-19T15:00:00Z' },
  
  // Colorado
  { id: 'dc-061', name: 'CyrusOne Denver', provider: 'CyrusOne', lat: 39.7392, lng: -104.9903, city: 'Denver', state: 'CO', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-19T14:00:00Z' },
  { id: 'dc-062', name: 'Zayo Denver', provider: 'Zayo', lat: 39.7420, lng: -104.9950, city: 'Denver', state: 'CO', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-19T14:15:00Z' },
  
  // Utah
  { id: 'dc-063', name: 'Meta Eagle Mountain', provider: 'Meta', lat: 40.3141, lng: -112.0058, city: 'Eagle Mountain', state: 'UT', powerStatus: 'none', waterStatus: 'low', verified: true, source: 'official', lastUpdated: '2026-02-19T13:00:00Z' },
  { id: 'dc-064', name: 'Google Salt Lake City', provider: 'Google', lat: 40.7608, lng: -111.8910, city: 'Salt Lake City', state: 'UT', powerStatus: 'none', waterStatus: 'medium', verified: true, source: 'official', lastUpdated: '2026-02-19T13:15:00Z' },
  
  // Oklahoma
  { id: 'dc-065', name: 'Google Pryor Creek', provider: 'Google', lat: 36.3084, lng: -95.3169, city: 'Pryor Creek', state: 'OK', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-19T12:00:00Z' },
  
  // Tennessee
  { id: 'dc-066', name: 'Google Clarksville', provider: 'Google', lat: 36.5298, lng: -87.3595, city: 'Clarksville', state: 'TN', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-19T11:00:00Z' },
  { id: 'dc-067', name: 'Switch Nashville', provider: 'Switch', lat: 36.1627, lng: -86.7816, city: 'Nashville', state: 'TN', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-19T11:15:00Z' },
  
  // Kentucky
  { id: 'dc-068', name: 'Aligned Louisville', provider: 'Aligned', lat: 38.2527, lng: -85.7585, city: 'Louisville', state: 'KY', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-19T10:00:00Z' },
  
  // Indiana
  { id: 'dc-069', name: 'Meta New Albany', provider: 'Meta', lat: 38.2856, lng: -85.8241, city: 'New Albany', state: 'IN', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-19T09:00:00Z' },
  
  // Michigan
  { id: 'dc-070', name: 'Equinix DE1', provider: 'Equinix', lat: 42.3314, lng: -83.0458, city: 'Detroit', state: 'MI', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-19T08:00:00Z' },
  
  // Wisconsin
  { id: 'dc-071', name: 'Meta Racine', provider: 'Meta', lat: 42.7261, lng: -87.7829, city: 'Racine', state: 'WI', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-19T07:00:00Z' },
  
  // Louisiana
  { id: 'dc-072', name: 'CyrusOne New Orleans', provider: 'CyrusOne', lat: 29.9511, lng: -90.0715, city: 'New Orleans', state: 'LA', powerStatus: 'low', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-19T06:00:00Z' },
  
  // Alabama
  { id: 'dc-073', name: 'Google Huntsville', provider: 'Google', lat: 34.7304, lng: -86.5861, city: 'Huntsville', state: 'AL', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-19T05:00:00Z' },
  
  // New Mexico
  { id: 'dc-074', name: 'Meta Los Lunas', provider: 'Meta', lat: 34.8064, lng: -106.7333, city: 'Los Lunas', state: 'NM', powerStatus: 'none', waterStatus: 'medium', verified: true, source: 'official', lastUpdated: '2026-02-19T04:00:00Z' },
  
  // Maryland
  { id: 'dc-075', name: 'Equinix DC2', provider: 'Equinix', lat: 39.0458, lng: -76.6413, city: 'Baltimore', state: 'MD', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-19T03:00:00Z' },
  
  // Rhode Island
  { id: 'dc-076', name: 'Aligned Providence', provider: 'Aligned', lat: 41.8240, lng: -71.4128, city: 'Providence', state: 'RI', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-19T02:00:00Z' },
  
  // Connecticut
  { id: 'dc-077', name: 'Digital Realty Stamford', provider: 'Digital Realty', lat: 41.0534, lng: -73.5387, city: 'Stamford', state: 'CT', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-19T01:00:00Z' },
  
  // Delaware
  { id: 'dc-078', name: 'QTS Wilmington', provider: 'QTS', lat: 39.7391, lng: -75.5398, city: 'Wilmington', state: 'DE', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-19T00:00:00Z' },
  
  // West Virginia
  { id: 'dc-079', name: 'Microsoft Boydton', provider: 'Azure', lat: 36.6676, lng: -78.3875, city: 'Boydton', state: 'VA', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-18T23:00:00Z' },
  
  // Kansas
  { id: 'dc-080', name: 'Google Kansas', provider: 'Google', lat: 39.0119, lng: -95.6832, city: 'Lawrence', state: 'KS', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-18T22:00:00Z' },
  
  // Arkansas
  { id: 'dc-081', name: 'Meta Little Rock', provider: 'Meta', lat: 34.7465, lng: -92.2896, city: 'Little Rock', state: 'AR', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'community', lastUpdated: '2026-02-18T21:00:00Z' },
  
  // Mississippi
  { id: 'dc-082', name: 'CenturyLink Jackson', provider: 'Lumen', lat: 32.2988, lng: -90.1848, city: 'Jackson', state: 'MS', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'community', lastUpdated: '2026-02-18T20:00:00Z' },
  
  // Montana
  { id: 'dc-083', name: 'Montana Datacenter', provider: 'Aligned', lat: 46.5891, lng: -112.0391, city: 'Helena', state: 'MT', powerStatus: 'none', waterStatus: 'none', verified: false, source: 'estimated', lastUpdated: '2026-02-18T19:00:00Z' },
  
  // Wyoming
  { id: 'dc-084', name: 'Wyoming DC', provider: 'Aligned', lat: 41.1400, lng: -104.8202, city: 'Cheyenne', state: 'WY', powerStatus: 'none', waterStatus: 'none', verified: false, source: 'estimated', lastUpdated: '2026-02-18T18:00:00Z' },
  
  // South Dakota
  { id: 'dc-085', name: 'South Dakota DC', provider: 'Aligned', lat: 44.3683, lng: -100.3506, city: 'Pierre', state: 'SD', powerStatus: 'none', waterStatus: 'none', verified: false, source: 'estimated', lastUpdated: '2026-02-18T17:00:00Z' },
  
  // North Dakota
  { id: 'dc-086', name: 'North Dakota DC', provider: 'Aligned', lat: 46.8772, lng: -100.7761, city: 'Bismarck', state: 'ND', powerStatus: 'none', waterStatus: 'none', verified: false, source: 'estimated', lastUpdated: '2026-02-18T16:00:00Z' },
  
  // Idaho
  { id: 'dc-087', name: 'Idaho Datacenter', provider: 'Aligned', lat: 43.6150, lng: -116.2023, city: 'Boise', state: 'ID', powerStatus: 'none', waterStatus: 'none', verified: false, source: 'estimated', lastUpdated: '2026-02-18T15:00:00Z' },
  
  // Maine
  { id: 'dc-088', name: 'Maine Datacenter', provider: 'Aligned', lat: 44.3106, lng: -69.7795, city: 'Augusta', state: 'ME', powerStatus: 'none', waterStatus: 'none', verified: false, source: 'estimated', lastUpdated: '2026-02-18T14:00:00Z' },
  
  // New Hampshire
  { id: 'dc-089', name: 'New Hampshire DC', provider: 'Aligned', lat: 43.2081, lng: -71.5376, city: 'Manchester', state: 'NH', powerStatus: 'none', waterStatus: 'none', verified: false, source: 'estimated', lastUpdated: '2026-02-18T13:00:00Z' },
  
  // Vermont
  { id: 'dc-090', name: 'Vermont Datacenter', provider: 'Aligned', lat: 44.2601, lng: -72.5754, city: 'Montpelier', state: 'VT', powerStatus: 'none', waterStatus: 'none', verified: false, source: 'estimated', lastUpdated: '2026-02-18T12:00:00Z' },
  
  // Additional distributed datacenters
  { id: 'dc-091', name: 'Apple Newark', provider: 'Apple', lat: 40.7357, lng: -74.1724, city: 'Newark', state: 'NJ', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-18T11:00:00Z' },
  { id: 'dc-092', name: 'Oracle Phoenix', provider: 'Oracle', lat: 33.4500, lng: -112.0667, city: 'Phoenix', state: 'AZ', powerStatus: 'none', waterStatus: 'high', verified: true, source: 'official', lastUpdated: '2026-02-18T10:00:00Z' },
  { id: 'dc-093', name: 'Salesforce Chicago', provider: 'Salesforce', lat: 41.8800, lng: -87.6230, city: 'Chicago', state: 'IL', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-18T09:00:00Z' },
  { id: 'dc-094', name: 'Rackspace San Antonio', provider: 'Rackspace', lat: 29.4241, lng: -98.4936, city: 'San Antonio', state: 'TX', powerStatus: 'low', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-18T08:00:00Z' },
  { id: 'dc-095', name: 'IBM Dallas', provider: 'IBM', lat: 32.7850, lng: -96.8070, city: 'Dallas', state: 'TX', powerStatus: 'medium', waterStatus: 'low', verified: true, source: 'official', lastUpdated: '2026-02-18T07:00:00Z' },
  { id: 'dc-096', name: 'Verizon Ashburn', provider: 'Verizon', lat: 39.0440, lng: -77.4880, city: 'Ashburn', state: 'VA', powerStatus: 'medium', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-18T06:00:00Z' },
  { id: 'dc-097', name: 'AT&T Atlanta', provider: 'AT&T', lat: 33.7500, lng: -84.3900, city: 'Atlanta', state: 'GA', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-18T05:00:00Z' },
  { id: 'dc-098', name: 'Lumen Denver', provider: 'Lumen', lat: 39.7400, lng: -104.9920, city: 'Denver', state: 'CO', powerStatus: 'none', waterStatus: 'none', verified: true, source: 'official', lastUpdated: '2026-02-18T04:00:00Z' },
  { id: 'dc-099', name: 'Cogent Los Angeles', provider: 'Cogent', lat: 34.0520, lng: -118.2470, city: 'Los Angeles', state: 'CA', powerStatus: 'none', waterStatus: 'medium', verified: true, source: 'official', lastUpdated: '2026-02-18T03:00:00Z' },
  { id: 'dc-100', name: 'Hurricane Electric Fremont', provider: 'Hurricane Electric', lat: 37.5485, lng: -121.9886, city: 'Fremont', state: 'CA', powerStatus: 'none', waterStatus: 'low', verified: true, source: 'official', lastUpdated: '2026-02-18T02:00:00Z' },
];
