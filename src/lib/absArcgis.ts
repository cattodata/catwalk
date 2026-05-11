import { getActiveCity } from '../config/cities'

/**
 * ABS ArcGIS FeatureServer — Census 2021 G01 (age/population) for Chatswood SA2.
 * CORS-enabled, no auth required.
 *
 * Layer reference:
 *   ABS_2021_Census_G01_SA2 (Selected Person Characteristics)
 *   ABS_2021_Census_G08_SA2 (Ancestry by Sex)
 *
 * Free tier — fair-use only, no rate limit documented.
 */
const G01_ENDPOINT =
  'https://services-ap1.arcgis.com/ypkPEy1AmwPKGNNv/ArcGIS/rest/services/ABS_2021_Census_G01_SA2/FeatureServer/0/query'

export interface AbsDemographics {
  population: number
  median_age: number
  chinese_ancestry_pct: number
  korean_ancestry_pct: number
  source: string
  citation: string
}

interface AbsFeature {
  attributes: Record<string, number | string>
}

export async function fetchAbsDemographics(signal?: AbortSignal): Promise<AbsDemographics> {
  const where = `SA2_CODE_2021='${getActiveCity().absSa2.east}'`
  const params = new URLSearchParams({
    where,
    outFields: 'Tot_P_P,Median_age_persons',
    f: 'json',
  })
  const res = await fetch(`${G01_ENDPOINT}?${params}`, { signal })
  if (!res.ok) throw new Error(`ABS ArcGIS ${res.status}`)
  const data = (await res.json()) as { features?: AbsFeature[] }
  const f = data.features?.[0]?.attributes
  if (!f) throw new Error('ABS ArcGIS: no features for SA2')

  return {
    population: Number(f.Tot_P_P) || 0,
    median_age: Number(f.Median_age_persons) || 0,
    /**
     * Chinese / Korean ancestry not in G01 — pulled separately from G08.
     * For MVP we use static ABS Census 2021 published figures
     * (Chatswood (East) - Artarmon SA2: Chinese 39.7%, Korean 7.8%).
     */
    chinese_ancestry_pct: 39.7,
    korean_ancestry_pct: 7.8,
    source: 'ABS Census 2021 · G01 (population) + G08 (ancestry, published)',
    citation: 'https://www.abs.gov.au/census/find-census-data/quickstats/2021/SAL10806',
  }
}
