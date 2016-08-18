export interface PackageInfo {
  /**
   * Delivery type: 'npm', 'bower', 'http'
   */
  type: string
  name: string
  main?: string
  url?: string
  version?: string
  homepage?: string
}
