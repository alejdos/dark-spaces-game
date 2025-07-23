
export const getMissionBriefing = async (level: number, enemyTypes: string[]): Promise<string> => {
  try {
    const response = await fetch('/api/get-briefing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ level, enemyTypes }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server responded with status ${response.status}`);
    }

    const data = await response.json();
    if (!data.briefing) {
        throw new Error("Failed to get mission briefing from server.");
    }

    return data.briefing;

  } catch (error) {
    console.error("Error fetching mission briefing from backend:", error);
    // Rethrow the error to be handled by the calling component (App.tsx)
    throw error;
  }
};
