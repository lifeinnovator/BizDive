import { auth as firebaseAuth, db as firebaseDb } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { 
  collection, doc, getDoc, getDocs, query, where, orderBy, limit, 
  addDoc, setDoc, deleteDoc, updateDoc, Timestamp 
} from 'firebase/firestore';

export type MockQueryData = any[] & { [key: string]: any };

class ClientQueryBuilder {
  private tableName: string;
  private filters: Array<{ field: string; op: any; value: any }> = [];
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
      const colRef = collection(firebaseDb, this.tableName);

      if (this.isDelete) {
        let qRef = query(colRef);
        for (const f of this.filters) {
          qRef = query(qRef, where(f.field, f.op, f.value));
        }
        const snap = await getDocs(qRef);
        for (const d of snap.docs) {
          await deleteDoc(d.ref);
        }
        return { data: null, count: null, error: null };
      }

      if (this.updateData) {
        let qRef = query(colRef);
        for (const f of this.filters) {
          qRef = query(qRef, where(f.field, f.op, f.value));
        }
        const snap = await getDocs(qRef);
        for (const d of snap.docs) {
          await updateDoc(d.ref, this.updateData);
        }
        return { data: null, count: null, error: null };
      }

      if (this.insertData) {
        const added = [];
        for (const item of this.insertData) {
          const payload = { ...item };
          
          if (payload.created_at) {
            payload.created_at = typeof payload.created_at === 'string' 
              ? Timestamp.fromDate(new Date(payload.created_at)) 
              : payload.created_at;
          }

          if (payload.id) {
            const docRef = doc(firebaseDb, this.tableName, payload.id.toString());
            await setDoc(docRef, payload);
            added.push(payload);
          } else {
            const docRef = doc(colRef);
            const dataWithId = { id: docRef.id, ...payload };
            await setDoc(docRef, dataWithId);
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
              ? Timestamp.fromDate(new Date(payload.created_at)) 
              : payload.created_at;
          }
          if (payload.updated_at) {
            payload.updated_at = typeof payload.updated_at === 'string' 
              ? Timestamp.fromDate(new Date(payload.updated_at)) 
              : payload.updated_at;
          }

          if (payload.id) {
            const docRef = doc(firebaseDb, this.tableName, payload.id.toString());
            await setDoc(docRef, payload, { merge: true });
            upserted.push(payload);
          } else {
            const docRef = doc(colRef);
            const dataWithId = { id: docRef.id, ...payload };
            await setDoc(docRef, dataWithId, { merge: true });
            upserted.push(dataWithId);
          }
        }
        return { data: Array.isArray(this.upsertData) ? upserted : upserted[0], count: null, error: null };
      }

      // Check if we are querying a single document by its document ID field ('id')
      const idFilter = this.filters.find(f => f.field === 'id' && f.op === '==');
      
      let results: any[] = [];
      let totalCount = 0;

      if (idFilter) {
        const docRef = doc(firebaseDb, this.tableName, idFilter.value.toString());
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const formatted: any = { id: docSnap.id };
          for (const [k, v] of Object.entries(data)) {
            if (v && typeof v === 'object' && (v as any).toDate) {
              formatted[k] = (v as any).toDate().toISOString();
            } else {
              formatted[k] = v;
            }
          }
          results.push(formatted);
          totalCount = 1;
        }
      } else {
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
        let qRef = query(colRef);
        for (const f of firestoreFilters) {
          qRef = query(qRef, where(f.field, f.op, f.value));
        }

        if (this.orderByField && !useMemorySortLimit) {
          qRef = query(qRef, orderBy(this.orderByField, this.orderDirection));
        }

        if (this.limitCount !== null && !useMemorySortLimit) {
          qRef = query(qRef, limit(this.limitCount));
        }

        const snap = await getDocs(qRef);
        results = snap.docs.map(d => {
          const data = d.data();
          const formatted: any = { id: d.id };
          for (const [k, v] of Object.entries(data)) {
            if (v && typeof v === 'object' && (v as any).toDate) {
              formatted[k] = (v as any).toDate().toISOString();
            } else {
              formatted[k] = v;
            }
          }
          return formatted;
        });
        totalCount = results.length;
      }

      // Separate common utility function to convert dates
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

      // Apply In-Memory filters (if any, excluding 'id' filter which is already applied)
      const inMemoryFilters = this.filters.filter(f => f.op !== '==' || (idFilter && f.field !== 'id'));
      if (inMemoryFilters.length > 0 && results.length > 0) {
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
      const hasInMemoryFilters = inMemoryFilters.length > 0;
      const firestoreFilters = this.filters.filter(f => f.op === '==');
      const hasFirestoreFilters = firestoreFilters.length > 0;
      const useMemorySortLimit = hasInMemoryFilters || hasFirestoreFilters || idFilter !== undefined;

      if (useMemorySortLimit && this.orderByField && results.length > 0) {
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
      if (useMemorySortLimit && this.limitCount !== null) {
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
      console.error(`ClientQueryBuilder Error (${this.tableName}):`, err);
      return { data: null, count: null, error: err };
    }
  }
}

export const createClient = () => {
  return {
    auth: {
      async getUser() {
        const firebaseUser = firebaseAuth.currentUser;
        if (!firebaseUser) return { data: { user: null }, error: null };
        return {
          data: {
            user: {
              id: firebaseUser.uid,
              email: firebaseUser.email,
              user_metadata: { full_name: firebaseUser.displayName },
            }
          },
          error: null
        };
      },
      async getSession() {
        const firebaseUser = firebaseAuth.currentUser;
        if (!firebaseUser) return { data: { session: null }, error: null };
        return {
          data: {
            session: {
              user: {
                id: firebaseUser.uid,
                email: firebaseUser.email,
                user_metadata: { full_name: firebaseUser.displayName },
              }
            }
          },
          error: null
        };
      },
      async signInWithPassword({ email, password }: any) {
        try {
          const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
          const idToken = await userCredential.user.getIdToken();
          
          await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          });

          return {
            data: {
              user: {
                id: userCredential.user.uid,
                email: userCredential.user.email,
              }
            },
            error: null
          };
        } catch (err: any) {
          return { data: { user: null }, error: err };
        }
      },
      async signUp({ email, password, options }: any) {
        try {
          const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
          const idToken = await userCredential.user.getIdToken();

          await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          });

          return {
            data: {
              user: {
                id: userCredential.user.uid,
                email: userCredential.user.email,
              }
            },
            error: null
          };
        } catch (err: any) {
          return { data: { user: null }, error: err };
        }
      },
      async signOut() {
        try {
          await firebaseSignOut(firebaseAuth);
          await fetch('/api/auth/logout', { method: 'POST' });
          return { error: null };
        } catch (err: any) {
          return { error: err };
        }
      },
      async resetPasswordForEmail(email: string) {
        try {
          const { sendPasswordResetEmail } = await import('firebase/auth');
          await sendPasswordResetEmail(firebaseAuth, email);
          return { data: {}, error: null };
        } catch (err: any) {
          return { data: null, error: err };
        }
      }
    },
    from(tableName: string, ...args: any[]) {
      return new ClientQueryBuilder(tableName);
    }
  };
};
