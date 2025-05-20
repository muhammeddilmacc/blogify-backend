import { db } from '../../utils/config';
import { Post } from '../../models/Post';

async function updatePosts() {
  try {
    const postsRef = db.collection('posts');
    const snapshot = await postsRef.get();

    const batch = db.batch();
    let updateCount = 0;

    for (const doc of snapshot.docs) {
      const post = doc.data();
      
      batch.update(doc.ref, {
        shareCount: post.shared || 0,
        totalViewDuration: 0,
        lastViewedAt: null
      });

      updateCount++;
    }

    await batch.commit();
    console.log(`${updateCount} post başarıyla güncellendi.`);
  } catch (error) {
    console.error('Migration hatası:', error);
    process.exit(1);
  }
}

// Migration'ı çalıştır
updatePosts().then(() => {
  console.log('Migration tamamlandı.');
  process.exit(0);
}); 