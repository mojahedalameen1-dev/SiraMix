import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebaseClient';
import { Resume } from '../types';
import { sanitizeLegacySeedData } from './seedDataSanitizer';

export interface UserProfile {
  id: string;
  theme: 'light' | 'dark';
  language: 'en' | 'ar';
  active_resume_id: string | null;
}

const updateTimers: Record<string, ReturnType<typeof setTimeout>> = {};
const pendingUpdates: Record<string, Partial<Resume>> = {};
const pendingWaiters: Record<string, Array<{ resolve: () => void; reject: (error: unknown) => void }>> = {};
const pendingOwners: Record<string, { userId: string; resumeId: string }> = {};

const userRef = (userId: string) => doc(db, 'users', userId);
const profileRef = (userId: string) => doc(db, 'users', userId, 'settings', 'profile');
const resumeRef = (userId: string, resumeId: string) =>
  doc(db, 'users', userId, 'resumes', resumeId);
const updateKey = (userId: string, resumeId: string) => `${userId}:${resumeId}`;

const settlePendingUpdate = async (key: string): Promise<void> => {
  if (updateTimers[key]) {
    clearTimeout(updateTimers[key]);
    delete updateTimers[key];
  }

  const updates = pendingUpdates[key];
  const owner = pendingOwners[key];
  const waiters = pendingWaiters[key] || [];
  delete pendingUpdates[key];
  delete pendingOwners[key];
  delete pendingWaiters[key];

  if (!updates || !owner) {
    waiters.forEach(waiter => waiter.resolve());
    return;
  }

  try {
    await resumeService.updateResumeImmediate(owner.userId, owner.resumeId, updates);
    waiters.forEach(waiter => waiter.resolve());
  } catch (error) {
    waiters.forEach(waiter => waiter.reject(error));
    throw error;
  }
};

export const resumeService = {
  async getProfile(userId: string): Promise<UserProfile> {
    const snapshot = await getDoc(profileRef(userId));
    if (snapshot.exists()) {
      return { id: userId, ...snapshot.data() } as UserProfile;
    }

    const defaultProfile: UserProfile = {
      id: userId,
      theme: 'light',
      language: 'en',
      active_resume_id: null,
    };
    await this.upsertProfile(defaultProfile);
    return defaultProfile;
  },

  async upsertProfile(profile: Partial<UserProfile> & { id: string }): Promise<void> {
    const { id, ...values } = profile;
    await setDoc(userRef(id), { updatedAt: serverTimestamp() }, { merge: true });
    await setDoc(
      profileRef(id),
      { ...values, updatedAt: serverTimestamp() },
      { merge: true },
    );
  },

  async getResumes(userId: string): Promise<Resume[]> {
    // Sorting after retrieval avoids requiring an index during first deployment.
    const snapshot = await getDocs(collection(db, 'users', userId, 'resumes'));

    const cleanupBatch = writeBatch(db);
    let hasCleanup = false;
    const resumes = snapshot.docs
      .map(item => {
        const data = item.data();
        const sanitized = sanitizeLegacySeedData(data.data);
        if (sanitized.changed) {
          cleanupBatch.set(resumeRef(userId, item.id), {
            data: sanitized.data,
            updatedAt: serverTimestamp(),
          }, { merge: true });
          hasCleanup = true;
        }
        return {
          id: item.id,
          name: data.name,
          data: sanitized.data,
          options: data.options,
          sourceDocument: data.sourceDocument || null,
          createdAt: data.createdAt?.toMillis?.() || 0,
        };
      })
      .sort((a, b) => a.createdAt - b.createdAt)
      .map(({ createdAt: _createdAt, ...resume }) => resume as Resume);

    if (hasCleanup) {
      await cleanupBatch.commit();
    }

    return resumes;
  },

  async createResume(userId: string, resume: Resume): Promise<Resume> {
    await setDoc(resumeRef(userId, resume.id), {
      name: resume.name,
      data: resume.data,
      options: resume.options,
      sourceDocument: resume.sourceDocument || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return resume;
  },

  async updateResumeImmediate(
    userId: string,
    resumeId: string,
    updates: Partial<Resume>,
  ): Promise<void> {
    const values: Record<string, unknown> = { updatedAt: serverTimestamp() };
    if (updates.name !== undefined) values.name = updates.name;
    if (updates.data !== undefined) values.data = updates.data;
    if (updates.options !== undefined) values.options = updates.options;
    if (updates.sourceDocument !== undefined) values.sourceDocument = updates.sourceDocument;
    await setDoc(resumeRef(userId, resumeId), values, { merge: true });
  },

  async updateResumeDebounced(
    userId: string,
    resumeId: string,
    updates: Partial<Resume>,
  ): Promise<void> {
    const key = updateKey(userId, resumeId);
    return new Promise((resolve, reject) => {
      pendingUpdates[key] = {
        ...pendingUpdates[key],
        ...updates,
      };
      pendingOwners[key] = { userId, resumeId };
      pendingWaiters[key] = [
        ...(pendingWaiters[key] || []),
        { resolve, reject },
      ];

      if (updateTimers[key]) clearTimeout(updateTimers[key]);
      updateTimers[key] = setTimeout(() => {
        void settlePendingUpdate(key).catch(() => undefined);
      }, 400);
    });
  },

  async flushResume(userId: string, resumeId: string): Promise<void> {
    await settlePendingUpdate(updateKey(userId, resumeId));
  },

  async flushAll(): Promise<void> {
    await Promise.all(Object.keys(pendingUpdates).map(key => settlePendingUpdate(key)));
  },

  async deleteResume(
    userId: string,
    resume: Resume,
    nextActiveResumeId: string | null,
    replacement?: Resume,
  ): Promise<void> {
    await this.flushResume(userId, resume.id);

    const batch = writeBatch(db);
    batch.delete(resumeRef(userId, resume.id));

    if (resume.sourceDocument) {
      const sourceRef = doc(db, resume.sourceDocument.storagePath);
      for (let index = 0; index < resume.sourceDocument.chunkCount; index += 1) {
        batch.delete(doc(sourceRef, 'chunks', String(index).padStart(4, '0')));
      }
      batch.delete(sourceRef);
    }

    if (replacement) {
      batch.set(resumeRef(userId, replacement.id), {
        name: replacement.name,
        data: replacement.data,
        options: replacement.options,
        sourceDocument: replacement.sourceDocument || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    batch.set(userRef(userId), { updatedAt: serverTimestamp() }, { merge: true });
    batch.set(profileRef(userId), {
      active_resume_id: replacement?.id || nextActiveResumeId,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    await batch.commit();
  },

  async migrateLocalStorageData(userId: string): Promise<{
    resumes: Resume[];
    activeResumeId: string | null;
    theme: 'light' | 'dark';
    language: 'en' | 'ar';
  } | null> {
    const savedResumesRaw = localStorage.getItem('resumes');
    if (!savedResumesRaw) return null;

    try {
      const parsedResumes = JSON.parse(savedResumesRaw) as Resume[];
      if (!Array.isArray(parsedResumes) || parsedResumes.length === 0) return null;

      const processedResumes = parsedResumes.map((resume: any) => {
        let normalizedResume: Resume;
        if (resume.data?.personalInfo && !resume.data.en) {
          normalizedResume = {
            ...resume,
            data: {
              en: { ...resume.data },
              ar: structuredClone(resume.data),
            },
          };
        } else {
          normalizedResume = resume as Resume;
        }

        return {
          ...normalizedResume,
          data: sanitizeLegacySeedData(normalizedResume.data).data,
        };
      });

      const savedActiveResumeId = localStorage.getItem('activeResumeId');
      const activeResumeId = savedActiveResumeId &&
        processedResumes.some(resume => resume.id === savedActiveResumeId)
        ? savedActiveResumeId
        : processedResumes[0].id;
      const theme = (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
      const language = (localStorage.getItem('language') as 'en' | 'ar') || 'en';

      const batch = writeBatch(db);
      processedResumes.forEach(resume => {
        batch.set(resumeRef(userId, resume.id), {
          name: resume.name,
          data: resume.data,
          options: resume.options,
          sourceDocument: resume.sourceDocument || null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });
      batch.set(userRef(userId), { updatedAt: serverTimestamp() }, { merge: true });
      batch.set(profileRef(userId), {
        theme,
        language,
        active_resume_id: activeResumeId,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      await batch.commit();

      ['resumes', 'activeResumeId', 'theme', 'language'].forEach(key =>
        localStorage.removeItem(key),
      );

      return { resumes: processedResumes, activeResumeId, theme, language };
    } catch (error) {
      console.error('Failed to migrate local resume data to Firestore:', error);
      return null;
    }
  },
};
