# Brutus : de donnée brute à lead en or

Mini-jeu web en français. Tu incarnes **Brutus**, une donnée brute tombée dans le CRM, qui doit devenir assez propre pour faire sauter de joie le commercial.

## Les 9 étapes
🧭 Source · 🚿 Nettoyage des caractères spéciaux · 💇 Mise en forme · 📧 E-mail · 📞 Indicatif · 🎩 Civilité · 👯 Doublons · 🛡️ Consentement · 🔀 Aiguillage vers le bon commercial

À chaque étape, Brutus évolue visuellement (douche, coiffure, téléphone, nœud papillon, badge de source, bouclier…) jusqu'au **lead en or** 👑.

## Contenu
- 10 niveaux progressifs (difficulté 1 → 3, chrono sur les derniers, boss final)
- Mode Rush (90 s, débloqué au niveau 4)
- Étoiles, combos, records, 10 succès
- Écran de fin « avant / après » + partage LinkedIn (texte copié automatiquement)
- Sauvegarde locale (localStorage), responsive mobile, sons Web Audio (coupables)

## Technique
Un seul fichier `index.html`, sans dépendance ni build. `og.png` sert d'aperçu pour LinkedIn.

```bash
npx -y http-server -p 3037 -c-1
```
