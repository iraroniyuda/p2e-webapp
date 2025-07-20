const { Op } = require("sequelize");
const UserPolClaimHistory = require("../models/UserPolClaimHistory");
const User = require("../models/User");

exports.getAllPolClaimHistories = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      username,
      email,
      levelName,
      packageId,
    } = req.query;

    const where = {};
    if (levelName) where.levelName = { [Op.iLike]: `%${levelName}%` };
    if (packageId) where.packageId = packageId;

    // Build include with optional filter on user
    const userWhere = {};
    if (username) userWhere.username = { [Op.iLike]: `%${username}%` };
    if (email) userWhere.email = { [Op.iLike]: `%${email}%` };

    const include = [
      {
        model: User,
        as: "user",
        attributes: ["id", "email", "username"],
        where: Object.keys(userWhere).length > 0 ? userWhere : undefined,
        required: Object.keys(userWhere).length > 0, // join wajib jika ada filter username/email
      },
    ];

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await UserPolClaimHistory.findAndCountAll({
      where,
      include,
      order: [["claimedAt", "DESC"]],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
