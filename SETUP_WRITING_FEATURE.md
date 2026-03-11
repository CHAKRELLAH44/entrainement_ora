# 🔧 Comment fixer l'erreur de colonne manquante

## ❌ Erreur reçue
```
"Could not find the 'text' column of 'sessions' in the schema cache"
```

## ✅ Solution

La table `sessions` dans Supabase n'a pas la colonne `text` (et possiblement `correction`).

### Option 1: Exécuter via Supabase SQL Editor (Recommandé)

1. Va sur [supabase.com](https://supabase.com) → Ton projet
2. Clique sur **"SQL Editor"** (en bas à gauche)
3. Clique sur **"+ New Query"**
4. Copie-colle le contenu de `supabase/migrations/add_writing_columns.sql`
5. Clique sur **"Run"** (ou Ctrl+Enter)

### Option 2: Via Table Editor

1. Va sur **"Table Editor"**
2. Clique sur la table **"sessions"**
3. Clique sur le bouton **"+"** pour ajouter une colonne
4. Ajoute ces colonnes :
   - **Colonne 1**: `text` (Type: `text`, Nullable: ✓)
   - **Colonne 2**: `correction` (Type: `text`, Nullable: ✓)

### Option 3: SQL Direct

Copie et exécute dans la console SQL Supabase :

```sql
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS text TEXT;

ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS correction TEXT;
```

---

## ✅ Vérifier que ça marche

Après avoir exécuté la migration, tu devrais voir :

```
column_name | data_type | is_nullable
------------|-----------|-------------
id          | uuid      | NO
date        | text      | YES
topic       | text      | YES
note        | integer   | YES
audio_url   | text      | YES
text        | text      | YES  ← ✅ NOUVEAU
timestamp   | bigint    | YES
user_nickname | text    | YES
correction  | text      | YES  ← ✅ NOUVEAU
```

---

## 🚀 Ensuite

1. **Redémarre le serveur** : `npm run dev`
2. **Fais une session d'écriture** complète
3. **Vérifie** que tout s'affiche correctement