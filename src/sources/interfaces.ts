export interface PackageInfo {
  /**
   * Delivery type: 'npm', 'bower', 'http'
   */
  type: string
  name: string
  main?: string
  gitUrl?: string
  version?: string
  homepage?: string
}
