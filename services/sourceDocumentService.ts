import {
  Bytes,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebaseClient';
import { SourceDocument } from '../types';

const CHUNK_SIZE = 700 * 1024;
const MAX_SOURCE_SIZE = 15 * 1024 * 1024;

const sourcePath = (userId: string, resumeId: string, sourceId: string) =>
  `users/${userId}/resumes/${resumeId}/sourceFiles/${sourceId}`;

export const sourceDocumentService = {
  async upload(userId: string, resumeId: string, file: File): Promise<SourceDocument> {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error('SOURCE_MUST_BE_PDF');
    }
    if (file.size > MAX_SOURCE_SIZE) {
      throw new Error('SOURCE_TOO_LARGE');
    }

    const sourceId = crypto.randomUUID();
    const storagePath = sourcePath(userId, resumeId, sourceId);
    const bytes = new Uint8Array(await file.arrayBuffer());
    const chunkCount = Math.ceil(bytes.length / CHUNK_SIZE);
    let uploadedChunks = 0;

    try {
      while (uploadedChunks < chunkCount) {
        const batch = writeBatch(db);
        const batchEnd = Math.min(chunkCount, uploadedChunks + 10);
        for (let index = uploadedChunks; index < batchEnd; index += 1) {
          const start = index * CHUNK_SIZE;
          batch.set(doc(db, storagePath, 'chunks', String(index).padStart(4, '0')), {
            index,
            bytes: Bytes.fromUint8Array(bytes.slice(start, start + CHUNK_SIZE)),
          });
        }
        await batch.commit();
        uploadedChunks = batchEnd;
      }

      const metadataBatch = writeBatch(db);
      metadataBatch.set(doc(db, storagePath), {
        name: file.name,
        mimeType: 'application/pdf',
        size: file.size,
        chunkCount,
        createdAt: serverTimestamp(),
      });
      await metadataBatch.commit();
    } catch (error) {
      const cleanup = writeBatch(db);
      for (let index = 0; index < uploadedChunks; index += 1) {
        cleanup.delete(doc(db, storagePath, 'chunks', String(index).padStart(4, '0')));
      }
      await cleanup.commit().catch(() => undefined);
      throw error;
    }

    return {
      kind: 'pdf',
      name: file.name,
      mimeType: 'application/pdf',
      storagePath,
      chunkCount,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    };
  },

  async getBlob(document: SourceDocument): Promise<Blob> {
    const snapshots = await Promise.all(
      Array.from({ length: document.chunkCount }, (_, index) =>
        getDoc(doc(db, document.storagePath, 'chunks', String(index).padStart(4, '0'))),
      ),
    );

    const chunks = snapshots.map((snapshot, index) => {
      if (!snapshot.exists()) throw new Error(`SOURCE_CHUNK_MISSING_${index}`);
      const stored = (snapshot.data().bytes as Bytes).toUint8Array();
      const copy = new Uint8Array(stored.length);
      copy.set(stored);
      return copy.buffer;
    });
    return new Blob(chunks, { type: document.mimeType });
  },

  async remove(document: SourceDocument): Promise<void> {
    const batch = writeBatch(db);
    for (let index = 0; index < document.chunkCount; index += 1) {
      batch.delete(doc(db, document.storagePath, 'chunks', String(index).padStart(4, '0')));
    }
    await batch.commit();
    await deleteDoc(doc(db, document.storagePath));
  },
};
