// Types TypeScript pour la base de données Moovelabs

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'entreprise' | 'client';
  nom: string | null;
  prenom: string | null;
  telephone: string | null;
  avatar_url: string | null;
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface Entreprise {
  id: string;
  user_id: string | null;
  nom: string;
  email: string;
  telephone: string | null;
  adresse: string | null;
  code_postal: string | null;
  ville: string | null;
  pays: string;
  logo_url: string | null;
  
  // Personnalisation
  couleur_primaire: string;
  couleur_secondaire: string;
  couleur_accent: string;
  couleur_fond: string;
  
  // Liens
  slug: string;
  domaine_personnalise: string | null;
  
  // Configuration
  email_notification: string | null;
  template_email_client: string | null;
  template_email_entreprise: string | null;
  titre_calculatrice: string;
  message_formulaire: string;
  
  // Statut
  actif: boolean;
  plan: 'basic' | 'pro' | 'enterprise';
  
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface CategorieMeuble {
  id: string;
  nom: string;
  nom_affichage: string;
  ordre: number;
  icone: string | null;
  couleur: string;
  actif: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Meuble {
  id: string;
  categorie_id: string | null;
  nom: string;
  volume_m3: number;
  poids_kg: number | null;
  image_url: string | null;
  description: string | null;
  actif: boolean;
  ordre: number;
  created_at: Date;
  updated_at: Date;
}

export interface MeubleAvecCategorie extends Meuble {
  categorie_nom: string;
  categorie_nom_affichage: string;
}

export interface Client {
  id: string;
  user_id: string | null;
  entreprise_id: string;
  nom: string;
  prenom: string | null;
  email: string;
  telephone: string | null;
  adresse: string | null;
  code_postal: string | null;
  ville: string | null;
  pays: string;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface Devis {
  id: string;
  numero: string;
  entreprise_id: string;
  client_id: string | null;
  
  // Informations client
  client_nom: string | null;
  client_prenom: string | null;
  client_email: string;
  client_telephone: string | null;
  
  // Adresse de départ
  adresse_depart: string;
  code_postal_depart: string | null;
  ville_depart: string | null;
  avec_ascenseur_depart: boolean;
  etage_depart: number | null;
  
  // Adresse d'arrivée
  adresse_arrivee: string;
  code_postal_arrivee: string | null;
  ville_arrivee: string | null;
  avec_ascenseur_arrivee: boolean;
  etage_arrivee: number | null;
  
  // Dates
  date_demenagement: Date | null;
  date_arrivee: Date | null;
  flexibilite_dates: boolean;
  creneau_horaire: string | null;
  
  // Volume et détails
  volume_total_m3: number;
  poids_total_kg: number;
  nombre_meubles: number;
  observations: string | null;
  
  // Prix
  montant_estime: number | null;
  devise: string;
  nombre_demenageurs: number | null;
  
  // Statut
  statut: 'nouveau' | 'vu' | 'en_traitement' | 'devis_envoye' | 'accepte' | 'refuse' | 'termine' | 'archive';
  
  // Emails
  email_client_envoye: boolean;
  email_client_date: Date | null;
  email_entreprise_envoye: boolean;
  email_entreprise_date: Date | null;
  
  // Métadonnées
  source: string;
  ip_address: string | null;
  user_agent: string | null;
  
  created_at: Date;
  updated_at: Date;
}

export interface DevisMeuble {
  id: string;
  devis_id: string;
  meuble_id: string | null;
  meuble_nom: string;
  meuble_categorie: string | null;
  quantite: number;
  volume_unitaire_m3: number;
  poids_unitaire_kg: number | null;
  created_at: Date;
}

// Types pour la calculatrice
export interface MeubleSelection {
  meuble_id: string;
  meuble_nom: string;
  meuble_categorie: string;
  quantite: number;
  volume_unitaire_m3: number;
  poids_unitaire_kg: number | null;
  image_url: string | null;
}

export interface CalculatriceState {
  entreprise: Entreprise | null;
  categories: CategorieMeuble[];
  meubles: Meuble[];
  selections: Map<string, MeubleSelection>;
  volumeTotal: number;
  poidsTotal: number;
  categorieActive: string | null;
}

export interface FormulaireDevis {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse_depart: string;
  code_postal_depart: string;
  avec_ascenseur_depart: boolean;
  adresse_arrivee: string;
  code_postal_arrivee: string;
  avec_ascenseur_arrivee: boolean;
  date_demenagement: string;
  observations: string;
}


