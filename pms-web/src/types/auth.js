/**
 * @typedef {object} LoginCredentials
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {object} TokenPair
 * @property {string} accessToken
 * @property {string} refreshToken
 */

/**
 * @typedef {object} AuthenticatedUser
 * @property {string} id
 * @property {string} firstName
 * @property {string|null} middleName
 * @property {string} lastName
 * @property {string} email
 * @property {number} systemRole
 * @property {boolean} isActive
 */

/** @typedef {'restoring'|'authenticated'|'anonymous'|'unavailable'} AuthStatus */

export const authTypes = Object.freeze({})
