/**
 * États des trades Steam
 */
export const TradeStatus = {
  // États actifs
  ACTIVE: 'Active',                          // Offer is waiting for action
  CREATED_NEEDS_CONFIRMATION: 'CreatedNeedsConfirmation', // Waiting for mobile confirmation
  IN_ESCROW: 'InEscrow',                     // In holding period
  
  // Successfully completed
  ACCEPTED: 'Accepted',                      // Offer was accepted
  
  // Cancellation states
  CANCELED: 'Canceled',                      // Offer was canceled by the sender
  CANCELED_BY_SECOND_FACTOR: 'CanceledBySecondFactor', // Canceled via mobile authentication
  DECLINED: 'Declined',                      // Offer was declined by the recipient
  EXPIRED: 'Expired',                        // Offer expired
  
  // Problematic states
  INVALID: 'Invalid',                        // Invalid state
  INVALID_ITEMS: 'InvalidItems',             // Items no longer available
  ERROR: 'error',                            // Application error
  UNKNOWN: 'Unknown',                        // Undetermined state
  
  // Action required
  COUNTERED: 'Countered'                     // Counter-offer received
};

/**
 * Groupes d'états pour l'affichage et la logique métier
 */
export const TradeStatusGroups = {
  // Pending trades
  PENDING: [
    TradeStatus.ACTIVE,
    TradeStatus.CREATED_NEEDS_CONFIRMATION,
    TradeStatus.IN_ESCROW
  ],
  
  // Successfully completed trades
  SUCCESS: [
    TradeStatus.ACCEPTED
  ],
  
  // Canceled trades (all forms of cancellation)
  CANCELED: [
    TradeStatus.CANCELED,
    TradeStatus.CANCELED_BY_SECOND_FACTOR,
    TradeStatus.DECLINED,
    TradeStatus.EXPIRED
  ],
  
  // Problematic trades
  PROBLEMATIC: [
    TradeStatus.INVALID,
    TradeStatus.INVALID_ITEMS,
    TradeStatus.ERROR,
    TradeStatus.UNKNOWN
  ],
  
  // Trades requiring action
  ACTION_REQUIRED: [
    TradeStatus.COUNTERED
  ]
};

/**
 * Utilitaires pour la gestion des états des trades
 */
export const TradeStatusUtils = {
  // Vérifier si un trade est dans un état final (ne peut plus être modifié)
  isFinalState: (status: string) => [
    ...TradeStatusGroups.SUCCESS,
    ...TradeStatusGroups.CANCELED,
    ...TradeStatusGroups.PROBLEMATIC
  ].includes(status),
  
  // Vérifier si un trade peut être annulé
  canBeCanceled: (status: string) => TradeStatusGroups.PENDING.includes(status),
  
  // Vérifier si un trade a été annulé (toutes formes d'annulation)
  isCanceled: (status: string) => TradeStatusGroups.CANCELED.includes(status),
  
  // Obtenir le message à afficher pour chaque statut
  getStatusMessage: (status: string) => {
    switch (status) {
      case TradeStatus.ACTIVE: return "Waiting for acceptance";
      case TradeStatus.CREATED_NEEDS_CONFIRMATION: return "Waiting for confirmation";
      case TradeStatus.IN_ESCROW: return "In holding period";
      case TradeStatus.ACCEPTED: return "Trade successful";
      case TradeStatus.CANCELED: return "Offer canceled";
      case TradeStatus.CANCELED_BY_SECOND_FACTOR: return "Canceled via mobile authentication";
      case TradeStatus.DECLINED: return "Offer declined";
      case TradeStatus.EXPIRED: return "Offer expired";
      case TradeStatus.INVALID: return "Invalid offer";
      case TradeStatus.INVALID_ITEMS: return "Items no longer available";
      case TradeStatus.ERROR: return "Error during processing";
      case TradeStatus.UNKNOWN: return "Unknown status";
      case TradeStatus.COUNTERED: return "Counter-offer received";
      default: return "Unknown status";
    }
  }
};

/**
 * Fonctions d'aide pour la compatibilité avec le code existant
 */

// Vérifie si un état de trade appartient à un groupe spécifique
export const isTradeStateInGroup = (state: string, group: string[]): boolean => {
  return group.includes(state);
};

// Vérifie si un trade est considéré comme accepté (succès)
export const isTradeAccepted = (tradeStatus: string, offerDetailsState?: string): boolean => {
  // Vérifier si le statut du trade est dans le groupe SUCCESS
  if (TradeStatusGroups.SUCCESS.includes(tradeStatus)) {
    return true;
  }
  
  // Si offerDetailsState est fourni, vérifier également
  if (offerDetailsState && TradeStatusGroups.SUCCESS.includes(offerDetailsState)) {
    return true;
  }
  
  return false;
};

// Vérifie si un trade est en attente (pending)
export const isTradePending = (tradeStatus: string, offerDetailsState?: string): boolean => {
  // Vérifier si le statut du trade est dans le groupe PENDING
  if (TradeStatusGroups.PENDING.includes(tradeStatus)) {
    return true;
  }
  
  // Si offerDetailsState est fourni, vérifier également
  if (offerDetailsState && TradeStatusGroups.PENDING.includes(offerDetailsState)) {
    return true;
  }
  
  return false;
};

// Vérifie si un trade est terminé sans échange (canceled, declined, etc.)
export const isTradeTerminated = (tradeStatus: string, offerDetailsState?: string): boolean => {
  // Vérifier si le statut du trade est dans le groupe CANCELED
  if (TradeStatusGroups.CANCELED.includes(tradeStatus)) {
    return true;
  }
  
  // Si offerDetailsState est fourni, vérifier également
  if (offerDetailsState && TradeStatusGroups.CANCELED.includes(offerDetailsState)) {
    return true;
  }
  
  return false;
};

// Vérifie si un trade a un problème (invalid, error, etc.)
export const isTradeProblematic = (tradeStatus: string, offerDetailsState?: string): boolean => {
  // Vérifier si le statut du trade est dans le groupe PROBLEMATIC
  if (TradeStatusGroups.PROBLEMATIC.includes(tradeStatus)) {
    return true;
  }
  
  // Si offerDetailsState est fourni, vérifier également
  if (offerDetailsState && TradeStatusGroups.PROBLEMATIC.includes(offerDetailsState)) {
    return true;
  }
  
  return false;
};

// Vérifie si un trade nécessite une action (countered)
export const isTradeRequiringAction = (tradeStatus: string, offerDetailsState?: string): boolean => {
  // Vérifier si le statut du trade est dans le groupe ACTION_REQUIRED
  if (TradeStatusGroups.ACTION_REQUIRED.includes(tradeStatus)) {
    return true;
  }
  
  // Si offerDetailsState est fourni, vérifier également
  if (offerDetailsState && TradeStatusGroups.ACTION_REQUIRED.includes(offerDetailsState)) {
    return true;
  }
  
  return false;
};
