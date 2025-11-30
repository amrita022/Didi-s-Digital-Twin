/**
 * Offline Storage Utility using IndexedDB
 * Stores transactions locally when offline and syncs when online
 */

const DB_NAME = 'DidiDigitalTwinDB';
const DB_VERSION = 1;
const STORE_NAME = 'offlineTransactions';

class OfflineStorage {
  constructor() {
    this.db = null;
    this.isOnline = navigator.onLine;
    this.initDB();
    this.setupOnlineListener();
  }

  /**
   * Initialize IndexedDB
   */
  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('❌ Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB initialized');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object store for transactions if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          
          // Create indexes
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
          objectStore.createIndex('synced', 'synced', { unique: false });
          objectStore.createIndex('type', 'type', { unique: false });
          
          console.log('✅ Created object store:', STORE_NAME);
        }
      };
    });
  }

  /**
   * Setup online/offline listeners
   */
  setupOnlineListener() {
    window.addEventListener('online', () => {
      console.log('🌐 Back online! Starting sync...');
      this.isOnline = true;
      this.syncOfflineData();
    });

    window.addEventListener('offline', () => {
      console.log('📴 Gone offline. Transactions will be queued.');
      this.isOnline = false;
    });
  }

  /**
   * Add transaction to offline queue
   */
  async addTransaction(transaction) {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([STORE_NAME], 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      
      const data = {
        ...transaction,
        timestamp: new Date().toISOString(),
        synced: false
      };

      const request = store.add(data);

      request.onsuccess = () => {
        console.log('💾 Transaction saved offline:', data);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('❌ Failed to save transaction:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get all unsynced transactions
   */
  async getUnsyncedTransactions() {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([STORE_NAME], 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('synced');
      
      // Use IDBKeyRange for proper key query
      const range = IDBKeyRange.only(false);
      const request = index.getAll(range);

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        console.error('❌ Failed to get unsynced transactions:', request.error);
        // Resolve with empty array instead of rejecting to prevent app crash
        resolve([]);
      };
    });
  }

  /**
   * Mark transactions as synced
   */
  async markAsSynced(ids) {
    if (!this.db) {
      await this.initDB();
    }

    const tx = this.db.transaction([STORE_NAME], 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    for (const id of ids) {
      const request = store.get(id);
      
      request.onsuccess = () => {
        const data = request.result;
        if (data) {
          data.synced = true;
          store.put(data);
        }
      };
    }

    return new Promise((resolve) => {
      tx.oncomplete = () => {
        console.log('✅ Marked transactions as synced:', ids);
        resolve();
      };
    });
  }

  /**
   * Delete synced transactions (cleanup)
   */
  async deleteSyncedTransactions() {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([STORE_NAME], 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('synced');
      const request = index.openCursor(true);

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      tx.oncomplete = () => {
        console.log('🗑️ Cleaned up synced transactions');
        resolve();
      };

      tx.onerror = () => {
        console.error('❌ Failed to delete synced transactions:', tx.error);
        reject(tx.error);
      };
    });
  }

  /**
   * Sync offline data with server
   */
  async syncOfflineData() {
    if (!this.isOnline) {
      console.log('📴 Still offline. Cannot sync.');
      return { success: false, message: 'Offline' };
    }

    try {
      const unsyncedTransactions = await this.getUnsyncedTransactions();
      
      if (unsyncedTransactions.length === 0) {
        console.log('✅ No transactions to sync');
        return { success: true, message: 'Nothing to sync' };
      }

      console.log(`🔄 Syncing ${unsyncedTransactions.length} transactions...`);

      // Call backend sync endpoint
      const response = await fetch('http://localhost:5002/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactions: unsyncedTransactions.map(t => ({
            type: t.type,
            amount: t.amount,
            category: t.category,
            description: t.description,
            date: t.timestamp
          })),
          userId: 'demo-user-123'
        })
      });

      if (!response.ok) {
        throw new Error('Sync failed: ' + response.statusText);
      }

      const result = await response.json();
      console.log('✅ Sync successful:', result);

      // Mark as synced
      const ids = unsyncedTransactions.map(t => t.id);
      await this.markAsSynced(ids);

      // Optional: Clean up old synced transactions
      await this.deleteSyncedTransactions();

      return { success: true, result };

    } catch (error) {
      console.error('❌ Sync error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get sync status
   */
  async getSyncStatus() {
    const unsyncedCount = (await this.getUnsyncedTransactions()).length;
    
    return {
      isOnline: this.isOnline,
      unsyncedCount: unsyncedCount,
      needsSync: unsyncedCount > 0
    };
  }

  /**
   * Clear all offline data
   */
  async clearAll() {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([STORE_NAME], 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('🗑️ Cleared all offline data');
        resolve();
      };

      request.onerror = () => {
        console.error('❌ Failed to clear data:', request.error);
        reject(request.error);
      };
    });
  }
}

// Create singleton instance
const offlineStorage = new OfflineStorage();

export default offlineStorage;
