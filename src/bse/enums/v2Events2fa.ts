export enum TwoFAEvents {
  /** event for 2FA UCC authentication */
  UCC_AUTH = 'ucc_auth',

  /** event for 2FA UCC Elog */
  UCC_ELOG = 'ucc_elog',

  /** event for 2FA UCC nomination */
  UCC_NOM = 'ucc_nom',

  /** event for 2FA new order */
  VERIFY_ORDER_NEW = 'verify_order_new',

  /** event for 2FA order update */
  VERIFY_ORDER_UPDATE = 'verify_order_update',

  /** event for 2FA order cancel */
  VERIFY_ORDER_CANCEL = 'verify_order_cancel',

  /** event for 2FA SxP register */
  VERIFY_SXP_REG = 'verify_sxp_reg',

  /** event for 2FA SxP topup */
  VERIFY_SXP_TOPUP = 'verify_sxp_topup',

  /** event for 2FA SxP cancel */
  VERIFY_SXP_CANCEL = 'verify_sxp_cancel',

  /** event for 2FA SxP pause */
  VERIFY_SXP_PAUSE = 'verify_sxp_pause',

  /** event for 2FA SxP resume */
  VERIFY_SXP_RESUME = 'verify_sxp_resume',

  /** event for 2FA mandate cancel */
  VERIFY_MANDATE_CANCEL = 'verify_mandate_cancel',

  /** event for 2FA mandate E-Nach */
  MANDATE_ENACH = 'mandate_enach',

  /** event for 2FA NFT bank account change */
  NFT_BANK_ACCT_CHANGE = 'nft_bank_acct_change',

  /** event for 2FA NFT contact change */
  NFT_CONTACT_CHANGE = 'nft_contact_change',

  /** event for 2FA NFT nominee change */
  NFT_NOMINEE_CHANGE = 'nft_nominee_change',
}
