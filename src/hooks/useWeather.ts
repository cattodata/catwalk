import { useQuery } from '@tanstack/react-query'
import { fetchWeather, summarizeWeather } from '../lib/openMeteo'

export function useWeather() {
  const query = useQuery({
    queryKey: ['weather', 'chatswood'],
    queryFn: ({ signal }) => fetchWeather(signal),
    staleTime: 15 * 60_000, // 15 min
    gcTime: 60 * 60_000, // 1 hour
  })

  return {
    weather: query.data ? summarizeWeather(query.data) : null,
    raw: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  }
}
