import { DataTypes } from 'sequelize';
import { db } from '../config/postgres.js';
import { config } from "../data/config.js";

export const AuditModel = db.sequelize.define(config.AUDIT_TABLE, {
  records: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
  auditKey: {
    type: DataTypes.CHAR,
    allowNull: true,
  },
}, { freezeTableName: false });
