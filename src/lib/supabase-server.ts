import { adminAuth, adminDb } from './firebase-server';
import { cookies } from 'next/headers';
import * as admin from 'firebase-admin';

class ServerQueryBuilder {
  private tableName: string;
  private filters: Array<{ field: string; op: string; value: any }> = [];
  private orderByField: string | null = null;
  private orderDirection: 'asc' | 'desc' = 'asc';
  private limitCount: number | null = null;
  private isSingle: boolean = false;
  private isMaybeSingle: boolean = false;
  private isDelete: boolean = false;
  private updateData: any = null;
  private insertData: any = null;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(columns?: string) {
    return this;
  }

  eq(field: string, value: any) {
    this.filters.push({ field, op: '==', value });
    return this;
  }

  lt(field: string, value: any) {
    this.filters.push({ field, op: '<', value });
    return this;
  }

  order(field: string, options?: { ascending: boolean }) {
    this.orderByField = field;
    this.orderDirection = options?.ascending === false ? 'desc' : 'asc';
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isMaybeSingle = true;
    return this;
  }

  insert(data: any | any[]) {
    this.insertData = Array.isArray(data) ? data : [data];
    return this;
  }

  update(data: any) {
    this.updateData = data;
    return this;
  }

  delete() {
    this.isDelete = true;
    return this;
  }

  async then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    try {
      const res = await this.execute();
      if (onfulfilled) return onfulfilled(res);
      return res;
    } catch (err) {
      if (onrejected) return onrejected(err);
      throw err;
    }
  }

  private async execute() {
    try {
      const colRef = adminDb.collection(this.tableName);

      if (this.isDelete) {
        let q = colRef;
        for (const f of this.filters) {
          q = q.where(f.field, f.op, f.value);
        }
        const snapshot = await q.get();
        const batch = adminDb.batch();
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        return { data: null, error: null };
      }

      if (this.updateData) {
        let q = colRef;
        for (const f of this.filters) {
          q = q.where(f.field, f.op, f.value);
        }
        const snapshot = await q.get();
        const batch = adminDb.batch();
        snapshot.docs.forEach(doc => batch.update(doc.ref, this.updateData));
        await batch.commit();
        return { data: null, error: null };
      }

      if (this.insertData) {
        const added = [];
        for (const item of this.insertData) {
          const payload = { ...item };

          // Map created_at if present
          if (payload.created_at) {
            payload.created_at = typeof payload.created_at === 'string'
              ? admin.firestore.Timestamp.fromDate(new Date(payload.created_at))
              : payload.created_at;
          }

          if (payload.id) {
            const docRef = colRef.doc(payload.id.toString());
            await docRef.set(payload);
            added.push(payload);
          } else {
            const docRef = colRef.doc();
            const dataWithId = { id: docRef.id, ...payload };
            await docRef.set(dataWithId);
            added.push(dataWithId);
          }
        }
        return { data: Array.isArray(this.insertData) ? added : added[0], error: null };
      }

      // Select query
      let q = colRef;
      for (const f of this.filters) {
        q = q.where(f.field, f.op, f.value);
      }

      if (this.orderByField) {
        q = q.orderBy(this.orderByField, this.orderDirection);
      }

      if (this.limitCount) {
        q = q.limit(this.limitCount);
      }

      const snapshot = await q.get();
      const results = snapshot.docs.map(doc => {
        const data = doc.data();
        const formatted: any = { id: doc.id };
        for (const [k, v] of Object.entries(data)) {
          if (v && typeof v === 'object' && (v as any).toDate) {
            formatted[k] = (v as any).toDate().toISOString();
          } else {
            formatted[k] = v;
          }
        }
        return formatted;
      });

      if (this.isSingle) {
        if (results.length === 0) return { data: null, error: new Error('Document not found') };
        return { data: results[0], error: null };
      }

      if (this.isMaybeSingle) {
        return { data: results.length > 0 ? results[0] : null, error: null };
      }

      return { data: results, error: null };
    } catch (err: any) {
      console.error(`ServerQueryBuilder Error (${this.tableName}):`, err);
      return { data: null, error: err };
    }
  }
}

export async function createClient() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('bizdive-session')?.value;

  return {
    auth: {
      async getUser() {
        if (!sessionCookie) {
          return { data: { user: null }, error: null };
        }
        try {
          const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
          return {
            data: {
              user: {
                id: decodedClaims.uid,
                email: decodedClaims.email,
                user_metadata: { full_name: decodedClaims.name },
              }
            },
            error: null
          };
        } catch (err: any) {
          console.warn('Firebase session cookie verification failed:', err.message);
          return { data: { user: null }, error: err };
        }
      },
      async signOut() {
        // Sign out is done on client side, but mock it just in case
        return { error: null };
      }
    },
    from(tableName: string) {
      return new ServerQueryBuilder(tableName);
    }
  };
}
