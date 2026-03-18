# ⚠️ Fix: Erreur 403 Supabase - Permission Denied

## Problème
Vous recevez l'erreur : **"Erreur lors de la sauvegarde. Réessaye."** avec code **403 permission error** ou erreur vide `{}`.

Cela signifie que Supabase bloque l'accès à la table `expression_sessions` à cause des **Row Level Security (RLS)**.

---

## 🔍 Diagnostic Rapide

Avant de commencer, vérifiez que tout fonctionne:

### Option 1: Depuis la Console JS (F12)
Tapez dans la console :
```javascript
// Lance le diagnostic
const { diagnoseExpressionTable } = await import('/src/lib/storage.ts');
await diagnoseExpressionTable();
```

### Option 2: Depuis Supabase Dashboard
1. Allez dans **SQL Editor**
2. Exécutez :
```sql
-- Vérifie que la table existe
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'expression_sessions'
);

-- Affiche tous les enregistrements
SELECT * FROM expression_sessions LIMIT 5;
```

---

## ✅ Solution Complète

### Étape 1 : Créer la Table (si elle n'existe pas)

Dans Supabase **SQL Editor**, exécutez :

```sql
CREATE TABLE IF NOT EXISTS expression_sessions (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  media_id TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('video', 'image')),
  media_url TEXT NOT NULL,
  audio_url TEXT,
  text TEXT,
  correction TEXT,
  timestamp BIGINT NOT NULL,
  user_nickname TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT user_exists FOREIGN KEY (user_nickname) REFERENCES sessions(user_nickname) ON DELETE CASCADE
);

-- Créer les index
CREATE INDEX IF NOT EXISTS idx_expression_sessions_user ON expression_sessions(user_nickname);
CREATE INDEX IF NOT EXISTS idx_expression_sessions_timestamp ON expression_sessions(timestamp);

-- ✅ IMPORTANT: Supprimer les anciennes policies (s'il y en a)
DROP POLICY IF EXISTS insert_expression_sessions ON expression_sessions;
DROP POLICY IF EXISTS select_expression_sessions ON expression_sessions;
DROP POLICY IF EXISTS update_expression_sessions ON expression_sessions;
DROP POLICY IF EXISTS delete_expression_sessions ON expression_sessions;

-- Désactiver puis réactiver RLS
ALTER TABLE expression_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE expression_sessions ENABLE ROW LEVEL SECURITY;
```

### Étape 2 : Ajouter les RLS Policies (IMPORTANT!)

Toujours dans **SQL Editor**, exécutez :

```sql
-- 🔓 IMPORTANT: Autoriser accès ANON (pas d'authentification requise)
-- L'app gère elle-même le contrôle d'accès via user_nickname

-- Politique 1: Permettre INSERT
CREATE POLICY "Allow INSERT for all" ON expression_sessions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Politique 2: Permettre SELECT
CREATE POLICY "Allow SELECT for all" ON expression_sessions
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Politique 3: Permettre UPDATE
CREATE POLICY "Allow UPDATE for all" ON expression_sessions
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Politique 4: Permettre DELETE
CREATE POLICY "Allow DELETE for all" ON expression_sessions
  FOR DELETE
  TO anon, authenticated
  USING (true);
```

### Étape 3 : Vérifier que tout est OK

Exécutez dans **SQL Editor** :

```sql
-- ✅ Vérifier les policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'expression_sessions'
ORDER BY policyname;

-- ✅ Vérifier que RLS est activé
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'expression_sessions';

-- ✅ Test: Insérer un enregistrement test
INSERT INTO expression_sessions (
  id, date, media_id, media_type, media_url, 
  timestamp, user_nickname
) VALUES (
  'test-' || NOW()::text,
  NOW()::date::text,
  'test-media',
  'image',
  'https://example.com/test.jpg',
  EXTRACT(EPOCH FROM NOW())::BIGINT * 1000,
  'test_user'
);

-- ✅ Vérifier que le test a été inséré
SELECT * FROM expression_sessions WHERE user_nickname = 'test_user';

-- ✅ Nettoyer le test
DELETE FROM expression_sessions WHERE user_nickname = 'test_user';
```

### Étape 4 : Rechercher les Autres Policies (Bug Common)

Il y a parfois des **policies orphelines** qui bloquent. Nettoyez-les :

```sql
-- Afficher TOUTES les policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles
FROM pg_policies
WHERE tablename = 'expression_sessions';

-- Si vous voyez des policies avec des noms bizarres, supprimez-les :
-- DROP POLICY "nom_de_la_policy" ON expression_sessions;
```

---

## 🧪 Test Complet

1. **Après les changements Supabase**, rechargez l'app
2. Testez une session d'expression : **Mode parlé**
3. Cliquez **"Valider"**
4. Vous devriez voir dans la console :
   ```
   ✅ [saveExpressionSession] Insertion réussie: { id: "expr-..." }
   ```

---

## 🔴 Si ça ne marche toujours pas

### 1. Vérifier les Logs Supabase
- Dashboard → **Logs** → **API Requests**
- Cherchez les requêtes POST à `/expression_sessions`
- Notez le code d'erreur exact

### 2. Vérifier avec cURL (CLI)

Si vous avez la CLI Supabase configurée :

```bash
# Test de lecture
curl -X GET \
  'https://YOUR_PROJECT.supabase.co/rest/v1/expression_sessions?limit=1' \
  -H 'apikey: YOUR_ANON_KEY' \
  -H 'Authorization: Bearer YOUR_ANON_KEY'

# Test d'insertion
curl -X POST \
  'https://YOUR_PROJECT.supabase.co/rest/v1/expression_sessions' \
  -H 'apikey: YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "id": "test-'$(date +%s)'",
    "date": "'$(date +%d/%m/%Y)'",
    "media_id": "test",
    "media_type": "image",
    "media_url": "https://example.com/test.jpg",
    "timestamp": '$(date +%s)'000,
    "user_nickname": "test_user"
  }'
```

Remplacez `YOUR_PROJECT`, `YOUR_ANON_KEY` par vos vraies valeurs (trouvables dans Supabase → Settings → API).

### 3. Réinitialiser la Table Complètement

Si rien ne marche, réinitialisez complètement :

```sql
-- ⚠️ ATTENTION: Cela supprime la table et tous ses données!

-- Supprimer la table
DROP TABLE IF EXISTS expression_sessions CASCADE;

-- Recréer avec tout
CREATE TABLE expression_sessions (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  media_id TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('video', 'image')),
  media_url TEXT NOT NULL,
  audio_url TEXT,
  text TEXT,
  correction TEXT,
  timestamp BIGINT NOT NULL,
  user_nickname TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Créer les index
CREATE INDEX idx_expression_sessions_user ON expression_sessions(user_nickname);
CREATE INDEX idx_expression_sessions_timestamp ON expression_sessions(timestamp);

-- Activer RLS et ajouter policies
ALTER TABLE expression_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON expression_sessions
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
```

---

## 📋 Checklist Finale

- ✅ Table `expression_sessions` existe
- ✅ RLS est **activé** sur la table
- ✅ 4 policies existent (INSERT, SELECT, UPDATE, DELETE)
- ✅ Policies autorisent `anon, authenticated`
- ✅ `WITH CHECK (true)` et `USING (true)` sont présents
- ✅ Pas de policies en conflit ou orphelines
- ✅ Test SQL d'insertion réussit

Une fois tout ✅, relancez l'app!

---

## 🆘 Besoin d'Aide?

Si ça ne marche toujours pas:
1. Prenez une **screenshot** du SQL Editor
2. Ouvrez la **console du navigateur** (F12)
3. Recopiez le message d'erreur complet
4. Cherchez dans les **Logs Supabase** → **API Requests**

