// Default quiz questions used to seed an empty `questions` table on startup.
// `options` is an array of answer strings; `answer` is the zero-based index
// of the correct option within that array.
const seedQuestions = [
  {
    question: "En quelle année l'école Epitech a-t-elle été fondée ?",
    options: ['1999', '1985', '2004', '2010'],
    answer: 0,
  },
  {
    question: 'Que signifie le mot « Epitech » ?',
    options: [
      'European Institute of Technology',
      'Epic Technologies',
      'Epitome of Technology',
      'Epitech Institute',
    ],
    answer: 0,
  },
  {
    question: "Quelle est la pédagogie phare d'Epitech ?",
    options: ['Les cours magistraux', 'Le peer learning par projets', 'Les QCM', 'Les stages uniquement'],
    answer: 1,
  },
  {
    question: 'Combien de temps dure le cursus Grande École à Epitech ?',
    options: ['3 ans', '4 ans', '5 ans', '2 ans'],
    answer: 2,
  },
  {
    question: 'Quel langage est traditionnellement enseigné en première année ?',
    options: ['Python', 'C', 'Java', 'JavaScript'],
    answer: 1,
  },
  {
    question: "Comment s'appelle la période intensive de début de cursus ?",
    options: ['Le Bootcamp', 'La Piscine', "L'Océan", 'Le Sprint'],
    answer: 1,
  },
  {
    question: 'Epitech fait partie de quel groupe ?',
    options: ['IONIS Education Group', 'Galileo', 'Omnes Education', 'Ynov'],
    answer: 0,
  },
  {
    question: "Quel projet emblématique de 1ère année consiste à recréer un shell ?",
    options: ['Mon shell', '42sh / Minishell', 'BSQ', 'Wireworld'],
    answer: 1,
  },
  {
    question: 'Combien de campus Epitech compte-t-elle environ en France ?',
    options: ['Une dizaine', 'Un seul', 'Une trentaine', 'Une centaine'],
    answer: 0,
  },
  {
    question: "Quel diplôme délivre le cursus Grande École d'Epitech ?",
    options: [
      'Un BTS',
      'Un titre RNCP niveau 7 (Bac+5)',
      'Une licence professionnelle',
      'Un doctorat',
    ],
    answer: 1,
  },
  {
    question: 'Quelle est la place de la note de cours dans la pédagogie Epitech ?',
    options: [
      'Il n\'y a pas de cours magistraux notés classiques',
      'Tout est noté par des examens écrits',
      'Seuls les TP sont notés',
      'Les notes viennent uniquement des stages',
    ],
    answer: 0,
  },
  {
    question: "Quel événement permet de découvrir l'école dont fait partie EpiQuest ?",
    options: ['La Journée Portes Ouvertes (JPO)', 'Le Hackathon', 'La rentrée', 'Le forum entreprises'],
    answer: 0,
  },

  // ── Epitech Bénin — d'après la brochure officielle ──
  {
    question: 'Combien de temps le Programme Grande École se déroule-t-il à Cotonou avant le départ à international ?',
    options: ['2 ans', '3 ans', '4 ans', '5 ans'],
    answer: 1,
  },
  {
    question: 'À quel niveau RNCP correspond le diplôme du Programme Grande École (Bac+5) ?',
    options: ['Niveau 5', 'Niveau 6', 'Niveau 7', 'Niveau 8'],
    answer: 2,
  },
  {
    question: 'Combien de Masters of Science (MSc) Tech Epitech propose-t-elle ?',
    options: ['2', '3', '4', '5'],
    answer: 2,
  },
  {
    question: "Lequel n'est PAS un MSc proposé par Epitech ?",
    options: ['Intelligence Artificielle', 'Cybersécurité', 'Big Data', 'Marketing'],
    answer: 3,
  },
  {
    question: 'Combien de temps dure un MSc chez Epitech (100% en alternance) ?',
    options: ['1 an', '2 ans', '3 ans', '4 ans'],
    answer: 1,
  },
  {
    question: "Quel est le taux d'insertion professionnelle 6 mois après la sortie ?",
    options: ['75 %', '85 %', '95 %', '100 %'],
    answer: 2,
  },
  {
    question: "Combien d'alumni Epitech compte-t-elle dans le monde ?",
    options: ['1 500', '5 000', '13 500', '50 000'],
    answer: 2,
  },
  {
    question: "Depuis combien d'années Epitech est-elle au service de la tech ?",
    options: ['10 ans', '15 ans', '25 ans', '40 ans'],
    answer: 2,
  },
  {
    question: "Combien d'entreprises partenaires accompagnent le Programme Grande École ?",
    options: ['120', '220', '320', '1 000'],
    answer: 2,
  },
  {
    question: 'Dans combien de campus Epitech est-elle présente dans le monde ?',
    options: ['5', '10', '20', '50'],
    answer: 2,
  },
  {
    question: 'Dans quelle ville se situe le campus Epitech Bénin ?',
    options: ['Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi'],
    answer: 0,
  },
  {
    question: 'Quelle structure soutient le développement Epitech au Bénin ?',
    options: ['Sèmè City', 'Bénin Excellence', "L'ANIP", 'La Poste du Bénin'],
    answer: 0,
  },
  {
    question: "Quelle est la 1ère étape du processus d'admission à Epitech ?",
    options: ['Le test de logique', "Le test d'anglais", "L'entretien de motivation", 'Le dossier scolaire'],
    answer: 0,
  },
  {
    question: "Combien d'étapes composent le processus d'admission ?",
    options: ['1', '2', '3', '4'],
    answer: 2,
  },
  {
    question: 'Le Bachelor Epitech Bénin combine quelles deux expertises ?',
    options: ['Tech & Business', 'Tech & Design', 'Code & Marketing', 'Data & Finance'],
    answer: 0,
  },
  {
    question: 'Quelles sont les trois phases du cursus Bachelor Tech & Business ?',
    options: ['Foundations, Build, Launch', 'Start, Run, Ship', 'Learn, Code, Deploy', 'Init, Loop, Exit'],
    answer: 0,
  },
  {
    question: 'Quel voyage fait partie de la vie étudiante à Epitech Bénin ?',
    options: ['Le Lagos Trip', 'Le Accra Trip', 'Le Paris Trip', 'Le Dubai Trip'],
    answer: 0,
  },
  {
    question: 'Quelles certifications sont préparées chez Epitech ?',
    options: ['AWS, Microsoft, Google', 'Cisco, Oracle, IBM', 'Adobe, Meta, Apple', 'SAP, Dell, HP'],
    answer: 0,
  },
  {
    question: 'Combien de langues structurent le parcours bilingue (travail en français, projets IT en anglais) ?',
    options: ['1', '2', '3', '4'],
    answer: 1,
  },
  {
    question: "Quel est l'e-mail de contact d'Epitech Bénin ?",
    options: ['benin@epitech.africa', 'contact@epitech.bj', 'info@epitech.com', 'benin@epitech.fr'],
    answer: 0,
  },
]

module.exports = seedQuestions
