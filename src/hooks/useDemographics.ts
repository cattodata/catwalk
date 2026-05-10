import { useQuery } from '@tanstack/react-query'
import { fetchAbsDemographics } from '../lib/absArcgis'

export function useDemographics() {
  const query = useQuery({
    queryKey: ['abs', 'demographics', 'chatswood'],
    queryFn: ({ signal }) => fetchAbsDemographics(signal),
    staleTime: Infinity, // census doesn't change
    gcTime: Infinity,
  })

  return {
    demographics: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  }
}
