import { adminAuth, adminDb } from './firebase-server';
import { cookies } from 'next/headers';
import * as admin from 'firebase-admin';

export type MockQueryData = any[] & { [key: string]: any };

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
  private upsertData: any = null;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(columns?: string, options?: any) {
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

  in(field: string, values: any[]) {
    this.filters.push({ field, op: 'in', value: values });
    return this;
  }

  is(field: string, value: any) {
    this.filters.push({ field, op: '==', value });
    return this;
  }

  not(field: string, op: string, value: any) {
    let mappedOp: any = '!=';
    if (op === 'is' && value === null) {
      mappedOp = '!=';
    }
    this.filters.push({ field, op: mappedOp, value });
    return this;
  }

  filter(field: string, op: string, value: any) {
    let mappedOp: any = '==';
    if (op === 'eq') mappedOp = '==';
    else if (op === 'neq') mappedOp = '!=';
    else if (op === 'lt') mappedOp = '<';
    else if (op === 'lte') mappedOp = '<=';
    else if (op === 'gt') mappedOp = '>';
    else if (op === 'gte') mappedOp = '>=';
    
    this.filters.push({ field, op: mappedOp, value });
    return this;
  }

  order(field: string, options?: any) {
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

  upsert(data: any | any[]) {
    this.upsertData = Array.isArray(data) ? data : [data];
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

  async then<TResult = { data: MockQueryData | null; count: number | null; error: any }>(
    onfulfilled?: (value: { data: MockQueryData | null; count: number | null; error: any }) => TResult | PromiseLike<TResult>,
    onrejected?: (reason: any) => any
  ): Promise<TResult> {
    try {
      const res = await this.execute();
      if (onfulfilled) return onfulfilled(res as any);
      return res as any;
    } catch (err) {
      if (onrejected) return onrejected(err);
      throw err;
    }
  }

  private async execute(): Promise<{ data: MockQueryData | null; count: number | null; error: any }> {
    try {
      const colRef = adminDb.collection(this.tableName);

      if (this.isDelete) {
        let q = colRef;
        for (const f of this.filters) {
          q = q.where(f.field, f.op, f.value);
        }
        const snapshot = await q.get();
        const batch = adminDb.batch();
        snapshot.docs.forEach((doc: any) => batch.delete(doc.ref));
        await batch.commit();
        return { data: null, count: null, error: null };
      }

      if (this.updateData) {
        let q = colRef;
        for (const f of this.filters) {
          q = q.where(f.field, f.op, f.value);
        }
        const snapshot = await q.get();
        const batch = adminDb.batch();
        snapshot.docs.forEach((doc: any) => batch.update(doc.ref, this.updateData));
        await batch.commit();
        return { data: null, count: null, error: null };
      }

      if (this.insertData) {
        const added = [];
        for (const item of this.insertData) {
          const payload = { ...item };

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
        return { data: Array.isArray(this.insertData) ? added : added[0], count: null, error: null };
      }

      if (this.upsertData) {
        const upserted = [];
        for (const item of this.upsertData) {
          const payload = { ...item };

          if (payload.created_at) {
            payload.created_at = typeof payload.created_at === 'string'
              ? admin.firestore.Timestamp.fromDate(new Date(payload.created_at))
              : payload.created_at;
          }
          if (payload.updated_at) {
            payload.updated_at = typeof payload.updated_at === 'string'
              ? admin.firestore.Timestamp.fromDate(new Date(payload.updated_at))
              : payload.updated_at;
          }

          if (payload.id) {
            const docRef = colRef.doc(payload.id.toString());
            await docRef.set(payload, { merge: true });
            upserted.push(payload);
          } else {
            const docRef = colRef.doc();
            const dataWithId = { id: docRef.id, ...payload };
            await docRef.set(dataWithId, { merge: true });
            upserted.push(dataWithId);
          }
        }
        return { data: Array.isArray(this.upsertData) ? upserted : upserted[0], count: null, error: null };
      }

      // Check for empty 'in' query to avoid Firestore exception
      const hasEmptyInFilter = this.filters.some(f => f.op === 'in' && Array.isArray(f.value) && f.value.length === 0);
      if (hasEmptyInFilter) {
        return { data: [], count: 0, error: null };
      }

      // Separate filters for Firestore vs In-Memory to avoid missing index errors.
      // Firestore can execute multiple equality (==) filters using index merging, but
      // combining them with inequality or sorting strictly requires composite indexes.
      const firestoreFilters = this.filters.filter(f => f.op === '==');
      const inMemoryFilters = this.filters.filter(f => f.op !== '==');
      
      const hasInMemoryFilters = inMemoryFilters.length > 0;
      const hasFirestoreFilters = firestoreFilters.length > 0;
      const useMemorySortLimit = hasInMemoryFilters || hasFirestoreFilters;

      // Select query
      let q = colRef;
      for (const f of firestoreFilters) {
        q = q.where(f.field, f.op, f.value);
      }

      if (this.orderByField && !useMemorySortLimit) {
        q = q.orderBy(this.orderByField, this.orderDirection);
      }

      if (this.limitCount && !useMemorySortLimit) {
        q = q.limit(this.limitCount);
      }

      const snapshot = await q.get();
      let results = snapshot.docs.map((doc: any) => {
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

      // Apply In-Memory filters
      if (hasInMemoryFilters && results.length > 0) {
        const getComparable = (val: any) => {
          if (val === null || val === undefined) return val;
          if (typeof val === 'object') {
            if (typeof val.toDate === 'function') {
              return val.toDate().getTime();
            }
            if (val instanceof Date) {
              return val.getTime();
            }
          }
          if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val)) {
            return new Date(val).getTime();
          }
          return val;
        };

        results = results.filter((doc: any) => {
          for (const f of inMemoryFilters) {
            const docVal = getComparable(doc[f.field]);
            const filterVal = getComparable(f.value);

            if (f.op === '<') {
              if (!(docVal < filterVal)) return false;
            } else if (f.op === '<=') {
              if (!(docVal <= filterVal)) return false;
            } else if (f.op === '>') {
              if (!(docVal > filterVal)) return false;
            } else if (f.op === '>=') {
              if (!(docVal >= filterVal)) return false;
            } else if (f.op === '!=') {
              if (docVal === filterVal) return false;
            } else if (f.op === 'in') {
              if (!Array.isArray(f.value)) return false;
              const mappedArray = f.value.map(getComparable);
              if (!mappedArray.includes(docVal)) return false;
            }
          }
          return true;
        });
      }

      // Apply In-Memory sorting
      if (useMemorySortLimit && this.orderByField && results.length > 0) {
        const getComparable = (val: any) => {
          if (val === null || val === undefined) return val;
          if (typeof val === 'object') {
            if (typeof val.toDate === 'function') {
              return val.toDate().getTime();
            }
            if (val instanceof Date) {
              return val.getTime();
            }
          }
          if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val)) {
            return new Date(val).getTime();
          }
          return val;
        };

        results.sort((a, b) => {
          const valA = getComparable(a[this.orderByField!]);
          const valB = getComparable(b[this.orderByField!]);
          
          if (valA === undefined || valA === null) return 1;
          if (valB === undefined || valB === null) return -1;
          
          if (valA < valB) return this.orderDirection === 'asc' ? -1 : 1;
          if (valA > valB) return this.orderDirection === 'asc' ? 1 : -1;
          return 0;
        });
      }

      // Apply In-Memory limiting
      if (useMemorySortLimit && this.limitCount) {
        results = results.slice(0, this.limitCount);
      }

      if (this.isSingle) {
        if (results.length === 0) return { data: null, count: null, error: new Error('Document not found') };
        return { data: results[0], count: 1, error: null };
      }

      if (this.isMaybeSingle) {
        return { data: results.length > 0 ? results[0] : null, count: results.length > 0 ? 1 : 0, error: null };
      }

      return { data: results, count: results.length, error: null };
    } catch (err: any) {
      console.error(`ServerQueryBuilder Error (${this.tableName}):`, err);
      return { data: null, count: null, error: err };
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
        return { error: null };
      }
    },
    from(tableName: string, ...args: any[]) {
      return new ServerQueryBuilder(tableName);
    }
  };
}
