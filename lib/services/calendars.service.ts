  
  export async function getDayOffs (year: number) {
    try {
    

      const response = await fetch(
        `/api/requests/day-off?year=${year}`,
        {
          method: 'GET',
          cache: 'no-store',
        }
      )

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            'Impossible de récupérer les jours fériés'
        )
      }

      return result?.data || []
    } catch (error) {
      console.error(error)

    } 
  }