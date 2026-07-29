const FIREBASE_API_KEY =
  process.env.FIREBASE_API_KEY ||
  process.env.VITE_FIREBASE_API_KEY ||
  'AIzaSyAHg0MlK5e0SAvocMuhi2Qi7Hq6y5AYn_w';

export async function verifyFirebaseIdToken(authorization: string | undefined): Promise<boolean> {
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return false;

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: token }),
    },
  );

  if (!response.ok) return false;
  const payload = await response.json() as { users?: Array<{ localId?: string }> };
  return Boolean(payload.users?.[0]?.localId);
}
