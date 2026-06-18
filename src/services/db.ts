import { db } from './firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  deleteDoc
} from 'firebase/firestore';
import type { ResumeState, CoverLetterState, DocumentMetadata } from '../types';

export const dbService = {
  async listDrafts(userId: string): Promise<DocumentMetadata[]> {
    if (db) {
      try {
        const resumesRef = collection(db, 'users', userId, 'resumes');
        const cvRef = collection(db, 'users', userId, 'coverletters');
        
        const resumesSnap = await getDocs(resumesRef);
        const cvSnap = await getDocs(cvRef);

        const list: DocumentMetadata[] = [];
        resumesSnap.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            type: 'resume',
            title: data.title || 'Untitled Resume',
            updatedAt: data.updatedAt || Date.now()
          });
        });
        cvSnap.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            type: 'coverletter',
            title: data.title || 'Untitled Cover Letter',
            updatedAt: data.updatedAt || Date.now()
          });
        });
        return list.sort((a, b) => b.updatedAt - a.updatedAt);
      } catch (err) {
        console.error("Firestore read error, falling back to LocalStorage:", err);
      }
    }

    // LocalStorage fallback
    const localMetaRaw = localStorage.getItem(`LOCAL_META_${userId}`);
    if (localMetaRaw) {
      try {
        const list: DocumentMetadata[] = JSON.parse(localMetaRaw);
        return list.sort((a, b) => b.updatedAt - a.updatedAt);
      } catch {
        return [];
      }
    }
    return [];
  },

  async saveResume(userId: string, id: string, state: ResumeState): Promise<void> {
    const updatedAt = Date.now();
    const docToSave = { ...state, id, updatedAt };

    if (db) {
      try {
        const docRef = doc(db, 'users', userId, 'resumes', id);
        await setDoc(docRef, docToSave);
        await this.updateLocalMetadataList(userId, id, 'resume', state.title || 'Untitled Resume', updatedAt);
        return;
      } catch (err) {
        console.error("Firestore write failed, saving locally:", err);
      }
    }

    // LocalStorage fallback
    localStorage.setItem(`LOCAL_RESUME_${id}`, JSON.stringify(docToSave));
    await this.updateLocalMetadataList(userId, id, 'resume', state.title || 'Untitled Resume', updatedAt);
  },

  async saveCoverLetter(userId: string, id: string, state: CoverLetterState): Promise<void> {
    const updatedAt = Date.now();
    const docToSave = { ...state, id, updatedAt };

    if (db) {
      try {
        const docRef = doc(db, 'users', userId, 'coverletters', id);
        await setDoc(docRef, docToSave);
        await this.updateLocalMetadataList(userId, id, 'coverletter', state.title || 'Untitled Cover Letter', updatedAt);
        return;
      } catch (err) {
        console.error("Firestore write failed, saving locally:", err);
      }
    }

    // LocalStorage fallback
    localStorage.setItem(`LOCAL_CL_${id}`, JSON.stringify(docToSave));
    await this.updateLocalMetadataList(userId, id, 'coverletter', state.title || 'Untitled Cover Letter', updatedAt);
  },

  async getResume(userId: string, id: string): Promise<ResumeState | null> {
    if (db) {
      try {
        const docRef = doc(db, 'users', userId, 'resumes', id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          return snap.data() as ResumeState;
        }
      } catch (err) {
        console.error("Firestore read failed, checking locally:", err);
      }
    }

    const localRaw = localStorage.getItem(`LOCAL_RESUME_${id}`);
    return localRaw ? JSON.parse(localRaw) : null;
  },

  async getCoverLetter(userId: string, id: string): Promise<CoverLetterState | null> {
    if (db) {
      try {
        const docRef = doc(db, 'users', userId, 'coverletters', id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          return snap.data() as CoverLetterState;
        }
      } catch (err) {
        console.error("Firestore read failed, checking locally:", err);
      }
    }

    const localRaw = localStorage.getItem(`LOCAL_CL_${id}`);
    return localRaw ? JSON.parse(localRaw) : null;
  },

  async deleteDraft(userId: string, id: string, type: 'resume' | 'coverletter'): Promise<void> {
    if (db) {
      try {
        const docRef = doc(db, 'users', userId, type === 'resume' ? 'resumes' : 'coverletters', id);
        await deleteDoc(docRef);
      } catch (err) {
        console.error("Firestore delete failed:", err);
      }
    }

    // LocalStorage delete
    localStorage.removeItem(type === 'resume' ? `LOCAL_RESUME_${id}` : `LOCAL_CL_${id}`);
    
    // Update metadata list
    const metaList = await this.listDrafts(userId);
    const updated = metaList.filter(item => item.id !== id);
    localStorage.setItem(`LOCAL_META_${userId}`, JSON.stringify(updated));
  },

  async renameDraft(
    userId: string,
    id: string,
    type: 'resume' | 'coverletter',
    newTitle: string
  ): Promise<void> {
    if (type === 'resume') {
      const resume = await this.getResume(userId, id);
      if (resume) {
        resume.title = newTitle;
        await this.saveResume(userId, id, resume);
      }
    } else {
      const cl = await this.getCoverLetter(userId, id);
      if (cl) {
        cl.title = newTitle;
        await this.saveCoverLetter(userId, id, cl);
      }
    }
  },

  async updateLocalMetadataList(
    userId: string, 
    id: string, 
    type: 'resume' | 'coverletter', 
    title: string, 
    updatedAt: number
  ): Promise<void> {
    const localMetaRaw = localStorage.getItem(`LOCAL_META_${userId}`);
    let list: DocumentMetadata[] = [];
    if (localMetaRaw) {
      try {
        list = JSON.parse(localMetaRaw);
      } catch {
        list = [];
      }
    }
    const idx = list.findIndex(item => item.id === id);
    if (idx >= 0) {
      list[idx] = { id, type, title, updatedAt };
    } else {
      list.push({ id, type, title, updatedAt });
    }
    localStorage.setItem(`LOCAL_META_${userId}`, JSON.stringify(list));
  }
};
