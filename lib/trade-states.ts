/**
 * Trade states
 */
export const TradeStatus = {
  ACTIVE: 'Active',
  CREATED_NEEDS_CONFIRMATION: 'CreatedNeedsConfirmation',
  IN_ESCROW: 'InEscrow',
  ACCEPTED: 'Accepted',
  CANCELED: 'Canceled',
  CANCELED_BY_SECOND_FACTOR: 'CanceledBySecondFactor',
  DECLINED: 'Declined',
  EXPIRED: 'Expired',
  INVALID: 'Invalid',
  INVALID_ITEMS: 'InvalidItems',
  ERROR: 'error',
  UNKNOWN: 'Unknown',
  COUNTERED: 'Countered'
};

/**
 * Trade status groups for display and business logic
 */
export const TradeStatusGroups = {
  PENDING: [
    TradeStatus.ACTIVE,
    TradeStatus.CREATED_NEEDS_CONFIRMATION,
    TradeStatus.IN_ESCROW
  ],
  SUCCESS: [
    TradeStatus.ACCEPTED
  ],
  CANCELED: [
    TradeStatus.CANCELED,
    TradeStatus.CANCELED_BY_SECOND_FACTOR,
    TradeStatus.DECLINED,
    TradeStatus.EXPIRED
  ],
  PROBLEMATIC: [
    TradeStatus.INVALID,
    TradeStatus.INVALID_ITEMS,
    TradeStatus.ERROR,
    TradeStatus.UNKNOWN
  ],
  ACTION_REQUIRED: [
    TradeStatus.COUNTERED
  ]
};

/**
 * Trade status utilities
 */
export const TradeStatusUtils = {
  isFinalState: (status: string) => [
    ...TradeStatusGroups.SUCCESS,
    ...TradeStatusGroups.CANCELED,
    ...TradeStatusGroups.PROBLEMATIC
  ].includes(status),
  canBeCanceled: (status: string) => TradeStatusGroups.PENDING.includes(status),
  isCanceled: (status: string) => TradeStatusGroups.CANCELED.includes(status),
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
 * Helper functions for compatibility with existing code
 */

export const isTradeStateInGroup = (state: string, group: string[]): boolean => {
  return group.includes(state);
};

export const isTradeAccepted = (tradeStatus: string, offerDetailsState?: string): boolean => {
  if (TradeStatusGroups.SUCCESS.includes(tradeStatus)) {
    return true;
  }
  if (offerDetailsState && TradeStatusGroups.SUCCESS.includes(offerDetailsState)) {
    return true;
  }
  
  return false;
};

export const isTradePending = (tradeStatus: string, offerDetailsState?: string): boolean => {
  if (TradeStatusGroups.PENDING.includes(tradeStatus)) {
    return true;
  }
  if (offerDetailsState && TradeStatusGroups.PENDING.includes(offerDetailsState)) {
    return true;
  }
  return false;
};

export const isTradeTerminated = (tradeStatus: string, offerDetailsState?: string): boolean => {
  if (TradeStatusGroups.CANCELED.includes(tradeStatus)) {
    return true;
  }
  if (offerDetailsState && TradeStatusGroups.CANCELED.includes(offerDetailsState)) {
    return true;
  }
  
  return false;
};

export const isTradeProblematic = (tradeStatus: string, offerDetailsState?: string): boolean => {
  if (TradeStatusGroups.PROBLEMATIC.includes(tradeStatus)) {
    return true;
  }
  if (offerDetailsState && TradeStatusGroups.PROBLEMATIC.includes(offerDetailsState)) {
    return true;
  }
  return false;
};

export const isTradeRequiringAction = (tradeStatus: string, offerDetailsState?: string): boolean => {
  if (TradeStatusGroups.ACTION_REQUIRED.includes(tradeStatus)) {
    return true;
  }
  if (offerDetailsState && TradeStatusGroups.ACTION_REQUIRED.includes(offerDetailsState)) {
    return true;
  }
  return false;
};
