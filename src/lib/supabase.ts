import { auth as firebaseAuth, db as firebaseDb } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { 
  collection, doc, getDoc, getDocs, query, where, orderBy, limit, 
  addDoc, setDoc, deleteDoc, updateDoc, Timestamp 
} from 'firebase/firestore';

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
        return { data: null, error: null };
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
        return { data: null, error: null };
      }

      if (this.insertData) {
        const added = [];
        for (const item of this.insertData) {
          const payload = { ...item };
          
          // Map created_at if present
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
        return { data: Array.isArray(this.insertData) ? added : added[0], error: null };
      }

      // Select query
      let qRef = query(colRef);
      for (const f of this.filters) {
        qRef = query(qRef, where(f.field, f.op, f.value));
      }

      if (this.orderByField) {
        qRef = query(qRef, orderBy(this.orderByField, this.orderDirection));
      }

      if (this.limitCount) {
        qRef = query(qRef, limit(this.limitCount));
      }

      const snap = await getDocs(qRef);
      const results = snap.docs.map(d => {
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

      if (this.isSingle) {
        if (results.length === 0) return { data: null, error: new Error('Document not found') };
        return { data: results[0], error: null };
      }

      if (this.isMaybeSingle) {
        return { data: results.length > 0 ? results[0] : null, error: null };
      }

      return { data: results, error: null };
    } catch (err: any) {
      console.error(`ClientQueryBuilder Error (${this.tableName}):`, err);
      return { data: null, error: err };
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
      async signInWithPassword({ email, password }: any) {
        try {
          const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
          const idToken = await userCredential.user.getIdToken();
          
          // Set session cookie on Next.js server
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

          // Set session cookie on Next.js server
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
    from(tableName: string) {
      return new ClientQueryBuilder(tableName);
    }
  };
};
