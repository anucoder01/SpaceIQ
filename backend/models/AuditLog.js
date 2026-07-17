const mongoose = require('mongoose');
const crypto = require('crypto');

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  entityType: { type: String, required: true },
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  details: { type: String, required: true }, // JSON stringified
  previousHash: { type: String, required: true },
  hash: { type: String }
}, { timestamps: true });

// Create a blockchain-like hash chain
auditLogSchema.pre('save', function(next) {
  if (!this.hash) {
    // Generate deterministic timestamp if createdAt is not yet set
    const time = this.createdAt ? this.createdAt.getTime() : Date.now();
    const dataString = `${this.previousHash}${this.action}${this.entityType}${this.entityId.toString()}${this.performedBy.toString()}${this.details}${time}`;
    this.hash = crypto.createHash('sha256').update(dataString).digest('hex');
  }
  next();
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
