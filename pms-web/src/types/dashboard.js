/**
 * @typedef {object} DashboardProjectSummary
 * @property {string} projectId
 * @property {string} projectName
 * @property {string} status
 * @property {number} progressPercent
 * @property {number} totalActionItems
 * @property {number} completedActionItems
 * @property {number} ongoingActionItems
 * @property {number} delayedActionItems
 * @property {number} plannedActionItems
 * @property {string} startDate
 * @property {string} endDate
 * @property {string} myRole
 */

/**
 * @typedef {object} DashboardResponse
 * @property {DashboardProjectSummary[]} projects
 * @property {number} pageNumber
 * @property {number} pageSize
 * @property {number} totalCount
 * @property {number} totalPages
 * @property {boolean} hasPreviousPage
 * @property {boolean} hasNextPage
 */

export const dashboardTypes = Object.freeze({})
