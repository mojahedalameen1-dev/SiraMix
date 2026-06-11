import { supabase } from '../supabaseClient';
import { Resume, DualResumeData, TemplateOptions } from '../types';
import { DEFAULT_DUAL_RESUME_DATA, DEFAULT_TEMPLATE_OPTIONS } from '../constants';

export interface UserProfile {
  id: string;
  theme: 'light' | 'dark';
  language: 'en' | 'ar';
  active_resume_id: string | null;
}

// Map of timers for debouncing resume updates per resume ID
const updateTimers: Record<string, ReturnType<typeof setTimeout>> = {};

function createNewResumeObj(existingLength: number): Resume {
  return {
    id: crypto.randomUUID(),
    name: `Untitled Resume ${existingLength + 1}`,
    data: DEFAULT_DUAL_RESUME_DATA,
    options: DEFAULT_TEMPLATE_OPTIONS,
  };
}

export const resumeService = {
  /**
   * Fetch user profile or create one if it doesn't exist
   */
  async getProfile(userId: string): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // Profile doesn't exist, create default
      const defaultProfile: UserProfile = {
        id: userId,
        theme: 'light',
        language: 'en',
        active_resume_id: null,
      };
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([defaultProfile]);

      if (insertError) {
        console.error('Error creating default profile:', insertError);
      }
      return defaultProfile;
    } else if (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }

    return data as UserProfile;
  },

  /**
   * Upsert profile preferences
   */
  async upsertProfile(profile: Partial<UserProfile> & { id: string }): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .upsert(profile);

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  /**
   * Fetch all resumes for current user
   */
  async getResumes(userId: string): Promise<Resume[]> {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching resumes:', error);
      throw error;
    }

    return (data || []).map(r => ({
      id: r.id,
      name: r.name,
      data: r.data as DualResumeData,
      options: r.options as TemplateOptions,
    }));
  },

  /**
   * Create a new resume for user
   */
  async createResume(userId: string, resume: Resume): Promise<Resume> {
    const { error } = await supabase
      .from('resumes')
      .insert({
        id: resume.id,
        user_id: userId,
        name: resume.name,
        data: resume.data,
        options: resume.options,
      });

    if (error) {
      console.error('Error creating resume:', error);
      throw error;
    }

    return resume;
  },

  /**
   * Update resume in Supabase. This updates immediately (no debounce).
   */
  async updateResumeImmediate(userId: string, resumeId: string, updates: Partial<Resume>): Promise<void> {
    const dbUpdates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.data !== undefined) dbUpdates.data = updates.data;
    if (updates.options !== undefined) dbUpdates.options = updates.options;

    const { error } = await supabase
      .from('resumes')
      .update(dbUpdates)
      .eq('id', resumeId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating resume immediately:', error);
      throw error;
    }
  },

  /**
   * Update resume in Supabase with a 400ms debounce to prevent excessive database writes
   */
  async updateResumeDebounced(userId: string, resumeId: string, updates: Partial<Resume>): Promise<Promise<void>> {
    return new Promise((resolve, reject) => {
      if (updateTimers[resumeId]) {
        clearTimeout(updateTimers[resumeId]);
      }

      updateTimers[resumeId] = setTimeout(async () => {
        try {
          delete updateTimers[resumeId];
          await this.updateResumeImmediate(userId, resumeId, updates);
          resolve();
        } catch (err) {
          reject(err);
        }
      }, 400);
    });
  },

  /**
   * Delete resume
   */
  async deleteResume(userId: string, resumeId: string): Promise<void> {
    if (updateTimers[resumeId]) {
      clearTimeout(updateTimers[resumeId]);
      delete updateTimers[resumeId];
    }

    const { error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', resumeId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting resume:', error);
      throw error;
    }
  },

  /**
   * Migration helper: read any existing localStorage data, post it to database, and purge localStorage on success.
   */
  async migrateLocalStorageData(userId: string): Promise<{
    resumes: Resume[];
    activeResumeId: string | null;
    theme: 'light' | 'dark';
    language: 'en' | 'ar';
  } | null> {
    try {
      const savedResumesRaw = localStorage.getItem('resumes');
      const savedActiveResumeId = localStorage.getItem('activeResumeId');
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      const savedLanguage = localStorage.getItem('language') as 'en' | 'ar' | null;

      if (!savedResumesRaw) {
        return null; // Nothing to migrate
      }

      let parsedResumes: Resume[] = [];
      try {
        parsedResumes = JSON.parse(savedResumesRaw);
      } catch (e) {
        console.error('Failed to parse localStorage resumes during migration:', e);
        return null;
      }

      if (!Array.isArray(parsedResumes) || parsedResumes.length === 0) {
        return null;
      }

      // 1. Process legacy flat imports into dual en/ar resumes if needed
      const processedResumes = parsedResumes.map((r: any) => {
        if (r.data && typeof r.data === 'object' && r.data.personalInfo && !r.data.en) {
          return {
            ...r,
            data: {
              en: { ...r.data },
              ar: JSON.parse(JSON.stringify(r.data))
            }
          };
        }
        return r as Resume;
      });

      console.log(`Migrating ${processedResumes.length} resumes to Cloud for user ${userId}...`);

      // 2. Insert all resumes into Supabase
      for (const resume of processedResumes) {
        const { error } = await supabase.from('resumes').insert({
          id: resume.id,
          user_id: userId,
          name: resume.name,
          data: resume.data,
          options: resume.options,
        });
        if (error) {
          console.error(`Error migrating resume ${resume.id}:`, error);
          // Don't stop, try importing others or fail gracefully
        }
      }

      // 3. Upsert User preferences
      const activeId = savedActiveResumeId && processedResumes.some(r => r.id === savedActiveResumeId)
        ? savedActiveResumeId
        : processedResumes[0].id;

      const profileUpdates: UserProfile = {
        id: userId,
        theme: savedTheme || 'light',
        language: savedLanguage || 'en',
        active_resume_id: activeId,
      };

      await this.upsertProfile(profileUpdates);

      // 4. Purge migrated localStorage keys to prevent future run-time confusion
      localStorage.removeItem('resumes');
      localStorage.removeItem('activeResumeId');
      localStorage.removeItem('theme');
      localStorage.removeItem('language');

      return {
        resumes: processedResumes,
        activeResumeId: activeId,
        theme: profileUpdates.theme,
        language: profileUpdates.language,
      };
    } catch (err) {
      console.error('Failed to complete localStorage migration:', err);
      return null;
    }
  }
};
