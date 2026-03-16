/**
 * User Service — DynamoDB-backed
 *
 * Users are identified by their Google Account's "sub" ID.
 * Role is determined by whether the user's email is in the ADMIN_EMAILS config.
 * Stores partIds and adminClubs as plain arrays (DynamoDB Lists) to avoid
 * empty-Set errors.
 */

const {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
} = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");
const config = require("../config");

const ddbClient = new DynamoDBClient({ region: config.dynamodb.region });
const docClient = DynamoDBDocumentClient.from(ddbClient);

const TABLE = config.dynamodb.tableName;
const ALL_PART_IDS = Object.keys(config.parts);

// ── Ensure the DynamoDB table exists ──

async function ensureTable() {
  try {
    await ddbClient.send(new DescribeTableCommand({ TableName: TABLE }));
    console.log(`[DynamoDB] Table "${TABLE}" already exists`);
  } catch (err) {
    if (err.name === "ResourceNotFoundException") {
      console.log(`[DynamoDB] Creating table "${TABLE}"…`);
      await ddbClient.send(
        new CreateTableCommand({
          TableName: TABLE,
          KeySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
          AttributeDefinitions: [{ AttributeName: "userId", AttributeType: "S" }],
          BillingMode: "PAY_PER_REQUEST",
        })
      );
      await new Promise((r) => setTimeout(r, 3000));
      console.log(`[DynamoDB] Table "${TABLE}" created`);
    } else {
      console.error("[DynamoDB] Error checking table:", err.message);
      throw err;
    }
  }
}

ensureTable().catch((err) =>
  console.error("[DynamoDB] Table setup failed:", err.message)
);

// ── Helpers ──

function isAdminEmail(email) {
  return config.adminEmails.map((e) => e.toLowerCase()).includes(email.toLowerCase());
}

function buildUserResponse(item) {
  return {
    id: item.userId,
    googleId: item.googleId,
    name: item.name,
    email: item.email,
    picture: item.picture,
    partIds: Array.isArray(item.partIds) ? item.partIds : [],
    role: item.role || "member",
    adminClubs: Array.isArray(item.adminClubs) ? item.adminClubs : [],
    createdAt: item.createdAt,
  };
}

// ── Public API ──

async function findOrCreateFromGoogle(googleProfile) {
  const { sub, name, email, picture } = googleProfile;
  const isAdmin = isAdminEmail(email);
  const role = isAdmin ? "admin" : "member";
  const adminClubs = isAdmin ? ALL_PART_IDS : [];

  const { Item: existing } = await docClient.send(
    new GetCommand({ TableName: TABLE, Key: { userId: sub } })
  );

  if (existing) {
    await docClient.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: { userId: sub },
        UpdateExpression:
          "SET #n = :name, email = :email, picture = :picture, #r = :role, adminClubs = :adminClubs",
        ExpressionAttributeNames: { "#n": "name", "#r": "role" },
        ExpressionAttributeValues: {
          ":name": name,
          ":email": email,
          ":picture": picture,
          ":role": role,
          ":adminClubs": adminClubs,
        },
      })
    );

    const user = buildUserResponse({ ...existing, name, email, picture, role, adminClubs });
    console.log(`[Users] Returning user "${name}" (${sub}), role=${role}`);
    return { user, isNew: false };
  }

  // Create new user — use plain arrays, never empty Sets
  const now = new Date().toISOString();
  const item = {
    userId: sub,
    googleId: sub,
    name,
    email,
    picture,
    partIds: [],
    role,
    adminClubs,
    createdAt: now,
  };

  await docClient.send(new PutCommand({ TableName: TABLE, Item: item }));
  console.log(`[Users] Created new user "${name}" (${sub}), role=${role}`);
  return { user: buildUserResponse(item), isNew: true };
}

async function getUserById(id) {
  const { Item } = await docClient.send(
    new GetCommand({ TableName: TABLE, Key: { userId: id } })
  );
  return Item ? buildUserResponse(Item) : null;
}

async function updateUserParts(id, partIds) {
  const { Item: existing } = await docClient.send(
    new GetCommand({ TableName: TABLE, Key: { userId: id } })
  );
  if (!existing) throw new Error(`User not found: ${id}`);

  await docClient.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { userId: id },
      UpdateExpression: "SET partIds = :partIds",
      ExpressionAttributeValues: { ":partIds": partIds },
    })
  );

  const user = buildUserResponse({ ...existing, partIds });
  console.log(`[Users] Updated user "${existing.name}" parts: [${partIds.join(", ")}]`);
  return user;
}

module.exports = { findOrCreateFromGoogle, getUserById, updateUserParts };
