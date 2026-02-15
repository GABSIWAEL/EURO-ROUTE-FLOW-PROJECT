class AppTranslations {
  static const Map<String, Map<String, String>> translations = {
    'fr': {
      // Common
      'app_name': 'Euro Route',
      'ok': 'OK',
      'cancel': 'Annuler',
      'save': 'Enregistrer',
      'delete': 'Supprimer',
      'edit': 'Modifier',
      'logout': 'Déconnexion',
      'error': 'Erreur',
      'success': 'Succès',
      'loading': 'Chargement...',
      'refresh': 'Actualiser',
      'back': 'Retour',

      // Auth
      'login': 'Connexion',
      'email': 'Email',
      'password': 'Mot de passe',
      'sign_in': 'Se connecter',
      'sign_up': 'S\'inscrire',
      'forgotten_password': 'Mot de passe oublié?',
      'invalid_credentials': 'Email ou mot de passe invalide',
      'login_success': 'Connexion réussie',
      'logout_confirmation': 'Êtes-vous sûr de vouloir vous déconnecter?',

      // Dashboard
      'dashboard': 'Tableau de bord',
      'my_deliveries': 'Mes Livraisons',
      'overview': 'Aperçu',
      'deliveries': 'Livraisons',
      'drivers': 'Chauffeurs',
      'notifications': 'Notifications',
      'no_deliveries': 'Aucune Livraison',
      'no_drivers': 'Aucun Chauffeur',
      'no_notifications': 'Aucune Notification',

      // Delivery
      'delivery_details': 'Détails de la Livraison',
      'client_name': 'Nom du Client',
      'pickup_address': 'Adresse de Collecte',
      'delivery_address': 'Adresse de Livraison',
      'status': 'Statut',
      'waiting_approval': 'En Attente d\'Approbation',
      'in_progress': 'En Cours',
      'completed': 'Complétée',
      'cancelled': 'Annulée',
      'delivery_date': 'Date de Livraison',
      'notes': 'Notes',
      'view': 'Voir',
      'update_status': 'Mettre à Jour le Statut',
      'mark_complete': 'Marquer comme Complète',

      // Driver
      'driver_name': 'Chauffeur',
      'phone': 'Téléphone',
      'email_address': 'Email',
      'vehicles': 'Véhicules',
      'active': 'Actif',
      'inactive': 'Inactif',
      'vehicle_info': 'Infos Véhicule',
      'license_plate': 'Plaque d\'Immatriculation',

      // Admin
      'admin_dashboard': 'Tableau de Bord Admin',
      'total_deliveries': 'Total des Livraisons',
      'pending': 'En Attente',
      'delivery_status_completed': 'Complétée',
      'total_drivers': 'Total des Chauffeurs',
      'active_drivers': 'Chauffeurs Actifs',
      'assign_delivery': 'Assigner une Livraison',

      // QR Code
      'scan_qr': 'Scanner Code QR',
      'qr_code_scanner': 'Lecteur de Code QR',
      'scan_delivery_qr': 'Scannez le code QR de la livraison',
      'qr_result': 'Résultat du Scan',
      'invalid_qr': 'Code QR invalide',

      // Map
      'map': 'Carte',
      'location': 'Localisation',
      'current_location': 'Localisation Actuelle',
      'navigate': 'Naviguer',

      // Errors & Messages
      'failed_load_deliveries': 'Échec du chargement des livraisons',
      'failed_load_drivers': 'Échec du chargement des chauffeurs',
      'failed_update_status': 'Échec de la mise à jour du statut',
      'status_updated': 'Statut de livraison mis à jour',
      'delivery_assigned': 'Livraison assignée avec succès',
      'driver_deleted': 'Chauffeur supprimé',
      'driver_status_updated': 'Statut du chauffeur mis à jour',
      'just_now': 'À l\'instant',
      'minutes_ago': 'minutes',
      'hours_ago': 'heures',
      'days_ago': 'jours',
    },
  };

  static String get(String key, {String locale = 'fr'}) {
    return translations[locale]?[key] ?? key;
  }
}
