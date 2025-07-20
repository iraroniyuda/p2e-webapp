const { Op } = require('sequelize');
const User = require('../models/User');
const UserTransaction = require('../models/UserTransaction');

/**
 * GET /admin/withdrawal-history
 * Query: (opsional) username, email, date range, dll.
 */
const getAllWithdrawalHistory = async (req, res) => {
  try {
    const { username, email, startDate, endDate } = req.query;

    // Filter: semua withdrawal sukses, baik user maupun admin
    const where = {
      status: 'SUCCESS',
      type: { [Op.in]: ['WITHDRAWAL', 'WITHDRAWAL_ADMIN'] }
    };

    // Filter user jika ada username/email
    const userWhere = {};
    if (username) userWhere.username = username;
    if (email) userWhere.email = email;

    // Filter tanggal
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    // Query dengan join User
    const data = await UserTransaction.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'wallet', 'bankAccountNumber'],
          where: Object.keys(userWhere).length > 0 ? userWhere : undefined,
          required: Object.keys(userWhere).length > 0
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Mapping & parsing
    const result = data.map(trx => {
      let nominalDariDesc = null;
      if (trx.responseDesc) {
        // Cari nominal setelah @
        const match = trx.responseDesc.match(/@(\d+)\s/);
        if (match) {
          nominalDariDesc = match[1];
        } else {
          const match2 = trx.responseDesc.match(/@(\d+)/);
          if (match2) nominalDariDesc = match2[1];
        }
      }

      // Tambahkan penanda ADMIN jika tipe admin
      const usernameFinal = trx.user?.username
        ? (trx.type === "WITHDRAWAL_ADMIN" ? trx.user.username + " (ADMIN)" : trx.user.username)
        : "";

      return {
        id: trx.id,
        userId: trx.userId,
        username: usernameFinal,
        email: trx.user?.email || "",
        bankAccountNumber: trx.user?.bankAccountNumber || "",
        wallet: trx.user?.wallet || "",
        amount: trx.amount,
        nominalDariDesc,
        status: trx.status,
        createdAt: trx.createdAt,
        method: trx.method,
        responseDesc: trx.responseDesc,
      };
    });

    res.json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal load data withdrawal." });
  }
};

module.exports = {
  getAllWithdrawalHistory
};
