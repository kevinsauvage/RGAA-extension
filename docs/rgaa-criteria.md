# RGAA 4.1.2 — Critères et tests

Source officielle : [Critères et tests](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/)

> Généré automatiquement à partir du référentiel officiel (106 critères, 4.1.2).
> Ne pas éditer manuellement — lancer `npm run docs` pour régénérer.

## 1. Images

### 1.1 — Chaque image porteuse d’information a-t-elle une alternative textuelle ?

**Couverture extension :** axe-core (certain) · Deterministic rule (likely)

**Règles :** rgaa-svg-informative, rgaa-canvas-alt

**Règles axe :** image-alt, input-image-alt, area-alt, role-img-alt, svg-img-alt, object-alt

> Informative vs decorative judgment for edge cases may need manual review.

**Tests :**

- **1.1.1** — Chaque image (balise `<img>` ou balise possédant l’attribut WAI-ARIA `role="img"`) porteuse d’information a-t-elle une alternative textuelle ?
- **1.1.2** — Chaque zone d’une image réactive (balise `<area>`) porteuse d’information a-t-elle une alternative textuelle ?
- **1.1.3** — Chaque bouton de type `image` (balise `<input>` avec l’attribut `type="image"`) a-t-il une alternative textuelle ?
- **1.1.4** — Chaque zone cliquable d’une image réactive côté serveur est-elle doublée d’un mécanisme utilisable quel que soit le dispositif de pointage utilisé et permettant d’accéder à la même destination ?
- **1.1.5** — Chaque image vectorielle (balise `<svg>`) porteuse d’information, vérifie-t-elle ces conditions ?
- **1.1.6** — Chaque image objet (balise `<object>` avec l’attribut `type="image/…"`) porteuse d’information, vérifie-t-elle une de ces conditions ?
- **1.1.7** — Chaque image embarquée (balise `<embed>` avec l’attribut `type="image/…"`) porteuse d’information, vérifie-t-elle une de ces conditions ?
- **1.1.8** — Chaque image bitmap (balise `<canvas>`) porteuse d’information, vérifie-t-elle une de ces conditions ?

### 1.2 — Chaque image de décoration est-elle correctement ignorée par les technologies d’assistance ?

**Couverture extension :** axe-core (certain) · AI deep scan (needs review)

**Règles axe :** image-redundant-alt

> Decorative intent partially AI-assessed.

**Tests :**

- **1.2.1** — Chaque image (balise `<img>`) de décoration, sans légende, vérifie-t-elle une de ces conditions ?
- **1.2.2** — Chaque zone non cliquable (balise `<area>` sans attribut `href`) de décoration, vérifie-t-elle une de ces conditions ?
- **1.2.3** — Chaque image objet (balise `<object>` avec l’attribut `type="image/…"`) de décoration, sans légende, vérifie-t-elle ces conditions ?
- **1.2.4** — Chaque image vectorielle (balise `<svg>`) de décoration, sans légende, vérifie-t-elle ces conditions ?
- **1.2.5** — Chaque image bitmap (balise `<canvas>`) de décoration, sans légende, vérifie-t-elle ces conditions ?
- **1.2.6** — Chaque image embarquée (balise `<embed>` avec l’attribut `type="image/…"`) de décoration, sans légende, vérifie-t-elle ces conditions ?

### 1.3 — Pour chaque image porteuse d’information ayant une alternative textuelle, cette alternative est-elle pertinente (hors cas particuliers) ?

**Couverture extension :** AI deep scan (needs review)

> Alt relevance requires semantic judgment.

**Tests :**

- **1.3.1** — Chaque image (balise `<img>` ou balise possédant l’attribut WAI-ARIA `role="img"`) porteuse d’information, ayant une alternative textuelle, cette alternative est-elle pertinente (hors cas particuliers) ?
- **1.3.2** — Pour chaque zone (balise `<area>`) d’une image réactive porteuse d’information, ayant une alternative textuelle, cette alternative est-elle pertinente (hors cas particuliers) ?
- **1.3.3** — Pour chaque bouton de type `image` (balise `<input>` avec l’attribut `type="image"`), ayant une alternative textuelle, cette alternative est-elle pertinente (hors cas particuliers) ?
- **1.3.4** — Pour chaque image objet (balise `<object>` avec l’attribut `type="image/…"`) porteuse d’information, ayant une alternative textuelle ou un contenu alternatif, cette alternative est-elle pertinente (hors cas particuliers) ?
- **1.3.5** — Pour chaque image embarquée (balise `<embed>` avec l’attribut `type="image/…"`) porteuse d’information, ayant une alternative textuelle ou un contenu alternatif, cette alternative est-elle pertinente (hors cas particuliers) ?
- **1.3.6** — Pour chaque image vectorielle (balise `<svg>`) porteuse d’information, ayant une alternative textuelle, cette alternative est-elle pertinente (hors cas particuliers) ?
- **1.3.7** — Pour chaque image bitmap (balise `<canvas>`) porteuse d’information, ayant une alternative textuelle ou un contenu alternatif, cette alternative est-elle pertinente (hors cas particuliers) ?
- **1.3.8** — Pour chaque image bitmap (balise `<canvas>`) porteuse d’information et ayant un contenu alternatif entre `<canvas>` et `</canvas>`, ce contenu alternatif est-il correctement restitué par les technologies d’assistance ?
- **1.3.9** — Pour chaque image porteuse d’information et ayant une alternative textuelle, l’alternative textuelle est-elle courte et concise (hors cas particuliers) ?

### 1.4 — Pour chaque image utilisée comme CAPTCHA ou comme image-test, ayant une alternative textuelle, cette alternative permet-elle d’identifier la nature et la fonction de l’image ?

**Couverture extension :** Manual audit

> CAPTCHA/test images — manual audit.

**Tests :**

- **1.4.1** — Pour chaque image (balise `<img>`) utilisée comme CAPTCHA ou comme image-test, ayant une alternative textuelle, cette alternative est-elle pertinente ?
- **1.4.2** — Pour chaque zone (balise `<area>`) d’une image réactive utilisée comme CAPTCHA ou comme image-test, ayant une alternative textuelle, cette alternative est-elle pertinente ?
- **1.4.3** — Pour chaque bouton de type image (balise `<input>` avec l’attribut `type="image"`) utilisé comme CAPTCHA ou comme image-test, ayant une alternative textuelle, cette alternative est-elle pertinente ?
- **1.4.4** — Pour chaque image objet (balise `<object>` avec l’attribut `type="image/…"`) utilisée comme CAPTCHA ou comme image-test, ayant une alternative textuelle ou un contenu alternatif, cette alternative est-elle pertinente ?
- **1.4.5** — Pour chaque image embarquée (balise `<embed>` avec l’attribut `type="image/…"`) utilisée comme CAPTCHA ou comme image-test, ayant une alternative textuelle ou un contenu alternatif, cette alternative est-elle pertinente ?
- **1.4.6** — Pour chaque image vectorielle (balise `<svg>`) utilisée comme CAPTCHA ou comme image-test, ayant une alternative textuelle, cette alternative est-elle pertinente ?
- **1.4.7** — Pour chaque image bitmap (balise `<canvas>`) utilisée comme CAPTCHA ou comme image-test, ayant une alternative textuelle ou un contenu alternatif, cette alternative est-elle pertinente ?

### 1.5 — Pour chaque image utilisée comme CAPTCHA, une solution d’accès alternatif au contenu ou à la fonction du CAPTCHA est-elle présente ?

**Couverture extension :** Manual audit

> CAPTCHA alternative mechanism — manual audit.

**Tests :**

- **1.5.1** — Chaque image (balises `<img>`, `<area>`, `<object>`, `<embed>`, `<svg>`, `<canvas>` ou possédant un attribut WAI-ARIA `role="img"`) utilisée comme CAPTCHA vérifie-t-elle une de ces conditions ?
- **1.5.2** — Chaque bouton associé à une image (balise `input` avec l’attribut `type="image"`) utilisée comme CAPTCHA vérifie-t-il une de ces conditions ?

### 1.6 — Chaque image porteuse d’information a-t-elle, si nécessaire, une description détaillée ?

**Couverture extension :** AI deep scan (needs review)

> Complex image descriptions — AI flags candidates.

**Tests :**

- **1.6.1** — Chaque image (balise `<img>`) porteuse d’information, qui nécessite une description détaillée, vérifie-t-elle une de ces conditions ?
- **1.6.2** — Chaque image objet (balise `<object>` avec l’attribut `type="image/…"`) porteuse d’information, qui nécessite une description détaillée, vérifie-t-elle une de ces conditions ?
- **1.6.3** — Chaque image embarquée (balise `<embed>`) porteuse d’information, qui nécessite une description détaillée, vérifie-t-elle une de ces conditions ?
- **1.6.4** — Chaque bouton de type image (balise `<input>` avec l’attribut `type="image"`) porteur d’information, qui nécessite une description détaillée, vérifie-t-il une de ces conditions ?
- **1.6.5** — Chaque image vectorielle (balise `<svg>`) porteuse d’information, qui nécessite une description détaillée, vérifie-t-elle une de ces conditions ?
- **1.6.6** — Pour chaque image vectorielle (balise `<svg>`) porteuse d’information, ayant une description détaillée, la référence éventuelle à la description détaillée dans l’attribut WAI-ARIA `aria-label` et la description détaillée associée par l’attribut WAI-ARIA `aria-labelledby` ou `aria-describedby` sont-elles correctement restituées par les technologies d’assistance ?
- **1.6.7** — Chaque image bitmap (balise `<canvas>`), porteuse d’information, qui nécessite une description détaillée, vérifie-t-elle une de ces conditions ?
- **1.6.8** — Pour chaque image bitmap (balise `<canvas>`) porteuse d’information, qui implémente une référence à une description détaillée adjacente, cette référence est-elle correctement restituée par les technologies d’assistance ?
- **1.6.9** — Pour chaque image (balise `<img>`, `<input>` avec l’attribut `type="image"`, `<area>`, `<object>`, `<embed>`, `<svg>`, `<canvas>`, ou possédant un attribut WAI-ARIA `role="img"`) porteuse d’information, qui est accompagnée d’une description détaillée et qui utilise un attribut WAI-ARIA `aria-describedby`, l’attribut WAI-ARIA `aria-describedby` associe-t-il la description détaillée ?
- **1.6.10** — Chaque balise possédant un attribut WAI-ARIA `role="img"` porteuse d’information, qui nécessite une description détaillée, vérifie-t-elle une de ces conditions ?

### 1.7 — Pour chaque image porteuse d’information ayant une description détaillée, cette description est-elle pertinente ?

**Couverture extension :** Manual audit

> Detailed description relevance — manual.

**Tests :**

- **1.7.1** — Chaque image (balise `<img>`) porteuse d’information, ayant une description détaillée, vérifie-t-elle ces conditions ?
- **1.7.2** — Chaque bouton de type image (balise `<input>` avec l’attribut `type="image"`) porteur d’information, ayant une description détaillée, vérifie-t-il ces conditions ?
- **1.7.3** — Chaque image objet (balise `<object>` avec l’attribut `type="image/…"`) porteuse d’information, ayant une description détaillée, vérifie-t-elle ces conditions ?
- **1.7.4** — Chaque image embarquée (balise `<embed>` avec l’attribut `type="image/…"`) porteuse d’information, ayant une description détaillée, vérifie-t-elle ces conditions ?
- **1.7.5** — Chaque image vectorielle (balise `<svg>`) porteuse d’information, ayant une description détaillée, vérifie-t-elle ces conditions ?
- **1.7.6** — Chaque image bitmap (balise `<canvas>`) porteuse d’information, ayant une description détaillée, vérifie-t-elle ces conditions ?

### 1.8 — Chaque image texte porteuse d’information, en l’absence d’un mécanisme de remplacement, doit si possible être remplacée par du texte stylé. Cette règle est-elle respectée (hors cas particuliers) ?

**Couverture extension :** Manual audit

> Text-as-image replacement — manual.

**Tests :**

- **1.8.1** — Chaque image texte (balise `<img>` ou possédant un attribut WAI-ARIA `role="img"`) porteuse d’information, en l’absence d’un mécanisme de remplacement, doit si possible être remplacée par du texte stylé. Cette règle est-elle respectée (hors cas particuliers) ?
- **1.8.2** — Chaque bouton « image texte » (balise `<input>` avec l’attribut `type="image"`) porteur d’information, en l’absence d’un mécanisme de remplacement, doit si possible être remplacé par du texte stylé. Cette règle est-elle respectée (hors cas particuliers) ?
- **1.8.3** — Chaque image texte objet (balise `<object>` avec l’attribut `type="image/…"`) porteuse d’information, en l’absence d’un mécanisme de remplacement, doit si possible être remplacée par du texte stylé. Cette règle est-elle respectée (hors cas particuliers) ?
- **1.8.4** — Chaque image texte embarquée (balise `<embed>` avec l’attribut `type="image/…"`) porteuse d’information, en l’absence d’un mécanisme de remplacement, doit si possible être remplacée par du texte stylé. Cette règle est-elle respectée (hors cas particuliers) ?
- **1.8.5** — Chaque image texte bitmap (balise `<canvas>`) porteuse d’information, en l’absence d’un mécanisme de remplacement, doit si possible être remplacée par du texte stylé. Cette règle est-elle respectée (hors cas particuliers) ?
- **1.8.6** — Chaque image texte SVG (balise `<svg>`) porteuse d’information et dont le texte n’est pas complètement structuré au moyen d’éléments `<text>`, en l’absence d’un mécanisme de remplacement, doit si possible être remplacée par du texte stylé. Cette règle est-elle respectée (hors cas particuliers) ?

### 1.9 — Chaque légende d’image est-elle, si nécessaire, correctement reliée à l’image correspondante ?

**Couverture extension :** AI deep scan (needs review)

> Figure/figcaption association — AI on markup.

**Tests :**

- **1.9.1** — Chaque image pourvue d’une légende (balise `<img>`, `<input>` avec l’attribut `type="image"` ou possédant un attribut WAI-ARIA `role="img"` associée à une légende adjacente), vérifie-t-elle, si nécessaire, ces conditions ?
- **1.9.2** — Chaque image objet pourvue d’une légende (balise `<object>` avec l’attribut `type="image/…"` associée à une légende adjacente), vérifie-t-elle, si nécessaire, ces conditions ?
- **1.9.3** — Chaque image embarquée pourvue d’une légende (balise `<embed>` associée à une légende adjacente), vérifie-t-elle, si nécessaire, ces conditions ?
- **1.9.4** — Chaque image vectorielle pourvue d’une légende (balise `<svg>` associée à une légende adjacente), vérifie-t-elle, si nécessaire, ces conditions ?
- **1.9.5** — Chaque image bitmap pourvue d’une légende (balise `<canvas>` associée à une légende adjacente), vérifie-t-elle, si nécessaire, ces conditions ?

## 2. Cadres

### 2.1 — Chaque cadre a-t-il un titre de cadre ?

**Couverture extension :** axe-core (certain)

**Règles axe :** frame-title

**Tests :**

- **2.1.1** — Chaque cadre (balise `<iframe>` ou `<frame>`) a-t-il un attribut `title` ?

### 2.2 — Pour chaque cadre ayant un titre de cadre, ce titre de cadre est-il pertinent ?

**Couverture extension :** axe-core (certain) · AI deep scan (needs review)

**Règles axe :** frame-title-unique

> Title relevance partially AI-assessed.

**Tests :**

- **2.2.1** — Pour chaque cadre (balise `<iframe>` ou `<frame>`) ayant un attribut `title`, le contenu de cet attribut est-il pertinent ?

## 3. Couleurs

### 3.1 — Dans chaque page web, l’information ne doit pas être donnée uniquement par la couleur. Cette règle est-elle respectée ?

**Couverture extension :** axe-core (certain) · Deterministic rule (likely)

**Règles :** rgaa-color-only-required

**Règles axe :** link-in-text-block

> Full “information by color only” needs manual context review.

**Tests :**

- **3.1.1** — Pour chaque mot ou ensemble de mots dont la mise en couleur est porteuse d’information, l’information ne doit pas être donnée uniquement par la couleur. Cette règle est-elle respectée ?
- **3.1.2** — Pour chaque indication de couleur donnée par un texte, l’information ne doit pas être donnée uniquement par la couleur. Cette règle est-elle respectée ?
- **3.1.3** — Pour chaque image véhiculant une information, l’information ne doit pas être donnée uniquement par la couleur. Cette règle est-elle respectée ?
- **3.1.4** — Pour chaque propriété CSS déterminant une couleur et véhiculant une information, l’information ne doit pas être donnée uniquement par la couleur. Cette règle est-elle respectée ?
- **3.1.5** — Pour chaque média temporel véhiculant une information, l’information ne doit pas être donnée uniquement par la couleur. Cette règle est-elle respectée ?
- **3.1.6** — Pour chaque média non temporel véhiculant une information, l’information ne doit pas être donnée uniquement par la couleur. Cette règle est-elle respectée ?

### 3.2 — Dans chaque page web, le contraste entre la couleur du texte et la couleur de son arrière-plan est-il suffisamment élevé (hors cas particuliers) ?

**Couverture extension :** axe-core (certain)

**Règles axe :** color-contrast

**Tests :**

- **3.2.1** — Dans chaque page web, le texte et le texte en image sans effet de graisse d’une taille restituée inférieure à 24px vérifient-ils une de ces conditions (hors cas particuliers) ?
- **3.2.2** — Dans chaque page web, le texte et le texte en image en gras d’une taille restituée inférieure à 18,5px vérifient-ils une de ces conditions (hors cas particuliers) ?
- **3.2.3** — Dans chaque page web, le texte et le texte en image sans effet de graisse d’une taille restituée supérieure ou égale à 24px vérifient-ils une de ces conditions (hors cas particuliers) ?
- **3.2.4** — Dans chaque page web, le texte et le texte en image en gras d’une taille restituée supérieure ou égale à 18,5px vérifient-ils une de ces conditions (hors cas particuliers) ?
- **3.2.5** — Dans le mécanisme qui permet d’afficher un rapport de contraste conforme, le rapport de contraste entre le texte et la couleur d’arrière-plan est-il suffisamment élevé ?

### 3.3 — Dans chaque page web, les couleurs utilisées dans les composants d’interface ou les éléments graphiques porteurs d’informations sont-elles suffisamment contrastées (hors cas particuliers) ?

**Couverture extension :** axe-core (certain)

**Règles axe :** color-contrast-enhanced

**Tests :**

- **3.3.1** — Dans chaque page web, le rapport de contraste entre les couleurs d’un composant d’interface dans ses différents états et la couleur d’arrière-plan contiguë vérifie-t-il une de ces conditions (hors cas particuliers) ?
- **3.3.2** — Dans chaque page web, le rapport de contraste des différentes couleurs composant un élément graphique, lorsqu’elles sont nécessaires à sa compréhension, et la couleur d’arrière-plan contiguë, vérifie-t-il une de ces conditions (hors cas particuliers) ?
- **3.3.3** — Dans chaque page web, le rapport de contraste des différentes couleurs contiguës entre elles d’un élément graphique, lorsqu’elles sont nécessaires à sa compréhension, vérifie-t-il une de ces conditions (hors cas particuliers) ?
- **3.3.4** — Dans le mécanisme qui permet d’afficher un rapport de contraste conforme, les couleurs du composant ou des éléments graphiques porteurs d’informations qui le composent, sont-elles suffisamment contrastées ?

## 4. Multimédia

### 4.1 — Chaque média temporel pré-enregistré a-t-il, si nécessaire, une transcription textuelle ou une audiodescription (hors cas particuliers) ?

**Couverture extension :** axe-core (certain) · AI deep scan (needs review)

**Règles axe :** audio-caption, video-caption

> Transcript presence AI; quality manual.

**Tests :**

- **4.1.1** — Chaque média temporel pré-enregistré seulement audio, vérifie-t-il, si nécessaire, l’une de ces conditions (hors cas particuliers) ?
- **4.1.2** — Chaque média temporel pré-enregistré seulement vidéo vérifie-t-il, si nécessaire, l’une de ces conditions (hors cas particuliers) ?
- **4.1.3** — Chaque média temporel synchronisé pré-enregistré vérifie-t-il, si nécessaire, une de ces conditions (hors cas particuliers) ?

### 4.2 — Pour chaque média temporel pré-enregistré ayant une transcription textuelle ou une audiodescription synchronisée, celles-ci sont-elles pertinentes (hors cas particuliers) ?

**Couverture extension :** Manual audit

> Transcript/AD relevance — manual.

**Tests :**

- **4.2.1** — Pour chaque média temporel pré-enregistré seulement audio, ayant une transcription textuelle, celle-ci est-elle pertinente (hors cas particuliers) ?
- **4.2.2** — Chaque média temporel pré-enregistré seulement vidéo vérifie-t-il une de ces conditions (hors cas particuliers) ?
- **4.2.3** — Chaque média temporel synchronisé pré-enregistré vérifie-t-il une de ces conditions (hors cas particuliers) ?

### 4.3 — Chaque média temporel synchronisé pré-enregistré a-t-il, si nécessaire, des sous-titres synchronisés (hors cas particuliers) ?

**Couverture extension :** Deterministic rule (likely)

**Règles :** rgaa-video-captions

> Checks track[kind=captions/subtitles] presence.

**Tests :**

- **4.3.1** — Chaque média temporel synchronisé pré-enregistré vérifie-t-il, si nécessaire, l’une de ces conditions (hors cas particuliers) ?
- **4.3.2** — Pour chaque média temporel synchronisé pré-enregistré possédant des sous-titres synchronisés diffusés via une balise `<track>`, la balise `<track>` possède-t-elle un attribut `kind="captions"` ?

### 4.4 — Pour chaque média temporel synchronisé pré-enregistré ayant des sous-titres synchronisés, ces sous-titres sont-ils pertinents ?

**Couverture extension :** Manual audit

> Caption relevance — manual.

**Tests :**

- **4.4.1** — Pour chaque média temporel synchronisé pré-enregistré ayant des sous-titres synchronisés, ces sous-titres sont-ils pertinents ?

### 4.5 — Chaque média temporel pré-enregistré a-t-il, si nécessaire, une audiodescription synchronisée (hors cas particuliers) ?

**Couverture extension :** Manual audit

> Audio description — manual playback.

**Tests :**

- **4.5.1** — Chaque média temporel pré-enregistré seulement vidéo vérifie-t-il, si nécessaire, une de ces conditions (hors cas particuliers) ?
- **4.5.2** — Chaque média temporel synchronisé pré-enregistré vérifie-t-il, si nécessaire, une de ces conditions (hors cas particuliers) ?

### 4.6 — Pour chaque média temporel pré-enregistré ayant une audiodescription synchronisée, celle-ci est-elle pertinente ?

**Couverture extension :** Manual audit

> AD relevance — manual.

**Tests :**

- **4.6.1** — Pour chaque média temporel pré-enregistré seulement vidéo ayant une audiodescription synchronisée, celle-ci est-elle pertinente ?
- **4.6.2** — Pour chaque média temporel synchronisé ayant une audiodescription synchronisée, celle-ci est-elle pertinente ?

### 4.7 — Chaque média temporel est-il clairement identifiable (hors cas particuliers) ?

**Couverture extension :** Manual audit

> Media identification — partial manual.

**Tests :**

- **4.7.1** — Pour chaque média temporel seulement son, seulement vidéo ou synchronisé, le contenu textuel adjacent permet-il d’identifier clairement le média temporel (hors cas particuliers) ?

### 4.8 — Chaque média non temporel a-t-il, si nécessaire, une alternative (hors cas particuliers) ?

**Couverture extension :** Manual audit

> Non-temporal media alternatives — manual.

**Tests :**

- **4.8.1** — Chaque média non temporel vérifie-t-il, si nécessaire, une de ces conditions (hors cas particuliers) ?
- **4.8.2** — Chaque média non temporel associé à une alternative vérifie-t-il une de ces conditions (hors cas particuliers) ?

### 4.9 — Pour chaque média non temporel ayant une alternative, cette alternative est-elle pertinente ?

**Couverture extension :** Manual audit

> Alternative relevance — manual.

**Tests :**

- **4.9.1** — Pour chaque média non temporel ayant une alternative, cette alternative permet-elle d’accéder au même contenu et à des fonctionnalités similaires ?

### 4.10 — Chaque son déclenché automatiquement est-il contrôlable par l’utilisateur ?

**Couverture extension :** axe-core (certain) · Deterministic rule (likely)

**Règles :** rgaa-autoplay-media

**Règles axe :** no-autoplay-audio

**Tests :**

- **4.10.1** — Chaque séquence sonore déclenchée automatiquement via une balise `<object>`, `<video>`, `<audio>`, `<embed>`, `<bgsound>` ou un code JavaScript vérifie-t-elle une de ces conditions ?

### 4.11 — La consultation de chaque média temporel est-elle, si nécessaire, contrôlable par le clavier et tout dispositif de pointage ?

**Couverture extension :** Manual audit

> Keyboard control of media player — interaction test.

**Tests :**

- **4.11.1** — Chaque média temporel a-t-il, si nécessaire, les fonctionnalités de contrôle de sa consultation ?
- **4.11.2** — Pour chaque média temporel, chaque fonctionnalité vérifie-t-elle une de ces conditions ?
- **4.11.3** — Pour chaque média temporel, chaque fonctionnalité vérifie-t-elle une de ces conditions ?

### 4.12 — La consultation de chaque média non temporel est-elle contrôlable par le clavier et tout dispositif de pointage ?

**Couverture extension :** Manual audit

> Non-temporal media keyboard control — manual.

**Tests :**

- **4.12.1** — Pour chaque média non temporel, chaque fonctionnalité vérifie-t-elle une de ces conditions ?
- **4.12.2** — Pour chaque média non temporel, chaque fonctionnalité vérifie-t-elle une de ces conditions ?

### 4.13 — Chaque média temporel et non temporel est-il compatible avec les technologies d’assistance (hors cas particuliers) ?

**Couverture extension :** Manual audit

> Media AT compatibility — manual.

**Tests :**

- **4.13.1** — Chaque média temporel et non temporel vérifie-t-il une de ces conditions (hors cas particuliers) ?
- **4.13.2** — Chaque média temporel et non temporel qui possède une alternative compatible avec les technologies d’assistance, vérifie-t-il une de ces conditions ?

## 5. Tableaux

### 5.1 — Chaque tableau de données complexe a-t-il un résumé ?

**Couverture extension :** Manual audit

> Complex table summary — manual.

**Tests :**

- **5.1.1** — Pour chaque tableau de données complexe, un résumé est-il disponible ?

### 5.2 — Pour chaque tableau de données complexe ayant un résumé, celui-ci est-il pertinent ?

**Couverture extension :** Manual audit

> Summary relevance — manual.

**Tests :**

- **5.2.1** — Pour chaque tableau de données complexe ayant un résumé, celui-ci est-il pertinent ?

### 5.3 — Pour chaque tableau de mise en forme, le contenu linéarisé reste-t-il compréhensible ?

**Couverture extension :** AI deep scan (needs review)

> Layout table linearization — AI on markup.

**Tests :**

- **5.3.1** — Chaque tableau de mise en forme vérifie-t-il ces conditions ?

### 5.4 — Pour chaque tableau de données ayant un titre, le titre est-il correctement associé au tableau de données ?

**Couverture extension :** axe-core (certain)

**Règles axe :** table-fake-caption

**Tests :**

- **5.4.1** — Pour chaque tableau de données ayant un titre, le titre est-il correctement associé au tableau de données ?

### 5.5 — Pour chaque tableau de données ayant un titre, celui-ci est-il pertinent ?

**Couverture extension :** Manual audit

> Caption relevance — manual.

**Tests :**

- **5.5.1** — Pour chaque tableau de données ayant un titre, ce titre permet-il d’identifier le contenu du tableau de données de manière claire et concise ?

### 5.6 — Pour chaque tableau de données, chaque en-tête de colonne et chaque en-tête de ligne sont-ils correctement déclarés ?

**Couverture extension :** AI deep scan (needs review)

> Header declaration — AI flags td-as-header patterns.

**Tests :**

- **5.6.1** — Pour chaque tableau de données, chaque en-tête de colonne s’appliquant à la totalité de la colonne vérifie-t-il une de ces conditions ?
- **5.6.2** — Pour chaque tableau de données, chaque en-tête de ligne s’appliquant à la totalité de la ligne vérifie-t-il une de ces conditions ?
- **5.6.3** — Pour chaque tableau de données, chaque en-tête ne s’appliquant pas à la totalité de la ligne ou de la colonne est-il structuré au moyen d’une balise `<th>` ?
- **5.6.4** — Pour chaque tableau de données, chaque cellule associée à plusieurs en-têtes est-elle structurée au moyen d’une balise `<td>` ou `<th>` ?

### 5.7 — Pour chaque tableau de données, la technique appropriée permettant d’associer chaque cellule avec ses en-têtes est-elle utilisée (hors cas particuliers) ?

**Couverture extension :** axe-core (certain)

**Règles axe :** td-headers-attr, th-has-data-cells, scope-attr-valid

**Tests :**

- **5.7.1** — Pour chaque contenu de balise `<th>` s’appliquant à la totalité de la ligne ou de la colonne, la balise `<th>` respecte-t-elle une de ces conditions (hors cas particuliers) ?
- **5.7.2** — Pour chaque contenu de balise `<th>` s’appliquant à la totalité de la ligne ou de la colonne et possédant un attribut `scope`, la balise `<th>` vérifie-t-elle une de ces conditions ?
- **5.7.3** — Pour chaque contenu de balise `<th>` ne s’appliquant pas à la totalité de la ligne ou de la colonne, la balise `<th>` vérifie-t-elle ces conditions ?
- **5.7.4** — Pour chaque contenu de balise `<td>` ou `<th>` associée à un ou plusieurs en-têtes possédant un attribut `id`, la balise vérifie-t-elle ces conditions ?
- **5.7.5** — Pour chaque balise pourvue d’un attribut WAI-ARIA `role="rowheader"` ou `role="columnheader"` dont le contenu s’applique à la totalité de la ligne ou de la colonne, la balise vérifie-t-elle une de ces conditions ?

### 5.8 — Chaque tableau de mise en forme ne doit pas utiliser d’éléments propres aux tableaux de données. Cette règle est-elle respectée ?

**Couverture extension :** Deterministic rule (likely)

**Règles :** rgaa-layout-table-semantics

**Tests :**

- **5.8.1** — Chaque tableau de mise en forme (balise `<table>`) vérifie-t-il ces conditions ?

## 6. Liens

### 6.1 — Chaque lien est-il explicite (hors cas particuliers) ?

**Couverture extension :** axe-core (certain) · AI deep scan (needs review)

**Règles axe :** link-name, identical-links-same-purpose

> Vague link text AI-assessed.

**Tests :**

- **6.1.1** — Chaque lien texte vérifie-t-il une de ces conditions (hors cas particuliers) ?
- **6.1.2** — Chaque lien image vérifie-t-il une de ces conditions (hors cas particuliers) ?
- **6.1.3** — Chaque lien composite vérifie-t-il une de ces conditions (hors cas particuliers) ?
- **6.1.4** — Chaque lien SVG vérifie-t-il une de ces conditions (hors cas particuliers) ?
- **6.1.5** — Pour chaque lien ayant un intitulé visible, le nom accessible du lien contient-il au moins l’intitulé visible (hors cas particuliers) ?

### 6.2 — Dans chaque page web, chaque lien a-t-il un intitulé ?

**Couverture extension :** axe-core (certain)

**Règles axe :** link-name

**Tests :**

- **6.2.1** — Dans chaque page web, chaque lien a-t-il un intitulé entre `<a>` et `</a>` ?

## 7. Scripts

### 7.1 — Chaque script est-il, si nécessaire, compatible avec les technologies d’assistance ?

**Couverture extension :** axe-core (certain)

**Règles axe :** aria-required-attr, aria-required-children, aria-required-parent, aria-roles, aria-valid-attr, aria-valid-attr-value, aria-allowed-attr, aria-allowed-role, aria-hidden-body, aria-hidden-focus

**Tests :**

- **7.1.1** — Chaque script qui génère ou contrôle un composant d’interface vérifie-t-il, si nécessaire, une de ces conditions ?
- **7.1.2** — Chaque script qui génère ou contrôle un composant d’interface respecte-t-il une de ces conditions ?
- **7.1.3** — Chaque script qui génère ou contrôle un composant d’interface vérifie-t-il ces conditions (hors cas particuliers) ?

### 7.2 — Pour chaque script ayant une alternative, cette alternative est-elle pertinente ?

**Couverture extension :** Manual audit

> Script alternative relevance — manual.

**Tests :**

- **7.2.1** — Chaque script débutant par la balise `<script>` et ayant une alternative vérifie-t-il une de ces conditions ?
- **7.2.2** — Chaque élément non textuel mis à jour par un script (dans la page, ou dans un cadre) et ayant une alternative vérifie-t-il ces conditions ?

### 7.3 — Chaque script est-il contrôlable par le clavier et par tout dispositif de pointage (hors cas particuliers) ?

**Couverture extension :** Deterministic rule (likely)

**Règles :** rgaa-keyboard-accessible

**Tests :**

- **7.3.1** — Chaque élément possédant un gestionnaire d’événement contrôlé par un script vérifie-t-il une de ces conditions (hors cas particuliers) ?
- **7.3.2** — Un script ne doit pas supprimer le focus d’un élément qui le reçoit. Cette règle est-elle respectée (hors cas particuliers) ?

### 7.4 — Pour chaque script qui initie un changement de contexte, l’utilisateur est-il averti ou en a-t-il le contrôle ?

**Couverture extension :** axe-core (certain)

**Règles axe :** blink, marquee

**Tests :**

- **7.4.1** — Chaque script qui initie un changement de contexte vérifie-t-il une de ces conditions ?

### 7.5 — Dans chaque page web, les messages de statut sont-ils correctement restitués par les technologies d’assistance ?

**Couverture extension :** Manual audit

> Status message AT restitution — needs live SR test.

**Tests :**

- **7.5.1** — Chaque message de statut qui informe de la réussite, du résultat d’une action ou bien de l’état d’une application utilise-t-il l’attribut WAI-ARIA `role="status"` ?
- **7.5.2** — Chaque message de statut qui présente une suggestion, ou avertit de l’existence d’une erreur utilise-t-il l’attribut WAI-ARIA `role="alert"` ?
- **7.5.3** — Chaque message de statut qui indique la progression d’un processus utilise-t-il l’un des attributs WAI-ARIA `role="log"`, `role="progressbar"` ou `role="status"` ?

## 8. Éléments obligatoires

### 8.1 — Chaque page web est-elle définie par un type de document ?

**Couverture extension :** Deterministic rule (likely)

**Règles :** rgaa-doctype

**Tests :**

- **8.1.1** — Pour chaque page web, le type de document (balise `doctype`) est-il présent ?
- **8.1.2** — Pour chaque page web, le type de document (balise `doctype`) est-il valide ?
- **8.1.3** — Pour chaque page web possédant une déclaration de type de document, celle-ci est-elle située avant la balise `<html>` dans le code source ?

### 8.2 — Pour chaque page web, le code source généré est-il valide selon le type de document spécifié ?

**Couverture extension :** axe-core (certain)

**Règles axe :** duplicate-id-aria

> Full HTML validation not automated.

**Tests :**

- **8.2.1** — Pour chaque déclaration de type de document, le code source généré de la page vérifie-t-il ces conditions ?

### 8.3 — Dans chaque page web, la langue par défaut est-elle présente ?

**Couverture extension :** axe-core (certain)

**Règles axe :** html-has-lang

**Tests :**

- **8.3.1** — Pour chaque page web, l’indication de langue par défaut vérifie-t-elle une de ces conditions ?

### 8.4 — Pour chaque page web ayant une langue par défaut, le code de langue est-il pertinent ?

**Couverture extension :** axe-core (certain)

**Règles axe :** html-lang-valid, html-xml-lang-mismatch

**Tests :**

- **8.4.1** — Pour chaque page web ayant une langue par défaut, le code de langue vérifie-t-il ces conditions ?

### 8.5 — Chaque page web a-t-elle un titre de page ?

**Couverture extension :** axe-core (certain)

**Règles axe :** document-title

**Tests :**

- **8.5.1** — Chaque page web a-t-elle un titre de page (balise `<title>`) ?

### 8.6 — Pour chaque page web ayant un titre de page, ce titre est-il pertinent ?

**Couverture extension :** AI deep scan (needs review)

> Page title relevance — AI judgment.

**Tests :**

- **8.6.1** — Pour chaque page web ayant un titre de page (balise `<title>`), le contenu de cette balise est-il pertinent ?

### 8.7 — Dans chaque page web, chaque changement de langue est-il indiqué dans le code source (hors cas particuliers) ?

**Couverture extension :** axe-core (certain) · AI deep scan (needs review)

**Règles axe :** valid-lang

> Missing lang on foreign passages AI-assessed.

**Tests :**

- **8.7.1** — Dans chaque page web, chaque texte écrit dans une langue différente de la langue par défaut vérifie-t-il une de ces conditions (hors cas particuliers) ?

### 8.8 — Dans chaque page web, le code de langue de chaque changement de langue est-il valide et pertinent ?

**Couverture extension :** axe-core (certain)

**Règles axe :** valid-lang

**Tests :**

- **8.8.1** — Pour chaque page web, le code de langue de chaque changement de langue vérifie-t-il ces conditions ?

### 8.9 — Dans chaque page web, les balises ne doivent pas être utilisées uniquement à des fins de présentation. Cette règle est-elle respectée ?

**Couverture extension :** AI deep scan (needs review)

> Presentational tag misuse — AI on markup.

**Tests :**

- **8.9.1** — Dans chaque page web les balises (à l’exception de `<div>`, `<span>` et `<table>`) ne doivent pas être utilisées uniquement à des fins de présentation. Cette règle est-elle respectée ?

### 8.10 — Dans chaque page web, les changements du sens de lecture sont-ils signalés ?

**Couverture extension :** Deterministic rule (likely)

**Règles :** rgaa-text-direction

**Tests :**

- **8.10.1** — Dans chaque page web, chaque texte dont le sens de lecture est différent du sens de lecture par défaut est contenu dans une balise possédant un attribut `dir` ?
- **8.10.2** — Dans chaque page web, chaque changement du sens de lecture (attribut `dir`) vérifie-t-il ces conditions ?

## 9. Structuration de l’information

### 9.1 — Dans chaque page web, l’information est-elle structurée par l’utilisation appropriée de titres ?

**Couverture extension :** axe-core (certain) · AI deep scan (needs review)

**Règles axe :** heading-order, empty-heading, p-as-heading

**Tests :**

- **9.1.1** — Dans chaque page web, la hiérarchie entre les titres (balise `<hx>` ou balise possédant un attribut WAI-ARIA `role="heading"` associé à un attribut WAI-ARIA `aria-level`) est-elle pertinente ?
- **9.1.2** — Dans chaque page web, le contenu de chaque titre (balise `<hx>` ou balise possédant un attribut WAI-ARIA `role="heading"` associé à un attribut WAI-ARIA `aria-level`) est-il pertinent ?
- **9.1.3** — Dans chaque page web, chaque passage de texte constituant un titre est-il structuré à l’aide d’une balise `<hx>` ou d’une balise possédant un attribut WAI-ARIA `role="heading"` associé à un attribut WAI-ARIA `aria-level` ?

### 9.2 — Dans chaque page web, la structure du document est-elle cohérente (hors cas particuliers) ?

**Couverture extension :** axe-core (certain)

**Règles axe :** landmark-one-main, landmark-unique, region

**Tests :**

- **9.2.1** — Dans chaque page web, la structure du document vérifie-t-elle ces conditions (hors cas particuliers) ?

### 9.3 — Dans chaque page web, chaque liste est-elle correctement structurée ?

**Couverture extension :** axe-core (certain) · AI deep scan (needs review)

**Règles axe :** list, listitem, definition-list

**Tests :**

- **9.3.1** — Dans chaque page web, les informations regroupées visuellement sous forme de liste non ordonnée vérifient-elles une de ces conditions ?
- **9.3.2** — Dans chaque page web, les informations regroupées visuellement sous forme de liste ordonnée vérifient-elles une de ces conditions ?
- **9.3.3** — Dans chaque page web, les informations regroupées sous forme de liste de description utilisent-elles les balises `<dl>` et `<dt>/<dd>` ?

### 9.4 — Dans chaque page web, chaque citation est-elle correctement indiquée ?

**Couverture extension :** AI deep scan (needs review)

> Citation markup — AI on markup.

**Tests :**

- **9.4.1** — Dans chaque page web, chaque citation courte utilise-t-elle une balise `<q>` ?
- **9.4.2** — Dans chaque page web, chaque bloc de citation utilise-t-il une balise `<blockquote>` ?

## 10. Présentation de l’information

### 10.1 — Dans le site web, des feuilles de styles sont-elles utilisées pour contrôler la présentation de l’information ?

**Couverture extension :** AI deep scan (needs review) · Deterministic rule (likely)

**Règles :** rgaa-presentational-html

> Legacy presentational tags via rule; CSS-only checks AI.

**Tests :**

- **10.1.1** — Dans chaque page web, les balises servant à la présentation de l’information ne doivent pas être présentes dans le code source généré des pages. Cette règle est-elle respectée ?
- **10.1.2** — Dans chaque page web, les attributs servant à la présentation de l’information ne doivent pas être présents dans le code source généré des pages. Cette règle est-elle respectée ?
- **10.1.3** — Dans chaque page web, l’utilisation des espaces vérifie-t-elle ces conditions ?

### 10.2 — Dans chaque page web, le contenu visible porteur d’information reste-t-il présent lorsque les feuilles de styles sont désactivées ?

**Couverture extension :** Manual audit

> CSS disabled test — manual.

**Tests :**

- **10.2.1** — Dans chaque page web, l’information reste-t-elle présente lorsque les feuilles de styles sont désactivées ?

### 10.3 — Dans chaque page web, l’information reste-t-elle compréhensible lorsque les feuilles de styles sont désactivées ?

**Couverture extension :** Manual audit

> Comprehension without CSS — manual.

**Tests :**

- **10.3.1** — Dans chaque page web, l’information reste-t-elle compréhensible lorsque les feuilles de styles sont désactivées ?

### 10.4 — Dans chaque page web, le texte reste-t-il lisible lorsque la taille des caractères est augmentée jusqu’à 200 %, au moins (hors cas particuliers) ?

**Couverture extension :** axe-core (certain) · Deterministic rule (likely)

**Règles :** rgaa-text-scaling

**Règles axe :** meta-viewport, meta-viewport-large

**Tests :**

- **10.4.1** — Dans chaque page web, l’augmentation de la taille des caractères jusqu’à 200 %, au moins, ne doit pas provoquer de perte d’information. Cette règle est-elle respectée selon une de ces conditions (hors cas particuliers) ?
- **10.4.2** — Dans chaque page web, l’augmentation de la taille des caractères jusqu’à 200 %, au moins, doit être possible pour l’ensemble du texte dans la page. Cette règle est-elle respectée selon une de ces conditions (hors cas particuliers) ?

### 10.5 — Dans chaque page web, les déclarations CSS de couleurs de fond d’élément et de police sont-elles correctement utilisées ?

**Couverture extension :** Manual audit

> Background/font color CSS pairing — manual.

**Tests :**

- **10.5.1** — Dans chaque page web, chaque déclaration CSS de couleurs de police (`color`), d’un élément susceptible de contenir du texte, est-elle accompagnée d’une déclaration de couleur de fond (`background`, `background-color`), au moins, héritée d’un parent ?
- **10.5.2** — Dans chaque page web, chaque déclaration de couleur de fond (`background`, `background-color`), d’un élément susceptible de contenir du texte, est-elle accompagnée d’une déclaration de couleur de police (`color`) au moins, héritée d’un parent ?
- **10.5.3** — Dans chaque page web, chaque utilisation d’une image pour créer une couleur de fond d’un élément susceptible de contenir du texte, via CSS (`background`, `background-image`), est-elle accompagnée d’une déclaration de couleur de fond (`background`, `background-color`), au moins, héritée d’un parent ?

### 10.6 — Dans chaque page web, chaque lien dont la nature n’est pas évidente est-il visible par rapport au texte environnant ?

**Couverture extension :** axe-core (certain)

**Règles axe :** link-in-text-block

**Tests :**

- **10.6.1** — Dans chaque page web, chaque lien texte signalé uniquement par la couleur, et dont la nature n’est pas évidente, vérifie-t-il ces conditions ?

### 10.7 — Dans chaque page web, pour chaque élément recevant le focus, la prise de focus est-elle visible ?

**Couverture extension :** Deterministic rule (likely)

**Règles :** rgaa-focus-visible

**Tests :**

- **10.7.1** — Pour chaque élément recevant le focus, la prise de focus vérifie-t-elle une de ces conditions ?

### 10.8 — Pour chaque page web, les contenus cachés ont-ils vocation à être ignorés par les technologies d’assistance ?

**Couverture extension :** Deterministic rule (likely)

**Règles :** rgaa-hidden-content

**Tests :**

- **10.8.1** — Dans chaque page web, chaque contenu caché vérifie-t-il une de ces conditions ?

### 10.9 — Dans chaque page web, l’information ne doit pas être donnée uniquement par la forme, taille ou position. Cette règle est-elle respectée ?

**Couverture extension :** Manual audit

> Information by shape/size/position — manual.

**Tests :**

- **10.9.1** — Dans chaque page web, pour chaque texte ou ensemble de textes, l’information ne doit pas être donnée uniquement par la forme, taille ou position. Cette règle est-elle respectée ?
- **10.9.2** — Dans chaque page web, pour chaque image ou ensemble d’images, l’information ne doit pas être donnée uniquement par la forme, taille ou position. Cette règle est-elle respectée ?
- **10.9.3** — Dans chaque page web, pour chaque média temporel, l’information ne doit pas être donnée uniquement par la forme, taille ou position. Cette règle est-elle respectée ?
- **10.9.4** — Dans chaque page web, pour chaque média non temporel, l’information ne doit pas être donnée uniquement par la forme, taille ou position. Cette règle est-elle respectée ?

### 10.10 — Dans chaque page web, l’information ne doit pas être donnée par la forme, taille ou position uniquement. Cette règle est-elle implémentée de façon pertinente ?

**Couverture extension :** Manual audit

> Implementation of shape/size cues — manual.

**Tests :**

- **10.10.1** — Dans chaque page web, pour chaque texte ou ensemble de textes, l’information ne doit pas être donnée uniquement par la forme, taille ou position. Cette règle est-elle implémentée de façon pertinente ?
- **10.10.2** — Dans chaque page web, pour chaque image ou ensemble d’images, l’information ne doit pas être donnée uniquement par la forme, taille ou position. Cette règle est-elle implémentée de façon pertinente ?
- **10.10.3** — Dans chaque page web, pour chaque média temporel, l’information ne doit pas être donnée uniquement par la forme, taille ou position. Cette règle est-elle implémentée de façon pertinente ?
- **10.10.4** — Dans chaque page web, pour chaque média non temporel, l’information ne doit pas être donnée uniquement par la forme, taille ou position. Cette règle est-elle implémentée de façon pertinente ?

### 10.11 — Pour chaque page web, les contenus peuvent-ils être présentés sans perte d’information ou de fonctionnalité et sans avoir recours soit à un défilement vertical pour une fenêtre ayant une hauteur de 256 px, soit à un défilement horizontal pour une fenêtre ayant une largeur de 320 px (hors cas particuliers) ?

**Couverture extension :** axe-core (certain)

**Règles axe :** css-orientation-lock

**Tests :**

- **10.11.1** — Pour chaque page web, lorsque le contenu dont le sens de lecture est horizontal est affiché dans une fenêtre réduite à une largeur de 320 px, l’ensemble des informations et des fonctionnalités sont-elles disponibles sans aucun défilement horizontal (hors cas particuliers) ?
- **10.11.2** — Pour chaque page web, lorsque le contenu dont le sens de lecture est vertical est affiché dans une fenêtre réduite à une hauteur de 256 px, l’ensemble des informations et des fonctionnalités sont-elles disponibles sans aucun défilement vertical (hors cas particuliers) ?

### 10.12 — Dans chaque page web, les propriétés d’espacement du texte peuvent-elles être redéfinies par l’utilisateur sans perte de contenu ou de fonctionnalité (hors cas particuliers) ?

**Couverture extension :** Manual audit

> Text spacing override — manual resize test.

**Tests :**

- **10.12.1** — Dans chaque page web, le texte reste-t-il lisible lorsque l’affichage est modifié selon ces conditions (hors cas particuliers) ?

### 10.13 — Dans chaque page web, les contenus additionnels apparaissant à la prise de focus ou au survol d’un composant d’interface sont-ils contrôlables par l’utilisateur (hors cas particuliers) ?

**Couverture extension :** Manual audit

> Hover/focus additional content — interaction test.

**Tests :**

- **10.13.1** — Chaque contenu additionnel devenant visible à la prise de focus ou au survol d’un composant d’interface peut-il être masqué par une action de l’utilisateur sans déplacer le focus ou le pointeur de la souris (hors cas particuliers) ?
- **10.13.2** — Chaque contenu additionnel qui apparait au survol d’un composant d’interface peut-il être survolé par le pointeur de la souris sans disparaître (hors cas particuliers) ?
- **10.13.3** — Chaque contenu additionnel qui apparaît à la prise de focus ou au survol d’un composant d’interface vérifie-t-il une de ces conditions (hors cas particuliers) ?

### 10.14 — Dans chaque page web, les contenus additionnels apparaissant via les styles CSS uniquement peuvent-ils être rendus visibles au clavier et par tout dispositif de pointage ?

**Couverture extension :** Manual audit

> CSS-only content keyboard access — interaction test.

**Tests :**

- **10.14.1** — Dans chaque page web, les contenus additionnels apparaissant au survol d’un composant d’interface via les styles CSS respectent-ils si nécessaire une de ces conditions ?
- **10.14.2** — Dans chaque page web, les contenus additionnels apparaissant au focus d’un composant d’interface via les styles CSS respectent-ils si nécessaire une de ces conditions ?

## 11. Formulaires

### 11.1 — Chaque champ de formulaire a-t-il une étiquette ?

**Couverture extension :** axe-core (certain)

**Règles axe :** label, label-title-only, form-field-multiple-labels, select-name, aria-input-field-name

**Tests :**

- **11.1.1** — Chaque champ de formulaire vérifie-t-il une de ces conditions ?
- **11.1.2** — Chaque champ de formulaire associé à une balise `<label>` ayant un attribut `for`, vérifie-t-il ces conditions ?
- **11.1.3** — Chaque champ de formulaire ayant une étiquette dont le contenu n’est pas visible ou à proximité (masqué, `aria-label`) ou qui n’est pas accolé au champ (`aria-labelledby`), vérifie-t-il une de ses conditions ?

### 11.2 — Chaque étiquette associée à un champ de formulaire est-elle pertinente (hors cas particuliers) ?

**Couverture extension :** AI deep scan (needs review)

> Label relevance — AI judgment.

**Tests :**

- **11.2.1** — Chaque balise `<label>` permet-elle de connaître la fonction exacte du champ de formulaire auquel elle est associée ?
- **11.2.2** — Chaque attribut `title` permet-il de connaître la fonction exacte du champ de formulaire auquel il est associé ?
- **11.2.3** — Chaque étiquette implémentée via l’attribut WAI-ARIA `aria-label` permet-elle de connaître la fonction exacte du champ de formulaire auquel elle est associée ?
- **11.2.4** — Chaque passage de texte associé via l’attribut WAI-ARIA `aria-labelledby` permet-il de connaître la fonction exacte du champ de formulaire auquel il est associé ?
- **11.2.5** — Chaque champ de formulaire ayant un intitulé visible vérifie-t-il ces conditions (hors cas particuliers) ?
- **11.2.6** — Chaque bouton adjacent au champ de formulaire qui fournit une étiquette visible permet-il de connaître la fonction exacte du champ de formulaire auquel il est associé ?

### 11.3 — Dans chaque formulaire, chaque étiquette associée à un champ de formulaire ayant la même fonction et répétée plusieurs fois dans une même page ou dans un ensemble de pages est-elle cohérente ?

**Couverture extension :** Manual audit

> Cross-page label consistency — multi-page.

**Tests :**

- **11.3.1** — Chaque étiquette associée à un champ de formulaire ayant la même fonction et répétée plusieurs fois dans une même page est-elle cohérente ?
- **11.3.2** — Chaque étiquette associée à un champ de formulaire ayant la même fonction et répétée dans un ensemble de pages est-elle cohérente ?

### 11.4 — Dans chaque formulaire, chaque étiquette de champ et son champ associé sont-ils accolés (hors cas particuliers) ?

**Couverture extension :** Manual audit

> Label proximity — visual layout manual.

**Tests :**

- **11.4.1** — Chaque étiquette de champ et son champ associé sont-ils accolés ?
- **11.4.2** — Chaque étiquette accolée à un champ (à l’exception des cases à cocher, bouton radio ou balises ayant un attribut WAI-ARIA `role="checkbox"`, `role="radio"` ou `role="switch"`), vérifie-t-elle ces conditions (hors cas particuliers) ?
- **11.4.3** — Chaque étiquette accolée à un champ de type `checkbox` ou `radio` ou à une balise ayant un attribut WAI-ARIA `role="checkbox"`, `role="radio"` ou `role="switch"`, vérifie-t-elle ces conditions (hors cas particuliers) ?

### 11.5 — Dans chaque formulaire, les champs de même nature sont-ils regroupés, si nécessaire ?

**Couverture extension :** Deterministic rule (likely)

**Règles :** rgaa-radio-grouping

**Tests :**

- **11.5.1** — Les champs de même nature vérifient-ils l’une de ces conditions, si nécessaire ?

### 11.6 — Dans chaque formulaire, chaque regroupement de champs de même nature a-t-il une légende ?

**Couverture extension :** Deterministic rule (likely)

**Règles :** rgaa-fieldset-legend

**Tests :**

- **11.6.1** — Chaque regroupement de champs de même nature possède-t-il une légende ?

### 11.7 — Dans chaque formulaire, chaque légende associée à un regroupement de champs de même nature est-elle pertinente ?

**Couverture extension :** Manual audit

> Legend relevance — manual.

**Tests :**

- **11.7.1** — Chaque légende associée à un regroupement de champs de même nature est-elle pertinente ?

### 11.8 — Dans chaque formulaire, les items de même nature d’une liste de choix sont-ils regroupés de manière pertinente ?

**Couverture extension :** Manual audit

> Optgroup grouping — partial manual.

**Tests :**

- **11.8.1** — Pour chaque balise `<select>`, les items de même nature d’une liste de choix sont-ils regroupés avec une balise `<optgroup>`, si nécessaire ?
- **11.8.2** — Dans chaque balise `<select>`, chaque balise `<optgroup>` possède-t-elle un attribut `label` ?
- **11.8.3** — Pour chaque balise `<optgroup>` ayant un attribut `label`, le contenu de l’attribut `label` est-il pertinent ?

### 11.9 — Dans chaque formulaire, l’intitulé de chaque bouton est-il pertinent (hors cas particuliers) ?

**Couverture extension :** AI deep scan (needs review)

> Button label relevance — AI judgment.

**Tests :**

- **11.9.1** — L’intitulé de chaque bouton vérifie-t-il ces conditions (hors cas particuliers) ?
- **11.9.2** — Chaque bouton affichant un intitulé visible vérifie-t-il ces conditions (hors cas particuliers) ?

### 11.10 — Dans chaque formulaire, le contrôle de saisie est-il utilisé de manière pertinente (hors cas particuliers) ?

**Couverture extension :** AI deep scan (needs review) · Deterministic rule (likely)

**Règles :** rgaa-required-indication

> Required field indication rule + AI for format hints.

**Tests :**

- **11.10.1** — Les indications du caractère obligatoire de la saisie des champs vérifient-elles une de ces conditions (hors cas particuliers) ?
- **11.10.2** — Les champs obligatoires ayant l’attribut `aria-required="true"` ou `required` vérifient-ils une de ces conditions ?
- **11.10.3** — Les messages d’erreur indiquant l’absence de saisie d’un champ obligatoire vérifient-ils une de ces conditions ?
- **11.10.4** — Les champs obligatoires ayant l’attribut `aria-invalid="true"` vérifient-ils une de ces conditions ?
- **11.10.5** — Les instructions et indications du type de données et/ou de format obligatoires vérifient-elles une de ces conditions ?
- **11.10.6** — Les messages d’erreurs fournissant une instruction ou une indication du type de données et/ou de format obligatoire des champs vérifient-ils une de ces conditions ?
- **11.10.7** — Les champs ayant l’attribut `aria-invalid="true"` dont la saisie requiert un type de données et/ou de format obligatoires vérifient-ils une de ces conditions ?

### 11.11 — Dans chaque formulaire, le contrôle de saisie est-il accompagné, si nécessaire, de suggestions facilitant la correction des erreurs de saisie ?

**Couverture extension :** Manual audit

> Error correction suggestions — manual.

**Tests :**

- **11.11.1** — Pour chaque erreur de saisie, les types et les formats de données sont-ils suggérés, si nécessaire ?
- **11.11.2** — Pour chaque erreur de saisie, des exemples de valeurs attendues sont-ils suggérés, si nécessaire ?

### 11.12 — Pour chaque formulaire qui modifie ou supprime des données, ou qui transmet des réponses à un test ou à un examen, ou dont la validation a des conséquences financières ou juridiques, les données saisies peuvent-elles être modifiées, mises à jour ou récupérées par l’utilisateur ?

**Couverture extension :** Manual audit

> Reversible submissions — manual.

**Tests :**

- **11.12.1** — Pour chaque formulaire qui modifie ou supprime des données, ou qui transmet des réponses à un test ou un examen, ou dont la validation a des conséquences financières ou juridiques, la saisie des données vérifie-t-elle une de ces conditions ?
- **11.12.2** — Chaque formulaire dont la validation modifie ou supprime des données à caractère financier, juridique ou personnel vérifie-t-il une de ces conditions ?

### 11.13 — La finalité d’un champ de saisie peut-elle être déduite pour faciliter le remplissage automatique des champs avec les données de l’utilisateur ?

**Couverture extension :** axe-core (certain)

**Règles axe :** autocomplete-valid

**Tests :**

- **11.13.1** — Chaque champ de formulaire dont l’objet se rapporte à une information concernant l’utilisateur vérifie-t-il ces conditions ?

## 12. Navigation

### 12.1 — Chaque ensemble de pages dispose-t-il de deux systèmes de navigation différents, au moins (hors cas particuliers) ?

**Couverture extension :** Manual audit

> Two navigation systems — site-wide manual.

**Tests :**

- **12.1.1** — Chaque ensemble de pages vérifie-t-il une de ces conditions (hors cas particuliers) ?

### 12.2 — Dans chaque ensemble de pages, le menu et les barres de navigation sont-ils toujours à la même place (hors cas particuliers) ?

**Couverture extension :** Manual audit

> Consistent nav placement — multi-page.

**Tests :**

- **12.2.1** — Dans chaque ensemble de pages, chaque page disposant d’un menu et les barres de navigation vérifie-t-elle ces conditions (hors cas particuliers) ?

### 12.3 — La page « plan du site » est-elle pertinente ?

**Couverture extension :** Manual audit

> Sitemap relevance — manual.

**Tests :**

- **12.3.1** — La page « plan du site » est-elle représentative de l’architecture générale du site ?
- **12.3.2** — Les liens du plan du site sont-ils fonctionnels ?
- **12.3.3** — Les liens du plan du site renvoient-ils bien vers les pages indiquées par l’intitulé ?

### 12.4 — Dans chaque ensemble de pages, la page « plan du site » est-elle accessible à partir d’une fonctionnalité identique ?

**Couverture extension :** Manual audit

> Sitemap access — multi-page.

**Tests :**

- **12.4.1** — Dans chaque ensemble de pages, la page « plan du site » est-elle accessible à partir d’une fonctionnalité identique ?
- **12.4.2** — Dans chaque ensemble de pages, la fonctionnalité vers la page « plan du site » est-elle située à la même place dans la présentation ?
- **12.4.3** — Dans chaque ensemble de pages, la fonctionnalité vers la page « plan du site » se présente-t-elle toujours dans le même ordre relatif dans le code source ?

### 12.5 — Dans chaque ensemble de pages, le moteur de recherche est-il atteignable de manière identique ?

**Couverture extension :** Manual audit

> Search engine access — multi-page.

**Tests :**

- **12.5.1** — Dans chaque ensemble de pages, le moteur de recherche est-il accessible à partir d’une fonctionnalité identique ?
- **12.5.2** — Dans chaque ensemble de pages, la fonctionnalité vers le moteur de recherche est-elle située à la même place dans la présentation ?
- **12.5.3** — Dans chaque ensemble de pages, la fonctionnalité vers le moteur de recherche se présente-t-elle toujours dans le même ordre relatif dans le code source ?

### 12.6 — Les zones de regroupement de contenus présentes dans plusieurs pages web (zones d’en-tête, de navigation principale, de contenu principal, de pied de page et de moteur de recherche) peuvent-elles être atteintes ou évitées ?

**Couverture extension :** axe-core (certain) · AI deep scan (needs review)

**Règles axe :** region, landmark-one-main

> Landmark reachability AI-assessed.

**Tests :**

- **12.6.1** — Dans chaque page web où elles sont présentes, la zone d’en-tête, de navigation principale, de contenu principal, de pied de page et de moteur de recherche respectent-elles au moins une de ces conditions ?

### 12.7 — Dans chaque page web, un lien d’évitement ou d’accès rapide à la zone de contenu principal est-il présent (hors cas particuliers) ?

**Couverture extension :** axe-core (certain) · Deterministic rule (likely)

**Règles :** rgaa-skip-link

**Règles axe :** bypass, skip-link

**Tests :**

- **12.7.1** — Dans chaque page web, un lien permet-il d’éviter la zone de contenu principal ou d’y accéder (hors cas particuliers) ?
- **12.7.2** — Dans chaque ensemble de pages, le lien d’évitement ou d’accès rapide à la zone de contenu principal vérifie-t-il ces conditions (hors cas particuliers) ?

### 12.8 — Dans chaque page web, l’ordre de tabulation est-il cohérent ?

**Couverture extension :** axe-core (certain)

**Règles axe :** tabindex

**Tests :**

- **12.8.1** — Dans chaque page web, l’ordre de tabulation dans le contenu est-il cohérent ?
- **12.8.2** — Pour chaque script qui met à jour ou insère un contenu, l’ordre de tabulation reste-t-il cohérent ?

### 12.9 — Dans chaque page web, la navigation ne doit pas contenir de piège au clavier. Cette règle est-elle respectée ?

**Couverture extension :** Manual audit

> Keyboard trap — tab simulation planned.

**Tests :**

- **12.9.1** — Dans chaque page web, chaque élément recevant le focus vérifie-t-il une de ces conditions ?

### 12.10 — Dans chaque page web, les raccourcis clavier n’utilisant qu’une seule touche (lettre minuscule ou majuscule, ponctuation, chiffre ou symbole) sont-ils contrôlables par l’utilisateur ?

**Couverture extension :** axe-core (certain)

**Règles axe :** accesskeys

**Tests :**

- **12.10.1** — Dans chaque page web, chaque raccourci clavier n’utilisant qu’une seule touche (lettre minuscule ou majuscule, ponctuation, chiffre ou symbole) vérifie-t-il l’une de ces conditions ?

### 12.11 — Dans chaque page web, les contenus additionnels apparaissant au survol, à la prise de focus ou à l’activation d’un composant d’interface sont-ils si nécessaire atteignables au clavier ?

**Couverture extension :** Manual audit

> Keyboard reachability of tooltips — interaction test.

**Tests :**

- **12.11.1** — Dans chaque page web, les contenus additionnels apparaissant au survol, à la prise de focus ou à l’activation d’un composant d’interface sont-ils si nécessaire atteignables au clavier ?

## 13. Consultation

### 13.1 — Pour chaque page web, l’utilisateur a-t-il le contrôle de chaque limite de temps modifiant le contenu (hors cas particuliers) ?

**Couverture extension :** axe-core (certain)

**Règles axe :** meta-refresh, meta-refresh-no-exceptions

**Tests :**

- **13.1.1** — Pour chaque page web, chaque procédé de rafraîchissement (balise `<object>`, balise `<embed>`, balise `<svg>`, balise `<canvas>`, balise `<meta>`) vérifie-t-il une de ces conditions (hors cas particuliers) ?
- **13.1.2** — Pour chaque page web, chaque procédé de redirection effectué via une balise `<meta>` est-il immédiat (hors cas particuliers) ?
- **13.1.3** — Pour chaque page web, chaque procédé de redirection effectué via un script vérifie-t-il une de ces conditions (hors cas particuliers) ?
- **13.1.4** — Pour chaque page web, chaque procédé limitant le temps d’une session vérifie-t-il une de ces conditions (hors cas particuliers) ?

### 13.2 — Dans chaque page web, l’ouverture d’une nouvelle fenêtre ne doit pas être déclenchée sans action de l’utilisateur. Cette règle est-elle respectée ?

**Couverture extension :** Deterministic rule (likely)

**Règles :** rgaa-new-window-warning

> Popup-on-load not detected; target=_blank warning only.

**Tests :**

- **13.2.1** — Dans chaque page web, l’ouverture d’une nouvelle fenêtre ne doit pas être déclenchée sans action de l’utilisateur. Cette règle est-elle respectée ?

### 13.3 — Dans chaque page web, chaque document bureautique en téléchargement possède-t-il, si nécessaire, une version accessible (hors cas particuliers) ?

**Couverture extension :** Deterministic rule (likely)

**Règles :** rgaa-doc-link-format

> Accessible document version not verified.

**Tests :**

- **13.3.1** — Dans chaque page web, chaque fonctionnalité de téléchargement d’un document bureautique vérifie-t-elle une de ces conditions ?

### 13.4 — Pour chaque document bureautique ayant une version accessible, cette version offre-t-elle la même information ?

**Couverture extension :** Manual audit

> Accessible doc equivalence — manual.

**Tests :**

- **13.4.1** — Chaque document bureautique ayant une version accessible vérifie-t-il une de ces conditions ?

### 13.5 — Dans chaque page web, chaque contenu cryptique (art ASCII, émoticône, syntaxe cryptique) a-t-il une alternative ?

**Couverture extension :** Manual audit

> Cryptic content alternatives — manual.

**Tests :**

- **13.5.1** — Dans chaque page web, chaque contenu cryptique (art ASCII, émoticône, syntaxe cryptique) vérifie-t-il une de ces conditions ?

### 13.6 — Dans chaque page web, pour chaque contenu cryptique (art ASCII, émoticône, syntaxe cryptique) ayant une alternative, cette alternative est-elle pertinente ?

**Couverture extension :** Manual audit

> Cryptic alternative relevance — manual.

**Tests :**

- **13.6.1** — Dans chaque page web, chaque contenu cryptique (art ASCII, émoticône, syntaxe cryptique) vérifie-t-il une de ces conditions ?

### 13.7 — Dans chaque page web, les changements brusques de luminosité ou les effets de flash sont-ils correctement utilisés ?

**Couverture extension :** Manual audit

> Flash/luminance changes — manual.

**Tests :**

- **13.7.1** — Dans chaque page web, chaque image ou élément multimédia (balise `<video>`, balise `<img>`, balise `<svg>`, balise `<canvas>`, balise `<embed>` ou balise `<object>`) qui provoque un changement brusque de luminosité ou un effet de flash vérifie-t-il une de ces conditions ?
- **13.7.2** — Dans chaque page web, chaque script qui provoque un changement brusque de luminosité ou un effet de flash vérifie-t-il une de ces conditions ?
- **13.7.3** — Dans chaque page web, chaque mise en forme CSS qui provoque un changement brusque de luminosité ou un effet de flash vérifie-t-il une de ces conditions ?

### 13.8 — Dans chaque page web, chaque contenu en mouvement ou clignotant est-il contrôlable par l’utilisateur ?

**Couverture extension :** axe-core (certain) · Deterministic rule (likely)

**Règles :** rgaa-moving-content

**Règles axe :** blink, marquee

**Tests :**

- **13.8.1** — Dans chaque page web, chaque contenu en mouvement déclenché automatiquement, vérifie-t-il une de ces conditions ?
- **13.8.2** — Dans chaque page web, chaque contenu clignotant déclenché automatiquement, vérifie-t-il une de ces conditions ?

### 13.9 — Dans chaque page web, le contenu proposé est-il consultable quelle que soit l’orientation de l’écran (portrait ou paysage) (hors cas particuliers) ?

**Couverture extension :** axe-core (certain)

**Règles axe :** css-orientation-lock

**Tests :**

- **13.9.1** — Dans chaque page web, chaque contenu vérifie-t-il ces conditions (hors cas particuliers) ?

### 13.10 — Dans chaque page web, les fonctionnalités utilisables ou disponibles au moyen d’un geste complexe peuvent-elles être également disponibles au moyen d’un geste simple (hors cas particuliers) ?

**Couverture extension :** Manual audit

> Complex gestures — manual/device test.

**Tests :**

- **13.10.1** — Dans chaque page web, chaque fonctionnalité utilisable ou disponible suite à un contact multipoint est-elle également utilisable ou disponible suite à un contact en un point unique de l’écran (hors cas particuliers).
- **13.10.2** — Dans chaque page web, chaque fonctionnalité utilisable ou disponible suite à un geste basé sur le suivi d’une trajectoire sur l’écran est-elle également utilisable ou disponible suite à un contact en un point unique de l’écran (hors cas particuliers).

### 13.11 — Dans chaque page web, les actions déclenchées au moyen d’un dispositif de pointage sur un point unique de l’écran peuvent-elles faire l’objet d’une annulation (hors cas particuliers) ?

**Couverture extension :** Manual audit

> Pointer cancellation — manual.

**Tests :**

- **13.11.1** — Dans chaque page web, les actions déclenchées au moyen d’un dispositif de pointage sur un point unique de l’écran vérifient-elles l’une de ces conditions (hors cas particuliers) ?

### 13.12 — Dans chaque page web, les fonctionnalités qui impliquent un mouvement de l’appareil ou vers l’appareil peuvent-elles être satisfaites de manière alternative (hors cas particuliers) ?

**Couverture extension :** Manual audit

> Motion actuation alternatives — manual.

**Tests :**

- **13.12.1** — Dans chaque page web, les fonctionnalités disponibles en bougeant l’appareil peuvent-elles être accomplies avec des composants d’interface utilisateur (hors cas particuliers) ?
- **13.12.2** — Dans chaque page web, les fonctionnalités disponibles en faisant un geste en direction de l’appareil peuvent-elles être accomplies avec des composants d’interface utilisateur (hors cas particuliers) ?
- **13.12.3** — L’utilisateur a-t-il la possibilité de désactiver la détection du mouvement pour éviter un déclenchement accidentel de la fonctionnalité (hors cas particuliers) ?
