export const generateResumeSummary = async (role: string, experience: string, language: string): Promise<string> => {
  const response = await fetch('/api/generate/summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, experience, language }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate summary via AI');
  }
  const data = await response.json();
  return data.text;
};

export const generateExperienceDescription = async (role: string, company: string, language: string): Promise<string> => {
  const response = await fetch('/api/generate/experience', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, company, language }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate experience via AI');
  }
  const data = await response.json();
  return data.text;
};
