/**
 * User Service
 *
 * MVP: In-memory user store. Users sign up with a name and select
 * which clubs/parts they belong to. No passwords — just name-based lookup.
 * Replace with DynamoDB/Cognito when scaling.
 */

const { v4: uuidv4 } = require("uuid");

// In-memory user store: userId → user object
const users = new Map();
// Name index for quick lookup: lowercase name → userId
const nameIndex = new Map();

/**
 * Create a new user
 * @param {string} name - Display name
 * @param {string[]} partIds - Array of part/club IDs the user belongs to
 * @returns {object} The created user
 */
function createUser(name, partIds) {
  const trimmedName = name.trim();
  const lowerName = trimmedName.toLowerCase();

  // Check if name already taken
  if (nameIndex.has(lowerName)) {
    const existingId = nameIndex.get(lowerName);
    return { ...users.get(existingId), alreadyExists: true };
  }

  const id = uuidv4();
  const user = {
    id,
    name: trimmedName,
    partIds: partIds || [],
    createdAt: new Date().toISOString(),
  };

  users.set(id, user);
  nameIndex.set(lowerName, id);

  console.log(`[Users] Created user "${trimmedName}" (${id}) with parts: [${partIds.join(", ")}]`);
  return user;
}

/**
 * Get user by ID
 */
function getUserById(id) {
  return users.get(id) || null;
}

/**
 * Look up a user by name (case-insensitive)
 */
function getUserByName(name) {
  const lowerName = name.trim().toLowerCase();
  const id = nameIndex.get(lowerName);
  return id ? users.get(id) : null;
}

/**
 * Update a user's club memberships
 */
function updateUserParts(id, partIds) {
  const user = users.get(id);
  if (!user) throw new Error(`User not found: ${id}`);

  user.partIds = partIds;
  console.log(`[Users] Updated user "${user.name}" parts: [${partIds.join(", ")}]`);
  return user;
}

/**
 * Get all users (for admin/debug)
 */
function getAllUsers() {
  return Array.from(users.values());
}

module.exports = {
  createUser,
  getUserById,
  getUserByName,
  updateUserParts,
  getAllUsers,
};
